# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License


import differential_evolution as DE
import os, math
import nec_eval as ne

class NecFileEvaluator:
	def __init__(self, sourcefile, out_dir, autosegmentation, ranges, target_levels, ncores=1, log=None, target_function = "max(max_gain_diff, max_swr_diff)"):
		self.log = None
		self.target_function = target_function
		self.nec_file = ne.NecFileObject(sourcefile, out_dir)
		self.nec_file.autoSegmentation(autosegmentation)
		
		self.ranges = ranges
		self.target_levels = target_levels
		self.opt_vars = self.nec_file.min_max.keys()
		self.tanh_domain = self.nec_file.min_max.values()
		self.domain = len(self.nec_file.min_max.values())*[[-1,1]]
		self.n = len(self.opt_vars)
		self.x = []
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.x.append(self.nec_file.vars[var])

		self.x = self.atanhTransform(self.x)

		self.ncores = ncores
		if log:
			self.log = open(log,"at")
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

	def evaluateFinalSolution(self):
		vector = self.tanhTransform(self.x)
		for i in xrange(len(self.opt_vars)):
			var = self.opt_vars[i]
			self.nec_file.vars[var]=vector[i]
		self.nec_file.writeNecInput("final.nec")
		self.nec_file.evaluate(self.ranges, self.ncores,cleanup=1)

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
				nop = NOP(r)
				for freq in nop.frequencies:
					freqid = self.freqID(freq.freq)
					tl = self.targetLevel(freqid[0], freqid[1])
					gain_diff = tl-freq.net()
					swr_diff = (freq.swr() - 2)
					#print "freq %g, target level %g, freqno %d, gaindiff %g, swrdiff %g"%(freq.freq, tl, freqid[0], gain_diff, swr_diff)
					range_results[freqid[0]].add(gain_diff, swr_diff)
			d = {}
			d["max_gain_diff"] = -1000.0
			d["ave_max_gain_diff"] = 0.0
			d["ave_gain_diff"] = 0.0
			d["max_swr_diff"] = -1000.0
			d["ave_max_swr_diff"] = 0.0
			d["ave_swr_diff"] = 0.0
			freq_count=0
			for i in range_results:
				if i.max_gain_diff > d["max_gain_diff"]:
					d["max_gain_diff"] = i.max_gain_diff
				d["ave_max_gain_diff"] = d["ave_max_gain_diff"]+i.max_gain_diff
				d["ave_gain_diff"] = d["ave_gain_diff"] + i.gain_diff_sum
				if i.max_swr_diff > d["max_swr_diff"]:
					d["max_swr_diff"] = i.max_swr_diff
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
			res = 1000
			
		print "\t".join(map(self.nec_file.formatName, self.opt_vars))
		print "\t".join(map(self.nec_file.formatNumber, vector))
		print res
		print "\n"
		if self.log:
			self.log.write("\t".join(map(self.nec_file.formatName, self.opt_vars))+"\n")
			self.log.write("\t".join(map(self.nec_file.formatNumber, vector))+"\n")
			self.log.write("Score = "+str(res)+"\n")
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
			self.add_option("-F", "--target-function", default = "max(max_gain_diff, max_swr_diff)", type='string')
			
		def parse_args(self):
			options, args = ne.OptionParser.parse_args(self)
			if options.target_levels: options.target_levels = map(eval, options.target_levels)
			if not options.sweeps:
				options.sweeps = [(174,6,8),(470,6,40)]
				options.target_levels = [(8.9,9.6,8.5, 8.2), (13.0,13.2,13.4,13.0)]
			return (options,args)

	return MainOptionParser()


def main():
	options, args = optionsParser().parse_args()
	evaluator = NecFileEvaluator(options.input, options.output,options.auto_segmentation, options.sweeps, options.target_levels,options.num_cores, options.log_file, options.target_function)
	ins_sol_vec = None
	if options.seed_with_input:
		ins_sol_vec = evaluator.x
	if not options.local_search:
		optimiser = DE.differential_evolution_optimizer(evaluator, show_progress=1, insert_solution_vector=ins_sol_vec, max_iter=options.max_iter)
	else:
		from scipy import optimize
		print "N=%d"%len(evaluator.x)
		evaluator.x = optimize.fmin(evaluator.target, evaluator.x, ftol=options.local_search_tolerance)
	#evaluator.nec_file.writeNecInput("final.nec")
	evaluator.evaluateFinalSolution()


if __name__ == "__main__": 
	main()
