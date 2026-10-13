import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const required = ["index.html","resume.html","assets/site.css","assets/site.js","assets/mark.svg","assets/hero-portrait.webp","assets/about-profile.webp","assets/portrait-social.svg"];
for (const file of required) {
  if (!fs.existsSync(path.join(root,file))) throw new Error("Missing asset: "+file);
}
const check = spawnSync(process.execPath, ["--check","assets/site.js"], {encoding:"utf8"});
if (check.status!==0) throw new Error("JavaScript syntax: "+check.stderr);
for (const file of ["index.html","resume.html"]) {
  const html = fs.readFileSync(file,"utf8");
  for (const [,url] of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    if (!url) continue;
    if (url[0] === "#") {
      if (url.length>1 && !html.includes('id="'+url.slice(1)+'"')) throw new Error("Missing anchor: "+url+" in "+file);
      continue;
    }
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const pathname = url.split(/[?#]/)[0];
    const resolved = pathname.startsWith("/")
      ? path.join(root,pathname.slice(1))
      : path.join(root,path.dirname(file),pathname);
    if (!fs.existsSync(resolved)) throw new Error("Broken local link: "+url+" in "+file);
  }
}
const home=fs.readFileSync("index.html","utf8");
for(const id of ["mernorahflow","securegate","roxzy","farmart","retailcore","netpulse","hopehills","innovartus","webdelivery"]){
  if(!home.includes('data-project="'+id+'"')) throw new Error("Missing case study: "+id);
}
if(!home.includes('https://formsubmit.co/ajax/')) throw new Error("Missing contact form endpoint");
console.log("Portfolio check passed: assets, links, syntax, case studies, form wiring.");
