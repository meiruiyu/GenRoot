// MiniMax Realtime API Client - WebSocket based low-latency streaming
// Supports real-time text/audio input and output

interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

interface TranscriptDelta {
  transcript: string;
  isFinal: boolean;
}

interface RealtimeResponse {
  transcript?: string;
  translation?: string;
  summary?: string;
  entities?: {
    people: string[];
    locations: string[];
    years: string[];
    events: string[];
  };
  content?: string;
  isDone?: boolean;
}

export class RealtimeAPIClient {
  private ws: WebSocket | null = null;
  private url: string;
  private apiKey: string;
  private model = "abab6.5s-chat";
  private isConnected = false;
  private messageBuffer: string[] = [];
  private currentTranscript = "";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  private onTranscriptUpdate?: (delta: TranscriptDelta) => void;
  private onResponseUpdate?: (response: RealtimeResponse) => void;
  private onError?: (error: Error) => void;
  private onConnected?: () => void;
  private onDisconnected?: () => void;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Include token in URL for browser compatibility
    this.url = `wss://api.minimax.chat/ws/v1/realtime?model=${this.model}&Authorization=Bearer%20${encodeURIComponent(apiKey)}`;
  }

  connect(callbacks?: {
    onTranscriptUpdate?: (delta: TranscriptDelta) => void;
    onResponseUpdate?: (response: RealtimeResponse) => void;
    onError?: (error: Error) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (callbacks) {
          this.onTranscriptUpdate = callbacks.onTranscriptUpdate;
          this.onResponseUpdate = callbacks.onResponseUpdate;
          this.onError = callbacks.onError;
          this.onConnected = callbacks.onConnected;
          this.onDisconnected = callbacks.onDisconnected;
        }

        // Use browser-compatible WebSocket (no headers option)
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("[Realtime] Connected to MiniMax Realtime API");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.sendInitializeEvent();
          this.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("[Realtime] WebSocket error:", error);
          const err = new Error(`WebSocket error: ${error}`);
          this.onError?.(err);
          reject(err);
        };

        this.ws.onclose = () => {
          console.log("[Realtime] Disconnected from MiniMax Realtime API");
          this.isConnected = false;
          this.onDisconnected?.();
          this.attemptReconnect();
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.onError?.(err);
        reject(err);
      }
    });
  }

  private sendInitializeEvent(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const event: RealtimeEvent = {
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        instructions:
          "You are a helpful assistant. Transcribe and summarize family stories and cultural memories. Extract key entities: people, locations, years, and events. Provide translations to English. Create anonymized public versions.",
        system_prompt:
          "You are an AI assistant specialized in preserving cultural heritage and family memories. When transcribing audio memories, you will: 1) Provide accurate transcriptions in the original language 2) Extract named entities (people, locations, times, events) 3) Generate concise summaries highlighting cultural value 4) Create anonymized versions suitable for public cultural archives.",
      },
    };

    this.send(event);
  }

  send(event: RealtimeEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[Realtime] WebSocket not ready, buffering message");
      this.messageBuffer.push(JSON.stringify(event));
      return;
    }

    try {
      this.ws.send(JSON.stringify(event));
    } catch (error) {
      console.error("[Realtime] Failed to send event:", error);
    }
  }

  sendAudioFrame(audioBase64: string): void {
    const event: RealtimeEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_audio",
            audio: audioBase64, // PCM, 16bits, 24kHz, mono, base64 encoded
          },
        ],
      },
    };
    this.send(event);
  }

  sendTextMessage(text: string): void {
    const event: RealtimeEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text,
          },
        ],
      },
    };
    this.send(event);
    this.requestResponse();
  }

  requestResponse(): void {
    const event: RealtimeEvent = {
      type: "response.create",
    };
    this.send(event);
  }

  private handleMessage(data: string): void {
    try {
      const event = JSON.parse(data) as RealtimeEvent;
      console.log("[Realtime] Received event:", event.type);

      switch (event.type) {
        case "conversation.item.created":
          break;

        case "response.started":
          this.currentTranscript = "";
          break;

        case "response.content_part.added":
          if (event.part?.type === "text") {
            // Text content will come in delta events
          }
          break;

        case "response.content_part.delta":
          if (event.delta?.type === "text_delta") {
            const deltaText = event.delta.text || "";
            this.currentTranscript += deltaText;
            this.onTranscriptUpdate?.({
              transcript: this.currentTranscript,
              isFinal: false,
            });
          }
          break;

        case "response.done":
          // Process final response
          if (event.response?.output?.[0]) {
            const output = event.response.output[0];
            if (output.content?.[0]?.type === "text") {
              const finalText = output.content[0].text;
              this.currentTranscript = finalText;
              this.onTranscriptUpdate?.({
                transcript: finalText,
                isFinal: true,
              });
              this.parseAndEmitResponse(finalText);
            }
          }
          break;

        case "error":
          const errorMsg = event.error?.message || "Unknown error";
          console.error("[Realtime] API Error:", errorMsg);
          this.onError?.(new Error(errorMsg));
          break;

        default:
          console.debug("[Realtime] Unhandled event type:", event.type);
      }
    } catch (error) {
      console.error("[Realtime] Failed to parse message:", error, data);
    }
  }

  private parseAndEmitResponse(text: string): void {
    // Try to parse structured response (if API returns JSON)
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object") {
        this.onResponseUpdate?.(parsed);
        return;
      }
    } catch {
      // Not JSON, treat as plain text
    }

    // Fallback: treat as transcript
    this.onResponseUpdate?.({
      content: text,
      isDone: true,
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[Realtime] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    console.log(
      `[Realtime] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect({
        onTranscriptUpdate: this.onTranscriptUpdate,
        onResponseUpdate: this.onResponseUpdate,
        onError: this.onError,
        onConnected: this.onConnected,
        onDisconnected: this.onDisconnected,
      });
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  isReady(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  getUrl(): string {
    return this.url;
  }
}

// Helper function to convert AudioBuffer to PCM 16-bit 24kHz mono
export async function convertAudioBufferToPCM16(
  audioBuffer: AudioBuffer,
  targetSampleRate = 24000
): Promise<Int16Array> {
  const rawData = audioBuffer.getChannelData(0); // Get mono channel
  const sampleRate = audioBuffer.sampleRate;

  // Resample if needed
  let samples: Float32Array;
  if (sampleRate !== targetSampleRate) {
    const resampled = resampleAudio(
      rawData,
      sampleRate,
      targetSampleRate
    );
    samples = resampled;
  } else {
    samples = rawData;
  }

  // Convert float32 to int16
  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i])); // Clamp
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return pcm16;
}

// Simple linear interpolation resampling
function resampleAudio(
  audioData: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  const ratio = toRate / fromRate;
  const newLength = Math.ceil(audioData.length * ratio);
  const resampled = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const pos = i / ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;

    if (idx + 1 < audioData.length) {
      resampled[i] =
        audioData[idx] * (1 - frac) + audioData[idx + 1] * frac;
    } else {
      resampled[i] = audioData[idx];
    }
  }

  return resampled;
}

// Convert Blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1]; // Remove data:audio/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
