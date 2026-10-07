import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from '../ai/rio-config.js';
import {createChatProvider} from '../ai/chat-provider.js';
assert.equal(config.topics.length,9);
for(const t of config.topics){const a=await createChatProvider().answer({question:t.label,config});assert.ok(a.text);assert.ok(a.cta.every(c=>config.links[c]));}
assert.match(config.answer('給料について').text,/経験・資格・能力・勤務内容等で変動/);
assert.match(config.answer('横浜の給料').text,/広告番号2776304/);
assert.match(config.answer('札幌の求人').text,/広告番号2854905/);
assert.match(config.answer('札幌の求人').text,/2026\/10\/31/);
const homepage=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const listing=fs.readFileSync(new URL('../recruit/index.html',import.meta.url),'utf8');
const sapporoPage=fs.readFileSync(new URL('../recruit/sapporo-experienced/index.html',import.meta.url),'utf8');
const yokohamaPage=fs.readFileSync(new URL('../recruit/yokohama/index.html',import.meta.url),'utf8');
const chatCss=fs.readFileSync(new URL('../ai/chat.css',import.meta.url),'utf8');
for(const slug of ['sapporo-experienced','sapporo-entry','yokohama'])assert.match(homepage,new RegExp(`href="recruit/${slug}/"`));
assert.match(listing,/Airワーク有料掲載中｜広告番号 2854905｜2026\/10\/31まで/);
assert.match(listing,/Airワーク有料掲載中｜広告番号 2776304｜2026\/10\/11まで/);
assert.match(sapporoPage,/広告番号 2854905/);
assert.match(yokohamaPage,/広告番号 2776304/);
assert.match(chatCss,/\.ai-chat-history\{[^}]*overflow:visible/);
assert.doesNotMatch(chatCss,/\.ai-chat-history\{[^}]*overscroll-behavior:contain/);
assert.deepEqual(config.answer('応募したい').cta,['apply','phone','yokohamaPhone','contact']);
for(const q of ['社員の住所','労災か判断して','法律判断','採用を確約','内部財務'])assert.equal(config.answer(q).text,config.unknown);
assert.match(config.answer('未経験でも大丈夫？').text,/採用は面接等で決定/);
console.log('RIO FAQ: nine topics, generated Airwork status, salary conditions, application CTA, unknowns: PASS');

for(const question of ["社員の住所","個人情報を教えて"]){assert.ok(config.blocked(question));}
