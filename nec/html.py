from __future__ import division
import math, os

gdrive_link_base = "https://drive.google.com/uc?id="#confirm=no_antivirus&id="

antenna_min_code = "0B4XLhzD2JVjBWkY0bXU4UUNKNXc"
gline_min_code = "0B4XLhzD2JVjBdXdla09IMGxsTUU"
graphael_min_code = "0B4XLhzD2JVjBSU9zMllJTWhLeDA"
raphael_min_code = "0B4XLhzD2JVjBc0JpcWtoMXVGSGc"
sylvester_min_code = "0B4XLhzD2JVjBck9vMExqSk1VM3M"

website_link_base = "file:///"+os.path.join(os.path.dirname(__file__), "html").replace(os.sep,"/")
antenna_min_url = "/js/antenna-min.js"
gline_min_url = "/js/g.line-min.js"
graphael_min_url = "/js/g.raphael-min.js"
raphael_min_url = "/js/raphael-min.js"
sylvester_min_url = "/js/sylvester-min.js"
nec2_code_viewer_url = "/js/nec2_code_viewer2-min.js"
antenna_model_viewer_min = "/js/antenna-model-viewer-min.js"
tabs_css_url = "/blueprint/tabs.css"
blueprint_screen_url = "/blueprint/screen.css"
blueprint_print_url = "/blueprint/print.css"
blueprint_ie_url = "/blueprint/ie.css"
custom_css_url = "/custom.css"
menu_url = "/js/menu.js"

website_link_base_publish = "http://clients.teksavvy.com/~nickm/"

#website_link_base = "http://clients.teksavvy.com/~nickm/antenna-api/"
#antenna_min_url = "antenna-min.js"
#gline_min_url = "g.line-min.js"
#graphael_min_url = "g.raphael-min.js"
#raphael_min_url = "raphael-min.js"
#sylvester_min_url = "sylvester-min.js"
#nec2_code_viewer_url = "nec2_code_viewer2-min.js"
#antenna_model_viewer_min = "antenna-model-viewer-min.js"
#tabs_css_url = "tabs.css"
#blueprint_screen_url = "../blueprint/screen.css"
#blueprint_print_url = "../blueprint/print.css"
#blueprint_ie_url = "../blueprint/ie.css"
#custom_css_url = "../custom.css"
#menu_url = "../js/menu.js"

def html (website_link_base):
	return  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n\
