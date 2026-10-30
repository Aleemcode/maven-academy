/* Taste Lab: visual explainers + Train-your-eye drills (part 1). See CONTRACT in the repo notes. */
window.VIZ=window.VIZ||{};window.DRILLS=window.DRILLS||{};
(function(){
/* ---------- shared helpers (scoped to this file) ---------- */
const $=(el,s)=>el.querySelector(s),$$=(el,s)=>Array.prototype.slice.call(el.querySelectorAll(s));
const RM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const INK='#14261D',MUT='#4A5A4F',CREAM='#F4F0E5',PAPER='#FFFDF7',TERRA='#E8722C';
const hex2rgb=h=>{h=String(h).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.substr(i,2),16)||0)};
const rgb2hex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const lum=h=>{const c=hex2rgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const hsl2hex=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return rgb2hex([f(0)*255,f(8)*255,f(4)*255])};
const hex2hsl=h=>{const[r,g,b]=hex2rgb(h).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let H=0,S=0;const L=(mx+mn)/2;if(d){S=d/(1-Math.abs(2*L-1));H=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;H*=60;if(H<0)H+=360}return[Math.round(H),Math.round(S*100),Math.round(L*100)]};
const mix=(a,b,t)=>{const x=hex2rgb(a),y=hex2rgb(b);return rgb2hex(x.map((v,i)=>v+(y[i]-v)*t))};
const onText=bg=>ratio(INK,bg)>=ratio('#FFFFFF',bg)?INK:'#FFFFFF';
/* segmented buttons: [data-g=name] > button[data-v] */
function seg(el,name,fn){const g=$(el,'[data-g="'+name+'"]');if(!g)return;g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!g.contains(b))return;$$(g,'button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));fn(b.dataset.v,b)})}
function slide(el,name,fn){const i=$(el,'input[name="'+name+'"]');if(!i)return;const h=()=>fn(parseFloat(i.value),i);i.addEventListener('input',h);return i}
function once(el){const r=el.querySelector('.vz1');if(!r||r._vzOn)return true;r._vzOn=1;return false}
function out(el,k,v){$$(el,'[data-o="'+k+'"]').forEach(n=>{n.innerHTML=v})}
function watch(el,fn){if(window.ResizeObserver){let w=0;const ro=new ResizeObserver(()=>{if(!el.isConnected){ro.disconnect();return}const nw=el.clientWidth;if(nw!==w){w=nw;fn()}});ro.observe(el)}}
const KIT=`<style>
:where(.vz1){font-family:'Instrument Sans',system-ui,sans-serif;color:#14261D;display:grid;gap:14px;min-width:0;font-size:15px;line-height:1.5}
:where(.vz1) *{box-sizing:border-box}
:where(.vz1) .stg{background:#F4F0E5;border:2.5px solid #14261D;border-radius:14px;padding:16px;position:relative;overflow:hidden;min-width:0}
:where(.vz1) .paper{background:#FFFDF7}
:where(.vz1) .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
:where(.vz1) .seg{display:flex;flex-wrap:wrap;gap:6px}
:where(.vz1) .seg button,:where(.vz1) .tb{min-height:44px;border:2px solid #14261D;border-radius:10px;background:#FFFDF7;padding:8px 12px;font:600 14px/1.2 'Instrument Sans',system-ui,sans-serif;color:#14261D;cursor:pointer}
:where(.vz1) .seg button[aria-pressed=true],:where(.vz1) .tb[aria-pressed=true]{background:#14261D;color:#D6E59A}
:where(.vz1) .tb.pri{background:#E8722C;box-shadow:2px 2px 0 #14261D}
:where(.vz1) .sl{display:grid;gap:0}
:where(.vz1) .sl .h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-weight:700;font-size:14px}
:where(.vz1) .v{font:700 12px/1.4 'Space Mono',monospace;background:#FFFDF7;border:1.5px solid #14261D;border-radius:6px;padding:1px 6px;white-space:nowrap}
:where(.vz1) input[type=range]{width:100%;accent-color:#E8722C;height:40px;margin:0}
:where(.vz1) .note{background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.5}
:where(.vz1) .note b{font-family:'Bricolage Grotesque',sans-serif}
:where(.vz1) .lab{font:700 11px/1.3 'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;color:#4A5A4F}
:where(.vz1) .pill{display:inline-block;font:700 12px/1.4 'Space Mono',monospace;border:2px solid #14261D;border-radius:99px;padding:3px 10px;background:#FFFDF7}
:where(.vz1) .ok{background:#D6E59A}:where(.vz1) .bad{background:#F6D7E8}:where(.vz1) .mid{background:#F7DCC4}
:where(.vz1) .g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(270px,100%),1fr));gap:14px}
:where(.vz1) .sm{font-size:13px;color:#4A5A4F;margin:0}
</style>`;
const SPARK=c=>`<svg width="56" height="20" viewBox="0 0 56 20" aria-hidden="true"><g fill="${c}"><path d="M8 0l2 7 7 3-7 2-2 8-2-8-6-2 6-3z"/><path d="M28 4l1.4 4.6L34 10l-4.6 1.4L28 16l-1.4-4.6L22 10l4.6-1.4z"/><path d="M47 0l2 7 7 3-7 2-2 8-2-8-6-2 6-3z"/></g></svg>`;

/* =====================================================================
   INTENT
   ===================================================================== */
window.VIZ['intent']=[
{id:'intent-decided',title:'Default vs decided',
 terms:['Intent','Default','Slop','Craft','Taste'],
 intro:'The same little screen, twice. In Default, the tool chose everything. In Decided, a person chose every piece on purpose.',
 try:'Flip between Default and Decided, then tap each numbered pin to hear why that piece is there.',
 html:`<div class="vz1 vz-intent-decided">${KIT}<style>
.vz-intent-decided .stg{display:flex;justify-content:center;padding:22px 14px 22px 14px}
.vz-intent-decided .wrap{width:100%;max-width:344px;padding-right:44px;position:relative}
.vz-intent-decided .cd{border-radius:18px;padding:22px 20px}
.vz-intent-decided .slop{background:linear-gradient(135deg,#6D4AFF,#A63AE0);color:#fff;text-align:center;font-family:Arial,sans-serif;box-shadow:0 18px 40px rgba(109,74,255,.45)}
.vz-intent-decided .craft{background:#FFFDF7;border:2.5px solid #14261D;box-shadow:5px 5px 0 #14261D}
.vz-intent-decided .el{position:relative}
.vz-intent-decided .el+.el{margin-top:10px}
.vz-intent-decided .pin{position:absolute;right:-64px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;border:2px solid #14261D;background:#FFFDF7;color:#14261D;font:700 12px 'Space Mono',monospace;padding:0;cursor:pointer;z-index:2}
.vz-intent-decided .pin::after{content:'';position:absolute;inset:-8px}
.vz-intent-decided .pin.seen{background:#D6E59A}
.vz-intent-decided .pin[aria-pressed=true]{background:#E8722C;box-shadow:2px 2px 0 #14261D}
.vz-intent-decided .hl{outline:2.5px dashed #E8722C;outline-offset:4px;border-radius:6px}
.vz-intent-decided .sbtn{background:#FF7AE0;color:#1E0B3A;border-radius:8px;padding:10px;font-weight:700}
.vz-intent-decided .cbtn{background:#E8722C;border:2.5px solid #14261D;border-radius:10px;padding:10px;font-weight:700;text-align:center}
.vz-intent-decided .card-pin{top:-13px;right:31px;transform:none}
</style>
<div class="row"><div class="seg" data-g="mode"><button data-v="def" aria-pressed="true">Default: the tool chose</button><button data-v="dec" aria-pressed="false">Decided: you chose</button></div></div>
<div class="stg"><div class="wrap">
 <div class="cd slop" data-m="def">
  <div class="el" data-p="1">${SPARK('#fff')}</div>
  <div class="el" data-p="2" style="font-size:22px;font-weight:700;line-height:1.25">Welcome to the Future!</div>
  <div class="el" data-p="3" style="font-size:13px">The all-in-one platform that revolutionizes everything you do</div>
  <div class="el" data-p="4"><div class="sbtn">Get Started Now!!</div></div>
 </div>
 <div class="cd craft" data-m="dec" hidden>
  <div class="el" data-p="1" style="font:700 10px 'Space Mono',monospace;letter-spacing:2px">FOR MARKET TRADERS</div>
  <div class="el" data-p="2" style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;line-height:1.02;letter-spacing:-.02em">Know what sold today, in one tap.</div>
  <div class="el" data-p="3" style="font-size:13px;color:#4A5A4F">Record a sale by voice. See your profit by evening.</div>
  <div class="el" data-p="4"><div class="cbtn">Record my first sale</div></div>
 </div>
 <button class="pin card-pin" data-n="5" aria-label="Reason 5: the surface">5</button>
</div></div>
<div class="note" aria-live="polite" data-o="why"></div>
<p class="sm" data-o="count"></p>
</div>`,
 init(el){if(once(el))return;
  const R={def:{1:['Sparkles','Added because AI adds sparkles. They tell you nothing about the product. That is a <b>default</b>, not a decision.'],2:['The headline','“Welcome to the Future!” could sit on any product on earth. A sentence that fits everything says nothing.'],3:['The supporting line','“All-in-one”, “revolutionizes”: filler the model has seen a million times. No audience, no task. This is <b>slop</b>.'],4:['The button','“Get Started Now!!” does not say what happens next. Two exclamation marks shout instead of explain.'],5:['The surface','Purple gradient and a soft glow: the most common AI look. Nobody chose it for this product.']},
   dec:{1:['The eyebrow','It names who this is for: market traders. Naming the audience is the first decision, and every later choice follows from it.'],2:['The headline','A promise with a task (know what sold) and a cost (one tap). Biggest and boldest, so it is read first.'],3:['The supporting line','One quiet line explains how. Muted colour so it reads second, after the headline.'],4:['The button','It says exactly what will happen: “Record my first sale”. Terracotta, because it is the one accent and this is the one action.'],5:['The surface','Paper, an ink border and a hard shadow: the brand system, used on purpose. That care is <b>craft</b>.']}};
  let mode='def',cur=0;const seen={def:{},dec:{}};
  // add pins into each card element
  $$(el,'.cd .el').forEach(e=>{const n=e.dataset.p;e.insertAdjacentHTML('beforeend',`<button class="pin" data-n="${n}" aria-label="Reason ${n}">${n}</button>`)});
  function show(){
   $$(el,'.cd').forEach(c=>{c.hidden=c.dataset.m!==mode});
   $$(el,'.pin').forEach(p=>{const vis=p.classList.contains('card-pin')||p.closest('.cd').dataset.m===mode;if(!vis)return;const n=p.dataset.n;p.setAttribute('aria-pressed',String(+n===cur));p.classList.toggle('seen',!!seen[mode][n])});
   $$(el,'.el').forEach(e=>e.classList.toggle('hl',+e.dataset.p===cur&&e.closest('.cd').dataset.m===mode));
   const c=$(el,'.cd[data-m="'+mode+'"]');c.classList.toggle('hl',cur===5);
   const tag=mode==='def'?'<span class="pill bad">Default</span> ':'<span class="pill ok">Decided</span> ';
   out(el,'why',cur?tag+'<b>'+R[mode][cur][0]+'.</b> '+R[mode][cur][1]:'Tap a numbered pin. Each one asks the same question: <b>why is this here?</b>');
   const a=Object.keys(seen.def).length,b=Object.keys(seen.dec).length;
   out(el,'count',a+b>=10?'You read all ten reasons. Being able to name the reason for every piece is <b>intent</b>. Being able to tell which version has it is <b>taste</b>.':`Reasons read: ${a} of 5 for Default, ${b} of 5 for Decided.`);
  }
  el.addEventListener('click',e=>{const p=e.target.closest('.pin');if(!p||!el.contains(p))return;cur=+p.dataset.n;seen[mode][cur]=1;show()});
  seg(el,'mode',v=>{mode=v;if(cur)seen[mode][cur]=1;show()});
  show();
 }},
{id:'intent-reason',title:'Name the reason or delete it',
 terms:['First draft','Restraint','Curation'],
 intro:'This is a first draft, the kind AI hands you in seconds. Eight things are on it. Some have a job. Some are only there because the machine put them there.',
 try:'Tap each piece of the screen and decide: keep it (it has a job) or delete it (no reason).',
 html:`<div class="vz1 vz-intent-reason">${KIT}<style>
.vz-intent-reason .phone{max-width:300px;margin:0 auto;background:#FFFDF7;border:2.5px solid #14261D;border-radius:24px;padding:14px;display:grid;gap:8px;box-shadow:4px 4px 0 #14261D}
.vz-intent-reason .it{display:block;width:100%;text-align:center;border:2px dashed transparent;border-radius:10px;background:transparent;padding:6px;font:inherit;color:#14261D;cursor:pointer;min-height:44px;transition:opacity .25s,max-height .3s,padding .3s,margin .3s;max-height:200px;overflow:hidden}
.vz-intent-reason .it:hover{border-color:#4A5A4F}
.vz-intent-reason .it.sel{border-color:#E8722C;border-style:solid;background:#F7DCC4}
.vz-intent-reason .it.kept{border:2px solid #14261D;border-style:solid}
.vz-intent-reason .it.gone{opacity:0;max-height:0;min-height:0;padding:0;margin:-4px 0;border:0;pointer-events:none}
.vz-intent-reason .ph{height:70px;border-radius:10px;background:repeating-linear-gradient(45deg,#E7E1D2 0 8px,#F4F0E5 8px 16px);display:grid;place-items:center;font-size:12px;color:#4A5A4F}
.vz-intent-reason .b1{background:#E8722C;border:2.5px solid #14261D;border-radius:10px;padding:10px;font-weight:700}
.vz-intent-reason .b2{background:#C9E0F2;border:2.5px solid #14261D;border-radius:10px;padding:10px;font-weight:700}
.vz-intent-reason .ask{display:grid;gap:10px}
@media (prefers-reduced-motion:reduce){.vz-intent-reason .it{transition:none}}
</style>
<div class="stg"><div class="phone">
 <button class="it" data-i="0" aria-label="Sparkle decoration">${SPARK('#E8722C')}</button>
 <button class="it" data-i="1" style="font-size:13px;color:#4A5A4F">Welcome to the future of commerce</button>
 <button class="it" data-i="2" style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.05;letter-spacing:-.02em">Know what sold today, in one tap.</button>
 <button class="it" data-i="3"><div class="ph">Stock photo: smiling team</div></button>
 <button class="it" data-i="4"><span class="pill mid">Rated #1 by users</span></button>
 <button class="it" data-i="5"><span class="lab">Today</span><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1.1">&#8358;84,200</div><div class="sm">12 sales</div></button>
 <button class="it" data-i="6"><div class="b1">Record a sale</div></button>
 <button class="it" data-i="7"><div class="b2">Learn more</div></button>
</div></div>
<div class="note ask" aria-live="polite"><div data-o="q">Tap any piece of the screen above.</div><div class="row" data-o="act"></div></div>
<div class="row"><span class="pill" data-o="score">0 of 8 decided</span><button class="tb" data-act="reset">Start again</button></div>
</div>`,
 init(el){if(once(el))return;
  const D=[[0,'Sparkles','Pure decoration. They carry no information and no feeling you chose.'],[0,'“Welcome to the future of commerce”','A slogan that could sit on any app. The headline below already does the real job.'],[1,'The headline','It is the promise: what the product does, for whom, at what cost. Everything else supports it.'],[0,'The stock photo','A smiling team tells a trader nothing about their sales. It only fills space.'],[0,'“Rated #1 by users”','A claim with no source. People skip it, or worse, stop trusting the page.'],[1,'Today’s total','This is the information the trader opened the app for. It earns its big size.'],[1,'“Record a sale”','The main task, one tap away. One clear action is the point of the screen.'],[0,'“Learn more”','A second button at equal weight splits attention. If it is needed, make it a quiet text link.']];
  const st={};let sel=-1;
  function score(){const n=Object.keys(st).length,good=Object.keys(st).filter(k=>st[k]===D[k][0]).length,del=Object.keys(st).filter(k=>!st[k]).length;
   out(el,'score',n+' of 8 decided · '+good+' right');
   if(n===8){out(el,'q',`<b>Done.</b> You deleted ${del} thing${del===1?'':'s'}. Leaving things out on purpose is <b>restraint</b>. Picking the few right pieces from many is <b>curation</b>. The draft got shorter and clearer, not emptier.`);out(el,'act','')}}
  function ask(i){sel=i;$$(el,'.it').forEach(b=>b.classList.toggle('sel',+b.dataset.i===i));
   out(el,'q',`<b>${D[i][1]}.</b> Does it have a job on this screen?`);
   out(el,'act',`<button class="tb" data-ans="1">Keep: it has a job</button><button class="tb" data-ans="0">Delete: no reason</button>`)}
  function answer(a){const i=sel;if(i<0)return;st[i]=a;const right=a===D[i][0];const b=$(el,'.it[data-i="'+i+'"]');b.classList.remove('sel');
   if(a===0)b.classList.add('gone');else b.classList.add('kept');
   out(el,'q',`<span class="pill ${right?'ok':'bad'}">${right?'Good call':'Look again'}</span> ${D[i][2]}${!right&&a===0?' (It is back. Tap it to decide again.)':''}`);
   if(!right&&a===0){b.classList.remove('gone');delete st[i]}
   if(!right&&a===1){b.classList.remove('kept');delete st[i]}
   out(el,'act','');sel=-1;score()}
  el.addEventListener('click',e=>{const it=e.target.closest('.it');if(it&&el.contains(it)){ask(+it.dataset.i);return}
   const an=e.target.closest('[data-ans]');if(an){answer(+an.dataset.ans);return}
   if(e.target.closest('[data-act="reset"]')){for(const k in st)delete st[k];$$(el,'.it').forEach(b=>b.classList.remove('gone','kept','sel'));out(el,'q','Tap any piece of the screen above.');out(el,'act','');score()}});
  score();
 }},
{id:'intent-brief',title:'Brief in, output out',
 terms:['Brief','Constraint','Hierarchy','Three steps or less'],
 intro:'A brief is the written direction you give before anything is made. Each line in it is a constraint: a rule you set on purpose. Watch what each rule does to the output.',
 try:'Switch the constraints on one at a time. Watch the brief write itself and the screen change with it.',
 html:`<div class="vz1 vz-intent-brief">${KIT}<style>
.vz-intent-brief .cons{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(170px,100%),1fr));gap:6px}
.vz-intent-brief .cons button{text-align:left;display:flex;gap:8px;align-items:center}
.vz-intent-brief .cons button i{width:18px;height:18px;border:2px solid currentColor;border-radius:5px;flex:none;display:grid;place-items:center;font-style:normal;font-size:12px}
.vz-intent-brief pre{margin:0;white-space:pre-wrap;font:12.5px/1.6 'Space Mono',monospace;color:#14261D}
.vz-intent-brief .pvw{display:flex;flex-direction:column;align-items:center;gap:12px;justify-content:center;min-height:300px}
.vz-intent-brief .cd{width:100%;max-width:280px;border-radius:16px;padding:20px}
.vz-intent-brief .flow{font:700 11px/1.6 'Space Mono',monospace;text-align:center;max-width:280px}
</style>
<div class="cons seg" data-o="cons"></div>
<div class="g2">
 <div class="stg paper"><div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="lab" data-o="bl">Lazy prompt</span><span class="pill" data-o="bn">0 constraints</span></div><pre data-o="brief"></pre></div>
 <div class="stg pvw" data-o="pv"></div>
</div>
</div>`,
 init(el){if(once(el))return;
  const C=[['aud','Name the audience','For market traders in Nigeria.'],['prom','Write the promise','Promise: “Know what sold today, in one tap.” Button says what happens.'],['acc','One accent colour','Neutral cream and ink. One accent, terracotta, only on the main action.'],['hier','Clear hierarchy','Headline read first, one quiet line second. Left-aligned.'],['steps','Three steps or less','Recording a sale takes three steps or fewer.'],['deco','No decoration without a job','No gradients, no glow, no sparkles.']];
  const on={};
  out(el,'cons',C.map(c=>`<button data-k="${c[0]}" aria-pressed="false"><i aria-hidden="true"></i>${c[1]}</button>`).join(''));
  function render(){
   const n=C.filter(c=>on[c[0]]).length;
   $$(el,'[data-k]').forEach(b=>{const v=!!on[b.dataset.k];b.setAttribute('aria-pressed',String(v));$(b,'i').innerHTML=v?'&#10003;':''});
   out(el,'bl',n?'Your brief':'Lazy prompt');out(el,'bn',n+' constraint'+(n===1?'':'s'));
   out(el,'brief',n?'Landing page.\n'+C.filter(c=>on[c[0]]).map(c=>'- '+c[2]).join('\n'):'Make a modern landing page for my app.');
   const acc=on.acc,h=on.hier,p=on.prom;
   const bg=acc?'background:#FFFDF7;border:2.5px solid #14261D;color:#14261D;':'background:linear-gradient(135deg,#6D4AFF,#A63AE0);color:#fff;';
   const sh=on.deco?(acc?'box-shadow:5px 5px 0 #14261D;':''):'box-shadow:0 16px 36px rgba(109,74,255,.45);';
   const al=h?'text-align:left;':'text-align:center;';
   const head=p?'Know what sold today, in one tap.':'Welcome to the Future!';
   const hs=h?"font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;line-height:1.02;letter-spacing:-.02em;":'font-family:Arial,sans-serif;font-weight:700;font-size:17px;line-height:1.4;';
   const bs=h?'font-size:13px;'+(acc?'color:#4A5A4F;':'opacity:.9;'):'font-size:16px;font-family:Arial,sans-serif;';
   const btn=acc?'background:#E8722C;border:2.5px solid #14261D;color:#14261D;':'background:#FF7AE0;color:#1E0B3A;';
   const flow=on.steps?['Open','Record','Done']:['Open','Menu','Sales','New','Item','Amount','Save'];
   out(el,'pv',`<div class="cd" style="${bg}${sh}${al}">${on.deco?'':`<div style="margin-bottom:8px">${SPARK(acc?'#E8722C':'#fff')}</div>`}${on.aud?`<div style="font:700 10px 'Space Mono',monospace;letter-spacing:2px;margin-bottom:6px">FOR MARKET TRADERS</div>`:''}<div style="${hs}">${head}</div><div style="${bs}margin-top:8px">${p?'Record a sale by voice. See your profit by evening.':'The all-in-one platform for everything you do.'}</div><div style="${btn}border-radius:10px;padding:10px;font-weight:700;margin-top:14px;text-align:center">${p?'Record my first sale':'Get Started Now!!'}</div></div><div class="flow">${flow.join(' &rarr; ')}<br><span class="pill ${on.steps?'ok':'bad'}">${flow.length} steps</span></div>`);
  }
  el.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b||!el.contains(b))return;on[b.dataset.k]=!on[b.dataset.k];render()});
  render();
 }}
];

