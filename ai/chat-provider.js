const REVISION='daa72c51243991dfcaf9f9137d2c573d8f7790c0';
export function createChatProvider({AI_PROVIDER='faq'}={}) {
 if(!['faq','local'].includes(AI_PROVIDER))throw new Error('未対応のAI方式です');
 let worker,modelName,ready=false,sequence=0,pending=new Map();
 const stop=()=>{worker?.terminate();worker=null;ready=false;for(const p of pending.values())p.reject(new Error('中止しました'));pending.clear();};
 function request(data,signal){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});worker.postMessage({...data,id});signal?.addEventListener('abort',()=>{pending.delete(id);reject(new DOMException('中止','AbortError'));},{once:true});});}
 return {name:'local',get ready(){return ready;},stop,
 async enable(config,onProgress){
  if(ready)return;
  stop();worker=new Worker(new URL('./runtime/worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(data.type==='progress'){onProgress?.(data.progress,data.phase);return;}const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.type==='error'?p.reject(new Error(data.message)):p.resolve(data);};
  worker.onerror=()=>stop();
  const active=worker;try{const result=await request({type:'init',revision:REVISION,documents:config.topics});modelName=result.model;ready=true;return modelName;}catch(e){if(worker===active)stop();throw e;}
 },
 async answer({question,config,signal}) {
  if(signal?.aborted)throw new DOMException('中止','AbortError');
  const direct=config.answer(question);
  // Unregistered or sensitive questions never receive an invented answer.
  if(!ready||direct.text!==config.unknown||config.blocked(question))return direct;
  const {ranked}=await request({type:'search',question},signal);
  const best=ranked[0],next=ranked[1];
  if(best.score<(modelName==='EmbeddingGemma 2'?0.72:0.55)||best.score-next.score<(modelName==='EmbeddingGemma 2'?0.035:0.08))return direct;
  const found=config.topics[best.i];
  return {text:`関連する登録情報「${found.label}」をご案内します。\n${found.text}`,cta:found.cta};
 }};
}
