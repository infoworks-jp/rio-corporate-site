import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import chatJobs from '../ai/rio-jobs.generated.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const jobs=JSON.parse(read('recruit/jobs.json'));
test('current construction and office jobs retain verified application links',()=>{
 assert.deepEqual(jobs.map(j=>j.slug),['sapporo','yokohama','yokohama-office']);
 assert.equal(chatJobs.length,3);
 for(const [i,jk,min,max] of [[0,'186fc84748c75fce',11000,15000],[1,'781dac6412229d3f',13000,17000]]){
  const j=jobs[i];assert.equal(j.applyUrl,`https://jp.indeed.com/viewjob?jk=${jk}`);assert.equal(j.source,j.applyUrl);
  assert.equal(j.salaryMin,min);assert.equal(j.salaryMax,max);
  const page=read(`recruit/${j.slug}/index.html`);
  assert.equal(page.split(`href="${j.applyUrl}"`).length-1,3);
  const schemas=[...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
  assert.equal(schemas.length,1);const schema=JSON.parse(schemas[0][1]);
  assert.equal(schema.title,j.title);assert.equal(schema.baseSalary.value.minValue,min);assert.equal(schema.baseSalary.value.maxValue,max);
  assert.equal(schema.datePosted,j.datePosted);assert.equal(schema.url,`https://rio-works.com/recruit/${j.slug}/`);
 }
});
test('old Sapporo URLs redirect without old jobs or duplicate structured data',()=>{
 for(const slug of ['sapporo-entry','sapporo-experienced']){
  const page=read(`recruit/${slug}/index.html`);
  assert.match(page,/http-equiv="refresh" content="0;url=\/recruit\/sapporo\/"/);
  assert.match(page,/rel="canonical" href="https:\/\/rio-works.com\/recruit\/sapporo\/"/);
  assert.match(page,/href="\/recruit\/sapporo\/"/);assert.doesNotMatch(page,/JobPosting|91ce7644bf2afaab|18,000/);
 }
 for(const p of ['index.html','recruit/index.html','sitemap.xml','ai/rio-config.js','ai/rio-jobs.generated.js','work-guide/index.html']) assert.doesNotMatch(read(p),/sapporo-entry|sapporo-experienced|91ce7644bf2afaab/);
 assert.equal((read('recruit/index.html').match(/class="job-card"/g)||[]).length,3);
});
test('current working conditions replace outdated ones; ambiguity is disclosed',()=>{
 const sapporo=read('recruit/sapporo/index.html'),yokohama=read('recruit/yokohama/index.html');
 assert.match(sapporo,/運転手当300円／出勤1日/);assert.match(sapporo,/送迎手当300円／出勤1日/);
 assert.match(sapporo,/本採用と同じ.*給与条件が異なる/);assert.doesNotMatch(sapporo,/18,000|週休2日制|固定残業代あり/);
 assert.match(yokohama,/試用期間中の基本給は日給11,000円/);assert.match(yokohama,/月平均20時間以内/);
 assert.match(yokohama,/18～26日/);assert.match(yokohama,/喫煙所あり（屋内）/);
 assert.doesNotMatch(yokohama,/12,000円～16,000円|通勤手当なし|年間休日105|74歳|賞与なし|食事付き|鴨居/);
});

test('office role uses monthly pay with no invented upper limit and correct application route',()=>{
 const page=read('recruit/yokohama-office/index.html');
 const schema=JSON.parse(page.match(/application\/ld\+json">(.*?)<\/script>/)[1]);
 assert.deepEqual(schema.baseSalary.value,{'@type':'QuantitativeValue',minValue:210000,unitText:'MONTH'});
 assert.match(page,/月給210,000円～/);
 assert.match(page,/href="https:\/\/arwrk.net\/recruit\/rio\/14311742\/"/);
 assert.match(page,/CCUS/);assert.match(page,/Buildee/);assert.match(page,/10:00～19:00/);
 assert.doesNotMatch(page,/土工・とび・仮設の仕事を見る|寮についてもご相談/);
 for(const path of ['index.html','recruit/index.html','sitemap.xml','ai/rio-jobs.generated.js']) assert.match(read(path),/yokohama-office/);
});
