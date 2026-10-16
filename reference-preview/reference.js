(()=>{
"use strict";
const slides=[
{heading:["Software","Engineer."],leftTitle:"Built with purpose",leftCopy:"Thoughtful interfaces. Reliable APIs. Secure systems designed to solve real problems.",rightTitle:"Selected Work",rightCopy:"Explore the thinking and engineering behind the projects I build.",jump:"/projects.html",jumpLabel:"View selected software engineering projects"},
{heading:["Cloud","Systems."],leftTitle:"From idea to release",leftCopy:"Deploying dependable solutions across data, applications and edge infrastructure.",rightTitle:"Engineering Work",rightCopy:"MERNORAHFLOW, client platforms, mobile experiences and secure backend systems.",jump:"/projects.html",jumpLabel:"Browse engineering case studies"},
{heading:["Secure","By Design."],leftTitle:"Engineering with care",leftCopy:"Privacy, authorization, maintainability and thoughtful technical decisions.",rightTitle:"Let’s Connect",rightCopy:"Open to international remote engineering opportunities and meaningful collaboration.",jump:"/contact.html",jumpLabel:"Contact Sukkah Emmanuel"}];
let index=0;
const $=id=>document.getElementById(id);
const button=$("next-slide");
const progress=$("progress");
const progressFill=$("progress-fill");
const projectJump=$("project-jump");
function render(){
 const slide=slides[index];
 $("heading-one").textContent=slide.heading[0];
 $("heading-two").textContent=slide.heading[1];
 $("left-title").textContent=slide.leftTitle;
 $("left-copy").textContent=slide.leftCopy;
 $("right-title").textContent=slide.rightTitle;
 $("right-copy").textContent=slide.rightCopy;
 projectJump.href=slide.jump;
 projectJump.setAttribute("aria-label",slide.jumpLabel);
 progress.setAttribute("aria-valuenow",String(index+1));
 progress.setAttribute("aria-label","Feature "+(index+1)+" of "+slides.length);
 progressFill.style.width=String((index+1)/slides.length*100)+"%";
 $("showcase").dataset.slide=String(index+1);
 if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
 const heads=$("slide-heading").querySelectorAll("span");
 heads.forEach(el=>{el.style.animation="none";el.offsetHeight;el.style.animation="";});
 }
}
button.addEventListener("click",()=>{index=(index+1)%slides.length;render();});
const menuButton=$("menu-button"),menu=$("site-menu");
let previousFocus=null;
function closeMenu(){
 if(menu.hidden)return;
 menu.hidden=true;
 menuButton.setAttribute("aria-expanded","false");
 menuButton.setAttribute("aria-label","Open navigation menu");
 if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();
}
function openMenu(){
 previousFocus=document.activeElement;
 menu.hidden=false;
 menuButton.setAttribute("aria-expanded","true");
 menuButton.setAttribute("aria-label","Close navigation menu");
 menu.querySelector("a")?.focus();
}
menuButton.addEventListener("click",()=>menu.hidden?openMenu():closeMenu());
document.addEventListener("keydown",event=>{
 if(event.key==="Escape"){closeMenu();return;}
 if(menu.hidden&&(event.key==="ArrowRight"||event.key==="ArrowLeft")&&!["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)){
 index=(index+(event.key==="ArrowRight"?1:slides.length-1))%slides.length;render();}
 if(!menu.hidden&&event.key==="Tab"){
 const focusable=[menuButton,...menu.querySelectorAll("a")];
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});
document.addEventListener("click",event=>{
 if(!menu.hidden&&!menu.contains(event.target)&&!menuButton.contains(event.target))closeMenu();
});
render();
})();