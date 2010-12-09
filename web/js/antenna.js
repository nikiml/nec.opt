// copyright 2010 Nikolay Mladenov
/*global window, Raphael, alert, $V, $M, Vector, Matrix, $ */
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function (elt /*, from*/)
	{
		var len = this.length, from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) { from += len; }

		for (; from < len; from++)
		{
			if (from in this && this[from] === elt){ return from;}
		}
		return -1;
	};
}


if (!Array.prototype.maxIndex)
{
	Array.prototype.maxIndex = function()
	{
		if(! this.length) return -1;
		var maxi=0, len = this.length, i = 1;
		for (; i < len; ++i)
			if (this[maxi] < this[i])
				maxi=i;
		return maxi;
	};
}

if (!Array.prototype.minIndex)
{
	Array.prototype.minIndex = function()
	{
		if(! this.length) return -1;
		var mini=0, len = this.length, i = 1;
		for (; i < len; ++i)
			if (this[mini] > this[i])
				mini=i;
		return mini;
	};
}

if (!Array.prototype.maxValue)
{
	Array.prototype.maxValue = function()
	{
		if(! this.length) return undefined;
		return this[this.maxIndex()];
	}};

if (!Array.prototype.minValue)
{
	Array.prototype.minValue = function()
	{
		if(! this.length) return undefined;
		return this[this.minIndex()];
	};
}


function getClientWidth() {
	return document.compatMode==='CSS1Compat' && !window.opera?document.documentElement.clientWidth:document.body.clientWidth;
}

function getClientHeight() {
	return document.compatMode==='CSS1Compat' && !window.opera?document.documentElement.clientHeight:document.body.clientHeight;
}
function getInternetExplorerVersion() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName === 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent, 
	    re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
	if (re.exec(ua) !== null){
            rv = parseFloat(RegExp.$1);
	}
    }
    return rv;
}
		
function r_line(r, x1,y1,x2,y2 )
{
	return r.path("M"+x1+" "+y1+"L"+x2+" "+y2);
}

function radians(deg)
{
	return Math.PI*deg/180;
}

