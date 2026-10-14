"use strict";
/* SEAK visual environment: progressive enhancement with no dependencies.
   Motion stops when hidden, offscreen, or reduced motion is requested. */
(function(){
  const hero=document.querySelector(".seak-hero");
  if(!hero)return;
  const canvas=document.getElementById("seak-particles");
  const toggle=document.getElementById("seak-core-toggle");
  const status=document.getElementById("seak-mode-text");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer=window.matchMedia("(pointer: fine)");
  let intelligence=false;
  if(toggle && status){
    toggle.addEventListener("click",function(){
      intelligence=!intelligence;
      document.body.dataset.seakMode=intelligence?"intelligence":"architecture";
      toggle.setAttribute("aria-pressed",String(intelligence));
      toggle.setAttribute("aria-label",intelligence?"Return to architectural mode":"Activate interactive intelligence mode");
      status.textContent=intelligence?"INTELLIGENCE MODE ACTIVE":"ARCHITECTURE ONLINE";
    });
  }
  // Environmental perspective: reacts to a user's mouse movement, not a fake click decoration.
  if(finePointer.matches && !reduced.matches){
    let px=0,py=0,frame=0;
    hero.addEventListener("pointermove",function(e){
      const r=hero.getBoundingClientRect();
      px=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
      py=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
      if(!frame)frame=requestAnimationFrame(function(){
        hero.style.setProperty("--seak-mx",px.toFixed(3));
        hero.style.setProperty("--seak-my",py.toFixed(3));
        frame=0;
      });
    },{passive:true});
    hero.addEventListener("pointerleave",function(){
      if(frame)cancelAnimationFrame(frame);
      frame=0;hero.style.setProperty("--seak-mx","0");hero.style.setProperty("--seak-my","0");
    });
  }
  if(!canvas||!canvas.getContext)return;
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx)return;
  let width=0,height=0,dpr=1,particles=[],raf=0,visible=true,finished=false;
  const random=function(min,max){return min+Math.random()*(max-min);};
  const limitParticles=function(){return innerWidth<650?38:innerWidth<1100?62:95;};
  function resize(){
    const rect=canvas.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    particles=Array.from({length:limitParticles()},function(){
      return {x:Math.random()*width,y:Math.random()*height,vx:random(-.12,.12),vy:random(-.24,-.07),r:random(.5,1.7),opacity:random(.18,.75),phase:Math.random()*Math.PI*2};
    });
    if(reduced.matches)draw(0,true);
  }
  function draw(t,still){
    ctx.clearRect(0,0,width,height);
    const energy=intelligence?1.55:1;
    const centerX=width*(intelligence?.67:.74),centerY=height*.44;
    const illumination=ctx.createRadialGradient(centerX,centerY,12,centerX,centerY,Math.max(width*.47,220));
    illumination.addColorStop(0,intelligence?"rgba(169,12,53,.15)":"rgba(126,14,40,.08)");
    illumination.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=illumination;ctx.fillRect(0,0,width,height);
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      if(!still){
        p.x+=p.vx*energy;p.y+=p.vy*energy;
        if(p.y< -8){p.y=height+8;p.x=Math.random()*width;}
        if(p.x<0)p.x=width;if(p.x>width)p.x=0;
      }
      const pulse=.67+.33*Math.sin(t*.0014+p.phase);
      const a=Math.max(.07,p.opacity*pulse)*energy;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*energy,0,Math.PI*2);
      ctx.fillStyle="rgba(245,76,118,"+Math.min(.88,a)+")";ctx.fill();
      if(i%3===0){
        const nearest=particles[(i+7)%particles.length],dist=Math.hypot(p.x-nearest.x,p.y-nearest.y);
        if(dist<180){
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(nearest.x,nearest.y);
          ctx.strokeStyle="rgba(201,23,62,"+(1-dist/180)*.085*energy+")";
          ctx.lineWidth=.7;ctx.stroke();
        }
      }
    }
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function tick(time){
    raf=0;
    if(finished||document.hidden||!visible||reduced.matches)return;
    draw(time,false);
    raf=requestAnimationFrame(tick);
  }
  function refresh(){
    stop();
    if(!finished&&!document.hidden&&visible&&!reduced.matches)raf=requestAnimationFrame(tick);
    else draw(0,true);
  }
  const observer=("IntersectionObserver" in window)?new IntersectionObserver(function(entries){
    visible=entries.some(function(e){return e.isIntersecting;});
    refresh();
  },{threshold:0}):null;
  if(observer)observer.observe(hero);
  if("ResizeObserver" in window){new ResizeObserver(function(){resize();refresh();}).observe(canvas);}
  else window.addEventListener("resize",function(){resize();refresh();},{passive:true});
  document.addEventListener("visibilitychange",refresh);
  if(reduced.addEventListener)reduced.addEventListener("change",refresh);
  resize();refresh();
  window.addEventListener("pagehide",function(){finished=true;stop();if(observer)observer.disconnect();});
})();