<html xmlns="http://www.w3.org/1999/xhtml">\n\
<head>\n\
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n\
	<meta name="author" content="Nikolay Mladenov" />\n\
	<meta name="description" content="User javascripts for viewing nec2 models" />\n\
	<meta name="keywords" content="antenna, model, chart, publishing" />\n\
	<meta name="author" content="Nikolay Mladenov" />\n\
	<title>%(title)s</title>\n\
	<link rel="stylesheet" href="'+website_link_base+tabs_css_url+'" type="text/css" media="screen"/>\n\
	<!-- Framework CSS -->\n\
	<link rel="stylesheet" href="'+website_link_base+blueprint_screen_url+'" type="text/css" media="screen, projection" />\n\
	<link rel="stylesheet" href="'+website_link_base+blueprint_print_url+'" type="text/css" media="print" />\n\
	<!--[if lt IE 8]><link rel="stylesheet" href="'+website_link_base+blueprint_ie_url+'" type="text/css" media="screen, projection"/><![endif]-->\n\
	<link rel="stylesheet" href="'+website_link_base+custom_css_url+'" type="text/css" media="screen, projection, print" />\n\
	<script src="'+website_link_base+raphael_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+graphael_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+gline_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+sylvester_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+antenna_min_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+menu_url+'" type="text/javascript" charset="utf-8"></script>\n\
	\n\
	<script type="text/javascript" charset="utf-8">\n\
		NecViewer = {code:"",embeded:1}\n\
	</script>\n\
	<script src="'+website_link_base+antenna_model_viewer_min+'" type="text/javascript" charset="utf-8"></script>\n\
	<script src="'+website_link_base+nec2_code_viewer_url+'" type="text/javascript" charset="utf-8"></script>\n\
	<script type="text/javascript" charset="utf-8">\n\
		var height = NecViewer.getClientHeight()-100,  width = NecViewer.getClientWidth()-250;\n\
		var showTab = function (id) \n\
		{\n\
			var i, divs = document.getElementsByTagName("div"),\n\
				tabs = document.getElementById("tabs").getElementsByTagName("a");\n\
			for(i=0; i!=divs.length; ++i)\n\
				if (divs[i].className !="tab")\n\
					continue;\n\
				else if (divs[i].id == id)\n\
					divs[i].style.display = "block";\n\
				else\n\
					divs[i].style.display = "none";\n\
			for(i=0; i!=tabs.length; ++i)\n\
				if (tabs[i].id == id+"_tab")\n\
					tabs[i].className = "selected";\n\
				else\n\
					tabs[i].className = "";\n\
		}\n\
		\n\
		var showNecCode = function() \n\
		{\n\
			showTab("nec_code");\n\
		}\n\
		var showNecModel = function() \n\
		{\n\
			var nec_code_div = document.getElementById("nec_code")\n\
				, nec_model_div = document.getElementById("nec_model")\n\
				, code = nec_code_div.getElementsByTagName("textarea")[0].value + ""\n\
				, link, linktext = document.getElementById("linktext")\n\
				, linklink = document.getElementById("linklink")\n\
				, inlinelinktext = document.getElementById("inlinelinktext")\n\
				, inlinelinklink = document.getElementById("inlinelinklink")\n\
				;\n\
			\n\
			if (NecViewer.code != code) {\n\
				NecViewer.code = code;\n\
				link = NecViewer.extractNecGeometry(code, "%(model_name)s");\n\
				link = link.replace("_g2.html", "_g2.html?id=%(model_name)s");\n\
				nec_model_div.innerHTML = "<object data=\\"" + link + "\\" style=\\"height:100%%; width:100%%;\\"></object>";\n\
				linktext.value = link;\n\
				linklink.href = link;\n\
				linklink.setAttribute("target", "_blank");\n\
				link = link.replace("_g2.html", "g2.html");\n\
				inlinelinktext.value = link;\n\
				inlinelinklink.href = link;\n\
				inlinelinklink.setAttribute("target", "_blank");\n\
			}\n\
			linktext.select();\n\
			showTab("nec_model");\n\
		}\n\
	</script>\n\
	<script type="text/javascript" charset="utf-8">\n\
		window.onload = function() \n\
		{\n\
			createMenu("eval_viewer", "http://clients.teksavvy.com/~nickm/", 1);\n\
			var i, divs = document.getElementsByTagName("div");\n\
			for(i=0; i!=divs.length; ++i)\n\
				if (divs[i].className !="tab")\n\
					continue;\n\
				else{\n\
					divs[i].style.width = width+"px";\n\
					divs[i].style.height = height+"px";\n\
				}\n\
			%(startup_code)s\n\
			showTab("nec_code"); \n\
		};\n\
	</script>\n\
</head>\n\
\n\
<body>\n\
<div id="menu" style="float:left; width:190px; background-color:#E5ECF9; margin-left:10px; margin-top:20px; padding:10px"></div>\n\
<div style="margin-top:20px; margin-right:10px; margin-left:240px">\n\
	<div>\n\
		<ul class="tabs" id="tabs">\n\
			<li><a class="selected" id="nec_code_tab" href="javascript:showNecCode()">Nec code</a></li>\n\
			<li><a id="nec_model_tab" href="javascript:showNecModel()">Model</a></li>\n\
			<li><a id="pattern_tab" href="javascript:showTab(\'pattern\')">Pattern</a></li>\n\
			%(chart_tabs)s\n\
			<li><a id="results_tab" href="javascript:showTab(\'results\')">Results</a></li>\n\
			<li><a id="links_tab" href="javascript:showTab(\'links\')">Links</a></li>\n\
		</ul>\n\
		<div class="tab" id="nec_code" style="height: 100%%; width:100%%;">\n\
			<textarea class="" style="padding: 0px; margin: 0; width:100%%; height:98%%; overflow: auto;" >\n\
%(nec_code)s\n\
			</textarea>\n\
		</div>\n\
		<div class="tab" id="nec_model" style="height: 100%%; width:100%%;"></div>\n\
		<div class="tab" id="pattern" style="height: 100%%; width:100%%;"></div>\n\
		%(chart_divs)s\n\
		<div class="tab" id="results" style="height: 100%%; width:100%%;">\n\
			<pre style="height: 94%%; width:97%%;overflow: auto; margin: 0px;padding: 1%%;border: 2px inset;">\n\
