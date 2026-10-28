# 採用導入の動画

2026-10-28、ユーザーが選択した動画を募集一覧の背景に採用。

- 原本: `/Users/kakuyouji2/Documents/Phosphene/mlx_outputs/One_continuous_cinematic_shot_of_the.mp4`
- ローカルのPhospheneで生成した、桜に囲まれたガラスの腕・手の約5秒動画。
- 公開用: `glass-hand.mp4`。映像は再エンコードせずコピーし、音声トラックを除去してfaststartに変更。
- 静止時: `glass-hand-poster.jpg`。原本の0.1秒地点を取り出したフレーム。
- 見出し・リンク・操作ボタンはHTML。参考WebPの英語・ロゴ・カーソルを使用しない。
- 旧画像合成の試作や3D仮モデルではなく、上記のユーザー指定動画を使用する。

## 以前の桜背景（現行の導入では不使用）

2026-10-28、内蔵 imagegen で制作。
原本: exec-29512dbe-1f93-42b1-911c-96ea5576c5d9.png
プロンプト: Cinematic photorealistic cherry blossoms in a near-black charcoal botanical space. Pale pink sakura and natural branches frame four outer edges, deep green leaves, dark empty center for HTML copy, translucent petals and atmospheric depth. Wide 16:9. No text, logo, people, buildings or watermark.

表示用: sakura-wide.webp / sakura-mobile.webp。文字と舞う花びらはHTML/CSS、停止操作・画面外停止は recruit/sakura.js。参考WebPの文字や映像を埋め込まず、新規背景で構成。
