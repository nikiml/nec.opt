/* copyright 2013 Nikolay Mladenov 
// version 1.0
*/
var NecViewer = (function(nv) {
var cards = 		["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],
compressed_cards =  ["W", "f", "o", "i", "l", "K", "I", "J", "w", "A", "",  "H", "T", "R", "S", "X", "P", "p", "M", "E", "C"],
decompress_map = (function(){var res = {},i; for(i=0;i!=cards.length; ++i){res[compressed_cards[i]]=cards[i];} return res;})();

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
				t.splice(3,0,last[3], last[4], last[5]);
				return this.gw(t);
			},
			g2: function(t)
			{
				t[0]="gw";
				t.splice(6,0,last[3], last[4], last[5]);
				return this.gw(t);
			},
			g3: function (t)
			{
				t[0]="gw";
				t.splice(3,0,last[6], last[7], last[8]);
				return this.gw(t);
			},
			g4: function (t)
			{
				t[0]="gw";
				t.splice(6,0,last[6], last[7], last[8]);
				return this.gw(t);
			},
			g5: function(t)
			{
				t[0]="gw";
				t.splice(6,0,t[3], t[4]);
				t = this.gw(t);
				t[6]=t[3];
				t[7]=t[4];
				return t;
			},
			g6: function(t)
			{
				t[0]="gw";
				t.splice(7,0,t[4], t[5]);
				t = this.gw(t);
				t[7]=t[4];
				t[8]=t[5];
				return t;
			},
			g7: function(t)
			{
				t[0]="gw";
				t.splice(5,0,t[6], t[3]);
				t = this.gw(t);
				t[5]=t[8];
				t[6]=t[3];
				return t;
			},
			general: function(t){
				for (var i=1; i!=t.length; ++i)
				{
					if(t[i]=="")
					{
						t[i] = "0";
					}
				}
				return t;
			},
			gs: function(t){
				t.splice(1,0,"0","0");
				return t;
			},
	    };
	},
	parser = createLineParser(),res="";
	
	nec = nec.split(/,(?=[a-zA-Z],)/gi); ;
	nec.forEach(function(el){
		var spl = el.split(',');
		if(!spl)return;
		if( ! (spl[0]in decompress_map) )
			res+=el+",";
			
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
			res+=spl.join(",")+",";
	});
	
	return res;
};
return nv;
})(NecViewer || {});