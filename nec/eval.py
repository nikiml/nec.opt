# Copyright 2010-2012 Nikolay Mladenov, Distributed under 
# GNU General Public License

from __future__ import division
import sys, traceback, os, pprint
from nec import necmath
from nec.wire_structure import WireStructure
from nec.print_out import printOut
from nec.output_parser import FrequencyData, NecOutputParser
from nec.html import HtmlOutput
from nec.input import NecInputFile, InputError, EvalError
from random import random
from time import sleep

output = "output"
input = "input.nec"
autosegmentation=10
ncores=4

def chooseEngine(engine, segs):
	if engine !="": return engine
	if segs<500 : return "nec2dxs500"
	if segs<1500 : return "nec2dxs1k5"
	if segs<3000 : return "nec2dxs3k0"
	if segs<5000 : return "nec2dxs5k0"
	if segs<8000 : return "nec2dxs8k0"
	if segs<11000 : return "nec2dxs11k"
	raise RuntimeError("Too many segments - use --engine to specify engine")

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

class NecEvaluator:
	def __init__(self, nec_file_input, options):
		self.process_monitor = None
		self.options = options
		self.nec_file_input = nec_file_input
		self.wire_structure = WireStructure(options)
		if options.engine_takes_cmd_args=='yes' or options.engine_takes_cmd_args=='auto' and os.name!='nt':
			self.options.engine_takes_cmd_args = 1
		else: self.options.engine_takes_cmd_args = 0
		if self.options.input:
			self.html_output = HtmlOutput(self.nec_file_input.input)
			try:
				if self.options.param_values_file:
					self.parseParameterValues(self.options.param_values_file)
					self.writeParametrized("output.nec")
					printOut("Using parameters from file: %s (see output.nec)\n"%self.options.param_values_file)
			except (AttributeError, IOError):
				pass
		self.nec_file_input.autoSegmentation(self.options.auto_segmentation)
		self.prepareSweeps()
		if self.options.debug:
			printOut( "Engine jobs:")
			pprint.pprint(self.sweeps)

	def writeParametrized(self, filename, extralines=[], skiptags=[], comments=[]):
		self.nec_file_input.writeParametrized(filename, extralines, skiptags, comments)

	def parseParameterValues(self, file):
		try:
			f = open(file,"rt")
			lines = f.readlines()
			f.close()
		except:
			raise
		if len(lines)<2: raise  InputError("invalid Parameters files")
		vars = lines[0].split()
		del lines[0]
		lines[0] = list(map(float, lines[0].split()))
		self.nec_file_input.updateVars(vars, lines[0])

	def parseAgt(self, output):
		factor = 1 if not self.nec_file_input.has_ground else 2
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
				agt = float(lines[i][testl+1:].strip().split()[0].lower())/factor
				if agt <=0 :
					raise ValueError("Invalid AGT value in output: %.4f"%agt)
				return agt
			i=i-1
		raise RuntimeError("Failed to parse AGT result")
		return 1
		
	def formatNumber(self, n, fixed_width=1):
		if type(n) == type(.1):
			if fixed_width:
				return "%.7f"%n
			else:
				res = "%.6g"%n
				ex = res.find('e')
				if ex == -1:
					ex = res.find('E')
					if ex != -1 and res.find('.',0,ex)==-1:
						res = res.replace('E','.e',1)
				else:
					if res.find('.',0,ex)==-1:
						res = res.replace('e','.e',1)
				return res
		else:
			return str(n)
	
	def formatName(self, n):
		return "%8s"%n

	def necInputLines(self, frequency, skipcards=["FR", "XQ", "RP", "EN"]):
		lines=[]
		math_lines = []
		comments = []
		self.nec_file_input.updateGlobalVars()
		varlines = self.nec_file_input.srclines
		comments = self.nec_file_input.comments
		fn = lambda x:self.formatNumber(x,0)
		ev = lambda x:self.nec_file_input.evalToken(x)
		segment_count = 0
		for li in range(len(varlines)):
			ln = varlines[li]
			comment = comments[li]
			if not ln: continue
			try:
				neccard = ln[0].strip().upper()
				if neccard not in  ["GW","GA","GH"]:
					if neccard  in skipcards:
						assert neccard not in ["GX","GM","GR","GR","SC","GC","NT","TL","LD"]
						continue
					try:
						sline = list(map( ev , ln[1:]))
						sline = map(fn, sline)
						lines.append(ln[0]+" "+" ".join(sline))
					except:
						lines.append(" ".join(ln))

					if neccard == "GX":
						i1 = int(ev(ln[1]))
						if self.wire_structure : self.wire_structure.mirrorStructure(math_lines,comments, i1, int(ln[2][0]), int(ln[2][1]), int(ln[2][2]))
						lines[-1]="GX %d %s"%(i1,ln[2])
					elif neccard == "GM":
						if len(ln) < 10:
							ln=ln+(10-len(ln))*[".0"]
						i1 = int(ev(ln[1]))
						i2 = int(ev(ln[2]))
						f3 = ev(ln[3])
						f4 = ev(ln[4])
						f5 = ev(ln[5])
						f6 = ev(ln[6])
						f7 = ev(ln[7])
						f8 = ev(ln[8])
						i9 = int(ev(ln[9]))
						if self.wire_structure : self.wire_structure.moveCopyStructure(math_lines,comments, i1, i2, f3, f4, f5, f6, f7, f8, i9)
						lines[-1]="GM %d %d %f %f %f %f %f %f %d"%(i1, i2, f3, f4, f5, f6, f7, f8, i9)
					elif neccard == "GR":
						i1 = int(ev(ln[1]))
						i2 = int(ev(ln[2]))
						if self.wire_structure : self.wire_structure.rotateStructure(math_lines,comments, i1, i2)
						lines[-1]="GR %d %d"%(i1, i2)
					elif neccard == "SP":
						i1 = int(ln[1])
						i2 = int(ev(ln[2]))
						lines[-1]="SP %d %d "%(i1, i2)+" ".join(list(map( fn, map( ev , ln[3:]))))
					elif neccard == "SM":
						i1 = int(ev(ln[1]))
						i2 = int(ev(ln[2]))
						lines[-1]="SM %d %d "%(i1, i2)+" ".join(list(map( fn, map( ev , ln[3:]))))
					elif neccard == "SC" or neccard == "GC":
						i1 = int(ln[1])
						i2 = int(ln[2])
						lines[-1]="%s %d %d "%(neccard, i1, i2)+" ".join(list(map( fn, map( ev , ln[3:]))))
					elif neccard == "NT" or neccard == "TL" :
						i1 = int(ln[1])
						i2 = int(ln[2])
						i3 = int(ln[3])
						i4 = int(ln[4])
						lines[-1]="%s %d %d %d %d "%(neccard, i1, i2, i3, i4)+" ".join(list(map( fn, map( ev , ln[5:]))))
					elif neccard == "LD":
						ldtype = int(ln[1].strip())
						if ldtype > 7:
							raise InputError("Loads (LD) of type > 7 are not know to this script")
						elif ldtype == 6:
							i2 = int(ev(ln[2]))
							i3 = int(ev(ln[3]))
							i4 = int(ev(ln[4]))
							Q = ev(ln[5])
							if not Q: Q = 100
							L = ev(ln[6])
							C = ev(ln[7])
							#printOut( "L=%f, Q=%f, freq=%f"%(L,Q,frequency))
							R = Q * 2 * necmath.pi * frequency * L * 1e+6
							lines[-1]="LD 1 %d %d %d %s %s %s "%(i2, i3, i4, fn(R), fn(L), fn(C))
						elif ldtype == 7:
							i2 = int(ev(ln[2]))
							i3 = int(ev(ln[3]))
							i4 = int(ev(ln[4]))
							R = ev(ln[6])
							diel = ev(ln[5])
							r = ev(self.nec_file_input.tag_data.tagRadius(i2, "LD"))
							#printOut( "tag=%d, R=%f, r=%f, diel=%f"%(i2,R,r,diel))
							L = 2e-7 * (diel * R/r)**(1.0/12) * (1 - 1/diel) * necmath.log(R/r)
							lines[-1]="LD 5 %d %d %d 0 %s "%(i2, i3, i4, fn(L))
						else:
							vals=[ln[1]]
							for i in range(2,len(ln)):
								if i < 5:
									vals.append(int(ev(ln[i])));
								else:
									vals.append(fn(ev(ln[i])));
							lines[-1]="LD " + ("{} "*len(vals)).format(*vals)
				else:
					sline = list(map( ev , ln[1:]))
					sline[0] =int(sline[0])
					sline[1] =int(sline[1])
					comments.append(comment)
					if self.nec_file_input.autosegment[0] and self.nec_file_input.tag_data.autoSegment(li):
						self.nec_file_input.autoSegment(ln[0], sline)
					if neccard == "GW":
						math_lines.append(sline)
					else:
						segment_count+=sline[1]
					sline = map(fn, sline)
					lines.append(ln[0]+" "+" ".join(sline))
			except Exception as e:
				raise EvalError("Failed to generate engine input. Reason:\n"+str(e)+"\nAround line:\n"+" ".join(ln))
			
		if self.wire_structure and self.options.validate_geometry: 
			if not self.wire_structure.testLineIntersections(math_lines):
				return []
		segment_count += sum(list(map(lambda x: x[1], math_lines)))
		return lines, segment_count

	def writeNecInput(self, filename, extralines=[], skipcards=[]):
		lines, segments = self.necInputLines(self.nec_file_input.frequency, skipcards)
		if not lines: return 0
		lines.extend(extralines)
		file = open(filename, "wt")
		try: 
			file.write("\n".join(lines)+"\n")
		finally: file.close()
		return segments

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
					lines.append("RP 0 1 %d 1000 90 %g 0 %g"%(int(360/self.nec_file_input.angle_step)+1, angles[i], self.nec_file_input.angle_step))
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
				if line[0:2]!="GN":
					lines.append(line)
				else:
					sl = line.split()
					if sl[1]!='-1':
						sl[1]="1"
						
					lines.append(" ".join(sl[0:2]))
			else:
				sl = line.split()
				if sl[1]=='5':
					continue
				sl[5]="0"
				lines.append(" ".join(sl))
		agt_freq = sweep.agt_freq
		lines.append("FR 0 0 0 0 %g 0"%agt_freq)
		step = self.nec_file_input.angle_step
		if step < 5 and self.options.forward:
			step = 5
		hcount = int(360/step)+1
		vcount = int(180/step)+1
		#lines.append("RP 0 %d %d 1001 -180 0  %g %g"%(vcount, hcount, step, step))
		lines.append("RP 0 %d %d 1001 -180 %g  %g %g"%(vcount, hcount, self.options.forward_dir, step, step))
		lines.append("XQ")
		lines.append("EN")
		return lines

	def handlePopen(self, popen):
		try:
			if self.process_monitor:
				self.process_monitor.addProcess(popen)
			popen.wait()
		finally:
			if self.process_monitor:
				self.process_monitor.removeProcess(popen)
	
	def runSweep(self, nec_input_lines, sweep, get_agt_scores, use_agt, id, number):
		#print "Get agt score = %d"%get_agt_scores
		#import tempfile as tmp
		import subprocess as sp
		import os
		wd = self.options.output
		try:
			os.mkdir(wd)
		except : pass
		wd = os.path.join(wd, "cwd")
		try:
			os.mkdir(wd)
		except : pass
		wd = os.path.join(wd, str(number))
		try:
			os.mkdir(wd)
		except : pass
		id=id+'_'+str(number)
		
		nec_input = "nec2_"+id+".inp"
		agt_input = nec_input[0:-3]+"agt"
		nec_output = nec_input[0:-3]+"out"
		exe_input = os.path.join(wd, nec_input[0:-3]+"cin")
		engine_nec_input=os.path.join("..","..",nec_input)
		engine_agt_input=os.path.join("..","..",agt_input)
		engine_nec_output=os.path.join("..","..",nec_output)
		nec_input=os.path.join(self.options.output,nec_input)
		agt_input=os.path.join(self.options.output,agt_input)
		nec_output=os.path.join(self.options.output,nec_output)

		nec_input_lines, segments = nec_input_lines

		file = open(nec_input, "wt") #".",
		fslines = self.freqSweepLines(nec_input_lines,sweep)
		if not fslines:
			return ()
		try: 
			file.write("\n".join(fslines)+"\n")
		finally: file.close()
		if (self.options.agt_correction or get_agt_scores) and (use_agt is None):
			file = open(agt_input, "wt") #".",
			try: 
				file.write("\n".join(self.agtLines(nec_input_lines,sweep))+"\n")
			finally: file.close()
		
		agt = 1.0
		engine = chooseEngine(self.options.engine, segments)
		if use_agt is not None:
			agt = use_agt
		elif self.options.agt_correction or get_agt_scores :
			if self.options.engine_takes_cmd_args:
				self.handlePopen(sp.Popen([engine, engine_agt_input, engine_nec_output], cwd=wd))
			else:
				try:
					f = open(exe_input,"wt")
					f.write(engine_agt_input)
					f.write("\n")
					f.write(engine_nec_output)
					f.write("\n")
					f.close()
					f = open(exe_input)
					self.handlePopen(sp.Popen(engine, stdin=f, stdout=open(os.devnull, "w"), cwd=wd))
				finally:
					f.close()
			agt = self.parseAgt(nec_output)
			if get_agt_scores:
				return (nec_output,agt)
		if self.options.engine_takes_cmd_args:
			self.handlePopen(sp.Popen([engine, engine_nec_input, engine_nec_output], cwd=wd))
		else:
			try:
				f = open(exe_input,"wt")
				f.write(engine_nec_input)
				f.write("\n")
				f.write(engine_nec_output)
				f.write("\n")
				f.close()
				f = open(exe_input)
				self.handlePopen(sp.Popen(engine, stdin=f, stdout=open(os.devnull, "w"), cwd=wd))
			finally:
				f.close()
		return (nec_output,agt)
		
	def runSweepT(self, nec_input_lines, sweep, number, result_map, result_lock, get_agt_scores, use_agt, id ):
		r = None
		try:
			ua = None
			if use_agt and number in use_agt:
				ua = use_agt[number]
			r = self.runSweep(nec_input_lines,sweep, get_agt_scores,ua, str(id), number)
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
			if not sweeps:
				 raise  InputError("No frequencies specified for evaluation")
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
			except InputError:
				raise
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
		except InputError:
			raise
		except:
			if not self.options.quiet: traceback.print_exc()
			return
		try:
			ua = None
			if use_agt and number in use_agt:
				ua = use_agt[number]
			r = self.runSweep(nec_input_lines,sweep, get_agt_scores,ua, str(id), number)
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


	def evaluate(self):
		NOP = NecOutputParser 
		results = self.runSweeps() #[[174,6,8],[470,6,40]]
		h={}
		v={}
		res = []
		res_lines = []
		printOut("Input file : %s"%self.options.input )
		printOut("Freq sweeps: %s"%str(self.options.sweeps) )
		if self.nec_file_input.autosegment[0]:
			printOut("Autosegmentation: %d per %g"%self.nec_file_input.autosegment)
		else:
			printOut("Autosegmentation: NO")
		printOut("\n")

		self.options.angle_step = self.nec_file_input.angle_step
		for r in range(len(results)):
			nop = NOP(results[r][0], results[r][2], self.options)
			if self.options.debug > 1:
				for f in nop.frequencies:
					printOut(f.horizontal)
			h.update(nop.horizontalPattern())
			v.update(nop.verticalPattern())
			res_lines = res_lines + nop.printFreqs(r==0)
			res = res+nop.getGainSWRChartData()

		if self.options.html:
