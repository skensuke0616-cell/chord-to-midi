import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const siteUrl = "https://chord2midi.example.com"; // 独自ドメイン確定後に置き換えてください

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chord2MIDI — Free Chord Progression MIDI Generator",
    template: "%s｜Chord2MIDI",
  },
  description:
    "音楽理論を知らなくても、コード進行を選んで並べるだけで作曲できる無料ツール。ブラウザ内で試聴し、そのままMIDIファイルとして書き出せます。オンコード対応、ログイン不要。",
  keywords: [
    "コード進行",
    "MIDI",
    "chord progression MIDI",
    "MIDI generator",
    "chord to MIDI",
    "コード MIDI 生成",
    "オンコード",
    "free chord progression MIDI generator",
    "chord progression generator",
    "on-chord MIDI",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Chord2MIDI",
    title: "Chord2MIDI — Free Chord Progression MIDI Generator",
    description:
      "コードを知らなくてもコード進行が作れる。作ったら、そのままMIDIに。ブラウザだけで完結する無料ツール。",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Chord2MIDI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chord2MIDI",
    description: "コードを知らなくてもコード進行が作れる。作ったら、そのままMIDIに。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
