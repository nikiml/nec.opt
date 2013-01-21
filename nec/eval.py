# Copyright 2010-2012 Nikolay Mladenov, Distributed under 
# GNU General Public License

import sys, traceback, os, pprint
from nec import necmath
from nec.wire_structure import WireStructure
from nec.print_out import printOut
from nec.output_parser import FrequencyData, NecOutputParser
from nec.html import jsModelFromLines, HtmlOutput

output = "output"
input = "input.nec"
autosegmentation=10
ncores=4

class Sweep:
	def __init__(self, ranges, angles, agt_freq,sweepid):
		self.ranges = ranges
		self.angles = angles
		self.agt_freq = agt_freq
		self.sweepid = sweepid
	def __str__(self):
		return "{"+str(self.ranges)+", agt freq "+str(self.agt_freq)+"}"
	def __repr__(self):
		return "{"+str(self.ranges)+", agt freq "+str(self.agt_freq)+"}"
	def midFrequency(self):
		total = 0
		for r in self.ranges:
			total += r[0] + r[1]*(r[2]-1)/2
		if not total: return 0
		return total / len(self.ranges)

class NecFileObject:
	def __init__(self, options):
		self.options = options
		self.wire_structure = WireStructure(options)
		self.vars = {}
		self.min_max = {}
		self.dependent_vars = []
		self.lines=[]
		self.varlines=[]
		self.paramlines={}
		self.source_tags={}
		self.autosegment=(0,0)
		self.frequency = 585
		self.scale = 1
		self.options.angle_step = 5
		if options.engine_takes_cmd_args=='yes' or options.engine_takes_cmd_args=='auto' and os.name!='nt':
			self.options.engine_takes_cmd_args = 1
		else: self.options.engine_takes_cmd_args = 0
		try:self.write_js_model = options.js_model
		except AttributeError: self.write_js_model=0
		if self.options.input:
			self.html_output = HtmlOutput(self.options.input)
			self.readSource(self.options.input)
			try:
				if self.options.param_values_file:
					self.parseParameterValues(self.options.param_values_file)
					self.writeParametrized("output.nec")
			except AttributeError:
				pass
		self.autoSegmentation(self.options.auto_segmentation)
		self.prepareSweeps()
		if self.options.debug:
			printOut( "Engine jobs:")
			pprint.pprint(self.sweeps)

	def readSource(self, sourcefile):
		if self.options.debug: sys.stderr.write("debug: Opening file %s\n"%sourcefile)
		self.options.input = sourcefile
		file = open(sourcefile, "rt")
		try: self.lines = file.readlines()
		finally: file.close()
		if not self.lines: raise "Empty input file"
		self.parse()
	
	def evalVarLine(self, line, g=None, l=None):
		ln = line.replace("^","**")
		if l is None:
			d={}
			exec(ln, {}, d)
			return d
		else:
			exec(ln, g, l)

	class TagRecorder:
		def addTransformation(self, line):
			inc = int(self.parser.evalToken(line[1]))
			new = line[2].strip()
			if line[0]=="GX": 
				new = (1+int(new[0]))*(1+int(new[1]))*(1+int(new[2]))
			else:
				new = int(self.parser.evalToken(new))
				if line[0]=="GR": new-=1
			self.update(new, inc)

	class TagSegmentation(TagRecorder):
		def __init__(self, parser):
			self.tag_segmentation = {}
			self.fixed_segmentation = []
			self.parser = parser
		def addWire(self, line, varlineno):
			tag = int(line[1])
			segments = int(self.parser.evalToken(line[2]))
			if tag not in self.tag_segmentation:
				self.tag_segmentation[tag] = [segments]
			else:
				self.tag_segmentation[tag].append(segments)
			if line[2][0] == "+":
				self.fixed_segmentation.append(varlineno)
		def update(self, new, inc):
			ts = {}
			for i in range(0,new):
				for t in self.tag_segmentation.keys():
					ts[t+i*inc] = list(self.tag_segmentation[t])
			self.tag_segmentation.update(ts)
		def tagSegments(self, tag, ref_card):
			if tag not in self.tag_segmentation.keys():
				raise RuntimeError("Invalid tag reference %d in %s card" %(tag,ref_card))
			if len(self.tag_segmentation[tag])>1:
				raise RuntimeError("Ambiguous tag reference %d in %s card" %(tag,ref_card))
			return self.tag_segmentation[tag][0]

		def autoSegment(self, varlineno):
			return varlineno not in self.fixed_segmentation

	class TagRadii(TagRecorder):
		def __init__(self):
			self.tag_rad = {}
		def addWire(self, tag, rad):
			tag = int(tag)
			rad = rad
			if tag not in self.tag_rad:
				self.tag_rad[tag] = [rad]
			else:
				self.tag_rad[tag] += [rad]
		def update(self, new, inc):
			tr = {}
			for i in range(0,new):
				for t in self.tag_rad.keys():
					tr[t+i*inc] = list(self.tag_rad[t])
			self.tag_rad.update(tr)
		def tagRadius(self, tag, ref_card):
			if not tag:
				for k in self.tag_rad.keys():
					return self.tag_rad[k][0]
			if tag not in self.tag_rad.keys():
				raise RuntimeError("Invalid tag reference %d in %s card" %(tag,ref_card))
			return self.tag_rad[tag][0]



	class SegRef:
		def __init__(self, varlineno, lineno, tokenno, segno, segcount):
			self.varline_no = varlineno
			self.line_no = lineno 
			self.token_no = tokenno 
			self.seg_no = segno
			self.seg_count = segcount
		def isStart(self):
			return self.seg_no==1
		def isEnd(self):
			return self.seg_no==self.seg_count
		def isMid(self):
			return 2*self.seg_no==self.seg_count+1

		def newSegNo(self, seg_count):
			if self.isMid():
				return (seg_count+1)/2
			if self.isStart():
				return 0
			if self.isEnd():
				return seg_count
			return round( (self.seg_no-.5)/self.seg_count*seg_count +.5)

	def checkNonZeroTag(self, tag, card):
		if not tag: raise RuntimeError("Tag 0 is not supported in %s card"%card)


	def parseSYLine(self, ln, comment, lineno):
		if self.options.debug >1: sys.stderr.write("debug: \tParsing line: \"%s\"\n"%ln)
		try:
			d = self.evalVarLine(ln[3:].strip())
			if self.options.debug: 
				for dk in d.keys(): sys.stderr.write("debug: \tAdded independent parameter \"%s\"\n"%dk)
				if self.options.debug>1: sys.stderr.write("debug: \t\tFull comment = \"%s\"\n"%comment)
			self.vars.update(d)
			for dk in d.keys(): self.paramlines[dk]=lineno
			try:
				#strip the real comment from the comment
				comment_pos = comment.find("'")
				if comment_pos!=-1:
					comment = comment[0:comment_pos].strip()
				if self.options.debug>1: 
					sys.stderr.write("debug: \t\tLimits comment = \"%s\"\n"%comment)
				min, max = eval(comment)
				if min <= max:
					for dk in d.keys(): self.min_max[dk]=(float(min),float(max))
				else:
					for dk in d.keys(): self.min_max[dk]=(float(max),float(min))
				if self.options.debug: sys.stderr.write("debug: \t\tlimits(%.3g, %.3g)\n"%(float(min), float(max)))
			except:
				if self.options.debug>1: 
					for dk in d.keys(): sys.stderr.write("debug: \tNo limits found for parameter \"%s\"\n"%dk)
				pass
			self.globals.update(d)
		except:
			if self.options.debug: sys.stderr.write("debug: \tAdded dependent parameter \"%s\"\n"%ln[3:].strip())
			self.dependent_vars.append(ln[3:].strip())
			try: self.evalVarLine(self.dependent_vars[-1],necmath.__dict__, self.globals)
			except:
				traceback.print_exc()
				sys.stderr.write( "failed parsing '%s'\n"%(d))
				raise
	def parseEXLine(self, varline, varlineno, lineno):
		tag = int(varline[2])
		seg = int(self.evalToken(varline[3]))
		segments = self.tag_segmentation.tagSegments(tag, varline[0])
		seg_ref = NecFileObject.SegRef(varlineno, lineno, 3, seg, segments)
		if tag not in self.source_tags:
			self.source_tags[tag]=[seg_ref]
		else:
			self.source_tags[tag].append(seg_ref)

	def parseNTOrTLLine(self, varline, varlineno, lineno):
		tag = int(varline[1])
		self.checkNonZeroTag(tag,varline[0])
		seg = int(self.evalToken(varline[2]))
		segments = self.tag_segmentation.tagSegments(tag, varline[0])
		seg_ref = NecFileObject.SegRef(varlineno, lineno, 2, seg, segments)
		if tag not in self.source_tags:
			self.source_tags[tag]=[seg_ref]
		else:
			self.source_tags[tag].append(seg_ref)
		tag = int(varline[3])
		self.checkNonZeroTag(tag,varline[0])
		seg = int(self.evalToken(varline[4]))
		segments = self.tag_segmentation.tagSegments(tag, varline[0])
		seg_ref = NecFileObject.SegRef(varlineno, lieno, 4, seg, segments)
		if tag not in self.source_tags:
			self.source_tags[tag]=[seg_ref]
		else:
			self.source_tags[tag].append(seg_ref)

	def parseLDLine(self, varline, varlineno, lineno):
		tag = int(varline[2])
		seg1 = int(self.evalToken(varline[3]))
		seg2 = int(self.evalToken(varline[4]))
		if seg1: 
			self.checkNonZeroTag(tag,varline[0])
			segments = self.tag_segmentation.tagSegments(tag, varline[0])
			seg1_ref = NecFileObject.SegRef(varlineno, lineno, 3, seg1, segments)
			seg2_ref = NecFileObject.SegRef(varlineno, lineno, 4, seg2, segments)
			if tag not in self.source_tags:
				self.source_tags[tag]=[seg1_ref,seg2_ref]
			else:
				self.source_tags[tag]+=[seg1_ref,seg2_ref]

	def parse(self):		
		if self.options.debug: sys.stderr.write("debug: Parsing input\n")
		self.vars = {}
		self.dependent_vars = []
		self.globals={}
		self.varlines=[]
		self.source_tags={}
		self.comments = []
		self.fixed_segmentation = []
		self.tag_segmentation = NecFileObject.TagSegmentation(self)
		for i in range(len(self.lines)):
			ln = self.lines[i].strip('\n')
			comment_pos = ln.find("'")
			if comment_pos!=-1:
				comment = ln[comment_pos+1:].strip()
				ln = ln[0:comment_pos].strip()
			else:
				comment = ""
				ln = ln.strip()
			if ln[0:2]== "SY":
				self.parseSYLine(ln, comment, i)
			else:
				self.varlines.append(ln.replace(',',' ').split())
				self.comments.append(comment)
				varlineno = len(self.varlines)-1
				varline = self.varlines[varlineno]
				if ln[0:2]=="GW":
					self.tag_segmentation.addWire(varline, varlineno)
				if ln[0:2]=="GM" or ln[0:2]=="GR" or ln[0:2]=="GX":
					self.tag_segmentation.addTransformation(varline)
				if ln[0:2]=="EX":
					self.parseEXLine(varline,varlineno, i)
				if ln[0:2]=="TL" or ln[0:2]=="NT":
					self.parseNTOrTLLine(varline,varlineno, i)
				if ln[0:2]=="LD":
					self.parseLDLine(varline,varlineno, i)
				elif ln[0:2] == "FR":
					self.frequency = float(self.varlines[-1][5])
				elif ln[0:2] == "GS":
					self.scale = float(self.varlines[-1][3])
				elif ln[0:2] == "RP":
					self.options.angle_step = float(self.varlines[-1][8])

		for i in self.vars.keys():
			self.vars[i]=float(self.vars[i])

	def parseParameterValues(self, file):
		try:
			f = open(file,"rt")
			lines = f.readlines()
			f.close()
		except:
			raise
		if len(lines)<2: raise  RuntimeError("invalid Parametes files")
		vars = lines[0].split()
		del lines[0]
		lines[0] = list(map(float, lines[0].split()))
		opt_vars = {}
		for i in range(len(vars)):
			if vars[i] not in self.vars: raise RuntimeError("invalid Parameter name")
			self.vars[vars[i]] = lines[0][i]


	def parseAgt(self, output):
		file = open(output, "rt")
		try : 
			lines = file.readlines()
		finally:
			file.close()
		i=len(lines)-1
		tests = "   AVERAGE POWER GAIN="
		testl = len(tests)
		while i >0:
			if lines[i][0:testl]==tests:
				return float(lines[i][testl+1:].strip().split()[0].lower())
			i=i-1
		return 1

	def calcLength(self, line):
		return self.scale*necmath.sqrt(necmath.pow(line[2]-line[5],2)+necmath.pow(line[3]-line[6],2)+necmath.pow(line[4]-line[7],2))

	def autoSegment(self, line):
		length = self.calcLength(line) 
		nsegs = length*self.autosegment[0]/self.autosegment[1]
		line[1] = max(int(nsegs+.5),1)
		tag = line[0]
		segs = line[1]
		if tag in self.source_tags:
			if segs > 2: segs+=2
			if segs % 2 == 0:
				segs+=1
			line[1]=segs
			for seg_ref in self.source_tags[tag]:
				self.varlines[seg_ref.varline_no][seg_ref.token_no] = str(seg_ref.newSegNo(segs))
				self.lines[seg_ref.line_no] = " ".join(self.varlines[seg_ref.varline_no])
		

	def autoSegmentation(self, segs_per_halfwave=0, freq = None):
		if not freq: freq = self.frequency
		if not freq: freq = 585
		halfwave = 150.0/freq
		self.autosegment = (segs_per_halfwave, halfwave)
		#printOut("Autosegmentation set at %d per %g (freq=%f)"%(segs_per_halfwave, halfwave, freq))
		
	def writeSource(self, filename):
		file = open(filename, "wt")
		try: file.writelines(self.lines)
		finally: file.close()
	
	def evalToken(self, x):
		return eval(x, necmath.__dict__,self.globals)

	def formatNumber(self, n, fixed_width=1):
		if type(n) == type(.1):
			if fixed_width:
				return "%.7f"%n
			else:
				return "%.6g"%n
		else:
			return str(n)
	
	def formatName(self, n):
		return "%8s"%n

	def updateGlobalVars(self):
		self.globals={}
		self.globals.update(self.vars)
		for d in self.dependent_vars:
			try: self.evalVarLine(d,necmath.__dict__, self.globals)
			except:
				traceback.print_exc()
				sys.stderr.write( "failed parsing '%s'\n"%(d))
				raise
		
	def necInputLines(self, frequency, skiptags=["FR", "XQ", "RP", "EN"]):
		lines=[]
		math_lines = []
		comments = []
		self.updateGlobalVars()
		tag_radii = NecFileObject.TagRadii()
		for li in range(len(self.varlines)):
			ln = self.varlines[li]
			comment = self.comments[li]
			if not ln: continue
			fn = lambda x:self.formatNumber(x,0)
			if ln[0].strip() != "GW":
				cmdtag = ln[0].strip()
				if cmdtag not in skiptags:
					try:
						sline = list(map( self.evalToken , ln[1:]))
						sline = map(fn, sline)
						lines.append(ln[0]+" "+" ".join(sline))
					except:
						lines.append(" ".join(ln))
				if cmdtag == "GX":
					i1 = int(self.evalToken(ln[1]))
					self.wire_structure.mirrorStructure(math_lines,comments, i1, int(ln[2][0]), int(ln[2][1]), int(ln[2][2]))
					if not "GX" in skiptags:
						lines[-1]="GX %d %s"%(i1,ln[2])
				elif cmdtag == "GM":
					if len(ln) < 10:
						ln=ln+(10-len(ln))*[".0"]
					i1 = int(self.evalToken(ln[1]))
					i2 = int(self.evalToken(ln[2]))
					f3 = self.evalToken(ln[3])
					f4 = self.evalToken(ln[4])
					f5 = self.evalToken(ln[5])
					f6 = self.evalToken(ln[6])
					f7 = self.evalToken(ln[7])
					f8 = self.evalToken(ln[8])
					i9 = int(self.evalToken(ln[9]))
					self.wire_structure.moveCopyStructure(math_lines,comments, i1, i2, f3, f4, f5, f6, f7, f8, i9)
					if not "GM" in skiptags:
						lines[-1]="GM %d %d %f %f %f %f %f %f %d"%(i1, i2, f3, f4, f5, f6, f7, f8, i9)
				elif cmdtag == "GR":
					i1 = int(self.evalToken(ln[1]))
					i2 = int(self.evalToken(ln[2]))
					self.wire_structure.rotateStructure(math_lines,comments, i1, i2)
					if not "GR" in skiptags:
						lines[-1]="GR %d %d"%(i1, i2)
				elif cmdtag == "SP":
					i1 = int(ln[1])
					i2 = int(self.evalToken(ln[2]))
					if not "SP" in skiptags:
						lines[-1]="SP %d %d "%(i1, i2)+" ".join(list(map( fn, map( self.evalToken , ln[3:]))))
				elif cmdtag == "SM":
					i1 = int(self.evalToken(ln[1]))
					i2 = int(self.evalToken(ln[2]))
					if not "SM" in skiptags:
						lines[-1]="SM %d %d "%(i1, i2)+" ".join(list(map( fn, map( self.evalToken , ln[3:]))))
				elif cmdtag == "SC":
					i1 = int(ln[1])
					i2 = int(ln[2])
					if not "SC" in skiptags:
						lines[-1]="SC %d %d "%(i1, i2)+" ".join(list(map( fn, map( self.evalToken , ln[3:]))))
				elif cmdtag == "NT" or cmdtag == "TL" :
					i1 = int(ln[1])
					i2 = int(ln[2])
					i3 = int(ln[3])
					i4 = int(ln[4])
					if not cmdtag in skiptags:
						lines[-1]="%s %d %d %d %d "%(cmdtag, i1, i2, i3, i4)+" ".join(list(map( fn, map( self.evalToken , ln[5:]))))
				elif cmdtag == "LD":
					ldtype = int(ln[1].strip())
					if ldtype > 7:
						raise RuntimeError("Loads (LD) of type > 7 are not know to this script")
					elif ldtype == 6:
						i2 = int(self.evalToken(ln[2]))
						i3 = int(self.evalToken(ln[3]))
						i4 = int(self.evalToken(ln[4]))
						Q = self.evalToken(ln[5])
						if not Q: Q = 100
						L = self.evalToken(ln[6])
						C = self.evalToken(ln[7])
						printOut( "L=%f, Q=%f, freq=%f"%(L,Q,frequency))
						R = Q * 2 * necmath.pi * frequency * L * 1e+6
						lines[-1]="LD 1 %d %d %d %s %s %s "%(i2, i3, i4, fn(R), fn(L), fn(C))
					elif ldtype == 7:
						i2 = int(self.evalToken(ln[2]))
						i3 = int(self.evalToken(ln[3]))
						i4 = int(self.evalToken(ln[4]))
						R = self.evalToken(ln[6])
						diel = self.evalToken(ln[5])
						r = tag_radii.tagRadius(i2, "LD")
						#printOut( "tag=%d, R=%f, r=%f, diel=%f"%(i2,R,r,diel))
						L = 2e-7 * (diel * R/r)**(1.0/12) * (1 - 1/diel) * necmath.log(R/r)
						lines[-1]="LD 5 %d %d %d 0 %s "%(i2, i3, i4, fn(L))
			else:
				sline = list(map( self.evalToken , ln[1:]))
				sline[0] =int(sline[0])
				sline[1] =int(sline[1])
				tag_radii.addWire(sline[0], sline[-1])
				math_lines.append(sline)
				comments.append(comment)
				if self.autosegment[0] and self.tag_segmentation.autoSegment(li):
					self.autoSegment(sline)
				sline = map(fn, sline)
				lines.append(ln[0]+" "+" ".join(sline))
		#del self.globals
		if self.write_js_model:
			self.writeJSModel(math_lines,comments)
		if self.options.html:
			self.html_output.addJSModel(math_lines,comments)
		if not self.wire_structure.testLineIntersections(math_lines):
			return []
		return lines

	def writeJSModel(self, lines, comments):
		for i in jsModelFromLines(lines, comments):
			printOut(i)

	def writeNecInput(self, filename, extralines=[], skiptags=[]):
		lines = self.necInputLines(self.frequency, skiptags)
		if not lines: return 0
		lines.extend(extralines)
		file = open(filename, "wt")
		try: file.write("\n".join(lines)+"\n")
		finally: file.close()
		return 1

	def writeParametrized(self, filename, extralines=[], skiptags=[], comments=[]):
		self.updateGlobalVars()
		lines=[]
		for v in self.vars.keys():
			lno = self.paramlines[v]
			if v in self.min_max.keys():
				self.lines[lno] = "SY %s=%.7g ' %g, %g" %(v, self.vars[v], self.min_max[v][0], self.min_max[v][1])
			else:
				self.lines[lno] = "SY %s=%.7g" %(v, self.vars[v])
		has_comments = 0
		for ln in self.lines:
			comment_pos = ln.find("'")
			if comment_pos!=-1:
				comment = ln[comment_pos:].strip('\n')
				ln = ln[0:comment_pos].strip(' ')
			else:
				comment = ""
				ln = ln.strip(' ')
			sl = ln.replace(',',' ').split()
			if sl and sl[0].strip() == "CE":
				has_comments=1
			if not sl or not self.autosegment[0] or sl[0].strip() != "GW" : 
				lines.append(ln.strip()+comment)
				continue
			if sl[0].strip() == "GW":
				sline = list(map( self.evalToken , sl[1:]))
				if self.autosegment[0] and sl[2][0]!='+':
					self.autoSegment(sline)
					sl[2] = str(sline[1])
				lines.append(" ".join(sl)+comment)

		#del self.globals
		lines.extend(extralines)
		file = open(filename, "wt")
		try: 
			if comments:
				file.write("CM ")
				file.write("\nCM ".join(comments))
				file.write("\n")
				if not has_comments:
					file.write("CE\n")
			file.write("\n".join(lines)+"\n")
		finally: file.close()

	def freqSweepLines(self, nec_input_lines, sweep):
		lines = list(nec_input_lines)
		ranges = sweep.ranges
		angles = sweep.angles
		frequency_data = self.options.frequency_data
		angle_sweep = not self.options.frequency_data and not self.options.forward
		if self.options.calc.gain:
			for i in range(len(ranges)):
				lines.append("FR 0 %d 0 0 %g %g"%(ranges[i][2],ranges[i][0],ranges[i][1]))
				if not angle_sweep:
					lines.append("RP 0 1 1 1000 90 %g 0 0"%angles[i])
				else: 
					lines.append("RP 0 1 %d 1000 90 %g 0 %g"%(int(360/self.options.angle_step)+1, angles[i], self.options.angle_step))
		else:
			lines.append("FR 0 %d 0 0 %g %g"%(ranges[0][2],ranges[0][0],ranges[0][1]))
			lines.append("PQ -1")
			lines.append("PT -1")
		lines.append("XQ")
		lines.append("EN")
		return lines
	def agtLines(self, nec_input_lines, sweep):
		lines = []
		for line in nec_input_lines:
			if line[0:2]!="LD":
				lines.append(line)
			else:
				sl = line.split()
				if sl[1]=='5':
					continue
				sl[5]="0"
				lines.append(" ".join(sl))
		agt_freq = sweep.agt_freq
		lines.append("FR 0 0 0 0 %g 0"%agt_freq)
		step = self.options.angle_step
		if step < 5 and self.options.forward:
			step = 5
		hcount = int(360/step)+1
		vcount = int(180/step)+1
		#lines.append("RP 0 %d %d 1001 -180 0  %g %g"%(vcount, hcount, step, step))
		lines.append("RP 0 %d %d 1001 -180 %g  %g %g"%(vcount, hcount, self.options.forward_dir, step, step))
		lines.append("XQ")
		lines.append("EN")
		return lines
	
	def runSweep(self, nec_input_lines, sweep, get_agt_scores=0, use_agt = None, id=""):
		#print "Get agt score = %d"%get_agt_scores
		#import tempfile as tmp
		import subprocess as sp
		import os
		try:
			os.mkdir(self.options.output)
		except : pass
			
		nec_input = os.path.join(".",self.options.output,"nec2_"+id+".inp")
		agt_input = nec_input[0:-3]+"agt"

		file = open(nec_input, "wt")
		fslines = self.freqSweepLines(nec_input_lines,sweep)
		if not fslines:
			return ()
		try: file.write("\n".join(fslines))
		finally: file.close()
		if (self.options.agt_correction or get_agt_scores) and (use_agt is None):
			file = open(agt_input, "wt")
			try: file.write("\n".join(self.agtLines(nec_input_lines,sweep)))
			finally: file.close()
		
		nec_output = nec_input[0:-3]+"out"
		exe_input = nec_input[0:-3]+"cin"
		agt = 1.0
		if use_agt is not None:
			agt = use_agt
		elif self.options.agt_correction or get_agt_scores :
			if self.options.engine_takes_cmd_args:
				popen = sp.Popen([self.options.engine, agt_input, nec_output] )
				popen.wait()
			else:
				try:
					f = open(exe_input,"wt")
					f.write(agt_input)
					f.write("\n")
					f.write(nec_output)
					f.write("\n")
					f.close()
					f = open(exe_input)
					popen = sp.Popen(self.options.engine, stdin=f, stdout=open(os.devnull, "w"))
					popen.wait()
				finally:
					f.close()
			agt = self.parseAgt(nec_output)
			if get_agt_scores:
				return (nec_output,agt)
		if self.options.engine_takes_cmd_args:
			popen = sp.Popen([self.options.engine, nec_input, nec_output] )
			popen.wait()
		else:
			try:
				f = open(exe_input,"wt")
				f.write(nec_input)
				f.write("\n")
				f.write(nec_output)
				f.write("\n")
				f.close()
				f = open(exe_input)
				popen = sp.Popen(self.options.engine, stdin=f, stdout=open(os.devnull, "w"))
				popen.wait()
			finally:
				f.close()
		return (nec_output,agt)
		
	def runSweepT(self, nec_input_lines, sweep, number, result_map, result_lock, get_agt_scores=0, use_agt = None, id=0 ):
		r = None
		try:
			ua = None
			if use_agt and number in use_agt:
				ua = use_agt[number]
			r = self.runSweep(nec_input_lines,sweep, get_agt_scores,ua, str(id)+"_"+str(number))
		except KeyboardInterrupt:
			raise
		except:
			try:
				result_lock.acquire()
				traceback.print_exc()
			finally:
				result_lock.release()

			return
		result_lock.acquire()
		try: 
			if r : result_map[number]=(r[0],sweep.sweepid,r[1], number)
		finally: result_lock.release()

	def prepareSweeps(self):
		total_freqs = len(self.options.frequency_data)
		num_cores = self.options.num_cores
		sweeps = self.options.sweeps
		if not total_freqs: 
			for i in sweeps: 
				total_freqs = total_freqs+i[2]
		self.sweeps = []
		if not total_freqs: 
			return self.sweeps
		if total_freqs < num_cores : 
			num_cores = total_freqs
		freqs_per_core = (total_freqs+.0)/num_cores
		
		freqs_per_sweep = [0]*len(sweeps)
		if self.options.frequency_data:
			for f in self.options.frequency_data.keys():
				for s in range(len(sweeps)):
					sw = sweeps[s]
					if f>=sw[0] and f <=sw[0]+sw[1]*sw[2]:
						freqs_per_sweep[s]+=1
						break
		else:
			for s in range(len(sweeps)):
				freqs_per_sweep[s] = sweeps[s][2]

		i=len(sweeps)
		while i:
			i-=1
			if not freqs_per_sweep[i]:
				del freqs_per_sweep[i]
				del sweeps[i]

		
		cores_per_sweep = [0]*len(sweeps)
		while num_cores:
			for i in range(len(sweeps)):
				if cores_per_sweep[i]: continue
				if freqs_per_sweep[i] < freqs_per_core:
					cores_per_sweep[i] =  1 
					total_freqs = total_freqs - freqs_per_sweep[i]
					num_cores = num_cores-1
					if not num_cores: break
				else:
					cores_per_sweep[i] = 0 
		
			if not num_cores:
				for i in range(len(sweeps)):
					if cores_per_sweep[i]: continue
					cores_per_sweep[i] = 1
				break
			if freqs_per_core == (total_freqs+.0)/num_cores:
				smallest = -1
				smallest_count = total_freqs+1
				for i in range(len(sweeps)):
					if cores_per_sweep[i]: continue
					if freqs_per_sweep[i] < smallest_count:
						smallest_count = freqs_per_sweep[i]
						smallest = i
						
				cores_per_sweep[smallest] = min(num_cores, round(freqs_per_sweep[smallest]/freqs_per_core) )
				num_cores = num_cores-cores_per_sweep[smallest]
				total_freqs = total_freqs - freqs_per_sweep[smallest]

			if not num_cores or not total_freqs: break
			freqs_per_core = (total_freqs+.0)/num_cores

		for i in range(len(sweeps)):
			self.appendSweep(sweeps[i],cores_per_sweep[i],freqs_per_sweep[i], i)

	def appendSweep(self, sweep, num_cores, sweep_size,sweepid):
		sweep_freqs = []
		angles = []
		while num_cores:
			num_freqs = int(sweep_size/num_cores)
			if not self.options.frequency_data:
				half = int(num_freqs / 2)
				self.sweeps.append(Sweep( [(sweep[0],sweep[1],num_freqs)],[self.options.forward_dir],sweep[0]+half*sweep[1],sweepid))
			else:
				if not sweep_freqs:
					freqs = sorted(self.options.frequency_data.keys())
					for freq in freqs:
						if freq >= sweep[0] and freq <= sweep[0]+sweep[1]*sweep[2]:
							sweep_freqs.append(freq)
							angles.append(self.options.frequency_data[freq][0])

				if num_freqs == 1:
					self.sweeps.append(Sweep( [(sweep_freqs[0],0,1)], [angles[0]], sweep_freqs[0],sweepid))
					del sweep_freqs[0]
					del angles[0]
				elif num_freqs == 2:
					self.sweeps.append(Sweep( [(sweep_freqs[0],0,1), (sweep_freqs[1],0,1)], angles[0:2], sweep_freqs[0],sweepid))
					del sweep_freqs[0:2]
					del angles[0:2]
				else:
					freqs = sorted(sweep_freqs[0:num_freqs])
					mid_freq = (sweep_freqs[num_freqs-1]+sweep_freqs[0])/2
					agt_index = 0
					for i in range(1,num_freqs):
						if abs(sweep_freqs[i]-mid_freq) < abs(sweep_freqs[agt_index]-mid_freq):
							agt_index = i
					self.sweeps.append(Sweep( [(sweep_freqs[i],0,1) for i in range(num_freqs)], angles[0:num_freqs], sweep_freqs[agt_index],sweepid))
					del sweep_freqs[0:num_freqs]
					del angles[0:num_freqs]


			sweep = (sweep[0]+num_freqs*sweep[1],sweep[1],sweep[2]-num_freqs)
			num_cores = num_cores-1
			sweep_size-=num_freqs

	def cleanupOutput(self, older_than = 10):
		import os, time, stat
		try:
			ldir = os.listdir(self.options.output)
			now = time.time()
			for f in ldir:
				try:
					f = os.path.join(self.options.output,f)
					s = os.stat(f)
					if s[stat.ST_MTIME] + older_than < now:
						os.remove(f)
				except:
					pass
		except:
			pass

	def runSweeps(self, get_agt_scores = 0, use_agt = None, id = ""):
		#if self.options.cleanup:
		#	self.cleanupOutput(self.options.cleanup)
		results={}
		number=0

		from threading import Lock, Thread
		result_lock = Lock()
		threads = []
		for i in range(len(self.sweeps)-1):
			sweep = self.sweeps[i]
			try:
				nec_input_lines = self.necInputLines(sweep.midFrequency())
			except:
				if not self.options.quiet: traceback.print_exc()
				return
			threads.append(Thread(target=self.runSweepT, args=(nec_input_lines, sweep, number,results, result_lock,get_agt_scores,use_agt,id )))
			threads[-1].start()
			number = number+1

		r = None
		sweep = self.sweeps[-1]
		try:
			nec_input_lines = self.necInputLines(sweep.midFrequency())
		except:
			if not self.options.quiet: traceback.print_exc()
			return
		try:
			ua = None
			if use_agt and number in use_agt:
				ua = use_agt[number]
			r = self.runSweep(nec_input_lines,sweep, get_agt_scores,ua, str(id)+"_"+str(number))
		except KeyboardInterrupt:
			raise
		except:
			traceback.print_exc()
		for t in threads:
			t.join()
		#after the joins so we dont have to lock
		if r : results[number]=(r[0],sweep.sweepid,r[1], number)
			

		r = []
		for i in results.keys():
			r.append(results[i])
		return r


	def evaluate(self, chart_like=0):
		NOP = NecOutputParser 
		results = self.runSweeps() #[[174,6,8],[470,6,40]]
		h={}
		v={}
		res = []
		if not chart_like:
			printOut("Input file : %s"%self.options.input )
			printOut("Freq sweeps: %s"%str(self.options.sweeps) )
			if self.autosegment[0]:
				printOut("Autosegmentation: %d per %g"%self.autosegment)
			else:
				printOut("Autosegmentation: NO")
			printOut("\n")
	
			for r in range(len(results)):
				nop = NOP(results[r][0], results[r][2], self.options)
				if self.options.debug > 1:
					for f in nop.frequencies:
						printOut(f.horizontal)
				h.update(nop.horizontalPattern())
				v.update(nop.verticalPattern())
				nop.printFreqs(r==0)
				res = res+nop.getGainSWRChartData()
		else:
			for r in range(len(results)):
				nop = NOP(results[r][0], results[r][2], self.options)
				h.update(nop.horizontalPattern())
				v.update(nop.verticalPattern())
				res = res+nop.getGainSWRChartData()
			res.sort()
			g = self.options.input+"_gain"
			for i in res: g+=(",%.2f"%i[1][0])
			s = self.options.input+"_swr"
			for i in res: s+=(",%.2f"%i[1][1])
			printOut( g)
			printOut( s)

		if self.options.html:
