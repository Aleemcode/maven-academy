(function(){
const SB='https://besjzgmacljwltnzhbzn.supabase.co/rest/v1';
const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2p6Z21hY2xqd2x0bnpoYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM4ODEsImV4cCI6MjEwODQxOTg4MX0.rM6bZG1TNLyBNkNaY72-Vv06TJoc6qNcLvIyYqmSPs0';
const H={apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'};
const L=window.LESSONS, G=window.GROUPS, MV=window.MOVEMENTS, RS=window.RESOURCES;
const CRAFT=L.filter(l=>l.dials);
const by=Object.fromEntries(L.map(l=>[l.slug,l]));
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* admin */
try{const a=new URLSearchParams(location.search).get('admin');if(a){store.set('tl2_admin',a);history.replaceState(null,'',location.pathname+location.hash)}}catch(e){}
const ADMIN=store.get('tl2_admin','');

/* state */
function defaults(){const s={};CRAFT.forEach(l=>{s[l.slug]={};l.dials.forEach(d=>{s[l.slug][d.k]=Array.isArray(d.def)?d.def.slice():d.def})});return s}
let S=merge(defaults(),store.get('tl2_state',{}));
function merge(base,over){for(const sl in over){if(!base[sl])continue;for(const k in over[sl]){if(k in base[sl])base[sl][k]=over[sl][k]}}return base}
const save=()=>store.set('tl2_state',S);
let learned=store.get('tl2_learned',[]);
let checks=store.get('tl2_checks',{});
let drillsDone=store.get('tl2_drills',{});
let mine=store.get('tl2_mine',[]);
let keys=store.get('tl2_keys',{});

function dial(sl,k){return by[sl].dials.find(d=>d.k===k)}
function opt(d,v){return (d.opts||[]).find(o=>(o.v!==undefined?o.v:o[1])==v)}
function disp(sl,k,st){st=st||S;const d=dial(sl,k);if(!d)return '';const v=st[sl][k];
 if(d.type==='select'){const o=opt(d,v);return o?o.l:v}
 if(d.type==='chips')return (v||[]).join(', ')||'none';
 if(d.type==='range')return v+(d.unit||'');
 if(d.type==='swatch'){const o=(d.opts||[]).find(o=>o[1].toLowerCase()==String(v).toLowerCase());return o?o[0]+' '+v:v}
 return v}
function sub(sl,k,p,st){st=st||S;const d=dial(sl,k);const v=st[sl][k];if(p==='v')return v;const o=d&&opt(d,v);return o&&o.css?o.css[p]:''}
function fill(str,sl,st){return str.replace(/\{\{(\w+)(?:\.(\w+))?\}\}/g,(m,k,p)=>p?sub(sl,k,p,st):disp(sl,k,st))}
function applyVars(el,sl,st){st=st||S;by[sl].dials.forEach(d=>{const v=st[sl][d.k];
 if(d.type==='select'){el.style.setProperty('--'+d.k,d.font?'"'+v+'"':v);const o=opt(d,v);if(o&&o.css)for(const c in o.css)el.style.setProperty('--'+d.k+'-'+c,o.css[c])}
 else if(d.type==='range')el.style.setProperty('--'+d.k,v+(d.unit||''));
 else if(d.type==='swatch')el.style.setProperty('--'+d.k,v)})}

/* tokens for the combined taste card */
function tok(st){st=st||S;const g=(sl,k)=>st[sl][k];const bo=opt(dial('colour','base'),g('colour','base')).css;
 const dep=opt(dial('depth','style'),g('depth','style')).css;const edge=opt(dial('depth','edge'),g('depth','edge')).css.b;
 const rad=g('shape','radius'),pad=g('shape','pad'),bt=g('shape','button');
 const on=g('colour','onaccent')==='light'?'#FFFFFF':'#14261D';
 const fix=s=>String(s).replace(/#14261D/g,bo.line);
 return{bg:bo.bg,surface:bo.surface,ink:bo.ink,muted:bo.muted,line:bo.line,accent:g('colour','accent'),onAccent:on,
  display:g('type','display'),body:g('type','body'),weight:g('type','weight'),track:g('type','track'),base:g('type','base'),ratio:+g('type','ratio'),leading:g('type','leading'),
  radius:rad,btnRadius:bt==='pill'?999:bt==='sharp'?0:Math.max(0,rad-pad),cardPad:g('space','pad'),border:g('space','border'),
  shadow:fix(dep.s2),shadowCard:fix(dep.s1),shadowModal:fix(dep.s3),edge:fix(edge),
  bgFx:opt(dial('background','kind'),g('background','kind')).css.bg,ease:g('motion','ease'),dur:g('motion','dur'),
  promise:g('intent','promise'),mood:(g('intent','mood')||[]).join(' · ')}}
function miniCard(st,scale){const t=tok(st);const s=scale||1;
 return `<div style="width:100%;height:100%;min-height:${190*s}px;background:${t.bgFx};background-color:${t.bg};display:flex;align-items:center;justify-content:center;padding:${18*s}px">
 <div style="background:${t.surface};color:${t.ink};border:${t.edge};box-shadow:${t.shadow};border-radius:${t.radius}px;padding:${Math.max(12,t.cardPad)*s}px;width:100%;max-width:${300*s}px;font-family:'${t.body}',sans-serif">
  <div style="font-family:'Space Mono';font-size:${10*s}px;font-weight:700;letter-spacing:2px;color:${t.muted};text-transform:uppercase">${esc(t.mood||'Taste card')}</div>
  <div style="font-family:'${t.display}',sans-serif;font-weight:${t.weight};letter-spacing:${t.track};font-size:${Math.round(Math.min(30,t.base*t.ratio*t.ratio)*s)}px;line-height:1.05;margin:${6*s}px 0">${esc(t.promise||'Your promise here')}</div>
  <div style="font-size:${Math.round(13*s)}px;color:${t.muted};line-height:1.45">Every pixel needs a reason.</div>
  <div style="display:flex;gap:${8*s}px;margin-top:${12*s}px;flex-wrap:wrap"><span style="background:${t.accent};color:${t.onAccent};border:${t.edge};border-radius:${t.btnRadius}px;padding:${8*s}px ${14*s}px;font-weight:700;font-size:${13*s}px">Primary action</span><span style="border:${t.edge.replace(/^0px[^,]*/,'1.5px solid '+t.line)};border-radius:${t.btnRadius}px;padding:${8*s}px ${14*s}px;font-weight:600;font-size:${13*s}px">Secondary</span></div>
 </div></div>`}

/* prompt + tokens output */
function buildPrompt(meta,st){st=st||S;const out=[];
 out.push('# Design taste: '+(meta.name||'Untitled taste'));
 out.push((meta.project?'Project: '+meta.project+' · ':'')+'Crafted by '+(meta.author||'a builder')+' with the MAB Taste Lab');
 if(meta.summary)out.push('','> '+meta.summary);
 out.push('','Apply this taste to everything you build for this project. Every rule below is intentional. Do not fall back to your defaults, and ask me before breaking a rule.');
 CRAFT.forEach(l=>{out.push('','## '+l.title);(l.brief||[]).forEach(b=>out.push('- '+fill(b,l.slug,st)))});
 out.push('','## Avoid (this is slop)','- Purple/blue “AI” gradients, glowing coloured shadows, emoji used as icons','- Generic stock photos, 3D blobs, “Welcome to the future” copy','- “Submit”, “Get started”, “Oops!” and other vague labels','- Centring everything, random spacing values, more than one accent colour','- Shipping only the happy path');
 out.push('','## Before you finish, check');
 CRAFT.forEach(l=>(l.check||[]).slice(0,2).forEach(c=>out.push('- [ ] '+c)));
 return out.join('\n')}
function buildTokens(meta,st){st=st||S;const t=tok(st);const g=(sl,k)=>st[sl][k];
 return JSON.stringify({taste:meta.name||'Untitled taste',author:meta.author||'',project:meta.project||'',
  color:{bg:t.bg,surface:t.surface,text:t.ink,muted:t.muted,line:t.line,accent:t.accent,onAccent:t.onAccent},
  type:{display:t.display,body:t.body,baseSize:t.base,scaleRatio:t.ratio,headlineWeight:+t.weight,headlineTracking:t.track,bodyLineHeight:t.leading,measure:g('type','measure')+'ch'},
  space:{unit:+g('space','unit'),cardPadding:g('space','pad'),groupGap:g('space','gap'),innerGap:g('space','tight'),border:g('space','border'),density:g('space','density')},
  layout:{columns:+g('layout','cols'),gutter:g('layout','gutter'),maxWidth:g('layout','max'),composition:g('layout','align'),pattern:g('layout','pattern')},
  shape:{radius:t.radius,buttonRadius:t.btnRadius},
  depth:{style:g('depth','style'),card:t.shadowCard,menu:t.shadow,modal:t.shadowModal,edge:t.edge},
  motion:{easing:t.ease,duration:t.dur+'ms',distance:g('motion','dist')+'px',stagger:g('motion','stagger')+'ms',reducedMotion:g('motion','reduce')},
  icons:{style:g('icons','style'),stroke:g('icons','stroke'),size:g('icons','size')},
  a11y:{contrast:g('a11y','level'),minTarget:g('a11y','target'),minText:g('a11y','textsize')}},null,2)}

/* toast + copy */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)}
async function copy(txt,msg){try{await navigator.clipboard.writeText(txt)}catch(e){const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(_){}a.remove()}toast(msg||'Copied')}

/* nav */
const ICON={start:'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',mov:'M4 19V5l8 6 8-6v14',lib:'M4 4h6v16H4zM14 4l6 1.5-3.5 15L11 19',res:'M5 4h11l3 3v13H5zM9 10h7M9 14h7M9 18h4'};
const svg=d=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
function renderNav(){const r=route();let h=`<a href="#/start" class="${r.v==='start'?'on':''}">${svg(ICON.start)}Start here</a>`;
 const pct=Math.round(learned.length/CRAFT.length*100);
 h+=`<div class="prog"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>Your progress</span><span class="mono">${learned.length}/${CRAFT.length}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
 let n=0;
 G.forEach(([g,gl])=>{const ls=L.filter(l=>l.group===g&&l.dials);if(!ls.length)return;h+=`<div class="nav-h">${gl}</div>`;
  ls.forEach(l=>{n++;const done=learned.includes(l.slug);h+=`<a href="#/t/${l.slug}" class="${r.v==='t'&&r.id===l.slug?'on':''}"><span class="dot ${done?'done':''}">${done?'✓':''}</span>${l.title}<span class="num">${String(n).padStart(2,'0')}</span></a>`})});
 h+=`<div class="nav-h">Reference</div><a href="#/movements" class="${r.v==='movements'?'on':''}">${svg(ICON.mov)}Design movements</a><a href="#/resources" class="${r.v==='resources'?'on':''}">${svg(ICON.res)}Resources</a>`;
 h+=`<div class="nav-h">Your work</div><a href="#/library" class="${r.v==='library'?'on':''}">${svg(ICON.lib)}Taste library<span class="num">${mine.length}</span></a>`;
 $('#nav').innerHTML=h}
function route(){const p=(location.hash||'#/start').slice(2).split('/');return{v:p[0]||'start',id:p[1]}}
function crumb(t){$('#crumb').innerHTML=t}

/* dials UI */
function dialsHTML(l,compact){return l.dials.map(d=>{const v=S[l.slug][d.k];let c='';
 if(d.type==='select'){c=`<div class="opts" role="radiogroup" aria-label="${esc(d.label)}">${d.opts.map(o=>`<button type="button" class="opt ${o.v==v?'on':''}" role="radio" aria-checked="${o.v==v}" data-sl="${l.slug}" data-k="${d.k}" data-v="${esc(o.v)}"${d.font?` style="font-family:'${o.v}'"`:''}><b>${esc(o.l)}</b>${o.d&&!compact?`<small>${esc(o.d)}</small>`:''}</button>`).join('')}</div>`}
 else if(d.type==='range'){c=`<input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-sl="${l.slug}" data-k="${d.k}" aria-label="${esc(d.label)}">`}
 else if(d.type==='swatch'){c=`<div class="sw">${d.opts.map(([n,h])=>`<button type="button" title="${n}" aria-label="${n}" class="${h.toLowerCase()==String(v).toLowerCase()?'on':''}" style="background:${h}" data-sl="${l.slug}" data-k="${d.k}" data-v="${h}"></button>`).join('')}<input type="color" value="${v}" data-sl="${l.slug}" data-k="${d.k}" aria-label="Custom colour"></div>`}
 else if(d.type==='chips'){c=`<div class="chipset">${d.opts.map(o=>`<button type="button" class="${(v||[]).includes(o)?'on':''}" aria-pressed="${(v||[]).includes(o)}" data-sl="${l.slug}" data-k="${d.k}" data-chip="${esc(o)}">${esc(o)}</button>`).join('')}</div>`}
 else if(d.type==='text'){c=`<input class="tin" type="text" maxlength="120" value="${esc(v)}" data-sl="${l.slug}" data-k="${d.k}" aria-label="${esc(d.label)}">`}
 return `<div class="dial"><label class="dl">${esc(d.label)}${d.type==='range'?`<span>${disp(l.slug,d.k)}</span>`:''}</label>${c}${d.help?`<div class="help">${esc(d.help)}</div>`:''}</div>`}).join('')}
function bindDials(root,onChange){
 root.addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b)return;const sl=b.dataset.sl,k=b.dataset.k;const d=dial(sl,k);
  if(b.dataset.chip!==undefined){const a=S[sl][k]||[];const i=a.indexOf(b.dataset.chip);i>=0?a.splice(i,1):a.push(b.dataset.chip);S[sl][k]=a;b.classList.toggle('on',i<0);b.setAttribute('aria-pressed',i<0)}
  else{let v=b.dataset.v;S[sl][k]=v;b.parentNode.querySelectorAll('button').forEach(x=>{x.classList.toggle('on',x===b);if(x.hasAttribute('role'))x.setAttribute('aria-checked',x===b)})}
  save();onChange(sl)});
 root.addEventListener('input',e=>{const i=e.target;if(!i.dataset||!i.dataset.k)return;const sl=i.dataset.sl,k=i.dataset.k,d=dial(sl,k);
  S[sl][k]=d.type==='range'?+i.value:i.value;
  if(d.type==='range'){const s=i.closest('.dial').querySelector('label span');if(s)s.textContent=disp(sl,k)}
  if(d.type==='swatch')i.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
  save();onChange(sl)})}

/* preview + hooks */
function renderPreview(el,sl){const l=by[sl];el.innerHTML=fill(l.preview,sl);applyVars(el,sl);(HOOK[sl]||(()=>{}))(el,S[sl])}
const HOOK={
 hierarchy(el,v){const f=el.querySelector('.h-focus');if(f){Object.assign(f.style,{fontSize:'24px',fontWeight:700,color:'#14261D'});if(v.focus==='size')Object.assign(f.style,{fontSize:'42px',fontWeight:700});if(v.focus==='weight')Object.assign(f.style,{fontSize:'24px',fontWeight:900});if(v.focus==='colour')Object.assign(f.style,{fontSize:'24px',color:'#B8551A'})}
  el.querySelectorAll('.h-sec span').forEach(s=>{s.style.cssText='flex:1;text-align:center;font-weight:600;font-size:14px;padding:9px;border-radius:10px';if(v.secondary==='ghost')s.style.border='2px solid #14261D';if(v.secondary==='text'){s.style.textDecoration='underline';s.style.padding='4px'}if(v.secondary==='filled'){s.style.background='#E8722C';s.style.border='2px solid #14261D';s.style.fontWeight=700}})},
 motion(el,v){const play=()=>el.querySelectorAll('.mo-item').forEach((it,i)=>{try{it.animate([{opacity:0,transform:`translateY(${v.dist}px)`},{opacity:1,transform:'none'}],{duration:+v.dur,easing:v.ease,delay:i*v.stagger,fill:'both'})}catch(e){}});play();const b=el.querySelector('[data-replay]');if(b)b.onclick=play},
 micro(el,v){const d=dial('micro','press'),h=dial('micro','hover');const pc=opt(d,v.press).css,hc=opt(h,v.hover).css;const p=el.querySelector('.mi-press');
  const rest=()=>{p.style.transform='none';p.style.boxShadow='3px 3px 0 #14261D';p.style.filter='none'};
  p.onpointerenter=()=>{if(v.hover==='lift'){p.style.transform=hc.t;p.style.boxShadow='5px 5px 0 #14261D'}if(v.hover==='tint')p.style.filter='brightness(.92)'};
  p.onpointerleave=rest;p.onpointerdown=()=>{p.style.transform=pc.t;p.style.boxShadow=pc.s};p.onpointerup=()=>p.onpointerenter();
  const s=el.querySelector('.mi-save'),t=el.querySelector('.mi-toast');let busy=false;
  s.onclick=()=>{if(busy)return;busy=true;s.innerHTML='<span style="display:inline-block;width:14px;height:14px;border:2px solid #D6E59A;border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite;vertical-align:-2px"></span> Saving…';
   setTimeout(()=>{s.style.background='#D6E59A';s.style.color='#14261D';s.innerHTML='✓ Saved';if(v.success==='pop')s.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.34,1.56,.64,1)'});
    t.textContent=v.undo==='undo'?'Saved · Undo':'Saved';if(v.success!=='check'||v.undo==='undo')t.style.opacity=1;
    setTimeout(()=>{s.style.background='#14261D';s.style.color='#F4F0E5';s.textContent='Save changes';t.style.opacity=0;busy=false},2000)},900)}},
 logo(el,v){const n=+v.colours;const simple=v.detail==='simple';
  const mark=(sz,bg)=>{const dark=bg==='#14261D';const ink=dark?'#F4F0E5':'#14261D';const fillc=n===1?'none':'#E8722C';
   const inner=n===3?`<circle cx="72" cy="28" r="10" fill="#D6E59A" stroke="${ink}" stroke-width="5"/>`:'';
   const body=simple?`<path d="M34 26v48M34 52l30-26M44 46l22 28" stroke="${n===1?ink:'#14261D'}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`:
    `<circle cx="50" cy="46" r="22" fill="none" stroke="${n===1?ink:'#14261D'}" stroke-width="2"/><circle cx="50" cy="46" r="12" fill="none" stroke="${n===1?ink:'#14261D'}" stroke-width="1.5"/><path d="M28 72 L50 30 L72 72 Z" fill="none" stroke="${n===1?ink:'#14261D'}" stroke-width="1.5"/><text x="50" y="88" font-size="7" text-anchor="middle" fill="${n===1?ink:'#14261D'}" font-family="Arial">KOBO · SOLUTIONS</text>`;
   return `<svg width="${sz}" height="${sz}" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="24" fill="${fillc}" stroke="${n===1?ink:'#14261D'}" stroke-width="6"/>${body}${inner}</svg>`};
  el.querySelector('.lg-sizes').innerHTML=[16,32,64,104].map(z=>`<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${mark(z,'#F4F0E5')}<span class="mono" style="font-size:10px">${z}px</span></div>`).join('');
  el.querySelector('.lg-bgs').innerHTML=['#F4F0E5','#14261D','#FFFFFF'].map(b=>`<div style="width:74px;height:74px;border-radius:14px;border:2px solid #14261D;background:${b};display:grid;place-items:center">${mark(44,b)}</div>`).join('')},
 voice(el,v){const T={warm:['Send invoice','That number looks short. Nigerian numbers have 11 digits, like 0803 123 4567.','No sales yet today. Record your first one by voice. It takes 5 seconds.'],
   formal:['Send invoice','The phone number entered is incomplete. Please enter all 11 digits.','There are no transactions to display for today.'],
   playful:['Fire it off','Hmm, that number’s a little short. 11 digits, please!','Quiet day so far. Let’s get your first sale in!'],
   minimal:['Send','Enter 11 digits.','No sales yet.']}[v.tone];
  const P={we:'We’ve sent it. Tunde will get it in a moment.',you:'You sent it. Tunde will get it in a moment.',neutral:'Invoice sent to Tunde.'}[v.person];
  let btn=T[0],err=T[1],emp=T[2];if(v.case==='title')btn=btn.replace(/\b\w/g,c=>c.toUpperCase());
  if(v.naija==='strong'){err='Abeg check the number, e never reach 11 digits.';emp='No sale yet today. Make we record the first one sharp sharp.'}
  if(v.naija==='none'){err=err.replace(/Nigerian numbers have 11 digits, like 0803 123 4567\./,'Phone numbers need 11 digits.')}
  const row=(l,t)=>`<div style="padding:8px 0;border-bottom:1.5px dashed rgba(20,38,29,.25)"><div class="mono" style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#B8551A">${l}</div><div style="font-size:15px;margin-top:2px">${t}</div></div>`;
  el.querySelector('.vc').innerHTML=row('ERROR',esc(err))+row('EMPTY STATE',esc(emp))+row('SUCCESS',esc(P))+`<div style="margin-top:12px"><span style="background:#E8722C;border:2px solid #14261D;border-radius:10px;padding:9px 16px;font-weight:700;display:inline-block">${esc(btn)}</span></div>`},
 states(el,v){const list=(v.states&&v.states.length)?v.states:['Empty'];const tabs=el.querySelector('.st-tabs'),view=el.querySelector('.st-view');
  const B=t=>`<span style="background:#E8722C;border:2px solid #14261D;border-radius:10px;padding:8px 14px;font-weight:700;display:inline-block;font-size:14px">${t}</span>`;
  const V={Empty:()=>`${v.empty==='illus'?'<svg width="56" height="56" viewBox="0 0 24 24" fill="#D6E59A" stroke="#14261D" stroke-width="1.6"><path d="M3 7h18v12H3zM3 7l3-3h12l3 3"/></svg>':''}<b style="display:block;font-size:17px">No orders yet</b>${v.empty!=='text'?`<div style="color:#4A5A4F;font-size:14px;margin:4px 0 12px">Share your shop link and your first order will land here.</div>${B('Share shop link')}`:''}`,
   Loading:()=>v.loading==='skeleton'?`<div style="display:grid;gap:10px">${[80,60,90].map(w=>`<div class="skel" style="width:${w}%"></div>`).join('')}</div>`:v.loading==='spinner'?`<div style="display:grid;place-items:center;height:90px"><span style="width:28px;height:28px;border:3px solid #14261D;border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></span></div>`:`<div style="font-weight:700;font-size:14px">Importing 240 orders… 64%</div><div style="height:12px;border:2px solid #14261D;border-radius:99px;margin-top:8px;overflow:hidden"><i style="display:block;height:100%;width:64%;background:#E8722C"></i></div>`,
   Partial:()=>`<div style="display:grid;gap:8px"><div><b>#2041 · Tunde</b> · ₦12,500</div><div><b>#2042 · Ada</b> · ₦8,000</div><div style="background:#FBE3D3;border:2px solid #14261D;border-radius:10px;padding:8px 10px;font-size:14px">1 order couldn’t load. <u>Retry</u></div></div>`,
   Error:()=>`<b style="display:block;font-size:17px">We couldn’t load your orders</b><div style="color:#4A5A4F;font-size:14px;margin:4px 0 12px">Your connection dropped. Nothing was lost.</div>${B('Try again')}`,
   Success:()=>`<div style="display:grid;place-items:center;height:90px"><span style="background:#14261D;color:#D6E59A;border-radius:99px;padding:9px 16px;font-weight:700">✓ Order saved · Undo</span></div>`,
   Offline:()=>v.offline==='queue'?`<div style="background:#14261D;color:#F4F0E5;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600">You’re offline. Changes are saved and will sync when you’re back.</div><div style="margin-top:10px"><b>#2043 · Musa</b> · ₦4,500 <span class="mono" style="font-size:10px;color:#B8551A">WAITING TO SYNC</span></div>`:`<b style="display:block;font-size:17px">You’re offline</b><div style="color:#4A5A4F;font-size:14px;margin-top:4px">Connect to the internet to see your orders.</div>`,
   Disabled:()=>`<span style="background:#E8722C;border:2px solid #14261D;border-radius:10px;padding:8px 14px;font-weight:700;display:inline-block;opacity:.45">Send invoice</span><div style="color:#4A5A4F;font-size:14px;margin-top:8px">Add a customer first to send an invoice.</div>`,
   'Too much data':()=>`<div class="mono" style="font-size:12px;font-weight:700">Showing 50 of 2,431 orders</div><input class="tin" style="margin:8px 0" placeholder="Search by name or order number" aria-label="Search orders"><div style="font-size:14px;color:#4A5A4F">Filter: This week · Unpaid</div>`};
  let cur=list[0];const draw=()=>{tabs.innerHTML=list.map(s=>`<button type="button" class="btn sm ${s===cur?'ink':''}" data-st="${esc(s)}">${esc(s)}</button>`).join('');view.innerHTML=(V[cur]||(()=>''))()};
  tabs.onclick=e=>{const b=e.target.closest('[data-st]');if(b){cur=b.dataset.st;draw()}};draw()}
};

