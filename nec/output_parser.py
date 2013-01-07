# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License

import sys, traceback, os, pprint
from nec import necmath
from nec.print_out import printOut

class FrequencyData:
	def __init__(self, char_impedance):
		self.freq = 0
		self.real = 0
		self.imag = 0
		self.gain = 0
		self.char_impedance = char_impedance
		self.angle = 0
		self.AGT = 1.0
		self.agt = 0
		self.horizontal = {}
		self.vertical = {}
		self.sorted_horizontal_angles = []
		self.input_power = 0
		self.radiated_power = 0
		self.structure_loss = 0
		self.network_loss = 0
		self.efficiency = 0

	def swr(self):
		rc = necmath.sqrt( \
			(necmath.pow(self.real-self.char_impedance,2)+necmath.pow(self.imag,2)) \
			/ (necmath.pow(self.real+self.char_impedance,2)+necmath.pow(self.imag,2)) \
			)
		return (1+rc)/(1-rc)
	def valid(self):
		try: 
			self.swr()
			return 1
		except:
			return 0
	def net(self, g = None):
		if g is None:
			g = self.gain
		tmp = 4*max(self.real,.0001)*self.char_impedance/(necmath.pow(self.real+self.char_impedance,2)+necmath.pow(self.imag,2))
		return g+10*necmath.log10(tmp)

	def horizontalNet(self, phi):
		return self.net(self.horizontalRaw(phi))

	def horizontalRaw(self, phi):
		if phi in self.horizontal: return self.horizontal[phi]
		if -phi in self.horizontal: return self.horizontal[-phi]
		#sys.stderr.write("WARNING: gain for angle %.1f not calculated - using approximation\n"%phi)
		#sys.stderr.write(str(self.horizontal)+"\n")
		if not self.sorted_horizontal_angles:
			self.sorted_horizontal_angles = sorted(self.horizontal.keys())
		if not self.sorted_horizontal_angles:
			raise RuntimeError("gain not calculated")
		while phi < self.sorted_horizontal_angles[0]:
			phi +=360 
		diff = phi-self.sorted_horizontal_angles[0]
		index = 0
		for i in range(1,len(self.sorted_horizontal_angles)):
			d = phi-self.sorted_horizontal_angles[i]
			if abs(d) < abs(diff):
				diff = d
				index = i
		if index !=0 and diff < 0:
			return (self.horizontal[self.sorted_horizontal_angles[index-1]]*(phi - self.sorted_horizontal_angles[index-1])		\
					+ self.horizontal[self.sorted_horizontal_angles[index]]*( self.sorted_horizontal_angles[index] - phi) )	\
					/ (self.sorted_horizontal_angles[index]-self.sorted_horizontal_angles[index-1])
		if index !=len(self.sorted_horizontal_angles)-1 and diff > 0:
			return (self.horizontal[self.sorted_horizontal_angles[index+1]]*(self.sorted_horizontal_angles[index+1]-phi)		\
					+ self.horizontal[self.sorted_horizontal_angles[index]]*(phi - self.sorted_horizontal_angles[index]) )	\
					/ (self.sorted_horizontal_angles[index+1]-self.sorted_horizontal_angles[index])
		return self.horizontal[self.sorted_horizontal_angles[index]]

	def verticalNet(self, theta):
		return self.net(self.vertical[theta])
		
	def __str__(self):
		return "%d Mhz - raw(%f), net(%f), swr(%f), real(%f), imag(%f)"%(int(self.freq), self.gain, self.net(), self.swr(), self.real, self.imag)

	def forwardGain(self, forward_dir = 0):
		return self.horizontalNet(forward_dir)

	def forwardRaw(self, forward_dir = 0):
		return self.horizontalRaw(forward_dir)

	def backwardGain(self, backward_dir = 0):
		return self.horizontalNet(backward_dir)

	def backwardRaw(self, backward_dir = 0):
		return self.horizontalRaw(backward_dir)

	def rearGain(self, rear_angle, backward_dir = 180):
		rear = [self.horizontalNet(phi) for phi in self.horizontal.keys() if phi>=backward_dir-rear_angle/2. and  phi<=backward_dir+rear_angle/2.]
		if not rear:
			return None
		return max(rear)

	def beamWidth(self, forward_dir, angle_step, ratio_in_db):
		gain = self.horizontalRaw(forward_dir)-ratio_in_db
		step = angle_step
		while self.horizontalRaw(forward_dir+step) > gain and self.horizontalRaw(forward_dir-step) > gain:
			step+=angle_step
			if step>180: return 180

		g1 = self.horizontalRaw(forward_dir+step-angle_step)
		g2 = self.horizontalRaw(forward_dir+step)
		if g2 < g1 and g2 <= gain:
			beam1 = step - angle_step + (g1-gain)/(g1-g2)*angle_step
		else:   beam1 = 180
		g1 = self.horizontalRaw(forward_dir-step+angle_step)
		g2 = self.horizontalRaw(forward_dir-step)
		if g2 < g1 and g2 <= gain:
			beam2 = step - angle_step + (g1-gain)/(g1-g2)*angle_step
		else:   beam2 = 180
		return 2*min(beam1, beam2)
		


