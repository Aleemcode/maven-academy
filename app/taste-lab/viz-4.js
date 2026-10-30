/* Taste Lab: visual explainers + Train-your-eye drills (part 4). See CONTRACT in the repo notes. */
window.VIZ=window.VIZ||{};window.DRILLS=window.DRILLS||{};
(function(){
'use strict';
var V=window.VIZ,D=window.DRILLS;
/* ---------- shared helpers (scoped to this file) ---------- */
var RM=function(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
var $=function(el,s){return el.querySelector(s)},$$=function(el,s){return Array.prototype.slice.call(el.querySelectorAll(s))};
var alive=function(el){return el.isConnected};
var uid=function(){return Math.random().toString(36).slice(2,8)};
function seg(root,name,cb){var box=root.querySelector('[data-seg="'+name+'"]');if(!box)return;var bs=$$(box,'[data-v]');
 bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});cb(b.dataset.v,b)})})}
function setSeg(root,name,v){var box=root.querySelector('[data-seg="'+name+'"]');if(!box)return;$$(box,'[data-v]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===v?'true':'false')})}
function tog(btn,cb){if(!btn)return;btn.addEventListener('click',function(){var on=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',String(on));cb(on)})}
var segH=function(name,label,items,def){return '<div class="k-ctl"><span class="k-lab">'+label+'</span><div class="k-seg" role="group" aria-label="'+label+'" data-seg="'+name+'">'+items.map(function(it){return '<button type="button" class="k-b" data-v="'+it[0]+'" aria-pressed="'+(it[0]===def)+'">'+it[1]+'</button>'}).join('')+'</div></div>'};
var togH=function(cls,label,on){return '<button type="button" class="k-b k-t '+cls+'" aria-pressed="'+(!!on)+'"><i aria-hidden="true"></i>'+label+'</button>'};
function onVisible(el,fn){if(!('IntersectionObserver' in window)){fn();return}var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();fn()}},{threshold:.35});io.observe(el)}
function later(el,fn,ms){return setTimeout(function(){if(alive(el))fn()},ms)}
function rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)})}
function lum(h){var c=rgb(h).map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function cr(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function mix(a,b,t){var x=rgb(a),y=rgb(b);return '#'+x.map(function(v,i){return ('0'+Math.round(v+(y[i]-v)*t).toString(16)).slice(-2)}).join('')}
var IC={
 check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 cross:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 warn:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>',
 wifi:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.6M19 13a10 10 0 0 0-2.2-1.6M2 9a15 15 0 0 1 4.5-2.8M22 9a15 15 0 0 0-10-3.8M12 20h.01"/></svg>',
 trash:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
 heart:'<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9-9.3C2 7.3 4.3 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3 0 5.3 2.8 4.3 6.2C19.5 15.4 12 20 12 20z"/></svg>',
 clock:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
var BASE='<style>'+
'.vz4{font-family:"Instrument Sans",system-ui,sans-serif;color:#14261D;font-size:15px;line-height:1.45;display:grid;gap:14px;min-width:0}'+
'.vz4 *{box-sizing:border-box}.vz4 p{margin:0}'+
'.vz4 .k-ctls{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:flex-end}'+
'.vz4 .k-ctl{display:grid;gap:6px;min-width:0}'+
'.vz4 .k-seg{display:flex;flex-wrap:wrap;gap:6px}'+
'.vz4 .k-b{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 14px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;font:600 14px/1.15 "Instrument Sans",system-ui,sans-serif;color:#14261D;cursor:pointer;box-shadow:2px 2px 0 #14261D;transition:transform .1s ease-out,box-shadow .1s ease-out,background-color .15s;text-align:left}'+
'.vz4 .k-b:hover{background:#F4F0E5}.vz4 .k-b[aria-pressed=true]{background:#D6E59A}.vz4 .k-b.pri{background:#E8722C}.vz4 .k-b.pri:hover{background:#EE8240}'+
'.vz4 .k-b:active{transform:translate(2px,2px);box-shadow:0 0 0 #14261D}'+
'.vz4 .k-b:focus-visible{outline:3px solid #3B82C4;outline-offset:2px}'+
'.vz4 .k-t i{position:relative;width:30px;height:18px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7;flex:none}'+
'.vz4 .k-t i::after{content:"";position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:#14261D;transition:transform .15s ease-out}'+
'.vz4 .k-t[aria-pressed=true] i{background:#14261D}.vz4 .k-t[aria-pressed=true] i::after{transform:translateX(12px);background:#D6E59A}'+
'.vz4 .k-lab{font:700 11px/1.2 "Space Mono",monospace;letter-spacing:1.5px;text-transform:uppercase;color:#4A5A4F}'+
'.vz4 .k-stage{background:#F4F0E5;border:2px solid #14261D;border-radius:14px;padding:16px;min-width:0;position:relative}'+
'.vz4 .k-cap{background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px 14px;font-size:14.5px;line-height:1.5}'+
'.vz4 .k-term{display:inline-block;font:700 11px/1.35 "Space Mono",monospace;letter-spacing:.5px;background:#14261D;color:#D6E59A;border-radius:6px;padding:2px 7px;margin-right:6px;vertical-align:1px}'+
'.vz4 .k-note{font-size:13.5px;color:#4A5A4F}'+
'.vz4 .k-mono{font-family:"Space Mono",monospace}'+
'.vz4 input[type=range]{width:100%;height:44px;accent-color:#E8722C;margin:0;cursor:pointer}'+
'@media (prefers-reduced-motion:reduce){.vz4 .k-b,.vz4 .k-t i::after{transition:none}}'+
'</style>';
/* drill helpers: plain spans/divs only (options render inside <button>) */
var FF='font-family:Instrument Sans,system-ui,sans-serif;';
var card=function(c,s){return '<div style="'+FF+'width:220px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px;color:#14261D;font-size:13px;line-height:1.4;text-align:left;'+(s||'')+'">'+c+'</div>'};
var pbtn=function(t,s){return '<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:0 14px;border:2px solid #14261D;border-radius:10px;background:#E8722C;font-weight:700;font-size:13.5px;color:#14261D;box-shadow:3px 3px 0 #14261D;'+FF+(s||'')+'">'+t+'</span>'};
var mono=function(t,s){return '<span style="font-family:Space Mono,monospace;font-size:10.5px;color:#4A5A4F;'+(s||'')+'">'+t+'</span>'};

/* =================== MOTION =================== */
function bezier(x1,y1,x2,y2){
 var cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
 var sx=function(t){return((ax*t+bx)*t+cx)*t},sy=function(t){return((ay*t+by)*t+cy)*t},dx=function(t){return(3*ax*t+2*bx)*t+cx};
 return function(x){if(x<=0)return 0;if(x>=1)return 1;var t=x,i;for(i=0;i<8;i++){var e=sx(t)-x;if(Math.abs(e)<1e-5)return sy(t);var d=dx(t);if(Math.abs(d)<1e-6)break;t-=e/d}
  var lo=0,hi=1;t=x;for(i=0;i<40;i++){var v=sx(t);if(Math.abs(v-x)<1e-5)break;if(v<x)lo=t;else hi=t;t=(lo+hi)/2}return sy(t)}}
function spring(t){if(t>=1)return 1;var z=.5,w=13,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+(z*w/wd)*Math.sin(wd*t))}
var EO=bezier(.2,.8,.2,1);
var PRE={linear:[0,0,1,1],'in':[.4,0,1,1],out:[.2,.8,.2,1],inout:[.65,0,.35,1]};
var f2=function(n){return (Math.round(n*100)/100).toFixed(2)};

V['motion']=[
{id:'motion-easing',title:'The easing race',
 terms:['Easing','Linear','Ease-out','Ease-in','Ease-in-out','Spring','Cubic bezier','Duration'],
 intro:'Six balls travel the same distance in the same time. Only the easing is different: how speed changes along the way. Each small graph is the ball’s curve: time runs left to right, progress runs bottom to top.',
 try:'Press Play, then freeze at halfway. Slide the duration into each zone and feel the difference. Drag the two handles on the big graph to make your own curve.',
 html:BASE+'<div class="vz4 vz-motion-easing"><style>'+
 '.vz-motion-easing .me-lanes{display:grid;gap:8px}'+
 '.vz-motion-easing .me-lane{display:grid;grid-template-columns:104px 52px minmax(0,1fr);gap:10px;align-items:center}'+
 '.vz-motion-easing .me-name b{display:block;font-size:14.5px;line-height:1.15}.vz-motion-easing .me-name span{font:11px/1.2 "Space Mono",monospace;color:#4A5A4F}'+
 '.vz-motion-easing .me-mini{width:52px;height:52px;background:#FFFDF7;border:1.5px solid #14261D;border-radius:8px;display:block}'+
 '.vz-motion-easing .me-track{position:relative;height:40px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7}'+
 '.vz-motion-easing .me-fin{position:absolute;top:4px;bottom:4px;width:0;border-left:2px dashed #4A5A4F}'+
 '.vz-motion-easing .me-ball{position:absolute;left:4px;top:5px;width:26px;height:26px;border-radius:50%;background:#E8722C;border:2px solid #14261D;will-change:transform}'+
 '.vz-motion-easing .me-lane[data-k=you] .me-ball{background:#D6E59A}'+
 '.vz-motion-easing .me-zones{position:relative;display:flex;height:30px;border:2px solid #14261D;border-radius:8px;overflow:hidden;font:700 10.5px/26px "Space Mono",monospace;text-align:center;color:#14261D}'+
 '.vz-motion-easing .me-zones span{display:block;border-right:2px solid #14261D;white-space:nowrap;overflow:hidden}.vz-motion-easing .me-zones span:last-child{border-right:0}'+
 '.vz-motion-easing .me-mark{position:absolute;top:-1px;bottom:-1px;width:10px;margin-left:-5px;background:#FFFDF7;border:2.5px solid #14261D;border-radius:4px;box-shadow:1px 1px 0 #14261D}'+
 '.vz-motion-easing .me-ed{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:16px;align-items:start}'+
 '.vz-motion-easing .me-big{width:100%;max-width:240px;height:auto;display:block;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;touch-action:none}'+
 '.vz-motion-easing .me-code{display:block;font:700 14px "Space Mono",monospace;background:#14261D;color:#F4F0E5;border-radius:8px;padding:10px 12px;margin:6px 0 10px;overflow-wrap:anywhere}'+
 '.vz-motion-easing .hd{cursor:grab}'+
 '@media (max-width:560px){.vz-motion-easing .me-ed{grid-template-columns:1fr}.vz-motion-easing .me-lane{grid-template-columns:86px 46px minmax(0,1fr);gap:8px}.vz-motion-easing .me-mini{width:46px;height:46px}}'+
 '</style>'+
 '<div class="k-ctls"><button type="button" class="k-b pri me-play">Play the race</button><button type="button" class="k-b me-half">Freeze at halfway</button></div>'+
 '<p class="k-note me-rm" hidden>Your device asks for reduced motion, so nothing moves on its own. The race is frozen at the halfway moment. Press Play once to watch it.</p>'+
 '<div class="k-stage me-lanes"></div>'+
 '<div class="k-cap me-cap"></div>'+
 '<div class="k-ctl"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="k-lab">Duration</span><b class="k-mono me-ms">250ms</b></div>'+
 '<input type="range" class="me-dur" min="0" max="100" value="49" aria-label="Duration">'+
 '<div class="me-zones" aria-hidden="true"><span style="width:34.6%;background:#C9E0F2">too fast</span><span style="width:21.8%;background:#D6E59A">snappy</span><span style="width:16.1%;background:#F7DCC4">big</span><span style="width:27.5%;background:#F6D7E8">slow</span><i class="me-mark"></i></div>'+
 '<p class="me-zt" style="font-size:14px"></p></div>'+
 '<div class="me-ed"><svg class="me-big" viewBox="0 0 160 184" role="img" aria-label="Your curve. Drag the two handles."></svg>'+
 '<div><span class="k-lab">Cubic bezier</span><code class="me-code"></code>'+
 '<p style="font-size:14px">A cubic bezier is four numbers: where the two handles sit. <b>x1, y1</b> is the first handle, <b>x2, y2</b> the second. Drag them, then play the race and watch the green “Your curve” ball.</p>'+
 '<div class="k-seg" style="margin-top:10px"><span class="k-lab" style="width:100%">Start from</span><button type="button" class="k-b" data-p="linear">Linear</button><button type="button" class="k-b" data-p="in">Ease-in</button><button type="button" class="k-b" data-p="out">Ease-out</button><button type="button" class="k-b" data-p="inout">Ease-in-out</button></div></div></div>'+
 '</div>',
 init:function(el){
  var root=$(el,'.vz-motion-easing'),you=[.2,.8,.2,1];
  var L=[{k:'linear',n:'Linear',r:'robotic',f:bezier(0,0,1,1)},{k:'in',n:'Ease-in',r:'for leaving',f:bezier(.4,0,1,1)},{k:'out',n:'Ease-out',r:'for arriving',f:bezier(.2,.8,.2,1)},{k:'inout',n:'Ease-in-out',r:'moving across',f:bezier(.65,0,.35,1)},{k:'spring',n:'Spring',r:'alive, overshoots',f:spring},{k:'you',n:'Your curve',r:'drag the handles',f:bezier(.2,.8,.2,1)}];
  var X=function(t){return 8+t*84},Y=function(p){return 86-p*64};
  var path=function(f,upto){var d='',n=Math.max(2,Math.round(48*upto));for(var i=0;i<=n;i++){var t=upto*i/n;d+=(i?'L':'M')+X(t).toFixed(1)+' '+Y(f(t)).toFixed(1)}return d};
  var lanes=$(root,'.me-lanes');
  lanes.innerHTML=L.map(function(l){return '<div class="me-lane" data-k="'+l.k+'"><div class="me-name"><b>'+l.n+'</b><span>'+l.r+'</span></div><svg class="me-mini" viewBox="0 0 100 100" aria-hidden="true"><path d="M8 86H92M8 22H92" stroke="#4A5A4F" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity=".6"/><path class="fu" fill="none" stroke="#4A5A4F" stroke-opacity=".35" stroke-width="3"/><path class="tr" fill="none" stroke="#14261D" stroke-width="4" stroke-linecap="round"/><circle class="dt" r="7" fill="#E8722C" stroke="#14261D" stroke-width="2.5"/></svg><div class="me-track"><i class="me-fin"></i><i class="me-ball"></i></div></div>'}).join('');
  var rows=$$(lanes,'.me-lane');
  function drawFull(){rows.forEach(function(r,i){$(r,'.fu').setAttribute('d',path(L[i].f,1))})}
  function frame(t){rows.forEach(function(r,i){var f=L[i].f,p=f(t),tr=$(r,'.me-track'),w=tr.clientWidth-34,travel=w*.84;
   $(r,'.me-fin').style.left=(4+travel+13)+'px';$(r,'.me-ball').style.transform='translateX('+(p*travel).toFixed(1)+'px)';
   $(r,'.tr').setAttribute('d',t>0?path(f,t):'');var dt=$(r,'.dt');dt.setAttribute('cx',X(t));dt.setAttribute('cy',Y(p))})}
  var dur=250,raf=0;
  function cap(t){var c=$(root,'.me-cap');
   if(t===.5)c.innerHTML='<span class="k-term">Frozen at halfway</span>Same time has passed for every ball. <b>Ease-out</b> is almost home: fast start, gentle stop, perfect for things arriving. <b>Ease-in</b> has barely left: slow start, which is why it suits things leaving. <b>Linear</b> sits exactly in the middle, like a machine. <b>Spring</b> is already past the line and will settle back.';
   else c.innerHTML='<span class="k-term">Easing</span>How speed changes during a move. Watch the end of each lane: ease-out lands softly, linear stops dead, spring overshoots and settles like something real.'}
  function play(){cancelAnimationFrame(raf);var s=performance.now();(function st(now){if(!alive(el))return;var t=Math.min(1,(now-s)/dur);frame(t);if(t<1)raf=requestAnimationFrame(st);else cap(1)})(s)}
  var mapMs=function(v){return Math.round(50*Math.pow(24,v/100)/10)*10};
  function setDur(v){dur=mapMs(+v);$(root,'.me-ms').textContent=dur+'ms';$(root,'.me-mark').style.left=v+'%';
   $(root,'.me-zt').innerHTML=dur<150?'<b>Under 150ms: too fast to see.</b> Fine for a button press, invisible for anything that travels.':dur<=300?'<b>150–300ms: snappy.</b> The sweet spot for most interface motion: menus, toasts, toggles, tabs.':dur<=500?'<b>300–500ms: deliberate.</b> Only for big moves, like a full-screen sheet sliding up.':'<b>Over 500ms: slow.</b> People start waiting for your animation. Avoid for everyday UI.'}
  var dS=$(root,'.me-dur');dS.addEventListener('input',function(){setDur(dS.value)});dS.addEventListener('change',play);setDur(dS.value);
  $(root,'.me-play').addEventListener('click',function(){cap(1);play()});
  $(root,'.me-half').addEventListener('click',function(){cancelAnimationFrame(raf);frame(.5);cap(.5)});
  /* bezier editor */
  var svg=$(root,'.me-big'),BX=function(x){return 20+x*120},BY=function(y){return 152-y*120};
  svg.innerHTML='<rect x="20" y="32" width="120" height="120" fill="#F4F0E5" stroke="#14261D" stroke-width="1"/><text x="80" y="176" text-anchor="middle" font-size="10" font-family="Space Mono,monospace" fill="#4A5A4F">time</text><text x="12" y="92" text-anchor="middle" font-size="10" font-family="Space Mono,monospace" fill="#4A5A4F" transform="rotate(-90 12 92)">progress</text>'+
   '<path class="l1" stroke="#4A5A4F" stroke-width="1.5" stroke-dasharray="3 3"/><path class="l2" stroke="#4A5A4F" stroke-width="1.5" stroke-dasharray="3 3"/><path class="cv" fill="none" stroke="#14261D" stroke-width="3.5" stroke-linecap="round"/>'+
   '<g class="hd" data-h="1"><circle r="16" fill="transparent"/><circle r="7" fill="#D6E59A" stroke="#14261D" stroke-width="2.5"/><text x="11" y="13" font-size="9" font-family="Space Mono,monospace" fill="#14261D">1</text></g>'+
   '<g class="hd" data-h="2"><circle r="16" fill="transparent"/><circle r="7" fill="#D6E59A" stroke="#14261D" stroke-width="2.5"/><text x="11" y="-6" font-size="9" font-family="Space Mono,monospace" fill="#14261D">2</text></g>';
  function drawEd(){var f=bezier(you[0],you[1],you[2],you[3]);L[5].f=f;var d='';for(var i=0;i<=60;i++){var t=i/60;d+=(i?'L':'M')+BX(t).toFixed(1)+' '+BY(f(t)).toFixed(1)}
   $(svg,'.cv').setAttribute('d',d);$(svg,'.l1').setAttribute('d','M'+BX(0)+' '+BY(0)+'L'+BX(you[0])+' '+BY(you[1]));$(svg,'.l2').setAttribute('d','M'+BX(1)+' '+BY(1)+'L'+BX(you[2])+' '+BY(you[3]));
   $(svg,'[data-h="1"]').setAttribute('transform','translate('+BX(you[0])+' '+BY(you[1])+')');$(svg,'[data-h="2"]').setAttribute('transform','translate('+BX(you[2])+' '+BY(you[3])+')');
   $(root,'.me-code').textContent='cubic-bezier('+you.map(f2).join(', ')+')';$(rows[5],'.fu').setAttribute('d',path(f,1))}
  var drag=0;
  $$(svg,'.hd').forEach(function(g){g.addEventListener('pointerdown',function(e){drag=+g.dataset.h;try{svg.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()})});
  svg.addEventListener('pointermove',function(e){if(!drag)return;var m=svg.getScreenCTM();if(!m)return;var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;pt=pt.matrixTransform(m.inverse());
   var x=Math.max(0,Math.min(1,(pt.x-20)/120)),y=Math.max(-.25,Math.min(1.25,(152-pt.y)/120));if(drag===1){you[0]=x;you[1]=y}else{you[2]=x;you[3]=y}drawEd()});
  var end=function(){if(drag){drag=0;frame(1)}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  $$(root,'[data-p]').forEach(function(b){b.addEventListener('click',function(){you=PRE[b.dataset.p].slice();drawEd();frame(1)})});
  drawFull();drawEd();
  if(RM()){$(root,'.me-rm').hidden=false;$(root,'.me-play').textContent='Play once';frame(.5);cap(.5)}
  else{frame(0);cap(1);onVisible(root,function(){later(el,play,250)})}
 }},

{id:'motion-stagger',title:'Stagger, choreography and frame rate',
 terms:['Stagger','Choreography','Transform','Frame rate'],
 intro:'Six parts of a notifications panel arrive. You choose the order they move in and what the browser animates. The timeline shows when each part starts; the frame strip shows every frame the screen actually drew.',
 try:'Switch between All at once, Stagger and Choreography, drag the stagger slider, then compare Transform with Top + height and watch the frame strip thin out.',
 html:BASE+'<div class="vz4 vz-motion-stagger"><style>'+
 '.vz-motion-stagger .ms-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:16px;align-items:start}'+
 '.vz-motion-stagger .ms-card{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:12px;display:grid;gap:8px}'+
 '.vz-motion-stagger .ms-el{position:relative}'+
 '.vz-motion-stagger .ms-h{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px;padding:2px 2px 4px;border-bottom:2px solid #14261D}'+
 '.vz-motion-stagger .ms-row{display:flex;gap:10px;align-items:center;border:1.5px solid #14261D;border-radius:10px;padding:8px 10px;font-size:13.5px;background:#F4F0E5}'+
 '.vz-motion-stagger .ms-row i{width:28px;height:28px;border-radius:50%;border:1.5px solid #14261D;flex:none}'+
 '.vz-motion-stagger .ms-btn{justify-self:start;border:2px solid #14261D;border-radius:10px;background:#E8722C;font-weight:700;font-size:13.5px;padding:8px 14px;box-shadow:2px 2px 0 #14261D}'+
 '.vz-motion-stagger .ms-tl{display:grid;gap:5px;font:11px "Space Mono",monospace;color:#4A5A4F}'+
 '.vz-motion-stagger .ms-tl div{display:grid;grid-template-columns:70px minmax(0,1fr);gap:8px;align-items:center}'+
 '.vz-motion-stagger .ms-tl em{position:relative;display:block;height:14px;background:#FFFDF7;border:1.5px solid #14261D;border-radius:4px;font-style:normal}'+
 '.vz-motion-stagger .ms-tl b{position:absolute;top:1px;bottom:1px;background:#E8722C;border-radius:2px}'+
 '.vz-motion-stagger .ms-ph{position:absolute;top:0;bottom:0;width:2px;background:#14261D;left:0}'+
 '.vz-motion-stagger .ms-fs{position:relative;height:26px;background:#FFFDF7;border:1.5px solid #14261D;border-radius:6px;overflow:hidden}'+
 '.vz-motion-stagger .ms-fs i{position:absolute;top:4px;bottom:4px;width:2px;background:#14261D}'+
 '@media (max-width:640px){.vz-motion-stagger .ms-grid{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctls">'+segH('ord','Order',[['all','All at once'],['stag','Stagger'],['cho','Choreography']],'cho')+segH('prop','Animate with',[['tf','Transform + opacity'],['lay','Top + height']],'tf')+'</div>'+
 '<div class="k-ctl"><div style="display:flex;justify-content:space-between"><span class="k-lab">Stagger between items</span><b class="k-mono ms-sv">60ms</b></div><input type="range" class="ms-s" min="0" max="200" step="10" value="60" aria-label="Stagger between items in milliseconds"></div>'+
 '<div><button type="button" class="k-b pri ms-play">Play</button></div>'+
 '<div class="ms-grid"><div class="k-stage" style="padding:12px"><div class="ms-card">'+
 '<div class="ms-el ms-h">Notifications <span class="k-mono" style="font-size:11px;color:#4A5A4F">4 new</span></div>'+
 '<div class="ms-el ms-row"><i style="background:#D6E59A"></i>Tunde sent you ₦5,000</div>'+
 '<div class="ms-el ms-row"><i style="background:#C9E0F2"></i>Savings goal: 80% done</div>'+
 '<div class="ms-el ms-row"><i style="background:#F6D7E8"></i>Bisi paid invoice 0042</div>'+
 '<div class="ms-el ms-row"><i style="background:#F7DCC4"></i>New login on Android</div>'+
 '<div class="ms-el ms-btn">Mark all as read</div></div></div>'+
 '<div style="display:grid;gap:12px;min-width:0"><div><span class="k-lab">Timeline</span><div class="ms-tl" style="margin-top:6px"></div></div>'+
 '<div><div style="display:flex;justify-content:space-between"><span class="k-lab">Frames drawn</span><b class="k-mono ms-fps" style="font-size:12px"></b></div><div class="ms-fs" style="margin-top:6px" aria-hidden="true"></div></div>'+
 '<div class="k-cap ms-cap"></div></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-motion-stagger'),els=$$(root,'.ms-el'),names=['Header','Item 1','Item 2','Item 3','Item 4','Button'];
  var ord='cho',prop='tf',stag=60,DUR=280,raf=0;
  function starts(){return els.map(function(_,i){if(ord==='all')return 0;if(ord==='stag')return i*stag;if(i===0)return 0;if(i<5)return 90+(i-1)*stag;return 90+3*stag+DUR})}
  function total(){var s=starts();return Math.max.apply(null,s)+DUR}
  function tl(){var s=starts(),T=total();$(root,'.ms-tl').innerHTML=names.map(function(n,i){return '<div><span>'+n+'</span><em><b style="left:'+(s[i]/T*100)+'%;width:'+(DUR/T*100)+'%"></b>'+'<i class="ms-ph"></i>'+'</em></div>'}).join('')+'<div><span></span><span style="text-align:right">'+T+'ms total</span></div>'}
  function apply(i,p){var e=els[i],q=EO(Math.max(0,Math.min(1,p)));
   if(prop==='tf'){e.style.top='0px';var sc=(ord==='cho'&&i===5)?' scale('+(0.9+0.1*q)+')':'';e.style.transform='translateY('+((1-q)*(i===0&&ord==='cho'?8:18)).toFixed(2)+'px)'+sc;e.style.opacity=q}
   else{e.style.transform='none';e.style.top=((1-q)*18).toFixed(0)+'px';e.style.opacity=q}}
  function cap(){var t={all:'<span class="k-term">All at once</span>Everything arrives in one flash. The eye does not know where to look first.',
   stag:'<span class="k-term">Stagger</span>Each part starts '+stag+'ms after the one before, so the eye reads the panel from top to bottom.'+(stag===0?' At 0ms this is the same as all at once.':stag>120?' Careful: over about 100ms per item feels slow. With 20 items, the last one waits seconds.':''),
   cho:'<span class="k-term">Choreography</span>A planned order: the frame first, then the content in a quick '+stag+'ms stagger, then the button last, once there is something to act on.'}[ord];
   t+=prop==='tf'?'<span style="display:block;height:8px"></span><span class="k-term">Transform</span>Sliding with transform and opacity only moves pixels the browser already painted. Smooth 60 frames per second, even on cheap phones.':'<span style="display:block;height:8px"></span><span class="k-term">Frame rate</span>Animating top and height makes the browser redo the layout on every frame. On a cheap phone it drops frames and stutters. We are simulating about 15 frames per second here.';
   $(root,'.ms-cap').innerHTML=t}
  function play(){cancelAnimationFrame(raf);var s=starts(),T=total(),fs=$(root,'.ms-fs'),n=0,f=0,t0=performance.now();fs.innerHTML='';$(root,'.ms-fps').textContent='';
   els.forEach(function(_,i){apply(i,0)});
   (function st(now){if(!alive(el))return;var t=now-t0;f++;var draw=prop==='tf'||(f%4===0&&Math.random()>.15);
    if(draw){n++;els.forEach(function(_,i){apply(i,(t-s[i])/DUR)});var k=document.createElement('i');k.style.left=Math.min(99.5,t/T*100)+'%';fs.appendChild(k)}
    $$(root,'.ms-ph').forEach(function(ph){ph.style.left=Math.min(100,t/T*100)+'%'});
    if(t<T)raf=requestAnimationFrame(st);else{els.forEach(function(_,i){apply(i,1)});$(root,'.ms-fps').textContent='≈ '+Math.round(n/(T/1000))+' fps'}})(t0)}
  seg(root,'ord',function(v){ord=v;tl();cap();play()});seg(root,'prop',function(v){prop=v;cap();play()});
  var sl=$(root,'.ms-s');sl.addEventListener('input',function(){stag=+sl.value;$(root,'.ms-sv').textContent=stag+'ms';tl();cap()});sl.addEventListener('change',play);
  $(root,'.ms-play').addEventListener('click',play);
  tl();cap();
  if(RM()){$(root,'.ms-play').textContent='Play once';$(root,'.ms-fps').textContent='press Play'}else onVisible(root,function(){later(el,play,200)})
 }},

{id:'motion-reduced',title:'Reduced motion',
 terms:['Reduced motion','Duration'],
 intro:'Some people turn on a setting that asks for less animation, because big movement can make them dizzy or sick. Your site can read that setting and respond.',
 try:'Press Open sheet, then turn on “Simulate reduced motion” and open it again. Same feedback, no travel.',
 html:BASE+'<div class="vz4 vz-motion-reduced"><style>'+
 '.vz-motion-reduced .mr-scr{position:relative;height:250px;max-width:340px;border:2px solid #14261D;border-radius:16px;background:#FFFDF7;overflow:hidden}'+
 '.vz-motion-reduced .mr-ln{height:10px;border-radius:5px;background:#E6E1D3;margin:14px 16px 0}'+
 '.vz-motion-reduced .mr-dim{position:absolute;inset:0;background:rgba(20,38,29,.35);opacity:0;pointer-events:none}'+
 '.vz-motion-reduced .mr-sh{position:absolute;left:10px;right:10px;bottom:10px;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:14px;box-shadow:3px 3px 0 #14261D;opacity:0;visibility:hidden}'+
 '.vz-motion-reduced pre{margin:0;font:12.5px/1.6 "Space Mono",monospace;background:#14261D;color:#F4F0E5;border-radius:10px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere}'+
 '.vz-motion-reduced pre span{display:block;border-radius:4px;padding:0 4px}.vz-motion-reduced pre span.on{background:#D6E59A;color:#14261D}'+
 '.vz-motion-reduced .mr-g{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:16px;align-items:start}'+
 '@media (max-width:640px){.vz-motion-reduced .mr-g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-cap"><span class="k-term">Your device right now</span><b class="mr-dev"></b></div>'+
 '<div class="k-ctls"><button type="button" class="k-b pri mr-open">Open sheet</button>'+togH('mr-sim','Simulate reduced motion',false)+'</div>'+
 '<div class="mr-g"><div class="mr-scr"><div style="padding:14px 16px 0;font-weight:700">Wallet</div><div class="mr-ln" style="width:60%"></div><div class="mr-ln"></div><div class="mr-ln" style="width:80%"></div><div class="mr-ln" style="width:45%"></div><div class="mr-dim"></div>'+
 '<div class="mr-sh" role="dialog" aria-label="Send money"><b style="font-size:16px">Send money</b><p style="font-size:13.5px;color:#4A5A4F;margin:4px 0 10px">To a bank account or a phone number.</p><span style="display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border:2px solid #14261D;border-radius:10px;background:#E8722C;font-weight:700;font-size:14px">Continue</span></div></div>'+
 '<div style="display:grid;gap:10px;min-width:0"><pre><span class="c1">.sheet { animation: rise 300ms ease-out; }</span><span class="c2">@media (prefers-reduced-motion: reduce) {\n  .sheet { animation: fade 200ms ease-out; }\n}</span></pre><div class="k-cap mr-cap"></div></div></div>'+
 '<p class="k-note">Turn it on yourself. iPhone: Settings, Accessibility, Motion, Reduce Motion. Android: Settings, Accessibility, Remove animations.</p></div>',
 init:function(el){
  var root=$(el,'.vz-motion-reduced'),sim=RM(),open=false,sh=$(root,'.mr-sh'),dim=$(root,'.mr-dim');
  $(root,'.mr-dev').textContent=RM()?'Reduce motion is ON. Respect it.':'Reduce motion is off (no preference).';
  var tb=$(root,'.mr-sim');tb.setAttribute('aria-pressed',String(sim));
  function ui(){$(root,'.c1').classList.toggle('on',!sim);$(root,'.c2').classList.toggle('on',sim);
   $(root,'.mr-cap').innerHTML=sim?'<span class="k-term">Reduced motion</span>No travel, no scaling: a short 200ms fade. The person still sees that something opened. Less motion, never no feedback.':'<span class="k-term">Full motion</span>The sheet rises 40px and settles with ease-out in 300ms. It shows where the sheet came from. Lovely for most people, too much for some.'}
  tog(tb,function(on){sim=on;ui()});
  $(root,'.mr-open').addEventListener('click',function(){open=!open;$(root,'.mr-open').textContent=open?'Close sheet':'Open sheet';
   var fr=open?(sim?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(40px) scale(.96)'},{opacity:1,transform:'none'}]):(sim?[{opacity:1},{opacity:0}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(40px)'}]);
   sh.style.visibility='visible';var a=sh.animate(fr,{duration:open?(sim?200:300):(sim?150:200),easing:open?'cubic-bezier(.2,.8,.2,1)':'cubic-bezier(.4,0,1,1)',fill:'forwards'});
   dim.animate([{opacity:open?0:1},{opacity:open?1:0}],{duration:200,fill:'forwards'});a.onfinish=function(){if(!open)sh.style.visibility='hidden'}});
  ui();
 }}
];

