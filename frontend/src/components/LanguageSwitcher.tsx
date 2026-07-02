"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const options: Array<{ value: Locale; label: string }> = [
    { value: "zh", label: "中文" },
    { value: "en", label: "EN" },
  ];

  return (
    <div
      className="inline-flex rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] p-0.5 backdrop-blur-md"
      role="group"
      aria-label="Language"
    >
      {options.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
              active
                ? "bg-[rgba(255,255,255,0.22)] text-[var(--ink)] border border-white/30"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
