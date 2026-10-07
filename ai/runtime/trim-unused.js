// Remove unused Mistral model registrations: their public class identifier
// is falsely detected as a Mistral API key by GitHub push protection.
// This chat uses only EmbeddingGemma2 and multilingual MiniLM.
import {readFileSync,writeFileSync} from 'node:fs';
const path='worker.js';
writeFileSync(path,readFileSync(path,'utf8').split('\n').filter(line=>!line.trim().startsWith('["mistral3",')).join('\n'));
