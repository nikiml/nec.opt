/*version 1.6*/

!function(){var n=Array.prototype,t="minIndex",r="maxIndex",i="indexOf",e="length",o="maxValue",u="minValue",c="forEach",f="map",a="some",s="every",v=Math,l="function",x=function(n,t){if(null==n)throw new TypeError("this is null or not defined")
if(typeof t!==l)throw new TypeError(t+"is not a function")
return n}
n[i]||(n[i]=function(n){var t=this,r=t[e],i=Number(arguments[1])||0
for(i=0>i?v.ceil(i):v.floor(i),0>i&&(i+=r);r>i;i++)if(i in t&&t[i]===n)return i
return-1}),n[r]||(n[r]=function(){var n=this,t=0,r=n[e],i=1
if(!r)return-1
for(;r>i;++i)n[t]<n[i]&&(t=i)
return t}),n[t]||(n[t]=function(){var n=this,t=0,r=n[e],i=1
if(!r)return-1
for(;r>i;++i)n[t]>n[i]&&(t=i)
return t}),n[o]||(n[o]=function(){var n=this
return n[e]?n[n[r]()]:void 0}),n[u]||(n[u]=function(){var n=this
return n[e]?n[n[t]()]:void 0}),n[c]||(n[c]=function(n,t){"use strict"
var r,i,o=x(this,n),u=Object(o),c=u[e]>>>0
for(r=0;c>r;)r in u&&(i=u[r],n.call(t,i,r,u)),r++}),n[f]||(n[f]=function(n,t){var r,i,o=x(this,n),u=Object(o),c=u[e]>>>0
for(r=Array(c),i=0;c>i;){var f,a
i in u&&(f=u[i],a=n.call(t,f,i,u),r[i]=a),i++}return r}),n[s]||(n[s]=function(n,t){"use strict"
var r,i=x(this,n),o=Object(i),u=o[e]>>>0
for(r=0;u>r;r++)if(r in o&&!n.call(t,o[r],r,o))return!1
return!0}),n[a]||(n[a]=function(n,t){"use strict"
var r,i=x(this,n),o=Object(i),u=o[e]>>>0
for(r=0;u>r;r++)if(r in o&&n.call(t,o[r],r,o))return!0
return!1})}();

