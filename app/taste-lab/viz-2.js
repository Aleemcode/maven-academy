/* Taste Lab: visual explainers + Train-your-eye drills (part 2). See CONTRACT in the repo notes. */
window.VIZ=window.VIZ||{};window.DRILLS=window.DRILLS||{};
(function(){
/* ---------- shared kit (scoped under .v2) ---------- */
const K=`<style>
.v2{font-family:'Instrument Sans',system-ui,sans-serif;color:#14261D;display:grid;gap:14px;min-width:0;font-size:15px;line-height:1.45}
.v2 *,.v2 *::before,.v2 *::after{box-sizing:border-box}
.v2-stage{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:16px;position:relative;overflow:hidden;min-width:0}
.v2-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v2-chip{min-height:44px;padding:8px 14px;border:2px solid #14261D;border-radius:999px;background:#FFFDF7;font:600 14px/1.1 'Instrument Sans',system-ui,sans-serif;color:#14261D;cursor:pointer;transition:background .15s,box-shadow .15s,transform .1s}
.v2-chip:hover{background:#F4F0E5}
.v2-chip[aria-pressed=true]{background:#D6E59A;box-shadow:2px 2px 0 #14261D}
.v2-chip:active{transform:translate(1px,1px)}
.v2-tog::before{content:'';display:inline-block;width:12px;height:12px;border:2px solid #14261D;border-radius:4px;margin-right:8px;vertical-align:-1px;background:#FFFDF7}
.v2-tog[aria-pressed=true]::before{background:#14261D;box-shadow:inset 0 0 0 2px #D6E59A}
.v2-ctl{display:grid;gap:2px}
.v2 [hidden]{display:none!important}
.v2-sl{display:grid;grid-template-columns:140px minmax(0,1fr) 62px;gap:12px;align-items:center;min-height:44px;font-size:14px;font-weight:600}
.v2-sl output{font:700 13px 'Space Mono',monospace;text-align:right;white-space:nowrap}
.v2 input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:32px;margin:0;background:transparent;cursor:pointer}
.v2 input[type=range]::-webkit-slider-runnable-track{box-sizing:border-box;height:8px;border:2px solid #14261D;border-radius:99px;background:#F4F0E5}
.v2 input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:24px;height:24px;margin-top:-10px;border-radius:50%;background:#E8722C;border:2px solid #14261D;box-shadow:2px 2px 0 #14261D}
.v2 input[type=range]::-moz-range-track{height:4px;border:2px solid #14261D;border-radius:99px;background:#F4F0E5}
.v2 input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#E8722C;border:2px solid #14261D;box-shadow:2px 2px 0 #14261D}
.v2 input[type=range]:disabled{opacity:.4;cursor:not-allowed}
.v2 input[type=range]:focus-visible{outline:3px solid #3B82C4;outline-offset:2px;border-radius:8px}
.v2-note{margin:0;font-size:15px;line-height:1.5;color:#14261D;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:12px 14px}
.v2-lab{font:700 11px/1.3 'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;color:#4A5A4F}
@media (max-width:520px){.v2-sl{grid-template-columns:minmax(0,1fr) 62px;row-gap:0}.v2-sl input{grid-column:1/-1;grid-row:2}}
</style>`;
const SL=(k,label,min,max,step,val,unit='px')=>`<label class="v2-sl"><span>${label}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"><output data-o="${k}">${val}${unit}</output></label>`;
const CH=(k,v,t,on)=>`<button type="button" class="v2-chip" data-k="${k}" data-v="${v}" aria-pressed="${!!on}">${t}</button>`;
const TG=(t,txt,on)=>`<button type="button" class="v2-chip v2-tog" data-t="${t}" aria-pressed="${!!on}">${txt}</button>`;
const RM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function wire(el,st,render){
 const q=s=>Array.from(el.querySelectorAll(s));
 const api={
  set(k,v){st[k]=v;q('button[data-k="'+k+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(v))));},
  val(k,v){st[k]=v;q('input[data-k="'+k+'"]').forEach(i=>{i.value=v;});},
  tog(t,v){st[t]=v;q('button[data-t="'+t+'"]').forEach(b=>b.setAttribute('aria-pressed',String(v)));},
  out(k,h){q('[data-o="'+k+'"]').forEach(o=>{o.innerHTML=h;});}
 };
 q('input[type=range][data-k]').forEach(i=>{st[i.dataset.k]=+i.value;i.oninput=()=>{st[i.dataset.k]=+i.value;render(i.dataset.k);};});
 q('button[data-k]').forEach(b=>{if(b.getAttribute('aria-pressed')==='true')st[b.dataset.k]=b.dataset.v;b.onclick=()=>{api.set(b.dataset.k,b.dataset.v);render(b.dataset.k);};});
 q('button[data-t]').forEach(b=>{st[b.dataset.t]=b.getAttribute('aria-pressed')==='true';b.onclick=()=>{api.tog(b.dataset.t,!st[b.dataset.t]);render(b.dataset.t);};});
 return api;
}
function onSize(el,node,fn){if(!window.ResizeObserver)return;if(el.__v2ro)el.__v2ro.disconnect();let w=0;const ro=new ResizeObserver(()=>{const nw=node.clientWidth;if(nw!==w){w=nw;fn();}});ro.observe(node);el.__v2ro=ro;}
const SCALE=[4,8,12,16,24,32,48,64];
const onScale=v=>v===0||SCALE.includes(v);
const snap=v=>v===0?0:SCALE.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);

