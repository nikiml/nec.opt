/*
 * g.Raphael 0.4.1 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
!function(){var t=Math.max,a=Math.min
Raphael.fn.g=Raphael.fn.g||{},Raphael.fn.g.markers={disc:"disc",o:"disc",flower:"flower",f:"flower",diamond:"diamond",d:"diamond",square:"square",s:"square",triangle:"triangle",t:"triangle",star:"star","*":"star",cross:"cross",x:"cross",plus:"plus","+":"plus",arrow:"arrow","->":"arrow"},Raphael.fn.g.shim={stroke:"none",fill:"#000","fill-opacity":0},Raphael.fn.g.txtattr={font:"12px Arial, sans-serif"},Raphael.fn.g.colors=[]
for(var h=[.6,.2,.05,.1333,.75,0],e=0;10>e;e++)e<h.length?Raphael.fn.g.colors.push("hsb("+h[e]+", .75, .75)"):Raphael.fn.g.colors.push("hsb("+h[e-h.length]+", 1, .5)")
Raphael.fn.g.text=function(t,a,h){return this.text(t,a,h).attr(this.g.txtattr)},Raphael.fn.g.labelise=function(t,a,h){return t?(t+"").replace(/(##+(?:\.#+)?)|(%%+(?:\.%+)?)/g,function(t,r,e){return r?(+a).toFixed(r.replace(/^#+\.?/g,"").length):e?(100*a/h).toFixed(e.replace(/^%+\.?/g,"").length)+"%":void 0}):(+a).toFixed(0)},Raphael.fn.g.finger=function(h,r,e,i,s,n,o){if(s&&!i||!s&&!e)return o?"":this.path()
n={square:"square",sharp:"sharp",soft:"soft"}[n]||"round"
var l
switch(i=Math.round(i),e=Math.round(e),h=Math.round(h),r=Math.round(r),n){case"round":if(s)f=~~(e/2),f>i?(f=i,l=["M",h-~~(e/2),r,"l",0,0,"a",~~(e/2),f,0,0,1,e,0,"l",0,0,"z"]):l=["M",h-f,r,"l",0,f-i,"a",f,f,0,1,1,e,0,"l",0,i-f,"z"]
else{var f=~~(i/2)
f>e?(f=e,l=["M",h+.5,r+.5-~~(i/2),"l",0,0,"a",f,~~(i/2),0,0,1,0,i,"l",0,0,"z"]):l=["M",h+.5,r+.5-f,"l",e-f,0,"a",f,f,0,1,1,0,i,"l",f-e,0,"z"]}break
case"sharp":if(s)u=~~(e/2),l=["M",h+u,r,"l",-e,0,0,-t(i-u,0),u,-a(u,i),u,a(u,i),u,"z"]
else{var u=~~(i/2)
l=["M",h,r+u,"l",0,-i,t(e-u,0),0,a(u,e),u,-a(u,e),u+(i>2*u),"z"]}break
case"square":l=s?["M",h+~~(e/2),r,"l",1-e,0,0,-i,e-1,0,"z"]:["M",h,r+~~(i/2),"l",0,-i,e,0,0,i,"z"]
break
case"soft":s?(f=a(Math.round(e/5),i),l=["M",h-~~(e/2),r,"l",0,f-i,"a",f,f,0,0,1,f,-f,"l",e-2*f,0,"a",f,f,0,0,1,f,f,"l",0,i-f,"z"]):(f=a(e,Math.round(i/5)),l=["M",h+.5,r+.5-~~(i/2),"l",e-f,0,"a",f,f,0,0,1,f,f,"l",0,i-2*f,"a",f,f,0,0,1,-f,f,"l",f-e,0,"z"])}return o?l.join(","):this.path(l)},Raphael.fn.g.disc=function(t,a,h){return this.circle(t,a,h)},Raphael.fn.g.line=function(t,a,h){return this.rect(t-h,a-h/5,2*h,2*h/5)},Raphael.fn.g.square=function(t,a,h){return h=.7*h,this.rect(t-h,a-h,2*h,2*h)},Raphael.fn.g.triangle=function(t,a,h){return h*=1.75,this.path("M".concat(t,",",a,"m0-",.58*h,"l",.5*h,",",.87*h,"-",h,",0z"))},Raphael.fn.g.diamond=function(t,a,h){return this.path(["M",t,a-h,"l",h,h,-h,h,-h,-h,h,-h,"z"])},Raphael.fn.g.flower=function(t,a,h,r){h=1.25*h
var e=h,i=.5*e
r=3>+r||!r?5:r
for(var s,n=["M",t,a+i,"Q"],o=1;2*r+1>o;o++)s=o%2?e:i,n=n.concat([+(t+s*Math.sin(o*Math.PI/r)).toFixed(3),+(a+s*Math.cos(o*Math.PI/r)).toFixed(3)])
return n.push("z"),this.path(n.join(","))},Raphael.fn.g.star=function(t,a,h,r,e){r=r||.382*h,e=e||5
for(var i,s=["M",t,a+r,"L"],n=1;2*e>n;n++)i=n%2?h:r,s=s.concat([t+i*Math.sin(n*Math.PI/e),a+i*Math.cos(n*Math.PI/e)])
return s.push("z"),this.path(s.join(","))},Raphael.fn.g.cross=function(t,a,h){return h/=2.5,this.path("M".concat(t-h,",",a,"l",[-h,-h,h,-h,h,h,h,-h,h,h,-h,h,h,h,-h,h,-h,-h,-h,h,-h,-h,"z"]))},Raphael.fn.g.plus=function(t,a,h){return h/=2,this.path("M".concat(t-h/2,",",a-h/2,"l",[0,-h,h,0,0,h,h,0,0,h,-h,0,0,h,-h,0,0,-h,-h,0,0,-h,"z"]))},Raphael.fn.g.arrow=function(t,a,h){return this.path("M".concat(t-.7*h,",",a-.4*h,"l",[.6*h,0,0,.4*-h,h,.8*h,-h,.8*h,0,.4*-h,.6*-h,0],"z"))},Raphael.fn.g.tag=function(t,a,h,r,e){r=r||0,e=null==e?5:e,h=null==h?"$9.99":h
var i=.5522*e,s=this.set(),n=3
return s.push(this.path().attr({fill:"#000",stroke:"#000"})),s.push(this.text(t,a,h).attr(this.g.txtattr).attr({fill:"#fff","font-family":"Helvetica, Arial"})),s.update=function(){this.rotate(0,t,a)
var h=this[1].getBBox()
if(h.height>=2*e)this[0].attr({path:["M",t,a+e,"a",e,e,0,1,1,0,2*-e,e,e,0,1,1,0,2*e,"m",0,2*-e-n,"a",e+n,e+n,0,1,0,0,2*(e+n),"L",t+e+n,a+h.height/2+n,"l",h.width+2*n,0,0,-h.height-2*n,-h.width-2*n,0,"L",t,a-e-n].join(",")})
else{var s=Math.sqrt(Math.pow(e+n,2)-Math.pow(h.height/2+n,2))
this[0].attr({path:["M",t,a+e,"c",-i,0,-e,i-e,-e,-e,0,-i,e-i,-e,e,-e,i,0,e,e-i,e,e,0,i,i-e,e,-e,e,"M",t+s,a-h.height/2-n,"a",e+n,e+n,0,1,0,0,h.height+2*n,"l",e+n-s+h.width+2*n,0,0,-h.height-2*n,"L",t+s,a-h.height/2-n].join(",")})}return this[1].attr({x:t+e+n+h.width/2,y:a}),r=(360-r)%360,this.rotate(r,t,a),r>90&&270>r&&this[1].attr({x:t-e-n-h.width/2,y:a,rotation:[180+r,t,a]}),this},s.update(),s},Raphael.fn.g.popupit=function(a,h,r,e,i){e=null==e?2:e,i=i||5,a=Math.round(a),h=Math.round(h)
var s=r.getBBox(),n=Math.round(s.width/2),o=Math.round(s.height/2),l=[0,n+2*i,0,-n-2*i],f=[2*-o-3*i,-o-i,0,-o-i],u=["M",a-l[e],h-f[e],"l",-i,(2==e)*-i,-t(n-i,0),0,"a",i,i,0,0,1,-i,-i,"l",0,-t(o-i,0),(3==e)*-i,-i,(3==e)*i,-i,0,-t(o-i,0),"a",i,i,0,0,1,i,-i,"l",t(n-i,0),0,i,!e*-i,i,!e*i,t(n-i,0),0,"a",i,i,0,0,1,i,i,"l",0,t(o-i,0),(1==e)*i,i,(1==e)*-i,i,0,t(o-i,0),"a",i,i,0,0,1,-i,i,"l",-t(n-i,0),0,"z"].join(","),p=[{x:a,y:h+2*i+o},{x:a-2*i-n,y:h},{x:a,y:h-2*i-o},{x:a+2*i+n,y:h}][e]
return r.translate(p.x-n-s.x,p.y-o-s.y),this.path(u).attr({fill:"#000",stroke:"none"}).insertBefore(r.node?r:r[0])},Raphael.fn.g.popup=function(a,h,r,e,i){e=null==e?2:e>3?3:e,i=i||5,r=r||"$9.99"
var s=this.set()
return s.push(this.path().attr({fill:"#000",stroke:"#000"})),s.push(this.text(a,h,r).attr(this.g.txtattr).attr({fill:"#fff","font-family":"Helvetica, Arial"})),s.update=function(r,s,n){r=r||a,s=s||h
var o=this[1].getBBox(),l=o.width/2,f=o.height/2,u=[0,l+2*i,0,-l-2*i],p=[2*-f-3*i,-f-i,0,-f-i],c=["M",r-u[e],s-p[e],"l",-i,(2==e)*-i,-t(l-i,0),0,"a",i,i,0,0,1,-i,-i,"l",0,-t(f-i,0),(3==e)*-i,-i,(3==e)*i,-i,0,-t(f-i,0),"a",i,i,0,0,1,i,-i,"l",t(l-i,0),0,i,!e*-i,i,!e*i,t(l-i,0),0,"a",i,i,0,0,1,i,i,"l",0,t(f-i,0),(1==e)*i,i,(1==e)*-i,i,0,t(f-i,0),"a",i,i,0,0,1,-i,i,"l",-t(l-i,0),0,"z"].join(","),g=[{x:r,y:s+2*i+f},{x:r-2*i-l,y:s},{x:r,y:s-2*i-f},{x:r+2*i+l,y:s}][e]
return g.path=c,n?this.animate(g,500,">"):this.attr(g),this},s.update(a,h)},Raphael.fn.g.flag=function(t,a,h,e){e=e||0,h=h||"$9.99"
var i=this.set(),s=3
return i.push(this.path().attr({fill:"#000",stroke:"#000"})),i.push(this.text(t,a,h).attr(this.g.txtattr).attr({fill:"#fff","font-family":"Helvetica, Arial"})),i.update=function(t,a){this.rotate(0,t,a)
var h=this[1].getBBox(),i=h.height/2
return this[0].attr({path:["M",t,a,"l",i+s,-i-s,h.width+2*s,0,0,h.height+2*s,-h.width-2*s,0,"z"].join(",")}),this[1].attr({x:t+i+s+h.width/2,y:a}),e=360-e,this.rotate(e,t,a),e>90&&270>e&&this[1].attr({x:t-r-s-h.width/2,y:a,rotation:[180+e,t,a]}),this},i.update(t,a)},Raphael.fn.g.label=function(t,h,r){var e=this.set()
return e.push(this.rect(t,h,10,10).attr({stroke:"none",fill:"#000"})),e.push(this.text(t,h,r).attr(this.g.txtattr).attr({fill:"#fff"})),e.update=function(){var t=this[1].getBBox(),h=a(t.width+10,t.height+10)/2
this[0].attr({x:t.x-h/2,y:t.y-h/2,width:t.width+h,height:t.height+h,r:h})},e.update(),e},Raphael.fn.g.labelit=function(t){var h=t.getBBox(),r=a(20,h.width+10,h.height+10)/2
return this.rect(h.x-r/2,h.y-r/2,h.width+r,h.height+r,r).attr({stroke:"none",fill:"#000"}).insertBefore(t.node?t:t[0])},Raphael.fn.g.drop=function(t,a,h,r,e){r=r||30,e=e||0
var i=this.set()
return i.push(this.path(["M",t,a,"l",r,0,"A",.4*r,.4*r,0,1,0,t+.7*r,a-.7*r,"z"]).attr({fill:"#000",stroke:"none",rotation:[22.5-e,t,a]})),e=(e+90)*Math.PI/180,i.push(this.text(t+r*Math.sin(e),a+r*Math.cos(e),h).attr(this.g.txtattr).attr({"font-size":12*r/30,fill:"#fff"})),i.drop=i[0],i.text=i[1],i},Raphael.fn.g.blob=function(a,h,r,e,i){e=(+e+1?e:45)+90,i=i||12
var s=Math.PI/180,n=12*i/12,o=this.set()
return o.push(this.path().attr({fill:"#000",stroke:"none"})),o.push(this.text(a+i*Math.sin(e*s),h+i*Math.cos(e*s)-n/2,r).attr(this.g.txtattr).attr({"font-size":n,fill:"#fff"})),o.update=function(r,o,l){r=r||a,o=o||h
var f=this[1].getBBox(),u=t(f.width+n,25*i/12),p=t(f.height+n,25*i/12),c=r+i*Math.sin((e-22.5)*s),g=o+i*Math.cos((e-22.5)*s),M=r+i*Math.sin((e+22.5)*s),d=o+i*Math.cos((e+22.5)*s),x=(M-c)/2,R=(d-g)/2,w=u/2,v=p/2,b=-Math.sqrt(Math.abs(w*w*v*v-w*w*R*R-v*v*x*x)/(w*w*R*R+v*v*x*x)),z=b*w*R/v+(M+c)/2,y=b*-v*x/w+(d+g)/2
return l?this.animate({x:z,y:y,path:["M",a,h,"L",M,d,"A",w,v,0,1,1,c,g,"z"].join(",")},500,">"):this.attr({x:z,y:y,path:["M",a,h,"L",M,d,"A",w,v,0,1,1,c,g,"z"].join(",")}),this},o.update(a,h),o},Raphael.fn.g.colorValue=function(t,h,r,e){return"hsb("+[a(.4*(1-t/h),1),r||.75,e||.75]+")"},Raphael.fn.g.snapEnds=function(t,a,h){function r(t){return Math.abs(t-.5)<.25?~~t+.5:Math.round(t)}var e=t,i=a
if(e==i)return{from:e,to:i,power:0}
var s=(i-e)/h,n=~~s,o=n,l=0
if(s==n)return{from:e,to:i,power:0}
if(n){for(;o;)l--,o=~~(s*Math.pow(10,l))/Math.pow(10,l)
l+=2}else{for(;!n;)l=l||1,n=~~(s*Math.pow(10,l))/Math.pow(10,l),l++
l&&l--}return i=r(a*Math.pow(10,l))/Math.pow(10,l),a>i&&(i=r((a+.5)*Math.pow(10,l))/Math.pow(10,l)),e=r((t-(l>0?0:.5))*Math.pow(10,l))/Math.pow(10,l),{from:e,to:i,power:l}},Raphael.fn.g.axis=function(t,a,h,r,e,i,s,n,o,l){l=null==l?2:l,o=o||"t",i=i||10
var f="|"==o||" "==o?["M",t+.5,a,"l",0,.001]:1==s||3==s?["M",t+.5,a,"l",0,-h]:["M",t,a+.5,"l",h,0],u=this.g.snapEnds(r,e,i),p=u.from,c=u.to,g=u.power,M=0,d=this.set(),x=(c-p)/i,R=p,w=g>0?g:0
if(y=h/i,1==+s||3==+s){for(var v=a,b=(s-1?1:-1)*(l+3+!!(s-1));v>=a-h;)"-"!=o&&" "!=o&&(f=f.concat(["M",t-("+"==o||"|"==o?l:!(s-1)*l*2),v+.5,"l",2*l+1,0])),d.push(this.text(t+b,v,n&&n[M++]||(Math.round(R)==R?R:+R.toFixed(w))).attr(this.g.txtattr).attr({"text-anchor":s-1?"start":"end"})),R+=x,v-=y
Math.round(v+y-(a-h))&&("-"!=o&&" "!=o&&(f=f.concat(["M",t-("+"==o||"|"==o?l:!(s-1)*l*2),a-h+.5,"l",2*l+1,0])),d.push(this.text(t+b,a-h,n&&n[M]||(Math.round(R)==R?R:+R.toFixed(w))).attr(this.g.txtattr).attr({"text-anchor":s-1?"start":"end"})))}else{R=p,w=(g>0)*g,b=(s?-1:1)*(l+9+!s)
for(var z=t,y=h/i,m=0,B=0;t+h>=z;){"-"!=o&&" "!=o&&(f=f.concat(["M",z+.5,a-("+"==o?l:!!s*l*2),"l",0,2*l+1])),d.push(m=this.text(z,a+b,n&&n[M++]||(Math.round(R)==R?R:+R.toFixed(w))).attr(this.g.txtattr))
var k=m.getBBox()
B>=k.x-5?d.pop(d.length-1).remove():B=k.x+k.width,R+=x,z+=y}Math.round(z-y-t-h)&&("-"!=o&&" "!=o&&(f=f.concat(["M",t+h+.5,a-("+"==o?l:!!s*l*2),"l",0,2*l+1])),d.push(this.text(t+h,a+b,n&&n[M]||(Math.round(R)==R?R:+R.toFixed(w))).attr(this.g.txtattr)))}var j=this.path(f)
return j.text=d,j.all=this.set([j,d]),j.remove=function(){this.text.remove(),this.constructor.prototype.remove.call(this)},j},Raphael.el.lighter=function(t){t=t||2
var h=[this.attrs.fill,this.attrs.stroke]
this.fs=this.fs||[h[0],h[1]],h[0]=Raphael.rgb2hsb(Raphael.getRGB(h[0]).hex),h[1]=Raphael.rgb2hsb(Raphael.getRGB(h[1]).hex),h[0].b=a(h[0].b*t,1),h[0].s=h[0].s/t,h[1].b=a(h[1].b*t,1),h[1].s=h[1].s/t,this.attr({fill:"hsb("+[h[0].h,h[0].s,h[0].b]+")",stroke:"hsb("+[h[1].h,h[1].s,h[1].b]+")"})},Raphael.el.darker=function(t){t=t||2
var h=[this.attrs.fill,this.attrs.stroke]
this.fs=this.fs||[h[0],h[1]],h[0]=Raphael.rgb2hsb(Raphael.getRGB(h[0]).hex),h[1]=Raphael.rgb2hsb(Raphael.getRGB(h[1]).hex),h[0].s=a(h[0].s*t,1),h[0].b=h[0].b/t,h[1].s=a(h[1].s*t,1),h[1].b=h[1].b/t,this.attr({fill:"hsb("+[h[0].h,h[0].s,h[0].b]+")",stroke:"hsb("+[h[1].h,h[1].s,h[1].b]+")"})},Raphael.el.original=function(){this.fs&&(this.attr({fill:this.fs[0],stroke:this.fs[1]}),delete this.fs)}}()