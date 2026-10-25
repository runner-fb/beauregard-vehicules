/* Storage writes occur under the script lock. One record per row, chunked JSON cells. */
const TABLES_=['Records','Photos','Sessions','Audit','Operations','Editions','Amendments'];
function props_(){return PropertiesService.getScriptProperties()}
function db_(){const id=props_().getProperty('DATABASE_ID');if(!id)throw Error('INSTALLATION_REQUIRED');return SpreadsheetApp.openById(id)}
function rows_(table){const sh=db_().getSheetByName(table);const a=sh.getDataRange().getValues();return a.slice(1).filter(r=>r[0]).map(r=>JSON.parse(r.slice(1).filter(v=>v!=='').map(v=>String(v).startsWith('~')?String(v).slice(1):String(v)).join('')))}
function get_(table,id){return rows_(table).find(r=>r.id===id)||null}
function put_(table,o){const sh=db_().getSheetByName(table);const s=JSON.stringify(o);if(s.length>400000)throw Error('Dossier trop volumineux');const a=sh.getDataRange().getValues();let n=a.findIndex((r,i)=>i&&r[0]===o.id);if(n<0)n=a.length;const parts=[];for(let p=0;p<s.length;p+=40000)parts.push('~'+s.slice(p,p+40000));while(parts.length<10)parts.push('');sh.getRange(n+1,1,1,11).setValues([[o.id,...parts]]);return o}
function id_(){return Utilities.getUuid()}
function time_(){return new Date().toISOString()}
function audit_(s,action,record,details){put_('Audit',{id:id_(),at:time_(),actor:s.name,role:s.role,action,record,details:details||null})}
function lock_(fn){const l=LockService.getScriptLock();l.waitLock(30000);try{return fn()}finally{l.releaseLock()}}
function active_(){return props_().getProperty('ACTIVE_EDITION')||'2027'}
// Record ownership and fencing are independent of edition access.
function editionAccess_(s,edition,write){if(!s||!['admin','controller'].includes(s.role)||!s.name)throw Error('Accès non autorisé');if(edition!==active_()&&(s.role!=='admin'||write))throw Error('Édition en lecture seule ou accès interdit')}
function record_(s,id,write){const r=get_('Records',id);if(r?.deleted||get_('Operations','deleted:'+id))throw Error('DOSSIER_SUPPRIME');if(!r)throw Error('Dossier introuvable');editionAccess_(s,r.edition,write);if(r.archived){if(write)throw Error('DOSSIER_ARCHIVE');admin_(s);}if(s.role!=='admin'&&r.owner!==actorKey_(s))throw Error('ACCES_DOSSIER_REFUSE');return r}
function digest_(v){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('')}
function folder_(parent,name){const f=parent.getFoldersByName(name);return f.hasNext()?f.next():parent.createFolder(name)}
function vehicleFolder_(r){const peers=rows_('Records').filter(x=>x.edition===r.edition&&x.data.vehicle.plate===r.data.vehicle.plate);const saved=peers.find(x=>x.folderId);if(saved)return DriveApp.getFolderById(saved.folderId);const root=DriveApp.getFolderById(props_().getProperty('DATA_FOLDER_ID'));const ed=folder_(root,r.edition);const folder=folder_(ed,r.data.vehicle.plate+' — '+r.data.vehicle.brand+' '+r.data.vehicle.model);const fresh=get_('Records',r.id);fresh.folderId=folder.getId();put_('Records',fresh);return folder;}
function admin_(s){if(s.role!=='admin')throw Error('Accès administrateur requis')}
function assertId_(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(id))throw Error('Identifiant invalide');return id}

// A session renewal keeps the identity; a takeover changes the opaque write lease.
function actorKey_(s){return String(s.actorId||s.name||'').trim().normalize('NFKC').toLocaleLowerCase('fr')+'|'+s.role}
function writeRecord_(s,p){const r=record_(s,p.id||p.record,true);if(r.modeEpoch!==serviceConfig_().epoch)throw Error('AUTORISATION_REMPLACEE : changement de saison, reprise référent nécessaire.');if(!r.lease||p.lease!==r.lease||r.owner!==actorKey_(s))throw Error('AUTORISATION_REMPLACEE : un référent doit te redonner la main.');return r}
function businessStatus_(r,now){if(r.state==='final')return r.kind==='return'?'Rendu':'Réceptionné';if(Object.values(r.signatures||{}).some(x=>x.image||x.fileId))return 'En cours';const last=Date.parse(r.lastActivityAt||r.updatedAt||r.createdAt);return !Number.isFinite(last)||(now===undefined?Date.now():now)-last>=600000?'Bloqué':'En cours'}
function presentRecord_(r,images=true){const out={...r,signatures:JSON.parse(JSON.stringify(r.signatures||{})),businessStatus:businessStatus_(r)};if(images)for(const sig of Object.values(out.signatures))if(sig.fileId&&!sig.image)sig.image='data:image/png;base64,'+Utilities.base64Encode(signatureBlob_(sig).getBytes());return out;}
function signatureBlob_(sig){if(sig.fileId){const file=DriveApp.getFileById(sig.fileId);if(file.isTrashed()||file.getMimeType()!=='image/png'||file.getSize()<=0)throw Error('Signature Drive indisponible');const blob=file.getBlob();if(sig.sha256&&digest_(Utilities.base64Encode(blob.getBytes()))!==sig.sha256)throw Error('Signature Drive incohérente');return blob;}if(sig.image)return Utilities.newBlob(Utilities.base64Decode(sig.image.split(',')[1]),'image/png','signature.png');throw Error('Signature absente');}

// Fail closed until a referent explicitly starts the season. Never deletes records.
function serviceConfig_(){const x=get_('Operations','settings:service');return x?{production:x.production===true,epoch:x.epoch,changedAt:x.at}:{production:false,epoch:'unconfigured',changedAt:null}}
function requireProduction_(p){const mode=serviceConfig_();if(!mode.production||p.production!==true||p.modeEpoch!==mode.epoch)throw Error('MODE_CHANGE : vérifie la mise en service avant de continuer.');return mode}
function setServiceMode_(s,p){admin_(s);if(typeof p.production!=='boolean'||p.confirm!==true)throw Error('Confirmation du changement de mode requise');const previous=serviceConfig_();if(p.modeEpoch!==previous.epoch)throw Error('MODE_CHANGE : le réglage a changé sur un autre appareil.');if(previous.production===p.production)return previous;const x={id:'settings:service',production:p.production,epoch:id_(),at:time_(),by:s.name};put_('Operations',x);audit_(s,p.production?'Mise en service':'Désactivation de la saison',null,{previous:previous.production,production:p.production});return serviceConfig_()}
