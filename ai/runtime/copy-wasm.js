import {copyFileSync} from 'node:fs';
for(const kind of ['asyncify','jsep'])for(const ext of ['mjs','wasm'])copyFileSync(`node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.${kind}.${ext}`,`ort-wasm-simd-threaded.${kind}.${ext}`);