/* ================= SPACE ================= */
window.VIZ['space']=[
{id:'space-box',title:'The box model, taken apart',terms:['Box model','Padding','Margin','border-box','Inset'],
 intro:'Every element on a screen is a box with four layers: the content, the padding around it, the border, and the margin outside. Together they are called the box model.',
 try:'Tap a layer to learn its name. Drag the sliders and watch the pixel numbers change.',
 html:K+`<div class="v2 vz-space-box"><style>
.vz-space-box .bx-hold{display:flex;justify-content:center;overflow:hidden;padding:4px 0}
.vz-space-box .bx-fig{display:flex;flex-direction:column;align-items:center;gap:6px;width:max-content;transform-origin:top center}
.vz-space-box .bx-r{position:relative;height:18px;border-inline:2px solid currentColor;transition:width .2s}
.vz-space-box .bx-r::before{content:'';position:absolute;left:0;right:0;top:8px;border-top:2px solid currentColor}
.vz-space-box .bx-r span{position:relative;display:block;width:max-content;margin:0 auto;padding:0 6px;background:#FFFDF7;font:700 11px/18px 'Space Mono',monospace;white-space:nowrap}
.vz-space-box .bx-r.over{color:#A3361A}
.vz-space-box .L{position:relative;cursor:pointer}
.vz-space-box .bx-m{background:repeating-linear-gradient(45deg,#FBE3D3 0 6px,#F7DCC4 6px 12px);border:2px dashed #AD4F16;border-radius:12px}
.vz-space-box .bx-b{width:180px;border-style:solid;border-color:#14261D;border-radius:10px;background:#D6E59A}
.vz-space-box .bx-c{background:#FFFDF7;outline:1.5px dashed #4A5A4F;font-size:15px;line-height:20px;color:#14261D}
.vz-space-box .bx-c small{display:block;font-size:13px;color:#4A5A4F}
.vz-space-box .bx-t{position:absolute;font:700 10px/1 'Space Mono',monospace;color:#14261D;background:#FFFDF7;border:1.5px solid #14261D;border-radius:4px;padding:2px 4px;white-space:nowrap;pointer-events:none;z-index:2}
.vz-space-box .tm{top:4px;left:6px}.vz-space-box .tp{top:4px;left:6px}.vz-space-box .tb{bottom:-11px;right:10px}
.vz-space-box [data-sel=margin] .tm,.vz-space-box [data-sel=padding] .tp,.vz-space-box [data-sel=border] .tb{background:#E8722C}
.vz-space-box [data-sel=margin] .bx-m,.vz-space-box [data-sel=padding] .bx-b,.vz-space-box [data-sel=content] .bx-c{box-shadow:0 0 0 3px #FFFDF7,0 0 0 6px #14261D}
.vz-space-box [data-sel=border] .bx-b{border-color:#E8722C}
</style>
<div class="v2-row" role="group" aria-label="Choose a layer">${CH('sel','content','Content')}${CH('sel','padding','Padding',1)}${CH('sel','border','Border')}${CH('sel','margin','Margin')}</div>
<div class="v2-stage"><div class="bx-hold"><div class="bx-fig" data-sel="padding">
<div class="bx-r" data-r="ask"><span>you set width: 180px</span></div>
<div class="L bx-m" data-layer="margin"><span class="bx-t tm">margin</span><div class="L bx-b" data-layer="border"><span class="bx-t tp">padding</span><span class="bx-t tb">border</span><div class="L bx-c" data-layer="content"><b>Order #2041</b><small>Tunde Adeyemi</small></div></div></div>
<div class="bx-r" data-r="real"><span>real width</span></div>
</div></div></div>
<p class="v2-note" data-o="def"></p>
<div class="v2-ctl">${SL('pad','Padding',0,40,4,20)}${SL('bw','Border',0,8,1,2)}${SL('mg','Margin',0,48,4,24)}</div>
<div><div class="v2-lab" style="margin-bottom:6px">How width is measured</div><div class="v2-row">${CH('bs','content-box','content-box (browser default)',1)}${CH('bs','border-box','border-box')}</div></div>
<p class="v2-note" data-o="sum"></p></div>`,
 init(el){
  const fig=el.querySelector('.bx-fig'),hold=el.querySelector('.bx-hold'),m=el.querySelector('.bx-m'),b=el.querySelector('.bx-b');
  const tm=el.querySelector('.tm'),tp=el.querySelector('.tp'),tb=el.querySelector('.tb'),rA=el.querySelector('[data-r=ask]'),rR=el.querySelector('[data-r=real]');
  const st={};const W=180;
  const DEF={content:'<b>Content</b> is the text or image itself. Every other layer is built around it.',
   padding:'<b>Padding</b> is the space inside the box, between its border and its content. The padding of a card or panel is also called its <b>inset</b>.',
   border:'<b>Border</b> is the line around the box. It has its own thickness, and that thickness adds to the size unless you use border-box.',
   margin:'<b>Margin</b> is the space outside the box. It is see-through and pushes neighbouring boxes away.'};
  const fit=()=>{fig.style.transform='none';const need=fig.offsetWidth,avail=hold.clientWidth;const s=Math.min(1,avail/need);fig.style.transform=s<1?`scale(${s})`:'none';hold.style.height=(fig.offsetHeight*s+8)+'px';};
  const render=()=>{
   const p=st.pad,bw=st.bw,mg=st.mg,bb=st.bs==='border-box';
   b.style.padding=p+'px';b.style.borderWidth=bw+'px';b.style.boxSizing=bb?'border-box':'content-box';m.style.padding=mg+'px';
   fig.dataset.sel=st.sel;
   const real=bb?W:W+2*p+2*bw,cont=bb?W-2*p-2*bw:W;
   tm.textContent='margin '+mg;tm.style.display=mg>=20?'':'none';tp.textContent='padding '+p;tp.style.display=p>=20?'':'none';tb.textContent='border '+bw;tb.style.display=bw>0?'':'none';
   rA.style.width=W+'px';rR.style.width=real+'px';rR.classList.toggle('over',real>W);
   rR.querySelector('span').textContent=real>W?`real width: ${real}px`:`real width: ${real}px, as asked`;
   api.out('pad',p+'px');api.out('bw',bw+'px');api.out('mg',mg+'px');
   const now={content:`It is ${cont}px wide right now.`,padding:`Right now: ${p}px on every side.`,border:`Right now: ${bw}px.`,margin:`Right now: ${mg}px on every side.`}[st.sel];
   api.out('def',DEF[st.sel]+' '+now);
   api.out('sum',bb?`<b>border-box:</b> padding and border now fit inside the 180px. The content shrinks to <b>${cont}px</b> instead. The size you set is the size you get, which is why designers ask for it everywhere.`
    :`<b>content-box:</b> 180 + padding 2×${p} + border 2×${bw} = <b>${real}px</b>. The box grew past the width you asked for. Switch to border-box to fix it. (Margin adds ${mg*2}px of space outside but never counts as width.)`);
   fit();
  };
  const api=wire(el,st,render);
  el.querySelectorAll('[data-layer]').forEach(x=>{x.onclick=e=>{e.stopPropagation();api.set('sel',x.dataset.layer);render();};});
  render();onSize(el,hold,fit);
 }},

{id:'space-scale',title:'The spacing scale ruler',terms:['Spacing scale','8-point grid','Rhythm'],
 intro:'A spacing scale is a short list of allowed values. On an 8-point grid they are mostly multiples of 8, plus 4 and 12 for small gaps. This card starts with random values, the way AI often writes them.',
 try:'Press "Snap to scale", then "Make it repeat". Or drag the sliders and watch values turn off-scale.',
 html:K+`<div class="v2 vz-space-scale"><style>
.vz-space-scale .sc-rule{display:flex;flex-wrap:wrap;gap:10px 12px;align-items:flex-end;margin-bottom:16px}
.vz-space-scale .sc-u{display:grid;justify-items:start;gap:4px}
.vz-space-scale .sc-u i{display:block;height:12px;background:#14261D;border-radius:2px}
.vz-space-scale .sc-u span{font:700 11px/1 'Space Mono',monospace;padding:3px 4px;border-radius:4px;border:1.5px solid transparent}
.vz-space-scale .sc-u.on i{background:#E8722C;box-shadow:0 0 0 1.5px #14261D}
.vz-space-scale .sc-u.on span{background:#D6E59A;border-color:#14261D}
.vz-space-scale .sc-card{max-width:250px;margin:0 auto;border:2px solid #14261D;border-radius:14px;background:#FFFDF7;position:relative}
.vz-space-scale .sc-in{background:#FFFDF7;position:relative}
.vz-space-scale .sc-in b{display:block;font-size:16px;line-height:20px}
.vz-space-scale .sc-in span{display:block;font-size:13px;line-height:18px;color:#4A5A4F}
.vz-space-scale .sc-btn{border:2px solid #14261D;border-radius:10px;padding:10px;text-align:center;font-weight:700;background:#E8722C}
.vz-space-scale .sc-sp{display:block;position:relative}
.vz-space-scale .sc-tag{position:absolute;right:-2px;top:50%;transform:translateY(-50%);font:700 10px/1 'Space Mono',monospace;background:#FFFDF7;border:1.5px solid #14261D;border-radius:4px;padding:2px 4px;z-index:2;white-space:nowrap}
.vz-space-scale .sc-tag.off{background:#F7DCC4;color:#14261D}
.vz-space-scale [data-show=true] .sc-sp.ok{background:#C9E0F2}
.vz-space-scale [data-show=true] .sc-sp.off{background:repeating-linear-gradient(45deg,#FBE3D3 0 4px,#F2BE98 4px 7px)}
.vz-space-scale [data-show=true] .sc-card.ok{background:#C9E0F2}
.vz-space-scale [data-show=true] .sc-card.off{background:repeating-linear-gradient(45deg,#FBE3D3 0 4px,#F2BE98 4px 7px)}
.vz-space-scale [data-show=false] .sc-tag{display:none}
.vz-space-scale .sc-pt{position:absolute;top:3px;left:4px}
</style>
<div class="v2-stage" data-show="true">
<div class="v2-lab" style="margin-bottom:8px">Your scale (8-point grid)</div>
<div class="sc-rule">${SCALE.map(v=>`<div class="sc-u" data-u="${v}"><i style="width:${v}px"></i><span>${v}</span></div>`).join('')}</div>
<div class="sc-card"><span class="sc-tag sc-pt" data-o="ptag"></span><div class="sc-in">
<b>Order #2041</b><i class="sc-sp" data-g="in1"><span class="sc-tag"></span></i><span>Tunde Adeyemi · Lagos</span>
<i class="sc-sp" data-g="bt1"><span class="sc-tag"></span></i>
<b>₦12,500</b><i class="sc-sp" data-g="in2"><span class="sc-tag"></span></i><span>Paid · 2 items</span>
<i class="sc-sp" data-g="bt2"><span class="sc-tag"></span></i>
<div class="sc-btn">Open order</div></div></div></div>
<div class="v2-row"><button type="button" class="v2-chip" data-act="snap">Snap to scale</button><button type="button" class="v2-chip" data-act="rep">Make it repeat</button><button type="button" class="v2-chip" data-act="ai">AI random</button>${TG('show','Show spacing',1)}</div>
<p class="v2-note" data-o="st"></p>
<div class="v2-ctl">${SL('pad','Card padding',0,64,1,13)}${SL('inn','Inside a group',0,32,1,3)}${SL('btw','Between groups',0,64,1,27)}</div></div>`,
 init(el){
  const stage=el.querySelector('.v2-stage'),card=el.querySelector('.sc-card');
  const st={};const V={pad:13,in1:3,in2:7,bt1:27,bt2:19};
  const render=k=>{
   if(k==='pad')V.pad=st.pad;if(k==='inn'){V.in1=V.in2=st.inn;}if(k==='btw'){V.bt1=V.bt2=st.btw;}
   stage.dataset.show=String(st.show);
   card.style.padding=V.pad+'px';card.classList.toggle('ok',onScale(V.pad));card.classList.toggle('off',!onScale(V.pad));
   el.querySelectorAll('.sc-sp').forEach(s=>{const v=V[s.dataset.g];s.style.height=v+'px';s.className='sc-sp '+(onScale(v)?'ok':'off');const t=s.firstChild;t.textContent=v+(onScale(v)?'':' off');t.className='sc-tag'+(onScale(v)?'':' off');});
   const pt=el.querySelector('.sc-pt');pt.textContent='padding '+V.pad+(onScale(V.pad)?'':' off');pt.className='sc-tag sc-pt'+(onScale(V.pad)?'':' off');pt.style.display=V.pad>=16?'':'none';
   const used=new Set(Object.values(V));el.querySelectorAll('.sc-u').forEach(u=>u.classList.toggle('on',used.has(+u.dataset.u)));
   api.out('pad',V.pad+'px'+(onScale(V.pad)?'':'*'));api.out('inn',V.in1===V.in2?V.in1+'px'+(onScale(V.in1)?'':'*'):'mixed');api.out('btw',V.bt1===V.bt2?V.bt1+'px'+(onScale(V.bt1)?'':'*'):'mixed');
   const vals=Object.values(V),on=vals.filter(onScale).length,steady=V.in1===V.in2&&V.bt1===V.bt2;
   let t=`On the scale: <b>${on} of 5</b> values. Rhythm: <b>${steady?'steady':'uneven'}</b>`+(steady?' (the same gaps repeat, so the eye can trust them).':` (gaps of ${V.in1} and ${V.in2} inside, ${V.bt1} and ${V.bt2} between).`);
   if(Math.max(V.in1,V.in2)>=Math.min(V.bt1,V.bt2))t+=' Careful: space inside a group should be smaller than space between groups, or the groups blur together.';
   else if(on===5&&steady)t+=' This is <b>rhythm</b>: values from one scale, repeated. It is why calm screens feel calm.';
   api.out('st',t);
  };
  const api=wire(el,st,render);
  const sync=()=>{api.val('pad',V.pad);api.val('inn',V.in1);api.val('btw',V.bt1);render();};
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  el.querySelectorAll('[data-act]').forEach(b=>{b.onclick=()=>{const a=b.dataset.act;
   if(a==='snap')Object.keys(V).forEach(k=>{V[k]=snap(V[k]);});
   if(a==='rep'){V.in2=V.in1;V.bt2=V.bt1;}
   if(a==='ai'){V.pad=pick([10,13,14,18,22,26]);V.in1=pick([2,3,5,7]);V.in2=pick([3,6,9]);V.bt1=pick([15,19,21,27]);V.bt2=pick([13,17,22,29]);}
   sync();};});
  render();
 }},

{id:'space-prox',title:'Proximity: space makes groups',terms:['Proximity','Gap'],
 intro:'Things that sit close together are read as related. This is called proximity. In code, the space between items is called the gap; here there are two gaps to choose.',
 try:'Drag the two sliders until the gaps are equal, then flip them. Watch which label belongs to which box.',
 html:K+`<div class="v2 vz-space-prox"><style>
.vz-space-prox .px-form{position:relative;max-width:290px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:16px}
.vz-space-prox .px-l{display:block;font-size:13px;font-weight:700;line-height:16px;position:relative;z-index:1}
.vz-space-prox .px-f{height:40px;border:2px solid #14261D;border-radius:8px;background:#fff;font-size:14px;color:#4A5A4F;padding:0 10px;display:flex;align-items:center;position:relative;z-index:1}
.vz-space-prox .px-g{position:absolute;left:7px;right:7px;border:2.5px dashed #AD4F16;border-radius:10px;pointer-events:none;background:rgba(214,229,154,.35);transition:top .2s,height .2s}
.vz-space-prox .px-g.bad{background:rgba(247,220,196,.55)}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="px-form"><div class="px-ov"></div>
<span class="px-l">First name</span><div class="px-f">Adaeze</div>
<span class="px-l">Last name</span><div class="px-f">Okafor</div>
<span class="px-l">Phone number</span><div class="px-f">0803 000 0000</div></div></div>
<div class="v2-row">${CH('pre','good','Clear groups',1)}${CH('pre','eq','Equal gaps')}${CH('pre','flip','Flipped')}${TG('grp','Show what the eye groups',1)}</div>
<p class="v2-note" data-o="st"></p>
<div class="v2-ctl">${SL('in','Label to its field',0,32,2,4)}${SL('bt','Field to next label',0,40,2,24)}</div></div>`,
 init(el){
  const form=el.querySelector('.px-form'),ov=el.querySelector('.px-ov');const L=[...el.querySelectorAll('.px-l')],F=[...el.querySelectorAll('.px-f')];const st={};
  const P={good:[4,24],eq:[14,14],flip:[24,4]};
  const render=k=>{
   if(k==='pre'){api.val('in',P[st.pre][0]);api.val('bt',P[st.pre][1]);}
   else if(k==='in'||k==='bt'){const m=Object.keys(P).find(x=>P[x][0]===st.in&&P[x][1]===st.bt);api.set('pre',m||'');}
   L.forEach(l=>{l.style.marginBottom=st.in+'px';});F.forEach((f,i)=>{f.style.marginBottom=i<2?st.bt+'px':'0';});
   api.out('in',st.in+'px');api.out('bt',st.bt+'px');
   const d=st.bt-st.in,state=d>2?'good':d<-2?'flip':'eq';
   const it=[L[0],F[0],L[1],F[1],L[2],F[2]];
   const groups=state==='good'?[[0,1],[2,3],[4,5]]:state==='eq'?[[0,5]]:[[0,0],[1,2],[3,4],[5,5]];
   const sep=state==='good'?st.bt:state==='flip'?st.in:20;const pad=Math.max(1,Math.min(6,sep/2-1));
   ov.innerHTML=st.grp?groups.map(([a,z])=>{const t=it[a].offsetTop-pad,bt=it[z].offsetTop+it[z].offsetHeight+pad;return `<div class="px-g ${state==='good'?'':'bad'}" style="top:${t}px;height:${bt-t}px"></div>`;}).join(''):'';
   api.out('st',{good:'<b>Clear.</b> Each label sits closer to its own field than to the next one, so the eye reads three neat pairs. Space inside a group is smaller than space between groups.',
    eq:'<b>Ambiguous.</b> The same gap everywhere means no groups at all, just one long list. People have to read carefully to know which label goes with which box.',
    flip:'<b>Wrong groups.</b> Each label is now closer to the field above it. "Last name" looks like it belongs to "Adaeze". People will type into the wrong box.'}[state]);
  };
  const api=wire(el,st,render);render();onSize(el,form,render);
 }},

{id:'space-dense',title:'White space and density',terms:['White space','Density'],
 intro:'White space is the empty space around and between things. Density is how tightly a screen is packed. The same list can feel cramped, comfortable or airy just by changing spacing.',
 try:'Drag from cramped to airy. Notice when it stops feeling stressful.',
 html:K+`<div class="v2 vz-space-dense"><style>
.vz-space-dense .dn-scr{max-width:320px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;transition:padding .2s}
.vz-space-dense .dn-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;letter-spacing:-.02em;line-height:1.1;margin:0}
.vz-space-dense .dn-sub{font-size:13px;color:#4A5A4F;margin:0}
.vz-space-dense .dn-row{display:flex;align-items:center;gap:10px;border-top:1.5px solid #E2DCCB;transition:padding .2s}
.vz-space-dense .dn-av{width:28px;height:28px;border-radius:50%;border:2px solid #14261D;flex:none}
.vz-space-dense .dn-n{flex:1;min-width:0;font-size:14px;font-weight:600}
.vz-space-dense .dn-n small{display:block;font-weight:400;font-size:12px;color:#4A5A4F}
.vz-space-dense .dn-a{font-weight:700;font-size:14px;font-variant-numeric:tabular-nums}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="dn-scr"><p class="dn-h">Recent payments</p><p class="dn-sub">Today, 4 customers</p><div class="dn-list">
${[['Kemi Bello','Shoes · 2 items','₦18,000','#D6E59A'],['Musa Ibrahim','Rice, 50kg bag','₦72,500','#C9E0F2'],['Ada Nwosu','Ankara fabric','₦9,200','#F7DCC4'],['Femi Ade','Data bundle','₦3,000','#F6D7E8']].map(r=>`<div class="dn-row"><i class="dn-av" style="background:${r[3]}"></i><div class="dn-n">${r[0]}<small>${r[1]}</small></div><div class="dn-a">${r[2]}</div></div>`).join('')}
</div></div></div>
<div class="v2-row">${CH('pre','1','Compact')}${CH('pre','2','Comfortable')}${CH('pre','4','Airy')}</div>
<div class="v2-ctl">${SL('d','Space',0,4,1,0,'')}</div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const scr=el.querySelector('.dn-scr'),sub=el.querySelector('.dn-sub'),h=el.querySelector('.dn-h'),list=el.querySelector('.dn-list'),rows=[...el.querySelectorAll('.dn-row')];const st={};
  const N=['Cramped','Compact','Comfortable','Spacious','Airy'],pad=[4,12,16,24,32],hg=[2,8,16,24,32],rp=[0,4,8,12,16],tg=[0,2,4,4,8],lh=[1.1,1.3,1.4,1.45,1.5];
  const T=['<b>Cramped.</b> Text nearly touches the edges and rows crash into each other. It feels stressful, even if nobody can say why. This is what AI often ships.',
   '<b>Compact.</b> Many rows fit on one screen. Good for data-heavy tools that experts use all day; tiring for everything else.',
   '<b>Comfortable.</b> The right default for most apps: easy to read, still efficient.',
   '<b>Spacious.</b> More white space makes each row feel considered. Good for lists people read slowly.',
   '<b>Airy.</b> Generous white space feels calm and premium. Best for marketing pages and moments of focus, but you see fewer rows.'];
  const render=k=>{
   if(k==='pre')api.val('d',+st.pre);
   const i=st.d;api.set('pre',[1,2,4].includes(i)?String(i):'');
   scr.style.padding=pad[i]+'px';sub.style.marginTop=tg[i]+'px';list.style.marginTop=hg[i]+'px';
   rows.forEach(r=>{r.style.padding=rp[i]+'px 0';r.style.lineHeight=lh[i];});
   api.out('d',N[i]);
   api.out('st',T[i]+` <span style="font-family:'Space Mono',monospace;font-size:12px">padding ${pad[i]} · row ${rows[0].offsetHeight}px</span>`);
  };
  const api=wire(el,st,render);render();
 }}
];

/* ================= LAYOUT ================= */
const LG={
 even:[{s:[3,3,2],h:22,bg:'#FFFDF7'},{s:[6,3,0],sp:1},{s:[3,2,2],h:22,bg:'#E8722C'},{s:[12,8,4],h:54,bg:'#D6E59A'},{s:[4,4,4],h:44,bg:'#C9E0F2'},{s:[4,4,4],h:44,bg:'#C9E0F2'},{s:[4,8,4],h:44,bg:'#C9E0F2'}],
 asym:[{s:[3,3,2],h:22,bg:'#FFFDF7'},{s:[6,3,0],sp:1},{s:[3,2,2],h:22,bg:'#E8722C'},{s:[7,5,4],h:76,bg:'#D6E59A'},{s:[5,3,4],h:76,bg:'#C9E0F2'},{s:[8,5,4],h:40,bg:'#F7DCC4'},{s:[4,3,4],h:40,bg:'#F6D7E8'}],
 bento:[{s:[3,3,2],h:22,bg:'#FFFDF7'},{s:[6,3,0],sp:1},{s:[3,2,2],h:22,bg:'#E8722C'},{s:[8,5,4],r:2,bg:'#D6E59A'},{s:[4,3,2],h:40,bg:'#C9E0F2'},{s:[4,3,2],h:40,bg:'#F6D7E8'},{s:[4,4,2],h:40,bg:'#F7DCC4'},{s:[8,4,2],h:40,bg:'#FFFDF7'}]
};
window.VIZ['layout']=[
{id:'layout-grid',title:'A 12-column grid, made visible',terms:['Grid','Column','Gutter','Bento grid','Asymmetry'],
 intro:'A grid is a set of invisible columns. Each column is a vertical lane, and the gutter is the gap between two columns. Every block on this page starts and ends on a column edge.',
 try:'Switch layouts and column counts, drag the gutter, and tap any orange column to count it.',
 html:K+`<div class="v2 vz-lay-grid"><style>
.vz-lay-grid .lg-pg{position:relative;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:24px 0 14px;overflow:hidden}
.vz-lay-grid .lg-g{display:grid;position:relative;z-index:1;grid-auto-rows:minmax(22px,auto)}
.vz-lay-grid .lg-b{border:2px solid #14261D;border-radius:8px;display:flex;align-items:flex-end;padding:3px 5px;min-width:0;overflow:hidden;font:700 10px/1 'Space Mono',monospace;color:#14261D;white-space:nowrap}
.vz-lay-grid .lg-ov{position:absolute;inset:0;z-index:2;display:grid;transition:opacity .2s}
.vz-lay-grid .lg-ov i{background:rgba(232,114,44,.09);border-inline:1px dashed rgba(173,79,22,.75);cursor:pointer;display:flex;align-items:flex-start;justify-content:center;font:700 9px/1 'Space Mono',monospace;font-style:normal;color:#14261D;padding-top:2px}
.vz-lay-grid .lg-ov i.on{background:rgba(232,114,44,.35);border-inline-style:solid}
.vz-lay-grid .lg-pg[data-grid=false] .lg-ov{opacity:0;pointer-events:none}
.vz-lay-grid .lg-mg{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(45deg,#FBE3D3 0 5px,#FFFDF7 5px 10px)}
</style>
<div class="v2-stage" style="background:#F4F0E5;padding:12px"><div class="lg-pg" data-grid="true"><i class="lg-mg" style="left:0"></i><i class="lg-mg" style="right:0"></i><div class="lg-g"></div><div class="lg-ov"></div></div></div>
<div class="v2-row" role="group" aria-label="Layout">${CH('lay','even','Even thirds',1)}${CH('lay','asym','Asymmetric')}${CH('lay','bento','Bento')}</div>
<div class="v2-row" role="group" aria-label="Columns">${CH('cols','12','12 columns',1)}${CH('cols','8','8')}${CH('cols','4','4')}${TG('grid','Show grid',1)}</div>
<p class="v2-note" data-o="st"></p>
<div class="v2-ctl">${SL('g','Gutter',4,32,4,12)}${SL('m','Side margin',0,32,4,16)}</div></div>`,
 init(el){
  const pg=el.querySelector('.lg-pg'),g=el.querySelector('.lg-g'),ov=el.querySelector('.lg-ov'),mg=el.querySelectorAll('.lg-mg');const st={};let colNote='';
  const NOTE={even:'<b>Even thirds.</b> Three cards of 4 columns each. Calm and predictable.',asym:'<b>Asymmetry.</b> Words take 7 columns, the picture takes 5. Unequal on purpose, but still on the grid, so it feels lively, not messy.',bento:'<b>Bento grid.</b> Cards of different sizes fitted into one tidy grid, like a lunch box. Every edge still lands on a column line.'};
  const render=k=>{
   if(k!=='col')colNote='';
   const c=+st.cols,ci=c===12?0:c===8?1:2;
   pg.dataset.grid=String(st.grid);
   [g,ov].forEach(x=>{x.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`;x.style.columnGap=st.g+'px';x.style.padding=`0 ${st.m}px`;});
   g.style.rowGap=Math.min(st.g,16)+'px';ov.style.padding=`0 ${st.m}px`;
   mg.forEach(x=>{x.style.width=st.m+'px';});
   g.innerHTML=LG[st.lay].map(b=>{const s=b.s[ci];if(!s)return'';if(b.sp)return `<div style="grid-column:span ${s}"></div>`;return `<div class="lg-b" style="grid-column:span ${s};${b.r?'grid-row:span '+b.r+';':'height:'+b.h+'px;'}background:${b.bg}">${s>1||c<12?'span '+s:s}</div>`;}).join('');
   if(ov.children.length!==c){ov.innerHTML=Array.from({length:c},(_,i)=>`<i role="button" tabindex="0" aria-label="Column ${i+1}">${i+1}</i>`).join('');
    [...ov.children].forEach((x,i)=>{x.onclick=x.onkeydown=e=>{if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;e.preventDefault&&e.preventDefault();[...ov.children].forEach(y=>y.classList.remove('on'));x.classList.add('on');colNote=`<b>Column ${i+1} of ${c}.</b> A column is one vertical lane. The plain strips between the orange lanes are the <b>gutters</b>, all exactly ${st.g}px. `;render('col');};});}
   api.out('g',st.g+'px');api.out('m',st.m+'px');
   api.out('st',colNote+NOTE[st.lay]+` <b>${c} columns</b>, ${st.g}px gutters, ${st.m}px side margins.`);
  };
  const api=wire(el,st,render);render();
 }},

{id:'layout-align',title:'Alignment: the invisible edges',terms:['Alignment'],
 intro:'Alignment means the edges of different elements line up on shared lines. When it is right, nobody notices. When it is a few pixels off, everyone feels it.',
 try:'Switch between Aligned, Almost and Messy, then nudge the button a couple of pixels.',
 html:K+`<div class="v2 vz-lay-align"><style>
.vz-lay-align .al-card{position:relative;max-width:300px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.vz-lay-align .al-i{position:relative;z-index:1;max-width:100%;transition:margin .2s}
.vz-lay-align .al-img{width:100%;height:70px;border:2px solid #14261D;border-radius:10px;background:#C9E0F2}
.vz-lay-align .al-eb{font:700 11px/1 'Space Mono',monospace;letter-spacing:1.5px;color:#AD4F16}
.vz-lay-align .al-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.1;letter-spacing:-.02em;max-width:230px}
.vz-lay-align .al-p{font-size:14px;color:#4A5A4F;max-width:240px}
.vz-lay-align .al-btn{border:2px solid #14261D;border-radius:10px;background:#E8722C;font-weight:700;padding:10px 18px}
.vz-lay-align .al-ln{position:absolute;top:0;bottom:0;width:0;border-left:2px dashed #AD4F16;z-index:2;pointer-events:none}
.vz-lay-align .al-ct{position:absolute;top:-2px;right:-2px;font:700 10px/1 'Space Mono',monospace;background:#14261D;color:#FFFDF7;border-radius:0 12px 0 8px;padding:5px 8px;z-index:3}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="al-card"><div class="al-lines"></div><span class="al-ct"></span>
<div class="al-i al-img"></div><div class="al-i al-eb">NEW · FOR SHOPS</div><div class="al-i al-h">Sell on WhatsApp in minutes</div><div class="al-i al-p">Share one link, take payment and track every order in one place.</div><div class="al-i al-btn">Start free</div></div></div>
<div class="v2-row">${CH('mode','al','Aligned',1)}${CH('mode','almost','Almost')}${CH('mode','messy','Messy')}${TG('edges','Show edges',1)}</div>
<div class="v2-ctl">${SL('n','Nudge the button',0,8,1,0)}</div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const card=el.querySelector('.al-card'),lines=el.querySelector('.al-lines'),ct=el.querySelector('.al-ct');const I=[...el.querySelectorAll('.al-i')];const st={};
  const M={al:[0,0,0,0,0],almost:[0,3,0,2,5],messy:['c86',0,'c',14,'c']};
  const render=()=>{
   M[st.mode].forEach((v,i)=>{const x=I[i];x.style.alignSelf='';x.style.textAlign='';x.style.marginLeft='0';x.style.width='';
    if(typeof v==='string'){x.style.alignSelf='center';x.style.textAlign='center';if(v==='c86')x.style.width='86%';}else x.style.marginLeft=v+'px';});
   I[4].style.marginLeft=(parseFloat(I[4].style.marginLeft)||0)+st.n+'px';
   const cl=card.getBoundingClientRect().left+card.clientLeft;const xs=[];
   I.forEach(x=>{const v=Math.round((x.getBoundingClientRect().left-cl)*2)/2;if(!xs.some(a=>Math.abs(a-v)<0.75))xs.push(v);});
   lines.innerHTML=st.edges?xs.map(x=>`<i class="al-ln" style="left:${x-1}px"></i>`).join(''):'';
   ct.textContent=xs.length+(xs.length>1?' left edges':' left edge');ct.style.display=st.edges?'':'none';
   api.out('n',st.n+'px');
   const spread=Math.max(...xs)-Math.min(...xs);
   api.out('st',xs.length===1?'<b>One shared left edge.</b> Everything hangs from the same invisible line, so the card feels calm and deliberate.'
    :spread<=10&&st.mode!=='messy'?`<b>${xs.length} left edges, only a few pixels apart.</b> Nearly aligned looks like a mistake. People feel it even when they cannot say why. Snap everything to one line.`
    :`<b>${xs.length} different left edges.</b> Mixing centred and left-aligned items, with random indents, leaves the eye nowhere to rest.`);
  };
  const api=wire(el,st,render);render();onSize(el,card,render);
 }},

{id:'layout-container',title:'Container, breakpoints, the fold',terms:['Container / max-width','Breakpoint','Responsive','Above the fold'],
 intro:'One page, shown on screens from a phone to a wide monitor. The layout changes at breakpoints, the content stops growing at its max-width, and the dashed line marks the fold: what you see before scrolling.',
 try:'Drag the screen width from phone to wide. Then turn the max-width off on a wide screen.',
 html:K+`<div class="v2 vz-lay-ct"><style>
.vz-lay-ct .ct-view{position:relative;margin:0 auto;border:2px solid #14261D;border-radius:10px;overflow:hidden;background:#FFFDF7}
.vz-lay-ct .ct-pg{position:absolute;left:0;top:0;transform-origin:0 0;background:repeating-linear-gradient(45deg,#FBE3D3 0 10px,#FFFDF7 10px 20px);font-family:'Instrument Sans',sans-serif;color:#14261D}
.vz-lay-ct .ct-c{margin:0 auto;background:#FFFDF7;padding-bottom:40px}
.vz-lay-ct .ct-nav{display:flex;align-items:center;gap:24px;padding:22px 0}
.vz-lay-ct .ct-logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px}
.vz-lay-ct .ct-links{display:flex;gap:20px;margin-left:auto}.vz-lay-ct .ct-links i{width:70px;height:12px;border-radius:4px;background:#4A5A4F}
.vz-lay-ct .ct-cta{border:2px solid #14261D;border-radius:10px;padding:10px 18px;font-weight:700;background:#E8722C}
.vz-lay-ct .ct-burger{margin-left:auto;width:34px;height:24px;border-block:4px solid #14261D;position:relative}.vz-lay-ct .ct-burger::after{content:'';position:absolute;left:0;right:0;top:6px;border-top:4px solid #14261D}
.vz-lay-ct .ct-hero{display:grid;gap:32px;align-items:center;padding:24px 0 40px}
.vz-lay-ct .ct-hero h4{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-.02em;line-height:1.05;margin:0 0 16px}
.vz-lay-ct .ct-hero p{margin:0 0 22px;line-height:1.5;color:#4A5A4F}
.vz-lay-ct .ct-btn{display:inline-block;border:2px solid #14261D;border-radius:12px;padding:14px 24px;font-weight:700;background:#E8722C;font-size:18px}
.vz-lay-ct .ct-vis{height:300px;border:2px solid #14261D;border-radius:18px;background:#C9E0F2}
.vz-lay-ct .ct-cards{display:grid;gap:24px}.vz-lay-ct .ct-cards div{height:170px;border:2px solid #14261D;border-radius:16px;background:#D6E59A}
.vz-lay-ct .ct-cards div:nth-child(2n){background:#F7DCC4}
.vz-lay-ct .ct-foot{margin-top:40px;padding:40px;border:2px solid #14261D;border-radius:18px;background:#F6D7E8;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between;font-size:26px}.vz-lay-ct .ct-foot span{display:flex;gap:20px}.vz-lay-ct .ct-foot i{width:90px;height:28px;border-radius:6px;background:#4A5A4F}
.vz-lay-ct .ct-fold{position:absolute;left:0;right:0;border-top:2.5px dashed #14261D;z-index:3}
.vz-lay-ct .ct-fold span{position:absolute;right:6px;bottom:4px;font:700 10px/1 'Space Mono',monospace;background:#14261D;color:#FFFDF7;padding:4px 6px;border-radius:4px;white-space:nowrap}
.vz-lay-ct .ct-veil{position:absolute;left:0;right:0;bottom:0;background:rgba(244,240,229,.72);z-index:2}
.vz-lay-ct .ct-bpw{position:relative;margin-top:14px;padding-bottom:12px}.vz-lay-ct .ct-bp{display:flex;border:2px solid #14261D;border-radius:8px;overflow:hidden}
.vz-lay-ct .ct-bp span{font:700 10px/1 'Space Mono',monospace;padding:7px 4px;text-align:center;border-right:2px solid #14261D;background:#FFFDF7;min-width:0;overflow:hidden;white-space:nowrap}
.vz-lay-ct .ct-bp span:last-of-type{border-right:0}.vz-lay-ct .ct-bp span.on{background:#D6E59A}
.vz-lay-ct .ct-mk{position:absolute;bottom:0;width:0;height:0;margin-left:-7px;border:7px solid transparent;border-top:0;border-bottom:10px solid #14261D;transition:left .15s}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="ct-view"><div class="ct-pg"><div class="ct-c">
<div class="ct-nav"><b class="ct-logo">Shoplink</b><span class="ct-links"><i></i><i></i><i></i></span><span class="ct-cta">Sign up</span><span class="ct-burger"></span></div>
<div class="ct-hero"><div class="ct-txt"><h4>Sell on WhatsApp in minutes</h4><p>Share one link, take payment and track every order in one place, so you spend less time chasing customers and more time growing your shop.</p><span class="ct-btn">Start free</span></div><div class="ct-vis"></div></div>
<div class="ct-cards"><div></div><div></div><div></div><div></div><div></div><div></div></div><div class="ct-foot"><b>Trusted by 2,000 shops</b><span><i></i><i></i><i></i><i></i></span></div></div></div>
<div class="ct-veil"></div><div class="ct-fold"><span>THE FOLD</span></div></div>
<div class="ct-bpw"><div class="ct-bp"><span data-z="Phone" style="flex:280">Phone</span><span data-z="Tablet" style="flex:424">Tablet 600+</span><span data-z="Desktop" style="flex:576">Desktop 1024+</span></div><i class="ct-mk"></i></div></div>
<div class="v2-row" role="group" aria-label="Screen">${CH('pre','375','Phone')}${CH('pre','768','Tablet')}${CH('pre','1280','Laptop',1)}${CH('pre','1600','Wide')}</div>
<div class="v2-ctl">${SL('w','Screen width',320,1600,10,1280)}${SL('mx','Max-width',720,1440,40,1120)}</div>
<div class="v2-row">${TG('on','Use a max-width container',1)}</div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const $=s=>el.querySelector(s);const view=$('.ct-view'),pg=$('.ct-pg'),c=$('.ct-c'),hero=$('.ct-hero'),h4=$('.ct-hero h4'),p=$('.ct-hero p'),cards=$('.ct-cards'),fold=$('.ct-fold'),veil=$('.ct-veil'),mk=$('.ct-mk'),stage=$('.v2-stage');
  const links=$('.ct-links'),cta=$('.ct-cta'),burger=$('.ct-burger'),mxIn=el.querySelector('input[data-k=mx]');const st={};
  const render=k=>{
   if(k==='pre')api.val('w',+st.pre);
   if(k==='w')api.set('pre',['375','768','1280','1600'].includes(String(st.w))?String(st.w):'');
   const W=st.w,bp=W<600?'Phone':W<1024?'Tablet':'Desktop',mg=W<600?16:W<1024?32:48;
   const cols=bp==='Phone'?4:bp==='Tablet'?8:12;
   const cw=st.on?Math.min(W-2*mg,st.mx):W-2*mg;
   pg.style.width=W+'px';pg.style.padding=`0 ${mg}px`;c.style.maxWidth=st.on?st.mx+'px':'none';
   hero.style.gridTemplateColumns=bp==='Desktop'?'7fr 5fr':'1fr';h4.style.fontSize=(bp==='Phone'?32:bp==='Tablet'?42:52)+'px';p.style.fontSize=(bp==='Phone'?16:18)+'px';
   cards.style.gridTemplateColumns=`repeat(${bp==='Phone'?1:bp==='Tablet'?2:3},1fr)`;
   links.style.display=cta.style.display=bp==='Phone'?'none':'';burger.style.display=bp==='Phone'?'':'none';
   const H=bp==='Phone'?Math.round(W*16/9):bp==='Tablet'?Math.round(W*4/3):Math.round(W*.625);
   const avail=stage.clientWidth-36;const S=Math.min(1,avail/W,380/H);
   pg.style.transform=`scale(${S})`;c.style.outline=`${(2/S).toFixed(2)}px dashed #AD4F16`;
   const pgH=pg.offsetHeight,showH=Math.min(pgH,H+110/S);
   view.style.width=(W*S+4)+'px';view.style.height=(showH*S+4)+'px';
   const below=pgH>H;fold.style.display=veil.style.display=below?'':'none';fold.style.top=(H*S)+'px';veil.style.top=(H*S)+'px';
   el.querySelectorAll('.ct-bp span').forEach(s=>s.classList.toggle('on',s.dataset.z===bp));mk.style.left=((W-320)/1280*100)+'%';
   mxIn.disabled=!st.on;api.out('w',W+'px');api.out('mx',st.on?st.mx+'px':'off');
   const cpl=Math.round(p.offsetWidth/(parseFloat(p.style.fontSize)*.5));
   const how={Phone:'Cards stack into one column and the menu folds into a button.',Tablet:'Two cards per row; the hero still stacks.',Desktop:'The hero splits 7 + 5 and cards sit three per row.'}[bp];
   api.out('st',`<b>${bp}</b> breakpoint · ${cols} columns · content <b>${cw}px</b> wide. ${how} That rearranging is what <b>responsive</b> means. Text lines are about <b>${cpl} characters</b>: ${cpl>85?'too long; the eye loses its place going back to the next line. A max-width fixes this.':'comfortable to read.'}${below?' Everything under the dashed line is <b>below the fold</b>: only seen after scrolling.':''}`);
  };
  const api=wire(el,st,render);render();onSize(el,stage,render);
 }},

{id:'layout-patterns',title:'Reading paths and layout patterns',terms:['F-pattern / Z-pattern','Visual weight'],
 intro:'People do not read screens line by line; their eyes follow common paths. And some layouts keep part of the screen fixed while the rest stretches. Pick a pattern to see it.',
 try:'Switch patterns. In Sidebar, drag the window width. In Balance, change the image weight and watch the seesaw.',
 html:K+`<div class="v2 vz-lay-pat"><style>
.vz-lay-pat .pt-scr{position:relative;height:220px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:12px;overflow:hidden;transition:width .2s}
.vz-lay-pat .pt-scr svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.vz-lay-pat .pt-scr line{stroke:#E8722C;stroke-width:4;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0}
.vz-lay-pat .pt-anim line{stroke-dashoffset:1;animation:ptd .45s ease-out forwards}
@keyframes ptd{to{stroke-dashoffset:0}}
.vz-lay-pat .pt-dot{position:absolute;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:#E8722C;border:2px solid #14261D;font:700 11px/20px 'Space Mono',monospace;text-align:center;color:#14261D;z-index:2}
.vz-lay-pat .pt-tag{position:absolute;font:700 10px/1 'Space Mono',monospace;padding:4px 6px;border-radius:4px;white-space:nowrap;z-index:2}
.vz-lay-pat .pt-saw{position:relative;height:74px;margin:14px auto 0;max-width:280px}
.vz-lay-pat .pt-beam{position:absolute;left:0;right:0;top:22px;height:10px;background:#14261D;border-radius:5px;transition:transform .35s cubic-bezier(.2,.8,.2,1);transform-origin:50% 50%}
.vz-lay-pat .pt-beam b{position:absolute;bottom:12px;font:700 10px/1 'Space Mono',monospace;background:#FFFDF7;border:1.5px solid #14261D;border-radius:4px;padding:3px 5px}
.vz-lay-pat .pt-piv{position:absolute;left:50%;top:32px;margin-left:-16px;border:16px solid transparent;border-bottom:28px solid #E8722C;border-top:0;filter:drop-shadow(0 0 0 #14261D)}
</style>
<div class="v2-row" role="group" aria-label="Pattern">${CH('p','f','F-pattern',1)}${CH('p','z','Z-pattern')}${CH('p','side','Sidebar + content')}${CH('p','bal','Balance')}</div>
<div class="v2-stage" style="background:#F4F0E5"><div class="pt-scr"></div><div class="pt-saw" hidden><div class="pt-beam"><b style="left:0">TEXT SIDE</b><b style="right:0">IMAGE SIDE</b></div><i class="pt-piv"></i></div></div>
<div class="v2-ctl" data-only="side" hidden>${SL('ww','Window width',55,100,5,100,'%')}</div>
<div class="v2-ctl" data-only="bal" hidden>${SL('wt','Image weight',1,5,1,1,'')}</div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const scr=el.querySelector('.pt-scr'),saw=el.querySelector('.pt-saw'),beam=el.querySelector('.pt-beam');const st={};let last='';
  const bar=(w,h,c,s='')=>`<div style="width:${w};height:${h}px;background:${c};border-radius:3px;${s}"></div>`;
  const dots=(pts,lines)=>`<svg aria-hidden="true">${lines.map((l,i)=>`<line pathLength="1" x1="${l[0]}%" y1="${l[1]}" x2="${l[2]}%" y2="${l[3]}" style="animation-delay:${i*.35}s"/>`).join('')}</svg>`+pts.map((p,i)=>`<span class="pt-dot" style="left:${p[0]}%;top:${p[1]}px">${i+1}</span>`).join('');
  const row=`<div style="margin-bottom:11px">${bar('72%',9,'#14261D')}<div style="height:6px"></div>${bar('94%',5,'#9AA39C')}<div style="height:4px"></div>${bar('62%',5,'#9AA39C')}</div>`;
  const V={
   f:()=>`<div style="padding:12px 14px"><div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">${bar('40px',12,'#14261D')}<div style="flex:1;height:20px;border:2px solid #14261D;border-radius:99px"></div></div>${row+row+row+row}</div>`+dots([[7,48],[80,48],[7,88],[52,88],[7,190]],[[7,48,80,48],[7,88,52,88],[7,48,7,190]]),
   z:()=>`<div style="padding:14px;display:flex;flex-direction:column;height:100%"><div style="display:flex;justify-content:space-between;align-items:center">${bar('54px',14,'#14261D')}<div style="border:2px solid #14261D;border-radius:6px;background:#FFFDF7;width:56px;height:22px"></div></div><div style="flex:1;margin:14px 0;border:2px solid #14261D;border-radius:10px;background:#C9E0F2"></div><div style="display:flex;justify-content:space-between;align-items:flex-end"><div>${bar('120px',12,'#14261D')}<div style="height:6px"></div>${bar('90px',6,'#9AA39C')}</div><div style="border:2px solid #14261D;border-radius:8px;background:#E8722C;width:76px;height:30px"></div></div></div>`+dots([[9,25],[88,25],[9,180],[86,188]],[[9,25,88,25],[88,25,9,180],[9,180,86,188]]),
   side:()=>`<div style="display:flex;height:100%"><div style="width:56px;flex:none;background:#14261D;padding:14px 12px;display:grid;gap:12px;align-content:start">${'<i style="height:28px;border:2px solid #D6E59A;border-radius:8px"></i>'.repeat(4)}</div><div style="flex:1;min-width:0;padding:14px"><div style="height:14px;width:50%;background:#14261D;border-radius:3px;margin-bottom:14px"></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:10px">${'<i style="height:56px;border:2px solid #14261D;border-radius:8px;background:#D6E59A"></i>'.repeat(8)}</div></div></div><span class="pt-tag" style="left:4px;bottom:8px;background:#D6E59A;color:#14261D;border:1.5px solid #14261D">FIXED 56</span><span class="pt-tag pt-fl" style="right:8px;bottom:8px;background:#14261D;color:#FFFDF7"></span>`,
   bal:()=>{const w=st.wt,cl=['#EEF4F9','#C9E0F2','#8DB8DB','#3E6E95','#14261D'][w-1],hh=[40,52,66,82,100][w-1];return `<div style="display:grid;grid-template-columns:7fr 5fr;gap:14px;align-items:center;height:100%;padding:16px"><div>${bar('50px',8,'#AD4F16')}<div style="height:10px"></div>${bar('92%',16,'#14261D')}<div style="height:6px"></div>${bar('70%',16,'#14261D')}<div style="height:12px"></div>${bar('86%',6,'#9AA39C')}<div style="height:5px"></div>${bar('60%',6,'#9AA39C')}<div style="height:14px"></div><div style="width:84px;height:28px;border:2px solid #14261D;border-radius:8px;background:#E8722C"></div></div><div style="display:flex;align-items:center;justify-content:center;height:100%"><div style="width:${hh}%;height:${hh}%;background:${cl};border:2px solid #14261D;border-radius:12px;transition:all .3s"></div></div></div>`;}
  };
  const N={f:'<b>F-pattern.</b> On text-heavy pages (articles, search results, lists) people read across the first lines, then scan down the left edge. Put the important words at the start of every line and heading.',
   z:'<b>Z-pattern.</b> On simple pages with little text, the eye goes top-left, across, diagonally down, and across again. Put your logo at the start and your main button at the end of the Z.'};
  const render=k=>{
   const m=st.p;el.querySelectorAll('[data-only]').forEach(x=>{x.hidden=x.dataset.only!==m;});saw.hidden=m!=='bal';
   scr.style.width=m==='side'?st.ww+'%':'100%';
   scr.innerHTML=V[m]();
   scr.classList.toggle('pt-anim',!!scr.querySelector('svg')&&last!==m&&!RM());
   last=m;api.out('ww',st.ww+'%');api.out('wt',['faint','light','even','heavy','huge'][st.wt-1]);
   if(m==='side'){const fl=scr.querySelector('.pt-fl');fl.textContent='FLUID '+Math.round(scr.clientWidth-56);api.out('st','<b>Sidebar + content.</b> The sidebar keeps a fixed width; the content area is fluid and stretches to fill the rest. Drag the window: only the content changes, and its cards reflow.');}
   else if(m==='bal'){beam.style.transform=`rotate(${(st.wt-3)*5}deg)`;api.out('st',['<b>Too light.</b> The image barely registers, so the page tips toward the text and the right side feels empty.','<b>Still light.</b> Give the image more size or a darker colour.','<b>Balanced.</b> Unequal widths (7 + 5 columns), equal <b>visual weight</b>. Big, dark and colourful things feel heavy. Balancing them is how asymmetry feels intentional.','<b>Getting heavy.</b> The image starts to pull attention from the headline.','<b>Too heavy.</b> The dark block dominates and the headline loses. Visual weight is decided by size, darkness and colour, not by importance.'][st.wt-1]);}
   else api.out('st',N[m]);
  };
  const api=wire(el,st,render);render();
 }}
];

/* ================= HIERARCHY ================= */
window.VIZ['hierarchy']=[
{id:'hier-levers',title:'The five levers of hierarchy',terms:['Visual hierarchy','Focal point','Emphasis','De-emphasis','Contrast','Eyebrow / kicker'],
 intro:'Visual hierarchy is the order in which the eye notices things. This card starts flat: everything equal. The small line on top is an eyebrow (or kicker): a label that gives context.',
 try:'Turn the levers on one at a time and watch the numbered eye path reorder itself.',
 html:K+`<div class="v2 vz-hi-lev"><style>
.vz-hi-lev .lv-card{position:relative;max-width:300px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:20px 20px 20px 52px;display:flex;flex-direction:column;align-items:flex-start}
.vz-hi-lev .lv-card::before{content:'';position:absolute;left:44px;top:14px;bottom:14px;border-left:1.5px dashed #C9C2AE}
.vz-hi-lev [data-path=false]{padding-left:20px}.vz-hi-lev [data-path=false]::before{display:none}
.vz-hi-lev .lv-e{position:relative;z-index:1;line-height:1.2;color:#14261D}
.vz-hi-lev .lv-b{border:2px solid #14261D;border-radius:10px;padding:10px 18px;background:#FFFDF7}
.vz-hi-lev .lv-e[data-e=e]{text-transform:uppercase;letter-spacing:1.5px}
.vz-hi-lev .lv-n{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#E8722C;border:2px solid #14261D;font:700 12px/22px 'Space Mono',monospace;text-align:center;color:#14261D;z-index:3;transition:left .3s,top .3s}
.vz-hi-lev svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:visible}
.vz-hi-lev .lv-p{fill:none;stroke:#14261D;stroke-width:2;stroke-dasharray:5 4;stroke-linejoin:round}
.vz-hi-lev [data-path=false] .lv-n,.vz-hi-lev [data-path=false] svg{display:none}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="lv-card" data-path="true"><svg aria-hidden="true"><path class="lv-p"/></svg>
<div class="lv-e" data-e="e">Invoice · due 30 Oct</div><div class="lv-e" data-e="n">Adaeze Stores</div><div class="lv-e" data-e="a">₦45,000</div><div class="lv-e" data-e="d">2 items · sent by Tunde</div><div class="lv-e lv-b" data-e="b">Send to client</div></div></div>
<div><div class="v2-lab" style="margin-bottom:6px">Levers</div><div class="v2-row">${TG('size','Size')}${TG('weight','Weight')}${TG('colour','Colour & contrast')}${TG('space','Space')}${TG('pos','Position')}</div></div>
<div><div class="v2-lab" style="margin-bottom:6px">Method</div><div class="v2-row">${CH('m','emp','Emphasise the amount',1)}${CH('m','de','De-emphasise the rest')}${TG('path','Eye path',1)}</div></div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const card=el.querySelector('.lv-card'),pl=el.querySelector('.lv-p');const E={};el.querySelectorAll('.lv-e').forEach(x=>{E[x.dataset.e]=x;});const st={};
  const NM={e:'Eyebrow',n:'Client name',a:'Amount',d:'Details',b:'Send button'};
  const S={emp:{size:{e:12,n:17,a:36,d:13,b:15},weight:{e:700,n:600,a:800,d:400,b:700},col:{e:'#AD4F16',d:'#4A5A4F'}},
           de:{size:{e:11,n:14,a:20,d:12,b:14},weight:{e:600,n:500,a:700,d:400,b:600},col:{e:'#4A5A4F',n:'#4A5A4F',d:'#4A5A4F'}}};
  const SC={emp:{size:{e:-1,n:1.5,a:6,d:-1,b:0},weight:{e:.5,n:1,a:3,d:0,b:1.5},colour:{e:.5,n:0,a:0,d:-1.5,b:5}},
            de:{size:{e:-1.5,n:-.5,a:4,d:-1.5,b:-.5},weight:{e:0,n:-.5,a:2,d:-.5,b:1},colour:{e:-1,n:-1,a:0,d:-1.5,b:5}}};
  const SP={a:2,b:1.5};
  const place=order=>{
   const pts=order.map(k=>{const x=E[k];return [24,x.offsetTop+x.offsetHeight/2];});
   [...card.querySelectorAll('.lv-n')].forEach((n,i)=>{const p=pts[i];n.style.left=p[0]+'px';n.style.top=p[1]+'px';});
   let d='M'+pts[0].join(' ');for(let i=1;i<pts.length;i++){const a=pts[i-1],z=pts[i],bow=Math.min(34,8+Math.abs(z[1]-a[1])*.14),s=-1;d+=` C ${24+s*bow} ${a[1]} ${24+s*bow} ${z[1]} 24 ${z[1]}`;}
   pl.setAttribute('d',d);
  };
  const render=()=>{
   const m=st.m,s=S[m];card.dataset.path=String(st.path);
   const ord=st.pos?['e','a','n','d','b']:['e','n','a','d','b'];
   ord.forEach((k,i)=>{const x=E[k];x.style.order=i;x.style.fontSize=(st.size?s.size[k]:15)+'px';x.style.fontWeight=st.weight?s.weight[k]:400;
    x.style.color=st.colour&&s.col[k]?s.col[k]:'#14261D';x.style.marginBottom=(i===4?0:st.space?[4,14,3,20][i]:8)+'px';});
   E.b.style.background=st.colour?'#E8722C':'#FFFDF7';
   E.a.style.letterSpacing=st.size&&m==='emp'?'-.02em':'0';E.a.style.fontFamily=st.size?"'Bricolage Grotesque',sans-serif":'';
   const score={};ord.forEach((k,i)=>{let v=(4-i)*.6;['size','weight','colour'].forEach(l=>{if(st[l])v+=SC[m][l][k];});if(st.space)v+=SP[k]||0;score[k]=v;});
   const rank=[...ord].sort((a,b)=>score[b]-score[a]);
   if(card.querySelectorAll('.lv-n').length!==5)card.insertAdjacentHTML('beforeend',[1,2,3,4,5].map(i=>`<span class="lv-n">${i}</span>`).join(''));
   place(rank);
   const any=st.size||st.weight||st.colour||st.space||st.pos;
   let t='Reading order: '+rank.map((k,i)=>`${i+1} ${NM[k]}`).join(', ')+'. ';
   if(!any)t+='<b>Everything is equal</b>, so the eye just reads top to bottom, slowly. There is no <b>focal point</b>.';
   else if(rank[0]==='a')t+=`<b>Focal point: the amount.</b> That is what this card is for. `+(m==='de'?'You got there by <b>de-emphasis</b>: making everything else quieter instead of making the amount louder. Calmer, and often the better move.':'Each lever adds <b>emphasis</b> through <b>contrast</b>: the difference between one element and the rest.');
   else if(rank[0]==='b')t+='<b>The button wins the first look.</b> Colour is the strongest lever. Fine on a checkout, but here the amount should lead. Add size or weight.';
   else t+='Getting there. Hierarchy is built from contrast; add another lever.';
   api.out('st',t);
  };
  const api=wire(el,st,render);render();onSize(el,card,render);
 }},

{id:'hier-squint',title:'The squint test',terms:['Squint test','Focal point'],
 intro:'Blur your eyes at a screen and the details vanish. What still stands out is your real hierarchy. Designers call this the squint test.',
 try:'Drag the blur up and compare the two screens.',
 html:K+`<div class="v2 vz-hi-sq"><style>
.vz-hi-sq .sq-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.vz-hi-sq .sq-two>div{display:flex;flex-direction:column}.vz-hi-sq .sq-m{flex:1}
.vz-hi-sq .sq-m{background:#FFFDF7;border:2px solid #14261D;border-radius:14px;padding:14px;min-height:210px;display:flex;flex-direction:column;gap:8px;transition:filter .15s}
.vz-hi-sq .sq-cap{font:700 11px/1.3 'Space Mono',monospace;text-align:center;margin-top:8px}
.vz-hi-sq .sq-a b,.vz-hi-sq .sq-a span{font:700 13px/1.3 Arial,sans-serif;color:#222}
.vz-hi-sq .sq-a i{font:normal 700 12px/1 Arial,sans-serif;color:#fff;padding:9px 6px;border-radius:6px;text-align:center}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="sq-two">
<div><div class="sq-m sq-a"><b>Transfer</b><b>Send money to Adaeze</b><b>₦45,000</b><span>From: Main account</span><i style="background:#2563eb">Send</i><i style="background:#16a34a">Save</i><i style="background:#dc2626">Cancel</i></div><div class="sq-cap">A · everything equal</div></div>
<div><div class="sq-m"><div style="font-size:12px;font-weight:600;color:#4A5A4F">Transfer to Adaeze</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;letter-spacing:-.02em;line-height:1">₦45,000</div><div style="font-size:12px;color:#4A5A4F">From main account · fee ₦10</div><div style="flex:1"></div><div style="border:2px solid #14261D;border-radius:10px;background:#E8722C;font-weight:700;text-align:center;padding:9px 4px;font-size:14px">Send ₦45,000</div><div style="text-align:center;font-size:13px;font-weight:600">Edit amount</div></div><div class="sq-cap">B · one focal point</div></div>
</div></div>
<div class="v2-ctl">${SL('bl','Blur (squint)',0,8,.5,0)}</div>
<div class="v2-row">${CH('q','0','Eyes open',1)}${CH('q','5','Squint')}</div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const ms=el.querySelectorAll('.sq-m');const st={};
  const render=k=>{
   if(k==='q')api.val('bl',+st.q);else api.set('q',st.bl===0?'0':st.bl===5?'5':'');
   ms.forEach(m=>{m.style.filter=st.bl?`blur(${st.bl}px)`:'none';});api.out('bl',st.bl+'px');
   api.out('st',st.bl<2?'Drag the blur up. Blurring is like squinting: words disappear and only the strongest shapes are left.'
    :st.bl<4?'Keep going. The small text is already gone.'
    :'<b>A:</b> grey stripes of equal weight and three loud buttons. Nothing wins, so the eye has nowhere to land. <b>B:</b> the amount and the orange button still stand out, in that order. That is a clear <b>focal point</b>, and B passes the squint test.');
  };
  const api=wire(el,st,render);render();
 }},

{id:'hier-buttons',title:'Primary, secondary, tertiary',terms:['Primary / secondary / tertiary','Ghost button','Progressive disclosure'],
 intro:'Actions have three levels of importance. The main one gets a filled button, the useful ones get quieter outline buttons, and the rare ones become text links or hide until needed.',
 try:'Tap each level of the pyramid. Then restyle the dialog buttons and open "More options".',
 html:K+`<div class="v2 vz-hi-btn"><style>
.vz-hi-btn .bt-pyr{display:grid;gap:8px;justify-items:center}
.vz-hi-btn .bt-tier{display:flex;flex-direction:column;align-items:center;gap:8px;border:2px solid #14261D;border-radius:12px;background:#FFFDF7;padding:10px 12px;font:inherit;color:#14261D;cursor:pointer;min-height:44px}
.vz-hi-btn .bt-tier[aria-pressed=true]{background:#D6E59A;box-shadow:2px 2px 0 #14261D}
.vz-hi-btn .bt-lv{font:700 10px/1 'Space Mono',monospace;letter-spacing:1.5px;text-transform:uppercase}
.vz-hi-btn .bt-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.vz-hi-btn .bt{display:inline-block;border:2px solid #14261D;border-radius:10px;padding:8px 14px;font-weight:700;font-size:14px;line-height:1.2;background:#FFFDF7}
.vz-hi-btn .bt.f{background:#E8722C}.vz-hi-btn .bt.g{background:transparent}.vz-hi-btn .bt.t{border-color:transparent;background:transparent;padding-inline:4px;text-decoration:underline;text-underline-offset:3px}
.vz-hi-btn .bt-dlg{max-width:320px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:18px}
.vz-hi-btn .bt-dlg p{margin:4px 0 14px;font-size:14px;color:#4A5A4F}
.vz-hi-btn .bt-more{margin-top:10px;border:0;background:none;font:600 13px 'Instrument Sans',sans-serif;color:#14261D;padding:12px 0 4px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.vz-hi-btn .bt-extra{display:flex;flex-wrap:wrap;gap:4px 12px;border-top:1.5px solid #E2DCCB;margin-top:6px;padding-top:8px}
.vz-hi-btn .bt-cfg{display:grid;grid-template-columns:96px 1fr;gap:6px 10px;align-items:center;font-size:14px;font-weight:600}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="bt-pyr">
<button type="button" class="bt-tier" data-tier="1" aria-pressed="true" style="width:56%"><span class="bt-lv">Primary · one</span><span class="bt-row"><span class="bt f">Publish</span></span></button>
<button type="button" class="bt-tier" data-tier="2" aria-pressed="false" style="width:78%"><span class="bt-lv">Secondary · a few</span><span class="bt-row"><span class="bt g">Preview</span><span class="bt g">Save draft</span></span></button>
<button type="button" class="bt-tier" data-tier="3" aria-pressed="false" style="width:100%"><span class="bt-lv">Tertiary · many</span><span class="bt-row"><span class="bt t">Cancel</span><span class="bt t">Copy link</span><span class="bt t">Help</span></span></button>
</div></div>
<p class="v2-note" data-o="tier"></p>
<div class="v2-stage" style="background:#F4F0E5"><div class="bt-dlg"><b style="font-size:17px">Publish your article?</b><p>It will be visible to everyone who visits your page.</p>
<div class="bt-row" style="justify-content:flex-start"><span class="bt" data-b="pub">Publish</span><span class="bt" data-b="draft">Save draft</span><span class="bt" data-b="cancel">Cancel</span></div>
<button type="button" class="bt-more" aria-expanded="false">More options</button><div class="bt-extra" hidden><span class="bt t">Schedule for later</span><span class="bt t">Duplicate</span><span class="bt t" style="color:#A3361A">Delete article</span></div></div></div>
<div class="bt-cfg">${[['pub','Publish'],['draft','Save draft'],['cancel','Cancel']].map(([k,l])=>`<span>${l}</span><div class="v2-row">${CH(k,'f','Filled',1)}${CH(k,'g','Ghost')}${CH(k,'t','Text')}</div>`).join('')}</div>
<p class="v2-note" data-o="ev"></p></div>`,
 init(el){
  const st={};const tiers=[...el.querySelectorAll('.bt-tier')],more=el.querySelector('.bt-more'),extra=el.querySelector('.bt-extra');let tier='1';
  const TN={'1':'<b>Primary:</b> the one main action, the reason this screen exists. Filled with the accent colour. Aim for one per screen.',
   '2':'<b>Secondary:</b> useful, but not the main path. Use a <b>ghost button</b>: an outline with no fill, so it is visible but quiet.',
   '3':'<b>Tertiary:</b> minor or rare actions. Plain text links, or hidden behind "More" until someone needs them.'};
  const render=()=>{
   tiers.forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.tier===tier)));api.out('tier',TN[tier]);
   ['pub','draft','cancel'].forEach(k=>{el.querySelector(`[data-b=${k}]`).className='bt '+st[k];});
   const f=['pub','draft','cancel'].filter(k=>st[k]==='f');let t;
   if(f.length===0)t='<b>No primary action.</b> Nothing is filled, so people wonder what they are meant to do.';
   else if(f.length>1)t=`<b>${f.length} filled buttons compete.</b> When everything is loud, nothing is. Which one is the main path?`;
   else if(f[0]==='pub')t=st.draft==='g'&&st.cancel==='t'?'<b>Clear hierarchy.</b> One primary (filled), one secondary (ghost), one tertiary (text). The eye goes straight to Publish.':'<b>One primary, good.</b> Now step the others down: Save draft as a ghost button, Cancel as text.';
   else t=`<b>The loudest button is ${f[0]==='cancel'?'Cancel':'Save draft'}.</b> People will follow it instead of publishing. The primary style belongs to the main action.`;
   if(!extra.hidden)t+=' <b>Progressive disclosure:</b> the rare actions stayed hidden until you asked for them, so the main choice stays simple.';
   api.out('ev',t);
  };
  const api=wire(el,st,render);
  tiers.forEach(t=>{t.onclick=()=>{tier=t.dataset.tier;render();};});
  more.onclick=()=>{extra.hidden=!extra.hidden;more.setAttribute('aria-expanded',String(!extra.hidden));more.textContent=extra.hidden?'More options':'Fewer options';render();};
  render();
 }},

{id:'hier-label',title:'Labels quiet, values loud',terms:['Scannability','Contrast'],
 intro:'In a list of details, people come for the values, not the labels. Making labels small and quiet lets the eye skim straight down the answers. That is scannability.',
 try:'Try the three presets, then fade the labels until the contrast number turns red.',
 html:K+`<div class="v2 vz-hi-lab"><style>
.vz-hi-lab .lb-card{max-width:300px;margin:0 auto;background:#FFFDF7;border:2px solid #14261D;border-radius:16px;padding:18px;display:grid;gap:14px}
.vz-hi-lab .lb-l{display:block;line-height:1.3}
.vz-hi-lab .lb-v{display:block;line-height:1.25;color:#14261D;font-variant-numeric:tabular-nums}
.vz-hi-lab .lb-ratio{font:700 12px 'Space Mono',monospace;padding:3px 6px;border-radius:4px;border:1.5px solid #14261D}
</style>
<div class="v2-stage" style="background:#F4F0E5"><div class="lb-card">
${[['Account name','Adaeze Stores Ltd'],['Bank','GTBank'],['Account number','0123 456 789'],['Amount due','₦45,000']].map(r=>`<div><span class="lb-l">${r[0]}</span><span class="lb-v">${r[1]}</span></div>`).join('')}
</div></div>
<div class="v2-row" role="group" aria-label="Preset">${CH('pre','eq','All the same',1)}${CH('pre','loud','Loud labels')}${CH('pre','quiet','Quiet labels')}</div>
<div class="v2-ctl">${SL('ls','Label size',11,18,1,15)}${SL('lc','Label strength',20,100,5,100,'%')}${SL('vs','Value size',13,24,1,15)}</div>
<div class="v2-row">${TG('vb','Bold values')}<span>Label contrast <span class="lb-ratio" data-o="ratio"></span></span></div>
<p class="v2-note" data-o="st"></p></div>`,
 init(el){
  const L=[...el.querySelectorAll('.lb-l')],V=[...el.querySelectorAll('.lb-v')];const st={};let lw=400;
  const P={eq:{ls:15,lc:100,vs:15,vb:false,lw:400},loud:{ls:15,lc:100,vs:14,vb:false,lw:700},quiet:{ls:12,lc:70,vs:18,vb:true,lw:600}};
  const hex=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));const ink=hex('#14261D'),pap=hex('#FFFDF7');
  const lum=c=>{const a=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*a[0]+.7152*a[1]+.0722*a[2];};
  const render=k=>{
   if(k==='pre'){const p=P[st.pre];api.val('ls',p.ls);api.val('lc',p.lc);api.val('vs',p.vs);api.tog('vb',p.vb);lw=p.lw;}
   else if(k==='ls'||k==='lc'||k==='vs'||k==='vb')api.set('pre','');
   const t=st.lc/100,c=pap.map((v,i)=>Math.round(v+(ink[i]-v)*t));const r=(lum(pap)+.05)/(lum(c)+.05);
   L.forEach(x=>{x.style.fontSize=st.ls+'px';x.style.fontWeight=lw;x.style.color=`rgb(${c.join(',')})`;});
   V.forEach(x=>{x.style.fontSize=st.vs+'px';x.style.fontWeight=st.vb?700:400;x.style.fontFamily=st.vs>=18?"'Bricolage Grotesque',sans-serif":'';});
   api.out('ls',st.ls+'px');api.out('lc',st.lc+'%');api.out('vs',st.vs+'px');
   const ok=r>=4.5;const rb=el.querySelector('.lb-ratio');rb.style.background=ok?'#D6E59A':'#F7DCC4';rb.style.color=ok?'#14261D':'#A3361A';api.out('ratio',r.toFixed(1)+':1 '+(ok?'pass':'too faint'));
   let s;
   if(!ok)s=`<b>Too faint (${r.toFixed(1)}:1).</b> De-emphasis went too far. Quiet labels must still be readable: keep at least 4.5:1 <b>contrast</b> against the background.`;
   else if(st.vs-st.ls>=4&&(st.vb||lw<600))s='<b>Scannable.</b> Small, muted labels and big, strong values. The eye runs straight down the answers. The <b>contrast</b> (difference) between label and value is what creates the hierarchy.';
   else if(lw>=700&&!st.vb)s='<b>Labels shout, answers whisper.</b> People came for the account number, not the words "Account number". Flip it.';
   else s='<b>No contrast between levels.</b> Labels and values look the same, so people must read every word to find the number they need.';
   api.out('st',s);
  };
  const api=wire(el,st,render);render();
 }}
];

/* ================= DRILLS ================= */
const C=(c,s='')=>`<div style="background:#FFFDF7;border:2px solid #14261D;border-radius:12px;padding:16px;width:200px;max-width:100%;color:#14261D;font-size:14px;line-height:1.35;${s}">${c}</div>`;
const B=(w,h=8,c='#14261D',s='')=>`<div style="height:${h}px;width:${typeof w==='number'?w+'px':w};max-width:100%;background:${c};border-radius:3px;${s}"></div>`;
const COL=(g,c)=>`<div style="display:flex;flex-direction:column;gap:${g}px">${c}</div>`;
const FLD=(l,v,gIn,gB)=>`<div style="font-size:12px;font-weight:700;margin-bottom:${gIn}px">${l}</div><div style="height:30px;border:2px solid #14261D;border-radius:6px;background:#fff;font-size:12px;color:#4A5A4F;display:flex;align-items:center;padding:0 8px;margin-bottom:${gB}px">${v}</div>`;
const FORM=(i,b)=>C(FLD('Email','ada@shop.ng',i,b)+FLD('Password','••••••••',i,b)+FLD('Phone','0803 000 0000',i,0),'width:190px');
const ORD=(a,b,pad=16)=>C(`<div style="font-weight:700">Order #2041</div><div style="height:${a}px"></div><div style="font-size:12px;color:#4A5A4F">Tunde Adeyemi</div><div style="height:${b[0]}px"></div><div style="font-weight:700">₦12,500</div><div style="height:${a}px"></div><div style="font-size:12px;color:#4A5A4F">Paid · 2 items</div><div style="height:${b[1]}px"></div><div style="border:2px solid #14261D;border-radius:8px;padding:7px;text-align:center;font-weight:700;font-size:13px">Open order</div>`,`padding:${pad}px`);
const PB=(t,f)=>`<span style="display:inline-block;border:2px solid ${f==='t'?'transparent':'#14261D'};border-radius:8px;padding:7px 11px;font-size:13px;font-weight:700;background:${f==='f'?'#E8722C':'transparent'};${f==='t'?'text-decoration:underline;padding-inline:3px;':''}">${t}</span>`;

window.DRILLS['space']=[
{id:'sp-pad',type:'ab',level:1,q:'Which card gives its content room to breathe?',a:ORD(4,[16,16],4),b:ORD(4,[16,16],20),ok:'b',why:'Padding is the space inside a box. When text nearly touches the edge the card feels cramped; 16 to 24px of padding lets it breathe.'},
{id:'sp-name-pad',type:'name',level:1,q:'The green area is the space between the card’s edge and its text. What is it called?',face:`<div style="border:2px solid #14261D;border-radius:12px;background:#D6E59A;padding:20px;width:190px"><div style="background:#FFFDF7;padding:2px 0;font-weight:700">Order #2041<div style="font-weight:400;font-size:12px;color:#4A5A4F">Tunde Adeyemi</div></div></div>`,opts:['Margin','Padding','Gap','Border'],ok:1,why:'Padding is the space inside a box, between its border and its content. Margin is the space outside the box.'},
{id:'sp-name-mg',type:'name',level:1,q:'The striped area sits outside the card and pushes the next card away. What is it called?',face:`<div style="width:200px"><div style="background:repeating-linear-gradient(45deg,#FBE3D3 0 5px,#F7DCC4 5px 10px);border:2px dashed #AD4F16;border-radius:12px;padding:16px"><div style="border:2px solid #14261D;border-radius:10px;background:#FFFDF7;padding:12px;font-weight:700">Card one</div></div><div style="border:2px solid #14261D;border-radius:10px;background:#FFFDF7;padding:12px;font-weight:700">Card two</div></div>`,opts:['Padding','Inset','Margin','Line height'],ok:2,why:'Margin is the see-through space outside a box. It pushes neighbours away. Padding and inset are inside the box.'},
{id:'sp-scale',type:'pick',level:1,q:'Which list uses one steady spacing value?',opts:[C(COL(0,B(150,10)+'<div style="height:22px"></div>'+B(120)+'<div style="height:9px"></div>'+B(160)+'<div style="height:17px"></div>'+B(110))),C(COL(16,B(150,10)+B(120)+B(160)+B(110))),C(COL(0,B(150,10)+'<div style="height:30px"></div>'+B(120)+'<div style="height:6px"></div>'+B(160)+'<div style="height:14px"></div>'+B(110)))],ok:1,why:'Repeating the same value from your spacing scale creates rhythm. Random gaps like 22, 9, 17 make a screen feel nervous.'},
{id:'sp-prox-form',type:'ab',level:2,q:'Which form makes it obvious which label belongs to which box?',a:FORM(14,14),b:FORM(4,18),ok:'b',why:'Proximity: things close together read as related. Put each label closer to its own field than to the field above it.'},
{id:'sp-groups',type:'pick',level:2,q:'Which card has the clearest groups?',opts:[ORD(12,[12,12]),ORD(4,[20,20]),ORD(20,[4,4])],ok:1,why:'Space inside a group (4) must be smaller than space between groups (20). Equal gaps make no groups; flipped gaps make the wrong ones.'},
{id:'sp-fix-equal',type:'fix',level:2,q:'This card feels like a list of loose lines. What fixes it?',face:ORD(12,[12,12]),opts:['Make the text bigger','Shrink the space inside each pair and grow the space between pairs','Add a divider line under every line'],ok:1,why:'Use spacing to group: small gaps inside a pair, bigger gaps between pairs. Dividers on every line add noise instead of structure.'},
{id:'sp-fix-btn',type:'fix',level:2,q:'This button feels cheap and is hard to tap. What is the fix?',face:`<span style="display:inline-block;border:2px solid #14261D;border-radius:8px;background:#E8722C;padding:3px 6px;font-weight:700;font-size:14px">Continue</span>`,opts:['Padding about 12px top and bottom, 24px left and right','Make the label bold and uppercase','Add margin around it'],ok:0,why:'Buttons need inner padding, with roughly twice as much on the sides as on top and bottom, and a height of at least 44px so a thumb can hit them.'},
{id:'sp-name-dense',type:'name',level:2,q:'This table squeezes as many rows as possible onto one screen. What is that quality called?',face:C(Array.from({length:7},(_,i)=>`<div style="display:flex;justify-content:space-between;font-size:11px;line-height:1.2;padding:2px 0;border-top:1px solid #E2DCCB"><span>Order #20${41+i}</span><b>₦${((i+3)*1500).toLocaleString('en-US')}</b></div>`).join(''),'padding:10px'),opts:['Rhythm','Density','Proximity','Inset'],ok:1,why:'Density is how tightly packed a screen is. Compact density suits data-heavy tools; most apps feel better at a comfortable density.'},
{id:'sp-rhythm-hard',type:'ab',level:3,q:'Look closely. Which card has a steady rhythm?',a:ORD(4,[16,16]),b:ORD(4,[12,16]),ok:'a',why:'In B the first gap between groups is 12px and the second is 16px. Your eye registers uneven rhythm even if you cannot name it. Repeat one value.'},
{id:'sp-inset-hard',type:'pick',level:3,q:'Only one of these cards has equal padding on every side. Which?',opts:[ORD(4,[16,16],16).replace('padding:16px','padding:16px 16px 16px 16px'),ORD(4,[16,16]).replace('padding:16px','padding:16px 12px 16px 16px'),ORD(4,[16,16]).replace('padding:16px','padding:16px 16px 11px 16px')],ok:0,why:'A card’s padding is its inset. Uneven insets (12px on the right, or a short bottom) make content look pushed off-centre. Keep them equal unless you have a reason.'},
{id:'sp-fix-bb',type:'fix',level:3,q:'Both cards were given width: 200px, yet their right edges do not line up. What fixes it?',face:`<div style="display:grid;gap:8px">${C('Small padding','padding:8px;box-sizing:content-box;width:180px')}${C('Big padding','padding:20px;box-sizing:content-box;width:180px')}</div>`,opts:['Set box-sizing: border-box so padding stays inside the width','Remove the borders','Give the smaller card more margin'],ok:0,why:'By default, padding and border are added on top of the width. With border-box, the width you set is the final width, so boxes line up.'}
];

const GRIDB=(spans,cols=4,g=8)=>`<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${g}px;width:200px">${spans.map(s=>`<div style="grid-column:span ${s[0]};height:${s[1]||34}px;background:${s[2]||'#D6E59A'};border:2px solid #14261D;border-radius:7px"></div>`).join('')}</div>`;
const HERO=(o)=>C(`<div style="font:700 9px 'Space Mono',monospace;letter-spacing:1px;color:#AD4F16;margin-left:${o[0]}px">NEW · FOR SHOPS</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:18px;line-height:1.1;margin:6px 0 6px ${o[1]}px">Sell on WhatsApp in minutes</div><div style="font-size:12px;color:#4A5A4F;margin:0 0 10px ${o[2]}px">Take payment and track every order.</div><div style="display:inline-block;border:2px solid #14261D;border-radius:8px;background:#E8722C;padding:6px 12px;font-weight:700;font-size:13px;margin-left:${o[3]}px">Start free</div>`);
window.DRILLS['layout']=[
{id:'ly-align',type:'ab',level:1,q:'Which hero feels calm and deliberate?',a:C(`<div style="text-align:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:18px;line-height:1.1">Sell on WhatsApp in minutes</div><div style="font-size:12px;color:#4A5A4F;margin:6px 0 10px 14px">Take payment and track every order.</div><div style="display:inline-block;border:2px solid #14261D;border-radius:8px;background:#E8722C;padding:6px 12px;font-weight:700;font-size:13px;margin-left:40px">Start free</div>`),b:HERO([0,0,0,0]),ok:'b',why:'B hangs everything from one shared left edge. A mixes centred and indented items, so the eye has no line to follow.'},
{id:'ly-name-gutter',type:'name',level:1,q:'What is the highlighted gap between two columns called?',face:`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;width:200px;height:90px;position:relative">${'<div style="background:rgba(232,114,44,.25);border:1.5px solid #AD4F16"></div>'.repeat(4)}<div style="position:absolute;top:0;bottom:0;left:39.5px;width:14px;background:#14261D"></div></div>`,opts:['Column','Gutter','Margin','Padding'],ok:1,why:'Columns are the vertical lanes of a grid; the gutters are the equal gaps between them. Keep one gutter size everywhere.'},
{id:'ly-name-bento',type:'name',level:1,q:'Cards of different sizes fitted neatly into one grid. What is this layout called?',face:`<div style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:34px;gap:8px;width:200px"><div style="grid-column:span 2;grid-row:span 2;background:#D6E59A;border:2px solid #14261D;border-radius:8px"></div><div style="background:#C9E0F2;border:2px solid #14261D;border-radius:8px"></div><div style="background:#F6D7E8;border:2px solid #14261D;border-radius:8px"></div><div style="background:#F7DCC4;border:2px solid #14261D;border-radius:8px"></div><div style="grid-column:span 2;background:#FFFDF7;border:2px solid #14261D;border-radius:8px"></div></div>`,opts:['Bento grid','Sidebar layout','Single stack','Split screen'],ok:0,why:'A bento grid mixes big and small cards like a lunch box, but every edge still lands on the grid.'},
{id:'ly-max',type:'pick',level:1,q:'On a very wide screen, which page keeps its text comfortable to read?',opts:[`<div style="width:220px;border:2px solid #14261D;border-radius:8px;background:#FFFDF7;padding:10px 6px">${COL(5,B('100%',10)+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C'))}</div>`,`<div style="width:220px;border:2px solid #14261D;border-radius:8px;background:repeating-linear-gradient(45deg,#FBE3D3 0 5px,#FFFDF7 5px 10px);padding:10px 0"><div style="width:120px;margin:0 auto;background:#FFFDF7;padding:4px">${COL(5,B('90%',10)+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C'))}</div></div>`,`<div style="width:220px;border:2px solid #14261D;border-radius:8px;background:#FFFDF7;padding:10px 6px"><div style="width:40px">${COL(5,B('100%',10)+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C'))}</div></div>`],ok:1,why:'A container with a max-width stops content from stretching across the whole screen, so lines stay around 60 to 75 characters.'},
{id:'ly-name-f',type:'name',level:2,q:'The orange line shows where people’s eyes go on a page of search results. What is this reading path called?',face:`<div style="position:relative;width:200px;background:#FFFDF7;border:2px solid #14261D;border-radius:10px;padding:10px">${('<div style="margin-bottom:9px">'+B('75%',7)+'<div style="height:4px"></div>'+B('95%',4,'#9AA39C')+'</div>').repeat(4)}<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true"><path d="M14 15H172M14 41H112M14 15V104" fill="none" stroke="#E8722C" stroke-width="4" stroke-linecap="round"/></svg></div>`,opts:['Z-pattern','F-pattern','Bento grid','Gutter'],ok:1,why:'On text-heavy pages people read across the top, a bit less across the next line, then scan down the left edge: an F. Put key words at the start of lines.'},
{id:'ly-name-fold',type:'name',level:2,q:'Everything above the dashed line is visible without scrolling. What is that area called?',face:`<div style="position:relative;width:120px;height:170px;margin:0 auto;border:2px solid #14261D;border-radius:14px;background:#FFFDF7;padding:10px;overflow:hidden">${COL(6,B('80%',10)+B('100%',4,'#9AA39C')+'<div style="height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:6px"></div>'+B(60,16,'#E8722C')+B('100%',4,'#9AA39C')+B('100%',4,'#9AA39C'))}<div style="position:absolute;left:0;right:0;top:110px;bottom:0;background:rgba(244,240,229,.75);border-top:2.5px dashed #14261D"></div></div>`,opts:['Breakpoint','Above the fold','Max-width','Margin'],ok:1,why:'Above the fold is what people see before they scroll. Put the most important message and action there.'},
{id:'ly-fix-gutters',type:'fix',level:2,q:'Something about these cards feels off. What fixes it?',face:`<div style="display:flex;width:210px"><div style="flex:1;height:60px;background:#D6E59A;border:2px solid #14261D;border-radius:8px"></div><div style="width:6px"></div><div style="flex:1;height:60px;background:#D6E59A;border:2px solid #14261D;border-radius:8px"></div><div style="width:20px"></div><div style="flex:1;height:60px;background:#D6E59A;border:2px solid #14261D;border-radius:8px"></div></div>`,opts:['Use one gutter value between all the cards','Give each card a different colour','Add drop shadows'],ok:0,why:'The gaps are 6px and 20px. A grid uses one gutter everywhere, so the spacing between columns feels even and trustworthy.'},
{id:'ly-fix-mobile',type:'fix',level:2,q:'This desktop layout was simply shrunk onto a phone. What should happen instead?',face:`<div style="width:110px;height:180px;margin:0 auto;border:2px solid #14261D;border-radius:14px;background:#FFFDF7;padding:8px">${B('70%',6)}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:8px">${'<div style="height:40px;border:1.5px solid #14261D;border-radius:4px;background:#D6E59A;font-size:5px;padding:2px">Tiny text nobody can read</div>'.repeat(3)}</div></div>`,opts:['Shrink the text further so it all fits','Stack the cards in one column below a phone breakpoint','Hide two of the cards'],ok:1,why:'A responsive layout changes at breakpoints. On a phone the three columns should become one stacked column at a readable size.'},
{id:'ly-weight',type:'pick',level:2,q:'Which asymmetric hero feels balanced?',opts:[C(`<div style="display:grid;grid-template-columns:3fr 2fr;gap:8px;align-items:center"><div>${COL(5,B('90%',10)+B('70%',10)+B(50,14,'#E8722C'))}</div><div></div></div>`,'width:210px'),C(`<div style="display:grid;grid-template-columns:3fr 2fr;gap:8px;align-items:center"><div>${COL(5,B('90%',10)+B('70%',10)+B(50,14,'#E8722C'))}</div><div style="height:62px;background:#C9E0F2;border:2px solid #14261D;border-radius:8px"></div></div>`,'width:210px'),C(`<div style="display:grid;grid-template-columns:2fr 3fr;gap:8px;align-items:center"><div>${COL(4,B('90%',5,'#9AA39C')+B('70%',5,'#9AA39C'))}</div><div style="height:90px;background:#14261D;border-radius:8px"></div></div>`,'width:210px')],ok:1,why:'Visual weight comes from size, darkness and colour. The right option gives text and image similar weight, so the unequal split still feels balanced.'},
{id:'ly-2px',type:'ab',level:3,q:'One of these has a 2px slip. Which one is truly aligned?',a:HERO([0,0,2,0]),b:HERO([0,0,0,0]),ok:'b',why:'In A the paragraph starts 2px to the right of the headline. Nearly aligned reads as a mistake; check edges, not just the overall look.'},
{id:'ly-thirds',type:'pick',level:3,q:'All three rows try to split into equal thirds. Which one really sits on the grid?',opts:[`<div style="display:flex;gap:10px;width:210px">${'<div style="flex:1;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div>'.repeat(3)}</div>`,`<div style="display:flex;gap:10px;width:210px"><div style="width:31%;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div><div style="width:36%;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div><div style="flex:1;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div></div>`,`<div style="display:flex;width:210px"><div style="flex:1;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div><div style="width:7px"></div><div style="flex:1;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div><div style="width:13px"></div><div style="flex:1;height:44px;background:#C9E0F2;border:2px solid #14261D;border-radius:7px"></div></div>`],ok:0,why:'In the wrong options, the cards differ by a few pixels in width, or the gutters are 7 and 13px. On a grid, equal spans are truly equal and every gutter is the same.'},
{id:'ly-optical',type:'fix',level:3,q:'The text link’s box lines up with the paragraph, but its words do not. What is the fix?',face:C(`<div style="font-weight:800;font-family:'Bricolage Grotesque',sans-serif;font-size:17px">Your shop is live</div><div style="font-size:12px;color:#4A5A4F;margin:4px 0 6px">Share the link with your customers.</div><span style="display:inline-block;padding:6px 10px;font-weight:700;font-size:13px;text-decoration:underline;background:#F4F0E5;border-radius:6px">Copy link</span>`),opts:['Remove the link entirely','Line up the link’s words, not its box, with the paragraph (offset its padding)','Centre all three lines'],ok:1,why:'Padding inside a button or link pushes its text inward. Align what the eye sees, the text, to the shared edge. This is called optical alignment.'}
];

const STAT=(lab,val,ls,lc,lw,vs,vw)=>C(`<div style="font-size:${ls}px;color:${lc};font-weight:${lw}">${lab}</div><div style="font-size:${vs}px;font-weight:${vw};font-family:'Bricolage Grotesque',sans-serif;line-height:1.1;margin-top:3px">${val}</div>`);
window.DRILLS['hierarchy']=[
{id:'hi-focal',type:'ab',level:1,q:'Which sign-up card has one clear focal point?',a:C(`<div style="font-weight:700">Start selling today</div><div style="font-weight:700;margin-top:6px">Free for 30 days</div><div style="font-weight:700;margin-top:6px">No card needed</div><div style="font-weight:700;margin-top:6px">Join 2,000 shops</div>`),b:C(`<div style="font-size:11px;font-weight:600;color:#4A5A4F">Free for 30 days · no card</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;line-height:1.1;margin:4px 0 8px">Start selling today</div><div style="font-size:12px;color:#4A5A4F">Join 2,000 shops already on board.</div>`),ok:'b',why:'B makes one line big and quiets the rest, so the eye knows where to start. In A every line is bold, so nothing stands out.'},
{id:'hi-name-eyebrow',type:'name',level:1,q:'What is the small uppercase line above the headline called?',face:C(`<div style="font:700 10px 'Space Mono',monospace;letter-spacing:1.5px;color:#AD4F16;outline:2px dashed #14261D;outline-offset:3px;display:inline-block">CASE STUDY · FASHION</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;line-height:1.1;margin-top:8px">How Kemi doubled her orders</div>`),opts:['Eyebrow / kicker','Caption','Ghost button','Footnote'],ok:0,why:'An eyebrow (or kicker) is a small label above a headline that gives context. It is quiet on purpose so the headline stays the focal point.'},
{id:'hi-name-ghost',type:'name',level:1,q:'What is a button like the one on the right called: outline, no fill?',face:`<div style="display:flex;gap:8px">${PB('Pay now','f')}${PB('View details','g')}</div>`,opts:['Primary button','Ghost button','Text link','Disabled button'],ok:1,why:'A ghost button has an outline but no fill. It is visible but quiet, perfect for secondary actions next to one filled primary button.'},
{id:'hi-squint',type:'pick',level:1,q:'These screens are blurred, as if you were squinting. Which one has a clear focal point?',opts:[`<div style="filter:blur(2.5px)">${C(COL(10,B(150,12)+B(150,12)+B(150,12)+B(150,12)))}</div>`,`<div style="filter:blur(2.5px)">${C(COL(10,B(80,6,'#9AA39C')+B(150,28)+B(130,6,'#9AA39C')+B(100,22,'#E8722C')))}</div>`,`<div style="filter:blur(2.5px)">${C(COL(10,B(150,24)+B(150,24,'#E8722C')+B(150,24,'#2563eb')))}</div>`],ok:1,why:'The squint test: blur the screen and see what survives. Only the right one has one big shape first and one action second.'},
{id:'hi-scan',type:'ab',level:2,q:'Which delivery summary is easier to scan?',a:C(`<div style="font-size:12px">Your order of 2 pairs of shoes will be delivered to 14 Allen Avenue, Ikeja on Friday between 10am and 2pm by GIG Logistics.</div>`),b:C(`<div style="font-size:11px;color:#4A5A4F">Arrives</div><div style="font-weight:700">Friday, 10am–2pm</div><div style="font-size:11px;color:#4A5A4F;margin-top:8px">To</div><div style="font-weight:700">14 Allen Ave, Ikeja</div>`),ok:'b',why:'Scannability: people skim for answers. Short quiet labels with strong values let the eye jump straight to what it needs.'},
{id:'hi-fix-delete',type:'fix',level:2,q:'"Delete your shop?" Both buttons look equally safe. What fixes it?',face:C(`<div style="font-weight:700;margin-bottom:10px">Delete your shop?</div><div style="display:flex;gap:8px">${PB('Delete','f')}${PB('Keep shop','f')}</div>`),opts:['Make both buttons bigger','Make Keep shop a ghost button and give Delete a clear danger style','Put the buttons in alphabetical order'],ok:1,why:'Equal styles hide the risk. Give the actions different levels: one strong, clearly marked button for the main choice and a quieter ghost button for the other.'},
{id:'hi-name-pd',type:'name',level:2,q:'Extra details stay hidden until someone taps "Show more". What is this technique called?',face:C(`<div style="font-weight:700">₦45,000</div><div style="font-size:12px;color:#4A5A4F">Due 30 Oct</div><div style="font-size:13px;font-weight:600;margin-top:10px;text-decoration:underline">Show 4 more details</div>`),opts:['Progressive disclosure','De-emphasis','Focal point','Squint test'],ok:0,why:'Progressive disclosure shows details only when they are needed. The screen stays simple and the main thing stays obvious.'},
{id:'hi-price',type:'pick',level:2,q:'Which pricing card puts the emphasis in the right place?',opts:[C(`<div style="font-weight:700">Pro plan</div><div style="font-weight:700">₦5,000 / month</div><div style="font-weight:700">Unlimited products</div><div style="font-weight:700">Priority support</div>`),C(`<div style="font-size:12px;font-weight:600;color:#4A5A4F">Pro plan</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;line-height:1.1">₦5,000<span style="font-size:12px;font-weight:600;color:#4A5A4F"> / month</span></div><div style="font-size:12px;color:#4A5A4F;margin-top:6px">Unlimited products · Priority support</div>`),C(`<div style="font-size:11px;color:#4A5A4F">₦5,000 / month</div><div style="font-weight:800;font-size:17px">Unlimited products</div><div style="font-weight:800;font-size:17px">Priority support</div>`)],ok:1,why:'The price is what people check first, so it gets the size. The plan name and features step back with a smaller, muted style.'},
{id:'hi-fix-stat',type:'fix',level:2,q:'This stat card makes people hunt for the number. What fixes it?',face:STAT('Total revenue this month','₦2.4m',16,'#14261D',800,13,400),opts:['Make the label bigger still','Make the value large and bold; make the label small and muted','Write both in capitals'],ok:1,why:'The value is what people came for. Labels should be small and quiet; values large and strong.'},
{id:'hi-name-squint',type:'name',level:2,q:'A designer blurs their screen before shipping to see what still stands out. What check is this?',face:`<div style="filter:blur(3px)">${C(COL(8,B(70,6,'#9AA39C')+B(150,26)+B(110,6,'#9AA39C')+B('100%',26,'#E8722C')))}</div>`,opts:['Squint test','Contrast check','Grid check','Focal point'],ok:0,why:'The squint test removes detail so only the strongest shapes remain. Those shapes are your real hierarchy.'},
{id:'hi-faint',type:'ab',level:3,q:'Both quiet down the supporting text. Which one went too far?',a:STAT('Balance','₦248,500',12,'#4A5A4F',600,26,800),b:STAT('Balance','₦248,500',12,'#B5BBB4',600,26,800),ok:'b',why:'De-emphasis must still be readable. B’s label is about 2:1 contrast and fails; keep quiet text at 4.5:1 or more against its background.'},
{id:'hi-close',type:'ab',level:3,q:'Which headline is different enough from its body text?',a:C(`<div style="font-size:15px;font-weight:600;line-height:1.2">Your payout is on its way</div><div style="font-size:14px;font-weight:500;margin-top:4px">It should reach your bank within 24 hours.</div>`),b:C(`<div style="font-size:19px;font-weight:800;line-height:1.15;font-family:'Bricolage Grotesque',sans-serif">Your payout is on its way</div><div style="font-size:13px;color:#4A5A4F;margin-top:4px">It should reach your bank within 24 hours.</div>`),ok:'b',why:'Hierarchy needs clear contrast. In A the levels differ by 1px and one weight step, so they read as the same level. Make the jump obvious.'},
{id:'hi-fix-sub',type:'fix',level:3,q:'The headline and subheading are fighting. What is the fix?',face:C(`<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;line-height:1.1">Grow your shop</div><div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:18px;line-height:1.15;margin-top:4px">Sell on WhatsApp, Instagram and your own site</div>`),opts:['Shrink the subheading to about 14px and give it a muted colour','Make the headline italic','Add an icon before the headline'],ok:0,why:'Two big bold lines compete for first place. De-emphasise the support line so the headline wins clearly.'}
];
})();