var antennaGeometry = function (holder,w,h, scale, coords, ini_x_off_, ini_y_off_, confs_, confs_title, bg) {
	var raphael = Raphael(holder,w,h),
	    matrix = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]]))),
	    ini_scale = scale,
	    ini_x_off = ini_x_off_?ini_x_off_:0,
    	    ini_y_off = ini_y_off_?ini_y_off_:0,
	    lastx=undefined,
	    lasty=undefined,
	    dragx=undefined,
	    dragy=undefined,
	    top=confs_?14:0,
	    rotate_mode = 0,
	    in_inch = 0,
	    ie = (getInternetExplorerVersion()!==-1),
	    bgcolor="#fff",
	    lenToMM=function (len){	return Math.round(len*1000)+"mm";	},
	    coordToMM = function (c){	return Math.round(c*10000)/10;		},
	    lenToMM1 = function (c){	return Math.round(c*10000)/10+"mm";	},
	    simplify16th = function (s)
	        {
			if (s%2) {return [s,16];}
			s/=2;
			if (s%2) {return [s,8];}
			s/=2;
			if (s%2){return [s,4];}
			s/=2;
			return [s,2];
		},
	    lenToIN = function (len)
	        {
			var s = len<0?-Math.round( len / 0.0015875 ):Math.round( len / 0.0015875 );
			if(s % 16 !== 0)
			{
				var n = Math.abs(s%16),	
				    d = simplify16th(n);
				return (len<0?"-":"")+Math.round(s/16-0.5)+" "+d[0]+"/"+d[1]+" in";
			}
			else{
				return (len<0?"-":"")+Math.round(s/16-0.5)+"in";
			}
		},
	    coordToIN = function (c)
	        {
			var s = c<0?-Math.round( c / 0.0015875):Math.round( c / 0.0015875);
		
			if(s % 16 !== 0)
			{
				var n = Math.abs(s%16),
				    d = simplify16th(n);
				return (c<0?"-":"")+Math.round(s/16-0.5)+" "+d[0]+"/"+d[1];
			}
			else{
				return (c<0?"-":"")+Math.round(s/16-0.5);
			}
		},
	    coordsToSegments = function (coords)
	    	{
			var i=0, segments=[];
			for(i=0; i!==coords.length; i++)
			{
				var color = coords[i][0],
				    pts = coords[i].slice(1),
				    j;
				if(pts.length%6!==0)
				{
					alert("Invalid geometry array - length="+pts.length);
				}
				for ( j=0; j!==pts.length; j+=6){
					var s = $V(pts.slice(j,j+3)),
					    e = $V(pts.slice(j+3,j+6)),
					    dif = s.subtract(e),
					    len = dif.modulus();
		
					segments.push(
							{ "color":color,
							"pts":[s,e],
							"segment_selected":0,
							"sselected":0,
							"eselected":0,
							"len":len,
							"names": [[lenToMM(len),
								coordToMM(s.e(1))+","+coordToMM(s.e(2))+","+coordToMM(s.e(3)),
								coordToMM(e.e(1))+","+coordToMM(e.e(2))+","+coordToMM(e.e(3))
								], [lenToIN(len),
								coordToIN(s.e(1))+","+coordToIN(s.e(2))+","+coordToIN(s.e(3)),
								coordToIN(e.e(1))+","+coordToIN(e.e(2))+","+coordToIN(e.e(3))] 
								]
							});
				}
			}
			return segments;
		},
	    segments = coordsToSegments(coords),
	    confs = [],
	    curr_conf = -1,
	    confs_title = confs_title,
	    all_segments = [],
	    i,
	    xoff=w/2+ini_x_off,
	    yoff=(h+top)/2+ini_y_off,
	    that = this,
	    home = function()
		{
			matrix = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]])));
			xoff=w/2+ini_x_off;
			yoff=(h+top)/2+ini_y_off;
			scale = ini_scale;
			that.redraw();
		},
	    rotateXY = function(x,y)
		{
			if(x === 0 && y === 0 ) 
			{
			       return;
			}
			if( rotate_mode === 0)
			{
				xoff+=x;
				yoff-=y;
			}else
			{
				var z = 0;
				if ( dragx < 40 ){
					z = -y; x=0; y=0;
				}
				else if(dragx > w-40)
				{
					x=0;
				}else if(dragy < top+40)
				{
					y=0;
				}
				if(x === 0 && y === 0 && z === 0 )
				{
					return;
				}
				var degs = Math.sqrt(x*x+y*y+z*z)*Math.PI/Math.min(w,h),
				    rot = Matrix.Rotation(degs, $V([-y,x,z]).toUnitVector() );
			
				matrix = rot.x(matrix);
			}
			that.redraw();
		},
	    red = "#f00",
	    switchRotateMode = function(event)
		{
			var btn = this;
			if(rotate_mode){
				btn.attr({fill:red});
				rotate_mode = 0;
			}else{
				btn.attr({fill:bgcolor});
				rotate_mode = 1;
			}
			that.redraw();
		},
	    tags = raphael.set(),
	    stroke_width = "stroke-width",
	    redb = "#b00",
	    greenb = "#0b0",
	    blueb = "#00b",
	    drawAxis = function()
		{
			var 
				s = matrix.x(Vector.Zero(3)),
				e = matrix.x(Vector.i),
				x1 = s.e(1)*30,
				y1 = -s.e(2)*30,
				x2 = e.e(1)*30,
				y2 = -e.e(2)*30,
				str = "M"+x1+" "+y1+"L"+x2+" "+y2
				;
	
			raphael.path(str).translate(xoff,yoff).attr({stroke: redb, stroke_width: 1});
			x2 = x1 + (x2- x1)*1.25;
			y2 = y1 + (y2- y1)*1.25;
			raphael.text(x2,y2,"X").translate(xoff,yoff).attr({stroke: redb, stroke_width: 1});
			e = matrix.x(Vector.j);
			x2 = e.e(1)*30;
			y2 = -e.e(2)*30;
			str = "M"+x1+" "+y1+"L"+x2+" "+y2;
			raphael.path(str).translate(xoff,yoff).attr({stroke: greenb, stroke_width: 1});
			x2 = x1 + (x2- x1)*1.25;
			y2 = y1 + (y2- y1)*1.25;
			raphael.text(x2,y2,"Y").translate(xoff,yoff).attr({stroke: greenb, stroke_width: 1});
			e = matrix.x(Vector.k);
			x2 = e.e(1)*30;
			y2 = -e.e(2)*30;
			str = "M"+x1+" "+y1+"L"+x2+" "+y2;
			raphael.path(str).translate(xoff,yoff).attr({stroke: blueb, stroke_width: 1});
			x2 = x1 + (x2- x1)*1.25;
			y2 = y1 + (y2- y1)*1.25;
			raphael.text(x2,y2,"Z").translate(xoff,yoff).attr({stroke: blueb, stroke_width: 1});
		},
	    onConfiguration = function()
		{
			curr_conf = this.i;
			deselectAll(); 
			that.redraw();
		},
	    drawConfigurations = function()
		{
			if(!confs.length) 
			{
				return;
			}
			var l=confs_title.length,
			    i,txt,rct;
			for(i=0;i!==confs.length; ++i)
			{
				l+=confs[i][0].length;
			}
			var charsize = Math.min((w-20.0)/(l+confs.length+1), 8), start=(w-charsize*l)/2-10;
			raphael.text(start+confs_title.length*charsize/2,top/2,confs_title);
			start+=(1+confs_title.length)*charsize;
			for(i=0;i!==confs.length; ++i)
			{
				if(i === curr_conf)
				{
					raphael.rect(start,1,confs[i][0].length*charsize,top-2).attr({fill:"#8ff", stroke:"none"});
				}else{
					rct = raphael.rect(start,1,confs[i][0].length*charsize,top-2);
					rct.attr({fill:"#fff", stroke:"none"});
					rct.mouseover(function(){;this.attr({fill:"#ccc"});});
					rct.mouseout(function(){this.attr({fill:"#fff"});});
					rct.click(onConfiguration);
					rct.i=i;
				}
				txt=raphael.text(start+confs[i][0].length*charsize/2,top/2,confs[i][0]);
				if(i !== curr_conf)
				{
					txt.i = i;
					txt.click(onConfiguration);
					txt.rect = rct;
					txt.mouseover(function(){;this.rect.attr({fill:"#ccc"});this.attr({"font-weight":"bold"});});
					txt.mouseout(function(){this.rect.attr({fill:"#fff"});this.attr({"font-weight":"normal"});});
				}
				start+=(1+confs[i][0].length)*charsize;
			}
		},
	    drawInformation = function(selected, total_len)
		{
			var lenToUnit = in_inch?lenToIN:lenToMM1,
			    accumulated_len=0,
			    pts=[],
			    i,
			    xs=[],ys=[],zs=[],str="";
			if (! selected.length)
			{
				raphael.text(w/2 ,top+7,"Select elements for info. Double click to clear. Total len="+lenToUnit(total_len));
				return;
			}
			for(i=0; i!==selected.length; ++i)
			{
				var s = selected[i],
					s_i = s[0],
					s_j = s[1],
					s_e = s[2],
					seg = all_segments[s_i][s_j];
				if(s_e===0)
				{
					pts.push(seg.pts[0]);
					pts.push(seg.pts[1]);
					accumulated_len+=seg.len;
				}else
				{
					pts.push(seg.pts[s_e-1]);
				}
			}
			for (i=0;i!==pts.length; ++i)
			{
				if (xs.indexOf(pts[i].e(1))===-1){
					xs.push(pts[i].e(1));
				}
				if (ys.indexOf(pts[i].e(2))===-1){
					ys.push(pts[i].e(2));
				}
				if (zs.indexOf(pts[i].e(3))===-1){
					zs.push(pts[i].e(3));
				}
			}
			if(xs.length===1)
			{
				str += " x="+lenToUnit(xs[0]);
			}
			else if(xs.length===2)
			{
				str += " dx="+lenToUnit(Math.abs(xs[0]-xs[1]));
			}
			if(ys.length===1)
			{
				str += " y="+lenToUnit(ys[0]);
			}else if(ys.length===2)
			{
				str += " dy="+lenToUnit(Math.abs(ys[0]-ys[1]));
			}
			if(zs.length===1){
				str += " z="+lenToUnit(zs[0]);
			}else if(zs.length===2)
			{
				str += " dz="+lenToUnit(Math.abs(zs[0]-zs[1]));
			}
	
			if(accumulated_len>0)
			{
				str+=" Total len="+lenToUnit(accumulated_len);
			}
	
			raphael.text(w/2,top+7,"Selection info ("+selected.length+"): "+str);
		},
	    deselectAll = function()
		{
			for(var i=0; i!==all_segments.length; ++i)
			{
				var s = all_segments[i];
				for(var j=0; j!==s.length; ++j)
				{
					s[j].selected = 0;
					s[j].sselected = 0;
					s[j].eselected = 0;
				}
			}
		},
	    
	    popup = function () {
			tags.remove();
			tags.push(raphael.g.popup(this.x, this.y,this.value, null, 3));//.insertAfter(this));
		},
	    popdown = function () {
				tags.remove();
				},
	    segclick = function() {
				var s = this.si;
				all_segments[s[0]][s[1]].selected = !all_segments[s[0]][s[1]].selected;
				that.redraw();
				},
	    startclick = function() {
				var s = this.si;
				all_segments[s[0]][s[1]].sselected = !all_segments[s[0]][s[1]].sselected;
				that.redraw();
				},
	    endclick = function() {
				var s = this.si;
				all_segments[s[0]][s[1]].eselected = !all_segments[s[0]][s[1]].eselected;
				that.redraw();
				}
	; //endof var

	if(confs_)
	{
		curr_conf = 0;
		for(i=0; i!==confs_.length; ++i)
		{
			confs.push([confs_[i][0], coordsToSegments(confs_[i][1])]);
		}
	}

	
	this.redraw = function()
	{
		tags.remove();
		raphael.clear();
		var  unit_names = in_inch?1:0,
		    seg_scr_coords=[],
		    i=0,
		    j,
		    rect = raphael.rect(1,1,w-2,h-2,10).attr({fill:bgcolor, stroke: "none"}),
		    segs,
		    s,
		    e,
		    total_len=0,
		    seg,
		    selected = [],str,si,p,color,clr,c
		    ;
		rect.drag(
				function(dx,dy){
					var x = dx-lastx,
					y = -dy+lasty; 
					lastx=dx;
					lasty=dy;
					rotateXY(x,y);
				},
				function(x,y){ dragx=x; dragy=y;lastx=0;lasty=0;},
				function(){}
				);
		rect.dblclick( function(){deselectAll();that.redraw();});
	
		all_segments=[segments];
		if(curr_conf!==-1)
		{
			all_segments.push(confs[curr_conf][1]);
		}
		for(i=0; i!==all_segments.length; ++i){
			segs = all_segments[i];
			for(j=0; j!==segs.length; j++)
			{
				seg = segs[j];
				total_len+=seg.len;
				s = matrix.x(seg.pts[0]);
				e = matrix.x(seg.pts[1]);
				seg_scr_coords.push(
					{"z":Math.min(s.e(3), e.e(3)),
					"x1":s.e(1)*scale+xoff,
					"y1":-s.e(2)*scale+yoff,
					"x2":e.e(1)*scale+xoff,
					"y2":-e.e(2)*scale+yoff,
					"sindex":[i,j]
					});
			}
		}
		seg_scr_coords.sort(function(a,b) { return a.z-b.z;});
		if(!ie){
			for(i=0; i!==seg_scr_coords.length; ++i)
			{
				seg = seg_scr_coords[i];
				str = "M"+seg.x1+" "+seg.y1+"L"+seg.x2+" "+seg.y2;
				si=seg.sindex;
				p = raphael.path(str).attr({stroke: bgcolor, "stroke-width": 11});
				segs = all_segments[si[0]];
				j = si[1];
	
				p.value = segs[j].names[unit_names][0];
				p.x = (seg.x1+seg.x2)/2;
				p.y = (seg.y1+seg.y2)/2;
				p.si = si;
				p.hover(popup, popdown);
				p.click(segclick);
				c = raphael.circle(seg.x1,seg.y1,7).attr({stroke: bgcolor, fill: bgcolor});
				c.value = segs[j].names[unit_names][1];
				c.x = seg.x1;
				c.y = seg.y1;
				c.si = si;
				c.hover(popup, popdown);
				c.click(startclick);
				c = raphael.circle(seg.x2,seg.y2,7).attr({stroke: bgcolor, fill: bgcolor});
				c.value = segs[j].names[unit_names][2];
				c.x = seg.x2;
				c.y = seg.y2;
				c.si = si;
				c.hover(popup, popdown);
				c.click(endclick);
			}
		}
		drawAxis();
		for(i=0; i!==seg_scr_coords.length; ++i)
		{
			seg = seg_scr_coords[i];
			str = "M"+seg.x1+" "+seg.y1+"L"+seg.x2+" "+seg.y2;
			si=seg.sindex;
			j = si[1];
			segs = all_segments[si[0]];
			color = segs[j].color;
			clr = (segs[j].selected?"#f0f":color);
			p = raphael.path(str).attr({stroke: clr, "stroke-width": 3});

			p.value = segs[j].names[unit_names][0];
			p.x = (seg.x1+seg.x2)/2;
			p.y = (seg.y1+seg.y2)/2;
			p.si = si;
			if(segs[j].selected){
				selected.push([si[0],j,0]);
			}
			p.hover(popup, popdown);
			p.click(segclick);
			clr = (segs[j].sselected?"#f0f":color);
			c = raphael.circle(seg.x1,seg.y1,3).attr({stroke: clr, fill: clr});
			c.value = segs[j].names[unit_names][1];
			c.x = seg.x1;
			c.y = seg.y1;
			c.si = si;
			if(segs[j].sselected){
				selected.push([si[0],j,1]);
			}
			c.hover(popup, popdown);
			c.click(startclick);
			clr = (segs[j].eselected?"#f0f":color);
			c = raphael.circle(seg.x2,seg.y2,3).attr({stroke: clr, fill: clr});
			c.value = segs[j].names[unit_names][2];
			c.x = seg.x2;
			c.y = seg.y2;
			c.si = si;
			if(segs[j].eselected){
				selected.push([si[0],j,2]);
			}
			c.hover(popup, popdown);
			c.click(endclick);
		}

		drawInformation(selected, total_len);
		drawConfigurations();
		raphael.circle(15, h-15,10).attr({fill: bgcolor}).click(function(event){scale=scale*1.1; that.redraw(); });
		raphael.g.plus(15, h-15,10).attr({fill: "#000"}).click(function(event){scale=scale*1.1; that.redraw(); });
		raphael.circle(40, h-15,10).attr({fill: bgcolor}).click(function(event){scale=scale/1.1; that.redraw(); });
		raphael.g.line(40, h-15,10).attr({fill: "#000"}).click(function(event){scale=scale/1.1; that.redraw(); });
		raphael.g.label(80, h-15, "Reset").click(function(event){
				deselectAll();
				home();
				});
		raphael.g.label(150, h-15, in_inch?"Switch to MM":"Switch to IN").click(function(event){in_inch=!in_inch; that.redraw(); });
		c = raphael.circle(w-24,h-15,14).attr({stroke: "#000"}).click(switchRotateMode);
		raphael.g.label(w-86, h-15, "F").click(function(event){matrix=$M([[0,1,0],[0,0,1],[1,0,0]]); that.redraw(); });
		raphael.g.label(w-69, h-15, "L").click(function(event){matrix=$M([[1,0,0],[0,0,1],[0,-1,0]]); that.redraw(); });
		raphael.g.label(w-51, h-15, "T").click(function(event){matrix=$M([[0,1,0],[-1,0,0],[0,0,1]]); that.redraw(); });
		raphael.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z").attr({fill:"#000"}).scale(3/4).translate(w-40,h-31).click(switchRotateMode);

		if(rotate_mode)
		{
			c.attr({fill:"#f00", stroke: "#000"});
		}else{
			c.attr({fill:bgcolor, stroke: "#000"});
		}

	};
};

