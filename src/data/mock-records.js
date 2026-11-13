'use strict';
/* ================= DEMO DATA (fictional, not real Contained shipment records) =================
   Plain JSON-shaped records standing in for BlueRing and the source systems until real access exists.
   Every name, id, date, quantity and value here is made up for demonstration. null means "not available".
   Links: batch.farmId, container.shipmentId, pallet.containerId, pallet.batchIds[], allocation.palletIds[],
   qcReport.palletIds[], claim.qcReportId, delivery.shipmentId / qcReportId.
   The links allow many-to-many (several containers per shipment, mixed batches on a pallet); this demo uses one of each. */
const DEMO_PALLETS=Array.from({length:20},(_,i)=>'PAL-'+String(i+1).padStart(3,'0'));
const MOCK_RECORDS={
 farms:[{id:'FARM-BR-001',name:'Fazenda Verde Melons (fictional)',location:'Northeast Brazil (illustrative)',grower:'Fazenda Verde Melons (fictional)',weather:'29°C',humidity:'68%',fertiliser:'5 October 2026',expectedHarvest:'12 October 2026'}],
 batches:[{id:'HARV-BR-001',farmId:'FARM-BR-001',harvestDate:'12 October 2026',quantity:'18,000 melons',boxes:'1,800',pallets:'20',packed:'13 October 2026',lorry:'TRUCK-BR-001',collection:'Completed'}],
 shipments:[{id:'SHIP-BR-2026-001',product:'Fresh Melons',origin:'Brazil',destination:'United Kingdom',manifest:'MAN-BR-001',packingList:'PACK-BR-001',exportPort:'Brazil export port (illustrative)',
  vessel:'Atlantic Produce Express (fictional)',departure:'16 October 2026',arrival:'29 October 2026',loading:'Completed',seaStatus:'Arrived',status:'Delivered'}],
 containers:[{id:'CONT-001',shipmentId:'SHIP-BR-2026-001',avgTemp:'5.2°C',co2:'0.4%',
  temps:[['16 Oct',5.0],['17 Oct',5.1],['18 Oct',5.3],['19 Oct',5.2],['20 Oct',5.4],['21 Oct',5.3],['22 Oct',5.1],['23 Oct',5.0],['24 Oct',5.2],['25 Oct',5.3],['26 Oct',5.4],['27 Oct',5.2],['28 Oct',5.1],['29 Oct',5.2]],
  unloaded:'30 October 2026',palletsReceived:'20',boxesReceived:'1,800',receipt:'GRN-UK-001',truck:'TRUCK-UK-001',warehouse:'WH-UK-001',status:'Received'}],
 customs:[{id:'CDS-UK-001',shipmentId:'SHIP-BR-2026-001',arrival:'29 October 2026',status:'Cleared',cleared:'30 October 2026',docs:'Available',port:'UK arrival port (illustrative)'}],
 pallets:DEMO_PALLETS.map(id=>({id,containerId:'CONT-001',batchIds:['HARV-BR-001'],boxes:'90'})),
 allocations:[{id:'PICK-001',palletIds:DEMO_PALLETS,warehouse:'WH-UK-001',system:'Prometheus',totalPallets:'20',qcPallets:'20 pallets',date:'31 October 2026',status:'Completed'}],
 qcReports:[{id:'QC-001',palletIds:DEMO_PALLETS,date:'1 November 2026',type:'Third-party QC',inspected:'18,000 melons',accepted:'17,640 melons',rejected:'360 melons',damageRate:'2%',status:'Completed',report:'Available',
  results:[['Accepted',17640,'Delivery DEL-001'],['Rejected',360,'Claim CLAIM-001']]}],
 claims:[{id:'CLAIM-001',qcReportId:'QC-001',quantity:'360 melons',reason:'Quality damage',status:'Settled',value:'£450 (sample value)',settled:'3 November 2026',growerRef:'FARM-BR-001'}],
 deliveries:[{id:'DEL-001',shipmentId:'SHIP-BR-2026-001',qcReportId:'QC-001',customer:'UK Retail Customer (fictional)',destination:'UK distribution centre (illustrative)',quantity:'17,640 melons',date:'5 November 2026',status:'Completed',pod:'Available'}]};