/* motion drill helpers: looping CSS animations built from an easing function (no JS at run time) */
function kf(name,f,dur,dist,prop){var cyc=dur+1300,a=dur/cyc*100,s='@keyframes '+name+'{';
 for(var i=0;i<=12;i++){var t=i/12,p=f(t);s+=(a*t).toFixed(2)+'%{'+(prop==='y'?'transform:translateY('+((1-p)*dist).toFixed(1)+'px);opacity:'+Math.min(1,p*1.6).toFixed(2):'transform:translateX('+(p*dist).toFixed(1)+'px)')+'}'}
 var end=prop==='y'?'transform:translateY(0);opacity:1':'transform:translateX('+dist+'px)';
 s+='88%{'+end+';opacity:1}92%{'+end.replace(/opacity:1/,'')+';opacity:0}93%{'+(prop==='y'?'transform:translateY('+dist+'px)':'transform:translateX(0)')+';opacity:0}100%{'+(prop==='y'?'transform:translateY('+dist+'px)':'transform:translateX(0)')+';opacity:'+(prop==='y'?0:1)+'}}';
 return {css:s,cyc:cyc}}
function animOpt(id,inner,f,dur,dist,prop,sel){var k=kf('vz4k-'+id,f,dur,dist,prop);
 return '<div class="vz4d-'+id+'" style="width:180px;max-width:100%;'+FF+'"><style>'+k.css+
 '@media (prefers-reduced-motion:no-preference){.vz4d-'+id+' '+sel+'{animation:vz4k-'+id+' '+k.cyc+'ms linear infinite}}'+
 '@media (prefers-reduced-motion:reduce){.vz4d-'+id+':hover '+sel+'{animation:vz4k-'+id+' '+k.cyc+'ms linear 1}}</style>'+inner+'</div>'}
var track=function(){return '<div style="position:relative;height:36px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7"><i class="b" style="position:absolute;left:4px;top:4px;width:24px;height:24px;border-radius:50%;background:#E8722C;border:2px solid #14261D;display:block"></i></div>'};
function curve(f,lbl){var d='';for(var i=0;i<=40;i++){var t=i/40;d+=(i?'L':'M')+(10+t*100).toFixed(1)+' '+(100-f(t)*80).toFixed(1)}
 return '<svg width="130" height="118" viewBox="0 0 120 118" aria-hidden="true" style="display:block;background:#FFFDF7;border:2px solid #14261D;border-radius:10px"><path d="M10 100H110M10 20H110" stroke="#4A5A4F" stroke-dasharray="3 3"/><path d="'+d+'" fill="none" stroke="#14261D" stroke-width="4" stroke-linecap="round"/>'+(lbl?'<text x="60" y="114" text-anchor="middle" font-size="9" font-family="Space Mono,monospace" fill="#4A5A4F">'+lbl+'</text>':'')+'</svg>'}
var lin=bezier(0,0,1,1),EI=bezier(.4,0,1,1),EIO=bezier(.65,0,.35,1);
var notif=function(){return [0,1,2,3].map(function(i){return '<div class="n'+i+'" style="height:24px;border:1.5px solid #14261D;border-radius:7px;background:'+['#D6E59A','#C9E0F2','#F6D7E8','#F7DCC4'][i]+';margin-top:6px"></div>'}).join('')};
function listOpt(id,stag){var dur=260,cyc=dur+3*stag+1400,css='';
 for(var i=0;i<4;i++){var st=i*stag/cyc*100,en=(i*stag+dur)/cyc*100;css+='@keyframes vz4k-'+id+i+'{0%,'+st.toFixed(2)+'%{opacity:0;transform:translateY(12px);animation-timing-function:cubic-bezier(.2,.8,.2,1)}'+en.toFixed(2)+'%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}'+
  '@media (prefers-reduced-motion:no-preference){.vz4d-'+id+' .n'+i+'{animation:vz4k-'+id+i+' '+cyc+'ms linear infinite}}@media (prefers-reduced-motion:reduce){.vz4d-'+id+':hover .n'+i+'{animation:vz4k-'+id+i+' '+cyc+'ms linear 1}}'}
 return '<div class="vz4d-'+id+'" style="width:170px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:8px 10px 10px"><style>'+css+'</style>'+mono('NOTIFICATIONS')+notif()+'</div>'}
function shakeOpt(id,amp,dur,n){var cyc=dur+1500,css='@keyframes vz4k-'+id+'{';for(var i=0;i<=n*2;i++){var t=i/(n*2),dec=1-t;css+=(t*dur/cyc*100).toFixed(2)+'%{transform:translateX('+(i===0||i===n*2?0:(i%2?1:-1)*amp*dec).toFixed(1)+'px)}'}css+='100%{transform:none}}';
 return '<div class="vz4d-'+id+'" style="'+FF+'"><style>'+css+'@media (prefers-reduced-motion:no-preference){.vz4d-'+id+' .s{animation:vz4k-'+id+' '+cyc+'ms ease-out infinite}}@media (prefers-reduced-motion:reduce){.vz4d-'+id+':hover .s{animation:vz4k-'+id+' '+cyc+'ms ease-out 1}}</style>'+
 '<div class="s" style="width:170px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:10px;font-size:13px;color:#14261D"><b>Payment failed</b><div style="margin-top:6px;height:30px;border:2px solid #A3361A;border-radius:8px;display:flex;align-items:center;padding:0 8px;font-family:Space Mono,monospace;font-size:12px">5399 •••• 0042</div></div></div>'}
function tabOpt(id,dur){var cyc=dur*2+1800,a=dur/cyc*100,h=50,css='@keyframes vz4k-'+id+'{0%{transform:translateX(0);animation-timing-function:cubic-bezier(.2,.8,.2,1)}'+a.toFixed(2)+'%{transform:translateX(64px)}'+h+'%{transform:translateX(64px);animation-timing-function:cubic-bezier(.2,.8,.2,1)}'+(h+a).toFixed(2)+'%{transform:translateX(0)}100%{transform:translateX(0)}}';
 return '<div class="vz4d-'+id+'" style="'+FF+'width:180px;max-width:100%"><style>'+css+'@media (prefers-reduced-motion:no-preference){.vz4d-'+id+' .u{animation:vz4k-'+id+' '+cyc+'ms linear infinite}}@media (prefers-reduced-motion:reduce){.vz4d-'+id+':hover .u{animation:vz4k-'+id+' '+cyc+'ms linear 1}}</style>'+
 '<div style="position:relative;display:flex;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:8px 6px 12px;font-weight:700;font-size:13px;color:#14261D"><span style="width:64px;text-align:center">Sent</span><span style="width:64px;text-align:center">Received</span><i class="u" style="position:absolute;left:12px;bottom:5px;width:52px;height:4px;border-radius:2px;background:#14261D;display:block"></i></div></div>'}
function exitOpt(id,f,dur){var cyc=1400+dur,h=900/cyc*100,a=dur/cyc*100,css='@keyframes vz4k-'+id+'{0%,'+h.toFixed(2)+'%{opacity:1;transform:none}';
 for(var i=1;i<=12;i++){var t=i/12,p=f(t);css+=(h+a*t).toFixed(2)+'%{opacity:'+(1-p).toFixed(2)+';transform:translateY('+(p*24).toFixed(1)+'px) scale('+(1-p*.04).toFixed(3)+')}'}
 css+='99%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:none}}';
 return '<div class="vz4d-'+id+'" style="'+FF+'"><style>'+css+'@media (prefers-reduced-motion:no-preference){.vz4d-'+id+' .c{animation:vz4k-'+id+' '+cyc+'ms linear infinite}}@media (prefers-reduced-motion:reduce){.vz4d-'+id+':hover .c{animation:vz4k-'+id+' '+cyc+'ms linear 1}}</style><div class="c">'+card('<b>Delete draft?</b><br>This cannot be undone.<div style="margin-top:8px;display:flex;gap:6px"><span style="border:2px solid #14261D;border-radius:8px;padding:3px 8px;font-weight:700">Cancel</span></div>','width:160px')+'</div></div>'}
var RMN='<style>@media (prefers-reduced-motion:reduce){.vz4rm{display:block!important}}</style>'+mono('Hover or tap to play.','display:none;margin-top:6px').replace('<span ','<span class="vz4rm" ');

D['motion']=[
{id:'m-stagger',type:'ab',level:1,q:'Four notifications arrive. Which entrance reads better?',
 a:listOpt('m1a',0),b:listOpt('m1b',70),ok:'b',
 why:'A short stagger (about 40–80ms per item) lets the eye follow the list from top to bottom. Everything at once is just a flash.'},
{id:'m-curve-in',type:'pick',level:1,q:'A side panel slides in. Which easing curve suits it?',
 opts:[curve(lin),curve(EO),curve(EI)],ok:1,
 why:'Things arriving should slow down as they land: ease-out. On the graph that is steep at the start and flat at the end.'},
{id:'m-name-linear',type:'name',level:1,q:'What is this easing called?',
 face:'<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center">'+curve(lin)+animOpt('m3',track(),lin,700,130,'x','.b')+'</div>',
 opts:['Linear','Ease-out','Spring','Ease-in'],ok:0,
 why:'Linear is constant speed, a straight line on the graph. Machines move like that, living things do not, so linear feels robotic in an interface.'},
{id:'m-name-spring',type:'name',level:2,q:'This ball overshoots the line and settles back. What is this motion called?',
 face:'<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center">'+curve(function(t){return spring(t)*.86})+animOpt('m4',track(),function(t){return spring(t)*.85},700,130,'x','.b')+'</div>',
 opts:['Ease-in-out','Spring','Linear','Stagger'],ok:1,
 why:'A spring is physics-based motion: it overshoots a little and settles, like something real. It feels alive. Keep it for playful moments, not errors or payments.'},
{id:'m-exit',type:'ab',level:2,q:'A dialog closes. Which exit feels right?',
 a:exitOpt('m5a',EI,180)+RMN,
 b:exitOpt('m5b',EO,650)+RMN,
 ok:'a',
 why:'Exits should be quicker than entrances and speed up as they leave (ease-in), around 150–200ms. A slow exit blocks whatever the person wants to do next.'},
{id:'m-fix-layout',type:'fix',level:2,q:'This card grows when tapped. On cheap Android phones it stutters. What fixes it?',
 face:card('<b>Order card</b>'+mono('transition: width 400ms, top 400ms;','display:block;margin-top:8px;font-size:11.5px;color:#14261D')+'<div style="margin-top:8px;display:flex;gap:3px">'+[1,0,0,1,0,0,0,1,0,0,1].map(function(x){return '<i style="flex:1;height:14px;background:'+(x?'#14261D':'#E6E1D3')+'"></i>'}).join('')+'</div>'+mono('frames drawn: gaps = stutter','display:block;margin-top:4px'),'width:240px'),
 opts:['Animate transform: scale() and opacity instead','Make it 1200ms so it looks smoother','Add a bounce at the end'],ok:0,
 why:'Width and top force the browser to redo the layout on every frame, so frames get dropped. Transform and opacity are cheap, so the motion stays at a smooth 60 frames per second.'},
{id:'m-200-400',type:'ab',level:3,q:'Watch the tab underline move. Which one feels snappier without being jumpy?',
 a:tabOpt('m7a',420)+RMN,b:tabOpt('m7b',200)+RMN,ok:'b',
 why:'For small moves, about 200ms feels instant yet still visible. At 400ms the underline seems to lag behind your tap. Hard to see once, easy to feel a hundred times a day.'},
{id:'m-shake',type:'pick',level:3,q:'A card payment failed. Which shake is right?',
 opts:[shakeOpt('m8a',22,900,4),shakeOpt('m8b',6,320,3),shakeOpt('m8c',2,140,1)],ok:1,
 why:'An error shake is a quick “no”: a few pixels, about 300ms. A big slow wobble feels playful at a stressful moment; one that is too tiny is missed entirely.'},
{id:'m-reduce',type:'fix',level:3,q:'A banner slides 300px across the screen on every page load. This user has Reduce Motion turned on. What should you do?',
 face:card('<b>Banner</b><br>slides in 300px, spring, on every load.<div style="margin-top:8px;border:1.5px solid #14261D;border-radius:8px;padding:6px 8px;background:#F4F0E5">'+mono('prefers-reduced-motion: ','color:#14261D')+'<b style="font-family:Space Mono,monospace;font-size:11px">reduce</b></div>','width:240px'),
 opts:['Swap the slide for a short fade when reduced motion is on','Keep the slide, it only lasts 300ms','Remove the banner for everyone'],ok:0,
 why:'Reduced motion means less movement, not no feedback. Replace big travel and springs with a gentle fade, and keep everything else the same.'}
];

/* =================== MICRO-INTERACTIONS =================== */
var MST={
 def:['Default','Nothing yet.','A raised border and a hard shadow. That is its <b>affordance</b>: a visual clue that says “you can press me”.'],
 hover:['Hover state','A mouse pointer moves over it.','It lifts 1px and the shadow grows. Phones have no hover, so never hide anything important here.'],
 focus:['Focus ring','The Tab key lands on it.','A 3px blue outline with a small gap. Keyboard users can see exactly where they are.'],
 pressed:['Pressed / active state','A finger or click goes down.','It sinks into its shadow within 100ms. The finger feels “got it”.'],
 loading:['Loading','The tap is sent to the server.','A spinner and “Sending…” on the button itself. It is locked, so nobody pays twice.'],
 success:['Success','The server says it is done.','A check and “Sent” for a moment, then back to normal. No guessing.'],
 disabled:['Disabled','The form is not ready yet.','Faded and not clickable, with a reason underneath so people know what to do next.']};
