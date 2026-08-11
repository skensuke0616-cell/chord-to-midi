# Chord2MIDI

> コードを知らなくても、コード進行が作れる。
> 作ったら、そのまま MIDI に。

音楽理論の知識がなくても直感的にコード進行を作成でき、そのまま MIDI ファイルとしてダウンロードできる、ブラウザ完結型の Web サービスです。ログイン不要・サーバー保存なし・基本機能無料。

## クイックスタート

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 開発サーバーを起動（http://localhost:3000）
npm run dev

# 3. 本番用ビルド（公開前の動作確認に使用）
npm run build
npm run start   # ビルドしたものをローカルで確認する場合
```

Node.js **18.18 以上**（推奨: 20系のLTS）が必要です。詳しい手順は「[初めてのセットアップ手順（Windows想定）](#初めてのセットアップ手順windows想定)」を参照してください。

### Vercelへのデプロイ

1. このプロジェクトをGitリポジトリ（GitHub等）にpush
2. [vercel.com](https://vercel.com) でリポジトリをインポート（Framework Presetは自動的に「Next.js」が検出されます。設定変更は不要）
3. 環境変数は不要（バックエンドを持たないため）
4. 「Deploy」をクリック

### 公開前に差し替える箇所

| 内容 | ファイル |
|---|---|
| 独自ドメイン | `app/layout.tsx` の `siteUrl`、`app/robots.ts` の `sitemap`、`app/sitemap.ts` の `siteUrl`（計3箇所、すべて同じドメイン文字列に統一） |
| OGP画像（1200×630px推奨） | `public/og-image.png` を差し替え |
| favicon | `public/favicon.svg` を差し替え（`app/layout.tsx` の `icons` 設定はファイル名が同じであれば変更不要） |
| Appleタッチアイコン | `public/apple-touch-icon.png` を差し替え |
| 利用規約・プライバシーポリシー本文 | `app/terms/page.tsx`, `app/privacy/page.tsx` |

## 特徴

- **かんたん入力モード** — ルート音 → コードタイプ（またはコード名） → 拍数、の3ステップでコード進行を作成
- **オンコード対応** — 「詳細設定」からベース音を変えるだけで `Cmaj7/E` のようなオンコードを直感的に作成可能
- **コード名で直接入力モード** — `Cmaj7 2` のようにコード名と拍数をテキストで入力
- **かんたん入力 ⇔ テキスト入力は相互変換** — どちらで作っても同じ内部データを共有
- **ブラウザ内試聴** — Tone.js による全体 / 個別コードのプレビュー再生
- **MIDI 書き出し** — Standard MIDI File (Format 0) を外部ライブラリなしで自前実装し、そのままダウンロード
- **完全ローカル処理** — コード進行はサーバーへ送信・保存されません
- **`/guide`** — 初めての人向けの使い方ガイド

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| フレームワーク | Next.js 14（App Router）+ TypeScript |
| UI | React（プレーンCSS。デザイントークンは `app/globals.css`） |
| 音声再生 | Tone.js |
| MIDI 生成 | Standard MIDI File バイナリの自前実装（外部ライブラリ不使用） |
| ホスティング | Vercel を想定した静的寄りの構成（バックエンドなし） |

## ディレクトリ構成

```
chord-to-midi/
├── app/
│   ├── layout.tsx        # サイト全体のmetadata / OGP / favicon
│   ├── globals.css        # デザイントークン + 全スタイル
│   ├── page.tsx            # トップページ（ツール本体）
│   ├── guide/page.tsx      # 使い方ガイド（/guide）
│   ├── terms/page.tsx      # 利用規約
│   ├── privacy/page.tsx    # プライバシーポリシー
│   ├── not-found.tsx       # 404ページ
│   ├── robots.ts           # robots.txt
│   └── sitemap.ts          # sitemap.xml
├── components/
│   ├── ChordEditor.tsx     # 状態管理・BPM処理・Tone.js再生・全体のオーケストレーション
│   ├── BeginnerMode.tsx    # コード名/雰囲気の切り替えタブ + カード一覧
│   ├── ChordCard.tsx       # コード1件分のカード（詳細設定＝オンコード含む）
│   └── TextMode.tsx        # テキスト入力モード
├── lib/
│   ├── chord/
│   │   ├── types.ts        # ChordEvent などの型定義
│   │   ├── dictionary.ts   # コード辞書・初心者ラベル・BPM定数（UIから独立）
│   │   └── parser.ts       # テキスト⇔ChordEvent[]の変換、オンコード解析
│   └── midi/
│       ├── noteUtils.ts    # ChordEvent → MIDIノート番号（試聴とMIDI生成で共有）
│       └── midiWriter.ts   # ChordEvent[] → Standard MIDI File バイナリ
├── public/                 # favicon.svg / apple-touch-icon.png / og-image.png
├── package.json
├── tsconfig.json
└── next.config.mjs
```

「かんたん入力」「テキスト入力」はどちらも最終的に同じ `ChordEvent[]` に変換され、`getChordMidiNotes()` を Tone.js での試聴と MIDI 生成の両方が共有しています。

```
UI（かんたん入力 / テキスト入力）
      ↓
