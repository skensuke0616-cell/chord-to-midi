import Link from "next/link";

export default function NotFound() {
  return (
    <div className="c2m-page-wrap" style={{ textAlign: "center", paddingTop: "18vh" }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: 64, color: "var(--accent)", margin: 0 }}>404</p>
      <p style={{ color: "var(--text-muted)", margin: "12px 0 24px" }}>
        お探しのページは見つかりませんでした。<br />
        URLをご確認いただくか、トップページからやり直してください。
      </p>
      <Link href="/" className="c2m-btn c2m-btn-primary" style={{ display: "inline-flex" }}>
        Chord2MIDI トップへ戻る
      </Link>
    </div>
  );
}