var MCSS='.vz-micro-states .mb{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;min-width:210px;padding:0 24px;border:2.5px solid #14261D;border-radius:14px;background:#E8722C;color:#14261D;font:700 17px "Instrument Sans",system-ui,sans-serif;box-shadow:4px 4px 0 #14261D;cursor:pointer;transition:transform .1s ease-out,box-shadow .1s ease-out,background-color .15s}'+
 '.vz-micro-states .mb:hover:not(.s-disabled):not(.s-loading),.vz-micro-states .mb.s-hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 #14261D}'+
 '.vz-micro-states .mb:focus{outline:none}.vz-micro-states .mb:focus-visible,.vz-micro-states .mb.s-focus{outline:3px solid #3B82C4;outline-offset:3px}'+
 '.vz-micro-states .mb:active:not(.s-disabled),.vz-micro-states .mb.s-pressed{transform:translate(4px,4px);box-shadow:0 0 0 #14261D}'+
 '.vz-micro-states .mb.s-loading{background:#F7DCC4;cursor:progress}.vz-micro-states .mb.s-success{background:#D6E59A}'+
 '.vz-micro-states .mb.s-disabled{background:#E6E1D3;color:#4A5A4F;border-color:#7C877F;box-shadow:none;cursor:not-allowed;transform:none}'+
 '.vz-micro-states .mb.flat{background:transparent;border-color:transparent;box-shadow:none;font-weight:500}'+
 '.vz-micro-states .sp{width:18px;height:18px;border:2.5px solid #14261D;border-right-color:transparent;border-radius:50%;animation:vz4spin .7s linear infinite}'+
 '@keyframes vz4spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.vz-micro-states .sp{animation-duration:2.4s}}'+
 '.vz-micro-states .ck path{stroke-dasharray:24;stroke-dashoffset:24;animation:vz4draw .3s ease-out forwards}@keyframes vz4draw{to{stroke-dashoffset:0}}'+
 '.vz-micro-states .ms-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}'+
 '.vz-micro-states .ms-t{flex-direction:column;align-items:center;gap:6px;padding:10px 6px;min-height:76px;font-size:12.5px}'+
 '.vz-micro-states .mini{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:24px;min-width:62px;padding:0 8px;border:2px solid #14261D;border-radius:7px;background:#E8722C;font-size:11px;font-weight:700;box-shadow:2px 2px 0 #14261D}';
function mini(s){var st={hover:'transform:translate(-1px,-1px);box-shadow:3px 3px 0 #14261D',focus:'outline:2px solid #3B82C4;outline-offset:2px',pressed:'transform:translate(2px,2px);box-shadow:none',loading:'background:#F7DCC4',success:'background:#D6E59A',disabled:'background:#E6E1D3;color:#4A5A4F;border-color:#7C877F;box-shadow:none'}[s]||'';
 var t=s==='loading'?'…':s==='success'?'Sent':'Send';return '<span class="mini" style="'+st+'">'+t+'</span>'}

V['micro']=[
{id:'micro-states',title:'One button, every state',
 terms:['Hover state','Pressed / active state','Focus ring','Affordance','Trigger','Feedback'],
 intro:'A real button lives in seven states. Each one starts with a trigger (what the person or system does) and answers with feedback (what they see). Designers draw all seven, not just the first.',
 try:'Press the big button for real, or tap any tile to freeze that state. Turn off Affordance and ask: is this still a button?',
 html:BASE+'<div class="vz4 vz-micro-states"><style>'+MCSS+'</style>'+
 '<div class="k-stage" style="display:grid;place-items:center;gap:10px;padding:30px 16px;background:#FFFDF7"><button type="button" class="mb">Send ₦5,000</button><p class="k-note ms-why" style="min-height:20px;text-align:center"></p></div>'+
 '<div class="k-cap ms-cap" aria-live="polite"></div>'+
 '<div class="k-ctl"><span class="k-lab">Freeze a state</span><div class="ms-tiles">'+['def','hover','focus','pressed','loading','success','disabled'].map(function(s){return '<button type="button" class="k-b ms-t" data-s="'+s+'" aria-pressed="'+(s==='def')+'">'+mini(s)+'<span>'+(s==='def'?'Default':s==='pressed'?'Pressed':MST[s][0].replace(' state','').replace(' ring',''))+'</span></button>'}).join('')+'</div></div>'+
 '<div>'+togH('ms-aff','Affordance',true)+'</div></div>',
 init:function(el){
  var root=$(el,'.vz-micro-states'),b=$(root,'.mb'),st='def',tm=[];
  function clear(){tm.forEach(clearTimeout);tm=[]}
  function cap(s){var m=MST[s];$(root,'.ms-cap').innerHTML='<span class="k-term">'+m[0]+'</span><b>Trigger:</b> '+m[1]+'<br><b>Feedback:</b> '+m[2];
   $$(root,'.ms-t').forEach(function(t){t.setAttribute('aria-pressed',String(t.dataset.s===s))})}
  function set(s){st=s;b.className='mb'+(s!=='def'?' s-'+s:'')+($(root,'.ms-aff').getAttribute('aria-pressed')==='true'?'':' flat');
   b.innerHTML=s==='loading'?'<span class="sp" aria-hidden="true"></span>Sending…':s==='success'?'<svg class="ck" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Sent':'Send ₦5,000';
   b.setAttribute('aria-disabled',String(s==='disabled'||s==='loading'));
   $(root,'.ms-why').textContent=s==='disabled'?'Enter the account number first.':'';cap(s)}
  b.addEventListener('pointerdown',function(){if(st==='def')cap('pressed')});
  b.addEventListener('mouseenter',function(){if(st==='def')cap('hover')});
  b.addEventListener('mouseleave',function(){if(st==='def')cap('def')});
  b.addEventListener('focus',function(){if(st==='def'&&b.matches(':focus-visible'))cap('focus')});
  b.addEventListener('click',function(){if(st==='disabled'||st==='loading')return;clear();set('loading');
   tm.push(later(el,function(){set('success');tm.push(later(el,function(){set('def')},1600))},1300))});
  $$(root,'.ms-t').forEach(function(t){t.addEventListener('click',function(){clear();set(t.dataset.s)})});
  tog($(root,'.ms-aff'),function(on){set(st);if(!on)$(root,'.ms-cap').innerHTML='<span class="k-term">Affordance</span>Without the border, fill and shadow, this reads like plain text. Affordance is the visual clue that something can be pressed. Remove it and people stop tapping.'});
  set('def');
 }},

{id:'micro-feedback',title:'Toggles, likes and undo',
 terms:['Optimistic UI','Toast','Undo','Haptics','Delight','Trigger','Feedback'],
 intro:'Four everyday micro-interactions. Each answers “did that work?” in under a tenth of a second. The panel underneath names the trigger, the feedback and the end state of whatever you just did.',
 try:'Flip the switch, tick the box, like the post, delete a draft and then undo it. Turn on “Network fails” and like the post again.',
 html:BASE+'<div class="vz4 vz-micro-feedback"><style>'+
 '.vz-micro-feedback .mf{position:relative;max-width:420px;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:6px 14px 70px;overflow:hidden}'+
 '.vz-micro-feedback .row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:58px;border-bottom:1.5px solid #E6E1D3;font-size:14.5px}'+
 '.vz-micro-feedback .mf-sw{position:relative;width:52px;height:32px;border:2px solid #14261D;border-radius:99px;background:#E6E1D3;flex:none;cursor:pointer;transition:background-color .18s}'+
 '.vz-micro-feedback .mf-sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#FFFDF7;border:2px solid #14261D;transition:transform .18s cubic-bezier(.2,.8,.2,1)}'+
 '.vz-micro-feedback .mf-sw[aria-checked=true]{background:#14261D}.vz-micro-feedback .mf-sw[aria-checked=true]::after{transform:translateX(20px);background:#D6E59A}'+
 '.vz-micro-feedback .cb{width:44px;height:44px;display:grid;place-items:center;background:none;border:0;cursor:pointer;flex:none}'+
 '.vz-micro-feedback .cb i{width:26px;height:26px;border:2px solid #14261D;border-radius:7px;background:#FFFDF7;display:grid;place-items:center;transition:background-color .12s}'+
 '.vz-micro-feedback .cb[aria-checked=true] i{background:#D6E59A}.vz-micro-feedback .cb svg{opacity:0}.vz-micro-feedback .cb[aria-checked=true] svg{opacity:1}'+
 '.vz-micro-feedback .lk{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7;font-weight:700;cursor:pointer;color:#14261D}'+
 '.vz-micro-feedback .lk svg{fill:none}.vz-micro-feedback .lk[aria-pressed=true]{background:#F6D7E8}.vz-micro-feedback .lk[aria-pressed=true] svg{fill:#E8722C}'+
 '.vz-micro-feedback .tr{width:44px;height:44px;display:grid;place-items:center;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;cursor:pointer;flex:none;color:#14261D}'+
 '.vz-micro-feedback .hz{position:absolute;font:700 10px "Space Mono",monospace;background:#14261D;color:#D6E59A;border-radius:5px;padding:1px 5px;pointer-events:none;opacity:0;transition:opacity .15s}'+
 '.vz-micro-feedback .mf-toast{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:10px;justify-content:space-between;background:#14261D;color:#F4F0E5;border-radius:12px;padding:6px 6px 6px 14px;font-size:14px;transform:translateY(80px);transition:transform .22s cubic-bezier(.2,.8,.2,1)}'+
 '.vz-micro-feedback .mf-toast.on{transform:none}.vz-micro-feedback .mf-toast button{min-height:40px;border:0;border-radius:8px;background:#D6E59A;color:#14261D;font-weight:700;padding:0 14px;cursor:pointer}'+
 '.vz-micro-feedback .mf-bar{position:absolute;left:14px;bottom:4px;height:3px;border-radius:2px;background:#D6E59A;width:0}'+
 '.vz-micro-feedback .log{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.vz-micro-feedback .log div{background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:8px 10px;font-size:13.5px;min-width:0}'+
 '@media (max-width:560px){.vz-micro-feedback .log{grid-template-columns:1fr}}'+
 '</style>'+
 '<div>'+togH('mf-net','Network fails',false)+'</div>'+
 '<div class="mf"><div class="row"><span>Transfer alerts <span class="k-note mf-st">On</span></span><button type="button" class="mf-sw" role="switch" aria-checked="true" aria-label="Transfer alerts"></button></div>'+
 '<div class="row"><span>Save Bisi as a recipient</span><button type="button" class="cb" role="checkbox" aria-checked="false" aria-label="Save Bisi as a recipient"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i></button></div>'+
 '<div class="row"><span>Ada’s fabric stall hit 100 sales</span><button type="button" class="lk" aria-pressed="false" aria-label="Like">'+IC.heart+'<span class="n">12</span></button></div>'+
 '<div class="mf-drafts"></div>'+
 '<i class="hz">haptic tick</i><div class="mf-toast" role="status"><span class="tt"></span><button type="button" class="ub">Undo</button><i class="mf-bar"></i></div></div>'+
 '<div class="log"><div><span class="k-lab">Trigger</span><br><span class="l1">Tap anything above.</span></div><div><span class="k-lab">Feedback</span><br><span class="l2">…</span></div><div><span class="k-lab">End state</span><br><span class="l3">…</span></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-micro-feedback'),mf=$(root,'.mf'),toast=$(root,'.mf-toast'),hz=$(root,'.hz'),net=false,tt=0,undoFn=null;
  var drafts=['Invoice for Bisi','Quote for Chidi’s shop'];
  function log(a,b,c){$(root,'.l1').innerHTML=a;$(root,'.l2').innerHTML=b;$(root,'.l3').innerHTML=c}
  function buzz(t){try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}var r=t.getBoundingClientRect(),m=mf.getBoundingClientRect();hz.style.left=(r.left-m.left)+'px';hz.style.top=(r.top-m.top-16)+'px';hz.style.opacity=1;later(el,function(){hz.style.opacity=0},500)}
  function show(msg,undo,ms){clearTimeout(tt);$(toast,'.tt').textContent=msg;undoFn=undo;var ub=$(toast,'.ub');ub.hidden=!undo;ub.textContent=undo?'Undo':'';toast.classList.add('on');
   var bar=$(toast,'.mf-bar');bar.style.transition='none';bar.style.width='calc(100% - 28px)';void bar.offsetWidth;if(!RM()){bar.style.transition='width '+ms+'ms linear';bar.style.width='0'}
   tt=later(el,function(){toast.classList.remove('on');undoFn=null},ms)}
  $(toast,'.ub').addEventListener('click',function(){if(undoFn){undoFn();undoFn=null}clearTimeout(tt);toast.classList.remove('on')});
  tog($(root,'.mf-net'),function(on){net=on});
  var sw=$(root,'.mf-sw');sw.addEventListener('click',function(){var on=sw.getAttribute('aria-checked')!=='true';sw.setAttribute('aria-checked',String(on));$(root,'.mf-st').textContent=on?'On':'Off';buzz(sw);
   log('Tap on the switch.','The knob slides in 180ms, the track fills, the word changes, a <b>haptic</b> tick.','Alerts '+(on?'on':'off')+'. Saved instantly, no Save button.')});
  var cb=$(root,'.cb');cb.addEventListener('click',function(){var on=cb.getAttribute('aria-checked')!=='true';cb.setAttribute('aria-checked',String(on));
   log('Tap on the box.','The box fills and the tick appears.','Bisi is '+(on?'':'not ')+'saved.')});
  var lk=$(root,'.lk'),n=12;lk.addEventListener('click',function(){var on=lk.getAttribute('aria-pressed')!=='true';lk.setAttribute('aria-pressed',String(on));n+=on?1:-1;$(lk,'.n').textContent=n;buzz(lk);
   if(on&&!RM())lk.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
   log('Tap on the heart.','It fills, the count changes and it does a tiny pop: a small moment of <b>delight</b>.',on?'Liked, right away. The server catches up in the background. That is <b>optimistic UI</b>.':'Unliked.');
   if(net&&on)later(el,function(){lk.setAttribute('aria-pressed','false');n-=1;$(lk,'.n').textContent=n;show('Couldn’t save your like. Check your connection.',null,3000);
    log('The server said no.','The heart quietly un-fills and a <b>toast</b> explains why.','Back to how it was. Optimistic UI must always be able to roll back.')},900)});
  function drawDrafts(){$(root,'.mf-drafts').innerHTML=drafts.map(function(d,i){return '<div class="row"><span>Draft: '+d+'</span><button type="button" class="tr" data-i="'+i+'" aria-label="Delete draft: '+d+'">'+IC.trash+'</button></div>'}).join('')||'<div class="row"><span class="k-note">No drafts.</span></div>';
   $$(root,'.tr').forEach(function(t){t.addEventListener('click',function(){var i=+t.dataset.i,d=drafts[i];drafts.splice(i,1);drawDrafts();buzz($(root,'.mf-drafts'));
    show('Draft deleted',function(){drafts.splice(i,0,d);drawDrafts();log('Tap on Undo.','The draft comes straight back.','Nothing lost. <b>Undo</b> is the kindest micro-interaction.')},5000);
    log('Tap on the bin.','The draft goes at once, and a <b>toast</b> offers Undo for 5 seconds.','Deleted, but not gone for good yet. No “Are you sure?” needed.')})})}
  drawDrafts();
 }},

{id:'micro-skeleton',title:'Skeleton or spinner?',
 terms:['Skeleton','Feedback'],
 intro:'Both lists take exactly the same time to load. One shows a lonely spinner; the other shows grey shapes of what is coming: a skeleton.',
 try:'Pick a network speed and press Reload both. Which wait feels shorter? Watch the left box jump when the content arrives.',
 html:BASE+'<div class="vz4 vz-micro-skeleton"><style>'+
 '.vz-micro-skeleton .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'+
 '.vz-micro-skeleton .pane{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:12px;align-self:start}'+
 '.vz-micro-skeleton .r{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1.5px solid #E6E1D3;font-size:14px}.vz-micro-skeleton .r:last-child{border-bottom:0}'+
 '.vz-micro-skeleton .av{width:32px;height:32px;border-radius:50%;flex:none;border:1.5px solid #14261D;display:grid;place-items:center;font-weight:700;font-size:13px}'+
 '.vz-micro-skeleton .r b{margin-left:auto;font-variant-numeric:tabular-nums}'+
 '.vz-micro-skeleton .sk{background:#E6E1D3;border-radius:6px;position:relative;overflow:hidden}.vz-micro-skeleton .av.sk{border-color:transparent}'+
 '.vz-micro-skeleton .sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,253,247,.75),transparent);animation:vz4sh 1.2s ease-in-out infinite}'+
 '@keyframes vz4sh{to{transform:translateX(100%)}}@media (prefers-reduced-motion:reduce){.vz-micro-skeleton .sk::after{animation:none;display:none}}'+
 '.vz-micro-skeleton .spn{display:grid;place-items:center;height:56px}.vz-micro-skeleton .spn i{width:26px;height:26px;border:3px solid #14261D;border-right-color:transparent;border-radius:50%;animation:vz4spin .7s linear infinite}'+
 '@keyframes vz4spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.vz-micro-skeleton .spn i{animation-duration:2.4s}}'+
 '@media (max-width:520px){.vz-micro-skeleton .g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctls">'+segH('spd','Network',[['600','Fast'],['1800','3G'],['3500','Slow']],'1800')+'<button type="button" class="k-b pri sk-go">Reload both</button></div>'+
 '<div class="g"><div><span class="k-lab">Spinner</span><div class="pane p1" style="margin-top:6px"></div></div><div><span class="k-lab">Skeleton</span><div class="pane p2" style="margin-top:6px"></div></div></div>'+
 '<div class="k-cap"><span class="k-term">Skeleton</span>Same wait, but the skeleton feels shorter: you can already see the shape of what is coming, and nothing jumps when it arrives. Use spinners only for small, unknown waits, like a button that is saving.</div></div>',
 init:function(el){
  var root=$(el,'.vz-micro-skeleton'),ms=1800,tm=0;
  var R=[['C','Chidinma Okafor','₦25,000','#D6E59A'],['T','Tunde Bakare','₦5,000','#C9E0F2'],['B','Bisi Adeyemi','₦12,500','#F6D7E8']];
  var rows=R.map(function(r){return '<div class="r"><span class="av" style="background:'+r[3]+'">'+r[0]+'</span>'+r[1]+'<b>'+r[2]+'</b></div>'}).join('');
  var sk=R.map(function(r,i){return '<div class="r"><span class="av sk"></span><span class="sk" style="height:12px;width:'+[58,46,52][i]+'%"></span><span class="sk" style="height:12px;width:54px;margin-left:auto"></span></div>'}).join('');
  function go(){clearTimeout(tm);$(root,'.p1').innerHTML='<div class="spn"><i aria-label="Loading"></i></div>';$(root,'.p2').innerHTML=sk;
   tm=later(el,function(){$(root,'.p1').innerHTML=rows;$(root,'.p2').innerHTML=rows},ms)}
  seg(root,'spd',function(v){ms=+v;go()});$(root,'.sk-go').addEventListener('click',go);
  $(root,'.p1').innerHTML=rows;$(root,'.p2').innerHTML=rows;onVisible(root,function(){later(el,go,200)});
 }}
];

/* micro drills */
var mb=function(t,s){return pbtn(t,'min-width:150px;'+(s||''))};
D['micro']=[
{id:'mi-press',type:'ab',level:1,q:'A finger is on each button right now. Which one shows it is being pressed?',
 a:'<div style="padding:6px">'+mb('Pay ₦12,000','transform:translate(3px,3px);box-shadow:0 0 0 #14261D')+'</div>',b:'<div style="padding:6px">'+mb('Pay ₦12,000')+'</div>',ok:'a',
 why:'A pressed state (sinking into its shadow, or darkening) tells the finger “got it” within 100ms. Without it, people tap again to be sure.'},
{id:'mi-focus',type:'pick',level:1,q:'You pressed Tab. Which button shows keyboard focus clearly?',
 opts:['<div style="padding:8px">'+mb('Continue')+'</div>','<div style="padding:8px">'+mb('Continue','outline:1px dotted #9AA39C;outline-offset:1px')+'</div>','<div style="padding:8px">'+mb('Continue','outline:3px solid #3B82C4;outline-offset:3px')+'</div>'],ok:2,
 why:'A focus ring must be easy to see: a thick, high-contrast outline with a small gap. No outline, or a faint dotted one, leaves keyboard users lost.'},
{id:'mi-name-skel',type:'name',level:1,q:'What are these grey shapes called?',
 face:card([60,45,52].map(function(w){return '<div style="display:flex;gap:8px;align-items:center;margin:8px 0"><i style="width:28px;height:28px;border-radius:50%;background:#E6E1D3;display:block"></i><i style="height:11px;width:'+w+'%;background:#E6E1D3;border-radius:5px;display:block"></i><i style="height:11px;width:44px;margin-left:auto;background:#E6E1D3;border-radius:5px;display:block"></i></div>'}).join('')),
 opts:['Skeleton','Spinner','Toast','Empty state'],ok:0,
 why:'A skeleton is a grey placeholder in the shape of the content that is loading. It feels faster than a spinner and stops the page jumping when the content lands.'},
{id:'mi-name-toast',type:'name',level:2,q:'What is this small message at the bottom called?',
 face:'<div style="width:230px;max-width:100%;height:150px;position:relative;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;'+FF+'"><div style="position:absolute;left:10px;right:10px;bottom:10px;display:flex;justify-content:space-between;align-items:center;background:#14261D;color:#F4F0E5;border-radius:10px;padding:6px 6px 6px 12px;font-size:13px">Draft deleted<span style="background:#D6E59A;color:#14261D;font-weight:700;border-radius:7px;padding:5px 10px">Undo</span></div></div>',
 opts:['Modal','Toast','Tooltip','Banner'],ok:1,
 why:'A toast is a small, temporary message that pops up and leaves by itself. Paired with Undo, it replaces most “Are you sure?” dialogs.'},
{id:'mi-fix-pay',type:'fix',level:2,q:'After tapping, nothing changes for 4 seconds while the server works. Some people tap again and pay twice. What is the fix?',
 face:'<div style="text-align:center">'+mb('Pay ₦12,000')+mono('tapped 4 seconds ago…','display:block;margin-top:10px')+'</div>',
 opts:['Show a spinner and “Paying…” on the button and lock it until done','Add a hover effect to the button','Show a full-screen “Are you sure?” dialog first'],ok:0,
 why:'Feedback must come from the button that was tapped, straight away. A loading state that also locks the button answers “did that work?” and prevents double payments.'},
{id:'mi-optimistic',type:'ab',level:2,q:'You just tapped the heart. Which response feels better?',
 a:card('Ada’s stall hit 100 sales<div style="margin-top:8px;display:inline-flex;gap:6px;align-items:center;border:2px solid #14261D;border-radius:99px;padding:4px 10px;background:#F6D7E8;font-weight:700"><svg width="18" height="18" viewBox="0 0 24 24" fill="#E8722C" stroke="#14261D" stroke-width="2"><path d="M12 20s-7.5-4.6-9-9.3C2 7.3 4.3 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3 0 5.3 2.8 4.3 6.2C19.5 15.4 12 20 12 20z"/></svg>13</div>','width:190px'),
 b:card('Ada’s stall hit 100 sales<div style="margin-top:8px;display:inline-flex;gap:6px;align-items:center;border:2px solid #14261D;border-radius:99px;padding:4px 10px;font-weight:700"><i style="width:16px;height:16px;border:2.5px solid #14261D;border-right-color:transparent;border-radius:50%;display:block"></i>Saving…</div>','width:190px'),ok:'a',
 why:'For small actions that almost always succeed, show the result at once and let the server catch up (optimistic UI). If it fails, quietly roll back and explain.'},
{id:'mi-copied',type:'pick',level:2,q:'Someone taps “Copy account number”. Which feedback fits?',
 opts:[card('<div style="text-align:center;padding:6px 0"><b style="font-size:17px">Amazing!</b><br>You copied it!<div style="margin:8px auto 0;width:110px;height:28px;background:repeating-linear-gradient(45deg,#E8722C 0 6px,#D6E59A 6px 12px,#C9E0F2 12px 18px);border-radius:6px"></div>'+mono('full-screen confetti','display:block;margin-top:6px')+'</div>','width:180px'),
  card('0123456789<div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;border:2px solid #14261D;border-radius:8px;padding:4px 10px;background:#D6E59A;font-weight:700">'+IC.check+'Copied</div>','width:180px'),
  card('0123456789<br><div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;border:2px solid #14261D;border-radius:8px;padding:4px 10px;font-weight:700">Copy</div>'+mono('(nothing changes)','display:block;margin-top:6px'),'width:180px')],ok:1,
 why:'Match the size of the feedback to the size of the action. A small “Copied” with a check for about 1.5 seconds is enough. Save delight for rare, big moments.'},
{id:'mi-clip',type:'ab',level:3,q:'Both buttons have keyboard focus. Which one is done right?',
 a:'<div style="width:190px;max-width:100%;overflow:hidden;border:2px solid #14261D;border-radius:12px;background:#FFFDF7;padding:10px 0">'+'<div style="display:flex;justify-content:center">'+mb('Continue','min-width:186px;outline:3px solid #3B82C4;outline-offset:3px;box-shadow:none')+'</div></div>',
 b:'<div style="width:190px;max-width:100%;border:2px solid #14261D;border-radius:12px;background:#FFFDF7;padding:10px 14px">'+'<div style="display:flex;justify-content:center">'+mb('Continue','min-width:140px;outline:3px solid #3B82C4;outline-offset:3px;box-shadow:none')+'</div></div>',ok:'b',
 why:'In A the card edge cuts the focus ring off on both sides. Rings need room: check every focus state, because a parent with hidden overflow can clip it.'},
{id:'mi-shift',type:'pick',level:3,q:'Each button is being hovered. Which hover effect is calm and moves nothing else?',
 opts:[0,1,2].map(function(k){var bs=['border-width:4px;padding:0 12px;','box-shadow:4px 4px 0 #14261D;transform:translate(-1px,-1px);','transform:scale(1.15);'][k];return '<div style="width:170px;'+FF+'font-size:12px;color:#14261D">'+mono('hovered:','display:block;margin-bottom:4px')+'<span style="display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border:2px solid #14261D;border-radius:9px;background:#E8722C;font-weight:700;font-size:13px;'+bs+'">Save</span><div style="border-top:1.5px dashed #4A5A4F;margin-top:'+(k===0?10:6)+'px;padding-top:4px">Text below the button</div></div>'}),ok:1,
 why:'Hover should change only the button itself, with shadow, colour or transform. A thicker border grows the box and shoves the content below it; a big scale crashes into neighbours.'}
];