class NecOutputParser:
	def __init__(self, output, agt, options):
		self.frequencies = []
		self.AGT = agt
		self.agt = 10*necmath.log10(agt)
		self.options = options
		if output:
			self.parse(output)

	def printFreqs(self, header=1):
		if not self.options.frequency_data:
			if header: 
				printOut( "%6s %8s %8s %7s %7s %7s %7s %8s %8s %12s"%("Freq", "RawGain", "NetGain", "SWR", "BeamW", "F/R", "F/B", "Real", "Imag", "AGT(corr)"))
				printOut( "=========================================================================================")
			#if self.agt!=0:
			#	printOut( "AGT=%g dB"%self.agt)
			for i in self.frequencies:
				if not i.valid():
					printOut( "%6.1f - invalid result"%i.freq)
				else:
					rear = "n/a"
					back = "n/a"
					raw = "n/a"
					net = "n/a"
					beam_width = "n/a"
					if self.options.calc.gain:
						raw = i.horizontalRaw(self.options.forward_dir)
						net = i.net(raw)
						if self.options.calc.f2r:
							rear = i.rearGain(self.options.rear_angle,self.options.backward_dir)
							rear = "% 7.3f"%(net-rear)
						if self.options.calc.f2b:
							back = i.backwardGain(self.options.backward_dir)
							back = "% 7.3f"%(net-back)
						raw = "% 8.3f"%raw
						net = "% 8.3f"%net
						if self.options.calc.beam_width:
							beam_width = "% 7.1f"%i.beamWidth(self.options.forward_dir, self.options.angle_step, self.options.beamwidth_ratio)
					printOut( "% 6.1f % 8s % 8s % 7.3f % 7s % 7s % 7s % 8.2f % 8.2f %5.2f(% 6.3f)"%	\
							(i.freq, raw, net,i.swr(), beam_width, rear, back, i.real, i.imag, i.AGT, i.agt))

		else:
			if header: 
				printOut( "%6s %7s %6s %8s %8s %7s %8s %8s %7s %12s"%("Freq", "Target", "Angle", "RawGain", "NetGain", "SWR", "Real", "Imag", "Diff", "AGT(corr)"))
				printOut( "=========================================================================================")
			for i in self.frequencies:
				if not i.valid():
					printOut( "%6.4g - invalid result"%i.freq)
				else:
					target = self.options.frequency_data[i.freq][1]
					printOut( "% 6.1f % 7.2f % 6.1f % 8.3f % 8.3f % 7.3f % 8.2f % 8.2f % 7.3f %5.2f(% 6.3f)"%(i.freq, target, i.angle, i.gain, i.net(),i.swr(), i.real, i.imag, target-i.net(), i.AGT, i.agt))
	def getGainSWRChartData(self):
		res = []
		for i in self.frequencies:
			res.append((int(i.freq), (i.net(),i.swr())))
		return res
	def horizontalPattern(self):
		res = {}
		for f in self.frequencies:
			res[f.freq] = [f.horizontalNet(phi) for phi in sorted(f.horizontal.keys())]
		
		return res

	def verticalPattern(self):
		res = {}
		for f in self.frequencies:
			res[f.freq] = [f.verticalNet(theta) for theta in sorted(f.vertical.keys())]
		
		return res

	def parse(self, output):
		file = open(output, "rt")
		try : 
			lines = file.readlines()
		finally:
			file.close()
		i=0
		freq = 0
		real = 0
		imag = 0
		while i < len(lines):
			ln = lines[i].strip()
			if ln == "- - - - - - FREQUENCY - - - - - -":
				i = i+2
				freq = float(lines[i].strip()[10:-4])
