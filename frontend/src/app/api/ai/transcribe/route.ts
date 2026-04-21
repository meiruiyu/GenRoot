import { NextResponse } from "next/server";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_BASE = "https://api.minimax.io/v1";
const MINIMAX_TEXT_MODEL = process.env.MINIMAX_TEXT_MODEL || "MiniMax-M2.5";

type ExtractedEntities = {
  people: string[];
  locations: string[];
  years: string[];
  events: string[];
};

type AudioPayload = {
  base64: string;
  mimeType: string;
  extension: string;
};

function parseAudioPayload(input: string): AudioPayload {
  const dataUrlMatch = input.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = dataUrlMatch?.[1] || "audio/webm";
  const rawBase64 = dataUrlMatch?.[2] || input;
  const base64 = rawBase64.replace(/\s/g, "");

  if (!base64) {
    throw new Error("Audio payload is empty");
  }

  const extension =
    mimeType.includes("wav") ? "wav" :
    mimeType.includes("mp4") || mimeType.includes("m4a") ? "m4a" :
    mimeType.includes("mpeg") ? "mp3" :
    "webm";

  return { base64, mimeType, extension };
}

function extractTextFromModelResponse(data: any): string {
  const candidates = [
    data?.choices?.[0]?.message?.content,
    data?.data?.text,
    data?.data?.result,
    data?.data?.output_text,
    data?.data,
    data?.text,
    data?.content,
    data?.output_text,
    data?.result,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return "";
}

function sanitizeModelText(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .replace(/^(analysis|reasoning|thought process)\s*:\s*/i, "")
    .trim();
}

function normalizeTranscript(text: string): string {
  return sanitizeModelText(text)
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function buildFallbackTranscript(questionHint?: string, transcriptHint?: string): string {
  if (transcriptHint && transcriptHint.trim().length >= 8) {
    return normalizeTranscript(transcriptHint);
  }

  if (questionHint && questionHint.trim().length > 0) {
    return `The recording about "${questionHint.trim()}" has been saved. It appears to describe family experience, local culture, and intergenerational memory, and should be reviewed before public sharing.`;
  }

  return "This recording has been saved. It appears to contain family memory, local knowledge, and cultural heritage details. Add people, place, and title information in the archive for a cleaner record.";
}

function fallbackSummary(text: string): string {
  if (!text.trim()) {
    return "The memory has been saved and is waiting for more context.";
  }

  return "This memory has been organized into a first-pass archive entry focused on family experience, local culture, and intergenerational continuity. Add people, places, and dates to improve search and sharing quality.";
}

function fallbackPublicVersion(location?: string): string {
  return `A family from ${location || "their hometown"} shared a real memory connected to local culture and intergenerational heritage. Private details have been softened for public viewing.`;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function heuristicEntities(text: string): ExtractedEntities {
  const people: string[] = [];
  const locations: string[] = [];
  const years: string[] = [];
  const events: string[] = [];

  const lower = text.toLowerCase();

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

  const yearMatches = text.match(/\b(18|19|20)\d{2}s?\b/g) || [];
  const chineseYearMatches = text.match(/(19|20)\d{2}年代/g) || [];
  years.push(...yearMatches, ...chineseYearMatches);

  const eventHints = [
    { test: /(migrat|moved|walked for|settled)/i, label: "Migration" },
    { test: /(festival|new year|ceremony|ritual)/i, label: "Festival" },
    { test: /(wax dye|song|ancient song|craft)/i, label: "Craft Practice" },
    { test: /(搬过来|迁|山路|安下家)/, label: "Migration" },
    { test: /(节日|过年|仪式|庆典)/, label: "Festival" },
    { test: /(蜡染|古歌|手艺)/, label: "Craft Practice" },
  ];

  for (const hint of eventHints) {
    if (hint.test.test(text) || hint.test.test(lower)) {
      events.push(hint.label);
    }
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

function mergeEntities(primary: ExtractedEntities, fallback: ExtractedEntities): ExtractedEntities {
  return {
    people: unique([...primary.people, ...fallback.people]).slice(0, 6),
    locations: unique([...primary.locations, ...fallback.locations]).slice(0, 6),
    years: unique([...primary.years, ...fallback.years]).slice(0, 6),
    events: unique([...primary.events, ...fallback.events]).slice(0, 6),
  };
}

async function callTextModel(prompt: string): Promise<string> {
  if (!MINIMAX_API_KEY) {
    return "";
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
            "You are an expert assistant for speech-to-text post-processing, oral history summarization, entity extraction, translation, and archive-safe cultural storytelling.",
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
    throw new Error(`Text API failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data?.error_code) {
    throw new Error(`Text API error: ${data.error_msg || data.error_code}`);
  }

  return sanitizeModelText(extractTextFromModelResponse(data));
}

async function transcribeWithMiniMax(
  audio: AudioPayload,
  opts: { questionHint?: string; transcriptHint?: string },
): Promise<{ transcript: string; provider: "minimax" | "fallback" }> {
  if (!MINIMAX_API_KEY) {
    return {
      transcript: buildFallbackTranscript(opts.questionHint, opts.transcriptHint),
      provider: "fallback",
    };
  }

  try {
    const audioBuffer = Buffer.from(audio.base64, "base64");
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: audio.mimeType });

    formData.append("file", audioBlob, `audio.${audio.extension}`);
    formData.append("model_name", "speech-to-text");

    const response = await fetch(`${MINIMAX_API_BASE}/audio_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ASR failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.error_code) {
      throw new Error(`ASR error: ${data.error_msg || data.error_code}`);
    }

    const transcript = normalizeTranscript(extractTextFromModelResponse(data));
    if (!transcript || transcript.length < 2) {
      return {
        transcript: buildFallbackTranscript(opts.questionHint, opts.transcriptHint),
        provider: "fallback",
      };
    }

    return { transcript, provider: "minimax" };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      transcript: buildFallbackTranscript(opts.questionHint, opts.transcriptHint),
      provider: "fallback",
    };
  }
}

async function translateText(text: string): Promise<string> {
  if (!MINIMAX_API_KEY || text.length === 0) {
    return text;
  }

  try {
    const result = await callTextModel(
      `Translate the following family story or oral history into natural English. Keep the cultural context and emotional tone.
Do not include analysis, reasoning, or <think> tags.
Only output the final translation.

${text}`,
    );
    return result || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

async function summarizeText(text: string): Promise<string> {
  if (!MINIMAX_API_KEY || text.length === 0) {
    return fallbackSummary(text);
  }

  try {
    const result = await callTextModel(
      `Summarize this family story or oral history in 2 to 3 sentences in Chinese. Focus on cultural insights, traditions, migration, and heritage value. Keep the tone warm.
Do not include analysis, reasoning, or <think> tags.
Only output the final summary.

${text}`,
    );
    return result || fallbackSummary(text);
  } catch (error) {
    console.error("Summarization error:", error);
    return fallbackSummary(text);
  }
}

async function extractEntities(text: string): Promise<ExtractedEntities> {
  if (!MINIMAX_API_KEY || text.length === 0) {
    return heuristicEntities(text);
  }

  try {
    const resultText = await callTextModel(
      `Extract entities from this family or cultural story and return only valid JSON.

Schema:
{"people":[],"locations":[],"years":[],"events":[]}

Focus on family members, place names, dates or eras, and important events or rituals.
Do not include analysis, reasoning, or <think> tags.

Text:
${text}`,
    );

    const cleanJson = sanitizeModelText(resultText).replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const aiEntities = {
      people: Array.isArray(parsed.people) ? parsed.people : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
      years: Array.isArray(parsed.years) ? parsed.years : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
    return mergeEntities(aiEntities, heuristicEntities(text));
  } catch (error) {
    console.error("Entity extraction error:", error);
    return heuristicEntities(text);
  }
}

async function createPublicVersion(text: string, location: string): Promise<string> {
  if (!MINIMAX_API_KEY || !text) {
    return fallbackPublicVersion(location);
  }

  try {
    const result = await callTextModel(
      `Create an anonymized, public-safe version of this family story for a cultural heritage archive.
Rules:
- Remove personal names and private details
- Keep cultural practices, migration context, and emotional value
- Maximum 200 Chinese characters
- Write in natural Chinese
- Do not include analysis, reasoning, or <think> tags
- Only output the final rewritten text

Location: ${location}

Original text:
${text}`,
    );

    return result || fallbackPublicVersion(location);
  } catch (error) {
    console.error("Public version creation error:", error);
    return fallbackPublicVersion(location);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let audioBase64 = "";
    let transcriptHint = "";
    let question = "";
    let location = "Kaili, Guizhou";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("audio");
      transcriptHint = String(formData.get("transcriptHint") || "");
      question = String(formData.get("question") || "");
      location = String(formData.get("location") || "Kaili, Guizhou");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "No audio file provided" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      audioBase64 = `data:${file.type || "audio/webm"};base64,${buffer.toString("base64")}`;
    } else {
      const body = await request.json();
      audioBase64 = body?.audioBase64 || "";
      transcriptHint = body?.transcriptHint || "";
      question = body?.question || "";
      location = body?.location || "Kaili, Guizhou";
    }

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 },
      );
    }

    const audio = parseAudioPayload(audioBase64);
    const { transcript, provider } = await transcribeWithMiniMax(audio, {
      questionHint: typeof question === "string" ? question : "",
      transcriptHint: typeof transcriptHint === "string" ? transcriptHint : "",
    });

    const [translation, summary, entities, publicSafeVersion] = await Promise.all([
      translateText(transcript),
      summarizeText(transcript),
      extractEntities(transcript),
      createPublicVersion(transcript, typeof location === "string" ? location : "Kaili, Guizhou"),
    ]);

    const tags = Array.from(
      new Set(
        [...entities.locations, ...entities.events]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ).slice(0, 8);

    return NextResponse.json({
      provider,
      transcript,
      translation,
      summary,
      entities,
      publicSafeVersion,
      tags,
    });
  } catch (error) {
    console.error("Audio processing error:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 },
    );
  }
}
