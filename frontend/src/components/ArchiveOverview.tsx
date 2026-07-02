"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pill } from "@/components/Pill";
import FamilyTree from "@/components/FamilyTree";
import { demoArchive } from "@/lib/demo-data";
import { getLocalizedArchive } from "@/lib/i18n/demo-content";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const tagColors: Record<string, string> = {
  Place: "bg-[#4c7b73]/30 text-[#4c7b73]",
  Person: "bg-[#264653]/30 text-[#264653]",
  Ritual: "bg-[#c6653a]/25 text-[#c6653a]",
  Craft: "bg-[#e9c46a]/25 text-[#a07c20]",
  Emotion: "bg-white/20 text-[var(--muted)]",
};

export function ArchiveOverview() {
  const { locale, t } = useLanguage();
  const archive = useMemo(() => getLocalizedArchive(locale, demoArchive), [locale]);

  const sortedMemories = [...archive.memories].sort((a, b) => Number(a.year) - Number(b.year));

  const quickActions = [
    ["/create", t("archive.actionCreate")],
    ["/ask-family", t("archive.actionAsk")],
    ["/explore", t("archive.actionExplore")],
  ] as const;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel-strong rounded-[32px] p-8">
          <Pill tone="accent">{t("archive.privateArchive")}</Pill>
          <h1 className="display-title font-display mt-4 text-[var(--ink)]">{t("archive.heading")}</h1>
          <p className="lede mt-4 max-w-2xl">{t("archive.lede")}</p>
          <div className="mt-5 rounded-[24px] border border-white/15 bg-[rgba(0,0,0,0.12)] p-5">
            <p className="body-copy text-[var(--ink)]">{t("archive.narrative")}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">{t("archive.familyMembers")}</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">2</p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">{t("archive.memories")}</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">
                {archive.memories.length}
              </p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">{t("archive.coreThemes")}</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">5</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <p className="eyebrow">{t("archive.quickActions")}</p>
          <h2 className="section-title font-display mt-3 text-[var(--ink)]">{t("archive.quickHeading")}</h2>
          <p className="body-copy mt-3">{t("archive.quickBody")}</p>
          <div className="mt-6 grid gap-3">
            {quickActions.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="glass-chip rounded-[22px] px-5 py-4 text-sm font-medium text-[var(--ink)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-panel rounded-[32px] p-8">
          <p className="eyebrow">{t("archive.timeline")}</p>
          <div className="relative mt-6 space-y-0">
            {[
              [t("archive.t1939"), t("archive.t1939Event")],
              [t("archive.t1950s"), t("archive.t1950sEvent")],
              [t("archive.t1999"), t("archive.t1999Event")],
              [t("archive.t2024"), t("archive.t2024Event")],
            ].map(([when, event], index, items) => (
              <div key={when} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full border-2 border-white/60 bg-[var(--accent)] mt-1 shrink-0" />
                  {index < items.length - 1 ? <div className="w-px flex-1 bg-white/20 my-1" /> : null}
                </div>
                <div className={index < items.length - 1 ? "pb-6" : "pb-0"}>
                  <p className="eyebrow">{when}</p>
                  <p className="mt-1 text-[1rem] leading-7 text-[var(--ink)]">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {sortedMemories.map((memory) => (
            <Link
              key={memory.id}
              href={`/memories/${memory.id}`}
              className="glass-panel group rounded-[28px] overflow-hidden transition hover:-translate-y-0.5"
            >
              {memory.coverImage ? (
                <div className="h-36 overflow-hidden">
                  <img
                    src={memory.coverImage}
                    alt={memory.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                  />
                </div>
              ) : null}

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{memory.language}</Pill>
                  <Pill tone="light">{memory.year}</Pill>
                  <Pill tone="light">{memory.duration}</Pill>
                </div>
                <h2 className="font-display mt-3 text-[1.85rem] leading-[1.04] text-[var(--ink)]">
                  {memory.title}
                </h2>
                <p className="body-copy mt-2">{memory.teaser}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span
                      key={`${tag.category}-${tag.label}`}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${tagColors[tag.category] ?? "glass-chip"}`}
                    >
                      {t(`tagCategories.${tag.category}`)} · {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="glass-panel rounded-[32px] p-8">
          <Pill tone="accent">{t("archive.familyTree")}</Pill>
          <h2 className="display-title font-display mt-4 text-[var(--ink)]">{t("archive.familyTreeHeading")}</h2>
          <p className="lede mt-4 max-w-3xl">{t("archive.familyTreeLede")}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="glass-panel rounded-[32px] p-4">
            <p className="eyebrow px-3 pt-2">{t("archive.familyMedia")}</p>
            <video
              className="mt-3 aspect-video w-full rounded-[24px] object-cover"
              src="/demo-assets/Hailuo_Video__Pan right_. A peaceful morning in a Miao village near Kaili, Guizhou, wooden houses, mountain mist,_499453826111090696.mp4"
              controls
              muted
              playsInline
            />
            <p className="body-copy px-3 pb-2 pt-3">{t("archive.familyMediaCaption")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "/demo-assets/grandma-portrait.jpg",
              "/demo-assets/grandma-storytelling.jpg",
              "/demo-assets/grandma-wax-dye.png",
              "/demo-assets/mia-phone-call.jpg",
            ].map((src) => (
              <div key={src} className="glass-panel overflow-hidden rounded-[28px]">
                <img src={src} alt={t("archive.familyMediaAlt")} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <FamilyTree />
      </section>
    </div>
  );
}