/* pages */
function pageStart(){crumb('<b>Start here</b>');const next=CRAFT.find(l=>!learned.includes(l.slug))||CRAFT[0];
 let h=`<div class="welcome"><div class="card big"><div class="eyebrow">Taste Lab · learn → train → craft → share</div><h1>Learn the language of taste.</h1><p class="prose" style="color:#4A5A4F">AI can build anything. It just can’t decide what is <b style="color:#14261D">good</b>. This lab trains that decision: one taste at a time, with the words designers use, the slop to avoid, drills for your eye, and the exact prompts that direct AI on purpose.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn pri" href="#/t/${next.slug}">${learned.length?'Continue: ':'Start with '}${next.title} →</a><button class="btn" data-craft>Craft your taste</button></div></div>
 <div class="card note"><div class="eyebrow" style="color:#14261D">The Maven principle</div><div class="quote">Pixel-perfect.<br>Purpose-driven.<br>Three steps or less.</div><div style="font-family:Caveat;font-size:26px;line-height:1">Intentional, not accidental.</div></div></div>
 <div class="steps4">${[['01','Learn','One taste at a time: what it is, its vocabulary and why it matters.'],['02','Train','Compare slop vs craft, play with the dials and pass the A/B drills.'],['03','Craft','Turn your choices into a Taste Card: a brief AI can follow.'],['04','Share','Save it for yourself or publish it with your name for other builders.']].map(([n,t,p])=>`<div class="card"><span class="mono" style="font-size:12px;font-weight:700;color:#B8551A">${n}</span><b>${t}</b><p>${p}</p></div>`).join('')}</div>`;
 G.forEach(([g,gl])=>{const ls=L.filter(l=>l.group===g&&l.dials);if(!ls.length)return;h+=`<div class="grp-h"><h2>${gl}</h2><span class="mono" style="font-size:12px;color:#4A5A4F">${ls.length} taste${ls.length>1?'s':''}</span></div><div class="grid-t">${ls.map(l=>`<a class="ttile ${learned.includes(l.slug)?'done':''}" href="#/t/${l.slug}"><span class="mono" style="font-size:10px;font-weight:700;letter-spacing:1.5px">${learned.includes(l.slug)?'✓ LEARNED':'NOT YET'}</span><b>${l.title}</b><span>${l.tagline}</span></a>`).join('')}</div>`});
 h+=`<div class="grp-h"><h2>Reference</h2></div><div class="grid-t"><a class="ttile" href="#/movements"><b>Design movements</b><span>Nine styles to borrow vocabulary from, each a one-click starting taste.</span></a><a class="ttile" href="#/resources"><b>Resources</b><span>Hand-picked reading (and soon videos) on training your taste.</span></a><a class="ttile" href="#/library"><b>Taste library</b><span>Your saved tastes and tastes published by other builders.</span></a></div>`;
 $('#page').innerHTML=h}

