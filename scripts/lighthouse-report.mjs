import fs from "node:fs";
const files=[
  ["homepage","test-output/lighthouse-home.json"],
  ["projects","test-output/lighthouse-projects.json"],
  ["contact","test-output/lighthouse-contact.json"]
];
const report=[];
for (const [name,file] of files){
 if(!fs.existsSync(file))throw Error("Missing Lighthouse results: "+file);
 const result=JSON.parse(fs.readFileSync(file,"utf8"));
 const scores=Object.fromEntries(["performance","accessibility","best-practices","seo"].map(key=>[key,Math.round((result.categories?.[key]?.score??0)*100)]));
 const audit=id=>result.audits?.[id]?.numericValue??null;
 report.push({page:name,...scores,firstContentfulPaintMs:audit("first-contentful-paint"),largestContentfulPaintMs:audit("largest-contentful-paint"),totalBlockingTimeMs:audit("total-blocking-time"),cumulativeLayoutShift:audit("cumulative-layout-shift")});
}
console.log("LIGHTHOUSE_LOCAL_AUDIT "+JSON.stringify(report,null,2));
if(report.some(row=>row.accessibility<85||row.seo<85))throw Error("Review accessibility or SEO score below 85; inspect Lighthouse artifacts.");
