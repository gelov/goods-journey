'use strict';
/* ================= manifest providers =================
   A provider hands over manifest objects in the schema of manifests/manifest.schema.json; nothing downstream cares where
   they came from. Two exist: the bundled samples and an uploaded file. A future MCP adapter is a third provider with the
   same list()/load() shape: it converts the MCP response into this schema and returns it. It must run behind your own
   backend; no credentials belong in this frontend, and no live connection is implemented or simulated here.
   useManifest() is the single entry point: adapt the format (adapters.js), validate, normalise, make active, apply to the journey. A manifest that fails
   validation changes nothing, so the previous one stays active. */
const PROVIDERS={
 samples:{label:'Sample manifests',
  async list(){const r=await fetch('manifests/index.json',{cache:'no-store'});if(!r.ok)throw new Error('Could not read manifests/index.json (HTTP '+r.status+')');return(await r.json()).samples.map(s=>({key:'sample:'+s.file,label:s.label,ref:s.file,kind:'sample'}))},
  async load(ref){const r=await fetch('manifests/'+ref,{cache:'no-store'});if(!r.ok)throw new Error('Could not read manifests/'+ref+' (HTTP '+r.status+')');return r.json()}},
 file:{label:'Imported file',async load(file){const t=await file.text();try{return JSON.parse(t)}catch(e){throw new Error('This file is not valid JSON ('+e.message+').')}}}};
const MANIFESTS=[];let ACTIVE=null,BOOTERR=null,APPLY_READY=false;
function useManifest(raw,key,label,kind,opts){const P=prepareManifest(raw,opts);if(P.errors.length)return{ok:false,errors:P.errors,prep:P};let N;try{N=normalizeManifest(P.manifest)}catch(e){return{ok:false,errors:['The manifest could not be read: '+e.message],prep:P}}
 let e=MANIFESTS.find(x=>x.key===key);if(!e)MANIFESTS.push(e={key,kind:kind||'file'});e.obj=raw;e.label=label;e.opts=opts;ACTIVE=e;DATA.records=N.records;DATA.status=N.demo?'sample':'manifest';DATA.man=N;if(APPLY_READY)applyManifest(N);return{ok:true,N,prep:P}}
async function selectManifest(key){const e=MANIFESTS.find(x=>x.key===key);if(!e)return{ok:false,errors:['Unknown manifest.']};try{if(!e.obj)e.obj=await PROVIDERS.samples.load(e.ref)}catch(x){return{ok:false,errors:[String(x.message||x)]}}return useManifest(e.obj,e.key,e.label,e.kind,e.opts)}
/* an uploaded file is only read and prepared here; the preview decides whether it becomes the active manifest */
async function readManifestFile(file){try{return{ok:true,raw:await PROVIDERS.file.load(file)}}catch(x){return{ok:false,errors:[String(x.message||x)]}}}
async function importManifestFile(file,opts){const r=await readManifestFile(file);if(!r.ok)return r;const id=r.raw&&((r.raw.manifest&&r.raw.manifest.id)||r.raw.manifestId);return useManifest(r.raw,'file:'+(id||file.name),'Imported · '+(id||file.name),'file',opts)}
/* first load: the sample list, then the first sample. If that fails the journey still opens on placeholder coordinates with every value unavailable. */
async function initManifests(){try{const list=await PROVIDERS.samples.list();for(const s of list)MANIFESTS.push(s);const r=await selectManifest(list[0].key);if(!r.ok)BOOTERR=r.errors}catch(e){BOOTERR=[String(e.message||e)]}}
