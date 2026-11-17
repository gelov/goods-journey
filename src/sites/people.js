'use strict';
/* ================= people =================
   One worker model for every style: natural proportions (about 1.8 m, built in metres then scaled by WK), a simple face,
   and outfits by role: farm, harvest, port, warehouse, qc, store, shopper. A moving worker is a rig of five pieces
   (body with head, two legs, two arms) that share one entity id, so it highlights and picks as one person; a pose
   function of stage time drives walking, bending, carrying and reaching, so pause and scrubbing hold. Standing workers
   use the same pieces merged into one mesh. */
const WK=1.19,HIP=.95,SHY=1.41,SHX=.235,LEGX=.095;
const WC={trous:[.2,.25,.36],jeans:[.28,.36,.52],boot:[.3,.2,.13],sole:[.12,.11,.1],belt:[.32,.21,.13],vest:[.96,.5,.12],vestY:[.84,.88,.18],refl:[.88,.9,.92],coat:[.93,.94,.94],
 glove:[.62,.64,.66],gloveB:[.3,.5,.86],gloveH:[.86,.74,.32],hard:[.95,.8,.12],hardW:[.94,.95,.95],net:[.92,.94,.96],hair:[[.17,.12,.09],[.09,.08,.08],[.35,.24,.15],[.5,.48,.46]],skin:[[.86,.66,.5],[.74,.53,.38],[.55,.38,.26],[.92,.74,.6]]};
function lookFor(shirt,hat,role,seed){const r=prng(seed||((shirt[0]*97+shirt[1]*31+shirt[2]*13+(role||'').length*7)*1000|0)+1);role=role||(hat===P.straw?'farm':hat===P.white?'port':'plain');
 const L={role,shirt,trous:WC.trous,skin:WC.skin[Math.floor(r()*4)],hair:WC.hair[Math.floor(r()*4)],stache:r()>.62,hat:null,vest:null,gloves:null,coat:false,apron:null,cuffs:r()>.4};
 if(role==='farm')L.hat={k:'straw',c:P.straw};
 if(role==='harvest'){L.hat={k:'cap',c:shade(shirt,.7)};L.gloves=WC.gloveH}
 if(role==='port'){L.hat={k:'hard',c:r()>.3?WC.hard:WC.hardW};L.vest=WC.vest;L.gloves=WC.glove;L.shirt=[.24,.38,.62]}
 if(role==='warehouse'){L.vest=WC.vestY;L.gloves=WC.glove;L.hat=r()>.5?{k:'hard',c:WC.hardW}:null}
 if(role==='qc'){L.coat=true;L.hat={k:'net',c:WC.net};L.gloves=WC.gloveB;L.shirt=[.55,.68,.82]}
 if(role==='store'){L.apron=[.2,.46,.32];L.hat={k:'cap',c:[.2,.46,.32]}}
 if(role==='shopper'){L.trous=WC.jeans;L.cuffs=false}
 return L}
