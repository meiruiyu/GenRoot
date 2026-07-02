"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { Pill } from "@/components/Pill";
import { demoArchive } from "@/lib/demo-data";
import { getLocalizedArchive } from "@/lib/i18n/demo-content";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
  const { locale, t } = useLanguage();
  const archive = useMemo(() => getLocalizedArchive(locale, demoArchive), [locale]);
  const memory = archive.memories.find((item) => item.id === params.id);

  if (!memory) {
    notFound();
  }

  const member = archive.members.find((item) => item.id === memory.memberId);

  return (
    <main className="page-shell space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="glass-panel overflow-hidden rounded-[32px]">
          <img src={memory.coverImage} alt={memory.title} className="h-[420px] w-full object-cover" />
        </div>
        <div className="glass-panel-strong rounded-[32px] p-8">
          <div className="flex flex-wrap gap-2">
            <Pill>{memory.language}</Pill>
            <Pill tone="light">{memory.location}</Pill>
            <Pill tone="light">{memory.duration}</Pill>
          </div>
          <h1 className="display-title font-display mt-4 text-[var(--ink)]">{memory.title}</h1>
          <p className="lede mt-4">{memory.summary}</p>
          <div className="mt-5 rounded-[24px] border border-white/15 bg-[rgba(0,0,0,0.12)] p-5">
            <p className="body-copy text-[var(--ink)]">{t("memory.narrative")}</p>
          </div>
          <div className="glass-chip mt-8 rounded-[24px] p-5">
            <p className="eyebrow">{t("common.audio")}</p>
            <p className="mt-2 text-[1rem] leading-7 text-[var(--ink)]">{memory.audioLabel}</p>
          </div>
          {member ? (
            <div className="mt-6 flex items-center gap-4">
              <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <p className="font-medium text-[var(--ink)]">{member.name}</p>
                <p className="text-sm text-[var(--muted)]">{member.relation}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[32px] p-8">
          <p className="eyebrow">{t("common.transcript")}</p>
          <p className="mt-4 text-[1rem] leading-8 text-[var(--ink)]">{memory.transcript}</p>
          <p className="eyebrow mt-6">{t("common.translation")}</p>
          <p className="mt-4 text-[1rem] leading-8 text-[var(--ink)]">{memory.translation}</p>
        </div>

        <div className="glass-panel-strong rounded-[32px] p-8">
          <p className="eyebrow">{t("memory.aiEnrichment")}</p>
          <div className="body-copy mt-4 space-y-5">
            <div>
              <p className="font-medium text-[var(--ink)]">{t("common.summary")}</p>
              <p>{memory.summary}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">{t("memory.whySaved")}</p>
              <p>{t("memory.whySavedBody")}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">{t("memory.publicSafe")}</p>
              <p>{memory.publicSafeVersion}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">{t("common.entities")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...memory.entities.people, ...memory.entities.locations, ...memory.entities.events].map(
                  (entity) => (
                    <Pill key={entity} tone="light">
                      {entity}
                    </Pill>
                  ),
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">{t("common.tags")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <Pill key={`${tag.category}-${tag.label}`}>
                    {t(`tagCategories.${tag.category}`)} · {tag.label}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="glass-button rounded-full px-5 py-3 text-sm font-medium">
              {t("memory.publishToMap")}
            </Link>
            <Link href="/ask-family" className="glass-button-secondary rounded-full px-5 py-3 text-sm">
              {t("nav.askFamily")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
