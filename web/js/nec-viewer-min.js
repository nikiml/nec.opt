var NecViewer=function(t){var e=["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],n=["W","f","o","i","l","K","I","J","w","A","","H","T","R","S","X","P","p","M","E","C"],r="length",i="splice",o="split",s="forEach",a=function(){var t,i={}
for(t=0;t!=e[r];++t)i[n[t]]=e[t]
return i}()
return t.decompress=function(t){var e=function(){var t=void 0,e=function(e){t=e.slice()},n=function(t,e,n,r){r+=n
for(var i=n;i!=r;++i)""===t[i]?t[i]=e[i]:"+"==t[i]?t[i]=t[i-3]:"-"==t[i]&&(t[i]=-t[i-3])}
return{gw:function(r){return t?(r[9]||(r[9]=t[9]),n(r,t,1,8),e(r),r):(n(r,r,6,3),e(r),r)},g1:function(e){return e[0]="gw",e[i](3,0,t[3],t[4],t[5]),this.gw(e)},g2:function(e){return e[0]="gw",e[i](6,0,t[3],t[4],t[5]),this.gw(e)},g3:function(e){return e[0]="gw",e[i](3,0,t[6],t[7],t[8]),this.gw(e)},g4:function(e){return e[0]="gw",e[i](6,0,t[6],t[7],t[8]),this.gw(e)},g5:function(t){return t[0]="gw",t[i](6,0,t[3],t[4]),t=this.gw(t),t[6]=t[3],t[7]=t[4],e(t),t},g6:function(t){return t[0]="gw",t[i](7,0,t[4],t[5]),t=this.gw(t),t[7]=t[4],t[8]=t[5],e(t),t},g7:function(t){return t[0]="gw",t[i](5,0,t[6],t[3]),t=this.gw(t),t[5]=t[8],t[6]=t[3],e(t),t},general:function(t){for(var e=1;e!=t[r];++e)""===t[e]&&(t[e]="0")
return t},gs:function(t){return t[i](1,0,"0","0"),t}}},n=e(),l=""
return t=t[o](/,(?=[a-zA-Z],)/gi),t[s](function(t){var e=t[o](",")
if(e){if(!(e[0]in a))return void(l+=t+",")
e[0]=a[e[0]],e=e[0]in n?n[e[0]](e):n.general(e),e&&(l+=e.join(",")+",")}}),l},t.geometryViewer=function(e,n,a){var l,c,u=Math,h=u.PI,f=Matrix,d="Rotation",p=f[d+"Z"],x="push",g="replace",v="substr",m="indexOf",k="#000",y="charAt",M="toLowerCase",w="create",b="transform",$="lines",V="surface",z="segs",C="add",_="subtract",I="modulus",B="toUnitVector",S="color",W="radius",L="tag",E="area",A="cross",H=document,R="last",P="innerHTML",T="getElementById",j=void 0,O="geometry",N=u.max,F=u.cos,q=u.sin,Y=function(){var t=function(t,e,n,r,i,o){var s=this
s[L]=e,s[S]=t,s[W]=$V(r),s[z]=n,s.s=$V(i),s.e=$V(o),s.d=s.e[_](s.s),s.l=s.d[I]()},e=t.prototype
return t[w]=function(e,n,r,i,o,s){return new t(e,n,r,i,o,s)},e[b]=function(e,n,r,i,o){e=e||f.I(3),n=n||$V([0,0,0]),r=r||1,i=i||0,o=o||0
var s=this
return o&&o!==s[L]?j:t[w](s[S],s[L]+i,s[z],s[W].x(r),e.x(s.s)[C](n).x(r),e.x(s.e)[C](n).x(r))},e[$]=function(t,e,n){var r=this
return[{line:[t.x(r.s).x(e)[C](n),t.x(r.e).x(e)[C](n)],len:r.l,dir:t.x(r.d)}]},e.setRadius=function(t){this[W]=$V(t)},e[V]=function(){return j},t}(),X=function(){var t=function(t,e,n,i){var o=this
o[S]=t,o[E]=e,o.c=$V(n),o.d=$V(i),o.b=[]
for(var s=o.d.eql([0,0,1])?o.d[A]([1,0,0])[B]():o.d[A]([0,0,1])[B](),a=s[A](o.d),l=u.sqrt(o[E]/u.PI),c=0,h=u.PI/12;24!=o.b[r];)o.b[x](o.c[C](a.x(l*F(c))[C](s.x(l*q(c))))),c+=h},e=t.prototype
return t[w]=function(e,n,r,i){return new t(e,n,r,i)},e[b]=function(e,n,r,i,o){e=e||f.I(3),n=n||$V([0,0,0]),r=r||1
var s=this
return o?j:t[w](s[S],s[E]*r*r,e.x(s.c)[C](n).x(r),e.x(s.d))},e[$]=function(){return[]},e[V]=function(t,e,n){for(var i=[],o=this;i[r]!=o.b[r];)i[x](t.x(o.b[i[r]]).x(e)[C](n))
return{path:i,area:o[E],dir:t.x(o.d),org:t.x(o.c).x(e)[C](n)}},t}(),Z=function(){var t=function(t,e,n,r){var i=this
i[S]=t,i.v1=$V(e),i.v2=$V(n),i.v3=$V(r),i.d=i.v1[_](i.v2)[A](i.v3[_](i.v2)),i[E]=i.d[I]()/2,i.d=i.d[B](),i.c=i.v1[C](i.v2)[C](i.v3).x(1/3)},e=t.prototype
return t[w]=function(e,n,r,i){return new t(e,n,r,i)},e[b]=function(e,n,r,i,o){e=e||f.I(3),n=n||$V([0,0,0]),r=r||1
var s=this
return o?j:t[w](s[S],e.x(s.v1)[C](n).x(r),e.x(s.v2)[C](n).x(r),e.x(s.v3)[C](n).x(r))},e[$]=function(t,e,n){var r=this,i=[t.x(r.v1).x(e)[C](n),t.x(r.v2).x(e)[C](n)],o=i[1][_](i[0]),s=[{line:i,len:o[I](),dir:o[B]()}]
return i=[t.x(r.v2).x(e)[C](n),t.x(r.v3).x(e)[C](n)],o=i[1][_](i[0]),s[x]({line:i,len:o[I](),dir:o[B]()}),i=[t.x(r.v3).x(e)[C](n),t.x(r.v1).x(e)[C](n)],o=i[1][_](i[0]),s[x]({line:i,len:o[I](),dir:o[B]()}),s},e[V]=function(t,e,n){var r=this
return{path:[t.x(r.v1).x(e)[C](n),t.x(r.v2).x(e)[C](n),t.x(r.v3).x(e)[C](n)],area:r[E],dir:t.x(r.d),org:t.x(r.c).x(e)[C](n)}},t}(),D=function(){var t=function(t,e,n,r,i){var o=this
o[S]=t,o.v1=$V(e),o.v2=$V(n),o.v3=$V(r),o.v4=i?$V(i):o.v3[C](o.v1[_](o.v2)),o.d=o.v1[_](o.v3)[A](o.v4[_](o.v2))[B](),o[E]=o.v1[_](o.v2)[A](o.v3[_](o.v2))[I]()/2+o.v1[_](o.v4)[A](o.v3[_](o.v4))[I]()/2,o.c=o.v1[C](o.v2)[C](o.v3)[C](o.v4).x(.25)},e=t.prototype
return t[w]=function(e,n,r,i,o){return new t(e,n,r,i,o)},e[b]=function(e,n,r,i,o){e=e||f.I(3),n=n||$V([0,0,0]),r=r||1
var s=this
return o?j:t[w](s[S],e.x(s.v1)[C](n).x(r),e.x(s.v2)[C](n).x(r),e.x(s.v3)[C](n).x(r),e.x(s.v4)[C](n).x(r))},e[$]=function(t,e,n){var r=this,i=[t.x(r.v1).x(e)[C](n),t.x(r.v2).x(e)[C](n)],o=i[1][_](i[0]),s=[{line:i,len:o[I](),dir:o[B]()}]
return i=[t.x(r.v2).x(e)[C](n),t.x(r.v3).x(e)[C](n)],o=i[1][_](i[0]),s[x]({line:i,len:o[I](),dir:o[B]()}),i=[t.x(r.v3).x(e)[C](n),t.x(r.v4).x(e)[C](n)],o=i[1][_](i[0]),s[x]({line:i,len:o[I](),dir:o[B]()}),i=[t.x(r.v4).x(e)[C](n),t.x(r.v1).x(e)[C](n)],o=i[1][_](i[0]),s[x]({line:i,len:o[I](),dir:o[B]()}),s},e[V]=function(t,e,n){var r=this
return{path:[t.x(r.v1).x(e)[C](n),t.x(r.v2).x(e)[C](n),t.x(r.v3).x(e)[C](n),t.x(r.v4).x(e)[C](n)],area:this[E],dir:t.x(r.d),org:t.x(r.c).x(e)[C](n)}},t}(),G=function(t,e,n,i,o,a,l){if(a){var c,u,h=a,f=t[r]
for(c=0;c!=f&&!(u=t[c][b](n,i,o,l,e));++c);if(!u)return
for(;h;){for(h-=1;c!=f;++c)t[x](t[c][b](n,i,o,l,0))
f=t[r]}}else{var d=function(t,r,s){var a=t[b](n,i,o,0,e)
a&&(s[r]=a,e=0)}
t[s](d)}},U=function(t,e,n){if(!(2>e)){var r=p(2*h/e)
G(t,0,r,j,j,e-1,n)}},J=function(t,e){1!=e&&G(t,0,j,j,e,0,0)},Q=function(t,e,n,r,i){!i||G(t,0,f.Diagonal([1,1,-1]),j,1,1,e),e+=i?e:0,!r||G(t,0,f.Diagonal([1,-1,1]),j,1,1,e),e+=r?e:0,!n||G(t,0,f.Diagonal([-1,1,1]),j,1,1,e)},K=function(t,e){return 1*t||e||0},te=function(){return{color:k,last:j,cl:function(e){var n=e[1]||k,r=/#[0-9a-f]{3}/,i=/#[0-9a-f]{6}/
n=t.colorNameToHex(n)||"#"===n[y](0)?n:"#"+n,(r.test(n)||i.test(n))&&(this[S]=n)},gw:function(t,e){e[x](Y[w](this[S],K(t[1],1),K(t[2],1),[K(t[9],.001)],[K(t[3]),K(t[4]),K(t[5])],[K(t[6]),K(t[7]),K(t[8])])),this[R]=t},gc:function(t,e){this[R]&&"gw"==this[R][0]&&e[e[r]-1].r.setRadius([K(t[4]),K(t[5])]),this[R]=j},ga:function(t,e){for(var n,r=K(t[1],1),i=K(t[2],10),o=K(t[3],.1),s=K(t[4])/180*u.PI,a=K(t[5],180)/180*u.PI,l=K(t[6],.001),c=(a-s)/i,h=[o*F(s),0,o*q(s)];i;)i-=1,s+=c,n=[o*F(s),0,o*q(s)],e[x](Y[w](this[S],r,1,[l],h,n)),h=n},ge:function(){},gh:function(t,e){for(var n,r=K(t[1],1),i=K(t[2],10),o=K(t[3],.1),s=K(t[4]),a=K(t[5],.1),l=K(t[6],.1),c=K(t[7],.1),h=K(t[8],.1),f=K(t[9],.001),d=s/o||u.min(h-l,c-a)/o||1,p=$V([2*u.PI*d/i,(c-a)/i,(h-l)/i,s/i]),g=$V([0,a,l,0]),v=[F(g.e(1))*g.e(2),q(g.e(1))*g.e(3),g.e(4)];i;)i-=1,g=g[C](p),n=[F(g.e(1))*g.e(2),q(g.e(1))*g.e(3),g.e(4)],e[x](Y[w](this[S],r,1,[f],v,n)),v=n},gm:function(t,e){var n=K(t[1]),r=K(t[2]),i=K(t[3])/180*u.PI,o=K(t[4])/180*u.PI,s=K(t[5])/180*u.PI,a=K(t[6]),l=K(t[7]),c=K(t[8]),h=K(t[9]),x=p(s).x(f[d+"Y"](o).x(f[d+"X"](i))),g=$V([a,l,c])
G(e,h,x,g,1,r,n)},gr:function(t,e){U(e,K(t[1]),K(t[2]))},gs:function(t,e){J(e,K(t[3],1))},gx:function(t,e){var n=t[2]+""||"000"
Q(e,K(t[1]),"1"==n[y](0),"1"==n[y](1),"1"==n[y](2))},sp0:function(t,e){var n=K(t[6]),r=K(t[5])
e[x](X[w](this[S],K(t[8]),[K(t[3]),K(t[4]),K(t[5])],[F(n)*F(r),F(n)*q(r),q(n)]))},spc:function(t,e){var n,r=this,o=r[R],s=K("sp"==o[0]?o[2]:t[2])
1==s&&(n=D[w](r[S],[K(o[3]),K(o[4]),K(o[5])],[K(o[6]),K(o[7]),K(o[8])],[K(t[3]),K(t[4]),K(t[5])]),e[x](n),r[R][0]=t[0],r[R][i](3,6,n.v4.e(1),n.v4.e(2),n.v4.e(3),n.v3.e(1),n.v3.e(2),n.v3.e(3))),3==s&&(n=D[w](r[S],[K(o[3]),K(o[4]),K(o[5])],[K(o[6]),K(o[7]),K(o[8])],[K(t[3]),K(t[4]),K(t[5])],[K(t[6]),K(t[7]),K(t[8])]),e[x](n),r[R][0]=t[0],r[R][i](3,6,n.v4.e(1),n.v4.e(2),n.v4.e(3),n.v3.e(1),n.v3.e(2),n.v3.e(3))),2==s&&(n=Z[w](r[S],[K(o[3]),K(o[4]),K(o[5])],[K(o[6]),K(o[7]),K(o[8])],[K(t[3]),K(t[4]),K(t[5])]),e[x](n),r[R]=j)},sp:function(t,e){K(t[2])?this[R]=t:this.sp0(t,e)},sc:function(t,e){var n=this
n[R]&&n[R][r]&&("sp"==n[R][0]||"sc"==n[R][0]?n.spc(t,e):"sm"==n[R][0]&&n.smc(t,e))},sm:function(t){this[R]=t},smc:function(t,e){var n,r,i,o,s,a=this[R],l=K(a[1],1),c=K(a[2],1),u=$V([K(a[3]),K(a[4]),K(a[5])]),h=$V([K(a[6]),K(a[7]),K(a[8])]),f=$V([K(t[3]),K(t[4]),K(t[5])]),d=u[_](h).x(1/l),p=f[_](h).x(1/c)
for(o=0;o!=l;++o)for(r=h[C](d.x(o)),i=r[C](p),n=r[C](d),s=0;s!=c;++s)e[x](D[w](this[S],n,r,i)),r=i,n=r[C](d),i=r[C](p)},ex:function(t,e){var n,i,o=K(t[1]),s=K(t[2]),a=K(t[3]),l=e[r]
if(-1!==[0,5,6].indexOf(o)){for(n=0;n!=l;++n)if(L in e[n]&&(!s||e[n][L]===s)){if(a<=e[n][z])break
a-=e[n][z]}n!=l&&(i=e[n],i=i.s[C](i.e[_](i.s).x((a-(5!=o?.5:1))/i[z])),e[x](Y[w]("#f0f",-1,-1,[0],i,i)))}}}},ee=function(t){var e,n,i=[],s=t[r],a=te()
for(e=0;e!=s;++e)n=t[e][o](","),n[r]&&n[0]in a&&a[n[0]](n,i)
return i},ne=function(t){var e,n=[".html#",".html?",/%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,"",/%5B;/g,"[",/%5D;/g,"]",/&#38;/g,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,"",/&#91;/g,"[",/&#93;/g,"]",/"/g,"",/'/g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&"],i=n[r]
for(e=0;e!=i;e+=2)t=t[g](n[e],n[e+1])
return t},re=a||ne(decodeURI(""+window.location)),ie=re[o](/[?#&]/),oe=e||t.getClientWidth(),se=n||t.getClientHeight(),ae=[],le=[],ce=j
try{for(l=1;l<ie[r];++l){if(c=ie[l][m]("message="),-1!=c)return void(H[T](O)[P]=ie[l][v](c+8))
c=ie[l][m]("name="),-1==c?(c=ie[l][m](O+"="),-1==c?(c=ie[l][m]("conf="),-1==c||(c=ie[l][v](c+5)[o](","),ae[x](1==c[r]?[c[0],[]]:[c[0],+c[1][v](1)]))):le[x](ee(this.decompress(ie[l][v](c+9)[g](/\[\[|\]\]/g,""))[M]()[o](/,(?=[a-z][a-z],|[a-z][a-z]$)/g)))):ce=ie[l][v](c+5)}}catch(ue){return void(H[T](O)[P]=ue)}le=new t.AntennaGeometry(O,N(oe-10,0),N(se-10,0),le[0],ae[r]?ae:0,ae[r]?"Configuration":0,j,ce)},t}(NecViewer||{})