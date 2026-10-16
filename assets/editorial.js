(()=>{"use strict";
const q=(s,r=document)=>r.querySelector(s);
const menu=q("#site-menu"),toggle=q("#menu-button");
function closeMenu(restoreFocus=true){
 if(!menu||!toggle||menu.hidden)return;
 menu.hidden=true;
 toggle.setAttribute("aria-expanded","false");
 toggle.setAttribute("aria-label","Open navigation menu");
 document.body.classList.remove("menu-open");
 if(restoreFocus)toggle.focus();
}
function openMenu(){
 if(!menu||!toggle)return;
 menu.hidden=false;
 toggle.setAttribute("aria-expanded","true");
 toggle.setAttribute("aria-label","Close navigation menu");
 document.body.classList.add("menu-open");
 q("a[href]",menu)?.focus();
}
toggle?.addEventListener("click",()=>menu.hidden?openMenu():closeMenu());
menu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>closeMenu(false)));
document.addEventListener("keydown",e=>{
 if(!menu||menu.hidden)return;
 if(e.key==="Escape"){e.preventDefault();closeMenu();return}
 if(e.key!=="Tab")return;
 const focusables=[toggle,...menu.querySelectorAll("a[href],button:not([disabled])")];
 const index=focusables.indexOf(document.activeElement);
 if(e.shiftKey&&(index===0||index===-1)){e.preventDefault();focusables.at(-1)?.focus()}
 else if(!e.shiftKey&&(index===focusables.length-1||index===-1)){e.preventDefault();focusables[0]?.focus()}
});
document.addEventListener("click",e=>{
 if(menu&&!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu(false);
});
const slides=[
 {title:["Software","Engineer."],tag:"01 / 03",left:["Built with purpose","I build usable interfaces, reliable APIs and secure systems, from architecture to deployment."],right:["Selected work","Explore the engineering decisions behind real platforms and client projects."],href:"/projects.html",label:"Explore selected engineering projects"},
 {title:["Secure","Systems."],tag:"02 / 03",left:["Trust by design","Authentication, authorization, validation and practical defensive engineering."],right:["Security work","Explore the SecureGate authorization components and the systems behind them."],href:"/projects.html#securegate",label:"Explore SecureGate security project"},
 {title:["Digital","Products."],tag:"03 / 03",left:["Built to operate","Backend services, business workflows, cloud delivery and maintainable software."],right:["MERNORAHFLOW","A workspace-aware platform connecting relationships, delivery, billing and support."],href:"/projects.html#mernorahflow",label:"Explore MERNORAHFLOW"}
];
const hero=q("#slide-heading");
if(hero){
 let current=0,locked=false;
 const num=q("#slide-number"),leftH=q("#left-title"),leftP=q("#left-copy"),rightH=q("#right-title"),rightP=q("#right-copy"),link=q("#project-jump"),bar=q("#progress-fill"),progress=q("#progress");
 function show(index){current=(index+slides.length)%slides.length;const s=slides[current];hero.replaceChildren(...s.title.map(x=>{const span=document.createElement("span");span.textContent=x;return span}));num.textContent=s.tag;leftH.textContent=s.left[0];leftP.textContent=s.left[1];rightH.textContent=s.right[0];rightP.textContent=s.right[1];link.href=s.href;link.setAttribute("aria-label",s.label);bar.style.width=((current+1)/slides.length*100)+"%";progress?.setAttribute("aria-valuenow",String(current+1));progress?.setAttribute("aria-label","Feature "+(current+1)+" of "+slides.length);}
 q("#next-slide")?.addEventListener("click",()=>show(current+1));
 document.addEventListener("keydown",e=>{if(!menu?.hidden)return;if(e.key==="ArrowRight"||e.key==="ArrowLeft"){const tag=document.activeElement?.tagName;if(["INPUT","TEXTAREA","SELECT","BUTTON","A"].includes(tag)||e.altKey||e.ctrlKey||e.metaKey)return;show(current+(e.key==="ArrowRight"?1:-1))}});
 show(0);
}
if(location.hash.endsWith("-case")){
 const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
 if(target?.tagName==="DETAILS")target.open=true;
}
const filters=document.querySelectorAll("[data-filter]");
const projects=document.querySelectorAll("[data-category]");
filters.forEach(btn=>btn.addEventListener("click",()=>{const type=btn.dataset.filter;filters.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));projects.forEach(p=>{p.hidden=type!=="all"&&!p.dataset.category.split(" ").includes(type)});const count=q("#result-count");if(count)count.textContent=[...projects].filter(p=>!p.hidden).length+" projects shown";}));
const form=q("#contact-form");
if(form)form.addEventListener("submit",async e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const status=q("#form-status"),send=q("#contact-submit"),data=Object.fromEntries(new FormData(form));
 if(data._honey){status.textContent="Thank you.";return}
 send.disabled=true;status.dataset.status="";status.textContent="Submitting your message…";
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(form.action,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify(data),signal:controller.signal});
  const result=await response.json();
  if(!response.ok||!(result.success===true||result.success==="true"))throw Error("The email relay did not confirm the submission.");
  form.reset();status.dataset.status="ok";status.textContent="Your message was accepted by the email service. Mailbox delivery may still require verification.";
 }catch(err){status.dataset.status="error";const link=document.createElement("a");link.href="mailto:sukahemmanuelkofi@gmail.com?subject=Software%20Engineering%20Opportunity";link.textContent="email me directly";link.style.textDecoration="underline";status.replaceChildren(document.createTextNode("The form could not confirm delivery. Please "),link,document.createTextNode(" instead."));}
 finally{clearTimeout(timer);send.disabled=false}
});
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=String(new Date().getFullYear()));
})();