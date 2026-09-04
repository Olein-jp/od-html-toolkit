# カスタム HTML ブロックでブロックマークアップを生成・整形できる「OD HTML Toolkit」を作りました

WordPress のブロックエディターには、HTML を直接入力できる「カスタム HTML」ブロックがあります。

通常のブロックでは表現しにくい HTML を記述したり、CSS や JavaScript を含むコードを試したりできる便利なブロックです。WordPress 7.0からは、HTML、CSS、JavaScript を個別に編集できるモーダル画面も用意されています。[WordPress 公式ドキュメント](https://wordpress.org/documentation/article/custom-html/)

一方で、カスタム HTML ブロックの中へ WordPress のブロックマークアップを記述したい場合、少し面倒な作業が発生します。

そこで今回、ブロックマークアップの生成とコード整形を支援する WordPress プラグイン「OD HTML Toolkit」を作りました。

この記事では、OD HTML Toolkit でできることや使い方、利用する際に知っておきたい注意点を紹介します。

## OD HTML Toolkit とは

OD HTML Toolkit は、WordPress 標準のカスタム HTML ブロックへ、次の2つの機能を追加するプラグインです。

- WordPress ブロックマークアップの生成
- HTML、CSS、JavaScript のコード整形

2026年9月4日時点の最新バージョンは `0.1.1` です。GitHub でソースコードと配布用 ZIP を公開しています。

- [OD HTML Toolkit の GitHub リポジトリ](https://github.com/Olein-jp/od-html-toolkit)
- [OD HTML Toolkit v0.1.1](https://github.com/Olein-jp/od-html-toolkit/releases/tag/v0.1.1)

WordPress.org のプラグインディレクトリでは公開していないため、現時点では GitHub Releases からインストールします。

## ブロックマークアップとは

WordPress のブロックエディターで作成したコンテンツには、HTML だけでなく、次のようなコメント形式の情報が保存されています。

```html
<!-- wp:paragraph -->
<p>文章が入ります。</p>
<!-- /wp:paragraph -->
```

この `<!-- wp:paragraph -->` のようなコメントを含むコードが、WordPress のブロックマークアップです。

開始コメントと終了コメントによって、WordPress は「この HTML は段落ブロックである」と判断します。

単純なブロックであれば手作業でも記述できますが、属性が増えてくると、コメント内の JSON と実際の HTML を正しく対応させなければなりません。記述を間違えると、ブロックエディターで「このブロックには、想定されていないか無効なコンテンツが含まれています」と表示される可能性もあります。

OD HTML Toolkit では、WordPress の `createBlock()` と `serialize()` を使ってマークアップを生成します。独自の文字列として組み立てるのではなく、WordPress の Block API を通して生成するのがポイントです。

## WordPress 標準の編集画面をそのまま使う

このプラグインを作る途中では、ツールバーへボタンを置く方法や、プラグイン独自の編集モーダルを表示する方法も試しました。

しかし最終的には、WordPress 標準のカスタム HTML ブロックと編集モーダルをそのまま残す形にしています。

個人的には、WordPress がすでに用意している使い方を大きく変えず、必要な機能だけを足す方が扱いやすいと考えています。独自の編集画面へ置き換えてしまうと、WordPress 標準の操作に慣れている人ほど戸惑ってしまうかもしれません。

OD HTML Toolkit を有効化すると、標準モーダルの下部に次のボタンが追加されます。

- 「Insert Block Markup」
- 「Format Code」

カスタム HTML ブロックそのものの表示や、「Edit HTML」「Update」「Cancel」といった標準操作は変わりません。

## Insert Block Markup でできること

「Insert Block Markup」を押すと、挿入するブロックと属性を選択できます。

バージョン `0.1.1` では、次のコアブロックに対応しています。

| ブロック | 指定できる項目 |
|---|---|
| 段落 | ID／アンカー、class |
| 見出し | ID／アンカー、class |
| グループ | ID／アンカー、class、HTML 要素 |
| ボタン群 | ID／アンカー、class |
| ボタン | ID／アンカー、class |
| 画像 | ID／アンカー、class |
| スペーサー | ID／アンカー、class |

グループブロックでは、次の HTML 要素を選択できます。

- `div`
- `section`
- `article`
- `main`
- `aside`
- `header`
- `footer`

入力した class に余分な空白が含まれている場合は整理されます。また、ID／アンカーに空白が含まれている場合は、そのまま挿入できないようにしています。

## ブロックマークアップを挿入する手順

プラグインを有効化したら、次の手順で利用できます。

1. 投稿または固定ページで「カスタム HTML」ブロックを挿入する
2. ブロック内の「Edit HTML」を押す
3. モーダル下部の「Insert Block Markup」を押す
4. 挿入したいブロックを選ぶ
5. 必要に応じて ID／アンカー、class、HTML 要素を入力する
6. 「Insert」を押す
7. 生成されたコードを確認する
8. WordPress 標準の「Update」を押す

CSS または JavaScript タブを開いている状態で「Insert Block Markup」を押した場合は、自動的に HTML タブへ移動します。

生成したマークアップは、HTML タブのカーソル位置へ挿入されます。文字列を選択している場合は、その選択範囲が生成したマークアップで置き換わります。ただし、「Insert」を押した段階ではカスタム HTML ブロックへ確定されていません。内容を確認してから、標準モーダルの「Update」を押してください。

「Close」はマークアップ生成フォームだけを閉じます。「Cancel」を押した場合は、モーダル内で行った変更が破棄されます。

## Format Code でコードを整形する

「Format Code」では、現在開いているタブのコードを整形できます。

- HTML タブでは HTML を整形
- CSS タブでは CSS を整形
- JavaScript タブでは JavaScript を整形

コード整形には Prettier を使用しています。Prettier は、インデントや改行といったコードの見た目を、一定のルールに合わせて整理するツールです。

HTML タブを整形する場合は、処理の前後で WordPress のブロックコメントが維持されているかも確認します。整形によってブロックコメントが欠けたり変わったりした場合は、整形結果を適用せず、元のコードを維持します。

ただし、整形できたからといって、コードの内容や動作まで正しいことが保証されるわけではありません。特に JavaScript は、意図した処理になっているか、実際の表示画面でも確認しておきたいところです。

## インストール方法

通常の WordPress サイトへインストールする場合は、GitHub の Release に添付されている `od-html-toolkit.zip` を利用します。

1. [OD HTML Toolkit v0.1.1](https://github.com/Olein-jp/od-html-toolkit/releases/tag/v0.1.1)を開く
2. Assets から `od-html-toolkit.zip` をダウンロードする
3. WordPress 管理画面の「プラグイン」→「プラグインを追加」を開く
4. 「プラグインのアップロード」を押す
5. ダウンロードした ZIP ファイルを選択してインストールする
6. インストール後にプラグインを有効化する

GitHub が自動生成する「Source code」の ZIP には、実行に必要な Composer パッケージが含まれていません。必ず Release の Assets にある `od-html-toolkit.zip` を利用してください。

## GitHub Releases から更新できる

OD HTML Toolkit には、[`inc2734/wp-github-plugin-updater`](https://github.com/inc2734/wp-github-plugin-updater)を組み込んでいます。

新しいバージョンが GitHub Releases に公開されると、WordPress 管理画面から更新できる構成です。WordPress.org で配布していないプラグインでも、通常のプラグインに近い流れで更新できます。

ただし、更新前にはバックアップを取り、検証環境で動作を確認することをおすすめします。これは OD HTML Toolkit に限った話ではありませんが、カスタム HTML や JavaScript を扱うサイトでは、コードの変更が表示や動作へ直接影響する場合があります。

## 利用前に確認しておきたいこと

### WordPress 7.1以降が必要

OD HTML Toolkit `0.1.1` では、WordPress 7.1以降、PHP 7.4以降を動作条件として設定しています。

カスタム HTML ブロックの HTML、CSS、JavaScript を分けた編集画面自体は、WordPress 7.0から導入されています。ただし、現在のプラグインは WordPress 7.1を前提として開発・配布しています。[WordPress のカスタム HTML ブロックに関する公式説明](https://wordpress.org/documentation/article/custom-html/)

### CSS と JavaScript タブには権限が必要

WordPress 標準の CSS と JavaScript タブは、`unfiltered_html` 権限を持つユーザーにのみ表示されます。

たとえば、寄稿者など権限が制限されたユーザーでは、CSS と JavaScript タブが表示されません。また、許可されていない `<script>` や `<iframe>` などのコードは、保存時に `wp_kses()` によって取り除かれます。

これは OD HTML Toolkit 独自の制限ではなく、WordPress 標準の権限とサニタイズ処理によるものです。[WordPress 公式ドキュメント](https://wordpress.org/documentation/article/custom-html/)

### 通常のブロックで足りるなら、無理に使わなくてもよい

段落や見出しを普通に配置したいだけであれば、ブロックインサーターから通常のブロックを挿入した方が分かりやすいでしょう。

OD HTML Toolkit は、カスタム HTML ブロック内でコードを扱いながら、WordPress のブロックマークアップも生成したい人に向けたツールです。

すべての人に必要なプラグインではありません。次のような場面で選択肢になると考えています。

- カスタム HTML を使った実装を効率化したい
- ブロックマークアップを手書きする負担を減らしたい
- ID や class を含むブロックコードのひな型が欲しい
- HTML、CSS、JavaScript のインデントをそろえたい
- GitHub で配布するプラグインを管理画面から更新したい

反対に、コードを直接確認することに慣れていない場合は、生成結果の意味を判断しにくいかもしれません。その場合は、通常のブロックやパターンを使う方法も検討してみてください。

### WordPress の変更による影響を受ける可能性がある

現時点の WordPress には、カスタム HTML ブロックの標準モーダルへ第三者のボタンを追加するための公開された拡張 API がありません。

そのため、OD HTML Toolkit `0.1.1` では、標準モーダルの構造を検出してボタンを追加しています。WordPress 側でモーダルの構造が変わった場合は、プラグイン側でも調整が必要になる可能性があります。

利用時には、WordPress とプラグインを更新した後、カスタム HTML ブロックの編集画面が問題なく開くか確認してください。

## まとめ

OD HTML Toolkit は、WordPress 標準のカスタム HTML ブロックを置き換えるものではありません。

標準の編集方法を残しながら、ブロックマークアップの生成とコード整形を追加する、小さな開発支援プラグインです。

開発中に独自の編集画面を作る方向も試しましたが、最終的には WordPress 標準の UI を残す形へ戻しました。機能を増やすことだけでなく、普段の操作をなるべく変えないことも大切だと、あらためて感じた部分です。

まだ `0.1.x` の初期バージョンなので、対応ブロックや WordPress の変更への追従など、これから確認していきたい点もあります。

カスタム HTML ブロック内でブロックマークアップを扱う機会がある方は、ぜひ試してみてください。作業時の小さな手間を減らす選択肢になれば嬉しいです。

## 参考リンク

- [OD HTML Toolkit — GitHub](https://github.com/Olein-jp/od-html-toolkit)
- [OD HTML Toolkit v0.1.1](https://github.com/Olein-jp/od-html-toolkit/releases/tag/v0.1.1)
- [Custom HTML — WordPress.org Documentation](https://wordpress.org/documentation/article/custom-html/)
- [Custom HTML — Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-widgets/core-block-html/)
- [WordPress 7.1 — Make WordPress Core](https://make.wordpress.org/core/7-1/)
- [WP GitHub Plugin Updater — GitHub](https://github.com/inc2734/wp-github-plugin-updater)
