var chartViewer = function(rwidth, rheight){
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
		[/%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,""
		,/%20/g,'',/%5B;/g,"[",/%5D;/g,"]",/&#38;/g
		,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,""
		,/&#32;/g,"",/&#91;/g,"[",/&#93;/g,"]"
		,/"/g,"",/'/g,"",/ /g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&"
		,/\[/g,"",/\]/g,""
		], l = subs[length],i;
	for(i=0;i!=l; i+=2){
		s = s[replace](subs[i],subs[i+1]);
	}
	return s;
},
	loc = cleanupURL(decodeURI(window.location.toString()))
	,parts = loc[split](/[?&]/)
	,title="Net gain and SWR", sweep,gain,swr,freqs,s,g,i;
	for(i = 1; i< parts[length]; ++i)
	{
		s = parts[i][indexOf]("sweep=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				sweep = validate(g);
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("gain=");
		if(s !=-1){
			g = parts[i][substr](s+5);
			try{
				gain = validate(g);
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("swr=");
		if(s !=-1){
			g = parts[i][substr](s+4);
			try{
				swr = validate(g);
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("freqs=");
		if(s !=-1){
			g = parts[i][substr](s+6);
			try{
				freqs = validate(g);
			}catch(e){ throwEx(e+" in "+parts[i]); }
			continue;
		}
		s = parts[i][indexOf]("title=");
		if(s !=-1){
			title = parts[i][substr](s+6);
			continue;
		}
	}

	if(gain==undefined)
	{
		throwEx("Gain not found");
	}
	if(gain==undefined)
	{
		throwEx( "SWR not found");
	}
	if(swr && gain[length]!=swr[length])
	{
		throwEx( "Gain/SWR length mismatch");
	}
	swr = swr || [];
	if(freqs==undefined){
		if(sweep == undefined)
		{
			sweep=[0,1,gain[length]];
		}
		freqs=[];
		for(i = 0; i!=sweep[2]; ++i)
		{
			freqs.push(sweep[0]+i*sweep[1]);
		}
	}
	if(gain[length]!=freqs[length])
	{
		throwEx("Gain/Frequences length mismatch");
	}

	var min_gain = floor(min.apply(min,gain)),
		max_gain = ceil(max.apply(max, gain)),
//		min_swr = floor(min.apply(min, swr)),
		max_swr = swr.length?ceil(max.apply(max, swr)):1,
		w = (rwidth || getClientWidth()),
		h = (rheight || getClientHeight());
	min_gain =  min_gain-4-2*(max_swr-1);
	max_swr = 1+(max_gain-min_gain)/2;
	gainSwrChart("chart", w-30, h-30, freqs,[["Gain", "#000"][concat](gain)],[["SWR", "#888"][concat](swr)], round(min_gain), round(max_gain), round(max_swr*10)/10.0, title);
}
