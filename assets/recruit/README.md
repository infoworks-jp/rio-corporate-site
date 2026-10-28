# 採用導入の動画

2026-10-28、ユーザーが選択した動画を募集一覧の背景に採用。

- 原本: `/Users/kakuyouji2/Documents/Phosphene/mlx_outputs/One_continuous_cinematic_shot_of_the.mp4`
- ローカルのPhospheneで生成した、桜に囲まれたガラスの腕・手の約5秒動画。
- 初版: `glass-hand.mp4`（768×448）。原本の映像をコピーし、音声トラックを除去してfaststartに変更。初版のポスターは `glass-hand-poster.jpg`。
- 高解像度版（2026-10-29）: `glass-hand-hd.mp4`（1920×1120、24fps、121フレーム）。原本を全フレームに分解し、Real-ESRGANの `realesrgan-x4plus` をローカル実行して3072×1792へ拡大後、Lanczosで1920×1120に縮小。H.264 CRF22・slow・無音・faststart。再生成した別の動きへの差し替えではない。
- 静止時: `glass-hand-hd-poster.jpg`。高解像度動画の0.1秒地点を取り出したフレーム。
- 画素数を増やし粗さを抑える処理であり、元にない細部の正確な復元は保証しない。背景のボケや元の動画自体の形の変化は残る。
- 使用ツールの公式配布: https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0 。実行コード: https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan 。作業記録は `/Users/kakuyouji2/Documents/rio-video-upscale/`。
- 見出し・リンク・操作ボタンはHTML。参考WebPの英語・ロゴ・カーソルを使用しない。
- 旧画像合成の試作や3D仮モデルではなく、上記のユーザー指定動画を使用する。

## 以前の桜背景（現行の導入では不使用）

2026-10-28、内蔵 imagegen で制作。
原本: exec-29512dbe-1f93-42b1-911c-96ea5576c5d9.png
プロンプト: Cinematic photorealistic cherry blossoms in a near-black charcoal botanical space. Pale pink sakura and natural branches frame four outer edges, deep green leaves, dark empty center for HTML copy, translucent petals and atmospheric depth. Wide 16:9. No text, logo, people, buildings or watermark.

表示用: sakura-wide.webp / sakura-mobile.webp。文字と舞う花びらはHTML/CSS、停止操作・画面外停止は recruit/sakura.js。参考WebPの文字や映像を埋め込まず、新規背景で構成。
