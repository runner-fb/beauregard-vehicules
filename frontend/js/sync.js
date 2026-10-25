/* One persistent, opportunistic worker. Network acknowledgements only patch current local state. */
const Sync=(()=>{
 const workerId=crypto.randomUUID();let leaseTimer=null;let running=null,observer=()=>{},timer=null,lastCache=0,lastReconcile=0;const copy=Model.clone;
 const notify=(message,id)=>{observer(message,id);window.dispatchEvent(new Event('bg-sync-change'));};
 const patch=(id,fn)=>Storage.update('drafts',id,d=>d?fn(d):d);
 const usable=d=>d&&Auth.allows(d)&&d.edition===Auth.current()?.edition&&!d.deleted&&!d.suspended&&!d.conflicts?.length;
 const signaturePending=d=>Object.entries(d.localSignatures||{}).some(([p,s])=>d.server?.signatures?.[p]?.op!==s.op);
 const pending=d=>!d.deleted&&(d.dirty||!d.server||d.needsReopen||d.pendingFinal||signaturePending(d)||d.server?.state==='final'&&!d.server.pdf||d.removedPhotos?.length);
 function wake(){clearTimeout(timer);timer=setTimeout(()=>run().catch(e=>notify(e.message)),100);}
 async function error(id,e){if(/dossier a changé|Contrôle verrouillé|Confirmation et révision/.test(e.message)){try{const remote=await Transport.call('read',{id});await patch(id,d=>{if(d.server&&remote.lease!==d.server.lease){d.suspended=true;d.error='AUTORISATION_REMPLACEE';}else d.server=remote;return d;});}catch{}}await patch(id,d=>{d.error=e.message;d.attempts=(d.attempts||0)+1;d.retryAt=Date.now()+Math.min(300000,2000*2**Math.min(d.attempts,7));if(/DOSSIER_SUPPRIME|DOSSIER_ARCHIVE|AUTORISATION_REMPLACEE|ACCES_DOSSIER_REFUSE/.test(e.message))d.suspended=true;return d;});notify(e.message,id);}
 async function acknowledge(id,result,fn){return patch(id,d=>{d.server=result;d.error=null;d.attempts=0;d.retryAt=0;fn?.(d);return d;});}
 async function light(d){
  if(!d.server){const r=await Transport.call('create',{id:d.id,creationOp:d.creationOp||d.id,edition:d.edition,kind:d.kind,data:d.data,initialId:d.initialId||null,withoutInitial:!!d.withoutInitial});if(r.duplicate)throw Error('Un autre contrôle existe. Les données locales sont conservées : contacte un référent.');await acknowledge(d.id,r,f=>{f.base=copy(r.data);f.dirty=true;});return true;}
  if(d.server.modeEpoch&&d.server.modeEpoch!==Service.current()?.epoch)throw Error('AUTORISATION_REMPLACEE : changement de mode');
  if(d.needsReopen){if(d.server.state!=='draft'){const r=await Transport.call('reopenSignatures',{id:d.id,lease:d.server.lease,revision:d.server.revision,confirm:true});await acknowledge(d.id,r,f=>{f.needsReopen=false;f.dirty=true;});}else await patch(d.id,f=>{f.needsReopen=false;return f;});return true;}
  if(!d.dirty)return false;
  const sent=copy(d.data),generation=d.generation;
  const r=await Transport.call('save',{id:d.id,lease:d.server.lease,revision:d.server.revision,data:sent});
  if(r.conflict){await patch(d.id,f=>{if(r.record.lease!==d.server.lease){f.suspended=true;f.error='AUTORISATION_REMPLACEE';return f;}const merge=Model.merge(d.base,f.data,r.record.data);f.server=r.record;f.base=copy(r.record.data);f.data=merge.data;f.conflicts=merge.conflicts;f.dirty=true;if(f.localSignatures&&!Model.same(sent,merge.data)){f.localSignatures={};f.localState=null;f.pendingFinal=false;f.needsReopen=r.record.state!=='draft';f.error='Données modifiées par le serveur : nouvelles signatures nécessaires.';}return f;});return true;}
  await acknowledge(d.id,r,f=>{f.base=copy(r.data);f.dirty=f.generation!==generation;if(!f.dirty)f.data=copy(r.data);f.lastSync=new Date().toISOString();});return true;
 }
 async function heavy(d){
  for(const id of Model.photos(d.data)){const p=await Storage.get('photos',id);if(p&&!p.remote){const r=await Transport.call('photo',{id,record:d.id,lease:d.server.lease,data:p.data});if(!r?.fileId)throw Error('Confirmation Drive absente');await Storage.update('photos',id,f=>({...f,remote:r.fileId,status:'Enregistrée',error:null}));notify('Photo confirmée sur Drive',d.id);return true;}}
  return false;
 }
 async function finish(d){
  if(d.dirty||d.needsReopen)return false;
  if(d.removedPhotos?.length&&d.server.state==='draft'){const id=d.removedPhotos[0];if(!Model.photos(d.data).includes(id)){await Transport.call('deletePhoto',{id,lease:d.server.lease});const photo=await Storage.get('photos',id);if(photo&&!photo.remote)await Storage.remove('photos',id);}await patch(d.id,f=>{f.removedPhotos=f.removedPhotos.filter(x=>x!==id);return f;});return true;}
  for(const [party,sig] of Object.entries(d.localSignatures||{})){if(d.server.signatures?.[party]?.op===sig.op)continue;const r=await Transport.call('sign',{id:d.id,lease:d.server.lease,revision:d.server.revision,party,...sig});await acknowledge(d.id,r,f=>{if(f.localSignatures?.[party]?.op!==sig.op)f.needsReopen=true;});return true;}
  if(d.pendingFinal&&d.server.state!=='final'){const r=await Transport.call('finalize',{id:d.id,lease:d.server.lease,revision:d.server.revision});await acknowledge(d.id,r,f=>{f.pendingFinal=false;f.localState='final';});return true;}
  return false;
 }
 async function documents(d){if(Service.sandbox())return false;if(d.server?.state!=='final'||d.server.pdf)return false;const pdf=await Transport.call('pdf',{id:d.id});if(!pdf?.id||!pdf.sha256)throw Error('PDF non confirmé sur Drive');await patch(d.id,f=>{f.server.pdf=pdf;f.error=null;f.retryAt=0;return f;});return true;}
 async function cacheReturns(){if(Service.sandbox())return;if(Date.now()-lastCache<60000)return;lastCache=Date.now();const actor=Auth.actor(),edition=Auth.current()?.edition;try{const rows=await Transport.call('returnCandidates');await Storage.put('meta',{id:'returns:'+actor,edition,rows});let cachedCount=0;for(const row of rows){if((await Storage.all('drafts')).some(d=>usable(d)&&d.dirty))break;const id='initial:'+edition+':'+row.id;if(await Storage.get('meta',id))continue;const record=await Transport.call('returnInitial',{id:row.id});if(Auth.actor()!==actor)return;await Storage.put('meta',{id,record});if(++cachedCount>=4)break;}}catch(e){notify('Cache restitution : '+e.message);}}

 async function reconcile(){if(Date.now()-lastReconcile<60000||Service.sandbox())return;lastReconcile=Date.now();const local=(await Storage.all('drafts')).filter(d=>d.server&&Auth.allows(d)&&!d.deleted&&!d.suspended);for(const edition of [...new Set(local.map(d=>d.edition))]){const rows=local.filter(d=>d.edition===edition);for(let i=0;i<rows.length;i+=100){const batch=rows.slice(i,i+100);const states=await Transport.call('reconcile',{edition,ids:batch.map(d=>d.id),leases:Object.fromEntries(batch.map(d=>[d.id,d.server.lease]))});for(const st of states){if(st.deleted||st.archived||st.revoked){await patch(st.id,d=>{d.suspended=true;d.error=st.deleted?'Dossier supprimé sur le serveur — copie locale conservée':st.archived?'Dossier archivé par un référent':'Autorisation remplacée par un référent';return d;});}else{const d=await Storage.get('drafts',st.id);if(d&&!pending(d)&&st.revision!==d.server.revision){const record=await Transport.call('read',{id:d.id});await patch(d.id,f=>{if(!pending(f)){f.server=record;f.data=copy(record.data);f.base=copy(record.data);}return f;});}}}}}}
 async function work(onlyId){
  if(!navigator.onLine||!Auth.current()?.name||!Service.current())return;
  const session=Auth.current();let rounds=0;try{await reconcile();}catch(e){notify(e.message);}
  while(navigator.onLine&&Auth.current()===session&&rounds++<100){
   let drafts=(await Storage.all('drafts')).filter(d=>usable(d)&&(!onlyId||d.id===onlyId)&&(!d.retryAt||d.retryAt<=Date.now()));let changed=false;
   for(const d of drafts)try{if(await light(d)){changed=true;notify('Données en cours de synchronisation',d.id);}}catch(e){await error(d.id,e);}
   if(changed)continue;
   drafts=(await Storage.all('drafts')).filter(d=>usable(d)&&d.server&&(!onlyId||d.id===onlyId)&&(!d.retryAt||d.retryAt<=Date.now()));
   for(const d of drafts)try{if(await heavy(d)||await finish(d)){changed=true;break;}}catch(e){await error(d.id,e);}
   if(changed)continue;
   if(!onlyId&&typeof Videos!=='undefined')try{if(await Videos.syncNext()){changed=true;}}catch(e){notify(e.message);}
   if(changed)continue;
   for(const d of drafts)try{if(await documents(d)){changed=true;break;}}catch(e){await error(d.id,e);}
   if(!changed)break;
  }
  if(!onlyId){await cacheReturns();const cached=await Storage.get('meta','signers');for(const person of cached?.people||[]){if(!person.pending)continue;try{const remote=await Transport.call('addSigner',{first:person.first,last:person.last});await Storage.update('meta','signers',f=>({...f,people:f.people.map(p=>p.id===person.id?remote:p)}));}catch{}break;}}
 }
 async function run(id){if(running)return running;const execute=()=>work(id);const fallback=async()=>{if(!Service.current())return;const lease=await Storage.update('meta','sync-worker',l=>!l||l.expires<Date.now()||l.owner===workerId?{id:'sync-worker',owner:workerId,expires:Date.now()+600000}:l);if(lease.owner!==workerId)return;leaseTimer=setInterval(()=>Storage.update('meta','sync-worker',l=>l?.owner===workerId?{...l,expires:Date.now()+600000}:l).catch(()=>{}),30000);try{return await execute();}finally{clearInterval(leaseTimer);await Storage.update('meta','sync-worker',l=>l?.owner===workerId?{...l,expires:0}:l);}};running=(navigator.locks?navigator.locks.request('beauregard-sync',{ifAvailable:true},lock=>lock?execute():undefined):fallback()).finally(()=>{running=null;notify('Synchronisation actualisée');});notify('Synchronisation en cours');return running;}
 async function state(){let count=0,problem='';const drafts=await Storage.all('drafts');for(const d of drafts){if(d.deleted)continue;if(pending(d)){count++;if(d.error||d.suspended||d.conflicts?.length)problem=d.error||'Conflit à résoudre';else if(!Auth.allows(d))problem='Reconnexion avec le contrôleur concerné nécessaire';}}const ops=await Storage.all('operations');count+=ops.filter(o=>o.type==='photo'&&!drafts.some(d=>d.id===o.record&&d.deleted)).length;for(const v of await Storage.uploads())if(!v.confirmed){count++;if(v.error)problem=v.error;else if(!v.queued)problem='Vidéo locale à valider';}count+=((await Storage.get('meta','signers'))?.people||[]).filter(p=>p.pending).length;return {count,active:!!running,problem:problem||(!navigator.onLine?'Connexion indisponible':!Auth.current()?.name?'Reconnexion nécessaire':'' )};}
 window.addEventListener('online',wake);document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});setInterval(wake,15000);
 return {run,wake,state,pending,onChange(fn){observer=fn},busy:()=>!!running};
})();
