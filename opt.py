# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License


import differential_evolution as DE
import os, math
from nec import eval as ne

class NecFileEvaluator:
	def __init__(self, options):
			#.input, options.output,options.auto_segmentation, options.sweeps, options.target_levels,options.num_cores, options.log_file, options.target_function
		self.log = None
		self.target_function = options.target_function
		self.char_impedance = options.char_impedance
		self.nec_file = ne.NecFileObject(options.input, options.output)
		self.nec_file.autoSegmentation(options.auto_segmentation)
		self.output_population = options.output_population
		self.output_best = options.output_best
		
		self.ranges = options.sweeps
		self.target_levels = options.target_levels
		self.swr_target = options.swr_target
		self.opt_vars = self.nec_file.min_max.keys()
		self.tanh_domain = self.nec_file.min_max.values()
		self.domain = len(self.nec_file.min_max.values())*[[-1,1]]
		self.n = len(self.opt_vars)
		self.x = []
		self.best_score = 999.0
		self.frequency_data = options.frequency_data
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.x.append(self.nec_file.vars[var])

		self.x = self.atanhTransform(self.x)

		self.ncores = options.num_cores
		self.comments = [""]
		self.comments.append("Input file: "+options.input)
		self.comments.append("Sweep ranges: ")
		for i in range(len(self.ranges)):
			self.comments.append(str(self.ranges[i]))
			if not self.frequency_data:
				self.comments[-1]+=(" with target levels "+str(self.target_levels[i]))
		if self.frequency_data:
			self.comments.append(" Frequency angle/gain data: ")
			self.comments.append(str(self.frequency_data))
		self.comments.append("SWR target: %g"%self.swr_target)
		self.comments.append("Target function: %s"%self.target_function)
		self.comments.append("")
			

		if options.log_file:
			self.log = open(options.log_file,"at")
			self.log.write("============"*10+"\n")
			self.log.write("\n".join(self.comments))
			
			self.log.write("============"*10+"\n")
			self.log.write(self.nec_file.formatName("Score")+"\t"+"\t".join(map(self.nec_file.formatName, self.opt_vars))+"\n")
			self.log.flush()

	def __del__(self):
		if self.log:
			self.log.close()

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

	def freqID(self, freq):
		for i in range(len(self.ranges)):
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

	def logParamVector(self, vector, score):
		self.log.write(self.nec_file.formatNumber(score)+"\t"+"\t".join(map(self.nec_file.formatNumber, vector))+"\n")
		self.log.flush()

	def target(self, vector):
		class RangeResult:
			def __init__(self):
				self.max_gain_diff = None
				self.gain_diff_sum = .0
				self.max_swr_diff = None
				self.swr_diff_sum = .0
				self.count = 0
			def add(self, gain_diff, swr_diff):
				if self.max_gain_diff is None or self.max_gain_diff < gain_diff:
					self.max_gain_diff = gain_diff
				if self.max_swr_diff is None or self.max_swr_diff < swr_diff:
					self.max_swr_diff = swr_diff
				self.gain_diff_sum = self.gain_diff_sum + gain_diff
				self.swr_diff_sum = self.swr_diff_sum + swr_diff
				self.count = self.count + 1


		range_results = [] 
		for i in range(len(self.ranges)): range_results.append(RangeResult())

		vector = self.tanhTransform(vector)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]

		results = self.nec_file.runSweeps(self.ranges, self.ncores, cleanup=1)
		res = -1000
		NOP = ne.NecOutputParser
		try:
			for r in results:
				nop = NOP(r, self.char_impedance, self.nec_file.angle_step, self.frequency_data)
				#print "output parsed"
				for freq in nop.frequencies:
					freqid = self.freqID(freq.freq)
					if self.frequency_data:
						tl = self.frequency_data[freq.freq][1]
					else:
						tl = self.targetLevel(freqid[0], freqid[1])
					gain_diff = tl-freq.net()
					swr_diff = (freq.swr() - self.swr_target)
					#print "freq %g, target level %g, freqno %d, gaindiff %g, swrdiff %g"%(freq.freq, tl, freqid[0], gain_diff, swr_diff)
					range_results[freqid[0]].add(gain_diff, swr_diff)
			d = {}
			d["max_gain_diff"] = -1000.0
			d["ave_max_gain_diff"] = 0.0
			d["max_ave_gain_diff"] = -1000.0
			d["ave_gain_diff"] = 0.0
			d["max_swr_diff"] = -1000.0
			d["ave_max_swr_diff"] = 0.0
			d["max_ave_swr_diff"] = -1000.0
			d["ave_swr_diff"] = 0.0
			freq_count=0
			for i in range_results:
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
				freq_count = freq_count + i.count
			d["ave_swr_diff"] = d["ave_swr_diff"]/freq_count
			d["ave_gain_diff"] = d["ave_gain_diff"]/freq_count
			d["ave_max_swr_diff"] = d["ave_max_swr_diff"]/len(self.ranges)
			d["ave_max_gain_diff"] = d["ave_max_gain_diff"]/len(self.ranges)

			#print d
			res = eval(self.target_function, d)

		except:
			res = -1000
		if res == -1000:
			res = 1000.0
			
		print "\t".join(map(self.nec_file.formatName, self.opt_vars))
		print "\t".join(map(self.nec_file.formatNumber, vector))
		print res
		print "\n"
		if self.log:
			self.logParamVector(vector,res)
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

		return res

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
			self.add_option("-l", "--log-file", default="opt.log",metavar="FILE", help="log file")
			self.add_option("-S", "--seed-with-input", default=False, action="store_true", help="use the input file as one of the population members")
			self.add_option("-t", "--target_level", dest="target_levels" ,metavar="TARGET_LEVEL", action="append", type="string", help="appends target level(s) for a sweep, the number of target levels must match the number of sweeps and they are paired positionally. Examples1: -s (174,6,8) -t (8,9) means target levels linearly increasing from 8 to 9 for the frequencies from 174 to 216. Example2: -s (174,6,8) -t (8, 8.5, 9.5, 9) means target levels of 8 for 174, 9 for 216 and gradually increasing levels from 8.5 to 9.5 for the range 180 to 210")
			self.add_option("-M", "--max-iter", default=10000, type="int")
			self.add_option("-L", "--local-search", action="store_true", default = False)
			self.add_option("-T", "--local-search-tolerance", default = .001)
			self.add_option("-F", "--target-function", default = "max(max_gain_diff, max_swr_diff)", type='string', help="The evaluator calculates net gain and swr for each frequency of every sweep range. The optimizer then finds the difference between the gain and its target level and between the swr and its target level, thus calculating 'gain_diff' and 'swr_diff' for each frequency. As a second step it calculates the maximum and the average of those values for each sweep range: 'max_gain_diff', 'ave_gain_diff', 'max_swr_diff', 'ave_swr_diff'. Lastly it uses those value for every range and calculates the following values: 'max_gain_diff' - the absolute maximum of all gain_diffs for all frequencies, 'max_ave_gain_diff' - the maximum of all ave_gain_diffs for all sweep ranges, 'ave_max_gain_diff' - the average of all max_gain_diffs for all sweep ranges, 'ave_gain_diff' the average of all gain_diffs and the four swr counterparts 'max_swr_diff', 'max_ave_swr_diff', 'ave_max_swr_diff', 'ave_swr_diff'. The target function that the optimizer minimizes can be an expression of the last 8 values, by default it is '%default'")
			self.add_option( "--swr-target", default = 2.0, type='float', help="the default value is %default")
			self.add_option( "--desqi", default = False, action="store_true")