%(results)s\n\
			</pre></div>\n\
		<div class="tab" id="links" style="height: 100%%; width:100%%;">\n\
			<div class=""><a id="linklink" href="javascript:void(0);" title="Opens in a new window">Model Link: </a>\n\
				<div class=""><input style="width:100%%" type="text" id="linktext"/></div>\n\
			</div>\n\
			<div class=""><a id="inlinelinklink" href="javascript:void(0);" title="Opens in a new window">Model Link that will be displayed inline on DHC: </a>\n\
				<div class=""><input style="width:100%%" type="text" id="inlinelinktext"/></div>\n\
			</div>\n\
			%(chart_links)s\n\
			%(pattern_link)s\n\
		</div>\n\
	</div>\n\
	<div><p>Copyright 2013 Nikolay Mladenov. Email: nikolay dot mladenov at gmail dot com</p></div>\n\
</div>\n\
</body>\n\
</html>\n\
'

class HtmlOutput:
	def __init__(self, title):
		self.title = title
		self.h_pattern_script = []
		self.chart_scripts = []
		self.chart_tabs = []
		self.chart_divs = []
		self.chart_links = []
		self.pattern_link = ""
		self.nec_code = ""
		self.eval_results = ""
		self.model_name = os.path.basename(title)
	def writeToFile(self, filename, publish):
		file = open(filename,"wt")
		file.writelines(html(website_link_base_publish if publish else website_link_base) % 
			{"title":self.title
			,"nec_code":self.nec_code
			, "chart_links" : "".join(self.chart_links)
			, "chart_divs" : "".join(self.chart_divs)
			, "chart_tabs" : "".join(self.chart_tabs)
			, "startup_code" : "".join(self.h_pattern_script + self.chart_scripts)
			, "results": self.eval_results
			, "model_name": self.model_name
			, "pattern_link": self.pattern_link
			})
		file.close()
		
	def addResults(self, results):
		self.eval_results = results
	def addNec(self, nec):
		self.nec_code = "\n".join(nec)
	def addVPattern(self, data):
		pass
	def convertInt(self, i):
		i = int(i)
		assert( i>=0 and i < 64)
		if i < 10 : return chr(ord('0')+i)
		i-=10
		if i < 26 : return chr(ord('a')+i)
		i-=26
		if i < 26 : return chr(ord('A')+i)
		i-=26
		if not i : return '_'
		return '-'
		
	def convertNumber(self, number):
		assert( number>=0)
		i = int(number)
		dec = number - i
		dec = round(dec/(1./64))
		if dec == 64:
			dec = 0
			i+=1
		if i > 63 :return "+"
		return self.convertInt(i)+self.convertInt(dec)
		
	def isPatternSymmetric(self, data):
		for key in data.keys():
			d = data[key]
			l = int(len(d)/2)
			for i in range(1,l):
				if abs(d[i] - d[-i]) > 1.e-4:
					return 0
		return 1
	def addHPattern(self, sweeps, data):
		sym = self.isPatternSymmetric(data)
		pattern_link="chp.html?id=%s#"%self.model_name
		pattern_link+="&".join(map(lambda x: "sweep=[%g,%g,%g]"%(x[0],x[1],x[2]), sweeps ) )
		
		keys = sorted(data.keys())
		self.h_pattern_script = []
		if not keys: return
		self.h_pattern_script.append("var pattern_freqs = %s;\n"%str(list(map(lambda x: str(x)+"MHz", keys))) )
		freq_len = 0
		self.h_pattern_script.append("var pattern_model = [[\n")
		for i in range(len(keys)):
			key = keys[i]
			d = data[key]
			l = int(len(d)/2)+1 if sym else len(d);
			if not i:
				freq_len = l
			s = "["+("%.2f,"*l)[0:-1]%tuple(d[0:l])+"]\n"
			if i: self.h_pattern_script.append(","+s)
			else: self.h_pattern_script.append(s)
		self.h_pattern_script.append("]];\n")
		self.h_pattern_script.append("var ptrn = new AntennaHPattern('pattern', Math.min(height,width), pattern_freqs, pattern_model,%d, ['%s'],[['#000','#ccc']]);\n"%(sym,self.model_name))
		self.h_pattern_script.append("ptrn.draw();\n")
		sweeps = sorted(sweeps)
		max_gain = max(map(lambda x: max(data[x]), keys) )
		pattern_link+="&hpmeta=%g,%d,%d,%s"%(max_gain, freq_len, sym,self.model_name)
		pattern_link+="&hpdata="
		for sweep in sweeps:
			for i in range(sweep[2]):
				key = sweep[0]+i*sweep[1]
				d = data[key]
				pattern_link+="".join(map(lambda x: self.convertNumber(max_gain-x), d[0:freq_len]))
		self.pattern_link = '<div><a href="http://clients.teksavvy.com/~nickm/viewer/'+pattern_link+'">pattern viewer link</a></div>\n'
		
	def addGainChart(self, sweeps, gain_swr_data, char_impedance):
		gain_swr_data = dict(gain_swr_data)
		for sweep in sweeps:
			sweep_title = str(sweep[0])
			if sweep[2]>1:
				sweep_title+="-"+str(sweep[0]+(sweep[2]-1)*sweep[1])
			else:
				continue
			sweep_name = "sweep-"+sweep_title
			freqs = []
			gains = []
			raws = []
			swrs = []
			for i in range(sweep[2]):
				freqs.append(sweep[0]+i*sweep[1])
			for f in sorted(gain_swr_data.keys()):
				m = round((f - sweep[0])/sweep[1])
				if m>=0 and m < sweep[2] and abs(f - sweep[0] - m*sweep[1]) < 1.0e-8:
					gains.append(gain_swr_data[f][0])
					swrs.append(gain_swr_data[f][1])
					raws.append(gain_swr_data[f][2])
			if not freqs or not gains: continue

			gains = list(map(lambda x: round(x,2),gains))
			raws = list(map(lambda x: round(x,2),raws))
			swrs = list(map(lambda x: round(x,2),swrs))

			min_gain = math.floor(min(gains))
			max_gain = math.ceil(max(raws))
			min_swr = math.floor(min(swrs))
			max_swr = math.ceil(max(swrs))
			min_gain =  min_gain-4-2*(max_swr-1)
			min_h = max(24*(max_gain-min_gain)+40, 240)
			self.chart_tabs.append( '<li><a id="%(name)s_tab" href="javascript:showTab(\'%(name)s\')">%(name)s</a></li>\n' %{"name":sweep_name})
			self.chart_divs.append( '<div class="tab" id="%s" style="height: %dpx; width:80%%"></div>\n'%(sweep_name, min_h))
			self.chart_links.append( '<div><a href="http://clients.teksavvy.com/~nickm/viewer/c.html?id=%s#title=%s Gain and SWR(%d Ohm)&sweep=[%g,%g,%g]&amp;gain=[%s]&amp;raw=[%s]&amp;swr=[%s]">%s chart viewer link</a></div>\n'%
				(self.model_name, self.model_name, char_impedance, sweep[0],sweep[1],sweep[2], ("%g,"*len(gains))[0:-1]%tuple(gains), ("%g,"*len(raws))[0:-1]%tuple(raws), ("%g,"*len(swrs))[0:-1]%tuple(swrs), sweep_name ))
			self.chart_scripts.append('gainChart("%(sweep_name)s", width*.75, %(height)d, %(freqs)s,%(gains)s,%(swrs)s, %(min_gain)d, %(max_gain)d, %(max_swr).1f, "%(title)s");\n' % {
				'sweep_name':sweep_name,
				'height': min_h-40,
				'freqs' : str(freqs),
				'gains' : str([["%s net gain - ave %.2fdBi"%(sweep_title,sum(gains)/len(gains)),"#000"]+gains, ["%s raw gain - ave %.2fdBi"%(sweep_title,sum(raws)/len(raws)),"#777"]+raws]),
				'swrs'  : str([["%s swr"%sweep_title,"#aaa"]+swrs]),
				'min_gain' : int(min_gain),
				'max_gain' : int(max_gain),
				'max_swr' : 1+(max_gain-min_gain)/2,
				'title'   : self.model_name+ " / " + sweep_title+" Net gain and SWR(%d Ohm)"%char_impedance
				})