var gainChart = function (holder,w,h, channels, gain, swr, gainmin,gainmax,swrmax, title) {
        var r = Raphael(holder),
	    tags = r.set(),
	    i,j,
	    legend, color, altcolor, data, chartopts, gain_chart,swr_chart,
	    color_rect;
	if(title) { r.text(w/2,10,title).attr({"font-size":14}); }
	r.g.txtattr.font = "10px 'Fontin Sans', Fontin-Sans, sans-serif";

	var hoverIn = function() {
		if(tags) { tags.remove(); }
		tags.push(r.g.popup(this.x, this.y, this.value, null, 3));
	};
	var hoverOut = function()
	{
		if(tags) {tags.remove();}
	};
	

	var chartOnOff = function()
	{
		if ( this.hidden )
		{
			this.hidden=0;
			this.text.attr({fill:"#000"});
			this.chart.lines.show();
			this.chart.symbols.show();
			this.chart.dots.show();
		}else{
			this.hidden=1;
			this.text.attr({fill:"#ccc"});
			this.chart.lines.hide();
			this.chart.symbols.hide();
			this.chart.dots.hide();
		}
	}


	for (i = gain.length; i!==0; )
	{
		--i;
		legend = gain[i][0];
		color = gain[i][1];
		altcolor = swr[i][1];
		data = gain[i].slice(2);
		if ( i ){
			chartopts =  {gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep:(gainmax-gainmin)*2, axisxstep:channels.length-1, axisymin:gainmin, axisymax:gainmax};
		}else
		{
			chartopts =  {gutter: 10, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true, axisystep:(gainmax-gainmin)*2, axisxstep:channels.length-1, axisymin:gainmin, axisymax:gainmax, grid:"5 2"};
		}
		gain_chart = r.g.linechart(20, 20, w, h, [channels], [data],chartopts).hover(hoverIn, hoverOut);
		gain_chart.symbols.attr({r: 2});
		gain_chart.lines.attr({stroke: color});
		gain_chart.symbols.attr({stroke: color});
		gain_chart.symbols.attr({fill: color});
		gain_chart.grid.attr({"stroke-width": 0.25});
		color_rect = r.rect(20, h+31+10*i,20, 8).attr({stroke:"none", fill:color});
		color_rect.chart = gain_chart;
		color_rect.hidden = 0;
		color_rect.color = color;
		color_rect.altcolor = altcolor;
		color_rect.mouseover(function(){this.attr({fill:this.altcolor});this.text.attr({"font-weight":"bold"});});
		color_rect.mouseout(function(){this.attr({fill:this.color});this.text.attr({"font-weight":"normal"});});
		color_rect.text = r.text(44, h+35+10*i,legend).attr({"text-anchor":"start"});
		color_rect.text.rect = color_rect;
		color_rect.text.mouseover(function(){this.rect.attr({fill:this.rect.altcolor});this.attr({"font-weight":"bold"});});
		color_rect.text.mouseout(function(){this.rect.attr({fill:this.rect.color});this.attr({"font-weight":"normal"});});
		color_rect.text.text = color_rect.text;
		color_rect.text.chart = color_rect.chart;
		color_rect.click(chartOnOff);
		color_rect.text.click(chartOnOff);
	}
	for (i = swr.length; i!==0; )
	{
		--i;
		legend = swr[i][0];
		color = swr[i][1];
		altcolor = gain[i][1];
		data = swr[i].slice(2);
		if ( i ){
			chartopts =  {gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep:(swrmax-1)*2, axisxstep:channels.length-1, axisymin:1, axisymax:swrmax};
		}else
		{
			chartopts =  {gutter: 10, nostroke: false, axis: "0 1 0 0", symbol: "o", smooth: true, axisystep:(swrmax-1)*2, axisxstep:channels.length-1, axisymin:1, axisymax:swrmax, grid:"0 1"};
		}
		swr_chart = r.g.linechart(20, 20, w,h, [channels], [data], chartopts).hover(hoverIn, hoverOut);
		swr_chart.symbols.attr({r: 2});
		swr_chart.lines.attr({stroke: color});
		swr_chart.symbols.attr({stroke: color});
		swr_chart.symbols.attr({fill: color});
		swr_chart.axis.attr({stroke: "#f00"});
		swr_chart.grid.attr({stroke: "#f00"});
		swr_chart.grid.attr({"stroke-width": 0.25});
		color_rect = r.rect(w, h+31+10*i,20, 8).attr({stroke:"none", fill:color});
		color_rect.chart = swr_chart;
		color_rect.hidden = 0;
		color_rect.color = color;
		color_rect.altcolor = altcolor;
		color_rect.mouseover(function(){this.attr({fill:this.altcolor});this.text.attr({"font-weight":"bold"});});
		color_rect.mouseout(function(){this.attr({fill:this.color});this.text.attr({"font-weight":"normal"});});
		color_rect.text = r.text(w-4, h+35+10*i,legend).attr({"text-anchor":"end", fill:"#000"});
		color_rect.text.rect = color_rect;
		color_rect.text.mouseover(function(){this.rect.attr({fill:this.rect.altcolor});this.attr({"font-weight":"bold"});});
		color_rect.text.mouseout(function(){this.rect.attr({fill:this.rect.color});this.attr({"font-weight":"normal"});});
		color_rect.click(chartOnOff);
		color_rect.text.text = color_rect.text;
		color_rect.text.chart = color_rect.chart;
		color_rect.text.click(chartOnOff);
	}
};

