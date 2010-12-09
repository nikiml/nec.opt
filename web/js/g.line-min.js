/*!
 * g.Raphael 0.4.2 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.grid=function(a,j,c,e,g,b){var f=[];rowHeight=e/b,columnWidth=c/g;for(var d=1;d<b;d++){f=f.concat(["M",Math.round(a)+0.5,Math.round(j+d*rowHeight)+0.5,"H",Math.round(a+c)+0.5])}for(d=1;d<g;d++){f=f.concat(["M",Math.round(a+d*columnWidth)+0.5,Math.round(j)+0.5,"V",Math.round(j+e)+0.5])}return this.path(f.join(","))};Raphael.fn.g.linechart=function(N,M,b,d,u,t,G){function F(x,ag){var i=x.length/ag,y=0,a=i,Y=0,X=[];while(y<x.length){a--;if(a<0){Y+=x[y]*(1+a);X.push(Y/i);Y=x[y++]*-a;a+=i}else{Y+=x[y++]}}return X}function R(j,i,al,aj,ag,Y){var y=(al-j)/2,x=(ag-al)/2,am=Math.atan((al-j)/Math.abs(aj-i)),ak=Math.atan((ag-al)/Math.abs(aj-Y));am=i<aj?Math.PI-am:am;ak=Y<aj?Math.PI-ak:ak;var X=Math.PI/2-((am+ak)%(Math.PI*2))/2,ao=y*Math.sin(X+am),ai=y*Math.cos(X+am),an=x*Math.sin(X+ak),ah=x*Math.cos(X+ak);return{x1:al-ao,y1:aj+ai,x2:al+an,y2:aj+ah}}G=G||{};if(!this.raphael.is(u[0],"array")){u=[u]}if(!this.raphael.is(t[0],"array")){t=[t]}var m=G.gutter||10,v=Math.max(u[0].length,t[0].length),p=G.symbol||"",S=G.colors||Raphael.fn.g.colors,L=this,r=null,l=null,ad=this.set(),T=[];for(var ac=0,I=t.length;ac<I;ac++){v=Math.max(v,t[ac].length)}var ae=this.set();for(ac=0,I=t.length;ac<I;ac++){if(G.shade){ae.push(this.path().attr({stroke:"none",fill:S[ac],opacity:G.nostroke?1:0.3}))}if(t[ac].length>b-2*m){t[ac]=F(t[ac],b-2*m);v=b-2*m}if(u[ac]&&u[ac].length>b-2*m){u[ac]=F(u[ac],b-2*m)}}var W=Array.prototype.concat.apply([],u),U=Array.prototype.concat.apply([],t),q=this.g.snapEnds(Math.min.apply(Math,W),Math.max.apply(Math,W),u[0].length-1),A=q.from,k=q.to,K=this.g.snapEnds(Math.min.apply(Math,U),Math.max.apply(Math,U),t[0].length-1),w=K.from,h=K.to;if(G.axisymin!=undefined){w=G.axisymin}if(G.axisymax!=undefined){h=G.axisymax}var Z=(b-m*2)/((k-A)||1),V=(d-m*2)/((h-w)||1);var C=this.set();var P=this.set();if(G.axis){var g=(G.axis+"").split(/[,\s]+/);+g[0]&&C.push(this.g.axis(N+m,M+m,b-2*m,A,k,G.axisxstep||Math.floor((b-2*m)/20),2));+g[1]&&C.push(this.g.axis(N+b-m,M+d-m,d-2*m,w,h,G.axisystep||Math.floor((d-2*m)/20),3));+g[2]&&C.push(this.g.axis(N+m,M+d-m,b-2*m,A,k,G.axisxstep||Math.floor((b-2*m)/20),0));+g[3]&&C.push(this.g.axis(N+m,M+d-m,d-2*m,w,h,G.axisystep||Math.floor((d-2*m)/20),1));if(G.grid){var n=(G.grid+"").split(/[,\s]+/);+n[0]&&(+g[0]||+g[2])&&P.push(this.g.grid(N+m,M+m,b-2*m,d-2*m,(G.axisxstep||Math.floor((b-2*m)/20))/n[0],0));+n[1]&&(+g[1]||+g[3])&&P.push(this.g.grid(N+m,M+m,b-2*m,d-2*m,0,(G.axisystep||Math.floor((d-2*m)/20))/n[1]))}}var J=this.set(),aa=this.set(),o;for(ac=0,I=t.length;ac<I;ac++){if(!G.nostroke){J.push(o=this.path().attr({stroke:S[ac],"stroke-width":G.width||2,"stroke-linejoin":"round","stroke-linecap":"round","stroke-dasharray":G.dash||""}))}var c=this.raphael.is(p,"array")?p[ac]:p,D=this.set();T=[];for(var ab=0,s=t[ac].length;ab<s;ab++){var f=N+m+((u[ac]||u[0])[ab]-A)*Z,e=M+d-m-(t[ac][ab]-w)*V;(Raphael.is(c,"array")?c[ab]:c)&&D.push(this.g[Raphael.fn.g.markers[this.raphael.is(c,"array")?c[ab]:c]](f,e,(G.width||2)*3).attr({fill:S[ac],stroke:"none"}));if(G.smooth){if(ab&&ab!=s-1){var Q=N+m+((u[ac]||u[0])[ab-1]-A)*Z,B=M+d-m-(t[ac][ab-1]-w)*V,O=N+m+((u[ac]||u[0])[ab+1]-A)*Z,z=M+d-m-(t[ac][ab+1]-w)*V;var af=R(Q,B,f,e,O,z);T=T.concat([af.x1,af.y1,f,e,af.x2,af.y2])}if(!ab){T=["M",f,e,"C",f,e]}}else{T=T.concat([ab?"L":"M",f,e])}}if(G.smooth){T=T.concat([f,e,f,e])}aa.push(D);if(G.shade){ae[ac].attr({path:T.concat(["L",f,M+d-m,"L",N+m+((u[ac]||u[0])[0]-A)*Z,M+d-m,"z"]).join(",")})}!G.nostroke&&o.attr({path:T.join(",")})}function H(am){var aj=[];for(var ak=0,ao=u.length;ak<ao;ak++){aj=aj.concat(u[ak])}aj.sort();var ap=[],ag=[];for(ak=0,ao=aj.length;ak<ao;ak++){aj[ak]!=aj[ak-1]&&ap.push(aj[ak])&&ag.push(N+m+(aj[ak]-A)*Z)}aj=ap;ao=aj.length;var Y=am||L.set();for(ak=0;ak<ao;ak++){var y=ag[ak]-(ag[ak]-(ag[ak-1]||N))/2,an=((ag[ak+1]||N+b)-ag[ak])/2+(ag[ak]-(ag[ak-1]||N))/2,a;am?(a={}):Y.push(a=L.rect(y-1,M,Math.max(an+1,1),d).attr({stroke:"none",fill:"#000",opacity:0}));a.values=[];a.symbols=L.set();a.y=[];a.x=ag[ak];a.axis=aj[ak];for(var ai=0,al=t.length;ai<al;ai++){ap=u[ai]||u[0];for(var ah=0,x=ap.length;ah<x;ah++){if(ap[ah]==aj[ak]){a.values.push(t[ai][ah]);a.y.push(M+d-m-(t[ai][ah]-w)*V);a.symbols.push(ad.symbols[ai][ah])}}}am&&am.call(a)}!am&&(r=Y)}function E(ak){var ag=ak||L.set(),a;for(var ai=0,am=t.length;ai<am;ai++){for(var ah=0,aj=t[ai].length;ah<aj;ah++){var y=N+m+((u[ai]||u[0])[ah]-A)*Z,al=N+m+((u[ai]||u[0])[ah?ah-1:1]-A)*Z,x=M+d-m-(t[ai][ah]-w)*V;ak?(a={}):ag.push(a=L.circle(y,x,Math.abs(al-y)/2).attr({stroke:"none",fill:"#000",opacity:0}));a.x=y;a.y=x;a.value=t[ai][ah];a.line=ad.lines[ai];a.shade=ad.shades[ai];a.symbol=ad.symbols[ai][ah];a.symbols=ad.symbols[ai];a.axis=(u[ai]||u[0])[ah];ak&&ak.call(a)}}!ak&&(l=ag)}ad.push(J,ae,aa,C,r,l);ad.lines=J;ad.shades=ae;ad.symbols=aa;ad.axis=C;ad.grid=P;ad.hoverColumn=function(i,a){!r&&H();r.mouseover(i).mouseout(a);return this};ad.clickColumn=function(a){!r&&H();r.click(a);return this};ad.hrefColumn=function(X){var Y=L.raphael.is(arguments[0],"array")?arguments[0]:arguments;if(!(arguments.length-1)&&typeof X=="object"){for(var a in X){for(var j=0,y=r.length;j<y;j++){if(r[j].axis==a){r[j].attr("href",X[a])}}}}!r&&H();for(j=0,y=Y.length;j<y;j++){r[j]&&r[j].attr("href",Y[j])}return this};ad.hover=function(i,a){!l&&E();ad.dots=l;l.mouseover(i).mouseout(a);return this};ad.click=function(a){!l&&E();ad.dots=l;l.click(a);return this};ad.each=function(a){E(a);return this};ad.eachColumn=function(a){H(a);return this};return ad};

