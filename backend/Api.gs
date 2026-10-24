/** Beauregard Véhicules — GET/JSON et pont HTML pour les photos et signatures. */
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.api === 'health') return jsonResponse_({ok:true,build:'1.0.1',transport:'get-json-and-bridge'});
  if (params.api) {
    const requestId = String(params.requestId || '');
    try {
      const p = JSON.parse(String(params.data || '{}'));
      if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error('Données invalides');
      p.action = String(params.api);
      p.token = String(params.token || '');
      return jsonResponse_({...rpc(p),requestId});
    } catch (err) { return jsonResponse_({ok:false,error:String(err.message || err),requestId}); }
  }
  const origin = props_().getProperty('FRONTEND_ORIGIN');
  if (!origin || !/^https:\/\/[a-z0-9-]+\.github\.io$/.test(origin))
    return HtmlService.createHtmlOutput('Installation à terminer');
  const channel = String(params.channel || '');
  if (!/^[a-z0-9-]{36}$/.test(channel))
    return HtmlService.createHtmlOutput('Beauregard Véhicules — accès depuis l’application');
  // Le projet existant utilise bridge.html ; accepte aussi les anciennes copies Bridge.html.
  let t;
  try { t=HtmlService.createTemplateFromFile('bridge'); }
  catch (_) { t=HtmlService.createTemplateFromFile('Bridge'); }
  t.origin=origin; t.channel=channel;
  return t.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function jsonResponse_(value) {return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function rpc(p){try{if(!p||typeof p!=='object'||JSON.stringify(p).length>4200000)throw Error('Requête invalide');if(p.action==='login')return {ok:true,data:login_(p)};const s=session_(p.token,!['identity','identities','serviceConfig'].includes(p.action));let data;
 if(p.action==='serviceConfig')data=serviceConfig_();
 else if(p.action==='identities')data=identities_(s,p);
 else if(p.action==='signers')data=signers_();
 else if(p.action==='read')data=presentRecord_(record_(s,p.id,false));
 else if(p.action==='returnCandidates')data=returnCandidates_(s);
 else if(p.action==='returnPreview')data=returnPreview_(s,p);
 else if(p.action==='returnInitial')data=returnInitial_(s,p);
 else if(p.action==='returnSource'){const plate=Model.plate(p.plate);editionAccess_(s,active_(),false);data=rows_('Records').find(r=>!r.deleted&&!r.archived&&r.edition===active_()&&r.kind==='pickup'&&r.state==='final'&&r.data.vehicle.plate===plate)||null;if(data){data={id:data.id,data:{vehicle:data.data.vehicle}};}}
 else if(p.action==='availability')data=assertVehicleAvailable_(s,p);
 else if(p.action==='adminList'){admin_(s);const ed=p.edition||active_();editionAccess_(s,ed,false);data=rows_('Records').filter(r=>r.edition===ed&&!r.deleted&&!!r.archived===!!p.archived).map(r=>({...presentRecord_(r),data:{vehicle:r.data.vehicle}}));}
 else if(p.action==='list'){admin_(s);const ed=p.edition||active_();editionAccess_(s,ed,false);data=rows_('Records').filter(r=>r.edition===ed&&!r.deleted&&!!r.archived===!!p.archived).map(r=>({id:r.id,edition:r.edition,kind:r.kind,state:r.state,initialId:r.initialId,updatedBy:r.updatedBy,updatedAt:r.updatedAt,data:{vehicle:r.data.vehicle},progress:Model.progress(r.data,r.kind,r)}));}
 else if(p.action==='reconcile'){const ed=p.edition||active_();editionAccess_(s,ed,false);if(!Array.isArray(p.ids)||p.ids.length>100)throw Error('Liste de dossiers invalide');data=p.ids.map(id=>{assertId_(id);const r=get_('Records',id),t=get_('Operations','deleted:'+id);if(r)editionAccess_(s,r.edition,false);if(t)editionAccess_(s,t.edition,false);if(r&&r.edition!==ed||t&&t.edition!==ed)throw Error('Édition incohérente');return {id,deleted:!!(r?.deleted||t),revision:r?.revision||null,state:r?.state||null,archived:!!r?.archived,revoked:!!r&&(r.owner!==actorKey_(s)||!!p.leases&&p.leases[id]!==r.lease)};});}
 else if(p.action==='file')data=readFile_(s,p);
 else if(p.action==='videoList')data=videoList_(s,p);
 else if(p.action==='videoFiles')data=videoFiles_(s,p);
 else if(p.action==='videoRead')data=videoRead_(s,p);
 else if(p.action==='editions'){admin_(s);data=rows_('Editions');}
 else if(p.action==='history'){const r=record_(s,p.id,false);data=rows_('Audit').filter(a=>a.record===r.id);}
 else if(p.action==='amendments'){const r=record_(s,p.id,false);data=rows_('Amendments').filter(a=>a.record===r.id);}
 else if(p.action==='pdf')data=lock_(()=>{requireProduction_(p);return pdfFor_(s,p.id,false)});
 else if(p.action==='amendmentPdf')data=lock_(()=>{requireProduction_(p);return pdfFor_(s,p.id,true)});
 else data=lock_(()=>{
 if(p.action==='identity')return identity_(s,p);
 if(p.action==='logout'){s.expires=0;return put_('Sessions',s)&&true}
 if(p.action==='setServiceMode')return setServiceMode_(s,p);
 requireProduction_(p);
 if(p.action==='videoStart')return videoStart_(s,p);
 if(p.action==='videoStatus'||p.action==='videoChunk')return videoUpload_(s,p);
 if(p.action==='addSigner')return addSigner_(s,p);
 if(p.action==='reopenSignatures')return reopenSignatures_(s,p);
 if(p.action==='activity')return activity_(s,p);
 if(p.action==='takeover')return takeover_(s,p);
 if(p.action==='archiveControl')return archiveControl_(s,p);
 if(p.action==='deleteControl')return deleteControl_(s,p);
 if(p.action==='create')return create_(s,p);
 if(p.action==='save')return save_(s,p);
 if(p.action==='deleteDraft')return deleteDraft_(s,p);
 if(p.action==='photo')return photo_(s,p);
 if(p.action==='deletePhoto')return deletePhoto_(s,p);
 if(p.action==='sign')return sign_(s,p);
 if(p.action==='finalize')return finalize_(s,p);
 if(p.action==='amendment')return amendment_(s,p);
 throw Error('Action inconnue');});return {ok:true,data};
 }catch(e){return {ok:false,error:String(e.message||e)}}}