function pageTaste(sl){const l=by[sl];if(!l||!l.dials)return pageStart();const idx=CRAFT.indexOf(l);const gl=G.find(g=>g[0]===l.group)[1];
 crumb(`${gl} / <b>${l.title}</b>`);const ck=checks[sl]||[];const dd=drillsDone[sl]||{};
 const prev=CRAFT[idx-1],next=CRAFT[idx+1];
 let h=`<div class="hero"><div><div class="eyebrow">${gl} · Taste ${String(idx+1).padStart(2,'0')} of ${CRAFT.length}</div><h1>${l.title}</h1><div class="tag">${l.tagline}</div>
  <div class="chips-row"><span class="pill">${l.vocab.length} terms</span><span class="pill">${l.dials.length} dials</span><span class="pill">${l.drills.length} drills</span><span class="pill">${l.check.length}-point checklist</span></div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" data-craft="${sl}">Craft your taste</button></div></div>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">01</span><h2>What it is</h2></div><div class="two"><div class="prose"><p>${l.what}</p></div><div class="why"><div class="eyebrow">Why it matters with AI</div><p style="margin:6px 0 0;font-size:16px">${l.why}</p></div></div></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">02</span><h2>The language</h2><p>Say these words and AI listens.</p></div><div class="vocab">${l.vocab.map(([t,m])=>`<div class="term"><b>${esc(t)}</b><span>${esc(m)}</span></div>`).join('')}</div></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">03</span><h2>Slop vs craft</h2><p>Same job, two levels of intent.</p></div><div class="cmp"><div class="side-c slop"><div class="lab"><span>SLOP · NOBODY DECIDED</span><span>✕</span></div><div class="stage">${l.compare.slop}</div></div><div class="side-c craft"><div class="lab"><span>CRAFT · INTENTIONAL</span><span>✓</span></div><div class="stage">${l.compare.craft}</div></div></div><ul class="diffs">${l.compare.diffs.map(d=>`<li>${d}</li>`).join('')}</ul></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">04</span><h2>Play with the dials</h2><p>Every choice here also feeds your Taste Card.</p></div><div class="play"><div class="dials" id="dials">${dialsHTML(l)}</div><div class="pv-wrap"><div class="pv" id="pv"></div><div class="pv-cap"><span>LIVE PREVIEW</span><button class="btn sm ghost" id="resetD" style="min-height:30px;padding:2px 8px">Reset dials</button></div></div></div></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">05</span><h2>Rules of thumb</h2></div><div class="rules"><div class="col do"><h3>Do</h3><ul>${l.rules.do.map(r=>`<li>${r}</li>`).join('')}</ul></div><div class="col dont"><h3>Don’t</h3><ul>${l.rules.dont.map(r=>`<li>${r}</li>`).join('')}</ul></div></div></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">06</span><h2>Train your eye</h2><p>Pick the one with taste.</p></div>${l.drills.map((d,i)=>{const done=dd[i];return `<div class="drill" data-i="${i}"><div class="q"><span class="mono">${i+1}/${l.drills.length}</span>${d.q}</div><div class="ab">${['a','b'].map(s=>`<button type="button" data-pick="${s}" class="${done?(s===d.ok?'right':(done===s?'wrong':'')):''}"><div class="face">${d[s]}</div><div class="lt">OPTION ${s.toUpperCase()}</div></button>`).join('')}</div><div class="verdict ${done?'show '+(done===d.ok?'ok':'no'):''}">${done?(done===d.ok?'<b>Sharp eye.</b> ':'<b>Look again.</b> ')+d.why:''}</div></div>`}).join('')}</section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">07</span><h2>Say it to AI</h2><p>Same request, directed on purpose.</p></div><div class="prompts"><div class="pbox lazy"><div class="lab"><span>LAZY PROMPT</span></div><pre>${esc(l.prompt.lazy)}</pre></div><div class="pbox dir"><div class="lab"><span>DIRECTED PROMPT</span><button class="btn sm" data-copy="dir" style="min-height:30px;padding:2px 10px;box-shadow:none">Copy</button></div><pre>${esc(l.prompt.directed)}</pre></div></div>
  <div class="pbox" style="margin-top:16px"><div class="lab" style="background:var(--lime)"><span>YOUR VERSION · FROM THE DIALS ABOVE</span><button class="btn sm" data-copy="mine" style="min-height:30px;padding:2px 10px;box-shadow:none">Copy</button></div><pre id="mineBrief"></pre></div></section>`;
 h+=`<section class="sec"><div class="sec-h"><span class="n">08</span><h2>Before you ship</h2><p>Tick what your current project passes.</p></div><div class="checks">${l.check.map((c,i)=>`<label class="chk ${ck.includes(i)?'on':''}"><input type="checkbox" data-ck="${i}" ${ck.includes(i)?'checked':''}>${c}</label>`).join('')}</div>
  <div class="finale"><div><h3>${learned.includes(sl)?'You’ve learned '+l.title+'.':'Ready to own '+l.title+'?'}</h3><p>Mark it learned, then put it to work in a Taste Card for your next project.</p></div><div class="acts"><button class="btn ${learned.includes(sl)?'':'pri'}" id="learnBtn">${learned.includes(sl)?'✓ Learned':'Mark as learned'}</button><button class="btn" style="background:var(--lime)" data-craft="${sl}">Craft your taste</button></div></div>
  <div style="margin-top:24px"><div class="eyebrow" style="margin-bottom:8px">Go deeper</div><div class="srcs">${l.sources.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join('')}</div></div></section>`;
 h+=`<div class="pager">${prev?`<a class="btn" href="#/t/${prev.slug}">← ${prev.title}</a>`:'<span></span>'}${next?`<a class="btn ink" href="#/t/${next.slug}">${next.title} →</a>`:`<a class="btn ink" href="#/movements">Design movements →</a>`}</div>`;
 $('#page').innerHTML=h;
 const pv=$('#pv');const upd=()=>{renderPreview(pv,sl);$('#mineBrief').textContent=l.brief.map(b=>fill(b,sl)).join('\n')};upd();
 bindDials($('#dials'),upd);
 $('#resetD').onclick=()=>{const d=defaults();S[sl]=d[sl];save();pageTaste(sl);toast('Dials reset')};
 document.querySelectorAll('.drill').forEach(dr=>dr.addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(!b)return;const i=+dr.dataset.i,d=l.drills[i],p=b.dataset.pick;
  dr.querySelectorAll('[data-pick]').forEach(x=>{x.classList.remove('right','wrong');if(x.dataset.pick===d.ok)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
  const v=dr.querySelector('.verdict');v.className='verdict show '+(p===d.ok?'ok':'no');v.innerHTML=(p===d.ok?'<b>Sharp eye.</b> ':'<b>Look again.</b> ')+d.why;
  drillsDone[sl]=drillsDone[sl]||{};drillsDone[sl][i]=p;store.set('tl2_drills',drillsDone)}));
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copy(b.dataset.copy==='dir'?l.prompt.directed:$('#mineBrief').textContent,'Prompt copied'));
 document.querySelectorAll('[data-ck]').forEach(c=>c.onchange=()=>{const a=checks[sl]||[];const i=+c.dataset.ck;c.checked?a.includes(i)||a.push(i):a.splice(a.indexOf(i),1);checks[sl]=a;store.set('tl2_checks',checks);c.closest('.chk').classList.toggle('on',c.checked)});
 $('#learnBtn').onclick=()=>{if(learned.includes(sl))learned=learned.filter(x=>x!==sl);else{learned.push(sl);toast(l.title+' learned · '+learned.length+'/'+CRAFT.length)}store.set('tl2_learned',learned);renderNav();pageTaste(sl)}}

