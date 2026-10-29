/* Taste Lab curriculum: one object per taste. Rendered by index.html. */
window.GROUPS=[['mindset','Mindset'],['foundations','Foundations'],['surface','Surface'],['motion','Motion'],['identity','Identity'],['finish','Finish'],['reference','Reference']];
const BOX=(c)=>`<div style="background:#fff;border:2px solid #14261D;border-radius:14px;padding:16px;width:200px">${c}</div>`;
const BAR=(w,h=8,c='#14261D',s='')=>`<div style="height:${h}px;width:${w}px;background:${c};border-radius:4px;${s}"></div>`;
const SRC={
 pt:['Practical Typography (Butterick)','https://practicaltypography.com'],
 laws:['Laws of UX (Yablonski)','https://lawsofux.com'],
 m3:['Material Design 3','https://m3.material.io'],
 hig:['Apple Human Interface Guidelines','https://developer.apple.com/design/human-interface-guidelines'],
 wcag:['WCAG 2.2 (W3C)','https://www.w3.org/TR/WCAG22/'],
 nng:['Nielsen Norman Group','https://www.nngroup.com/articles/'],
 shadows:['Designing Beautiful Shadows (Josh W. Comeau)','https://www.joshwcomeau.com/css/designing-shadows/'],
 vercel:['Web Interface Guidelines (Vercel)','https://vercel.com/design/guidelines'],
 webdev:['Learn Design (web.dev)','https://web.dev/learn/design']
};
window.LESSONS=[];
