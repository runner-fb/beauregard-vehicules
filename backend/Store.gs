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
function editionAccess_(s,edition,write){if(edition!==active_()&&(s.role!=='admin'||write))throw Error('Édition en lecture seule ou accès interdit')}
function record_(s,id,write){const r=get_('Records',id);if(!r)throw Error('Dossier introuvable');editionAccess_(s,r.edition,write);return r}
function digest_(v){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('')}
function folder_(parent,name){const f=parent.getFoldersByName(name);return f.hasNext()?f.next():parent.createFolder(name)}
function vehicleFolder_(r){const peers=rows_('Records').filter(x=>x.edition===r.edition&&x.data.vehicle.plate===r.data.vehicle.plate);const saved=peers.find(x=>x.folderId);if(saved)return DriveApp.getFolderById(saved.folderId);const root=DriveApp.getFolderById(props_().getProperty('DATA_FOLDER_ID'));const ed=folder_(root,r.edition);const folder=folder_(ed,r.data.vehicle.plate+' — '+r.data.vehicle.brand+' '+r.data.vehicle.model);const fresh=get_('Records',r.id);fresh.folderId=folder.getId();put_('Records',fresh);return folder;}
function admin_(s){if(s.role!=='admin')throw Error('Accès administrateur requis')}
function assertId_(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(id))throw Error('Identifiant invalide');return id}