var uhf_channels = [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53];
var uhf_hi_channels= uhf_channels.concat([54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70]);
var vhf_hi_channels = [7,8,9,10,11,12,13,14];
var 
	uhfChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
		return gainChart(holder,w,h,uhf_channels,gain, swr, gainmin,gainmax,swrmax,title);
		},
	uhfHiChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
		return gainChart(holder,w,h,uhf_hi_channels,gain, swr, gainmin,gainmax,swrmax,title);
		},
	vhfHiChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
		return gainChart(holder,w,h,vhf_hi_channels,gain, swr, gainmin,gainmax,swrmax,title);
	};


var AntennaHPattern = function (holder,size, channels, models, sym, model_names, colors) {
	size=Math.max(100,size-20);
	var that=this
		, raphael = Raphael(holder,size,size)
		, maxarr=[]
		, i=0, j
		, maxmax, minmax
		, chartrad=Math.round(size/2-(models.length>1?35:25))
		, negative_portion
		, circles = [],radii=[chartrad]
		, positive_portion
		, model_paths=[]
		, shown=[]
		, current=0
		, astep = 360/((models[0][0].length-1)*(sym+1))
		, tags = raphael.set()
		;
	that.x = size/2;
	that.y = that.x+(models.length>1?20:0);

	for ( ; i!=models.length; ++i){
		shown.push(1);
		for( j=0; j!=models[i].length; ++j)
			maxarr.push(models[i][j].maxValue());
	}
	minmax = Math.max(Math.round(maxarr.minValue()-3.5),0);
	maxmax = Math.round(maxarr.maxValue()+.5);
	while (maxmax >= minmax)
	{
		circles.push(maxmax);
		maxmax-=3;
	}
	if(maxmax <= 2){
		circles.push(0);
	}else if(maxmax <= 5 ){
		circles.push(maxmax);
		circles.push(0);
	}else{
		var ratio = Math.round(maxmax/5.0);
		ratio = Math.round(maxmax/ratio-.5);
		while(maxmax >=ratio)
		{
			c.push(maxmax);
			maxmax-=ratio;
		}
		circles.push(0);
	}
	circles.push(-5);
	circles.push(-10);
	circles.push(-20);
	circles.push(-50);
	circles.push(-1000);
	
	if ( circles[0] <=12 )
		negative_portion = .5;
	else
		negative_portion = .5*12.0/circles[0];

	positive_portion = 1-negative_portion;
	for(i=1; circles[i]>0; ++i)
		radii.push(Math.round((negative_portion+positive_portion*circles[i]/circles[0])*radii[0]));

	radii.push(Math.round(negative_portion*radii[0]));
	radii.push(Math.round(negative_portion*0.75*radii[0]));
	radii.push(Math.round(negative_portion*0.5*radii[0]));
	radii.push(Math.round(negative_portion*0.25*radii[0]));
	radii.push(Math.round(negative_portion*0.125*radii[0]));
	radii.push(0);

	var 
	radiusOf = function(gain)
	{
		var i=1;
		if(gain < -1000)
			return 0;
		for(;i<circles.length;++i)
			if ( gain > circles[i] )
				break;
		return  (radii[i-1]-radii[i]) * (gain - circles[i])/(circles[i-1]-circles[i]) +  radii[i];
	},
	popup = function () 
	{
		tags.remove();
		tags.push(raphael.g.popup(this.x, this.y,this.value, null, 3));
	},
	popdown = function () {
		tags.remove();
	},
	drawChart = function(mno)
	{
		var p=models[mno][current],
		    i=0,
		    path="",
		    a=0,
		    r=0,
		    g=p[0],
		    rad,
		    circle,
		    x,y,
		    pattern=raphael.set(),
		    first_circle,
		    clr=colors[mno][0],
	    	    addSegment = function(start)
			{
				rad=radiusOf(p[i]);
				r = radians(a);
				x = that.x+Math.cos(r)*rad;
				y = that.y-Math.sin(r)*rad;
				path+=start +Math.round(x*100)/100+" "+Math.round(y*100)/100;
				circle = raphael.circle(x,y,2).attr({stroke: clr, fill: clr});
				circle.value = a+" dg\n"+p[i];
				circle.x = x;
				circle.y = y;
				circle.hover(popup, popdown);
				a+=astep;
				pattern.push(circle);
			};

		addSegment("M");
		first_circle = circle;	
		for(i=1; i<p.length; ++i)
		{
			addSegment("L");
		}
		if(sym)
		for(i=p.length-2; i>0; --i)
		{
			addSegment("L");
		}
		path+="Z";
		res = raphael.path(path)
		res.attr({stroke:clr}).insertBefore(first_circle);
		pattern.push(res);
		return pattern;
		
	},
	nextPattern = function()
	{
		current+=this.step;
		if(current >= channels.length-1)
			current = channels.length-1;
		that.draw();
	},
	prevPattern = function()
	{
		current-=this.step;
		if(current < 0)
			current = 0;
		that.draw();
	},
	showHideModel = function()
	{
		var mno = this.mno;
		if(shown[mno])
		{
			model_paths[mno].hide();
			shown[mno] = 0;
		}else{
			model_paths[mno].show();
			shown[mno] = 1;
		}
		that.draw();
	},
	drawChartBG = function()
	{
		var i=0, r=radii,f=r.length-5, cos, sin,a, p = models[0][current],fg="#000",bg="#888",hfg="#888",hbg="#ccc",btn;
		if(models.length>1)
		{
			for(i=0;i!=models.length; ++i)
			{
				p = models[i][current];
				btn = raphael.rect(i*size/models.length,2,size/models.length,12).attr({stroke:"none"});
				btn.click(showHideModel);
				btn.mno = i;
				if(shown[i])btn.attr({fill:colors[i][1]});
				else btn.attr({fill:"#fff"});
				btn.text = raphael.text((i+.5)*size/models.length, 8, model_names[i]);
				btn.text.mno=i;
				btn.text.click(showHideModel);
				btn.text.mouseover(function(){this.attr({"font-weight":"bolder"});})
				btn.text.mouseout(function(){this.attr({"font-weight":"normal"});})
				btn.mouseover(function(){this.text.attr({"font-weight":"bolder"});})
				btn.mouseout(function(){this.text.attr({"font-weight":"normal"});})
				raphael.text((i+.5)*size/models.length, 18, sym?("F: "+p[0]+"dBi, B: "+p[p.length-1]+"dBi"):("F: "+p[0]+"dBi, B: "+p[Math.round(p.length/2 - .5)]+"dBi"));
				raphael.text((i+.5)*size/models.length, 28, p.minValue()+" < dBi < "+p.maxValue());
			}
			raphael.text(8, 38, channels[current]).attr({"text-anchor":"start"});
		}else{
			raphael.text(10, size-18, p.minValue()+" < dBi < "+p.maxValue()).attr({"text-anchor":"start"});
			raphael.text(0, size-8, sym?("F: "+p[0]+"dBi, B: "+p[p.length-1]+"dBi"):("F: "+p[0]+"dBi, B: "+p[Math.round(p.length/2 - .5)]+"dBi")).attr({"text-anchor":"start"});
			raphael.text(8, 8, channels[current]).attr({"text-anchor":"start"});
		}
		for(i=0;i!=r.length-1; ++i){
			raphael.circle(that.x,that.y,r[i]).attr({stroke:"#000", fill:"none"});
			raphael.text(that.x-10,that.y-r[i]+5, circles[i]);
		}
		for(i=0; i!=360; i+=5)
		{
			a = radians(i);
			cos = Math.cos(a);
			sin = Math.sin(a);
			if ( i % 15 )
			{
				r_line(raphael, that.x+cos*r[f], that.y+sin*r[f], that.x+cos*r[0], that.y+sin*r[0]).attr({stroke:hfg});
			}else
			{
				if(i % 90)
				{
					r_line(raphael, that.x+cos*r[f+1], that.y+sin*r[f+1], that.x+cos*r[0], that.y+sin*r[0]).attr({stroke:fg});
				}
				else{
					r_line(raphael, that.x, that.y, that.x+cos*r[0], that.y+sin*r[0]).attr({stroke:fg});
				}

				raphael.text(that.x+cos*(r[0]+10), that.y-sin*(r[0]+10), i)
			}
		}
		x=size-50;
		y = size-15;

		var putButton = function(x,size, text,callback,step)
		{
			var 
				r=raphael.rect(x,y,size,12)
				,t=raphael.text(x+size/2,y+5,text);

			r.attr({fill:bg,stroke:"none"});
			r.click(callback);
			r.step=step;
			r.mouseover(function(){ this.attr({fill:hbg}); this.txt.attr({"font-weight":"bold"}); });
			r.mouseout(function(){ this.attr({fill:bg}); this.txt.attr({"font-weight":"normal"}); });
			r.txt=t;

			t.attr({fill:bg,stroke:fg});
			t.click(callback);
			t.step=step;
			t.mouseover(function(){ this.rect.attr({fill:hbg}); this.attr({"font-weight":"bold"}); });
			t.mouseout(function(){ this.rect.attr({fill:bg}); this.attr({"font-weight":"normal"}); });
			t.rect=r;
		};
		putButton(x-16,14,"<",prevPattern,1,bg);
		putButton(x,14,">",nextPattern,1);
		putButton(x-37,19,"<<",prevPattern,5);
		putButton(x+16,19,">>",nextPattern,5);
		putButton(x-53,14,"|<",prevPattern,channels.length);
		putButton(x+37,14,">|",nextPattern,channels.length);
	},
	drawPaths = function()
	{
		var i=0;
		for( ; i!=models.length; ++i)
		{
			model_paths[i] = drawChart(i);
			if(!shown[i])
				model_paths[i].hide();
		}

	};
	that.draw = function()
	{
		raphael.clear();
		drawChartBG();
		drawPaths();
	};
}

function vhfHiFreqTitles()
{
	var i=0, res=[];
	for(; i!=8; ++i)
		res.push( (174+i*6)+" Mhz");
	return res;
}

function uhfFreqTitles()
{
	var i=0, res=[];
	for(; i!=40; ++i)
		res.push( (470+i*6)+" Mhz");
	return res;
}

var configureModelPatternTabs = function()
{
	var _show_pattern = $("#show_pattern"),
	_show_model = $("#show_model"),
	_pattern = $("#pattern"),
	_model = $("#model"),
	selected="selected",
	ph,

	onTabClick = function()
	{
		if($(this).hasClass(selected))return;
		_show_pattern.toggleClass(selected);
		_show_model.toggleClass(selected);
		if(_show_pattern.hasClass(selected))
		{
			_pattern.show();
			_model.hide();
			if( _pattern.html()=="Loading...")
			{
				ph = _model.html();
				ph = ph.replace("_r.html", "_p.html");
				_pattern.html(ph);
			}
		}else{
			_model.show();
			_pattern.hide();
		}
	};

	_show_pattern.click(onTabClick);
	_show_model.click(onTabClick);
	_pattern.hide();
}