/* =====================================================================
   COLOUR
   ===================================================================== */
window.VIZ['colour']=[
{id:'colour-hsl',title:'Hue, saturation, lightness',
 terms:['Hue','Saturation','Lightness / value'],
 intro:'Every colour on a screen can be described with three dials. Hue is which colour. Saturation is how intense. Lightness is how light or dark.',
 try:'Drag each slider and read the plain-English name of the colour you made. Then switch on “Value only”.',
 html:`<div class="vz1 vz-colour-hsl">${KIT}<style>
.vz-colour-hsl .swc{height:150px;border-radius:14px;border:2.5px solid #14261D;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;box-shadow:4px 4px 0 #14261D}
.vz-colour-hsl .swc b{font-family:'Bricolage Grotesque',sans-serif;font-size:22px;line-height:1.1}
.vz-colour-hsl .swc span{font:700 12px 'Space Mono',monospace}
.vz-colour-hsl input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;height:40px}
.vz-colour-hsl input[type=range]::-webkit-slider-runnable-track{height:16px;border-radius:99px;border:2px solid #14261D;background:var(--tr)}
.vz-colour-hsl input[type=range]::-moz-range-track{height:12px;border-radius:99px;border:2px solid #14261D;background:var(--tr)}
.vz-colour-hsl input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#FFFDF7;border:2.5px solid #14261D;margin-top:-8px;box-shadow:2px 2px 0 #14261D}
.vz-colour-hsl input[type=range]::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#FFFDF7;border:2.5px solid #14261D}
.vz-colour-hsl .ramp{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.vz-colour-hsl .ramp div{height:54px;border-radius:10px;border:2px solid #14261D;display:flex;align-items:flex-end;padding:4px 6px;font:700 11px 'Space Mono',monospace}
.vz-colour-hsl .gray .swc,.vz-colour-hsl .gray .ramp div{filter:grayscale(1)}
.vz-colour-hsl .d{font-size:13px;color:#4A5A4F;margin:-4px 0 6px}
</style>
<div class="g2">
 <div style="display:grid;gap:12px;align-content:start" class="vis"><div class="swc" data-o="sw"></div><div><div class="lab" style="margin-bottom:6px">Same hue, five lightness steps</div><div class="ramp" data-o="ramp"></div></div></div>
 <div>
  <label class="sl"><span class="h">Hue <span class="v" data-o="hv"></span></span><input type="range" name="h" min="0" max="360" value="24"></label><p class="d">Which colour family. It goes round the colour wheel: 0 red, 120 green, 240 blue, back to red at 360.</p>
  <label class="sl"><span class="h">Saturation <span class="v" data-o="sv"></span></span><input type="range" name="s" min="0" max="100" value="80"></label><p class="d">How intense. 0% is grey with no colour left. 100% is as vivid as it gets.</p>
  <label class="sl"><span class="h">Lightness <span class="v" data-o="lv"></span></span><input type="range" name="l" min="0" max="100" value="54"></label><p class="d">How light or dark, also called value. 0% is black, 100% is white.</p>
  <div class="row"><div class="seg" data-g="pre"><button data-v="24,80,54">Terracotta</button><button data-v="150,31,11">Forest</button><button data-v="44,41,93">Cream</button><button data-v="255,100,64">AI purple</button></div></div>
 </div>
</div>
<div class="row"><button class="tb" data-act="gray" aria-pressed="false">Value only (remove colour)</button></div>
<div class="note" aria-live="polite" data-o="say"></div>
</div>`,
 init(el){if(once(el))return;
  const ip={h:$(el,'[name=h]'),s:$(el,'[name=s]'),l:$(el,'[name=l]')};let gray=false;
  const hueName=h=>h<15||h>=340?'red':h<45?'orange':h<68?'yellow':h<160?'green':h<195?'teal':h<255?'blue':h<290?'purple':'pink';
  const satW=s=>s<8?'grey':s<30?'muted':s<65?'rich':'vivid';
  const litW=l=>l<12?'near-black':l<35?'dark':l<65?'mid':l<88?'light':'near-white';
  function draw(){const h=+ip.h.value,s=+ip.s.value,l=+ip.l.value,hex=hsl2hex(h,s,l),t=onText(hex);
   ip.h.style.setProperty('--tr',`linear-gradient(90deg,${[0,60,120,180,240,300,360].map(x=>`hsl(${x},${s}%,${Math.min(Math.max(l,25),75)}%)`).join(',')})`);
   ip.s.style.setProperty('--tr',`linear-gradient(90deg,hsl(${h},0%,${l}%),hsl(${h},100%,${l}%))`);
   ip.l.style.setProperty('--tr',`linear-gradient(90deg,#000,hsl(${h},${s}%,50%),#fff)`);
   out(el,'hv',h+'°');out(el,'sv',s+'%');out(el,'lv',l+'%');
   const name=s<8?`${litW(l)} grey`:`${litW(l)}, ${satW(s)} ${hueName(h)}`;
   const sw=$(el,'[data-o=sw]');sw.style.background=hex;sw.style.color=t;sw.innerHTML=`<b>${name[0].toUpperCase()+name.slice(1)}</b><span>${hex} · hsl(${h}, ${s}%, ${l}%)</span>`;
   out(el,'ramp',[15,35,55,75,92].map(L=>{const c=hsl2hex(h,s,L);return `<div style="background:${c};color:${onText(c)}">${L}%</div>`}).join(''));
   out(el,'say',gray?`<b>Value only.</b> With the colour taken away, all that is left is lightness. This is what the eye uses first to judge what is important. If two colours look the same here, they will fight for attention, whatever their hue.`:`<b>${name[0].toUpperCase()+name.slice(1)}.</b> Hue picked the family (${hueName(h)}). Saturation set the intensity (${satW(s)}). Lightness set how light it is (${litW(l)}). Most good interface colours are calmer than you expect: lower saturation, and very light or very dark.`)}
  ['h','s','l'].forEach(k=>slide(el,k,draw));
  seg(el,'pre',v=>{const a=v.split(',');ip.h.value=a[0];ip.s.value=a[1];ip.l.value=a[2];draw()});
  $(el,'[data-act=gray]').addEventListener('click',e=>{gray=!gray;e.currentTarget.setAttribute('aria-pressed',String(gray));el.firstElementChild.classList.toggle('gray',gray);el.querySelector('.vz-colour-hsl').classList.toggle('gray',gray);draw()});
  draw();
 }},
{id:'colour-ramp',title:'Tints, shades, neutrals and gradients',
 terms:['Tint / shade','Neutral','Tinted neutral','Warm / cool','Gradient'],
 intro:'One accent colour can grow into a whole family. Mix it with white for tints, with black for shades. Mix a little of it into grey and you get a neutral that feels designed.',
 try:'Pick a base colour, tap any step of the ramp, then drag the tint slider under the greys.',
 html:`<div class="vz1 vz-colour-ramp">${KIT}<style>
.vz-colour-ramp .rp{display:grid;grid-template-columns:repeat(9,1fr);border:2.5px solid #14261D;border-radius:12px;overflow:hidden}
.vz-colour-ramp .rp button{border:0;border-right:1.5px solid rgba(20,38,29,.25);height:76px;padding:4px 0 6px;font:700 10px 'Space Mono',monospace;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;min-width:0}
.vz-colour-ramp .rp button:last-child{border-right:0}
.vz-colour-ramp .rp button[aria-pressed=true]{box-shadow:inset 0 0 0 3px #14261D,inset 0 0 0 5px #FFFDF7}
.vz-colour-ramp .nt{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:8px}
.vz-colour-ramp .nt div{border:2px solid #14261D;border-radius:12px;padding:12px;min-height:96px;display:flex;flex-direction:column;justify-content:space-between}
.vz-colour-ramp .nt b{font-family:'Bricolage Grotesque',sans-serif;font-size:15px}
.vz-colour-ramp .nt span{font:700 11px 'Space Mono',monospace}
.vz-colour-ramp .gb{height:84px;border-radius:12px;border:2.5px solid #14261D;display:flex;align-items:center;padding:0 18px;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px}
</style>
<div class="row"><span class="lab">Base</span><div class="seg" data-g="base"><button data-v="#E8722C" aria-pressed="true">Terracotta</button><button data-v="#2F7A4F">Green</button><button data-v="#2563EB">Cobalt</button><button data-v="#7C3A6B">Plum</button></div></div>
<div><div class="row" style="justify-content:space-between;margin-bottom:6px"><span class="lab">Tints (+ white)</span><span class="lab">Shades (+ black)</span></div><div class="rp" data-o="ramp"></div></div>
<div class="note" aria-live="polite" data-o="step"></div>
<div class="stg paper"><div class="lab" style="margin-bottom:8px">Four neutrals</div><div class="nt" data-o="nt"></div>
<label class="sl" style="margin-top:8px"><span class="h">Tint the last grey toward your base <span class="v" data-o="tv"></span></span><input type="range" name="tint" min="0" max="16" value="8"></label>
<p class="sm">Warm leans red-yellow and feels human. Cool leans blue and feels precise. Pure grey leans nowhere, which is why it reads as a default.</p></div>
<div class="stg paper"><div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="lab">Gradient</span><div class="seg" data-g="gr"><button data-v="ramp" aria-pressed="true">From your ramp</button><button data-v="rain">Rainbow</button></div></div><div class="gb" data-o="gb">Market day sale</div><p class="sm" data-o="gs" style="margin-top:8px"></p></div>
</div>`,
 init(el){if(once(el))return;
  let base='#E8722C',pick=5;
  const steps=[['50',.88,1],['100',.74,1],['200',.55,1],['300',.36,1],['400',.17,1],['500',0,0],['600',.2,-1],['700',.42,-1],['800',.62,-1]];
  const col=s=>s[2]>0?mix(base,'#FFFFFF',s[1]):s[2]<0?mix(base,'#000000',s[1]):base.toUpperCase();
  function draw(){
   out(el,'ramp',steps.map((s,i)=>{const c=col(s);return `<button style="background:${c};color:${onText(c)}" data-i="${i}" aria-pressed="${i===pick}" aria-label="Step ${s[0]}">${s[0]}</button>`}).join(''));
   const s=steps[pick],c=col(s);
   out(el,'step',s[2]>0?`<b>Tint ${s[0]}.</b> The base mixed with ${Math.round(s[1]*100)}% white: <span class="v">${c}</span>. Light tints make soft backgrounds, selected rows and quiet badges.`:s[2]<0?`<b>Shade ${s[0]}.</b> The base mixed with ${Math.round(s[1]*100)}% black: <span class="v">${c}</span>. Deep shades make readable text, borders and pressed states in the same family.`:`<b>Base 500.</b> <span class="v">${c}</span>. Your accent itself. Use it on the one thing that needs action.`);
   const t=+$(el,'[name=tint]').value/100,tn=mix('#EBEBEB',base,t);out(el,'tv',Math.round(t*100)+'%');
   out(el,'nt',[['Pure grey','#EBEBEB','#222222'],['Warm','#EFE9DF','#2A241C'],['Cool','#E6EAF0','#1C2430'],['Tinted neutral',tn,mix('#1E1E1E',base,.18)]].map(n=>`<div style="background:${n[1]};color:${n[2]}"><b>${n[0]}</b><span>${n[1].toUpperCase()}</span></div>`).join(''));
   const g=$(el,'[data-g=gr] [aria-pressed=true]').dataset.v,gb=$(el,'[data-o=gb]');
   if(g==='ramp'){gb.style.background=`linear-gradient(90deg,${col(steps[1])},${col(steps[3])})`;gb.style.color=mix(base,'#000000',.62);out(el,'gs','Two neighbours from the same ramp. A gentle shift that feels like light, not decoration. Rare and quiet is when a gradient works.')}
   else{gb.style.background='linear-gradient(90deg,#EC4899,#8B5CF6,#3B82F6)';gb.style.color='#fff';out(el,'gs','Three unrelated hues blended together. This is the AI default. When it is everywhere, it means nothing.')}
  }
  $(el,'[data-o=ramp]').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;pick=+b.dataset.i;draw()});
  seg(el,'base',v=>{base=v;draw()});seg(el,'gr',draw);slide(el,'tint',draw);draw();
 }},
{id:'colour-roles',title:'Colour roles and 60-30-10',
 terms:['Palette','Role / semantic colour','Accent','60-30-10','Neutral'],
 intro:'A palette is not a list of nice colours. It is a list of jobs. Each colour below has a role, and the screen is built only from those roles.',
 try:'Tap a role chip, or tap any part of the screen to see its role. Then drag “Accent on” and watch the balance bar.',
 html:`<div class="vz1 vz-colour-roles">${KIT}<style>
.vz-colour-roles .chips{display:flex;flex-wrap:wrap;gap:6px}
.vz-colour-roles .chips button{display:flex;gap:6px;align-items:center;min-height:40px;border:2px solid #14261D;border-radius:99px;background:#FFFDF7;padding:4px 12px 4px 5px;font:600 13px 'Instrument Sans',sans-serif;color:#14261D;cursor:pointer}
.vz-colour-roles .chips button[aria-pressed=true]{background:#14261D;color:#D6E59A}
.vz-colour-roles .chips i{width:24px;height:24px;border-radius:50%;border:2px solid #14261D;flex:none}
.vz-colour-roles .ui{background:var(--bg);border:2.5px solid #14261D;border-radius:16px;padding:14px;display:grid;gap:10px;color:var(--tx)}
.vz-colour-roles .sf{background:var(--sf);border:2px solid #14261D;border-radius:12px;padding:12px}
.vz-colour-roles [data-r]{cursor:pointer}
.vz-colour-roles .big{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1.1;border-radius:6px;padding:0 4px;margin:0 -4px}
.vz-colour-roles .mu{color:var(--mu);font-size:13px}
.vz-colour-roles .bt{border:2px solid #14261D;border-radius:10px;padding:8px 12px;font-weight:700;font-size:14px;background:var(--sf);color:#14261D}
.vz-colour-roles .bt.on{background:var(--ac)}
.vz-colour-roles .st{display:inline-flex;gap:4px;align-items:center;border:2px solid #14261D;border-radius:99px;padding:2px 9px 2px 6px;font-size:12px;font-weight:700}
.vz-colour-roles .flag{outline:3px dashed #14261D;outline-offset:3px}
.vz-colour-roles .rbar{display:flex;height:30px;border:2.5px solid #14261D;border-radius:10px;overflow:hidden}
.vz-colour-roles .rbar i{display:block;height:100%;transition:width .3s}
.vz-colour-roles .hd{display:flex;justify-content:space-between;align-items:center;border-radius:10px;padding:8px 10px;margin:-4px -4px 0;border:2px solid transparent}
.vz-colour-roles .hd.on{background:var(--ac);border-color:#14261D}
@media (prefers-reduced-motion:reduce){.vz-colour-roles .rbar i{transition:none}}
</style>
<div><div class="lab" style="margin-bottom:6px">The palette, by role</div><div class="chips" data-o="chips"></div></div>
<div class="ui" style="--bg:#F4F0E5;--sf:#FFFDF7;--tx:#14261D;--mu:#4A5A4F;--ac:#E8722C">
 <div class="hd" data-r="bg" data-a="3"><b data-r="text" style="font-family:'Bricolage Grotesque',sans-serif">Shop today</b><span class="mu" data-r="muted">Tue 14 Oct</span></div>
 <div class="sf" data-r="surface"><div class="mu" data-r="muted">Sales so far</div><div class="big" data-r="text" data-a="4">&#8358;84,200</div>
  <div class="row" style="margin-top:8px"><span class="st" data-r="success" style="background:#D6E59A"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3" fill="none" stroke="currentColor" stroke-width="2"/></svg>Paid</span><span class="st" data-r="warning" style="background:#F5C76B"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1l5 10H1z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 5v2.5M6 9v.3" stroke="currentColor" stroke-width="1.6"/></svg>Low stock</span><span class="st" data-r="danger" style="background:#F6D7E8;color:#9B2C1F"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="2"/></svg>Failed</span></div></div>
 <div class="row"><span class="bt" data-r="accent" data-a="1">Review 3 orders</span><span class="bt" data-r="surface" data-a="2">History</span><span class="bt" data-r="surface" data-a="5">Export</span></div>
</div>
<label class="sl"><span class="h">Accent on <span class="v" data-o="av"></span></span><input type="range" name="acc" min="1" max="5" value="1"></label>
<div><div class="rbar" data-o="bar"></div><p class="sm" data-o="bs" style="margin-top:6px"></p></div>
<div class="note" aria-live="polite" data-o="say"></div>
</div>`,
 init(el){if(once(el))return;
  const R={bg:['Background','#F4F0E5','The big quiet field everything sits on. A neutral: cream, not pure grey.'],surface:['Surface','#FFFDF7','Cards and panels that sit on the background. Slightly lighter, so they lift.'],text:['Text','#14261D','The main ink. A near-black tinted green, so it belongs to the palette.'],muted:['Muted text','#4A5A4F','Labels and secondary lines. Still passes 4.5:1, just quieter.'],accent:['Accent','#E8722C','The one loud colour. It marks the main action, and nothing else.'],success:['Success','#D6E59A','Means “done, all good”. Always with a word and icon, never colour alone.'],warning:['Warning','#F5C76B','Means “needs attention soon”. Used only for that.'],danger:['Danger','#F6D7E8','Means “something failed”. Deep red text on a soft pink fill.']};
  let role='accent';const app=$(el,'.ui');
  out(el,'chips',Object.keys(R).map(k=>`<button data-k="${k}" aria-pressed="false"><i style="background:${R[k][1]}"></i>${R[k][0]}</button>`).join(''));
  function bar(){const ar=app.getBoundingClientRect(),tot=ar.width*ar.height||1;let sf=0,ac=0;
   $$(app,'.sf,.bt').forEach(n=>{const r=n.getBoundingClientRect();const a=r.width*r.height;if(n.classList.contains('on'))ac+=a;else sf+=a});
   $$(app,'.hd.on,.big.on').forEach(n=>{const r=n.getBoundingClientRect();ac+=r.width*r.height});
   const p=x=>Math.round(x/tot*100),A=p(ac),S=p(sf)-($(app,'.big.on')?A:0)*0,B=Math.max(0,100-A-p(sf));
   out(el,'bar',`<i style="width:${B}%;background:#F4F0E5"></i><i style="width:${p(sf)}%;background:#FFFDF7;border-left:2px solid #14261D"></i><i style="width:${A}%;background:#E8722C;border-left:2px solid #14261D"></i>`);
   out(el,'bs',`Background ${B}% · Surface ${p(sf)}% · Accent ${A}%. The 60-30-10 guide: about 60% neutral, 30% secondary, 10% or less accent.`)}
  function draw(){const n=+$(el,'[name=acc]').value;
   $$(app,'[data-a]').forEach(x=>{const on=+x.dataset.a<=n;x.classList.toggle('on',on);if(x.classList.contains('big'))x.style.background=on?'#E8722C':''});
   out(el,'av',n===1?'1 thing':n+' things');
   $$(el,'[data-k]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===role)));
   $$(app,'[data-r]').forEach(x=>x.classList.toggle('flag',x.dataset.r===role&&!(role==='bg')));
   app.classList.toggle('flag',role==='bg');
   const r=R[role];
   out(el,'say',`<b>${r[0]}</b> <span class="v">${r[1]}</span> ${r[2]} ${n>2?'<br><span class="pill bad">Accent on '+n+' things</span> Now the accent is everywhere, so it points nowhere. Slide it back to 1.':n===2?'<br><span class="pill mid">Accent on 2 things</span> Already the eye has to choose.':''}`);
   bar()}
  el.addEventListener('click',e=>{const c=e.target.closest('[data-k]');if(c&&el.contains(c)){role=c.dataset.k;draw();return}
   const t=e.target.closest('[data-r]');if(t&&app.contains(t)){role=t.dataset.r;draw()}});
  slide(el,'acc',draw);watch(el,bar);draw();
 }},
{id:'colour-contrast',title:'Contrast checker',
 terms:['Contrast ratio'],
 intro:'Contrast ratio measures how much lighter one colour is than the other, from 1:1 (invisible) to 21:1 (black on white). Body text needs at least 4.5:1. Large text needs 3:1.',
 try:'Pick a text colour and a background. If it fails, press “Fix it for me” and watch the text darken or lighten until it passes.',
 html:`<div class="vz1 vz-colour-contrast">${KIT}<style>
.vz-colour-contrast .sws{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.vz-colour-contrast .sws button{width:40px;height:40px;border-radius:50%;border:2.5px solid #14261D;padding:0;cursor:pointer}
.vz-colour-contrast .sws button[aria-pressed=true]{outline:3px solid #14261D;outline-offset:2px}
.vz-colour-contrast .sws input{width:44px;height:44px;border:2px solid #14261D;border-radius:10px;padding:2px;background:#FFFDF7}
.vz-colour-contrast .pvw{border:2.5px solid #14261D;border-radius:14px;padding:20px;box-shadow:4px 4px 0 #14261D}
.vz-colour-contrast .pvw .lg{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;line-height:1.1}
.vz-colour-contrast .rt{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:44px;line-height:1}
.vz-colour-contrast .bd{display:grid;gap:6px}
</style>
<div class="g2">
 <div style="display:grid;gap:12px;align-content:start">
  <div><div class="lab" style="margin-bottom:6px">Text colour</div><div class="sws" data-g="fg"></div></div>
  <div><div class="lab" style="margin-bottom:6px">Background</div><div class="sws" data-g="bg"></div></div>
  <div class="pvw" data-o="pv"><div class="lg">Order confirmed</div><div style="font-size:16px;margin-top:6px">Your rice will arrive on Thursday. Pay when it reaches you.</div></div>
 </div>
 <div style="display:grid;gap:12px;align-content:start">
  <div><div class="rt" data-o="rt"></div><p class="sm" data-o="lm" style="margin-top:6px"></p></div>
  <div class="bd" data-o="bd"></div>
  <div class="row"><button class="tb pri" data-act="fix">Fix it for me</button></div>
  <div class="note" aria-live="polite" data-o="say"></div>
 </div>
</div>
</div>`,
 init(el){if(once(el))return;
  const FG=['#14261D','#4A5A4F','#FFFFFF','#8C8C8C','#AD4F16','#E8722C','#D6E59A'],BG=['#FFFDF7','#F4F0E5','#FFFFFF','#E8722C','#F2B705','#14261D','#2563EB'];
  let fg='#FFFFFF',bg='#E8722C';
  const sw=(list,k)=>list.map(c=>`<button data-v="${c}" style="background:${c}" aria-label="${c}" aria-pressed="false"></button>`).join('')+`<input type="color" data-k="${k}" aria-label="Any ${k==='fg'?'text':'background'} colour">`;
  $(el,'[data-g=fg]').innerHTML=sw(FG,'fg');$(el,'[data-g=bg]').innerHTML=sw(BG,'bg');
  function draw(note){const r=ratio(fg,bg),rr=Math.floor(r*100)/100;
   const pv=$(el,'[data-o=pv]');pv.style.background=bg;pv.style.color=fg;
   $$(el,'[data-g=fg] button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===fg)));$$(el,'[data-g=bg] button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===bg)));
   $(el,'[data-k=fg]').value=fg.toLowerCase();$(el,'[data-k=bg]').value=bg.toLowerCase();
   out(el,'rt',rr.toFixed(2)+' : 1');
   out(el,'lm',`Text brightness ${lum(fg).toFixed(3)} · background ${lum(bg).toFixed(3)}. Ratio = (lighter + 0.05) ÷ (darker + 0.05).`);
   const B=(n,lab,need)=>`<div style="display:flex;gap:8px;align-items:baseline"><span class="pill ${r>=need?'ok':'bad'}" style="flex:none">${r>=need?'Pass':'Fail'}</span><span>${lab} <span class="sm">needs ${need}:1</span></span></div>`;
   out(el,'bd',B(0,'Body text (AA)',4.5)+B(0,'Large or bold text, icons (AA)',3)+B(0,'Body text (AAA, best)',7));
   out(el,'say',note||(r>=4.5?`<b>Readable.</b> ${fg} on ${bg} clears 4.5:1, so it is safe for body text.`:r>=3?`<b>Almost.</b> This passes for big headlines but fails for body text. It may look fine on your bright laptop. On a cheap phone in the sun, it will not.`:`<b>Fails.</b> Too close in lightness. Remember: contrast is about lightness, not hue. Two very different colours can still fail.`))}
  el.addEventListener('click',e=>{const b=e.target.closest('.sws button');if(b&&el.contains(b)){if(b.closest('[data-g=fg]'))fg=b.dataset.v;else bg=b.dataset.v;draw();return}
   if(e.target.closest('[data-act=fix]')){if(ratio(fg,bg)>=4.5){draw('<b>Already passes.</b> Nothing to fix.');return}
    const[h,s,l0]=hex2hsl(fg);const dir=lum(bg)>.18?-1:1;let l=l0,c=fg;while(ratio(c,bg)<4.5&&l>0&&l<100){l+=dir;c=hsl2hex(h,s,l)}
    const from=fg;fg=c;draw(`<b>Fixed.</b> Same hue, lightness moved from ${l0}% to ${l}% (${from} to ${c}). Now ${ratio(fg,bg).toFixed(2)}:1. This is the trick: keep the colour family, change only the lightness.`)}});
  $$(el,'input[type=color]').forEach(i=>i.addEventListener('input',()=>{if(i.dataset.k==='fg')fg=i.value.toUpperCase();else bg=i.value.toUpperCase();draw()}));
  draw();
 }}
];

