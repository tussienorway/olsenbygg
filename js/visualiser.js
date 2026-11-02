/* Sci-Fi Lab v2: flere soner, dra/flytt punkter, mykere teksturer med skygge, før/etter, nedlasting. */
(()=>{const $=s=>document.querySelector(s),M=window.MATERIALER,cv=$('#vcanvas'),cx=cv.getContext('2d'),W=cv.width,H=cv.height;
let img=null,soner=[],aktiv=0,drag=null,visFor=false;const cfg=window.AI_CONFIG||{};
const ny=(mat='belegningsstein')=>({mat,areal:20,lop:0,pts:[]});
function rnd(seed){let x=seed;return()=>(x=(x*16807)%2147483647)/2147483647}
const cache={};function pat(t){if(cache[t])return cache[t];const c=document.createElement('canvas'),S=96;c.width=c.height=S;const g=c.getContext('2d'),r=rnd(t.length*999+7);
 const fill=(f)=>{g.fillStyle=f;g.fillRect(0,0,S,S)},noise=(cols,n,w,h)=>{for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect(r()*S,r()*S,w,h)}};
 if(t==='stein'){fill('#7f8186');for(let y=0;y<S;y+=16)for(let x=((y/16)%2)*16-32;x<S;x+=32){g.fillStyle=`hsl(220,4%,${48+r()*14}%)`;g.fillRect(x+1,y+1,30,14)}}
 else if(t==='skifer'){fill('#3c444c');for(let i=0;i<14;i++){g.fillStyle=`hsl(210,9%,${24+r()*14}%)`;g.beginPath();const x=r()*S,y=r()*S;g.moveTo(x,y);for(let k=0;k<5;k++)g.lineTo(x+(r()-.5)*50,y+(r()-.5)*50);g.fill()}g.strokeStyle='#23292f';g.lineWidth=1.5;for(let i=0;i<6;i++){g.beginPath();g.moveTo(r()*S,0);g.lineTo(r()*S,S);g.stroke()}}
 else if(t==='grus'){fill('#a99a80');noise(['#c4b79e','#8c7f68','#d8ccb4','#776b57'],700,2.2,2.2)}
 else if(t==='plen'){fill('#4a8a2c');for(let i=0;i<500;i++){g.strokeStyle=['#5fa03a','#3d7324','#6cb045'][i%3];g.beginPath();const x=r()*S,y=r()*S;g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y-4-r()*4);g.stroke()}}
 else if(t==='tre'||t==='kompositt'){const b=t==='tre'?[30,45]:[20,8];fill(`hsl(${b[0]},${b[1]}%,40%)`);for(let y=0;y<S;y+=12){g.fillStyle=`hsl(${b[0]},${b[1]}%,${38+r()*12}%)`;g.fillRect(0,y,S,11);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,y+11,S,1);if(t==='tre')for(let k=0;k<4;k++){g.fillStyle='rgba(60,30,10,.25)';g.fillRect(r()*S,y+2+r()*7,20+r()*30,1)}}}
 else if(t==='heller'){fill('#8f908b');for(let y=0;y<S;y+=48)for(let x=0;x<S;x+=48){g.fillStyle=`hsl(60,3%,${60+r()*8}%)`;g.fillRect(x+1.5,y+1.5,45,45)}noise(['rgba(0,0,0,.08)'],200,1,1)}
 else if(t==='hekk'){fill('#24491b');for(let i=0;i<160;i++){g.fillStyle=['#3c7a2c','#2a5a1f','#4f9238','#1d3d15'][i%4];g.beginPath();g.arc(r()*S,r()*S,3+r()*4,0,7);g.fill()}}
 else if(t==='mur'){fill('#6b6b66');for(let y=0;y<S;y+=24)for(let x=((y/24)%2)*24-48;x<S;x+=48){g.fillStyle=`hsl(40,3%,${52+r()*12}%)`;g.fillRect(x+2,y+2,44,20)}}
 else if(t==='kant'){fill('#bdbdb8');for(let x=0;x<S;x+=24){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,0,1.5,S)}}
 else if(t==='gjerde'){fill('rgba(0,0,0,0)');for(let x=0;x<S;x+=12){g.fillStyle=`hsl(35,35%,${62+r()*10}%)`;g.fillRect(x,0,9,S)}}
 return cache[t]=cx.createPattern(c,'repeat');}
