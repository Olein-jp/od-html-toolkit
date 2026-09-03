# OD HTML Toolkit

WordPress 標準のカスタム HTML ブロックへ、開発者向けのブロックマークアップ生成とコード整形を追加するプラグインです。

## MVP の機能

- WordPress標準のカスタム HTML ブロックとHTML／CSS／JavaScript編集モーダルを維持
- 標準モーダル内へ「Insert Block Markup」と「Format Code」を追加
- 「Insert Block Markup」からコアブロックのマークアップを生成
- ID（`anchor`）、class、グループのHTML要素を指定
- WordPress の `createBlock()` と `serialize()` による正規のブロックシリアライズ
- 生成したマークアップをカスタム HTML の末尾へ挿入
- Prettier によるHTML／CSS／JavaScript各タブのコード整形
- 整形前後のWordPressブロックコメント検証と、失敗時の元データ保持
- WordPress標準モーダルの「Update」処理を介したGutenberg標準のUndo対応
- PHP／JavaScriptフィルターによる対象ブロック定義の拡張

カスタム HTML ブロックの標準「Edit HTML」ボタンから編集モーダルを開くと、フッターに「Insert Block Markup」と「Format Code」が表示されます。生成したマークアップはHTMLタブへ挿入され、WordPress標準の「Update」を押すまでブロックへは反映されません。「Cancel」を押した場合、変更内容は破棄されます。

## 使い方

1. プラグインをインストールして有効化します。
2. 投稿または固定ページのブロックエディターで「カスタム HTML」ブロックを挿入します。
3. カスタム HTML ブロック内のWordPress標準「Edit HTML」を押します。
4. HTML／CSS／JavaScriptタブを使ってコードを編集します。
5. 編集が完了したら「Update」を押して、モーダルの内容をカスタム HTML ブロックへ反映します。

### ブロックマークアップを挿入する

1. 編集モーダル下部の「Insert Block Markup」を押します。HTMLタブ以外を開いている場合は、自動的にHTMLタブへ切り替わります。
2. 挿入するブロックを選択します。
3. 対応している場合は、ID／アンカー、class、HTML要素を指定します。空欄の項目は生成結果へ追加されません。
4. 「Insert」を押すと、WordPressがシリアライズしたブロックマークアップがHTMLタブの末尾へ追加されます。
5. 内容を確認し、WordPress標準の「Update」を押します。

「Close」はマークアップ生成フォームだけを閉じます。「Cancel」は編集モーダル内の変更を破棄して、カスタム HTML ブロックの元の内容を維持します。

### コードを整形する

1. 整形したいHTML、CSS、JavaScriptタブを開きます。
2. 編集モーダル下部の「Format Code」を押します。
3. 整形結果を確認し、WordPress標準の「Update」を押します。

HTMLタブではWordPressブロックコメントが整形前後で維持されることを検証します。検証または整形に失敗した場合は元のコードを維持し、エラー通知を表示します。

初期状態では以下のブロックに対応します。

- 段落
- 見出し
- グループ
- ボタン群
- ボタン
- 画像
- スペーサー

グループでは `div`、`section`、`article`、`main`、`aside`、`header`、`footer` を選択できます。

## 必要環境

- WordPress 7.1 以上
- PHP 7.4 以上
- Node.js 18.12 以上
- npm 8.19.2 以上
- Composer 2
- Docker

## 開発環境

```bash
npm install
composer install
npm run build
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
npm run lint:js
npm run lint:css
npm run test:unit:js
```

開発中にJavaScriptとCSSを監視ビルドする場合は `npm start` を使います。

## 対象ブロックの拡張

PHPでは `od_html_toolkit_supported_blocks` フィルターを利用できます。UIが扱えるフィールドは `anchor`、`className`、`tagName` です。

```php
add_filter(
	'od_html_toolkit_supported_blocks',
	function ( $definitions ) {
		$definitions[] = array(
			'name'   => 'my-plugin/example',
			'fields' => array( 'anchor', 'className' ),
		);

		return $definitions;
	}
);
```

エディター側では `odHtmlToolkit.supportedBlocks` フィルターを利用できます。

```js
wp.hooks.addFilter(
	'odHtmlToolkit.supportedBlocks',
	'my-plugin/add-supported-block',
	( definitions ) => [
		...definitions,
		{
			name: 'my-plugin/example',
			fields: [ 'anchor', 'className' ],
		},
	]
);
```

## 翻訳

翻訳テンプレートは `languages/od-html-toolkit.pot` です。PHPまたはJavaScript内の翻訳対象文字列を変更した後、起動中の `wp-env` で再生成できます。

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
