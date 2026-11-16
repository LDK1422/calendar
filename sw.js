/* 교대 달력 오프라인 저장 (서비스 워커)
   - 인터넷이 되면 항상 최신 파일을 받아오고, 받은 파일을 폰에 저장해 둡니다.
   - 인터넷이 안 되거나 3초 안에 응답이 없으면 저장해 둔 파일로 엽니다.
   - 메모/공휴일은 이 파일과 상관없이 기기(localStorage)에 따로 저장됩니다. */
const C='shift-cal-v1',FILE='shift-calendar.html';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add(FILE)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!='GET'||u.origin!=location.origin)return;
 if(r.mode!='navigate'&&!u.pathname.endsWith('/'+FILE))return;
 u.search='';u.hash='';const key=u.href;
 e.respondWith((async()=>{
  const c=await caches.open(C);
  const net=fetch(r).then(res=>{if(res.ok)c.put(key,res.clone());return res});
  net.catch(()=>{});
  try{const res=await Promise.race([net,new Promise((_,no)=>setTimeout(no,3000))]);if(res.ok)return res}catch(_){}
  const hit=await c.match(key,{ignoreSearch:true})||await c.match(FILE);
  return hit||net.catch(()=>Response.error());
 })())});