/* =================== LOGO =================== */
var COIN='M10 50a40 40 0 1 0 80 0a40 40 0 1 0-80 0z',ARR='M50 22L73 46H57V76H43V46H27Z',COINF='M4 50a46 46 0 1 0 92 0a46 46 0 1 0-92 0z',ARRF='M50 13L81 48H61V83H39V48H19Z';
function mark(fill,size,o){o=o||{};var d=o.fav?COINF+ARRF:COIN+ARR;
 return '<svg viewBox="0 0 100 100" width="'+size+'" height="'+size+'" aria-hidden="true" style="display:block;flex:none;'+(o.st||'')+'"><path fill-rule="evenodd" fill="'+fill+'" d="'+d+'"'+(o.edge?' stroke="'+o.edge+'" stroke-width="3" stroke-linejoin="round"':'')+'/>'+(o.neg?'<path d="'+ARR+'" fill="#D6E59A" stroke="#14261D" stroke-width="2" stroke-dasharray="4 3"/>':'')+'</svg>'}
var wm=function(size,col){return '<span style="font:800 '+size+'px/0.9 \'Bricolage Grotesque\',\'Instrument Sans\',system-ui,sans-serif;letter-spacing:-.04em;color:'+col+';white-space:nowrap">lumo</span>'};
var lmark=function(size,fill,ink){return '<svg viewBox="0 0 100 100" width="'+size+'" height="'+size+'" aria-hidden="true" style="display:block;flex:none"><rect x="6" y="6" width="88" height="88" rx="24" fill="'+fill+'" stroke="'+ink+'" stroke-width="4"/><path d="M36 24h15v37h21v15H36z" fill="'+ink+'"/></svg>'};
function lockup(kind,h,c,o){c=c||{f:'#E8722C',e:'#14261D',w:'#14261D'};o=o||{};
 if(kind==='sym')return mark(c.f,h,{edge:c.e,neg:o.neg});
 if(kind==='wm')return wm(h*.8,c.w);
 if(kind==='lm')return lmark(h,c.f,c.w);
 if(kind==='h')return '<span style="display:inline-flex;align-items:center;gap:'+(h*.22)+'px">'+mark(c.f,h,{edge:c.e,neg:o.neg})+wm(h*.78,c.w)+'</span>';
 return '<span style="display:inline-flex;flex-direction:column;align-items:center;gap:'+(h*.12)+'px">'+mark(c.f,h,{edge:c.e,neg:o.neg})+wm(h*.5,c.w)+'</span>'}

V['logo']=[
{id:'logo-anatomy',title:'Logo types and anatomy',
 terms:['Symbol / brandmark','Wordmark','Lettermark / monogram','Combination mark','Lockup','Clear space','Negative space'],
 intro:'Meet Lumo, a made-up savings app. The same brand can show up as a symbol, a wordmark, a lettermark or a combination of symbol and name. Each has a job.',
 try:'Switch between the five forms. Turn on Clear space and Negative space to see the hidden rules.',
 html:BASE+'<div class="vz4 vz-logo-anatomy"><style>'+
 '.vz-logo-anatomy .la-st{display:grid;place-items:center;min-height:260px;background:#FFFDF7}'+
 '.vz-logo-anatomy .la-box{position:relative;display:inline-flex}'+
 '.vz-logo-anatomy .la-in{display:inline-flex;outline:1.5px dotted transparent}'+
 '.vz-logo-anatomy .on .la-box{outline:2px dashed #14261D;background:repeating-linear-gradient(45deg,rgba(201,224,242,.55) 0 6px,transparent 6px 12px)}'+
 '.vz-logo-anatomy .on .la-in{outline-color:#4A5A4F;background:#FFFDF7}'+
 '.vz-logo-anatomy .x{position:absolute;display:none;place-items:center;background:#C9E0F2;border:1.5px solid #14261D;font:700 11px "Space Mono",monospace}'+
 '.vz-logo-anatomy .on .x{display:grid}'+
 '</style>'+
 segH('t','Form',[['sym','Symbol'],['wm','Wordmark'],['lm','Lettermark'],['h','Horizontal lockup'],['s','Stacked lockup']],'h')+
 '<div class="k-ctls">'+togH('la-cs','Clear space',false)+togH('la-ns','Negative space',false)+'</div>'+
 '<div class="k-stage la-st"><div class="la-wrap"></div></div><div class="k-cap la-cap"></div></div>',
 init:function(el){
  var root=$(el,'.vz-logo-anatomy'),t='h',cs=false,ns=false;
  var C={sym:['Symbol / brandmark','An icon with no words. It must carry the brand alone, so it has to be simple and memorable. Lumo’s symbol is a coin with an arrow: one idea, money that grows.'],
   wm:['Wordmark','Just the name, styled. Great when the name is short and distinctive. Here: lowercase, very heavy, letters set tightly.'],
   lm:['Lettermark / monogram','Initials as a logo. Useful when a name is long, or as a small app icon.'],
   h:['Combination mark · Lockup','Symbol plus wordmark is a combination mark. Fixing their size and gap so nobody rearranges them makes it a lockup.'],
   s:['Lockup (stacked)','The same parts in a second fixed arrangement, for square spaces like a profile picture or a splash screen.']};
  function draw(){var wrap=$(root,'.la-wrap'),w=window.innerWidth<520,h=w?60:84,sz={sym:h*1.4,wm:h*1.1,lm:h*1.3,h:h,s:h}[t],x=Math.round(sz*.25);
   wrap.className='la-wrap'+(cs?' on':'');
   wrap.innerHTML='<div class="la-box" style="padding:'+x+'px"><div class="la-in">'+lockup(t,sz,null,{neg:ns})+'</div>'+
    ['top:0;left:50%;margin-left:-'+x/2+'px','bottom:0;left:50%;margin-left:-'+x/2+'px','left:0;top:50%;margin-top:-'+x/2+'px','right:0;top:50%;margin-top:-'+x/2+'px'].map(function(p){return '<i class="x" style="width:'+x+'px;height:'+x+'px;'+p+'">x</i>'}).join('')+'</div>';
   var c='<span class="k-term">'+C[t][0]+'</span>'+C[t][1];
   if(cs)c+='<br><span class="k-term">Clear space</span>The striped area must stay empty. Here x is a quarter of the logo’s height. No text, edges or other logos may enter it.';
   if(ns)c+=(t==='wm'||t==='lm')?'<br><span class="k-term">Negative space</span>Pick a form with the symbol to see it.':'<br><span class="k-term">Negative space</span>Nobody drew an arrow. It is the empty part of the coin, highlighted here. Your eye fills it in.';
   $(root,'.la-cap').innerHTML=c}
  seg(root,'t',function(v){t=v;draw()});tog($(root,'.la-cs'),function(o){cs=o;draw()});tog($(root,'.la-ns'),function(o){ns=o;draw()});draw();
 }},

{id:'logo-scale',title:'From billboard to browser tab',
 terms:['Scalability','Favicon','Optical correction'],
 intro:'A logo is used tiny far more often than big. A responsive logo swaps to a simpler form as space shrinks. At 16 pixels, every pixel counts.',
 try:'Drag the slider down from 160px to 16px and watch where the logo switches form. Then compare the three favicons under the magnifier.',
 html:BASE+'<div class="vz4 vz-logo-scale"><style>'+
 '.vz-logo-scale .ls-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}'+
 '.vz-logo-scale .ls-cell{background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:10px;display:grid;gap:8px;justify-items:center;align-content:start;min-height:220px}'+
 '.vz-logo-scale .ls-sq{display:grid;place-items:center;outline:2px dashed #4A5A4F;outline-offset:2px;overflow:hidden;background:#F4F0E5}'+
 '.vz-logo-scale .ls-lad{display:grid;gap:4px;font-size:13.5px}.vz-logo-scale .ls-lad div{border:1.5px solid #14261D;border-radius:8px;padding:6px 10px;background:#FFFDF7}.vz-logo-scale .ls-lad div.on{background:#D6E59A;font-weight:700}'+
 '.vz-logo-scale .tab{display:flex;align-items:center;gap:8px;max-width:260px;background:#FFFDF7;border:2px solid #14261D;border-bottom:0;border-radius:10px 10px 0 0;padding:8px 12px;font-size:13px}'+
 '.vz-logo-scale .tabbar{background:#E6E1D3;border:2px solid #14261D;border-radius:12px;padding:10px 10px 0}'+
 '.vz-logo-scale canvas.z{width:128px;height:128px;image-rendering:pixelated;border:2px solid #14261D;border-radius:8px;background:#FFFDF7}'+
 '.vz-logo-scale canvas.a{width:16px;height:16px;flex:none}'+
 '@media (max-width:520px){.vz-logo-scale .ls-g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctl"><div style="display:flex;justify-content:space-between"><span class="k-lab">Space for the logo</span><b class="k-mono ls-v">120px</b></div><input type="range" class="ls-r" min="16" max="160" value="120" aria-label="Space for the logo in pixels"></div>'+
 '<div class="ls-g"><div class="ls-cell"><span class="k-lab">Always the full lockup</span><div class="ls-sq ls-a"></div><span class="k-note ls-an" style="text-align:center"></span></div>'+
 '<div class="ls-cell"><span class="k-lab">Responsive logo</span><div class="ls-sq ls-b"></div><span class="k-note ls-bn" style="text-align:center"></span></div></div>'+
 '<div class="ls-lad"><div data-l="3">112px and up: stacked lockup (its minimum size)</div><div data-l="2">32 to 111px: symbol only (minimum 32px)</div><div data-l="1">Under 32px: favicon cut, drawn thicker on purpose</div></div>'+
 segH('fv','Favicon',[['ai','Detailed AI logo'],['sh','Our symbol, just shrunk'],['fv','Favicon cut']],'fv')+
 '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end"><div class="tabbar"><div class="tab"><canvas class="a" width="16" height="16" aria-hidden="true"></canvas><span>Lumo · Savings</span></div></div>'+
 '<div><span class="k-lab">The same 16 pixels, 8× bigger</span><br><canvas class="z" width="16" height="16" role="img" aria-label="Favicon magnified"></canvas></div></div>'+
 '<div class="k-cap ls-cap"></div></div>',
 init:function(el){
  var root=$(el,'.vz-logo-scale'),fv='fv';
  function draw(){var s=+$(root,'.ls-r').value;$(root,'.ls-v').textContent=s+'px';
   var a=$(root,'.ls-a'),b=$(root,'.ls-b');[a,b].forEach(function(q){q.style.width=q.style.height=s+'px'});
   a.innerHTML=lockup('h',s/3.1);$(root,'.ls-an').textContent=s<112?'The name is now '+Math.round(s/3.1*.78*.5)+'px tall: unreadable.':'Fits, but wastes the square.';
   var lv=s>=112?3:s>=32?2:1;b.innerHTML=lv===3?lockup('s',s*.55):lv===2?mark('#E8722C',s*.86,{edge:'#14261D'}):mark('#14261D',s*.94,{fav:true});
   $(root,'.ls-bn').textContent=['','Favicon cut: thicker arrow, bigger coin.','Symbol only: the name would be too small.','Stacked lockup: it all fits.'][lv];
   $$(root,'.ls-lad [data-l]').forEach(function(d){d.classList.toggle('on',+d.dataset.l===lv)})}
  function fav(){$$(root,'canvas').forEach(function(cv){var x=cv.getContext('2d');if(!x)return;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,16,16);x.scale(.16,.16);
   if(fv==='ai'){var g=x.createRadialGradient(40,35,5,50,50,50);g.addColorStop(0,'#F7DCC4');g.addColorStop(.5,'#E8722C');g.addColorStop(1,'#F6D7E8');x.fillStyle=g;x.beginPath();x.arc(50,50,47,0,7);x.fill();
    x.strokeStyle='#14261D';x.lineWidth=2;x.beginPath();x.arc(50,50,40,0,7);x.stroke();x.lineWidth=1.5;x.beginPath();x.moveTo(30,70);x.bezierCurveTo(35,40,60,30,72,28);x.moveTo(40,60);x.lineTo(52,48);x.moveTo(48,64);x.lineTo(62,52);x.stroke();
    x.fillStyle='#14261D';x.font='bold 12px sans-serif';x.fillText('LUMO',30,86);x.font='7px sans-serif';x.fillText('SAVINGS CO.',31,94);x.fillStyle='#FFFDF7';[[28,30],[70,62],[60,22]].forEach(function(p){x.beginPath();x.arc(p[0],p[1],3,0,7);x.fill()})}
   else{x.fillStyle='#14261D';x.fill(new Path2D(fv==='fv'?COINF+ARRF:COIN+ARR),'evenodd')}})
   $(root,'.ls-cap').innerHTML={ai:'<span class="k-term">Favicon</span>Gradients, thin lines and tiny text turn to mush at 16px. You cannot tell what it is.',
    sh:'<span class="k-term">Scalability</span>Better, but the arrow is only 2 pixels wide, so it blurs into the coin. Simply shrinking a big logo is not enough.',
    fv:'<span class="k-term">Optical correction</span>For tiny sizes the mark is redrawn: the coin fills the square and the arrow is made thicker so the gap stays open. It looks the same idea, but it is built for 16px.'}[fv]}
  var r=$(root,'.ls-r');r.addEventListener('input',draw);seg(root,'fv',function(v){fv=v;fav()});draw();fav();
 }},

{id:'logo-bg',title:'Backgrounds, reversed and one colour',
 terms:['Reversed','Optical correction'],
 intro:'A logo must survive every surface it lands on. Most brands keep three versions: full colour, one colour, and reversed (light on dark).',
 try:'Try each version on each background and read the verdict. Then switch on optical correction for the circle and square.',
 html:BASE+'<div class="vz4 vz-logo-bg"><style>'+
 '.vz-logo-bg .lb-st{display:grid;place-items:center;min-height:180px;border:2px solid #14261D;border-radius:14px;transition:background-color .2s}'+
 '.vz-logo-bg .oc{display:flex;gap:28px;align-items:center;justify-content:center;position:relative;padding:18px 0;background:#FFFDF7;border:2px solid #14261D;border-radius:14px}'+
 '.vz-logo-bg .oc .gd{position:absolute;left:12px;right:12px;height:0;border-top:1.5px dashed #AD4F16}'+
 '</style>'+
 '<div class="k-ctls">'+segH('bg','Background',[['#F4F0E5','Cream'],['#FFFFFF','White'],['#14261D','Forest'],['#E8722C','Terracotta'],['photo','Photo']],'#F4F0E5')+segH('vr','Version',[['full','Full colour'],['one','One colour'],['rev','Reversed']],'full')+'</div>'+
 '<div class="lb-st"></div><div class="k-cap lb-cap"></div>'+
 '<div class="k-ctl"><span class="k-lab">Optical correction</span><div class="oc"><i class="gd" style="top:30px"></i><i class="gd" style="top:110px"></i><span class="cc" style="display:block;border-radius:50%;background:#14261D"></span><span style="display:block;width:80px;height:80px;background:#14261D"></span></div></div>'+
 '<div>'+togH('lb-oc','Correct the circle',false)+'</div><div class="k-cap lb-occ"></div></div>',
 init:function(el){
  var root=$(el,'.vz-logo-bg'),bg='#F4F0E5',vr='full';
  var PH='radial-gradient(circle at 20% 30%,#7FA37A 0 18%,transparent 19%),radial-gradient(circle at 75% 60%,#F7DCC4 0 22%,transparent 23%),radial-gradient(circle at 50% 90%,#2E4A3A 0 25%,transparent 26%),linear-gradient(120deg,#C9E0F2,#E8722C 45%,#14261D)';
  function draw(){var col={full:{f:'#E8722C',e:'#14261D',w:'#14261D'},one:{f:'#14261D',e:null,w:'#14261D'},rev:{f:'#F4F0E5',e:null,w:'#F4F0E5'}}[vr];
   var st=$(root,'.lb-st');st.style.background=bg==='photo'?PH:bg;st.innerHTML=lockup('h',window.innerWidth<520?52:72,col);
   var c;if(bg==='photo')c='<span class="k-term">Photo</span>On a photo the contrast changes across the image, so parts of the logo vanish. Use the one-colour or reversed version on a calm area, or put it on a solid panel.';
   else{var main=cr(col.f,bg),word=cr(col.w,bg),edge=col.e?cr(col.e,bg):0,best=Math.max(main,edge);
    c='<span class="k-term">'+(vr==='rev'?'Reversed':vr==='one'?'One colour':'Full colour')+'</span>Symbol '+best.toFixed(1)+':1, name '+word.toFixed(1)+':1 against the background. ';
    c+=Math.min(best,word)>=3?'<b>Clear.</b> Both read at a glance.':Math.min(best,word)>=1.6?'<b>Faint.</b> Logos are exempt from contrast rules, but a faint logo is a weak logo. Try another version.':'<b>Invisible.</b> Part of the logo melts into the background. Switch version.';
    if(vr==='full'&&main<3&&edge>=3)c+=' The coin’s fill is faint here; its dark outline is what holds the shape.'}
   $(root,'.lb-cap').innerHTML=c}
  function oc(on){var cc=$(root,'.cc'),d=on?88:80;cc.style.width=cc.style.height=d+'px';
   $(root,'.lb-occ').innerHTML=on?'<span class="k-term">Optical correction</span>Now the circle is 10% bigger and pokes past the guides on purpose. They finally look the same size. Letters like O and S do the same: they overshoot the line.':'Both shapes are exactly 80px tall, between the same guides. But the circle looks smaller, because it touches the guides only at one point.'}
  seg(root,'bg',function(v){bg=v;draw()});seg(root,'vr',function(v){vr=v;draw()});tog($(root,'.lb-oc'),oc);draw();oc(false);
 }}
];

/* logo drills */
var tabFav=function(inner){return '<div style="'+FF+'width:200px;max-width:100%;background:#E6E1D3;border:2px solid #14261D;border-radius:10px;padding:8px 8px 0"><div style="display:flex;gap:7px;align-items:center;background:#FFFDF7;border:2px solid #14261D;border-bottom:0;border-radius:8px 8px 0 0;padding:7px 9px;font-size:12px;color:#14261D">'+inner+'<span>Lumo · Savings</span></div></div>'};
var busy='<svg viewBox="0 0 100 100" width="16" height="16" aria-hidden="true" style="flex:none"><defs><linearGradient id="vz4g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7DCC4"/><stop offset=".5" stop-color="#E8722C"/><stop offset="1" stop-color="#F6D7E8"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#vz4g1)"/><circle cx="50" cy="50" r="38" fill="none" stroke="#14261D" stroke-width="1.5"/><path d="M30 70C35 40 60 30 72 28M40 60l12-12M48 64l14-12" stroke="#14261D" stroke-width="1.2" fill="none"/><text x="30" y="88" font-size="10" fill="#14261D">LUMO</text></svg>';
var thin='<svg viewBox="0 0 100 100" width="16" height="16" aria-hidden="true" style="flex:none"><circle cx="50" cy="50" r="40" fill="none" stroke="#14261D" stroke-width="3"/><path d="M36 30v40M36 70h26M58 30v40" stroke="#14261D" stroke-width="3" fill="none"/></svg>';
var dl=function(c){return '<div style="display:flex;justify-content:center;padding:6px">'+c+'</div>'};
D['logo']=[
{id:'lg-name-wm',type:'name',level:1,q:'This logo is only the brand name, styled. What is it called?',
 face:'<div style="background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:22px 28px">'+wm(56,'#14261D')+'</div>',
 opts:['Wordmark','Symbol / brandmark','Lettermark / monogram','Combination mark'],ok:0,
 why:'A wordmark is the name set in a chosen typeface, with no icon. It works best when the name is short and distinctive.'},
{id:'lg-fav',type:'pick',level:1,q:'Which logo is still readable as a 16px favicon in a browser tab?',
 opts:[tabFav(busy),tabFav(mark('#14261D',16,{fav:true})),tabFav(thin)],ok:1,
 why:'At 16px, thin lines, gradients and tiny text collapse into a smudge. Bold, simple shapes with wide gaps stay recognisable. Design small first.'},
{id:'lg-clear',type:'ab',level:1,q:'Which header respects the logo’s clear space?',
 a:'<div style="width:220px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:4px;display:flex;align-items:center;gap:2px;'+FF+'font-size:12px;color:#14261D">'+lockup('h',26)+'<span style="border-left:1.5px solid #14261D;padding-left:3px">Home · Save · Help</span></div>',
 b:'<div style="width:220px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;'+FF+'font-size:12px;color:#14261D">'+lockup('h',22)+'<span>Home · Save</span></div>',ok:'b',
 why:'Clear space is the empty zone around a logo that nothing may enter. Crammed against edges and links, even a good logo looks cheap.'},
{id:'lg-name-rev',type:'name',level:2,q:'The logo is shown in a light colour on a dark background. What is this version called?',
 face:'<div style="background:#14261D;border-radius:12px;padding:22px 26px">'+lockup('h',44,{f:'#F4F0E5',e:null,w:'#F4F0E5'})+'</div>',
 opts:['Reversed','Negative space','Lockup','Favicon'],ok:0,
 why:'A reversed logo flips to light on dark so it stays visible on dark backgrounds. Every logo needs a tested reversed version.'},
{id:'lg-name-neg',type:'name',level:2,q:'Look at the highlighted arrow inside the coin. What is this technique called?',
 face:'<div style="background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:16px">'+mark('#E8722C',110,{edge:'#14261D',neg:true})+'</div>',
 opts:['Negative space','Clear space','Optical correction','Gradient'],ok:0,
 why:'Negative space uses the empty area inside or around a shape to form a second idea. It adds meaning without adding detail, so the mark stays simple.'},
{id:'lg-fix-small',type:'fix',level:2,q:'The full lockup is squeezed into a 32px app bar slot. What is the fix?',
 face:'<div style="'+FF+'width:240px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:10px;display:flex;align-items:center;gap:10px;font-size:13px;color:#14261D"><span style="width:32px;height:32px;display:grid;place-items:center;outline:1.5px dashed #4A5A4F;flex:none">'+lockup('h',9)+'</span><b>Savings</b></div>',
 opts:['Use the symbol on its own at this size','Shrink the name further so it fits','Add a tagline under it'],ok:0,
 why:'Every lockup has a minimum size. Below it, switch to the symbol only, so the logo stays readable instead of becoming a smudge.'},
{id:'lg-stretch',type:'fix',level:2,q:'Someone stretched the logo to fill a wide banner. What should they do instead?',
 face:'<div style="width:240px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px 6px;display:flex;justify-content:center"><span style="display:inline-block;transform:scaleX(1.7);transform-origin:center">'+lockup('h',26)+'</span></div>',
 opts:['Scale it evenly and leave clear space around it','Stretch the symbol too so it matches','Add a drop shadow so it stands out'],ok:0,
 why:'Never stretch, squash, recolour or add effects to a logo. Scale it proportionally and let empty space do the work.'},
{id:'lg-optic',type:'ab',level:3,q:'Which pair looks like the same size?',
 a:'<div style="display:flex;gap:16px;align-items:center;padding:8px 4px;position:relative"><span style="width:64px;height:64px;border-radius:50%;background:#14261D;display:block"></span><span style="width:64px;height:64px;background:#14261D;display:block"></span></div>',
 b:'<div style="display:flex;gap:16px;align-items:center;padding:8px 4px;position:relative"><span style="width:70px;height:70px;border-radius:50%;background:#14261D;display:block"></span><span style="width:64px;height:64px;background:#14261D;display:block"></span></div>',ok:'b',
 why:'A circle touches its edges at only one point, so at the same height it looks smaller than a square. Make round shapes slightly bigger: that is optical correction.'},
{id:'lg-bg',type:'pick',level:3,q:'The logo has to sit on a peach card. Which version reads best?',
 opts:['<div style="background:#F7DCC4;border-radius:10px;padding:18px 16px">'+lockup('h',30,{f:'#E8722C',e:null,w:'#E8722C'})+'</div>','<div style="background:#F7DCC4;border-radius:10px;padding:18px 16px">'+lockup('h',30,{f:'#14261D',e:null,w:'#14261D'})+'</div>','<div style="background:#F7DCC4;border-radius:10px;padding:18px 16px">'+lockup('h',30,{f:'#FFFDF7',e:null,w:'#FFFDF7'})+'</div>'],ok:1,
 why:'Terracotta on peach is about 2:1 and cream on peach is barely visible. On coloured backgrounds, switch to the one-colour dark version: aim for at least 3:1.'}
];

