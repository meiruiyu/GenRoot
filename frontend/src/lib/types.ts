export type UserRole = "record" | "explore" | "both";

export type InterestTag =
  | "Ethnic Dress"
  | "Language & Songs"
  | "Traditional Crafts"
  | "Festivals & Rituals"
  | "Food & Recipes"
  | "Family Stories"
  | "Architecture & Villages"
  | "Beliefs & Ceremonies";

export type StoryMarkerType = "craft" | "ritual" | "person";

export type PrivacyLevel = "private" | "family" | "public";

export interface OnboardingPreference {
  role: UserRole;
  hometown: string;
  interests: InterestTag[];
}

export interface MemoryTag {
  label: string;
  category: "Place" | "Person" | "Ritual" | "Craft" | "Emotion";
}

export interface AIEntities {
  people: string[];
  locations: string[];
  years: string[];
  events: string[];
}

export interface AIEnrichment {
  transcript: string;
  translation: string;
  summary: string;
  publicSafeVersion: string;
  tags: MemoryTag[];
  entities: AIEntities;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  hometown: string;
  generation: string;
  bio: string;
  heritageLanguage: string;
  avatar: string;
  storyCount: number;
  position: {
    x: number;
    y: number;
  };
}

export interface TimelineEvent {
  year: string;
  title: string;
  location: string;
}

export interface MemoryEntry {
  id: string;
  memberId: string;
  title: string;
  teaser: string;
  duration: string;
  date: string;
  location: string;
  year: string;
  language: string;
  privacy: PrivacyLevel;
  type: StoryMarkerType;
  coverImage: string;
  audioLabel: string;
  transcript: string;
  translation: string;
  summary: string;
  tags: MemoryTag[];
  entities: AIEntities;
  publicSafeVersion: string;
}

export interface PublicStory {
  id: string;
  memoryId: string;
  title: string;
  summary: string;
  country: string;
  region: string;
  dialect: string;
  type: StoryMarkerType;
  coordinates: {
    x: number;
    y: number;
  };
  tags: string[];
  sourceFamily: string;
}

export interface FamilyArchive {
  id: string;
  title: string;
  subtitle: string;
  homeRegion: string;
  theme: string;
  members: FamilyMember[];
  memories: MemoryEntry[];
  publicStories: PublicStory[];
  timeline: TimelineEvent[];
}

export interface FamilyAnswer {
  answer: string;
  citations: string[];
}

export interface EnrichMemoryInput {
  title: string;
  memberName: string;
  location: string;
  language: string;
  story: string;
}

export interface FamilyQuestionInput {
  question: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  memoryIds?: string[];
}

export interface TTSInput {
  text: string;
  voice: string;
}
