"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell flex items-center justify-center min-h-screen">
      <div className="fixed top-4 right-4 z-50 lg:top-6 lg:right-6">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <img src="/logo_transparent.svg" alt={t("common.logoAlt")} className="w-32 h-32" />
          <h1 className="display-title font-display text-[var(--ink)]">{t("common.brand")}</h1>
        </div>
        <div className="flex flex-row gap-4">
          <Link
            href="/create"
            className="glass-button rounded-full px-8 py-4 text-base font-medium"
          >
            {t("home.createMemory")}
          </Link>
          <Link
            href="/explore"
            className="glass-button-secondary rounded-full px-8 py-4 text-base"
          >
            {t("home.exploreMemories")}
          </Link>
        </div>
      </div>
    </main>
  );
}
