import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="c2m-page-wrap c2m-prose">
      <Link href="/">← Chord2MIDI トップへ戻る</Link>
      <h1>利用規約</h1>
      <p>
        この利用規約（以下「本規約」）は、Chord2MIDI（以下「本サービス」）の利用条件を定めるものです。
        本サービスをご利用いただくことで、本規約に同意したものとみなします。
      </p>

      <h2>1. サービス内容</h2>
      <p>本サービスは、コード進行の作成、試聴、およびMIDIファイルの生成・ダウンロードを、ブラウザ上のみで無償で提供するツールです。</p>

      <h2>2. データの取り扱い</h2>
      <p>本サービスは、作成したコード進行やMIDIファイルをサーバーへ送信・保存しません。すべての処理はご利用の端末（ブラウザ）内で完結します。</p>

      <h2>3. 禁止事項</h2>
      <p>本サービスの運営を妨げる行為、または法令に違反する行為を禁止します。</p>

      <h2>4. 免責事項</h2>
      <p>本サービスの利用により生じたいかなる損害についても、運営者は責任を負わないものとします。本サービスは現状有姿で提供され、動作の完全性を保証するものではありません。</p>

      <h2>5. 規約の変更</h2>
      <p>本規約は予告なく変更されることがあります。変更後の内容は本ページに掲載した時点で効力を生じます。</p>
    </div>
  );
}
