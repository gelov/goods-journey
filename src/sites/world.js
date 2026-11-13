'use strict';
/* ================= build the sites ================= */
function apron(k){const S=SITES[k],cx=S.c[0],cz=S.c[1],r=S.r1+30,z0=cz-r,z1=cz+r;const land=(a,b)=>{C=STYLES[BUILD].apron[k<2?0:1];MAT=0;Q([a,-.03,z1],[b,-.03,z1],[b,-.03,z0],[a,-.03,z0],[0,1,0])},sea=(a,b)=>{C=P.water;MAT=1;Q([a,-1.5,z1],[b,-1.5,z1],[b,-1.5,z0],[a,-1.5,z0],[0,1,0]);MAT=0};
 if(!S.sea)land(cx-r,cx+r);else if(S.sea[1]>0){land(cx-r,S.sea[0]);sea(S.sea[0],cx+r)}else{sea(cx-r,S.sea[0]);land(S.sea[0],cx+r)}}
function patch(x0,z0,x1,z1,c){bb(P.bed,(x0+x1)/2,0,(z0+z1)/2,x1-x0,.12,z1-z0);SW=.3;for(let x=x0+2;x<x1-1;x+=4)bb(c,x,.12,(z0+z1)/2,1.7,.55,z1-z0-3);SW=0}
function scatter(k,n,fn,ok){const S=SITES[k];for(let i=0;i<n;i++){const a=R()*TAU,r=40+R()*(S.r1-30),x=S.c[0]+Math.cos(a)*r,z=S.c[1]+Math.sin(a)*r;if(Math.abs(z-35)<6||!ok(x,z))continue;fn(x,z,.8+R()*.5)}}
const stripes=(x0,x1,z)=>{for(let x=x0;x<x1;x+=6)bb(P.white,x,.14,z,2.4,.02,.18)};
function buildWorld(){R=prng(7);
 site(0);apron(0);
/* ---------- 01 farm ---------- */
 const yel=ent('Melon field · yellow melons',0,'Rows of melon plants. Harvest information is recorded field by field.',()=>plot(-226,2,-204.5,29,0));
 ent('Melon field · green melons',0,'A second variety grown alongside.',()=>plot(-199.5,2,-177,29,1));
 road([[-229,-1],[-150,-1]],3,P.path);road([[-202,-1],[-202,33]],3,P.path);road([[-175,-1],[-175,33]],3,P.path);
 ent('Farmhouse hill',0,'The farm buildings sit on a terraced rise above the fields.',()=>{mound(-196,-23,19,3,P.soil,P.grass);Tp(0,4.5,0,0,1,()=>house(-199,-25,.5,7,5.5,4,P.wall,P.tile));cyl(P.steel,-190,4.5,-28,1.6,4.2,10);lathe(P.concD,[[1.7,0],[0,1.3]],-190,8.7,-28,10);Tp(0,3,0,0,1,()=>{for(const[a,b]of[[-205,-30],[-192,-33],[-186,-22]])tree(a,b,.9)});Tp(0,4.5,0,0,1,()=>plot(-200,-19,-190,-13,2,2.6,2.4))});
 ent('Young crop terrace',0,'Seedlings on a smaller terrace. Fertiliser usage is logged as the crop develops.',()=>{mound(-221,-12,10,2,P.soil,P.grass,3);for(let k=0;k<7;k++){const a=k/7*TAU;plant(-221+Math.cos(a)*3.6,-12+Math.sin(a)*3.6,2)}});
 ent('Farm cottages',0,'Homes and stores at the edge of the farm.',()=>{house(-224,-36,.1,6,5,3.4,P.wall,P.tile);house(-214,-37,-.1,6,5,3.4,P.wall,P.tile);house(-204,-38.5,.05,5.5,4.6,3.2,P.wood,P.tile)});
 for(let k=0;k<9;k++)(k%3?tree:palm)(-229+k*3.2+R(),-41+R()*2,.9+R()*.3);for(let k=0;k<7;k++)palm(-229+R()*1.5,-28+k*9,.8+R()*.3);
 ent('Growing tunnels',0,'Covered tunnels for young plants.',()=>{for(const z0 of[-20,-11]){bb(P.bed,-166,0,z0,16,.15,6);for(let x=-173;x<=-159;x+=3.5)for(let k=0;k<8;k++){const a=Math.PI*(k+.5)/8;Tm(mul(tr(x+0,3*Math.sin(a),z0+3*Math.cos(a)),rX(-a-Math.PI/2+Math.PI/2)),()=>box([.62,.74,.92],0,0,0,.2,.2,1.25))}for(const k of[.5,1.57,2.64])bb([.7,.8,.95],-166,3*Math.sin(k)-.08,z0+3*Math.cos(k),15,.14,.14);for(let x=-172;x<-160;x+=2.6)plant(x,z0,2)}});
 ent('Weather station',0,'Measures local weather conditions on the farm.',()=>{cyl(P.steel,-186,0,-6,.14,6,6);bb(P.white,-186,3,-6,.9,1.1,.7);Tm(mul(tr(-186,4.6,-5.4),rX(-.6)),()=>box(P.dark,0,0,0,1.5,.08,1));bb(P.steel,-186,5.6,-6,1.8,.1,.1)});
 ent('Fertiliser store',0,'Where fertiliser is kept. Usage is one of the farm records.',()=>{cyl(P.green,-156,0,-30,2.2,4.2,12);lathe(shade(P.green,.85),[[2.2,0],[0,1]],-156,4.2,-30,12);cyl(P.green,-151,0,-31,1.6,3.2,10);bb(P.wood,-161,0,-33,4,2.6,3.2);roof(P.tile,-161,2.6,-33,5,1.4,4)});
 for(let k=0;k<6;k++)lamp(-228+k*13,31.5,4);
 /* fence */ for(let x=-228;x<-152;x+=3){bb(P.wood,x,0,-3.4,.22,1.1,.22)}bb(P.wood,-190,.75,-3.4,76,.14,.1);

 
/* ---------- 02 harvest & collection ---------- */
 ent('Harvest plot',1,'Ripe melons are cut by hand and placed in crates between the rows.',()=>{plot(-171,3,-151,26,0,3.2,2.5);for(const[a,b,f]of[[-166.4,8,1],[-159.9,14,1],[-166.4,20,0],[-153.6,22,1]])crate(a,0,b,f)});
 ent('Collection & packing shed',1,'Crates are gathered here, checked and packed for the road.',()=>{bb(P.conc,-138,0,10,18,.2,13);for(const x of[-146,-130])for(const z of[4.5,15.5])bb(P.wood,x,0,z,.5,5,.5);Tp(-138,5,10,Math.PI/2,1,()=>roof(P.tile,0,0,0,14,2.4,19));bb(P.table,-141,0,8,6,1.1,2);bb(P.table,-141,0,13,6,1.1,2);for(let k=0;k<3;k++){crate(-143+k*2,1.1,8,1);crate(-143+k*2,1.1,13,k!==1)}for(let k=0;k<3;k++)for(let l=0;l<2+k%2;l++)crate(-133,.2+l*.95,5.5+k*1.4,l===1+k%2)});
 ent('Crate conveyor',1,'Packed crates roll from the shed to the lorry.',()=>{bb(P.steel,-128.5,.7,21,1.6,.2,13);for(let z=15;z<=27;z+=2){bb(P.dark,-129.2,0,z,.14,.7,.14);bb(P.dark,-127.8,0,z,.14,.7,.14)}});
 bb(P.concD,-126,0,30.5,16,.12,5);
 ent('Farm pond',1,'Water for the farm.',()=>{MAT=1;cyl(P.water,-140,.02,-22,7,.12,20);MAT=0;lathe(P.path,[[7,.02],[8,.16],[8.3,.02]],-140,0,-22,20)});
 for(const[a,b]of[[-150,-12],[-131,-14],[-126,-28],[-118,-8],[-146,-36],[-120,-38],[-116,10],[-113,-24]])(R()>.5?palm:tree)(a,b,.9+R()*.4);
 guy(-143.5,10.5,1.6,P.orange,P.straw);guy(-139,6.2,3.1,P.blue,P.straw);

 
 road([[-345,36],[5,36]],5);stripes(-340,0,36);
 ent('Surrounding farmland',0,'Neighbouring fields around the farm.',()=>{for(const[a,b,c,d,e]of[[-250,-100,-196,-56,P.leaf3],[-186,-104,-122,-60,P.leaf],[-112,-92,-58,-52,P.leaf2],[-262,46,-204,92,P.leaf2],[-194,48,-130,96,P.leaf3],[-120,46,-64,88,P.leaf],[-300,-34,-244,22,P.leaf],[-98,-34,-44,22,P.leaf3]])patch(a,b,c,d,e)});
 scatter(0,70,(x,z,s)=>(R()>.5?palm:tree)(x,z,s),(x,z)=>!(x>-236&&x<-108&&z>-46&&z<46)&&!(z<-48&&z>-106&&x>-252&&x<-56)&&!(z>44&&z<98&&x>-264&&x<-62)&&!(x<-242&&z>-36&&z<24)&&!(x>-100&&z>-36&&z<24)&&!(IND&&x>-113&&x<-97&&z>-28&&z<8));
 if(IND)extrasI(0);

 site(1);apron(1);
/* ---------- 03 export port ---------- */
 ent('Export quay',2,CONFIG.brPort+'.',()=>{bb(P.conc,-91,0,2,42,.25,78);bb(P.concD,-70.6,-2.2,2,1.2,2.4,78);for(let z=-34;z<40;z+=6)bb(P.yel,-71.6,.26,z,.5,.02,3);for(let z=-30;z<=38;z+=17)cyl(P.dark,-71.2,.25,z,.4,.6,8)});
 ent('Container yard',2,'Containers wait here for loading. Each one is listed on the shipping manifest.',()=>{const r=prng(11);for(let i=0;i<3;i++)for(let j=0;j<4;j++){const n=1+Math.floor(r()*3);for(let k=0;k<n;k++)cont(CC[Math.floor(r()*6)],-108+i*3.4,.25+k*2.6,-31+j*9.2)}});
 ent('Port office',2,'Where the shipping manifest and export documentation are prepared.',()=>{bb(P.white,-105,.25,27,9,5,7);bb(P.glass,-105,2.4,30.52,7.5,1.6,.06);bb(P.concD,-105,5.25,27,9.6,.4,7.6);cyl(P.steel,-108,5.6,25,.08,3,5)});
 ent('Quay crane',2,'Lifts containers from the quay onto the vessel.',()=>crane(-73,-10,1,P.orange));
 for(let k=0;k<4;k++)lamp(-112+.5,-30+k*20,7);

 
 road([[-300,36],[-92,36]],5);road([[-92,36],[-92,20]],5);stripes(-296,-98,36);
 ent('Port warehouses',2,'Sheds where cargo is held before loading.',()=>{for(const z of[-18,10]){bb(P.white,-134,0,z,18,6,22);roof(P.blue,-134,6,z,19,2.6,23);bb(P.dark,-124.96,0,z,.1,4.2,8)}});
 ent('Container trucks',2,'Trucks that shuttle containers around the terminal.',()=>{for(const z of[4,10])Tp(-100,.25,z,Math.PI/2,1,()=>lorry(P.white,z>5?P.teal:P.orange,shade(z>5?P.teal:P.orange,.8)))});
 guy(-82,6,1,P.yel,P.white);guy(-78,-22,2.5,P.orange,P.white);guy(-96,20,0,P.yel,P.white);
 for(const[a,b]of[[-40,-40],[10,-60],[-20,60],[40,10]]){cyl(P.red,a,-1.9,b,.5,1.3,8);ball(P.white,a,-.3,b,.35,1,6,3)}
 scatter(1,45,(x,z,s)=>(R()>.4?palm:tree)(x,z,s),(x,z)=>x<-116&&!(x>-146&&x<-122&&z>-32&&z<24));

 if(IND)extrasI(1);
 site(2);apron(2);
/* ---------- 05 UK port ---------- */
 ent('UK quay',4,CONFIG.ukPort+'.',()=>{bb(P.conc,93,0,2,46,.25,78);bb(P.concD,70.6,-2.2,2,1.2,2.4,78);for(let z=-34;z<40;z+=6)bb(P.yel,71.6,.26,z,.5,.02,3);for(let z=-30;z<=38;z+=17)cyl(P.dark,71.2,.25,z,.4,.6,8)});
 ent('Arrivals container stack',4,'Containers lifted off the vessel wait here until customs is processed.',()=>{const r=prng(5);for(let i=0;i<3;i++)for(let j=0;j<2;j++){const n=1+Math.floor(r()*2.5);for(let k=0;k<n;k++)cont(CC[Math.floor(r()*6)],86+i*3.4,.25+k*2.6,-33+j*9.2)}});
 ent('Customs office',4,'Customs declarations are processed through the Customs Declaration Service (CDS) before goods enter the UK.',()=>{bb(P.brick,107,.25,-27,11,5.5,8);bb(P.glass,107,2.6,-22.98,9,1.6,.06);bb(P.dark,107,5.75,-27,11.8,.4,8.8);bb(P.blue,107,6.15,-23.4,6,1.5,.3);for(const z of[-19.5,-14]){bb(P.white,101.5,.25,z,.4,1.4,.4)}MAT=2;bb([.4,.95,.55],101.5,1.75,-19.5,.5,.5,.5);MAT=0;bb(P.red,104.6,1.3,-19.5,6,.18,.18)});
 ent('Quay crane',4,'Lifts containers off the vessel.',()=>crane(73,-14,-1,P.blue));
 for(let k=0;k<4;k++)lamp(115.5,-30+k*17,7);

 
/* ---------- 06 unloading ---------- */
 ent('Open container',5,'One container holds many pallets. Each pallet is stacked with boxes of melons.',()=>{Tp(96,.25,16,Math.PI/2,1,()=>{const c=P.teal,d=shade(c,.8);bb(P.dark,0,0,0,2.4,.5,8.4);for(const z of[-2.6,2.6])for(const x of[-1.1,1.1])wheelX(x,.1,z,.5,.4);bb(c,0,.5,0,2.6,.16,8);bb(c,-1.24,.66,0,.12,2.5,8);bb(c,0,.66,-3.94,2.6,2.5,.12);bb(c,0,3.1,-1.9,2.6,.12,4.2);for(let k=0;k<5;k++)bb(d,-1.3,.8,-3.5+k*1.7,.14,2.2,.2);for(let k=0;k<3;k++)pallet(0,.66,-2.7+k*2.5,2,k===2)})});
 ent('Unloaded pallets',5,'Pallets set down beside the container, counted before they move on.',()=>{for(let k=0;k<3;k++)pallet(103+k*3,.25,22.5,2+k%2,k===1)});
 guy(101,12.5,2.4,P.yel,P.white);

 
 road([[100,34],[300,34]],5);road([[113,20],[113,34]],5);stripes(120,296,34);bb(P.concD,113,.26,13,5.4,.05,13);
 ent('Port shed',4,'Covered storage beside the terminal.',()=>{bb(P.white,146,0,-16,20,6,26);roof(P.blue,146,6,-16,21,2.6,27)});
 guy(84,4,4,P.yel,P.white);guy(98,-8,1,P.orange,P.white);
 for(const[a,b]of[[30,-36],[-10,50],[40,-70]]){cyl(P.red,a,-1.9,b,.5,1.3,8);ball(P.white,a,-.3,b,.35,1,6,3)}
 for(let k=0;k<5;k++)house(170+k*10,-42,0,7,6,4.4,P.brick,P.dark);
 scatter(2,45,(x,z,s)=>(R()>.45?conifer:tree)(x,z,s),(x,z)=>x>120&&!(x>132&&x<160&&z>-34&&z<2)&&!(x>162&&x<218&&z>-50&&z<-34));

 if(IND)extrasI(2);
 site(3);apron(3);
/* ---------- 07 warehouse ---------- */
 ent('Warehouse',6,'Shown without its roof so you can see inside.',()=>{bb(P.floor,146,.02,0,44,.25,48);bb(P.white,146,.25,-24,44.6,7,.6);bb(P.white,124,.25,-7.5,.6,5,33.6);bb(P.white,124,.25,22.6,.6,5,3.4);bb(P.white,124,4.2,16,.6,1.05,10);bb(P.white,168,.25,-14,.6,5,20.6);bb(P.white,168,.25,19.5,.6,5,9.6);bb(P.white,168,4.2,5.5,.6,1.05,19);bb(P.white,134,.25,24,20.6,1.3,.6);bb(P.white,163,.25,24,10.6,1.3,.6);bb(P.blue,146,6.2,-23.6,44.6,1,.3);for(const x of[135,146,157])bb(P.steel,x,7.25,-12,.3,.3,24.6)});
 ent('Pallet racking',6,'Storage racking along the back wall.',()=>{for(let x=127;x<=165;x+=4.75)bb(P.blue,x,.25,-21,.3,6.2,2.6);for(const y of[2.3,4.4])bb(P.orange,146,y,-21,38.3,.2,2.6);const r=prng(9);for(let i=0;i<8;i++)for(const y of[.25,2.5,4.6])if(r()>.25)pallet(129.4+i*4.75,y,-21,y>4?1:2)});
 const zone=(nm,c,x,note,n)=>ent(nm,6,note,()=>{bb(c,x,.27,-4,10,.04,13);bb(P.white,x,.3,-10.3,10,.02,.25);for(let k=0;k<n;k++)pallet(x-2.4+(k%2)*4.8,.3,-7.5+Math.floor(k/2)*4.4,2,false,c)});
 const Z=[[.42,.68,.95],[.97,.72,.3],[.5,.85,.56]];
 zone('QC bay A',shade(Z[0],.9),134,'Pallets the pick list has allocated to QC location A.',3);zone('QC bay B',shade(Z[1],.9),146,'Pallets the pick list has allocated to QC location B.',2);zone('Storage area',shade(Z[2],.9),158,'Pallets allocated to warehouse storage.',4);
 ent('Intake area',6,'Pallets arrive here from the port and wait for the pick list.',()=>{bb(P.yel,131,.27,15.5,11,.04,.3);bb(P.yel,131,.27,21,11,.04,.3);pallet(128,.27,18.3,2);pallet(134,.27,18.3,3)});
 ent('Prometheus terminal',6,'The warehouse screen where the Prometheus pick list is read.',()=>{bb(P.table,141,.25,19,3,1.1,1.4);bb(P.dark,141,1.4,19,1.6,1.1,.12);MAT=2;bb([.5,.85,1],141,1.5,19.08,1.4,.9,.04);MAT=0});
 guy(141,17,3.14,P.blue,null);

 
/* ---------- 08 QC ---------- */
 ent('Quality control room',7,'A dedicated inspection area beside the warehouse.',()=>{bb(P.chalk,179,.02,8,20,.25,30);bb(P.white,179,.25,-7,20.6,5,.6);bb(P.white,189,.25,8,.6,3.2,30.6);bb(P.white,179,.25,23,20.6,1.3,.6);bb(P.green,179,4.4,-6.6,20.6,.8,.3)});
 const tbl=(nm,x,good)=>ent(nm,7,good?'Fruit on this table has passed inspection.':'Damaged fruit found on this table. This result leads to a claim.',()=>{bb(P.steel,x,1.25,8,6,.2,2.6);for(const a of[-2.7,2.7])for(const b of[-1,1])bb(P.steel,x+a,.25,8+b,.16,1,.16);bb(P.card,x-1.8,1.45,8,1.6,.6,1.3);for(const i of[-.4,.4])ball(P.melY,x-1.8+i,2.05,8,.4,.9,6,3);for(let k=0;k<3;k++)ball(good||k<2?P.melG:[.55,.42,.25],x+.4+k*.95,1.85,8.5,.42,.9,6,3);cyl(P.dark,x+2.4,1.45,7.4,.08,1.6,5);MAT=2;ball(good?[.4,.95,.55]:[1,.38,.3],x+2.4,3.25,7.4,.34,1,6,3);MAT=0});
 tbl('Inspection table 1',174.5,true);tbl('Inspection table 2',183.5,false);
 ent('Pallets awaiting inspection',7,'Pallets brought from the QC bays for checking.',()=>{pallet(173,.27,17,2,true);pallet(177,.27,17,2,false);pallet(184,.27,17,3,false)});
 ent('Rejected fruit',7,'Fruit judged damaged or unsuitable is set aside.',()=>{bb(P.red,186,.27,0,3.4,.9,2.6);for(let k=0;k<4;k++)ball([.6,.46,.27],185+k*.7,1.2,0+(k%2)*.5-.2,.42,.9,6,3)});

 
 ent('Sorting conveyor',7,'Melons pass along the conveyor on their way to the inspection tables.',()=>{bb(P.steel,179,1,13,15,.22,1.5);for(let x=172.5;x<=185.5;x+=3.25){bb(P.dark,x,0,12.4,.14,1,.14);bb(P.dark,x,0,13.6,.14,1,.14)}});
/* ---------- 09 claims ---------- */
 ent('Claims office',8,'Claims are raised here from QC reports and sent back to the grower or originator.',()=>{bb(P.white,180,0,-24,12,7,9);for(const y of[1.6,4.6])bb(P.glass,180,y,-19.48,10.4,1.5,.06);bb(P.dark,180,7,-24,12.6,.4,9.6);cyl(P.steel,184,7.4,-26,.1,4,5);Tm(mul(tr(177,9.3,-24),rX(-.25)),()=>{box(P.white,0,0,0,3,3.8,.2);for(let k=0;k<4;k++)box(k?P.steel:P.red,-.2+(k?0:-.5),1.1-k*.7,.12,k?2:1,.2,.04)})});
 road([[178,-19],[178,-8]],2.6,P.path);

 
 road([[20,34],[300,34]],5);road([[150,34],[150,32]],5);stripes(24,296,34);bb(P.concD,151,.02,29.5,24,.12,5);
 for(let k=0;k<7;k++)lamp(100+k*17,38,6);
 scatter(3,60,(x,z,s)=>(R()>.45?conifer:tree)(x,z,s),(x,z)=>!(x>118&&x<194&&z>-34&&z<30));

 if(IND)extrasI(3);
 site(4);apron(4);
/* ---------- 10 supermarket ---------- */
 ent('Supermarket',9,'Shown open at the front so the shop floor is visible.',()=>{bb(P.floor,223,.02,2,34,.25,40);bb(P.white,223,.25,-18,34.6,8,.6);bb(P.white,206,.25,-9,.6,5,18.6);bb(P.white,206,.25,16,.6,5,12.6);bb(P.white,206,4.2,5,.6,1.05,10);bb(P.white,240,.25,2,.6,5,40.6);bb(P.green,223,7.4,-17.6,34.6,2.2,.4);MAT=2;ball(P.melY,214,8.5,-17.2,.9,.9,8,4);MAT=0;bb(P.white,214,.25,22,15.6,1,.6);bb(P.white,234,.25,22,11.6,1,.6)});
 ent('Shelving',9,'Shelves of produce.',()=>{for(let i=0;i<3;i++){const x=214+i*8.5;bb(P.white,x,.25,-11,5.6,3.4,1.4);for(let l=0;l<3;l++){bb(P.steel,x,1+l*1.05,-10.25,5.6,.1,1.2);for(let k=0;k<6;k++)ball([P.red,P.orange,P.leaf3,P.yel][(k+l+i)%4],x-2.3+k*.92,1.35+l*1.05,-10.1,.3,1,5,3)}}});
 ent('Melon display',9,'The end of the journey: melons on display for shoppers.',()=>{for(const[x,z]of[[219,8],[226,8]]){bb(P.wood,x,.25,z,5,1.1,3.4);bb(P.green,x,1.35,z,5.2,.12,3.6);for(let l=0;l<3;l++)for(let i=0;i<5-l;i++)for(let k=0;k<3-l;k++)ball((i+k+l)%3?P.melY:P.melG,x-1.9+l*.48+i*.95,1.85+l*.72,z-.95+l*.48+k*.95,.48,.9,6,3)}});
 ent('Checkout',9,'Where the shopper pays.',()=>{for(const x of[232,236]){bb(P.table,x,.25,14,1.4,1.1,4);bb(P.dark,x,1.35,15.4,.9,.9,.1)}});
 ent('Delivery bay',9,'Accepted melons arrive here by lorry.',()=>{bb(P.concD,200,.03,14,7,.12,10);pallet(203.6,.15,10,2,true)});
 guy(233.2,13,1.6,P.green,null);guy(216,-6.5,2.8,P.orange,null);
 /* cars */ for(const[x,c]of[[213,P.red],[222,P.blue],[229,P.white]]){bb(c,x,.45,28,2,.9,4.2);bb(P.glass,x,1.3,27.8,1.8,.8,2.2);for(const z of[26.6,29.4])for(const a of[-1,1])wheelX(x+a,.4,z,.4,.3)}
 ent('Houses',9,'The neighbourhood the supermarket serves.',()=>{for(let k=0;k<4;k++)house(204+k*9.5,-34,0,7,6,4.4,P.brick,P.dark)});

 road([[110,34],[335,34]],5);road([[200,34],[200,12]],5);stripes(114,330,34);
 for(let k=0;k<6;k++)lamp(190+k*12,38,6);for(let x=196;x<250;x+=2.6)ball(P.leaf,x,.5,42.5,1.1,.7,6,3);
 ent('More houses',9,'Homes around the store.',()=>{for(let k=0;k<4;k++)house(252+k*9.5,-12-k*4,-.3,7,6,4.4,P.brick,P.dark)});
 scatter(4,50,(x,z,s)=>(R()>.45?conifer:tree)(x,z,s),(x,z)=>!(x>196&&x<246&&z>-42&&z<32)&&!(x>246&&x<292&&z>-34&&z<-4));
 if(IND)extrasI(4);
}
