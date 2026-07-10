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

## TODO:
- [ ] それぞれのページを編集できるようにする (マークダウン化を検討、しかしnextjsの仮想domと同じようなページにする必要があるのでこれはまだ実装しないようにしておく)
- [ ] 仮登録は誰でもできるようにする (（承認権限のある）部員が承認する) (部員の仮登録を管理画面から承認できるようにする)
- [ ] 部員一人ひとりのプロフィールをつくれるようにする
  - デフォルトではプロフィールはないが、ポータルから作れるようにしておきたい
    - [ ] プロフィールはマークダウンで編集できるようにする
    - [ ] プロフィールは公開・非公開を切り替えられるようにする
- [ ] 部活のワンタイムパスワード管理をWeb Authicator (totp.kmmz.jp) で行えるようにする
- [ ] 非公開記事を作成できるようにする (これはCloudflareで管理する)
- [ ] excelの部活名簿を自動発行できるように (自治会準拠)
- [ ] 入部届のPDFを発行できるように (電話番号や住所、ハンコ、署名は本人が入力するため空欄にしておく)

