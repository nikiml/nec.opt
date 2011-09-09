# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License


import differential_evolution as DE
import os, math,sys,traceback
from nec import eval as ne

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
		for i in xrange(len(lines)):
			l = lines[i].split()
			if l and l[0].strip()=="Score":
				start=i
		del lines[0:start]
		vars = lines[0].split()
		del lines[0]
		for i in range(len(lines)):
			lines[i] = map(float, lines[i].split())
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
				population.append(self.atanhTransform(member))
				if "Score" in opt_vars:
					scores.append(line[opt_vars["Score"]])
			return (population,scores)
		except:
			if not self.verbose: sys.stderr.write('\n')
			traceback.print_exc()
			raise


		
	def __init__(self, options):
			#.input, options.output,options.auto_segmentation, options.sweeps, options.target_levels,options.num_cores, options.log_file, options.target_function
		self.log = None
		self.target_function = options.target_function
		self.char_impedance = options.char_impedance
		self.nec_file = ne.NecFileObject(options)
		self.nec_file.calc_gain = (self.target_function.find("gain")!=-1) or (self.target_function.find("f2r")!=-1 or (self.target_function.find("f2b")!=-1))
		#print "calculate_gain set to: %d"%self.nec_file.calc_gain
		self.nec_file.autoSegmentation(options.auto_segmentation)
		self.output_population = options.output_population
		self.output_best = options.output_best
		self.parameters = options.parameters
		
		self.omni= options.omni
		self.rear_angle= options.rear_angle

		self.ranges = options.sweeps
		self.target_levels = options.target_levels
		self.swr_target = options.swr_target
		self.f2r_target = options.f2r_target
		self.f2b_target = options.f2b_target
		self.quiet = options.quiet
		self.verbose = options.verbose
		self.opt_vars = []
		self.tanh_domain = []
		try:
			self.debug = options.debug
		except AttributeError:
			self.debug = 0
		for k in self.nec_file.min_max.keys():
			if not self.parameters or k in self.parameters:
				self.opt_vars.append(k)
				self.tanh_domain.append(self.nec_file.min_max[k])
		self.n = len(self.opt_vars)
		self.domain = self.n*[[-1,1]]
		self.x = []
		self.best_score = 999.0
		self.frequency_data = options.frequency_data
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.x.append(self.nec_file.vars[var])

		self.x = self.atanhTransform(self.x)
		if options.restart:
			self.initial_population, self.initial_scores = self.parseInitialPopulation(options.restart)
		else:
			self.initial_population = []
			self.initial_scores = []

		self.ncores = options.num_cores
		self.comments = [""]
		self.comments.append("Input file: "+options.input)
		self.comments.append("Sweep ranges: ")
		self.errors=1
		for i in range(len(self.ranges)):
			self.comments.append("R%d = "%i + str(self.ranges[i]))
			if not self.frequency_data:
				self.comments[-1]+=(" with target levels "+str(self.target_levels[i]))
		if self.frequency_data:
			self.comments.append(" Frequency angle/gain data: ")
			self.comments.append(str(self.frequency_data))
		self.comments.append("SWR target: %g"%self.swr_target)
		self.comments.append("Target function: %s"%self.target_function)
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
			for i in range(len(self.ranges)):
				range_scores.append( "R%dmg"%i)
				range_scores.append( "R%dag"%i)
				range_scores.append( "R%dms"%i)
				range_scores.append( "R%das"%i)

			self.log.write(self.nec_file.formatName("Score")+"\t"+"\t".join(map(self.nec_file.formatName, sorted(self.opt_vars)))+"\t"+"\t".join(map(self.nec_file.formatName, range_scores))+"\n")
			self.log.flush()

	def __del__(self):
		if self.log:
			self.log.close()

	def initialPopulation(self):
		return (list(self.initial_population),list(self.initial_scores))

	def targetLevel(self, rangeno, freqno):
		r = self.ranges[rangeno]
		t = self.target_levels[rangeno]
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

	def tanhTransform(self, vector):
#		print "Vector:"
#		print list(vector)
		res = map(math.tanh, vector)

#		print "tanh :"
#		print res
		for i in xrange(len(res)):
			td = self.tanh_domain[i]
			scale = (td[1]-td[0])/2.0
			offset = (td[1]+td[0])/2.0
			res[i]= res[i]*scale+offset
