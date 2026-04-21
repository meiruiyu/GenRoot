import { demoArchive, sampleFamilyAnswers } from "@/lib/demo-data";
import { MEMORY_ROOTS_KNOWLEDGE_BASE } from "@/lib/memory-roots-knowledge";
import type {
  EnrichMemoryInput,
  FamilyAnswer,
  FamilyQuestionInput,
  TTSInput,
} from "@/lib/types";

const MINIMAX_API_BASE = "https://api.minimax.io/v1";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_TEXT_MODEL = process.env.MINIMAX_TEXT_MODEL || "MiniMax-M2.5";

export interface AIProvider {
  name: string;
  generateIcebreakers(input: {
    prompt: string;
    imageBase64?: string;
  }): Promise<{ questions: string[] }>;
  enrichMemory(input: EnrichMemoryInput): Promise<{
    provider: string;
    transcript: string;
    translation: string;
    summary: string;
    tags: string[];
    publicSafeVersion: string;
    entities: {
      people: string[];
      locations: string[];
      years: string[];
      events: string[];
    };
  }>;
  answerFamilyQuestion(input: FamilyQuestionInput): Promise<FamilyAnswer>;
  createPublicVersion(input: { story: string; location: string }): Promise<{
    provider: string;
    publicSafeVersion: string;
  }>;
  synthesizeSpeech(input: TTSInput): Promise<{
    provider: string;
    audioLabel: string;
  }>;
}

class MockAIProvider implements AIProvider {
  name = "mock";

  async generateIcebreakers(input: { prompt: string; imageBase64?: string }) {
    const ctx = input.prompt || "this photo";
    return {
      questions: [
        "What is the first person or detail this makes you think about?",
        `When you remember "${ctx.slice(0, 24)}", what small detail returns most clearly?`,
        "If this memory became a title in your family archive, what would you call it?",
      ],
    };
  }

  async enrichMemory(input: EnrichMemoryInput) {
    return {
      provider: this.name,
      transcript: input.story,
      translation: `English rendering: ${input.story.slice(0, 120)}...`,
      summary: `${input.memberName}'s story from ${input.location} has been structured into a record about family experience, local culture, and intergenerational continuity.`,
      tags: [input.location, input.memberName, "Family Story", "Local Memory"],
      publicSafeVersion: `A family member from ${input.location} recalls a real experience tied to local culture. Sensitive details have been softened for safe public sharing.`,
      entities: {
        people: [input.memberName],
        locations: [input.location],
        years: ["Year to confirm"],
        events: ["Oral history capture"],
      },
    };
  }

  async answerFamilyQuestion(input: FamilyQuestionInput) {
    return (
      sampleFamilyAnswers[input.question] ?? {
        answer:
          "There is no exact canned answer for that in the current demo. Based on the archive so far, the system would start from migration, festivals, and everyday family memory to assemble a traceable response.",
        citations: demoArchive.memories.map((memory) => memory.title).slice(0, 2),
      }
    );
  }

  async createPublicVersion(input: { story: string; location: string }) {
    return {
      provider: this.name,
      publicSafeVersion: `A family memory from ${input.location} has been rewritten into a public-facing cultural story that keeps the sense of place while removing private details: ${input.story.slice(
        0,
        80,
      )}...`,
    };
  }

  async synthesizeSpeech(input: TTSInput) {
    return {
      provider: this.name,
      audioLabel: `${input.voice} · ${Math.max(8, Math.ceil(input.text.length / 14))}s`,
    };
  }
}

