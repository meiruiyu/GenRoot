"use client";

import { useState } from "react";
import { Pill } from "@/components/Pill";
import { StoryMap } from "@/components/StoryMap";
import { demoArchive } from "@/lib/demo-data";
import type { StoryMarkerType } from "@/lib/types";

type TypeFilter = StoryMarkerType | "all";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all",    label: "All" },
  { value: "craft",  label: "Craft" },
  { value: "ritual", label: "Ritual" },
  { value: "person", label: "Person" },
];

export default function ExplorePage() {
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(demoArchive.publicStories.flatMap((s) => s.tags)),
  );

  const filtered = demoArchive.publicStories.filter((story) => {
    const typeMatch = activeType === "all" || story.type === activeType;
    const tagMatch = activeTag === null || story.tags.includes(activeTag);
    return typeMatch && tagMatch;
  });

  return (
    <main className="page-shell space-y-8">
      <section className="glass-panel-strong rounded-[32px] p-8">
        <Pill tone="accent">Community Culture Guide</Pill>
        <h1 className="mt-4 font-display text-5xl text-[var(--ink)]">
          Discover cultural stories left behind by real families.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          Every marker represents a real piece of family memory. Filter by type and tag to find stories that resonate with your own heritage questions.
        </p>

        {/* Type filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TYPE_FILTERS.map(({ value, label }) => {
            const count = value === "all"
              ? demoArchive.publicStories.length
              : demoArchive.publicStories.filter((s) => s.type === value).length;
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

        {/* Tag filter */}
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
        <p className="text-center text-sm text-[var(--muted)]">
          No stories match this filter set. Try clearing one of the filters.
        </p>
      )}
    </main>
  );
}
