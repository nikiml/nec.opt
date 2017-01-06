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
return!1})}()
