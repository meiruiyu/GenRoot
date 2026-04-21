import { defaultPreference } from "@/lib/demo-data";
import type { OnboardingPreference } from "@/lib/types";

const STORAGE_KEY = "memory-roots:onboarding";

export function readPreference(): OnboardingPreference {
  if (typeof window === "undefined") {
    return defaultPreference;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultPreference;
  }

  try {
    return JSON.parse(raw) as OnboardingPreference;
  } catch {
    return defaultPreference;
  }
}

export function writePreference(value: OnboardingPreference) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function hasPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearPreference() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// ── Recording context ────────────────────────────────────────────────────────
// Image (base64) is kept in-memory only — too large for localStorage.
// Only the question string is persisted as a fallback across hard refreshes.

const RECORD_KEY = "memory-roots:record-question";

export interface RecordContext {
  question: string;
  mediaPreview?: string;
  mediaType?: "image" | "video";
}

let _recordContext: RecordContext | null = null;

export function writeRecordContext(ctx: RecordContext) {
  _recordContext = ctx;
  // Persist only the question (text is tiny, no quota risk)
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RECORD_KEY, ctx.question);
    }
  } catch {
    // quota edge-case: in-memory is still enough for same-tab navigation
  }
}

export function readRecordContext(): RecordContext | null {
  if (_recordContext) return _recordContext;
  // Fallback: question from localStorage (image will be absent after hard refresh)
  if (typeof window === "undefined") return null;
  const question = window.localStorage.getItem(RECORD_KEY);
  if (!question) return null;
  return { question };
}

export function clearRecordContext() {
  _recordContext = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(RECORD_KEY);
  }
}

// ── Completed memories (local archive) ───────────────────────────────────
// All AI-enriched memories stored locally, keyed by ID
const MEMORIES_KEY = "memory-roots:memories";

export interface SavedMemory {
  id: string;
  createdAt: string;
  title: string;
  memberName: string;
  location: string;
  language: string;
  // Raw audio URL (blob-based, local only)
  audioUrl: string;
  duration: string;
  // AI enrichment results
  transcript: string;
  translation: string;
  summary: string;
  tags: string[];
  entities: {
    people: string[];
    locations: string[];
    years: string[];
    events: string[];
  };
  publicSafeVersion: string;
  provider: string;
}

export function readAllMemories(): SavedMemory[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(MEMORIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedMemory[];
  } catch {
    return [];
  }
}

export function saveMemory(memory: SavedMemory) {
  if (typeof window === "undefined") return;
  const existing = readAllMemories();
  const updated = [...existing, memory];
  try {
    window.localStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save memory (quota?)", e);
    // In production, could fall back to indexedDB or notify user
  }
}

export function deleteMemory(id: string) {
  if (typeof window === "undefined") return;
  const existing = readAllMemories();
  const updated = existing.filter((m) => m.id !== id);
  window.localStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
}
