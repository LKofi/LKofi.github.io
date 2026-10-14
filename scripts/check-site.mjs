
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const pages=['index.html','projects.html','about.html','experience.html','contact.html','resume.html'];
const assets=['assets/v2.css','assets/v2.js','assets/v3-home.css','assets/v3-home.js','assets/v4-inner.css','assets/v4-inner.js','assets/v3-hero.webp','assets/v3-flow-demo.webp','assets/Sukkah_Emmanuel_CV_2026.pdf','assets/mark.svg'];
for(const f of [...pages,...assets])if(!fs.existsSync(f))throw Error('Missing '+f);
for(const file of ['assets/v2.js','assets/v3-home.js','assets/v4-inner.js']){
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
for(const marker of ['id="hero-title"','href="/projects.html"','href="/contact.html"','/assets/v3-home.css','/assets/v3-home.js','Bodoni+Moda','og:image'])if(!home.includes(marker))throw Error('Homepage regression '+marker);
if(home.includes('after the homepage design is approved'))throw Error('Preview-only copy published');
const projects=fs.readFileSync('projects.html','utf8');
const ids=['mernorahflow','securegate','roxzy','farmart','retailcore','hopehills','netpulse','innovartus','mernorah-web'];
for(const id of ids)if(!projects.includes('id="'+id+'"')||!projects.includes('id="'+id+'-case"'))throw Error('Missing project '+id);
const contact=fs.readFileSync('contact.html','utf8');
if(!contact.includes('action="https://formsubmit.co/ajax/'))throw Error('Missing contact relay');
if(!contact.includes('mailto:sukahemmanuelkofi@gmail.com'))throw Error('Missing email fallback');
console.log('PASS — six pages, navigation references, nine case studies, four JS bundles, fonts, CV and contact fallback.');
