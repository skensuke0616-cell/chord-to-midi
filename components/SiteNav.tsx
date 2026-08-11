"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";

export default function SiteNav() {
  const { t } = useLanguage();
  return (
    <nav className="c2m-nav">
      <LanguageToggle />
      <Link href="/guide">{t.navGuide}</Link>
    </nav>
  );
}
