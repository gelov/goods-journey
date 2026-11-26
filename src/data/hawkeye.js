'use strict';
/* ================= Hawkeye Billing adapter =================
   Hawkeye (Melon&Co's order-to-invoice platform) is the source of truth for billing. Its workflow, as its own state feed names it:
   Order in > Rates > Despatch > Received > Draft > Authorise > Release > Issued, with two gates (Rates: a price authorised by Sales;
   Release: Finance approval before anything is sent). Payments come from Sage, not from Hawkeye's stages. Stage statuses are done,
   wait (waiting for a person) and idle (not yet); a stage held by its gate is shown as such.
   Records reach the journey two ways, both read-only: a "hawkeye" object inside a manifest's billing block (JSON, or a future API/MCP
   feed in the same shape), or Hawkeye's live state feed relayed by the local server (/hawkeye/state). A live record is used only when
   it matches the manifest by purchase order or sales order; nothing is inferred from dates, customers or the journey's progress. */
const HAWKEYE={base:'https://hawkeye-eajy.onrender.com',live:null,err:null,
 STAGES:[['Order in','Order matched to the depot sales order'],['Rates','Price authorised by Sales'],['Despatch','Delivery note despatched'],['Received','Receipt notified by the depot'],
  ['Draft','Invoice generated (draft)'],['Authorise','Invoice authorised'],['Release','Finance approval to send'],['Issued','Invoice sent']],GATES:[1,6]};
/* one Hawkeye row (from the state feed or a manifest) in the journey's shape */
function hkRecord(r,src){if(!r||typeof r!=='object')return null;const st=Array.isArray(r.stages)?r.stages:[];
 return{src,so:r.so||r.salesOrder||null,po:r.po||r.customer_po||r.purchaseOrder||null,depot:r.depot||null,note:r.note||null,value:typeof r.value==='number'?r.value:null,invoiceId:r.invoice_id!=null?r.invoice_id:r.invoiceId!=null?r.invoiceId:null,
  stages:HAWKEYE.STAGES.map((s,i)=>({name:s[0],what:s[1],gate:HAWKEYE.GATES.includes(i),status:st[i]==='done'||st[i]==='wait'||st[i]==='idle'||st[i]==='held'?st[i]:null}))}}
/* the live feed, fetched once per page (and on request); a failure only means no live records */
async function hkLoad(){try{const r=await fetch('hawkeye/state',{cache:'no-cache'});const j=await r.json();if(!r.ok||j.error)throw new Error(j.error||'HTTP '+r.status);
  HAWKEYE.live={asOf:j.as_of||null,account:j.account||null,title:j.title||null,rows:(j.rows||[]).map(x=>hkRecord(x,'live')).filter(Boolean)};HAWKEYE.err=null}catch(e){HAWKEYE.live=null;HAWKEYE.err=e.message}
 if(typeof STATE!=='undefined'&&STATE.panel&&STATE.pi===9)showPanel(STATE.pi,STATE.obj)}
/* the billing view for a manifest: its own billing fields, plus the Hawkeye record it carries or that matches it live */
function hkFor(N){const b=N&&N.billing||null,refs=b?[b.purchaseOrder,b.salesOrder,b.hawkeye&&b.hawkeye.po,b.hawkeye&&b.hawkeye.so].filter(Boolean).map(String):[];
 let rec=b&&b.hawkeye?hkRecord(b.hawkeye,'manifest'):null,how=rec?'carried in the manifest':null;
 if(!rec&&refs.length&&HAWKEYE.live){const m=HAWKEYE.live.rows.filter(r=>refs.includes(String(r.po))||refs.includes(String(r.so)));if(m.length===1){rec=m[0];how='matched live by '+(refs.includes(String(rec.po))?'PO '+rec.po:'sales order '+rec.so)}}
 const url=rec&&rec.invoiceId!=null?HAWKEYE.base+'/invoices/'+encodeURIComponent(rec.invoiceId):rec&&rec.so?HAWKEYE.base+'/pipeline/'+encodeURIComponent(rec.so):HAWKEYE.base+'/';
 return{b,rec,how,refs,url}}
