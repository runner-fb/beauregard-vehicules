
/* Beauregard Véhicules — GET/JSON pour les petites requêtes, pont HTML pour les charges importantes. */
const Transport=(()=>{
  const MAX_GET_URL=7000;
  let bridge=null,origin=null,channel=null,ready=null,frame=null;
  const pending=new Map();
  function connect(){
    if(ready)return ready;
    ready=new Promise((resolve,reject)=>{
      const c=window.VEHICLES_CONFIG;
      channel=crypto.randomUUID();
      frame=document.createElement('iframe');
      Object.assign(frame.style,{position:'absolute',width:'1px',height:'1px',opacity:'0',pointerEvents:'none',border:'0'});
      frame.title='Connexion sécurisée au serveur';
      frame.src=c.apiUrl+'?channel='+encodeURIComponent(channel);
      document.body.append(frame);
      const timer=setTimeout(()=>{ready=null;frame.remove();reject(Error('Le serveur ne répond pas pour les données volumineuses.'))},60000);
      const handler=e=>{
        if(e.data?.channel!==channel)return;
        if(!/^https:\/\/(?:[a-z0-9-]+-script\.googleusercontent\.com|script\.googleusercontent\.com|script\.google\.com)$/.test(e.origin))return;
        if(e.data.type==='ready'){
          bridge=e.source;origin=e.origin;clearTimeout(timer);resolve();
        }else if(e.data.type==='reply'&&e.source===bridge&&e.origin===origin){
          const p=pending.get(e.data.id);if(!p)return;
          pending.delete(e.data.id);clearTimeout(p.timer);
          e.data.data?.ok?p.resolve(e.data.data.data):p.reject(Error(e.data.data?.error||'Réponse serveur invalide'));
        }
      };
      window.addEventListener('message',handler);
    });
    return ready;
  }
  async function get(action,payload){
    const url=new URL(window.VEHICLES_CONFIG.apiUrl);
    const requestId=crypto.randomUUID();
    url.searchParams.set('api',action);
    url.searchParams.set('requestId',requestId);
    url.searchParams.set('token',Auth.token());
    url.searchParams.set('data',JSON.stringify(payload));
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),window.VEHICLES_CONFIG.requestTimeout||330000);
    try{
      const response=await fetch(url.toString(),{method:'GET',cache:'no-store',credentials:'omit',signal:controller.signal});
      if(!response.ok)throw Error('HTTP '+response.status);
      let out;
      try{out=await response.json()}catch{throw Error('Réponse non JSON : redéploie Api.gs dans Apps Script.');}
      if(out.requestId&&out.requestId!==requestId)throw Error('Réponse serveur incohérente');
      if(!out.ok)throw Error(out.error||'Erreur serveur');
      return out.data;
    }finally{clearTimeout(timer)}
  }
  async function large(action,payload){
    await connect();
    return new Promise((resolve,reject)=>{
      const id=crypto.randomUUID();
      const timer=setTimeout(()=>{pending.delete(id);reject(Error('Délai dépassé. Tes données locales sont conservées.'))},window.VEHICLES_CONFIG.requestTimeout);
      pending.set(id,{resolve,reject,timer});
      bridge.postMessage({channel,type:'rpc',id,payload:{...payload,action,token:Auth.token()}},origin);
    });
  }
  async function rawCall(action,payload={}){
    if(!navigator.onLine)throw Error('Hors ligne : les données restent sur ton appareil');
    const encoded=encodeURIComponent(JSON.stringify(payload));
    // Les codes et signatures ne doivent pas apparaître dans une URL.
    const privatePayload=action==='login'||action==='sign'||action==='photo';
    return !privatePayload&&encoded.length+window.VEHICLES_CONFIG.apiUrl.length+Auth.token().length+200<=MAX_GET_URL?get(action,payload):large(action,payload);
  }
  async function call(action,payload={}){if(['login','identity','logout','serviceConfig','setServiceMode','identities'].includes(action))return rawCall(action,payload);if(typeof Service==='undefined'||!Service.current())throw Error('Mode de fonctionnement non vérifié');if(Service.sandbox())return Sandbox.call(action,payload);const mode=await Service.verify();if(!mode.production)throw Error('MODE_CHANGE : la saison a été désactivée');return rawCall(action,{...payload,production:true,modeEpoch:mode.epoch});}
  return {call,rawCall};
})();
const Auth=(()=>{
  let session=null;
  try{session=JSON.parse(sessionStorage.getItem('bg-session')||'null')}catch{}
  function token(){return current()?.token||''}
  function current(){if(session&&(!['admin','controller'].includes(session.role)||!Number.isFinite(session.expires)||session.expires<=Date.now()))invalidate();return session}
  function save(s){session=s;sessionStorage.setItem('bg-session',JSON.stringify(s))}
  async function login(code,admin){const s=await Transport.call('login',{code,admin});save(s);return s}
  async function identity(first,last,personId=null,handoff=null){const s=await Transport.call('identity',{first,last,personId,handoff});save({...session,...s});return s}
  function invalidate(){session=null;sessionStorage.removeItem('bg-session');window.dispatchEvent(new Event('bg-session-ended'))}
  async function logout(){try{await Transport.call('logout')}finally{invalidate()}}
  function actor(){const s=current();return s?String(s.actorId||s.name||'').trim().normalize('NFKC').toLocaleLowerCase('fr')+'|'+s.role:'';}
  function allows(d){const s=current();return !!(s?.name&&d&&(s.role==='admin'||d.edition===s.edition&&d.server?.owner===actor()));}
  return {token,current,login,identity,logout,invalidate,allows,actor};
})();
