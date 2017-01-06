/* copyright 2013 Nikolay Mladenov 
// version 1.0
*/
var NecViewer = (function(nv) {
	var cards = 		["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],
	compressed_cards =  ["W", "f", "o", "i", "l", "K", "I", "J", "w", "A", "", "H", "T", "R", "S", "X", "P", "p", "M", "E", "C"],
	length = 'length', splice = "splice", split = 'split', forEach = "forEach",
	decompress_map = (function(){var res = {},i; for(i=0;i!=cards[length]; ++i){res[compressed_cards[i]]=cards[i];} return res;})();

	nv.decompress = function(nec) {
		var createLineParser = function() {
			var last=undefined, 
				updateLast = function(t){ last = t.slice();}, 
				updateTokens = function(t, l, start, count)
				{
					count+=start;
					for(var i=start; i!=count; ++i)
					{ 
						if(t[i]==="") {t[i] = l[i]; } 
						else if(t[i]=="+"){t[i] = t[i-3]; } 
						else if(t[i]=="-"){t[i] = -t[i-3]; } 
					}
				};
			return { 
				gw: function(t) {
					if(!last){
						updateTokens(t, t, 6, 3);
						updateLast(t);
						return t;
					}
					if( !t[9] ){ t[9]=last[9]; }
					updateTokens(t,last,1,8);
					updateLast(t);
					return t;
				},
				g1: function(t)
				{
					t[0]="gw";
					t[splice](3,0,last[3], last[4], last[5]);
					return this.gw(t);
				},
				g2: function(t)
				{
					t[0]="gw";
					t[splice](6,0,last[3], last[4], last[5]);
					return this.gw(t);
				},
				g3: function (t)
				{
					t[0]="gw";
					t[splice](3,0,last[6], last[7], last[8]);
					return this.gw(t);
				},
				g4: function (t)
				{
					t[0]="gw";
					t[splice](6,0,last[6], last[7], last[8]);
					return this.gw(t);
				},
				g5: function(t)
				{
					t[0]="gw";
					t[splice](6,0,t[3], t[4]);
					t = this.gw(t);
					t[6]=t[3];
					t[7]=t[4];
					updateLast(t);
					return t;
				},
				g6: function(t)
				{
					t[0]="gw";
					t[splice](7,0,t[4], t[5]);
					t = this.gw(t);
					t[7]=t[4];
					t[8]=t[5];
					updateLast(t);
					return t;
				},
				g7: function(t)
				{
					t[0]="gw";
					t[splice](5,0,t[6], t[3]);
					t = this.gw(t);
					t[5]=t[8];
					t[6]=t[3];
					updateLast(t);
					return t;
				},
				general: function(t){
					for (var i=1; i!=t[length]; ++i)
					{
						if(t[i]==="")
						{
							t[i] = "0";
						}
					}
					return t;
				},
				gs: function(t){
					t[splice](1,0,"0","0");
					return t;
				}
			};
		},
		parser = createLineParser(),res="";
		
		nec = nec[split](/,(?=[a-zA-Z],)/gi); 
		nec[forEach](function(el){
			var spl = el[split](',');
			if(!spl) {return; }
			if( ! (spl[0]in decompress_map) )
			{
				res+=el+",";
				return;
			}
				
			spl[0] = decompress_map[spl[0]];
			if(! (spl[0] in parser))
			{
				spl = parser.general(spl);
			}
			else
			{	
				spl = parser[spl[0]](spl);
			}
			if(spl)
			{
				res+=spl.join(",")+",";
			}
		});
		
		return res;
	};

    nv.geometryViewer = function(rwidth, rheight, loca) {
        var math = Math, PI = math.PI, M = Matrix, Rotation = "Rotation",MRZ = M[Rotation+'Z'], push = 'push', replace = 'replace',
		substr = 'substr', indexOf = 'indexOf', black = '#000', charAt = 'charAt', toLowerCase = "toLowerCase",
		create = "create", transform = "transform", lines = "lines", surface = "surface",segments="segs",
		add = "add", subtract = "subtract", modulus = "modulus", toUnitVector = "toUnitVector", color = "color", radius = "radius", tag = "tag", area= "area", cross = "cross",
		doc = document, last="last", innerHTML = "innerHTML",getElementById = "getElementById", _undefined = undefined, geometry_id = 'geometry', 
		max = math.max, cos = math.cos, sin = math.sin,
	wire = (function() {
	    var _wire = function(color_, tag_, segs_, radius_, s, e) {
			var self = this;
	        self[tag] = tag_;
	        self[color] = color_;
	        self[radius] = $V(radius_);
	        self[segments] = segs_;
	        self.s = $V(s);
	        self.e = $V(e);
	        self.d = self.e[subtract](self.s);
	        self.l = self.d[modulus]();
	    }, proto = _wire.prototype;
	    _wire[create] = function(color, tag, segs, radius, s, e) { 
			return new _wire(color, tag, segs, radius, s, e); 
		};
	    proto[transform] = function(rotation, translation, scale, tag_inc, tag_cond) {
	        rotation = rotation || M.I(3);
	        translation = translation || $V([0, 0, 0]);
	        scale = scale || 1;
	        tag_inc = tag_inc || 0;
			tag_cond = tag_cond || 0;
			var self = this;
	        return (!tag_cond || tag_cond === self[tag]) ? _wire[create](self[color], self[tag] + tag_inc, self[segments], self[radius].x(scale), rotation.x(self.s)[add](translation).x(scale), rotation.x(self.e)[add](translation).x(scale)) : _undefined;
	    };
	    proto[lines] = function(rotation, scale, offset) {
			var self = this;
	        return [{ line: [rotation.x(self.s).x(scale)[add](offset), rotation.x(self.e).x(scale)[add](offset)], len: self.l, dir: rotation.x(self.d)}];
	    };
	    proto.setRadius = function(r) {
	        this[radius] = $V(r);
	    };
	    proto[surface] = function() { return _undefined; };
	    return _wire;
	})(),
	cpatch = (function() {
	    var _cpatch = function(color_, area_, center, dir) {
			var self = this;
	        self[color] = color_;
	        self[area] = area_;
	        self.c = $V(center);
	        self.d = $V(dir);
	        self.b = []; //boundary
	        var v = self.d.eql([0, 0, 1]) ? self.d[cross]([1, 0, 0])[toUnitVector]() : self.d[cross]([0, 0, 1])[toUnitVector](),
			    u = v[cross](self.d),
			    r = math.sqrt(self[area]/ math.PI) , a = 0, b = math.PI / 12;
	        while (self.b[length] != 24) {
	            self.b[push]( self.c[add]( u.x(r * cos(a))[add](v.x(r * sin(a))) ) );
	            a += b;
	        }
	    },proto = _cpatch.prototype;
	    _cpatch[create] = function(color, area, c, d) { return new _cpatch(color, area, c, d); };
	    proto [transform] = function(rotation, translation, scale, tag_inc, tag_cond) {
	        rotation = rotation || M.I(3);
	        translation = translation || $V([0, 0, 0]);
	        scale = scale || 1;
			var self = this;
	        return !tag_cond ? _cpatch[create](self[color], self[area] * scale * scale, rotation.x(self.c)[add](translation).x(scale), rotation.x(self.d)):_undefined;
	    };
	    proto [lines] = function() { return []; };
	    proto [surface] = function(rotation, scale, offset) {
	        var path = [],self=this;
	        while (path[length] != self.b[length]) {
	            path[push](rotation.x(self.b[path[length]]).x(scale)[add](offset));
	        }

	        return { path: path, area: self[area], dir: rotation.x(self.d), org: rotation.x(self.c).x(scale)[add](offset) };
	    };
	    return _cpatch;
	})(),
	tpatch = (function() {
	    var _tpatch = function(color_, v1, v2, v3) {
			var self = this;
	        self[color] = color_;
	        self.v1 = $V(v1);
	        self.v2 = $V(v2);
	        self.v3 = $V(v3);
	        self.d = self.v1[subtract](self.v2)[cross](self.v3[subtract](self.v2));
	        self[area] = self.d[modulus]() / 2;
	        self.d = self.d[toUnitVector]();
			self.c = self.v1[add](self.v2)[add](self.v3).x(1/3.0);
	    },proto = _tpatch.prototype;
	    _tpatch[create] = function(c, v1, v2, v3) { return new _tpatch(c, v1, v2, v3); };
	    proto[transform] = function(rotation, translation, scale, tag_inc, tag_cond) {
	        rotation = rotation || M.I(3);
	        translation = translation || $V([0, 0, 0]);
	        scale = scale || 1;
			var self = this;
	        return !tag_cond?_tpatch[create](self[color], rotation.x(self.v1)[add](translation).x(scale), rotation.x(self.v2)[add](translation).x(scale), rotation.x(self.v3)[add](translation).x(scale)):_undefined;
	    };
	    proto[lines] = function(rotation, scale, offset) {
   			var self = this, l = [rotation.x(self.v1).x(scale)[add](offset), rotation.x(self.v2).x(scale)[add](offset)],
			     diff = l[1][subtract](l[0]),
			     res = [{ line: l, len: diff[modulus](), dir: diff[toUnitVector]()}];

	        l = [rotation.x(self.v2).x(scale)[add](offset), rotation.x(self.v3).x(scale)[add](offset)];
	        diff = l[1][subtract](l[0]);
	        res[push]({ line: l, len: diff[modulus](), dir: diff[toUnitVector]() });
	        l = [rotation.x(self.v3).x(scale)[add](offset), rotation.x(self.v1).x(scale)[add](offset)];
	        diff = l[1][subtract](l[0]);
	        res[push]({ line: l, len: diff[modulus](), dir: diff[toUnitVector]() });
	        return res;
	    };
	    proto[surface] = function(rotation, scale, offset) {
			var self = this;
	        return { path: [rotation.x(self.v1).x(scale)[add](offset), rotation.x(self.v2).x(scale)[add](offset), rotation.x(self.v3).x(scale)[add](offset)], area: self[area], dir: rotation.x(self.d), org: rotation.x(self.c).x(scale)[add](offset)  };
	    };
	    return _tpatch;
	})(),
	qpatch = (function() {
	    var _qpatch = function(color_, v1, v2, v3, v4) {
			var self = this;
	        self[color] = color_;
	        self.v1 = $V(v1);
	        self.v2 = $V(v2);
	        self.v3 = $V(v3);
	        self.v4 = v4 ? $V(v4) : self.v3[add](self.v1[subtract](self.v2));
	        self.d = self.v1[subtract](self.v3)[cross](self.v4[subtract](self.v2))[toUnitVector]();
	        self[area] = self.v1[subtract](self.v2)[cross](self.v3[subtract](self.v2))[modulus]() / 2 +
			            self.v1[subtract](self.v4)[cross](self.v3[subtract](self.v4))[modulus]() / 2;
			self.c = self.v1[add](self.v2)[add](self.v3)[add](self.v4).x(1/4.0);
	    },proto = _qpatch.prototype;
	    _qpatch[create] = function(c, v1, v2, v3, v4) { return new _qpatch(c, v1, v2, v3, v4); };
	    proto[transform] = function(rotation, translation, scale, tag_inc, tag_cond) {
	        rotation = rotation || M.I(3);
	        translation = translation || $V([0, 0, 0]);
	        scale = scale || 1;
			var self = this;
	        return !tag_cond? _qpatch[create](self[color], rotation.x(self.v1)[add](translation).x(scale), rotation.x(self.v2)[add](translation).x(scale),
			                      rotation.x(self.v3)[add](translation).x(scale), rotation.x(self.v4)[add](translation).x(scale)): _undefined;
	    };
	    proto[lines] = function(rotation, scale, offset) {
   			var self = this, l = [rotation.x(self.v1).x(scale)[add](offset), rotation.x(self.v2).x(scale)[add](offset)],
			     diff = l[1][subtract](l[0]),
			     res = [{ line: l, len: diff[modulus](), dir: diff[toUnitVector]()}];

	        l = [rotation.x(self.v2).x(scale)[add](offset), rotation.x(self.v3).x(scale)[add](offset)];
	        diff = l[1][subtract](l[0]);
	        res[push]({ line: l, len: diff[modulus](), dir: diff[toUnitVector]() });
	        l = [rotation.x(self.v3).x(scale)[add](offset), rotation.x(self.v4).x(scale)[add](offset)];
	        diff = l[1][subtract](l[0]);
	        res[push]({ line: l, len: diff[modulus](), dir: diff[toUnitVector]() });
	        l = [rotation.x(self.v4).x(scale)[add](offset), rotation.x(self.v1).x(scale)[add](offset)];
	        diff = l[1][subtract](l[0]);
	        res[push]({ line: l, len: diff[modulus](), dir: diff[toUnitVector]() });
	        return res;
	    };
	    proto[surface] = function(rotation, scale, offset) {
			var self = this;
	        return { path: [rotation.x(self.v1).x(scale)[add](offset), rotation.x(self.v2).x(scale)[add](offset), rotation.x(self.v3).x(scale)[add](offset), rotation.x(self.v4).x(scale)[add](offset)], area: this[area], dir: rotation.x(self.d), org: rotation.x(self.c).x(scale)[add](offset)  };
	    };
	    return _qpatch;
	})(),
	transformByMatrix = function(g, tag_cond, rot, trans, scale, count, tag_inc) {
	    if (!count) {
			var f = function(el, ind, arr) { 
				var e = el[transform](rot, trans, scale, 0, tag_cond); 
				if(e){
					arr[ind] = e;
					tag_cond = 0;
				}
			};
	        g[forEach](f);
	    }
	    else {
			var i, first, c = count,last=g[length];
			for(i=0; i!=last; ++i)
			{
				first = g[i][transform](rot, trans, scale, tag_inc,tag_cond);
				if(first){break;}
			}
			if (!first) { return; }
			while (c) {
				c-=1;
				for(; i!=last; ++i)
				{
					g[push](g[i][transform](rot, trans, scale, tag_inc,0));
				}
				last = g[length];
			}
	    }
	},
	rotateGeometry = function(g, count, tag_inc) {
	    if (count < 2) { return; }
	    var rot = MRZ(2 * PI / count);
	    transformByMatrix(g, 0, rot, _undefined, _undefined, count - 1, tag_inc);
	},
	scaleGeometry = function(g, scale) {
	    if (scale == 1) { return; }
	    transformByMatrix(g, 0, _undefined, _undefined, scale, 0, 0);
	},
	mirrorGeometry = function(g, tag_inc, inx, iny, inz) {
	    !inz || transformByMatrix(g, 0, M.Diagonal([1, 1, -1]), _undefined, 1, 1, tag_inc);
	    tag_inc += inz ? tag_inc : 0;
	    !iny || transformByMatrix(g, 0, M.Diagonal([1, -1, 1]), _undefined, 1, 1, tag_inc);
	    tag_inc += iny ? tag_inc : 0;
	    !inx || transformByMatrix(g, 0, M.Diagonal([-1, 1, 1]), _undefined, 1, 1, tag_inc);
	},
	def = function(t, v) { return t * 1 || v || 0; },
	createLineParser = function() {
	    return { color: black,
	        last: _undefined,
	        cl: function(t) {
				var c = t[1] || black, r1 = /#[0-9a-f]{3}/ , r2 = /#[0-9a-f]{6}/ ; 
				c = nv.colorNameToHex(c) || c[charAt](0)==='#'?c:'#'+c;
				if(r1.test(c) || r2.test(c) ){
					this[color] = c;
				}
			},
	        gw: function(t, geometry) {
	            geometry[push](wire[create](this[color], def(t[1], 1), def(t[2], 1), [def(t[9], 0.001)], [def(t[3]), def(t[4]), def(t[5])], [def(t[6]), def(t[7]), def(t[8])]));
	            this[last] = t;
	        },
	        gc: function(t, geometry) {
	            if (this[last] && this[last][0] == 'gw') { geometry[geometry[length] - 1].r.setRadius([def(t[4]), def(t[5])]); }
	            this[last] = _undefined;
	        },
	        ga: function(t, geometry) {
	            var tag = def(t[1], 1), count = def(t[2], 10), rada = def(t[3], 0.1),
					        start = def(t[4]) / 180 * math.PI, end = def(t[5], 180) / 180 * math.PI,
					        rad = def(t[6], 0.001), delta = (end - start) / count,
					        first = [rada*cos(start), 0, rada*sin(start)], second;

	            while (count) {
					count-=1;
	                start += delta;
	                second = [rada*cos(start), 0, rada*sin(start)];
	                geometry[push](wire[create](this[color], tag, 1,[rad], first, second));
	                first = second;
	            }
	        },
	        ge: function() { },
	        gh: function(t, geometry) {
	            var tag = def(t[1], 1), count = def(t[2], 10), spacing = def(t[3], 0.1), len = def(t[4]),
					        startx = def(t[5], 0.1), starty = def(t[6], 0.1), endx = def(t[7], 0.1), endy = def(t[8], 0.1),
					        rad = def(t[9], 0.001), turns = len / spacing || math.min(endy - starty, endx - startx) / spacing || 1,
					        delta = $V([math.PI * 2 * turns / count, (endx - startx) / count, (endy - starty) / count, len / count]),
					        start = $V([0, startx, starty, 0]),
					        first = [cos(start.e(1)) * start.e(2), sin(start.e(1)) * start.e(3), start.e(4)], second;

	            while (count) {
					count-=1;
	                start = start[add](delta);
	                second = [cos(start.e(1)) * start.e(2), sin(start.e(1)) * start.e(3), start.e(4)];
	                geometry[push](wire[create](this[color], tag, 1, [rad], first, second));
	                first = second;
	            }
	        },
	        gm: function(t, geometry) {
	            var tag_inc = def(t[1]), count = def(t[2]),
        				            a = def(t[3]) / 180 * math.PI, b = def(t[4]) / 180 * math.PI, c = def(t[5]) / 180 * math.PI,
        				            x = def(t[6]), y = def(t[7]) , z = def(t[8]),
        				            tag_cond = def(t[9]), rot = MRZ(c).x(M[Rotation+'Y'](b).x(M[Rotation+'X'](a))),
        				            trans = $V([x, y, z]);

	            transformByMatrix(geometry, tag_cond, rot, trans, 1, count, tag_inc);
	        },
	        gr: function(t, geometry) { rotateGeometry(geometry, def(t[1]), def(t[2])); },
	        gs: function(t, geometry) { scaleGeometry(geometry, def(t[3], 1)); },
	        gx: function(t, geometry) {
	            var x = t[2]+""|| "000";
	            mirrorGeometry(geometry, def(t[1]), x[charAt](0) == '1', x[charAt](1) == '1', x[charAt](2) == '1');
	        },
	        sp0: function(t, geometry) {
	            var b = def(t[6]), a = def(t[5]);
	            geometry[push](cpatch[create](this[color], def(t[8]), [def(t[3]), def(t[4]), def(t[5])], [cos(b) * cos(a), cos(b) * sin(a), sin(b)]));
	        },
	        spc: function(t, geometry) {
	            var self = this, p = self[last], shape = p[0]=="sp"?def(p[2]):def(t[2]), patch;
	            if (shape == 1)// rect
	            {
	                patch = qpatch[create](self[color], [def(p[3]), def(p[4]), def(p[5])], [def(p[6]), def(p[7]), def(p[8])], [def(t[3]), def(t[4]), def(t[5])]);
	                geometry[push](patch);
	                self[last][0] = t[0];
	                self[last][splice](3, 6, patch.v4.e(1), patch.v4.e(2), patch.v4.e(3), patch.v3.e(1), patch.v3.e(2), patch.v3.e(3));
	            }
	            if (shape == 3)// quad
	            {
	                patch = qpatch[create](self[color], [def(p[3]), def(p[4]), def(p[5])], [def(p[6]), def(p[7]), def(p[8])], [def(t[3]), def(t[4]), def(t[5])], [def(t[6]), def(t[7]), def(t[8])]);
	                geometry[push](patch);
	                self[last][0] = t[0];
	                self[last][splice](3, 6, patch.v4.e(1), patch.v4.e(2), patch.v4.e(3), patch.v3.e(1), patch.v3.e(2), patch.v3.e(3));
	            }
	            if (shape == 2)// tri
	            {
	                patch = tpatch[create](self[color], [def(p[3]), def(p[4]), def(p[5])], [def(p[6]), def(p[7]), def(p[8])], [def(t[3]), def(t[4]), def(t[5])]);
	                geometry[push](patch);
	                self[last] = _undefined;
	            }
	        },
	        sp: function(t, geometry) {
	            def(t[2]) ? this[last] = t : this.sp0(t, geometry);
	        },
	        sc: function(t, geometry) {
				var self = this;
	            if (!self[last] || !self[last][length]) { return; }
	            if (self[last][0] == 'sp' || self[last][0] == 'sc') {
	                self.spc(t, geometry);
	            } else if (self[last][0] == 'sm') {
	                self.smc(t, geometry);
	            }
	        },
	        sm: function(t) { this[last] = t; },
	        smc: function(t, geometry) {
	            var p = this[last],
                    nx = def(p[1], 1), ny = def(p[2], 1),
                    v1 = $V([def(p[3]), def(p[4]), def(p[5])]),
                    v2 = $V([def(p[6]), def(p[7]), def(p[8])]),
                    v3 = $V([def(t[3]), def(t[4]), def(t[5])]),
                    dx = v1[subtract](v2).x(1 / nx),
                    dy = v3[subtract](v2).x(1 / ny),
                    _1, _2, _3, i, j;

	            for (i = 0; i != nx; ++i) {
	                _2 = v2[add](dx.x(i));
	                _3 = _2[add](dy);
	                _1 = _2[add](dx);
	                for (j = 0; j != ny; ++j) {
	                    geometry[push](qpatch[create](this[color], _1, _2, _3));
	                    _2 = _3;
	                    _1 = _2[add](dx);
	                    _3 = _2[add](dy);
	                }
	            }
	        },
			ex: function (t, geometry)
			{
				var type = def(t[1]), _tag=def(t[2]), _segs=def(t[3]),i, len = geometry[length],pos;
				if([0,5,6].indexOf(type)===-1) {return;}
				for (i=0; i!=len; ++i)
				{
					if(tag in geometry[i] && (!_tag || geometry[i][tag] === _tag) )
					{
						if(_segs <= geometry[i][segments]){ break;}
						_segs-=geometry[i][segments];
					}
				}
				if(i==len){return;}
				pos = geometry[i];
				pos = pos.s[add](((pos.e)[subtract](pos.s)).x((_segs-(type!=5?0.5:1))/pos[segments]));
	            geometry[push](wire[create]("#f0f", -1, -1, [0], pos, pos));
			}
	    };

	},
	parseGeometry = function(data) {
	    var g = [], len = data[length], i, tokens, parser = createLineParser();
	    for (i = 0; i != len; ++i) {
	        tokens = data[i][split](',');
	        if (tokens[length] && tokens[0] in parser) {
	            parser[tokens[0]](tokens, g);
	        }
	    }
	    return g;
	},
	cleanupURL = function(s) {
	    var subs =
			[".html#", ".html?", /%26/g, "&", /%23/g, "", /%22/g, "",
			 /%27/g, "", /%5B;/g, "[", /%5D;/g, "]",
			  /&#38;/g, "&", /&#35;/g, "", /&#39;/g, "", /&#34;/g, "",
			   /&#91;/g, "[", /&#93;/g, "]", /"/g, "",
			    /'/g, "", /#/g, "", /"/g, "", /&quot;/g, "",
			     /&amp;/g, "&"],
			     l = subs[length], i;
	    for (i = 0; i != l; i += 2) {
	        s = s[replace](subs[i], subs[i + 1]);
	    }
	    return s;
	},
	loc = loca || cleanupURL(decodeURI(window.location.toString())),
	parts = loc[split](/[?#&]/),	i, s, 
	w = rwidth || nv.getClientWidth(), h = rheight || nv.getClientHeight(),
	configurations = [], geometry = [], name=_undefined;
        try {
            for (i = 1; i < parts[length]; ++i) {
                s = parts[i][indexOf]("message=");
                if (s != -1) {
                    doc[getElementById](geometry_id)[innerHTML] = parts[i][substr](s + 8);
                    return;
                }

                s = parts[i][indexOf]("name=");
                if (s != -1) {
                    name = parts[i][substr](s + 5);
                    continue;
                }

                s = parts[i][indexOf](geometry_id+'=');
                if (s != -1) {
                    geometry[push](parseGeometry(this.decompress(parts[i][substr](s + 9)[replace](/\[\[|\]\]/g, ""))[toLowerCase]()[split](/,(?=[a-z][a-z],|[a-z][a-z]$)/g))); //(gw|gc|ga|ge|gh|gm|gr|gs|gx|sp|sc|sm|ex|cl)
                    continue;
                }
                s = parts[i][indexOf]("conf=");
                if (s != -1) {
                    s = parts[i][substr](s + 5)[split](',');
                    if (s[length] == 1) {
                        configurations[push]([s[0], []]);
                    }
                    else {
                        configurations[push]([s[0], Number(s[1][substr](1))]);
                    }
                    continue;
                }
            }
        } catch (e) {
            doc[getElementById](geometry_id)[innerHTML] = e;
            return;
        }
		//geometry = JSON.stringify(geometry);
        //doc[getElementById](geometry_id)[innerHTML] = geometry;
		geometry = new nv.AntennaGeometry(geometry_id, max(w - 10, 0), max(h - 10, 0), geometry[0],configurations[length] ? configurations : 0, configurations[length] ? "Configuration": 0, _undefined, name);
		
    };

	return nv;
})(NecViewer || {});