/* A draft and its pending operation are committed in the same IndexedDB transaction. */
const Storage=(()=>{
 let db,opening,mode=null,epoch=null;
 const tables=['drafts','photos','meta','videos','operations'];
 const memory=Object.fromEntries(tables.map(n=>[n,new Map()]));
 function configure(next,nextEpoch){if(mode!==next||epoch!==nextEpoch)for(const table of Object.values(memory))table.clear();mode=next;epoch=nextEpoch;}
 function storageError(e){return Error(e?.name==='QuotaExceededError'?'Stockage du téléphone plein. Libère de l’espace puis réessaie. La sauvegarde locale n’a pas réussi.':e?.message||'Enregistrement local interrompu. Réessaie avant de quitter.');}
 async function open(){
  if(mode!==true)return;if(db)return db;if(opening)return opening;
  opening=new Promise((resolve,reject)=>{
   const request=indexedDB.open('beauregard-vehicles-2027',3);let settled=false;
   const timer=setTimeout(()=>{settled=true;reject(Error('Base locale indisponible. Ferme les autres onglets de cette application puis réessaie.'));},10000);
   request.onupgradeneeded=()=>{for(const n of tables)if(!request.result.objectStoreNames.contains(n))request.result.createObjectStore(n,{keyPath:'id'});};
   request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close();return;}db=request.result;db.onversionchange=()=>{db.close();db=null;};resolve(db);};
   request.onerror=()=>{clearTimeout(timer);reject(storageError(request.error));};
  }).finally(()=>opening=null);return opening;
 }
 function queue(t,n,v){if(n!=='drafts')return;const s=t.objectStore('operations'),id='control:'+v.id;
  if(!v.deleted&&(v.dirty||!v.server||v.pendingFinal||v.localSignatures||v.server?.state==='final'&&!v.server.pdf))s.put({id,record:v.id,generation:v.generation||0,updatedAt:v.updatedAt});else s.delete(id);
 }
 async function transaction(name,access,action){
  await open();return new Promise((resolve,reject)=>{let result;const t=db.transaction(name==='drafts'&&access==='readwrite'?['drafts','operations']:name,access);
   t.oncomplete=()=>{resolve(result);if(access==='readwrite')window.dispatchEvent(new CustomEvent('bg-local-change',{detail:{table:name}}));};
   t.onerror=t.onabort=()=>reject(storageError(t.error));
   try{action(t.objectStore(name),t,value=>result=value);}catch(e){t.abort();reject(storageError(e));}
  });
 }
 const get=async(n,id)=>{if(mode===null)throw Error('Mode de fonctionnement non vérifié');return mode===true?transaction(n,'readonly',(s,t,done)=>{s.get(id).onsuccess=e=>done(e.target.result);}):structuredClone(memory[n].get(id));};
 const all=async n=>{if(mode===null)throw Error('Mode de fonctionnement non vérifié');return mode===true?transaction(n,'readonly',(s,t,done)=>{s.getAll().onsuccess=e=>done(e.target.result);}):[...memory[n].values()].map(x=>structuredClone(x));};
 function validate(v){if(mode===null)throw Error('Mode de fonctionnement non vérifié');if(mode===true&&(v.sandbox||v.server?.sandbox))throw Error('Un essai ne peut pas être enregistré en production');}
 const put=async(n,v)=>{validate(v);if(mode===false){memory[n].set(v.id,structuredClone(v));return v.id;}return transaction(n,'readwrite',(s,t,done)=>{s.put(v);queue(t,n,v);done(v.id);});};
 // Synchronous updater runs inside the read/write transaction: background acknowledgements cannot overwrite newer input.
 const update=async(n,id,fn)=>{if(mode===null)throw Error('Mode de fonctionnement non vérifié');if(mode===false){const value=structuredClone(memory[n].get(id));const next=fn(value);if(next){validate(next);memory[n].set(id,structuredClone(next));}return next;}
  return transaction(n,'readwrite',(s,t,done)=>{s.get(id).onsuccess=e=>{try{const next=fn(e.target.result);if(next){if(next.then)throw Error('Mise à jour locale asynchrone interdite');validate(next);s.put(next);queue(t,n,next);}done(next);}catch(error){t.abort();}};});
 };
 const remove=async(n,id)=>{if(mode===null)throw Error('Mode de fonctionnement non vérifié');if(mode===false)return memory[n].delete(id);return transaction(n,'readwrite',(s,t)=>{s.delete(id);if(n==='drafts')t.objectStore('operations').delete('control:'+id);});};
 return {open,get,all,put,update,remove,configure};
})();
