"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/components/Pill";
import { StoryMap } from "@/components/StoryMap";
import { demoArchive } from "@/lib/demo-data";
import { getLocalizedArchive } from "@/lib/i18n/demo-content";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { StoryMarkerType } from "@/lib/types";

type TypeFilter = StoryMarkerType | "all";

export default function ExplorePage() {
  const { locale, t } = useLanguage();
  const archive = useMemo(() => getLocalizedArchive(locale, demoArchive), [locale]);

  const typeFilters: { value: TypeFilter; label: string }[] = [
    { value: "all", label: t("explore.filterAll") },
    { value: "craft", label: t("explore.filterCraft") },
    { value: "ritual", label: t("explore.filterRitual") },
    { value: "person", label: t("explore.filterPerson") },
  ];

  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(archive.publicStories.flatMap((s) => s.tags)));

  const filtered = archive.publicStories.filter((story) => {
    const typeMatch = activeType === "all" || story.type === activeType;
    const tagMatch = activeTag === null || story.tags.includes(activeTag);
    return typeMatch && tagMatch;
  });

  return (
    <main className="page-shell space-y-8">
      <section className="glass-panel-strong rounded-[32px] p-8">
        <Pill tone="accent">{t("explore.pill")}</Pill>
        <h1 className="mt-4 font-display text-5xl text-[var(--ink)]">{t("explore.heading")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{t("explore.lede")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {typeFilters.map(({ value, label }) => {
            const count =
              value === "all"
                ? archive.publicStories.length
                : archive.publicStories.filter((s) => s.type === value).length;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveType(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeType === value ? "glass-button" : "glass-chip"
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                activeTag === tag ? "glass-button" : "glass-chip"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <StoryMap stories={filtered} />

      {filtered.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)]">{t("explore.empty")}</p>
      )}
    </main>
  );
}
