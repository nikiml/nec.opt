var NecViewer=function(t){var e,r="innerHTML",n="getElementsByTagName",i=document,o="pre",s=i[n](o),a="createElement",l="style",h="cssText",c="appendChild",u="div",f="textarea",d="parentNode",p="firstChild",x="none",g="block",m="display",v="length",k="call",y="apply",M="push",w=Math,b="toLowerCase",$="match",z="substr",_="split",C="replace",V="search",B="previousSibling",W="value",S="insertBefore",I="src",L="testPreElement",A="modifyDoc",E="extractNecGeometry",H="100%",T=1e5,O="compress",R="slice",j="splice",F=void 0,N=["gw","g1","g2","g3","g4","g5","g6","g7","gc","ga","ge","gh","gm","gr","gs","gx","sp","sc","sm","ex","cl"],P=["W","f","o","i","l","K","I","J","w","A ","","H","T","R","S","X","P","p","M","E","C"],q=function(){var t,e={}
for(t=0;t!=N[v];++t)e[N[t]]=P[t]
return e}()
if(t[O]=t[O]||function(t){var e=function(){var t="000",e=t,r=F,n=function(t){var e=r
return r=t[R](),e},i=function(t,e,r,n){n+=r
for(var i=r;i!=n;++i)t[i]==e[i]&&(t[i]="")},o=function(t,e){for(var r=6;9!=r;++r)""!==t[r]&&(""!==t[r-3]&&t[r]==t[r-3]||""===t[r-3]&&t[r]==e[r-3])&&(t[r]="+"),""!==t[r]&&(""!==t[r-3]&&t[r]==-t[r-3]||""===t[r-3]&&t[r]==-e[r-3])&&(t[r]="-")}
return{cl:function(r){var n=r[1]||t
return n==e?[]:(e=n,r[0]=q[r[0]],n==t?[r[0]]:r)},gw:function(t){var e=n(t)
return t[0]=q[t[0]],e?(t[9]==e[9]&&(t=t[R](0,9)),i(t,e,1,2),t[3]==e[3]&&t[4]==e[4]&&t[5]==e[5]?(t[0]=q.g1,i(t,e,6,3),o(t,e,6,3,3),t[j](3,3),t):t[3]==e[6]&&t[4]==e[7]&&t[5]==e[8]?(t[0]=q.g3,i(t,e,6,3),o(t,e,6,3,3),t[j](3,3),t):t[6]==e[3]&&t[7]==e[4]&&t[8]==e[5]?(t[0]=q.g2,i(t,e,3,3),t[j](6,3),t):t[6]==e[6]&&t[7]==e[7]&&t[8]==e[8]?(t[0]=q.g4,i(t,e,3,3),t[j](6,3),t):t[6]==t[3]&&t[7]==t[4]?(t[0]=q.g5,i(t,e,3,3),i(t,e,8,1),t[j](6,2),t):t[7]==t[4]&&t[8]==t[5]?(t[0]=q.g6,i(t,e,3,4),t[j](7,2),t):t[6]==t[3]&&t[8]==t[5]?(t[0]=q.g7,i(t,e,3,2),i(t,e,7,2),t[j](5,2),t):(i(t,e,3,6),o(t,e,6,3,3),t)):(o(t,e),t)},general:function(t){for(var e=1;e!=t[v];++e)"0"==t[e]&&(t[e]="")
return t[0]=q[t[0]],t},gs:function(t){return t[j](1,2),t[0]=q[t[0]],t},ex:function(t){return t[0]=q[t[0]],t[R](0,4)},ge:function(){return[]}}},r=e(),n=""
return t=t[C](/(,-)0[.]/g,"$1.")[_](/,(?=[a-z][a-z],|[a-z][a-z]$)/gi),t.forEach(function(t){t=t[b](),t&&(t=t[_](","),t=t[0]in r?r[t[0]](t):r.general(t),t[v]&&(n+=t.join(",")+","))}),n},t[L]=t[L]||function(t){return t[r].match(/^[\s\r\n]*(CM|CE|GW|SY)\s[\s\S]*\n(GE)/i)},t[E]=t[E]||function(t,e){var r,n,i,o,s=function(t){return t*w.PI/180},a=function(t){return 180*t/w.PI},l="http://mladenov.ca/~nickm/viewer/g2.html#",h="",c=l+"message=",u=c+"failed_to_",f=w.round,d=T,p=function(t){return f(t*d)/d},x=function(t){var e=T*t
for(e=f(w.log(e)/w.log(10)),d=w.pow(10,e);f(t*d)!=t*d;)d*=10},g=function(t,e){return function(r){return t(e(r))}},m=function(t){return RegExp("([^\\w\\.]|^)(((0?|[1-9][0-9]*).[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?)"+t+"\\b")},B={sin:g(w.sin,s),cos:g(w.cos,s),tan:g(w.tan,s),atn:g(a,w.atan),atan2:function(t,e){return a(w.atan2(t,e))},min:w.min,max:w.max,"int":f,abs:w.abs,sqr:w.sqrt,sqrt:w.sqrt,log:w.log,exp:w.exp,pow:w.pow,log10:function(t){return w.log(t)/w.log(10)},sgn:function(t){return 0>t?-1:1},mod:function(t,e){return t%e},pi:w.PI,cm:.01,mm:.001,m:1,"in":.0254,ft:.0254*12,pf:1e-12,nf:1e-9,uf:1e-6,nh:1e-12,uh:1e-9},W=/\s+/g,S=Function("return this")(),I=function(t,e){for(var r=0;r!=t[v];++r)r in t&&(I.i=r,e(t[r],r))},L=function(t,e,r,n){for(var i=e;i!=t[v]&&r;++i)--r,i in t&&(L.i=i,n(t[i],i))},A=function(){var t=[]
return I(["cm","mm","m","in","ft","pf","nf","uf","nf","uf"],function(e){t[M](m(e))}),t}(),E=["$1$2*.01","$1$2*1e-3","$1$2","$1$2*.0254","$1$2*.0254*12","$1$2*1e-12","$1$2*1e-9","$1$2*1e-6","$1$2*1e-9","$1$2*1e-6"],H=function(t){for(var e=0;e!=A[v];++e)t=t[C](A[e],E[e],"g")
return t},R=function(t){throw t},j=function(t){return-1!==t.indexOf("^")&&R("exponent_operator^_not supported"),t},N=Function,P=function(t,e){return"Identifier"!==t.type&&R("invalid identifier: "+e),t.name},q=function(t,e,r){var n,i,o=function(){R("invalid expression: "+r)}
if("Identifier"===t.type)return t.name in e||o(),e[t.name]
if("Literal"===t.type)return t.value
if("CallExpression"===t.type)return n=t.arguments.map(function(t){return q(t,e,r)}),q(t.callee,e,r)[y](0,n)
if("UnaryExpression"===t.type){if(n=q(t.argument,e,r),"-"===t.operator)return-n
if("+"===t.operator)return n
o()}if("BinaryExpression"===t.type){if(n=q(t.left,e,r),i=q(t.right,e,r),"-"===t.operator)return n-i
if("+"===t.operator)return n+i
if("*"===t.operator)return n*i
if("/"===t.operator)return n/i
if("^"===t.operator||"**"===t.operator)return w.pow(n,i)
o()}return o(),F},Y=function(t){if(jsep){jsep.addBinaryOp("^",11),jsep.addBinaryOp("**",11)
var e,r,n=t[_](/=/g)
return 2!=n.length&&R("invalid SY "+t),e=P(jsep(n[0]),n[0]),e in B&&B[e]!=F&&R("Duplicate variable definition: SY "+e),r=q(jsep(n[1]),B,n[1]),B[e]=r,r}return new N("with(this){ this."+j(t)+";}")[k](B)},X=function(t){return jsep?(jsep.addBinaryOp("^",11),jsep.addBinaryOp("**",11),q(jsep(t),B,t)):new N("with(this){ return "+j(t)+";}")[k](B)},Z=g(X,H),G=g(f,Z),D=function(t){var e,r,n=/,\s*\w+\s*=/
if(0===t.search(/\s*\w+\s*=/))for(;t;)e=t[V](n),r=-1===e?t:t[z](0,e),t=-1===e?"":t[z](e+1),1===r[$](/=/g)[v]&&(Y(H(r)),r=r[_](/=/g)[0][C](/\s*/,"","g"),r in B&&(A[M](m(r)),E[M]("$1$2*"+B[r])))},U={gw:[2,7,1],gc:[2,3,0],ga:[2,4,1],ge:[0,0,0],gh:[2,7,1],gm:[2,7,0],gr:[2,0,0],gs:[2,1,0],gx:[2,0,0,function(t,e){return 2==e?t:G(t)}],sp:[2,6,1],sc:[2,6,0],sm:[2,6,1],ex:[4,6,0]},J=function(t,e,r){var n=""
if(t){t[2]&&(r=r[C](/^\s+|\s+$|#/g,"")[_](W),n+=1!==r[v]||""===r[0]?"":",cl,"+r[0])
var i=t[3]||G,o=t[4]||g(p,Z)
e=e[_](W),n+=","+e[0],L(e,1,t[0],function(t,e){n+=","+i(t,e)}),L(e,1+t[0],t[1],function(t,e){n+=","+o(t,e)})}return n}
B.atan=B.atn,I([8.2525,7.3482,6.543,5.8268,5.1892,4.6203,4.1148,3.6652,3.2639,2.9058,2.5883,2.3038,2.0523,1.8288,1.6281,1.4503,1.2903,1.1506,1.0236,.9119,.8128],function(t,e){B["$"+e]=5e-4*t})
for(n in S)n in B||n!==n[b]()||(B[n]=F)
if(t=t.replace(/\r/g,""),r=t[$](/^(SY|sy)\s[^\'\n]*/gm))try{I(r,function(t){D(t[z](3)[C]("#","$$","g")[b]())})}catch(Q){return u+"parse_SY_card_"+r[I.i]+"("+Q+")"}if(r=t[$](/^(GS|gs)\s[^\'\n]*/gm))try{I(r,function(t){x(Z(t[_](W)[3][b]()))})}catch(Q){return u+"parse_GS_card_"+r[I.i]+"("+Q+")"}for(r=t[_]("\n"),n=0;n!=r[v];++n)try{i=r[n][_]("'"),i[v]&&(o=i[v]>1?i[1]:"",r[n]=i[0][b]()[C](/^\s+/,"")[C](/\s+$/,""),i=r[n][z](0,2),h+=J(U[i],r[n],o))}catch(Q){return encodeURI(c+Q)}return void 0!==e&&(l+="name="+e+"&"),l+"geometry="+this[O](h)},t.showNec=function(t,e){var r=t[d][d][n](o)[0],i=r[B],s=i[B]
return r[l][m]=0===e?g:x,s[l][m]=1===e?g:x,i[l][m]=2===e?g:x,1!==e||s[p][I]&&s.code==i[W]||(s[p][I]=this[E](s.code=i[W])),!1},t[A]=t[A]||function(t){var e,o=t[d],s=o[n](u)[0],p=i[a](u),g=i[a](f),v='<a href="javascript:void(0);" onclick="return NecViewer.showNec(this,',k="</a>"
s[r]=v+'0);">'+s[r]+k+"|"+v+'1);">Model:'+k+"|"+v+'2);">Edit:'+k,p[l][h]=t[l][h],p[l].display=x,g[l][h]=t[l][h]+"; font-family:monospace",g[l][m]=x,g[W]=t[r],o[S](p,t),o[S](g,t),e=i[a]("iframe"),e[l].height=H,e[l].width=H,p[c](e)},!t.embeded)for(e=0;e!=s[v];++e)t[L](s[e])&&t[A](s[e])
return t}(NecViewer||{})