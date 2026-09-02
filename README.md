# OD HTML Toolkit

HTML制作を支援する WordPress プラグインです。

## 必要環境

- WordPress 5.9 以上
- PHP 7.4 以上
- Node.js 18.12 以上
- npm 8.19.2 以上
- Composer 2
- Docker

## 開発環境

```bash
npm install
composer install
npm run env:start
```

WordPress は `http://localhost:8888` で起動します。初期ログイン情報はユーザー名 `admin`、パスワード `password` です。

```bash
npm run env:status  # 状態確認
npm run env:logs    # ログ表示
npm run env:cli -- plugin list
npm run env:stop
```

PHP のコーディング規約を確認するには次を実行します。

```bash
npm run lint:php
```

## 翻訳

翻訳テンプレートは `languages/od-html-toolkit.pot` です。PHP 内の翻訳対象文字列を変更した後、起動中の `wp-env` で再生成できます。

```bash
npm run i18n:pot
```

実際の翻訳を同梱する場合は、同じディレクトリに `od-html-toolkit-LOCALE.po` とコンパイル済みの `od-html-toolkit-LOCALE.mo` を配置します（例: `od-html-toolkit-ja.po`、`od-html-toolkit-ja.mo`）。

## リリース

プラグイン本体の `Version` と同じ SemVer のタグを、先頭に `v` を付けて push します。

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions が依存ライブラリを本番構成で含む `od-html-toolkit.zip` を生成し、GitHub Release を作成します。インストール済みプラグインは `inc2734/wp-github-plugin-updater` を通じて最新 Release を検出し、WordPress 管理画面から更新できます。

更新機能は GitHub の公開リポジトリと、プレリリースではない Release を前提とします。Release の ZIP はルートディレクトリが `od-html-toolkit/` になる構成です。

ローカルで配布 ZIP を確認する場合は次を実行します。

```bash
npm run plugin:zip
```

生成物は `dist/od-html-toolkit.zip` です。

## ライセンス

GPL-2.0-or-later