#				if not len(self.frequencies) or self.frequencies[-1].valid():
#					self.frequencies.append(FrequencyData(self.char_impedance))
#				self.frequencies[-1].freq = freq
			elif ln == "- - - ANTENNA INPUT PARAMETERS - - -":
				i=i+4
				real = float(lines[i][60:72]) # at least one linux engine has calculated negative real impedance...
				if real < 0:
					raise ValueError("engine reported negative real impedance for frequency %.1f"%freq)
				imag = float(lines[i][72:84])
#				self.frequencies[-1].real = float(lines[i][60:72])
#				self.frequencies[-1].imag = float(lines[i][72:84])
				fd = FrequencyData(self.options.char_impedance)
				fd.real = real
				fd.imag = imag
				self.frequencies.append(fd)
				fd.freq = freq
				fd.AGT = self.AGT
				fd.agt = self.agt

			elif ln == "- - - POWER BUDGET - - -":
				while i < len(lines):
					i+=1
					if len(lines[i]) < 60: continue
					if lines[0][43: 57] == "INPUT POWER   ": fd.input_power = float(lines[i][58:69])
					elif lines[0][43: 57] == "RADIATED POWER": fd.radiated_power = float(lines[i][58:69])
					elif lines[0][43: 57] == "STRUCTURE LOSS": fd.structure_loss = float(lines[i][58:69])
					elif lines[0][43: 57] == "NETWORK LOSS  ": fd.network_loss = float(lines[i][58:69])
					elif lines[0][43: 57] == "EFFICIENCY    ": 
						fd.efficiency = float(lines[i][58:65])
						break
					else: 
						break

				if fd.radiated_power < 0:
					raise ValueError("engine reported negative radiated power for frequency %.1f"%freq)
			elif ln =="- - - RADIATION PATTERNS - - -":
				i=i+5
				angle = self.options.forward_dir
#				freq = self.frequencies[-1].freq
				if freq in self.options.frequency_data.keys():
					angle = self.options.frequency_data[freq][0]
					while angle <0:angle+=360
					while angle >360:angle-=360
				while len(lines[i].strip()):
					ln = lines[i]
					if ln[0]=="*" or len(ln) < 8 :break
					try:
						#theta = float(ln[0:8])
						#phi = float(ln[8:17])
						#gain = float(ln[28:36])-self.agt
						ln = ln.split()
						theta = float(ln[0])
						phi = float(ln[1])
						gain = float(ln[2+self.options.gain_type])-self.agt
						if theta < 0 : 
							theta = -theta
							phi = (phi+540)
						phi = phi%360
						if abs(theta)==90 :
							fd.horizontal[phi]=gain
						if phi == 0:
							fd.vertical[theta]=gain
						if theta==90 and (abs(phi-angle)<=self.options.angle_step*.5) or theta==-90 and (abs(phi-180-angle)<=self.options.angle_step*.5):
							fd.gain = gain
							fd.angle = angle
						i = i+1
					except:
						break
			i = i+1
		if self.options.frequency_data:
			freqs = []
			for f in self.frequencies:
				if f.freq in self.options.frequency_data.keys():
					freqs.append(f)
			self.frequencies = freqs


