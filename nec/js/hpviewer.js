var hpViewer = function(rwidth, rheight, loca){
var replace='replace',
    length='length',
    split = 'split',
    indexOf = 'indexOf',
    substr = 'substr',
    min = Math.min,
    round = Math.round,
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
			if(isNaN(n)){
				throwEx("Invalid geometry token "+splits[i]);
			}
			res.push(n);
		}
		return res;
	},
	cleanupURL = function(s)
	{
		var subs = 
			[".html#", ".html?", /%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,"",
			/%20/g,' ',/%5B;/g,"[",/%5D;/g,"]",/&#38;/g,
			"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,"",
			/&#32;/g," ",/&#91;/g,"[",/&#93;/g,"]",
			/"/g,"",/'/g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&",
			/\[/g,"",/\]/g,""], 
			l = subs[length],i;
		for(i=0;i!=l; i+=2){
			s = s[replace](subs[i],subs[i+1]);
		}
		return s;
	},
	loc = loca || cleanupURL(decodeURI(window.location.toString())),
	parts = loc[split](/[?#&]/),
	s,g,i, 
	expandSweep = function(s){var freqs=[],i; for(i = 0; i!=s[2]; ++i){freqs.push(s[0]+i*s[1]);}return freqs;}, 
	hpmeta,hpdata,freqs=[],
	decompressChar = function(c)
	{
		var i=0, ord = function(c){return c.charCodeAt(); };
		c = ord(c);
		if (c>=ord('0') && c <= ord('9') ){ i+=c-ord('0'); return i;}
		i+=10;
		if (c>=ord('a') && c <= ord('z') ){ i+=c-ord('a'); return i;}
		i+=26;
		if (c>=ord('A') && c <= ord('Z') ){ i+=c-ord('A'); return i;}
		i+=26;
		if (c == ord('_') ) { return i; }
		return i+1;
	},
	decompressNumber = function(i, d)
	{
		return decompressChar(i) + decompressChar(d)/64.0;
	},
	decompressModel = function(max_gain,freq_len, data)
	{
		var len = data.length,i, model=[], freq = [], val;
		for(i=0; i!=len; ++i )
		{
			if(freq.length == freq_len)
			{
				model.push(freq);
				freq = [];
			}
			if(data.charAt(i)=='+'){
				freq.push(max_gain - 64);
				continue;
			}
			++i;
			if (i == len){break;}
			val = max_gain - decompressNumber(data.charAt(i-1), data.charAt(i));
			freq.push(round(100*val)/100);
		}
		if(freq.length){
			model.push(freq);
		}
		return model;
	},
	createPattern = function(meta,data,freqs, id, w, h){
		var max_gain = Number(meta[0]),
			freq_len = Number(meta[1]),
			symmetrical = Number(meta[2]),
			title = meta[3],
			pattern_model,
			ptrn;
			if(isNaN(max_gain) || isNaN(freq_len) || isNaN(symmetrical) )
			{
				throwEx("Invalid number token in hpmeta");
			}
			pattern_model = decompressModel(max_gain, freq_len, data);
			ptrn = new AntennaHPattern(id, min(h,w), freqs.map(function(x){return x+"MHz";}), [pattern_model],symmetrical, [title],[['#000','#ccc']]);
				
			ptrn.draw();
	};
	for(i = 1; i< parts[length]; ++i)
	{
		s = parts[i][indexOf]("hpmeta=");
		if(s !=-1){
			hpmeta=parts[i][substr](s+7).split(',');
			continue;
		}
		parts[i] =parts[i][replace](/ /g ,"");

		s = parts[i][indexOf]("sweep=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				freqs[push].apply(freqs, expandSweep(validate(g)));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("freqs=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				freqs[push].apply(freqs, validate(g));
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("hpdata=");
		if(s !=-1){
			hpdata = parts[i][substr](s+7);
			continue;
		}
	}
	createPattern(hpmeta,hpdata,freqs, "pattern", width-30, height-30);
};