/* =================== VOICE & MICROCOPY =================== */
var VX={
 rob:{t:['Beneficiary Management','Beneficiary Management'],e:'No records found.',es:'0 beneficiaries exist in the database.',lab:'Acct. No.',err:'ERR_422: Validation failed. Invalid input detected.',b:['Submit','Submit'],
  n:['<b>Jargon.</b> “Beneficiary” is bank-speak. Your users say “people I send money to”.','<b>Empty state</b> that teaches nothing. Database words, no next step.','<b>Error message</b> with a code, no reason and no fix. Passive voice hides who did what.','<b>CTA</b> (call to action) “Submit” does not say what will happen.']},
 vag:{t:['Let’s get started!','Let’s Get Started!'],e:'Oops! Nothing here yet.',es:'Start your amazing journey today!',lab:'Account number',err:'Oops! Something went wrong.',b:['Continue','Continue'],
  n:['Cheerful, but says nothing. Where am I?','Fluff. Which journey? What should I do?','“Oops” plus no reason. The <b>tone</b> is far too playful for money.','<b>CTA</b> “Continue” to where?']},
 hum:{t:['Saved recipients','Saved Recipients'],e:'No saved recipients yet',es:'Save someone once, then send them money in two taps.',lab:'Account number',err:'Account numbers have 10 digits. You entered 9.',b:['Save recipient','Save Recipient'],
  n:['<b>Plain language:</b> the words people already use.','<b>Empty state</b> that teaches the next step and the benefit.','<b>Error message:</b> what happened and how to fix it. <b>Front-loaded</b> (the rule comes first), <b>active voice</b>, no blame.','<b>Verb-first button:</b> the CTA names the action and the thing.']}};
V['voice']=[
{id:'voice-rewriter',title:'The microcopy rewriter',
 terms:['Microcopy','Verb-first button','Error message','Empty state','Plain language','Jargon','Front-loading'],
 intro:'The same screen, three times. The layout never changes: only the words do. Microcopy is all the small text in a product: titles, labels, errors, empty states and buttons.',
 try:'Switch between Robotic, Vague and Clear. Turn on Annotate to see what each piece of text is doing, right or wrong. Try Title Case too.',
 html:BASE+'<div class="vz4 vz-voice-rewriter"><style>'+
 '.vz-voice-rewriter .vr-g{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:16px;align-items:start}'+
 '.vz-voice-rewriter .ph{background:#FFFDF7;border:2px solid #14261D;border-radius:18px;padding:16px;display:grid;gap:14px}'+
 '.vz-voice-rewriter .vt{font:800 20px/1.15 "Bricolage Grotesque","Instrument Sans",sans-serif}'+
 '.vz-voice-rewriter .em{border:1.5px dashed #4A5A4F;border-radius:12px;padding:14px;text-align:center;font-size:14px}'+
 '.vz-voice-rewriter .em>b{display:block;font-size:15px}'+
 '.vz-voice-rewriter .fl label{display:block;font-weight:700;font-size:13.5px;margin-bottom:4px}'+
 '.vz-voice-rewriter .fl .in{height:44px;border:2px solid #A3361A;border-radius:10px;display:flex;align-items:center;padding:0 12px;font-family:"Space Mono",monospace;font-size:14px}'+
 '.vz-voice-rewriter .fl .er{display:flex;gap:6px;align-items:flex-start;color:#A3361A;font-size:13.5px;margin-top:6px;font-weight:600}'+
 '.vz-voice-rewriter .bt{display:flex;align-items:center;justify-content:center;min-height:48px;border:2.5px solid #14261D;border-radius:12px;background:#E8722C;font-weight:700;font-size:15.5px;box-shadow:3px 3px 0 #14261D}'+
 '.vz-voice-rewriter .n{display:none;font-size:13px;line-height:1.4;background:#F6D7E8;border:1.5px solid #14261D;border-radius:8px;padding:6px 8px;margin-top:6px;text-align:left;font-weight:400;color:#14261D}'+
 '.vz-voice-rewriter .ann .n{display:block}.vz-voice-rewriter .ann.hum .n{background:#D6E59A}'+
 '.vz-voice-rewriter .nn{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#14261D;color:#D6E59A;font:700 10px "Space Mono",monospace;margin-right:5px;vertical-align:1px}'+
 '@media (max-width:640px){.vz-voice-rewriter .vr-g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctls">'+segH('v','Copy',[['rob','Robotic'],['vag','Vague'],['hum','Clear and human']],'rob')+segH('c','Case',[['0','Sentence case'],['1','Title Case']],'0')+'</div>'+
 '<div>'+togH('vr-an','Annotate',true)+'</div>'+
 '<div class="vr-g"><div class="ph"></div><div class="k-cap vr-cap"></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-voice-rewriter'),v='rob',c=0,an=true;
  function draw(){var x=VX[v],ph=$(root,'.ph'),nn=function(i){return '<div class="n"><span class="nn">'+(i+1)+'</span>'+x.n[i]+'</div>'};
   ph.className='ph'+(an?' ann':'')+' '+v;
   ph.innerHTML='<div><div class="vt">'+x.t[c]+'</div>'+nn(0)+'</div><div class="em"><b>'+x.e+'</b>'+x.es+nn(1)+'</div>'+
    '<div class="fl"><label>'+x.lab+'</label><div class="in">012345678</div><div class="er">'+IC.warn+'<span>'+x.err+'</span></div>'+nn(2)+'</div><div><div class="bt">'+x.b[c]+'</div>'+nn(3)+'</div>';
   $(root,'.vr-cap').innerHTML={rob:'<span class="k-term">Robotic</span>Written by the database, for the database. Correct, but cold and full of <b>jargon</b>: insider words your users do not know.',
    vag:'<span class="k-term">Vague</span>Friendly words that say nothing. Typical AI copy: cheerful fluff, “Oops”, and buttons that do not name the action.',
    hum:'<span class="k-term">Clear and human</span>Clear first, then warm. <b>Plain language</b> a 12-year-old understands, specific verbs, an error that guides, and an empty state that teaches.'}[v]+
    (c?'<br><span class="k-term">Title Case</span>Capitalising Every Word looks formal and a little shouty. Most modern products use sentence case.':'')}
  seg(root,'v',function(q){v=q;draw()});seg(root,'c',function(q){c=+q;draw()});tog($(root,'.vr-an'),function(o){an=o;draw()});draw();
 }},

{id:'voice-tone',title:'One voice, many tones',
 terms:['Voice','Tone','Inclusive language'],
 intro:'Voice is who the product is, and it never changes. Tone is how that voice adapts to the moment, like a good friend who is playful at a party and calm at a hospital.',
 try:'Pick a moment and watch the tone marker move. Turn on Wrong tone to feel how it lands. Then switch the sign-up form to Inclusive.',
 html:BASE+'<div class="vz4 vz-voice-tone"><style>'+
 '.vz-voice-tone .vo{font-size:14px}.vz-voice-tone .msg{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:16px;display:grid;gap:6px;max-width:420px}'+
 '.vz-voice-tone .msg b{font-size:17px}.vz-voice-tone .sc{position:relative;height:34px;border:2px solid #14261D;border-radius:99px;background:linear-gradient(90deg,#C9E0F2,#FFFDF7 50%,#F7DCC4);max-width:420px}'+
 '.vz-voice-tone .sc i{position:absolute;top:3px;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#14261D;transition:left .25s cubic-bezier(.2,.8,.2,1)}'+
 '.vz-voice-tone .scl{display:flex;justify-content:space-between;max-width:420px;font:700 11px "Space Mono",monospace;color:#4A5A4F}'+
 '.vz-voice-tone .fm{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:16px;display:grid;gap:10px;max-width:420px}'+
 '.vz-voice-tone .fm .f{border:2px solid #14261D;border-radius:10px;padding:8px 10px;font-size:14px}.vz-voice-tone .fm .f small{display:block;font:700 11px "Space Mono",monospace;color:#4A5A4F}'+
 '.vz-voice-tone .fm .hl{background:#F6D7E8}.vz-voice-tone .fm.inc .hl{background:#D6E59A}'+
 '</style>'+
 '<div class="k-cap vo"><span class="k-term">Voice (always)</span>Warm, clear, respectful. Speaks as “we” and “you”.</div>'+
 segH('m','Moment',[['sale','First sale'],['fail','Payment failed'],['empty','Empty inbox'],['lock','Account locked']],'sale')+
 '<div>'+togH('vt-w','Wrong tone',false)+'</div>'+
 '<div class="msg" aria-live="polite"></div>'+
 '<div><div class="scl"><span>Serious</span><span>Neutral</span><span>Playful</span></div><div class="sc" style="margin-top:4px"><i></i></div></div>'+
 '<div class="k-cap vt-cap"></div>'+
 '<div class="k-ctl"><span class="k-lab">Sign-up form</span><div class="k-seg" role="group" aria-label="Sign-up form" data-seg="inc"><button type="button" class="k-b" data-v="0" aria-pressed="true">Excludes people</button><button type="button" class="k-b" data-v="1" aria-pressed="false">Inclusive</button></div></div>'+
 '<div class="fm"></div><div class="k-cap vt-inc"></div></div>',
 init:function(el){
  var root=$(el,'.vz-voice-tone'),m='sale',w=false;
  var M={sale:[85,'First sale. Nice one!','₦8,500 from Kemi is on its way to your account.',20,'Transaction #4471 completed.','Status: SUCCESS. Funds credited.','A first sale is a big day. Being cold here misses a moment to celebrate with them.','A first sale is a real milestone, so the tone can smile. Still short and specific: who paid, how much.'],
   fail:[12,'Payment didn’t go through','Your card was not charged. Try again, or pay by bank transfer.',88,'Whoops! Our bad!','Give it another go? You’ve got this!','Playful words on a failed payment feel like a joke at the worst moment. People worry about their money.','Money is stressful. Calm and serious: say it plainly, reassure (not charged), give a way forward.'],
   empty:[62,'Nothing new','You’re all caught up. We’ll let you know when a payment arrives.',10,'No messages.','Inbox count: 0.','Not wrong, but flat. An empty inbox is a small win; a little warmth costs nothing.','Light and encouraging: an empty inbox is good news.'],
   lock:[18,'We’ve locked your account for now','We saw 5 wrong PIN attempts. Reset your PIN to get back in. It takes about 2 minutes.',80,'Uh-oh, locked out!','Too many tries, silly! Reset your PIN?','Teasing someone who is locked out of their money breaks trust. “Silly” blames them.','Calm and precise: what happened, why, and exactly how to fix it, with no blame.']};
  var F=[['Hey guys, welcome!','Welcome, everyone'],['Title (required): Mr / Mrs','What should we call you? (optional)'],['Christian name','First name'],['Husband’s or father’s name','Next of kin']];
  function draw(){var x=M[m],bad=w;$(root,'.msg').innerHTML='<b>'+(bad?x[4]:x[1])+'</b><span>'+(bad?x[5]:x[2])+'</span>';$(root,'.sc i').style.left=(bad?x[3]:x[0])+'%';
   $(root,'.vt-cap').innerHTML='<span class="k-term">'+(bad?'Wrong tone':'Tone')+'</span>'+(bad?x[6]:x[7])}
  function inc(i){var fm=$(root,'.fm');fm.className='fm'+(i?' inc':'');fm.innerHTML='<b class="hl" style="justify-self:start;padding:0 4px;border-radius:4px">'+F[0][i]+'</b>'+F.slice(1).map(function(f){return '<div class="f"><small>Field</small><span class="hl">'+f[i]+'</span></div>'}).join('');
   $(root,'.vt-inc').innerHTML='<span class="k-term">Inclusive language</span>'+(i?'Words that welcome everyone: no assumed gender, religion or marriage, and nothing personal is required unless you truly need it.':'Each highlighted phrase quietly shuts someone out: women, non-Christians, single people, anyone who does not use a title. Nobody meant harm; nobody checked.')}
  seg(root,'m',function(v){m=v;draw()});tog($(root,'.vt-w'),function(o){w=o;draw()});seg(root,'inc',function(v){inc(+v)});draw();inc(0);
 }},

{id:'voice-scan',title:'The scan test',
 terms:['Front-loading','Sentence case'],
 intro:'People do not read interfaces, they scan them, often only the first two or three words of each line. Front-loading puts the important words first so a scan is enough.',
 try:'Turn on Scan view to see only what a busy person reads. Compare Buried with Front-loaded. Then change the case of the menu.',
 html:BASE+'<div class="vz4 vz-voice-scan"><style>'+
 '.vz-voice-scan .ls{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:6px 14px;max-width:440px}'+
 '.vz-voice-scan .it{padding:10px 0;border-bottom:1.5px solid #E6E1D3;font-size:14.5px}.vz-voice-scan .it:last-child{border-bottom:0}'+
 '.vz-voice-scan .it em{font-style:normal;transition:opacity .2s,filter .2s}.vz-voice-scan .scan .it em{opacity:.18;filter:blur(1.5px)}'+
 '.vz-voice-scan .it strong{font-weight:inherit}.vz-voice-scan .scan .it strong{font-weight:700}'+
 '.vz-voice-scan .mn{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:6px 14px;max-width:440px}.vz-voice-scan .mn div{padding:9px 0;border-bottom:1.5px solid #E6E1D3;font-size:15px}.vz-voice-scan .mn div:last-child{border-bottom:0}'+
 '.vz-voice-scan .caps div{letter-spacing:.04em;font-size:13.5px}'+
 '</style>'+
 '<div class="k-ctls">'+segH('f','Notifications',[['0','Buried'],['1','Front-loaded']],'0')+togH('vs-s','Scan view',false)+'</div>'+
 '<div class="ls"></div><div class="k-cap vs-cap"></div>'+
 segH('c','Menu case',[['s','Sentence case'],['t','Title Case'],['u','ALL CAPS']],'t')+
 '<div class="mn"></div><div class="k-cap vs-cc"></div></div>',
 init:function(el){
  var root=$(el,'.vz-voice-scan'),f=0,sc=false,c='t';
  var N=[['We wanted to let you know that','₦5,000 arrived from Tunde.','₦5,000 from Tunde','arrived in your wallet.'],['Please note that, as part of our policy,','your card expires on 30 Nov.','Card expires 30 Nov.','Add a new one to keep paying.'],['Great news! After careful review, we have','approved your loan of ₦50,000.','Loan approved: ₦50,000.','It lands in your account today.'],['In order to keep your account secure, you','need to update your PIN.','Update your PIN','to keep your account secure.']];
  var MN=['Manage your payment methods','Download your statement','Change your transfer PIN','Invite a friend and earn ₦500'],MT=['Manage Your Payment Methods','Download Your Statement','Change Your Transfer PIN','Invite a Friend and Earn ₦500'];
  function draw(){$(root,'.ls').className='ls'+(sc?' scan':'');
   $(root,'.ls').innerHTML=N.map(function(n){var full=f?n[2]+' '+n[3]:n[0]+' '+n[1],ws=full.split(' ');return '<div class="it"><strong>'+ws.slice(0,3).join(' ')+'</strong> <em>'+ws.slice(3).join(' ')+'</em></div>'}).join('');
   $(root,'.vs-cap').innerHTML=f?'<span class="k-term">Front-loading</span>The money, the date, the action come first. Even in scan view you know what happened.':'<span class="k-term">Buried</span>The first words are throat-clearing: “We wanted to let you know…”. In scan view, every line says nothing.'+(sc?'':' Turn on Scan view.')}
  function menu(){
   var mn=$(root,'.mn');mn.className='mn'+(c==='u'?' caps':'');mn.innerHTML=MN.map(function(s,i){return '<div>'+(c==='s'?s:c==='t'?MT[i]:s.toUpperCase())+'</div>'}).join('');
   $(root,'.vs-cc').innerHTML={s:'<span class="k-term">Sentence case</span>Only the first word (and names) get a capital. Calm, friendly and the easiest to read.',t:'<span class="k-term">Title Case</span>Every Main Word Gets A Capital. It looks formal and busy, and teams argue forever about which small words to skip.',u:'<span class="k-term">ALL CAPS</span>Every letter is the same height, so words lose their shape and take longer to read. Keep caps for tiny labels only.'}[c]}
  seg(root,'f',function(v){f=+v;draw()});tog($(root,'.vs-s'),function(o){sc=o;draw()});seg(root,'c',function(v){c=v;menu()});draw();menu();
 }}
];

