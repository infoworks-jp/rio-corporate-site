import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePayload,classifySpam,verifyTurnstile,readPayload} from '../supabase/functions/rio-contact/security.ts';
import {createHandler} from '../supabase/functions/rio-contact/handler.ts';
const valid={type:'工事・お見積りについて',name:'テスト担当',company:'',email:'person@example.com',tel:'',message:'札幌市内の店舗の内装解体のお見積りをお願いします。'};
const req=(data=valid,extras={})=>new Request('https://example.com/contact',{method:'POST',headers:{origin:'https://rio-works.com','content-type':'application/json','x-forwarded-for':'192.0.2.1',...extras},body:JSON.stringify(data)});
function fixture({env={},prior=[],deny=false,mailFailure=false,turnstile={success:true,hostname:'rio-works.com',action:'rio_contact'}}={}){
  const queries=[],requests=[];
  const sql=async(strings,...values)=>{
    const query=strings.join('?');queries.push({query,values});
    if(query.includes('select id,status'))return prior;
    if(query.includes('returning count'))return deny?[]:[{count:1}];
    if(query.includes('returning id'))return [{id:'00000000-0000-0000-0000-000000000001'}];
    return [];
  };
  sql.begin=async cb=>cb(sql);sql.end=async()=>{};
  const request=async(url,init)=>{requests.push({url,init});if(url.includes('siteverify'))return Response.json(turnstile);if(mailFailure)throw new Error('network error');return Response.json({success:true});};
  return {handler:createHandler({env:k=>({SUPABASE_DB_URL:'test',...env})[k],connect:()=>sql,request}),queries,requests};
}
test('accepts legitimate Japanese and English enquiries',()=>{
  assert.ok(validatePayload(valid));
  for(const message of [valid.message,'We would like a quote for demolition. https://example.com/plan','協力会社として足場工事のご相談です。無料相談は可能でしょうか。','採用の面接についてお伺いしたいです。'])assert.equal(classifySpam(message).quarantined,false);
});
test('quarantines combined sales signals and retains reasons',()=>{
  const r=classifySpam('SEO対策と集客支援のご提案です。無料診断を提供します。');assert.equal(r.quarantined,true);assert.equal(r.reasons.length,2);
  assert.equal(classifySpam('SEO対策').quarantined,false);
});
test('rejects null, arrays, objects, oversized fields and header injection',()=>{
  for(const value of [null,[],{...valid,name:{}},{...valid,message:'a'.repeat(5001)},{...valid,email:'x@example.com\r\nBcc:spam@example.com'},{...valid,type:'arbitrary'},{...valid,type:'協力会社について',company:''}])assert.equal(validatePayload(value),null);
});
test('caps streamed request size without content-length',async()=>{
  await assert.rejects(()=>readPayload(req({...valid,message:'あ'.repeat(15000)})),/payload_too_large/);
});
test('checks captcha success, hostname, action and missing token',async()=>{
  for(const outcome of [{success:false},{success:true,hostname:'evil.example',action:'rio_contact'},{success:true,hostname:'rio-works.com',action:'login'}])assert.equal(await verifyTurnstile('token','secret','https://rio-works.com',async()=>Response.json(outcome)),false);
  assert.equal(await verifyTurnstile('','secret','https://rio-works.com',()=>{throw Error('must not call');}),false);
});
test('valid enquiry saved before email, then marked sent',async()=>{
  const f=fixture();assert.equal((await f.handler(req())).status,200);assert.equal(f.requests.length,1);
  assert.ok(f.queries.some(q=>q.query.includes('insert into public.rio_contact_submissions')));
  assert.ok(f.queries.at(-1).query.includes("status='sent'"));
});
test('honeypot causes no DB writes and no mail',async()=>{
  const f=fixture();assert.equal((await f.handler(req({...valid,website:'https://spam.example'}))).status,200);assert.equal(f.queries.length,0);assert.equal(f.requests.length,0);
});
test('quarantine saves content but does not send email',async()=>{
  const f=fixture();assert.equal((await f.handler(req({...valid,message:'SEO対策の無料診断をご提案します。'}))).status,200);assert.equal(f.requests.length,0);
  assert.ok(f.queries.find(q=>q.query.includes('returning id')).values.includes('quarantined'));
});
test('rate rejection returns retry-after and no saved submission or mail',async()=>{
  const f=fixture({deny:true});const r=await f.handler(req());assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'3600');assert.equal(f.requests.length,0);assert.ok(!f.queries.some(q=>q.query.includes('returning id')));
});
test('changing user-agent does not change IP rate key',async()=>{
  const a=fixture(),b=fixture();await a.handler(req(valid,{'user-agent':'browser1'}));await b.handler(req(valid,{'user-agent':'browser2'}));
  assert.equal(a.queries.find(q=>q.query.includes('returning count')).values[0],b.queries.find(q=>q.query.includes('returning count')).values[0]);
});
test('duplicate does not send mail or consume counter',async()=>{
  const f=fixture({prior:[{id:'id',status:'sent'}]});assert.equal((await (await f.handler(req())).json()).duplicate,true);assert.equal(f.requests.length,0);assert.ok(!f.queries.some(q=>q.query.includes('returning count')));
});
test('failed or pending duplicate reports saved instead of claiming email sent',async()=>{
  for(const status of ['mail_failed','received']){const f=fixture({prior:[{id:'id',status}]});const body=await (await f.handler(req())).json();assert.equal(body.ok,false);assert.equal(body.saved,true);assert.equal(f.requests.length,0);}
});
test('email network failure preserves receipt and reports saved',async()=>{
  const f=fixture({mailFailure:true});const r=await f.handler(req());assert.equal(r.status,502);assert.equal((await r.json()).saved,true);assert.ok(f.queries.at(-1).query.includes("status='mail_failed'"));
});
test('Turnstile enabled rejects missing/invalid token before DB writes',async()=>{
  const f=fixture({env:{TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret'},turnstile:{success:false}});
  for(const turnstileToken of ['','bad-token'])assert.equal((await f.handler(req({...valid,turnstileToken}))).status,403);
  assert.equal(f.queries.length,0);
});
test('valid Turnstile token permits normal delivery',async()=>{
  const f=fixture({env:{TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret'}});assert.equal((await f.handler(req({...valid,turnstileToken:'valid-token'}))).status,200);assert.equal(f.requests.length,2);
});
test('partial captcha configuration fails closed',async()=>{
  const f=fixture({env:{TURNSTILE_SITE_KEY:'site'}});assert.equal((await f.handler(req())).status,503);assert.equal(f.requests.length,0);
});
test('invalid origin rejected and GET only exposes public site key',async()=>{
  const f=fixture({env:{TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret'}});assert.equal((await f.handler(req(valid,{origin:'https://evil.example'}))).status,403);
  const r=await f.handler(new Request('https://example.com'));const body=await r.json();assert.equal(body.turnstileSiteKey,'site');assert.ok(!JSON.stringify(body).includes('secret'));assert.equal(r.headers.get('cache-control'),'no-store');
});
