"use strict";
(function () {
  const menuToggle=document.getElementById("menu-toggle");
  const mobileNav=document.getElementById("mobile-nav");
  let previousFocus=null;
  function closeMenu(restoreFocus) {
    if(!menuToggle||!mobileNav)return;
    mobileNav.hidden=true;
    menuToggle.setAttribute("aria-expanded","false");
    menuToggle.setAttribute("aria-label","Open menu");
    if(restoreFocus)menuToggle.focus();
  }
  if(menuToggle && mobileNav) {
    menuToggle.addEventListener("click",function(){
      const willOpen=mobileNav.hidden;
      if(willOpen)previousFocus=document.activeElement;
      mobileNav.hidden=!willOpen;
      menuToggle.setAttribute("aria-expanded",String(willOpen));
      menuToggle.setAttribute("aria-label",willOpen?"Close menu":"Open menu");
      if(willOpen){const first=mobileNav.querySelector("a");if(first)first.focus();}
      else if(previousFocus && typeof previousFocus.focus==="function")previousFocus.focus();
    });
    mobileNav.querySelectorAll("a").forEach(function(link){link.addEventListener("click",function(){closeMenu(false);});});
    document.addEventListener("keydown",function(e){if(e.key==="Escape" && !mobileNav.hidden)closeMenu(true);});
    document.addEventListener("pointerdown",function(e){if(!mobileNav.hidden && !mobileNav.contains(e.target) && !menuToggle.contains(e.target))closeMenu(false);});
    window.addEventListener("resize",function(){if(window.innerWidth>980 && !mobileNav.hidden)closeMenu(false);});
  }
  document.querySelectorAll("[data-year]").forEach(function(el){el.textContent=String(new Date().getFullYear());});
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduced && "IntersectionObserver" in window){
    const targetNodes=Array.from(document.querySelectorAll(".reveal"));
    const observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}
      });
    },{rootMargin:"0px 0px -40px 0px",threshold:0.05});
    targetNodes.forEach(function(node){observer.observe(node);});
    document.body.classList.add("js-enhanced");
  }
  // Deliberately restrained parallax: photo pixels are never modified.
  const stage=document.querySelector(".identity-stage");
  const portrait=stage && stage.querySelector(".hero-portrait");
  const finePointer=window.matchMedia("(pointer:fine)").matches;
  if(stage && portrait && finePointer && !reduced){
    let raf=0;
    let px=0,py=0;
    stage.addEventListener("pointermove",function(e){
      const rect=stage.getBoundingClientRect();
      px=((e.clientX-rect.left)/rect.width-0.5)*8;
      py=((e.clientY-rect.top)/rect.height-0.5)*5;
      if(!raf)raf=requestAnimationFrame(function(){
        stage.style.setProperty("--v5-parallax-x",String(px)+"px");
        stage.style.setProperty("--v5-parallax-y",String(py)+"px");
        portrait.style.transform="translate3d("+px+"px,"+py+"px,0)";
        raf=0;
      });
    },{passive:true});
    stage.addEventListener("pointerleave",function(){
      if(raf)cancelAnimationFrame(raf);
      raf=0;
      portrait.style.transform="";
    });
  }
})();