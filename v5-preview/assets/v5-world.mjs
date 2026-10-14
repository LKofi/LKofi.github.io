/* SEAK Reality Engine — progressive cinematic WebGL enhancement.
 * Real Three.js 3D, pinned library version. CSS design remains functional if unavailable.
 * User controls and accessible DOM remain authoritative.
 */
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
(async function(){
 "use strict";
 const hero=document.querySelector(".seak-hero");
 const canvas=document.getElementById("seak-world-3d");
 if(!hero||!canvas)return;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const lowPower=()=>!!(navigator.connection?.saveData || (navigator.deviceMemory&&navigator.deviceMemory<4));
 if(reduced.matches||lowPower()){canvas.hidden=true;return;}
 let gl=null;
 try{gl=canvas.getContext("webgl2",{alpha:true,antialias:true,powerPreference:"high-performance",premultipliedAlpha:true});}catch(_){}
 if(!gl){canvas.hidden=true;return;}
 let THREE;
 try{THREE=await import(THREE_URL);}catch(error){
   console.warn("SEAK 3D enhancement unavailable; animated fallback is active.",error);
   canvas.hidden=true;return;
 }
 let renderer,scene,camera,pivot,outer,mid,inner,core,glow,archGroup,points,lines=[];
 try{
  renderer=new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true,powerPreference:"high-performance"});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  renderer.shadowMap.enabled=window.innerWidth>1100;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(43,1,0.1,120);
  camera.position.set(0,1.1,12.7);
  camera.lookAt(0,0.3,0);

  const metal=new THREE.MeshPhysicalMaterial({color:0x17151c,metalness:.86,roughness:.22,clearcoat:.72,clearcoatRoughness:.2});
  const blackGlass=new THREE.MeshPhysicalMaterial({color:0x16101a,metalness:.3,roughness:.16,transmission:.18,transparent:true,opacity:.62,side:THREE.DoubleSide,depthWrite:false});
  const inlay=new THREE.MeshStandardMaterial({color:0x9f1534,metalness:.76,roughness:.24,emissive:0x58071d,emissiveIntensity:.75});
  const chrome=new THREE.MeshPhysicalMaterial({color:0xbcb5c3,metalness:.94,roughness:.14,clearcoat:.8});
  const redChrome=new THREE.MeshPhysicalMaterial({color:0x68162c,metalness:.78,roughness:.13,clearcoat:1,clearcoatRoughness:.08,emissive:0x2c0310,emissiveIntensity:.5});

  scene.add(new THREE.HemisphereLight(0x7386a5,0x120209,1.15));
  const key=new THREE.DirectionalLight(0xe2e4f7,2.2);key.position.set(5,10,8);scene.add(key);
  key.castShadow=renderer.shadowMap.enabled;
  key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.left=-11;key.shadow.camera.right=11;key.shadow.camera.top=12;key.shadow.camera.bottom=-12;
  const rim=new THREE.PointLight(0xed244b,65,18,1.7);rim.position.set(5,1.5,2.4);scene.add(rim);
  const backLight=new THREE.PointLight(0x80354f,27,18,2);backLight.position.set(-5,3,-6);scene.add(backLight);

  // Spatial architecture: real mesh walls and illuminated structural joints.
  archGroup=new THREE.Group();scene.add(archGroup);
  const pillarGeom=new THREE.BoxGeometry(.39,11,1.1);
  for(const x of [-8.4,-4.6,6.9,10.4]){
    const pillar=new THREE.Mesh(pillarGeom,metal);
    pillar.position.set(x,1,-7.2);pillar.castShadow=true;pillar.receiveShadow=true;archGroup.add(pillar);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(.035,10.5,.04),inlay);
    edge.position.set(x+.23,1,-6.6);archGroup.add(edge);
  }
  for(const h of [4.65,7.5]){
   const beam=new THREE.Mesh(new THREE.BoxGeometry(23,.25,1.25),metal);beam.position.set(0,h,-7.7);archGroup.add(beam);
   const strip=new THREE.Mesh(new THREE.BoxGeometry(23,.018,.045),inlay);strip.position.set(0,h-.14,-7.0);archGroup.add(strip);
  }
  const glassPane=new THREE.Mesh(new THREE.PlaneGeometry(24,13),blackGlass);
  glassPane.position.set(0,1,-8.4);archGroup.add(glassPane);

  // Floor is an actual three-dimensional PBR plane, with rows of steel and crimson inlay.
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshPhysicalMaterial({
    color:0x100c12,metalness:.84,roughness:.23,clearcoat:1,clearcoatRoughness:.13,side:THREE.DoubleSide
  }));
  floor.rotation.x=-Math.PI/2;floor.position.y=-3.5;floor.receiveShadow=true;scene.add(floor);
  for(let z=-30;z<8;z+=3.5){
   const strip=new THREE.Mesh(new THREE.BoxGeometry(25,.014,.028),inlay);
   strip.position.set(0,-3.475,z);scene.add(strip);
  }
  for(const x of [-8,-2.8,2.4,7.6]){
   const strip=new THREE.Mesh(new THREE.BoxGeometry(.025,.014,43),inlay);
   strip.position.set(x,-3.47,-10);scene.add(strip);
  }

  // Living Engine: nested physical rings and a sculpted metallic sphere.
  pivot=new THREE.Group();pivot.position.set(3.4,.55,-.5);scene.add(pivot);
  const outerMat=new THREE.MeshPhysicalMaterial({color:0xd0cbd2,metalness:.94,roughness:.13,clearcoat:.9,emissive:0x64041d,emissiveIntensity:.24});
  const ringGeom=(r,t)=>new THREE.TorusGeometry(r,t,18,126);
  outer=new THREE.Mesh(ringGeom(2.0,.075),outerMat);outer.rotation.set(.38,.25,.17);pivot.add(outer);
  mid=new THREE.Mesh(ringGeom(1.7,.045),inlay);mid.rotation.set(1.18,.25,-.6);pivot.add(mid);
  inner=new THREE.Mesh(ringGeom(1.45,.055),chrome);inner.rotation.set(.8,1.25,.55);pivot.add(inner);
  const braided=new THREE.Mesh(ringGeom(2.21,.012),inlay);braided.rotation.set(-.7,.2,-.13);pivot.add(braided);
  const sphereGeometry=new THREE.IcosahedronGeometry(1.12,3);
  core=new THREE.Mesh(sphereGeometry,redChrome);core.castShadow=true;pivot.add(core);
  const innerCore=new THREE.Mesh(new THREE.IcosahedronGeometry(.56,2),new THREE.MeshStandardMaterial({
    color:0x950b35,metalness:.38,roughness:.24,emissive:0xc31540,emissiveIntensity:2.1
  }));
  pivot.add(innerCore);
  const shell=new THREE.Mesh(new THREE.SphereGeometry(1.31,40,28),new THREE.MeshPhysicalMaterial({
    color:0x78283d,metalness:.42,roughness:.09,transmission:.47,thickness:.85,clearcoat:1,
    transparent:true,opacity:.19,depthWrite:false
  }));
  pivot.add(shell);
  const seamGeo=new THREE.TorusGeometry(1.1,.008,7,84);
  for(let i=0;i<3;i++){
   const seam=new THREE.Mesh(seamGeo,inlay);seam.rotation.set(i*.5,Math.PI*i/3,i*.4);pivot.add(seam);
  }

  // Glow uses canvas-generated texture (not a fake DOM image).
  const glowCanvas=document.createElement("canvas");glowCanvas.width=128;glowCanvas.height=128;
  const g=glowCanvas.getContext("2d");
  if(!g)throw Error("Canvas 2D texture context unavailable");
  const gradient=g.createRadialGradient(64,64,1,64,64,63);
  gradient.addColorStop(0,"rgba(255,83,123,.82)");gradient.addColorStop(.18,"rgba(209,12,58,.35)");
  gradient.addColorStop(.55,"rgba(147,5,39,.12)");gradient.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=gradient;g.fillRect(0,0,128,128);
  const glowTexture=new THREE.CanvasTexture(glowCanvas);
  glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xff2c5f,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  glow.scale.set(7,7,1);glow.position.set(0,0,-2);pivot.add(glow);

  // A few lines of light connect space to the core; no resource-heavy postprocessing.
  const pathMaterial=new THREE.LineBasicMaterial({color:0x9f2848,transparent:true,opacity:.35});
  for(let i=0;i<5;i++){
   const origin=new THREE.Vector3(-9+(i*4),-3.35,-7);
   const endpoint=new THREE.Vector3(3.4,Math.sin(i*1.7)*.6+.3,-.5);
   const a=new THREE.QuadraticBezierCurve3(origin,new THREE.Vector3((origin.x+3.4)/2,3.8-i*.8,-5),endpoint);
   const geo=new THREE.BufferGeometry().setFromPoints(a.getPoints(38));
   const line=new THREE.Line(geo,pathMaterial);scene.add(line);lines.push(line);
  }
  const dustPositions=new Float32Array(240*3);
  for(let i=0;i<240;i++){
   dustPositions[i*3]=Math.random()*30-15;
   dustPositions[i*3+1]=Math.random()*14-5;
   dustPositions[i*3+2]=Math.random()*18-15;
  }
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute("position",new THREE.BufferAttribute(dustPositions,3));
  points=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xef5b7b,size:.028,transparent:true,opacity:.45,sizeAttenuation:true,depthWrite:false}));
  scene.add(points);
 }catch(err){
  console.warn("SEAK 3D scene creation failed; retaining CSS fallback.",err);
  try{renderer?.dispose();}catch(_){}
  canvas.hidden=true;return;
 }
 let enabled=true,visible=true,raf=0,lastTime=0,mouseX=0,mouseY=0,elapsed=0,motionTime=0,mode="architecture";
 const clock=new THREE.Clock();
 function size(){
  if(!enabled)return;
  const rect=hero.getBoundingClientRect();
  const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.15:1.6));
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.fov=window.innerWidth<650?56:window.innerWidth<1000?48:43;
  camera.updateProjectionMatrix();
  pivot.position.x=window.innerWidth<650?1.72:window.innerWidth<980?2.4:3.4;
  pivot.position.y=window.innerWidth<650?-.65:window.innerWidth<980?-.1:.55;
  const scale=window.innerWidth<650?.66:window.innerWidth<980?.86:1;
  pivot.scale.setScalar(scale);
 }
 function render(time){
  raf=0;
  if(!enabled||document.hidden||!visible||reduced.matches)return;
  const dt=Math.min(.05,clock.getDelta());
  if(time-lastTime<((window.innerWidth<700)?33:15)){
   raf=requestAnimationFrame(render);return;
  }
  lastTime=time;elapsed+=dt;motionTime+=dt;
  const power=mode==="intelligence"?2.2:1;
  outer.rotation.z+=dt*.11*power;
  outer.rotation.y+=dt*.08*power;
  mid.rotation.x-=dt*.25*power;
  mid.rotation.z+=dt*.12*power;
  inner.rotation.y+=dt*.28*power;
  core.rotation.y+=dt*.16*power;
  core.rotation.x+=dt*.09*power;
  pivot.position.y+=(Math.sin(elapsed*.9)*.11+(window.innerWidth<650?-.65:window.innerWidth<980?-.1:.55)-pivot.position.y)*.1;
  const targetX=mouseX*.14;
  const targetY=mouseY*.12;
  camera.position.x+=(targetX-camera.position.x)*.035;
  camera.position.y+=(1.1-targetY-camera.position.y)*.035;
  camera.position.z+=(10.8-camera.position.z)*.018;
  camera.lookAt(0,0.1,0);
  points.rotation.y+=dt*.007;
  glow.material.opacity=.65+.14*Math.sin(elapsed*2.1);
  renderer.render(scene,camera);
  raf=requestAnimationFrame(render);
 }
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
 function refresh(){
  stop();
  if(enabled&&visible&&!document.hidden&&!reduced.matches){clock.getDelta();raf=requestAnimationFrame(render);}
 }
 const onPointer=(e)=>{
  const r=hero.getBoundingClientRect();
  mouseX=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2)));
  mouseY=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));
 };
 hero.addEventListener("pointermove",onPointer,{passive:true});
 hero.addEventListener("pointerleave",()=>{mouseX=0;mouseY=0;});
 window.addEventListener("seak:mode",e=>{mode=e.detail?.mode==="intelligence"?"intelligence":"architecture";});
 const intersection=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting??false;refresh();},{threshold:0});
 intersection.observe(hero);
 const ro=new ResizeObserver(()=>{size();refresh();});ro.observe(hero);
 document.addEventListener("visibilitychange",refresh);
 window.addEventListener("pagehide",()=>{enabled=false;stop();intersection.disconnect();ro.disconnect();renderer.dispose();});
 reduced.addEventListener?.("change",refresh);
 canvas.addEventListener("webglcontextlost",function(e){e.preventDefault();enabled=false;stop();canvas.hidden=true;document.body.classList.remove("seak-webgl-ready");},{passive:false});
 canvas.hidden=false;
 document.body.classList.add("seak-webgl-ready");
 size();refresh();
})();