/* body: hips, belt, torso, clothing layers, neck, head, face, hair and headwear */
function workerTorso(L){Tm(sc(WK,WK,WK),()=>{const T=(c,pr,y,dz)=>Tm(mul(tr(0,y||0,0),sc(1,1,dz||.62)),()=>lathe(c,pr,0,0,0,10));
 bb(L.trous,0,.84,0,.34,.17,.21);bb(WC.belt,0,.93,0,.35,.055,.22);bb(WC.refl,0,.935,.111,.05,.04,.006);
 T(L.shirt,[[.17,.98],[.185,1.12],[.215,1.3],[.23,1.38],[.2,1.45],[.07,1.5]]);for(const s of[-1,1])ball(L.shirt,s*.205,1.39,0,.072,1,8,4);
 for(const s of[-1,1])Tm(mul(tr(s*.045,1.47,.075),rZ(s*.5)),()=>box(L.shirt,0,0,0,.075,.03,.05));
 if(L.coat){T(L.shirt.map(c=>c*.95),[[.18,.98],[.2,1.2],[.235,1.39],[.21,1.46],[.08,1.5]],0,.66);T(WC.coat,[[.22,.55],[.205,.8],[.19,1],[.2,1.2],[.235,1.39],[.21,1.455],[.09,1.49]],0,.68);
  bb(shade(WC.coat,.85),0,.56,.15,.012,.9,.01);for(const y of[.75,.95,1.15])ball([.75,.76,.78],.025,y,.155,.012,1,5,3);bb([.35,.5,.75],.1,1.25,.145,.07,.08,.01)}
 if(L.vest){T(L.vest,[[.2,1.0],[.205,1.12],[.228,1.3],[.235,1.38],[.17,1.44]],0,.66);bb(L.shirt,0,1.0,.15,.06,.44,.02);for(const y of[1.1,1.2])T(WC.refl,[[.212,y],[.215,y+.035]],0,.665);
  for(const s of[-1,1])Tm(mul(tr(s*.13,1.42,.1),rZ(-s*.25)),()=>box(WC.refl,0,0,0,.03,.08,.03))}
 if(L.apron){bb(L.apron,0,.62,.13,.3,.66,.02);bb(L.apron,0,1.26,.135,.18,.18,.02);for(const s of[-1,1])Tm(mul(tr(s*.08,1.4,.11),rZ(s*.35)),()=>box(L.apron,0,0,0,.02,.12,.02))}
 if(!L.coat&&!L.vest)for(const y of[1.08,1.2,1.32])ball(shade(L.shirt,.7),0,y,.143,.009,1,4,2);
 cyl(L.skin,0,1.45,0,.05,.09,8);
 /* head: skull, jaw, ears, nose, eyes, brows, mouth, optional moustache */
 ball(L.skin,0,1.645,0,.108,1.17,10,6);ball(L.skin,0,1.585,.018,.085,.8,9,4);for(const s of[-1,1])ball(L.skin,s*.106,1.64,-.005,.022,1.3,6,3);
 bb(shade(L.skin,.92),0,1.605,.098,.022,.045,.03);for(const s of[-1,1]){ball([.12,.1,.09],s*.038,1.665,.093,.012,1,5,3);bb(L.hair,s*.04,1.69,.094,.04,.011,.012)}
 bb([.45,.22,.2],0,1.575,.095,.035,.008,.01);if(L.stache)bb(L.hair,0,1.588,.1,.06,.016,.016);
 ball(L.hair,0,1.675,-.012,.112,1.02,10,5);
 const h=L.hat;if(h){const y=1.7;
  if(h.k==='hard'){lathe(h.c,[[.128,0],[.124,.045],[.108,.095],[.07,.128],[0,.138]],0,y,0,12);Tm(mul(tr(0,y,.018),sc(1,1,1.1)),()=>cyl(h.c,0,0,0,.15,.014,14));bb(shade(h.c,.85),0,y+.12,0,.022,.025,.2)}
  else if(h.k==='cap'){lathe(h.c,[[.118,0],[.112,.05],[.08,.095],[0,.11]],0,y-.01,0,12);bb(h.c,0,y-.008,.13,.14,.014,.11)}
  else if(h.k==='straw'){lathe(h.c,[[.12,0],[.112,.07],[.08,.11],[0,.115]],0,y-.005,0,12);cyl(h.c,0,y-.005,0,.24,.014,16);cyl(shade(h.c,.7),0,y+.01,0,.122,.025,12)}
  else if(h.k==='net')lathe(h.c,[[.12,-.02],[.122,.04],[.09,.1],[0,.115]],0,y-.03,0,12)}})}
/* a leg hangs from the hip pivot at the origin: trouser leg, cuff, boot */
function workerLeg(L){Tm(sc(WK,WK,WK),()=>{lathe(L.trous,[[0,0],[.085,0],[.08,-.2],[.066,-.47],[.062,-.8],[.06,-.83],[0,-.83]],0,0,0,8);
 if(L.cuffs)cyl(shade(L.trous,.88),0,-.86,0,.066,.05,8);bb(WC.boot,0,-.94,.035,.11,.11,.25);bb(WC.boot,0,-.88,-.005,.1,.06,.13);bb(WC.sole,0,-.95,.035,.115,.02,.255)})}
/* an arm hangs from the shoulder pivot: sleeve (rolled at the elbow), forearm, hand with thumb, or glove */
function workerArm(L,sd){Tm(sc(WK,WK,WK),()=>{const sl=L.coat?WC.coat:L.shirt,long=L.coat;lathe(sl,[[0,.02],[.062,.02],[.058,-.15],[.05,-.3],[0,-.3]],0,0,0,8);
 if(long)lathe(sl,[[.05,-.3],[.046,-.48],[0,-.48]],0,0,0,8);else if(L.cuffs)cyl(shade(sl,.9),0,-.34,0,.056,.05,8);
 const fc=L.gloves&&!long?L.skin:L.skin;lathe(fc,[[.045,-.3],[.04,-.45],[.034,-.55],[0,-.55]],0,0,0,8);
 const hc=L.gloves||L.skin;if(L.gloves)cyl(hc,0,-.53,0,.04,.04,8);bb(hc,0,-.66,.004,.075,.11,.042);Tm(mul(tr(-sd*.04,-.58,.015),rZ(-sd*.5)),()=>box(hc,0,0,0,.022,.05,.025))})}