function pageMovements(){crumb('Reference / <b>Design movements</b>');const l=by.movements;
 $('#page').innerHTML=`<div class="hero"><div><div class="eyebrow">Reference</div><h1>Design movements</h1><div class="tag">${l.tagline}</div></div></div>
 <div class="two" style="margin-bottom:24px"><div class="prose"><p>${l.what}</p></div><div class="why"><div class="eyebrow">Why it matters with AI</div><p style="margin:6px 0 0">${l.why}</p></div></div>
 <div class="mov">${MV.map(m=>`<div class="mv"><div class="sp">${m.spec}</div><div class="bd"><span class="mono" style="font-size:11px;font-weight:700;color:#B8551A">${esc(m.era)}</span><h3>${esc(m.n)}</h3><div style="font-size:14px">${esc(m.traits)}</div><div style="font-size:13px;color:#4A5A4F"><b>Best for:</b> ${esc(m.use)}</div><div class="acts"><button class="btn sm pri" data-preset="${m.k}">Start a taste from this</button></div></div></div>`).join('')}</div>
 <div class="sec"><div class="sec-h"><h2>The vocabulary</h2></div><div class="vocab">${l.vocab.map(([t,m])=>`<div class="term"><b>${esc(t)}</b><span>${esc(m)}</span></div>`).join('')}</div></div>`;
 document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const m=MV.find(x=>x.k===b.dataset.preset);for(const p in m.preset){const[sl,k]=p.split('.');if(S[sl]&&k in S[sl])S[sl][k]=m.preset[p]}save();toast(m.n+' loaded as your starting taste');openCraft('colour')})}

