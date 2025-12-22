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
