/*!
 * g.Raphael 0.4.2 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.grid=function(t,a,h,r,s,e){for(var i=[],n=r/e,o=h/s,l=1;e>l;l++)i=i.concat(["M",Math.round(t)+.5,Math.round(a+l*n)+.5,"H",Math.round(t+h)+.5])
for(l=1;s>l;l++)i=i.concat(["M",Math.round(t+l*o)+.5,Math.round(a)+.5,"V",Math.round(a+r)+.5])
return this.path(i.join(","))},Raphael.fn.g.linechart=function(t,a,h,r,s,e,i){function n(t,a){for(var h=t.length/a,r=0,s=h,e=0,i=[];r<t.length;)s--,0>s?(e+=t[r]*(1+s),i.push(e/h),e=t[r++]*-s,s+=h):e+=t[r++]
return i}function o(t,a,h,r,s,e){var i=(h-t)/2,n=(s-h)/2,o=Math.atan((h-t)/Math.abs(r-a)),l=Math.atan((s-h)/Math.abs(r-e))
o=r>a?Math.PI-o:o,l=r>e?Math.PI-l:l
var u=Math.PI/2-(o+l)%(2*Math.PI)/2,f=i*Math.sin(u+o),p=i*Math.cos(u+o),c=n*Math.sin(u+l),g=n*Math.cos(u+l)
return{x1:h-f,y1:r+p,x2:h+c,y2:r+g}}function l(i){for(var n=[],o=0,l=s.length;l>o;o++)n=n.concat(s[o])
n.sort()
var u=[],p=[]
for(o=0,l=n.length;l>o;o++)n[o]!=n[o-1]&&u.push(n[o])&&p.push(t+f+(n[o]-z)*L)
n=u,l=n.length
var c=i||M.set()
for(o=0;l>o;o++){var g,d=p[o]-(p[o]-(p[o-1]||t))/2,y=((p[o+1]||t+h)-p[o])/2+(p[o]-(p[o-1]||t))/2
i?g={}:c.push(g=M.rect(d-1,a,Math.max(y+1,1),r).attr({stroke:"none",fill:"#000",opacity:0})),g.values=[],g.symbols=M.set(),g.y=[],g.x=p[o],g.axis=n[o]
for(var m=0,b=e.length;b>m;m++){u=s[m]||s[0]
for(var R=0,w=u.length;w>R;R++)u[R]==n[o]&&(g.values.push(e[m][R]),g.y.push(a+r-f-(e[m][R]-I)*A),g.symbols.push(v.symbols[m][R]))}i&&i.call(g)}!i&&(x=c)}function u(h){for(var i,n=h||M.set(),o=0,l=e.length;l>o;o++)for(var u=0,p=e[o].length;p>u;u++)if(!(e[o][u]-I<=0)){var c=t+f+((s[o]||s[0])[u]-z)*L,g=t+f+((s[o]||s[0])[u?u-1:1]-z)*L,x=a+r-f-(e[o][u]-I)*A
h?i={}:n.push(i=M.circle(c,x,Math.abs(g-c)/2).attr({stroke:"none",fill:"#000",opacity:0})),i.x=c,i.y=x,i.value=e[o][u],i.line=v.lines[o],i.shade=v.shades[o],i.symbol=v.symbols[o][u],i.symbols=v.symbols[o],i.axis=(s[o]||s[0])[u],h&&h.call(i)}!h&&(d=n)}i=i||{},this.raphael.is(s[0],"array")||(s=[s]),this.raphael.is(e[0],"array")||(e=[e])
for(var f=i.gutter||10,p=Math.max(s[0].length,e[0].length),c=i.symbol||"",g=i.colors||Raphael.fn.g.colors,M=this,x=null,d=null,v=this.set(),y=[],m=0,b=e.length;b>m;m++)p=Math.max(p,e[m].length)
var R=this.set()
for(m=0,b=e.length;b>m;m++)i.shade&&R.push(this.path().attr({stroke:"none",fill:g[m],opacity:i.nostroke?1:.3})),e[m].length>h-2*f&&(e[m]=n(e[m],h-2*f),p=h-2*f),s[m]&&s[m].length>h-2*f&&(s[m]=n(s[m],h-2*f))
var w=Array.prototype.concat.apply([],s),k=Array.prototype.concat.apply([],e),z=Math.min.apply(Math,w),B=Math.max.apply(Math,w),j=this.g.snapEnds(Math.min.apply(Math,k),Math.max.apply(Math,k),e[0].length-1),I=j.from,P=j.to
void 0!=i.axisymin&&(I=i.axisymin),void 0!=i.axisymax&&(P=i.axisymax)
var L=(h-2*f)/(B-z||1),A=(r-2*f)/(P-I||1),q=this.set(),F=this.set()
if(i.axis){var C=(i.axis+"").split(/[,\s]+/)
if(+C[0]&&q.push(this.g.axis(t+f,a+f,h-2*f,z,B,i.axisxstep||Math.floor((h-2*f)/20),2)),+C[1]&&q.push(this.g.axis(t+h-f,a+r-f,r-2*f,I,P,i.axisystep||Math.floor((r-2*f)/20),3)),+C[2]&&q.push(this.g.axis(t+f,a+r-f,h-2*f,z,B,i.axisxstep||Math.floor((h-2*f)/20),0)),+C[3]&&q.push(this.g.axis(t+f,a+r-f,r-2*f,I,P,i.axisystep||Math.floor((r-2*f)/20),1)),i.grid){var H=(i.grid+"").split(/[,\s]+/);+H[0]&&(+C[0]||+C[2])&&F.push(this.g.grid(t+f,a+f,h-2*f,r-2*f,(i.axisxstep||Math.floor((h-2*f)/20))/H[0],0)),+H[1]&&(+C[1]||+C[3])&&F.push(this.g.grid(t+f,a+f,h-2*f,r-2*f,0,(i.axisystep||Math.floor((r-2*f)/20))/H[1]))}}var G,E=this.set(),$=this.set()
for(m=0,b=e.length;b>m;m++){i.nostroke||E.push(G=this.path().attr({stroke:g[m],"stroke-width":i.width||2,"stroke-linejoin":"round","stroke-linecap":"round","stroke-dasharray":i.dash||""}))
var V=this.raphael.is(c,"array")?c[m]:c,Q=this.set(),W=0
y=[]
for(var D=0,J=e[m].length;J>D;D++)if(e[m][D]<I)W=1
else{var K=t+f+((s[m]||s[0])[D]-z)*L,N=a+r-f-(e[m][D]-I)*A
if((Raphael.is(V,"array")?V[D]:V)&&Q.push(this.g[Raphael.fn.g.markers[this.raphael.is(V,"array")?V[D]:V]](K,N,3*(i.width||2)).attr({fill:g[m],stroke:"none"})),i.smooth){if(D&&D!=J-1&&!W){var O=t+f+((s[m]||s[0])[D-1]-z)*L,S=a+r-f-(e[m][D-1]-I)*A,T=t+f+((s[m]||s[0])[D+1]-z)*L,U=a+r-f-(e[m][D+1]-I)*A,X=o(O,S,K,N,T,U)
y=y.concat([X.x1,X.y1,K,N,X.x2,X.y2])}(!D||W)&&(y=["M",K,N,"C",K,N])}else y=y.concat([D&&!W?"L":"M",K,N])
W=0}i.smooth&&(y=y.concat([K,N,K,N])),$.push(Q),i.shade&&R[m].attr({path:y.concat(["L",K,a+r-f,"L",t+f+((s[m]||s[0])[0]-z)*L,a+r-f,"z"]).join(",")}),!i.nostroke&&G.attr({path:y.join(",")})}return v.push(E,R,$,q,x,d),v.lines=E,v.shades=R,v.symbols=$,v.axis=q,v.grid=F,v.hoverColumn=function(t,a){return!x&&l(),x.mouseover(t).mouseout(a),this},v.clickColumn=function(t){return!x&&l(),x.click(t),this},v.hrefColumn=function(t){var a=M.raphael.is(arguments[0],"array")?arguments[0]:arguments
if(!(arguments.length-1)&&"object"==typeof t)for(var h in t)for(var r=0,s=x.length;s>r;r++)x[r].axis==h&&x[r].attr("href",t[h])
for(!x&&l(),r=0,s=a.length;s>r;r++)x[r]&&x[r].attr("href",a[r])
return this},v.hover=function(t,a){return!d&&u(),v.dots=d,d.mouseover(t).mouseout(a),this},v.click=function(t){return!d&&u(),v.dots=d,d.click(t),this},v.each=function(t){return u(t),this},v.eachColumn=function(t){return l(t),this},v}