#		print "Transformed to:"
#		print res
		return res

	def atanhTransform(self, vector):
		res = list(vector)
		for i in xrange(len(res)):
			td = self.tanh_domain[i]
			scale = (td[1]-td[0])/2.0
			offset = (td[1]+td[0])/2.0
			res[i]= (res[i]-offset)/scale
			if res[i] >=1 : res[i]=.9999999
			elif res[i] <=-1 : res[i]=-.9999999

		return map(math.atanh, res)

	def freqID(self, freq, sweepid):
#		for i in range(len(self.ranges)):
		i = sweepid
		r = self.ranges[i]
		if freq >= r[0] and freq <=r[0]+r[1]*r[2]:
			return (i, int((freq-r[0])/r[1]))

		raise RuntimeError("frequence %.3f out of all ranges"%freq)

	def evaluateFinalSolution(self, interrupted=0):
		vector = self.tanhTransform(self.x)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]
		self.nec_file.writeNecInput("final.nec")
		self.nec_file.writeParametrized("output.nec", comments = self.comments+["Score %g"%self.best_score,""])
		if interrupted: return
		self.nec_file.evaluate(self.ranges, self.char_impedance, self.ncores,cleanup=1)
	
	def iterationCallback(self, iter_no, population, scores, improved):
		if not self.log or not self.output_population: return
		self.log.write("-------------------------Population on Iteration # %d-------------------------\n"%iter_no)
		for i in range(len(population)):
			self.logParamVector(self.tanhTransform(population[i]), scores[i])
		self.log.write("--------------------------------------------------------------------------------\n")
		self.log.flush()

	def logParamVector(self, vector, score, range_results=None):
		if range_results:
			range_scores=[]
			for i in range(len(self.ranges)):
				range_scores.append(range_results[i].max("gain_diff"))
				range_scores.append(range_results[i].ave("gain_diff"))
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

	def testMemberAgainstScore(self, vector, score):
		#print "in testMemberAgainstScore: self.nec_file.calc_gain = %d"%self.nec_file.calc_gain
		if self.frequency_data or not self.nec_file.calc_gain:
			s = self.target_(vector,0,None)
			if s < float(score):
				return NecFileEvaluator.Score(s,s)
			return None
		if self.agt_score_threshold == .0:
			self.agt_score_threshold = max(self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 )*1.1
			if self.debug: sys.stderr.write("debug: agt threshold = %.6g\n"%self.agt_score_threshold)
			self.agt_score_threshold_stat_count1 = 0
			self.agt_score_threshold_stat_count2 = 0
			self.agt_score_threshold_stat1 = 0
			self.agt_score_threshold_stat2 = 0
		s, agts = self.target_(vector, 1,None)
		if self.debug: sys.stderr.write("debug: agt score = %g\n"%s)
		if self.debug: sys.stderr.write("debug: agts = "+str(agts)+"\n")
		if self.debug: sys.stderr.write("debug: prev agt score = %g\n"%score.scores[1])
		if s > score.scores[1]+self.agt_score_threshold:
			if self.debug: sys.stderr.write("debug: Discarding(%d, %d, %.6g, %.6g)\n"%(self.agt_score_threshold_stat_count1, self.agt_score_threshold_stat_count2,self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))
			self.printLog(self.tanhTransform(vector), float(score)+1, None)
			return None
		sc = self.target_(vector, 0, agts)
		self.agt_score_threshold_stat_count2+=1
		self.agt_score_threshold_stat2=max(self.agt_score_threshold_stat2,s - score.scores[1] - sc + score.scores[0])
		if self.debug: sys.stderr.write("debug: real score = %g\n"%sc)
		if self.debug: sys.stderr.write("debug: prev  score = %g\n"%float(score))
		if sc < float(score): 
			self.agt_score_threshold_stat_count1+=1
			self.agt_score_threshold_stat1=max(self.agt_score_threshold_stat1,s - score.scores[1])
			if self.agt_score_threshold_stat_count1 > 20 and self.agt_score_threshold_stat_count2 > 100:
				self.agt_score_threshold_stat_count1 = 0
				self.agt_score_threshold_stat_count2 = 0
				self.agt_score_threshold = min(1, (max(self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))*1.1)
				self.agt_score_threshold_stat1 = 0
				self.agt_score_threshold_stat2 = 0
				if self.debug: print "new agt threshold = %.6g"%self.agt_score_threshold

			return NecFileEvaluator.Score(sc,s)
		if self.debug: sys.stderr.write("debug: Discarding(%d, %d, %.6g, %.6g)\n"%(self.agt_score_threshold_stat_count1, self.agt_score_threshold_stat_count2,self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))
	def target(self, vector):
		if self.frequency_data or not self.nec_file.calc_gain:
			s = self.target_(vector,0,None)
			return NecFileEvaluator.Score(s,s)
		s, agts = self.target_(vector, 1,None)
		if self.debug: sys.stderr.write("debug: agt score = %g\n"%s)
		if self.debug: sys.stderr.write("debug: agts = "+str(agts)+"\n")
		sc = self.target_(vector, 0, agts)
		if self.debug: sys.stderr.write("debug: real score = %g\n"%sc)
		if self.agt_score_threshold == .0:
			self.agt_score_threshold_stat2=max(self.agt_score_threshold_stat2, sc - s)
			if self.debug: sys.stderr.write("debug: expected agt threshold = %.6g\n"%self.agt_score_threshold_stat2)
		return NecFileEvaluator.Score(sc,s)

	def target_(self, vector, get_agt_score, use_agt ):
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

		range_results = [] 
		for i in range(len(self.ranges)): range_results.append(ExtensibleRangeResult())

		vector = self.tanhTransform(vector)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]

		#print "in target_ : Get agt score = %d"%get_agt_score
		results = self.nec_file.runSweeps(self.ranges,self.frequency_data, self.ncores, 1,get_agt_score, use_agt)
		res = -1000
		agts = {}
		if not results:
			if self.verbose: print "writing erroneous file..."
			try:
				self.nec_file.writeParametrized("error%d.nec"%self.errors)
				if self.verbose: print "done"
			except:
				if self.verbose: print "failed"
		else:
			#agts = [1.0]*len(results)

			NOP = ne.NecOutputParser
			try:
				for r in results:
					nop = NOP(r[0], r[2], self.char_impedance, self.nec_file.angle_step, self.frequency_data,self.omni)
					#print "output parsed"
					sweepid = r[1]
					agts[r[3]] = r[2]
					#print "Freqs # = %d"%len(nop.frequencies)
					for freq in nop.frequencies:
						freqid = self.freqID(freq.freq, sweepid)
						if self.frequency_data:
							tl = self.frequency_data[freq.freq][1]
						else:
							tl = self.targetLevel(freqid[0], freqid[1])
						net = freq.net()
						gain_diff = tl-net
						range_results[freqid[0]].add("gain_diff", gain_diff)
						range_results[freqid[0]].add("net_gain", net)
						range_results[freqid[0]].add("raw_gain", freq.gain)
						swr = freq.swr()
						swr_diff = (swr - self.swr_target)
						range_results[freqid[0]].add("swr_diff", swr_diff)
						range_results[freqid[0]].add("swr", swr)
						rear = freq.rearGain(self.rear_angle) #[freq.horizontalNet(phi) for phi in freq.horizontal.keys() if phi>=180-self.rear_angle/2 and  phi<=180+self.rear_angle/2]
						if rear is None: rear = 0
						#print "freq %g, target level %g, net %g, freqno %d, gaindiff %g, swrdiff %g"%(freq.freq, tl, freq.net(),freqid[0], gain_diff, swr_diff)
						f2r = (net-rear)
						f2r_diff = self.f2r_target-f2r
						range_results[freqid[0]].add("f2r_diff", f2r_diff)
						range_results[freqid[0]].add("f2r", f2r)
						back = freq.rearGain(.002) 
						if back is None: back = 0
						f2b = (net-back)
						f2b_diff = self.f2b_target-f2b
						range_results[freqid[0]].add("f2b_diff", f2b_diff)
						range_results[freqid[0]].add("f2b", f2b)

						ml = freq.gain - net
						range_results[freqid[0]].add("ml", ml)
						range_results[freqid[0]].add("real", freq.real)
						range_results[freqid[0]].add("imag", freq.imag)
						range_results[freqid[0]].add("agt_correction", freq.agt)