#			if self.options.horizontal_gain:
			if not self.options.frequency_data:
				self.html_output.addHPattern(self.options.sweeps,h)
#			else:
#				self.html_output.addVPattern(v)
			self.html_output.addResults("\n".join(res_lines))
			self.html_output.addNec(self.nec_file_input.parametrizedLines())
			if not self.options.frequency_data:
				self.html_output.addGainChart(self.options.sweeps, res, self.options.char_impedance)
			self.html_output.writeToFile(self.options.input+".html", self.options.publish)
				


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
		self.add_option("-e", "--engine", metavar="NEC_ENGINE", default="", help="nec engine file name, default=%default")
		self.add_option("--engine-takes-cmd-args", default="auto", type="string", help="the nec engine takes command args, default=auto (which means no on windows yes otherwise). Other options are 'yes' or 'no'.")
		self.add_option("-d", "--min-wire-distance", default=.005, type="float", help="minimum surface-to-surface distance allowed between non-connecting wires, default=%default")
		self.add_option("--debug", default=0, type="int", help="turn on some logging")
		self.add_option("--validate-geometry", default=1, type="int", help="set to 0 to disable geometry validation")
		self.add_option("--forward-dir", default=0, type="int", help="the forward direction, by default is %default which means the antenna forward is along X.")
		self.add_option("--backward-dir", default=180, type="int", help="the backward direction (relative to --forward-dir) to which F/R and F/B are calculated. The default is %default which means the exact opposite of the forward-dir")
		self.add_option("--rear-angle", default=120, type="int", help="angle for calculating rear gain (max 270). default = %default")
		self.add_option("--beamwidth-ratio", default=3.01, type="float", help="ratio for calculating beam width in dB, default=%default")
		self.set_defaults(gain_type=1)
		self.add_option("--vertical-gain", action="store_const", const=0, dest="gain_type", help="calculate vertical gain ")
		self.add_option("--horizontal-gain", action="store_const", const=1, dest="gain_type", help="calculate horizontal gain [default]")
		self.add_option("--total-gain", action="store_const", const=2, dest="gain_type", help="calculate total gain")
		self.add_option("-f", "--frequency_data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
		self.add_option("--cleanup", default=180, type="int", help="IGNORED") #remove output files older than CLEANUP seconds. set to 0 to disable
	def parse_args(self, extra_args=[]):
		options, args = optparse.OptionParser.parse_args(self, sys.argv[1:]+extra_args)
		if options.rear_angle<0 or options.rear_angle>270: raise InputError("Invalid rear angle of %d"%options.rear_angle)
		options.frequency_data = eval(options.frequency_data)
		while '' in args:
			args.remove('')
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
			self.add_option("--param-values-file", default="params.txt", help="Read the parameter values from file, generate output.nec and evaluate it instead of the input file. The file should contain two lines: space separated parameter names on the first and space separated values on the second.")
			self.add_option("--agt-correction", default=1, type="int", help="ignored. agt correction is always applied")
			self.add_option("-c", "--centers", default=True, help="run sweep on the channel centers",action="store_false", dest="ends")
			self.add_option("--chart", default=0, action="store_true", help="IGNORED")
			self.add_option("--js-model", default=0, action="store_true", help="IGNORED")
			self.add_option("--html", default=1, type="int", help="output html file, set to 0 to disable")
			self.add_option("--publish", default=False, action="store_true", help="output html file using http://clients.teksavvy.com/~nickm for resources")
		def parse_args(self, extra_args=[]):
			options, args = OptionParser.parse_args(self,extra_args)
			class Calc: pass
			options.calc = Calc()
			options.calc.gain=1
			options.calc.f2b=1
			options.calc.f2r=1
			options.calc.beam_width=1
			options.quiet=0
			options.forward = 0
			options.verbose=0
			return (options, args)
	return MainOptionParser()


def run(nec_file_input,options):
	if not options.sweeps:
		if nec_file_input.sweeps:
			options.sweeps = list(nec_file_input.sweeps)
		else:
			options.sweeps = [(470,6,39)]
	if not options.ends:
		for i in range(len(options.sweeps)):
			if not options.sweeps[i][1]: continue
			options.sweeps[i] = (options.sweeps[i][0] - options.sweeps[i][1]/2, options.sweeps[i][1], options.sweeps[i][2]+1)

	nf = NecEvaluator(nec_file_input,options)
	nf.evaluate()

def main():
#default values
	try:
		options, inputs = optionParser().parse_args()
		nec_file_input = NecInputFile(options.input, options.debug)
		if  "EVAL" in nec_file_input.cmd_options:
			import shlex
			options, args = optionParser().parse_args(shlex.split(nec_file_input.cmd_options["EVAL"] ))
		run(nec_file_input, options)
	except InputError as e:
		printOut(e)
		return
	for inp in inputs:
		if inp[0]!="-":
			options.input = inp
			try:
				nec_file_input = NecInputFile(options.input, options.debug)
				if  "EVAL" in nec_file_input.cmd_options:
					import shlex
					options, args = optionParser().parse_args(shlex.split(nec_file_input.cmd_options["EVAL"] ))
				options.input = inp
				run(nec_file_input, options)
			except:
				traceback.print_exc()
				pass
	


if __name__ == "__main__":
		main()
