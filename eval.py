# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License

import math

output = "output"
input = "input.nec"
autosegmentation=10
ncores=4

	

class FrequencyData:
	def __init__(self, char_imp):
		self.freq = 0
		self.real = 0
		self.imag = 0
		self.gain = 0
		self.char_imp = char_imp
		self.angle = 0
	def swr(self):
		rc = math.sqrt( \
			(math.pow(self.real-self.char_imp,2)+math.pow(self.imag,2)) \
			/ (math.pow(self.real+self.char_imp,2)+math.pow(self.imag,2)) \
			)
		return (1+rc)/(1-rc)
	def valid(self):
		try: 
			self.swr()
			return 1
		except:
			return 0
	def net(self):
		tmp = 4*max(self.real,.0001)*self.char_imp/(math.pow(self.real+self.char_imp,2)+math.pow(self.imag,2))
		return self.gain+10*math.log10(tmp)
		
	def __str__(self):
		return "%d Mhz - raw(%f), net(%f), swr(%f), real(%f), imag(%f)"%(int(self.freq), self.gain, self.net(), self.swr(), self.real, self.imag)


class NecOutputParser:
	def __init__(self, output, char_imp = 300, angle_step = 5, frequency_angle_data={}):
		self.frequencies = []
		self.char_imp = char_imp
		self.frequency_angle_data=frequency_angle_data
		self.angle_step = angle_step
		if output:
			self.parse(output)

	def printFreqs(self, header=1):
		if not self.frequency_angle_data:
			if header: 
				print "%6s %7s %7s %7s %7s %7s"%("Freq", "RawGain", "NetGain", "SWR", "Real", "Imag")
				print "================================================"
			for i in self.frequencies:
				if not i.valid():
					print "%6.4g - invalid result"%i.freq
				else:
					print "%6.4g % 7.5g % 7.5g %7.5g %7.5g % 7.5g"%(int(i.freq), i.gain, i.net(),i.swr(), i.real, i.imag)
		else:
			if header: 
				print "%6s %7s %6s %7s %7s %7s %7s %7s %7s"%("Freq", "Target", "Angle", "RawGain", "NetGain", "SWR", "Real", "Imag", "Diff")
				print "======================================================"
			for i in self.frequencies:
				if not i.valid():
					print "%6.4g - invalid result"%i.freq
				else:
					target = self.frequency_angle_data[i.freq][1]
					print "%6.4g %6.2g %6.2g % 7.5g % 7.5g %7.5g %7.5g % 7.5g % 7.5g"%(int(i.freq), target, i.angle, i.gain, i.net(),i.swr(), i.real, i.imag, target-i.net())

	def parse(self, output):
		file = open(output, "rt")
		try : 
			lines = file.readlines()
		finally:
			file.close()
		i=0
		while i < len(lines):
			ln = lines[i].strip()
			if ln == "- - - - - - FREQUENCY - - - - - -":
				i = i+2
				freq = float(lines[i].strip()[10:-4])
				if not len(self.frequencies) or self.frequencies[-1].valid():
					self.frequencies.append(FrequencyData(self.char_imp))
				self.frequencies[-1].freq = freq
			elif ln == "- - - ANTENNA INPUT PARAMETERS - - -":
				i=i+4
				self.frequencies[-1].real = float(lines[i][60:72])
				self.frequencies[-1].imag = float(lines[i][72:84])
			elif ln =="- - - RADIATION PATTERNS - - -":
				i=i+5
				angle = 0
				freq = self.frequencies[-1].freq
				if freq in self.frequency_angle_data.keys():
					angle = self.frequency_angle_data[freq][0]
				while len(lines[i].strip()):
					ln = lines[i]
					theta = float(ln[0:8])
					phi = float(ln[8:17])
					if theta==90 and abs(phi-angle)<=self.angle_step*.5:
						self.frequencies[-1].gain = float(ln[28:36])
						self.frequencies[-1].angle = angle
						break
					i = i+1
			i = i+1
		if self.frequency_angle_data:
			freqs = []
			for f in self.frequencies:
				if f.freq in self.frequency_angle_data.keys():
					freqs.append(f)
			self.frequencies = freqs

