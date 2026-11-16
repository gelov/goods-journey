'use strict';
/* ================= style builds =================
   Builds every site and moving object in one visual style and caches the result, so switching style
   only swaps which meshes are drawn. Entities, paths, stage time and the camera are untouched. */
function buildStyle(name){if(SITES[0].meshes&&SITES[0].meshes[name])return;const first=!MOV.length;setBuild(name);
 REPLAY=!first;RI=1;GLV=[];SITES.forEach((S,k)=>{VV[k]=[]});buildWorld();SITES.forEach((S,k)=>{(S.meshes=S.meshes||{})[name]=upload(VV[k]);VV[k]=null;(S.glass=S.glass||{})[name]=GLV[k]&&GLV[k].length?upload(GLV[k]):null});GLV=[];V=[];
 if(first){buildMovers();buildTracking()}else for(const o of MOV){V=[];PID=o.pid;MOVB=true;MAT=0;SW=0;XF=null;o.build();o.meshes[name]=upload(V)}
 MOVB=false;PID=0;MAT=0;SW=0;V=[];REPLAY=false}
function setStyle(name){if(!STYLES[name])return;buildStyle(name);STYLE=name;document.body.dataset.style=name;try{localStorage.setItem('ffts.style.v2',name)}catch(e){}}
