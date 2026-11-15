import{r as P,s as x,e as M,g as w,P as R,a as S,p as I,b as z,D as A}from"./pwa-Ctao2UhS.js";P();x(document.getElementById("installBtn"));const a=e=>document.querySelector(e);async function c(e,n,o,r=0){const{cfg:t,doc:s}=await I({...A,pageNumbers:!1,headerName:"",headerDate:"",headerTitle:"",...n}),i=z(s,t,Math.min(r,s.pages.length-1),o);return e.width=i.width,e.height=i.height,e.getContext("2d").drawImage(i,0,0),e.classList.add("ready"),e}const u=()=>new Promise(e=>window.requestIdleCallback?requestIdleCallback(e,{timeout:300}):setTimeout(e,30)),d=Math.min(2,window.devicePixelRatio||1),N=`Dear Sam,

I found the old photos from the lake house last weekend and laughed until I cried. Do you remember the canoe? I still can't believe we made it back before the storm.

Come visit in the spring. I'll make the lemon cake, and we can walk the long way round the reservoir like we used to.

With love,
Ellie`;async function L(){await c(a("#heroMain"),{text:N,font:"homemade",pen:"fountain",ink:"#16224a",paper:"cream",pageSize:"a5",natural:.55,mistakes:.08,finish:"photo",surface:"walnut",tilt:.45,light:.65,seed:7311,indent:!1},120*d*.75),await u(),await c(a("#heroNote"),{text:`Call mom back!!
Pick up dry cleaning
milk, eggs, basil`,font:"reenie",pen:"felt",ink:"#1a1a1f",paper:"sticky",pageSize:"sticky",size:1.15,natural:.7,mistakes:0,finish:"clean",seed:42,indent:!1,smudges:!1},150*d),await u(),await c(a("#heroCard"),{text:`# Mitochondria
- Powerhouse of the cell
- Makes ATP (cellular respiration)
- Has its own DNA!`,font:"architect",pen:"gel",ink:"#1a1a1f",paper:"card",pageSize:"card",size:1.45,natural:.5,mistakes:0,finish:"clean",seed:9,indent:!1},130*d)}const F=[["caveat","Everyday"],["kalam","Student"],["indie","Rounded"],["homemade","Cursive"],["labelle","Elegant"],["reenie","Scribble"],["architect","Caps"]],O=["ballpoint","gel","fountain","felt","pencil"],E=[["card","Index card","card"],["sticky","Sticky note","sticky"],["college","Notebook","a5"],["cream","Stationery","a5"]],H={ballpoint:"#1d3a94",gel:"#1a1a1f",fountain:"#1c2747",felt:"#1a1a1f",pencil:"#3d3e42"},l={font:"caveat",pen:"ballpoint",paper:"card",seed:11};function f(e,n,o,r=t=>t){e.innerHTML="";for(const t of n){const s=Array.isArray(t)?t[0]:t,i=document.createElement("button");i.className="chip"+(l[o]===s?" on":""),i.textContent=Array.isArray(t)?t[1]:r(t),o==="font"&&(i.style.fontFamily=`'${w(s).family}', cursive`),i.onclick=()=>{l[o]=s,f(e,n,o,r),y(0)},e.append(i)}}let T,m=!1,g=!1;function y(e=180){clearTimeout(T),T=setTimeout(k,e)}async function k(){if(m){g=!0;return}m=!0;const e=a("#tryText").value.trim()||"Write something here…",n=E.find(t=>t[0]===l.paper),o=n[0]==="college"||n[0]==="cream";try{await c(a("#tryCanvas"),{text:e,font:l.font,pen:l.pen,ink:H[l.pen],paper:n[0],pageSize:n[2],natural:.6,mistakes:.1,finish:"clean",seed:l.seed,indent:!1,smudges:o,fatigue:o},(n[0]==="sticky"?170:n[0]==="card"?150:95)*d)}catch(t){console.error(t)}const r=new URLSearchParams({text:e});a("#tryOpen").href="./studio.html?"+r.toString(),m=!1,g&&(g=!1,k())}function D(){return f(a("#tryFonts"),F,"font"),f(a("#tryPens"),O,"pen",e=>S[e].label.replace(" (HB)","")),f(a("#tryPapers"),E,"paper"),a("#tryText").addEventListener("input",()=>y()),a("#tryReroll").onclick=()=>{l.seed=Math.random()*1e6|0,y(0)},k()}const _=`Meeting notes - Tuesday

Budget review moved to Friday at 10am. Anna will bring the revised numbers and the vendor quotes. Need to confirm the room booking and order lunch for twelve people.`,q={natural:0,baseline:0,jitter:0,sizeVar:0,lineSlope:0,marginDrift:0,warp:0,pressure:0,rightRag:0,mistakes:0,smudges:!1,fatigue:!1};async function B(){const e={text:_,size:1.2,font:"kalam",pen:"ballpoint",ink:"#1d3a94",paper:"a4lined",pageSize:"a5",finish:"clean",seed:515,indent:!1};await c(a("#cmpFont"),{...e,...q,pen:"fineliner"},150*d),await u(),await c(a("#cmpReal"),{...e,natural:.75,mistakes:.3},150*d)}const W=[["school",`Biology — Ch. 4

# Photosynthesis
- Happens in the chloroplasts
- Light reactions make ATP + NADPH
- Calvin cycle fixes CO2 into sugar

Remember: 6CO2 + 6H2O -> C6H12O6 + 6O2`],["letter",`My dearest Jo,

The garden is full of roses again and every one of them reminds me of you. Write soon and tell me everything.

Always yours,
M.`],["journal",`# Monday
- [x] Morning run, 5k
- [x] Reply to Priya
- [ ] Book dentist
- [ ] Finish chapter 7

Grateful for: sunshine, good coffee, quiet evenings.`],["legal",`Client call - Hart & Co.

- Wants delivery moved up to the 14th
- OK with revised pricing
- Send contract draft by Thursday
- Follow up with legal re: clause 9`],["old",`London, 3rd of May

My dear brother,

The crossing was rough but we arrived safely. The city is louder than I imagined, and I miss the quiet of home terribly.`],["pencil",`Essay draft - intro

The industrial revolution changed not only how people worked, but how they thought about time itself. Clocks became`],["flash",`# Mitosis
Prophase, metaphase, anaphase, telophase`],["doctor",`Rx: Amoxicillin 500mg
Take 1 capsule three times daily for 7 days.
Refills: 0`]];async function Y(){const e=a("#gallery"),n=[];for(const[r,t]of W){const s=R.find(C=>C.id===r),i=document.createElement("a");i.className="g-item",i.href="./studio.html?preset="+r;const p=document.createElement("div");p.className="g-frame";const b=document.createElement("canvas");p.append(b);const h=document.createElement("div");h.className="g-cap",h.innerHTML=`<b>${s.label}</b><span>${S[s.set.pen].label} · ${w(s.set.font).label}</span>`,i.append(p,h),e.append(i);const v=s.set.pageSize==="card"||s.set.pageSize==="sticky";v&&p.classList.add("small"),n.push({cv:b,cfg:{...s.set,text:t,size:v?1.3:1.25,seed:1e3+n.length*77,indent:!1}})}const o=new IntersectionObserver(async r=>{if(r.some(t=>t.isIntersecting)){o.disconnect();for(const t of n)await c(t.cv,t.cfg,(t.cfg.pageSize==="card"||t.cfg.pageSize==="sticky"?120:85)*d),await u()}},{rootMargin:"400px"});o.observe(e)}async function $(){const e=new IntersectionObserver(async n=>{n[0].isIntersecting&&(e.disconnect(),await c(a("#ctaCanvas"),{text:`Dear reader,

Thanks for scrolling all the way down. Now go write something wonderful.

- P.`,font:"nothing",pen:"gel",ink:"#1d3a94",paper:"a4lined",pageSize:"a5",size:1.25,natural:.6,mistakes:0,finish:"photo",surface:"oak",tilt:.6,seed:88,indent:!1},80*d))},{rootMargin:"300px"});e.observe(a("#ctaCanvas"))}window.addEventListener("scroll",()=>a("#nav").classList.toggle("scrolled",scrollY>8),{passive:!0});(async()=>(await M(w("caveat")),await L(),await D(),Y(),$(),await B(),window.__home=!0))();
