# Copyright 2010-2012 Nikolay Mladenov, Distributed under 
# GNU General Public License
from __future__ import division

import sys, traceback, os, pprint, functools
from nec import necmath
from nec.print_out import printOut
import pdb

nec_cards =["SY","CM","CE","GA","GE","GF","GH","GM","GR","GS","GW","GX","SP","SM","SC","CP","EK","EN","EX","FR","GD","GN","KH","LD","NE","NH","NT","NX","PQ","PT","RP","TL","WG","XQ"]

class InputError(RuntimeError):
	def __init__(self, msg):
		RuntimeError.__init__(self, msg)

class EvalError(RuntimeError):
	def __init__(self, msg):
		RuntimeError.__init__(self, msg)
		
		
class NecInputFile:
	def __init__(self, input, debug=0):
		self.cmd_options = {}
		self.vars = {}
		self.min_max = {}
		self.dependent_vars = []
		self.lines=[]
		self.srclines=[]
		self.lineno_map = {}
		self.paramlines={}
		self.segment_references={}
		self.autosegment=(0,0)
		self.frequency = 585
		self.sweeps = []
		self.scale = 1
		self.angle_step = 5
		self.debug = debug
		self.input = input
		self.has_ground = 0
		self.readSource(self.input)

	def readSource(self, sourcefile):
		if self.debug: sys.stderr.write("debug: Opening file %s\n"%sourcefile)
		self.input = sourcefile
		file = open(sourcefile, "rt")
		try: self.lines = file.readlines()
		finally: file.close()
		if not self.lines: raise InputError("Empty input file")
		self.parse()
	
	def evalVarLine(self, line, g=None, l=None):
		ln = line.replace("^","**")
		if l is None:
			d={}
			exec(ln, {}, d)
			return d
		else:
			exec(ln, g, l)


	class TagData:
		def __init__(self, lineno, nsegs, rad):
			self.lineno = lineno
			self.nsegs = nsegs
			self.rad = rad
		def append(self, td):
			self.lineno.append(td.lineno)
			self.nsegs.append(td.nsegs)
			self.rad.append(td.rad)
	class TagRecorder:
		def __init__(self, parser):
			self.tag_data = []
			self.fixed_segmentation = []
			self.parser = parser
		def addTransformation(self, line_tokens):
			inc = int(self.parser.evalToken(line_tokens[1]))
			new = line_tokens[2].strip()
			start_tag = 0 
			if line_tokens[0]=="GX": 
				new = (1+int(new[0]))*(1+int(new[1]))*(1+int(new[2]))-1
			else:
				new = int(self.parser.evalToken(new))
				if line_tokens[0]=="GR": new-=1
				elif line_tokens[0]=="GM" and len(line_tokens)>9:
					start_tag = int(self.parser.evalToken(line_tokens[9]))
			self.update(new, inc, start_tag)
		def addWire(self, line, lineno):
			tag = int(line[1])
			nsegs = int(self.parser.evalToken(line[2]))
			rad = line[-1]
			self.tag_data.append((tag, NecInputFile.TagData(lineno,nsegs, rad)) )
			if line[2][0] == "+":
				self.fixed_segmentation.append(lineno)
		def update(self, new, inc, start_pos):
			if start_pos:
				for i in range(len(self.tag_data)):
					if self.tag_data[i][0] == start_pos:
						start_pos = i
						break
			end_pos = len(self.tag_data)
			for i in range(1,new+1):
				for t in range(start_pos,end_pos):
					self.tag_data.append( (self.tag_data[t][0]+i*inc, self.tag_data[t][1] ) )

		def finalize(self):
			ts = {}
			for i in self.tag_data:
				if i[0] not in ts:
					ts[i[0]] = NecInputFile.TagData([i[1].lineno],[i[1].nsegs],[i[1].rad])
				else:
					ts[i[0]].append(i[1])
			self.tag_data = ts

		#do we have unique segmentation for a tag?, needed for EX, NT or TL cards which reference wire by tag and segment no
		def tagSegments(self, tag, ref_card):
			if tag not in self.tag_data.keys():
				raise InputError("Invalid tag reference %d in %s card" %(tag,ref_card))
			if len(self.tag_data[tag].nsegs)>1:
				raise InputError("Ambiguous tag reference %d in %s card" %(tag,ref_card))
			return self.tag_data[tag].nsegs[0]

		def tagRadius(self, tag, ref_card): #for LD 7
			if not tag:
				for k in self.tag_data.keys():
					return self.tag_data[k].rad[0]
			if tag not in self.tag_data.keys():
				raise InputError("Invalid tag reference %d in %s card" %(tag,ref_card))
			return self.tag_data[tag].rad[0]

		def autoSegment(self, srclineno):
			return srclineno not in self.fixed_segmentation



	class SegRef:
		def __init__(self, srclineno, lineno, tokenno, segno, segcount, end):
			self.srcline_no = srclineno
			self.line_no = lineno 
			self.token_no = tokenno 
			self.seg_no = segno
			self.seg_count = segcount
			self.percent = ((segno-.5) + .5 * end)/segcount
			self.end = end
		def isStart(self):
			return self.percent < 1.e-7
		def isEnd(self):
			return self.percent > 1-1.e-7
		def isMid(self):
			return abs(self.percent-.5) < 1.e-7
			
		def requiresOdd(self): return self.end == 0 and self.isMid()
		def requiresEven(self): return self.end != 0 and self.isMid()
		def minRequired(self): 
			if self.isMid(): 
				if self.end : return 2
				else: return 1
			if self.isStart() or self.isEnd() : return 1
			return 2
			
		def newSegNo(self, seg_count):
			if self.isMid():
				assert self.requiresOdd() and seg_count%2 or self.requiresEven() and not seg_count%2
				end = self.end
				if not end :
					return int((seg_count+1)/2)
				elif end < 0:
					return int(seg_count/2 +1)
				else:
					return int(seg_count/2 )
			if self.isStart():
				return 1
			if self.isEnd():
				return seg_count
			if self.end < 0:
				return min(1+ ceil( self.percent*seg_count),seg_count)
			if self.end > 0:
				return 1+ floor( self.percent*seg_count)
			return round( (self.seg_no-.5)/self.seg_count*seg_count +.5)

	def checkNonZeroTag(self, tag, card):
		if not tag: raise InputError("Tag 0 is not supported in %s card"%card)


	def parseSYLine(self, ln, comment, lineno):
		if self.debug >1: sys.stderr.write("debug: \tParsing line: \"%s\"\n"%ln)
		try:
			d = self.evalVarLine(ln[3:].strip())
			if self.debug: 
				for dk in d.keys(): sys.stderr.write("debug: \tAdded independent parameter \"%s\"\n"%dk)
				if self.debug>1: sys.stderr.write("debug: \t\tFull comment = \"%s\"\n"%comment)
			self.vars.update(d)
			for dk in d.keys(): self.paramlines[dk]=lineno
			try:
				#strip the real comment from the comment
				comment_pos = comment.find("'")
				if comment_pos!=-1:
					comment = comment[0:comment_pos].strip()
				if self.debug>1: 
					sys.stderr.write("debug: \t\tLimits comment = \"%s\"\n"%comment)
				min, max = eval(comment)
				if min <= max:
					for dk in d.keys(): self.min_max[dk]=(float(min),float(max))
				else:
					for dk in d.keys(): self.min_max[dk]=(float(max),float(min))
				if self.debug: sys.stderr.write("debug: \t\tlimits(%.3g, %.3g)\n"%(float(min), float(max)))
			except:
				if self.debug>1: 
					for dk in d.keys(): sys.stderr.write("debug: \tNo limits found for parameter \"%s\"\n"%dk)
				pass
			self.globals.update(d)
		except:
			if self.debug: sys.stderr.write("debug: \tAdded dependent parameter \"%s\"\n"%ln[3:].strip())
			self.dependent_vars.append(ln[3:].strip())
			try: self.evalVarLine(self.dependent_vars[-1],necmath.__dict__, self.globals)
			except Exception  as e:
