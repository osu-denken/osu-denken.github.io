# 電研ウェブサイト
Next.jsを用いてGitHub Pagesへデプロイして作成

## 発生した問題点
1. CSSが適用されない
   こちらは[Next.js 15 + GitHub PagesでCSSが反映されない問題を解決した話（App Router対応・Tailwind・TypeScript） - Qiita](https://qiita.com/hellomyzn/items/692f4fa1703c45c7efa9)を参考に修正した。

## デプロイ方法
1. `npm run export`を実行して静的サイトとしてビルドする
2. 各種gitコマンドを実行してビルドされたファイルをGitHubにプッシュする
   - `git add .`
   - `git commit -m "..."`
   - `git push origin main`
3. 勝手にActionsでGitHub Pagesにデプロイされます

## デバッグ
1. `npm run dev`を実行してローカルサーバーを起動
2. ブラウザで`http://localhost:3000`にアクセスする

