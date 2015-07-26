var hpViewer=function(t,n,e){var r,a,i,g,h,u="replace",o="length",c="split",f="indexOf",p="substr",l=Math.min,s=Math.round,d="push",m=t||getClientWidth(),v=n||getClientHeight(),N=function(t){throw t},w=function(t){var n,e,r=t[c](","),a=[]
for(n=0;n!=r[o];++n)e=+r[n],isNaN(e)&&N("Invalid geometry token "+r[n]),a.push(e)
return a},A=function(t){var n,e=[".html#",".html?",/%26/g,"&",/%23/g,"",/%22/g,"",/%27/g,"",/%20/g," ",/%5B;/g,"[",/%5D;/g,"]",/&#38;/g,"&",/&#35;/g,"",/&#39;/g,"",/&#34;/g,"",/&#32;/g," ",/&#91;/g,"[",/&#93;/g,"]",/"/g,"",/'/g,"",/#/g,"",/"/g,"",/&quot;/g,"",/&amp;/g,"&",/\[/g,"",/\]/g,""],r=e[o]
for(n=0;n!=r;n+=2)t=t[u](e[n],e[n+1])
return t},M=e||A(decodeURI(""+window.location)),y=M[c](/[?#&]/),b=function(t){var n,e=[]
for(n=0;n!=t[2];++n)e.push(t[0]+n*t[1])
return e},k=[],C=function(t){var n=0,e=function(t){return t.charCodeAt()}
return t=e(t),t>=e("0")&&t<=e("9")?n+=t-e("0"):(n+=10,t>=e("a")&&t<=e("z")?n+=t-e("a"):(n+=26,t>=e("A")&&t<=e("Z")?n+=t-e("A"):(n+=26,t==e("_")?n:n+1)))},H=function(t,n){return C(t)+C(n)/64},I=function(t,n,e){var r,a,i=e.length,g=[],h=[]
for(r=0;r!=i;++r)if(h.length==n&&(g.push(h),h=[]),"+"!=e.charAt(r)){if(++r,r==i)break
a=t-H(e.charAt(r-1),e.charAt(r)),h.push(s(100*a)/100)}else h.push(t-64)
return h.length&&g.push(h),g},q=function(t,n,e,r,a,i){var g,h,u=+t[0],o=+t[1],c=+t[2],f=t[3];(isNaN(u)||isNaN(o)||isNaN(c))&&N("Invalid number token in hpmeta"),g=I(u,o,n),h=new AntennaHPattern(r,l(i,a),e.map(function(t){return t+"MHz"}),[g],c,[f],[["#000","#ccc"]]),h.draw()}
for(i=1;i<y[o];++i)if(r=y[i][f]("hpmeta="),-1==r)if(y[i]=y[i][u](/ /g,""),r=y[i][f]("sweep="),-1==r)if(r=y[i][f]("freqs="),-1==r)r=y[i][f]("hpdata="),-1==r||(h=y[i][p](r+7))
else{a=y[i][p](r+6)
try{k[d].apply(k,w(a))}catch(z){N(z+" in "+y[i])}}else{a=y[i][p](r+6)
try{k[d].apply(k,b(w(a)))}catch(z){N(z+" in "+y[i])}}else g=y[i][p](r+7).split(",")
q(g,h,k,"pattern",m-30,v-30)}