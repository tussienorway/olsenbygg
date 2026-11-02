// Bilde-KI-proxy for Sci-Fi Lab. DEPLOYES IKKE med GitHub Pages.
// Kjør: XAI_API_KEY=... node server/xai-proxy.mjs   (Node 18+, ingen avhengigheter)
// Sett så js/ai-config.js endpoint til "http://localhost:8787/api/visualiser".
// Bytt leverandør ved å endre PROVIDERS-oppslaget nedenfor.
import http from 'node:http';
const PORT=process.env.PORT||8787, ORIGIN=process.env.ALLOW_ORIGIN||'*';
const PROVIDERS={
  xai:{url:'https://api.x.ai/v1/images/edits',key:()=>process.env.XAI_API_KEY,
    body:(image,prompt)=>({model:process.env.XAI_IMAGE_MODEL||'grok-imagine-image-2.0',prompt,image:{url:image,type:'image_url'},response_format:'b64_json'})}
};
const P=PROVIDERS[process.env.IMAGE_PROVIDER||'xai'];
http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  const send=(c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
  if(req.method!=='POST'||req.url!=='/api/visualiser')return send(404,{error:'not found'});
  if(!P.key())return send(503,{error:'XAI_API_KEY mangler på serveren'});
  let raw='';for await(const c of req){raw+=c;if(raw.length>12e6)return send(413,{error:'for stort bilde'})}
  try{const {image,prompt}=JSON.parse(raw);if(!/^data:image\//.test(image||''))return send(400,{error:'image må være data-URI'});
    const r=await fetch(P.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+P.key()},body:JSON.stringify(P.body(image,String(prompt).slice(0,800)))});
    const j=await r.json();if(!r.ok)return send(502,{error:j.error?.message||j.error||r.status});
    const d=j.data?.[0];send(200,{image:d?.b64_json?'data:image/jpeg;base64,'+d.b64_json:d?.url,label:'KI-generert (xAI Grok Imagine)'});
  }catch(e){send(500,{error:e.message})}
}).listen(PORT,()=>console.log('proxy på :'+PORT));
