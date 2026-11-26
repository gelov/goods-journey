'use strict';
/* ================= entities & stages ================= */
/* when a second visual style is built, the same entities are replayed in the same order instead of registered again */
let REPLAY=false,RI=1;
function ent(name,stage,note,fn){let id;if(REPLAY)id=RI++;else{id=ENT.length;ENT.push({id,name,stage,note,site:CUR,bb:[1e9,1e9,1e9,-1e9,-1e9,-1e9]})}if(fn){const o=PID;PID=id;fn(id);PID=o}return id}
const STAGES=[
 {name:'{O} Farm',short:'Farm',cam:[-198,0,8,-.55,.62,125],tag:[-196,16,-22],
  what:'Melons are grown and monitored at a farm in {O} before harvesting.',
  src:'Farm records / agricultural data.',
  use:'Provides visibility into the origin of the produce, growing conditions, and expected harvest.',
  next:'The melons are harvested, packed, and prepared for collection.'},
 {name:'Harvest & Transport',short:'Harvest',cam:[-146,0,14,.35,.56,82],tag:[-138,11,10],
  what:'Workers harvest the melons, place them into crates or boxes, and prepare them for transportation to the export port.',
  src:'Harvest records / packing records / transport documentation.',
  use:'Connects harvested produce to its origin and establishes traceability for transportation.',
  next:'The produce is transported by lorry to the export port.',note:'Record fields shown in the scene are illustrative.'},
 {name:'Export Port',short:'Export Port',cam:[-84,0,-4,-.5,.56,108],tag:[-90,20,-8],
  what:'Melons arrive at the export port in {O}, where containers are prepared and loaded onto a cargo vessel.',
  src:'Shipping manifest / export documents / logistics records.',
  use:'Connects the produce to its shipment and provides information required for international transportation.',
  next:'The container travels by cargo vessel across the Atlantic Ocean.',note:'{XP}'},
 {name:'Ocean Transportation',short:'Ocean',cam:[0,0,12,0,.72,300],tag:[0,16,26],follow:'ship',
  what:'The cargo vessel transports the containers from {O} to {D} while shipment conditions are monitored.',
  src:'Shipping records / container monitoring or telemetry data.',
  use:'Tracks the shipment and provides visibility into the conditions experienced during transportation.',
  next:'The shipment approaches {D} and undergoes customs processing.',note:'Readings shown beside the vessel are illustrative.'},
 {name:'{D} Customs & Port',short:'Customs',cam:[86,0,-8,.5,.56,108],tag:[90,20,-8],
  what:'The shipment arrives at the arrival port, with customs declarations and relevant import documentation processed{CS}.',
  src:'{CSRC}customs documentation / shipping records.',
  use:'Supports import processing and provides visibility into whether the goods can proceed through the UK supply chain.',
  next:'Containers are unloaded and the goods are prepared for inland transportation.',note:'{AP}'},
 {name:'Unloading & Inland Transport',short:'Unloading',cam:[108,0,17,-.3,.5,56],tag:[100,9,16],
  what:'Containers are unloaded at the arrival port. Pallets and boxes of melons are transferred to inland transport for movement to warehouse or inspection locations.',
  src:'Container manifest / goods receipt records / transport records.',
  use:'Identifies the goods received and tracks their movement from the port to the next logistics location.',
  next:'The goods enter the warehouse allocation process.'},
 {name:'Warehouse & Allocation',short:'Warehouse',cam:[146,0,0,.25,.72,92],tag:[146,13,-14],
  what:'{WS} generates pick lists to determine which pallets and boxes should be transferred to specific warehouse or QC locations.',
  src:'{WSRC}warehouse records.',
  use:'Supports the allocation and movement of goods to the correct inspection or storage location.',
  next:'Allocated produce is inspected by a third-party quality control inspector.',note:'Pick-list lines shown are illustrative.'},
 {name:'Quality Control',short:'Quality Control',cam:[179,0,9,-.35,.56,46],tag:[179,9,4],
  what:'Third-party inspectors examine the melons to determine their condition and suitability for supermarket distribution.',
  src:'Third-party QC reports / inspection records.',
  use:'Determines the condition of the produce and supports decisions about customer allocation, distribution, and claims.',
  next:'Damaged produce may trigger claims, while suitable produce continues towards customer distribution.',note:'Report contents shown are illustrative.'},
 {name:'Claims & Settlement',short:'Claims',cam:[160,4,-14,-.28,.42,120],tag:[179,15,-22],
  what:'Where QC identifies damaged or unsuitable produce, claims may be raised against the grower or originator.',
  src:'QC reports / claims records / financial records.',
  use:'Connects quality issues to the relevant grower or originator and supports the claims and settlement process.',
  next:'Suitable produce continues through distribution to the final customer. Claims are handled separately where required.',note:'The detailed settlement steps are not yet confirmed; the money flow is shown illustratively.'},
 {name:'Invoice & Billing',short:'Invoice',cam:[204,0,2,.4,.56,60],tag:[204,9,-10],
  what:'Finance processes the shipment and sales information into an invoice, then reconciles what was purchased with what was sold.',
  src:'Invoices / purchase orders / sales records / financial records.',
  use:'Closes the commercial side of the shipment: billing the customer and confirming that purchases and sales agree.',
  next:'The melons travel to their final customer or supermarket destination.',note:'The office activity is illustrative; only billing data in the manifest is shown.'},
 {name:'Supermarket Delivery',short:'Delivery',cam:[221,0,8,.3,.5,72],tag:[222,15,-14],
  what:'Approved melons are transported to their final customer or supermarket destination.',
  src:'Distribution records / customer allocation / delivery documentation.',
  use:'Provides visibility into where the goods are delivered and completes the traceability journey from farm to customer.',
  next:'The melons reach supermarket shelves and the end consumer.'}];

/* stage wording is generic; the places and systems in {braces} come from the active manifest. A manifest stage may also
   carry its own title and summary. */
function tx(str){const N=DATA.man,L=N&&N.loc,nt=l=>l?(l.note||l.label+(l.illustrative?' (illustrative location)':''))+'.':'';if(!str)return'';
 const T={O:N?N.origin:'Origin',D:N?N.dest:'Destination',XP:nt(L&&L.exportPort),AP:nt(L&&L.arrivalPort),CS:N&&N.customsSystem?' through the '+N.customsSystem:'',CSRC:N&&N.customsSystem?N.customsSystem.replace(/.*\((.+)\)$/,'$1')+' / ':'',
  WS:N&&N.warehouseSystem?'The '+N.warehouseSystem+' system':'The warehouse system',WSRC:N&&N.warehouseSystem?N.warehouseSystem+' / ':''};return str.replace(/\{(\w+)\}/g,(m,k)=>T[k]!=null?T[k]:m)}
const stageName=i=>tx(STAGES[i].over&&STAGES[i].over.title||STAGES[i].name),stageWhat=i=>tx(STAGES[i].over&&STAGES[i].over.summary||STAGES[i].what);
const ord=i=>STAGES.slice(0,i+1).filter(s=>!s.off).length,nStages=()=>STAGES.filter(s=>!s.off).length;