/* jsep v0.2.7 (http://jsep.from.so/) JSEP may be freely distributed under the MIT License*/
!function(r){"use strict"
var n="Compound",e="Identifier",t="MemberExpression",i="Literal",o="ThisExpression",a="CallExpression",u="UnaryExpression",c="BinaryExpression",f="LogicalExpression",s=!0,p={"-":s,"!":s,"~":s,"+":s},g={"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"===":6,"!==":6,"<":7,">":7,"<=":7,">=":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":10,"/":10,"%":10},h=function(r){var n,e=0
for(var t in r)(n=t.length)>e&&r.hasOwnProperty(t)&&(e=n)
return e},l=h(p),v=h(g),d={"true":!0,"false":!1,"null":null},x="this",m=function(r){return g[r]||0},y=function(r,n,e){var t="||"===r||"&&"===r?f:c
return{type:t,operator:r,left:n,right:e}},w=function(r){return r>=48&&57>=r},$=function(r){return 36===r||95===r||r>=65&&90>=r||r>=97&&122>=r},E=function(r){return 36===r||95===r||r>=65&&90>=r||r>=97&&122>=r||r>=48&&57>=r},b=function(r){for(var c,f,s=0,h=r.length,b=function(){for(var n=r.charCodeAt(s);32===n||9===n;)n=r.charCodeAt(++s)},C=function(){b()
for(var n=r.substr(s,v),e=n.length;e>0;){if(g.hasOwnProperty(n))return s+=e,n
n=n.substr(0,--e)}return!1},A=function(){var r,n,e,t,i,o,a,u
if(o=j(),n=C(),!n)return o
if(i={value:n,prec:m(n)},a=j(),!a)throw Error("Expected expression after "+n+" at character "+s)
for(t=[o,i,a];(n=C())&&(e=m(n),0!==e);){for(i={value:n,prec:e};t.length>2&&e<=t[t.length-2].prec;)a=t.pop(),n=t.pop().value,o=t.pop(),r=y(n,o,a),t.push(r)
if(r=j(),!r)throw Error("Expected expression after "+n+" at character "+s)
t.push(i),t.push(r)}for(u=t.length-1,r=t[u];u>1;)r=y(t[u-1].value,t[u-2],r),u-=2
return r},j=function(){var n,e,t
if(b(),n=r.charCodeAt(s),w(n)||46===n)return I()
if(39===n||34===n)return V()
if($(n))return _()
if(40===n)return O()
for(e=r.substr(s,l),t=e.length;t>0;){if(p.hasOwnProperty(e))return s+=t,{type:u,operator:e,argument:j(),prefix:!0}
e=e.substr(0,--t)}return!1},I=function(){for(var n="";w(r.charCodeAt(s));)n+=r.charAt(s++)
if("."===r.charAt(s))for(n+=r.charAt(s++);w(r.charCodeAt(s));)n+=r.charAt(s++)
if("e"===r.charAt(s)||"E"===r.charAt(s)){for(n+=r.charAt(s++),("+"===r.charAt(s)||"-"===r.charAt(s))&&(n+=r.charAt(s++));w(r.charCodeAt(s));)n+=r.charAt(s++)
if(!w(r.charCodeAt(s-1)))throw Error("Expected exponent ("+n+r.charAt(s)+") at character "+s)}if($(r.charCodeAt(s)))throw Error("Variable names cannot start with a number ("+n+r.charAt(s)+") at character "+s)
return{type:i,value:parseFloat(n),raw:n}},V=function(){for(var n,e="",t=r.charAt(s++),o=!1;h>s;){if(n=r(s++),n===t){o=!0
break}if("\\"===n)switch(n=r.charAt(s++)){case"n":e+="\n"
break
case"r":e+="\r"
break
case"t":e+="	"
break
case"b":e+="\b"
break
case"f":e+="\f"
break
case"v":e+=""}else e+=n}if(!o)throw Error('Unclosed quote after "'+e+'"')
return{type:i,value:e,raw:t+e+t}},S=function(){var n,t=r.charCodeAt(s),a=s
for($(t)&&s++;h>s&&(t=r.charCodeAt(s),E(t));)s++
return n=r.slice(a,s),d.hasOwnProperty(n)?{type:i,value:d[n],raw:n}:n===x?{type:o}:{type:e,name:n}},P=function(){for(var e,t,i=[];h>s;){if(b(),e=r.charAt(s),")"===e){s++
break}if(","===e)s++
else{if(t=A(),!t||t.type===n)throw Error("Expected comma at character "+s)
i.push(t)}}return i},_=function(){var n,e,i
for(e=S(),b(),n=r.charAt(s);"."===n||"["===n||"("===n;){if("."===n)s++,b(),e={type:t,computed:!1,object:e,property:S()}
else if("["===n){if(i=s,s++,e={type:t,computed:!0,object:e,property:A()},b(),n=r.charAt(s),"]"!==n)throw Error("Unclosed [ at character "+s)
s++,b()}else"("===n&&(s++,e={type:a,arguments:P(),callee:e})
b(),n=r.charAt(s)}return e},O=function(){s++
var n=A()
if(b(),")"===r.charAt(s))return s++,n
throw Error("Unclosed ( at character "+s)},B=[];h>s;)if(c=r.charAt(s),";"===c||","===c)s++
else if(f=A())B.push(f)
else if(h>s)throw Error("Unexpected '"+r.charAt(s)+"' at character "+s)
return 1===B.length?B[0]:{type:n,body:B}}
if(b.version="0.2.7",b.toString=function(){return"JavaScript Expression Parser (JSEP) v"+b.version},b.addUnaryOp=function(r){return p[r]=s,this},b.addBinaryOp=function(r,n){return v=Math.max(r.length,v),g[r]=n,this},b.removeUnaryOp=function(r){return delete p[r],r.length===l&&(l=h(p)),this},b.removeBinaryOp=function(r){return delete g[r],r.length===v&&(v=h(g)),this},"undefined"==typeof exports){var C=r.jsep
r.jsep=b,b.noConflict=function(){return r.jsep===b&&(r.jsep=C),b}}else"undefined"!=typeof module&&module.exports?exports=module.exports=b:exports.parse=b}(this);

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
return t=t[C](/(,-)0[.]/g,"$1.")[_](/,(?=[a-z][a-z],|[a-z][a-z]$)/gi),t.forEach(function(t){t=t[b](),t&&(t=t[_](","),t=t[0]in r?r[t[0]](t):r.general(t),t[v]&&(n+=t.join(",")+","))}),n},t[L]=t[L]||function(t){return t[r].match(/^[\s\r\n]*(CM|CE|GW|SY)\s[\s\S]*\n(GE)/i)},t[E]=t[E]||function(t,e){var r,n,i,o,s=function(t){return t*w.PI/180},a=function(t){return 180*t/w.PI},l="http://clients.teksavvy.com/~nickm/viewer/_g2.html#",h="",c=l+"message=",u=c+"failed_to_",f=w.round,d=T,p=function(t){return f(t*d)/d},x=function(t){var e=T*t
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