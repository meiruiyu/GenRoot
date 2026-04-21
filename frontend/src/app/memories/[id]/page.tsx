import Link from "next/link";
import { notFound } from "next/navigation";
import { Pill } from "@/components/Pill";
import { demoArchive } from "@/lib/demo-data";

export default function MemoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const memory = demoArchive.memories.find((item) => item.id === params.id);

  if (!memory) {
    notFound();
  }

  const member = demoArchive.members.find((item) => item.id === memory.memberId);

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
            <p className="body-copy text-[var(--ink)]">
              This is one of the memories Mia wants to save first. For her, it is not just a piece of content. It is part of a race against time with her grandmother's fading strength.
            </p>
          </div>
          <div className="glass-chip mt-8 rounded-[24px] p-5">
            <p className="eyebrow">Audio</p>
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
          <p className="eyebrow">
            Transcript
          </p>
          <p className="mt-4 text-[1rem] leading-8 text-[var(--ink)]">{memory.transcript}</p>
          <p className="eyebrow mt-6">
            Translation
          </p>
          <p className="mt-4 text-[1rem] leading-8 text-[var(--ink)]">{memory.translation}</p>
        </div>

        <div className="glass-panel-strong rounded-[32px] p-8">
          <p className="eyebrow">
            AI Enrichment
          </p>
          <div className="body-copy mt-4 space-y-5">
            <div>
              <p className="font-medium text-[var(--ink)]">Summary</p>
              <p>{memory.summary}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">Why Mia saved this</p>
              <p>
                This memory helps Mia answer two questions: what exactly could disappear with her grandmother, and where her own connection to Kaili's culture truly begins.
              </p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">Public-safe version</p>
              <p>{memory.publicSafeVersion}</p>
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">Entities</p>
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
              <p className="font-medium text-[var(--ink)]">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <Pill key={`${tag.category}-${tag.label}`}>{tag.category} · {tag.label}</Pill>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="glass-button rounded-full px-5 py-3 text-sm font-medium"
            >
              Publish to Map
            </Link>
            <Link
              href="/ask-family"
              className="glass-button-secondary rounded-full px-5 py-3 text-sm"
            >
              Ask Family
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