function pageResources(){crumb('Reference / <b>Resources</b>');
 const ic='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5zM9 10h7M9 14h7M9 18h4"/></svg>';
 const vid='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14261D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h13v12H3zM16 10l5-3v10l-5-3"/></svg>';
 $('#page').innerHTML=`<div class="hero"><div><div class="eyebrow">Reference</div><h1>Resources</h1><div class="tag">Reading and watching that sharpens your eye. Curated by Aleem.</div></div></div>
 <div class="sec-h"><h2>Read</h2><p>${RS.articles.length} articles</p></div>
 <div class="res">${RS.articles.map(a=>`<a class="ra" href="${a.u}" target="_blank" rel="noopener"><div class="ic">${ic}</div><div><span class="mono" style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#B8551A">${esc(a.src.toUpperCase())} · ${esc(a.tag.toUpperCase())}</span><b>${esc(a.t)}</b><p>${esc(a.d)}</p></div><span class="go">Open ↗</span></a>`).join('')}</div>
 <div class="sec"><div class="sec-h"><h2>Watch</h2><p>${RS.videos.length?RS.videos.length+' videos':'Coming soon'}</p></div>
 ${RS.videos.length?`<div class="res">${RS.videos.map(a=>`<a class="ra" href="${a.u}" target="_blank" rel="noopener"><div class="ic" style="background:var(--peach)">${vid}</div><div><span class="mono" style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#B8551A">${esc((a.src||'VIDEO').toUpperCase())}</span><b>${esc(a.t)}</b><p>${esc(a.d||'')}</p></div><span class="go">Watch ↗</span></a>`).join('')}</div>`:`<div class="empty"><div style="display:inline-grid;place-items:center;width:56px;height:56px;border-radius:14px;border:2px solid #14261D;background:var(--peach);margin-bottom:10px">${vid}</div><h3>Videos are on the way</h3><p style="margin:0;color:#4A5A4F">Aleem is curating talks and walkthroughs. They’ll appear here.</p></div>`}</div>`}

let libTab='mine',community=null,commErr='';
async function loadCommunity(){try{const r=await fetch(SB+'/taste_cards?select=id,created_at,name,author,project,summary,spec&order=created_at.desc&limit=200',{headers:H});if(!r.ok)throw new Error(r.status);community=await r.json();commErr=''}catch(e){commErr='Couldn’t load community tastes. Check your connection and refresh.';community=community||[]}if(route().v==='library')pageLibrary()}
function pageLibrary(){crumb('Your work / <b>Taste library</b>');
 const items=libTab==='mine'?mine:(community||[]);
 let grid='';
 if(libTab==='community'&&community===null)grid=`<div class="lib">${[1,2,3].map(()=>`<div class="tc"><div class="mini" style="padding:24px;display:grid;gap:10px;width:100%"><div class="skel"></div><div class="skel" style="width:60%"></div></div><div class="meta"><div class="skel" style="width:70%"></div></div></div>`).join('')}</div>`;
 else if(!items.length)grid=`<div class="empty" style="margin-top:18px"><h3>${libTab==='mine'?'No tastes saved yet':'No community tastes yet'}</h3><p style="margin:0 0 14px;color:#4A5A4F">${libTab==='mine'?'Craft your first Taste Card. It takes about five minutes once you’ve learned a few tastes.':'Be the first builder to publish a taste for others to use.'}</p><button class="btn pri" data-craft>Craft your taste</button></div>`;
 else grid=`<div class="lib">${items.map((t,i)=>`<button type="button" class="tc" data-open="${i}"><div class="mini">${miniCard(merge(defaults(),(t.spec&&t.spec.state)||{}),.8)}</div><div class="meta"><b>${esc(t.name)}</b><span>${esc(t.author||'')}${t.project?' · '+esc(t.project):''}</span><span class="mono" style="font-size:10px">${new Date(t.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}${t.published||keys[t.id]?' · PUBLISHED':''}</span></div></button>`).join('')}</div>`;
 $('#page').innerHTML=`<div class="hero"><div><div class="eyebrow">Your work</div><h1>Taste library</h1><div class="tag">Save tastes for yourself. Publish them with your name for other builders to remix.</div></div><button class="btn pri" data-craft>Craft a new taste</button></div>
 <div class="tabs" role="tablist"><button role="tab" aria-selected="${libTab==='mine'}" class="${libTab==='mine'?'on':''}" data-tab="mine">My tastes (${mine.length})</button><button role="tab" aria-selected="${libTab==='community'}" class="${libTab==='community'?'on':''}" data-tab="community">Community${community?' ('+community.length+')':''}</button></div>
 ${commErr&&libTab==='community'?`<div class="verdict show no" style="margin-top:14px">${commErr}</div>`:''}${grid}`;
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{libTab=b.dataset.tab;if(libTab==='community')loadCommunity();pageLibrary()});
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openDetail(items[+b.dataset.open],libTab))}

/* detail */
function openDetail(t,src){const st=merge(defaults(),(t.spec&&t.spec.state)||{});const meta={name:t.name,author:t.author,project:t.project,summary:t.summary};
 const isMine=src==='mine'||keys[t.id];const canDel=src==='mine'||keys[t.id]||ADMIN;
 $('#dEye').textContent=src==='mine'?'My taste':'Community taste · by '+(t.author||'a builder');$('#dTitle').textContent=t.name;
 const prompt=buildPrompt(meta,st),tokens=buildTokens(meta,st);
 $('#dBody').innerHTML=`<div class="two"><div style="border:var(--line);border-radius:16px;overflow:hidden;min-height:260px;display:flex">${miniCard(st,1)}</div><div>${t.summary?`<p style="font-size:17px;margin-top:0">${esc(t.summary)}</p>`:''}<div style="font-size:14px;color:#4A5A4F">${esc(t.author||'')}${t.project?' · for '+esc(t.project):''}</div>
  <div class="acts-row"><button class="btn pri" id="dCopy">Copy prompt</button><button class="btn" id="dTok">Copy tokens</button><button class="btn" style="background:var(--lime)" id="dRemix">Remix in crafter</button>${src==='mine'&&!t.published?'<button class="btn ink" id="dPub">Publish to community</button>':''}${canDel?'<button class="btn ghost" id="dDel" style="color:#A3361A">Delete</button>':''}</div></div></div>
  <div class="out-tabs"><button class="btn sm ink" data-o="p">Prompt</button><button class="btn sm" data-o="t">Tokens (JSON)</button></div><textarea class="out" id="dOut" readonly aria-label="Output">${esc(prompt)}</textarea>`;
 $('#dCopy').onclick=()=>copy(prompt,'Prompt copied. Paste it into your AI tool.');$('#dTok').onclick=()=>copy(tokens,'Tokens copied');
 document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-o]').forEach(x=>x.classList.toggle('ink',x===b));$('#dOut').value=b.dataset.o==='p'?prompt:tokens});
 $('#dRemix').onclick=()=>{S=st;save();closeDetail();openCraft(null,{name:src==='mine'?t.name:t.name+' (remix)',author:src==='mine'?t.author:store.get('tl2_author',''),project:t.project,summary:t.summary})};
 const pub=$('#dPub');if(pub)pub.onclick=async()=>{pub.disabled=true;pub.textContent='Publishing…';const r=await publish(meta,st);if(r){t.published=r.id;store.set('tl2_mine',mine);toast('Published with your name');closeDetail();pageLibrary()}else{pub.disabled=false;pub.textContent='Publish to community'}};
 const del=$('#dDel');if(del){let armed=false;del.onclick=async()=>{if(!armed){armed=true;del.textContent='Tap again to delete';del.style.background='var(--blush)';setTimeout(()=>{armed=false;del.textContent='Delete';del.style.background=''},3000);return}
  if(src==='mine'){mine=mine.filter(x=>x!==t);store.set('tl2_mine',mine);if(t.published&&keys[t.published])await rpc('delete_taste',{p_id:t.published,p_key:keys[t.published]})}
  else{const ok=keys[t.id]?await rpc('delete_taste',{p_id:t.id,p_key:keys[t.id]}):await rpc('admin_delete_taste',{p_id:t.id,p_secret:ADMIN});if(!ok){toast('Couldn’t delete. Try again.');return}community=(community||[]).filter(x=>x.id!==t.id)}
  toast('Deleted');closeDetail();renderNav();pageLibrary()}}
 $('#dScrim').classList.add('open');document.body.style.overflow='hidden'}
