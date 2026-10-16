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
 checks(await page.locator('a[href="/case-studies/securegate.html"]').count()>0,viewport.name+': case study is not linked');
 const sizes=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,hero:document.querySelector('.stage')?.getBoundingClientRect().width}));
 checks(sizes.scrollWidth<=sizes.width+2,viewport.name+': horizontal overflow '+JSON.stringify(sizes));
 const toggle=page.locator('#menu-button');
 await toggle.click();
 checks(await page.locator('#site-menu').isVisible(),viewport.name+': opening menu failed');
 const links=await page.locator('#site-menu a.nav-panel__link').count();
 checks(links===6,viewport.name+': menu has '+links+' primary links instead of six');
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
for(const id of ['mernorahflow','securegate','roxzy']){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',error=>errors.push(id+' JS: '+error.message));
 const resp=await page.goto(base+'/case-studies/'+id+'.html',{waitUntil:'domcontentloaded'});
 checks(resp?.status()===200,id+': missing case study');
 checks(await page.locator('h1').count()===1,id+': invalid heading count');
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
 checks(await page.locator('.projects > article.project').count()===12,'projects catalog should contain twelve cards');
 checks((await page.locator('#result-count').textContent())?.includes('12 projects'),'initial project count not updated');
 for(const id of ['mernorah-intelligence','mernorah-experience','seak-portfolio']){
  checks(await page.locator('#'+id).count()===1,'new engineering project missing: '+id);
 }
 const arrows=await page.locator('a,button').evaluateAll(nodes=>nodes.filter(n=>/[↗↓←➤⟶]/.test(n.textContent||'')).length);
 checks(arrows===0,'decorative arrows remain in interactive controls');
 const filter=page.locator('[data-filter="security"]');await filter.click();
 checks(await page.locator('[data-category]:visible').count()>=1,'security filter leaves no projects');
 await page.goto(base+'/contact.html',{waitUntil:'domcontentloaded'});
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
console.log('PASS — browser smoke suite across desktop, mobile, small mobile, twelve projects, streamlined controls, case studies, filtering and form validation.');
