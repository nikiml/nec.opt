if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b){var a=this.length,d=Number(arguments[1])||0;d=(d<0)?Math.ceil(d):Math.floor(d);if(d<0){d+=a}for(;d<a;d++){if(d in this&&this[d]===b){return d}}return -1}}if(!Array.prototype.maxIndex){Array.prototype.maxIndex=function(){if(!this.length){return -1}var b=0,a=this.length,d=1;for(;d<a;++d){if(this[b]<this[d]){b=d}}return b}}if(!Array.prototype.minIndex){Array.prototype.minIndex=function(){if(!this.length){return -1}var d=0,a=this.length,b=1;for(;b<a;++b){if(this[d]>this[b]){d=b}}return d}}if(!Array.prototype.maxValue){Array.prototype.maxValue=function(){if(!this.length){return undefined}return this[this.maxIndex()]}}if(!Array.prototype.minValue){Array.prototype.minValue=function(){if(!this.length){return undefined}return this[this.minIndex()]}}function getClientWidth(){return document.compatMode==="CSS1Compat"&&!window.opera?document.documentElement.clientWidth:document.body.clientWidth}function getClientHeight(){return document.compatMode==="CSS1Compat"&&!window.opera?document.documentElement.clientHeight:document.body.clientHeight}function getInternetExplorerVersion(){var d=-1;if(navigator.appName==="Microsoft Internet Explorer"){var a=navigator.userAgent,b=new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");if(b.exec(a)!==null){d=parseFloat(RegExp.$1)}}return d}function r_line(f,b,e,a,d){return f.path("M"+b+" "+e+"L"+a+" "+d)}function radians(a){return Math.PI*a/180}var antennaGeometry=function(ae,W,af,R,m,H,a,I,f,ah){var e=Raphael(ae,W,af),P=Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]]))),p=R,N=H?H:0,s=a?a:0,ab=undefined,aa=undefined,v=undefined,t=undefined,j=I?14:0,D=0,ak=0,S=(getInternetExplorerVersion()!==-1),ai="#fff",al=function(h){return Math.round(h*1000)+"mm"},u=function(h){return Math.round(h*10000)/10},G=function(h){return Math.round(h*10000)/10+"mm"},z=function(h){if(h%2){return[h,16]}h/=2;if(h%2){return[h,8]}h/=2;if(h%2){return[h,4]}h/=2;return[h,2]},r=function(h){var i=h<0?-Math.round(h/0.0015875):Math.round(h/0.0015875);if(i%16!==0){var am=Math.abs(i%16),w=z(am);return(h<0?"-":"")+Math.round(i/16-0.5)+" "+w[0]+"/"+w[1]+" in"}else{return(h<0?"-":"")+Math.round(i/16-0.5)+"in"}},Q=function(am){var h=am<0?-Math.round(am/0.0015875):Math.round(am/0.0015875);if(h%16!==0){var w=Math.abs(h%16),i=z(w);return(am<0?"-":"")+Math.round(h/16-0.5)+" "+i[0]+"/"+i[1]}else{return(am<0?"-":"")+Math.round(h/16-0.5)}},E=function(ar){var am=0,an=[];for(am=0;am!==ar.length;am++){var h=ar[am][0],at=ar[am].slice(1),w;if(at.length%6!==0){alert("Invalid geometry array - length="+at.length)}for(w=0;w!==at.length;w+=6){var au=$V(at.slice(w,w+3)),ap=$V(at.slice(w+3,w+6)),aq=au.subtract(ap),ao=aq.modulus();an.push({color:h,pts:[au,ap],segment_selected:0,sselected:0,eselected:0,len:ao,names:[[al(ao),u(au.e(1))+","+u(au.e(2))+","+u(au.e(3)),u(ap.e(1))+","+u(ap.e(2))+","+u(ap.e(3))],[r(ao),Q(au.e(1))+","+Q(au.e(2))+","+Q(au.e(3)),Q(ap.e(1))+","+Q(ap.e(2))+","+Q(ap.e(3))]]})}}return an},o=E(m),n=[],q=-1,f=f,M=[],ad,b=W/2+N,F=(af+j)/2+s,U=this,k=function(){P=Matrix.RotationX(radians(15)).x(Matrix.RotationY(radians(-60)).x($M([[0,1,0],[0,0,1],[1,0,0]])));b=W/2+N;F=(af+j)/2+s;R=p;U.redraw()},X=function(h,an){if(h===0&&an===0){return}if(D===0){b+=h;F-=an}else{var am=0;if(v<40){am=-an;h=0;an=0}else{if(v>W-40){h=0}else{if(t<j+40){an=0}}}if(h===0&&an===0&&am===0){return}var w=Math.sqrt(h*h+an*an+am*am)*Math.PI/Math.min(W,af),i=Matrix.Rotation(w,$V([-an,h,am]).toUnitVector());P=i.x(P)}U.redraw()},Y="#f00",ac=function(i){var h=this;if(D){h.attr({fill:Y});D=0}else{h.attr({fill:ai});D=1}U.redraw()},K=e.set(),l="stroke-width",C="#b00",Z="#0b0",aj="#00b",ag=function(){var an=P.x(Vector.Zero(3)),ao=P.x(Vector.i),i=an.e(1)*30,am=-an.e(2)*30,h=ao.e(1)*30,w=-ao.e(2)*30,ap="M"+i+" "+am+"L"+h+" "+w;e.path(ap).translate(b,F).attr({stroke:C,stroke_width:1});h=i+(h-i)*1.25;w=am+(w-am)*1.25;e.text(h,w,"X").translate(b,F).attr({stroke:C,stroke_width:1});ao=P.x(Vector.j);h=ao.e(1)*30;w=-ao.e(2)*30;ap="M"+i+" "+am+"L"+h+" "+w;e.path(ap).translate(b,F).attr({stroke:Z,stroke_width:1});h=i+(h-i)*1.25;w=am+(w-am)*1.25;e.text(h,w,"Y").translate(b,F).attr({stroke:Z,stroke_width:1});ao=P.x(Vector.k);h=ao.e(1)*30;w=-ao.e(2)*30;ap="M"+i+" "+am+"L"+h+" "+w;e.path(ap).translate(b,F).attr({stroke:aj,stroke_width:1});h=i+(h-i)*1.25;w=am+(w-am)*1.25;e.text(h,w,"Z").translate(b,F).attr({stroke:aj,stroke_width:1})},L=function(){q=this.i;J();U.redraw()},V=function(){if(!n.length){return}var w=f.length,an,h,ap;for(an=0;an!==n.length;++an){w+=n[an][0].length}var am=Math.min((W-20)/(w+n.length+1),8),ao=(W-am*w)/2-10;e.text(ao+f.length*am/2,j/2,f);ao+=(1+f.length)*am;for(an=0;an!==n.length;++an){if(an===q){e.rect(ao,1,n[an][0].length*am,j-2).attr({fill:"#8ff",stroke:"none"})}else{ap=e.rect(ao,1,n[an][0].length*am,j-2);ap.attr({fill:"#fff",stroke:"none"});ap.mouseover(function(){this.attr({fill:"#ccc"})});ap.mouseout(function(){this.attr({fill:"#fff"})});ap.click(L);ap.i=an}h=e.text(ao+n[an][0].length*am/2,j/2,n[an][0]);if(an!==q){h.i=an;h.click(L);h.rect=ap;h.mouseover(function(){this.rect.attr({fill:"#ccc"});this.attr({"font-weight":"bold"})});h.mouseout(function(){this.rect.attr({fill:"#fff"});this.attr({"font-weight":"normal"})})}ao+=(1+n[an][0].length)*am}},A=function(aq,am){var at=ak?r:G,h=0,az=[],ar,w=[],ax=[],av=[],aw="";if(!aq.length){e.text(W/2,j+7,"Select elements for info. Double click to clear. Total len="+at(am));return}for(ar=0;ar!==aq.length;++ar){var ay=aq[ar],ap=ay[0],an=ay[1],au=ay[2],ao=M[ap][an];if(au===0){az.push(ao.pts[0]);az.push(ao.pts[1]);h+=ao.len}else{az.push(ao.pts[au-1])}}for(ar=0;ar!==az.length;++ar){if(w.indexOf(az[ar].e(1))===-1){w.push(az[ar].e(1))}if(ax.indexOf(az[ar].e(2))===-1){ax.push(az[ar].e(2))}if(av.indexOf(az[ar].e(3))===-1){av.push(az[ar].e(3))}}if(w.length===1){aw+=" x="+at(w[0])}else{if(w.length===2){aw+=" dx="+at(Math.abs(w[0]-w[1]))}}if(ax.length===1){aw+=" y="+at(ax[0])}else{if(ax.length===2){aw+=" dy="+at(Math.abs(ax[0]-ax[1]))}}if(av.length===1){aw+=" z="+at(av[0])}else{if(av.length===2){aw+=" dz="+at(Math.abs(av[0]-av[1]))}}if(h>0){aw+=" Total len="+at(h)}e.text(W/2,j+7,"Selection info ("+aq.length+"): "+aw)},J=function(){for(var w=0;w!==M.length;++w){var am=M[w];for(var h=0;h!==am.length;++h){am[h].selected=0;am[h].sselected=0;am[h].eselected=0}}},O=function(){K.remove();K.push(e.g.popup(this.x,this.y,this.value,null,3))},g=function(){K.remove()},d=function(){var h=this.si;M[h[0]][h[1]].selected=!M[h[0]][h[1]].selected;U.redraw()},T=function(){var h=this.si;M[h[0]][h[1]].sselected=!M[h[0]][h[1]].sselected;U.redraw()},B=function(){var h=this.si;M[h[0]][h[1]].eselected=!M[h[0]][h[1]].eselected;U.redraw()};if(I){q=0;for(ad=0;ad!==I.length;++ad){n.push([I[ad][0],E(I[ad][1])])}}this.redraw=function(){K.remove();e.clear();var av=ak?1:0,az=[],at=0,aq,ay=e.rect(1,1,W-2,af-2,10).attr({fill:ai,stroke:"none"}),w,aB,au,am=0,ap,ao=[],ax,ar,h,an,aA,aw;ay.drag(function(aD,aC){var i=aD-ab,aE=-aC+aa;ab=aD;aa=aC;X(i,aE)},function(i,aC){v=i;t=aC;ab=0;aa=0},function(){});ay.dblclick(function(){J();U.redraw()});M=[o];if(q!==-1){M.push(n[q][1])}for(at=0;at!==M.length;++at){w=M[at];for(aq=0;aq!==w.length;aq++){ap=w[aq];am+=ap.len;aB=P.x(ap.pts[0]);au=P.x(ap.pts[1]);az.push({z:Math.min(aB.e(3),au.e(3)),x1:aB.e(1)*R+b,y1:-aB.e(2)*R+F,x2:au.e(1)*R+b,y2:-au.e(2)*R+F,sindex:[at,aq]})}}az.sort(function(aC,i){return aC.z-i.z});if(!S){for(at=0;at!==az.length;++at){ap=az[at];ax="M"+ap.x1+" "+ap.y1+"L"+ap.x2+" "+ap.y2;ar=ap.sindex;h=e.path(ax).attr({stroke:ai,"stroke-width":11});w=M[ar[0]];aq=ar[1];h.value=w[aq].names[av][0];h.x=(ap.x1+ap.x2)/2;h.y=(ap.y1+ap.y2)/2;h.si=ar;h.hover(O,g);h.click(d);aw=e.circle(ap.x1,ap.y1,7).attr({stroke:ai,fill:ai});aw.value=w[aq].names[av][1];aw.x=ap.x1;aw.y=ap.y1;aw.si=ar;aw.hover(O,g);aw.click(T);aw=e.circle(ap.x2,ap.y2,7).attr({stroke:ai,fill:ai});aw.value=w[aq].names[av][2];aw.x=ap.x2;aw.y=ap.y2;aw.si=ar;aw.hover(O,g);aw.click(B)}}ag();for(at=0;at!==az.length;++at){ap=az[at];ax="M"+ap.x1+" "+ap.y1+"L"+ap.x2+" "+ap.y2;ar=ap.sindex;aq=ar[1];w=M[ar[0]];an=w[aq].color;aA=(w[aq].selected?"#f0f":an);h=e.path(ax).attr({stroke:aA,"stroke-width":3});h.value=w[aq].names[av][0];h.x=(ap.x1+ap.x2)/2;h.y=(ap.y1+ap.y2)/2;h.si=ar;if(w[aq].selected){ao.push([ar[0],aq,0])}h.hover(O,g);h.click(d);aA=(w[aq].sselected?"#f0f":an);aw=e.circle(ap.x1,ap.y1,3).attr({stroke:aA,fill:aA});aw.value=w[aq].names[av][1];aw.x=ap.x1;aw.y=ap.y1;aw.si=ar;if(w[aq].sselected){ao.push([ar[0],aq,1])}aw.hover(O,g);aw.click(T);aA=(w[aq].eselected?"#f0f":an);aw=e.circle(ap.x2,ap.y2,3).attr({stroke:aA,fill:aA});aw.value=w[aq].names[av][2];aw.x=ap.x2;aw.y=ap.y2;aw.si=ar;if(w[aq].eselected){ao.push([ar[0],aq,2])}aw.hover(O,g);aw.click(B)}A(ao,am);V();e.circle(15,af-15,10).attr({fill:ai}).click(function(i){R=R*1.1;U.redraw()});e.g.plus(15,af-15,10).attr({fill:"#000"}).click(function(i){R=R*1.1;U.redraw()});e.circle(40,af-15,10).attr({fill:ai}).click(function(i){R=R/1.1;U.redraw()});e.g.line(40,af-15,10).attr({fill:"#000"}).click(function(i){R=R/1.1;U.redraw()});e.g.label(80,af-15,"Reset").click(function(i){J();k()});e.g.label(150,af-15,ak?"Switch to MM":"Switch to IN").click(function(i){ak=!ak;U.redraw()});aw=e.circle(W-24,af-15,14).attr({stroke:"#000"}).click(ac);e.g.label(W-86,af-15,"F").click(function(i){P=$M([[0,1,0],[0,0,1],[1,0,0]]);U.redraw()});e.g.label(W-69,af-15,"L").click(function(i){P=$M([[1,0,0],[0,0,1],[0,-1,0]]);U.redraw()});e.g.label(W-51,af-15,"T").click(function(i){P=$M([[0,1,0],[-1,0,0],[0,0,1]]);U.redraw()});e.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z").attr({fill:"#000"}).scale(3/4).translate(W-40,af-31).click(ac);if(D){aw.attr({fill:"#f00",stroke:"#000"})}else{aw.attr({fill:ai,stroke:"#000"})}}};var gainChart=function(s,p,C,b,n,v,e,f,k,G){var t=Raphael(s),q=t.set(),B,A,d,z,o,F,m,D,a,l;if(G){t.text(p/2,10,G).attr({"font-size":14})}t.g.txtattr.font="10px 'Fontin Sans', Fontin-Sans, sans-serif";var E=function(){if(q){q.remove()}q.push(t.g.popup(this.x,this.y,this.value,null,3))};var u=function(){if(q){q.remove()}};var g=function(){if(this.hidden){this.hidden=0;this.text.attr({fill:"#000"});this.chart.lines.show();this.chart.symbols.show();this.chart.dots.show()}else{this.hidden=1;this.text.attr({fill:"#ccc"});this.chart.lines.hide();this.chart.symbols.hide();this.chart.dots.hide()}};for(B=n.length;B!==0;){--B;d=n[B][0];z=n[B][1];o=v[B][1];F=n[B].slice(2);if(B){m={gutter:10,nostroke:false,axis:"0 0 0 0",symbol:"o",smooth:true,axisystep:(f-e)*2,axisxstep:b.length-1,axisymin:e,axisymax:f}}else{m={gutter:10,nostroke:false,axis:"0 0 1 1",symbol:"o",smooth:true,axisystep:(f-e)*2,axisxstep:b.length-1,axisymin:e,axisymax:f,grid:"5 2"}}D=t.g.linechart(20,20,p,C,[b],[F],m).hover(E,u);D.symbols.attr({r:2});D.lines.attr({stroke:z});D.symbols.attr({stroke:z});D.symbols.attr({fill:z});D.grid.attr({"stroke-width":0.25});l=t.rect(20,C+31+10*B,20,8).attr({stroke:"none",fill:z});l.chart=D;l.hidden=0;l.color=z;l.altcolor=o;l.mouseover(function(){this.attr({fill:this.altcolor});this.text.attr({"font-weight":"bold"})});l.mouseout(function(){this.attr({fill:this.color});this.text.attr({"font-weight":"normal"})});l.text=t.text(44,C+35+10*B,d).attr({"text-anchor":"start"});l.text.rect=l;l.text.mouseover(function(){this.rect.attr({fill:this.rect.altcolor});this.attr({"font-weight":"bold"})});l.text.mouseout(function(){this.rect.attr({fill:this.rect.color});this.attr({"font-weight":"normal"})});l.text.text=l.text;l.text.chart=l.chart;l.click(g);l.text.click(g)}for(B=v.length;B!==0;){--B;d=v[B][0];z=v[B][1];o=n[B][1];F=v[B].slice(2);if(B){m={gutter:10,nostroke:false,axis:"0 0 0 0",symbol:"o",smooth:true,axisystep:(k-1)*2,axisxstep:b.length-1,axisymin:1,axisymax:k}}else{m={gutter:10,nostroke:false,axis:"0 1 0 0",symbol:"o",smooth:true,axisystep:(k-1)*2,axisxstep:b.length-1,axisymin:1,axisymax:k,grid:"0 1"}}a=t.g.linechart(20,20,p,C,[b],[F],m).hover(E,u);a.symbols.attr({r:2});a.lines.attr({stroke:z});a.symbols.attr({stroke:z});a.symbols.attr({fill:z});a.axis.attr({stroke:"#f00"});a.grid.attr({stroke:"#f00"});a.grid.attr({"stroke-width":0.25});l=t.rect(p,C+31+10*B,20,8).attr({stroke:"none",fill:z});l.chart=a;l.hidden=0;l.color=z;l.altcolor=o;l.mouseover(function(){this.attr({fill:this.altcolor});this.text.attr({"font-weight":"bold"})});l.mouseout(function(){this.attr({fill:this.color});this.text.attr({"font-weight":"normal"})});l.text=t.text(p-4,C+35+10*B,d).attr({"text-anchor":"end",fill:"#000"});l.text.rect=l;l.text.mouseover(function(){this.rect.attr({fill:this.rect.altcolor});this.attr({"font-weight":"bold"})});l.text.mouseout(function(){this.rect.attr({fill:this.rect.color});this.attr({"font-weight":"normal"})});l.click(g);l.text.text=l.text;l.text.chart=l.chart;l.text.click(g)}};var uhf_channels=[14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53];var uhf_hi_channels=uhf_channels.concat([54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70]);var vhf_hi_channels=[7,8,9,10,11,12,13,14];var uhfChart=function(f,i,d,j,e,a,b,k,g){return gainChart(f,i,d,uhf_channels,j,e,a,b,k,g)},uhfHiChart=function(f,i,d,j,e,a,b,k,g){return gainChart(f,i,d,uhf_hi_channels,j,e,a,b,k,g)},vhfHiChart=function(f,i,d,j,e,a,b,k,g){return gainChart(f,i,d,vhf_hi_channels,j,e,a,b,k,g)};var AntennaHPattern=function(w,z,b,K,t,u,q){z=Math.max(100,z-20);var m=this,k=Raphael(w,z,z),e=[],H=0,G,J,h,g=Math.round(z/2-(K.length>1?35:25)),n,F=[],A=[g],s,D=[],a=[],C=0,f=360/((K[0][0].length-1)*(t+1)),v=k.set();m.x=z/2;m.y=m.x+(K.length>1?20:0);for(;H!=K.length;++H){a.push(1);for(G=0;G!=K[H].length;++G){e.push(K[H][G].maxValue())}}h=Math.max(Math.round(e.minValue()-3.5),0);J=Math.round(e.maxValue()+0.5);while(J>=h){F.push(J);J-=3}if(J<=2){F.push(0)}else{if(J<=5){F.push(J);F.push(0)}else{var l=Math.round(J/5);l=Math.round(J/l-0.5);while(J>=l){c.push(J);J-=l}F.push(0)}}F.push(-5);F.push(-10);F.push(-20);F.push(-50);F.push(-1000);if(F[0]<=12){n=0.5}else{n=0.5*12/F[0]}s=1-n;for(H=1;F[H]>0;++H){A.push(Math.round((n+s*F[H]/F[0])*A[0]))}A.push(Math.round(n*A[0]));A.push(Math.round(n*0.75*A[0]));A.push(Math.round(n*0.5*A[0]));A.push(Math.round(n*0.25*A[0]));A.push(Math.round(n*0.125*A[0]));A.push(0);var r=function(N){var j=1;if(N<-1000){return 0}for(;j<F.length;++j){if(N>F[j]){break}}return(A[j-1]-A[j])*(N-F[j])/(F[j-1]-F[j])+A[j]},d=function(){v.remove();v.push(k.g.popup(this.x,this.y,this.value,null,3))},M=function(){v.remove()},E=function(T){var P=K[T][C],R=0,aa="",Y=0,j=0,S=P[0],V,O,X,W,U=k.set(),N,Z=q[T][0],Q=function(i){V=r(P[R]);j=radians(Y);X=m.x+Math.cos(j)*V;W=m.y-Math.sin(j)*V;aa+=i+Math.round(X*100)/100+" "+Math.round(W*100)/100;O=k.circle(X,W,2).attr({stroke:Z,fill:Z});O.value=Y+" dg\n"+P[R];O.x=X;O.y=W;O.hover(d,M);Y+=f;U.push(O)};Q("M");N=O;for(R=1;R<P.length;++R){Q("L")}if(t){for(R=P.length-2;R>0;--R){Q("L")}}aa+="Z";res=k.path(aa);res.attr({stroke:Z}).insertBefore(N);U.push(res);return U},p=function(){C+=this.step;if(C>=b.length-1){C=b.length-1}m.draw()},L=function(){C-=this.step;if(C<0){C=0}m.draw()},B=function(){var i=this.mno;if(a[i]){D[i].hide();a[i]=0}else{D[i].show();a[i]=1}m.draw()},o=function(){var S=0,N=A,T=N.length-5,X,V,W,P=K[0][C],O="#000",R="#888",U="#888",j="#ccc",Q;if(K.length>1){for(S=0;S!=K.length;++S){P=K[S][C];Q=k.rect(S*z/K.length,2,z/K.length,12).attr({stroke:"none"});Q.click(B);Q.mno=S;if(a[S]){Q.attr({fill:q[S][1]})}else{Q.attr({fill:"#fff"})}Q.text=k.text((S+0.5)*z/K.length,8,u[S]);Q.text.mno=S;Q.text.click(B);Q.text.mouseover(function(){this.attr({"font-weight":"bolder"})});Q.text.mouseout(function(){this.attr({"font-weight":"normal"})});Q.mouseover(function(){this.text.attr({"font-weight":"bolder"})});Q.mouseout(function(){this.text.attr({"font-weight":"normal"})});k.text((S+0.5)*z/K.length,18,t?("F: "+P[0]+"dBi, B: "+P[P.length-1]+"dBi"):("F: "+P[0]+"dBi, B: "+P[Math.round(P.length/2-0.5)]+"dBi"));k.text((S+0.5)*z/K.length,28,P.minValue()+" < dBi < "+P.maxValue())}k.text(8,38,b[C]).attr({"text-anchor":"start"})}else{k.text(10,z-18,P.minValue()+" < dBi < "+P.maxValue()).attr({"text-anchor":"start"});k.text(0,z-8,t?("F: "+P[0]+"dBi, B: "+P[P.length-1]+"dBi"):("F: "+P[0]+"dBi, B: "+P[Math.round(P.length/2-0.5)]+"dBi")).attr({"text-anchor":"start"});k.text(8,8,b[C]).attr({"text-anchor":"start"})}for(S=0;S!=N.length-1;++S){k.circle(m.x,m.y,N[S]).attr({stroke:"#000",fill:"none"});k.text(m.x-10,m.y-N[S]+5,F[S])}for(S=0;S!=360;S+=5){W=radians(S);X=Math.cos(W);V=Math.sin(W);if(S%15){r_line(k,m.x+X*N[T],m.y+V*N[T],m.x+X*N[0],m.y+V*N[0]).attr({stroke:U})}else{if(S%90){r_line(k,m.x+X*N[T+1],m.y+V*N[T+1],m.x+X*N[0],m.y+V*N[0]).attr({stroke:O})}else{r_line(k,m.x,m.y,m.x+X*N[0],m.y+V*N[0]).attr({stroke:O})}k.text(m.x+X*(N[0]+10),m.y-V*(N[0]+10),S)}}x=z-50;y=z-15;var Y=function(i,aa,ad,ae,ac){var ab=k.rect(i,y,aa,12),Z=k.text(i+aa/2,y+5,ad);ab.attr({fill:R,stroke:"none"});ab.click(ae);ab.step=ac;ab.mouseover(function(){this.attr({fill:j});this.txt.attr({"font-weight":"bold"})});ab.mouseout(function(){this.attr({fill:R});this.txt.attr({"font-weight":"normal"})});ab.txt=Z;Z.attr({fill:R,stroke:O});Z.click(ae);Z.step=ac;Z.mouseover(function(){this.rect.attr({fill:j});this.attr({"font-weight":"bold"})});Z.mouseout(function(){this.rect.attr({fill:R});this.attr({"font-weight":"normal"})});Z.rect=ab};Y(x-16,14,"<",L,1,R);Y(x,14,">",p,1);Y(x-37,19,"<<",L,5);Y(x+16,19,">>",p,5);Y(x-53,14,"|<",L,b.length);Y(x+37,14,">|",p,b.length)},I=function(){var j=0;for(;j!=K.length;++j){D[j]=E(j);if(!a[j]){D[j].hide()}}};m.draw=function(){k.clear();o();I()}};function vhfHiFreqTitles(){var b=0,a=[];for(;b!=8;++b){a.push((174+b*6)+" Mhz")}return a}function uhfFreqTitles(){var b=0,a=[];for(;b!=40;++b){a.push((470+b*6)+" Mhz")}return a}var configureModelPatternTabs=function(){var h=$("#show_pattern"),d=$("#show_model"),a=$("#pattern"),g=$("#model"),b="selected",f,e=function(){if($(this).hasClass(b)){return}h.toggleClass(b);d.toggleClass(b);if(h.hasClass(b)){a.show();g.hide();if(a.html()=="Loading..."){f=g.html();f=f.replace("_r.html","_p.html");a.html(f)}}else{g.show();a.hide()}};h.click(e);d.click(e);a.hide()};