class NecFileObject:
	def __init__(self, sourcefile=None, output="output", engine="nec2dxs1k5.exe"):
		self.vars = {}
		self.min_max = {}
		self.dependent_vars = []
		self.lines=[]
		self.varlines=[]
		self.paramlines={}
		self.source_tags={}
		self.autosegment=(0,0)
		self.frequency = 585
		self.output = output
		self.engine = engine
		self.sourcefile = sourcefile
		self.scale = 1
		self.angle_step = 5
		if sourcefile:
			self.readSource(sourcefile)

	def readSource(self, sourcefile):
		self.sourcefile = sourcefile
		file = open(sourcefile, "rt")
		try: self.lines = file.readlines()
		finally: file.close()
		if not self.lines: raise "Empty input file"
		self.parse()
	
	def parse(self):		
		self.vars = {}
		self.dependent_vars = []
		self.varlines=[]
		self.source_tags={}
		for i in xrange(len(self.lines)):
			ln = self.lines[i]
			comment = ln[ln.find("'")+1:]
			ln = ln[0:ln.find("'")].strip(' ')
			if ln[0:2]== "SY":
				try:
					d = {}
					exec(ln[3:].strip(), {}, d)
					self.vars.update(d)
					self.paramlines[d.keys()[0]]=i
					try:
						min, max = eval(comment)
						self.min_max[d.keys()[0]]=(float(min),float(max))
					except:
						pass
				except:
					self.dependent_vars.append(ln[3:].strip())
			else:
				self.varlines.append(ln.replace(',',' ').split())
				if ln[0:2]=="EX":
					self.source_tags[int(self.varlines[-1][2])]=(len(self.varlines)-1,i)
				elif ln[0:2] == "FR":
					self.frequency = float(self.varlines[-1][5])
				elif ln[0:2] == "GS":
					self.scale = float(self.varlines[-1][3])
				elif ln[0:2] == "RP":
					self.angle_Step = float(self.varlines[-1][8])

		for i in self.vars.keys():
			self.vars[i]=float(self.vars[i])

	def calcLength(self, line):
		return self.scale*math.sqrt(math.pow(line[2]-line[5],2)+math.pow(line[3]-line[6],2)+math.pow(line[4]-line[7],2))

	def autoSegment(self, line):
		nsegs = self.calcLength(line)*self.autosegment[0]/self.autosegment[1]
		line[1] = max(int(nsegs+.5),1)
		if line[0] in self.source_tags:
			line[1]=line[1]+2
			if line[1] % 2 == 0:
				line[1]=line[1]+1
			self.varlines[self.source_tags[line[0]][0]][3] = str(int(line[1]/2)+1)
			self.lines[self.source_tags[line[0]][1]] = " ".join(self.varlines[self.source_tags[line[0]][0]])
		

	def autoSegmentation(self, segs_per_halfwave=0, freq = None):
		if not freq: freq = self.frequency
		if not freq: freq = 585
		halfwave = 150.0/freq
		self.autosegment = (segs_per_halfwave, halfwave)
		
	def writeSource(self, filename):
		file = open(filename, "wt")
		try: file.writelines(self.lines)
		finally: file.close()
	
	def evalToken(self, x):
		return eval(x, math.__dict__,self.globals)

	def formatNumber(self, n):
		if type(n) == type(.1):
			return "%.7f"%n
		else:
			return str(n)
	
	def formatName(self, n):
		return "%8s"%n
	
	def writeNecInput(self, filename, extralines=[], skiptags=[]):
		lines=[]
		self.globals={}
		self.globals.update(self.vars)
		for d in self.dependent_vars:
			try: exec(d, math.__dict__, self.globals)
			except:
				print "failed parsing '%s'"%(d)
				raise
		for ln in self.varlines:
			if not ln: continue
			if ln[0].strip() != "GW":
				if ln[0] not in skiptags:
					lines.append(" ".join(ln))
			else:
				sline = map( self.evalToken , ln[1:])
				if self.autosegment[0]:
					self.autoSegment(sline)
				sline = map(self.formatNumber, sline)
				sline.insert(0, ln[0])
				lines.append(" ".join(sline))
		del self.globals
		lines.extend(extralines)
		file = open(filename, "wt")
		try: file.write("\n".join(lines))
		finally: file.close()
	def writeParametrized(self, filename, extralines=[], skiptags=[], comments=[]):
		lines=[]
		self.globals={}
		self.globals.update(self.vars)
		for v in self.vars.keys():
			lno = self.paramlines[v]
			if v in self.min_max.keys():
				self.lines[lno] = "SY %s=%.7g ' %g, %g" %(v, self.vars[v], self.min_max[v][0], self.min_max[v][1])
			else:
				self.lines[lno] = "SY %s=%.7g" %(v, self.vars[v])
		for d in self.dependent_vars:
			try: exec(d, math.__dict__, self.globals)
			except:
				print "failed parsing '%s'"%(d)
				raise
		has_comments = 0
		for ln in self.lines:
			sl = ln.replace(',',' ').split()
			if sl and sl[0].strip() == "CE":
				has_comments=1
			if not sl or not self.autosegment[0] or sl[0].strip() != "GW" : 
				lines.append(ln.strip())
				continue
			if sl[0].strip() == "GW":
				sline = map( self.evalToken , sl[1:])
				self.autoSegment(sline)
				sl[2] = str(sline[1])
				lines.append(" ".join(sl))

		del self.globals
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
	def writeFreqSweep(self, filename, sweep):
		lines = []
		#lines.append("FR 0 1 0 0 %g 0"%sweep[0])
		#lines.append("XQ")
		lines.append("FR 0 %d 0 0 %g %g"%(sweep[2],sweep[0],sweep[1]))
		lines.append("RP 0 1 73 1000 90 0 0 %d"%self.angle_step)
		lines.append("XQ")
		self.writeNecInput(filename, lines, ["FR", "XQ", "RP", "EN"])
	
	def runSweep(self, sweep, lock = None ):
		import tempfile as tmp
		import subprocess as sp
		import os
		try:
			os.mkdir(self.output)
		except: pass
		f, nec_input = tmp.mkstemp(".inp", "nec2", os.path.join(".",self.output) ,1)
		os.close(f)
		if lock:
			lock.acquire()
			try:
				self.writeFreqSweep(nec_input, sweep)
			finally:
				lock.release()
		else:
			self.writeFreqSweep(nec_input, sweep)
		f, nec_output = tmp.mkstemp(".out", "nec2", os.path.join(".",self.output) ,1)
		os.close(f)
		f, exe_input = tmp.mkstemp(".cin", "nec2", os.path.join(".",self.output) ,1)
		os.close(f)
		f = open(exe_input,"wt")
		f.write(nec_input)
		f.write("\n")
		f.write(nec_output)
		f.write("\n")
		f.close()
		f = open(exe_input)
		popen = sp.Popen(self.engine, stdin=f, stdout=open(os.devnull))
		popen.wait()
		f.close()
		return nec_output
		
	def runSweepT(self, sweep, number, result_map, result_lock ):
		r = self.runSweep(sweep, result_lock)
		result_lock.acquire()
		try: result_map[number]=r
		finally: result_lock.release()

	def runSweeps(self, sweeps, num_cores=1, cleanup=0):
		if cleanup:
			import os, time, stat
			try:
				ldir = os.listdir(self.output)
				n = time.time()
				for f in ldir:
					try:
						f = os.path.join(self.output,f)
						s = os.stat(f)
						if s[stat.ST_MTIME] + 180 < n:
							os.remove(f)
					except:
						pass
			except:
				pass

		total_freqs = 0
		for i in sweeps:
			total_freqs = total_freqs+i[2]
		if total_freqs < num_cores : 
			num_cores = max(total_freqs/2,1)
		freqs_per_core = total_freqs/num_cores
		cores_per_sweep = [0]*len(sweeps)
		while num_cores:
			for i in xrange(len(sweeps)):
				if cores_per_sweep[i]: continue
				if sweeps[i][2] < freqs_per_core:
					cores_per_sweep[i] =  1 
					total_freqs = total_freqs - sweeps[i][2]
					num_cores = num_cores-1
					if not num_cores: break
				else:
					cores_per_sweep[i] = 0 
		
			if not num_cores:
				for i in xrange(len(sweeps)):
					if cores_per_sweep[i]: continue
					cores_per_sweep[i] = 1
				break
			if freqs_per_core == total_freqs/num_cores:
				for i in xrange(len(sweeps)):
					if cores_per_sweep[i]: continue
					cores_per_sweep[i] =  int(sweeps[i][2]/freqs_per_core) 
				break
			freqs_per_core = total_freqs/num_cores

		
		results={}
		number=0
		from threading import Lock, Thread
		result_lock = Lock()
		threads = []
		for i in xrange(len(sweeps)):
			ncores = cores_per_sweep[i]
		
			sweep = sweeps[i]
			fps = sweep[2]/ncores
			for j in xrange(ncores):
				s = [sweep[0]+j*fps*sweep[1],sweep[1],fps]
				if j==ncores-1:
					s = [sweep[0]+j*fps*sweep[1],sweep[1],sweep[2]-j*fps]
				threads.append(Thread(target=self.runSweepT, args=(s, number,results, result_lock )))
				threads[-1].start()
				number = number+1

		for t in threads:
			t.join()

		r = []
		for i in xrange(len(results)):
			r.append(results[i])
		return r

	def evaluate(self, sweeps, char_impedance, num_cores=1, cleanup=0, frequency_data = {}):
		NOP = NecOutputParser 
		results = self.runSweeps(sorted(sweeps), num_cores, cleanup) #[[174,6,8],[470,6,40]]
		print "Input file : %s"%self.sourcefile 
		print "Freq sweeps: %s"%str(sweeps)
		if self.autosegment[0]:
			print "Autosegmentation: %d per %g"%self.autosegment
		else:
			"Autosegmentation: NO"
		print "\n"
	
		for r in range(len(results)):
			nop = NOP(results[r], char_impedance, self.angle_step, frequency_data)
			nop.printFreqs(r==0)


