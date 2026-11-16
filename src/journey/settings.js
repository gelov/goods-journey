'use strict';
/* ================= settings: 3D visual style ================= */
function initSettings(){const b=$('#bSet'),p=$('#settings'),opts=[...p.querySelectorAll('[data-style]')];
 const sync=()=>opts.forEach(o=>{const on=o.dataset.style===STYLE;o.classList.toggle('on',on);o.setAttribute('aria-pressed',on)});
 b.onclick=()=>{const open=p.classList.toggle('show');b.classList.toggle('on',open);b.setAttribute('aria-expanded',open)};
 document.addEventListener('pointerdown',e=>{if(!p.contains(e.target)&&!b.contains(e.target)){p.classList.remove('show');b.classList.remove('on');b.setAttribute('aria-expanded',false)}});
 opts.forEach(o=>o.onclick=()=>{setStyle(o.dataset.style);sync()});sync();
 const sp=[...p.querySelectorAll('[data-speed]')],ss2=()=>sp.forEach(o=>{const on=o.dataset.speed===SPEED;o.classList.toggle('on',on);o.setAttribute('aria-pressed',on)});
 sp.forEach(o=>o.onclick=()=>{SPEED=o.dataset.speed;try{localStorage.setItem('ffts.speed',SPEED)}catch(e){}ss2()});ss2()}
