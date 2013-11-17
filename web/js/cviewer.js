var chartViewer = function(rwidth, rheight, loca){
var replace='replace',
    length='length',
    split = 'split',
    indexOf = 'indexOf',
    substr = 'substr',
    floor = Math.floor,
    ceil = Math.ceil,
    max = Math.max,
    min = Math.min,
    round = Math.round,
    concat = 'concat',
    push = 'push',
    width = (rwidth || getClientWidth()),
    height = (rheight || getClientHeight()),
throwEx = function(e)
{
	throw e;
},
validate = function(g)
{
	var splits = g[split](','),i,res=[],n;
	for(i=0;i!=splits[length];++i)
	{
		n = Number(splits[i]);
		if(isNaN(n))
			throwEx("Invalid geometry token "+splits[i]);
		res.push(n);
	}
	return res;
},
cleanupURL = function(s)
{
	var subs = 
		[".html#", ".html?", /%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,""
		,/%20/g,' ',/%5B;/g,"[",/%5D;/g,"]",/&#38;/g
		,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,""
		,/&#32;/g," ",/&#91;/g,"[",/&#93;/g,"]"
		,/"/g,"",/'/g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&"
		,/\[/g,"",/\]/g,""
		], l = subs[length],i;
	for(i=0;i!=l; i+=2){
		s = s[replace](subs[i],subs[i+1]);
	}
	return s;
},
	loc = loca || cleanupURL(decodeURI(window.location.toString()))
	,parts = loc[split](/[?&]/)
	,title="Net gain and SWR",s,g,i
	, newChart = function(freqs,ttl){ return {f:freqs, t:ttl, mt:[], g:[], s:[]} }
	, expandSweep = function(s){var freqs=[],i; for(i = 0; i!=s[2]; ++i){freqs.push(s[0]+i*s[1]);}return freqs;}
	, charts = []
	, checkCharts = function(){if(!charts[length])throwEx("sweep or freqs needed before swr");}
	, average = function (arr, append){ var sum = 0,i; for(i=0; i!=arr[length]; ++i){sum +=arr[i];} return round(100*sum / arr[length])/100+append;}
	, validateChart =function(c){
		if(!c.g.length)
		{
			throwEx("Gain not found");
		}
		if(c.s[length] && c.g[length]!=c.s[length])
		{
			throwEx( "Gain/SWR length mismatch");
		}
		if(c.mt[length] && c.g[length]!=c.mt[length])
		{
			throwEx( "Gain/Titles length mismatch");
		}
		for(var i=0; i!=c.g[length]; ++i)
		{
			if(c.g[i][length]!=c.f[length])
				throwEx("Gain/Frequences length mismatch");
			if(c.s[length] && c.s[i][length] && c.s[i][length]!=c.f[length])
				throwEx("SWR/Frequences length mismatch");
		}
	}, createChart = function(c, id, w, h){
		validateChart(c);
		var min_gain = min.apply(null,c.g[0]), max_gain=max.apply(null,c.g[0]), max_swr=c.s[length]?ceil(max.apply(max, c.s[0])):1, i
			, gain = [(c.mt[length]?[c.mt[0][0]+" gain - ave "+average(c.g[0],"dBi"), c.mt[0][1]]:["Gain - ave "+average(c.g[0],"dBi"), "#000"])[concat](c.g[0])]
			, swr =  [(c.mt[length]?[c.mt[0][0]+" swr - ave " +average(c.s[0],0)    , c.mt[0][2]]:["SWR - ave " +average(c.s[0],0)    , "#888"])[concat](c.s[0])]
			;
		for(i=1; i != c.g[length]; ++i)
		{
			min_gain = min(min_gain,min.apply(null,c.g[i]) );
			max_gain = max(max_gain,max.apply(null,c.g[i]) );
			if(c.s[length] && c.s[i][length])
			{
				max_swr = max(max_swr,max.apply(null,c.s[i]) );
				swr.push((c.mt[length]&&c.mt[i][length]?[c.mt[i][0]+" swr - ave " +average(c.s[i],0)    , c.mt[i][2]]:["SWR - ave " +average(c.s[i],0)    , "#888"])[concat](c.s[i]));
			}
			gain.push((c.mt[length]&&c.mt[i][length]?[c.mt[i][0]+" gain - ave "+average(c.g[i],"dBi"), c.mt[i][1]]:["Gain - ave "+average(c.g[i],"dBi"), "#000"])[concat](c.g[i]));
		}


		min_gain = floor(min_gain);
		max_gain = ceil(max_gain);
		max_swr = ceil(max_swr);
		min_gain =  min_gain-4-2*(max_swr-1);
		max_swr = 1+(max_gain-min_gain)/2;
		gainSwrChart(id, w, h, c.f ,gain,swr, round(min_gain), round(max_gain), round(max_swr*10)/10.0, c.t);
	}
	,splitDiv = function(id, count)
	{
		var d=document
			, createElement="createElement"
			, style="style"
			, setAttribute="setAttribute"
			, appendChild="appendChild"
			, div = d.getElementById(id)
			, table = d[createElement]("table")
			, tr, td,i;
		;
		div[appendChild](table);
	       	table[style].height = table[style].width = "100%"; 
		for(i=0; i!=count; ++i)
		{
			tr = d[createElement]("tr");
			table[appendChild](tr);
			td = d[createElement]("td");
			tr[appendChild](td);
			div = d[createElement]("div");
			td[appendChild](div);
			div[setAttribute]("id", id+i);
		}
	};
	for(i = 1; i< parts[length]; ++i)
	{
		s = parts[i][indexOf]("mtitle=");
		if(s !=-1){
			s = parts[i][substr](s+7)[split](',');
			if(s[length] <3)
				continue;
			checkCharts();
			g = s[1].match(/[0-9,a-f,A-F]{6}|[0-9,a-f,A-F]{3}/);
			if(g && s[1]==g[0] )
				s[1] = "#"+g[0];
			else
				s[1] = colorNameToHex(s[1])||"#000";

			g = s[2].match(/[0-9,a-f,A-F]{6}|[0-9,a-f,A-F]{3}/);
			if(g && s[2]==g[0] )
				s[2] = "#"+g[0];
			else
				s[2] = colorNameToHex(s[2])||"#000";

			charts[charts[length]-1].mt.push(s);
			continue;
		}
		s = parts[i][indexOf]("title=");
		if(s !=-1){
			title=parts[i][substr](s+6);
			continue;
		}
		parts[i] =parts[i][replace](/ /g ,"");

		s = parts[i][indexOf]("sweep=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				charts[push](newChart(expandSweep(validate(g)),title));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("freqs=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				charts[push](newChart(validate(g),title));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("gain=");
		if(s !=-1){
			checkCharts();
			g = parts[i][substr](s+5);
			try{
				charts[charts[length]-1].g[push](validate(g));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("swr=");
		if(s !=-1){
			checkCharts();
			g = parts[i][substr](s+4);
			try{
				charts[charts[length]-1].s[push](validate(g));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
	}
	height/=charts[length];
	if(charts[length]>1){
		splitDiv("chart", charts[length]);
		for(i=0; i!=charts[length]; ++i)
		{
			createChart(charts[i], "chart"+i, width-30, height-30);
		}
	}else
	{
		createChart(charts[0],"chart", width-30, height-30);
	}
}
