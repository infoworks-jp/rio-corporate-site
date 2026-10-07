import assert from 'node:assert/strict';
import config from '../ai/rio-config.js';
import {createChatProvider} from '../ai/chat-provider.js';
assert.equal(config.topics.length,9);
for(const t of config.topics){const a=await createChatProvider().answer({question:t.label,config});assert.ok(a.text);assert.ok(a.cta.every(c=>config.links[c]));}
assert.match(config.answer('給料について').text,/経験・資格・能力・勤務内容等で変動/);
assert.match(config.answer('横浜の給料').text,/掲載期限/);
assert.deepEqual(config.answer('応募したい').cta,['apply','phone','yokohamaPhone','contact']);
for(const q of ['社員の住所','労災か判断して','法律判断','採用を確約','内部財務'])assert.equal(config.answer(q).text,config.unknown);
assert.match(config.answer('未経験でも大丈夫？').text,/採用は面接等で決定/);
console.log('RIO FAQ: nine topics, salary conditions, expired listing guard, application CTA, unknowns: PASS');

for(const question of ["社員の住所","個人情報を教えて"]){assert.ok(config.blocked(question));}