import optparse 
class OptionParser(optparse.OptionParser):
	def __init__(self):
		optparse.OptionParser.__init__(self)
		self.add_option("-o", "--output-dir", type="string", metavar="DIR", dest="output", default=output, help="output path [%default]")
		self.add_option("-i", "--input", type="string", metavar="NEC_FILE", dest="input", default="", help="input nec file")
		self.add_option("-s", "--sweep", type="string", metavar="SWEEP", action="append", dest="sweeps", help="adds a sweep range e.g. -s (174,6,8) for vhf-hi freqs")
		self.add_option("-C", "--char-impedance", type="float", metavar="IMPEDANCE", default=300.0)
		self.add_option("-u", "--uhf", "--uhf-52", action="append_const", dest="sweeps", const="(470,6,40)", help="adds a uhf (ch. 14-52) sweep")
		self.add_option("-U", "--uhf-69", action="append_const", dest="sweeps", const="(470,6,57)", help="adds a uhf (ch. 14-69) sweep")
		self.add_option("-V", "--vhf-hi", action="append_const", dest="sweeps", const="(174,6,8)", help="adds a vhf-hi (ch. 7-13) sweep")
		self.add_option("-v", "--vhf-lo", action="append_const", dest="sweeps", const="(54,6,6)", help="adds a vhf-lo (ch. 1-6) sweep")
		self.add_option("-n", "--num-cores", type="int", default=ncores, help="number of cores to be used, default=%default")
		self.add_option("-a", "--auto-segmentation", metavar="NUM_SEGMENTS", type="int", default=autosegmentation, help="autosegmentation level - set to 0 to turn autosegmentation off, default=%default")
		self.add_option("-e", "--engine", metavar="NEC_ENGINE", default="nec2dxs1k5.exe", help="nec engine file name, default=%default")
	def parse_args(self):
		options, args = optparse.OptionParser.parse_args(self)
		if options.input == "":
			if len(args):
				options.input=args[0]
				del args[0]
			else:
				options.input = input
		if options.sweeps:
			options.sweeps = map(eval,options.sweeps)
		return (options, args)

def optionParser():
	class MainOptionParser(OptionParser):
		def __init__(self):
			OptionParser.__init__(self)
			self.add_option("-c", "--centers", default=True, help="run sweep on the channel centers",action="store_false", dest="ends")
			self.add_option("-f", "--frequency_data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
		def parse_args(self):
			options, args = OptionParser.parse_args(self)
			options.frequency_data = eval(options.frequency_data)
			if not options.sweeps:
				options.sweeps = [(470,6,40)]
			if not options.ends:
				for i in range(len(options.sweeps)):
					if not options.sweeps[i][1]: continue
					options.sweeps[i] = (options.sweeps[i][0] - options.sweeps[i][1]/2, options.sweeps[i][1], options.sweeps[i][2]+1)
			return (options, args)
	return MainOptionParser()


def run(options):
	nf = NecFileObject(options.input, options.output, options.engine)
	nf.autoSegmentation(options.auto_segmentation)
	nf.evaluate(options.sweeps, options.char_impedance, options.num_cores, 0, options.frequency_data)

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
				pass
	


if __name__ == "__main__":
	main()
