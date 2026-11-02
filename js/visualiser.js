(()=>{const $=s=>document.querySelector(s),M=window.MATERIALER,cv=$('#vcanvas'),cx=cv.getContext('2d');let img=null,pts=[];
$('#valg').innerHTML=Object.entries(M).map(([k,m],i)=>`<label><input type="checkbox" value="${k}" ${i<2?'checked':''}> ${m.navn}</label>`).join('');
const valgt=()=>[...document.querySelectorAll('#valg input:checked')].map(i=>i.value);
const cfg=window.AI_CONFIG||{};$('#modusinfo').textContent=cfg.endpoint?'Proxy satt opp: '+cfg.endpoint:'Ingen proxy konfigurert – KI-modus faller tilbake til demo.';
function pat(t){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');
 if(t==='stein'){g.fillStyle='#8d8f93';g.fillRect(0,0,48,48);g.strokeStyle='#5d6064';g.lineWidth=2;for(let y=0;y<48;y+=12)for(let x=(y/12%2)*12;x<60;x+=24)g.strokeRect(x-12,y,24,12);}
 else if(t==='plen'){g.fillStyle='#4f8a2f';g.fillRect(0,0,48,48);for(let i=0;i<120;i++){g.fillStyle=Math.random()<.5?'#5f9c3a':'#3f7524';g.fillRect(Math.random()*48,Math.random()*48,1.5,4)}}
 else if(t==='tre'){g.fillStyle='#a8743f';g.fillRect(0,0,48,48);g.fillStyle='#7b522a';for(let y=0;y<48;y+=8)g.fillRect(0,y,48,1.5);}
 else if(t==='hekk'){g.fillStyle='#2e5d22';g.fillRect(0,0,48,48);for(let i=0;i<60;i++){g.fillStyle=['#3c7a2c','#24491b','#4a8a35'][i%3];g.beginPath();g.arc(Math.random()*48,Math.random()*48,4,0,7);g.fill()}}
 else {g.fillStyle='#9a9a95';g.fillRect(0,0,48,48);g.strokeStyle='#666';for(let y=0;y<48;y+=16)for(let x=(y/16%2)*16;x<64;x+=32)g.strokeRect(x-16,y,32,16);}
 return cx.createPattern(c,'repeat');}
function tegn(fyll){cx.clearRect(0,0,cv.width,cv.height);if(img){cx.drawImage(img,0,0,cv.width,cv.height)}else{cx.fillStyle='#1d2a38';cx.fillRect(0,0,cv.width,cv.height);cx.fillStyle='#8fb3d1';cx.font='28px sans-serif';cx.fillText('Last opp et bilde, eller marker direkte her',150,360)}
 if(pts.length){cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(...p):cx.moveTo(...p));cx.closePath();
  if(fyll&&pts.length>2){const v=valgt(),hoved=v.find(k=>!M[k].lopende)||v[0];if(hoved){cx.save();cx.globalAlpha=.82;cx.fillStyle=pat(M[hoved].tekstur);cx.fill();cx.restore()}
   v.filter(k=>M[k].lopende).forEach((k,i)=>{cx.save();cx.lineWidth=22-i*8;cx.strokeStyle=pat(M[k].tekstur);cx.stroke();cx.restore()})}
  cx.strokeStyle='#5fe3ff';cx.lineWidth=2;cx.setLineDash([8,6]);cx.stroke();cx.setLineDash([]);pts.forEach(p=>{cx.fillStyle='#f28c28';cx.beginPath();cx.arc(...p,6,0,7);cx.fill()})}
 cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(10,10,250,34);cx.fillStyle='#fff';cx.font='bold 18px sans-serif';cx.fillText('ILLUSTRASJON – estimat',20,33);}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();pts.push([(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]);tegn(false)});
$('#foto').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const i=new Image();i.onload=()=>{img=i;tegn(false)};i.src=URL.createObjectURL(f)});
$('#nullstill').onclick=()=>{pts=[];tegn(false)};
function estimat(){const a=+$('#areal').value||0,l=+$('#lop').value||0;let sum=0;const rad=valgt().map(k=>{const m=M[k],basis=m.lopende?l:a,q=Math.ceil(basis*m.pr*(1+m.svinn)),kr=q*m.pris;sum+=kr;return`<tr><td>${m.navn}</td><td>${q} ${m.enhet}</td><td>${kr.toLocaleString('nb-NO')} kr</td></tr>`});
 $('#esttab').innerHTML=`<tr><th>Materiale</th><th>Mengde (inkl. svinn)</th><th>Grovestimat*</th></tr>${rad.join('')}<tr><th>Sum (estimat)</th><th></th><th>${sum.toLocaleString('nb-NO')} kr</th></tr>`;}
async function ai(){const f=$('#foto').files[0];if(!cfg.endpoint||!f)return false;$('#vstatus').textContent='Sender til proxy …';
 const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});
 const prompt=`Rediger bildet realistisk: legg til ${valgt().map(k=>M[k].navn.toLowerCase()).join(', ')} på ca ${$('#areal').value} m². Behold huset og perspektivet.`;
 try{const r=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,prompt})});const j=await r.json();if(!r.ok||!j.image)throw Error(j.error||r.status);
  const i=new Image();i.onload=()=>{img=i;pts=[];tegn(false);$('#vstatus').textContent='KI-generert bilde (Grok) – illustrasjon, ikke garanti.'};i.src=j.image;return true}catch(e){$('#vstatus').textContent='Proxy feilet ('+e.message+') – viser demo.';return false}}
$('#kjor').onclick=async()=>{estimat();if($('#modus').value==='ai'&&await ai())return;if(pts.length<3){$('#vstatus').textContent='Marker minst 3 punkter i bildet først.';tegn(false);return}tegn(true);$('#vstatus').textContent='Demo: teksturer lagt over markert område.'};
['#areal','#lop'].forEach(s=>$(s).addEventListener('input',estimat));$('#valg').addEventListener('change',estimat);
pts=[[300,430],[690,430],[820,690],[160,690]];tegn(true);estimat();})();
