# 電研ウェブサイト
Next.jsを用いてGitHub Pagesへデプロイしてフロントエンド側を作成<br>

## サブモジュール
- バックエンド - https://github.com/osu-denken/web-api
- ECRD Fake Terminal - https://github.com/osu-denken/ecrd-fake-terminal



## 発生した問題点
1. CSSが適用されない
   こちらは[Next.js 15 + GitHub PagesでCSSが反映されない問題を解決した話（App Router対応・Tailwind・TypeScript） - Qiita](https://qiita.com/hellomyzn/items/692f4fa1703c45c7efa9)を参考に修正した。

2. about/ へアクセスできない
デフォルトでの静的エクスポートでは about.html として作成されます。<br>
そのため https://osu-denken.github.io/about/ として開くには next.config.ts を以下のように変更しました。

```ts
import type { NextConfig } from "next";
import { env } from "process";

const isExport: boolean = process.env.IS_EXPORT === "1";

const nextConfig: NextConfig = {
  [...]

  trailingSlash: true,
};

module.exports = nextConfig;
```

## デプロイ方法
この手順を踏まなくても基本的には勝手にActionsでGitHub Pagesにデプロイされます

1. `npm run export`を実行して静的サイトとしてビルドする
2. 各種gitコマンドを実行してビルドされたファイルをGitHubにプッシュする
   - `git add .`
   - `git commit -m "..."`
   - `git push origin main`

## デバッグ
1. `npm run dev`を実行してローカルサーバーを起動
2. ブラウザで`http://localhost:3000`にアクセスする

## 部員管理
`/portal/admin/members/` から部員名簿を管理できます。`MemberManage` 権限を持つ部員のみ開けます。

- 在籍状態 (すべて / 承認待ち / 在籍 / 卒業 / 退部) でタブを切り替えられます。タブは `?tab=` としてURLに載るので、リロードや共有をしても同じタブが開きます
- 一覧では、その部員が電研ポータルのアカウントを作成済みかどうかも確認できます
- 部員を選ぶとダイアログが開き、名前、メアドなどをまとめて編集して保存できます
- 承認待ちの部員は、このダイアログから承認・却下できます
- 電話番号は重大な個人情報のため、幹部のみが閲覧・編集できます。一覧には表示されません
- 役職と権限は独立したビットフラグです。役職のデフォルト権限ですでに満たされている権限は、追加する権限の選択肢には現れません

名簿の実体はバックエンドの D1 データベースです。<br />
権限や在籍状態の詳細は [web-api の README](https://github.com/osu-denken/web-api) を参照すること。

## 2段階認証 (TOTP)
`/portal/` の設定タブから、ワンタイムパスワードによる2段階認証を有効にできます。

- 設定タブでQRコードを認証アプリ (Google Authenticator など) に読み取らせ、表示された6桁のコードを入力すると有効になります
- 有効化したときに、リカバリコードを10個発行します
- リカバリコードは使い捨てです。1個使うたびに減ります。残りの個数は設定タブで確認できます
- 解除にも認証コード (またはリカバリコード) の入力を求めます

2段階認証を有効にしている部員がログインすると、パスワードの照合に成功した時点ではまだトークンを受け取れません。<br />
バックエンドがFirebaseのトークンを一時的に預かり、認証コードを検証してから引き渡します。預かりは5分で切れ、コードの入力は5回まで試せます。

シークレットは `SECRET_KEY` で暗号化してKVに保存します。リカバリコードはハッシュしか保存しません。<br />
一度受理したコードは、有効期間内であっても使い回せません。

## ブログ
`/portal/` のブログタブから記事を作成・編集できます。`BlogEdit` 権限を持つ部員のみ編集できます。

エディタには画像を直接貼り付け (Ctrl + V) たりドラッグ&ドロップしたりできます。アップロードした画像はブログリポジトリの `images/` に入ります。

### 非公開記事
`/portal/` の非公開記事タブから、部員だけが読める記事を作成・編集できます。閲覧に `PrivatePostView`、編集に `PrivatePostEdit` 権限が必要です。どちらも部員の標準権限に含まれます。

公開されるブログ記事と違い、本文はGitHubのリポジトリではなくCloudflareのD1データベースに保存されます。<br />
静的サイトには出力されないため、記事を読むには必ずログインと権限の確認を経ます。誰がどの記事を読んだかはログに残ります。

### 画像の管理
`/portal/` の画像タブから、アップロード済みの画像を一覧・削除できます。Markdownの記法をクリップボードにコピーすることもできます。

記事から参照している画像を削除すると、その記事では表示されなくなります。削除する前に確認してください。

## fake terminal の welcome.md
トップページのターミナルに表示される `welcome.md` は、ブログタブのリンクからブログと同じエディタで編集できます。`PageEdit` 権限が必要です。

`welcome.md` の実体は [ecrd-fake-terminal](https://github.com/osu-denken/ecrd-fake-terminal) にあり、このリポジトリにはサブモジュールとして取り込まれています。<br />
そのため保存しても即座には反映されず、次の順で公開されます。

1. web-api が `ecrd-fake-terminal` へコミットする
2. コミットが載ってから、web-api がこのリポジトリの `deploy.yml` を `workflow_dispatch` で起動する
3. Actions がサブモジュールを `--remote` で取り込み、再ビルドしてデプロイする

反映まで数分かかります。<br />
また `--remote` で `main` の先頭を取り込むため、`ecrd-fake-terminal` へ直接pushした変更も、次のサイトのビルド時に反映されます。
