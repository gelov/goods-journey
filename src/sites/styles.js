'use strict';
/* ================= visual styles =================
   One place that defines each 3D visual style: its palette and how it is lit.
   Sites and moving objects are built once per style from the same code (see build.js); the globe, map,
   routes, camera, stages and animation are shared. Material tag .m on a colour: 3 metal, 4 glass. */
const metal=c=>{c.m=3;return c},glassy=c=>{c.m=4;return c};
const PALETTES={
 cartoon:{grass:[.47,.70,.33],grass2:[.40,.63,.29],soil:[.58,.39,.26],soilD:[.44,.29,.20],bed:[.50,.33,.22],path:[.84,.75,.59],leaf:[.20,.47,.22],leaf2:[.30,.58,.27],leaf3:[.38,.66,.30],trunk:[.50,.36,.25],
 tile:[.82,.45,.32],wall:[.90,.80,.64],wood:[.72,.54,.36],conc:[.74,.74,.73],concD:[.60,.61,.62],asph:[.38,.39,.43],water:[.27,.56,.74],waterD:[.17,.38,.55],
 melY:[.97,.83,.33],melG:[.66,.80,.44],white:[.95,.95,.93],steel:[.64,.68,.73],dark:[.20,.22,.26],tyre:[.13,.13,.15],glass:[.36,.52,.64],skin:[.86,.66,.50],straw:[.90,.78,.48],
 red:[.83,.33,.28],blue:[.25,.48,.74],orange:[.94,.58,.22],green:[.28,.60,.46],teal:[.22,.62,.66],yel:[.95,.78,.26],card:[.80,.65,.46],card2:[.74,.58,.40],crate:[.86,.68,.42],
 hull:[.17,.24,.37],hullR:[.70,.26,.22],brick:[.72,.42,.33],table:[.33,.34,.38],floor:[.84,.84,.82],chalk:[.93,.93,.90]},
 industrial:{grass:[.36,.44,.26],grass2:[.33,.41,.25],soil:[.42,.33,.25],soilD:[.32,.25,.19],bed:[.30,.23,.17],path:[.56,.53,.47],leaf:[.16,.31,.16],leaf2:[.22,.38,.19],leaf3:[.27,.43,.21],trunk:[.34,.27,.21],
  tile:metal([.46,.30,.25]),wall:metal([.74,.75,.74]),wood:[.52,.41,.30],conc:[.60,.60,.59],concD:[.46,.47,.48],asph:[.17,.175,.19],water:[.10,.26,.36],waterD:[.06,.16,.24],
  melY:[.86,.72,.28],melG:[.50,.62,.34],white:metal([.84,.85,.85]),steel:metal([.52,.55,.59]),dark:metal([.12,.13,.15]),tyre:[.07,.07,.08],glass:glassy([.16,.24,.30]),skin:[.80,.62,.48],straw:[.92,.78,.12],
  red:metal([.60,.19,.16]),blue:metal([.14,.28,.47]),orange:metal([.78,.40,.11]),green:metal([.17,.38,.29]),teal:metal([.13,.38,.42]),yel:metal([.84,.64,.10]),card:[.64,.52,.38],card2:[.58,.46,.33],crate:[.16,.30,.50],
  hull:metal([.09,.12,.17]),hullR:metal([.42,.15,.13]),brick:[.46,.29,.24],table:metal([.40,.42,.45]),floor:[.55,.56,.57],chalk:[.74,.76,.78]}};
const STYLES={cartoon:{label:'Cartoon',apron:[[.60,.79,.47],[.56,.75,.45]]},industrial:{label:'Industrial',apron:[[.50,.58,.38],[.47,.56,.38]]}};
let STYLE='cartoon';try{const s=localStorage.getItem('ffts.style');if(STYLES[s])STYLE=s}catch(e){}
/* ?style=industrial in the address opens a style directly, without changing the saved choice */
try{const q=new URLSearchParams(location.search).get('style');if(STYLES[q])STYLE=q}catch(e){}
/* build-time state: which style the geometry builders are currently producing */
let BUILD='cartoon',IND=false,P=PALETTES.cartoon,CC=[];
function setBuild(name){BUILD=name;IND=name==='industrial';P=PALETTES[name];CC=[P.red,P.blue,P.orange,P.green,P.teal,P.yel,P.white]}
setBuild('cartoon');
