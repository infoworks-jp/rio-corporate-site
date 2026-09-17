# 更新ガイド

## 正本と公開先

- 正本: `main`
- 公開: https://rio-works.com/
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

## ドメイン移行後の更新先

`rio-works.com` の正本はこのGitHubリポジトリです。旧ChatGPT Sites版を更新しても、このドメインには反映されません。

- 住所・地図・つばさリンク・検索用説明・構造化データ: `index.html`
- アイコン: `favicon.ico`、`assets/site/favicon.png`、`apple-touch-icon.png`。変更時はHTMLのバージョンも更新。
- 拠点の住所を変更したら、表示・Google Maps検索URL・JSON-LDを同時に確認。
- 札幌土場の所在地は土地賃貸借契約書に記載された東雁来町302番78・302番79。Google Mapsでは302番付近のため「周辺MAP」と明記。
- ページ追加時は `sitemap.xml` を更新。`lastmod` は実際の内容更新日を使用。
- Search Consoleの登録・サイトマップ送信と検索順位の確認は、公開HTMLの検証とは別に行う。

## 流動に連動する音

- `sound.js`: 静かな水の揺らぎ・柔らかい墨の音・小さな水滴の合成音。外部音源や有料サービスは使用しない。
- `sound.css`: 右上のスピーカーマークとON/OFF表示。
- `site-core.js` の `rio:ink` イベントでタップ・ドラッグ・自然な墨の動きに連動。
- 初期状態はOFF。クリックで音声を初期化し、非表示・ページ離脱時はOFFに戻して停止する。
- 変更時はHTMLの音関連ファイルのバージョンを更新し、無音開始・ON/OFF・再ON・スマホ操作を確認する。

## 建設業許可通知書（2025年7月15日）

- 閲覧ページ: `certificates/construction-permit.html`
- 原本写真: `assets/certificates/original/construction-permit-20250715.jpeg`（受領ファイルをそのまま保存）
- 写真の文字・日付・印影は書き換えず、CSSの射影変換で用紙の傾きと余白を表示時に調整。
- 会社概要と信用情報の建設業許可リンクから開く。表記は北海道知事許可（般－7）石第21656号。