function closeDetail(){$('#dScrim').classList.remove('open');document.body.style.overflow=''}
async function rpc(fn,body){try{const r=await fetch(SB+'/rpc/'+fn,{method:'POST',headers:H,body:JSON.stringify(body)});if(!r.ok)return false;const j=await r.json();return j!==false}catch(e){return false}}
async function publish(meta,st){const key=(crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g,()=>(Math.random()*16|0).toString(16)));
 const body={name:(meta.name||'Untitled taste').slice(0,80),author:(meta.author||'Anonymous builder').slice(0,80),project:(meta.project||'').slice(0,120)||null,summary:(meta.summary||'').slice(0,300)||null,spec:{v:1,state:st},edit_key:key};
 try{const r=await fetch(SB+'/taste_cards?select=id,created_at,name,author,project,summary,spec',{method:'POST',headers:Object.assign({Prefer:'return=representation'},H),body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());const j=(await r.json())[0];keys[j.id]=key;store.set('tl2_keys',keys);if(community)community.unshift(j);return j}catch(e){toast('Couldn’t publish. Check your connection and try again.');return null}}

/* craft modal */
let step=0,meta={name:'',author:store.get('tl2_author',''),project:'',summary:''},seen=new Set(),outMode='p';
function openCraft(startSlug,m){if(m)meta=Object.assign({name:'',author:'',project:'',summary:''},m);
 step=startSlug?Math.max(0,CRAFT.findIndex(l=>l.slug===startSlug)):0;seen=new Set([step]);
 $('#scrim').classList.add('open');document.body.style.overflow='hidden';drawCraft();setTimeout(()=>$('#mClose').focus(),50)}
