import math

gdrive_link_base = "https://drive.google.com/uc?id="#confirm=no_antivirus&id="

antenna_min_code = "0B4XLhzD2JVjBWkY0bXU4UUNKNXc"
gline_min_code = "0B4XLhzD2JVjBdXdla09IMGxsTUU"
graphael_min_code = "0B4XLhzD2JVjBSU9zMllJTWhLeDA"
raphael_min_code = "0B4XLhzD2JVjBc0JpcWtoMXVGSGc"
sylvester_min_code = "0B4XLhzD2JVjBck9vMExqSk1VM3M"

website_link_base = "http://clients.teksavvy.com/~nickm/antenna-api/"
antenna_min_url = "antenna-min.js"
gline_min_url = "g.line-min.js"
graphael_min_url = "g.raphael-min.js"
raphael_min_url = "raphael-min.js"
sylvester_min_url = "sylvester-min.js"

head = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n\
<html xmlns="http://www.w3.org/1999/xhtml">\n\
<head>\n\
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n\
	<title>%s</title>\n\
	<script src="'+website_link_base+raphael_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+graphael_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+gline_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+sylvester_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+antenna_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript" charset="utf-8"></script>\n\
	<script type="text/javascript" charset="utf-8">\n\
$(document).ready (function(){\n\
	var width =getClientWidth(),height = getClientHeight();\n\
'

body_start = '});\n\
\n\
</script>\n\
</head>\n\
<body>\n\
<div>\n\
	<h1> Model </h1>\n\
	<div id="geometry"></div>\n\
	<hr/>\n\
	<h1> Pattern </h1>\n\
	<div id="pattern"></div>\n\
	<hr/>\n\
	<h1> Charts </h1>\n\
'

body_end = '\n\
	<hr/>\n\
	<div><p>Copyright 2013 Nikolay Mladenov.<br/> nikolay dot mladenov at gmail dot com</p></div>\n\
</div>\n\
</body>\n\
</html>\n\
'

def jsModelFromLines(lines, comments):
	z = list(zip(comments,lines))
	z.sort()

	res = ["var structure = [["]
	if not z:
		res.append("]]")
		return (res,.0,.0)
	c = z[0][0].strip()
	res.append( '"%s"'%c)
	_min = .0
	_max = .0
	for i in z:
		if i[0].strip() != c:
			c = i[0].strip()
			res.append( '], ["%s"'%c)
		ln = i[1]
		res.append( (",%.4f"*6) % tuple(ln[2:8]))
		_min = min(min(ln[2:8]),_min)
		_max = max(max(ln[2:8]),_max)
	res.append( "]]")
	return (res, _min, _max)


class HtmlOutput:
	def __init__(self, title):
		self.head = [head % title]
		self.body_start = [body_start]
		self.js_model_added = 0
	def writeToFile(self, filename):
		file = open(filename,"wt")
		file.writelines(self.head)
		file.writelines(self.body_start)
		file.write(body_end)
		file.close()
	def addJSModel(self, lines, comments):
		if self.js_model_added: return 
		js_model, _min, _max = jsModelFromLines(lines, comments)
		js_model[-1]=js_model[-1]+';\n'
		js_model.append("var geom = new antennaGeometry('geometry', Math.max(width-20,0),Math.max(height-30,0), Math.min(height,width)/%f, structure,0, 0);\n"% (2.0/max(.1,-_min,_max)))
		js_model.append("geom.redraw();\n")
		self.head+=js_model
		self.js_model_added = 1

	def addVPattern(self, data):
		pass
	def addHPattern(self, data):
		keys = sorted(data.keys())
		if not keys: return
		self.head.append("var pattern_freqs = %s;\n"%str(keys))
		self.head.append("var pattern_model = [[\n")
		for i in range(len(keys)):
			key = keys[i]
			l = int(len(data[key])/2)+1;
			s = "["+("%.2f,"*l)[0:-1]%tuple(data[key][0:l])+"]\n"
			if i: self.head.append(","+s)
			else: self.head.append(s)
		self.head.append("]];\n")
		self.head.append("var ptrn = new AntennaHPattern('pattern', Math.min(height,width), pattern_freqs, pattern_model,1, [''],[['#000','#ccc']]);\n")
		self.head.append("ptrn.draw();\n")

	def addGainChart(self, sweeps, gain_swr_data):
		gain_swr_data = dict(gain_swr_data)
		for sweep in sweeps:
			sweep_title = str(sweep[0])
			if sweep[2]>1:
				sweep_title+="-"+str(sweep[0]+(sweep[2]-1)*sweep[1])
			sweep_name = "sweep-"+sweep_title
			freqs = []
			gains = []
			swrs = []
			for i in range(sweep[2]):
				freqs.append(sweep[0]+i*sweep[1])
			for f in sorted(gain_swr_data.keys()):
				m = round((f - sweep[0])/sweep[1])
				if m>=0 and m < sweep[2] and abs(f - sweep[0] - m*sweep[1]) < 1.0e-8:
					gains.append(gain_swr_data[f][0])
					swrs.append(gain_swr_data[f][1])
			if not freqs: continue

			min_gain = math.floor(min(gains))
			max_gain = math.ceil(max(gains))
			min_swr = math.floor(min(swrs))
			max_swr = math.ceil(max(swrs))
			min_gain =  min_gain-4-2*(max_swr-1)
			min_h = max(24*(max_gain-min_gain)+40, 240)
			self.body_start.append( '<div id="%s" style="height: %dpx; width:80%%"></div><hr/>\n'%(sweep_name, min_h))
			self.head.append('gainChart("%(sweep_name)s", width*.75, %(height)d, %(freqs)s,%(gains)s,%(swrs)s, %(min_gain)d, %(max_gain)d, %(max_swr).1f, "%(title)s");\n' % {
				'sweep_name':sweep_name,
				'height': min_h-40,
				'freqs' : str(freqs),
				'gains' : str([["%s gain - ave %.2fdBi"%(sweep_title,sum(gains)/len(gains)),"#000"]+list(map(lambda x: round(x,2),gains))]),
				'swrs'  : str([["%s swr"%sweep_title,"#888"]+list(map(lambda x: round(x,2),swrs))]),
				'min_gain' : int(min_gain),
				'max_gain' : int(max_gain),
				'max_swr' : 1+(max_gain-min_gain)/2,
				'title'   : sweep_title+" Net gain and SWR"
				})


