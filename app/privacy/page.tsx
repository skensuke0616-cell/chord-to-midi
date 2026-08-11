import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="c2m-page-wrap c2m-prose">
      <Link href="/">← Chord2MIDI トップへ戻る</Link>
      <h1>プライバシーポリシー</h1>

      <h2>1. 収集する情報</h2>
      <p>
        本サービスは、アカウント登録やログインを必要とせず、氏名・メールアドレスなどの個人情報を収集しません。
        作成したコード進行は、サーバーへ送信・保存されず、すべてお使いのブラウザ内でのみ処理されます。
      </p>

      <h2>2. アクセス解析について</h2>
      <p>サービス改善のため、匿名化されたアクセス解析ツールを利用する場合があります。個人を特定する情報は取得しません。</p>

      <h2>3. Cookieについて</h2>
      <p>本サービスは現時点で、機能提供のためのCookieを使用していません。</p>

      <h2>4. 第三者への提供</h2>
      <p>取得した情報を第三者へ提供することはありません。</p>

      <h2>5. お問い合わせ</h2>
      <p>本ポリシーに関するお問い合わせは、サービス運営者までご連絡ください。</p>
    </div>
  );
}