/* voice drills */
var tx=function(t,s){return '<div style="'+FF+'width:210px;max-width:100%;color:#14261D;font-size:13.5px;line-height:1.45;text-align:left;'+(s||'')+'">'+t+'</div>'};
D['voice']=[
{id:'v-link',type:'ab',level:1,q:'Which link text is better?',
 a:card('Your receipt is ready. <u style="font-weight:700">Click here</u>.'),b:card('Your receipt is ready. <u style="font-weight:700">Download receipt</u>'),ok:'b',
 why:'Links and buttons should say what happens. “Click here” means nothing when scanned or read out by a screen reader. Name the action and the thing.'},
{id:'v-name-verb',type:'name',level:1,q:'A button label that starts with an action and names the thing. What is it called?',
 face:'<div style="text-align:center">'+pbtn('Send invoice')+'</div>',
 opts:['Verb-first button','Jargon','Title Case','Empty state'],ok:0,
 why:'A verb-first button starts with the action (“Send”) and names the object (“invoice”). People know exactly what will happen before they tap.'},
{id:'v-confirm',type:'pick',level:1,q:'A transfer just went through. Which message is clearest?',
 opts:[card('<b>Transaction processed successfully.</b>'),card('<b>Done!</b>'),card('<b>₦25,000 sent to Chidinma</b><br>It usually arrives in seconds.')],ok:2,
 why:'Front-load the facts people care about: how much, to whom, what happens next. “Done!” and system-speak leave them checking their bank app.'},
{id:'v-name-jargon',type:'name',level:2,q:'What is wrong with this message?',
 face:card('<b>Upgrade to KYC Tier 3</b><br>Complete BVN-NIN linkage to unlock NIP limits.'),
 opts:['Jargon','Sentence case','Tone','Front-loading'],ok:0,
 why:'Jargon is insider language your users do not know. Translate it: “Verify your identity to send up to ₦5 million a day.”'},
{id:'v-case',type:'ab',level:2,q:'Which settings menu reads more calmly?',
 a:card(['Change Your Notification Preferences','Manage Linked Bank Accounts','Download Your Statement'].map(function(s){return '<div style="padding:5px 0;border-bottom:1px solid #E6E1D3">'+s+'</div>'}).join('')),
 b:card(['Change your notification preferences','Manage linked bank accounts','Download your statement'].map(function(s){return '<div style="padding:5px 0;border-bottom:1px solid #E6E1D3">'+s+'</div>'}).join('')),ok:'b',
 why:'Sentence case capitalises only the first word. It is calmer, friendlier and faster to read than Title Case, and it ends arguments about which words to capitalise.'},
{id:'v-fix-oops',type:'fix',level:2,q:'This message appears when a card payment fails. Which rewrite fixes it?',
 face:card('<b>Oops! Something went wrong :(</b>'),
 opts:['“Payment failed. Your card was not charged. Try again or pay by transfer.”','“Oopsie! Our bad! Try again?”','“Error 502: upstream gateway timeout.”'],ok:0,
 why:'Errors need a calm tone and three parts: what happened, reassurance, and how to fix it. “Oops” is too playful when money is involved; codes help nobody.'},
{id:'v-sale',type:'ab',level:2,q:'A trader makes their first sale. Which message strikes the right tone?',
 a:card('<b>CONGRATULATIONS!!! YOU ARE AMAZING!!!</b><br>Keep crushing it, superstar!'),b:card('<b>First sale. Nice one!</b><br>₦8,500 from Kemi is on its way to your account.'),ok:'b',
 why:'Tone can celebrate, but the voice stays the same: warm, clear, specific. Shouting and hype feel fake; one friendly line plus the facts feels real.'},
{id:'v-front',type:'pick',level:3,q:'Lock-screen previews get cut off. Which one works?',
 opts:[0,1,2].map(function(i){var t=['We wanted to let you know that your recent tran…','₦5,000 received from Tunde · Tap to view rec…','Hello there! Great news, there is an update ab…'][i];return '<div style="'+FF+'width:200px;max-width:100%;background:#14261D;color:#F4F0E5;border-radius:12px;padding:10px 12px;font-size:12.5px;line-height:1.4;text-align:left"><b style="display:block;font-size:11px;letter-spacing:.06em;color:#D6E59A">LUMO · now</b><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+t+'</span></div>'}),ok:1,
 why:'Front-loading: put the important words first. When text is cut off, only the first few words survive, so the money and the name must come before any greeting.'},
{id:'v-inclusive',type:'ab',level:3,q:'Which sign-up form uses inclusive language?',
 a:card('<b>Hey guys!</b><div style="margin-top:6px;border:1.5px solid #14261D;border-radius:7px;padding:5px 8px">Title: Mr / Mrs <span style="color:#A3361A">*</span></div><div style="margin-top:6px;border:1.5px solid #14261D;border-radius:7px;padding:5px 8px">Christian name</div>'),
 b:card('<b>Welcome, everyone</b><div style="margin-top:6px;border:1.5px solid #14261D;border-radius:7px;padding:5px 8px">What should we call you? (optional)</div><div style="margin-top:6px;border:1.5px solid #14261D;border-radius:7px;padding:5px 8px">First name</div>'),ok:'b',
 why:'Inclusive language does not assume gender, religion or marital status, and only asks for what you truly need. Small words decide who feels welcome.'},
{id:'v-active',type:'fix',level:3,q:'Which rewrite of this decline message is best?',
 face:card('Your transfer has been declined by the system due to limits being exceeded.'),
 opts:['“We stopped this transfer: it is over your ₦50,000 daily limit. Send less, or raise your limit.”','“Transfer declined.”','“Unfortunately, your transfer has been declined at this time.”'],ok:0,
 why:'Active voice says who did what (“We stopped…”), which feels honest. Then give the reason and a way forward. Passive, vague copy sounds like hiding.'}
];

/* =================== STATES & EDGE CASES =================== */
var TR=[['C','Chidinma Okafor','₦25,000','Today, 09:14','#D6E59A'],['T','Tunde Bakare','₦5,000','Yesterday','#C9E0F2'],['B','Bisi Adeyemi','₦12,500','Mon','#F6D7E8'],['E','Emeka Obi','₦3,200','Sun','#F7DCC4']];
var STCSS='.vz-states-all .sa-ph,.vz-states-edge .sa-ph{position:relative;max-width:340px;background:#FFFDF7;border:2px solid #14261D;border-radius:18px;padding:14px;display:grid;gap:10px;min-height:340px;align-content:start}'+
 '.vz4 .sa-h{display:flex;justify-content:space-between;align-items:baseline;font-weight:800;font-size:17px}.vz4 .sa-h span{font:700 11px "Space Mono",monospace;color:#4A5A4F}'+
 '.vz4 .sa-r{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1.5px solid #E6E1D3;font-size:14px;min-width:0}'+
 '.vz4 .sa-av{width:34px;height:34px;border-radius:50%;border:1.5px solid #14261D;display:grid;place-items:center;font-weight:700;flex:none}'+
 '.vz4 .sa-nm{min-width:0;flex:1}.vz4 .sa-nm small{display:block;color:#4A5A4F;font-size:12px}'+
 '.vz4 .sa-am{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}'+
 '.vz4 .sa-btn{display:flex;align-items:center;justify-content:center;min-height:48px;border:2.5px solid #14261D;border-radius:12px;background:#E8722C;font-weight:700;box-shadow:3px 3px 0 #14261D;cursor:pointer;font-size:15px;color:#14261D;width:100%}'+
 '.vz4 .sa-btn[disabled]{background:#E6E1D3;color:#4A5A4F;border-color:#7C877F;box-shadow:none;cursor:not-allowed}'+
 '.vz4 .sa-btn.sec{background:#FFFDF7}'+
 '.vz4 .sa-sk{background:#E6E1D3;border-radius:6px;display:block;height:12px}'+
 '.vz4 .sa-ban{display:flex;gap:8px;align-items:flex-start;border:2px solid #14261D;border-radius:10px;padding:8px 10px;font-size:13px;background:#C9E0F2}'+
 '.vz4 .sa-ctr{text-align:center;display:grid;gap:8px;justify-items:center;padding:18px 6px;font-size:14px}.vz4 .sa-ctr b{font-size:16px}'+
 '.vz4 .sa-ic{width:48px;height:48px;border-radius:50%;border:2px solid #14261D;display:grid;place-items:center;background:#F4F0E5}'+
 '.vz4 .sa-tst{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;align-items:center;background:#14261D;color:#F4F0E5;border-radius:12px;padding:10px 12px;font-size:13.5px}'+
 '.vz4 .sa-tst svg{color:#D6E59A}.vz4 .sa-new{background:#EEF4D6}';
var row=function(r,o){o=o||{};return '<div class="sa-r'+(o.cls?' '+o.cls:'')+'"><span class="sa-av" style="background:'+r[4]+'">'+r[0]+'</span><span class="sa-nm"'+(o.nmS?' style="'+o.nmS+'"':'')+'>'+r[1]+'<small>'+r[3]+'</small></span><span class="sa-am">'+r[2]+'</span></div>'};
var skr=function(){return '<div class="sa-r"><span class="sa-av" style="background:#E6E1D3;border-color:transparent"></span><span class="sa-nm"><i class="sa-sk" style="width:70%"></i><i class="sa-sk" style="width:40%;margin-top:6px;height:9px"></i></span><i class="sa-sk" style="width:56px"></i></div>'};
V['states']=[
{id:'states-all',title:'One feature, every state',
 terms:['Ideal state','Empty state','Loading state','Partial state','Error state','Success state','Offline state','Disabled state','Retry','Graceful degradation'],
 intro:'This is one small feature: a list of recent transfers. A designer who only draws the first tab has drawn one eighth of the job.',
 try:'Tap through all eight states. In Error and Partial, press the retry buttons: they really work.',
 html:BASE+'<div class="vz4 vz-states-all"><style>'+STCSS+'.vz-states-all .sa-g{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:640px){.vz-states-all .sa-g{grid-template-columns:1fr}}</style>'+
 segH('s','State',[['ideal','Ideal'],['empty','Empty'],['loading','Loading'],['partial','Partial'],['error','Error'],['success','Success'],['offline','Offline'],['disabled','Disabled']],'ideal')+
 '<div class="sa-g"><div class="sa-ph" aria-live="polite"></div><div class="k-cap sa-cap"></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-states-all'),ph=$(root,'.sa-ph'),tm=0;
  var C={ideal:['Ideal state','The perfect screenshot: four tidy transfers, a fast network, short names. Lovely, and the state real people see least on day one.'],
   empty:['Empty state','No transfers yet. Not a blank screen: it explains what will appear here and gives one clear first step. It is onboarding in disguise.'],
   loading:['Loading state','Skeleton rows in the shape of the real ones. The screen feels faster and nothing jumps when the data lands.'],
   partial:['Partial state','The recent transfers loaded; older ones did not. Show what you have, and offer a small Retry for the rest.'],
   error:['Error state','Says what failed, reassures (“your money is safe”) and offers Retry so nobody has to start over.'],
   success:['Success state','The new transfer is highlighted in the list and a short message confirms it. Then it gets out of the way.'],
   offline:['Offline state','No connection, but the screen still works: saved transfers show, and new ones wait to send. That is graceful degradation.'],
   disabled:['Disabled state','The Send button is off, and it says why and for how long. A disabled button with no reason is a dead end.']};
  var head=function(n){return '<div class="sa-h">Recent transfers<span>'+n+'</span></div>'},send='<button type="button" class="sa-btn">Send money</button>';
  function show(s){clearTimeout(tm);setSeg(root,'s',s);var h='';
   if(s==='ideal')h=head('4 this week')+TR.map(function(r){return row(r)}).join('')+send;
   if(s==='empty')h=head('')+'<div class="sa-ctr"><span class="sa-ic">'+IC.clock+'</span><b>No transfers yet</b><span>Send money to any Nigerian bank account. Your history will show up here.</span></div><button type="button" class="sa-btn">Send your first transfer</button>';
   if(s==='loading')h=head('loading…')+skr()+skr()+skr()+skr()+'<button type="button" class="sa-btn" disabled>Send money</button>';
   if(s==='partial')h=head('2 of 4')+row(TR[0])+row(TR[1])+'<div class="sa-ban" style="background:#F7DCC4">'+IC.warn+'<span style="flex:1">Couldn’t load older transfers.</span><button type="button" class="k-b sa-rt" style="min-height:36px;padding:0 10px;font-size:13px">Retry</button></div>'+send;
   if(s==='error')h=head('')+'<div class="sa-ctr"><span class="sa-ic" style="background:#F7DCC4">'+IC.warn+'</span><b>Couldn’t load your transfers</b><span>The connection timed out. Your money is safe.</span><button type="button" class="k-b pri sa-rt">Try again</button></div>';
   if(s==='success')h=head('5 this week')+row(['N','Ngozi Eze','₦8,000','Just now','#D6E59A'],{cls:'sa-new'})+TR.slice(0,3).map(function(r){return row(r)}).join('')+'<div class="sa-tst" role="status">'+IC.check+'₦8,000 sent to Ngozi Eze</div><div style="height:40px"></div>';
   if(s==='offline')h='<div class="sa-ban">'+IC.wifi+'<span>You’re offline. Showing transfers saved on this phone. New transfers will send when you reconnect.</span></div>'+head('updated 09:20')+TR.slice(0,3).map(function(r){return row(r)}).join('')+'<button type="button" class="sa-btn">Send money (queued)</button>';
   if(s==='disabled')h=head('4 this week')+TR.slice(0,3).map(function(r){return row(r)}).join('')+'<button type="button" class="sa-btn" disabled>Send money</button><p style="font-size:13px;color:#4A5A4F;margin:0">Sending is paused while we check your BVN. This usually takes 5 minutes.</p>';
   ph.innerHTML=h;var c=C[s];$(root,'.sa-cap').innerHTML='<span class="k-term">'+c[0]+'</span>'+c[1]+((s==='error'||s==='partial')?'<br><span class="k-term">Retry</span>Press it. It goes back to loading, then succeeds, without losing your place.':'');
   var rt=$(ph,'.sa-rt');if(rt)rt.addEventListener('click',function(){show('loading');tm=later(el,function(){show('ideal')},1100)})}
  seg(root,'s',show);show('ideal');
 }},

{id:'states-edge',title:'Edge-case stress test',
 terms:['Edge case','Graceful degradation','Disabled state'],
 intro:'Edge cases are rare but real: a 34-character name, a ₦0 balance, a trader with 2,000 transfers. Push the same screen to its limits and compare a naive build with a designed one.',
 try:'Set the items, name and amount to extremes, then flip between Naive and Designed.',
 html:BASE+'<div class="vz4 vz-states-edge"><style>'+STCSS+'.vz-states-edge .se-g{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:640px){.vz-states-edge .se-g{grid-template-columns:1fr}}'+
 '.vz-states-edge .se-clip{overflow:hidden;border-radius:18px;padding:4px}.vz-states-edge .se-bal{font:800 28px/1.1 "Bricolage Grotesque","Instrument Sans",sans-serif;font-variant-numeric:tabular-nums}'+
 '.vz-states-edge .nv .sa-r{flex-wrap:nowrap}.vz-states-edge .nv .sa-nm{min-width:auto;white-space:nowrap}'+
 '.vz-states-edge .ds .sa-nm{overflow:hidden}.vz-states-edge .ds .sa-nm .t{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.vz-states-edge .se-li{list-style:none;margin:0;padding:0;display:grid;gap:4px;font-size:14px}.vz-states-edge .se-li li{display:flex;gap:8px;align-items:flex-start}'+
 '.vz-states-edge .se-note{font:700 11px "Space Mono",monospace;background:#F6D7E8;border:1.5px dashed #14261D;border-radius:8px;padding:6px 8px}'+
 '</style>'+
 '<div class="k-ctls">'+segH('n','Transfers',[['0','0'],['1','1'],['3','3'],['2000','2,000']],'3')+segH('l','Name',[['s','Short'],['l','Very long']],'l')+segH('a','Balance',[['0','₦0'],['48250','₦48,250'],['12450000000','₦12.45 billion']],'12450000000')+'</div>'+
 segH('d','Build',[['nv','Naive'],['ds','Designed']],'nv')+
 '<div class="se-g"><div class="se-clip"><div class="sa-ph"></div></div><div class="k-cap"><span class="k-term se-t">Edge case</span><ul class="se-li"></ul></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-states-edge'),n=3,l='l',a=12450000000,d='nv';
  var LONG='Oluwaseyifunmilayo Adebayo-Okonkwo',fmt=function(x){return x.toLocaleString('en-NG')},fm2=function(x){return x.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})};
  function draw(){var ph=$(root,'.sa-ph'),ds=d==='ds',h='',li=[];ph.className='sa-ph '+d;
   var rs=[];for(var i=0;i<Math.min(n,ds?3:9);i++){var r=TR[i%4].slice();if(i===0&&l==='l'){r[1]=LONG;r[0]='O'}rs.push(r)}
   h+='<div><span class="k-lab">Balance</span><div class="se-bal" style="'+(ds&&a>=1e9?'font-size:22px;overflow-wrap:anywhere':'white-space:nowrap')+'">₦'+(ds?fm2(a):String(a))+'</div></div>';
   h+='<div class="sa-h">Transfers<span>'+(ds?fmt(n)+(n===1?' transfer':' transfers'):n+' transfers')+'</span></div>';
   if(n===0)h+=ds?'<div class="sa-ctr" style="padding:8px 4px"><b>No transfers yet</b><span>Your first transfer will show up here.</span></div>':'<div style="height:60px"></div>';
   else h+=rs.map(function(r){return ds?'<div class="sa-r"><span class="sa-av" style="background:'+r[4]+'">'+r[0]+'</span><span class="sa-nm"><span class="t" title="'+r[1]+'">'+r[1]+'</span><small>'+r[3]+'</small></span><span class="sa-am">'+r[2]+'</span></div>':row(r)}).join('');
   if(n===2000)h+=ds?'<button type="button" class="sa-btn sec" style="min-height:44px">Show all 2,000 transfers</button>':'<div class="se-note">…1,991 more rows load at once. Slow phones freeze.</div>';
   h+=ds&&a===0?'<button type="button" class="sa-btn" disabled>Send money</button><p style="margin:0;font-size:13px;color:#4A5A4F">Add money to your wallet to send a transfer.</p><button type="button" class="sa-btn sec">Add money</button>':'<button type="button" class="sa-btn">Send money</button>';
   ph.innerHTML=h;
   if(l==='l'&&n>0)li.push(ds?'Long name: cut with an ellipsis (…), full name on tap. The amount stays put.':'Long name: the row cannot wrap, so the name shoves the amount off the card.');
   if(a>=1e9)li.push(ds?'Huge balance: separators and kobo make it readable, and the text shrinks a step and may wrap instead of overflowing.':'Huge balance: no separators (count the zeros) and it runs straight off the card.');
   if(a===0)li.push(ds?'₦0: the Send button is disabled with a reason, and the next step (Add money) is right there.':'₦0: Send money still looks ready. It will fail after the person types everything.');
   if(n===0)li.push(ds?'0 transfers: an empty state explains what will appear.':'0 transfers: a blank gap. Is it broken or empty?');
   if(n===1)li.push(ds?'1 transfer: the word follows the number.':'“1 transfers”: nobody wrote the singular.');
   if(n===2000)li.push(ds?'2,000 transfers: show a few and a “Show all” button. Fast on any phone.':'2000 transfers: no thousands separator, and every row loads at once.');
   if(!li.length)li.push('Nothing extreme right now. Push a setting to an extreme.');
   $(root,'.se-t').textContent=ds?'Graceful degradation':'Edge case';
   $(root,'.se-li').innerHTML=li.map(function(t){return '<li><span style="flex:none;margin-top:2px">'+(ds?IC.check:IC.cross)+'</span><span>'+t+'</span></li>'}).join('')}
  seg(root,'n',function(v){n=+v;draw()});seg(root,'l',function(v){l=v;draw()});seg(root,'a',function(v){a=+v;draw()});seg(root,'d',function(v){d=v;draw()});draw();
 }}
];

/* states drills */
var mph=function(c,s){return '<div style="'+FF+'width:220px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:12px;color:#14261D;font-size:13px;line-height:1.4;text-align:left;'+(s||'')+'">'+c+'</div>'};
var drow=function(n,a,s){return '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #E6E1D3;min-width:0"><i style="width:22px;height:22px;border-radius:50%;border:1.5px solid #14261D;background:#D6E59A;flex:none;display:block"></i><span style="flex:1;min-width:0;'+(s||'')+'">'+n+'</span><b style="white-space:nowrap;font-variant-numeric:tabular-nums">'+a+'</b></div>'};
var dbtn=function(t,dis){return '<div style="margin-top:8px;display:flex;align-items:center;justify-content:center;min-height:36px;border:2px solid '+(dis?'#7C877F':'#14261D')+';border-radius:9px;background:'+(dis?'#E6E1D3':'#E8722C')+';color:'+(dis?'#4A5A4F':'#14261D')+';font-weight:700">'+t+'</div>'};
D['states']=[
{id:'s-name-empty',type:'name',level:1,q:'Which state is this?',
 face:mph('<b>Invoices</b><div style="text-align:center;padding:12px 4px"><b>No invoices yet</b><br>Create your first one in under a minute.</div>'+dbtn('Create invoice')),
 opts:['Empty state','Error state','Loading state','Ideal state'],ok:0,
 why:'An empty state is what a screen shows when there is no data yet. A good one explains what will appear and gives one clear first step.'},
{id:'s-error',type:'ab',level:1,q:'The transfers list failed to load. Which error state is better?',
 a:mph('<b>Transfers</b><div style="text-align:center;padding:16px 4px;color:#A3361A;font-weight:700">Error</div>'),
 b:mph('<b>Transfers</b><div style="text-align:center;padding:8px 4px"><b>Couldn’t load transfers</b><br>Check your connection. Your money is safe.</div>'+dbtn('Try again')),ok:'b',
 why:'A good error state says what failed, reassures, and offers Retry. A bare “Error” leaves people stuck and worried.'},
{id:'s-offline',type:'pick',level:1,q:'The network drops while someone is writing a long message. Which is best?',
 opts:[mph('<div style="color:#A3361A;font-weight:700">Network error.</div><div style="margin-top:8px;height:50px;border:1.5px solid #14261D;border-radius:8px"></div>'+mono('(the message is gone)','display:block;margin-top:4px')),
  mph('<div style="display:flex;gap:6px;background:#C9E0F2;border:1.5px solid #14261D;border-radius:8px;padding:6px 8px;font-size:12px">You’re offline. Your draft is saved and will send when you’re back.</div><div style="margin-top:8px;border:1.5px solid #14261D;border-radius:8px;padding:6px;font-size:12px">Hi Bisi, the fabric for Saturday is…</div>'),
  mph('<div style="display:grid;place-items:center;height:90px"><i style="width:26px;height:26px;border:3px solid #14261D;border-right-color:transparent;border-radius:50%;display:block"></i></div>'+mono('(spinning for ever)','display:block;text-align:center'))],ok:1,
 why:'Never lose what someone typed. A good offline state keeps the work, says what is happening, and sends it later by itself.'},
{id:'s-name-partial',type:'name',level:2,q:'Some data loaded, some did not. What is this state called?',
 face:mph('<b>Transfers</b>'+drow('Chidinma Okafor','₦25,000')+drow('Tunde Bakare','₦5,000')+'<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;background:#F7DCC4;border:1.5px solid #14261D;border-radius:8px;padding:6px 8px;font-size:12px">Couldn’t load older ones<b>Retry</b></div>'),
 opts:['Partial state','Offline state','Empty state','Success state'],ok:0,
 why:'A partial state shows what did load and handles the missing part locally, with a small retry. Do not throw away good data because one piece failed.'},
{id:'s-disabled',type:'fix',level:2,q:'This button is greyed out and people keep tapping it. What is the fix?',
 face:mph('<b>Verify your identity</b><div style="margin-top:8px;border:1.5px solid #14261D;border-radius:8px;padding:7px;font-family:Space Mono,monospace;font-size:12px">2234 5678 9</div>'+dbtn('Continue',true)),
 opts:['Say why: “Enter all 11 digits of your BVN to continue”','Hide the button until the form is valid','Make the grey a little brighter'],ok:0,
 why:'A disabled state needs a reason. Tell people what is missing, ideally right next to the field, so the grey button is not a dead end.'},
{id:'s-plural',type:'ab',level:2,q:'A trader has made exactly one sale. Which header is right?',
 a:mph('<b style="font-size:15px">1 sales today</b>'+drow('Kemi Ade','₦8,500')),b:mph('<b style="font-size:15px">1 sale today</b>'+drow('Kemi Ade','₦8,500')),ok:'b',
 why:'0, 1 and many are different edge cases. “1 sales” is a tiny bug that tells people nobody tested the real situations.'},
{id:'s-long',type:'fix',level:2,q:'A real customer’s name breaks this row. What should the design do?',
 face:'<div style="width:220px;max-width:100%;overflow:hidden;border-radius:14px">'+mph(drow('Oluwaseyifunmilayo Adebayo-Okonkwo','₦25,000','white-space:nowrap;flex:none'),'width:220px;overflow:visible')+'</div>',
 opts:['Cut the name with an ellipsis (…) and show the full name on tap','Shrink the font until it fits','Ask customers to use a shorter name'],ok:0,
 why:'Long names are normal, not rare. Let the name truncate with an ellipsis so the amount stays visible, and offer the full name on tap.'},
{id:'s-huge',type:'pick',level:3,q:'The balance is ₦12,450,000,000. Which row handles it?',
 opts:['<div style="width:200px;max-width:100%;overflow:hidden">'+mph('<span style="font-size:11px;color:#4A5A4F">Balance</span><div style="font-weight:800;font-size:22px;white-space:nowrap">₦12450000000</div>','width:200px')+'</div>',
  mph('<span style="font-size:11px;color:#4A5A4F">Balance</span><div style="font-weight:800;font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">₦12,450,000…</div>','width:200px'),
  mph('<span style="font-size:11px;color:#4A5A4F">Balance</span><div style="font-weight:800;font-size:17px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere">₦12,450,000,000.00</div>','width:200px')],ok:2,
 why:'Never cut off money: a truncated amount is a wrong amount. Use thousands separators and let a huge number shrink a step or wrap.'},
{id:'s-retry',type:'ab',level:3,q:'Sending failed after someone filled in a long form. Which error is better?',
 a:mph('<b>Something went wrong</b><br>Please start again.'+dbtn('Start again')),
 b:mph('<b>Couldn’t send your transfer</b><br>Your details are saved. Nothing was charged.'+dbtn('Try again')),ok:'b',
 why:'Retry should repeat only the step that failed. Making people start over, or not saying whether money left their account, destroys trust.'},
{id:'s-name-grace',type:'name',level:3,q:'Images will not load on a slow connection, but the list still works with initials. What is this called?',
 face:mph('<div style="font-size:11px;background:#C9E0F2;border:1.5px solid #14261D;border-radius:7px;padding:4px 6px;margin-bottom:6px">Photos will load on Wi-Fi</div>'+drow('Ada’s Fabrics','₦12,000')+drow('Kola Electronics','₦85,500')),
 opts:['Graceful degradation','Error state','Disabled state','Edge case'],ok:0,
 why:'Graceful degradation means the product still works, more simply, when something fails: text without images, saved data without a network.'}
];

