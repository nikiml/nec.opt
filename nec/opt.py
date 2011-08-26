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
			raise
			print sys.exc_info()[1]
			return ([],[])


		
	def __init__(self, options):
			#.input, options.output,options.auto_segmentation, options.sweeps, options.target_levels,options.num_cores, options.log_file, options.target_function
		self.log = None
		self.target_function = options.target_function
		self.char_impedance = options.char_impedance
		self.nec_file = ne.NecFileObject(options)
		self.nec_file.calc_gain = (self.target_function.find("gain")!=-1) or (self.target_function.find("f2r")!=-1)
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

		raise "frequence %.3f out of all ranges"%freq

	def evaluateFinalSolution(self, interrupted=0):
		vector = self.tanhTransform(self.x)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]
		self.nec_file.writeNecInput("final.nec")
		self.nec_file.writeParametrized("output.nec", comments = self.comments+["Score %g"%self.best_score,""])
		if interrupted: return
		self.nec_file.evaluate(self.ranges, self.char_impedance, self.ncores,cleanup=1)
	
	def iterationCallback(self, iter_no, population, scores):
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
				range_scores.append(range_results[i].max_gain_diff)
				range_scores.append(range_results[i].gain_diff_sum/max(range_results[i].count,1))
				range_scores.append(range_results[i].max_swr_diff)
				range_scores.append(range_results[i].swr_diff_sum/max(range_results[i].count,1))

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
		if self.frequency_data:
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
			self.printLog(vector, float(score)+1, None)
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
				print "new agt threshold = %.6g"%self.agt_score_threshold

			return NecFileEvaluator.Score(sc,s)
		if self.debug: sys.stderr.write("debug: Discarding(%d, %d, %.6g, %.6g)\n"%(self.agt_score_threshold_stat_count1, self.agt_score_threshold_stat_count2,self.agt_score_threshold_stat1,self.agt_score_threshold_stat2 ))
	def target(self, vector):
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
		class RangeResult:
			def __init__(self):
				self.max_gain_diff = None
				self.gain_diff_sum = .0
				self.max_swr_diff = None
				self.swr_diff_sum = .0
				self.max_f2r_diff = None
				self.f2r_diff_sum = .0
				self.count = 0
			def add(self, gain_diff, swr_diff, f2r_diff):
				if self.max_gain_diff is None or self.max_gain_diff < gain_diff:
					self.max_gain_diff = gain_diff
				if self.max_swr_diff is None or self.max_swr_diff < swr_diff:
					self.max_swr_diff = swr_diff
				if self.max_f2r_diff is None or self.max_f2r_diff < f2r_diff:
					self.max_f2r_diff = f2r_diff
				self.gain_diff_sum += gain_diff
				self.swr_diff_sum += swr_diff
				self.f2r_diff_sum += f2r_diff
				self.count += 1


		range_results = [] 
		for i in range(len(self.ranges)): range_results.append(RangeResult())

		vector = self.tanhTransform(vector)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]

		results = self.nec_file.runSweeps(self.ranges,self.frequency_data, self.ncores, 1,get_agt_score, use_agt)
		res = -1000
		agts = {}
		if not results:
			print "writing erroneous file..."
			try:
				self.nec_file.writeParametrized("error%d.nec"%self.errors)
				print "done"
			except:
				print "failed"
		else:
			#agts = [1.0]*len(results)

			NOP = ne.NecOutputParser
			try:
				for r in results:
					nop = NOP(r[0], r[2], self.char_impedance, self.nec_file.angle_step, self.frequency_data,self.omni)
					#print "output parsed"
					sweepid = r[1]
					agts[r[3]] = r[2]
					for freq in nop.frequencies:
						freqid = self.freqID(freq.freq, sweepid)
						if self.frequency_data:
							tl = self.frequency_data[freq.freq][1]
						else:
							tl = self.targetLevel(freqid[0], freqid[1])
						gain_diff = tl-freq.net()
						swr_diff = (freq.swr() - self.swr_target)
						rear = [freq.horizontalNet(phi) for phi in freq.horizontal.keys() if phi>=180-self.rear_angle/2 and  phi<=180+self.rear_angle/2]
						if not rear: rear = 0
						else: rear = max(rear)
						#print "freq %g, target level %g, net %g, freqno %d, gaindiff %g, swrdiff %g"%(freq.freq, tl, freq.net(),freqid[0], gain_diff, swr_diff)
						f2r_diff = self.f2r_target-(freq.net()-rear)
						range_results[freqid[0]].add(gain_diff, swr_diff, f2r_diff)
				import pprint
				d = {}
				d["max_gain_diff"] = -1000.0
				d["ave_max_gain_diff"] = 0.0
				d["max_ave_gain_diff"] = -1000.0
				d["ave_gain_diff"] = 0.0
				d["max_swr_diff"] = -1000.0
				d["ave_max_swr_diff"] = 0.0
				d["max_ave_swr_diff"] = -1000.0
				d["ave_swr_diff"] = 0.0
				d["max_f2r_diff"] = -1000.0
				d["ave_max_f2r_diff"] = 0.0
				d["max_ave_f2r_diff"] = -1000.0
				d["ave_f2r_diff"] = 0.0
				freq_count=0
				for i in range_results:
					if not i.count: continue
					#pprint.pprint(i.__dict__)
					if i.max_gain_diff > d["max_gain_diff"]:
						d["max_gain_diff"] = i.max_gain_diff
					if d["max_ave_gain_diff"] < i.gain_diff_sum/i.count:
						d["max_ave_gain_diff"] = i.gain_diff_sum/i.count
					d["ave_max_gain_diff"] = d["ave_max_gain_diff"]+i.max_gain_diff
					d["ave_gain_diff"] = d["ave_gain_diff"] + i.gain_diff_sum
					if i.max_swr_diff > d["max_swr_diff"]:
						d["max_swr_diff"] = i.max_swr_diff
					if d["max_ave_swr_diff"] < i.swr_diff_sum/i.count:
						d["max_ave_swr_diff"] = i.swr_diff_sum/i.count
					d["ave_max_swr_diff"] = d["ave_max_swr_diff"]+i.max_swr_diff
					d["ave_swr_diff"] = d["ave_swr_diff"] + i.swr_diff_sum
					if i.max_f2r_diff > d["max_f2r_diff"]:
						d["max_f2r_diff"] = i.max_f2r_diff
					if d["max_ave_f2r_diff"] < i.f2r_diff_sum/i.count:
						d["max_ave_f2r_diff"] = i.f2r_diff_sum/i.count
					d["ave_max_f2r_diff"] = d["ave_max_f2r_diff"]+i.max_f2r_diff
					d["ave_f2r_diff"] = d["ave_f2r_diff"] + i.f2r_diff_sum
					freq_count = freq_count + i.count

				d["ave_swr_diff"] = d["ave_swr_diff"]/freq_count
				d["ave_gain_diff"] = d["ave_gain_diff"]/freq_count
				d["ave_f2r_diff"] = d["ave_f2r_diff"]/freq_count
				d["ave_max_swr_diff"] = d["ave_max_swr_diff"]/len(self.ranges)
				d["ave_max_gain_diff"] = d["ave_max_gain_diff"]/len(self.ranges)
				d["ave_max_f2r_diff"] = d["ave_max_f2r_diff"]/len(self.ranges)
	
				#pprint.pprint(d)
				res = eval(self.target_function, d)
	
			except:
				print traceback.print_tb(sys.exc_info()[2])
				print sys.exc_info()[1]
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

		print "\t".join(map(self.nec_file.formatName, sorted_vars))
		print "\t".join(map(self.nec_file.formatNumber, sorted_vect))
		print res
		print "\n"
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

	def print_status(self, minv, meanv, vector, count):
		vector = self.tanhTransform(vector)
		print "====================================================================="
		print "%s		: Min score %g, Mean score %g"%(str(count), minv, meanv)
		print list(vector)
		print "====================================================================="


