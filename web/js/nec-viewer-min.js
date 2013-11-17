var NecViewer=function(n){var t=["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],r=["W","f","o","i","l","K","I","J","w","A ","","H","T","R","S","X","P","p","M","E","C"],i="length",e="splice",o="split",u="forEach",v=function(){var n,e={}
for(n=0;n!=t[i];++n)e[r[n]]=t[n]
return e}()
return n.decompress=function(n){var t=function(){var n=void 0,t=function(t){n=t.slice()},r=function(n,t,r,i){i+=r
for(var e=r;e!=i;++e)""===n[e]?n[e]=t[e]:"+"==n[e]?n[e]=n[e-3]:"-"==n[e]&&(n[e]=-n[e-3])}
return{gw:function(i){return n?(i[9]||(i[9]=n[9]),r(i,n,1,8),t(i),i):(r(i,i,6,3),t(i),i)},g1:function(t){return t[0]="gw",t[e](3,0,n[3],n[4],n[5]),this.gw(t)},g2:function(t){return t[0]="gw",t[e](6,0,n[3],n[4],n[5]),this.gw(t)},g3:function(t){return t[0]="gw",t[e](3,0,n[6],n[7],n[8]),this.gw(t)},g4:function(t){return t[0]="gw",t[e](6,0,n[6],n[7],n[8]),this.gw(t)},g5:function(n){return n[0]="gw",n[e](6,0,n[3],n[4]),n=this.gw(n),n[6]=n[3],n[7]=n[4],t(n),n},g6:function(n){return n[0]="gw",n[e](7,0,n[4],n[5]),n=this.gw(n),n[7]=n[4],n[8]=n[5],t(n),n},g7:function(n){return n[0]="gw",n[e](5,0,n[6],n[3]),n=this.gw(n),n[5]=n[8],n[6]=n[3],t(n),n},general:function(n){for(var t=1;t!=n[i];++t)""===n[t]&&(n[t]="0")
return n},gs:function(n){return n[e](1,0,"0","0"),n}}},r=t(),c=""
return n=n[o](/,(?=[a-zA-Z],)/gi),n[u](function(n){var t=n[o](",")
if(t){if(!(t[0]in v))return c+=n+",",void 0
t[0]=v[t[0]],t=t[0]in r?r[t[0]](t):r.general(t),t&&(c+=t.join(",")+",")}}),c},n.geometryViewer=function(t,r,v){var c,f,x=Math,s=x.PI,a=Matrix,g="Rotation",h=a[g+"Z"],d="push",l="replace",w="substr",p="indexOf",V="#000",m="charAt",$="toLowerCase",I="create",P="transform",b="lines",y="surface",z="segs",C="add",R="subtract",A="modulus",D="toUnitVector",H="color",M="radius",N="tag",q="area",E="cross",T=document,B="last",L="innerHTML",O="getElementById",U=void 0,W="geometry",X=x.max,Z=x.cos,j=x.sin,k=function(){var n=function(n,t,r,i,e,o){var u=this
u[N]=t,u[H]=n,u[M]=$V(i),u[z]=r,u.s=$V(e),u.e=$V(o),u.d=u.e[R](u.s),u.l=u.d[A]()},t=n.prototype
return n[I]=function(t,r,i,e,o,u){return new n(t,r,i,e,o,u)},t[P]=function(t,r,i,e,o){t=t||a.I(3),r=r||$V([0,0,0]),i=i||1,e=e||0,o=o||0
var u=this
return o&&o!==u[N]?U:n[I](u[H],u[N]+e,u[z],u[M].x(i),t.x(u.s)[C](r).x(i),t.x(u.e)[C](r).x(i))},t[b]=function(n,t,r){var i=this
return[{line:[n.x(i.s).x(t)[C](r),n.x(i.e).x(t)[C](r)],len:i.l,dir:n.x(i.d)}]},t.setRadius=function(n){this[M]=$V(n)},t[y]=function(){return U},n}(),G=function(){var n=function(n,t,r,e){var o=this
o[H]=n,o[q]=t,o.c=$V(r),o.d=$V(e),o.b=[]
for(var u=o.d.eql([0,0,1])?o.d[E]([1,0,0])[D]():o.d[E]([0,0,1])[D](),v=u[E](o.d),c=x.sqrt(o[q]/x.PI),f=0,s=x.PI/12;24!=o.b[i];)o.b[d](o.c[C](v.x(c*Z(f))[C](u.x(c*j(f))))),f+=s},t=n.prototype
return n[I]=function(t,r,i,e){return new n(t,r,i,e)},t[P]=function(t,r,i,e,o){t=t||a.I(3),r=r||$V([0,0,0]),i=i||1
var u=this
return o?U:n[I](u[H],u[q]*i*i,t.x(u.c)[C](r).x(i),t.x(u.d))},t[b]=function(){return[]},t[y]=function(n,t,r){for(var e=[],o=this;e[i]!=o.b[i];)e[d](n.x(o.b[e[i]]).x(t)[C](r))
return{path:e,area:o[q],dir:n.x(o.d),org:n.x(o.c).x(t)[C](r)}},n}(),J=function(){var n=function(n,t,r,i){var e=this
e[H]=n,e.v1=$V(t),e.v2=$V(r),e.v3=$V(i),e.d=e.v1[R](e.v2)[E](e.v3[R](e.v2)),e[q]=e.d[A]()/2,e.d=e.d[D](),e.c=e.v1[C](e.v2)[C](e.v3).x(1/3)},t=n.prototype
return n[I]=function(t,r,i,e){return new n(t,r,i,e)},t[P]=function(t,r,i,e,o){t=t||a.I(3),r=r||$V([0,0,0]),i=i||1
var u=this
return o?U:n[I](u[H],t.x(u.v1)[C](r).x(i),t.x(u.v2)[C](r).x(i),t.x(u.v3)[C](r).x(i))},t[b]=function(n,t,r){var i=this,e=[n.x(i.v1).x(t)[C](r),n.x(i.v2).x(t)[C](r)],o=e[1][R](e[0]),u=[{line:e,len:o[A](),dir:o[D]()}]
return e=[n.x(i.v2).x(t)[C](r),n.x(i.v3).x(t)[C](r)],o=e[1][R](e[0]),u[d]({line:e,len:o[A](),dir:o[D]()}),e=[n.x(i.v3).x(t)[C](r),n.x(i.v1).x(t)[C](r)],o=e[1][R](e[0]),u[d]({line:e,len:o[A](),dir:o[D]()}),u},t[y]=function(n,t,r){var i=this
return{path:[n.x(i.v1).x(t)[C](r),n.x(i.v2).x(t)[C](r),n.x(i.v3).x(t)[C](r)],area:i[q],dir:n.x(i.d),org:n.x(i.c).x(t)[C](r)}},n}(),K=function(){var n=function(n,t,r,i,e){var o=this
o[H]=n,o.v1=$V(t),o.v2=$V(r),o.v3=$V(i),o.v4=e?$V(e):o.v3[C](o.v1[R](o.v2)),o.d=o.v1[R](o.v3)[E](o.v4[R](o.v2))[D](),o[q]=o.v1[R](o.v2)[E](o.v3[R](o.v2))[A]()/2+o.v1[R](o.v4)[E](o.v3[R](o.v4))[A]()/2,o.c=o.v1[C](o.v2)[C](o.v3)[C](o.v4).x(.25)},t=n.prototype
return n[I]=function(t,r,i,e,o){return new n(t,r,i,e,o)},t[P]=function(t,r,i,e,o){t=t||a.I(3),r=r||$V([0,0,0]),i=i||1
var u=this
return o?U:n[I](u[H],t.x(u.v1)[C](r).x(i),t.x(u.v2)[C](r).x(i),t.x(u.v3)[C](r).x(i),t.x(u.v4)[C](r).x(i))},t[b]=function(n,t,r){var i=this,e=[n.x(i.v1).x(t)[C](r),n.x(i.v2).x(t)[C](r)],o=e[1][R](e[0]),u=[{line:e,len:o[A](),dir:o[D]()}]
return e=[n.x(i.v2).x(t)[C](r),n.x(i.v3).x(t)[C](r)],o=e[1][R](e[0]),u[d]({line:e,len:o[A](),dir:o[D]()}),e=[n.x(i.v3).x(t)[C](r),n.x(i.v4).x(t)[C](r)],o=e[1][R](e[0]),u[d]({line:e,len:o[A](),dir:o[D]()}),e=[n.x(i.v4).x(t)[C](r),n.x(i.v1).x(t)[C](r)],o=e[1][R](e[0]),u[d]({line:e,len:o[A](),dir:o[D]()}),u},t[y]=function(n,t,r){var i=this
return{path:[n.x(i.v1).x(t)[C](r),n.x(i.v2).x(t)[C](r),n.x(i.v3).x(t)[C](r),n.x(i.v4).x(t)[C](r)],area:this[q],dir:n.x(i.d),org:n.x(i.c).x(t)[C](r)}},n}(),S=function(n,t,r,e,o,v,c){if(v){var f,x,s=v,a=n[i]
for(f=0;f!=a&&!(x=n[f][P](r,e,o,c,t));++f);if(!x)return
for(;s;){for(s-=1;f!=a;++f)n[d](n[f][P](r,e,o,c,0))
a=n[i]}}else{var g=function(n,i,u){var v=n[P](r,e,o,0,t)
v&&(u[i]=v,t=0)}
n[u](g)}},Y=function(n,t,r){if(!(2>t)){var i=h(2*s/t)
S(n,0,i,U,U,t-1,r)}},F=function(n,t){1!=t&&S(n,0,U,U,t,0,0)},Q=function(n,t,r,i,e){!e||S(n,0,a.Diagonal([1,1,-1]),U,1,1,t),t+=e?t:0,!i||S(n,0,a.Diagonal([1,-1,1]),U,1,1,t),t+=i?t:0,!r||S(n,0,a.Diagonal([-1,1,1]),U,1,1,t)},_=function(n,t){return 1*n||t||0},nt=function(){return{color:V,last:U,cl:function(t){var r=t[1]||V
this[H]=n.colorNameToHex(r)||"#"===r[m](0)?r:"#"+r},gw:function(n,t){t[d](k[I](this[H],_(n[1],1),_(n[2],1),[_(n[9],.001)],[_(n[3]),_(n[4]),_(n[5])],[_(n[6]),_(n[7]),_(n[8])])),this[B]=n},gc:function(n,t){this[B]&&"gw"==this[B][0]&&t[t[i]-1].r.setRadius([_(n[4]),_(n[5])]),this[B]=U},ga:function(n,t){for(var r,i=_(n[1],1),e=_(n[2],10),o=_(n[3],.1),u=_(n[4])/180*x.PI,v=_(n[5],180)/180*x.PI,c=_(n[6],.001),f=(v-u)/e,s=[o*Z(u),0,o*j(u)];e;)e-=1,u+=f,r=[Z(u),0,j(u)],t[d](k[I](this[H],i,1,[c],s,r)),s=r},ge:function(){},gh:function(n,t){for(var r,i=_(n[1],1),e=_(n[2],10),o=_(n[3],.1),u=_(n[4]),v=_(n[5],.1),c=_(n[6],.1),f=_(n[7],.1),s=_(n[8],.1),a=_(n[9],.001),g=u/o||x.min(s-c,f-v)/o||1,h=$V([2*x.PI*g/e,(f-v)/e,(s-c)/e,u/e]),l=$V([0,v,c,0]),w=[Z(l.e(1))*l.e(2),j(l.e(1))*l.e(3),l.e(4)];e;)e-=1,l=l[C](h),r=[Z(l.e(1))*l.e(2),j(l.e(1))*l.e(3),l.e(4)],t[d](k[I](this[H],i,1,[a],w,r)),w=r},gm:function(n,t){var r=_(n[1]),i=_(n[2]),e=_(n[3])/180*x.PI,o=_(n[4])/180*x.PI,u=_(n[5])/180*x.PI,v=_(n[6]),c=_(n[7]),f=_(n[8]),s=_(n[9]),d=h(u).x(a[g+"Y"](o).x(a[g+"X"](e))),l=$V([v,c,f])
S(t,s,d,l,1,i,r)},gr:function(n,t){Y(t,_(n[1]),_(n[2]))},gs:function(n,t){F(t,_(n[3],1))},gx:function(n,t){var r=n[2]+""||"000"
Q(t,_(n[1]),"1"==r[m](0),"1"==r[m](1),"1"==r[m](2))},sp0:function(n,t){var r=_(n[6]),i=_(n[5])
t[d](G[I](this[H],_(n[8]),[_(n[3]),_(n[4]),_(n[5])],[Z(r)*Z(i),Z(r)*j(i),j(r)]))},spc:function(n,t){var r,i=this,o=i[B],u="sp"==o[0]?_(o[2]):_(n[2])
1==u&&(r=K[I](i[H],[_(o[3]),_(o[4]),_(o[5])],[_(o[6]),_(o[7]),_(o[8])],[_(n[3]),_(n[4]),_(n[5])]),t[d](r),i[B][0]=n[0],i[B][e](3,6,r.v4.e(1),r.v4.e(2),r.v4.e(3),r.v3.e(1),r.v3.e(2),r.v3.e(3))),3==u&&(r=K[I](i[H],[_(o[3]),_(o[4]),_(o[5])],[_(o[6]),_(o[7]),_(o[8])],[_(n[3]),_(n[4]),_(n[5])],[_(n[6]),_(n[7]),_(n[8])]),t[d](r),i[B][0]=n[0],i[B][e](3,6,r.v4.e(1),r.v4.e(2),r.v4.e(3),r.v3.e(1),r.v3.e(2),r.v3.e(3))),2==u&&(r=J[I](i[H],[_(o[3]),_(o[4]),_(o[5])],[_(o[6]),_(o[7]),_(o[8])],[_(n[3]),_(n[4]),_(n[5])]),t[d](r),i[B]=U)},sp:function(n,t){_(n[2])?this[B]=n:this.sp0(n,t)},sc:function(n,t){var r=this
r[B]&&r[B][i]&&("sp"==r[B][0]||"sc"==r[B][0]?r.spc(n,t):"sm"==r[B][0]&&r.smc(n,t))},sm:function(n){this[B]=n},smc:function(n,t){var r,i,e,o,u,v=this[B],c=_(v[1],1),f=_(v[2],1),x=$V([_(v[3]),_(v[4]),_(v[5])]),s=$V([_(v[6]),_(v[7]),_(v[8])]),a=$V([_(n[3]),_(n[4]),_(n[5])]),g=x[R](s).x(1/c),h=a[R](s).x(1/f)
for(o=0;o!=c;++o)for(i=s[C](g.x(o)),e=i[C](h),r=i[C](g),u=0;u!=f;++u)t[d](K[I](this[H],r,i,e)),i=e,r=i[C](g),e=i[C](h)},ex:function(n,t){var r,e,o=_(n[1]),u=_(n[2]),v=_(n[3]),c=t[i]
if(-1!==[0,5,6].indexOf(o)){for(r=0;r!=c;++r)if(N in t[r]&&(!u||t[r][N]===u)){if(v<=t[r][z])break
v-=t[r][z]}r!=c&&(e=t[r],e=e.s[C](e.e[R](e.s).x((v-(5!=o?.5:1))/e[z])),t[d](k[I]("#f0f",-1,-1,[0],e,e)))}}}},tt=function(n){var t,r,e=[],u=n[i],v=nt()
for(t=0;t!=u;++t)r=n[t][o](","),r[i]&&r[0]in v&&v[r[0]](r,e)
return e},rt=function(n){var t,r=[".html#",".html?",/%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,"",/%20/g,"",/%5B;/g,"[",/%5D;/g,"]",/&#38;/g,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,"",/&#32;/g,"",/&#91;/g,"[",/&#93;/g,"]",/"/g,"",/'/g,"",/ /g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&"],e=r[i]
for(t=0;t!=e;t+=2)n=n[l](r[t],r[t+1])
return n},it=v||rt(decodeURI(""+window.location)),et=it[o](/[?&]/),ot=t||n.getClientWidth(),ut=r||n.getClientHeight(),vt=[],ct=[]
try{for(c=1;c<et[i];++c){if(f=et[c][p]("message="),-1!=f)return T[O](W)[L]=et[c][w](f+8),void 0
f=et[c][p](W+"="),-1==f?(f=et[c][p]("conf="),-1==f||(f=et[c][w](f+5)[o](","),1==f[i]?vt[d]([f[0],[]]):vt[d]([f[0],Number(f[1][w](1))]))):ct[d](tt(this.decompress(et[c][w](f+9)[l](/\[\[|\]\]/g,""))[$]()[o](/,(?=[a-z][a-z],|[a-z][a-z]$)/g)))}}catch(ft){return T[O](W)[L]=ft,void 0}ct=new n.AntennaGeometry(W,X(ot-10,0),X(ut-10,0),ct[0],vt[i]?vt:0,vt[i]?"Configuration":0)},n}(NecViewer||{})