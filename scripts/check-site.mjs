import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const pages=['index.html','projects.html','about.html','experience.html','contact.html','resume.html'];
const assets=['assets/editorial.css','assets/editorial.js','assets/seak-portrait-clean.webp','assets/Sukkah_Emmanuel_CV_2026.pdf','assets/mark.svg'];
for(const file of [...pages,...assets])if(!fs.existsSync(file))throw Error('Required file missing: '+file);
for(const file of ['assets/editorial.js']){const p=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(p.status!==0)throw Error('JavaScript syntax error '+file+'\n'+p.stderr);}
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 if(!/<main\b[^>]*id=["']main["']/.test(html))throw Error('Missing main landmark: '+file);
 if(!html.includes('<title>')||!html.includes('name="description"')||!html.includes('rel="canonical"'))throw Error('Missing SEO data: '+file);
 if(!html.includes('id="menu-button"')||!html.includes('id="site-menu"'))throw Error('Navigation missing: '+file);
 if(!html.includes('href="/projects.html"')||!html.includes('href="/contact.html"'))throw Error('Recruiter navigation missing: '+file);
 if((html.match(/<h1\b/gi)||[]).length!==1)throw Error('Expected exactly one H1: '+file);
 if(/\s+on(?:click|load|error|mouseover|focus)\s*=/i.test(html))throw Error('Unsafe inline event attribute: '+file);
 const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
 if(ids.length!==new Set(ids).size)throw Error('Duplicate IDs: '+file);
 for(const tag of html.matchAll(/<img\b[^>]*>/gi))if(!/\balt=["']/.test(tag[0]))throw Error('Image missing alt: '+file);
 for(const link of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi))if(!/\brel=["'][^"']*noopener/.test(link[0]))throw Error('Unsafe target=_blank: '+file);
 for(const m of html.matchAll(/(?:href|src|action)=["']([^"']+)["']/g)){
  const url=m[1];if(!url||/^(https?:|mailto:|tel:|data:)/.test(url))continue;
  if(/^javascript:/i.test(url))throw Error('Unsafe URI: '+file);
  const [loc,fragment]=url.split('#');const source=loc||file;
  const target=source.startsWith('/')?path.join(process.cwd(),source.slice(1)):path.join(process.cwd(),path.dirname(file),source);
  const pathWithoutQuery=target.split('?')[0];
  if(!fs.existsSync(pathWithoutQuery))throw Error('Broken local asset/link: '+file+' => '+url);
  if(fragment){const other=fs.readFileSync(pathWithoutQuery,'utf8');if(!other.includes('id="'+decodeURIComponent(fragment)+'"'))throw Error('Broken fragment: '+file+' => '+url)}
 }
}
for(const page of pages){
 const html=fs.readFileSync(page,'utf8');
 if(!html.includes('tabindex="-1"'))throw Error('Skip target cannot receive focus: '+page);
 if(!html.includes('/assets/editorial.css?v=20261016quality1'))throw Error('CSS version was not refreshed: '+page);
 if(!html.includes('/assets/editorial.js?v=20261016quality1'))throw Error('JS version was not refreshed: '+page);
 if(page!=='resume.html'){
  const expected=page==='index.html'?'/':'/'+page;
  if(!html.includes('aria-current="page" href="'+expected+'"'))throw Error('Current page not identified: '+page);
 }
}
const home=fs.readFileSync('index.html','utf8');
for(const must of ['id="slide-heading"','id="next-slide"','id="progress-fill"','class="stage__ring"','class="stage__portrait"','/assets/seak-portrait-clean.webp','/assets/editorial.css','/assets/editorial.js'])if(!home.includes(must))throw Error('Reference design element missing: '+must);
if(!home.includes('DOWNLOAD CV ↓')||!home.includes('CONTACT ↗'))throw Error('Homepage recruiter quicklinks missing');
const projects=fs.readFileSync('projects.html','utf8');
for(const id of ['mernorahflow','securegate','roxzy','farmart','retailcore','hopehills','netpulse','innovartus','mernorah-web'])if(!projects.includes('id="'+id+'"')||!projects.includes('id="'+id+'-case"'))throw Error('Project omitted: '+id);
if(!projects.includes('src="/assets/v3-flow-demo.webp"'))throw Error('Local demonstration evidence missing');
const contact=fs.readFileSync('contact.html','utf8');
if(!contact.includes('action="https://formsubmit.co/ajax/')||!contact.includes('mailto:sukahemmanuelkofi@gmail.com'))throw Error('Contact form or fallback missing');
const cv=fs.readFileSync('assets/Sukkah_Emmanuel_CV_2026.pdf');
const hash=createHash('sha1').update(Buffer.from('blob '+cv.length+'\0')).update(cv).digest('hex');
if(hash!=='bee9ac49c2821b797e6beae151a8f925e066924c')throw Error('Approved CV changed. Halt deployment.');
const js=fs.readFileSync('assets/editorial.js','utf8');
for(const expected of ['function closeMenu(restoreFocus=true)','focusables=[toggle,','document.createElement("a")']){
 if(!js.includes(expected))throw Error('Menu keyboard or contact fallback regression: '+expected);
}
const css=fs.readFileSync('assets/editorial.css','utf8');
for(const key of ['--orange:#ff6d26','grid-template','prefers-reduced-motion','max-width:650px'])if(!css.includes(key))throw Error('Design or accessibility regression: '+key);
console.log('PASS — six pages, nine project case studies, navigation, assets, JS syntax, accessibility basics, and unchanged approved CV.');