def optionsParser():
	class MainOptionParser(ne.OptionParser):
		def __init__(self):
			ne.OptionParser.__init__(self)
			self.add_option("--agt-correction", default="1", type="int", help="This one is now ingorred. Always set to 1 to enable agt correction.")
			self.add_option("-l", "--log-file", default="opt.log",metavar="FILE", help="log file. The default is %default.")
			self.add_option("-S", "--seed-with-input", default=False, action="store_true", help="use the input file as one of the population members")
			self.add_option("-t", "--target_level", dest="target_levels" ,metavar="TARGET_LEVEL", action="append", type="string", help="appends target level(s) for a sweep, the number of target levels must match the number of sweeps and they are paired positionally. Examples1: -s (174,6,8) -t (8,9) means target levels linearly increasing from 8 to 9 for the frequencies from 174 to 216. Example2: -s (174,6,8) -t (8, 8.5, 9.5, 9) means target levels of 8 for 174, 9 for 216 and gradually increasing levels from 8.5 to 9.5 for the range 180 to 210")
			self.add_option("-M", "--max-iter", default=10000, type="int", help="The default is %default. The script can be interrupted with Ctrl+C at any time and it will output its current best result as 'output.nec'")
			self.add_option("-L", "--local-search", action="store_true", default = False)
			self.add_option("-T", "--local-search-tolerance", default = .0001, type="float")
			self.add_option("-F", "--target-function", default = "max(max_gain_diff, max_swr_diff)", type='string', help="The evaluator calculates net gain, F/R ratio and swr for each frequency of every sweep range. The optimizer then finds the difference between those values and their target levels, thus calculating 'gain_diff', 'f2r_diff' and 'swr_diff' for each frequency. As a second step it calculates the maximum and the average of those values for each sweep range: 'max_gain_diff', 'ave_gain_diff', 'max_f2r_diff', 'ave_f2r_diff', 'max_swr_diff', 'ave_swr_diff'. Lastly it uses those value for every range and calculates the following values: 'max_gain_diff' - the absolute maximum of all gain_diffs for all frequencies, 'max_ave_gain_diff' - the maximum of all ave_gain_diffs for all sweep ranges, 'ave_max_gain_diff' - the average of all max_gain_diffs for all sweep ranges, 'ave_gain_diff' the average of all gain_diffs and the four F/R counterparts 'max_f2r_diff', 'max_ave_f2r_diff', 'ave_max_f2r_diff', 'ave_f2r_diff' and the four swr counterparts 'max_swr_diff', 'max_ave_swr_diff', 'ave_max_swr_diff', 'ave_swr_diff'. The target function that the optimizer minimizes can be an expression of the last 12 values, by default it is '%default'")
			self.add_option( "--swr-target", default = 2.0, type='float', help="the default value is %default")
			self.add_option( "--f2r-target", default = 15.0, type='float', help="the default value is %default")
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

			
		def parse_args(self):
			options, args = ne.OptionParser.parse_args(self)
			if options.target_levels: options.target_levels = map(eval, options.target_levels)
			options.frequency_data = eval(options.frequency_data)
			options.parameters = options.parameters.replace(',',' ').split()
			if options.parameters:
				print "Parameters restricted to "+str(options.parameters)
			if options.output_best == -1:
				if options.local_search: options.output_best = 0
				else: options.output_best = 1
			if not options.sweeps:
				options.sweeps = [(470,6,40)]
				options.target_levels = [(10.,10.)]
				options.target_function = "max_gain_diff"
				print "No sweeps parameters specified"
			use_f2r = False
			options.forward = not options.frequency_data and not options.omni
			if options.target_function.find("f2r") != -1:
				options.forward = False
				use_f2r = True
			print "Sweeps set to:"
			print options.sweeps
			print "Target levels set to:"
			print options.target_levels
			print "SWR target level set to: %g:"% options.swr_target
			if use_f2r : print "F/R target level set to: %g:"% options.f2r_target
			print "Target function set to \"%s\"" % options.target_function
			print "use-agt-correction set to 1"


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
			print "N=%d"%len(evaluator.x)
			evaluator.x = simplex.fmin(evaluator, ftol=options.local_search_tolerance, xtol=options.local_search_tolerance, maxiter=options.max_iter)
		#evaluator.nec_file.writeNecInput("final.nec")
		evaluator.evaluateFinalSolution()
	except KeyboardInterrupt:
		evaluator.evaluateFinalSolution(1)
		raise


if __name__ == "__main__": 
	main()
