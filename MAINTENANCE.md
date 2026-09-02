# 更新ガイド

## 正本と公開先

- 正本: `main`
- 公開: https://infoworks-jp.github.io/rio-corporate-site/
- 公開処理: `.github/workflows/pages.yml`

## 変更したい内容とファイル

| 内容 | 検索語 | ファイル |
|---|---|---|
| 会社概要、住所、電話、従業員数、売上 | `会社名` または現在の値 | `index.html` |
| 札幌・横浜の施工実績 | 工事名 | `index.html` |
| 採用文面 | `現場スタッフ募集` | `index.html` |
| 求人リンク、応募フォーム | `SAPPORO`、`YOKOHAMA`、`ENDPOINT` | `recruit-contact.js` |
| ロゴ・本社・支店・つばさ写真 | ファイル名 | `assets/site/` |
| 流体背景の基本動作 | `CFG` | `site-core.js` |
| 資格・表彰の表示 | `records` | `site.js` |
| 色、余白、レスポンシブ | CSSクラス名 | `styles.css`、`site.js` |

## 外部サービス

- Indeed: 求人詳細へ移動するために使用。
- `rio-works.com`: お問い合わせページ。
- Supabase Edge Function: 応募フォームの送信先。
- 味一番つばさ公式サイト: 相互リンク。

これらはChatGPT Proとは無関係です。表示用の画像・JavaScriptはすべてこのリポジトリ内にあります。

## 公開確認

変更後はGitHub ActionsのPages公開が成功したことを確認し、公開URLをPCとスマートフォンで開いて確認します。「ファイルを変更した」だけでは完了扱いにしません。
