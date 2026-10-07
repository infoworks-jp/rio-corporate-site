# 端末内AIランタイム

WebGPU対応端末：EmbeddingGemma 2 ONNX、text only、q4。WebGPU非対応端末：多言語MiniLM q8、WASM。モデル revision: daa72c51243991dfcaf9f9137d2c573d8f7790c0。
初回はモデル約175MB、tokenizer約32MB、実行ファイル約28MBを取得します。HFのモデルはブラウザキャッシュに保存されますが、ブラウザによる削除・再取得があります。質問・履歴は送信・永続保存しません。モデル取得先には通常の通信情報（IP等）が渡ります。

`npm install && npm run build` で worker を再生成。`copy-wasm.js` がonnxruntime-web/distのasyncify / jsep実行ファイルをコピーします。第三者ライセンスを同梱しています。

視覚・音声エンコーダーを読み込まず、登録回答の意味検索だけを行います。低い類似度（Gemma: 0.72未満 / MiniLM: 0.55未満）または上位差（Gemma: 0.035未満 / MiniLM: 0.08未満）は問い合わせ案内。しきい値は運用時に実際の質問で評価してください。モバイルの処理速度・メモリ使用量は端末によります。無料ホスティングにも規約・配信制限があり、利用者100万人の総費用0円は保証しません。

MiniLM revision: 2c4055b12046f11709e9df2c122e59ffbdc2f900。初回はモデル約118MB＋tokenizer＋実行ファイルで約150MB。WebGPU対応でもモデル初期化に失敗した場合は通常FAQを利用できます。小さい登録コーパスのため768次元を維持し、MRL圧縮は使用しません。

未使用のMistralモデル登録はビルド後に除去します。公開クラス名がGitHubのAPIキー検出に誤認されるためで、このチャットでは当該モデルを使用しません。
