/* Browser smoke checks for the deployed-style static portfolio. */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({
 headless:true,
 ...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),
 args:['--no-sandbox','--disable-dev-shm-usage']
});
const errors=[];
const report=[];
const axeSource=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
async function auditAccessibility(page,label){
 await page.addScriptTag({content:axeSource});
 const findings=await page.evaluate(async()=>{
  const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
  return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,count:v.nodes.length,targets:v.nodes.slice(0,5).map(n=>({selector:n.target,summary:(n.failureSummary||'').slice(0,250)}))}));
 });
 report.push({accessibility:label,violations:findings});
 for(const issue of findings.filter(v=>v.impact==='critical'))errors.push(label+' critical accessibility: '+JSON.stringify(issue));
}

const checks=(condition,message)=>{if(!condition)errors.push(message)};
fs.mkdirSync('test-output',{recursive:true});
for(const viewport of [{width:1440,height:900,name:'desktop'},{width:390,height:844,name:'mobile'},{width:360,height:740,name:'small-mobile'}]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 page.on('pageerror',error=>errors.push(viewport.name+' JavaScript: '+error.message));
 const resp=await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(350);
 checks(resp?.status()===200,viewport.name+': home did not return 200');
 checks(await page.locator('h1').count()===1,viewport.name+': home should have one H1');
 checks(await page.locator('#engineering-proof').count()===1,viewport.name+': engineering proof section missing');
 checks(await page.locator('.audience__card').count()===3,viewport.name+': audience pathways missing');
 checks(await page.locator('.open-source-proof a[href*="engineering-lab"]').count()>=1,viewport.name+': public engineering lab link missing');
 if(viewport.name!=='small-mobile')await auditAccessibility(page,viewport.name+' homepage');
 checks(await page.locator('a[href="/case-studies/securegate.html"]').count()>0,viewport.name+': case study is not linked');
 const sizes=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,hero:document.querySelector('.stage')?.getBoundingClientRect().width}));
 checks(sizes.scrollWidth<=sizes.width+2,viewport.name+': horizontal overflow '+JSON.stringify(sizes));
 const toggle=page.locator('#menu-button');
 await toggle.click();
 checks(await page.locator('#site-menu').isVisible(),viewport.name+': opening menu failed');
 const links=await page.locator('#site-menu a.nav-panel__link').count();
 checks(links===7,viewport.name+': menu has '+links+' primary links instead of seven');
 checks(await page.locator('#site-menu a[href="/capabilities.html"]').count()===1,viewport.name+': capabilities navigation missing');
 await page.keyboard.press('Escape');
 checks(await page.locator('#site-menu').isHidden(),viewport.name+': escape did not close menu');
 checks(await toggle.getAttribute('aria-expanded')==='false',viewport.name+': aria-expanded remains true');
 await toggle.click();
 await page.screenshot({path:'test-output/'+viewport.name+'-menu.png'});
 await toggle.click();
 await page.screenshot({path:'test-output/'+viewport.name+'-home.png',fullPage:true});
 report.push({viewport:viewport.name,...sizes});
 await page.close();
}
for(const viewport of [{width:1440,height:900,name:'desktop'},{width:390,height:844,name:'mobile'},{width:360,height:740,name:'small-mobile'}]){
 for(const target of [{path:'/capabilities.html',key:'capabilities',selector:'#industry-experience'},{path:'/engineering-roadmap.html',key:'roadmap',selector:'.roadmap-panel'}]){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
  page.on('pageerror',error=>errors.push(viewport.name+' '+target.key+' JavaScript: '+error.message));
  const response=await page.goto(base+target.path,{waitUntil:'domcontentloaded'});
  checks(response?.status()===200,viewport.name+' '+target.key+' page returned non-200');
  checks(await page.locator(target.selector).count()>0,viewport.name+' '+target.key+' content missing');
  const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
  checks(dims.scrollWidth<=dims.width+2,viewport.name+' '+target.key+' horizontal overflow: '+JSON.stringify(dims));
  checks(await page.locator('#site-menu a.nav-panel__link').count()===7,viewport.name+' '+target.key+' seven-item menu missing');
  if(viewport.name==='mobile')await auditAccessibility(page,target.key+' mobile');
  if(target.key==='capabilities'){
   checks(await page.locator('.cap-service').count()===6,viewport.name+' capability category count incorrect');
   checks(await page.locator('.cap-sector').count()===7,viewport.name+' prior sector evidence count incorrect');
   checks(await page.locator('.cap-target').count()===8,viewport.name+' potential industries count incorrect');
  }else{
   checks(await page.locator('.roadmap-panel').count()===4,viewport.name+' roadmap technical detail count incorrect');
   checks(await page.locator('.roadmap-small').count()===3,viewport.name+' supplemental roadmap projects absent');
  }
  await page.screenshot({path:'test-output/'+viewport.name+'-'+target.key+'.png',fullPage:viewport.name!=='desktop'});
  report.push({viewport:viewport.name,page:target.key,...dims});
  await page.close();
 }
}
for(const id of ['mernorahflow','securegate','roxzy']){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',error=>errors.push(id+' JS: '+error.message));
 const resp=await page.goto(base+'/case-studies/'+id+'.html',{waitUntil:'domcontentloaded'});
 checks(resp?.status()===200,id+': missing case study');
 checks(await page.locator('h1').count()===1,id+': invalid heading count');
 if(id==='mernorahflow')await auditAccessibility(page,id+' engineering case study');
 checks(await page.locator('.case-flow__step').count()>2,id+': architecture diagram incomplete');
 checks(await page.locator('.case-decision-grid article').count()===3,id+': missing technical trade-offs');
 const sizes=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
 checks(sizes.scrollWidth<=sizes.width+2,id+': horizontal overflow');
 await page.screenshot({path:'test-output/'+id+'-case.png',fullPage:true});
 report.push({caseStudy:id,ok:resp?.status()===200});
 await page.close();
}
{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const r=await page.goto(base+'/projects.html',{waitUntil:'domcontentloaded'});
 checks(r?.status()===200,'projects page missing');
 checks(await page.locator('#engineering-review').count()===1,'engineering evidence matrix missing');
 checks(await page.locator('.review-matrix a[href*="engineering-lab"]').count()>=1,'public engineering test evidence missing');
 await auditAccessibility(page,'projects mobile');
 checks(await page.locator('.projects > article.project').count()===12,'projects catalog should contain twelve cards');
 checks((await page.locator('#result-count').textContent())?.includes('12 projects'),'initial project count not updated');
 for(const id of ['mernorah-intelligence','mernorah-experience','seak-portfolio']){
  checks(await page.locator('#'+id).count()===1,'new engineering project missing: '+id);
 }
 const arrows=await page.locator('a,button').evaluateAll(nodes=>nodes.filter(n=>/[↗↓←➤⟶]/.test(n.textContent||'')).length);
 checks(arrows===0,'decorative arrows remain in interactive controls');
 const filter=page.locator('[data-filter="security"]');await filter.click();
 checks(await page.locator('[data-category]:visible').count()>=1,'security filter leaves no projects');
 await page.goto(base+'/experience.html#role-fit',{waitUntil:'domcontentloaded'});
 checks(await page.locator('#role-fit').count()===1,'role fit entry point missing');
 checks(await page.locator('a[href*="linkedin.com/in/"]').count()>=1,'recruiter social link missing');
 await page.goto(base+'/contact.html#project-brief',{waitUntil:'domcontentloaded'});
 checks(await page.locator('#project-brief').count()===1,'client project brief entry point missing');
 checks(await page.locator('.brief-template summary').count()===1,'direct project email brief missing');
 await page.locator('.brief-template summary').click();
 checks(await page.locator('.brief-template a[href^="mailto:"]').isVisible(),'direct email brief action missing');
 checks(await page.locator('.client-process__steps article').count()===3,'client scoping steps missing');
 await auditAccessibility(page,'contact mobile');
 checks(await page.locator('form#contact-form').count()===1,'contact form missing');
 checks(await page.locator('#contact-email').getAttribute('type')==='email','email input is not validated');
 const validity=await page.locator('#contact-form').evaluate(f=>f.checkValidity());
 checks(validity===false,'empty contact form accepts invalid submission');
 const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
 checks(dims.scrollWidth<=dims.width+2,'mobile contact overflow');
 await page.screenshot({path:'test-output/mobile-contact.png',fullPage:true});
 await page.close();
}
await browser.close();
console.log('BROWSER AUDIT:',JSON.stringify(report,null,2));
if(errors.length){console.error('BROWSER AUDIT FAILURES:\n'+errors.join('\n'));process.exit(1)}
console.log('PASS — browser smoke suite across desktop, mobile, all eleven pages, client/recruiter/engineering paths, critical accessibility checks, case studies, filtering and contact validation.');