#						range_results[freqid[0]].add(gain_diff, swr_diff, f2r_diff)
				import pprint
				d = {}
				freq_count=0
				for result in range_results:
					c = 0
					for k in result.data.keys():
						x = max(result.data[k])
						n = min(result.data[k])
						s = sum(result.data[k])
						c = len(result.data[k])
						a = s/c
						if "max_"+k not in d:
							d["max_"+k] = x
							d["ave_max_"+k] = x
							d["max_ave_"+k] = a
							d["ave_"+k] = s
							d["min_"+k] = n
							d["ave_min_"+k] = n
							d["min_ave_"+k] = a
						else:
							d["max_"+k] = max(x,d["max_"+k])
							d["ave_max_"+k] += x
							d["max_ave_"+k] = max(a,d["max_ave_"+k])
							d["ave_"+k] += s
							d["min_"+k] = min(n,d["min_"+k])
							d["ave_min_"+k] += n
							d["min_ave_"+k] = min(a,d["min_ave_"+k])
					freq_count = freq_count + c

				for k in d.keys():
					if k[:7]=="ave_max": d[k]/=len(self.ranges)
					elif k[:7]=="ave_min": d[k]/=len(self.ranges)
					elif k[:3]=="ave": d[k]/=freq_count

	
				#pprint.pprint(d)
				d.update(self.nec_file.globals)
				res = eval(self.target_function, d)
	
			except:
				if not self.verbose: sys.stderr.write('\n')
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

		if self.verbose:
			print "\t".join(map(self.nec_file.formatName, sorted_vars))
			print "\t".join(map(self.nec_file.formatNumber, sorted_vect))
			print res
			print "\n"
		elif not self.quiet:
			sys.stdout.write('.')
		if self.log:
			self.logParamVector(sorted_vect,res, range_results)
			self.log.flush()