ChordEvent[]
      ↓
getChordMidiNotes()
      ↓
Tone.js（試聴） / MIDI Generator（書き出し）
```

## 初めてのセットアップ手順（Windows想定）

プログラミング初心者の方向けに、zipをダウンロードしてから起動するまでを順番に説明します。

### 1. Node.jsをインストールする

すでにNode.jsが入っている場合はスキップしてください。

1. [https://nodejs.org](https://nodejs.org) にアクセス
2. **「LTS」**と書かれたバージョン（20系。**18.18以上**であれば動作します）をダウンロード
3. ダウンロードした `.msi` ファイルを実行し、指示に従ってインストール（すべて「Next」でOK）
4. インストール後、一度PCを再起動すると確実です

### 2. zipを展開する

1. ダウンロードした `chord2midi-nextjs.zip` を、**日本語やスペースを含まないパス**（例: `C:\dev\chord2midi`）に展開してください。デスクトップや `C:\Users\ユーザー名\Desktop` でも問題ありません
2. 展開すると `chord-to-midi` フォルダが出てきます

### 3. ターミナル（PowerShell）を開く

1. 展開した `chord-to-midi` フォルダをエクスプローラーで開く
2. フォルダ内の何もない場所で **Shiftキーを押しながら右クリック**
3. 「PowerShell ウィンドウをここに開く」（または「ターミナルで開く」）を選択

### 4. 依存パッケージをインストールする

開いたPowerShellに、次のように入力してEnterキーを押します。

```powershell
npm install
```

初回は1〜2分ほどかかります。エラーが出ず、プロンプトが戻ってくれば成功です。

### 5. 開発サーバーを起動する

```powershell
npm run dev
```

以下のような表示が出れば起動成功です。

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 6. ブラウザで開く

ブラウザ（Chrome, Edgeなど）で次のURLを開いてください。

```
http://localhost:3000
```

Chord2MIDIの画面が表示されれば成功です。停止する場合はPowerShellで `Ctrl + C` を押してください。

### 7. 本番用ビルドを確認する

公開前には、実際にデプロイされる形に近いビルドが問題なく通るか確認してください。

```powershell
npm run build
```

エラーが出ず完了すれば、Vercelへのデプロイに進めます。（`npm run start` で、ビルド結果をローカルで起動して確認することもできます。）

> **Mac / Linuxの場合**：手順は同じです。手順3は「ターミナル」アプリで `cd` コマンドを使ってフォルダに移動し、以降は同じコマンド（`npm install` 等）を実行してください。

## MVP の範囲

- BPM設定（20〜300、キーボードから自然に入力可能）
- コード追加・削除・並び替え
- ルート音・コードタイプ（コード名 / 雰囲気の切り替え）・拍数の選択
- オンコード（詳細設定からベース音を変更、テキスト入力でも `Cmaj7/E` 形式に対応）
- 各コード試聴・全体試聴
- MIDI生成・ダウンロード（note-off/note-onの順序を含め、試聴と一致する構造）
- テキスト入力モード（かんたん入力と相互変換）
- レスポンシブ対応
- 初心者にも分かるエラーメッセージ（コード認識エラー／ベース音認識エラーを区別）
- 使い方ガイド（`/guide`）

## Future Features（意図的に MVP から外したもの）

- 変拍子のグルーピング（例: `7/8 = 2+2+3`）の UI 対応
- Close / Open voicing、Guitar / Piano / Bass 別ボイシング、アルペジオ、ボイスリーディング
- 複雑なコード（`maj9`, `m9`, `6`, `m6`, `7sus4`, `add11`, `maj7#11` など）— `lib/chord/dictionary.ts` の `QUALITIES` にエントリを追加するだけで拡張可能な構造にしてあります
- コード進行の共有・保存・URL発行、入力の一時保存（localStorage）
- AI によるコード進行提案（Keyの内部状態は `components/ChordEditor.tsx` に残してあり、将来の「Keyから提案する」機能で再利用できます）
- ドラムパターン・スケール表示

## ライセンス

MIT License. 詳細は [LICENSE](./LICENSE) を参照してください。