function closeCraft(){$('#scrim').classList.remove('open');document.body.style.overflow='';const r=route();if(r.v==='t')pageTaste(r.id)}
function drawCraft(){const N=CRAFT.length;const fin=step===N;
 $('#rail').innerHTML=CRAFT.map((l,i)=>`<button type="button" class="${i===step?'on':''} ${seen.has(i)?'seen':''}" data-s="${i}"><span class="k">${seen.has(i)&&i!==step?'✓':i+1}</span>${l.title}</button>`).join('')+`<button type="button" class="${fin?'on':''}" data-s="${N}"><span class="k">★</span>Name &amp; save</button>`;
 $('#mBody').classList.toggle('final',fin);
 if(!fin){const l=CRAFT[step];const gl=G.find(g=>g[0]===l.group)[1];
  $('#mStep').innerHTML=`<div class="eyebrow">${gl} · step ${step+1} of ${N}</div><h3>${l.title}</h3><p class="tg">${l.tagline} <a href="#/t/${l.slug}" id="mLearn" style="font-weight:700">Learn this taste →</a></p><div class="dials" id="mDials">${dialsHTML(l,true)}</div>`;
  bindDials($('#mDials'),()=>drawPv());$('#mLearn').onclick=()=>closeCraft()}
 else{$('#mStep').innerHTML=`<div class="eyebrow">Final step</div><h3>Name your taste</h3><p class="tg">Copy it into your AI tool, keep it in your library, or publish it with your name.</p>
  <div class="form-g"><label>Taste name<input class="fld" id="fName" maxlength="80" placeholder="e.g. Market-day warmth" value="${esc(meta.name)}"></label><label>Your name<input class="fld" id="fAuthor" maxlength="80" placeholder="e.g. Aleem Akinyoola" value="${esc(meta.author)}"></label><label class="full">Project it’s for<input class="fld" id="fProj" maxlength="120" placeholder="e.g. Kobo, a sales tracker for market traders" value="${esc(meta.project)}"></label><label class="full">One-line summary (optional)<input class="fld" id="fSum" maxlength="300" placeholder="Warm, confident and fast. Built for one-hand use at the stall." value="${esc(meta.summary)}"></label></div>
  <div style="border:var(--line);border-radius:16px;overflow:hidden;margin-top:16px;min-height:230px;display:flex">${miniCard(S,1)}</div>
  <div class="out-tabs"><button class="btn sm ${outMode==='p'?'ink':''}" data-om="p">Prompt</button><button class="btn sm ${outMode==='t'?'ink':''}" data-om="t">Tokens (JSON)</button></div><textarea class="out" id="mOut" readonly aria-label="Generated output"></textarea>
  <div class="acts-row"><button class="btn pri" id="aCopy">Copy prompt</button><button class="btn" id="aTok">Copy tokens</button><button class="btn" style="background:var(--lime)" id="aSave">Save to my library</button><button class="btn ink" id="aPub">Save &amp; publish with my name</button></div>`;
  const sync=()=>{meta.name=$('#fName').value.trim();meta.author=$('#fAuthor').value.trim();meta.project=$('#fProj').value.trim();meta.summary=$('#fSum').value.trim();store.set('tl2_author',meta.author);$('#mOut').value=outMode==='p'?buildPrompt(meta):buildTokens(meta)};
  ['#fName','#fAuthor','#fProj','#fSum'].forEach(s=>$(s).oninput=sync);sync();
  document.querySelectorAll('[data-om]').forEach(b=>b.onclick=()=>{outMode=b.dataset.om;document.querySelectorAll('[data-om]').forEach(x=>x.classList.toggle('ink',x===b));sync()});
  $('#aCopy').onclick=()=>copy(buildPrompt(meta),'Prompt copied. Paste it into your AI tool.');$('#aTok').onclick=()=>copy(buildTokens(meta),'Tokens copied');
  const need=()=>{if(!meta.name){$('#fName').focus();toast('Give your taste a name first');return false}return true};
  const local=()=>{const t={id:'local-'+Date.now(),created_at:new Date().toISOString(),name:meta.name,author:meta.author,project:meta.project,summary:meta.summary,spec:{v:1,state:JSON.parse(JSON.stringify(S))}};mine.unshift(t);store.set('tl2_mine',mine);renderNav();return t};
  $('#aSave').onclick=()=>{if(!need())return;local();toast('Saved to your library');closeCraft();location.hash='#/library';libTab='mine';pageLibrary()};
  $('#aPub').onclick=async()=>{if(!need())return;if(!meta.author){$('#fAuthor').focus();toast('Add your name so builders know who crafted it');return}const b=$('#aPub');b.disabled=true;b.textContent='Publishing…';
   const t=local();const r=await publish(meta,t.spec.state);if(r){t.published=r.id;store.set('tl2_mine',mine);toast('Published. Other builders can now remix it.');closeCraft();libTab='community';location.hash='#/library';pageLibrary()}else{b.disabled=false;b.textContent='Save & publish with my name'}}}
 drawPv();
 $('#mCount').textContent=fin?'Ready to save':`${seen.size} of ${N} tastes visited · skip any you haven’t learned yet`;
 $('#mBar').style.width=Math.round(Math.min(step,N)/N*100)+'%';
 $('#mBack').disabled=step===0;$('#mNext').style.display=fin?'none':'';$('#mNext').textContent=step===N-1?'Name & save →':'Next →'}
