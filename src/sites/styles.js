'use strict';
/* ================= visual styles =================
   One place that defines each 3D visual style: its palette and how it is lit.
   Sites and moving objects are built once per style from the same code (see build.js); the globe, map,
   routes, camera, stages and animation are shared. Material tag .m on a colour: 3 metal, 4 glass. */
const metal=c=>{c.m=3;return c},glassy=c=>{c.m=4;return c},mk=(m,c)=>{c.m=m;return c};
/* cartoon surfaces carry a texture code for the shader: 6 foliage, 7 grass, 8 soil, 9 wood, 10 stone/concrete, 11 roof tiles */
const PALETTES={
 cartoon:{grass:mk(7,[.38,.55,.25]),grass2:mk(7,[.31,.48,.21]),soil:mk(8,[.50,.36,.25]),soilD:mk(8,[.37,.26,.19]),bed:mk(8,[.42,.30,.21]),path:mk(10,[.74,.67,.54]),leaf:mk(6,[.19,.40,.18]),leaf2:mk(6,[.27,.50,.22]),leaf3:mk(6,[.36,.57,.26]),trunk:mk(9,[.40,.30,.22]),
 tile:mk(11,[.66,.36,.27]),wall:[.88,.82,.70],wood:mk(9,[.60,.45,.30]),conc:mk(10,[.70,.70,.68]),concD:mk(10,[.55,.56,.56]),asph:mk(10,[.30,.31,.34]),water:[.27,.56,.74],waterD:[.17,.38,.55],
 melY:[.93,.80,.34],melG:[.56,.70,.40],white:[.92,.92,.90],steel:[.60,.64,.68],dark:[.20,.22,.26],tyre:[.12,.12,.14],glass:glassy([.34,.48,.58]),skin:[.84,.65,.50],straw:[.86,.74,.46],
 red:[.72,.30,.25],blue:[.24,.42,.62],orange:[.86,.52,.22],green:[.26,.50,.38],teal:[.22,.52,.56],yel:[.88,.72,.26],card:[.76,.62,.44],card2:[.70,.55,.38],crate:[.74,.58,.38],
 hull:[.17,.24,.35],hullR:[.62,.25,.21],brick:mk(10,[.62,.38,.30]),table:[.33,.34,.38],floor:mk(10,[.80,.80,.78]),chalk:mk(10,[.90,.90,.87])},
 /* industrial: muted green ground (#77966A), concrete (#A5A9A4), light grey walls (#D9DFDC), slate roofs (#64747B), plant green (#4F8654),
    asphalt (#555F63). Values sit a little under those colours because sunlight and tone mapping lift them on screen. */
 industrial:{grass:[.27,.375,.235],grass2:[.245,.35,.22],soil:[.46,.36,.28],soilD:[.35,.27,.21],bed:[.40,.31,.24],path:[.46,.47,.46],leaf:[.26,.46,.28],leaf2:[.32,.53,.32],leaf3:[.39,.59,.36],trunk:[.40,.31,.24],
  tile:metal([.19,.235,.25]),wall:[.86,.89,.88],wood:[.62,.50,.36],conc:[.40,.415,.40],concD:[.32,.335,.335],asph:[.15,.175,.185],water:[.20,.38,.50],waterD:[.14,.28,.40],
  melY:[.92,.76,.30],melG:[.56,.70,.40],white:metal([.86,.88,.88]),steel:metal([.56,.60,.64]),dark:metal([.20,.22,.25]),tyre:[.09,.09,.10],glass:glassy([.30,.44,.54]),skin:[.80,.62,.48],straw:[.92,.78,.12],
  red:metal([.72,.30,.26]),blue:metal([.24,.44,.66]),orange:metal([.86,.50,.22]),green:metal([.28,.54,.40]),teal:metal([.26,.56,.58]),yel:metal([.90,.70,.20]),card:[.72,.60,.44],card2:[.66,.54,.39],crate:[.24,.40,.62],
  hull:metal([.16,.22,.32]),hullR:metal([.58,.24,.20]),brick:[.50,.60,.54],table:metal([.50,.52,.55]),floor:[.45,.46,.46],chalk:[.72,.75,.75]}};
const STYLES={cartoon:{label:'Cartoon',apron:[mk(7,[.42,.58,.29]),mk(7,[.39,.55,.30])]},industrial:{label:'Industrial',apron:[[.28,.385,.245],[.27,.375,.245]]}};
let STYLE='industrial';try{const s=localStorage.getItem('ffts.style.v2');if(STYLES[s])STYLE=s}catch(e){}
/* ?style=industrial in the address opens a style directly, without changing the saved choice */
try{const q=new URLSearchParams(location.search).get('style');if(STYLES[q])STYLE=q}catch(e){}
/* build-time state: which style the geometry builders are currently producing */
let BUILD='cartoon',IND=false,P=PALETTES.cartoon,CC=[];
function setBuild(name){BUILD=name;IND=name==='industrial';P=PALETTES[name];CC=[P.red,P.blue,P.orange,P.green,P.teal,P.yel,P.white]}
setBuild('cartoon');
