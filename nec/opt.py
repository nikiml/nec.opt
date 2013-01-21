# Copyright 2010-2011 Nikolay Mladenov
# Distributed under GNU General Public License v3


import nec.differential_evolution as DE
import os, math,sys,traceback,time,random
from nec import eval as ne
from nec.print_out import printOut

class NecFileEvaluator:

	def parseInitialPopulation(self, file):
		try:
			f = open(file,"rt")
			lines = f.readlines()
			f.close()
		except:
			return ([],[])
		if not lines: return ([],[])
		start = 0
		for i in range(len(lines)):
			l = lines[i].split()
			if l and l[0].strip()=="Score":
				start=i
		del lines[0:start]
		vars = lines[0].split()
		del lines[0]
		for i in range(len(lines)):
			lines[i] =list( map(float, lines[i].split()))
		opt_vars = {}
		for i in range(len(vars)):
			opt_vars[vars[i]] = i

		population = []
		scores = []

		try:
			for line in lines:
				if not line:
					continue
				member = []
				for v in self.opt_vars:
					pos = opt_vars[v]
					member.append(line[pos])
				population.append(self.paramsBackTransform(member))
				if "Score" in opt_vars:
					scores.append(line[opt_vars["Score"]])
			return (population,scores)
		except:
			if not self.options.verbose: sys.stderr.write('\n')
			traceback.print_exc()
			raise


		
	def __init__(self, options):
			#.input, options.output,options.auto_segmentation, options.sweeps, options.target_levels,options.num_cores, options.log_file, options.target_function
		self.log = None
		self.options = options
		self.char_impedance = options.char_impedance
		self.nec_file = ne.NecFileObject(options)
		#print "calculate_gain set to: %d"%self.options.calc.gain
		
		self.opt_vars = []
		self.domain = []
		for k in self.nec_file.min_max.keys():
			if not self.options.parameters or k in self.options.parameters:
				self.opt_vars.append(k)
				self.domain.append(self.nec_file.min_max[k])
		self.n = len(self.opt_vars)