/* =====================================================================
   TYPE
   ===================================================================== */
window.VIZ['type']=[
{id:'type-anatomy',title:'Anatomy of type',
 terms:['Typeface / font','Serif / sans-serif','x-height'],
 intro:'Every letter sits on invisible lines. Designers use these lines to compare typefaces and to space text. Tap a name to see where it lives.',
 try:'Tap each part. Then switch typeface and watch the lines move, because every typeface draws them differently.',
 html:`<div class="vz1 vz-type-anatomy">${KIT}<style>
.vz-type-anatomy .spec{padding:8px 16px;min-height:160px}
.vz-type-anatomy .word{position:relative;z-index:1;text-align:center;white-space:nowrap;color:#14261D}
.vz-type-anatomy .ln{position:absolute;left:0;right:0;height:0;border-top:1.5px dashed rgba(20,38,29,.35);z-index:0;pointer-events:none}
.vz-type-anatomy .ln.on{border-top:2.5px solid #E8722C;z-index:2}
.vz-type-anatomy .tag{position:absolute;right:8px;font:700 11px 'Space Mono',monospace;background:#E8722C;color:#14261D;border:2px solid #14261D;border-radius:6px;padding:1px 6px;z-index:3;white-space:nowrap}
.vz-type-anatomy .ctr{position:absolute;border-radius:50%;background:#E8722C;z-index:0}
.vz-type-anatomy .ring{position:absolute;border-radius:50%;border:3px solid #E8722C;z-index:2;pointer-events:none}
.vz-type-anatomy .bl{display:inline-block;width:0;height:0;vertical-align:baseline}
.vz-type-anatomy .parts button{min-height:40px}
</style>
<div class="row"><span class="lab">Typeface</span><div class="seg" data-g="face"><button data-v="Bricolage Grotesque" data-k="sans" aria-pressed="true">Bricolage</button><button data-v="Inter" data-k="sans">Inter</button><button data-v="Fraunces" data-k="serif">Fraunces</button><button data-v="Playfair Display" data-k="serif">Playfair</button></div></div>
<div class="row"><span class="lab">Font</span><div class="seg" data-g="w"><button data-v="400" aria-pressed="true">Regular</button><button data-v="800">Bold</button></div></div>
<div class="stg paper spec"><div class="word"><span class="H">H</span><span class="o">o</span>bgy<span class="bl"></span></div><div data-o="marks"></div></div>
<div class="seg parts" data-g="part"><button data-v="Baseline">Baseline</button><button data-v="x-height" aria-pressed="true">x-height</button><button data-v="Cap height">Cap height</button><button data-v="Ascender">Ascender</button><button data-v="Descender">Descender</button><button data-v="Counter">Counter</button><button data-v="Serif">Serif</button></div>
<div class="note" aria-live="polite" data-o="say"></div>
<p class="sm" data-o="id"></p>
</div>`,
 init(el){if(once(el))return;
  let fam='Bricolage Grotesque',kind='sans',wt=400,part='x-height',M={};
  const st=$(el,'.spec'),wd=$(el,'.word'),cv=document.createElement('canvas').getContext('2d');
  const stack=f=>`'${f}',${kind==='serif'?'Georgia,serif':'system-ui,sans-serif'}`;
  const SERIF=`<svg width="190" height="78" viewBox="0 0 190 78" role="img" aria-label="A serif letter I with feet, and a sans-serif I without"><rect x="34" y="10" width="14" height="52" fill="#14261D"/><path d="M16 6h50v8H16zM16 58h50v8H16z" fill="#E8722C" stroke="#14261D" stroke-width="2"/><rect x="128" y="6" width="14" height="60" fill="#14261D"/><text x="41" y="77" font-size="11" font-family="Space Mono,monospace" font-weight="700" text-anchor="middle" fill="#14261D">serif</text><text x="135" y="77" font-size="11" font-family="Space Mono,monospace" font-weight="700" text-anchor="middle" fill="#14261D">sans-serif</text></svg>`;
  const D={'Baseline':'The invisible line letters sit on. Every letter in a line shares it, which is what makes text look steady.',
   'x-height':()=>`The height of lowercase letters like x, o and a. In this typeface it is <b>${M.r}%</b> of the cap height. A bigger x-height looks bigger and reads better at small sizes, even at the same font size.`,
   'Cap height':'The height of capital letters, like H. Compare it with the x-height: the gap between them changes the whole feel of a typeface.',
   'Ascender':'The part of b, d, h and k that rises above the x-height. Often a touch taller than the capitals.',
   'Descender':'The tail of g, p and y that drops below the baseline. Tight line heights must leave room for it, or tails crash into the line below.',
   'Counter':'The enclosed space inside o, b and g. Open counters keep small text clear. Heavy weights shrink them, which is why bold text blurs at small sizes.',
   'Serif':()=>`The small feet at the ends of strokes. Typefaces with them are <b>serif</b>. Without them, <b>sans-serif</b> (“sans” means without). ${kind==='serif'?'This typeface is serif: look at the feet on the H.':'This typeface is sans-serif. Switch to Fraunces or Playfair to see feet appear.'}<div style="margin-top:8px">${SERIF}</div>`};
  function draw(){
   const W=st.clientWidth-36;if(W<=0)return;const fs=Math.round(Math.max(64,Math.min(150,W*.3)));
   wd.style.font=`${wt} ${fs}px ${stack(fam)}`;wd.style.lineHeight='1.45';
   cv.font=`${wt} ${fs}px ${stack(fam)}`;const m=t=>cv.measureText(t);
   const xh=m('x').actualBoundingBoxAscent,cap=m('H').actualBoundingBoxAscent,asc=Math.max(m('b').actualBoundingBoxAscent,m('h').actualBoundingBoxAscent),desc=Math.max(m('g').actualBoundingBoxDescent,m('y').actualBoundingBoxDescent);
   const sr=st.getBoundingClientRect(),ox=sr.left+st.clientLeft,oy=sr.top+st.clientTop;
   const base=$(wd,'.bl').getBoundingClientRect().bottom-oy;
   M.r=Math.round(xh/cap*100);
   const L={'Baseline':base,'x-height':base-xh,'Cap height':base-cap,'Ascender':base-asc,'Descender':base+desc};
   let h='';for(const k in L){const on=k===part;h+=`<div class="ln${on?' on':''}" style="top:${L[k]}px"></div>`;if(on)h+=`<div class="tag" style="top:${k==='Descender'||k==='Baseline'?L[k]+5:L[k]-25}px">${k}</div>`}
   if(part==='Counter'){const o=$(wd,'.o').getBoundingClientRect(),d=xh*(wt>600?.32:.42);h+=`<div class="ctr" style="width:${d}px;height:${d}px;left:${(o.left+o.right)/2-ox-d/2}px;top:${base-xh/2-d/2}px"></div>`}
   if(part==='Serif'){const H=$(wd,'.H').getBoundingClientRect(),d=fs*.34;h+=`<div class="ring" style="width:${d}px;height:${d}px;left:${H.left-ox+fs*.1-d/2}px;top:${base-d/2}px"></div><div class="ring" style="width:${d}px;height:${d}px;left:${H.left-ox+fs*.1-d/2}px;top:${base-cap-d/2}px"></div>`}
   out(el,'marks',h);
   const d=D[part];out(el,'say',`<b>${part}.</b> `+(typeof d==='function'?d():d));
   out(el,'id',`Typeface: <b>${fam}</b> (the design). Font: <b>${fam} ${wt>600?'Bold':'Regular'}</b> (one style of it). ${kind==='serif'?'Serif':'Sans-serif'}. x-height is ${M.r}% of cap height.`)}
  function redraw(){draw();if(document.fonts&&document.fonts.load)document.fonts.load(`${wt} 40px '${fam}'`).then(()=>{if(el.isConnected)draw()}).catch(()=>{})}
  seg(el,'face',(v,b)=>{fam=v;kind=b.dataset.k;redraw()});seg(el,'w',v=>{wt=+v;redraw()});seg(el,'part',v=>{part=v;draw()});
  watch(el,draw);redraw();
 }},
{id:'type-spacing',title:'Spacing lab',
 terms:['Tracking / letter-spacing','Kerning','Leading / line height','Measure','Widow / orphan'],
 intro:'Four kinds of space decide whether text feels calm or clumsy: between all letters, between one pair, between lines, and how long each line runs.',
 try:'Drag every slider until each verdict turns green. Then make the last line leave one lonely word, and fix it.',
 html:`<div class="vz1 vz-type-spacing">${KIT}<style>
.vz-type-spacing .tk-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:40px;line-height:1.05;margin:4px 0 10px;white-space:nowrap;overflow:hidden}
.vz-type-spacing .tk-l{font:700 12px 'Instrument Sans',sans-serif;text-transform:uppercase;color:#14261D;margin-bottom:6px;white-space:nowrap}
.vz-type-spacing .kp{font-family:Inter,'Bricolage Grotesque',sans-serif;font-weight:700;font-size:96px;line-height:1.05;text-align:center}
.vz-type-spacing .kw{font-family:Inter,sans-serif;font-weight:700;font-size:28px;text-align:center;letter-spacing:0}
.vz-type-spacing .ld{font-size:16px;color:#14261D}
.vz-type-spacing .ms{font-size:15px;line-height:1.5;border-right:2.5px solid #E8722C;padding-right:4px}
.vz-type-spacing .stg>.lab{margin-bottom:4px}
.vz-type-spacing .g2{grid-template-columns:repeat(auto-fit,minmax(min(290px,100%),1fr))}
.vz-type-spacing .wide{grid-column:1/-1}
.vz-type-spacing .ld,.vz-type-spacing .ms{margin-bottom:12px}
</style>
<div class="g2">
 <div class="stg paper"><div class="lab">1 · Tracking</div><div class="tk-h" data-o="tkh0">Market day</div><div class="tk-l">New orders · 3 waiting</div>
  <label class="sl"><span class="h">Letter-spacing <span class="v" data-o="tkv"></span></span><input type="range" name="tk" min="-0.08" max="0.3" step="0.01" value="0.04"></label>
  <div class="row"><span class="pill" data-o="tkh"></span><span class="pill" data-o="tkl"></span></div>
  <p class="sm" style="margin-top:8px">Tracking changes the space between <b>every</b> letter. Big headlines want a little less. Small all-caps labels want more. One setting cannot please both, so set them separately.</p></div>
 <div class="stg paper"><div class="row" style="justify-content:space-between"><span class="lab">2 · Kerning</span><div class="seg" data-g="pair"><button data-v="AV" aria-pressed="true">AV</button><button data-v="To">To</button><button data-v="Wa">Wa</button><button data-v="LY">LY</button></div></div>
  <div class="kp" data-o="kp">AV</div><div class="kw" data-o="kw">WAVY TOAST</div>
  <div class="row" style="margin:6px 0"><div class="seg" data-g="kern"><button data-v="normal" aria-pressed="true">Kerning on</button><button data-v="none">Kerning off</button></div></div>
  <label class="sl"><span class="h">Nudge this one pair <span class="v" data-o="kv"></span></span><input type="range" name="kn" min="-0.2" max="0.2" step="0.01" value="0"></label>
  <p class="sm">Kerning is the space between <b>one specific pair</b>. A and V lean away from each other and leave a hole. Good fonts tuck them closer. Turn kerning off and watch the holes open.</p></div>
 <div class="stg paper"><div class="lab">3 · Leading</div>
  <div class="ld" data-o="ld">Snap a photo of any receipt. We read it, sort it and add it to today’s total. At the end of the month you get one clear page.</div>
  <label class="sl"><span class="h">Line height <span class="v" data-o="lv"></span></span><input type="range" name="lh" min="0.9" max="2.2" step="0.05" value="1.1"></label>
  <div class="row"><span class="pill" data-o="lp"></span></div>
  <p class="sm" style="margin-top:8px">Leading (line height in CSS) is the space between lines. Each green band is one line’s box. Body text reads best at 1.4 to 1.6. Big headlines want about 1.0 to 1.15.</p></div>
 <div class="stg paper wide"><div class="lab">4 · Measure and widows</div>
  <div class="ms" data-o="ms"></div>
  <label class="sl"><span class="h">Line length <span class="v" data-o="mv"></span></span><input type="range" name="mw" min="140" max="600" step="2" value="560"></label>
  <div class="row"><span class="pill" data-o="mp"></span><span class="pill" data-o="wp"></span></div>
  <div class="row" style="margin-top:8px"><button class="tb" data-act="pretty" aria-pressed="false">Fix widows (text-wrap: pretty)</button></div>
  <p class="sm" style="margin-top:8px">Measure is line length, counted in characters. 45 to 75 reads best. A widow (or orphan) is one lonely word left on the last line. It looks like a mistake.</p></div>
</div>
</div>`,
 init(el){if(once(el))return;
  const T='Snap a photo of any receipt. We read it, sort it into the right category and add it to today’s total, so your books are done before dinner.';
  const ms=$(el,'[data-o=ms]');ms.innerHTML=T.split(' ').map(w=>`<span>${w}</span>`).join(' ');
  let pretty=false;
  const pill=(k,cls,txt)=>{const p=$(el,'[data-o="'+k+'"]');p.className='pill '+cls;p.textContent=txt};
  function tk(){const v=+$(el,'[name=tk]').value;$(el,'.tk-h').style.letterSpacing=v+'em';$(el,'.tk-l').style.letterSpacing=v+'em';out(el,'tkv',v.toFixed(2)+'em');
   pill('tkh',v<-.05?'bad':v<=.005?'ok':'mid',v<-.05?'Headline: too tight':v<=.005?'Headline: good':'Headline: too loose');
   pill('tkl',v<.05?'mid':v<=.18?'ok':'bad',v<.05?'Label: too tight':v<=.18?'Label: good':'Label: falling apart')}
  function kn(){const p=$(el,'[data-g=pair] [aria-pressed=true]').dataset.v,k=$(el,'[data-g=kern] [aria-pressed=true]').dataset.v,v=+$(el,'[name=kn]').value;
   const kp=$(el,'[data-o=kp]');kp.textContent=p;kp.style.fontKerning=k;kp.style.letterSpacing=v+'em';$(el,'[data-o=kw]').style.fontKerning=k;
   out(el,'kv',(v>0?'+':'')+v.toFixed(2)+'em')}
  function ld(){const v=+$(el,'[name=lh]').value,px=16*v,d=$(el,'[data-o=ld]');d.style.lineHeight=v;d.style.background=`repeating-linear-gradient(180deg,rgba(214,229,154,.75) 0 ${px}px,transparent ${px}px ${px*2}px)`;out(el,'lv',v.toFixed(2));
   pill('lp',v<1.3?'bad':v<1.4?'mid':v<=1.65?'ok':v<=1.85?'mid':'bad',v<1.3?'Cramped: tails hit the next line':v<1.4?'A little tight for body':v<=1.65?'Good for body text':v<=1.85?'Getting loose':'Lines drift apart')}
  function msr(){const inp=$(el,'[name=mw]'),mx=Math.max(160,Math.floor(ms.parentElement.clientWidth-36));inp.max=mx;if(+inp.value>mx)inp.value=mx;
   const w=+inp.value;ms.style.width=w+'px';ms.style.textWrap=pretty?'pretty':'wrap';out(el,'mv',w+'px');
   const sp=$$(ms,'span'),lines=[];let top=null;sp.forEach(s=>{const t=s.offsetTop;if(top===null||Math.abs(t-top)>3){lines.push([]);top=t}lines[lines.length-1].push(s.textContent)});
   const lens=lines.map(l=>l.join(' ').length),full=lens.slice(0,-1),avg=full.length?Math.round(full.reduce((a,b)=>a+b,0)/full.length):lens[0];
   pill('mp',avg<45?'mid':avg<=75?'ok':'bad',`About ${avg} characters a line · `+(avg<45?'short':avg<=75?'comfortable':'too long'));
   const last=lines[lines.length-1]||[];pill('wp',lines.length>1&&last.length===1?'bad':'ok',lines.length>1&&last.length===1?`Widow: “${last[0]}” alone`:'No widow')}
  slide(el,'tk',tk);slide(el,'kn',kn);slide(el,'lh',ld);slide(el,'mw',msr);
  seg(el,'pair',()=>{$(el,'[name=kn]').value=0;kn()});seg(el,'kern',kn);
  $(el,'[data-act=pretty]').addEventListener('click',e=>{pretty=!pretty;e.currentTarget.setAttribute('aria-pressed',String(pretty));msr()});
  tk();kn();ld();msr();watch(el,msr);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(el.isConnected)msr()});
 }},
{id:'type-scale',title:'Type scale, weight and hierarchy',
 terms:['Type scale','Weight','Hierarchy','Display face'],
 intro:'A type scale is a short ladder of sizes. Pick a base size and a ratio, and every size is the one before multiplied by that ratio. Weight and typeface do the rest of the work of showing importance.',
 try:'Change the base and the ratio and watch the ladder rebuild. Tap a weight. Then flip the card between Flat and Scaled.',
 html:`<div class="vz1 vz-type-scale">${KIT}<style>
.vz-type-scale .lad{display:grid;gap:2px}
.vz-type-scale .rw{display:grid;grid-template-columns:126px minmax(0,1fr);align-items:baseline;gap:10px;border-bottom:1.5px dashed rgba(20,38,29,.25);padding:2px 0}
.vz-type-scale .rw .t{white-space:nowrap;overflow:hidden;line-height:1.2;-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent)}
.vz-type-scale .wl{display:grid;gap:4px}
.vz-type-scale .wl button{display:grid;grid-template-columns:128px minmax(0,1fr);align-items:center;text-align:left;border:2px solid transparent;border-radius:10px;background:transparent;padding:2px 8px;min-height:44px;cursor:pointer;color:#14261D}
.vz-type-scale .wl button[aria-pressed=true]{border-color:#14261D;background:#D6E59A}
.vz-type-scale .wl .s{font-family:Inter,sans-serif;font-size:24px;line-height:1.1;white-space:nowrap;overflow:hidden}
.vz-type-scale .v{font-size:11px}
.vz-type-scale .hc{background:#FFFDF7;border:2.5px solid #14261D;border-radius:14px;padding:18px;box-shadow:4px 4px 0 #14261D;color:#14261D}
</style>
<div class="g2">
 <div style="display:grid;gap:10px;align-content:start">
  <label class="sl"><span class="h">Base size <span class="v" data-o="bv"></span></span><input type="range" name="base" min="14" max="20" step="1" value="16"></label>
  <div class="seg" data-g="ratio"><button data-v="1.2">1.2 Minor third</button><button data-v="1.25" aria-pressed="true">1.25 Major third</button><button data-v="1.333">1.333 Fourth</button><button data-v="1.5">1.5 Fifth</button></div>
  <p class="sm" data-o="math"></p>
 </div>
 <div class="stg paper lad" data-o="lad"></div>
</div>
<div class="g2">
 <div class="stg paper"><div class="lab" style="margin-bottom:6px">Weight ladder · tap one</div><div class="wl" data-o="wl"></div></div>
 <div style="display:grid;gap:10px;align-content:start">
  <div class="row"><div class="seg" data-g="hier"><button data-v="flat">Flat</button><button data-v="scaled" aria-pressed="true">Scaled</button></div></div>
  <div class="row"><span class="lab">Headline face</span><div class="seg" data-g="disp"><button data-v="Bricolage Grotesque" aria-pressed="true">Bricolage</button><button data-v="Fraunces">Fraunces</button><button data-v="Instrument Sans">Body face</button></div></div>
  <div class="hc" data-o="hc"></div>
  <div class="note" aria-live="polite" data-o="say"></div>
 </div>
</div>
</div>`,
 init(el){if(once(el))return;
  const W=[[300,'Light'],[400,'Regular'],[500,'Medium'],[600,'Semibold'],[700,'Bold'],[800,'Extra bold'],[900,'Black']];
  let ratio=1.25,wt=800,flat=false,disp='Bricolage Grotesque';
  out(el,'wl',W.map(w=>`<button data-w="${w[0]}" aria-pressed="${w[0]===wt}"><span class="v" style="justify-self:start">${w[0]} ${w[1]}</span><span class="s" style="font-weight:${w[0]}">Sales</span></button>`).join(''));
  const fam=f=>`'${f}',${f==='Fraunces'?'Georgia,serif':'system-ui,sans-serif'}`;
  function draw(){const b=+$(el,'[name=base]').value,sz=n=>Math.round(b*Math.pow(ratio,n)*10)/10;out(el,'bv',b+'px');
   const R=[['display',5],['h1',4],['h2',3],['h3',2],['large',1],['body',0],['caption',-1]];
   out(el,'lad',R.map(r=>`<div class="rw"><span class="v" style="justify-self:start">${r[0]} · ${sz(r[1])}px</span><span class="t" style="font-size:${sz(r[1])}px;font-family:${r[1]>=2?fam(disp):"'Instrument Sans',sans-serif"};font-weight:${r[1]>=2?wt:400};letter-spacing:${r[1]>=3?'-.02em':'0'}">Done before dinner</span></div>`).join(''));
   out(el,'math',`Each step is the last one × ${ratio}: `+[0,1,2,3,4].map(sz).join(' → ')+'. A small ratio suits busy apps. A big ratio makes dramatic headlines.');
   $$(el,'[data-w]').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.w===wt)));
   const f=flat;
   out(el,'hc',`<div style="font:${f?`400 ${b}px 'Instrument Sans',sans-serif`:`700 ${Math.max(11,sz(-1)-2)}px 'Space Mono',monospace`};letter-spacing:${f?0:'2px'};color:${f?'#14261D':'#4A5A4F'}">${f?'Bookkeeping':'BOOKKEEPING'}</div><div style="font-family:${f?"'Instrument Sans',sans-serif":fam(disp)};font-weight:${f?400:wt};font-size:${f?b:sz(3)}px;line-height:${f?1.5:1.05};letter-spacing:${f?0:'-.02em'};margin:6px 0">Your books, done before dinner.</div><div style="font-weight:${f?400:600};font-size:${f?b:sz(1)}px;margin-bottom:4px">How it works</div><div style="font-size:${b}px;line-height:1.5;color:${f?'#14261D':'#4A5A4F'}">Snap a receipt. We sort it and tell you what you owe.</div>`);
   out(el,'say',f?'<b>Flat.</b> Same size, same weight, same colour. Nothing tells your eye where to start, so you read everything with equal effort. There is no <b>hierarchy</b>.':`<b>Scaled.</b> Eyebrow, headline, subhead, body: four clear levels from one scale. Headline in ${disp==='Instrument Sans'?'the body face, which is calm but plain':'a <b>display face</b>, a typeface with character built for big sizes'} at weight ${wt}.`)}
  slide(el,'base',draw);seg(el,'ratio',v=>{ratio=+v;draw()});seg(el,'hier',v=>{flat=v==='flat';draw()});seg(el,'disp',v=>{disp=v;draw()});
  $(el,'[data-o=wl]').addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b)return;wt=+b.dataset.w;draw()});
  draw();
 }},
{id:'type-numbers',title:'Numbers and optical size',
 terms:['Tabular figures','Optical size'],
 intro:'Two quiet details that separate a pro interface from an average one: numbers that line up, and letters drawn differently for small and big sizes.',
 try:'Watch the prices change with proportional figures, then switch to tabular. Then swap the optical sizes and look at the magnified small text.',
 html:`<div class="vz1 vz-type-numbers">${KIT}<style>
.vz-type-numbers .tbl{font-family:Inter,sans-serif;font-size:22px;font-weight:600;display:grid;gap:4px;max-width:300px}
.vz-type-numbers .tbl div{display:flex;justify-content:space-between;gap:12px;border-bottom:1.5px dashed rgba(20,38,29,.25);padding:2px 0}
.vz-type-numbers .tbl span:first-child{font-size:15px;font-weight:500;color:#4A5A4F;align-self:center}
.vz-type-numbers .op{font-family:'Bricolage Grotesque',sans-serif;color:#14261D}
.vz-type-numbers .mag{height:116px;overflow:hidden;border:2px solid #14261D;border-radius:10px;background:#F4F0E5;padding:8px}
.vz-type-numbers .mag div{transform:scale(2.6);transform-origin:0 0;width:38%;font-size:13px;line-height:1.35}
</style>
<div class="g2">
 <div class="stg paper"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="lab">Live prices</span><div class="seg" data-g="num"><button data-v="proportional-nums" aria-pressed="true">Proportional</button><button data-v="tabular-nums">Tabular</button></div></div>
  <div class="tbl" data-o="tbl"></div><div class="row" style="margin-top:10px"><button class="tb" data-act="tick">Change prices</button></div>
  <p class="sm" data-o="ns" style="margin-top:8px"></p></div>
 <div class="stg paper"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="lab">Optical size</span><div class="seg" data-g="op"><button data-v="ok" aria-pressed="true">Matched</button><button data-v="bad">Swapped</button></div></div>
  <div class="op" data-o="big" style="font-size:52px;font-weight:800;line-height:1;letter-spacing:-.01em">Sold out</div>
  <div class="lab" style="margin:10px 0 4px">13px text, magnified</div>
  <div class="mag"><div class="op" data-o="small">Delivery in two days. Pay on arrival.</div></div>
  <p class="sm" data-o="os" style="margin-top:8px"></p></div>
</div>
</div>`,
 init(el){if(once(el))return;
  const items=['Rice 50kg','Palm oil 5L','Garri 10kg'];let p=[61100,11850,8790];let mode='proportional-nums';
  const fmt=n=>'&#8358;'+n.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2});
  function nums(){out(el,'tbl',items.map((t,i)=>`<div><span>${t}</span><span style="font-variant-numeric:${mode}">${fmt(p[i])}</span></div>`).join(''));
   out(el,'ns',mode==='tabular-nums'?'<b>Tabular figures:</b> every digit takes the same width, so columns line up and numbers stay still as they change.':'<b>Proportional figures:</b> a 1 is narrower than an 8, so the column is ragged and the numbers jiggle when they update. Fine in sentences, wrong in tables.')}
  function tick(){p=p.map(v=>{const r=[11111,18888,10101,14141,81818,11.11,88.88];return Math.max(1000,Math.round((v+(Math.random()-.5)*v*.3)/1)+r[Math.floor(Math.random()*r.length)]%997)});nums()}
  function op(){const ok=$(el,'[data-g=op] [aria-pressed=true]').dataset.v==='ok',b=$(el,'[data-o=big]'),s=$(el,'[data-o=small]');
   b.style.fontVariationSettings=ok?'normal':"'opsz' 12";s.style.fontVariationSettings=ok?'normal':"'opsz' 96";b.style.fontOpticalSizing=s.style.fontOpticalSizing=ok?'auto':'none';
   out(el,'os',ok?'<b>Optical size</b> means the font is drawn differently for each size. Small text gets wider spacing, open shapes and sturdier strokes. Big text gets tighter spacing and finer detail. Fonts with an optical size axis, like Bricolage Grotesque, switch automatically.':'<b>Swapped.</b> The big headline now uses the small-size drawing: it looks loose and clumsy. The small text uses the display drawing: cramped, thin, harder to read. Most fonts handle this for you, so leave it on auto.')}
  seg(el,'num',v=>{mode=v;nums()});seg(el,'op',op);$(el,'[data-act=tick]').addEventListener('click',tick);
  nums();op();
  if(!RM()){const id=setInterval(()=>{if(!el.isConnected){clearInterval(id);return}tick()},1400)}
 }}
];

