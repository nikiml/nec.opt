var NecViewer=function(n){var r,e="innerHTML",t="getElementsByTagName",i=document,o="pre",a=i[t](o),u="createElement",c="style",f="cssText",s="appendChild",g="div",p="textarea",l="parentNode",m="firstChild",d="none",v="block",h="display",$="length",y="call",w="apply",x="push",E=Math,j="toLowerCase",_="match",S="substr",b="split",N="replace",B="search",C="previousSibling",I="value",G="insertBefore",M="src",O="testPreElement",P="modifyDoc",Y="extractNecGeometry",k="100%",q=1e5,z="compress",T="slice",L="splice",R=void 0,V=["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],D=["W","f","o","i","l","K","I","J","w","A ","","H","T","R","S","X","P","p","M","E","C"],F=function(){var n,r={}
for(n=0;n!=V[$];++n)r[V[n]]=D[n]
return r}()
if(n[z]=n[z]||function(n){var r=function(){var n="000",r=n,e=R,t=function(n){var r=e
return e=n[T](),r},i=function(n,r,e,t){t+=e
for(var i=e;i!=t;++i)n[i]==r[i]&&(n[i]="")},o=function(n,r){for(var e=6;9!=e;++e)""!==n[e]&&(""!==n[e-3]&&n[e]==n[e-3]||""===n[e-3]&&n[e]==r[e-3])&&(n[e]="+"),""!==n[e]&&(""!==n[e-3]&&n[e]==-n[e-3]||""===n[e-3]&&n[e]==-r[e-3])&&(n[e]="-")}
return{cl:function(e){var t=e[1]||n
return t==r?[]:(r=t,e[0]=F[e[0]],t==n?[e[0]]:e)},gw:function(n){var r=t(n)
return n[0]=F[n[0]],r?(n[9]==r[9]&&(n=n[T](0,9)),i(n,r,1,2),n[3]==r[3]&&n[4]==r[4]&&n[5]==r[5]?(n[0]=F.g1,i(n,r,6,3),o(n,r,6,3,3),n[L](3,3),n):n[3]==r[6]&&n[4]==r[7]&&n[5]==r[8]?(n[0]=F.g3,i(n,r,6,3),o(n,r,6,3,3),n[L](3,3),n):n[6]==r[3]&&n[7]==r[4]&&n[8]==r[5]?(n[0]=F.g2,i(n,r,3,3),n[L](6,3),n):n[6]==r[6]&&n[7]==r[7]&&n[8]==r[8]?(n[0]=F.g4,i(n,r,3,3),n[L](6,3),n):n[6]==n[3]&&n[7]==n[4]?(n[0]=F.g5,i(n,r,3,3),i(n,r,8,1),n[L](6,2),n):n[7]==n[4]&&n[8]==n[5]?(n[0]=F.g6,i(n,r,3,4),n[L](7,2),n):n[6]==n[3]&&n[8]==n[5]?(n[0]=F.g7,i(n,r,3,2),i(n,r,7,2),n[L](5,2),n):(i(n,r,3,6),o(n,r,6,3,3),n)):(o(n,r),n)},general:function(n){for(var r=1;r!=n[$];++r)"0"==n[r]&&(n[r]="")
return n[0]=F[n[0]],n},gs:function(n){return n[L](1,2),n[0]=F[n[0]],n},ex:function(n){return n[0]=F[n[0]],n[T](0,4)},ge:function(){return[]}}},e=r(),t=""
return n=n[N](/(,-)0[.]/g,"$1.")[b](/,(?=[a-z][a-z],|[a-z][a-z]$)/gi),n.forEach(function(n){n=n[j](),n&&(n=n[b](","),n=n[0]in e?e[n[0]](n):e.general(n),n[$]&&(t+=n.join(",")+","))}),t},n[O]=n[O]||function(n){return n[e].match(/^[\s\r\n]*(CM|CE|GW|SY)\s[\s\S]*\n(GE)/i)},n[Y]=n[Y]||function(n){var r,e,t,i,o=function(n){return n*E.PI/180},a=function(n){return 180*n/E.PI},u="http://clients.teksavvy.com/~nickm/viewer/_g2.html",c="",f=u+"#message=",s=f+"failed_to_",g=E.round,p=q,l=function(n){return g(n*p)/p},m=function(n){var r=q*n
for(r=g(E.log(r)/E.log(10)),p=E.pow(10,r);g(n*p)!=n*p;)p*=10},d=function(n,r){return function(e){return n(r(e))}},v=function(n){return RegExp("([^\\w\\.]|^)(((0?|[1-9][0-9]*).[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?)"+n+"\\b")},h={sin:d(E.sin,o),cos:d(E.cos,o),tan:d(E.tan,o),atn:d(a,E.atan),atan2:function(n,r){return a(E.atan2(n,r))},min:E.min,max:E.max,"int":g,abs:E.abs,sqr:E.sqrt,sqrt:E.sqrt,log:E.log,exp:E.exp,pow:E.pow,log10:function(n){return E.log(n)/E.log(10)},sgn:function(n){return 0>n?-1:1},mod:function(n,r){return n%r},pi:E.PI,cm:.01,mm:.001,m:1,"in":.0254,ft:.0254*12,pf:1e-12,nf:1e-9,uf:1e-6,nh:1e-12,uh:1e-9},C=/\s+/g,I=Function("return this")(),G=function(n,r){for(var e=0;e!=n[$];++e)e in n&&(G.i=e,r(n[e],e))},M=function(n,r,e,t){for(var i=r;i!=n[$]&&e;++i)--e,i in n&&(M.i=i,t(n[i],i))},O=function(){var n=[]
return G(["cm","mm","m","in","ft","pf","nf","uf","nf","uf"],function(r){n[x](v(r))}),n}(),P=["$1$2*.01","$1$2*1e-3","$1$2","$1$2*.0254","$1$2*.0254*12","$1$2*1e-12","$1$2*1e-9","$1$2*1e-6","$1$2*1e-9","$1$2*1e-6"],Y=function(n){for(var r=0;r!=O[$];++r)n=n[N](O[r],P[r],"g")
return n},k=function(n){throw n},T=function(n){return-1!==n.indexOf("^")&&k("exponent_operator^_not supported"),n},L=Function,V=function(n,r){return"Identifier"!==n.type&&k("invalid identifier: "+r),n.name},D=function(n,r,e){var t,i,o=function(){k("invalid expression: "+e)}
if("Identifier"===n.type)return n.name in r||o(),r[n.name]
if("Literal"===n.type)return n.value
if("CallExpression"===n.type)return t=n.arguments.map(function(n){return D(n,r,e)}),D(n.callee,r,e)[w](0,t)
if("UnaryExpression"===n.type){if(t=D(n.argument,r,e),"-"===n.operator)return-t
if("+"!==n.operator)return t
o()}if("BinaryExpression"===n.type){if(t=D(n.left,r,e),i=D(n.right,r,e),"-"===n.operator)return t-i
if("+"===n.operator)return t+i
if("*"===n.operator)return t*i
if("/"===n.operator)return t/i
if("^"===n.operator||"**"===n.operator)return E.pow(t,i)
o()}return o(),R},F=function(n){if(jsep){jsep.addBinaryOp("^",11),jsep.addBinaryOp("**",11)
var r,e,t=n[b](/=/g)
return 2!=t.length&&k("invalid SY "+n),r=V(jsep(t[0]),t[0]),r in h&&h[r]!=R&&k("Duplicate variable definition: SY "+r),e=D(jsep(t[1]),h,t[1]),h[r]=e,e}return new L("with(this){ this."+T(n)+";}")[y](h)},H=function(n){return jsep?(jsep.addBinaryOp("^",11),jsep.addBinaryOp("**",11),D(jsep(n),h,n)):new L("with(this){ return "+T(n)+";}")[y](h)},U=d(H,Y),W=d(g,U),A=function(n){var r,e,t=/,\s*\w+\s*=/
if(0===n.search(/\s*\w+\s*=/))for(;n;)r=n[B](t),e=-1===r?n:n[S](0,r),n=-1===r?"":n[S](r+1),1===e[_](/=/g)[$]&&(F(Y(e)),e=e[b](/=/g)[0][N](/\s*/,"","g"),e in h&&(O[x](v(e)),P[x]("$1$2*"+h[e])))},J={gw:[2,7,1],gc:[2,3,0],ga:[2,4,1],ge:[0,0,0],gh:[2,7,1],gm:[2,7,0],gr:[2,0,0],gs:[2,1,0],gx:[2,0,0,function(n,r){return 2==r?n:W(n)}],sp:[2,6,1],sc:[2,6,0],sm:[2,6,1],ex:[4,6,0]},K=function(n,r,e){var t=""
if(n){n[2]&&(e=e[N](/^\s+|\s+$|#/g,"")[b](C),t+=1!==e[$]||""===e[0]?"":",cl,"+e[0])
var i=n[3]||W,o=n[4]||d(l,U)
r=r[b](C),t+=","+r[0],M(r,1,n[0],function(n,r){t+=","+i(n,r)}),M(r,1+n[0],n[1],function(n,r){t+=","+o(n,r)})}return t}
h.atan=h.atn,G([8.2525,7.3482,6.543,5.8268,5.1892,4.6203,4.1148,3.6652,3.2639,2.9058,2.5883,2.3038,2.0523,1.8288,1.6281,1.4503,1.2903,1.1506,1.0236,.9119,.8128],function(n,r){h["$"+r]=5e-4*n})
for(e in I)e in h||e!==e[j]()||(h[e]=R)
if(n=n.replace(/\r/g,""),r=n[_](/^(SY|sy)\s[^\'\n]*/gm))try{G(r,function(n){A(n[S](3)[N]("#","$$","g")[j]())})}catch(X){return s+"parse_SY_card_"+r[G.i]+"("+X+")"}if(r=n[_](/^(GS|gs)\s[^\'\n]*/gm))try{G(r,function(n){m(U(n[b](C)[3][j]()))})}catch(X){return s+"parse_GS_card_"+r[G.i]+"("+X+")"}for(r=n[b]("\n"),e=0;e!=r[$];++e)try{t=r[e][b]("'"),t[$]&&(i=t[$]>1?t[1]:"",r[e]=t[0][j]()[N](/^\s+/,"")[N](/\s+$/,""),t=r[e][S](0,2),c+=K(J[t],r[e],i))}catch(X){return encodeURI(f+X)}return u+"#geometry="+this[z](c)},n.showNec=function(n,r){var e=n[l][l][t](o)[0],i=e[C],a=i[C]
return e[c][h]=0===r?v:d,a[c][h]=1===r?v:d,i[c][h]=2===r?v:d,1!==r||a[m][M]&&a.code==i[I]||(a[m][M]=this[Y](a.code=i[I])),!1},n[P]=n[P]||function(n){var r,o=n[l],a=o[t](g)[0],m=i[u](g),v=i[u](p),$='<a href="javascript:void(0);" onclick="return NecViewer.showNec(this,',y="</a>"
a[e]=$+'0);">'+a[e]+y+"|"+$+'1);">Model:'+y+"|"+$+'2);">Edit:'+y,m[c][f]=n[c][f],m[c].display=d,v[c][f]=n[c][f]+"; font-family:monospace",v[c][h]=d,v[I]=n[e],o[G](m,n),o[G](v,n),r=i[u]("iframe"),r[c].height=k,r[c].width=k,m[s](r)},!n.embeded)for(r=0;r!=a[$];++r)n[O](a[r])&&n[P](a[r])
return n}(NecViewer||{})