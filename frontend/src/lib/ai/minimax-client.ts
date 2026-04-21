// MiniMax API client for speech recognition, translation, summarization, and entity extraction

const MINIMAX_API_BASE = "https://api.minimaxi.com/v1";
const API_KEY = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || process.env.MINIMAX_API_KEY;

interface ASRResponse {
  data?: {
    text: string;
  };
  error_code?: number;
  error_msg?: string;
}

interface TextResponse {
  data?: string;
  error_code?: number;
  error_msg?: string;
}

interface EntityExtractionResponse {
  data?: {
    entities: Array<{
      text: string;
      type: string;
    }>;
  };
  error_code?: number;
  error_msg?: string;
}

// 1. Speech-to-text using MiniMax ASR API
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model_name", "speech-to-text");

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/audio_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ASR failed: ${response.statusText}`);
    }

    const data = (await response.json()) as ASRResponse;

    if (data.error_code) {
      throw new Error(`ASR error: ${data.error_msg}`);
    }

    return data.data?.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

// 2. Text translation
async function translateText(text: string, targetLang = "zh"): Promise<string> {
  if (!API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  if (targetLang === "zh") {
    // If already Chinese-ish, return as-is
    return text;
  }

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Translate the following text to English. Only output the translation, no explanations:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = (await response.json()) as TextResponse;

    if (data.error_code) {
      throw new Error(`Translation error: ${data.error_msg}`);
    }

    return data.data || text;
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback: return original text
    return text;
  }
}

// 3. Text summarization
async function summarizeText(text: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Summarize the following family story/memory in 2-3 sentences in Chinese. Focus on cultural insights, migration experiences, and heritage. Keep the emotional tone warm:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Summarization failed: ${response.statusText}`);
    }

    const data = (await response.json()) as TextResponse;

    if (data.error_code) {
      throw new Error(`Summarization error: ${data.error_msg}`);
    }

    return data.data || "记忆已记录。";
  } catch (error) {
    console.error("Summarization error:", error);
    // Fallback: generic summary
    return `记忆已记录。字数：${text.length}。`;
  }
}

// 4. Entity extraction (people, locations, years, events)
async function extractEntities(
  text: string,
): Promise<{
  people: string[];
  locations: string[];
  years: string[];
  events: string[];
}> {
  if (!API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Extract entities from this family/cultural story in JSON format. Focus on:
- people: family member names or relationships
- locations: place names, cities, regions
- years: years, dates, time periods mentioned
- events: significant events, ceremonies, holidays

Return only valid JSON, no markdown:
{"people": [], "locations": [], "years": [], "events": []}

Text: ${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Entity extraction failed: ${response.statusText}`);
    }

    const data = (await response.json()) as TextResponse;

    if (data.error_code) {
      throw new Error(`Entity extraction error: ${data.error_msg}`);
    }

    try {
      // Try to parse the response as JSON
      const jsonStr = data.data || "{}";
      const parsed = JSON.parse(jsonStr);
      return {
        people: Array.isArray(parsed.people) ? parsed.people : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations : [],
        years: Array.isArray(parsed.years) ? parsed.years : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch {
      // Fallback: return empty entities
      return { people: [], locations: [], years: [], events: [] };
    }
  } catch (error) {
    console.error("Entity extraction error:", error);
    return { people: [], locations: [], years: [], events: [] };
  }
}

// 5. Create public-safe version (anonymization)
async function createPublicVersion(
  text: string,
  location: string,
): Promise<string> {
  if (!API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text_to_text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Create an anonymized, public-safe version of this family story for a global cultural heritage archive. 
- Remove all personal names, addresses, phone numbers
- Keep cultural insights, traditions, migration patterns
- Preserve emotional depth and heritage value
- Focus on what makes it valuable for others: language, customs, food, traditions, migration experiences
Location context: ${location}

Original: ${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Public version creation failed: ${response.statusText}`);
    }

    const data = (await response.json()) as TextResponse;

    if (data.error_code) {
      throw new Error(`Public version error: ${data.error_msg}`);
    }

    return data.data || "";
  } catch (error) {
    console.error("Public version creation error:", error);
    // Fallback: simple anonymization
    return `来自 ${location} 的一段家庭文化记忆。`;
  }
}

export const MinimaxClient = {
  transcribeAudio,
  translateText,
  summarizeText,
  extractEntities,
  createPublicVersion,
};
