// copyright 2010 Nikolay Mladenov
/*global window, Raphael, alert, $V, $M, Vector, Matrix, $ */
var NecViewer = (function(nv){

var math = Math, _document = document, compatMode="compatMode", opera="opera", documentElement="documentElement", body="body", 
	clientWidth="clientWidth", clientHeight="clientHeight", CSS1Compat='CSS1Compat',length="length", add="add", subtract = "subtract", modulus = "modulus",
	attr="attr", click = "click", redraw="redraw", hover="hover", rect="rect",push="push",circle="circle", remove="remove", translate="translate",
	elements="elements", set="set", forEach="forEach", scale="scale", join="join", path = "path", _undefined = undefined, map = "map", line = "line";
nv.getClientWidth = function(){
    return _document[compatMode] === CSS1Compat && !window[opera] ? _document[documentElement][clientWidth] : _document[body][clientWidth];
};

nv.getClientHeight = function() {
    return _document[compatMode] === CSS1Compat && !window.opera ? _document[documentElement][clientHeight] : _document[body][clientHeight];
};

function getInternetExplorerVersion() {
    if (navigator.appName === 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent,
	    re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        if (re.exec(ua) !== null) {
            return parseFloat(RegExp.$1);
        }
    }
    return -1;
}


//antenna.js

function r_line(r, p1, p2) {
    return r[path]("M" + p1[0] + " " + p1[1] + "L" + p2[0] + " " + p2[1]);
}

function radians(deg) {
    return math.PI * deg / 180;
}

function degrees(rad) {
    return rad / math.PI * 180;
}
function fontSize(a) {
    return { "font-size": a };
}

function fontWeight(a) {
    return { "font-weight": a };
}

nv.AntennaGeometry = function(holder, w, h, geometry, confs_, confs_title, bg, title) {
    var raphael = Raphael(holder, w, h), 
		current_geometry = geometry,
		round = math.round, min = math.min, max = math.max, M = Matrix,
		RotX = M.RotationX, RotY = M.RotationY, 
		font_size = 12,
		ex = [1, 0, 0], ey = [0, 1, 0] , ez = [0, 0, 1], zerov = [0, 0, 0],neg_ex = [-1, 0, 0], neg_ey = [0, -1, 0] , neg_ez = [0, 0, -1],
		model_view_mtr = RotX(radians(15)).x(RotY(radians(-60)).x($M([ey, ez, ex]))),
		confs = [], 
		curr_conf = -1, 
		_off = $V(zerov), _org = $V(zerov), _scale = 1,
		self = this, 
		proj_mtr = $M([ex, neg_ey, ez]), 
		proj_model_view_mtr = proj_mtr.x(model_view_mtr),
		rot_mode = _undefined, top = confs_ ? 14 : 0,
		rotate_mode = 0, in_inch = 0, 
		ie = (getInternetExplorerVersion() !== -1), 
		bgcolor = bg || "#fff", framecolor = "#f8f8f8", 
		line_width = 1, point_size = 2, 
		lenToMM = function(len) { return round(len * 1000) + "mm"; }, 
		areaToMM = function(area) { return round(area * 10000000)/10 + "mm2"; }, 
		areaToIN = function(area) { return round(area / 0.00254/ 0.00254)/100 + "in2"; }, 
		coordToMM = function(c) { return round(c * 10000) / 10; }, 
		lenToMM1 = function(c) { return round(c * 10000) / 10 + "mm"; }, 
		simplify16th = function(s) {
			var den = 16;
			while( s && s % 2 === 0){
				s/=2;
				den/=2;
			}
			return [s, den];
		}, 
		coordToIN = function(c) {
			var f = 0.0015875, s = c < 0 ? -round(c / f) : round(c / f);

			if (s % 16 !== 0) {
				return (c < 0 ? "-" : "") + round(s / 16 - 0.5) + " " + simplify16th(math.abs(s % 16))[join]("/");
			}
			else {
				return (c < 0 ? "-" : "") + round(s / 16 - 0.5);
			}
		},
		lenToIN = function(len) {return coordToIN(len)+"in";}, 
		duplicateGeometry = function(g, scale)
		{
			return g[map](function(el){return el.transform(_undefined,_undefined,scale); });
		},
		static_lines=[], static_surfaces=[], screen_lines=[], screen_surfaces=[], line_selection=[], surface_selection=[],
		color_filter = {},
		all_colors=[],
		updateScreenData = function(g)
		{
			screen_lines=g[map](function(el){return el.lines(proj_model_view_mtr, _scale, _off); });
			screen_surfaces=g[map](function(el){return el.surface(proj_model_view_mtr, _scale, _off); });
		},
		buildScreenData = function(g)
		{
			updateScreenData(g);
			line_selection = screen_lines[map](function(el){ 
				return el[map](function(){
					return [0,0,0]; 
			}); });
			surface_selection = new Array(screen_surfaces[length]);
			var rot = M.I(3), tr = $V(zerov), s=1, old_color_filter = color_filter;
			static_lines=g[map](function(el){return el.lines(rot, s, tr); });
			static_surfaces=g[map](function(el){return el.surface(rot, s, tr); });

			color_filter = {};
			all_colors=[];
			g[forEach](function(el)
			{
				if(el.color in color_filter) { return; }
				all_colors.push(el.color);
				color_filter[el.color]=((el.color in old_color_filter)?old_color_filter[el.color]:1);
			});
		}, 
		rotateXY = function(x, y, mbtn) {
			if (x === 0 && y === 0) {
				return;
			}
			if ((rotate_mode === 0) == !mbtn) {
				_off = _off[add]($V([x, -y, 0]));
			} else {
				var z = 0, degs,rot;
				if (rot_mode == "z") {
					z = -y; x = 0; y = 0;
				}
				else if (rot_mode == "y") {
					x = 0;
				} else if (rot_mode == "x") {
					y = 0;
				}
				if (x === 0 && y === 0 && z === 0) {
					return;
				}
				degs = math.sqrt(x * x + y * y + z * z) * math.PI / min(w, h);
				rot = M.Rotation(degs, $V([-y, x, z]).toUnitVector());

				degs = model_view_mtr.x(_org).x(_scale);
				_off = _off[add](proj_mtr.x(degs)[subtract](proj_mtr.x(rot.x(degs))));
				model_view_mtr = rot.x(model_view_mtr);
			}
			self[redraw]();
		}, 
		rescale = function(factor) {
			var org = proj_model_view_mtr.x(_org);
			_off = _off[add](org.x(_scale)[subtract](org.x(_scale * factor)));
			_scale *= factor;
			self[redraw]();
		}, 
		tags = raphael[set](), geometry_set = raphael[set](), configuration_set = raphael[set](), info_set = raphael[set](), help_set = raphael[set](), 
		redb = "#b00", greenb = "#0b0", blueb = "#00b", grayc = "#ccc", gray = "#888", //fd0 = "#fd0", 
		none = "none", black = "#000", light_cyan = "#8ff", //cyan = "#0ff", 
		drawAxis = function() {
			var transform = function(v){ return proj_model_view_mtr.x(v.x(30))[add](_off); },
				s = transform($V(zerov));
			[[ex,"X",redb],[ey,"Y",greenb], [ez,"Z",blueb]][forEach]( function(el) {
				var e = transform($V(el[0]));
				geometry_set[push](r_line(raphael, s[elements], e[elements])[attr]({ stroke: el[2], "stroke-width": 1 }));
				e = s[add](e[subtract](s).x(1.25));
				geometry_set[push](raphael.text(e.e(1), e.e(2), el[1])[attr]({ stroke: el[2], "stroke-width": 1 }));
			});
		}, 
		configuration_changed = true,
		onConfiguration = function(curr) {
			curr_conf = curr;
			configuration_changed = true;
			self[redraw]();
			drawInformation();
		}, 
		setButtonCallbacks = function(btn, cl, over, out) {btn[click](cl);btn.mouseover(over); btn.mouseout(out); },
		makeLabelButton = function(text, width, callback, state, bgcolor, state_color) {
			state_color = state_color || light_cyan;
			var st = raphael[set](), rct = raphael[rect](0, 0, width, font_size + 2, 2), 
				txt = raphael.text(width / 2, font_size / 2 + 1, text)[attr](fontSize(font_size)),
				click = function() { callback(); rct[attr]({ fill: (state && state() ? state_color : bgcolor) }); },
				over = function() { rct[attr]({ fill: grayc }); txt[attr](fontWeight("bold")); },
				out = function() { rct[attr]({ fill: (state && state() ? state_color : bgcolor) }); txt[attr](fontWeight("normal")); };

			
			setButtonCallbacks(rct,click,over,out);
			setButtonCallbacks(txt,click,over,out);
			st[push](rct,txt);
			st[rect] = rct;
			st.update = function(){rct[attr]({ fill: (state && state() ? state_color : bgcolor), stroke: none }); };
			st.update();
			return st;
		}, 
		drawHelpLink = function() {
			help_set = makeLabelButton("Help", 30, function() { window.open("http://mladenov.ca/~nickm/help.html"); }, 0, framecolor);
			help_set[translate](w - 30, 0);
		}, 
		drawConfigurations = function() {
			if (!confs[length]) {return;}
			
			var title_len = confs_title[length],
				i, charsize,start;
			confs[forEach](function(c){ title_len += c[i][0][length]; });

			charsize = min((w - 20.0) / (title_len + confs[length] + 1), 8);
			start = (w - charsize * l) / 2 - 30;
			configuration_set[push](raphael.text(start + confs_title[length] * charsize / 2, top / 2, confs_title)[attr](fontSize(font_size)));
			start += (1 + confs_title[length]) * charsize;
			confs[forEach](function(el, i){
				configuration_set[push](makeLabelButton(el[0],el[0][length] * charsize, function(){ onConfiguration(i); }, function(){return i === curr_conf;},framecolor)[translate](start, 1));
				start += (1 + el[0][length]) * charsize;
			});
		}, 
		angleFrom = function(vec1, vec2) {
			return math.atan2(vec1.cross(vec2)[modulus](), vec1.dot(vec2));
		}, 
		angleBetween = function(seg1, seg2) {
			var dists = [seg1[0][subtract](seg2[0])[modulus](), seg1[0][subtract](seg2[1])[modulus](), seg1[1][subtract](seg2[0])[modulus](), seg1[1][subtract](seg2[1])[modulus]()],
				mini = dists.minIndex(),ang = 0;
			if (mini === 0){
				ang = angleFrom(seg1[1][subtract](seg1[0]), seg2[1][subtract](seg2[0]));
				}
			if (mini === 1){
				ang = angleFrom(seg1[1][subtract](seg1[0]), seg2[0][subtract](seg2[1]));
				}
			if (mini === 2){
				ang = angleFrom(seg1[0][subtract](seg1[1]), seg2[1][subtract](seg2[0]));
				}
			if (mini === 3){
				ang = angleFrom(seg1[0][subtract](seg1[1]), seg2[0][subtract](seg2[1]));
				}

			return degrees(ang);
		}, 
		total_len = 0, pinf = 100000000, bounding_box = [$V([pinf, pinf, pinf]), $V([-pinf, -pinf, -pinf])], 
		lenToUnit = function(which){ return in_inch ? lenToIN : which ? lenToMM1 : lenToMM; },
		areaToUnit = function(){ return in_inch ? areaToIN : areaToMM; },
		coordToUnit = function(){ return in_inch ? coordToIN : coordToMM; },
		fit = function() {
			var sizes = bounding_box[1][subtract](bounding_box[0]), 
				s = min((w - 40) / (sizes.e(1)||1), (h - 80) / ( sizes.e(2)||1)), 
				org = (bounding_box[1][add](bounding_box[0])).x(0.5);

			_org = proj_model_view_mtr.inv().x(org[subtract](_off).x(1 / _scale));
			_scale = _scale * s;
			_off = $V([w / 2, h / 2, 0])[subtract](org[subtract](_off).x(s));
		}, 
		drawInformation = function() {
			var accumulated_len = 0, accumulated_area = 0, 
				pts = [], xs = [], ys = [], zs = [], dirs = [],segs=[], rads = [],
				str = "", count = 0, sel_count=0,
				testPush = function(arr, val, pred)
				{ 
					pred = pred||function(a,b){return a===b;}; 
					if( !arr.some(function(el){return pred(el,val);}) ){
						arr[push](val);
						return true;
					}
					return false;
				}, dirPred = function (a,b){ return a[1]==a[2] && a[0].eql(b[0]); };
				
			info_set &&  info_set[remove]();
			line_selection[forEach](function(el, i){
				el[forEach](function(el,j){
					var ln = static_lines[i][j], cg = current_geometry[i];
					if(el[0]){
						sel_count+=1;
						pts[push](ln[line][0],ln[line][1]);
						if(!static_surfaces[i])
						{
							accumulated_len += ln.len;
							testPush(rads,cg.radius[elements],function(a,b){return a[length]==b[length] && a[0]==b[0] && (b[length]===1||a[1]==b[1]);});
						}
						if(testPush(dirs, [ln.dir, 'l'], dirPred))
						{
							segs[push](ln[line]);
						}
					}else{
						if(el[1]){pts[push](ln[line][0]);sel_count+=1;}
						if(el[2]){pts[push](ln[line][1]);sel_count+=1;}
					}
				});
			});
			surface_selection[forEach](function(el, i){
				if(el){
					var surf = static_surfaces[i];
					accumulated_area += surf.area;
					if(testPush(dirs, [surf.dir, 'p'], dirPred))
					{
						sel_count+=1;
						segs[push]([surf.org, surf.org[add](surf.dir)]);
					}
				}
			});

			pts[forEach](function (el){
				testPush(xs, el.e(1));
				testPush(ys, el.e(2));
				testPush(zs, el.e(3));
			});
			[[xs,'x'],[ys,'y'],[zs,'z']][forEach](function(dim){
				if (dim[0][length] === 1) {
					str += " "+dim[1]+": " + lenToUnit(1)(dim[0][0]);
					++count;
				}
				else if (dim[0][length] === 2) {
					str += " \u0394"+dim[1]+": " + lenToUnit(1)(math.abs(dim[0][0] - dim[0][1]));
					++count;
				}
			});
			if (segs[length] === 2 ) {
				segs = angleBetween(segs[0], segs[1]);
				str += " \u2221" + round(10 * (dirs[0][1]!=dirs[1][1]?90-segs:segs )) / 10 + "\u00B0";
				++count;
			}
			if (rads[length] === 1 ) {
				str += " R:" + rads[0][map](lenToUnit(1))[join](',');
				++count;
			}

			if (accumulated_len > 0) {
				str += " Total len: " + lenToUnit(1)(accumulated_len);
				++count;
			}
			if (accumulated_area > 0) {
				str += " area: " + areaToUnit()(accumulated_area);
				++count;
			}

			info_set = raphael.text(w / 2 - 20, top + 7, str ?	"Selection info (" + sel_count + "): " + str : 
				"Select elements for info. Double click to clear. Total len: " + lenToUnit(1)(total_len))[attr](fontSize(font_size));
		}, 
		deselectAll = function() {
			line_selection[forEach](function(el){
				el[forEach](function(el){
					el[0] = false;
					el[1] = false;
					el[2] = false;
				});
			});
			surface_selection[forEach](function(el, i, arr){
				arr[i] = false;
			});
			self[redraw]();
			drawInformation();
		}, 
		popup = function(i,j,k) {
			tags[remove]();
			if(k===_undefined){
				var s = screen_surfaces[i], c = s.org;
				tags[push](raphael.g.popup(c.e(1), c.e(2), areaToUnit()(s.area), null, 3)); //.insertAfter(this));
			}else
			{
				var l = static_lines[i][j],sl = screen_lines[i][j].line, o = ((sl[0])[add](sl[1]))['x'](0.5);
				if(k===0){
					tags[push](raphael.g.popup(o.e(1), o.e(2), lenToUnit(1)(l.len), null, 3)); //.insertAfter(this));
				}else if(k === 1){
					tags[push](raphael.g.popup(sl[0].e(1), sl[0].e(2), l[line][0][elements][map](coordToUnit())[join](','), null, 3)); //.insertAfter(this));
				}else if(k === 2){
					tags[push](raphael.g.popup(sl[1].e(1), sl[1].e(2), l[line][1][elements][map](coordToUnit())[join](','), null, 3)); //.insertAfter(this));
				}
			}
		}, 
		popdown = function() {
			tags[remove]();
		}, 
		ongclick = function(i, j, k) {
			if(k!==_undefined){
				line_selection[i][j][k] = !line_selection[i][j][k];
			}else{
				surface_selection[i] = !surface_selection[i];
			}
			self[redraw]();
			drawInformation();
		}, 
		applyHover = function(btn, obj, fillin, fillout, strokein, strokeout) {
			var makeattr = function(fil, strok) {
				var attr = {}, v = {};
				(fil == _undefined ? v : attr).fill = fil;
				(strok == _undefined ? v : attr).stroke = strok;
				return attr;
			};
			obj = obj || btn;
			if (obj == btn) {
				obj[attr]({ fill: fillout, stroke: strokeout });
				obj.fillin = fillin;
				obj.fillout = fillout;
				obj.strokein = strokein;
				obj.strokeout = strokeout;
			}
			btn[hover](function() {
						obj[attr](makeattr(obj.fillin, obj.strokein));
					},
					function() {
						obj[attr](makeattr(obj.fillout, obj.strokeout));
					});
			return btn;
		}, 
		makeButton = function(bg, decoration,  callback, state, bgcolor, state_color) {
			state_color = state_color || light_cyan;
			var _set = raphael[set](), 
				click = function() { callback(); bg[attr]({ fill: (state && state() ? state_color : bgcolor) }); },
				over = function() { bg[attr]({ fill: state_color!=grayc?grayc:(state && state() ? bgcolor : state_color) }); },
				out = function() { bg[attr]({ fill: (state && state() ? state_color : bgcolor) }); };

			
			setButtonCallbacks(bg,click,over,out);
			setButtonCallbacks(decoration,click,over,out);
			_set[push](bg,decoration);
			_set.update = function(){bg[attr]({ fill: (state && state() ? state_color : bgcolor)});};
			_set.update();
			return _set;
		}, 
		switchRotateMode = function() {
			rotate_mode = rotate_mode ? 0 : 1;
			self[redraw]();
		}, 
		color_filter_btn_set = raphael[set](),
		drawColorFilterButtons = function(){
			color_filter_btn_set.remove();
			if(all_colors.length<2) { return; }
			var makeColorButton = function(level, width, color){
					return makeButton(raphael[rect](1, 1+12*level, 30, 11)[attr]({ stroke: none}), r_line(raphael, [3, 6+12*level], [29, 6+12*level])[attr]({ stroke: color, "stroke-width": width }),
						function() { color_filter[color] = color_filter[color]?0:1; self[redraw](); },
						function() { return (color_filter[color] === 1); },
						framecolor,
						grayc);
				},i;
			for (i=0; i!=all_colors.length; ++i)
			{
				color_filter_btn_set.push(makeColorButton(i, 5, all_colors[i]));
			}
			color_filter_btn_set[translate](w-35, 50);
		},
		drawButtons = function() {
			var gray2 = "#ccc", 
//				common_attr = { stroke: "#000", "stroke-linejoin": "round" }, 
				rear_empty = { fill: bgcolor, "stroke-dasharray": "-", "stroke-width": 1 }, 
				front_full = { fill: bgcolor, "stroke-width": 2, "fill-opacity": 0.75 }, 
				rear_full = { fill: bgcolor, "stroke-width": 0.5, "stroke-dasharray": "-" }, 
				front_empty = { fill: none, "stroke-width": 2, "fill-opacity": 0.5 }, 
				btn_set, inch_btn, mm_btn,
				line_width_btns = [], point_size_btns = [],
				makeLineWidthButton = function(level, width){
					return makeButton(raphael[rect](1, 1+12*level, 30, 11)[attr]({ stroke: none}), r_line(raphael, [3, 6+12*level], [29, 6+12*level])[attr]({ stroke: black, "stroke-width": width }),
						function() { line_width = width; line_width_btns.forEach(function(el){el.update(); }); self[redraw](); },
						function() { return (line_width === width); },
						framecolor);
				},
				makePointSizeButton = function(level, size){
					return makeButton(raphael[circle](40, 7+11*level, size+3)[attr]({ stroke: none}), raphael[circle](40, 7+11*level, size||0.5)[attr]({ fill: black}),
						function() { point_size = size; point_size_btns.forEach(function(el){el.update(); }); self[redraw](); },
						function() { return (point_size === size); },
						framecolor);
				}
				;


			line_width_btns.push(makeLineWidthButton(0,5), makeLineWidthButton(1,3), makeLineWidthButton(2,1) );
			point_size_btns.push(makePointSizeButton(0,4), makePointSizeButton(1,3), makePointSizeButton(2,2), makePointSizeButton(3,0) );
			line_width_btns.concat(point_size_btns).forEach(function(el){el[translate](30, h - 42);});

			mm_btn = makeLabelButton("mm", 20, function() { in_inch = 0; inch_btn.update(); drawInformation(); }, function() { return !in_inch; }, framecolor)[translate](0, h - 40);
			inch_btn = makeLabelButton("in", 20, function() { in_inch = 1; mm_btn.update(); drawInformation(); }, function() { return in_inch; }, framecolor)[translate](0, h - 20);

			makeButton(raphael[circle](16, 15, 14).attr({stroke:none}), 
				raphael[path]("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM15.687,9.051h-4v2.833H8.854v4.001h2.833v2.833h4v-2.834h2.832v-3.999h-2.833V9.051z")[attr]({ fill: black, stroke: none }),
					function() { rescale(1.1); }, 0, framecolor)[translate](w - 122, h - 30);
			makeButton(raphael[circle](16, 15, 14).attr({stroke:none}), 
				raphael[path]("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM8.854,11.884v4.001l9.665-0.001v-3.999L8.854,11.884z")[attr]({ fill: black, stroke: none }),
					function() { rescale(1 / 1.1); }, 0, framecolor)[translate](w - 93, h - 30);

			makeButton(raphael[circle](16, 16, 14).attr({stroke:black}), 
				raphael[path]("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z")[attr]({ fill: black })[scale](3 / 4),
					switchRotateMode, function(){return rotate_mode===1;}, framecolor)[translate](w - 32, h - 32);

			makeButton(raphael[circle](15.5, 15.5, 14).attr({stroke:black}), 
				raphael[path]("M25.545,23.328,17.918,15.623,25.534,8.007,27.391,9.864,29.649,1.436,21.222,3.694,23.058,5.53,15.455,13.134,7.942,5.543,9.809,3.696,1.393,1.394,3.608,9.833,5.456,8.005,12.98,15.608,5.465,23.123,3.609,21.268,1.351,29.695,9.779,27.438,7.941,25.6,15.443,18.098,23.057,25.791,21.19,27.638,29.606,29.939,27.393,21.5z")[attr]({ fill: black, stroke: black })[scale](5 / 8),
					function() { fit(); self[redraw](); }, 0, framecolor)[translate](w - 64, h - 32);


			btn_set = raphael[set]();
			btn_set[push](raphael[path]("M0,3l15,-3l9,5l-15,3z"));
			btn_set[push](raphael[path]("M0,3l9,5v16l-9,-5z"));
			btn_set[push](raphael[path]("M9,8v16l15,-3v-16z"));
			btn_set[attr](front_full);
			applyHover(btn_set, _undefined, gray, bgcolor)[click](function() { model_view_mtr = RotX(radians(15)).x(RotY(radians(-60)).x($M([ey, ez, ex]))); self[redraw](); });
			btn_set[translate](w - 206, h - 28)[attr]({ stroke: "#000", "stroke-linejoin": "round" });


			btn_set = raphael[set]();
			btn_set[push](raphael[path]("M0,24l8,-8v-16m0,16h16")[attr](rear_empty));
			btn_set[push](applyHover(raphael[path]("M0,8v16h16v-16z")[attr](front_full), _undefined, gray, bgcolor)[click](function() { model_view_mtr = $M([ey, ez, ex]); self[redraw](); }));
			btn_set[push](applyHover(raphael[path]("M0,8h16l8,-8h-16z")[attr](front_full), _undefined, gray, bgcolor)[click](function() { model_view_mtr = $M([ey, neg_ex, ez]); self[redraw](); }));
			btn_set[push](applyHover(raphael[path]("M16,8v16l8,-8v-16z")[attr](front_full), _undefined, gray, bgcolor)[click](function() { model_view_mtr = $M([neg_ex, ez, ey]); self[redraw](); }));
			btn_set[translate](w - 178, h - 28)[attr]({ stroke: "#000", "stroke-linejoin": "round" });

			btn_set = raphael[set]();
			btn_set[push](applyHover(raphael[path]("M0,8v16l8,-8v-16z")[attr](rear_full), _undefined, gray2, bgcolor)[click](function() { model_view_mtr = $M([ex, ez, neg_ey]); self[redraw](); }));
			btn_set[push](applyHover(raphael[path]("M0,24h16l8,-8h-16z")[attr](rear_full), _undefined, gray2, bgcolor)[click](function() { model_view_mtr = $M([ey, ex, neg_ez]); self[redraw](); }));
			btn_set[push](applyHover(raphael[path]("M8,0h16v16h-16z")[attr](rear_full), _undefined, gray2, bgcolor)[click](function() { model_view_mtr = $M([neg_ey, ez, neg_ex]); self[redraw](); }));
			btn_set[push](raphael[path]("M0,8v16h16v-16z")[attr](front_empty));
			btn_set[push](raphael[path]("M0,8h16l8,-8h-16z")[attr](front_empty));
			btn_set[push](raphael[path]("M16,8v16l8,-8v-16z")[attr](front_empty));
			btn_set[translate](w - 150, h - 28)[attr]({ stroke: "#000", "stroke-linejoin": "round" });
		}, 
		vmin = function(v1, v2) {
			return $V([min(v1.e(1), v2.e(1)), min(v1.e(2), v2.e(2)), min(v1.e(3), v2.e(3))]);
		}, 
		vmax = function(v1, v2) {
			return $V([max(v1.e(1), v2.e(1)), max(v1.e(2), v2.e(2)), max(v1.e(3), v2.e(3))]);
		}, 
		moving = 0, 
		setDragCB = function(obj, rot_mod) {
			var lastx, lasty;
			obj.drag(
				function(dx, dy) {
					var x = dx - lastx,
					y = -dy + lasty;
					lastx = dx;
					lasty = dy;
					rotateXY(x, y, obj.mb);
				},
				function(x, y, ev) {
					rot_mode = rot_mod;
					lastx = 0; lasty = 0;
					if (ev.which == _undefined){obj.mb = (ev.button == 4); }
					else {obj.mb = (ev.which == 2);}
					moving = 1;
				}, function() {
					moving = 0;
					self[redraw]();
				}
			);
			obj.dblclick(function() { deselectAll(); self[redraw](); drawInformation(); });
			return obj;
		}, 
		dragRect = function(x, y, w, h, round, rot_mod, clr) {
			return setDragCB(raphael[rect](x, y, w, h, round)[attr]({ fill: clr, stroke: none }), rot_mod) ;
		}, 
		isArray = function(o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		},
		sortFunc = function(a, b) {return a[0] - b[0];},
		sortScreenData = function()
		{
			var lines = [], surfs = [];
			screen_lines[forEach](function(el,i){ 
				el[forEach](function(el,j){ 
					lines[push]([math.min(el[line][0].e(3),el[line][1].e(3)),i,j]);
				}); 
			});
			if(lines[length]-surfs[length]*4<100) {lines.sort(sortFunc); }
			
			screen_surfaces[forEach](function(el,i){ el && surfs[push]([el.org.e(3),i]);});
			if(surfs[length]<100){surfs.sort(sortFunc);}
		
			return [lines, surfs];
		},
		setMouseCallbacks = function(o,i,j,k){
                o[hover](function(){popup(i,j,k);}, popdown);
                o[click](function(){ongclick(i,j,k);});
				return o;
		}; //endof var

    raphael.g = raphael.g || raphael;
    if (confs_) {
        curr_conf = 0;
    }

    dragRect(1, 1, w - 2, h - 2, 10, "3", bgcolor);
    dragRect(1, 1, w - 2, 40, 10, "x", framecolor);
    dragRect(1, 1, 40, h - 2, 10, "z", framecolor);
    dragRect(w - 41, 1, w - 2, h - 2, 10, "y", framecolor);
    dragRect(1, h - 42, w - 2, h - 2, 10, "x", framecolor);
	if(title!==undefined) 
	{
		setDragCB(raphael.text(w/2-100, h - 20, title).attr({"font-size":20}),"x");
	}

    drawButtons();
    drawHelpLink();
    drawConfigurations();
    drawInformation();

    this[redraw] = function() {
        tags[remove]();
        geometry_set[remove]();
        var p, color, clr, 
			bg_lines = raphael[set](), bg_points = raphael[set](), surfaces = raphael[set](), 
			fg_lines = {}, fg_points = {},
			sorted, bgcolor="#fcf", small;
			
        total_len = 0;

        proj_model_view_mtr = proj_mtr.x(model_view_mtr);
		if(configuration_changed )
		{
			if(curr_conf !== -1){
				if (isArray(confs_[curr_conf][1])){
					current_geometry = geometry.concat(confs_[curr_conf][1]);
				}else{
					current_geometry = duplicateGeometry(geometry, confs[curr_conf][1]);
				}
			}
			buildScreenData(current_geometry);
			drawColorFilterButtons();
			configuration_changed = false;
		}else{
			updateScreenData(current_geometry);
		}
		sorted = sortScreenData();
		small = (sorted[0][length]-sorted[0][length]*4)<100;
        bounding_box = [$V([pinf, pinf, pinf]), $V([-pinf, -pinf, -pinf])];
        geometry_set[push](surfaces);
		sorted[1][forEach](function(el) {
			var s = "M", i = el[1], surf = screen_surfaces[i], len = surf[path][length];
			color = current_geometry[i].color;
			if(!color_filter[color]) { return; }
			color = (surface_selection[i] ? "#f0f" : color);
			surf[path][forEach](function(el,i){s+=el.e(1)+","+el.e(2)+(i<len-1 ? "L":"z");});
			surfaces[push](surf = raphael[path](s).attr({stroke:none, fill:color, "fill-opacity": 0.25}));
			if (!moving ){setMouseCallbacks(surf,i);}
		});
        if (!moving && !ie && line_width < 11 && small) {
            geometry_set[push](bg_lines);
            geometry_set[push](bg_points);
			sorted[0][forEach](function(el) {
				var i = el[1], j = el[2], l = screen_lines[i][j].line;
				color = current_geometry[i].color;
				if(!color_filter[color]) { return; }
                bg_lines[push](setMouseCallbacks(r_line(raphael,l[0][elements],l[1][elements]),i,j,0));
                bg_points[push](setMouseCallbacks(raphael[circle](l[0].e(1), l[0].e(2), 8),i,j,1));
                bg_points[push](setMouseCallbacks(raphael[circle](l[1].e(1), l[1].e(2), 8),i,j,2));
            });
            bg_lines[attr]({ stroke: bgcolor, "stroke-width": 11, "fill-opacity": 0, "stroke-opacity": 0 });
            bg_points[attr]({ stroke: bgcolor, fill: bgcolor, "fill-opacity": 0, "stroke-opacity": 0 });
        }
        drawAxis();

        sorted[0][forEach](function(el) {
			var i = el[1], j = el[2], sl = screen_lines[i][j], l = sl[line], seg_len = sl.len;
			color = current_geometry[i].color;
			if(!color_filter[color]) { return; }
            bounding_box[0] = vmin(vmin(bounding_box[0], l[0]), l[1]);
            bounding_box[1] = vmax(vmax(bounding_box[1], l[0]), l[1]);

			if(seg_len > 1e-7)
			{
				if(!static_surfaces[i]){total_len += seg_len;}
				else if ( moving ) {return ; }
				p = r_line(raphael,l[0][elements],l[1][elements]);
				clr = (line_selection[i][j][0] ? "#f0f" : color);
				if (!(clr in fg_lines)) {
					fg_lines[clr] = raphael[set]();
					geometry_set[push](fg_lines[clr]);
				}
				fg_lines[clr][push](p);

				if (!moving) {
					setMouseCallbacks(p,i,j,0);
					
					if(point_size!==0 ){
						[1,2].forEach(function(k){
							clr = (line_selection[i][j][k] ? "#f0f" : color);
							if (!(clr in fg_points)) {
								fg_points[clr] = raphael[set]();
								geometry_set[push](fg_points[clr]);
							}
							fg_points[clr][push](setMouseCallbacks(raphael[circle](l[k-1].e(1), l[k-1].e(2), point_size),i,j,k));
						});
					}
				}
			}else{
				p = raphael[circle](l[0].e(1), l[0].e(2), 5);
				p[hover](function(){popup(i,j,1);}, popdown);
				clr = (line_selection[i][j][1] ? "#f0f" : color);
				if (!(clr in fg_points)) {
					fg_points[clr] = raphael[set]();
					geometry_set[push](fg_points[clr]);
				}
				fg_points[clr][push](p);
			}
        });
        for (p in fg_lines)
        {
			fg_lines[p][attr]({ stroke: p, "stroke-width": line_width });
		}
        for (p in fg_points)
        {
			fg_points[p][attr]({ stroke: p, fill: p });
		}
		
        //        drawInformation(selected, total_len);
        //        drawHelpLink();
        //        drawConfigurations();
    };

    this[redraw]();
    this.fit = function() { fit(); };
	this.fit();
    this[redraw]();
    drawInformation();
};
	return nv;
})(NecViewer||{});