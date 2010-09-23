			function getClientWidth() {
				return document.compatMode=='CSS1Compat' && !window.opera?document.documentElement.clientWidth:document.body.clientWidth;
			}

			function getClientHeight() {
				return document.compatMode=='CSS1Compat' && !window.opera?document.documentElement.clientHeight:document.body.clientHeight;
			}


			function radians(deg)
			{
				return Math.PI*deg/180;
			}
			function lenToMM(len)
			{
				return Math.round(len*1000)+"mm";
			}
			function coordToMM(c)
			{
				return Math.round(c*10000)/10;
			}
	
			function simplify16th(s)
			{
				if (s%2)return [s,16];
				s/=2;
				if (s%2)return [s,8];
				s/=2;
				if (s%2)return [s,4];
				s/=2;
				return [s,2];
			}
			function lenToIN(len)
			{
				var s = len<0?-Math.round( len / 0.0015875 ):Math.round( len / 0.0015875 )
				if(s % 16 != 0)
				{
					n = Math.abs(s%16);
					d = simplify16th(n)
					return (len<0?"-":"")+Math.round(s/16-.5)+" "+d[0]+"/"+d[1]+" in";
				}
				else
					return (len<0?"-":"")+Math.round(s/16-.5)+"in";
			}
			function coordToIN(c)
			{
				var s = c<0?-Math.round( c / 0.0015875):Math.round( c / 0.0015875)

				if(s % 16 != 0)
				{
					n = Math.abs(s%16);
					d = simplify16th(n)
					return (c<0?"-":"")+Math.round(s/16-.5)+" "+d[0]+"/"+d[1];
				}
				else
					return (c<0?"-":"")+Math.round(s/16-.5);
			}

			var antennaGeometry = function (holder,w,h, scale, coords, initial_x_offset, initial_y_offset) {
				this.r = Raphael(holder,w,h);
				this.matrix = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]])));
			
