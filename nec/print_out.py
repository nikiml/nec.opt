def printOut(s):
	import sys
	if type(s)!=type(''):
		s = str(s)
	sys.stdout.write(s)
	sys.stdout.write('\n')
	sys.stdout.flush()


