from __future__ import division
from nec.demathutils import mean_value, min_value
from nec.print_out import printOut

def floatOrNone(s):
	if s== "None":return None
	return float(s)

def parseLogFile(filename, np, population_member=0, number_of_lines=None):
	f = open(filename,"rt")
	lines = f.readlines()
	f.close()
	i=-1
	for j in range(len(lines)):
		if lines[j].find("Score")!=-1:
			i=j
	
	if i==-1:
		return ()

	vars = lines[i].split()[1:]
	score_index = vars.index("R0mg")
	vars = vars[0:score_index]
	score_index+=1
	lines = lines[i+1:]
	#if number_of_lines !=None and number_of_lines > len(lines):
	#	lines = lines[-number_of_lines:-1]

	c = 0
	scores = []
	population = []
	cr_stats=[0]
	for ln in lines:
		if ln[0]=='#': continue
		c+=1
		if (c-1) % np != population_member:
			continue
		ln = ln.split()
		score = float(ln[0])
		if not scores or score < scores[-1]:
			scores.append(score)
			new_gen = list(map(floatOrNone, ln[1:score_index]))
			if population:
				crs = 0
				for i in range(len(population[-1])):
					if population[-1][i]!=new_gen[i]:
						crs+=1
				cr_stats.append(crs)
			population.append(new_gen)

	return (vars,scores, population,cr_stats)


if __name__ == "__main__":
	import optparse 
	options = optparse.OptionParser()
	options.add_option("--de-np", default="50", type="int")
	options.add_option("-l", "--log-file", default="opt.log")
	options.add_option("-n", "--number-of-lines", default=0,type="int")
	options.add_option("-m", "--member", default=0, type="int")
	options.add_option("-s", "--cr-stats", default=False, action="store_true")
	opts, args = options.parse_args()
	p = parseLogFile(opts.log_file, opts.de_np, opts.member, opts.number_of_lines)
	if not p:
		printOut( "Failed to extract history")
	else:
		vars,scores, population, cr_stats = p
		printOut( ((len(vars)+1)*"%9s ")%tuple(["Score"]+vars))
		for i in range(len(scores)):
			if opts.cr_stats:
				printOut( ( (len(vars)+1)*"%3.5f "+" cr=%d")%tuple([scores[i]]+population[i]+[cr_stats[i]]))
			else:
				printOut( ( (len(vars)+1)*"%3.5f ")%tuple([scores[i]]+population[i]) )


	