function drawPv(){const pv=$('#mPv');if(step===CRAFT.length){pv.innerHTML='';return}const l=CRAFT[step];
 pv.innerHTML=`<div class="eyebrow">Your Taste Card · live</div><div class="mini">${miniCard(S,1)}</div><div class="eyebrow" style="margin-top:4px">This step adds to your brief</div><div class="excerpt">## ${esc(l.title)}\n${esc(l.brief.map(b=>'- '+fill(b,l.slug)).join('\n'))}</div>`}
$('#rail').onclick=e=>{const b=e.target.closest('[data-s]');if(!b)return;step=+b.dataset.s;seen.add(step);drawCraft();$('#mStep').scrollTop=0};
$('#mNext').onclick=()=>{step=Math.min(CRAFT.length,step+1);seen.add(step);drawCraft();$('#mStep').scrollTop=0};
$('#mBack').onclick=()=>{step=Math.max(0,step-1);drawCraft();$('#mStep').scrollTop=0};
$('#mClose').onclick=closeCraft;$('#dClose').onclick=closeDetail;
$('#scrim').addEventListener('click',e=>{if(e.target.id==='scrim')closeCraft()});
$('#dScrim').addEventListener('click',e=>{if(e.target.id==='dScrim')closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#dScrim').classList.contains('open'))closeDetail();else if($('#scrim').classList.contains('open'))closeCraft();else closeSide()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-craft]');if(b){e.preventDefault();openCraft(b.dataset.craft||(route().v==='t'?route().id:null))}});
$('#craftTop').onclick=()=>openCraft(route().v==='t'?route().id:null);

/* mobile nav */
function closeSide(){$('#side').classList.remove('open');$('#veil').classList.remove('open')}
$('#menuBtn').onclick=()=>{$('#side').classList.add('open');$('#veil').classList.add('open')};$('#veil').onclick=closeSide;

/* router */
function go(){const r=route();closeSide();renderNav();
 if(r.v==='t')pageTaste(r.id);else if(r.v==='movements')pageMovements();else if(r.v==='resources')pageResources();else if(r.v==='library'){pageLibrary();if(libTab==='community'&&community===null)loadCommunity()}else pageStart();
 window.scrollTo(0,0)}
window.addEventListener('hashchange',go);go();
})();