async function callMiniMax(prompt: string): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_TEXT_MODEL,
      messages: [
        {
          role: "system",
          name: "MiniMax AI",
          content:
            "You are an expert assistant for family memory preservation, cultural heritage archiving, oral history processing, and multilingual storytelling.",
        },
        {
          role: "user",
          name: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  if (data?.error_code) {
    throw new Error(`MiniMax error: ${data.error_msg || data.error_code}`);
  }

  const result =
    data?.choices?.[0]?.message?.content ??
    data?.data?.text ??
    data?.data?.result ??
    data?.data ??
    data?.content ??
    "";

  return typeof result === "string" ? sanitizeModelText(result) : "";
}

function sanitizeModelText(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .replace(/^(analysis|reasoning|thought process)\s*:\s*/i, "")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function heuristicEntities(text: string): {
  people: string[];
  locations: string[];
  years: string[];
  events: string[];
} {
  const people: string[] = [];
  const locations: string[] = [];
  const years: string[] = [];
  const events: string[] = [];

  const peoplePatterns = [
    /grandma aqiao/gi,
    /grandma/gi,
    /grandmother/gi,
    /father/gi,
    /mother/gi,
    /阿爸/g,
    /奶奶/g,
    /外婆/g,
    /爷爷/g,
    /爸爸/g,
    /妈妈/g,
  ];
  for (const pattern of peoplePatterns) {
    const matches = text.match(pattern);
    if (matches) people.push(...matches);
  }

  const locationPatterns = [
    /kaili/gi,
    /guizhou/gi,
    /hunan/gi,
    /new york/gi,
    /纽约/g,
    /凯里/g,
    /贵州/g,
    /湖南/g,
  ];
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches) locations.push(...matches);
  }

  years.push(...(text.match(/\b(18|19|20)\d{2}s?\b/g) || []));
  years.push(...(text.match(/(19|20)\d{2}年代/g) || []));

  const eventHints = [
    { test: /(migrat|moved|walked for|settled)/i, label: "Migration" },
    { test: /(festival|new year|ceremony|ritual)/i, label: "Festival" },
    { test: /(wax dye|song|ancient song|craft)/i, label: "Craft Practice" },
    { test: /(搬过来|迁|山路|安下家)/, label: "Migration" },
    { test: /(节日|过年|仪式|庆典)/, label: "Festival" },
    { test: /(蜡染|古歌|手艺)/, label: "Craft Practice" },
  ];
  for (const hint of eventHints) {
    if (hint.test.test(text)) events.push(hint.label);
  }

  if (people.length === 0 && text.trim()) {
    people.push("Family member");
  }

  return {
    people: unique(people).slice(0, 6),
    locations: unique(locations).slice(0, 6),
    years: unique(years).slice(0, 6),
    events: unique(events).slice(0, 6),
  };
}

function mergeEntities(
  primary: { people: string[]; locations: string[]; years: string[]; events: string[] },
  fallback: { people: string[]; locations: string[]; years: string[]; events: string[] },
) {
  return {
    people: unique([...primary.people, ...fallback.people]).slice(0, 6),
    locations: unique([...primary.locations, ...fallback.locations]).slice(0, 6),
    years: unique([...primary.years, ...fallback.years]).slice(0, 6),
    events: unique([...primary.events, ...fallback.events]).slice(0, 6),
  };
}

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = sanitizeModelText(text).replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

class MiniMaxAIProvider implements AIProvider {
  name = "minimax";
  private readonly fallback = new MockAIProvider();

  async generateIcebreakers(input: { prompt: string; imageBase64?: string }) {
    if (!MINIMAX_API_KEY) {
      return this.fallback.generateIcebreakers(input);
    }

    try {
      const result = await callMiniMax(
        `Generate exactly 3 short interview icebreaker questions for a family memory archive.

Context:
- Topic: ${input.prompt || "family memory"}
- Image attached: ${input.imageBase64 ? "yes" : "no"}

Requirements:
- Warm and respectful tone
- Questions should help an elder tell a story naturally
- Keep each question under 20 words
- Do not include analysis, reasoning, or <think> tags
- Return only valid JSON in this shape:
{"questions":["","",""]}`,
      );

      const parsed = safeJsonParse<{ questions?: string[] }>(result, { questions: [] });
      const questions = Array.isArray(parsed.questions)
        ? parsed.questions.map((q) => q.trim()).filter(Boolean).slice(0, 3)
        : [];

      return questions.length === 3
        ? { questions }
        : this.fallback.generateIcebreakers(input);
    } catch (error) {
      console.error("MiniMax icebreakers failed:", error);
      return this.fallback.generateIcebreakers(input);
    }
  }

