/* Separate memory-only trials from the production database and its offline queue. */
const Service=(()=>{let state=null;function current(){return state}function sandbox(){return state?.production===false}function adopt(next){if(!next||typeof next.production!=='boolean'||!next.epoch)throw Error('Mode serveur invalide');const changed=state&&state.epoch!==next.epoch;state=next;Storage.configure(next.production,next.epoch);if(changed){Sandbox.reset();window.dispatchEvent(new Event('bg-mode-changed'));}return state;}
 async function verify(){const next=await Transport.rawCall('serviceConfig');const old=state;adopt(next);if(old&&old.epoch!==next.epoch)throw Error('MODE_CHANGE : le mode a changé. Les essais ont été abandonnés.');return state;}
 async function change(production){const next=await Transport.rawCall('setServiceMode',{production,confirm:true,modeEpoch:state.epoch});return adopt(next);}
 return {current,sandbox,verify,change,adopt};})();
const Sandbox=(()=>{let records=new Map(),photos=new Map(),signers=[];const clone=Model.clone;const now=()=>new Date().toISOString();const duplicate='Ce véhicule possède déjà un contrôle. Demande à un référent de le débloquer pour commencer une nouvelle fiche.';
 function reset(){records=new Map();photos=new Map();signers=[];}
 function get(id){const r=records.get(id);if(!r||r.deleted)throw Error('DOSSIER_SUPPRIME');return r;}
 function available(p){const plate=Model.plate(p.plate);if([...records.values()].some(r=>!r.deleted&&!r.archived&&r.data.vehicle.plate===plate&&!(p.kind==='return'&&r.id===p.initialId&&r.state==='final')))throw Error(duplicate);return {available:true,plate};}
 async function call(action,p){if(!Service.sandbox())throw Error('MODE_CHANGE');let r;
 if(action==='availability')return available(p);
 if(action==='returnSource'){r=[...records.values()].find(r=>!r.deleted&&!r.archived&&r.data.vehicle.plate===Model.plate(p.plate)&&r.kind==='pickup'&&r.state==='final');return r?clone(r):null;}
 if(action==='create'){if(records.has(p.id))return clone(get(p.id));available({plate:p.data.vehicle.plate,kind:p.kind,initialId:p.initialId});const initial=p.initialId?get(p.initialId):null;r={id:p.id,kind:p.kind,edition:p.edition,sandbox:true,owner:Auth.actor(),lease:crypto.randomUUID(),revision:1,state:'draft',data:initial?Model.newData('return',initial.data.vehicle,initial.data):clone(p.data),initialId:initial?.id||null,signatures:{},createdAt:now(),updatedAt:now(),lastActivityAt:now(),updatedBy:Auth.current().name,plateStrict:true};records.set(r.id,r);return clone(r);}
 if(action==='read')return clone(get(p.id));
 if(action==='reconcile')return p.ids.map(id=>({id,deleted:!!records.get(id)?.deleted,archived:!!records.get(id)?.archived,revision:records.get(id)?.revision||null,state:records.get(id)?.state||null}));
 if(action==='adminList'||action==='list'){if(Auth.current().role!=='admin')throw Error('Accès référent requis');return [...records.values()].filter(r=>!r.deleted&&!!r.archived===!!p.archived).map(r=>({...clone(r),businessStatus:r.state==='final'?(r.kind==='return'?'Rendu':'Réceptionné'):Date.now()-Date.parse(r.lastActivityAt)>=600000?'Bloqué':'En cours'}));}
 if(action==='photo'){photos.set(p.id,{...p,sandbox:true});return {fileId:p.id};}
 if(action==='deletePhoto'){photos.delete(p.id);return true;}
 if(action==='file'){const ph=photos.get(p.photo);if(!ph)throw Error('Photo de cet essai indisponible');return {mime:'image/jpeg',base64:ph.data.split(',')[1]};}
 if(action==='history'||action==='amendments')return [];
 if(action==='signers')return clone(signers);
 if(action==='addSigner'){const name=(p.first+' '+p.last).trim();let x=signers.find(x=>x.name.toLocaleLowerCase('fr')===name.toLocaleLowerCase('fr'));if(!x){x={id:crypto.randomUUID(),first:p.first,last:p.last,name};signers.push(x);}return clone(x);}
 if(action==='pdf'||action==='amendmentPdf')throw Error('MODE BAC À SABLE — AUCUN PDF CONSERVÉ');
 r=get(p.id);if(r.archived)throw Error('DOSSIER_ARCHIVE');if(action==='activity'){r.lastActivityAt=now();return clone(r);}
 if(['takeover','archiveControl','deleteControl'].includes(action)&&Auth.current().role!=='admin')throw Error('Accès référent requis');
 if(action==='takeover'){r.owner=Auth.actor();r.lease=crypto.randomUUID();}
 else if(action==='archiveControl'){r.archived=true;r.archiveReference='X'+r.data.vehicle.plate+'-'+r.id;}
 else if(action==='deleteControl'||action==='deleteDraft')r.deleted=true;
 else{if(p.lease!==r.lease||r.owner!==Auth.actor())throw Error('AUTORISATION_REMPLACEE');if(p.revision!==r.revision)throw Error('Le dossier a changé');if(r.state==='final')throw Error('Contrôle clôturé');if(action==='save'){if(!Model.same(r.data,p.data)){r.signatures={};r.state='draft';}r.data=clone(p.data);r.lastActivityAt=now();}else if(action==='reopenSignatures'){if(p.confirm!==true)throw Error('Confirmation requise');r.signatures={};r.state='draft';r.data.reviewed=false;}else if(action==='sign'){const errors=Model.validate(r.data,r.kind);if(errors.length)throw Error(errors[0].message);if(!p.image)throw Error('Signature requise');r.signatures[p.party]={...p,at:now(),by:Auth.current().name};r.state='locked';}else if(action==='finalize'){if(!r.signatures.loueur?.image||!r.signatures.locataire?.image)throw Error('Les deux signatures sont requises');r.state='final';}else throw Error('Action indisponible dans cet essai');}
 r.revision++;r.updatedAt=now();return clone(r);
 }
 return {call,reset};})();