#				traceback.print_exc()
#				sys.stderr.write( "failed parsing '%s'\n"%(d))
				raise InputError("Failed to evaluate variable in line : \n"+ln+"\nReason: "+ str(e))
	def parseEXLine(self, line, srclineno, lineno):
		type = int(line[1])
		if type == 0 or type == 6 :
			end = 0
		elif type == 5:
			end = -1
		else: return
		tag = int(line[2])
		seg = int(self.evalToken(line[3]))
		segments = self.tag_data.tagSegments(tag, line[0])
		end 
		seg_ref = NecInputFile.SegRef(srclineno, lineno, 3, seg, segments, end)
		if tag not in self.segment_references:
			self.segment_references[tag]=[seg_ref]
		else:
			self.segment_references[tag].append(seg_ref)

	def parseNTOrTLLine(self, line, srclineno, lineno):
		tag = int(line[1])
		self.checkNonZeroTag(tag,line[0])
		seg = int(self.evalToken(line[2]))
		segments = self.tag_data.tagSegments(tag, line[0])
		seg_ref = NecInputFile.SegRef(srclineno, lineno, 2, seg, segments,0)
		if tag not in self.segment_references:
			self.segment_references[tag]=[seg_ref]
		else:
			self.segment_references[tag].append(seg_ref)
		tag = int(line[3])
		self.checkNonZeroTag(tag,line[0])
		seg = int(self.evalToken(line[4]))
		segments = self.tag_data.tagSegments(tag, line[0])
		seg_ref = NecInputFile.SegRef(srclineno, lineno, 4, seg, segments, 0)
		if tag not in self.segment_references:
			self.segment_references[tag]=[seg_ref]
		else:
			self.segment_references[tag].append(seg_ref)

	def parseLDLine(self, line, srclineno, lineno):
		tag = int(line[2])
		seg1 = int(self.evalToken(line[3]))
		seg2 = int(self.evalToken(line[4]))
		if seg1: 
			self.checkNonZeroTag(tag,line[0])
			segments = self.tag_data.tagSegments(tag, line[0])
			seg1_ref = NecInputFile.SegRef(srclineno, lineno, 3, seg1, segments,-1)
			seg2_ref = NecInputFile.SegRef(srclineno, lineno, 4, seg2, segments, 1)
			if tag not in self.segment_references:
				self.segment_references[tag]=[seg1_ref,seg2_ref]
			else:
				self.segment_references[tag]+=[seg1_ref,seg2_ref]

	def parse(self):		
		if self.debug: sys.stderr.write("debug: Parsing input\n")
		self.vars = {}
		self.dependent_vars = []
		self.globals={}
		self.srclines=[]
		self.segment_references={}
		self.comments = []
		#self.fixed_segmentation = []
		comments_allowed=1
		code_allowed=1
		self.tag_data = NecInputFile.TagRecorder(self)
		for i in range(len(self.lines)):
			ln = self.lines[i].strip('\n')
			comment_pos = ln.find("'")
			if comment_pos!=-1:
				comment = ln[comment_pos+1:].strip()
				ln = ln[0:comment_pos].strip()
			else:
				comment = ""
				ln = ln.strip()
			if ln == "": continue
			neccard = ln[0:2].upper()
			if neccard not in nec_cards:
				raise InputError("Unknown nec card: "+neccard)
			if neccard == "CM" and (ln[0:5].upper()=="CMD--" or ln[0:6].upper()=="CM D--"):
				if not comments_allowed:
					raise InputError("CM card after CE card")
				ln = (ln[5:] if ln[0:5].upper()=="CMD--" else ln[6:]).split(' ')
				if len (ln) > 1:
					if ln[0] in self.cmd_options:
						self.cmd_options[ln[0]] += " "+" ".join(ln[1:])
					else:
						self.cmd_options[ln[0]] = " ".join(ln[1:])
			elif neccard== "SY":
				self.parseSYLine(ln, comment, i)
			else:
				if neccard == "EN":
					code_allowed=0
				else:
					if not code_allowed:
						raise InputError("Extra cards after EN")
					if neccard == "CE":
						comments_allowed=0
			
				self.lineno_map[i] = len(self.srclines)
				self.srclines.append(ln.replace(',',' ').split())
				self.comments.append(comment)
				srclineno = len(self.srclines)-1
				srcline = self.srclines[srclineno]
				if neccard in ["GW","GA","GH"]:
					self.tag_data.addWire(srcline, srclineno)
				elif neccard=="GM" or neccard=="GR" or neccard=="GX":
					self.tag_data.addTransformation(srcline)
				elif neccard=="EX":
					self.parseEXLine(srcline,srclineno, i)
				elif neccard=="TL" or neccard=="NT":
					self.parseNTOrTLLine(srcline,srclineno, i)
				elif neccard=="LD":
					self.parseLDLine(srcline,srclineno, i)
				elif neccard == "FR":
					if len(srcline) < 6:
						raise RuntimeError('Invalid FR card: "%s\"'%ln)
					if not self.sweeps : 
						self.frequency = self.evalToken(srcline[5])
					else:
						self.frequency = max(self.evalToken(srcline[5]), self.frequency)
					fr_step = self.evalToken(srcline[6]) if len(srcline)>6 else 0
					self.sweeps.append((self.evalToken(srcline[5]), fr_step, max(1,self.evalToken(srcline[2]))) )
				elif neccard == "GS":
					self.scale = self.evalToken(self.srclines[-1][3])
				elif neccard == "RP":
					self.angle_step = self.evalToken(self.srclines[-1][8])
					if self.angle_step == 0:
						self.angle_step = 5
				elif neccard == "GN":
					if srcline[1] != '-1':
						self.has_ground = 1
				elif neccard == "GE":
					self.tag_data.finalize()

		for i in self.vars.keys():
			self.vars[i]=float(self.vars[i])

	def calcLength(self, type, line):
		if type == "GW":
			return self.scale*necmath.sqrt(necmath.pow(line[2]-line[5],2)+necmath.pow(line[3]-line[6],2)+necmath.pow(line[4]-line[7],2))
		elif type=="GA":
			return line[2]*necmath.radians(abs(line[4]-line[3]) )
		elif type=="GH": #estimate
			if line[2] <=0 : return 0
			turns = line[3]/line[2]
			start_perimeter = 2*necmath.pi*necmath.sqrt( (line[4]*line[4]+line[5]*line[5])/2 )
			end_perimeter = 2*necmath.pi*necmath.sqrt( (line[6]*line[6]+line[7]*line[7])/2 )
			average_perimeter = (start_perimeter+end_perimeter)/2
			return necmath.sqrt(average_perimeter*turns * average_perimeter*turns + line[3]*line[3])


	def autoSegment(self, type, line):
		length = self.calcLength(type, line) 
		nsegs = length*self.autosegment[0]/self.autosegment[1]
		line[1] = max(int(nsegs+.5),1)
		tag = line[0]
		segs = line[1]
		if tag in self.segment_references:
			even = functools.reduce( lambda x,y: x or y, map(lambda x: x.requiresEven(), self.segment_references[tag]) )
			odd = functools.reduce( lambda x,y: x or y, map(lambda x: x.requiresOdd(), self.segment_references[tag]) )
			if even and odd:
				raise InputError("Both even and odd segmentation is required for tag %d"%tag)
			if (even and segs % 2) or (odd and not segs % 2) :
				if nsegs < segs and segs > 1:
					segs-=1
				else:
					segs+=1
			elif not even and not odd and not segs % 2:
				if nsegs < segs :
					if segs > 1 and self.autosegment[0] > 1 and length/ (segs-1) < self.autosegment[1]/(self.autosegment[0]-1) :
						segs-=1
				else:
					if length/ (segs+1) > self.autosegment[1]/(self.autosegment[0]+1) :
						segs+=1
			line[1]=segs

			for seg_ref in self.segment_references[tag]:
				self.srclines[seg_ref.srcline_no][seg_ref.token_no] = str(int(seg_ref.newSegNo(segs)))
				self.lines[seg_ref.line_no] = " ".join(self.srclines[seg_ref.srcline_no])
		else:
			if not segs % 2:
				if nsegs < segs :
					if segs > 1 and self.autosegment[0] > 1 and length/ (segs-1) < self.autosegment[1]/(self.autosegment[0]-1) :
						segs-=1
				else:
					if length/ (segs+1) > self.autosegment[1]/(self.autosegment[0]+1) :
						segs+=1
			line[1]=segs
		

	def autoSegmentation(self, segs_per_halfwave=0, freq = None):
		if not freq: freq = self.frequency
		if not freq: freq = 585
		halfwave = 150.0/freq
		self.autosegment = (segs_per_halfwave, halfwave)
		#printOut("Autosegmentation set at %d per %g (freq=%f)"%(segs_per_halfwave, halfwave, freq))
		
	def writeSource(self, filename):
		file = open(filename, "wt")
		try: 
			file.writelines(self.lines)
			file.write("\n")
		finally: file.close()
	
	def evalToken(self, x):
		x = x.replace("^","**")
		return eval(x, necmath.__dict__,self.globals)

	def updateGlobalVars(self):
		self.globals={}
		self.globals.update(self.vars)
		for d in self.dependent_vars:
			try: self.evalVarLine(d,necmath.__dict__, self.globals)
			except Exception as e:
				raise EvalError("Failed to evaluate variable:  '%s'\n"%(d) + "\nReason: "+str(e))
		
	def parametrizedLines(self, extralines=[], skiptags=[], comments=[]):
		self.updateGlobalVars()
		lines=[]
		for v in self.vars.keys():
			lno = self.paramlines[v]
			if v in self.min_max.keys():
				self.lines[lno] = "SY %s=%.7g ' %g, %g" %(v, self.vars[v], self.min_max[v][0], self.min_max[v][1])
			else:
				self.lines[lno] = "SY %s=%.7g" %(v, self.vars[v])
		has_comments = 0
		for i in range(len(self.lines)):
			ln = self.lines[i]
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
			if not sl or not self.autosegment[0] or sl[0].strip() not in ["GW","GA","GH"] : 
				lines.append(ln.strip()+comment)
				continue
			if sl[0].strip() in ["GW","GA","GH"]:
				sline = list(map( self.evalToken , sl[1:]))
				fixed_segmentation = i in self.lineno_map and not self.tag_data.autoSegment(self.lineno_map[i])
				if self.autosegment[0] and not fixed_segmentation:
					self.autoSegment(sl[0], sline)
					sl[2] = str(sline[1])
				elif fixed_segmentation:
					sl[2] = sl[2]
				lines.append(" ".join(sl)+comment)

		#del self.globals
		lines+=extralines

		comments = ["CM"]+[ "CM "+x for x in comments]
		if not has_comments:
			comments.append("CE")
		return comments+lines
		
	def writeParametrized(self, filename, extralines=[], skiptags=[], comments=[]):
		lines =  self.parametrizedLines(extralines, skiptags, comments)
		file = open(filename, "wt")
		try: 
			file.write("\n".join(lines)+"\n")
		finally: file.close()

	def currentVars(self):
		return self.vars

	def updateVars(self, names, vals):
		for i in range(len(names)):
			if names[i] not in self.vars: continue
			self.vars[names[i]] = vals[i]
		
		
