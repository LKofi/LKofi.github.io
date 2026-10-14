
'use strict';
const menuButton=document.getElementById('menu-toggle');
const mobileMenu=document.getElementById('mobile-nav');
function closeMenu(){if(!menuButton||!mobileMenu)return;mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation')}
if(menuButton&&mobileMenu){
menuButton.addEventListener('click',()=>{const open=mobileMenu.hidden;mobileMenu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!mobileMenu.hidden&&!mobileMenu.contains(e.target)&&!menuButton.contains(e.target))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));
if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches&&'IntersectionObserver' in window){
 document.body.classList.add('js-ready');
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}},{threshold:.04,rootMargin:'0px 0px -15px 0px'});
 document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
}
const filterButtons=[...document.querySelectorAll('[data-v4-filter]')];
const projectItems=[...document.querySelectorAll('[data-v4-tags]')];
const emptyMessage=document.getElementById('v4-no-results');
function applyFilter(value){
let showing=0;
for(const item of projectItems){const found=value==='all'||(item.dataset.v4Tags||'').split(' ').includes(value);item.hidden=!found;if(found)showing++}
for(const button of filterButtons)button.setAttribute('aria-pressed',String(button.dataset.v4Filter===value));
if(emptyMessage)emptyMessage.hidden=showing!==0;
}
filterButtons.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.v4Filter)));
const hash=decodeURIComponent(location.hash.slice(1));
if(hash){const destination=document.getElementById(hash);if(destination?.matches?.('[data-v4-tags]'))applyFilter('all')}
const form=document.getElementById('contact-form'),status=document.getElementById('form-status');
if(form&&status){
 form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!form.reportValidity())return;
 const submit=form.querySelector('[type=submit]');
 if(submit){submit.disabled=true;submit.textContent='Sending…'}
 status.textContent='Sending your message…';
 try{
  const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:new FormData(form)});
  if(!response.ok)throw Error('Delivery request not accepted');
  const data=await response.json().catch(()=>({}));
  if(data.success===false||data.success==='false')throw Error('Relay rejected the request');
  status.textContent='Message request accepted. If email verification is still pending, delivery may be delayed. You can also email me directly.';
  form.reset();
 }catch(_error){
  status.textContent='The message could not be confirmed. Please use the direct email link to contact me.';
 }finally{if(submit){submit.disabled=false;submit.textContent='Send message ↗'}}
 });
}


document.querySelectorAll('a[href$="-case"]').forEach(link=>{
 link.addEventListener('click',event=>{
 const id=link.getAttribute('href').slice(1);
 const detail=document.getElementById(id);
 if(!detail||detail.tagName!=='DETAILS')return;
 event.preventDefault();
 detail.open=true;
 history.replaceState(null,'','#'+id);
 detail.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 });
});
if(location.hash.endsWith('-case')){
 const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
 if(target?.tagName==='DETAILS')target.open=true;
}
