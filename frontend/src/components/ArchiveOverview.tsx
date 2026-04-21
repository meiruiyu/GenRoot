import Link from "next/link";
import { Pill } from "@/components/Pill";
import FamilyTree from "@/components/FamilyTree";
import { demoArchive } from "@/lib/demo-data";

const tagColors: Record<string, string> = {
  Place: "bg-[#4c7b73]/30 text-[#4c7b73]",
  Person: "bg-[#264653]/30 text-[#264653]",
  Ritual: "bg-[#c6653a]/25 text-[#c6653a]",
  Craft: "bg-[#e9c46a]/25 text-[#a07c20]",
  Emotion: "bg-white/20 text-[var(--muted)]",
};

const sortedMemories = [...demoArchive.memories].sort(
  (a, b) => Number(a.year) - Number(b.year),
);

export function ArchiveOverview() {
  return (
    <div className="space-y-8">
      {/* Stats + Quick Actions */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel-strong rounded-[32px] p-8">
          <Pill tone="accent">Mia's Private Archive</Pill>
          <h1 className="display-title font-display mt-4 text-[var(--ink)]">
            A Granddaughter's Quest to Preserve Her Heritage
          </h1>
          <p className="lede mt-4 max-w-2xl">
            Mia, a 25-year-old Miao graduate student in New York, races against time to save her 85-year-old grandmother's fading memories of songs, batik, and migration history.
          </p>
          <div className="mt-5 rounded-[24px] border border-white/15 bg-[rgba(0,0,0,0.12)] p-5">
            <p className="body-copy text-[var(--ink)]">
              Far from her home in Kaili, Guizhou, Mia fears that her grandmother's world will disappear forever. This archive is her attempt to capture the fragments of a culture held in a single, beloved voice.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">Family members</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">
                2
              </p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">Memories</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">
                {demoArchive.memories.length}
              </p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="eyebrow">Core Themes</p>
              <p className="numeric-emphasis mt-2 font-semibold text-[var(--ink)]">
                5
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <p className="eyebrow">
            Quick Actions
          </p>
          <h2 className="section-title font-display mt-3 text-[var(--ink)]">
            Start from urgency, then turn questions into something that can be kept.
          </h2>
          <p className="body-copy mt-3">
            This layer organizes Grandma Aqiao, Mia, and the family's private memories first. The next layer turns consented stories into public markers that let other people explore Kaili through lived family memory.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              ["/create", "Create Memory"],
              ["/ask-family", "Ask Family"],
              ["/explore", "Open Public Map"],
            ].map(([href, label]) => (
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

      {/* Timeline + Polaroid cards */}
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Vertical timeline */}
        <div className="glass-panel rounded-[32px] p-8">
          <p className="eyebrow">Timeline</p>
          <div className="relative mt-6 space-y-0">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-white/60 bg-[var(--accent)] mt-1 shrink-0" />
                <div className="w-px flex-1 bg-white/20 my-1" />
              </div>
              <div className="pb-6">
                <p className="eyebrow">1939 · Hunan</p>
                <p className="mt-1 text-[1rem] leading-7 text-[var(--ink)]">Grandmother is born.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-white/60 bg-[var(--accent)] mt-1 shrink-0" />
                <div className="w-px flex-1 bg-white/20 my-1" />
              </div>
              <div className="pb-6">
                <p className="eyebrow">1950s · Guizhou</p>
                <p className="mt-1 text-[1rem] leading-7 text-[var(--ink)]">Family migrates from Hunan to Guizhou, seeking refuge and a new home.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-white/60 bg-[var(--accent)] mt-1 shrink-0" />
                <div className="w-px flex-1 bg-white/20 my-1" />
              </div>
              <div className="pb-6">
                <p className="eyebrow">1999 · Kaili, Guizhou</p>
                <p className="mt-1 text-[1rem] leading-7 text-[var(--ink)]">Mia is born.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-white/60 bg-[var(--accent)] mt-1 shrink-0" />
              </div>
              <div className="pb-0">
                <p className="eyebrow">2024 · New York</p>
                <p className="mt-1 text-[1rem] leading-7 text-[var(--ink)]">Mia, now a student at Columbia, begins the GenRoot project to preserve her family's heritage.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Polaroid memory cards */}
        <div className="grid gap-4">
          {sortedMemories.map((memory) => (
            <Link
              key={memory.id}
              href={`/memories/${memory.id}`}
              className="glass-panel group rounded-[28px] overflow-hidden transition hover:-translate-y-0.5"
            >
              {/* Cover image strip */}
              {memory.coverImage ? (
                <div className="h-36 overflow-hidden">
                  <img
                    src={memory.coverImage}
                    alt={memory.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                  />
                </div>
              ) : null}

              {/* Card body */}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{memory.language}</Pill>
                  <Pill tone="light">{memory.year}</Pill>
                  <Pill tone="light">{memory.duration}</Pill>
                </div>
                <h2 className="font-display mt-3 text-[1.85rem] leading-[1.04] text-[var(--ink)]">{memory.title}</h2>
                <p className="body-copy mt-2">{memory.teaser}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span
                      key={`${tag.category}-${tag.label}`}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${tagColors[tag.category] ?? "glass-chip"}`}
                    >
                      {tag.category} · {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Family Tree */}
      <section className="space-y-4">
        <div className="glass-panel rounded-[32px] p-8">
          <Pill tone="accent">Family Tree</Pill>
          <h2 className="display-title font-display mt-4 text-[var(--ink)]">
            Organize the archive around people, not around loose files.
          </h2>
          <p className="lede mt-4 max-w-3xl">
            Grandma Aqiao's songs, wax dye, migration story, and Mia's attempt to rediscover Kaili all make more sense when they are anchored to real people, relationships, and inherited memory.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="glass-panel rounded-[32px] p-4">
            <p className="eyebrow px-3 pt-2">
              Family Media
            </p>
            <video
              className="mt-3 aspect-video w-full rounded-[24px] object-cover"
              src="/demo-assets/Hailuo_Video__Pan right_. A peaceful morning in a Miao village near Kaili, Guizhou, wooden houses, mountain mist,_499453826111090696.mp4"
              controls
              muted
              playsInline
            />
            <p className="body-copy px-3 pb-2 pt-3">
              This demo should feel like a living archive, not only a set of cards. The village footage and family images give Mia's memory tree a concrete emotional and geographic context.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "/demo-assets/grandma-portrait.jpg",
              "/demo-assets/grandma-storytelling.jpg",
              "/demo-assets/grandma-wax-dye.png",
              "/demo-assets/mia-phone-call.jpg",
            ].map((src) => (
              <div key={src} className="glass-panel overflow-hidden rounded-[28px]">
                <img src={src} alt="Family archive media" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <FamilyTree />
      </section>
    </div>
  );
}