#		self.domain = self.n*[[-1,1]]
		self.enforce_domain_limits = True
		self.x = []
		self.best_score = 999.0
		for i in range(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.x.append(self.nec_file.vars[var])

		self.x = self.paramsBackTransform(self.x)
		if options.restart:
			self.initial_population, self.initial_scores = self.parseInitialPopulation(options.restart)
		else:
			self.initial_population = []
			self.initial_scores = []

		self.comments = [""]
		self.comments.append("Input file: "+options.input)
		self.comments.append("Sweep ranges: ")
		self.errors=1
		for i in range(len(self.options.sweeps)):
			self.comments.append("R%d = "%i + str(self.options.sweeps[i]))
			if not self.options.frequency_data:
				self.comments[-1]+=(" with target levels "+str(self.options.target_levels[i]))
		if self.options.frequency_data:
			self.comments.append(" Frequency angle/gain data: ")
			self.comments.append(str(self.options.frequency_data))
		self.comments.append("SWR target: %g"%self.options.swr_target)
		self.comments.append("Target function: %s"%self.options.target_function)
		if self.nec_file.autosegment[0]:
			printOut("Autosegmentation: %d per %g"%self.nec_file.autosegment)
			self.comments.append("Autosegmentation: %d per %g"%self.nec_file.autosegment)
		else:
			printOut("Autosegmentation: NO")
			self.comments.append("Autosegmentation: NO")
		printOut("\n")
		self.comments.append("")
		self.agt_score_threshold = .0
		self.agt_score_threshold_stat1 = .0
		self.agt_score_threshold_stat_count1 = 0
		self.agt_score_threshold_stat2 = .0
		self.agt_score_threshold_stat_count2 = 0
			

		if options.log_file:
			self.log = open(options.log_file,"at")
			self.log.write("============"*10+"\n")
			self.log.write("\n".join(self.comments))
			
			self.log.write("============"*10+"\n")

			range_scores = []
			for i in range(len(self.options.sweeps)):
				range_scores.append( "R%dmg"%i)
				range_scores.append( "R%dag"%i)
				range_scores.append( "R%dms"%i)
				range_scores.append( "R%das"%i)

			self.log.write(self.nec_file.formatName("Score")+"\t"+"\t".join(map(self.nec_file.formatName, sorted(self.opt_vars)))+"\t"+"\t".join(map(self.nec_file.formatName, range_scores))+"\n")
			self.log.flush()
		self.time = time.time()
		self.start_time = self.time

	def __del__(self):
		if self.log:
			self.log.close()

	def initialPopulation(self):
		return (list(self.initial_population),list(self.initial_scores))

	def targetLevel(self, rangeno, freqno):
		r = self.options.sweeps[rangeno]
		t = self.options.target_levels[rangeno]
		tlen = int(len(t)/2)
		if freqno < tlen:
			return t[freqno]
		if freqno >= r[2] - (len(t)-tlen):
			return t[freqno-r[2]]
		min = float(t[tlen-1])
		max = float(t[tlen])
		steps = r[2]-len(t)+1
		step = freqno-tlen+1
		return (step*max+(steps-step)*min)/steps

	def paramsTransform(self, vector):
		return list(vector)

	def paramsBackTransform(self, vector):
		res = list(vector)
		for i in range(len(res)):
			td = self.domain[i]
			if res[i] >td[1] : 
				res[i]=td[1]
			elif res[i] <td[0] : 
				res[i]=td[0]

		return res


	def freqID(self, freq, sweepid):
		i = sweepid
		r = self.options.sweeps[i]
		if freq >= r[0] and freq <=r[0]+r[1]*r[2]:
			return (i, int((freq-r[0])/r[1]))

		raise RuntimeError("frequence %.3f out of all ranges"%freq)

	def evaluateFinalSolution(self, interrupted=0):
		vector = self.paramsTransform(self.x)
		for i in range(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]
		fn = ("%.3f"%self.best_score)
		fn = fn.replace(".-","-")
		fn = fn.replace(".","_")
		fn = fn+".nec"
			
		self.nec_file.writeNecInput("final"+fn)
		self.nec_file.writeParametrized("output"+fn, comments = self.comments+["Score %g"%self.best_score,""])
		if interrupted: return
		self.nec_file.evaluate()
	
	def iterationCallback(self, iter_no, population, scores, improved):
		return
		if not self.log or not self.options.output_population: return
		self.log.write("-------------------------Population on Iteration # %d-------------------------\n"%iter_no)
		for i in range(len(population)):
			self.logParamVector(self.paramsTransform(population[i]), scores[i])
		self.log.write("--------------------------------------------------------------------------------\n")
		self.log.flush()

	def logParamVector(self, vector, score, range_results=None):
		if range_results:
			range_scores=[]
			for i in range(len(self.options.sweeps)):
				range_scores.append(range_results[i].max("gain_diff"))
				range_scores.append(range_results[i].aveLog("gain_diff"))
				range_scores.append(range_results[i].max("swr"))
				range_scores.append(range_results[i].ave("swr"))

			range_scores = "\t"+"\t".join(map(self.nec_file.formatNumber, range_scores))
				
		else:
			range_scores=""
		self.log.write(self.nec_file.formatNumber(score)+"\t"+"\t".join(map(self.nec_file.formatNumber, vector))+range_scores+"\n")
		self.log.flush()

	class Score:
		def __init__(self, score, agt_score):
			self.scores = (score, agt_score)
		def __lt__(self, other):
			return self.scores[0] < other.scores[0]
		def __gt__(self, other):
			return self.scores[0] > other.scores[0]
		def __float__(self):
			return self.scores[0]

	def targetFunctionIsStrictlyMax(self):
		return self.options.strict_max_target

	def testMemberAgainstScore(self, vector, score, id):
		#print "in testMemberAgainstScore: self.options.calc.gain = %d"%self.options.calc.gain
		if self.options.frequency_data and not self.targetFunctionIsStrictlyMax() or not self.options.calc.gain or self.options.noagt_correction:
			s = self.target_(vector,0,None, id)
			if s <= float(score):
				return NecFileEvaluator.Score(s,s)
			return None
		if self.agt_score_threshold == .0:
			self.agt_score_threshold = max(self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 )*1.1
			if self.options.debug: sys.stderr.write("debug: agt threshold = %.6g\n"%self.agt_score_threshold)
			self.agt_score_threshold_stat_count1 = 0
			self.agt_score_threshold_stat_count2 = 0
			self.agt_score_threshold_stat1 = 0
			self.agt_score_threshold_stat2 = 0
		s, agts = self.target_(vector, 1,None, id)
		if self.options.debug: sys.stderr.write("debug: agt score = %g\n"%s)
		if self.options.debug: sys.stderr.write("debug: agts = "+str(agts)+"\n")
		if self.options.debug: sys.stderr.write("debug: prev agt score = %g\n"%score.scores[1])
		if self.options.debug: sys.stderr.write("debug: prev  score = %g\n"%float(score))
		if self.targetFunctionIsStrictlyMax() and s > score.scores[0] or s > score.scores[1]+self.agt_score_threshold:
			if self.options.debug: sys.stderr.write("debug: Discarding(%d, %d, %.6g, %.6g)\n"%(self.agt_score_threshold_stat_count1, self.agt_score_threshold_stat_count2,self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))
			self.printLog(self.paramsTransform(vector), float(score)+1, None)
			return None
		sc = self.target_(vector, 0, agts, id)
		self.agt_score_threshold_stat_count2+=1
		self.agt_score_threshold_stat2=max(self.agt_score_threshold_stat2,s - score.scores[1] - sc + score.scores[0])
		if self.options.debug: sys.stderr.write("debug: real score = %g\n"%sc)
		if sc <= float(score): 
			self.agt_score_threshold_stat_count1+=1
			self.agt_score_threshold_stat1=max(self.agt_score_threshold_stat1,s - score.scores[1])
			if self.agt_score_threshold_stat_count1 > 20 and self.agt_score_threshold_stat_count2 > 100:
				self.agt_score_threshold_stat_count1 = 0
				self.agt_score_threshold_stat_count2 = 0
				self.agt_score_threshold = min(1, (max(self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))*1.1)
				self.agt_score_threshold_stat1 = 0
				self.agt_score_threshold_stat2 = 0
				if self.options.debug: 
					sys.stderr.write("new agt threshold = %.6g\n"%self.agt_score_threshold)
				if self.log:
					self.log.write("#new agt threshold = %.6g\n"%self.agt_score_threshold)

			return NecFileEvaluator.Score(sc,s)
		if self.options.debug: sys.stderr.write("debug: Discarding(%d, %d, %.6g, %.6g)\n"%(self.agt_score_threshold_stat_count1, self.agt_score_threshold_stat_count2,self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))
	def target(self, vector, id="id"):
		if self.options.frequency_data or not self.options.calc.gain or self.options.noagt_correction:
			s = self.target_(vector,0,None, id)
			return NecFileEvaluator.Score(s,s)
		s, agts = self.target_(vector, 1,None, id)
		if self.options.debug: sys.stderr.write("debug: agt score = %g\n"%s)
		if self.options.debug: sys.stderr.write("debug: agts = "+str(agts)+"\n")
		sc = self.target_(vector, 0, agts, id)
		if self.options.debug: sys.stderr.write("debug: real score = %g\n"%sc)
		if self.agt_score_threshold == .0:
			self.agt_score_threshold_stat2=max(self.agt_score_threshold_stat2, sc - s)
			if self.options.debug: sys.stderr.write("debug: expected agt threshold = %.6g\n"%self.agt_score_threshold_stat2)
		return NecFileEvaluator.Score(sc,s)

	def target_(self, vector, get_agt_score, use_agt,id ):
		class ExtensibleRangeResult:
			def __init__(self):
				self.data = {}
			def add(self, param, value):
				if param not in self.data:
					self.data[param]=[value]
				else:
					self.data[param].append(value)
			def max(self, param):
				if param not in self.data:
					return 1000
				return max(self.data[param])
			def min(self, param):
				if param not in self.data:
					return -1000
				return min(self.data[param])
			def ave(self, param):
				if param not in self.data:
					return 0
				return sum(self.data[param])/len(self.data[param])
			def aveLog(self, param): #for 10*log10 values like gain
				if param not in self.data:
					return 0
				return 10*math.log10(sum(map(lambda x : math.pow(10, x/10) , self.data[param]))/len(self.data[param]))
			def sum(self, param):
				if param not in self.data:
					return 0
				return sum(self.data[param])
			def sumPow(self, param): #for 10*log10 values like gain
				if param not in self.data:
					return 0
				return sum(map(lambda x : math.pow(10, x/10) , self.data[param]))
			def size(self, param):
				if param not in self.data:
					return 0
				return len(self.data[param])


		range_results = [] 
		for i in range(len(self.options.sweeps)): range_results.append(ExtensibleRangeResult())

		vector = self.paramsTransform(vector)
		for i in range(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]
		#print "in target_ : Get agt score = %d"%get_agt_score
		results = self.nec_file.runSweeps(get_agt_score, use_agt,id)
		res = -1000
		agts = {}
		if not results:
			if self.options.verbose: printOut( "writing erroneous file...")
			try:
				self.nec_file.writeParametrized("error%d.nec"%self.errors)
				if self.options.verbose: printOut("done")
			except:
				if self.options.verbose: printOut("failed")
		else:
			#agts = [1.0]*len(results)

			NOP = ne.NecOutputParser
			try:
				for r in results:
					nop = NOP(r[0], r[2],self.options)
					#print "output parsed"
					sweepid = r[1]
					agts[r[3]] = r[2]
					#print "Freqs # = %d"%len(nop.frequencies)
					for freq in nop.frequencies:
						freqid = self.freqID(freq.freq, sweepid)
						if self.options.frequency_data:
							tl = self.options.frequency_data[freq.freq][1]
						else:
							tl = self.targetLevel(freqid[0], freqid[1])
						if self.options.calc.gain:
							raw_gain = freq.forwardRaw(self.options.forward_dir)
						else:
							raw_gain = 0
						net = freq.net(raw_gain)
						gain_diff = tl-net
						range_results[freqid[0]].add("gain_diff", gain_diff)
						range_results[freqid[0]].add("net_gain", net)
						range_results[freqid[0]].add("raw_gain", raw_gain)
						swr = freq.swr()
						swr_diff = (swr - self.options.swr_target)
						range_results[freqid[0]].add("swr_diff", swr_diff)
						range_results[freqid[0]].add("swr", swr)
						if self.options.calc.f2r:
							rear = freq.rearGain(self.options.rear_angle, self.options.backward_dir) 
							if rear is None: 
								raise RuntimeError("Failed to calculated F/R")
						else:
							rear = 0
						if self.options.calc.beam_width:
							beam = freq.beamWidth(self.options.forward_dir, self.options.angle_step, self.options.beamwidth_ratio) 
							range_results[freqid[0]].add("beam_width", beam)
						#print "freq %g, target level %g, net %g, freqno %d, gaindiff %g, swrdiff %g"%(freq.freq, tl, freq.net(),freqid[0], gain_diff, swr_diff)
						f2r = (net-rear)
						f2r_diff = self.options.f2r_target-f2r
						range_results[freqid[0]].add("f2r_diff", f2r_diff)
						range_results[freqid[0]].add("f2r", f2r)
						if self.options.calc.f2b:
							back = freq.backwardGain(self.options.backward_dir) 
							if back is None: 
								raise RuntimeError("Failed to calculated F/B")
						else:
							back = 0
						range_results[freqid[0]].add("back", back)
						range_results[freqid[0]].add("rear", rear)
						f2b = (net-back)
						f2b_diff = self.options.f2b_target-f2b
						range_results[freqid[0]].add("f2b_diff", f2b_diff)
						range_results[freqid[0]].add("f2b", f2b)

						ml = raw_gain - net
						range_results[freqid[0]].add("ml", ml)
						range_results[freqid[0]].add("real", freq.real)
						range_results[freqid[0]].add("imag", freq.imag)
						range_results[freqid[0]].add("agt_correction", freq.agt)

#						range_results[freqid[0]].add(gain_diff, swr_diff, f2r_diff)
				import pprint
				if self.options.debug>1 : pprint.pprint(map(lambda x: x.data,range_results))
				d = {}
				freq_count=0
				log_keys = ["gain_diff", "net_gain", "raw_gain", "f2r_diff", "f2r", "f2b_diff", "back", "rear", "ml"]
				all_keys = []
				for result in range_results:
					c = 0
					for k in result.data.keys():
						if k not in all_keys: all_keys.append(k)
						if k in log_keys:
							x = math.pow(10, result.max(k)/10)
							n = math.pow(10, result.min(k)/10)
							s = result.sumPow(k)
						else:
							x = result.max(k)
							n = result.min(k)
							s = result.sum(k)
						c = result.size(k)
						a = s/c
						if "max_"+k not in d:
							d["max_"+k] = x
							d["ave_max_"+k] = x
							d["max_ave_"+k] = a
							d["ave_"+k] = s
							d["min_"+k] = n
							d["ave_min_"+k] = n
							d["min_ave_"+k] = a
							d["ave_ave_"+k] = a
						else:
							d["max_"+k] = max(x,d["max_"+k])
							d["ave_max_"+k] += x
							d["max_ave_"+k] = max(a,d["max_ave_"+k])
							d["ave_"+k] += s
							d["min_"+k] = min(n,d["min_"+k])
							d["ave_min_"+k] += n
							d["min_ave_"+k] = min(a,d["min_ave_"+k])
							d["ave_ave_"+k] += a
					freq_count = freq_count + c

				for k in all_keys:
					ns = len(self.options.sweeps)
					if k in log_keys:
						d["max_"+k] = 10*math.log10(d["max_"+k])
						d["ave_max_"+k] = 10*math.log10(d["ave_max_"+k]/ns)
						d["max_ave_"+k] = 10*math.log10(d["max_ave_"+k])
						d["ave_"+k] = 10*math.log10(d["ave_"+k]/freq_count)
						d["min_"+k] = 10*math.log10(d["min_"+k])
						d["ave_min_"+k] = 10*math.log10(d["ave_min_"+k]/ns)
						d["min_ave_"+k] = 10*math.log10(d["min_ave_"+k])
						d["ave_ave_"+k] = 10*math.log10(d["ave_ave_"+k]/ns)
					else:
						d["ave_max_"+k] /= ns
						d["ave_"+k] /= freq_count
						d["ave_min_"+k] /= ns
						d["ave_ave_"+k] /= ns

	
				if self.options.debug > 1 : pprint.pprint(d)
				d.update(self.nec_file.globals)
				res = eval(self.options.target_function, d)
	
			except:
				if not self.options.verbose: sys.stderr.write('\n')
				traceback.print_exc()
				res = -1000
		if res == -1000:
			res = 1000.0

		if get_agt_score:
			return (res,agts)
		self.printLog(vector, res,range_results)
		return res

	def printLog(self, vector, res,range_results):
		z = sorted(zip(self.opt_vars,vector))
		sorted_vars = [x[0] for x in z]
		sorted_vect = [x[1] for x in z]

		if self.options.verbose:
			printOut( "\t".join(map(self.nec_file.formatName, sorted_vars)))
			printOut( "\t".join(map(self.nec_file.formatNumber, sorted_vect)))
			printOut( res )
			printOut( "\n" )
		elif not self.options.quiet:
			sys.stdout.write('.')
			sys.stdout.flush()
		if self.log:
			self.logParamVector(sorted_vect,res, range_results)
			self.log.flush()
#			self.log.write(self.nec_file.formatNumber(res)+"\t"+"\t".join(map(self.nec_file.formatNumber, vector))+"\n")

		if res < self.best_score:
			self.best_score = res
			if self.options.output_best:
				fn = ("best%.3f"%res)
				fn = fn.replace(".-","-")
				fn = fn.replace(".","_")
				fn = fn+".nec"
				self.nec_file.writeParametrized(fn, comments = self.comments+["Score %g"%res,""])
			if self.options.quiet :
				printOut("Best score : %.5f"%res)
			elif self.options.local_search and not self.options.verbose:
				printOut("\nBest score : %.5f"%res)

	def print_status(self, minv, meanv, vector, count,improved):
		t = time.time()
		t-=self.time
		self.time+=t
		if self.log:
			self.log.write("#Total time %d sec., Iteration time %d sec.\n"%(int(self.time-self.start_time), t))
		if self.options.quiet: return
		vector = self.paramsTransform(vector)
		z = sorted(zip(self.opt_vars,vector))
		sorted_vars = [x[0] for x in z]
		sorted_vect = [x[1] for x in z]
		if self.options.verbose:printOut("=====================================================================")
		else: sys.stdout.write('\n')
		if not improved: printOut( "% 5s. Min score %g, Mean score %g, IterTime(%d sec)"%(str(count), minv, meanv, int(t)) )
		else : printOut( "% 5s. Min score %g, Mean score %g, Improved %d members, IterTime(%d sec)"%(str(count), minv, meanv, improved, int(t)))
		if self.options.verbose:printOut( "\t".join(map(self.nec_file.formatName, sorted_vars)) )
		if self.options.verbose:printOut( "\t".join(map(self.nec_file.formatNumber, sorted_vect)) )
		if self.options.verbose:printOut( "=====================================================================" )


def optionsParser():
	class MainOptionParser(ne.OptionParser):
		def __init__(self):
			ne.OptionParser.__init__(self)
			self.add_option("--noagt-correction", default=False, action="store_true")
			self.add_option("-l", "--log-file", default="opt.log",metavar="FILE", help="log file. The default is %default.")
			self.add_option("-S", "--seed-with-input", default=False, action="store_true", help="use the input file as one of the population members")
			self.add_option("-t", "--target-level", dest="target_levels", default=[], metavar="TARGET_LEVEL", action="append", type="string", help="appends target level(s) for a sweep, the number of target levels must match the number of sweeps and they are paired positionally. Examples1: -s (174,6,8) -t (8,9) means target levels linearly increasing from 8 to 9 for the frequencies from 174 to 216. Example2: -s (174,6,8) -t (8, 8.5, 9.5, 9) means target levels of 8 for 174, 9 for 216 and gradually increasing levels from 8.5 to 9.5 for the range 180 to 210")
			self.add_option("-M", "--max-iter", default=10000, type="int", help="The default is %default. The script can be interrupted with Ctrl+C at any time and it will output its current best result as 'output.nec'")
			self.add_option("-L", "--local-search", action="store_true", default = False)
			self.add_option("-T", "--local-search-tolerance", default = .0001, type="float")
			self.add_option("-F", "--target-function", default = "max(max_gain_diff, max_swr_diff)", type='string', help="An expression composed of statistical tokens and any of the nec file parameters, by default it is '%default'. All statistical tokes are of the form min_\"value\", max_\"value\", ave_\"value\", min_ave_\"value\", max_ave_\"value\", ave_min_\"value\" and ave_max_\"value\", where \"value\" is one of the following: gain_diff, swr_diff, f2r_diff, f2b_diff, net_gain, raw_gain, ml, swr, agt_correction, f2r, f2b, real and  imag.")
			self.add_option( "--swr-target", default = 2.0, type='float', help="the default value is %default")
			self.add_option( "--f2r-target", default = 15.0, type='float', help="the default value is %default")
			self.add_option( "--f2b-target", default = 15.0, type='float', help="the default value is %default")
#			self.add_option( "--desqi", default = False, action="store_true")
#			self.add_option( "--nmde", default = False, action="store_true")
			self.add_option( "--de-dither", default = .1, type="float")
			self.add_option( "--de-f", default = 0.55, type="float", help="The DE's differential parameter. Should be >.5, the default is %default")
			self.add_option( "--de-cr", default = .9, type="float", help = "The DE's crossover parameter, the default is %default")
			self.add_option( "--de-np", default = 50, type="int", help="The DE's population size parameter. The literature recommends to use 10*(optimization_parameters). The defaults is %default")
			self.add_option("-P", "--output-population", default = False, action="store_true", help="output the full population in the log file after every iteration.")
			self.add_option("-b", "--output-best", default = -1, help="set to 0 or 1 to output the best score nec file as 'best.nec'. Default is -1 (output if not in local search)." )
			self.add_option("-p", "--parameters", default = "", help="If not empty restrict the list of optimization parameters to this list." )
			self.add_option("-r", "--restart", default = "", metavar="RESTART_FILE", help="restart from population saved in a file." )
			self.add_option("--omni", default=0, action="store_true", help="parse all horizontal angles")
			self.add_option("--quiet", default=False, action="store_true", help="diable all output but errors")
			self.add_option("--verbose", default=False, action="store_true", help="enables extra output")
			self.add_option("--strict-max-target", default=False, action="store_true", help="use if your taget function has no averaging i.e. if the result for a single frequency can be used to declare a model as worse in comperison with the score of another model. The default target function max(max_swr_diff,max_gain_diff) is an example of such function. Setting this option will speed up the optimization, but it has to be used correctly.")
			self.add_option("--profile", default=False, action="store_true")

			
		def parse_args(self):
			options, args = ne.OptionParser.parse_args(self)
			if options.target_levels: options.target_levels = list(map(eval, options.target_levels))
			options.parameters = options.parameters.replace(',',' ').split()
			if options.output_population :
				sys.stderr.write("WARNING: --output-population is IGNORED.\n")
				options.output_population = False
			if options.quiet and options.verbose:
				sys.stderr.write("WARNING: Both quite and verbose mode specified. Will use verbose.\n")
				options.quiet = False
			if options.parameters:
				if not options.quiet: printOut( "Parameters restricted to "+str(options.parameters) )
			if options.output_best == -1:
				if options.local_search: options.output_best = 0
				else: options.output_best = 1
				printOut( "Output best set to: %d" % options.output_best)
			options.html=""

			if  len(options.sweeps)!=len(options.target_levels) and not options.frequency_data:
				raise RuntimeError("The number of sweep ranges is not matching the number of target options")
			if not options.sweeps:
				options.sweeps = [(470,6,40)]
				options.target_levels = [(10.,10.)]
				options.target_function = "max_gain_diff"
				sys.stderr.write("WARNING: No sweeps parameters specified\n")
			class Calc: pass
			options.calc = Calc()
			options.calc.beam_width = (options.target_function.find("beam_width")!=-1)
			options.calc.f2r = (options.target_function.find("f2r")!=-1)
			options.calc.f2b = (options.target_function.find("f2b")!=-1)
			options.calc.gain = (options.target_function.find("gain")!=-1) or options.calc.f2r or options.calc.f2b or options.calc.beam_width
			options.forward = not (options.calc.f2b or options.calc.f2r or options.omni or options.frequency_data or options.calc.beam_width)
			if not options.quiet: 
				printOut( "Sweeps set to:" )
				printOut( options.sweeps)
			if not options.quiet: 
				printOut("Target levels set to:")
				printOut( options.target_levels)
			if not options.quiet: printOut( "SWR target level set to: %g:"% options.swr_target)
			if options.calc.f2r : 
				if not options.quiet: printOut( "F/R target level set to: %g:"% options.f2r_target )
			if options.calc.f2b : 
				if not options.quiet: printOut( "F/B target level set to: %g:"% options.f2b_target )
			if not options.quiet: printOut( "Target function set to \"%s\"" % options.target_function )
			if not options.quiet: 
				if not options.noagt_correction:
					printOut( "use-agt-correction set to 1")
				else:
					printOut( "use-agt-correction set to 0")

			return (options,args)

	return MainOptionParser()


def optimize(options):
	evaluator = NecFileEvaluator(options)
	ins_sol_vec = None
	if options.seed_with_input:
		ins_sol_vec = evaluator.x
	try:
		if not options.local_search:
			de_plugin = None
			#if options.desqi:
			#	de_plugin = DE.DESQIPlugin()
			optimiser = DE.differential_evolution_optimizer(evaluator, population_size = options.de_np, f = options.de_f, cr = options.de_cr, show_progress=1, insert_solution_vector=ins_sol_vec, max_iter=options.max_iter, dither=options.de_dither)
		else:
			from nec import simplex
			if not options.quiet: printOut( "N=%d"%len(evaluator.x))
			evaluator.x = simplex.fmin(evaluator, ftol=options.local_search_tolerance, xtol=options.local_search_tolerance, maxfun=options.max_iter)
		#evaluator.nec_file.writeNecInput("final.nec")
		evaluator.evaluateFinalSolution()
	except KeyboardInterrupt:
		evaluator.evaluateFinalSolution(1)

def main():
	random.seed()
	options, args = optionsParser().parse_args()
	options.agt_correction = not options.noagt_correction
	if options.profile:
		import cProfile
		cProfile.runctx('optimize(options)',globals(), locals())
	else:
		optimize(options)


if __name__ == "__main__": 
	main()