function sti(p){cx.beginPath();p.forEach((q,i)=>i?cx.lineTo(...q):cx.moveTo(...q));}
function tegn(){cx.clearRect(0,0,W,H);
 if(img){const k=Math.max(W/img.width,H/img.height),w=img.width*k,h=img.height*k;cx.drawImage(img,(W-w)/2,(H-h)/2,w,h)}else{const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#24365a');g.addColorStop(1,'#141b2e');cx.fillStyle=g;cx.fillRect(0,0,W,H);cx.fillStyle='#8fb3d1';cx.font='26px system-ui';cx.textAlign='center';cx.fillText('Last opp et bilde av tomta – eller tegn rett her',W/2,H/2);cx.textAlign='left'}
 if(!visFor)soner.forEach((z,zi)=>{const m=M[z.mat],p=z.pts;if(p.length<2)return;
  if(!m.lopende&&p.length>2){cx.save();sti(p);cx.closePath();cx.shadowColor='rgba(0,0,0,.45)';cx.shadowBlur=18;cx.shadowOffsetY=6;cx.fillStyle=pat(m.tekstur);cx.globalAlpha=.9;cx.fill();cx.restore();
   cx.save();sti(p);cx.closePath();cx.clip();const ys=p.map(q=>q[1]),y0=Math.min(...ys),y1=Math.max(...ys),lg=cx.createLinearGradient(0,y0,0,y1);lg.addColorStop(0,'rgba(0,0,0,.28)');lg.addColorStop(1,'rgba(255,255,255,.08)');cx.fillStyle=lg;cx.fillRect(0,y0,W,y1-y0);cx.lineWidth=4;cx.strokeStyle='rgba(255,255,255,.35)';sti(p);cx.closePath();cx.stroke();cx.restore()}
  if(m.lopende){cx.save();sti(p);cx.lineCap='round';cx.lineJoin='round';const tyk=m.tekstur==='hekk'?34:m.tekstur==='mur'?26:m.tekstur==='gjerde'?20:10;
   cx.shadowColor='rgba(0,0,0,.5)';cx.shadowBlur=14;cx.shadowOffsetY=8;cx.lineWidth=tyk;cx.strokeStyle=pat(m.tekstur);cx.stroke();cx.restore()}
  if(zi===aktiv){cx.save();sti(p);if(!m.lopende)cx.closePath();cx.strokeStyle='#11cdef';cx.lineWidth=2;cx.setLineDash([8,6]);cx.stroke();cx.restore();
   p.forEach(q=>{cx.beginPath();cx.arc(...q,9,0,7);cx.fillStyle='#fff';cx.fill();cx.beginPath();cx.arc(...q,6,0,7);cx.fillStyle='#fb6340';cx.fill()})}});
 cx.fillStyle='rgba(23,43,77,.75)';cx.beginPath();cx.roundRect?cx.roundRect(12,12,visFor?150:300,36,8):cx.rect(12,12,300,36);cx.fill();cx.fillStyle='#fff';cx.font='bold 17px system-ui';cx.fillText(visFor?'FØR (original)':'ILLUSTRASJON – estimat, ikke tilbud',24,36);}
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
const naer=(p)=>{const z=soner[aktiv];if(!z)return-1;return z.pts.findIndex(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<20*W/cv.getBoundingClientRect().width)};
cv.addEventListener('pointerdown',e=>{const p=pos(e),i=naer(p);if(i>=0){drag=i;cv.setPointerCapture(e.pointerId)}else{soner[aktiv].pts.push(p);tegn();oppdater()}});
cv.addEventListener('pointermove',e=>{if(drag==null){cv.style.cursor=naer(pos(e))>=0?'grab':'crosshair';return}soner[aktiv].pts[drag]=pos(e);tegn()});
cv.addEventListener('pointerup',()=>drag=null);
cv.addEventListener('dblclick',e=>{const i=naer(pos(e));if(i>=0){soner[aktiv].pts.splice(i,1);tegn()}});
/* UI */
function liste(){$('#soner').innerHTML=soner.map((z,i)=>{const m=M[z.mat];return`<div class="sone ${i===aktiv?'on':''}" data-i="${i}">
 <button type="button" class="sel" data-i="${i}" aria-pressed="${i===aktiv}">Sone ${i+1}</button>
 <select data-f="mat" data-i="${i}" aria-label="Materiale sone ${i+1}">${Object.entries(M).map(([k,v])=>`<option value="${k}" ${k===z.mat?'selected':''}>${v.navn}${v.lopende?' (linje)':''}</option>`).join('')}</select>
 <label>${m.lopende?'Lengde, m':'Areal, m²'}<input type="number" min="0" step="0.5" data-f="${m.lopende?'lop':'areal'}" data-i="${i}" value="${m.lopende?z.lop:z.areal}"></label>
 <button type="button" class="x" data-del="${i}" aria-label="Slett sone ${i+1}">✕</button></div>`}).join('')}
$('#soner').addEventListener('click',e=>{const t=e.target;if(t.dataset.del!=null){soner.splice(+t.dataset.del,1);if(!soner.length)soner.push(ny());aktiv=Math.min(aktiv,soner.length-1)}else if(t.classList.contains('sel'))aktiv=+t.dataset.i;else return;liste();tegn();oppdater()});
$('#soner').addEventListener('input',e=>{const t=e.target,z=soner[+t.dataset.i];if(!z)return;if(t.dataset.f==='mat'){z.mat=t.value;const m=M[z.mat];if(m.lopende&&!z.lop)z.lop=10;liste()}else z[t.dataset.f]=+t.value||0;tegn();oppdater()});
$('#nysone').onclick=()=>{soner.push(ny('plen'));aktiv=soner.length-1;liste();tegn()};
$('#nullstill').onclick=()=>{soner[aktiv].pts=[];tegn()};
$('#angre').onclick=()=>{soner[aktiv].pts.pop();tegn()};
$('#forEtter').addEventListener('pointerdown',()=>{visFor=true;tegn()});['pointerup','pointerleave'].forEach(ev=>$('#forEtter').addEventListener(ev,()=>{if(visFor){visFor=false;tegn()}}));
$('#forEtter').addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){visFor=!visFor;tegn();e.preventDefault()}});
$('#last').onclick=()=>{const a=document.createElement('a');a.download='tomt-illustrasjon.png';a.href=cv.toDataURL('image/png');a.click()};
$('#foto').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const i=new Image();i.onload=()=>{img=i;tegn()};i.src=URL.createObjectURL(f)});
function oppdater(){let sum=0;const rad=soner.map((z,i)=>{const m=M[z.mat],b=m.lopende?z.lop:z.areal,q=m.enhet==='stk'?Math.ceil(b*m.pr*(1+m.svinn)):Math.ceil(b*m.pr*(1+m.svinn)*10)/10,kr=Math.round(q*m.pris);sum+=kr;return`<tr><td><span class="dot" style="background:${m.farge}"></span>Sone ${i+1}: ${m.navn}</td><td>${q.toLocaleString('nb-NO')} ${m.enhet}</td><td>${kr.toLocaleString('nb-NO')} kr</td></tr>`});
 $('#esttab').innerHTML=`<caption class="sr">Grovestimat per sone</caption><tr><th>Sone / materiale</th><th>Mengde inkl. svinn</th><th>Grovestimat*</th></tr>${rad.join('')}<tr class="sum"><th>Sum materialer (estimat)</th><th></th><th>${sum.toLocaleString('nb-NO')} kr</th></tr>`;
 $('#sumbig').textContent=sum.toLocaleString('nb-NO')+' kr'}
