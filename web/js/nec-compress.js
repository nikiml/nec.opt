/* copyright 2013 Nikolay Mladenov 
// version 1.0
*/
var NecViewer = (function(nv) {
var cards = 		["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],
compressed_cards =  ["W", "f", "o", "i", "l", "K", "I", "J", "w", "A", "",  "H", "T", "R", "S", "X", "P", "p", "M", "E", "C"],
compress_map = (function(){var res = {},i; for(i=0;i!=cards.length; ++i){res[cards[i]]=compressed_cards[i];} return res;})(),

nv.compress = function(nec) {
	var createLineParser = function() {
		var black="000", color=black, last=undefined, 
			updateLast = function(t){ var l = last; last = t.slice(); return l;},
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
				if(c == black){return [compress_map["cl"]] ;}
				return t;
			},
	        gw: function(t) {
				var l = updateLast(t),i;
				
				t[0] = compress_map[t[0]];
				if(!l){
					postUpdateTokens(t,l);
					return t;
				}
				if(t[9] == l[9]){ t = t.slice(0,9); }
				updateTokens(t,l,1,2);
				if(t[3]==l[3] && t[4]==l[4] && t[5]==l[5] )
				{
					t[0]=compress_map["g1"];
					updateTokens(t,l,6,3);
					postUpdateTokens(t,l,6,3,3);
					t.splice(3,3);
					return t;
				}
				if(t[3]==l[6] && t[4]==l[7] && t[5]==l[8] )
				{
					t[0]=compress_map["g3"];
					updateTokens(t,l,6,3);
					postUpdateTokens(t,l,6,3,3);
					t.splice(3,3);
					return t;
				}
				if(t[6]==l[3] && t[7]==l[4] && t[8]==l[5] )
				{
					t[0]=compress_map["g2"];
					updateTokens(t,l,3,3);
					t.splice(6,3);
					return t;
				}
				if(t[6]==l[6] && t[7]==l[7] && t[8]==l[8] )
				{
					t[0]=compress_map["g4"];
					updateTokens(t,l,3,3);
					t.splice(6,3);
					return t;
				}
				if(t[6]==t[3] && t[7]==t[4])
				{
					t[0]=compress_map["g5"];
					updateTokens(t,l,3,3);
					updateTokens(t,l,8,1);
					t.splice(6,2);
					return t;
				}
				if(t[7]==t[4] && t[8]==t[5])
				{
					t[0]=compress_map["g6"];
					updateTokens(t,l,3,4);
					t.splice(7,2);
					return t;
				}
				if(t[6]==t[3] && t[8]==t[5])
				{
					t[0]=compress_map["g7"];
					updateTokens(t,l,3,2);
					updateTokens(t,l,7,2);
					t.splice(5,2);
					return t;
				}
				updateTokens(t,l,3,6);
				postUpdateTokens(t,l,6,3,3);
				return t;
	        },
			general: function(t){
				for (var i=1; i!=t.length; ++i)
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
				t.splice(1,2);
				t[0] = compress_map[t[0]];
				return t;
			},
			ex: function(t)
			{
				t[0] = compress_map[t[0]];
				return t.slice(0,4);
			},
			ge: function(){ return []; }
				
	    };
	},
	parser = createLineParser(),res="";
	
	nec = nec.replace(/(,-)0[.]/g,"$1.").split(/,(?=[a-z][a-z],)/gi); 
	nec.forEach(function(el){
		el = el.toLowerCase();
		if(!el)return;
		el = el.split(',');
		if(! (el[0] in parser))
		{
			el = parser.general(el);
		}
		else
		{	
			el = parser[el[0]](el);
		}
		if(!el)return;
		res+=  el.join(',')+',';
	});
	
	return res;
};
return nv;
})(NecViewer || {});