/* =================== ACCESSIBILITY =================== */
V['a11y']=[
{id:'a11y-contrast',title:'Live contrast checker',
 terms:['WCAG','Contrast ratio','AA / AAA'],
 intro:'Contrast ratio compares how light the text is with how light its background is, from 1:1 (invisible) to 21:1 (black on white). WCAG, the international accessibility guidelines, sets the minimums.',
 try:'Drag the text colour from dark to light and watch the badges flip. Try the presets, then switch on Sunlight.',
 html:BASE+'<div class="vz4 vz-a11y-contrast"><style>'+
 '.vz-a11y-contrast .ac-g{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:start}'+
 '.vz-a11y-contrast .ac-s{position:relative;border:2px solid #14261D;border-radius:14px;padding:20px;display:grid;gap:10px;overflow:hidden;min-height:170px}'+
 '.vz-a11y-contrast .ac-s .gl{position:absolute;inset:0;background:radial-gradient(circle at 80% 10%,rgba(255,255,255,.9),rgba(255,255,255,.45) 60%);pointer-events:none;display:none}.vz-a11y-contrast .ac-s.sun .gl{display:block}'+
 '.vz-a11y-contrast .ac-r{font:800 44px/1 "Bricolage Grotesque","Instrument Sans",sans-serif;font-variant-numeric:tabular-nums}'+
 '.vz-a11y-contrast .bd{display:grid;gap:6px}.vz-a11y-contrast .bd div{display:flex;align-items:center;gap:8px;border:2px solid #14261D;border-radius:10px;padding:6px 10px;font-size:13.5px;background:#FFFDF7}'+
 '.vz-a11y-contrast .bd div.ok{background:#D6E59A}.vz-a11y-contrast .bd div.no{background:#F6D7E8}.vz-a11y-contrast .bd b{margin-left:auto;font-family:"Space Mono",monospace;font-size:12px}'+
 '@media (max-width:640px){.vz-a11y-contrast .ac-g{grid-template-columns:1fr}}'+
 '</style>'+
 segH('bg','Background',[['#FFFDF7','Paper'],['#F4F0E5','Cream'],['#D6E59A','Lime'],['#E8722C','Terracotta'],['#14261D','Forest']],'#FFFDF7')+
 '<div class="k-ctl"><div style="display:flex;justify-content:space-between"><span class="k-lab">Text colour: dark to light</span><b class="k-mono ac-hex"></b></div><input type="range" class="ac-t" min="0" max="100" value="62" aria-label="Text colour, dark to light"></div>'+
 '<div class="k-seg"><span class="k-lab" style="width:100%">Presets</span><button type="button" class="k-b" data-pr="ai">Typical AI grey</button><button type="button" class="k-b" data-pr="almost">Almost passes</button><button type="button" class="k-b" data-pr="lab">Lab muted</button>'+togH('ac-sun','Sunlight',false)+'</div>'+
 '<div class="ac-g"><div class="ac-s"><span style="font-size:16px" class="t1">Send money home in seconds. No hidden fees.</span><span style="font-size:24px;font-weight:700;line-height:1.2" class="t2">₦25,000 sent to Ada</span><i class="gl"></i></div>'+
 '<div style="display:grid;gap:10px"><div><span class="k-lab">Contrast ratio</span><div class="ac-r"></div></div><div class="bd"></div></div></div>'+
 '<div class="k-cap ac-cap"></div></div>',
 init:function(el){
  var root=$(el,'.vz-a11y-contrast'),bg='#FFFDF7',t=$(root,'.ac-t');
  var col=function(){return mix('#14261D','#FFFFFF',+t.value/100)};
  function draw(){var c=col(),r=cr(c,bg),s=$(root,'.ac-s');s.style.background=bg;s.style.color=c;$(root,'.ac-hex').textContent=c.toUpperCase();
   $(root,'.ac-r').textContent=(Math.floor(r*100)/100).toFixed(2)+':1';
   var T=[['AA','Body text',4.5],['AA','Large text (24px, or 19px bold)',3],['AAA','Body text',7],['AAA','Large text',4.5]];
   $(root,'.bd').innerHTML=T.map(function(x){var ok=r>=x[2];return '<div class="'+(ok?'ok':'no')+'">'+(ok?IC.check:IC.cross)+'<span><b style="margin:0;font-family:inherit;font-size:13.5px">'+x[0]+'</b> '+x[1]+'</span><b>'+(ok?'Pass':'Fail')+' · '+x[2]+':1</b></div>'}).join('');
   $(root,'.ac-cap').innerHTML='<span class="k-term">AA / AAA</span>'+(r>=7?'Passes everything, even AAA, the strictest level. Comfortable in sunlight and for tired eyes.':r>=4.5?'Passes AA for all text, the level most products aim for.':r>=3?'Only large text passes. Body text here fails AA: people with low vision, old phones or bright sun will struggle.':'Fails everything. This is the pale “elegant” text AI loves. Many people simply cannot read it.')}
  t.addEventListener('input',draw);seg(root,'bg',function(v){bg=v;var dark=v==='#14261D';if(dark&&+t.value<50)t.value=88;if(!dark&&+t.value>80)t.value=30;draw()});
  $$(root,'[data-pr]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.pr;if(bg==='#14261D'){bg='#FFFDF7';setSeg(root,'bg',bg)}t.value=k==='ai'?62:k==='almost'?39:24;draw()})});
  tog($(root,'.ac-sun'),function(o){$(root,'.ac-s').classList.toggle('sun',o)});draw();
 }},

{id:'a11y-keys',title:'Keyboard, focus and touch targets',
 terms:['Focus ring','Touch target','Semantic HTML'],
 intro:'Many people use a keyboard, a switch or a screen reader instead of a mouse; everyone uses thumbs. They need to see where they are, reach every control and hit it easily.',
 try:'Press “Tab to next” (or the Tab key) to walk through the form. Remove the focus ring and try again. Show touch targets, then fix them. Finally rebuild the button with a div.',
 html:BASE+'<div class="vz4 vz-a11y-keys"><style>'+
 '.vz-a11y-keys .ak-f{position:relative;max-width:340px;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:12px 16px 16px;display:grid;gap:12px}'+
 '.vz-a11y-keys .ak-top{display:flex;align-items:center;justify-content:space-between;font-weight:800}'+
 '.vz-a11y-keys .ib{display:inline-grid;place-items:center;width:24px;height:24px;border:0;background:none;padding:0;color:#14261D;cursor:pointer;border-radius:6px}'+
 '.vz-a11y-keys .big .ib{width:44px;height:44px;margin:-10px}'+
 '.vz-a11y-keys label{font-weight:700;font-size:14px;display:grid;gap:4px}'+
 '.vz-a11y-keys input[type=tel]{height:44px;border:2px solid #14261D;border-radius:10px;padding:0 10px;font:15px "Space Mono",monospace;color:#14261D;background:#FFFDF7}'+
 '.vz-a11y-keys .ck{display:flex;align-items:center;gap:8px;font-weight:500;font-size:14px}.vz-a11y-keys .ck input{width:18px;height:18px;margin:0;accent-color:#14261D}'+
 '.vz-a11y-keys .big .ck{min-height:44px}.vz-a11y-keys .big .ck input{width:24px;height:24px}'+
 '.vz-a11y-keys .go{display:flex;align-items:center;justify-content:center;min-height:48px;border:2.5px solid #14261D;border-radius:12px;background:#E8722C;font:700 15px "Instrument Sans",system-ui,sans-serif;color:#14261D;cursor:pointer;width:100%}'+
 '.vz-a11y-keys .lk{font-size:13.5px;text-decoration:underline;color:#14261D;justify-self:start}.vz-a11y-keys .big .lk{display:inline-flex;align-items:center;min-height:44px;padding:0 12px 0 0;margin:-10px 0}'+
 '.vz-a11y-keys .ak-f :focus{outline:none}.vz-a11y-keys .ak-f.ring :focus-visible,.vz-a11y-keys .ak-f.ring .kf{outline:3px solid #3B82C4;outline-offset:2px}'+
 '.vz-a11y-keys .hit{position:absolute;border:2px dashed #A3361A;background:rgba(246,215,232,.3);pointer-events:none;display:grid;place-items:end center;font:700 10px "Space Mono",monospace;color:#14261D}'+
 '.vz-a11y-keys .hit.ok{border-color:#2F7A4F;background:rgba(214,229,154,.25)}.vz-a11y-keys .hit span{background:#FFFDF7;border:1px solid #14261D;border-radius:4px;padding:0 3px;transform:translateY(14px);white-space:nowrap}'+
 '.vz-a11y-keys .ak-g{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:640px){.vz-a11y-keys .ak-g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctls"><button type="button" class="k-b pri ak-tab">Tab to next</button>'+segH('ring','Focus ring',[['on','Visible'],['off','Removed']],'on')+'</div>'+
 '<div class="k-ctls">'+togH('ak-hit','Show touch targets',false)+togH('ak-fix','Fix small targets',false)+segH('sem','Continue built with',[['btn','&lt;button&gt;'],['div','&lt;div&gt;']],'btn')+'</div>'+
 '<div class="ak-g"><form class="ak-f ring" onsubmit="return false"><div class="ak-top">Log in<span style="display:flex;gap:14px"><button type="button" class="ib" aria-label="Help" data-n="Help button">'+
 '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 17v.5"/></svg></button><button type="button" class="ib" aria-label="Close" data-n="Close button">'+IC.cross+'</button></span></div>'+
 '<label>Phone number<input type="tel" value="0803 123 4567" data-n="Phone number field"></label>'+
 '<label class="ck"><input type="checkbox" data-n="Remember this phone checkbox">Remember this phone</label>'+
 '<div class="ak-go"></div><a href="#" class="lk" data-n="Forgot PIN link" onclick="return false">Forgot PIN?</a></form>'+
 '<div class="k-cap ak-cap" aria-live="polite"></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-a11y-keys'),f=$(root,'.ak-f'),sem='btn',hit=false,cur=-1,note='';
  function goH(){$(root,'.ak-go').innerHTML=sem==='btn'?'<button type="button" class="go" data-n="Continue button">Continue</button>':'<div class="go" data-n="Continue (a div)">Continue</div>'}
  function list(){return $$(f,'[data-n]').filter(function(e){return e.tagName!=='DIV'})}
  function cap(){var ring=f.classList.contains('ring'),L=list(),e=L[cur];
   var s='<span class="k-term">Focus ring</span>'+(e?'Focus is on: <b>'+e.dataset.n+'</b> ('+(cur+1)+' of '+L.length+'). ':'Press Tab to start. ')+(ring?'The blue ring shows exactly where you are.':'<b>No ring.</b> Focus is still moving, but nobody can see where. Keyboard users are lost.');
   if(sem==='div')s+='<br><span class="k-term">Semantic HTML</span>Continue is now a &lt;div&gt; that looks like a button. Tab skips it: keyboards and screen readers cannot reach it. Use a real &lt;button&gt;.';
   if(hit)s+='<br><span class="k-term">Touch target</span>Dashed boxes show what a thumb can actually hit. Pink ones are under 44 × 44px.'+(f.classList.contains('big')?' Fixed: the icons look the same, but their tappable area grew.':' The help and close icons are just 24px.');
   $(root,'.ak-cap').innerHTML=s}
  function hits(){$$(f,'.hit').forEach(function(h){h.remove()});if(!hit)return;var fr=f.getBoundingClientRect();
   $$(f,'.ib,input[type=tel],.ck,.go,.lk').forEach(function(e){var r=e.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height),ok=w>=44&&h>=44,d=document.createElement('i');d.className='hit'+(ok?' ok':'');
    d.style.cssText='left:'+(r.left-fr.left-2)+'px;top:'+(r.top-fr.top-2)+'px;width:'+(r.width+4)+'px;height:'+(r.height+4)+'px';d.innerHTML='<span>'+w+'×'+h+'</span>';f.appendChild(d)})}
  function mark(){$$(f,'.kf').forEach(function(x){x.classList.remove('kf')});var e=list()[cur];if(e)e.classList.add('kf');cap()}
  $(root,'.ak-tab').addEventListener('click',function(){var L=list();cur=(cur+1)%L.length;mark()});
  f.addEventListener('focusin',function(e){var i=list().indexOf(e.target);if(i>=0){cur=i;mark()}});
  seg(root,'ring',function(v){f.classList.toggle('ring',v==='on');cap()});
  tog($(root,'.ak-hit'),function(o){hit=o;hits();cap()});tog($(root,'.ak-fix'),function(o){f.classList.toggle('big',o);hits();cap()});
  seg(root,'sem',function(v){sem=v;goH();cur=-1;mark();hits()});
  goH();cap();
 }},

{id:'a11y-senses',title:'Colour, alt text and screen readers',
 terms:['Colour blindness','Alt text','ARIA label','Screen reader','Reduced motion'],
 intro:'About 1 in 12 men cannot tell some colours apart. Blind people hear the page through a screen reader, software that reads it aloud. Both depend on choices you make.',
 try:'Switch the vision simulation while status uses colour only, then add icons and words. Below, change the alt text and the button name and read what the screen reader says.',
 html:BASE+'<div class="vz4 vz-a11y-senses"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="vz4p-ID"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0 0.115 0.786 0.099 0 0 -0.004 -0.048 1.052 0 0 0 0 0 1 0"/></filter><filter id="vz4d-ID"><feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0 0.280 0.673 0.047 0 0 -0.012 0.043 0.969 0 0 0 0 0 1 0"/></filter></svg><style>'+
 '.vz-a11y-senses .sx-l{max-width:380px;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:6px 14px}'+
 '.vz-a11y-senses .sx-r{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1.5px solid #E6E1D3;font-size:14px}.vz-a11y-senses .sx-r:last-child{border-bottom:0}'+
 '.vz-a11y-senses .dot{width:12px;height:12px;border-radius:50%;flex:none}.vz-a11y-senses .pill{margin-left:auto;display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 9px;font-weight:700;font-size:12.5px;border:1.5px solid currentColor}'+
 '.vz-a11y-senses .sr{background:#14261D;color:#F4F0E5;border-radius:12px;padding:12px 14px;font:13.5px/1.7 "Space Mono",monospace}.vz-a11y-senses .sr b{color:#D6E59A}'+
 '.vz-a11y-senses .sx-c{max-width:380px;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:14px;display:grid;gap:10px}'+
 '.vz-a11y-senses .sx-g{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:640px){.vz-a11y-senses .sx-g{grid-template-columns:1fr}}'+
 '</style>'+
 '<div class="k-ctls">'+segH('st','Status shown by',[['c','Colour only'],['ci','Colour + icon + word']],'c')+segH('vi','See it as',[['n','Typical vision'],['p','Red-blind'],['d','Green-blind'],['g','No colour']],'n')+'</div>'+
 '<div class="sx-g"><div class="sx-l"></div><div class="k-cap sx-cap"></div></div>'+
 '<div class="k-ctls">'+segH('alt','Image alt text',[['none','Missing'],['file','File name'],['good','Useful']],'none')+segH('ar','Bin button name',[['none','None'],['lab','aria-label']],'none')+'</div>'+
 '<div class="sx-g"><div class="sx-c"><b style="font-size:17px">Ada’s Fabrics</b><svg viewBox="0 0 320 120" width="100%" role="img" style="display:block;border:2px solid #14261D;border-radius:10px;background:#F7DCC4" aria-hidden="true"><rect x="0" y="80" width="320" height="40" fill="#E8722C"/><rect x="40" y="20" width="60" height="62" fill="#D6E59A" stroke="#14261D" stroke-width="2"/><rect x="110" y="30" width="60" height="52" fill="#C9E0F2" stroke="#14261D" stroke-width="2"/><rect x="180" y="24" width="60" height="58" fill="#F6D7E8" stroke="#14261D" stroke-width="2"/><circle cx="275" cy="46" r="14" fill="#14261D"/><rect x="262" y="60" width="26" height="30" rx="8" fill="#14261D"/></svg>'+
 '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px"><span>Transfer to Ada · ₦12,000</span><span style="display:grid;place-items:center;width:44px;height:44px;border:2px solid #14261D;border-radius:10px">'+IC.trash+'</span></div></div>'+
 '<div style="display:grid;gap:10px;min-width:0"><div><span class="k-lab">What a screen reader says</span><div class="sr" style="margin-top:6px"></div></div><div class="k-cap sx-ac"></div></div></div>'+
 '<div class="k-cap"><span class="k-term">Reduced motion</span>Your device’s Reduce Motion setting is <b class="sx-rm"></b> right now. Accessible products read it and swap big movement for gentle fades. Play with it in the Motion lesson.</div></div>',
 init:function(el){
  var root=$(el,'.vz-a11y-senses'),id=uid(),st='c',vi='n',alt='none',ar='none';
  root.innerHTML=root.innerHTML.replace(/vz4p-ID/g,'vz4p-'+id).replace(/vz4d-ID/g,'vz4d-'+id);
  var S=[['Bisi Adeyemi','₦12,500','Paid','#2F7A4F',IC.check],['Tunde Bakare','₦5,000','Failed','#A3361A',IC.cross],['Emeka Obi','₦3,200','Paid','#2F7A4F',IC.check],['Kemi Ade','₦8,500','Failed','#A3361A',IC.cross]];
  function list(){var l=$(root,'.sx-l');l.style.filter=vi==='p'?'url(#vz4p-'+id+')':vi==='d'?'url(#vz4d-'+id+')':vi==='g'?'grayscale(1)':'none';
   l.innerHTML=S.map(function(s){return '<div class="sx-r"><span>'+s[0]+'</span><b style="font-variant-numeric:tabular-nums">'+s[1]+'</b>'+(st==='c'?'<span class="dot" style="background:'+s[3]+';margin-left:auto;width:16px;height:16px"></span>':'<span class="pill" style="color:'+s[3]+'">'+s[4]+s[2]+'</span>')+'</div>'}).join('');
   $(root,'.sx-cap').innerHTML='<span class="k-term">Colour blindness</span>'+(st==='c'?(vi==='n'?'Green means paid, red means failed. Now switch “See it as” to Red-blind or Green-blind.':'Which ones failed? With colour as the only signal, you are guessing, and so is about 1 in 12 men.'):'Icon, word and colour together. Whatever the vision simulation, you can still read Paid and Failed. Never rely on colour alone.')}
  function sr(){var a={none:'<b>image</b>, “img_2041.jpg”… unlabelled graphic',file:'<b>image</b>, “IMG_2041 final final.jpg”',good:'<b>image</b>, “Ada smiling behind her fabric stall in Balogun Market”'}[alt];
   $(root,'.sr').innerHTML='<b>heading, level 2</b>, Ada’s Fabrics<br>'+a+'<br>Transfer to Ada, ₦12,000<br>'+(ar==='lab'?'<b>button</b>, “Delete transfer to Ada”':'<b>button</b>');
   $(root,'.sx-ac').innerHTML=(alt==='good'?'<span class="k-term">Alt text</span>Describes what matters in the image, in a sentence. (Purely decorative images get empty alt text so they are skipped.)':'<span class="k-term">Alt text</span>'+(alt==='none'?'No alt text: the screen reader guesses, often by reading the file name.':'A file name is not a description. It tells a blind person nothing.'))+
    '<br><span class="k-term">ARIA label</span>'+(ar==='lab'?'The bin icon now has a hidden name. A screen reader user knows exactly what it deletes.':'An icon-only button with no name is announced as just “button”. Delete? Close? Nobody knows.')}
  seg(root,'st',function(v){st=v;list()});seg(root,'vi',function(v){vi=v;list()});seg(root,'alt',function(v){alt=v;sr()});seg(root,'ar',function(v){ar=v;sr()});
  $(root,'.sx-rm').textContent=RM()?'ON':'off';list();sr();
 }}
];