/* =====================================================================
   DRILLS
   ===================================================================== */
const F=(c,s)=>`<div style="width:240px;max-width:100%;${s||''}">${c}</div>`;
const ROW=(a,b)=>`<div style="display:flex;gap:12px;align-items:flex-start;justify-content:center">${a}${b}</div>`;
const SWS=cs=>`<div style="display:flex;gap:4px">${cs.map(c=>`<div style="width:40px;height:56px;border-radius:8px;border:2px solid #14261D;background:${c}"></div>`).join('')}</div>`;
const PARA='Snap a receipt. We sort it, total it and tell you what you owe.';

window.DRILLS['type']=[
{id:'t-n1',type:'name',level:1,q:'The two paragraphs differ in one thing. What is it called?',
 face:ROW(`<div style="width:110px;font-size:12px;line-height:1.2">${PARA}</div>`,`<div style="width:110px;font-size:12px;line-height:1.9">${PARA}</div>`),
 opts:['Tracking','Leading','Kerning','Measure'],ok:1,why:'Leading, or line height, is the space between lines. The right paragraph has much more, so each line floats on its own.'},
{id:'t-n2',type:'name',level:1,q:'What changed in the second line?',
 face:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px">Market day</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;letter-spacing:.22em">Market day</div>`),
 opts:['Kerning','Weight','Tracking','Leading'],ok:2,why:'Tracking (letter-spacing) changes the space between every letter at once. Kerning would only change one pair.'},
{id:'t-n3',type:'name',level:2,q:'Only the gap between A and V changed. What is that adjustment called?',
 face:ROW(`<div style="font-family:Inter,sans-serif;font-weight:700;font-size:56px;line-height:1">AV</div>`,`<div style="font-family:Inter,sans-serif;font-weight:700;font-size:56px;line-height:1;font-kerning:none"><span style="letter-spacing:.14em">A</span>V</div>`),
 opts:['Tracking','Kerning','Measure','x-height'],ok:1,why:'Fixing the space between one specific pair of letters is kerning. A and V lean apart, so good fonts pull them closer.'},
{id:'t-n4',type:'name',level:1,q:'Same text, same size. What is different?',
 face:F(`<div style="font-size:12px;line-height:1.45;width:96px;margin-bottom:10px">${PARA}</div><div style="font-size:12px;line-height:1.45;width:240px">${PARA} Then we send you one clear page.</div>`),
 opts:['Measure','Leading','Weight','Tracking'],ok:0,why:'Measure is line length. Too short and reading turns choppy; too long and the eye loses its place. Aim for 45 to 75 characters.'},
{id:'t-n5',type:'name',level:2,q:'Both words are set at 24px. The left one looks bigger because of its…',
 face:ROW(`<div style="font-family:Inter,sans-serif;font-size:24px">reading</div>`,`<div style="font-family:Georgia,serif;font-size:24px;font-size-adjust:.4">reading</div>`),
 opts:['x-height','Tracking','Leading','Kerning'],ok:0,why:'x-height is the height of lowercase letters. Typefaces with a bigger x-height look larger and read better at small sizes, even at the same font size.'},
{id:'t-n6',type:'name',level:2,q:'The circled parts on the left letters are called…',
 face:ROW(`<div style="position:relative;font-family:Fraunces,Georgia,serif;font-size:58px;line-height:1">Ih<span style="position:absolute;left:-6px;bottom:-4px;width:30px;height:20px;border:2.5px solid #E8722C;border-radius:50%"></span></div>`,`<div style="font-family:Inter,sans-serif;font-size:58px;line-height:1">Ih</div>`),
 opts:['Counters','Serifs','Ascenders','Kerning'],ok:1,why:'Serifs are the small feet at the ends of strokes. Typefaces without them, like the right one, are called sans-serif.'},
{id:'t-n7',type:'name',level:3,q:'The right column lines up and the left does not. What is switched on in the right one?',
 face:ROW(`<div style="font-family:Inter,sans-serif;font-size:17px;text-align:right;font-variant-numeric:proportional-nums">1,111.10<br>8,808.80<br>4,141.11</div>`,`<div style="font-family:Inter,sans-serif;font-size:17px;text-align:right;font-variant-numeric:tabular-nums">1,111.10<br>8,808.80<br>4,141.11</div>`),
 opts:['Kerning','Tabular figures','Optical size','Tracking'],ok:1,why:'Tabular figures give every digit the same width, so numbers stack in clean columns. Look at the 1s: proportional ones are narrower.'},
{id:'t-a1',type:'ab',level:1,q:'Which heading is set in sentence case?',
 a:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.1">Track Your Daily Sales In One Place</div>`),
 b:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.1">Track your daily sales in one place</div>`),
 ok:'b',why:'Sentence case capitalises only the first word and names. It reads like a person talking. Title Case On Every Word reads like an advert.'},
{id:'t-a2',type:'ab',level:2,q:'Which paragraph avoids a widow?',
 a:`<div style="font-size:13px;line-height:1.5;white-space:nowrap">Snap a receipt and we sort it, total<br>it and tell you what you owe before<br>dinner.</div>`,
 b:`<div style="font-size:13px;line-height:1.5;white-space:nowrap">Snap a receipt and we sort it,<br>total it and tell you what you<br>owe before dinner.</div>`,
 ok:'b',why:'A widow is one lonely word on the last line. It looks like a mistake. Rewrap or trim a word so the last line has at least two.'},
{id:'t-a3',type:'ab',level:3,q:'Which word has even spacing between its letters?',
 a:`<div style="font-family:Inter,sans-serif;font-weight:700;font-size:32px;letter-spacing:-.01em">AVAILABLE</div>`,
 b:`<div style="font-family:Inter,sans-serif;font-weight:700;font-size:32px;letter-spacing:-.01em;font-kerning:none">AVAILABLE</div>`,
 ok:'a',why:'B has kerning switched off. Look between A, V and A: small holes open up. Kerning tucks awkward pairs together so the word looks evenly spaced.'},
{id:'t-a4',type:'ab',level:3,q:'Which big headline is tracked better?',
 a:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;line-height:1.02;letter-spacing:-.025em">Books done by dinner</div>`),
 b:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;line-height:1.02;letter-spacing:.025em">Books done by dinner</div>`),
 ok:'a',why:'At big sizes, default spacing looks loose, so headlines want slightly tight tracking (about −0.02em). B is only a hair wider, but it already feels less solid.'},
{id:'t-p1',type:'pick',level:2,q:'Which small all-caps label is tracked well?',
 opts:[`<div style="font:700 11px 'Instrument Sans',sans-serif;letter-spacing:0">ORDERS WAITING</div>`,`<div style="font:700 11px 'Instrument Sans',sans-serif;letter-spacing:.12em">ORDERS WAITING</div>`,`<div style="font:700 11px 'Instrument Sans',sans-serif;letter-spacing:.45em">ORDERS WAITING</div>`],
 ok:1,why:'Capitals were drawn to sit next to lowercase, so in a row they crowd each other. Small all-caps labels need a little extra tracking (about 0.1em), not a lot.'},
{id:'t-p2',type:'pick',level:1,q:'Which card has a clear hierarchy?',
 opts:[F(`<div style="font-size:14px">Bookkeeping</div><div style="font-size:14px">Your books, done before dinner.</div><div style="font-size:14px">Snap a receipt. We do the rest.</div>`,'max-width:200px'),F(`<div style="font:700 10px 'Space Mono',monospace;letter-spacing:2px;color:#4A5A4F">BOOKKEEPING</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.05;margin:4px 0">Your books, done before dinner.</div><div style="font-size:13px;color:#4A5A4F">Snap a receipt. We do the rest.</div>`,'max-width:200px'),F(`<div style="font-weight:800;font-size:18px">Bookkeeping</div><div style="font-weight:800;font-size:18px">Your books, done before dinner.</div><div style="font-weight:800;font-size:18px">Snap a receipt. We do the rest.</div>`,'max-width:200px')],
 ok:1,why:'Hierarchy uses size, weight and colour to say what to read first. When everything is the same, quiet or loud, nothing leads.'},
{id:'t-p3',type:'pick',level:3,q:'Which set of sizes comes from one type scale?',
 opts:[`<div style="display:flex;align-items:baseline;gap:6px;font-family:Inter,sans-serif">${[12,15,19,24,30].map(s=>`<span style="font-size:${s}px">Aa</span>`).join('')}</div>`,`<div style="display:flex;align-items:baseline;gap:6px;font-family:Inter,sans-serif">${[14,15,16,17,30].map(s=>`<span style="font-size:${s}px">Aa</span>`).join('')}</div>`,`<div style="display:flex;align-items:baseline;gap:6px;font-family:Inter,sans-serif">${[12,13,22,23,30].map(s=>`<span style="font-size:${s}px">Aa</span>`).join('')}</div>`],
 ok:0,why:'In the right set each size is the one before times 1.25, so every step is clear and even. Sizes that are almost the same (15, 16, 17) look like mistakes, not choices.'},
{id:'t-f1',type:'fix',level:1,q:'This paragraph is hard to read. What is the best fix?',
 face:F(`<div style="font-size:13px;line-height:1.5;text-align:center">Snap a photo of any receipt. We read it, sort it into the right category and add it to today’s total, so your books are done before dinner every day.</div>`),
 opts:['Left-align it','Make it bold','Centre the heading too'],ok:0,why:'Centred text starts every line in a new place, so the eye has to hunt. Left-align anything longer than two lines.'},
{id:'t-f2',type:'fix',level:2,q:'The prices look messy. What fixes it?',
 face:F(`<div style="font-family:Inter,sans-serif;font-size:18px;text-align:right;font-variant-numeric:proportional-nums;line-height:1.5">&#8358;1,111.00<br>&#8358;8,808.50<br>&#8358;11,250.00</div>`),
 opts:['Turn on tabular figures','Centre the numbers','Make the numbers bold'],ok:0,why:'Tabular figures make every digit the same width, so decimal points and digits line up in a column.'},
{id:'t-f3',type:'fix',level:1,q:'The delivery note under the price is easy to miss. What is the right fix?',
 face:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px">&#8358;12,500</div><div style="font-size:10px;color:#B5B5B5">Free delivery in 2 days</div>`),
 opts:['Use 13px or more in the muted ink colour','Make it italic','Put it in all caps'],ok:0,why:'Pale, tiny text fails contrast and strains the eye. Quiet text should be smaller and softer, but still readable: at least 13px and 4.5:1.'},
{id:'t-f4',type:'fix',level:3,q:'Something feels loose about this headline. What fixes it?',
 face:F(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1.4;letter-spacing:.03em">Your books, done before dinner.</div>`),
 opts:['Tighten tracking to about −0.02em and line height to about 1.05','Make it bigger','Set it in all caps'],ok:0,why:'Big headlines need tight line height and slightly tight tracking to read as one solid thought. Two small loosenings add up to a headline that falls apart.'}
];

