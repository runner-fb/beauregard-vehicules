function doGet(e){const origin=props_().getProperty('FRONTEND_ORIGIN');if(!origin||!/^https:\/\/[a-z0-9-]+\.github\.io$/.test(origin))return HtmlService.createHtmlOutput('Installation à terminer');const channel=String(e.parameter.channel||'');if(!/^[a-z0-9-]{36}$/.test(channel))return HtmlService.createHtmlOutput('Beauregard Véhicules — accès depuis l’application');const t=HtmlService.createTemplateFromFile('Bridge');t.origin=origin;t.channel=channel;return t.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)}
function rpc(p){try{if(!p||typeof p!=='object'||JSON.stringify(p).length>4200000)throw Error('Requête invalide');if(p.action==='login')return {ok:true,data:login_(p)};const s=session_(p.token,p.action!=='identity');let data;
 if(p.action==='read')data=record_(s,p.id,false);
 else if(p.action==='list'){const ed=p.edition||active_();editionAccess_(s,ed,false);data=rows_('Records').filter(r=>r.edition===ed).map(r=>({...r,data:{vehicle:r.data.vehicle},progress:Model.progress(r.data,r.kind)}));}
 else if(p.action==='file')data=readFile_(s,p);
 else if(p.action==='editions'){admin_(s);data=rows_('Editions');}
 else if(p.action==='history'){const r=record_(s,p.id,false);data=rows_('Audit').filter(a=>a.record===r.id);}
 else if(p.action==='amendments'){const r=record_(s,p.id,false);data=rows_('Amendments').filter(a=>a.record===r.id);}
 else if(p.action==='pdf')data=pdfFor_(s,p.id,false);
 else if(p.action==='amendmentPdf')data=pdfFor_(s,p.id,true);
 else data=lock_(()=>{
 if(p.action==='identity')return identity_(s,p);
 if(p.action==='logout'){s.expires=0;return put_('Sessions',s)&&true}
 if(p.action==='create')return create_(s,p);
 if(p.action==='save')return save_(s,p);
 if(p.action==='photo')return photo_(s,p);
 if(p.action==='deletePhoto')return deletePhoto_(s,p);
 if(p.action==='sign')return sign_(s,p);
 if(p.action==='finalize')return finalize_(s,p);
 if(p.action==='amendment')return amendment_(s,p);
 throw Error('Action inconnue');});return {ok:true,data};
 }catch(e){return {ok:false,error:String(e.message||e)}}}
