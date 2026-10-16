import test from "node:test";
import assert from "node:assert/strict";
import { authorize, AccessDenied } from "./access.mjs";
import { createJournal, postJournal, JournalError } from "./journal.mjs";
import { signedHeader, verifyEvent } from "./webhook.mjs";
const org="org-1", otherOrg="org-2";
const member={ id:"u-1", organizationId:org, active:true, roles:["member"] };
const auditor={ id:"u-2", organizationId:org, active:true, roles:["auditor"] };
const admin={ id:"u-3", organizationId:org, active:true, roles:["admin"] };
const own={ id:"r-1", ownerId:"u-1", organizationId:org };
const foreign={ id:"r-2", ownerId:"u-1", organizationId:otherOrg };
function denied(fn,status){assert.throws(fn,e=>e instanceof AccessDenied&&e.status===status)}
test("member can read and update an owned resource",()=>{
 assert.equal(authorize({actor:member,resource:own,operation:"read"}).resourceId,"r-1");
 assert.equal(authorize({actor:member,resource:own,operation:"update"}).operation,"update");
});
test("unauthenticated principal is rejected",()=>denied(()=>authorize({actor:null,resource:own,operation:"read"}),401));
test("inactive principal is rejected",()=>denied(()=>authorize({actor:{...admin,active:false},resource:own,operation:"read"}),401));
test("cross-organization resources are hidden even from admins",()=>denied(()=>authorize({actor:admin,resource:foreign,operation:"read"}),404));
test("nonexistent resource is indistinguishable from foreign resource",()=>{
 for(const resource of [null,foreign]) assert.throws(()=>authorize({actor:member,resource,operation:"read"}),{status:404,message:"Resource not found"});
});
test("member cannot access another member's resource",()=>denied(()=>authorize({actor:member,resource:{...own,ownerId:"u-8"},operation:"read"}),403));
test("auditor reads but cannot update",()=>{
 assert.equal(authorize({actor:auditor,resource:own,operation:"read"}).operation,"read");
 denied(()=>authorize({actor:auditor,resource:own,operation:"update"}),403);
});
test("admin updates same-organization records",()=>assert.equal(authorize({actor:admin,resource:own,operation:"update"}).operation,"update"));
test("unknown operation denied by default",()=>denied(()=>authorize({actor:admin,resource:own,operation:"delete"}),403));
const lines=[{account:"cash",currency:"GHS",amountMinor:1250},{account:"revenue",currency:"GHS",amountMinor:-1250}];
test("balanced journal uses integer minor units",()=>{
 const store=createJournal();const receipt=postJournal(store,{key:"payment-001",lines});
 assert.equal(receipt.replayed,false);assert.equal(store.entries.length,2);
 assert.equal(store.entries.reduce((s,x)=>s+BigInt(x.amountMinor),0n),0n);
});
test("identical idempotent retry adds no entries",()=>{
 const store=createJournal();const before=postJournal(store,{key:"payment-002",lines});
 const again=postJournal(store,{key:"payment-002",lines});
 assert.equal(again.id,before.id);assert.equal(again.replayed,true);assert.equal(store.entries.length,2);
});
test("key collision with changed posting is denied",()=>{
 const store=createJournal();postJournal(store,{key:"payment-003",lines});
 assert.throws(()=>postJournal(store,{key:"payment-003",lines:[{...lines[0],amountMinor:5},{...lines[1],amountMinor:-5}]}),e=>e instanceof JournalError&&e.code==="KEY_CONFLICT");
 assert.equal(store.entries.length,2);
});
test("unbalanced journal cannot partially mutate store",()=>{
 const store=createJournal();
 assert.throws(()=>postJournal(store,{key:"payment-004",lines:[lines[0],{...lines[1],amountMinor:-100}]}),{code:"UNBALANCED"});
 assert.equal(store.entries.length,0);assert.equal(store.receipts.size,0);
});
test("mixed currencies cannot balance by accident",()=>{
 const store=createJournal();
 assert.throws(()=>postJournal(store,{key:"payment-005",lines:[lines[0],{...lines[1],currency:"USD"}]}),{code:"INVALID_AMOUNT"});
});
test("unsafe float amounts cannot enter ledger",()=>{
 const store=createJournal();
 assert.throws(()=>postJournal(store,{key:"payment-006",lines:[{...lines[0],amountMinor:1.5},{...lines[1],amountMinor:-1.5}]}),{code:"INVALID_AMOUNT"});
});
test("duplicate account lines are rejected",()=>assert.throws(()=>postJournal(createJournal(),{key:"payment-007",lines:[lines[0],{...lines[1],account:"cash"}]}),{code:"INVALID_ACCOUNT"}));
test("caller mutation does not alter stored posting",()=>{
 const store=createJournal(), mutable=structuredClone(lines);
 postJournal(store,{key:"payment-008",lines:mutable});
 mutable[0].amountMinor=0;
 assert.equal(store.entries[0].amountMinor,1250);
});
const secret="a-demo-secret-with-more-than-16-characters";
const timestamp=1700000000,nowMs=timestamp*1000,rawBody='{"id":"evt_01","type":"payment.confirmed"}';
const signature=signedHeader({secret,timestamp,rawBody});
test("valid event signature is accepted",()=>assert.equal(verifyEvent({secret,timestamp,rawBody,signature,nowMs}),true));
test("body tampering invalidates signature",()=>assert.equal(verifyEvent({secret,timestamp,rawBody:rawBody+" ",signature,nowMs}),false));
test("wrong secret invalidates signature",()=>assert.equal(verifyEvent({secret:"a-completely-different-demo-secret",timestamp,rawBody,signature,nowMs}),false));
test("stale event is rejected",()=>assert.equal(verifyEvent({secret,timestamp,rawBody,signature,nowMs:nowMs+300001}),false));
test("malformed signature rejected",()=>assert.equal(verifyEvent({secret,timestamp,rawBody,signature:"sha256=xyz",nowMs}),false));
test("invalid timestamps denied",()=>assert.equal(verifyEvent({secret,timestamp:NaN,rawBody,signature,nowMs}),false));
