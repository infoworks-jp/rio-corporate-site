import {AutoConfig,AutoModel,AutoTokenizer,pipeline,env} from '@huggingface/transformers';
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.wasmPaths=new URL('./',self.location.href).href;
let model,tokenizer,documents,vectors,extractor,gemma;
const modelId='onnx-community/embeddinggemma-2-ONNX';
async function embed(text){if(extractor)return Array.from((await extractor(text,{pooling:'mean',normalize:true})).data);const out=await model(await tokenizer(text,{truncation:true,max_length:384}));return Array.from(out.sentence_embedding.data);}
function cosine(a,b){let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return dot/Math.sqrt(aa*bb);}
self.onmessage=async({data})=>{try{
 if(data.type==='init'){
  gemma=!data.forceWasm&&!!(await navigator.gpu?.requestAdapter());
  const progress_callback=p=>{if(p.status==='progress')self.postMessage({type:'progress',progress:Math.round(p.progress??0)});};
  if(!gemma){extractor=await pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',device:'wasm',dtype:'q8',progress_callback});}
  else{
  const options={revision:data.revision};
  const config=await AutoConfig.from_pretrained(modelId,options);config.vision_config=config.audio_config=null;
  tokenizer=await AutoTokenizer.from_pretrained(modelId,options);
  model=await AutoModel.from_pretrained(modelId,{...options,config,device:'webgpu',dtype:'q4',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',progress:Math.round(p.progress??0)});}});
  }
  documents=data.documents;vectors=[];
  for(const d of documents){vectors.push(await embed(gemma?`title: ${d.label} | text: ${d.text}`:`${d.label} ${d.text}`));self.postMessage({type:'progress',phase:'index',progress:Math.round(vectors.length/documents.length*100)});}
  self.postMessage({id:data.id,type:'ready',model:gemma?'EmbeddingGemma 2':'多言語MiniLM'});
 }else if(data.type==='search'){
  const vector=await embed(gemma?`task: question answering | query: ${data.question}`:data.question);
  const ranked=vectors.map((v,i)=>({i,score:cosine(vector,v)})).sort((a,b)=>b.score-a.score);
  self.postMessage({id:data.id,type:'result',ranked});
 }
}catch(error){console.warn('Local AI initialization/search failed:',error);self.postMessage({id:data.id,type:'error',message:String(error.message)});}};
