"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/Pill";
import { demoArchive } from "@/lib/demo-data";
import { readAllMemories, type SavedMemory } from "@/lib/storage";

const tagColors: Record<string, string> = {
  地名: "bg-[#4c7b73]/30 text-[#4c7b73]",
  人物: "bg-[#264653]/30 text-[#264653]",
  习俗: "bg-[#c6653a]/25 text-[#c6653a]",
  技艺: "bg-[#e9c46a]/25 text-[#a07c20]",
  情感: "bg-white/20 text-[var(--muted)]",
};

export function ArchiveClient() {
  const [savedMemories, setSavedMemories] = useState<SavedMemory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSavedMemories(readAllMemories());
    setIsLoaded(true);
  }, []);

  // Combine demo + saved memories, sorted by date
  const allMemories = [
    ...demoArchive.memories.map((m) => ({
      id: m.id,
      createdAt: m.date,
      title: m.title,
      summary: m.summary,
      duration: m.duration,
      audioUrl: m.audioLabel,
      isDemo: true,
    })),
    ...savedMemories.map((m) => ({
      id: m.id,
      createdAt: m.createdAt,
      title: m.title,
      summary: m.summary,
      duration: m.duration,
      audioUrl: m.audioUrl,
      isDemo: false,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalMemories = isLoaded ? allMemories.length : demoArchive.memories.length;

  return (
    <div className="space-y-8">
      {/* Stats + Quick Actions */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel-strong rounded-[32px] p-8">
          <Pill tone="accent">Private Archive</Pill>
          <h1 className="mt-4 font-display text-5xl text-[var(--ink)]">
            {demoArchive.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {demoArchive.subtitle}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-chip rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Family members</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                {demoArchive.members.length}
              </p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Memories</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                {totalMemories}
              </p>
            </div>
            <div className="glass-chip rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Public stories</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                {demoArchive.publicStories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Quick Actions
          </p>
          <h2 className="mt-3 font-display text-3xl text-[var(--ink)]">
            在这里管理家族的所有记忆与关系。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            查看档案摘要与时间线，追溯家族迁徙历程，并通过家族树直观呈现每位成员的故事。
          </p>
          <div className="mt-6 grid gap-3">
            {[
              ["/create", "新建记忆"],
              ["/ask-family", "问问家人"],
              ["/explore", "查看公开地图"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href as string}
                className="glass-chip rounded-[22px] px-5 py-4 text-sm font-medium text-[var(--ink)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently saved memories */}
      {savedMemories.length > 0 && (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              📝 Recently saved
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--ink)]">
              Your new memories
            </h2>
          </div>

          <div className="grid gap-4">
            {savedMemories.slice(0, 3).map((memory) => (
              <div
                key={memory.id}
                className="glass-panel group rounded-[28px] p-6 transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Pill>录音</Pill>
                      <Pill tone="light">{memory.duration}</Pill>
                    </div>
                    <h3 className="font-display text-xl text-[var(--ink)] truncate">
                      {memory.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)] line-clamp-2">
                      {memory.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {memory.entities.locations.slice(0, 2).map((loc) => (
                        <span
                          key={loc}
                          className="glass-chip rounded-full px-3 py-1 text-xs"
                        >
                          📍 {loc}
                        </span>
                      ))}
                      {memory.entities.events.slice(0, 2).map((evt) => (
                        <span
                          key={evt}
                          className="glass-chip rounded-full px-3 py-1 text-xs"
                        >
                          🎭 {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                  {memory.audioUrl && (
                    <div className="shrink-0">
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio
                        controls
                        src={memory.audioUrl}
                        className="w-32"
                        style={{ maxHeight: "32px" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline + Polaroid cards */}
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Stats */}
        <div className="glass-panel rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Summary</p>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Total memories</p>
              <p className="mt-1 text-4xl font-bold text-[var(--ink)]">{totalMemories}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">From demo</p>
              <p className="mt-1 text-lg text-[var(--ink)]">{demoArchive.memories.length}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Your recordings</p>
              <p className="mt-1 text-lg text-[var(--accent)] font-semibold">
                {savedMemories.length}
              </p>
            </div>
          </div>
        </div>

        {/* Demo memory showcase */}
        <div className="grid gap-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            📚 Demo family stories
          </p>
          {demoArchive.memories.slice(0, 3).map((memory) => (
            <div
              key={memory.id}
              className="glass-panel group rounded-[28px] overflow-hidden transition hover:-translate-y-0.5"
            >
              {/* Cover image strip */}
              {memory.coverImage ? (
                <div className="h-32 overflow-hidden">
                  <img
                    src={memory.coverImage}
                    alt={memory.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                  />
                </div>
              ) : null}

              {/* Card body */}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>录音</Pill>
                  <Pill tone="light">{memory.year}</Pill>
                </div>
                <h3 className="mt-2 font-display text-lg text-[var(--ink)]">{memory.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)] line-clamp-2">
                  {memory.teaser}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