#			self.log.write(self.nec_file.formatNumber(res)+"\t"+"\t".join(map(self.nec_file.formatNumber, vector))+"\n")

		if res < self.best_score:
			self.best_score = res
			if self.output_best:
				fn = ("best%.3f"%res)
				fn = fn.replace(".-","-")
				fn = fn.replace(".","_")
				fn = fn+".nec"
				self.nec_file.writeParametrized(fn, comments = self.comments+["Score %g"%res,""])

	def print_status(self, minv, meanv, vector, count,improved):
		if self.quiet: return
		vector = self.tanhTransform(vector)
		z = sorted(zip(self.opt_vars,vector))
		sorted_vars = [x[0] for x in z]
		sorted_vect = [x[1] for x in z]
		if self.verbose:print "====================================================================="
		else: sys.stdout.write('\n')
		if not improved: print "% 5s. Min score %g, Mean score %g"%(str(count), minv, meanv)
		else : print "% 5s. Min score %g, Mean score %g, Improved %d memebers"%(str(count), minv, meanv, improved)
		if self.verbose:print "\t".join(map(self.nec_file.formatName, sorted_vars))
		if self.verbose:print "\t".join(map(self.nec_file.formatNumber, sorted_vect))
		if self.verbose:print "====================================================================="


def optionsParser():
	class MainOptionParser(ne.OptionParser):
		def __init__(self):
			ne.OptionParser.__init__(self)
			self.add_option("--agt-correction", default="1", type="int", help="This one is now ingorred. Always set to 1 to enable agt correction.")
			self.add_option("-l", "--log-file", default="opt.log",metavar="FILE", help="log file. The default is %default.")
			self.add_option("-S", "--seed-with-input", default=False, action="store_true", help="use the input file as one of the population members")
			self.add_option("-t", "--target-level", dest="target_levels" ,metavar="TARGET_LEVEL", action="append", type="string", help="appends target level(s) for a sweep, the number of target levels must match the number of sweeps and they are paired positionally. Examples1: -s (174,6,8) -t (8,9) means target levels linearly increasing from 8 to 9 for the frequencies from 174 to 216. Example2: -s (174,6,8) -t (8, 8.5, 9.5, 9) means target levels of 8 for 174, 9 for 216 and gradually increasing levels from 8.5 to 9.5 for the range 180 to 210")
			self.add_option("-M", "--max-iter", default=10000, type="int", help="The default is %default. The script can be interrupted with Ctrl+C at any time and it will output its current best result as 'output.nec'")
			self.add_option("-L", "--local-search", action="store_true", default = False)
			self.add_option("-T", "--local-search-tolerance", default = .0001, type="float")
			self.add_option("-F", "--target-function", default = "max(max_gain_diff, max_swr_diff)", type='string', help="An expression composed of statistical tokens and any of the nec file parameters, by default it is '%default'. All statistical tokes are of the form min_\"value\", max_\"value\", ave_\"value\", min_ave_\"value\", max_ave_\"value\", ave_min_\"value\" and ave_max_\"value\", where \"value\" is one of the following: gain_diff, swr_diff, f2r_diff, f2b_diff, net_gain, raw_gain, ml, swr, agt_correction, f2r, f2b, real and  imag.")
			self.add_option( "--swr-target", default = 2.0, type='float', help="the default value is %default")
			self.add_option( "--f2r-target", default = 15.0, type='float', help="the default value is %default")
			self.add_option( "--f2b-target", default = 15.0, type='float', help="the default value is %default")
