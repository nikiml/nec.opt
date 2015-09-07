# Copyright 2010 Nikolay Mladenov, Distributed under 
# GNU General Public License
from __future__ import division

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
		lines = []
		if not self.options.frequency_data:
			if header: 
				l = " %6s%14s%6s%6s%14s%16s%11s"%(" ", "--- Gain ---", " ", " ", "-- Ratios --", "-- Impedance --", " ")
				printOut( l )
				lines.append(l)
				l = " %6s%7s%7s%6s%6s%7s%7s%8s%8s%5s%6s"%("Freq", "Raw", "Net", "SWR", "BeamW", "F/R", "F/B", "Real", "Imag", "AGT", "corr")
				printOut( l )
				lines.append(l)
				l = "=========================================================================="
				printOut( l)
				lines.append(l)
			#if self.agt!=0:
			#	printOut( "AGT=%g dB"%self.agt)
			for i in self.frequencies:
				if not i.valid():
					l = "%6.1f - invalid result"%i.freq
					printOut( l)
					lines.append(l)
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
							rear = "% 7.2f"%(net-rear)
						if self.options.calc.f2b:
							back = i.backwardGain(self.options.backward_dir)
							back = "% 7.2f"%(net-back)
						raw = "% 7.2f"%raw
						net = "% 7.2f"%net
						if self.options.calc.beam_width:
							beam_width = "% 6.1f"%i.beamWidth(self.options.forward_dir, self.options.angle_step, self.options.beamwidth_ratio)
					l = " % 6.1f% 7s% 7s% 6.2f% 6s% 7s% 7s% 8.2f% 8.2f%5.2f% 6.2f"%(i.freq, raw, net,i.swr(), beam_width, rear, back, i.real, i.imag, i.AGT, i.agt)
					printOut( l)
					lines.append(l)

		else:
			if header: 
				l = " %6s%7s%28s%6s%16s%12s"%(" ", " ", "- - - - - - Gain - - - - - -", " ", "-- Impedance --", " ")
				printOut( l )
				lines.append(l)
				l = " %6s%7s%7s%7s%7s%7s%6s%8s%8s%5s%6s"%("Freq", "Angle", "Goal", "Diff", "Raw", "Net", "SWR", "Real", "Imag", "AGT", "corr")
				printOut( l)
				lines.append(l)
				l = "============================================================================"
				printOut( l)
				lines.append(l)
			for i in self.frequencies:
				if not i.valid():
					l = " %6.4g - invalid result"%i.freq
					printOut( l)
					lines.append(l)
				else:
					target = self.options.frequency_data[i.freq][1]
					l = " % 6.1f% 7.1f% 7.2f% 7.2f% 7.2f% 7.2f% 6.2f% 8.2f% 8.2f%5.2f% 6.2f"%(i.freq, i.angle, target, target-i.net(), i.gain, i.net(),i.swr(), i.real, i.imag, i.AGT, i.agt)
					printOut( l)
					lines.append(l)
		return lines
	def getGainSWRChartData(self):
		res = []
		for i in self.frequencies:
			res.append((i.freq, (i.net(),i.swr(), i.gain )))
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
				if real <= 0:
					raise ValueError("engine reported invalid real impedance %.4f for frequency %.1f"%(real,freq) )
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
