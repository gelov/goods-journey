'use strict';
/* ================= tweens ================= */
const TW=[];let NOW=performance.now(),T=0;
function tween(o,k,to,ms,ease,done){cancel(o,k);TW.push({o,k,from:o[k],to,dur:Math.max(1,ms*MOTION),t0:NOW,ease:ease||io,done,alive:true})}
function cancel(o,k){for(const t of TW)if(t.o===o&&t.k===k)t.alive=false}
function stepTweens(){for(let i=TW.length-1;i>=0;i--){const t=TW[i];if(!t.alive){TW.splice(i,1);continue}let k=(NOW-t.t0)/t.dur;if(k>=1)k=1;t.o[t.k]=lerp(t.from,t.to,t.ease(k));if(k>=1){t.alive=false;TW.splice(i,1);t.done&&t.done()}}}