/* a standing worker in one mesh: arms relaxed */
function workerFull(L){workerTorso(L);for(const s of[-1,1]){Tm(tr(s*LEGX*WK,HIP*WK,0),()=>workerLeg(L));Tm(mul(tr(s*SHX*WK,SHY*WK,0),mul(rZ(s*.07),rX(-.08))),()=>workerArm(L,s))}}
/* a moving worker (when a rigged character model is loaded and the camera is close, the body draws that instead and the
   limb pieces hide; see engine/gltf.js). pose() returns {vis, p:[x,y,z], yaw, s, phase (walk cycle, radians), amt (0 still .. 1 walking),
   bend (0..1 lean to the ground), carry (0..1 both arms forward, holding something), reachL / reachR (0..1 one arm out)} */
function workerRig(k,pid,shirt,hat,role,pose){const st={M:I(),B:I(),q:{}},look=()=>lookFor(shirt,hat,role);
 const body=mover(k,pid,()=>workerTorso(look()),o=>{const q=pose()||{};st.q=q;o.vis=q.vis!==false;o.cq=q;o.cModel=charModelFor(look().role);o.charOn=!!o.cModel&&charNear(k);const s=q.s||1.35,amt=q.amt||0,b=Math.abs(Math.sin(q.phase||0))*.03*amt*s;
  /* on foot, everyone stands on the walking surface under them (floors and quays are raised above the ground) */
  const gy=q.base?0:groundAt(k,q.p[0],q.p[2]);st.M=q.base?mul(q.base,mul(tr(0,q.seat[0],q.seat[1]),sc(q.seat[2],q.seat[2],q.seat[2]))):trs(q.p[0],q.p[1]+gy+b,q.p[2],q.yaw||0,s);if(q.base)q.p=[q.base[12],q.base[13],q.base[14]];const hy=HIP*WK;st.B=mul(st.M,mul(tr(0,hy,0),mul(rX((q.bend||0)*.85),tr(0,-hy,0))));o.m=o.charOn?st.M:st.B;o.p=q.p});
 body.arms=[];
 for(const sd of[-1,1]){
  mover(k,pid,()=>workerLeg(look()),o=>{const q=st.q;o.vis=q.vis!==false&&!body.charOn;const sw=q.sit?-1.45:Math.sin((q.phase||0)+(sd>0?0:Math.PI))*.5*(q.amt||0)-(q.bend||0)*.25;o.m=mul(st.M,mul(tr(sd*LEGX*WK,HIP*WK,0),rX(sw)));o.p=q.p});
  body.arms.push(mover(k,pid,()=>workerArm(look(),sd),o=>{const q=st.q;o.vis=q.vis!==false&&!body.charOn;let a=Math.sin((q.phase||0)+(sd>0?Math.PI:0))*.45*(q.amt||0);a=lerp(a,-1.05,q.carry||0);a=lerp(a,-1.3,(sd<0?q.reachL:q.reachR)||0);a-=(q.bend||0)*.6;if(q.sit)a=-1.05;
   o.m=mul(st.B,mul(tr(sd*SHX*WK,SHY*WK,0),mul(rZ(sd*(.07+(q.carry||0)*.25)),rX(a))));o.p=q.p}))}
 /* where this worker's hands are, in the world (left, right): the loaded character's palms (pose from the last frame drawn, placed
    with the worker's current position), else the built-in arms */
 body.hands=()=>body.charOn&&body.cHandsL?body.cHandsL.map(h=>xp(body.m,h)):body.arms.map(a=>xp(a.m,[0,-.62*WK,.02]));
 return body}
/* a seated driver on a forklift: rides with the forklift's matrix, on its seat, and shares its id so they highlight and click together */
function forkliftOperator(k,fk,role){const r=1.35/1.15;return workerRig(k,fk.pid,[.24,.38,.62],null,role,()=>({vis:fk.vis,base:fk.m,seat:[1.78-HIP*WK*r,-.58,r],sit:1,p:[0,0,0]}))}