#			self.add_option( "--desqi", default = False, action="store_true")
#			self.add_option( "--nmde", default = False, action="store_true")
			self.add_option( "--de-dither", default = .2, type="float")
			self.add_option( "--de-f", default = 0.6, type="float", help="The DE's differential parameter. Should be >.5, the default is %default")
			self.add_option( "--de-cr", default = 0.9, type="float", help = "The DE's crossover parameter. Should be > .8, the default is %default")
			self.add_option( "--de-np", default = 50, type="int", help="The DE's population size parameter. The literature recommends to use 10*(optimization_parameters). The defaults is %default")
			self.add_option("-P", "--output-population", default = False, action="store_true", help="output the full population in the log file after every iteration.")
			self.add_option("-f", "--frequency-data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
			self.add_option("-b", "--output-best", default = -1, help="set to 0 or 1 to output the best score nec file as 'best.nec'. Default is -1 (output if not in local search)." )
			self.add_option("-p", "--parameters", default = "", help="If not empty restrict the list of optimization parameters to this list." )
			self.add_option("-r", "--restart", default = "", metavar="RESTART_FILE", help="restart from population saved in a file." )
			self.add_option("--omni", default=0, action="store_true", help="parse all horizontal angles")
			self.add_option("--rear-angle", default=120, type="int", help="the rear angle used to calculate F/R ratio")
			self.add_option("--quiet", default=False, action="store_true")
			self.add_option("--verbose", default=False, action="store_true")

			
		def parse_args(self):
			options, args = ne.OptionParser.parse_args(self)
			if options.target_levels: options.target_levels = map(eval, options.target_levels)
			options.frequency_data = eval(options.frequency_data)
			options.parameters = options.parameters.replace(',',' ').split()
			if options.quiet and options.verbose:
				sys.stderr.write("WARNING: Both quite and verbose mode specified. Will use verbose.\n")
				options.quiet = False
			if options.parameters:
				if not options.quiet: print "Parameters restricted to "+str(options.parameters)
			if options.output_best == -1:
				if options.local_search: options.output_best = 0
				else: options.output_best = 1
			if not options.sweeps:
				options.sweeps = [(470,6,40)]
				options.target_levels = [(10.,10.)]
				options.target_function = "max_gain_diff"
				sys.stderr.write("WARNING: No sweeps parameters specified\n")
			use_f2r = False
			options.forward = not options.frequency_data and not options.omni
			if options.target_function.find("f2r") != -1:
				options.forward = False
				use_f2r = True
			if not options.quiet: 
				print "Sweeps set to:"
				print options.sweeps
			if not options.quiet: 
				print "Target levels set to:"
				print options.target_levels
			if not options.quiet: print "SWR target level set to: %g:"% options.swr_target
			if use_f2r : 
				if not options.quiet: print "F/R target level set to: %g:"% options.f2r_target
			if not options.quiet: print "Target function set to \"%s\"" % options.target_function
			if not options.quiet: print "use-agt-correction set to 1"


			return (options,args)

	return MainOptionParser()


def main():
	options, args = optionsParser().parse_args()
	options.agt_correction = 1
	evaluator = NecFileEvaluator(options)
	ins_sol_vec = None
	if options.seed_with_input:
		ins_sol_vec = evaluator.x
	try:
		if not options.local_search:
			de_plugin = None
			#if options.desqi:
			#	de_plugin = DE.DESQIPlugin()
			optimiser = DE.differential_evolution_optimizer(evaluator, population_size = options.de_np, f = options.de_f, cr = options.de_cr, show_progress=1, insert_solution_vector=ins_sol_vec, max_iter=options.max_iter, plugin = de_plugin, dither=options.de_dither)
		else:
			#from scipy import optimize
			import simplex
			if not options.quiet: print "N=%d"%len(evaluator.x)
			evaluator.x = simplex.fmin(evaluator, ftol=options.local_search_tolerance, xtol=options.local_search_tolerance, maxiter=options.max_iter)
		#evaluator.nec_file.writeNecInput("final.nec")
		evaluator.evaluateFinalSolution()
	except KeyboardInterrupt:
		evaluator.evaluateFinalSolution(1)
		raise


if __name__ == "__main__": 
	main()
