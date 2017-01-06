var chartViewer=function(t,n,e){var r,i,a,g="replace",u="length",f="split",o="indexOf",c="substr",l=Math.floor,s=Math.ceil,h=Math.max,m=Math.min,p=Math.round,d="concat",v="push",w="match",y=t||getClientWidth(),G=n||getClientHeight(),R=function(t){throw t},F=function(t){var n,e,r=t[f](","),i=[]
for(n=0;n!=r[u];++n)e=+r[n],isNaN(e)&&R("Invalid geometry token "+r[n]),i.push(e)
return i},N=function(t){var n,e=[".html#",".html?",/%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,"",/%20/g," ",/%5B;/g,"[",/%5D;/g,"]",/&#38;/g,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,"",/&#32;/g," ",/&#91;/g,"[",/&#93;/g,"]",/"/g,"",/'/g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&",/\[/g,"",/\]/g,""],r=e[u]
for(n=0;n!=r;n+=2)t=t[g](e[n],e[n+1])
return t},q=e||N(decodeURI(""+window.location)),A=q[f](/[?#&]/),M="Gain and SWR",S=function(t,n){return{f:t,t:n,mt:[],g:[],s:[],r:[]}},W=function(t){var n,e=[]
for(n=0;n!=t[2];++n)e.push(t[0]+n*t[1])
return e},b=[],x=function(){b[u]||R("sweep or freqs needed before swr")},B=function(t,n){var e,r=0
for(e=0;e!=t[u];++e)r+=t[e]
return p(100*r/t[u])/100+n},C=function(t){t.g.length||R("Gain not found"),t.s[u]&&t.g[u]!=t.s[u]&&R("Gain/SWR length mismatch"),t.r[u]&&t.g[u]!=t.r[u]&&R("Net/Raw Gain length mismatch"),t.mt[u]&&t.g[u]!=t.mt[u]&&R("Gain/Titles length mismatch")
for(var n=0;n!=t.g[u];++n)t.g[n][u]!=t.f[u]&&R("Gain/Frequences length mismatch"),t.s[u]&&t.s[n][u]&&t.s[n][u]!=t.f[u]&&R("SWR/Frequences length mismatch")},H=function(t){if(!t[u])return[]
var n,e=m.apply(null,t[0]),r=h.apply(null,t[0])
for(n=1;n!=t[u];++n)e=m(e,m.apply(null,t[n])),r=h(r,h.apply(null,t[n]))
return[e,r]},I=function(t,n){var e=H(n),r=H(t)
return t[u]?n[u]?[m(e[0],r[0]),h(e[1],r[1])]:r:e},T=function(t){return t&&t[u]?t[1]:"#000"},E=function(t){return t?t[u]>3?t[3]:t[1]:"#444"},k=function(t){return t&&t[u]?t[0]+" net gain":"Net Gain"},D=function(t){return t&&t[u]?t[0]+" raw gain":"Raw Gain"},O=function(t){return t&&t[u]?t[2]:"#888"},U=function(t){return t&&t[u]?t[0]+" swr":"SWR"},V=function(t,n,e,r){C(t)
var i,a=I(t.g,t.r),g=1,f=[],o=[],c=h(t.s[u],t.g[u],t.r[u])
for(i=0;i!=c;++i)t.s[u]>i&&t.s[i][u]&&(g=h(g,h.apply(null,t.s[i])),o.push([U(t.mt[i])+" - ave "+B(t.s[i],0),O(t.mt[i])][d](t.s[i]))),t.g[u]>i&&t.g[i][u]&&f.push([k(t.mt[i])+" - ave "+B(t.g[i],"dBi"),T(t.mt[i])][d](t.g[i])),t.r[u]>i&&t.r[i][u]&&f.push([D(t.mt[i])+" - ave "+B(t.r[i],"dBi"),E(t.mt[i])][d](t.r[i]))
a[0]=l(a[0]),a[1]=s(a[1]),g=s(g),a[0]=a[0]-4-2*(g-1),g=1+(a[1]-a[0])/2,gainSwrChart(n,e,r,t.f,f,o,p(a[0]),p(a[1]),p(10*g)/10,t.t)},j=function(t,n){var e,r,i,a=document,g="createElement",u="style",f="setAttribute",o="appendChild",c=a.getElementById(t),l=a[g]("table")
for(c[o](l),l[u].height=l[u].width="100%",i=0;i!=n;++i)e=a[g]("tr"),l[o](e),r=a[g]("td"),e[o](r),c=a[g]("div"),r[o](c),c[f]("id",t+i)}
for(a=1;a<A[u];++a)if(r=A[a][o]("mtitle="),-1==r)if(r=A[a][o]("title="),-1==r)if(A[a]=A[a][g](/ /g,""),r=A[a][o]("sweep="),-1==r)if(r=A[a][o]("freqs="),-1==r)if(r=A[a][o]("gain="),-1==r)if(r=A[a][o]("raw="),-1==r)if(r=A[a][o]("swr="),-1==r);else{x(),i=A[a][c](r+4)
try{b[b[u]-1].s[v](F(i))}catch(z){R(z+" in "+A[a])}}else{x(),i=A[a][c](r+4)
try{b[b[u]-1].r[v](F(i))}catch(z){R(z+" in "+A[a])}}else{x(),i=A[a][c](r+5)
try{b[b[u]-1].g[v](F(i))}catch(z){R(z+" in "+A[a])}}else{i=A[a][c](r+6)
try{b[v](S(F(i),M))}catch(z){R(z+" in "+A[a])}}else{i=A[a][c](r+6)
try{b[v](S(W(F(i)),M))}catch(z){R(z+" in "+A[a])}}else M=A[a][c](r+6)
else{if(r=A[a][c](r+7)[f](","),r[u]<3)continue
x(),i=r[1][w](/[0-9,a-f,A-F]{6}|[0-9,a-f,A-F]{3}/),r[1]=i&&r[1]==i[0]?"#"+i[0]:colorNameToHex(r[1])||"#000",i=r[2][w](/[0-9,a-f,A-F]{6}|[0-9,a-f,A-F]{3}/),r[2]=i&&r[2]==i[0]?"#"+i[0]:colorNameToHex(r[2])||"#000",b[b[u]-1].mt.push(r)}if(G/=b[u],b[u]>1)for(j("chart",b[u]),a=0;a!=b[u];++a)V(b[a],"chart"+a,y-30,G-30)
else V(b[0],"chart",y-30,G-30)}