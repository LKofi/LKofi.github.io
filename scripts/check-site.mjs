import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const pages=['index.html','projects.html','about.html','experience.html','contact.html','resume.html','capabilities.html','engineering-roadmap.html','case-studies/mernorahflow.html','case-studies/securegate.html','case-studies/roxzy.html'];
const assets=['assets/editorial.css','assets/credibility.css','assets/capabilities.css','assets/trust.css','assets/editorial.js','assets/seak-portrait-clean.webp','assets/v3-flow-demo.webp','assets/Sukkah_Emmanuel_CV_2026.pdf','assets/mark.svg'];
for(const file of [...pages,...assets])if(!fs.existsSync(file))throw Error('Required file missing: '+file);
for(const file of ['assets/editorial.js']){const p=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(p.status!==0)throw Error('JavaScript syntax error '+file+'\n'+p.stderr);}
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 if(!/<main\b[^>]*id=["']main["']/.test(html))throw Error('Missing main landmark: '+file);
 if(!html.includes('<title>')||!html.includes('name="description"')||!html.includes('rel="canonical"'))throw Error('Missing SEO data: '+file);
 if(!file.startsWith('case-studies/')&&(!html.includes('id="menu-button"')||!html.includes('id="site-menu"')))throw Error('Navigation missing: '+file);
 if(file.startsWith('case-studies/')&&!html.includes('class="case-nav"'))throw Error('Case navigation missing: '+file);
 if(!html.includes('href="/projects.html"')||!html.includes('href="/contact.html"'))throw Error('Recruiter navigation missing: '+file);
 if(!html.includes('href="https://www.linkedin.com/in/sukkah-emmanuel-kofi-4550b63a1/"'))throw Error('LinkedIn profile is not linked: '+file);
 if((html.match(/<h1\b/gi)||[]).length!==1)throw Error('Expected exactly one H1: '+file);
 if(/\s+on(?:click|load|error|mouseover|focus)\s*=/i.test(html))throw Error('Unsafe inline event attribute: '+file);
 const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
 if(ids.length!==new Set(ids).size)throw Error('Duplicate IDs: '+file);
 for(const tag of html.matchAll(/<img\b[^>]*>/gi))if(!/\balt=["']/.test(tag[0]))throw Error('Image missing alt: '+file);
 for(const control of html.matchAll(/<(?:a|button)\b[^>]*>[\s\S]*?<\/(?:a|button)>/gi))if(/[↗↓←➤⟶]/.test(control[0]))throw Error('Unnecessary directional glyph in a link or button: '+file);
 for(const link of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi))if(!/\brel=["'][^"']*noopener/.test(link[0]))throw Error('Unsafe target=_blank: '+file);
 for(const m of html.matchAll(/(?:href|src|action)=["']([^"']+)["']/g)){
  const url=m[1];if(!url||/^(https?:|mailto:|tel:|data:)/.test(url))continue;
  if(/^javascript:/i.test(url))throw Error('Unsafe URI: '+file);
  const [loc,fragment]=url.split('#');
  const target=!loc?path.join(process.cwd(),file):loc.startsWith('/')?path.join(process.cwd(),loc.slice(1)):path.join(process.cwd(),path.dirname(file),loc);
  const pathWithoutQuery=target.split('?')[0];
  if(!fs.existsSync(pathWithoutQuery))throw Error('Broken local asset/link: '+file+' => '+url);
  if(fragment){const other=fs.readFileSync(pathWithoutQuery,'utf8');if(!other.includes('id="'+decodeURIComponent(fragment)+'"'))throw Error('Broken fragment: '+file+' => '+url)}
 }
}
for(const page of pages){
 const html=fs.readFileSync(page,'utf8');
 if(!html.includes('tabindex="-1"'))throw Error('Skip target cannot receive focus: '+page);
 if(!html.includes('/assets/editorial.css?v=20261016trust2'))throw Error('CSS version was not refreshed: '+page);
 if(!html.includes('/assets/editorial.js?v=20261016quality1')&&!html.includes('/assets/editorial.js?v=20261016proof1'))throw Error('JS version was not refreshed: '+page);
 if(!page.startsWith('case-studies/')&&!['resume.html','engineering-roadmap.html'].includes(page)){
  const expected=page==='index.html'?'/':'/'+page;
  if(!html.includes('aria-current="page" href="'+expected+'"'))throw Error('Current page not identified: '+page);
 }
}
const home=fs.readFileSync('index.html','utf8');
for(const must of ['id="slide-heading"','id="next-slide"','id="progress-fill"','class="stage__ring"','class="stage__portrait"','/assets/seak-portrait-clean.webp','/assets/editorial.css','/assets/editorial.js'])if(!home.includes(must))throw Error('Reference design element missing: '+must);
if(!home.includes('DOWNLOAD CV')||!home.includes('CONTACT'))throw Error('Homepage recruiter quicklinks missing');
if(!home.includes('>NEXT</span>')||!home.includes('>VIEW</span>'))throw Error('Slide controls must communicate their action without arrows');
if(!home.includes('class="hero-viewport"')||!home.includes('id="engineering-proof"'))throw Error('Hero viewport or engineering evidence missing');
if(!home.includes('/assets/credibility.css?v=20261016proof1'))throw Error('Proof stylesheet missing on home');
if(!home.includes('id="home-capabilities-title"')||!home.includes('href="/capabilities.html"'))throw Error('Homepage capabilities preview missing');
for(const path of ['/experience.html#role-fit','/projects.html#engineering-review','/contact.html#project-brief'])if(!home.includes(path))throw Error('Audience navigation missing: '+path);
if((home.match(/class="audience__card"/g)||[]).length!==3)throw Error('Three audience paths required');
if(!home.includes('href="/engineering-roadmap.html"'))throw Error('Roadmap link absent from homepage');
const projects=fs.readFileSync('projects.html','utf8');
for(const id of ['mernorahflow','securegate','roxzy','farmart','retailcore','hopehills','netpulse','innovartus','mernorah-web','mernorah-intelligence','mernorah-experience','seak-portfolio'])if(!projects.includes('id="'+id+'"')||!projects.includes('id="'+id+'-case"'))throw Error('Project omitted: '+id);
if(!projects.includes('src="/assets/v3-flow-demo.webp"'))throw Error('Local demonstration evidence missing');
if(!projects.includes('12 projects shown'))throw Error('Initial project count is incorrect');
if((projects.match(/<article class="project[^\"]*" id="/g)||[]).length!==12)throw Error('Exactly twelve project cards expected');
for(const id of ['mernorahflow','securegate','roxzy']){
 const link='/case-studies/'+id+'.html';
 const page=fs.readFileSync('case-studies/'+id+'.html','utf8');
 if(!projects.includes(link)||!home.includes(link))throw Error('Case study not discoverable from home and projects: '+id);
 for(const section of ['id="challenge"','id="role"','id="architecture"','id="decisions"','id="case-evidence"','id="outcome"'])if(!page.includes(section))throw Error('Technical case study incomplete: '+id+'/'+section);
 if(!page.includes('Architecture illustration'))throw Error('Diagram must be labeled: '+id);
}
const capabilities=fs.readFileSync('capabilities.html','utf8');
const roadmap=fs.readFileSync('engineering-roadmap.html','utf8');
for(const category of ['id="expertise"','id="additional-services"','id="industry-experience"','id="industries-to-serve"','id="future-engineering"'])if(!capabilities.includes(category))throw Error('Missing distinct capabilities category: '+category);
if(!capabilities.includes('id="industry-experience"')||!capabilities.includes('id="industries-to-serve"'))throw Error('Past sectors and possible industries must remain distinguished');
if(!capabilities.includes('href="/engineering-roadmap.html"'))throw Error('Future system roadmap is not linked from capabilities');
if(!capabilities.includes('src="/assets/seak-portrait-clean.webp"')&&!capabilities.includes('class="cap-service-grid"'))throw Error('Capabilities page content missing');
for(const marker of ['Planned / Not Delivered','Ledger','Security Monitoring','Enterprise AI','Multi-Tenant SaaS'])if(!roadmap.includes(marker))throw Error('Roadmap status or target project missing: '+marker);
const primaryPages=['index.html','projects.html','about.html','experience.html','contact.html','resume.html','capabilities.html','engineering-roadmap.html'];
for(const page of primaryPages){
 const html=fs.readFileSync(page,'utf8');
 if((html.match(/class="nav-panel__link"/g)||[]).length!==7)throw Error('Seven consistent navigation items expected: '+page);
 if(!html.includes('href="/capabilities.html"'))throw Error('Capabilities navigation missing: '+page);
}
const exp=fs.readFileSync('experience.html','utf8');
if(!exp.includes('id="role-fit"')||!exp.includes('2026 / NETWORK INFRASTRUCTURE'))throw Error('Recruiter evidence or grounded network dates missing');
if(!projects.includes('id="engineering-review"')||!projects.includes('class="review-matrix"'))throw Error('Engineering evidence matrix missing');
for(const id of ['mernorahflow','securegate','roxzy'])if(!fs.readFileSync('case-studies/'+id+'.html','utf8').includes('id="technical-review"'))throw Error('Technical validation context missing: '+id);
const contact=fs.readFileSync('contact.html','utf8');
if(!contact.includes('id="project-brief"')||!contact.includes('client-process__steps'))throw Error('Client scoping and delivery process missing');
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
console.log('PASS — eleven pages, 12 projects, 3 audience pathways, case-study engineering depth, evidence boundaries, seven planned roadmap builds, LinkedIn links, navigation, assets and unchanged approved CV.');
