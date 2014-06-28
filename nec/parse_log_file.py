from __future__ import division
from nec.print_out import printOut

def distance(m1, m2, min_dif, num_calculated):
	d = 0
	for i in range(1, len(m1)-num_calculated):
		m = max(abs(m1[i]),abs(m2[i]))
		if min_dif*m < abs(m1[i]-m2[i]):
			d = d+1
	return d


def isAway(population, member, min_distance, min_dif,num_calculated):
	for p in population:
		if distance (p, member, min_dif,num_calculated) < min_distance:
			return 0
	return 1
	
def parseLogFile(filename, np, min_distance, min_dif,num_calculated):
	f = open(filename,"rt")
	lines = f.readlines()
	f.close()
	i=-1
	for j in xrange(len(lines)):
		if lines[j].find("Score")!=-1:
			i=j
	
	if i==-1:
		return ()

	printOut( i )

	vars = lines[i].split()
	lines = lines[i+1:]
	for l in range(len(lines)):
		try:
			lines[l] = map(float, lines[l].split())
		except:
			lines[l] = lines[l].replace("None", "0")
			lines[l] = map(float, lines[l].split())

	lines.sort()
	population = []

	for l in lines:
		if isAway(population, l, min_distance, min_dif,num_calculated):
			population.append(l)
			if len(population) == np:
				break
	return vars, population




if __name__ == "__main__":
	import optparse 
	options = optparse.OptionParser()
	options.add_option("--de-np", default="50", type="int")
	options.add_option("-l", "--log-file", default="opt.log")
	options.add_option("-d", "--min-distance", default="10", type="int")
	options.add_option("-f", "--min-dif", default=".1", type="float")
	options.add_option("-n", "--num-calculated", default="8", type="int")
	opts, args = options.parse_args()
	p = parseLogFile(opts.log_file, opts.de_np, opts.min_distance, opts.min_dif,opts.num_calculated)
	if not p:
		printOut( "Failed to extract population")
	else:
		vars, population = p
		printOut( ((len(vars))*"%9s ")%tuple(vars) )
		for i in range(len(population)):
			printOut( ((len(vars))*"%3.5f ")%tuple(population[i]) )


	
