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
| 求人リンク、応募フォーム画面 | `SAPPORO`、`YOKOHAMA`、`ENDPOINT` | `recruit-contact.js` |
| 応募フォーム受付処理 | `rio-contact` | `supabase/functions/rio-contact/index.ts` |
| 応募フォーム自動稼働確認 | `Keep contact form available` | `.github/workflows/contact-form-health.yml` |
| ロゴ・本社・支店・つばさ写真 | ファイル名 | `assets/site/` |
| 流体背景の基本動作 | `CFG` | `site-core.js` |
| 資格・表彰の表示 | `records` | `site.js` |
| 色、余白、レスポンシブ | CSSクラス名 | `styles.css`、`site.js` |

## 外部サービス

- Indeed: 求人詳細へ移動するために使用。
- `rio-works.com`: お問い合わせページ。
- Supabase project `xxhgerxugsjoxkbuuqhb`: 応募フォームの保存・メール送信先。
- 味一番つばさ公式サイト: 相互リンク。

これらはChatGPT Proとは無関係です。表示用の画像・JavaScriptはすべてこのリポジトリ内にあります。

Supabase無料プランは低利用状態が続くと停止するため、GitHub Actionsから毎日、DBを変更しない健康確認を実行します。受付処理のソースは `supabase/functions/rio-contact/index.ts` を正本とし、Supabase側だけで直接編集しません。

## 公開確認

変更後はGitHub ActionsのPages公開が成功したことを確認し、公開URLをPCとスマートフォンで開いて確認します。「ファイルを変更した」だけでは完了扱いにしません。
