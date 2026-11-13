'use strict';
/* ================= data source (integration layer) =================
   The UI reads records only through DATA. Today the only adapter is the sample set.
   To connect BlueRing or another system later: add an adapter here that returns the same record shape
   (see mock-records.js) with status 'live', and name it in CONFIG.data.source. It must call your own
   backend; API keys and private records never belong in this frontend code. No live adapter exists yet. */
const DATA={records:null,status:'unavailable'};
const ADAPTERS={mock:()=>({records:MOCK_RECORDS,status:'sample'})};
function loadData(){const a=ADAPTERS[CONFIG.data&&CONFIG.data.source]||ADAPTERS.mock;let r=null;try{r=a()}catch(e){}
 DATA.records=r&&r.records||{};DATA.status=r&&r.records?r.status:'unavailable'}
loadData();
