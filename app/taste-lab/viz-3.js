/* Taste Lab: visual explainers + Train-your-eye drills (part 3: depth, shape, background, icons, imagery). */
window.VIZ=window.VIZ||{};window.DRILLS=window.DRILLS||{};
(function(){
const $=(el,s)=>el.querySelector(s),$$=(el,s)=>Array.prototype.slice.call(el.querySelectorAll(s));
const RM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function once(el){const r=el.querySelector('.vz3');if(!r||r._vzOn)return true;r._vzOn=1;return false}
function seg(el,name,fn){const g=$(el,'[data-g="'+name+'"]');if(!g)return;g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!g.contains(b))return;$$(g,'button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));fn(b.dataset.v,b)})}
function tog(el,name,fn){const b=$(el,'[data-t="'+name+'"]');if(!b)return;b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');fn(on)})}
function slide(el,name,fn){const i=$(el,'input[name="'+name+'"]');if(!i)return;const h=()=>fn(parseFloat(i.value),i);i.addEventListener('input',h);return i}
function out(el,k,v){$$(el,'[data-o="'+k+'"]').forEach(n=>{n.innerHTML=v})}
const S=(name,label,min,max,val,step)=>`<label class="sl"><span class="h">${label}<span class="v" data-o="${name}"></span></span><input type="range" name="${name}" min="${min}" max="${max}" value="${val}" step="${step||1}"></label>`;
const KIT=`<style>
:where(.vz3){font-family:'Instrument Sans',system-ui,sans-serif;color:#14261D;display:grid;gap:14px;min-width:0;font-size:15px;line-height:1.5}
:where(.vz3) *{box-sizing:border-box}
:where(.vz3) .stg{background:#F4F0E5;border:2.5px solid #14261D;border-radius:14px;padding:16px;position:relative;overflow:hidden;min-width:0}
:where(.vz3) .paper{background:#FFFDF7}
:where(.vz3) .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
:where(.vz3) .seg{display:flex;flex-wrap:wrap;gap:6px}
:where(.vz3) .seg button,:where(.vz3) .tb{min-height:44px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;padding:8px 12px;font:600 14px/1.2 'Instrument Sans',system-ui,sans-serif;color:#14261D;cursor:pointer}
:where(.vz3) .seg button[aria-pressed=true],:where(.vz3) .tb[aria-pressed=true]{background:#14261D;color:#D6E59A}
:where(.vz3) .sl{display:grid;gap:0}
:where(.vz3) .sl .h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-weight:700;font-size:14px}
:where(.vz3) .v{font:700 12px/1.4 'Space Mono',monospace;background:#FFFDF7;border:1.5px solid #14261D;border-radius:6px;padding:1px 6px;white-space:nowrap}
:where(.vz3) input[type=range]{width:100%;accent-color:#E8722C;height:40px;margin:0}
:where(.vz3) .note{background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.5}
:where(.vz3) .note b{font-family:'Bricolage Grotesque',sans-serif}
:where(.vz3) .lab{font:700 11px/1.3 'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;color:#4A5A4F}
:where(.vz3) .pill{display:inline-block;font:700 12px/1.4 'Space Mono',monospace;border:2px solid #14261D;border-radius:99px;padding:3px 10px;background:#FFFDF7}
:where(.vz3) .ok{background:#D6E59A}:where(.vz3) .bad{background:#F6D7E8}:where(.vz3) .mid{background:#F7DCC4}
:where(.vz3) .g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:14px}
:where(.vz3) .ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:4px 16px}
:where(.vz3) .code{font:700 12px/1.5 'Space Mono',monospace;background:#14261D;color:#D6E59A;border-radius:10px;padding:10px 12px;overflow-wrap:anywhere}
:where(.vz3) .sm{font-size:13px;color:#4A5A4F;margin:0}
</style>`;
/* tiny inline icon library, 24px grid, stroke = currentColor */
const IC={
home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
share:'<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
};
const svg=(k,o)=>{o=o||{};return`<svg viewBox="0 0 24 24" width="${o.s||24}" height="${o.s||24}" fill="${o.fill||'none'}" stroke="currentColor" stroke-width="${o.w||2}" stroke-linecap="${o.cap||'round'}" stroke-linejoin="${o.join||'round'}" aria-hidden="true">${IC[k]}</svg>`};

/* =====================================================================
   DEPTH & SHADOW
   ===================================================================== */
window.VIZ['depth']=[
{id:'depth-shadow-anatomy',title:'Build a shadow, one dial at a time',
terms:['Drop shadow','Offset','Blur radius','Spread','Hard shadow','Tinted shadow','Layered shadow','Inner shadow'],
intro:'A shadow is just a blurred copy of the shape, moved and coloured. Five numbers control it. Change one at a time and you will see what each word means.',
try:'Move each slider alone, then tap the four styles to see the classic recipes.',
html:KIT+`<div class="vz3 vz-depth-shadow-anatomy">
<style>
.vz-depth-shadow-anatomy .qstage{min-height:230px;display:grid;place-items:center;background:#F4F0E5}
.vz-depth-shadow-anatomy .qcard{width:min(220px,80%);background:#FFFDF7;border-radius:16px;padding:18px;transition:box-shadow .15s}
.vz-depth-shadow-anatomy .qcard b{font-family:'Bricolage Grotesque',sans-serif;font-size:18px;display:block}
.vz-depth-shadow-anatomy .qcard span{font-size:13px;color:#4A5A4F}
.vz-depth-shadow-anatomy .ghost{position:absolute;inset:auto;pointer-events:none}
</style>
<div class="lab">Recipe</div>
<div class="seg" data-g="pre"><button data-v="soft" aria-pressed="true">Soft drop</button><button data-v="hard" aria-pressed="false">Hard</button><button data-v="tint" aria-pressed="false">Tinted</button><button data-v="layer" aria-pressed="false">Layered</button><button data-v="inner" aria-pressed="false">Inner</button></div>
<div class="stg qstage"><div class="qcard"><b>Order summary</b><span>3 items · ₦24,500</span></div></div>
<div class="ctl">${S('x','Offset x',-20,20,0)}${S('y','Offset y',0,30,8)}${S('b','Blur radius',0,60,24)}${S('s','Spread',-12,12,-4)}${S('o','Opacity',0,100,18)}</div>
<div class="code" data-o="css"></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-depth-shadow-anatomy'),card=$(R,'.qcard');
const P={soft:{x:0,y:8,b:24,s:-4,o:18,mode:'drop'},hard:{x:5,y:5,b:0,s:0,o:100,mode:'drop'},tint:{x:0,y:10,b:26,s:-4,o:30,mode:'tint'},layer:{x:0,y:12,b:28,s:-6,o:14,mode:'layer'},inner:{x:0,y:3,b:8,s:0,o:22,mode:'inner'}};
let mode='drop';const I={};['x','y','b','s','o'].forEach(k=>{I[k]=slide(R,k,()=>draw())});
const SAY={drop:'<b>Drop shadow.</b> Offset moves it, blur softens the edge, spread grows or shrinks it, opacity sets how dark. Small negative spread keeps it tucked under the card, like real light.',
hard:'<b>Hard shadow.</b> Blur is 0, so the edge is sharp. It reads as graphic and bold rather than realistic. This is the Warm Fusion look.',
tint:'<b>Tinted shadow.</b> Same shadow, but coloured with a deep version of the background (warm brown on cream) instead of grey. Grey shadows on warm pages look dirty.',
layer:'<b>Layered shadow.</b> Two shadows stacked: a tight, dark contact shadow right under the edge, plus a big soft one. This is how real objects look, and why premium UI feels solid.',
inner:'<b>Inner shadow.</b> The shadow sits inside the shape, so it looks pressed in. Use it for inputs and wells, never for things you want people to tap.'};
function css(){const x=+I.x.value,y=+I.y.value,b=+I.b.value,s=+I.s.value,o=+I.o.value/100;
const col=mode==='tint'?`rgba(110,62,20,${o.toFixed(2)})`:mode==='hard'||(b===0)?(o>=1?'#14261D':`rgba(20,38,29,${o.toFixed(2)})`):`rgba(20,38,29,${o.toFixed(2)})`;
if(mode==='inner')return`inset ${x}px ${y}px ${b}px ${s}px ${col}`;
if(mode==='layer')return`0 1px 2px rgba(20,38,29,.22), ${x}px ${y}px ${b}px ${s}px ${col}`;
return`${x}px ${y}px ${b}px ${s}px ${col}`}
function draw(){['x','y','b','s'].forEach(k=>out(R,k,I[k].value+'px'));out(R,'o',I.o.value+'%');const c=css();card.style.boxShadow=c;card.style.background=mode==='inner'?'#EDE6D6':'#FFFDF7';card.style.border=mode==='hard'?'2.5px solid #14261D':'0';out(R,'css','box-shadow: '+c+';');out(R,'say',SAY[mode])}
seg(R,'pre',v=>{const p=P[v];mode=v==='hard'?'hard':p.mode;['x','y','b','s','o'].forEach(k=>I[k].value=p[k]);draw()});
draw()}},

{id:'depth-elevation',title:'Elevation: how high things float',
terms:['Elevation','Light source','Hairline','Scrim'],
intro:'Every layer of an interface sits at a height. The higher it is, the bigger and softer its shadow. Users read that height as importance.',
try:'Drag the level up, then break the light source and watch the page stop making sense.',
html:KIT+`<div class="vz3 vz-depth-elevation">
<style>
.vz-depth-elevation .qstage{height:260px;padding:14px;background:#F4F0E5}
.vz-depth-elevation .qpage{position:absolute;inset:14px;display:grid;gap:10px;align-content:start}
.vz-depth-elevation .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vz-depth-elevation .tile{background:#FFFDF7;border-radius:12px;padding:10px;font-size:13px;min-height:58px}
.vz-depth-elevation .tile b{display:block;font-size:14px}
.vz-depth-elevation .menu{position:absolute;right:22px;top:60px;width:150px;background:#FFFDF7;border-radius:12px;padding:8px;font-size:13px;display:none}
.vz-depth-elevation .menu div{padding:6px 8px;border-radius:8px}
.vz-depth-elevation .qscrim{position:absolute;inset:0;background:rgba(20,38,29,.48);display:none}
.vz-depth-elevation .qmodal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(240px,82%);background:#FFFDF7;border-radius:16px;padding:16px;display:none;font-size:14px}
.vz-depth-elevation .qmodal b{font-family:'Bricolage Grotesque',sans-serif;font-size:17px;display:block;margin-bottom:4px}
</style>
${S('lv','Elevation level',0,3,1)}
<div class="row"><button class="tb" data-t="light" aria-pressed="false">Break the light source</button><button class="tb" data-t="hair" aria-pressed="true">Hairline borders</button></div>
<div class="stg qstage"><div class="qpage"><div class="tile" data-e="0"><b>Level 0 · the page</b>Flat. Defined only by a hairline.</div>
<div class="row2"><div class="tile" data-e="1" data-d="1"><b>Level 1</b>Card</div><div class="tile" data-e="1" data-d="-1"><b>Level 1</b>Card</div></div></div>
<div class="menu" data-e="2"><div><b>Level 2</b></div><div>Edit</div><div>Duplicate</div></div>
<div class="qscrim"></div><div class="qmodal" data-e="3"><b>Level 3 · modal</b>The scrim behind me dims everything else, so you look here.</div></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-depth-elevation');let broken=false,hair=true;
const SH=['none','0 1px 2px rgba(20,38,29,.16), 0 4px 10px -4px rgba(20,38,29,.18)','0 2px 4px rgba(20,38,29,.16), 0 12px 24px -8px rgba(20,38,29,.28)','0 4px 8px rgba(20,38,29,.18), 0 28px 50px -12px rgba(20,38,29,.45)'];
const SAY=['<b>Level 0.</b> The page itself. No shadow at all. A <b>hairline</b> (a 1px border) is enough to show where one area ends.','<b>Level 1.</b> Cards lift a little: small, tight shadow. Most of your UI lives here.','<b>Level 2.</b> A dropdown menu floats above the cards, so its shadow is bigger and softer. It is temporary, and the shadow says so.','<b>Level 3.</b> A modal sits on top of everything. A <b>scrim</b> (a dark see-through layer) pushes the rest of the page back.'];
const lv=slide(R,'lv',draw);tog(R,'light',v=>{broken=v;draw()});tog(R,'hair',v=>{hair=v;draw()});
function draw(){const L=+lv.value;out(R,'lv',L);
$$(R,'[data-e]').forEach(n=>{const e=+n.dataset.e;let s=e<=L?SH[e]:(e===1?SH[1]:'none');if(broken&&e===1)s=n.dataset.d==='1'?'10px 8px 14px -4px rgba(20,38,29,.35)':'-8px -10px 16px -4px rgba(20,38,29,.35)';n.style.boxShadow=e===0?'none':s;n.style.border=hair?'1px solid rgba(20,38,29,.22)':'1px solid transparent'});
$(R,'.menu').style.display=L>=2?'block':'none';$(R,'.qscrim').style.display=L>=3?'block':'none';$(R,'.qmodal').style.display=L>=3?'block':'none';
out(R,'say',broken?'<b>Light source broken.</b> One card casts its shadow down and right, the other casts it upward. Your eye feels something is wrong even if you cannot say what. Pick one imagined lamp (usually above) and make every shadow agree with it.':SAY[L])}
draw()}}
];

/* =====================================================================
   SHAPE & CORNERS
   ===================================================================== */
window.VIZ['shape']=[
{id:'shape-radius',title:'One slider, four personalities',
terms:['Border radius','Sharp','Soft','Round','Pill','Shape scale','Shape language'],
intro:'Border radius is how round a corner is, in pixels. The same screen feels formal, calm, friendly or playful just from this one number.',
try:'Drag the radius from 0 to the end. Then switch to "Random" and see what happens when nobody decides.',
html:KIT+`<div class="vz3 vz-shape-radius">
<style>
.vz-shape-radius .ui{display:grid;gap:10px;max-width:320px;margin:0 auto}
.vz-shape-radius .qcard{background:#FFFDF7;border:2px solid #14261D;padding:14px;display:grid;gap:10px}
.vz-shape-radius .qcard b{font-family:'Bricolage Grotesque',sans-serif;font-size:17px}
.vz-shape-radius .img{height:70px;background:linear-gradient(135deg,#C9E0F2,#D6E59A)}
.vz-shape-radius .chips{display:flex;gap:6px;flex-wrap:wrap}
.vz-shape-radius .chip{border:2px solid #14261D;padding:3px 10px;font-size:12px;font-weight:700;background:#F7DCC4}
.vz-shape-radius .btns{display:flex;gap:8px;flex-wrap:wrap}
.vz-shape-radius .b1,.vz-shape-radius .b2{border:2px solid #14261D;padding:10px 16px;font-weight:700;font-size:14px}
.vz-shape-radius .b1{background:#E8722C;color:#14261D}.vz-shape-radius .b2{background:#FFFDF7}
.vz-shape-radius .inp{border:2px solid #14261D;background:#FFFDF7;padding:10px 12px;font-size:14px;color:#4A5A4F}
.vz-shape-radius .zones{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font:700 11px/1.2 'Space Mono',monospace;text-align:center}
.vz-shape-radius .zones span{border:1.5px solid #14261D;border-radius:6px;padding:4px 2px;background:#FFFDF7}
.vz-shape-radius .zones span.on{background:#14261D;color:#D6E59A}
</style>
<div class="seg" data-g="m"><button data-v="one" aria-pressed="true">One shape scale</button><button data-v="rand" aria-pressed="false">Random radii</button></div>
${S('r','Base radius',0,32,10)}
<div class="zones"><span data-z="0">Sharp 0</span><span data-z="1">Soft 2–8</span><span data-z="2">Round 10–24</span><span data-z="3">Pill 999</span></div>
<div class="stg"><div class="ui"><div class="qcard"><div class="img"></div><b>Weekend in Lagos</b><div class="chips"><span class="chip">Food</span><span class="chip">Art</span></div><div class="inp">Your email</div><div class="btns"><span class="b1">Book now</span><span class="b2">Save</span></div></div></div></div>
<div class="code" data-o="scale"></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-shape-radius');let mode='one';const r=slide(R,'r',draw);seg(R,'m',v=>{mode=v;draw()});
function draw(){const v=+r.value,pill=v>=30;out(R,'r',pill?'999px':v+'px');
const z=v===0?0:v<=8?1:pill?3:2;$$(R,'[data-z]').forEach(n=>n.classList.toggle('on',+n.dataset.z===z));
const sm=Math.round(v/2),lg=pill?28:Math.round(v*1.6),P=999;
const map=mode==='one'?{card:lg,img:Math.max(0,lg-14),inp:v,b1:pill?P:v,b2:pill?P:v,chip:P}:{card:22,img:3,inp:0,b1:14,b2:6,chip:4};
$(R,'.qcard').style.borderRadius=map.qcard+'px';$(R,'.img').style.borderRadius=map.img+'px';$(R,'.inp').style.borderRadius=map.inp+'px';
$(R,'.b1').style.borderRadius=map.b1+'px';$(R,'.b2').style.borderRadius=map.b2+'px';$$(R,'.chip').forEach(c=>c.style.borderRadius=map.chip+'px');
out(R,'scale',mode==='one'?`--r-sm: ${sm}px; --r-md: ${pill?14:v}px; --r-lg: ${lg}px; --r-pill: 999px;`:'card 22 · image 3 · input 0 · button 14 · button 6 · chip 4  (six radii, no system)');
const T=['<b>Sharp.</b> Radius 0. Formal, editorial, architectural. Think newspapers and luxury fashion.','<b>Soft.</b> A small radius. Professional and calm. Think banking and work tools.','<b>Round.</b> A large radius. Friendly and modern. Think consumer apps.','<b>Pill.</b> Fully round (999px). Playful and touchable. Great for buttons and tags.'];
out(R,'say',mode==='one'?T[z]+' Every corner here comes from one small <b>shape scale</b>, so the whole card speaks one <b>shape language</b>.':'<b>No shape language.</b> Six different radii on one card. Nothing is broken, yet it feels assembled from parts. Pick 3 or 4 radii and reuse them everywhere.')}
draw()}},

{id:'shape-nested',title:'Nested radius: the corner inside a corner',
terms:['Nested radius'],
intro:'When a rounded box sits inside another rounded box, the inner corner must be smaller. The rule: inner radius = outer radius − the gap between them.',
try:'Drag the outer radius and the padding. Then switch to "Same radius" and look closely at the corners.',
html:KIT+`<div class="vz3 vz-shape-nested">
<style>
.vz-shape-nested .wrap{display:grid;place-items:center;padding:8px;flex:1 1 220px;min-width:0}
.vz-shape-nested .outer{width:min(260px,100%);background:#FFFDF7;border:2.5px solid #14261D;position:relative}
.vz-shape-nested .inner{height:120px;background:#D6E59A;border:2px solid #14261D}
.vz-shape-nested .zoom{width:110px;height:110px;border:2px solid #14261D;border-radius:50%;overflow:hidden;position:relative;background:#FFFDF7;flex:none}
.vz-shape-nested .zoom .zc{position:absolute;left:0;top:0;width:260px;transform-origin:0 0;transform:scale(3.4)}
</style>
<div class="seg" data-g="m"><button data-v="good" aria-pressed="true">Outer − padding</button><button data-v="bad" aria-pressed="false">Same radius</button></div>
<div class="ctl">${S('o','Outer radius',4,40,24)}${S('p','Padding',4,28,10)}</div>
<div class="stg"><div class="row" style="justify-content:center;gap:18px"><div class="wrap"><div class="outer"><div class="inner"></div></div></div><div><div class="lab" style="margin-bottom:6px">Top-left corner ×3.4</div><div class="zoom"><div class="zc"></div></div></div></div></div>
<div class="code" data-o="m"></div><div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-shape-nested');let mode='good';const o=slide(R,'o',draw),p=slide(R,'p',draw);seg(R,'m',v=>{mode=v;draw()});
function draw(){const O=+o.value,P=+p.value,I=mode==='good'?Math.max(0,O-P):O;out(R,'o',O+'px');out(R,'p',P+'px');
const ou=$(R,'.outer'),inn=$(R,'.inner');ou.style.borderRadius=O+'px';ou.style.padding=P+'px';inn.style.borderRadius=I+'px';
const z=$(R,'.zc');z.innerHTML=ou.outerHTML;
out(R,'m',`outer ${O}px − padding ${P}px = inner ${mode==='good'?I+'px':'should be '+Math.max(0,O-P)+'px (now '+I+'px)'}`);
out(R,'say',mode==='good'?'<b>Parallel curves.</b> The gap between the two borders is the same all the way round the corner. It looks machined and calm.':'<b>Same radius on both.</b> The gap gets fat in the corner and thin on the sides. Your eye reads it as a bulge. It is one of the most common tells of a careless build.')}
draw()}},

{id:'shape-optical',title:'Squircles and optical overshoot',
terms:['Squircle','Optical overshoot'],
intro:'Maths and eyes disagree. A circle the same height as a square looks smaller, and a normal rounded corner has a visible "kink" where the curve meets the straight edge.',
try:'Toggle overshoot and compare the sizes. Then compare the two corner types side by side.',
html:KIT+`<div class="vz3 vz-shape-optical">
<style>
.vz-shape-optical .line{position:relative;display:flex;gap:22px;justify-content:center;align-items:center;padding:20px 0}
.vz-shape-optical .line:before,.vz-shape-optical .line:after{content:'';position:absolute;left:0;right:0;border-top:1.5px dashed #AD4F16}
.vz-shape-optical .line:before{top:20px}.vz-shape-optical .line:after{bottom:20px}
.vz-shape-optical .sq{width:72px;height:72px;background:#14261D}
.vz-shape-optical .ci{width:72px;height:72px;border-radius:50%;background:#14261D;transition:transform .2s}
.vz-shape-optical .tri{width:0;height:0;border-left:40px solid transparent;border-right:40px solid transparent;border-bottom:72px solid #14261D;transition:transform .2s}
.vz-shape-optical svg{display:block}
</style>
<div class="row"><button class="tb" data-t="ov" aria-pressed="false">Add overshoot</button></div>
<div class="stg paper"><div class="line"><div class="sq"></div><div class="ci"></div><div class="tri"></div></div></div>
<div class="note" data-o="a"></div>
<div class="g2"><div class="stg paper" style="text-align:center"><div class="lab">Rounded rectangle</div><svg viewBox="0 0 120 120" width="120" height="120" style="margin:8px auto"><rect x="10" y="10" width="100" height="100" rx="30" fill="#E8722C" stroke="#14261D" stroke-width="2.5"/><circle cx="40" cy="10" r="4" fill="#14261D"/><circle cx="10" cy="40" r="4" fill="#14261D"/></svg><p class="sm">The curve starts suddenly at the dots. You can feel the corner.</p></div>
<div class="stg paper" style="text-align:center"><div class="lab">Squircle</div><svg viewBox="0 0 120 120" width="120" height="120" style="margin:8px auto"><path data-sq fill="#E8722C" stroke="#14261D" stroke-width="2.5"/></svg><p class="sm">The curve eases in slowly from the edge. It reads as one smooth shape, like an app icon.</p></div></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-shape-optical');
let d='';for(let i=0;i<=72;i++){const t=i/72*2*Math.PI,c=Math.cos(t),s=Math.sin(t),n=5;const x=60+50*Math.sign(c)*Math.pow(Math.abs(c),2/n),y=60+50*Math.sign(s)*Math.pow(Math.abs(s),2/n);d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}$(R,'[data-sq]').setAttribute('d',d+'Z');
function draw(on){$(R,'.ci').style.transform=on?'scale(1.06)':'none';$(R,'.tri').style.transform=on?'scale(1.12)':'none';
out(R,'a',on?'<b>With optical overshoot.</b> The circle is drawn about 6% bigger and the triangle about 12% bigger, so they poke past the guide lines. Now all three <i>look</i> the same size. Type designers do this with every O and A.':'<b>All three are exactly 72px tall.</b> Yet the circle and the triangle look smaller than the square, because they have less "ink" near the top and bottom lines.')}
tog(R,'ov',draw);draw(false)}}
];

/* =====================================================================
   BACKGROUNDS & TEXTURE
   ===================================================================== */
const GRAIN="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.15 0 0 0 0 0.11 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";
window.VIZ['background']=[
{id:'bg-surface',title:'Five backgrounds, one texture budget',
terms:['Flat','Grid / dot pattern','Grain / noise','Glow / radial gradient','Mesh gradient','Texture budget'],
intro:'A background sets the mood before anyone reads a word. But every pattern adds visual noise, and noise competes with your content. That limit is your texture budget.',
try:'Pick each background, then push the strength slider up until the headline starts to struggle.',
html:KIT+`<div class="vz3 vz-bg-surface">
<style>
.vz-bg-surface .qhero{min-height:220px;display:grid;align-content:center;gap:8px;padding:22px;background-color:#F4F0E5;position:relative}
.vz-bg-surface .qhero>*{position:relative}
.vz-bg-surface .qfx{position:absolute;inset:0}
.vz-bg-surface h4{font:800 clamp(22px,5vw,30px)/1.1 'Bricolage Grotesque',sans-serif;margin:0;max-width:16ch}
.vz-bg-surface p{margin:0;max-width:34ch;font-size:15px}
.vz-bg-surface .cta{justify-self:start;background:#E8722C;border:2px solid #14261D;border-radius:10px;padding:9px 14px;font-weight:700;font-size:14px;box-shadow:2px 2px 0 #14261D}
.vz-bg-surface .meter{height:14px;border:2px solid #14261D;border-radius:99px;overflow:hidden;background:#FFFDF7}
.vz-bg-surface .meter i{display:block;height:100%;transition:width .2s}
</style>
<div class="seg" data-g="k"><button data-v="flat" aria-pressed="true">Flat</button><button data-v="grid" aria-pressed="false">Grid / dots</button><button data-v="grain" aria-pressed="false">Grain</button><button data-v="glow" aria-pressed="false">Glow</button><button data-v="mesh" aria-pressed="false">Mesh</button></div>
${S('st','Strength',0,100,35)}
<div class="stg qhero"><div class="qfx"></div><h4>Build your first product in 6 weeks</h4><p>Live sessions, a real project and feedback from designers who ship.</p><span class="cta">Join the cohort</span></div>
<div><div class="row" style="justify-content:space-between"><span class="lab">Texture budget used</span><span class="v" data-o="pct"></span></div><div class="meter"><i></i></div></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-bg-surface'),fx=$(R,'.qfx'),bar=$(R,'.meter i');let k='flat';const st=slide(R,'st',draw);seg(R,'k',v=>{k=v;draw()});
const SAY={flat:'<b>Flat.</b> One solid colour. Clean and honest, and it spends none of your budget. Most screens should look like this.',grid:'<b>Grid / dot pattern.</b> A faint repeated pattern that hints at structure and precision. Good for developer and data products.',grain:'<b>Grain / noise.</b> Fine speckle that makes a screen feel like paper or film. Keep it barely visible.',glow:'<b>Glow / radial gradient.</b> A soft pool of light behind the key content. It quietly points the eye at the headline.',mesh:'<b>Mesh gradient.</b> Several soft colour blobs blended together. Expressive and modern, but the most expensive choice for your budget.'};
function draw(){const s=+st.value/100;out(R,'st',st.value+'%');let bg='none',blend='normal';
if(k==='grid'){const a=(0.04+s*0.3).toFixed(2);bg=`radial-gradient(circle,rgba(20,38,29,${a}) 1.4px,transparent 1.6px) 0 0/18px 18px`}
if(k==='grain'){bg=GRAIN;fx.style.opacity=(0.05+s*0.55).toFixed(2)}else fx.style.opacity=1;
if(k==='glow')bg=`radial-gradient(60% 70% at 25% 45%,rgba(232,114,44,${(0.1+s*0.6).toFixed(2)}),transparent 70%)`;
if(k==='mesh')bg=`radial-gradient(40% 60% at 15% 20%,rgba(232,114,44,${(.15+s*.75).toFixed(2)}),transparent 70%),radial-gradient(45% 60% at 85% 30%,rgba(201,224,242,${(.3+s*.7).toFixed(2)}),transparent 70%),radial-gradient(50% 60% at 60% 95%,rgba(214,229,154,${(.3+s*.7).toFixed(2)}),transparent 70%),radial-gradient(40% 50% at 40% 60%,rgba(246,215,232,${(.2+s*.7).toFixed(2)}),transparent 70%)`;
fx.style.background=bg;fx.style.mixBlendMode=blend;
const cost={flat:0,grid:.25,grain:.3,glow:.35,mesh:.55}[k],used=Math.round(Math.min(1,cost+(k==='flat'?0:s*.6))*100);
out(R,'pct',used+'%');bar.style.width=used+'%';bar.style.background=used>75?'#F6D7E8':used>45?'#F7DCC4':'#D6E59A';
out(R,'say',SAY[k]+(used>75?' <b>Over budget:</b> the pattern now fights the headline. Turn it down until you only notice it when you look for it.':''))}
draw()}},

{id:'bg-glass',title:'Text on busy backgrounds: glass, scrim and vignette',
terms:['Glassmorphism','Backdrop blur','Overlay / scrim','Vignette'],
intro:'When text sits on a photo or a colourful scene, you need a layer between them. There are three tools, and each one has a cost.',
try:'Turn each tool on and off. Watch the contrast number under the caption.',
html:KIT+`<div class="vz3 vz-bg-glass">
<style>
.vz-bg-glass .scene{height:250px;padding:0;position:relative;background:#C9E0F2}
.vz-bg-glass .sh{position:absolute;border-radius:50%}
.vz-bg-glass .qscrim,.vz-bg-glass .vig{position:absolute;inset:0;pointer-events:none}
.vz-bg-glass .cap{position:absolute;left:14px;right:14px;bottom:14px;border-radius:14px;padding:14px;color:#FFFDF7}
.vz-bg-glass .cap b{font:800 20px/1.15 'Bricolage Grotesque',sans-serif;display:block}
.vz-bg-glass .cap span{font-size:14px}
</style>
<div class="row"><button class="tb" data-t="glass" aria-pressed="false">Glass card</button><button class="tb" data-t="scrim" aria-pressed="false">Scrim</button><button class="tb" data-t="vig" aria-pressed="false">Vignette</button></div>
<div class="ctl">${S('bl','Backdrop blur',0,24,12)}${S('so','Scrim strength',0,80,55)}</div>
<div class="stg scene"><div class="sh" style="width:180px;height:180px;left:-30px;top:-20px;background:#E8722C"></div><div class="sh" style="width:150px;height:150px;right:-20px;top:30px;background:#D6E59A"></div><div class="sh" style="width:200px;height:120px;left:30%;bottom:-40px;background:#FFFDF7"></div><div class="sh" style="width:90px;height:90px;left:45%;top:20px;background:#F6D7E8"></div>
<div class="qscrim"></div><div class="vig"></div><div class="cap"><b>Sunset market, Lekki</b><span>Every Friday from 5pm</span></div></div>
<div class="row"><span class="lab">Caption readability</span><span class="pill" data-o="cr"></span></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-bg-glass'),cap=$(R,'.cap'),sc=$(R,'.qscrim'),vg=$(R,'.vig');let g=false,s=false,v=false;
const bl=slide(R,'bl',draw),so=slide(R,'so',draw);tog(R,'glass',x=>{g=x;draw()});tog(R,'scrim',x=>{s=x;draw()});tog(R,'vig',x=>{v=x;draw()});
function draw(){const B=+bl.value,O=+so.value/100;out(R,'bl',B+'px');out(R,'so',so.value+'%');
cap.style.background=g?'rgba(20,38,29,.42)':'transparent';cap.style.backdropFilter=cap.style.webkitBackdropFilter=g?`blur(${B}px)`:'none';cap.style.border=g?'1px solid rgba(255,253,247,.35)':'0';
sc.style.background=s?`linear-gradient(to top,rgba(20,38,29,${O}) 0%,rgba(20,38,29,${O*.6}) 45%,transparent 75%)`:'none';
vg.style.background=v?'radial-gradient(ellipse at center,transparent 45%,rgba(20,38,29,.55) 100%)':'none';
const score=(g?(.35+Math.min(B,16)/16*.25):0)+(s?O*.9:0)+(v?.08:0);
const lvl=score>=.55?['Easy to read','ok']:score>=.3?['Readable on some spots','mid']:['Hard to read','bad'];const p=$(R,'[data-o=cr]');p.className='pill '+lvl[1];p.textContent=lvl[0];
let t;if(!g&&!s&&!v)t='<b>Nothing between text and image.</b> White text sits on bright orange, lime and white blobs. Parts of the caption almost vanish.';
else{t='';if(g)t+='<b>Glassmorphism</b> is a frosted, see-through card. <b>Backdrop blur</b> softens whatever is behind it'+(B<6?', but at this low blur the shapes still show through and fight the text. ':'. Pretty, but costly to render on cheap phones. ');
if(s)t+='A <b>scrim</b> (or overlay) is a dark see-through gradient. It is the cheapest, most reliable fix'+(O<.35?', but at this strength it is too weak. ':'. ');
if(v)t+='A <b>vignette</b> darkens the edges to pull the eye to the centre. It sets a mood; it does not fix readability on its own.'}
out(R,'say',t)}
draw()}}
];

/* =====================================================================
   ICONOGRAPHY
   ===================================================================== */
window.VIZ['icons']=[
{id:'icons-family',title:'What makes icons a family',
terms:['Icon set / family','Outline / filled / duotone','Stroke width','Line cap / join'],
intro:'Icons look like one family when they share the same rules: the same style, the same line thickness and the same line ends. Break one rule and the set looks borrowed.',
try:'Change the style, the stroke width and the line ends. Then tap "Mix sets" to see icons from different families thrown together.',
html:KIT+`<div class="vz3 vz-icons-family">
<style>
.vz-icons-family .qbar{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;padding:18px 8px}
.vz-icons-family .ic{width:56px;height:56px;display:grid;place-items:center;border-radius:12px;background:#FFFDF7;border:1.5px solid rgba(20,38,29,.2);color:#14261D}
.vz-icons-family .ic svg{width:32px;height:32px}
.vz-icons-family .zoom{display:grid;place-items:center;background:#FFFDF7;border-radius:12px;padding:10px}
.vz-icons-family .zoom svg{width:150px;height:150px;color:#14261D}
</style>
<div class="seg" data-g="sty"><button data-v="out" aria-pressed="true">Outline</button><button data-v="fill" aria-pressed="false">Filled</button><button data-v="duo" aria-pressed="false">Duotone</button></div>
<div class="ctl">${S('w','Stroke width',1,3,2,.25)}<div><span class="lab">Line cap / join</span><div class="seg" data-g="cap" style="margin-top:6px"><button data-v="round" aria-pressed="true">Round</button><button data-v="square" aria-pressed="false">Square</button></div></div></div>
<div class="row"><button class="tb" data-t="mix" aria-pressed="false">Mix sets</button></div>
<div class="stg"><div class="qbar"></div></div>
<div class="g2"><div class="zoom"></div><div class="note" data-o="say"></div></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-icons-family');let sty='out',cap='round',mix=false;const w=slide(R,'w',draw);
seg(R,'sty',v=>{sty=v;draw()});seg(R,'cap',v=>{cap=v;draw()});tog(R,'mix',v=>{mix=v;draw()});
const K=['home','search','bell','user','heart','cal'];
function one(k,i,big){let W=+w.value,c=cap,j=cap==='round'?'round':'miter',st=sty;
if(mix){W=[2,1.25,2.75,2,1.5,2.5][i];c=['round','square','round','butt','round','square'][i];j=c==='round'?'round':'miter';st=['out','fill','out','duo','out','out'][i]}
const body=IC[k];let inner=body;if(st==='fill')return`<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="${W}" stroke-linecap="${c}" stroke-linejoin="${j}" aria-hidden="true">${body}</svg>`;
if(st==='duo')return`<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="#E8722C" stroke="none" opacity=".55">${body}</g><g fill="none" stroke="currentColor" stroke-width="${W}" stroke-linecap="${c}" stroke-linejoin="${j}">${body}</g></svg>`;
return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${W}" stroke-linecap="${c}" stroke-linejoin="${j}" aria-hidden="true">${inner}</svg>`}
function draw(){out(R,'w',(+w.value).toFixed(2)+'px');$(R,'.qbar').innerHTML=K.map((k,i)=>`<span class="ic">${one(k,i)}</span>`).join('');$(R,'.zoom').innerHTML=one('cal',5);
const S2={out:'<b>Outline</b> icons are drawn with lines only. Light and precise; the default for most interfaces.',fill:'<b>Filled</b> icons are solid shapes. Heavier and easier to spot; often used for the active tab.',duo:'<b>Duotone</b> icons use two tones: a line plus a soft fill. Friendly and branded, but use them sparingly.'};
out(R,'say',mix?'<b>Mixed families.</b> Different stroke widths, line ends and styles in one toolbar. Each icon is fine alone; together they look like a ransom note. Pick one <b>icon set</b> (Lucide, Phosphor or Material Symbols) and stay in it.':S2[sty]+' <b>Stroke width</b> is '+(+w.value).toFixed(2)+'px; match it to your text weight. <b>Line cap / join</b> is '+cap+': round feels friendly, square feels technical. The zoomed calendar shows the ends up close.')}
draw()}},

{id:'icons-size-grid',title:'Optical size and the pixel grid',
terms:['Optical size','Pixel grid'],
intro:'Small icons are not just big icons shrunk. At 16px there is no room for detail, and a line that falls between two pixels turns into a grey blur.',
try:'Switch between "Scaled down" and "Drawn for 16px". Then move the line off the pixel grid and watch it go soft.',
html:KIT+`<div class="vz3 vz-icons-size-grid">
<style>
.vz-icons-size-grid .sizes{display:flex;gap:22px;align-items:flex-end;justify-content:center;padding:14px 0;color:#14261D}
.vz-icons-size-grid .sizes div{display:grid;justify-items:center;gap:6px;font:700 11px 'Space Mono',monospace}
.vz-icons-size-grid .px{display:grid;grid-template-columns:repeat(8,1fr);width:min(240px,100%);aspect-ratio:1;margin:0 auto;border:2px solid #14261D;background:#FFFDF7}
.vz-icons-size-grid .px i{border:1px solid rgba(20,38,29,.1)}
</style>
<div class="g2"><div class="stg paper"><div class="lab">Optical size</div><div class="seg" data-g="op" style="margin:8px 0"><button data-v="scaled" aria-pressed="true">Scaled down</button><button data-v="drawn" aria-pressed="false">Drawn for 16px</button></div><div class="sizes"></div><p class="sm" data-o="op"></p></div>
<div class="stg paper"><div class="lab">Pixel grid · zoomed ×30</div><div class="seg" data-g="px" style="margin:8px 0"><button data-v="on" aria-pressed="true">On whole pixels</button><button data-v="off" aria-pressed="false">Half a pixel off</button></div><div class="px"></div><p class="sm" data-o="px"></p></div></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-icons-size-grid');
const gearDetailed=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${IC.gear}<circle cx="12" cy="12" r="6.5"/></svg>`;
const gearSimple=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21"/></svg>`;
function op(v){const sm=v==='drawn'?gearSimple:gearDetailed;$(R,'.sizes').innerHTML=`<div><span style="width:16px;height:16px;display:block">${sm}</span>16</div><div><span style="width:24px;height:24px;display:block">${gearDetailed}</span>24</div><div><span style="width:48px;height:48px;display:block">${gearDetailed}</span>48</div>`;
$$(R,'.sizes svg').forEach(s=>{s.style.width='100%';s.style.height='100%'});
out(R,'op',v==='drawn'?'<b>Drawn for 16px:</b> fewer teeth, thicker lines, no inner ring. It reads clearly at the small size. That is <b>optical size</b>: a version made for the size it will be shown at.':'<b>Scaled down:</b> the 24px gear with its inner ring and 8 teeth, squeezed into 16px. At real size it turns into a fuzzy blob.')}
function px(v){const cells=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){let a=0;if(v==='on'){if(x===3&&y>0&&y<7)a=1}else{if((x===3||x===4)&&y>0&&y<7)a=.5}cells.push(`<i style="background:rgba(20,38,29,${a})"></i>`)}$(R,'.px').innerHTML=cells.join('');
out(R,'px',v==='on'?'<b>On the grid:</b> a 1px line that sits exactly on one column of pixels. Every pixel is fully dark, so the edge is crisp.':'<b>Off the grid:</b> the same 1px line moved by half a pixel. The screen splits it across two columns at half strength: a blurry 2px grey line. Good icon sets are drawn on whole pixels.')}
seg(R,'op',op);seg(R,'px',px);op('scaled');px('on')}},

{id:'icons-meaning',title:'Metaphor, label and touch target',
terms:['Metaphor','Label','Touch target','Emoji'],
intro:'An icon borrows a real-world idea (a bell for alerts). Only a few metaphors are understood by everyone, so most icons need a word next to them, and every one needs a big enough area to tap.',
try:'Guess what each toolbar icon does. Then turn on labels and show the touch targets.',
html:KIT+`<div class="vz3 vz-icons-meaning">
<style>
.vz-icons-meaning .tool{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:8px}
.vz-icons-meaning .it{position:relative;display:grid;justify-items:center;gap:2px;min-width:30px;padding:3px;border-radius:8px;color:#14261D;font-size:12px;font-weight:700}
.vz-icons-meaning .it .hit{position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%);border:2px dashed #AD4F16;border-radius:8px;display:none;pointer-events:none}
.vz-icons-meaning .it .tx{display:none}
.vz-icons-meaning .it .e{font-size:22px;line-height:24px;font-family:system-ui}
</style>
<div class="row"><button class="tb" data-t="lab" aria-pressed="false">Labels</button><button class="tb" data-t="hit" aria-pressed="false">Touch targets</button><button class="tb" data-t="emo" aria-pressed="false">Use emoji instead</button></div>
<div class="stg"><div class="tool"></div></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-icons-meaning');let L=false,H=false,E=false;
const items=[['home','Home','&#x1F3E0;'],['search','Search','&#x1F50D;'],['share','Export','&#x1F4E4;'],['heart','Save','&#x2764;&#xFE0F;'],['gear','Settings','&#x2699;&#xFE0F;'],['trash','Delete','&#x1F5D1;&#xFE0F;']];
tog(R,'lab',v=>{L=v;draw()});tog(R,'hit',v=>{H=v;draw()});tog(R,'emo',v=>{E=v;draw()});
function draw(){$(R,'.tool').innerHTML=items.map(i=>`<span class="it">${E?`<span class="e">${i[2]}</span>`:svg(i[0],{s:22})}<span class="tx" style="display:${L?'block':'none'}">${i[1]}</span><span class="hit" style="display:${H?'block':'none'}"></span></span>`).join('');
const t=[];if(E)t.push('<b>Emoji</b> are text symbols. They look different on every phone, cannot be recoloured, and the style clashes with the interface. Great in a chat; rarely right as interface icons.');
if(!L)t.push('<b>No labels.</b> Home, search and delete are clear because their <b>metaphors</b> (a house, a magnifier, a bin) are universal. But is the arrow "share", "upload" or "export"? Is the heart "like" or "save"? Guessing is a cost you put on the user.');else t.push('<b>Labels on.</b> Now nobody has to guess. Keep icon-only buttons for the few universal metaphors, and add a <b>label</b> to everything else.');
if(H)t.push('The dashed boxes are 44×44px <b>touch targets</b>. The icon is only 22px, but the tappable area must be at least 44px so a thumb can hit it. Here the targets overlap: the icons are packed too tightly for touch.');
out(R,'say',t.join(' '))}
draw()}}
];

/* =====================================================================
   IMAGERY & ILLUSTRATION
   ===================================================================== */
/* a drawn "photo": 400x240 scene, person at x≈290 */
const SCENE=`<rect width="400" height="240" fill="#C9E0F2"/><circle cx="90" cy="70" r="30" fill="#F7DCC4"/><path d="M0 170 Q80 120 160 160 T320 150 T400 140 V240 H0Z" fill="#D6E59A"/><path d="M0 200 Q120 170 240 195 T400 185 V240 H0Z" fill="#8FA86A"/><rect x="40" y="130" width="40" height="50" fill="#F6D7E8"/><path d="M36 132 L60 112 L84 132Z" fill="#AD4F16"/>
<g><circle cx="290" cy="128" r="13" fill="#5A3A22"/><path d="M270 205 Q272 150 290 146 Q308 150 310 205Z" fill="#E8722C"/><rect x="279" y="203" width="9" height="26" fill="#14261D"/><rect x="292" y="203" width="9" height="26" fill="#14261D"/><path d="M308 160 L326 140" stroke="#5A3A22" stroke-width="6" stroke-linecap="round"/></g>`;
const FILTERS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="vz3-gray"><feColorMatrix type="saturate" values="0"/></filter><filter id="vz3-duo"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.078 0.91"/><feFuncG type="table" tableValues="0.149 0.447"/><feFuncB type="table" tableValues="0.114 0.173"/></feComponentTransfer></filter><filter id="vz3-warm"><feColorMatrix type="matrix" values="1.1 0 0 0 .04 0 1 0 0 .01 0 0 .8 0 0 0 0 0 1 0"/></filter></svg>`;
window.VIZ['imagery']=[
{id:'img-crop',title:'Aspect ratio and crop tell the story',
terms:['Aspect ratio','Crop','Hero image'],
intro:'Aspect ratio is the shape of the frame: width to height. The crop is which part of the picture you keep. Change either and the same photo says something different.',
try:'Pick each ratio, then slide the focus to choose what the crop keeps.',
html:KIT+`<div class="vz3 vz-img-crop">
<style>
.vz-img-crop .frame{margin:0 auto;border:2.5px solid #14261D;border-radius:12px;overflow:hidden;background:#FFFDF7;max-width:100%}
.vz-img-crop .frame svg{display:block;width:100%;height:100%}
.vz-img-crop .qfull{position:relative;max-width:420px;margin:0 auto}
.vz-img-crop .qfull svg{display:block;width:100%;opacity:.45;border-radius:8px}
.vz-img-crop .box{position:absolute;border:2.5px dashed #14261D;background:rgba(255,253,247,.0)}
</style>
<div class="seg" data-g="ar"><button data-v="16:9" aria-pressed="true">16:9</button><button data-v="4:3" aria-pressed="false">4:3</button><button data-v="1:1" aria-pressed="false">1:1</button><button data-v="4:5" aria-pressed="false">4:5</button></div>
${S('f','Focus (what the crop keeps)',0,100,30)}
<div class="g2"><div><div class="lab" style="margin-bottom:6px">The whole photo</div><div class="qfull"><svg viewBox="0 0 400 240">${SCENE}</svg><div class="box"></div></div></div>
<div><div class="lab" style="margin-bottom:6px">What people see</div><div class="frame"><svg class="crop" preserveAspectRatio="xMidYMid slice">${SCENE}</svg></div></div></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-img-crop');let ar='16:9';const f=slide(R,'f',draw);seg(R,'ar',v=>{ar=v;draw()});
function draw(){const[a,b]=ar.split(':').map(Number),r=a/b;let h=240,w=h*r;if(w>400){w=400;h=w/r}
const x=(400-w)*(+f.value/100),y=(240-h)/2;out(R,'f',f.value+'%');
const c=$(R,'.crop');c.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);const fr=$(R,'.frame');fr.style.aspectRatio=a+'/'+b;fr.style.width=r<1?'70%':'100%';
const bx=$(R,'.box');bx.style.left=(x/4)+'%';bx.style.top=(y/2.4)+'%';bx.style.width=(w/4)+'%';bx.style.height=(h/2.4)+'%';
const hasP=x<=270&&x+w>=310,hasH=x<=40&&x+w>=84;
const T={'16:9':'<b>16:9</b> is wide, like a screen. It is the usual shape for a <b>hero image</b>: the big picture at the top of a page.','4:3':'<b>4:3</b> is a classic photo shape. Good for cards and articles.','1:1':'<b>1:1</b> is a square. Good for avatars, products and grids.','4:5':'<b>4:5</b> is a tall portrait. It fills more of a phone screen in a feed.'};
out(R,'say',T[ar]+' '+(hasP&&hasH?'This <b>crop</b> keeps the person and the house: a story about a place.':hasP?'This <b>crop</b> keeps only the person: now the photo is about someone, not somewhere.':hasH?'This <b>crop</b> keeps the house and loses the person: a quiet place, nobody home.':'This <b>crop</b> keeps only sky and hills. Nothing to look at. Crop on purpose.'))}
draw()}},

{id:'img-treatment',title:'One treatment makes a set',
terms:['Treatment','Duotone','Art direction'],
intro:'Photos from different sources never match. A treatment is one edit you apply to every image, so they look like they belong together. Choosing it is art direction.',
try:'Start on "As found", then try each treatment and see the three photos become a set.',
html:KIT+`<div class="vz3 vz-img-treatment">${FILTERS}
<style>
.vz-img-treatment .three{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.vz-img-treatment .three svg{display:block;width:100%;aspect-ratio:1;border:2px solid #14261D;border-radius:10px}
</style>
<div class="seg" data-g="t"><button data-v="none" aria-pressed="true">As found</button><button data-v="gray" aria-pressed="false">Grayscale</button><button data-v="duo" aria-pressed="false">Duotone</button><button data-v="warm" aria-pressed="false">Warm tone</button></div>
<div class="stg paper"><div class="three"><svg viewBox="40 0 240 240" preserveAspectRatio="xMidYMid slice"><g data-p="0">${SCENE}</g></svg><svg viewBox="160 0 240 240"><g data-p="1">${SCENE}</g></svg><svg viewBox="0 0 240 240"><g data-p="2">${SCENE}</g></svg></div></div>
<div class="note" data-o="say"></div></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-img-treatment');
const RAW=['saturate(1.8) hue-rotate(-20deg)','saturate(.6) brightness(1.1) hue-rotate(160deg)','contrast(1.4) hue-rotate(60deg)'];
function draw(t){$$(R,'[data-p]').forEach((g,i)=>{g.style.filter=t==='none'?RAW[i]:'url(#vz3-'+t+')'});
const T={none:'<b>As found.</b> One photo is over-saturated, one is cold, one is harsh. The subjects are fine; the set is a mess.',gray:'<b>Grayscale treatment.</b> Colour is removed from all three. Calm and serious, and your brand colours now stand out in the UI around them.',duo:'<b>Duotone.</b> Every photo is recoloured with two brand colours: forest for shadows, terracotta for highlights. Instantly yours, even with free stock photos.',warm:'<b>Warm tone.</b> A gentle golden shift on all three. Subtle, human and inviting.'};
out(R,'say',T[t]+(t==='none'?'':' Deciding this once, for every image, is <b>art direction</b>.'))}
seg(R,'t',draw);draw('none')}},

{id:'img-system',title:'Illustrations, placeholders and alt text',
terms:['Illustration system','Spot illustration','Placeholder','Alt text'],
intro:'Drawings need rules just like photos. And every image needs a plan for two moments: before it loads, and for people who cannot see it.',
try:'Compare the two illustration sets. Then switch the image state and choose the best alt text.',
html:KIT+`<div class="vz3 vz-img-system">
<style>
.vz-img-system .set{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.vz-img-system .set svg{width:100%;aspect-ratio:1;display:block;background:#FFFDF7;border-radius:10px;border:1.5px solid rgba(20,38,29,.2)}
.vz-img-system .qcard{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;overflow:hidden;max-width:300px;margin:0 auto}
.vz-img-system .media{aspect-ratio:16/9;display:grid;place-items:center;position:relative}
.vz-img-system .media svg{width:100%;height:100%;display:block}
.vz-img-system .sk{position:absolute;inset:0;background:linear-gradient(90deg,#EDE6D6 0,#F7F2E6 50%,#EDE6D6 100%);background-size:200% 100%}
.vz-img-system .sk.anim{animation:vz3sk 1.4s linear infinite}
@keyframes vz3sk{to{background-position:-200% 0}}
.vz-img-system .body{padding:12px 14px;font-size:14px}
.vz-img-system .alt button{text-align:left}
.vz-img-system .sr{font:700 13px/1.5 'Space Mono',monospace;background:#14261D;color:#D6E59A;border-radius:10px;padding:10px 12px}
</style>
<div class="lab">Illustration system</div>
<div class="seg" data-g="sys"><button data-v="mixed" aria-pressed="true">Three artists</button><button data-v="one" aria-pressed="false">One system</button></div>
<div class="stg"><div class="set"></div></div>
<p class="sm" data-o="sys"></p>
<div class="lab">Image states</div>
<div class="seg" data-g="st"><button data-v="ph" aria-pressed="true">Loading</button><button data-v="broken" aria-pressed="false">Failed, no plan</button><button data-v="ok" aria-pressed="false">Loaded</button></div>
<div class="stg"><div class="qcard"><div class="media"></div><div class="body"><b>Sunset market, Lekki</b><br>Every Friday from 5pm</div></div></div>
<p class="sm" data-o="st"></p>
<div class="lab">Alt text: what a screen reader says</div>
<div class="seg alt" data-g="alt"><button data-v="0" aria-pressed="false">image.jpg</button><button data-v="1" aria-pressed="false">Image of a picture</button><button data-v="2" aria-pressed="true">Woman in an orange dress waving at a market at sunset</button></div>
<div class="sr" data-o="sr"></div><p class="sm" data-o="alt"></p></div>`,
init(el){if(once(el))return;const R=$(el,'.vz-img-system');
const ART={one:[`<circle cx="50" cy="50" r="26" fill="#D6E59A" stroke="#14261D" stroke-width="3"/><path d="M38 52l9 9 16-20" fill="none" stroke="#14261D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,`<rect x="24" y="30" width="52" height="40" rx="8" fill="#F7DCC4" stroke="#14261D" stroke-width="3"/><path d="M24 40l26 16 26-16" fill="none" stroke="#14261D" stroke-width="3" stroke-linejoin="round"/>`,`<rect x="28" y="26" width="44" height="50" rx="8" fill="#C9E0F2" stroke="#14261D" stroke-width="3"/><path d="M38 42h24M38 52h24M38 62h14" stroke="#14261D" stroke-width="3" stroke-linecap="round"/>`],
mixed:[`<circle cx="50" cy="50" r="28" fill="#2ECC71"/><path d="M36 52l10 10 18-22" fill="none" stroke="#fff" stroke-width="6"/>`,`<rect x="22" y="30" width="56" height="40" fill="url(#vz3g)" stroke="#888" stroke-width="1"/><defs><linearGradient id="vz3g"><stop offset="0" stop-color="#7F7FD5"/><stop offset="1" stop-color="#86A8E7"/></linearGradient></defs><path d="M22 30l28 18 28-18" fill="none" stroke="#555" stroke-width="1"/>`,`<rect x="30" y="24" width="40" height="52" rx="2" fill="#FFF3B0" stroke="#D97706" stroke-width="5" stroke-dasharray="2 3"/><path d="M38 40h24M38 50h24M38 60h12" stroke="#D97706" stroke-width="2"/>`]};
function sys(v){$(R,'.set').innerHTML=ART[v].map(a=>`<svg viewBox="0 0 100 100" aria-hidden="true">${a}</svg>`).join('');
out(R,'sys',v==='one'?'<b>One illustration system:</b> same line weight, same corner radius, same palette. These small <b>spot illustrations</b> (for an empty state, a success screen) now look like one product.':'<b>Three different artists:</b> flat, gradient and dashed outline, each in its own colours. Every drawing is "nice", but together they feel like clip art.')}
function st(v){const m=$(R,'.media');
if(v==='ph'){m.innerHTML=`<div class="sk${RM()?'':' anim'}"></div>`;out(R,'st','<b>Placeholder.</b> A neutral shape the exact size of the coming image. The layout does not jump when the photo arrives.')}
else if(v==='broken'){m.innerHTML=`<span style="font:13px system-ui;color:#4A5A4F;padding:12px;text-align:center">&#9633; sunset_final_v3.jpg</span>`;m.style.background='#FFFFFF';out(R,'st','<b>No plan.</b> The browser shows a broken box and a file name. The card collapses and looks broken.');return}
else{m.innerHTML=`<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">${SCENE}</svg>`;out(R,'st','<b>Loaded.</b> Same size as the placeholder, so nothing moved.')}
m.style.background=''}
const SR=['"image dot j p g, image"','"Image of a picture, image"','"Woman in an orange dress waving at a market at sunset, image"'];
const AW=['<b>A file name</b> tells a blind user nothing.','<b>"Image of"</b> is wasted words: the screen reader already says "image". And it still describes nothing.','<b>Good alt text</b> describes what matters in the picture, in one plain sentence. If an image is pure decoration, leave the alt empty so it is skipped.'];
function alt(v){out(R,'sr','Screen reader: '+SR[+v]);out(R,'alt',AW[+v])}
seg(R,'sys',sys);seg(R,'st',st);seg(R,'alt',alt);sys('mixed');st('ph');alt('2')}}
];

/* =====================================================================
   DRILLS
   ===================================================================== */
const C=(inner,st)=>`<div style="background:#F4F0E5;padding:18px;border-radius:10px;display:grid;place-items:center;min-height:120px;${st||''}">${inner}</div>`;
const card=(sh,extra)=>`<div style="width:170px;background:#FFFDF7;border-radius:14px;padding:14px;box-shadow:${sh};font:14px/1.4 'Instrument Sans',sans-serif;color:#14261D;${extra||''}"><b style="font-family:'Bricolage Grotesque',sans-serif;font-size:15px">Order summary</b><br>3 items · ₦24,500</div>`;
const btn=(r,extra)=>`<span style="display:inline-block;background:#E8722C;border:2px solid #14261D;border-radius:${r};padding:10px 18px;font:700 14px 'Instrument Sans',sans-serif;color:#14261D;${extra||''}">Continue</span>`;
const blk=sh=>`<div style="width:72px;height:54px;background:#FFFDF7;border-radius:12px;box-shadow:${sh}"></div>`;
const ico=(k,o)=>`<span style="color:#14261D;display:inline-grid">${svg(k,o)}</span>`;

window.DRILLS['depth']=[
{id:'d-n1',type:'name',level:1,q:'What kind of shadow is this?',face:C(card('5px 5px 0 #14261D','border:2.5px solid #14261D')),opts:['Hard shadow','Layered shadow','Inner shadow','Tinted shadow'],ok:0,why:'No blur at all, just an offset copy of the shape. That is a hard shadow: graphic and bold, not realistic.'},
{id:'d-n2',type:'name',level:2,q:'This input looks pressed into the page. What makes it look that way?',face:C(`<div style="width:200px;background:#EDE6D6;border-radius:10px;padding:12px;box-shadow:inset 0 3px 6px rgba(20,38,29,.25);font:14px sans-serif;color:#4A5A4F">Search courses</div>`),opts:['Drop shadow','Inner shadow','Spread','Elevation'],ok:1,why:'The shadow sits inside the shape, along the top edge. An inner shadow makes things look sunk in, which suits inputs and wells.'},
{id:'d-a1',type:'ab',level:1,q:'Which card feels like it is really resting on the page?',a:C(card('0 1px 2px rgba(20,38,29,.2), 0 10px 24px -8px rgba(20,38,29,.3)')),b:C(card('0 0 30px rgba(0,0,0,.55)')),ok:'a',why:'A tight contact shadow plus a soft one below, offset downward, matches how light works. A big dark glow on all sides looks like a smudge.'},
{id:'d-a2',type:'ab',level:2,q:'This page is warm cream. Which shadow belongs on it?',a:C(card('0 12px 26px -6px rgba(0,0,0,.45)')),b:C(card('0 12px 26px -6px rgba(110,62,20,.38)')),ok:'b',why:'A shadow tinted with a deep version of the background (warm brown) looks natural. Pure grey or black on a warm surface looks dirty.'},
{id:'d-p1',type:'pick',level:2,q:'Which set of cards agrees on one light source?',opts:[C(`<div style="display:flex;gap:10px">${blk('6px 6px 12px -2px rgba(20,38,29,.35)')}${blk('-6px 6px 12px -2px rgba(20,38,29,.35)')}</div>`),C(`<div style="display:flex;gap:10px">${blk('0 8px 14px -4px rgba(20,38,29,.35)')}${blk('0 8px 14px -4px rgba(20,38,29,.35)')}</div>`),C(`<div style="display:flex;gap:10px">${blk('0 8px 14px -4px rgba(20,38,29,.35)')}${blk('0 -8px 14px -4px rgba(20,38,29,.35)')}</div>`)],ok:1,why:'Both shadows fall straight down, so the imagined lamp is above them. When shadows point different ways, the page feels subtly broken.'},
{id:'d-f1',type:'fix',level:2,q:'The modal is open but the page behind it still competes for attention. What is the fix?',face:C(`<div style="position:relative;width:220px;height:130px;background:#FFFDF7;border:1px solid rgba(20,38,29,.2);border-radius:10px;padding:8px;font:12px sans-serif;color:#14261D">Dashboard · Projects · Reports<div style="margin-top:8px;height:20px;background:#D6E59A;border-radius:6px"></div><div style="position:absolute;left:30px;right:30px;top:40px;background:#FFFDF7;border:1px solid rgba(20,38,29,.25);border-radius:12px;padding:10px;box-shadow:0 10px 20px -6px rgba(20,38,29,.3)"><b>Delete project?</b></div></div>`),opts:['Add a dark see-through scrim behind the modal','Make the modal border thicker','Add a second, bigger drop shadow'],ok:0,why:'A scrim dims everything behind the modal, so the top layer is the only bright thing. That is how people know where to look.'},
{id:'d-f2',type:'fix',level:3,q:'Every card in this list has a heavy shadow. The list feels noisy. What is the fix?',face:C(`<div style="display:grid;gap:8px">${[0,1,2].map(()=>`<div style="width:200px;height:28px;background:#FFFDF7;border-radius:8px;box-shadow:0 8px 18px rgba(20,38,29,.45)"></div>`).join('')}</div>`),opts:['Drop the shadows and use a 1px hairline border','Make each shadow a different colour','Increase the blur radius'],ok:0,why:'List rows sit at the lowest elevation. A hairline defines each edge without noise; save shadows for things that truly float.'},
{id:'d-n3',type:'name',level:3,q:'Two shadows are stacked here: a tight dark one at the edge and a big soft one. What is this called?',face:C(card('0 1px 1px rgba(20,38,29,.3), 0 2px 3px rgba(20,38,29,.15), 0 18px 36px -10px rgba(20,38,29,.35)')),opts:['Layered shadow','Hard shadow','Glow','Inner shadow'],ok:0,why:'A layered shadow combines a contact shadow with an ambient one, which is how real objects sit on a surface.'},
{id:'d-n4',type:'name',level:3,q:'Only one number changed between these two shadows. Which one?',face:C(`<div style="display:flex;gap:14px">${blk('0 10px 0 rgba(20,38,29,.3)')}${blk('0 10px 22px rgba(20,38,29,.3)')}</div>`),opts:['Offset','Blur radius','Spread','Opacity'],ok:1,why:'Same position, same darkness, but the right edge is soft. Blur radius controls how soft a shadow edge is.'}
];

window.DRILLS['shape']=[
{id:'s-n1',type:'name',level:1,q:'What do we call this shape of button?',face:C(btn('999px')),opts:['Pill','Squircle','Sharp','Soft'],ok:0,why:'A fully rounded end (radius 999px) makes a pill. Friendly and very touchable.'},
{id:'s-a1',type:'ab',level:2,q:'Which card has the correct inner corner?',a:C(`<div style="width:160px;padding:10px;border:2.5px solid #14261D;border-radius:24px;background:#FFFDF7"><div style="height:70px;background:#D6E59A;border:2px solid #14261D;border-radius:24px"></div></div>`),b:C(`<div style="width:160px;padding:10px;border:2.5px solid #14261D;border-radius:24px;background:#FFFDF7"><div style="height:70px;background:#D6E59A;border:2px solid #14261D;border-radius:14px"></div></div>`),ok:'b',why:'Inner radius = outer radius − padding (24 − 10 = 14). Then the gap between the curves stays even all the way round.'},
{id:'s-p1',type:'pick',level:2,q:'Which card uses one consistent shape scale?',opts:[C(`<div style="width:150px;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:10px;display:grid;gap:8px"><div style="height:40px;background:#C9E0F2;border-radius:8px"></div>${btn('8px','padding:6px 12px;font-size:12px')}</div>`),C(`<div style="width:150px;background:#FFFDF7;border:2px solid #14261D;border-radius:4px;padding:10px;display:grid;gap:8px"><div style="height:40px;background:#C9E0F2;border-radius:20px"></div>${btn('0','padding:6px 12px;font-size:12px')}</div>`),C(`<div style="width:150px;background:#FFFDF7;border:2px solid #14261D;border-radius:22px;padding:10px;display:grid;gap:8px"><div style="height:40px;background:#C9E0F2;border-radius:2px"></div>${btn('12px','padding:6px 12px;font-size:12px')}</div>`)],ok:0,why:'16 for the card, 8 for the things inside it: two steps from one scale. The others mix sharp, soft and round with no logic.'},
{id:'s-n2',type:'name',level:1,q:'Corners of 0. Which personality is this?',face:C(`<div style="width:180px;background:#FFFDF7;border:2px solid #14261D;padding:12px;font:15px Georgia,serif;color:#14261D"><b>The Review</b><br><span style="font-size:13px">Issue 14 · Autumn</span></div>`),opts:['Sharp: formal, editorial','Round: friendly, modern','Soft: calm, professional','Pill: playful'],ok:0,why:'Radius 0 feels formal and architectural, which is why magazines and luxury brands use it.'},
{id:'s-a2',type:'ab',level:3,q:'Which shape looks smoother, like an app icon?',a:C(`<svg width="90" height="90" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="30" fill="#E8722C" stroke="#14261D" stroke-width="3"/></svg>`),b:C(`<svg width="90" height="90" viewBox="0 0 120 120"><path d="M60 10C100 10 110 20 110 60S100 110 60 110 10 100 10 60 20 10 60 10Z" fill="#E8722C" stroke="#14261D" stroke-width="3"/></svg>`),ok:'b',why:'A squircle eases into its curve slowly, so there is no visible kink where the straight edge ends. It reads as one continuous shape.'},
{id:'s-f1',type:'fix',level:2,q:'The play button (a circle) looks smaller than the square stop button next to it, but both are 40px. What is the fix?',face:C(`<div style="display:flex;gap:14px;align-items:center"><span style="width:40px;height:40px;border-radius:50%;background:#14261D"></span><span style="width:40px;height:40px;background:#14261D"></span></div>`),opts:['Draw the circle slightly bigger (optical overshoot)','Make the square smaller','Add a border to the circle'],ok:0,why:'Round shapes have less area near the edges, so they look smaller. Designers draw them a few percent bigger so they look equal.'},
{id:'s-f2',type:'fix',level:3,q:'This finance dashboard feels like a toy. What change brings back trust?',face:C(`<div style="width:200px;background:#FFFDF7;border:2px solid #14261D;border-radius:30px;padding:12px;font:13px sans-serif;color:#14261D"><b>Balance</b><br>₦1,240,000<div style="margin-top:8px">${btn('999px','padding:6px 12px;font-size:12px')}</div></div>`),opts:['Use a smaller, soft radius like 8–12px','Use pill shapes everywhere','Remove the border'],ok:0,why:'Shape carries mood. Big round shapes feel playful; a soft, small radius feels calm and professional, which suits money.'},
{id:'s-n3',type:'name',level:3,q:'A product where every card, chip, button and icon shares the same family of forms has a strong…',face:C(`<div style="display:flex;gap:8px;flex-wrap:wrap;width:200px">${btn('12px','padding:6px 12px;font-size:12px')}<span style="border:2px solid #14261D;border-radius:12px;padding:5px 10px;font:700 12px sans-serif;background:#D6E59A">Tag</span><span style="width:40px;height:32px;border:2px solid #14261D;border-radius:12px;background:#C9E0F2"></span></div>`),opts:['Shape language','Shape scale','Nested radius','Optical size'],ok:0,why:'Shape language is the consistent family of forms across a product. The shape scale is the short list of radii that creates it.'}
];

const hero=(bg,extra)=>`<div style="width:220px;height:120px;border-radius:10px;padding:14px;display:grid;align-content:center;gap:4px;font-family:'Bricolage Grotesque',sans-serif;color:#14261D;background:${bg};${extra||''}"><b style="font-size:18px;line-height:1.1">Build in 6 weeks</b><span style="font:13px 'Instrument Sans',sans-serif">Live sessions and real projects</span></div>`;
window.DRILLS['background']=[
{id:'b-n1',type:'name',level:1,q:'What background is this?',face:C(hero('radial-gradient(circle,rgba(20,38,29,.22) 1.3px,transparent 1.6px) 0 0/14px 14px,#F4F0E5')),opts:['Grid / dot pattern','Grain','Mesh gradient','Vignette'],ok:0,why:'A faint repeated grid of dots. It suggests structure and precision without shouting.'},
{id:'b-n2',type:'name',level:2,q:'Several soft colour blobs blended together. What is it called?',face:C(hero('radial-gradient(45% 60% at 15% 20%,rgba(232,114,44,.55),transparent 70%),radial-gradient(45% 60% at 90% 30%,rgba(201,224,242,1),transparent 70%),radial-gradient(50% 60% at 60% 100%,rgba(214,229,154,1),transparent 70%),#F4F0E5')),opts:['Mesh gradient','Radial glow','Duotone','Scrim'],ok:0,why:'A mesh gradient mixes several colour points. Expressive, but it spends a lot of your texture budget.'},
{id:'b-a1',type:'ab',level:1,q:'Which hero keeps the headline the star?',a:C(hero('radial-gradient(60% 80% at 25% 50%,rgba(232,114,44,.28),transparent 70%),#F4F0E5')),b:C(hero('repeating-linear-gradient(45deg,#E8722C 0 8px,#D6E59A 8px 16px)')),ok:'a',why:'A soft glow points at the content. Loud stripes use up the whole texture budget and fight every word.'},
{id:'b-a2',type:'ab',level:2,q:'White text on a busy photo. Which version can everyone read?',a:C(`<div style="width:220px;height:120px;border-radius:10px;background:linear-gradient(120deg,#E8722C,#FFFDF7 45%,#D6E59A);position:relative"><span style="position:absolute;left:12px;bottom:10px;color:#fff;font:800 17px 'Bricolage Grotesque',sans-serif">Sunset market</span></div>`),b:C(`<div style="width:220px;height:120px;border-radius:10px;background:linear-gradient(to top,rgba(20,38,29,.8),transparent 70%),linear-gradient(120deg,#E8722C,#FFFDF7 45%,#D6E59A);position:relative"><span style="position:absolute;left:12px;bottom:10px;color:#fff;font:800 17px 'Bricolage Grotesque',sans-serif">Sunset market</span></div>`),ok:'b',why:'A dark scrim behind the text guarantees contrast wherever the light parts of the image fall.'},
{id:'b-p1',type:'pick',level:2,q:'Which grain is the right amount?',opts:[C(`<div style="width:200px;height:100px;border-radius:10px;background:#F4F0E5;position:relative;overflow:hidden"><i style="position:absolute;inset:0;background:${GRAIN};opacity:.9"></i></div>`),C(`<div style="width:200px;height:100px;border-radius:10px;background:#F4F0E5;position:relative;overflow:hidden"><i style="position:absolute;inset:0;background:${GRAIN};opacity:.12"></i></div>`),C(`<div style="width:200px;height:100px;border-radius:10px;background:#F4F0E5;position:relative;overflow:hidden"><i style="position:absolute;inset:0;background:${GRAIN};opacity:.5"></i></div>`)],ok:1,why:'Grain should be felt, not seen. If you notice it before the content, it is too strong.'},
{id:'b-f1',type:'fix',level:2,q:'The frosted card is pretty, but the caption is still hard to read. What is the best fix?',face:C(`<div style="width:220px;height:120px;border-radius:10px;background:radial-gradient(circle at 20% 30%,#E8722C 30%,transparent 31%),radial-gradient(circle at 80% 60%,#D6E59A 30%,transparent 31%),#C9E0F2;position:relative"><div style="position:absolute;left:10px;right:10px;bottom:10px;padding:8px;border-radius:10px;background:rgba(255,255,255,.15);color:#fff;font:700 14px sans-serif;border:1px solid rgba(255,255,255,.4)">Sunset market</div></div>`),opts:['Darken the glass and increase the backdrop blur','Make the text smaller','Add a second glass card'],ok:0,why:'Glass only works when the layer is tinted and blurred enough to calm what is behind it. Otherwise the shapes still compete with the text.'},
{id:'b-n3',type:'name',level:3,q:'The edges of this image are darkened to pull your eye to the middle. What is this?',face:C(`<div style="width:220px;height:120px;border-radius:10px;background:radial-gradient(ellipse at center,transparent 40%,rgba(20,38,29,.7) 100%),linear-gradient(#C9E0F2,#D6E59A)"></div>`),opts:['Vignette','Scrim','Glow','Backdrop blur'],ok:0,why:'A vignette darkens toward the edges. It sets a mood and focuses the centre; it is not a readability fix.'},
{id:'b-f2',type:'fix',level:3,q:'This form page has a mesh gradient, grain and a dot grid all at once. What should go first?',face:C(hero('radial-gradient(circle,rgba(20,38,29,.3) 1.3px,transparent 1.6px) 0 0/12px 12px,radial-gradient(45% 60% at 15% 20%,rgba(232,114,44,.7),transparent 70%),radial-gradient(45% 60% at 90% 30%,rgba(246,215,232,1),transparent 70%),#C9E0F2')),opts:['Go back to one flat colour, or one quiet effect','Add a vignette to balance it','Increase contrast on the dots'],ok:0,why:'A form is a task screen; it needs almost zero texture budget. Use one effect at most, and keep it quiet.'}
];

const tb=(items,o)=>`<div style="display:flex;gap:${o&&o.gap||'14px'};background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:10px 12px;color:#14261D">${items}</div>`;
window.DRILLS['icons']=[
{id:'i-a1',type:'ab',level:1,q:'Which toolbar looks like one icon family?',a:C(tb(['home','search','bell','user'].map(k=>ico(k,{s:22})).join(''))),b:C(tb(ico('home',{s:22})+ico('search',{s:22,w:1})+ico('bell',{s:22,fill:'currentColor'})+ico('user',{s:22,w:3,cap:'square',join:'miter'}))),ok:'a',why:'Same stroke width, same line ends, same style. Mixing outline, filled and different weights makes a set look borrowed.'},
{id:'i-n1',type:'name',level:1,q:'These icons are solid shapes. What style are they?',face:C(tb(['home','heart','bell'].map(k=>ico(k,{s:24,fill:'currentColor'})).join(''))),opts:['Filled','Outline','Duotone','Emoji'],ok:0,why:'Filled icons are solid. They are heavier and easier to spot, which is why apps often use them for the active tab.'},
{id:'i-n2',type:'name',level:2,q:'Only one thing differs between these two icons. What is it?',face:C(`<div style="display:flex;gap:22px">${ico('cal',{s:44,w:1.25})}${ico('cal',{s:44,w:2.75})}</div>`),opts:['Stroke width','Line cap','Optical size','Metaphor'],ok:0,why:'The lines are thicker on the right. Match stroke width to the weight of the text beside the icons.'},
{id:'i-f1',type:'fix',level:2,q:'Users keep tapping the wrong icon in this row on their phones. What is the fix?',face:C(tb(['heart','share','trash'].map(k=>ico(k,{s:16})).join(''),{gap:'4px'})),opts:['Give each icon a 44×44px tap area with space between','Use thinner lines','Use filled icons'],ok:0,why:'A thumb needs about 44×44px. The icon can stay small; the tappable area around it must not.'},
{id:'i-p1',type:'pick',level:2,q:'Which button is clear without guessing?',opts:[C(`<span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;color:#14261D">${svg('share',{s:22})}</span>`),C(`<span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 14px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;color:#14261D;font:700 14px sans-serif">${svg('share',{s:20})}Export PDF</span>`),C(`<span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 14px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;font:22px system-ui">&#x1F4E4;</span>`)],ok:1,why:'An arrow out of a box could mean share, upload or export. A label removes the guesswork.'},
{id:'i-a2',type:'ab',level:2,q:'Navigation for a banking app. Which is right?',a:C(tb(`<span style="font:22px system-ui">&#x1F3E0;</span><span style="font:22px system-ui">&#x1F4B0;</span><span style="font:22px system-ui">&#x2699;&#xFE0F;</span>`)),b:C(tb(['home','cal','gear'].map(k=>ico(k,{s:22})).join(''))),ok:'b',why:'Emoji look different on every phone and cannot take your colours. They belong in chat, not in an interface.'},
{id:'i-n3',type:'name',level:3,q:'A tiny 16px gear has fewer teeth and thicker lines than the 24px version. What is that called?',face:C(`<div style="display:flex;gap:18px;align-items:flex-end;color:#14261D"><span style="width:16px;height:16px;display:inline-block"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21"/></svg></span>${svg('gear',{s:24})}</div>`),opts:['Optical size','Pixel grid','Stroke width','Icon family'],ok:0,why:'Icons drawn for a specific size are optical sizes. Small sizes need simpler drawings to stay readable.'},
{id:'i-n4',type:'name',level:3,q:'A trash can means "delete". A magnifier means "search". What is this borrowing called?',face:C(tb(ico('trash',{s:24})+ico('search',{s:24}))),opts:['Metaphor','Label','Treatment','Glyph'],ok:0,why:'An icon borrows a real-world idea: its metaphor. Only a handful of metaphors are understood by everyone without a label.'}
];

const ph=(f,ar,w)=>`<svg viewBox="${f}" width="${w||200}" style="display:block;aspect-ratio:${ar};border:2px solid #14261D;border-radius:10px" preserveAspectRatio="xMidYMid slice">${SCENE}</svg>`;
window.DRILLS['imagery']=[
{id:'m-n1',type:'name',level:1,q:'Square, 1 to 1. What is this property called?',face:C(ph('160 0 240 240','1/1',140)),opts:['Aspect ratio','Crop','Resolution','Treatment'],ok:0,why:'Aspect ratio is width to height. 1:1 is square; 16:9 is wide; 4:5 is tall.'},
{id:'m-a1',type:'ab',level:2,q:'The card is about a person. Which crop tells that story?',a:C(ph('0 0 240 240','1/1',140)),b:C(ph('200 60 160 160','1/1',140)),ok:'b',why:'Crop on purpose. Keep what the message is about and cut what is not.'},
{id:'m-a2',type:'ab',level:2,q:'Which alt text helps a blind user?',a:C(`<code style="font:13px 'Space Mono',monospace;background:#FFFDF7;border:2px solid #14261D;border-radius:8px;padding:10px;display:block;max-width:220px">alt="IMG_2041.jpg"</code>`),b:C(`<code style="font:13px 'Space Mono',monospace;background:#FFFDF7;border:2px solid #14261D;border-radius:8px;padding:10px;display:block;max-width:220px">alt="Woman waving at a market at sunset"</code>`),ok:'b',why:'Alt text describes what matters in the image in one plain sentence. A file name says nothing.'},
{id:'m-n2',type:'name',level:2,q:'This photo was recoloured using only two brand colours. What is the treatment?',face:C(`<svg width="0" height="0" style="position:absolute"><filter id="vz3-duo-d"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.078 0.91"/><feFuncG type="table" tableValues="0.149 0.447"/><feFuncB type="table" tableValues="0.114 0.173"/></feComponentTransfer></filter></svg><svg viewBox="0 0 400 240" width="200" style="border:2px solid #14261D;border-radius:10px;display:block"><g filter="url(#vz3-duo-d)">${SCENE}</g></svg>`),opts:['Duotone','Grayscale','Vignette','Mesh gradient'],ok:0,why:'Duotone maps the dark parts to one colour and the light parts to another. It makes any photo look like part of your brand.'},
{id:'m-p1',type:'pick',level:2,q:'Which image is still loading the right way?',opts:[C(`<div style="width:180px;aspect-ratio:16/9;border-radius:10px;background:#EDE6D6"></div>`),C(`<div style="width:180px;font:12px system-ui;color:#4A5A4F;background:#fff;padding:8px">&#9633; photo_final.jpg</div>`),C(`<div style="width:180px;height:24px;display:grid;place-items:center;font:12px sans-serif;color:#4A5A4F">Loading...</div>`)],ok:0,why:'A placeholder the exact size of the coming image stops the layout jumping when it arrives.'},
{id:'m-f1',type:'fix',level:2,q:'These three blog thumbnails come from different photographers and clash. What is the fastest fix?',face:C(`<div style="display:flex;gap:6px">${[['saturate(1.8)','0 0 240 240'],['hue-rotate(160deg)','160 0 240 240'],['contrast(1.5) hue-rotate(60deg)','80 0 240 240']].map(x=>`<svg viewBox="${x[1]}" width="64" height="64" style="border:2px solid #14261D;border-radius:8px;filter:${x[0]}">${SCENE}</svg>`).join('')}</div>`),opts:['Apply one treatment, like duotone, to all of them','Add a thicker border','Put them in different sizes'],ok:0,why:'One treatment for every image turns a random pile into a set. That decision is art direction.'},
{id:'m-n3',type:'name',level:3,q:'Small drawings like this sit in empty states and success screens. What are they called?',face:C(`<div style="display:grid;justify-items:center;gap:6px;font:13px sans-serif;color:#14261D"><svg viewBox="0 0 100 100" width="70"><rect x="24" y="30" width="52" height="40" rx="8" fill="#F7DCC4" stroke="#14261D" stroke-width="3"/><path d="M24 40l26 16 26-16" fill="none" stroke="#14261D" stroke-width="3" stroke-linejoin="round"/></svg><b>No messages yet</b></div>`),opts:['Spot illustration','Hero image','Placeholder','Icon'],ok:0,why:'A spot illustration is a small drawing that supports a message. Bigger and more expressive than an icon, smaller than a hero.'},
{id:'m-f2',type:'fix',level:3,q:'The landing page uses a flat illustration, a 3D render and a hand-drawn sketch. What should the brief say?',face:C(`<div style="display:flex;gap:8px"><svg viewBox="0 0 100 100" width="60"><circle cx="50" cy="50" r="28" fill="#2ECC71"/></svg><svg viewBox="0 0 100 100" width="60"><defs><radialGradient id="vz3r"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7F7FD5"/></radialGradient></defs><circle cx="50" cy="50" r="28" fill="url(#vz3r)"/></svg><svg viewBox="0 0 100 100" width="60"><circle cx="50" cy="50" r="28" fill="none" stroke="#D97706" stroke-width="4" stroke-dasharray="3 4"/></svg></div>`),opts:['One illustration system: same line, corners and palette','More illustrations so they balance out','Bigger illustrations'],ok:0,why:'An illustration system sets the rules every drawing follows, so they look like one product no matter who draws them.'}
];
})();
