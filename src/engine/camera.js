'use strict';
/* ================= camera ================= */
const POSE={lon:-30,lat:8,ry:0,rx:1.45,ld:Math.log(58000)},CAM={auto:true,last:-1e9,drag:false};let X={},FLY=null,FOLLOW=null,PRIM=null,FADE=0;
function flyTo(to,ms,done){const from={...POSE},b=to(),dist=angd([from.lon,from.lat],[b.lon,b.lat])*RS;FLY={from,to,t0:NOW,dist,done,dur:(ms||(800+Math.min(1700,dist/9+Math.abs(b.ld-from.ld)*190))/spd())*MOTION+1}}
function stepCam(dt){
 if(FLY){const k=clamp((NOW-FLY.t0)/FLY.dur,0,1),e=io(k),a=FLY.from,b=FLY.to(),mx=Math.max(a.ld,b.ld),bump=Math.max(0,Math.log(Math.max(1,FLY.dist*1.5))-mx);
  POSE.lon=a.lon+dlon(a.lon,b.lon)*e;POSE.lat=lerp(a.lat,b.lat,e);POSE.ry=a.ry+dang(a.ry,b.ry)*e;POSE.rx=lerp(a.rx,b.rx,e);POSE.ld=lerp(a.ld,b.ld,e)+bump*Math.sin(Math.PI*k);
  if(k>=1){const d=FLY.done;FLY=null;d&&d()}}
 else if(STATE.att&&STATE.started)Object.assign(POSE,stagePose(STATE.idx));
 else if(FOLLOW&&!CAM.drag){const g=FOLLOW(),q=Math.min(1,dt*3);POSE.lon+=dlon(POSE.lon,g[0])*q;POSE.lat+=(g[1]-POSE.lat)*q}
 if(CAM.auto&&!CAM.drag&&!FLY&&!STATE.att&&NOW-CAM.last>2500){if(POSE.ld>Math.log(6000))POSE.lon+=dt*2.2;else POSE.ry+=dt*.045}
 POSE.ld=clamp(POSE.ld,LMIN,LMAX);POSE.lat=clamp(POSE.lat,-84,84);
 const a=GLS.cw/Math.max(1,GLS.ch),d=Math.exp(POSE.ld),rx=lerp(POSE.rx,1.45,ss(Math.log(3000),Math.log(14000),POSE.ld)),cx=Math.cos(rx),eye=[d*cx*Math.sin(POSE.ry),d*Math.sin(rx),d*cx*Math.cos(POSE.ry)],Vw=lookAt(eye,[0,0,0],[0,1,0]),Qf=Qm(POSE.lon,POSE.lat);
 const alt=Math.hypot(eye[0],eye[1]+RS,eye[2])-RS,Gf=mul(tr(0,-RS,0),mul(sc(RS,RS,RS),Qf));
 X={d,eye,Qf,a,alt,gvp:mul(persp(.5,a,Math.max(1,alt*.25),alt+2.3*RS),mul(Vw,Gf)),eyeG:xp(tp(Qf),[eye[0]/RS,(eye[1]+RS)/RS,eye[2]/RS]),PV:mul(persp(.5,a,Math.max(.5,d*.04),d*6+3000),Vw)};
 FADE=1-ss(700,2300,d);PRIM=null;let best=1e9;
 for(const S of SITES){const dist=angd([POSE.lon,POSE.lat],S.g)*RS;S.on=FADE>.01&&dist<S.r1+d*1.5;if(!S.on)continue;
  const QT=mul(Qf,tp(Qm(S.g[0],S.g[1])));const ro=S.rot||0;S.M=mul(tr(0,-RS,0),mul(QT,mul(tr(0,RS,0),mul(rY(ro),tr(-S.c[0],0,-S.c[1])))));const inv=mul(tr(S.c[0],0,S.c[1]),mul(rY(-ro),mul(tr(0,-RS,0),mul(tp(QT),tr(0,RS,0)))));S.vp=mul(X.PV,S.M);S.eye=xp(inv,eye);S.tgt=xp(inv,[0,0,0]);
  if(dist<S.r1+40&&dist<best){best=dist;PRIM=S}}}
const proj=(m,p)=>{const w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];if(w<=.01)return null;return[((m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12])/w*.5+.5)*GLS.cw,(1-((m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13])/w*.5+.5))*GLS.ch]};
function userTook(){CAM.last=NOW;FLY=null;STATE.hold=false;if(STATE.att){STATE.att=false;syncCtl()}}
function panBy(dx,dy){const s=X.d*.0011,c=Math.cos(POSE.ry),sn=Math.sin(POSE.ry),k=1/Math.max(.35,Math.sin(lerp(POSE.rx,1.45,ss(Math.log(3000),Math.log(14000),POSE.ld)))),ex=-(dx*c+dy*k*sn)*s,sz=-(-dx*sn+dy*k*c)*s;
 POSE.lat=clamp(POSE.lat-sz/RS/RAD,-84,84);POSE.lon+=ex/(RS*Math.cos(POSE.lat*RAD))/RAD;FOLLOW=null}
function initControls(){const ptr=new Map();let moved=0,pan=false,pinch=0,down=null;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);moved=0;down=[e.clientX,e.clientY];const alt=e.button===2||e.button===1||e.shiftKey;pan=X.d>3500?!alt:alt;CAM.drag=true;cv.classList.add('drag');userTook();if(ptr.size===2){const a=[...ptr.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])}});
 cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId)){hoverAt(e.clientX,e.clientY);return}const p=ptr.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];ptr.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);CAM.last=NOW;
  if(ptr.size===2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch>0)POSE.ld+=Math.log(pinch/d);pinch=d;panBy(dx*.5,dy*.5)}
  else if(pan)panBy(dx,dy);else{POSE.ry-=dx*.005;POSE.rx=clamp(POSE.rx+dy*.004,.12,1.45)}});
 const up=e=>{if(!ptr.has(e.pointerId))return;ptr.delete(e.pointerId);if(!ptr.size){CAM.drag=false;cv.classList.remove('drag')}if(moved<6&&down&&e.button===0)clickAt(e.clientX,e.clientY);down=null;pinch=0};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('wheel',e=>{e.preventDefault();userTook();POSE.ld+=e.deltaY*.0012},{passive:false});
 cv.addEventListener('dblclick',e=>{const id=pickAt(e.clientX,e.clientY);if(id)focusEnt(id,true)})}
