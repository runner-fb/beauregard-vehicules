/* Shared deterministic business rules. No browser/Google dependencies. */
const Model = (() => {
 const views=['avant','droite','arriere','gauche','interieur'];
 const types=['Voiture','9 places','Utilitaire'];
 const fuels=['Vide','1/4','1/2','3/4','Plein'];
 const damageTypes=['Rayure','Bosse','Impact','Élément cassé','Autre'];
 const statuses=['Inchangé','Aggravé','Disparu / réparé'];
 const clone=x=>JSON.parse(JSON.stringify(x));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const plate=s=>String(s||'').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');
 function newData(kind,vehicle={},initial=null){return {vehicle:{plate:'',brand:'',model:'',color:'',type:'Voiture',...vehicle},mileage:null,fuel:'',meterPhoto:null,fuelPhoto:null,generalPhoto:null,remarks:'',views:Object.fromEntries(views.map(v=>[v,false])),damages:initial?Object.fromEntries(Object.values(initial.damages).map(d=>[d.id,{...clone(d),initial:clone(d),evolution:'',photos:[],comment:'',contest:null}])):{}};}
 function validate(data,kind,historicalPlate=null){const errors=[];const add=(step,field,message)=>errors.push({step,field,message});const v=data.vehicle||{};
 for(const k of ['plate','brand','model','color'])if(!String(v[k]||'').trim())add(1,'vehicle.'+k,({plate:'Immatriculation',brand:'Marque',model:'Modèle',color:'Couleur'})[k]+' manquante');
 if(!/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(plate(v.plate))&&v.plate!==historicalPlate)add(1,'vehicle.plate','Immatriculation attendue : AA123BB');
 if(!types.includes(v.type))add(1,'vehicle.type','Choisis un type de véhicule');
 if(!Number.isSafeInteger(data.mileage)||data.mileage<0)add(2,'mileage','Saisis un kilométrage entier positif ou nul');
 if(!fuels.includes(data.fuel))add(2,'fuel','Choisis le niveau de carburant');
 if(!data.meterPhoto)add(2,'meterPhoto','Photo compteur manquante');if(!data.fuelPhoto)add(2,'fuelPhoto','Photo jauge manquante');
 for(const view of views)if(data.views?.[view]!==true)add(view==='interieur'?4:3,view,'Valide la vue '+view);
 const nums=new Set();for(const d of Object.values(data.damages||{})){let step=d.view==='interieur'?4:3;const err=m=>add(step,d.id,'Dommage n°'+d.number+' : '+m);
 if(!views.includes(d.view)||!Number.isFinite(d.x)||!Number.isFinite(d.y)||d.x<0||d.x>1||d.y<0||d.y>1)err('position invalide');
 if(!Number.isSafeInteger(d.number)||d.number<1||nums.has(d.number))err('numéro invalide ou dupliqué');nums.add(d.number);
 if(!damageTypes.includes(d.type))err('type invalide');if(d.type==='Autre'&&!String(d.comment||d.initial?.comment||'').trim())err('description obligatoire');
 if(d.initial){if(kind!=='return'||(d.evolution&&!statuses.includes(d.evolution)))err('choisis l’évolution');if(d.evolution==='Aggravé'&&!d.comment?.trim())err('commentaire obligatoire');}
 else {if(!d.photos?.length)err('photo obligatoire');if(kind==='return'&&!['Nouveau dommage','Présence antérieure déclarée'].includes(d.classification))err('classement obligatoire');if(d.classification==='Présence antérieure déclarée'&&!d.comment?.trim())err('précise l’origine et les circonstances de la déclaration');}
 if(d.contest&&(!['Loueur','Locataire','Les deux'].includes(d.contest.party)||!d.contest.reason?.trim()))err('partie et motif de contestation obligatoires');
 }return errors;}
 function photos(data){return [...new Set([data.meterPhoto,data.fuelPhoto,data.generalPhoto,...Object.values(data.damages||{}).flatMap(d=>[...(d.photos||[]),...(d.initial?.photos||[])])].filter(Boolean))];}
 function progress(data,kind,record={}){if(record.state==='final')return 100;const errors=validate(data,kind,record.plateStrict?null:record.data?.vehicle?.plate);const steps=[1,2,3,4].filter(step=>!errors.some(e=>e.step===step)).length;const reviewed=data.reviewed===true&&!errors.length;return Math.round((steps+(reviewed?1:0))/6*100);}
 function contestRelevant(d,kind){return kind==='return'&&(!d.initial||d.evolution==='Aggravé'||d.classification==='Présence antérieure déclarée');}
 function merge(base,local,remote){const conflicts=[];
 function visit(b,l,r,path){if(same(l,r))return cloneSafe(l);if(same(b,l))return cloneSafe(r);if(same(b,r))return cloneSafe(l);
 if(Array.isArray(b)&&Array.isArray(l)&&Array.isArray(r)){const removed=new Set(b.filter(x=>!l.includes(x)||!r.includes(x)));return [...new Set([...l,...r])].filter(x=>!removed.has(x));}
 if(isObject(b)&&isObject(l)&&isObject(r)){const o={};for(const k of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){const value=visit(b[k],l[k],r[k],path.concat(k));if(value!==undefined)o[k]=value;}return o;}
 // Independently added damage records have distinct UUID keys and reach base undefined.
 conflicts.push({path,base:b??null,local:l??null,remote:r??null});return cloneSafe(l);}
 return {data:visit(base,local,remote,[]),conflicts};}
 function cloneSafe(x){return x===undefined?undefined:clone(x)}function isObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
 function setAt(o,path,v){let t=o;for(const k of path.slice(0,-1)){if(!t[k])t[k]={};t=t[k]}if(v===null)delete t[path.at(-1)];else t[path.at(-1)]=clone(v);}
 return {views,types,fuels,damageTypes,statuses,clone,same,plate,newData,validate,photos,progress,contestRelevant,merge,setAt};
})();
if(typeof module!=='undefined')module.exports=Model;