  async enrichMemory(input: EnrichMemoryInput) {
    if (!MINIMAX_API_KEY) {
      return this.fallback.enrichMemory(input);
    }

    try {
      const [translation, summary, tagsText, entitiesText, publicSafeVersion] = await Promise.all([
        callMiniMax(
          `Translate the following family memory into natural English. Keep emotional and cultural context.
Do not include analysis, reasoning, or <think> tags.
Only output the final translation.

${input.story}`,
        ),
        callMiniMax(
          `Summarize this family memory in 2-3 sentences. Focus on heritage, family context, and cultural value.
Do not include analysis, reasoning, or <think> tags.
Only output the final summary.

Title: ${input.title}
Member: ${input.memberName}
Location: ${input.location}
Language: ${input.language}
Story:
${input.story}`,
        ),
        callMiniMax(
          `Extract 4 to 8 concise tags for this family memory. Include place, person, tradition, emotion, and cultural cues when relevant.
Do not include analysis, reasoning, or <think> tags.
Return only valid JSON:
{"tags":[]}

Story:
${input.story}`,
        ),
        callMiniMax(
          `Extract entities from this family memory. Return only valid JSON:
{"people":[],"locations":[],"years":[],"events":[]}

Do not include analysis, reasoning, or <think> tags.

Story:
${input.story}`,
        ),
        callMiniMax(
          `Rewrite this memory into a public-safe archive version.
- Remove personal details
- Keep place, cultural practice, migration, and heritage meaning
- Keep it under 90 words
- Do not include analysis, reasoning, or <think> tags
- Only output the final rewritten version

Location: ${input.location}
Story:
${input.story}`,
        ),
      ]);

      const parsedTags = safeJsonParse<{ tags?: string[] }>(tagsText, { tags: [] });
      const parsedEntities = safeJsonParse<{
        people?: string[];
        locations?: string[];
        years?: string[];
        events?: string[];
      }>(entitiesText, {});
      const mergedEntities = mergeEntities(
        {
          people: Array.isArray(parsedEntities.people) ? parsedEntities.people : [],
          locations: Array.isArray(parsedEntities.locations) ? parsedEntities.locations : [],
          years: Array.isArray(parsedEntities.years) ? parsedEntities.years : [],
          events: Array.isArray(parsedEntities.events) ? parsedEntities.events : [],
        },
        heuristicEntities(input.story),
      );

      return {
        provider: this.name,
        transcript: input.story,
        translation: translation || input.story,
        summary: summary || `${input.memberName}'s story has been organized into a structured memory record.`,
        tags: Array.isArray(parsedTags.tags)
          ? parsedTags.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 8)
          : [input.location, input.memberName],
        publicSafeVersion:
          publicSafeVersion ||
          `A family memory from ${input.location} has been prepared for safe public sharing.`,
        entities: mergedEntities,
      };
    } catch (error) {
      console.error("MiniMax enrichment failed:", error);
      return this.fallback.enrichMemory(input);
    }
  }

  async answerFamilyQuestion(input: FamilyQuestionInput) {
    if (!MINIMAX_API_KEY) {
      return this.fallback.answerFamilyQuestion(input);
    }

    try {
      const recentHistory = (input.history || [])
        .slice(-6)
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n");

      const result = await callMiniMax(
        `You are the Ask Family chatbot for GenRoot.

Use the knowledge base below as your primary grounding. You may use the archive examples as secondary support. Do not invent facts that are not supported by the provided context.

Knowledge base:
${MEMORY_ROOTS_KNOWLEDGE_BASE}

Archive examples:
${demoArchive.memories
  .map(
    (memory) =>
      `Title: ${memory.title}\nSummary: ${memory.summary}\nLocation: ${memory.location}\nThemes: ${memory.tags.map((tag) => tag.label).join(", ")}`,
  )
  .join("\n\n")}

Conversation so far:
${recentHistory || "No prior messages."}

Answer the current user question in a warm, grounded, concise way.
If details are uncertain, say so clearly.

Return only valid JSON:
{"answer":"","citations":[]}

Do not include analysis, reasoning, or <think> tags.

Current user question:
${input.question}

Citations should be short topical references, not full quotes.`,
      );

      const parsed = safeJsonParse<{ answer?: string; citations?: string[] }>(result, {});
      if (!parsed.answer) {
        return this.fallback.answerFamilyQuestion(input);
      }

      return {
        answer: parsed.answer,
        citations: Array.isArray(parsed.citations) ? parsed.citations.slice(0, 3) : [],
      };
    } catch (error) {
      console.error("MiniMax family Q&A failed:", error);
      return this.fallback.answerFamilyQuestion(input);
    }
  }

  async createPublicVersion(input: { story: string; location: string }) {
    if (!MINIMAX_API_KEY) {
      return this.fallback.createPublicVersion(input);
    }

    try {
      const publicSafeVersion = await callMiniMax(
        `Rewrite the following family memory as an anonymized public cultural story.
- Remove names and private details
- Keep place, practice, migration, and heritage meaning
- Keep it concise
- Do not include analysis, reasoning, or <think> tags
- Only output the final rewritten story

Location: ${input.location}
Story:
${input.story}`,
      );

      return {
        provider: this.name,
        publicSafeVersion:
          publicSafeVersion ||
          `A family memory from ${input.location} has been rewritten for public cultural sharing.`,
      };
    } catch (error) {
      console.error("MiniMax public version failed:", error);
      return this.fallback.createPublicVersion(input);
    }
  }

  async synthesizeSpeech(input: TTSInput) {
    if (!MINIMAX_API_KEY) {
      return this.fallback.synthesizeSpeech(input);
    }

    return {
      provider: this.name,
      audioLabel: `MiniMax voice preview · ${Math.max(8, Math.ceil(input.text.length / 16))}s`,
    };
  }
}

export function getAIProvider(name = process.env.AI_PROVIDER ?? "mock"): AIProvider {
  if (name === "minimax") {
    return new MiniMaxAIProvider();
  }

  return new MockAIProvider();
}
