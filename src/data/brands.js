'use strict';
/* ================= retailer brands =================
   The supermarket at the end of the journey is dressed in the retailer named by the manifest ("retailer" block).
   BRANDS holds the known retailers' colours and signage wording; a manifest can override any of it, or describe a retailer that is
   not listed here. No retailer, or an unusable one, gives the plain generic theme. Logos are drawn only from a logoUrl the manifest
   supplies; otherwise the name is set as styled text. Nothing here is shipment data: it only styles the store. */
const BRANDS={
 generic:{name:'Supermarket',primary:'#2E7D4F',secondary:'#FFFFFF',accent:'#F2B33D',style:'dark',
  signage:{aisle:'Aisle',aisles:['Breakfast & cereal','Tins & jars','Pasta & rice','Snacks','Household','Drinks'],chilled:'Dairy & chilled',drinks:'Cold drinks',bakery:'Bakery',entrance:'Welcome',produce:'Fresh fruit & veg',promo:'Melons in season',checkout:'Checkout',parking:'Customer parking',price:'Ripe & ready',shelves:['Fruit','Vegetables','Salad']}},
 tesco:{name:'Tesco',primary:'#00539F',secondary:'#EE1C2E',accent:'#FFFFFF',style:'light',
  signage:{aisle:'Aisle',aisles:['Breakfast & cereal','Tins & jars','Pasta & rice','Snacks','Household','Drinks'],chilled:'Dairy & chilled',drinks:'Cold drinks',bakery:'Bakery',entrance:'Welcome',produce:'Fresh fruit',promo:'Fresh melons in store',checkout:'Checkout',parking:'Customer parking',price:'Ripe & ready',shelves:['Fruit','Vegetables','Salad']}},
 'albert-heijn':{name:'Albert Heijn',primary:'#00A0E2',secondary:'#FFFFFF',accent:'#003F7D',style:'dark',
  signage:{aisle:'Gang',aisles:['Ontbijt','Conserven','Pasta & rijst','Snacks','Huishouden','Dranken'],chilled:'Zuivel & gekoeld',drinks:'Koude dranken',bakery:'Bakkerij',entrance:'Welkom',produce:'Vers fruit',promo:'Verse meloenen',checkout:'Kassa',parking:'Parkeren',price:'Lekker rijp',shelves:['Fruit','Groente','Salade']}},
 sainsburys:{name:"Sainsbury's",primary:'#F06C00',secondary:'#FFFFFF',accent:'#7A3E00',style:'dark',
  signage:{aisle:'Aisle',aisles:['Breakfast & cereal','Tins & jars','Pasta & rice','Snacks','Household','Drinks'],chilled:'Dairy & chilled',drinks:'Cold drinks',bakery:'Bakery',entrance:'Welcome',produce:'Fresh fruit & veg',promo:'Melons in season',checkout:'Checkout',parking:'Customer parking',price:'Ripe & ready',shelves:['Fruit','Vegetables','Salad']}}};
const brandKey=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hexOk=c=>typeof c==='string'&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim());
const hexRGB=c=>{let h=c.trim().slice(1);if(h.length===3)h=h.replace(/./g,'$&$&');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
/* manifest retailer block -> the brand the supermarket wears */
function resolveBrand(r){const ok=!!r&&typeof r==='object',reg=ok&&(BRANDS[brandKey(r.id)]||BRANDS[brandKey(r.name)]),base=reg||BRANDS.generic,b=ok&&r.brand&&typeof r.brand==='object'?r.brand:{},s=ok&&r.signage&&typeof r.signage==='object'?r.signage:{};
 const name=ok&&typeof r.name==='string'&&r.name.trim()?r.name.trim():reg?base.name:ok&&r.id?String(r.id):base.name,col=(v,d)=>hexOk(v)?v.trim():d,txt=(v,d)=>typeof v==='string'&&v.trim()?v.trim():d;
 const sg=base.signage,shelves=Array.isArray(s.shelfHeaders)&&s.shelfHeaders.length?s.shelfHeaders.map(String).slice(0,3):sg.shelves;
 return{known:!!reg,custom:ok&&!reg,id:ok&&r.id?String(r.id):'generic',name,sign:txt(b.signageText,name),storeName:txt(ok&&r.store&&r.store.name,ok?name:'Supermarket'),
  primary:col(b.primaryColor,base.primary),secondary:col(b.secondaryColor,base.secondary),accent:col(b.accentColor,base.accent),style:b.signStyle==='light'||b.signStyle==='dark'?b.signStyle:base.style,
  logoUrl:txt(b.logoUrl,null),fictional:ok&&r.fictionalAssignment===true,
  signage:{aisle:txt(s.aisle,sg.aisle),aisles:Array.isArray(s.aisleHeaders)&&s.aisleHeaders.length?s.aisleHeaders.map(String).slice(0,6):sg.aisles,chilled:txt(s.chilled,sg.chilled),drinks:txt(s.drinks,sg.drinks),bakery:txt(s.bakery,sg.bakery),entrance:txt(s.entrance,sg.entrance),produce:txt(s.produce,sg.produce),promo:txt(s.promo,sg.promo),checkout:txt(s.checkout,sg.checkout),parking:txt(s.parking,sg.parking),price:txt(s.priceCard,sg.price),shelves}}}