/* a11y drills */
var gfield=function(c,bg){return '<div style="'+FF+'width:200px;max-width:100%;background:'+bg+';border-radius:12px;padding:14px;text-align:left"><b style="display:block;color:'+c+';font-size:14px;line-height:1.4;font-weight:500">Your transfer will arrive within 30 minutes.</b></div>'};
D['a11y']=[
{id:'a-target',type:'ab',level:1,q:'Which close button is easier to tap with a thumb?',
 a:card('<div style="display:flex;justify-content:space-between;align-items:center"><b>Filters</b><span style="display:grid;place-items:center;width:20px;height:20px">'+IC.cross+'</span></div><div style="margin-top:8px;color:#4A5A4F">Show paid transfers only</div>'),
 b:card('<div style="display:flex;justify-content:space-between;align-items:center"><b>Filters</b><span style="display:grid;place-items:center;width:44px;height:44px;margin:-10px -8px -10px 0;border:2px solid #14261D;border-radius:10px">'+IC.cross+'</span></div><div style="margin-top:8px;color:#4A5A4F">Show paid transfers only</div>'),ok:'b',
 why:'A touch target is the tappable area. Make it at least 44 × 44px even when the icon is smaller, so people do not miss, especially on a moving bus.'},
{id:'a-name-ring',type:'name',level:1,q:'What is the blue outline called?',
 face:'<div style="text-align:center">'+pbtn('Continue','outline:3px solid #3B82C4;outline-offset:3px')+'</div>',
 opts:['Focus ring','Hover state','Border','Shadow'],ok:0,
 why:'A focus ring shows which element the keyboard is on. Never remove it with outline: none unless you replace it with something just as visible.'},
{id:'a-grey',type:'pick',level:1,q:'Which text is easiest to read?',
 opts:[gfield('#A8A8A8','#FFFFFF'),gfield('#9CA3AF','#FFFFFF'),gfield('#4A5A4F','#FFFFFF')],ok:2,
 why:'Pale grey on white looks elegant but fails WCAG. Body text needs at least 4.5:1 contrast; the first two are around 2.4:1, the third is above 7:1.'},
{id:'a-colour',type:'pick',level:2,q:'Which status list works for someone who cannot tell red from green?',
 opts:[card(['Bisi','Tunde','Emeka'].map(function(n,i){return '<div style="display:flex;justify-content:space-between;padding:4px 0">'+n+'<i style="width:14px;height:14px;border-radius:50%;display:block;background:'+(i===1?'#A3361A':'#2F7A4F')+'"></i></div>'}).join(''),'width:170px'),
  card(['Bisi','Tunde','Emeka'].map(function(n,i){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">'+n+'<b style="display:inline-flex;gap:3px;align-items:center;color:'+(i===1?'#A3361A':'#2F7A4F')+'">'+(i===1?IC.cross+'Failed':IC.check+'Paid')+'</b></div>'}).join(''),'width:170px'),
  card(['Bisi','Tunde','Emeka'].map(function(n,i){return '<div style="display:flex;justify-content:space-between;padding:4px 0;color:'+(i===1?'#A3361A':'#2F7A4F')+';font-weight:700">'+n+'<span>₦5,000</span></div>'}).join(''),'width:170px')],ok:1,
 why:'Never rely on colour alone. Pair it with an icon and a word, so the meaning survives colour blindness, greyscale screens and bright sunlight.'},
{id:'a-name-alt',type:'name',level:2,q:'The text in the dark box is read aloud instead of the picture. What is it called?',
 face:'<div style="'+FF+'width:230px;max-width:100%;display:grid;gap:8px"><div style="height:70px;border:2px solid #14261D;border-radius:10px;background:linear-gradient(135deg,#F7DCC4,#E8722C)"></div><div style="background:#14261D;color:#F4F0E5;border-radius:8px;padding:8px;font:11.5px/1.5 Space Mono,monospace">“Ada smiling behind her fabric stall in Balogun Market”</div></div>',
 opts:['Alt text','ARIA label','Caption','Tooltip'],ok:0,
 why:'Alt text describes an image for people using a screen reader, and shows if the image fails to load. Describe what matters, in one sentence.'},
{id:'a-fix-icon',type:'fix',level:2,q:'A screen reader announces this button as just “button”. What fixes it?',
 face:card('<div style="display:flex;justify-content:space-between;align-items:center">Transfer to Ada<span style="display:grid;place-items:center;width:40px;height:40px;border:2px solid #14261D;border-radius:9px">'+IC.trash+'</span></div><div style="margin-top:8px;background:#14261D;color:#F4F0E5;border-radius:7px;padding:6px 8px;font:11px Space Mono,monospace">screen reader: “button”</div>'),
 opts:['Add aria-label="Delete transfer to Ada"','Make the bin icon bigger','Add a tooltip that appears on hover'],ok:0,
 why:'Icon-only buttons need a name. An ARIA label is a hidden name for controls with no visible text. Tooltips do not work on touch or for screen readers.'},
{id:'a-placeholder',type:'fix',level:2,q:'This field has no label, only grey placeholder text that disappears when you type. What is the fix?',
 face:card('<div style="height:42px;border:1.5px solid #C9C3B3;border-radius:9px;display:flex;align-items:center;padding:0 10px;color:#A8A8A8">Phone number</div>'),
 opts:['Add a visible label above and keep a darker example as placeholder','Make the placeholder text bold','Put a red star next to it'],ok:0,
 why:'Placeholder is not a label: it vanishes when typing starts and is usually too pale. Use a real, visible label, plus a border with enough contrast.'},
{id:'a-semantic',type:'pick',level:2,q:'Which of these can a keyboard user reach and press?',
 opts:['<code style="font:12px/1.5 Space Mono,monospace;color:#14261D;text-align:left;display:block">&lt;div class="btn"<br>&nbsp;onclick="pay()"&gt;<br>&nbsp;Pay<br>&lt;/div&gt;</code>','<code style="font:12px/1.5 Space Mono,monospace;color:#14261D;text-align:left;display:block">&lt;button<br>&nbsp;type="button"<br>&nbsp;onclick="pay()"&gt;<br>&nbsp;Pay<br>&lt;/button&gt;</code>','<code style="font:12px/1.5 Space Mono,monospace;color:#14261D;text-align:left;display:block">&lt;span class="btn"<br>&nbsp;onclick="pay()"&gt;<br>&nbsp;Pay<br>&lt;/span&gt;</code>'],ok:1,
 why:'Semantic HTML means using the real element. A &lt;button&gt; is focusable, works with Enter and Space, and is announced as a button. A styled div or span is none of those.'},
{id:'a-almost',type:'ab',level:3,q:'Both greys look fine. Which one passes AA for small text on cream?',
 a:gfield('#66736A','#F4F0E5'),b:gfield('#5F6C63','#F4F0E5'),ok:'b',
 why:'A is 4.36:1, just under the 4.5:1 line; B is 4.84:1. The eye barely sees it, so always check with a contrast tool instead of trusting “looks fine”.'},
{id:'a-ring-contrast',type:'ab',level:3,q:'Both buttons have keyboard focus. Which focus ring is accessible?',
 a:'<div style="background:#FFFDF7;border-radius:12px;padding:16px">'+pbtn('Continue','outline:3px solid #D6E59A;outline-offset:3px')+'</div>',
 b:'<div style="background:#FFFDF7;border-radius:12px;padding:16px">'+pbtn('Continue','outline:3px solid #14261D;outline-offset:3px')+'</div>',ok:'b',
 why:'A focus ring needs at least 3:1 contrast with what is around it. Lime on paper is about 1.3:1, so it vanishes. Dark ink or strong blue works.'}
];

/* =================== THE DETAILING PASS =================== */
var FX=[['f-align','Align left edges','Alignment','The item list started 6px to the right of the title. Now every left edge sits on one line.','.dp-items'],
 ['f-icon','Align the icon optically','Optical alignment','The clock sat 3px low, aligned to the box, not to the text. Now it sits on the text’s visual middle.','.dp-due'],
 ['f-play','Centre the play icon','Optical centring','Maths centred the triangle’s box, so it looked too far left. Nudged 2px right, it looks centred.','.dp-play'],
 ['f-radius','Nest the corner radius','Consistency','Inner corners = outer radius minus the gap: 14 − 6 = 8px. The same radius inside looked puffy.','.dp-thumb'],
 ['f-tnum','Use tabular numbers','Tabular numbers','Equal-width digits, aligned right, so money lines up and is easy to compare.','.dp-items'],
 ['f-wrap','Balance the headline','Text wrap balance','No lonely last word. Two even lines read as one calm shape.','.dp-h'],
 ['f-hang','Hang the quote mark','Hanging punctuation','The opening quote now hangs outside, so the letters line up with the edge above.','.dp-q'],
 ['f-snap','Snap the divider','Pixel snapping','The 1px line sat on half a pixel, so it smeared into two grey rows. Snapped, it is one crisp line.','.dp-line']];
V['detail']=[
{id:'detail-pass',title:'The detailing pass',
 terms:['Polish','Optical alignment','Optical centring','Pixel snapping','Text wrap balance','Hanging punctuation','Tabular numbers','Ship-ready'],
 intro:'This invoice card “works”. It also has eight small flaws. None is obvious alone; together they are the difference between fine and well made. The magnifier shows them at 3× size.',
 try:'Turn on one fix at a time and watch the magnifier jump to it. Move your pointer (or tap) over the card to look anywhere. Fix all eight.',
 html:BASE+'<div class="vz4 vz-detail-pass"><style>'+
 '.vz-detail-pass .dp-g{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:18px;align-items:start}'+
 '.vz-detail-pass .dp-st{position:relative;touch-action:none}'+
 '.vz-detail-pass .dp-card{width:300px;max-width:100%;background:#FFFDF7;border:2px solid #14261D;border-radius:18px;padding:16px;color:#14261D;font-family:"Instrument Sans",system-ui,sans-serif;font-size:14px;line-height:1.4;position:relative}'+
 '.vz-detail-pass .dp-card .dp-eb{font:700 10.5px "Space Mono",monospace;letter-spacing:2px;color:#AD4F16}'+
 '.vz-detail-pass .dp-card .dp-h{font:800 21px/1.15 "Bricolage Grotesque","Instrument Sans",sans-serif;margin:6px 0 8px;letter-spacing:-.02em}.dp-card .dp-h span{display:block;white-space:nowrap}'+
 '.vz-detail-pass .dp-card .wa{display:none}.dp-card.f-wrap .wa{display:block}.dp-card.f-wrap .wb{display:none}'+
 '.vz-detail-pass .dp-card .dp-due{display:flex;gap:6px;align-items:center;font-size:13.5px;color:#4A5A4F}.dp-card .dp-due svg{position:relative;top:3px}.dp-card.f-icon .dp-due svg{top:0}'+
 '.vz-detail-pass .dp-card .dp-line{margin:12px 0 10px;height:2px;background:rgba(20,38,29,.38)}.dp-card.f-snap .dp-line{height:1px;background:#14261D;margin-bottom:11px}'+
 '.vz-detail-pass .dp-card .dp-items{display:grid;gap:5px;padding-left:6px;font-variant-numeric:proportional-nums}.dp-card.f-align .dp-items{padding-left:0}'+
 '.vz-detail-pass .dp-card .dp-items div{display:flex;justify-content:space-between;gap:8px}.dp-card .dp-items b{font-weight:600;min-width:96px;text-align:left}'+
 '.vz-detail-pass .dp-card.f-tnum .dp-items{font-variant-numeric:tabular-nums}.dp-card.f-tnum .dp-items b{text-align:right}'+
 '.vz-detail-pass .dp-card .dp-in{margin-top:12px;border:1.5px solid #14261D;border-radius:14px;padding:6px;display:flex;gap:10px;align-items:center;background:#F4F0E5}'+
 '.vz-detail-pass .dp-card .dp-thumb{width:64px;height:48px;border-radius:14px;background:#14261D;display:grid;place-items:center;flex:none}.dp-card.f-radius .dp-thumb{border-radius:8px}'+
 '.vz-detail-pass .dp-card .dp-play{width:28px;height:28px;border-radius:50%;background:#FFFDF7;display:grid;place-items:center}.dp-card .dp-play svg{transform:translateX(0)}.dp-card.f-play .dp-play svg{transform:translateX(2px)}'+
 '.vz-detail-pass .dp-card .dp-q{margin:12px 0 0;font-style:italic;font-size:14.5px}.dp-card.f-hang .dp-q{text-indent:-.42em}'+
 '.vz-detail-pass .dp-card .gd{position:absolute;top:0;bottom:0;left:16px;width:0;border-left:1px dashed #E8722C;display:none}.dp-card.guides .gd{display:block}'+
 '.vz-detail-pass .dp-lp{position:relative;width:180px;height:180px;border-radius:50%;border:3px solid #14261D;overflow:hidden;background:#F4F0E5;box-shadow:3px 3px 0 #14261D;flex:none}'+
 '.vz-detail-pass .dp-lp .cl{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}'+
 '.vz-detail-pass .dp-x{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:2px solid #14261D;border-radius:50%;pointer-events:none;box-shadow:0 0 0 2px #FFFDF7}'+
 '.vz-detail-pass .dp-fx{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.vz-detail-pass .dp-fx .k-b{justify-content:flex-start;font-size:13.5px}'+
 '.vz-detail-pass .dp-pr{height:12px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7;overflow:hidden}.vz-detail-pass .dp-pr i{display:block;height:100%;background:#E8722C;transition:width .25s}'+
 '.vz-detail-pass .dp-ok{display:none;align-items:center;gap:6px;background:#14261D;color:#D6E59A;border-radius:8px;padding:4px 10px;font:700 12px "Space Mono",monospace}.vz-detail-pass .dp-ok.on{display:inline-flex}'+
 '@media (max-width:640px){.vz-detail-pass .dp-g{grid-template-columns:1fr}.vz-detail-pass .dp-lp{width:150px;height:150px}.vz-detail-pass .dp-side{display:flex!important;gap:12px;align-items:center}}'+
 '</style>'+
 '<div class="dp-fx">'+FX.map(function(f,i){return togH('dp-t" data-i="'+i,f[1],false)}).join('')+'</div>'+
 '<div class="k-ctls"><button type="button" class="k-b pri dp-all">Fix all</button><button type="button" class="k-b dp-rs">Reset</button>'+togH('dp-gd','Show edge guide',false)+'</div>'+
 '<div><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="k-lab dp-c">Polish: 0 of 8</span><span class="dp-ok">'+IC.check+'Ship-ready</span></div><div class="dp-pr" style="margin-top:6px"><i style="width:0"></i></div></div>'+
 '<div class="dp-g"><div class="dp-st"><div class="dp-card"><i class="gd"></i><div class="dp-eb">INVOICE 0042</div>'+
 '<div class="dp-h"><span class="wb">Your payment is on its</span><span class="wb">way.</span><span class="wa">Your payment</span><span class="wa">is on its way.</span></div>'+
 '<div class="dp-due">'+IC.clock+'<span>Due 30 Nov · Adaeze Studio</span></div><div class="dp-line"></div>'+
 '<div class="dp-items"><div><span>Logo design</span><b>₦41,100.00</b></div><div><span>Brand colours</span><b>₦7,111.50</b></div><div><span>Print files</span><b>₦4,400.00</b></div><div style="font-weight:700"><span>Total</span><b style="font-weight:800">₦52,611.50</b></div></div>'+
 '<div class="dp-in"><div class="dp-thumb"><span class="dp-play"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M0 0L12 7L0 14Z" fill="#14261D"/></svg></span></div><span style="font-size:13px">How refunds work<br><span style="color:#4A5A4F;font-variant-numeric:tabular-nums">0:48</span></span></div>'+
 '<p class="dp-q">“Fast, clear and on time. Ada’s team got the files to us before lunch.”</p></div><i class="dp-x" style="left:40px;top:60px"></i></div>'+
 '<div class="dp-side" style="display:grid;gap:12px;justify-items:start;min-width:0"><div class="dp-lp" aria-hidden="true"><div class="cl"></div></div><div class="k-cap dp-cap" style="width:100%"></div></div></div></div>',
 init:function(el){
  var root=$(el,'.vz-detail-pass'),card=$(root,'.vz-detail-pass .dp-card'),st=$(root,'.dp-st'),lp=$(root,'.dp-lp'),Z=3,pt={x:40,y:60};
  function loupe(){var cl=$(lp,'.cl');cl.innerHTML='';var c=card.cloneNode(true);c.style.width=card.offsetWidth+'px';c.style.maxWidth='none';cl.appendChild(c);
   var h=lp.clientWidth/2;cl.style.transform='translate('+(h-pt.x*Z)+'px,'+(h-pt.y*Z)+'px) scale('+Z+')';var x=$(root,'.dp-x');x.style.left=pt.x+'px';x.style.top=pt.y+'px'}
  function lookAt(sel,dx){var t=$(card,sel);if(!t)return;var a=t.getBoundingClientRect(),b=card.getBoundingClientRect();pt={x:a.left-b.left+(dx==null?Math.min(30,a.width/2):dx),y:a.top-b.top+a.height/2};loupe()}
  function count(){var n=FX.filter(function(f){return card.classList.contains(f[0])}).length;$(root,'.dp-c').textContent='Polish: '+n+' of 8';$(root,'.dp-pr i').style.width=(n/8*100)+'%';$(root,'.dp-ok').classList.toggle('on',n===8);return n}
  function say(i,on){var f=FX[i];$(root,'.dp-cap').innerHTML='<span class="k-term">'+f[2]+'</span>'+(on?f[3]:'Back to before. Compare it in the magnifier.')+(count()===8?'<br><span class="k-term">Ship-ready</span>All eight fixed. Nobody will name any single change, but everyone will feel the card is well made. That feeling is polish.':'')}
  $$(root,'.dp-t').forEach(function(b){tog(b,function(on){var i=+b.dataset.i,f=FX[i];card.classList.toggle(f[0],on);var dx={'f-align':4,'f-hang':4,'f-tnum':230,'f-play':14,'f-icon':8,'f-radius':4,'f-wrap':150,'f-snap':40}[f[0]];lookAt(f[4],dx);say(i,on)})});
  $(root,'.dp-all').addEventListener('click',function(){FX.forEach(function(f){card.classList.add(f[0])});$$(root,'.dp-t').forEach(function(b){b.setAttribute('aria-pressed','true')});count();loupe();$(root,'.dp-cap').innerHTML='<span class="k-term">Ship-ready</span>All eight fixed. Nobody will name any single change, but everyone will feel the card is well made. That feeling is polish.'});
  $(root,'.dp-rs').addEventListener('click',function(){FX.forEach(function(f){card.classList.remove(f[0])});$$(root,'.dp-t').forEach(function(b){b.setAttribute('aria-pressed','false')});count();loupe();intro()});
  tog($(root,'.dp-gd'),function(o){card.classList.toggle('guides',o);loupe()});
  function mv(e){var b=card.getBoundingClientRect();pt={x:Math.max(0,Math.min(b.width,e.clientX-b.left)),y:Math.max(0,Math.min(b.height,e.clientY-b.top))};loupe()}
  st.addEventListener('pointermove',mv);st.addEventListener('pointerdown',mv);
  function intro(){$(root,'.dp-cap').innerHTML='<span class="k-term">Polish</span>The final layer of care on small details. Turn on a fix to begin, or move over the card to inspect it.'}
  intro();count();requestAnimationFrame(function(){if(alive(el))lookAt('.dp-items',4)});
 }},

{id:'detail-audit',title:'Consistency audit and fresh eyes',
 terms:['Consistency audit','Fresh eyes'],
 intro:'A consistency audit checks that every repeated element matches. Three of these six quick actions break the pattern. Professionals use tricks to see their own work with fresh eyes.',
 try:'Tap the three odd ones out. Stuck? Try Squint, Flip or Phone width, then Reveal.',
 html:BASE+'<div class="vz4 vz-detail-audit"><style>'+
 '.vz-detail-audit .da-st{display:grid;place-items:center;padding:18px 10px;overflow:hidden}'+
 '.vz-detail-audit .da-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%;max-width:420px;transition:filter .2s,transform .3s,max-width .3s}'+
 '.vz-detail-audit .da-g.sq{filter:blur(2.5px)}.vz-detail-audit .da-g.fl{transform:scaleX(-1)}.vz-detail-audit .da-g.ph{max-width:250px}'+
 '.vz-detail-audit .da-i{position:relative;display:grid;justify-items:center;gap:8px;padding:14px 6px 12px;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;font:600 13px "Instrument Sans",system-ui,sans-serif;color:#14261D;cursor:pointer;min-height:44px}'+
 '.vz-detail-audit .da-i .ic{width:40px;height:40px;border-radius:12px;background:#D6E59A;display:grid;place-items:center;border:2px solid #14261D}'+
 '.vz-detail-audit .da-i.hit{background:#D6E59A}.vz-detail-audit .da-i.miss{animation:vz4no .3s}@keyframes vz4no{30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}'+
 '.vz-detail-audit .da-i .tg{position:absolute;top:-10px;right:-6px;background:#14261D;color:#D6E59A;border-radius:6px;font:700 10px "Space Mono",monospace;padding:2px 5px;display:none}.vz-detail-audit .da-i.hit .tg{display:block}'+
 '@media (prefers-reduced-motion:reduce){.vz-detail-audit .da-i.miss{animation:none}}'+
 '</style>'+
 '<div class="k-ctls">'+togH('da-sq','Squint (blur)',false)+togH('da-fl','Flip',false)+togH('da-ph','Phone width',false)+'<button type="button" class="k-b da-rv">Reveal</button></div>'+
 '<div class="k-stage da-st"><div class="da-g"></div></div><div class="k-cap da-cap" aria-live="polite"></div></div>',
 init:function(el){
  var root=$(el,'.vz-detail-audit'),found=0;
  var P={send:'M4 12h14M12 6l6 6-6 6',recv:'M20 12H6M12 6l-6 6 6 6',bill:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',air:'M8 3h8v18H8zM11 18h2',save:'M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3',card:'M3 6h18v12H3zM3 10h18'};
  var I=[['send','Send',0],['recv','Receive','Icon stroke is 1.25px, the rest are 2px. Thin icons look weaker and greyer.'],['bill','Pay bills',0],['air','Airtime','Corner radius is 6px, the others are 12px.'],['save','Savings',0],['card','Cards','The label is 2px lower and lighter (400, not 600).']];
  $(root,'.da-g').innerHTML=I.map(function(it,i){var odd=it[2],sw=i===1?1.25:2,rad=i===3?'6px':'12px';
   return '<button type="button" class="da-i" data-i="'+i+'"><span class="ic" style="border-radius:'+rad+'"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+P[it[0]]+'"/></svg></span><span style="'+(i===5?'position:relative;top:2px;font-weight:400':'')+'">'+it[1]+'</span><i class="tg">odd</i></button>'}).join('');
  function cap(t){$(root,'.da-cap').innerHTML='<span class="k-term">Consistency audit</span>'+t+' <b>Found '+found+' of 3.</b>'}
  $$(root,'.da-i').forEach(function(b){b.addEventListener('click',function(){var it=I[+b.dataset.i];if(b.classList.contains('hit'))return;
   if(it[2]){b.classList.add('hit');found++;cap(it[2])}else{b.classList.remove('miss');void b.offsetWidth;b.classList.add('miss');cap('That one matches the pattern. Look again.')}})});
  var F={sq:'Squint: blurring hides the details and shows the shapes. Odd weights and sizes pop out.',fl:'Flip: mirroring the screen makes your brain see it as new. Professionals do this in their design tools.',ph:'Phone width: review on a real phone size. Problems that hide on a big screen show up fast.'};
  ['sq','fl','ph'].forEach(function(k){tog($(root,'.da-'+k),function(o){$(root,'.da-g').classList.toggle(k,o);$(root,'.da-cap').innerHTML='<span class="k-term">Fresh eyes</span>'+F[k]+' Taking a break and looking again is the simplest version.'})});
  $(root,'.da-rv').addEventListener('click',function(){$$(root,'.da-i').forEach(function(b){if(I[+b.dataset.i][2]&&!b.classList.contains('hit')){b.classList.add('hit');found++}});cap('Receive (thin stroke), Airtime (smaller radius) and Cards (lower, lighter label).')});
  cap('Six actions should match exactly: same box, icon stroke, radius and label. Tap the ones that do not.');
 }}
];

/* detail drills */
var playB=function(dx,s){return '<span style="display:grid;place-items:center;width:'+(s||64)+'px;height:'+(s||64)+'px;border-radius:50%;background:#14261D"><svg width="20" height="24" viewBox="0 0 12 14" style="transform:translateX('+dx+'px)" aria-hidden="true"><path d="M0 0L12 7L0 14Z" fill="#FFFDF7"/></svg></span>'};
var amts=function(tn){return card(['₦41,100.00','₦7,111.50','₦4,400.00','₦52,611.50'].map(function(a,i){return '<div style="display:flex;justify-content:space-between;'+(i===3?'font-weight:800;border-top:1.5px solid #14261D;padding-top:4px;margin-top:2px':'')+'"><span>'+['Logo','Colours','Print','Total'][i]+'</span><b style="font-variant-numeric:tabular-nums;text-align:right;min-width:90px">'+a+'</b></div>'}).join(''),'font-size:14px;width:200px')};
var lrow=function(off){return card(['Send money','Pay bills','Buy airtime'].map(function(t,i){return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;'+(i===1?'padding-left:'+off+'px':'')+'"><i style="width:18px;height:18px;border-radius:5px;background:#D6E59A;border:1.5px solid #14261D;display:block;flex:none"></i>'+t+'</div>'}).join(''),'width:180px')};
D['detail']=[
{id:'d-align',type:'ab',level:1,q:'Which list has aligned left edges?',
 a:lrow(6),b:lrow(0),ok:'b',
 why:'Every left edge in a group should sit on one invisible line. A few stray pixels make the whole card feel slightly broken, even if nobody can say why.'},
{id:'d-name-tnum',type:'name',level:1,q:'The digits here are all the same width, so the columns line up. What are they called?',
 face:amts(true),opts:['Tabular numbers','Kerning','Leading','Pixel snapping'],ok:0,
 why:'Tabular numbers give every digit the same width, so money in a column lines up and counters do not jitter. In CSS: font-variant-numeric: tabular-nums.'},
{id:'d-radius',type:'pick',level:1,q:'Which card nests its corners correctly?',
 opts:[14,8,0].map(function(r){return '<div style="width:150px;padding:8px;border:2px solid #14261D;border-radius:16px;background:#FFFDF7"><div style="height:70px;border-radius:'+r+'px;background:#14261D"></div></div>'}),ok:1,
 why:'Inner radius = outer radius minus the gap between them (16 − 8 = 8px). The same radius inside looks puffy; zero looks sharp and unrelated.'},
{id:'d-name-hang',type:'name',level:2,q:'The opening quote mark sits outside the text edge, so the letters line up with the line above. What is this called?',
 face:card('<div style="position:relative"><i style="position:absolute;left:0;top:-4px;bottom:-4px;border-left:1px dashed #AD4F16;display:block"></i><b>Client review</b><p style="margin:6px 0 0;font-style:italic;text-indent:-.42em">“Fast, clear and on time. The files came before lunch.”</p></div>','width:230px;padding-left:16px'),
 opts:['Hanging punctuation','Tracking','Text wrap balance','Indent'],ok:0,
 why:'Hanging punctuation lets quote marks sit in the margin, so the text itself aligns with everything above it. The edge stays clean.'},
{id:'d-icon',type:'ab',level:2,q:'Which icon is aligned with its text?',
 a:card('<div style="display:flex;gap:6px;align-items:center;font-size:15px"><span style="position:relative;top:3px;display:flex">'+IC.clock+'</span>Due 30 Nov</div>','width:170px'),
 b:card('<div style="display:flex;gap:6px;align-items:center;font-size:15px"><span style="display:flex">'+IC.clock+'</span>Due 30 Nov</div>','width:170px'),ok:'b',
 why:'Optical alignment: line the icon up with the text’s visual middle, not with the box edge. Here A sits 3px low and looks like it is sinking.'},
{id:'d-snap',type:'fix',level:2,q:'This 1px divider looks soft and grey on some screens. What is the fix?',
 face:card('<b>Invoice 0042</b><div style="margin:10px 0;height:2px;background:rgba(20,38,29,.38)"></div>Logo design · ₦41,100'+mono('top: 47.5px','display:block;margin-top:6px')),
 opts:['Snap it to a whole pixel, for example 48px instead of 47.5px','Make the line 3px thick','Add a shadow under it'],ok:0,
 why:'Pixel snapping: a line on half a pixel gets spread over two pixels at half strength, so it looks blurry. Whole-pixel positions keep it crisp.'},
{id:'d-name-wrap',type:'name',level:2,q:'The bottom headline was fixed. What is the fix called?',
 face:'<div style="'+FF+'display:grid;gap:10px;width:240px;max-width:100%;color:#14261D">'+['<span style="display:block">Your payment is on its</span><span style="display:block">way.</span>','<span style="display:block">Your payment</span><span style="display:block">is on its way.</span>'].map(function(h,i){return '<div style="background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:10px;font:800 18px/1.15 Bricolage Grotesque,Instrument Sans,sans-serif;white-space:nowrap">'+mono(i?'AFTER':'BEFORE','display:block;font-weight:700;margin-bottom:4px')+h+'</div>'}).join('')+'</div>',
 opts:['Text wrap balance','Tracking','Hanging punctuation','Leading'],ok:0,
 why:'Text wrap balance evens out line lengths in short headlines, so no single word is left alone on the last line. In CSS: text-wrap: balance.'},
{id:'d-1px',type:'ab',level:3,q:'Look closely. Which pair of buttons is perfectly aligned?',
 a:'<div style="display:flex;gap:8px;align-items:flex-start;padding:6px">'+pbtn('Cancel','background:#FFFDF7;box-shadow:none')+pbtn('Pay','box-shadow:none;position:relative;top:1px')+'</div>',
 b:'<div style="display:flex;gap:8px;align-items:flex-start;padding:6px">'+pbtn('Cancel','background:#FFFDF7;box-shadow:none')+pbtn('Pay','box-shadow:none')+'</div>',ok:'b',
 why:'In A the Pay button sits 1px lower. One pixel is invisible to most people until they see it, and then it is all they see. Zoom in during your detailing pass.'},
{id:'d-audit',type:'pick',level:3,q:'Which row of buttons passes a consistency audit?',
 opts:[[12,12,8],[12,12,12],[12,10,12]].map(function(rs,k){return '<div style="display:flex;gap:6px">'+rs.map(function(r,i){var sw=(k===2&&i===2)?1.4:2;return '<span style="display:grid;place-items:center;width:44px;height:44px;border:2px solid #14261D;border-radius:'+r+'px;background:#D6E59A"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="'+sw+'" stroke-linecap="round"><path d="'+['M4 12h14M12 6l6 6-6 6','M12 5v14M5 12h14','M5 12.5l4.5 4.5L19 7.5'][i]+'"/></svg></span>'}).join('')+'</div>'}),ok:1,
 why:'A consistency audit checks every repeated element: same radius, same icon stroke, same size. The first has one 8px corner; the third mixes radius and a thinner icon.'},
{id:'d-play',type:'ab',level:3,q:'Both triangles were nudged right. Which one looks centred?',
 a:'<div style="padding:10px">'+playB(5)+'</div>',b:'<div style="padding:10px">'+playB(2)+'</div>',ok:'b',
 why:'Optical centring: a triangle’s weight sits on its flat side, so nudge it right by about a tenth of its width. Too far, as in A, and it looks off the other way.'}
];
})();
