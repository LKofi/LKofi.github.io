
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const pages=['index.html','projects.html','about.html','experience.html','contact.html','resume.html'];
const assets=['assets/v2.css','assets/v2.js','assets/v3-home.css','assets/v3-home.js','assets/v4-inner.css','assets/v4-inner.js','assets/v3-hero.webp','assets/v3-flow-demo.webp','assets/v5.css','assets/v5.js','assets/v5-immersive.css','assets/v5-immersive.js','assets/v5-world.mjs','assets/hero-portrait.webp','assets/Sukkah_Emmanuel_CV_2026.pdf','assets/mark.svg'];
for(const f of [...pages,...assets])if(!fs.existsSync(f))throw Error('Missing '+f);
for(const file of ['assets/v2.js','assets/v3-home.js','assets/v4-inner.js','assets/v5.js','assets/v5-immersive.js','assets/v5-world.mjs']){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(r.status!==0)throw Error('JavaScript syntax: '+file+'\n'+r.stderr);
}
for(const f of pages){
 const html=fs.readFileSync(f,'utf8');
 if(f!=='resume.html'&&!html.match(/<main\b[^>]*id=["']main["']/))throw Error('Missing main '+f);
 if(!html.includes('<title>'))throw Error('No title '+f);
 const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
 for(const m of html.matchAll(/(?:href|src|action)=["']([^"']+)["']/g)){
  const url=m[1];
  if(url.startsWith('#')){if(url!=='#'&&!ids.has(decodeURIComponent(url.slice(1))))throw Error('Bad anchor '+f+' '+url);continue;}
  if(/^(https?:|mailto:|tel:|data:|javascript:)/.test(url)){if(url.startsWith('javascript:'))throw Error('Unsafe link '+f);continue;}
  const p=url.split(/[?#]/)[0];
  if(!p)continue;
  const dest=p.startsWith('/')?path.join(process.cwd(),p.slice(1)):path.join(process.cwd(),path.dirname(f),p);
  if(!fs.existsSync(dest))throw Error('Broken local reference '+f+' → '+url);
 }
}
for(const [page,label] of Object.entries({'projects.html':'Projects','about.html':'About','experience.html':'Experience','contact.html':'Contact'})){if(!fs.readFileSync(page,'utf8').includes('<title>'+label+' — Sukkah Emmanuel</title>'))throw Error('Incorrect browser title '+page)}
const home=fs.readFileSync('index.html','utf8');
for(const marker of ['id="hero-title"','href="/projects.html"','href="/contact.html"','/assets/v5.css','/assets/v5.js','Manrope','og:image'])if(!home.includes(marker))throw Error('Homepage regression '+marker);
if(home.includes('after the homepage design is approved'))throw Error('Preview-only copy published');
const projects=fs.readFileSync('projects.html','utf8');
const ids=['mernorahflow','securegate','roxzy','farmart','retailcore','hopehills','netpulse','innovartus','mernorah-web'];
for(const id of ids)if(!projects.includes('id="'+id+'"')||!projects.includes('id="'+id+'-case"'))throw Error('Missing project '+id);
const contact=fs.readFileSync('contact.html','utf8');
if(!contact.includes('action="https://formsubmit.co/ajax/'))throw Error('Missing contact relay');
if(!contact.includes('mailto:sukahemmanuelkofi@gmail.com'))throw Error('Missing email fallback');

// Pre-release hardening checks for accessibility, recruiter links and the approved CV.
for (const file of pages) {
 const html=fs.readFileSync(file,'utf8');
 const headings=[...html.matchAll(/<h1\b/gi)];
 if(headings.length!==1)throw Error('Expected one H1 in '+file+'; found '+headings.length);
 if(/\s+on(?:click|load|error|mouseover|focus)\s*=/i.test(html))throw Error('Inline event handler in '+file);
 const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
 if(ids.length!==new Set(ids).size)throw Error('Duplicate IDs in '+file);
 for(const tag of html.matchAll(/<img\b[^>]*>/gi))if(!/\balt=["']/.test(tag[0]))throw Error('Image missing alt in '+file);
 for(const link of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi))if(!/\brel=["'][^"']*noopener/.test(link[0]))throw Error('Unsafe target=_blank in '+file);
 for(const m of html.matchAll(/href=["']([^"']+#[^"']+)["']/g)){
  const [pathname,fragment]=m[1].split('#');
  if(!fragment)continue;
  const dest=pathname?pathname.startsWith('/')?path.join(process.cwd(),pathname.slice(1)):path.join(process.cwd(),path.dirname(file),pathname):path.join(process.cwd(),file);
  if(!fs.existsSync(dest))throw Error('Missing fragment destination '+file+' → '+m[1]);
  const target=fs.readFileSync(dest,'utf8');
  if(!target.includes('id="'+decodeURIComponent(fragment)+'"')&&!target.includes("id='"+decodeURIComponent(fragment)+"'"))throw Error('Broken fragment '+file+' → '+m[1]);
 }
}
const {createHash}=await import('node:crypto');
const cv=fs.readFileSync('assets/Sukkah_Emmanuel_CV_2026.pdf');
const cvSha=createHash('sha1').update(Buffer.from('blob '+cv.length+'\0')).update(cv).digest('hex');
if(cvSha!=='bee9ac49c2821b797e6beae151a8f925e066924c')throw Error('Approved 2026 CV changed; re-verify before release');
const homeText=fs.readFileSync('index.html','utf8');
for(const item of ['id="hero-title"','href="/projects.html#mernorahflow"','href="/projects.html#securegate"','href="/projects.html#roxzy"','href="/assets/Sukkah_Emmanuel_CV_2026.pdf"'])if(!homeText.includes(item))throw Error('Recruiter conversion link missing '+item);

const immersiveHome=fs.readFileSync('index.html','utf8');
for (const item of ['SEAK<span>.</span>','class="hero seak-hero"','id="seak-core-toggle"','id="seak-particles"','/assets/v5-immersive.css','/assets/v5-immersive.js','/assets/v5-world.mjs','id="seak-world-3d"','/assets/v3-hero.webp']) {
 if(!immersiveHome.includes(item))throw Error('V5 immersive requirement missing '+item);
}
for(const file of ['projects.html','about.html','experience.html','contact.html']) {
 const page=fs.readFileSync(file,'utf8');
 if(!page.includes('SEAK<span>.</span>')||!page.includes('/assets/v5-immersive.css'))throw Error('SEAK branding incomplete '+file);
}
const immersiveJS=fs.readFileSync('assets/v5-immersive.js','utf8');
for(const t of ['requestAnimationFrame','prefers-reduced-motion','aria-pressed','visibilitychange','IntersectionObserver'])
 if(!immersiveJS.includes(t))throw Error('Immersive interactivity or accessibility regression: '+t);

const world=fs.readFileSync('assets/v5-world.mjs','utf8');
for(const item of ['three@0.180.0','new THREE.WebGLRenderer','new THREE.MeshPhysicalMaterial','IntersectionObserver','prefers-reduced-motion','seak-webgl-ready','canvas.hidden=false'])if(!world.includes(item))throw Error('3D world regression '+item);
if(/https?:\/\/(?!cdn\.jsdelivr\.net)/i.test(world))throw Error('Unexpected external 3D source');

// The V5.2 art-direction correction must not regress into a face-obscuring hero.
const heroV52=fs.readFileSync('index.html','utf8');
for(const required of ['Engineering systems that matter.','<span>systems</span>','<span><em>that matter.</em></span>','seak-label-small','id="seak-core-toggle"'])if(!heroV52.includes(required))throw Error('V5.2 hero composition regression '+required);
const immersiveCss=fs.readFileSync('assets/v5-immersive.css','utf8');
for(const required of ['V5.2 — Visual correction','z-index:1!important','top:auto!important;bottom:12%!important','seak-label-small{display:inline}'])if(!immersiveCss.includes(required))throw Error('V5.2 visual regression '+required);
console.log('PASS — six pages, navigation references, nine case studies, five JS bundles, fonts, CV and contact fallback.');
