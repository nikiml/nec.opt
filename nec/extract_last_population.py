from __future__ import division
from nec.demathutils import mean_value, min_value
from nec.print_out import printOut
from datetime import datetime

def floatOrNone(s):
	if s== "None":return 0
	return float(s)

def parseLogFile(filename, full, number_of_lines, population_number):
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
	lines = lines[i+1:]
	
	i=-1
	for j in range(len(lines)):
		if lines[j].find("#Total time")!=-1:
			i=j
			break
	if i==-1:
		return ()
	np = int(j / 2)
	
	scores = []
	population = []
	for i in range(np):
		ln = lines[i].split()
		scores.append(float(ln[0]))
		population.append(list(map(floatOrNone, ln[1:])))
	
	lines = lines[np:]
	count = 1
	while len(lines):
		k=[]
		i = 0
		while i < np and i < len(lines):
			if lines[i] and lines[i][0]=='#':
				del lines[i]
				continue
			ln = lines[i].split()
			s = float(ln[0])
			if s < scores[i]:
				k.append((i,"%.4g"%s))
				scores[i] = s
				population[i] = list(map(floatOrNone, ln[1:]))
			i+=1
		lines = lines[i:]
		if not number_of_lines or len(lines) < number_of_lines*np:
			if i==np:
				printOut("Iteration %d [%.6g:%.6g] - %d new offsprings - "%(count,min_value(scores), mean_value(scores),len(k)) + str(k).replace("'","") )
			elif not full:
				printOut( "(*%d)Iteration %d [%.6g, %.6g] - %d new offsprings - "%(i,count,min_value(scores), mean_value(scores),len(k)) + str(k).replace("'","") )
				
		count = count +1
		if population_number and count == population_number:
			break

	return (vars,scores, population)


if __name__ == "__main__":
	import optparse 
	options = optparse.OptionParser()
	options.add_option("--de-np", default="50", type="int", help="deprecated, ignored")
	options.add_option("-l", "--log-file", default="opt.log")
	options.add_option("-f", "--full", default=False,action="store_true")
	options.add_option("-p", "--progress-only", default=False,action="store_true")
	options.add_option("-n", "--number-of-lines", default=0,type="int")
	options.add_option("-N", "--output-line-numbers", default=False, action="store_true")
	options.add_option("-c", "--generation-count", default=0, type="int")
	options.add_option("-r", "--restart-file",  default=False, action="store_true")
	options.add_option("-s", "--stats", default=False, action="store_true")
	opts, args = options.parse_args()
	p = parseLogFile(opts.log_file, opts.full, opts.number_of_lines,opts.generation_count)
	if opts.progress_only:exit(0)
	if not p:
		printOut( "Failed to extract population")
	else:
		vars,scores, population = p
		if not opts.restart_file:
			if opts.output_line_numbers:
				printOut( ("Num    "+(len(vars)+1)*"%9s ")%tuple(["Score"]+vars) )
				for i in range(len(scores)):
					printOut( ("[%03d]. "+ (len(vars)+1)*"%3.5f ")%tuple([i]+[scores[i]]+population[i]) )
			else:
				printOut( ((len(vars)+1)*"%9s ")%tuple(["Score"]+vars) )
				for i in range(len(scores)):
					printOut( ( (len(vars)+1)*"%3.5f ")%tuple([scores[i]]+population[i]) )
		if opts.restart_file:
			filename = datetime.now().strftime("restart.%y%m%d.%H%M%S.log")
			f = open(filename,"wt")
			f.write("Score\t"+"\t".join(vars)+"\n")
			for i in range(len(population)):
				f.write( ( (len(vars)+1)*"%3.5f "+"\n")%tuple([scores[i]]+population[i]))
			f.close()
		import math
		if opts.stats:
			stats = {}
			for i in range(len(vars)):
				vals = list(map( lambda x: x[i], population))
				ave = sum(vals)/len(vals)
				stats[vars[i]] = [min(vals), max(vals), ave, math.sqrt(sum ( list(map(lambda x: x*x, vals) ) )/len(vals) - ave*ave)]

			formatStr = lambda x: x + " "*max(0,12-len(x))
			formatNum = lambda x:  "%3.5f"%x 
			
			printOut(''.join(map(formatStr,["","Min", "Max", "Average", "StdDev"])))
			ave = sum(scores)/len(scores)
			printOut(''.join(map(formatStr,["Score"]+ list(map(formatNum, [min(scores), max(scores), sum(scores)/len(scores), math.sqrt(sum ( list( map(lambda x: x*x, scores) ) )/len(scores)-ave*ave)] ) ) ))) 
			for i in range(len(vars)):
				printOut(''.join(map(formatStr,[vars[i]]+list(map(formatNum,stats[vars[i]])))) )