//				this.coords = coords;
				this.scale = scale;
				this.initial_scale = scale;
				this.initial_x_offset = initial_x_offset?initial_x_offset:0;
				this.initial_y_offset = initial_y_offset?initial_y_offset:0;;
				this.lastx=undefined;
				this.lasty=undefined;
				this.xoffset=w/2+this.initial_x_offset;
				this.yoffset=h/2+this.initial_y_offset;
				this.rotate_mode = 0;
				this.in_inch = 0;

				this.coords = [];

				var i=0;
				for(i=0; i!=coords.length; i++)
				{
					this.coords.push([]);
					this.coords[i].push(coords[i][0])
					var pts = coords[i].slice(1);
					for ( j=0; j!=pts.length; j+=6){
						var s = $V(pts.slice(j,j+3));
						var e =$V(pts.slice(j+3,j+6));
						var len =  s.subtract(e).modulus();
						this.coords[i].push(
								{"s": s
								,"e":e
								, "names": [
								[lenToMM(len),coordToMM(s.e(1))+","+coordToMM(s.e(2))+","+coordToMM(s.e(3)),coordToMM(e.e(1))+","+coordToMM(e.e(2))+","+coordToMM(e.e(3))],
								[lenToIN(len),coordToIN(s.e(1))+","+coordToIN(s.e(2))+","+coordToIN(s.e(3)),coordToIN(e.e(1))+","+coordToIN(e.e(2))+","+coordToIN(e.e(3))] ]
								});
					}
				}

				this.home = function()
				{
					this.matrix = Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]])));
					this.xoffset=w/2+this.initial_x_offset;
					this.yoffset=h/2+this.initial_y_offset;
					this.scale = this.initial_scale;
					this.redraw();
				}
				this.rotateXY = function(x,y)
				{
					if(x == 0 && y == 0 )return;
					if( this.rotate_mode == 0)
					{
						this.xoffset+=x;
						this.yoffset-=y;
					}else
					{
						var degs = Math.sqrt(x*x+y*y)*Math.PI/Math.min(w,h)
						var rot = Matrix.Rotation(degs, $V([-y,x,0]).toUnitVector() );
					
						this.matrix = rot.x(this.matrix);
					}
					this.redraw();
				}
				var geometry = this;
				this.rotateRight = function(degs)
				{
					//alert(this.matrix.elements);
					//alert(this.matrix.row(2).elements);
					var rot = Matrix.RotationY(degs);
					this.matrix = rot.x(this.matrix);
					this.redraw()
				}
				this.rotateUp = function(degs)
				{
					//alert(this.matrix.elements);
					//alert(this.matrix.row(1).elements);
					var rot = Matrix.RotationX(degs);
					this.matrix = rot.x(this.matrix);
					this.redraw()
				}
				var switchRotateMode = function(event)
				{
					if(geometry.rotate_mode){
						this.attr({fill:"#f00"});
						geometry.rotate_mode = 0;
					}else{
						this.attr({fill:"#fff"});
						geometry.rotate_mode = 1;
					}
					geometry.redraw()
				}
				var tags = this.r.set();
				this.drawAxis = function()
				{
					var s = this.matrix.x(Vector.Zero(3));
					var e = this.matrix.x(Vector.i);
					var x1 = s.e(1)*30;
					var y1 = -s.e(2)*30;
					var x2 = e.e(1)*30;
					var y2 = -e.e(2)*30;
					var str = "M"+x1+" "+y1+"L"+x2+" "+y2;
					this.r.path(str).translate(this.xoffset,this.yoffset).attr({stroke: "#b00", "stroke-width": 1});
					x2 = x1 + (x2- x1)*1.25;
					y2 = y1 + (y2- y1)*1.25;
					this.r.text(x2,y2,"X").translate(this.xoffset,this.yoffset).attr({stroke: "#b00", "stroke-width": 1});
					e = this.matrix.x(Vector.j);
					x2 = e.e(1)*30;
					y2 = -e.e(2)*30;
					str = "M"+x1+" "+y1+"L"+x2+" "+y2;
					this.r.path(str).translate(this.xoffset,this.yoffset).attr({stroke: "#0b0", "stroke-width": 1});
					x2 = x1 + (x2- x1)*1.25;
					y2 = y1 + (y2- y1)*1.25;
					this.r.text(x2,y2,"Y").translate(this.xoffset,this.yoffset).attr({stroke: "#0b0", "stroke-width": 1});
					e = this.matrix.x(Vector.k);
					x2 = e.e(1)*30;
					y2 = -e.e(2)*30;
					str = "M"+x1+" "+y1+"L"+x2+" "+y2;
					this.r.path(str).translate(this.xoffset,this.yoffset).attr({stroke: "#00b", "stroke-width": 1});
					x2 = x1 + (x2- x1)*1.25;
					y2 = y1 + (y2- y1)*1.25;
					this.r.text(x2,y2,"Z").translate(this.xoffset,this.yoffset).attr({stroke: "#00b", "stroke-width": 1});
				}

				this.redraw = function()
				{
					tags&& tags.remove();
					this.r.clear();
					var rect = this.r.rect(1,1,w,h,10).attr({fill:"#fff", stroke: "#fff"});
					rect.drag(
							function(dx,dy){
								var x = dx-geometry.lastx;
								var y = -dy+geometry.lasty; 
								geometry.lastx=dx;
								geometry.lasty=dy;
								geometry.rotateXY(x,y);
							}
							, function(){geometry.lastx=0;geometry.lasty=0;}
							,function(){}
							);
					this.drawAxis()

					var unit_names = this.in_inch?1:0;

					var scr_coords=[];

					var i=0
					for(i=0; i!=this.coords.length; i++)
					{
						var pts = this.coords[i]
						var color = pts[0];
						for ( j=1; j!=pts.length; j++){
							var pt = pts[j]
							var s = this.matrix.x(pt.s);
							var e = this.matrix.x(pt.e);
							var x1 = s.e(1)*this.scale;
							var y1 = -s.e(2)*this.scale;
							var x2 = e.e(1)*this.scale;
							var y2 = -e.e(2)*this.scale;
							var z = Math.min(s.e(3), e.e(3))
							scr_coords.push([color, x1,y1,x2,y2,z,pt.names])

						}
					}
					scr_coords.sort(function(a,b) { return a[5]-b[5];});
					for(i=0; i!=scr_coords.length; ++i)
					{
						pt = scr_coords[i];
						color = pt[0];
						x1 = pt[1];
						y1=pt[2];
						x2=pt[3];
						y2=pt[4];
						z=pt[5];
						names=pt[6]

						var str = "M"+x1+" "+y1+"L"+x2+" "+y2;
						var p = this.r.path(str).translate(this.xoffset,this.yoffset).attr({stroke: color, "stroke-width": 3});
						p.value =names[unit_names][0];
						p.x = (x1+x2)/2+this.xoffset;
						p.y = (y1+y2)/2+this.yoffset;
						var popup = function () {
								tags && tags.remove();
								tags.push(geometry.r.g.popup(this.x, this.y,this.value, null, 3));//.insertAfter(this));
							}
						p.hover(popup, function () {
								tags && tags.remove();
								});
						var c = this.r.circle(this.xoffset+x1,this.yoffset+y1,3).attr({stroke: color, fill: color});
						c.value = names[unit_names][1];
						c.x = this.xoffset+x1;
						c.y = this.yoffset+y1;
						c.hover(popup, function () {
								tags && tags.remove();
								});
						var c = this.r.circle(this.xoffset+x2,this.yoffset+y2,3).attr({stroke: color, fill: color});
						c.value = names[unit_names][2];
						c.x = this.xoffset+x2;
						c.y = this.yoffset+y2;
						c.hover(popup, function () {
								tags && tags.remove();
								});
					}

					//this.r.g.arrow(w-10, h/2,10).attr({fill: "#000"}).click(function(event){geometry.xoffset+=10; geometry.redraw(); });
					//this.r.g.arrow(10, h/2,10).attr({fill: "#000"}).rotate(180).click(function(event){geometry.xoffset-=10; geometry.redraw(); });
					//this.r.g.arrow(w/2, h-10,10).attr({fill: "#000"}).rotate(90).click(function(event){geometry.yoffset+=10; geometry.redraw(); });
					//this.r.g.arrow(w/2, 10,10).attr({fill: "#000"}).rotate(270).click(function(event){geometry.yoffset-=10; geometry.redraw(); });
					//this.r.rect(0,h-30,w,30).attr({fill: "#CCC", stroke: "none"})
					this.r.circle(15, h-15,10).attr({fill: "#fff"}).click(function(event){geometry.scale=geometry.scale*1.1; geometry.redraw(); });
					this.r.g.plus(15, h-15,10).attr({fill: "#000"}).click(function(event){geometry.scale=geometry.scale*1.1; geometry.redraw(); });
					this.r.circle(40, h-15,10).attr({fill: "#fff"}).click(function(event){geometry.scale=geometry.scale/1.1; geometry.redraw(); });
					this.r.g.line(40, h-15,10).attr({fill: "#000"}).click(function(event){geometry.scale=geometry.scale/1.1; geometry.redraw(); });
					this.r.g.label(80, h-15, "Reset").click(function(event){geometry.home(); });
					this.r.g.label(150, h-15, this.in_inch?"Switch to MM":"Switch to IN").click(function(event){geometry.in_inch=!geometry.in_inch; geometry.redraw(); });
					var c = this.r.circle(w-24,h-15,14).attr({stroke: "#000"}).click(switchRotateMode);
					this.r.g.label(w-86, h-15, "F").click(function(event){geometry.matrix=$M([[0,1,0],[0,0,1],[1,0,0]]); geometry.redraw(); });
					this.r.g.label(w-69, h-15, "L").click(function(event){geometry.matrix=$M([[1,0,0],[0,0,1],[0,-1,0]]); geometry.redraw(); });
					this.r.g.label(w-51, h-15, "T").click(function(event){geometry.matrix=$M([[0,1,0],[-1,0,0],[0,0,1]]); geometry.redraw(); });
							
					var rot_mode = this.r.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z").attr({fill:"#000"}).scale(3/4).translate(w-40,h-31).click(switchRotateMode);

					if(this.rotate_mode)
					{
						c.attr({fill:"#f00", stroke: "#000"});
					}else{
						c.attr({fill:"#fff", stroke: "#000"});
					}

				}
			};
			
			var gainChart = function (holder,w,h, channels, gain, swr, gainmin,gainmax,swrmax, title) {
                var r = Raphael(holder);
				title && r.text(w/2,10,title).attr({"font-size":14});
				r.g.txtattr.font = "10px 'Fontin Sans', Fontin-Sans, sans-serif";
				var tags = r.set();
				for (i = 0; i!=gain.length; ++i)
				{
					var legend = gain[i][0];
					var color = gain[i][1];
					var data = gain[i].slice(2);
					var chartopts;
					if ( i ){
						chartopts =  {gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep:(gainmax-gainmin)*2, axisxstep:channels.length-1, axisymin:gainmin, axisymax:gainmax}
					}else
					{
						chartopts =  {gutter: 10, nostroke: false, axis: "0 0 1 1", symbol: "o", smooth: true, axisystep:(gainmax-gainmin)*2, axisxstep:channels.length-1, axisymin:gainmin, axisymax:gainmax, grid:"5 2"}
					}
					var gain_chart= r.g.linechart(20, 20, w, h, [channels], [data],chartopts).hover(function () {
    	             tags && tags.remove();
					 tags.push(r.g.popup(this.x, this.y, this.value, null, 3));
					}, function () {
					tags && tags.remove();
					});
					gain_chart.symbols.attr({r: 2});
					gain_chart.lines.attr({stroke: color});
					gain_chart.symbols.attr({stroke: color});
					gain_chart.symbols.attr({fill: color});
					gain_chart.grid.attr({"stroke-width": .25});
					r.rect(20, h+33+10*i,20, 4).attr({stroke:"none", fill:color});
					r.text(30+w/4, h+35+10*i,legend);
				}


				for (i = 0; i!=swr.length; ++i)
				{
					var legend = swr[i][0];
					var color = swr[i][1];
					var data = swr[i].slice(2);
					var chartopts;
					if ( i ){
						chartopts =  {gutter: 10, nostroke: false, axis: "0 0 0 0", symbol: "o", smooth: true, axisystep:(swrmax-1)*2, axisxstep:channels.length-1, axisymin:1, axisymax:swrmax};
					}else
					{
						chartopts =  {gutter: 10, nostroke: false, axis: "0 1 0 0", symbol: "o", smooth: true, axisystep:(swrmax-1)*2, axisxstep:channels.length-1, axisymin:1, axisymax:swrmax, grid:"0 1"};
					}
					var swr_chart = r.g.linechart(20, 20, w,h, [channels], [data], chartopts).hover(function () {
						tags && tags.remove();
							tags.push(r.g.popup(this.x, this.y, this.value, null, 3));
							}, function () {
							tags && tags.remove();
							});
					swr_chart.symbols.attr({r: 2});
					swr_chart.lines.attr({stroke: color});
					swr_chart.symbols.attr({stroke: color});
					swr_chart.symbols.attr({fill: color});
					swr_chart.axis.attr({stroke: "#f00"});
					swr_chart.grid.attr({stroke: "#f00"});
					swr_chart.grid.attr({"stroke-width": .25});
					r.rect(w, h+33+10*i,20, 4).attr({stroke:"none", fill:color});
					r.text(10+3*w/4, h+35+10*i,legend);
				}
			};
			var uhfChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
				var channels = [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53];
				return gainChart(holder,w,h,channels,gain, swr, gainmin,gainmax,swrmax,title);
			};
			var uhfHiChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
				var channels = [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70];
				return gainChart(holder,w,h,channels,gain, swr, gainmin,gainmax,swrmax,title);
			};
			var vhfHiChart = function (holder,w,h, gain, swr, gainmin,gainmax,swrmax,title) {
				var channels = [7,8,9,10,11,12,13,14];
				return gainChart(holder,w,h,channels,gain, swr, gainmin,gainmax,swrmax,title);
			};

