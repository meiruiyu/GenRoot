"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AppNav() {
  const { t } = useLanguage();

  const links = [
    { href: "/explore", label: t("nav.explore") },
    { href: "/archive", label: t("nav.archive") },
    { href: "/create", label: t("nav.create") },
    { href: "/ask-family", label: t("nav.askFamily") },
    { href: "/onboarding?reset=1", label: t("nav.preferences") },
  ];

  return (
    <>
      <header className="sticky top-4 z-40 mx-4 rounded-[28px] glass-panel px-5 py-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo_transparent.svg"
              alt={t("common.logoAlt")}
              className="h-11 w-11 rounded-full border border-white/20 bg-white/10 object-cover p-1"
            />
            <div>
              <p className="font-display text-[1.45rem] leading-none text-[var(--ink)]">
                {t("common.brand")}
              </p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--muted-soft)]">
                {t("nav.taglineMobile")}
              </p>
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <aside className="fixed left-6 top-6 z-50 hidden w-[140px] rounded-[36px] glass-sidebar p-4 lg:block">
        <div className="flex flex-col items-center gap-5">
          <Link href="/" className="flex flex-col items-center gap-3">
            <img
              src="/logo_transparent.svg"
              alt={t("common.logoAlt")}
              className="h-14 w-14 rounded-[22px] border border-white/20 bg-white/10 object-cover p-1"
            />
            <div className="text-center">
              <p className="font-display text-[1.35rem] leading-none text-[var(--ink)]">
                {t("common.brand")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-[var(--muted-soft)]">
                {t("nav.taglineDesktop")}
              </p>
            </div>
          </Link>

          <LanguageSwitcher />

          <nav className="flex w-full flex-col gap-3">
            <Link
              href="/"
              className="rounded-[18px] bg-[rgba(255,255,255,0.22)] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] shadow-[0_10px_24px_rgba(8,20,17,0.18)]"
            >
              {t("nav.dashboard")}
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[18px] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.14)] hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
