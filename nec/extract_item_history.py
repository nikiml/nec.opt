from demathutils import mean_value, min_value

def floatOrNone(s):
	if s== "None":return None
	return float(s)

def parseLogFile(filename, np, population_member=0, number_of_lines=None):
	f = open(filename,"rt")
	lines = f.readlines()
	f.close()
	i=-1
	for j in xrange(len(lines)):
		if lines[j].find("Score")!=-1:
			i=j
	
	if i==-1:
		return ()

	vars = lines[i].split()[1:]
	lines = lines[i+1:]
	#if number_of_lines !=None and number_of_lines > len(lines):
	#	lines = lines[-number_of_lines:-1]

	c = 0
	scores = []
	population = []
	for ln in lines:
		if ln[0]=='#': continue
		c+=1
		if (c-1) % np != population_member:
			continue
		ln = ln.split()
		score = float(ln[0])
		if not scores or score < scores[-1]:
			scores.append(score)
			population.append(map(floatOrNone, ln[1:]))
	
	return (vars,scores, population)


if __name__ == "__main__":
	import optparse 
	options = optparse.OptionParser()
	options.add_option("--de-np", default="50", type="int")
	options.add_option("-l", "--log-file", default="opt.log")
	options.add_option("-n", "--number-of-lines", default=0,type="int")
	options.add_option("-m", "--member", default=0, type="int")
	opts, args = options.parse_args()
	p = parseLogFile(opts.log_file, opts.de_np, opts.member, opts.number_of_lines)
	if not p:
		print "Failed to extract history"
	else:
		vars,scores, population = p
		print ((len(vars)+1)*"%9s ")%tuple(["Score"]+vars)
		for i in range(len(scores)):
			print ( (len(vars)+1)*"%3.5f ")%tuple([scores[i]]+population[i])


	