$('#modusinfo').textContent=cfg.endpoint?'Proxy satt opp: '+cfg.endpoint:'Ingen proxy konfigurert – KI-modus faller tilbake til demo.';
async function ai(){const f=$('#foto').files[0];if(!cfg.endpoint||!f)return false;$('#vstatus').textContent='Sender til proxy …';
 const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});
 const prompt='Rediger bildet realistisk og behold huset og perspektivet. Legg til: '+soner.map(z=>`${M[z.mat].navn.toLowerCase()} (${M[z.mat].lopende?z.lop+' m':z.areal+' m²'})`).join(', ')+'.';
 try{const r=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,prompt})});const j=await r.json();if(!r.ok||!j.image)throw Error(j.error||r.status);
  const i=new Image();i.onload=()=>{img=i;soner.forEach(z=>z.pts=[]);tegn();$('#vstatus').textContent='KI-generert bilde (Grok) – illustrasjon, ikke garanti.'};i.src=j.image;return true}catch(e){$('#vstatus').textContent='Proxy feilet ('+e.message+') – viser demo.';return false}}
$('#kjor').onclick=async()=>{oppdater();if($('#modus').value==='ai'&&await ai())return;tegn();$('#vstatus').textContent='Demo: teksturer lagt på markerte soner. Dra punktene for å justere.';$('#mengde').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'})};
/* startdemo */
soner=[{mat:'belegningsstein',areal:40,lop:0,pts:[[300,440],[680,440],[800,690],[170,690]]},{mat:'hekk',areal:0,lop:12,pts:[[120,420],[290,420],[160,690]]},{mat:'plen',areal:30,lop:0,pts:[[700,430],[930,430],[940,690],[820,690]]}];
liste();tegn();oppdater();const d=new Image();d.onload=()=>{if(!img){img=d;tegn();$('#vstatus').textContent='Eksempeltomt (KI-illustrasjon). Last opp ditt eget bilde for å prøve.'}};d.src='img/for-tomt.webp';})();