window.DRILLS['colour']=[
{id:'c-n1',type:'name',level:1,q:'Only one thing changes across these swatches. What is it?',
 face:SWS([20,38,55,72,88].map(l=>hsl2hex(150,35,l))),opts:['Hue','Saturation','Lightness / value','Gradient'],ok:2,why:'Same colour family, same intensity, from dark to light. That is lightness, also called value. Hierarchy lives here.'},
{id:'c-n2',type:'name',level:1,q:'What changes across these swatches?',
 face:SWS([10,45,140,210,280].map(h=>hsl2hex(h,60,60))),opts:['Hue','Lightness / value','Tint / shade','Contrast ratio'],ok:0,why:'Hue is the colour family: red, yellow, green, blue, purple. Lightness and intensity stay the same here.'},
{id:'c-n3',type:'name',level:2,q:'The orange slowly turns grey. Which dial is moving?',
 face:SWS([90,65,40,18,0].map(s=>hsl2hex(24,s,55))),opts:['Lightness / value','Saturation','Hue','Warm / cool'],ok:1,why:'Saturation is how intense a colour is. At 0% only grey is left. Calm interfaces use far less saturation than you would guess.'},
{id:'c-n4',type:'name',level:2,q:'The middle colour is the base. What are the lighter and darker versions called?',
 face:SWS(['#FFFFFF','#E8722C','#000000'].length&&[mix(TERRA,'#FFFFFF',.7),mix(TERRA,'#FFFFFF',.4),TERRA,mix(TERRA,'#000000',.35),mix(TERRA,'#000000',.6)]),opts:['Tint / shade','Saturation','Gradient','Hue'],ok:0,why:'Mix a colour with white and you get a tint; with black, a shade. One ramp gives you soft backgrounds and dark text in the same family.'},
{id:'c-n5',type:'name',level:2,q:'This layout splits its colour into big, medium and tiny amounts. What is that balance called?',
 face:`<div style="width:220px;border:2px solid #14261D;border-radius:12px;overflow:hidden;background:#F4F0E5;padding:10px"><div style="background:#14261D;border-radius:8px;height:48px"></div><div style="display:flex;justify-content:flex-end;margin-top:30px"><div style="background:#E8722C;border:2px solid #14261D;border-radius:8px;width:56px;height:22px"></div></div></div>`,
 opts:['Gradient','60-30-10','Contrast ratio','Hue'],ok:1,why:'60-30-10 is a balance guide: about 60% neutral, 30% secondary, 10% accent. The tiny accent is what makes it loud.'},
{id:'c-n6',type:'name',level:3,q:'The right panel feels designed and the left feels default. Why?',
 face:ROW(`<div style="width:110px;height:84px;border-radius:10px;border:2px solid #14261D;background:#EBEBEB;padding:8px;font-size:12px;color:#222">Today</div>`,`<div style="width:110px;height:84px;border-radius:10px;border:2px solid #14261D;background:#EEE7DD;padding:8px;font-size:12px;color:#2A241C">Today</div>`),
 opts:['It is a tinted neutral','It has more saturation','It is a gradient','It has a higher contrast ratio'],ok:0,why:'A tinted neutral is a grey with a hint of the brand hue mixed in, here a touch of warm orange. Pure grey leans nowhere, so it reads as a default.'},
{id:'c-a1',type:'ab',level:1,q:'Which header lets the main action stand out?',
 a:F(`<div style="border-radius:12px;overflow:hidden;border:2px solid #14261D"><div style="background:linear-gradient(90deg,#EC4899,#8B5CF6,#3B82F6);color:#fff;padding:12px;font-weight:700">Orders</div><div style="padding:10px;background:#fff"><span style="background:#22C55E;color:#06260F;padding:5px 9px;border-radius:7px;font-size:12px;font-weight:700">Pay now</span></div></div>`),
 b:F(`<div style="border-radius:12px;overflow:hidden;border:2px solid #14261D"><div style="background:#FFFDF7;border-bottom:2px solid #14261D;padding:12px;font-weight:700;font-family:'Bricolage Grotesque',sans-serif">Orders</div><div style="padding:10px;background:#F4F0E5"><span style="background:#E8722C;border:2px solid #14261D;padding:4px 9px;border-radius:7px;font-size:12px;font-weight:700">Pay now</span></div></div>`),
 ok:'b',why:'When the header is a rainbow, the button has to compete with it. Quiet neutrals let one accent point straight at the action.'},
{id:'c-a2',type:'ab',level:3,q:'Which grey caption passes 4.5:1 on white?',
 a:`<div style="background:#fff;padding:14px;border-radius:8px;font-size:14px;color:#808080">Delivered on Thursday</div>`,
 b:`<div style="background:#fff;padding:14px;border-radius:8px;font-size:14px;color:#6E6E6E">Delivered on Thursday</div>`,
 ok:'b',why:'#808080 looks fine but measures about 3.9:1, so it fails. #6E6E6E reaches about 5.1:1. Near the line, only the number can tell you, so always measure.'},
{id:'c-a3',type:'ab',level:3,q:'Which text colour belongs on this cream card?',
 a:`<div style="background:#F4F0E5;padding:14px;border-radius:10px;border:2px solid #14261D;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;color:#000">&#8358;84,200</div>`,
 b:`<div style="background:#F4F0E5;padding:14px;border-radius:10px;border:2px solid #14261D;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;color:#14261D">&#8358;84,200</div>`,
 ok:'b',why:'Pure black on warm cream is harsh and feels unchosen. A near-black tinted toward the palette (here a deep green) sits in the same family, so it feels designed.'},
{id:'c-p1',type:'pick',level:1,q:'Which palette has exactly one accent?',
 opts:[SWS(['#EF4444','#F59E0B','#22C55E','#3B82F6','#A855F7']),SWS(['#F4F0E5','#FFFDF7','#4A5A4F','#14261D','#E8722C']),SWS(['#F4F0E5','#FFFDF7','#14261D','#E8722C','#2563EB'])],
 ok:1,why:'Four neutrals and one accent. Two accents (orange and blue) fight each other; five vivid colours mean none of them stands out.'},
{id:'c-p2',type:'pick',level:2,q:'Which neutral leans warm?',
 opts:[`<div style="width:90px;height:70px;border-radius:10px;border:2px solid #14261D;background:#ECECEC"></div>`,`<div style="width:90px;height:70px;border-radius:10px;border:2px solid #14261D;background:#E6EAF0"></div>`,`<div style="width:90px;height:70px;border-radius:10px;border:2px solid #14261D;background:#F0EADF"></div>`],
 ok:2,why:'Warm neutrals lean red-yellow, like cream or sand. Cool ones lean blue. Pure grey leans nowhere, which is why it can feel like a default.'},
{id:'c-p3',type:'pick',level:3,q:'Which button passes 4.5:1 for its label?',
 opts:[`<div style="background:#E8722C;color:#fff;border-radius:10px;padding:10px 16px;font-weight:600">Pay now</div>`,`<div style="background:#C9621F;color:#fff;border-radius:10px;padding:10px 16px;font-weight:600">Pay now</div>`,`<div style="background:#E8722C;color:#14261D;border-radius:10px;padding:10px 16px;font-weight:600;border:2px solid #14261D">Pay now</div>`],
 ok:2,why:'White on terracotta is about 3:1, and even the darker orange only reaches 4:1. Both look fine and both fail. Dark ink on the orange clears 5:1.'},
{id:'c-p4',type:'pick',level:2,q:'Where should the accent colour go?',
 opts:[BOX(`<div style="font-weight:800;color:#AD4F16">Your orders</div><div style="font-size:12px;margin:4px 0 8px">3 need a reply</div><span style="border:2px solid #14261D;border-radius:7px;padding:3px 8px;font-size:12px;font-weight:700">Reply</span>`),BOX(`<div style="font-weight:800">Your orders</div><div style="height:4px;background:#E8722C;border-radius:2px;margin:6px 0"></div><div style="font-size:12px;margin-bottom:8px">3 need a reply</div><span style="border:2px solid #14261D;border-radius:7px;padding:3px 8px;font-size:12px;font-weight:700">Reply</span>`),BOX(`<div style="font-weight:800">Your orders</div><div style="font-size:12px;margin:4px 0 8px">3 need a reply</div><span style="background:#E8722C;border:2px solid #14261D;border-radius:7px;padding:3px 8px;font-size:12px;font-weight:700">Reply</span>`)],
 ok:2,why:'The accent marks action and importance. On a title or a decorative line it is wasted; on the button it tells the eye exactly what to do.'},
{id:'c-f1',type:'fix',level:1,q:'This button is hard to read. What is the fix?',
 face:`<div style="background:#F2B705;color:#fff;border-radius:10px;padding:12px 18px;font-weight:700">Add to cart</div>`,
 opts:['Use dark text on it','Make the text bold','Add a shadow to the text'],ok:0,why:'White on yellow is under 2:1. Light accents need dark text. Bold or shadows do not fix lightness.'},
{id:'c-f2',type:'fix',level:2,q:'These order statuses rely on colour alone. What is the fix?',
 face:F(`${['#22C55E','#EF4444','#F59E0B'].map((c,i)=>`<div style="display:flex;gap:8px;align-items:center;font-size:14px;padding:3px 0"><i style="width:12px;height:12px;border-radius:50%;background:${c}"></i>Order #10${i+4}</div>`).join('')}`),
 opts:['Add a word and an icon to each status','Make the dots bigger','Use brighter red and green'],ok:0,why:'About 1 in 12 men cannot tell red from green. Semantic colour must always come with a word or icon, so the meaning survives without the colour.'},
{id:'c-f3',type:'fix',level:2,q:'Every stat card shouts. What is the fix?',
 face:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:200px">${[['#3B82F6','Sales'],['#22C55E','Users'],['#F59E0B','Stock'],['#EF4444','Orders']].map(c=>`<div style="background:${c[0]};color:#0B1020;border-radius:8px;padding:10px;font-weight:700;font-size:13px">${c[1]}</div>`).join('')}</div>`,
 opts:['Make the cards neutral and save colour for what needs action','Add a gradient to each card','Use pastel versions of all four'],ok:0,why:'When every card is a different loud colour, colour stops meaning anything. Neutral cards with one accent on the urgent number let the eye find what matters.'},
{id:'c-f4',type:'fix',level:3,q:'The warning chip is hard to read. What fixes it without losing the warning feel?',
 face:`<span style="display:inline-block;background:#FFF6C2;color:#B58A00;border-radius:99px;padding:6px 12px;font-size:13px;font-weight:600">Low stock: 3 left</span>`,
 opts:['Darken the text to a deep brown-amber','Make the chip bigger','Make the background a brighter yellow'],ok:0,why:'The amber text is about 2.9:1 on pale yellow. Keep the hue, drop the lightness: a deep brown-amber passes 4.5:1 and still says “warning”.'}
];

const SLOPCARD=`<div style="width:200px;padding:18px;border-radius:18px;background:linear-gradient(135deg,#6D4AFF,#A63AE0);color:#fff;text-align:center;font-family:Arial,sans-serif">${SPARK('#fff')}<div style="font-size:18px;font-weight:700;margin:6px 0">Unlock Your Potential</div><div style="font-size:11px">The ultimate solution for modern teams</div><div style="margin-top:10px;background:#FF7AE0;color:#1E0B3A;border-radius:8px;padding:8px;font-weight:700;font-size:13px">Get Started</div></div>`;
const CC=(eyebrow,head,body,btn,o)=>{o=o||{};return `<div style="width:220px;padding:16px;border-radius:14px;background:#FFFDF7;border:2.5px solid #14261D;box-shadow:4px 4px 0 #14261D;color:#14261D">${eyebrow?`<div style="font:700 9px 'Space Mono',monospace;letter-spacing:2px">${eyebrow}</div>`:''}<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:${o.hs||22}px;line-height:1.05;letter-spacing:-.02em;margin:6px 0">${head}</div><div style="font-size:${o.bs||12}px;color:#4A5A4F">${body}</div>${o.extra||''}<div style="margin-top:10px;background:#E8722C;border:2px solid #14261D;border-radius:9px;padding:8px;font-weight:700;font-size:13px;text-align:center">${btn}</div></div>`};

window.DRILLS['intent']=[
{id:'i-a1',type:'ab',level:1,q:'Which eyebrow shows the designer decided who this is for?',
 a:CC('WELCOME','Clothes that fit, made faster.','Take measurements once. Reuse them forever.','Add a customer'),
 b:CC('FOR TAILORS IN ABA','Clothes that fit, made faster.','Take measurements once. Reuse them forever.','Add a customer'),
 ok:'b',why:'Naming the audience is the first decision. “Welcome” fits every product, so it tells nobody anything.'},
{id:'i-a2',type:'ab',level:2,q:'Which screen was decided, not defaulted?',
 a:CC('FOR MARKET TRADERS','Know what sold today.','Record a sale by voice.','Record a sale'),
 b:`<div style="width:220px;padding:16px;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12);font-family:Arial,sans-serif;color:#111"><div style="font-size:18px;font-weight:700">Dashboard</div><div style="font-size:12px;color:#666;margin:6px 0">Manage your sales efficiently</div><div style="margin-top:10px;background:#3B82F6;color:#fff;border-radius:6px;padding:8px;font-size:13px;text-align:center">Get started</div></div>`,
 ok:'a',why:'B is every tool setting left as it came: system font, blue button, soft shadow, “Get started”. Nothing is wrong, and nothing is chosen. A names the audience, the task and the action.'},
{id:'i-a3',type:'ab',level:3,q:'Both look tidy. Which one made every size decision on purpose?',
 a:`<div style="width:220px;color:#14261D"><div style="font-size:15px;font-weight:700">Today’s sales</div><div style="font-size:17px;font-weight:700;margin:4px 0">&#8358;84,200</div><div style="font-size:16px;color:#4A5A4F">12 sales, 3 waiting</div></div>`,
 b:`<div style="width:220px;color:#14261D"><div style="font:700 11px 'Space Mono',monospace;letter-spacing:1.5px;color:#4A5A4F">TODAY’S SALES</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-size:30px;font-weight:800;margin:2px 0">&#8358;84,200</div><div style="font-size:14px;color:#4A5A4F">12 sales, 3 waiting</div></div>`,
 ok:'b',why:'A uses 15, 16 and 17px: three sizes so close they look like accidents. B uses clearly different steps, so the eye knows the total matters most.'},
{id:'i-p1',type:'pick',level:1,q:'Which button label says exactly what will happen?',
 opts:[`<div style="background:#E8722C;border:2.5px solid #14261D;border-radius:10px;padding:10px 16px;font-weight:700">Submit</div>`,`<div style="background:#E8722C;border:2.5px solid #14261D;border-radius:10px;padding:10px 16px;font-weight:700">Continue</div>`,`<div style="background:#E8722C;border:2.5px solid #14261D;border-radius:10px;padding:10px 16px;font-weight:700">Send &#8358;5,000 to Tunde</div>`],
 ok:2,why:'A good label names the action and the stakes. “Submit” and “Continue” make people guess what happens next.'},
{id:'i-p2',type:'pick',level:2,q:'Which flow respects “three steps or less”?',
 opts:[`<div style="font:700 12px 'Space Mono',monospace;max-width:220px">Home &rarr; Wallet &rarr; Send &rarr; Method &rarr; Details &rarr; Confirm &rarr; PIN</div>`,`<div style="font:700 12px 'Space Mono',monospace;max-width:220px">Home &rarr; Send &rarr; Method &rarr; Confirm &rarr; PIN</div>`,`<div style="font:700 12px 'Space Mono',monospace;max-width:220px">Home &rarr; Send to Tunde &rarr; PIN</div>`],
 ok:2,why:'Putting recent contacts on the home screen removes steps instead of decorating them. Every step you remove is a decision made on the user’s behalf.'},
{id:'i-p3',type:'pick',level:3,q:'Which version has nothing without a job?',
 opts:[CC('FOR MARKET TRADERS','Know what sold today.','Record a sale by voice.','Record a sale',{extra:`<div style="margin-top:8px"><span style="font:700 10px 'Space Mono',monospace;border:2px solid #14261D;border-radius:99px;padding:1px 7px;background:#F6D7E8">NEW</span></div>`}),CC('FOR MARKET TRADERS','Know what sold today.','Record a sale by voice.','Record a sale',{extra:`<div style="height:2px;background:#14261D;margin:10px 0 0;opacity:.3"></div>`}),CC('FOR MARKET TRADERS','Know what sold today.','Record a sale by voice.','Record a sale')],
 ok:2,why:'The “NEW” badge and the divider look harmless, but neither has a job: nothing is new, and nothing needs dividing. Restraint is removing what you cannot defend.'},
{id:'i-n1',type:'name',level:1,q:'What do you call output like this?',
 face:SLOPCARD,opts:['Slop','Craft','Constraint','Brief'],ok:0,why:'Slop is output nobody directed: a gradient, sparkles and a slogan that would fit any product. It is interchangeable with a thousand other screens.'},
{id:'i-n2',type:'name',level:2,q:'What do you call rules like these, set before anything is designed?',
 face:`<div style="font:12.5px/1.7 'Space Mono',monospace;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:12px;width:220px">- One accent colour<br>- No gradients<br>- Max three steps<br>- Body text 16px or more</div>`,
 opts:['Constraints','Defaults','First drafts','Hierarchy'],ok:0,why:'A constraint is a rule you set on purpose. It removes a hundred small decisions, so you can spend your care on the ones that matter.'},
{id:'i-n3',type:'name',level:2,q:'Four things were removed and nothing was added. Which skill is this?',
 face:ROW(`<div style="width:110px;border:2px solid #14261D;border-radius:10px;padding:8px;background:#fff;font-size:10px;text-align:center">${SPARK('#E8722C')}<div>Welcome!</div><div style="height:26px;background:#E7E1D2;border-radius:6px;margin:4px 0"></div><b>Know what sold</b><div style="margin-top:4px;color:#4A5A4F">#1 rated</div></div>`,`<div style="width:110px;border:2px solid #14261D;border-radius:10px;padding:8px;background:#fff;font-size:10px"><b style="font-size:13px">Know what sold</b><div style="margin-top:6px;background:#E8722C;border:1.5px solid #14261D;border-radius:6px;padding:4px;text-align:center;font-weight:700">Record</div></div>`),
 opts:['Restraint','Default','Gradient','Hierarchy'],ok:0,why:'Restraint is choosing to leave things out. It is usually the hardest decision, and the one that makes a screen feel confident.'},
{id:'i-n4',type:'name',level:1,q:'AI just handed you this in five seconds. What is it, and how should you treat it?',
 face:`<div style="width:230px;display:grid;gap:6px"><div style="justify-self:end;background:#14261D;color:#F4F0E5;border-radius:12px 12px 2px 12px;padding:8px 10px;font-size:12px">Make a landing page</div><div style="background:#FFFDF7;border:2px solid #14261D;border-radius:12px 12px 12px 2px;padding:8px 10px;font-size:12px">Here is your landing page!<div style="margin-top:6px;height:46px;border-radius:8px;background:linear-gradient(135deg,#6D4AFF,#A63AE0)"></div></div></div>`,
 opts:['A first draft: raw material','A brief: the direction','Taste: the final answer','Curation: the best pick'],ok:0,why:'The first draft is raw material, never the answer. Your job starts when it arrives: judge it, direct it, refine it.'},
{id:'i-n5',type:'name',level:2,q:'The right button has its icon centred and its corners even. Caring about details like this is called…',
 face:ROW(`<div style="display:flex;align-items:flex-start;gap:4px;border:2px solid #14261D;border-radius:14px 4px 14px 4px;padding:6px 12px 10px 8px;font-weight:700;font-size:13px;background:#E8722C"><svg width="14" height="14" viewBox="0 0 14 14" style="margin-top:7px" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="#14261D" stroke-width="2"/></svg>Add</div>`,`<div style="display:flex;align-items:center;gap:6px;border:2px solid #14261D;border-radius:10px;padding:8px 12px;font-weight:700;font-size:13px;background:#E8722C"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="#14261D" stroke-width="2"/></svg>Add</div>`),
 opts:['Craft','Curation','Constraint','Default'],ok:0,why:'Craft is the care spent on details most people never consciously notice, but always feel. Uneven corners and a dropped icon read as “cheap” before anyone can say why.'},
{id:'i-n6',type:'name',level:2,q:'Every choice here is what the tool does when you say nothing. That is called…',
 face:`<div style="width:220px;padding:14px;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12);font-family:Arial,sans-serif;color:#111"><div style="font-size:16px;font-weight:700">Settings</div><div style="font-size:12px;color:#666;margin:4px 0 10px">Manage your preferences</div><div style="background:#3B82F6;color:#fff;border-radius:6px;padding:7px;font-size:13px;text-align:center">Save changes</div></div>`,
 opts:['Default','Craft','Restraint','Hierarchy'],ok:0,why:'A default is what a tool does when you give no direction. Defaults are someone else’s taste, which is why default screens all look alike.'},
{id:'i-f1',type:'fix',level:1,q:'You typed this prompt and got slop back. What is the best fix?',
 face:`<div style="font:13px/1.6 'Space Mono',monospace;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:12px;width:220px">Make a modern landing page for my app.</div>`,
 opts:['Add who it is for, the promise, the feeling and the limits','Add “make it pop”','Ask for more colours'],ok:0,why:'A brief beats a wish. Audience, promise, feeling and constraints turn AI’s guessing into following.'},
{id:'i-f2',type:'fix',level:2,q:'Two buttons fight for attention. What is the fix?',
 face:`<div style="display:flex;gap:8px"><div style="background:#E8722C;border:2px solid #14261D;border-radius:9px;padding:8px 12px;font-weight:700;font-size:13px">Record a sale</div><div style="background:#C9E0F2;border:2px solid #14261D;border-radius:9px;padding:8px 12px;font-weight:700;font-size:13px">Learn more</div></div>`,
 opts:['Keep one main action; make the other a quiet text link','Make both buttons bigger','Add a third button for balance'],ok:0,why:'One screen, one main action. Equal weight means the person has to stop and choose, so give the main task the accent and quiet the rest.'},
{id:'i-f3',type:'fix',level:3,q:'This card is nearly right. What one change would finish it?',
 face:CC('FOR MARKET TRADERS','Know what <span style="background:#E8722C;padding:0 3px">sold</span> today.','Record a sale by voice.','Record a sale'),
 opts:['Take the accent off the headline so it marks only the action','Make the headline accent darker','Add the accent to the eyebrow too'],ok:0,why:'The accent is now in two places, so the eye has to choose. Spend it only on the action and the button becomes the obvious next step.'},
{id:'i-f4',type:'fix',level:1,q:'What should you read first here, and how do you fix it?',
 face:`<div style="width:220px;color:#14261D"><div style="font-size:13px;font-weight:600">Know what sold today, in one tap.</div><div style="font-size:22px;font-weight:800;line-height:1.1;margin-top:4px">Record a sale by voice and see your profit by evening.</div></div>`,
 opts:['Make the promise the biggest, boldest line; make the detail smaller','Make both lines the same size','Make the second line even bigger'],ok:0,why:'Hierarchy is the order the eye should read. The promise must lead, so it gets the biggest size; the detail supports it, so it gets less.'}
];
})();