#			self.add_option( "--nmde", default = False, action="store_true")
			self.add_option( "--de-f", default = 0.6, type="float")
			self.add_option( "--de-cr", default = 0.9, type="float")
			self.add_option( "--de-np", default = 50, type="int")
			self.add_option("-P", "--output_population", default = False, action="store_true")
			self.add_option("-f", "--frequency_data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
			self.add_option("-b", "--output-best", default = -1, help="set to 0 or 1 to output the best score nec file as 'best.nec'. Default is -1 (output if not in local search)." )

			
		def parse_args(self):
			options, args = ne.OptionParser.parse_args(self)
			if options.target_levels: options.target_levels = map(eval, options.target_levels)
			options.frequency_data = eval(options.frequency_data)
			if options.output_best == -1:
				if options.local_search: options.output_best = 0
				else: options.output_best = 1
			if not options.sweeps:
				options.sweeps = [(470,6,40)]
				options.target_levels = [(10.,10.)]
				options.target_function = "max_gain_diff"
				print "No sweeps parameters specified"
			print "Sweeps set to:"
			print options.sweeps
			print "Target levels set to:"
			print options.target_levels
			print "SWR target level set to: %g:"% options.swr_target
			print "Target function set to \"%s\"" % options.target_function


			return (options,args)

	return MainOptionParser()


def main():
	options, args = optionsParser().parse_args()
	evaluator = NecFileEvaluator(options)
	ins_sol_vec = None
	if options.seed_with_input:
		ins_sol_vec = evaluator.x
	try:
		if not options.local_search:
			de_plugin = None
			if options.desqi:
				de_plugin = DE.DESQIPlugin()
			optimiser = DE.differential_evolution_optimizer(evaluator, population_size = options.de_np, f = options.de_f, cr = options.de_cr, show_progress=1, insert_solution_vector=ins_sol_vec, max_iter=options.max_iter, plugin = de_plugin)
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