import optparse 
class OptionParser(optparse.OptionParser):
	def __init__(self):
		optparse.OptionParser.__init__(self)
		self.add_option("-o", "--output-dir", type="string", metavar="DIR", dest="output", default=output, help="output path [%default]")
		self.add_option("-i", "--input", type="string", metavar="NEC_FILE", dest="input", default="", help="input nec file")
		self.add_option("-s", "--sweep", type="string", metavar="SWEEP", action="append", dest="sweeps", help="adds a sweep range e.g. -s (174,6,8) for vhf-hi freqs")
		self.add_option("-C", "--char-impedance", type="float", metavar="IMPEDANCE", default=300.0, help="The default is %default Ohms.")
		self.add_option("-u", "--uhf", "--uhf-52", action="append_const", dest="sweeps", const="(470,6,39)", help="adds a uhf (ch. 14-51) sweep")
		self.add_option("-U", "--uhf-69", action="append_const", dest="sweeps", const="(470,6,57)", help="adds a uhf (ch. 14-69) sweep")
		self.add_option("-V", "--vhf-hi", action="append_const", dest="sweeps", const="(174,6,8)", help="adds a vhf-hi (ch. 7-13) sweep")
		self.add_option("-v", "--vhf-lo", action="append_const", dest="sweeps", const="(54,6,6)", help="adds a vhf-lo (ch. 1-6) sweep")
		self.add_option("-n", "--num-cores", type="int", default=ncores, help="number of cores to be used, default=%default")
		self.add_option("-a", "--auto-segmentation", metavar="NUM_SEGMENTS", type="int", default=autosegmentation, help="autosegmentation level - set to 0 to turn autosegmentation off, default=%default")
		self.add_option("-e", "--engine", metavar="NEC_ENGINE", default="nec2dxs1k5", help="nec engine file name, default=%default")
		self.add_option("--engine-takes-cmd-args", default="auto", type="string", help="the nec engine takes command args, default=auto (which means no on windows yes otherwise). Other options are 'yes' or 'no'.")
		self.add_option("-d", "--min-wire-distance", default=.005, type="float", help="minimum surface-to-surface distance allowed between non-connecting wires, default=%default")
		self.add_option("--debug", default=0, type="int", help="turn on some loging")
		self.add_option("--forward-dir", default=0, type="int", help="the forward direction, by default is 0 which means the antenna forward is along X.")
		self.add_option("--backward-dir", default=180, type="int", help="the backward direction (relative to --forward-dir) to which F/R and F/B are calculated. The default is 180 which means the exact opposite of the forward-dir")
		self.add_option("--rear-angle", default=120, type="int", help="angle for calculating rear gain (max 270)")
		self.set_defaults(gain_type=1)
		self.add_option("--vertical-gain", action="store_const", const=0, dest="gain_type", help="calculate horizontal gain [default]")
		self.add_option("--horizontal-gain", action="store_const", const=1, dest="gain_type", help="calculate vertical gain")
		self.add_option("--total-gain", action="store_const", const=2, dest="gain_type", help="calculate total gain")
		self.add_option("-f", "--frequency_data", default = "{}", help="a map of frequency to (angle, expected_gain) tuple" )
		self.add_option("--cleanup", default=180, type="int", help="remove output files older than CLEANUP seconds. set to 0 to disable")
	def parse_args(self):
		options, args = optparse.OptionParser.parse_args(self)
		if options.rear_angle<0 or options.rear_angle>270: raise ValueError("Invalid rear angle of %d"%options.rear_angle)
		options.frequency_data = eval(options.frequency_data)
		if options.input == "":
			if len(args):
				options.input=args[0]
				del args[0]
			else:
				options.input = input
		while options.forward_dir < 0:
			options.forward_dir+=360
		while options.forward_dir > 360:
			options.forward_dir-=360
		options.backward_dir += options.forward_dir
		while options.backward_dir < 0:
			options.backward_dir+=360
		while options.backward_dir > 360:
			options.backward_dir-=360
		if options.sweeps:
			options.sweeps = map(eval,options.sweeps)
		return (options, args)

def optionParser():
	class MainOptionParser(OptionParser):
		def __init__(self):
			OptionParser.__init__(self)
			self.add_option("--param-values-file", default="", help="Read the parameter values from file, generate output.nec and evaluate it instead of the input file. The file should contain two lines: space separated parameter names on the first and space separated values on the second.")
			self.add_option("--agt-correction", default=1, type="int", help="ignored. agt correction is always applied")
			self.add_option("-c", "--centers", default=True, help="run sweep on the channel centers",action="store_false", dest="ends")
			self.add_option("--chart", default=0, action="store_true")
			self.add_option("--js-model", default=0, action="store_true", help="write jsmodel")
		def parse_args(self):
			options, args = OptionParser.parse_args(self)
			class Calc: pass
			options.calc = Calc()
			options.calc.gain=1
			options.calc.f2b=1
			options.calc.f2r=1
			options.quiet=0
			options.forward = 0
			options.verbose=0
			if not options.sweeps:
				options.sweeps = [(470,6,39)]
			if not options.ends:
				for i in range(len(options.sweeps)):
					if not options.sweeps[i][1]: continue
					options.sweeps[i] = (options.sweeps[i][0] - options.sweeps[i][1]/2, options.sweeps[i][1], options.sweeps[i][2]+1)
			return (options, args)
	return MainOptionParser()


def run(options):
	nf = NecFileObject(options)
	nf.evaluate(options.chart)

def main():
#default values
	options, args = optionParser().parse_args()
	run(options)
	for inp in args:
		if inp[0]!="-":
			options.input = inp
			try:
				run(options)
			except:
				traceback.print_exc()
				pass
	


if __name__ == "__main__":
	main()
