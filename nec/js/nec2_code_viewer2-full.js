var NecViewer = (function(nv){
    var innerHTML = "innerHTML", 
		getElementsByTagName = "getElementsByTagName", d = document, 
		pre_tag = "pre", pres = d[getElementsByTagName](pre_tag), 
		createElement = "createElement", 
		style = "style", cssText = "cssText", 
		appendChild = "appendChild", div_tag="div",tarea_tag="textarea",
		parentNode = "parentNode", firstChild = "firstChild", none = "none", block = "block", display = "display",
		length = "length", call = "call", apply = "apply", push = "push", M = Math, toLowerCase = "toLowerCase", match = "match", substr = "substr", 
		split = "split", replace = "replace", search = "search", 
		previousSibling = "previousSibling", value = "value", insertBefore = "insertBefore", src = "src", 
		testPreElement = "testPreElement", modifyDoc = "modifyDoc", extractNecGeometry = "extractNecGeometry", hunderd_pcent="100%", hundred_thousant=100000,
		compress = "compress", slice = "slice", splice = "splice",
		i, undef = undefined,
	cards = 		["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],
	compressed_cards =  ["W", "f", "o", "i", "l", "K", "I", "J", "w", "A ", "", "H", "T", "R", "S", "X", "P", "p", "M", "E", "C"],
	compress_map = (function(){var res = {},i; for(i=0;i!=cards[length]; ++i){res[cards[i]]=compressed_cards[i];} return res;})();

	nv[compress] = nv[compress] || function(nec) {
		var createLineParser = function() {
			var black="000", color=black, last=undef, 
				updateLast = function(t){ var l = last; last = t[slice](); return l;},
				updateTokens = function(t, l, start, count)
				{ 
					count+=start;
					for(var i=start; i!=count; ++i){ if( t[i]==l[i]) { t[i]="";} }
				},
				postUpdateTokens = function(t, l)
				{ 
					for(var i=6; i!=9; ++i)
					{
						if( t[i]!=="" && (t[i-3] !== "" && t[i] == t[i-3] || t[i-3] === "" && t[i] == l[i-3]) ) { t[i]="+";} 
						if( t[i]!=="" && (t[i-3] !== "" && t[i] == -t[i-3] || t[i-3] === "" && t[i] == -l[i-3]) ) { t[i]="-";} 
					}
				};

			return { 
				cl: function(t) {
					var c = t[1] || black; 
					if(c == color) {return []; }
					color = c;
					t[0] = compress_map[t[0]];
					if(c == black){return [t[0]] ;}
					return t;
				},
				gw: function(t) {
					var l = updateLast(t);
					
					t[0] = compress_map[t[0]];
					if(!l){
						postUpdateTokens(t,l);
						return t;
					}
					if(t[9] == l[9]){ t = t[slice](0,9); }
					updateTokens(t,l,1,2);
					if(t[3]==l[3] && t[4]==l[4] && t[5]==l[5] )
					{
						t[0]=compress_map["g1"];
						updateTokens(t,l,6,3);
						postUpdateTokens(t,l,6,3,3);
						t[splice](3,3);
						return t;
					}
					if(t[3]==l[6] && t[4]==l[7] && t[5]==l[8] )
					{
						t[0]=compress_map["g3"];
						updateTokens(t,l,6,3);
						postUpdateTokens(t,l,6,3,3);
						t[splice](3,3);
						return t;
					}
					if(t[6]==l[3] && t[7]==l[4] && t[8]==l[5] )
					{
						t[0]=compress_map["g2"];
						updateTokens(t,l,3,3);
						t[splice](6,3);
						return t;
					}
					if(t[6]==l[6] && t[7]==l[7] && t[8]==l[8] )
					{
						t[0]=compress_map["g4"];
						updateTokens(t,l,3,3);
						t[splice](6,3);
						return t;
					}
					if(t[6]==t[3] && t[7]==t[4])
					{
						t[0]=compress_map["g5"];
						updateTokens(t,l,3,3);
						updateTokens(t,l,8,1);
						t[splice](6,2);
						return t;
					}
					if(t[7]==t[4] && t[8]==t[5])
					{
						t[0]=compress_map["g6"];
						updateTokens(t,l,3,4);
						t[splice](7,2);
						return t;
					}
					if(t[6]==t[3] && t[8]==t[5])
					{
						t[0]=compress_map["g7"];
						updateTokens(t,l,3,2);
						updateTokens(t,l,7,2);
						t[splice](5,2);
						return t;
					}
					updateTokens(t,l,3,6);
					postUpdateTokens(t,l,6,3,3);
					return t;
				},
				general: function(t){
					for (var i=1; i!=t[length]; ++i)
					{
						if(t[i]=="0")
						{
							t[i] = "";
						}
					}
					t[0] = compress_map[t[0]];
					return t;
				},
				gs: function(t){
					t[splice](1,2);
					t[0] = compress_map[t[0]];
					return t;
				},
				ex: function(t)
				{
					t[0] = compress_map[t[0]];
					return t[slice](0,4);
				},
				ge: function(){ return []; }
					
			};
		},
		parser = createLineParser(),res="";
		
		nec = nec[replace](/(,-)0[.]/g,"$1.")[split](/,(?=[a-z][a-z],|[a-z][a-z]$)/gi); 
		nec.forEach(function(el){
			el = el[toLowerCase]();
			if(!el){return;}
			el = el[split](',');
			if(! (el[0] in parser))
			{
				el = parser.general(el);
			}
			else
			{	
				el = parser[el[0]](el);
			}
			if(!el[length]){return;}
			res+=  el.join(',')+',';
		});
		
		return res;
	};		
	nv[testPreElement] = nv[testPreElement] || function(pre) {
	    return pre[innerHTML].match (/^[\s\r\n]*(CM|CE|GW|SY)\s[\s\S]*\n(GE)/i); // (/^CM\s[\s\S]*\nGE|^CE\s[\s\S]*\nGE|^GW\s[\s\S]*\nGE|^SY\s[\s\S]*\nGE/)
	};

	nv[extractNecGeometry] = nv[extractNecGeometry] || function(nec, title) {
	    var toRad = function(a) { return a * M.PI / 180; }, toDeg = function(a) { return a * 180 / M.PI; }, 
			base_link = "http://mladenov.ca/~nickm/viewer/g2.html#", 
			res = "", msg = base_link + "message=", failed = msg+"failed_to_", 
			round = M.round, mm_unit_scale = hundred_thousant, 
			roundToken = function(token){ return round(token*mm_unit_scale)/mm_unit_scale; }, 
			updateMMUnitScale = function(model_scale){
				var s = hundred_thousant*model_scale; 
				s = round( M.log(s)/M.log(10) ); 
				mm_unit_scale = M.pow(10,s); 
				while(round(model_scale*mm_unit_scale)!=model_scale*mm_unit_scale)
				{
					mm_unit_scale*=10;
				}
			}, 
			compose = function(f, g) { return (function(a) { return f(g(a)); }); }, 
			makeUnitRegExp = function(s){
				return new RegExp("([^\\w\\.]|^)(((0?|[1-9][0-9]*)\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?)"+s+"\\b");
			},
			parser = { 
				sin: compose(M.sin, toRad), 
				cos: compose(M.cos, toRad), 
				tan: compose(M.tan, toRad), 
				atn: compose(toDeg, M.atan), 
				atan2: function(a, b) { return toDeg(M.atan2(a, b)); }, 
				min: M.min, max: M.max, "int": round, abs: M.abs, sqr: M.sqrt, sqrt: M.sqrt, log: M.log, exp: M.exp, pow: M.pow, 
				log10: function(a) { return M.log(a) / M.log(10); }, 
				sgn: function(a) { return a < 0 ? -1 : 1 ;}, 
				mod: function(a, b) { return a % b; }, 
				pi: M.PI,
				cm:0.01,
				mm:0.001,
				m:1,
				"in":0.0254,
				ft:0.0254*12,
				pf:1e-12,
				nf:1e-9,
				uf:1e-6,
				nh:1e-12,
				uh:1e-9
				}, 
			m, i, card, comment, 
			regspaceg = /\s+/g, 
			global_object = Function('return this')(), 
			for_ = function(arr, callback){ for(var i=0; i!=arr[length];++i){if(i in arr){ for_.i = i; callback(arr[i],i);}}}, 
			for_r = function(arr,start, count, callback){ for(var i=start; i!=arr[length]&& count;++i){--count; if(i in arr){for_r.i = i; callback(arr[i],i);}}}, 
			unit_exps = (function(){
				var res=[];
				for_(["cm", "mm", "m", "in", "ft", "pf", "nf", "uf", "nf", "uf"], function(s)
				{
					res[push](makeUnitRegExp(s));
				});
				return res;
			})(), 
			unit_vals = ["$1$2*.01", "$1$2*1e-3", "$1$2", "$1$2*.0254", "$1$2*.0254*12", "$1$2*1e-12", "$1$2*1e-9", "$1$2*1e-6", "$1$2*1e-9", "$1$2*1e-6"], 
			replaceUnits = function(line) {
				for (var i = 0; i != unit_exps[length]; ++i){
					line = line[replace](unit_exps[i], unit_vals[i], "g");
				}
				return line;
			}, 
			throwEx = function(msg) {
				throw msg;
			}, 
			checkPowerToken = function(token){
				if(token.indexOf('^')!==-1){
					throwEx("exponent_operator^_not supported");
				}
				return token;
			}, 
			F = Function, 
			getVarName = function(jsep_ast, ident)
			{
				if(jsep_ast.type!=="Identifier"){throwEx("invalid identifier: "+ident); }
				return jsep_ast.name;
			},
			evalJSepTree = function(jsep_ast, parser, expr)
			{
				var a, b, 
					t = function(){
						throwEx("invalid expression: "+expr); 
					};
				if(jsep_ast.type==="Identifier")
				{
					if ( ! (jsep_ast.name in parser) ){ t(); }
					return parser[jsep_ast.name];
				}
				if(jsep_ast.type === "Literal")
				{
					return jsep_ast.value;
				}
				if(jsep_ast.type === "CallExpression")
				{
					a = jsep_ast.arguments.map(function(arg){return evalJSepTree(arg, parser, expr);});
					return evalJSepTree(jsep_ast.callee, parser, expr)[apply](0, a);
				}
				if(jsep_ast.type === "UnaryExpression")
				{
					a = evalJSepTree(jsep_ast.argument, parser, expr);
					if(jsep_ast.operator ==='-' ) {
						return -a;
					}
					if( jsep_ast.operator==='+') {
						return a;
					}
					t();
				}
				if(jsep_ast.type === "BinaryExpression")
				{
					a = evalJSepTree(jsep_ast.left, parser, expr);
					b = evalJSepTree(jsep_ast.right, parser, expr);
					if(jsep_ast.operator ==='-' ) {
						return a - b;
					}
					if(jsep_ast.operator ==='+' ) {
						return a + b;
					}
					if(jsep_ast.operator ==='*' ) {
						return a * b;
					}
					if(jsep_ast.operator ==='/' ) {
						return a / b;
					}
					if(jsep_ast.operator ==='^' || jsep_ast.operator ==='**' ) {
						return M.pow(a, b);
					}
					t();
				}
				t();
				return undef;
			},
			assignToken = function(token) {
				if( jsep )
				{
					jsep.addBinaryOp("^",11);
					jsep.addBinaryOp("**",11);
					var s = token[split](/=/g),ls,rs;
					if(s.length!=2) {throwEx("invalid SY "+token); }
					ls = getVarName(jsep(s[0]), s[0]);
					if( (ls in parser) && parser[ls]!=undef) 
					{
						throwEx("Duplicate variable definition: SY "+ls); 
					}
					rs = evalJSepTree(jsep(s[1]), parser, s[1]);
					parser[ls]=rs;
					return rs;
				}
				return (new F("with(this){ this." + checkPowerToken(token) + ";}"))[call](parser);
			}, 
			evalToken = function(token) {
				if( jsep )
				{
					jsep.addBinaryOp("^",11);
					jsep.addBinaryOp("**",11);
					return evalJSepTree(jsep(token), parser, token);
				}
				return (new F("with(this){ return " + checkPowerToken(token) + ";}"))[call](parser);
			}, 
			evalToken2 = compose(evalToken, replaceUnits), 
			evalTokenI = compose(round, evalToken2), 
			parseSYCard = function(line) {
				var regexp = /,\s*\w+\s*=/, pos, sub;
				if (line.search(/\s*\w+\s*=/) !== 0){
					return;
				}
				while (line) {
					pos = line[search](regexp);
					sub = (pos === -1 ? line : line[substr](0, pos));
					line = (pos === -1 ? "" : line[substr](pos + 1));
					if (sub[match](/=/g)[length] === 1){
						assignToken(replaceUnits(sub));
						sub = sub[split](/=/g)[0][replace](/\s*/, "","g");
						if(sub in parser)
						{
							unit_exps[push](makeUnitRegExp(sub));
							unit_vals[push]("$1$2*"+parser[sub]);
						}
					}
				}
			}, 
			geometry_cards = {gw:[2,7,1], gc:[2,3,0], ga:[2,4,1], ge:[0,0,0], gh:[2,7,1], gm:[2,7,0], gr:[2,0,0],gs:[2,1,0],gx:[2,0,0,function(t,i){return i==2?t:evalTokenI(t); }],
				sp:[2,6,1], sc:[2,6,0], sm:[2,6,1], ex:[4,6,0]}, 
			processGeometryCard = function(card_data, card, comment){
				var res = "";
				if(card_data){
					if(card_data[2]) //process comment as color
					{
						comment = comment[replace](/^\s+|\s+$|#/g, "")[split](regspaceg);
						res+=comment[length] !== 1 || comment[0]==="" ?"":",cl,"+comment[0];
					}
					var 
						pi = card_data[3] || evalTokenI,
						pf =  card_data[4] || compose(roundToken,evalToken2);
					card = card[split](regspaceg);
					res+=","+card[0];
					for_r(card,1,card_data[0], function(v,i){res+=","+pi(v,i);});
					for_r(card,1+card_data[0],card_data[1], function(v,i){res+=","+pf(v,i);});
				}
				return res;
			};
	    parser.atan = parser.atn;
		for_([8.2525, 7.3482, 6.5430, 5.8268, 5.1892,4.6203,4.1148,3.6652, 3.2639, 2.9058, 2.5883,2.3038,2.0523, 1.8288,1.6281, 1.4503, 1.2903, 1.1506, 1.0236, 0.9119, 0.8128],
			function(v,k){parser["$"+k]=v* 5e-4;}); // div 2 to meters
	    for (i in global_object) { //shadow globals for security
	        if (!(i in parser) && i===i[toLowerCase]()) {
	            parser[i] = undef;
	        }
	    }
		nec = nec.replace(/\r/g,"");
	    m = nec[match](/^(SY|sy)\s[^\'\n]*/mg);
	    if (m) {
            try {
				for_(m, function(v) { parseSYCard(v[substr](3)[replace]("#", "$$", "g")[toLowerCase]());});
            } catch (e) {
                return failed + "parse_SY_card_" + m[for_.i] +"("+e+")" ;
            }
	    }

	    m = nec[match](/^(GS|gs)\s[^\'\n]*/mg);
	    if (m) {
            try {
				for_(m, function(v) { 
					updateMMUnitScale(evalToken2(v[split](regspaceg)[3][toLowerCase]()));
				});
            } catch (e) {
                return failed + "parse_GS_card_" + m[for_.i] +"("+e+")";
            }
	    }

		
	    m = nec[split]("\n");
	    for (i = 0; i != m[length]; ++i)
	    {
			try {
				card = m[i][split]("\'");
				if (card[length]){
					comment = card[length] > 1 ? card[1] : "";
					m[i] = card[0][toLowerCase]()[replace](/^\s+/,"")[replace](/\s+$/,"");
					card = m[i][substr](0, 2);
					res+=processGeometryCard(geometry_cards[card], m[i], comment);
				}
			} catch (e) {
				return encodeURI(msg + e);
			}
		}
		if(title!==undefined){
			base_link +="name="+title+"&";
		}
	    return base_link + "geometry=" + this[compress](res);
	};
	nv.showNec = function(link, mode) {
	    var pre = link[parentNode][parentNode][getElementsByTagName](pre_tag)[0], 
			tarea = pre[previousSibling], model = tarea[previousSibling];
			
	    pre[style][display] = mode===0 ? block : none; 
		model[style][display] = mode===1 ? block : none;
		tarea[style][display] = mode===2 ? block : none;
	    if (mode===1 && (!model[firstChild][src] || model.code != tarea[value] ) ) {
	        model[firstChild][src] = this[extractNecGeometry](model.code = tarea[value]);
	    }
	    return false;
	};
	nv[modifyDoc] = nv[modifyDoc] || function(pre) {
	    var p = pre[parentNode], lbl = p[getElementsByTagName](div_tag)[0], div = d[createElement](div_tag), textarea = d[createElement](tarea_tag), obj,
			pref = "<a href=\"javascript:void(0);\" onclick=\"return NecViewer.showNec(this,", suf = "</a>";
			
	    lbl[innerHTML] = pref + "0);\">" + lbl[innerHTML] + suf + "|" + pref + "1);\">Model:" + suf +"|" + pref + "2);\">Edit:" + suf;
	    div[style][cssText] = pre[style][cssText];
	    div[style].display = none;
	    textarea[style][cssText] = pre[style][cssText]+"; font-family:monospace";
	    textarea[style][display] = none;
	    textarea[value] = pre[innerHTML];
	    p[insertBefore](div, pre);
	    p[insertBefore](textarea, pre);
	    obj = d[createElement]("iframe");
	    obj[style].height = hunderd_pcent; obj[style].width = hunderd_pcent;
	    div[appendChild](obj);
	    //if (!script_added) {
	        //div = d[createElement]("script");
	        ////div.setAttribute("type","application/javascript");
	        //div["text"] = "var NecViewer = " + nv+ ";";
	        //d.body[appendChild](div);
	    //    script_added = 1;
	    //}
	};

    if ( !nv.embeded) 
    {
		for( i=0;i!=pres[length];++i) 
		{
			nv[testPreElement](pres[i])&& nv[modifyDoc](pres[i]);
		}
	}
	return nv;
})(NecViewer || {});