#			if self.options.horizontal_gain:
			self.html_output.addHPattern(h)
#			else:
#				self.html_output.addVPattern(v)
			self.html_output.addGainChart(self.options.sweeps, res)
			self.html_output.writeToFile(self.options.html)
		if self.write_js_model:
			printOut( "Horizontal:")
			printOut( sorted(h.keys()))
			for i in sorted(h.keys()):
				l = int(len(h[i])/2)+1;
				printOut( "["+("%.2f,"*l)[0:-1]%tuple(h[i][0:l])+"],")

			printOut( "Vertical:")
			printOut( sorted(v.keys()))
			for i in sorted(v.keys()):
				l = int(len(v[i])/2)+1;
				printOut( "["+("%.2f,"*l)[0:-1]%tuple(v[i][0:l])+"],")
				


import optparse 
class OptionParser(optparse.OptionParser):
	def __init__(self):
		optparse.OptionParser.__init__(self)
		self.add_option("-o", "--output-dir", type="string", metavar="DIR", dest="output", default=output, help="output path [%default]")
		self.add_option("-i", "--input", type="string", metavar="NEC_FILE", dest="input", default="", help="input nec file")
		self.add_option("-s", "--sweep", type="string", metavar="SWEEP", action="append", dest="sweeps", help="adds a sweep range e.g. -s (174,6,8) for vhf-hi freqs")
		self.add_option("-C", "--char-impedance", type="float", metavar="IMPEDANCE", default=300.0, help="The default is %default Ohms.")
		self.add_option("-u", "--uhf", "--uhf-52", action="append_const", dest="sweeps", const="(470,6,39)", help="adds a uhf (ch. 14-51) sweep")
		self.add_option("-U", "--uhf-69", action="append_const", dest="sweeps", const="(470,6,57)", help="adds a uhf (ch. 14-69) sweep")
		self.add_option("-V", "--vhf-hi", action="append_const", dest="sweeps", const="(174,6,8)", help="adds a vhf-hi (ch. 7-13) sweep")
		self.add_option("-v", "--vhf-lo", action="append_const", dest="sweeps", const="(54,6,6)", help="adds a vhf-lo (ch. 1-6) sweep")
		self.add_option("-n", "--num-cores", type="int", default=ncores, help="number of cores to be used, default=%default")
		self.add_option("-a", "--auto-segmentation", metavar="NUM_SEGMENTS", type="int", default=autosegmentation, help="autosegmentation level - set to 0 to turn autosegmentation off, default=%default")
		self.add_option("-e", "--engine", metavar="NEC_ENGINE", default="nec2dxs1k5", help="nec engine file name, default=%default")
		self.add_option("--engine-takes-cmd-args", default="auto", type="string", help="the nec engine takes command args, default=auto (which means no on windows yes otherwise). Other options are 'yes' or 'no'.")
		self.add_option("-d", "--min-wire-distance", default=.005, type="float", help="minimum surface-to-surface distance allowed between non-connecting wires, default=%default")
		self.add_option("--debug", default=0, type="int", help="turn on some loging")
		self.add_option("--forward-dir", default=0, type="int", help="the forward direction, by default is 0 which means the antenna forward is along X.")
		self.add_option("--backward-dir", default=180, type="int", help="the backward direction (relative to --forward-dir) to which F/R and F/B are calculated. The default is 180 which means the exact opposite of the forward-dir")
		self.add_option("--rear-angle", default=120, type="int", help="angle for calculating rear gain (max 270)")
		self.add_option("--beamwidth-ratio", default=3.01, type="float", help="ratio for calculating beam width in dB, default=%default")
		self.set_defaults(gain_type=1)
		self.add_option("--vertical-gain", action="store_const", const=0, dest="gain_type", help="calculate vertical gain ")
		self.add_option("--horizontal-gain", action="store_const", const=1, dest="gain_type", help="calculate horizontal gain [default]")
		self.add_option("--total-gain", action="store_const", const=2, dest="gain_type", help="calculate total gain")
		self.add_option("-f", "--frequency_data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
		self.add_option("--cleanup", default=180, type="int", help="remove output files older than CLEANUP seconds. set to 0 to disable")
	def parse_args(self):
		options, args = optparse.OptionParser.parse_args(self)
		if options.rear_angle<0 or options.rear_angle>270: raise ValueError("Invalid rear angle of %d"%options.rear_angle)
		options.frequency_data = eval(options.frequency_data)
		if options.input == "":
			if len(args):
				options.input=args[0]
				del args[0]
			else:
				options.input = input
		while options.forward_dir < 0:
			options.forward_dir+=360
		while options.forward_dir > 360:
			options.forward_dir-=360
		options.backward_dir += options.forward_dir
		while options.backward_dir < 0:
			options.backward_dir+=360
		while options.backward_dir > 360:
			options.backward_dir-=360
		if options.sweeps:
			options.sweeps = list(map(eval,options.sweeps))
		return (options, args)

def optionParser():
	class MainOptionParser(OptionParser):
		def __init__(self):
			OptionParser.__init__(self)
			self.add_option("--param-values-file", default="", help="Read the parameter values from file, generate output.nec and evaluate it instead of the input file. The file should contain two lines: space separated parameter names on the first and space separated values on the second.")
			self.add_option("--agt-correction", default=1, type="int", help="ignored. agt correction is always applied")
			self.add_option("-c", "--centers", default=True, help="run sweep on the channel centers",action="store_false", dest="ends")
			self.add_option("--chart", default=0, action="store_true")
			self.add_option("--js-model", default=0, action="store_true", help="write jsmodel")
			self.add_option("--html", default="output.html", help="html output file")
		def parse_args(self):
			options, args = OptionParser.parse_args(self)
			class Calc: pass
			options.calc = Calc()
			options.calc.gain=1
			options.calc.f2b=1
			options.calc.f2r=1
			options.calc.beam_width=1
			options.quiet=0
			options.forward = 0
			options.verbose=0
			if not options.sweeps:
				options.sweeps = [(470,6,39)]
			if not options.ends:
				for i in range(len(options.sweeps)):
					if not options.sweeps[i][1]: continue
					options.sweeps[i] = (options.sweeps[i][0] - options.sweeps[i][1]/2, options.sweeps[i][1], options.sweeps[i][2]+1)
			return (options, args)
	return MainOptionParser()


def run(options):
	nf = NecFileObject(options)
	nf.evaluate(options.chart)

def main():
#default values
	options, args = optionParser().parse_args()
	run(options)
	for inp in args:
		if inp[0]!="-":
			options.input = inp
			try:
				run(options)
			except:
				traceback.print_exc()
				pass
	


if __name__ == "__main__":
	main()
