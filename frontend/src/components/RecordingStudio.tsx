"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { clearRecordContext, readRecordContext, saveMemory, type SavedMemory } from "@/lib/storage";
import { RealtimeAPIClient } from "@/lib/realtime-api";

type Status = "idle" | "recording" | "preview" | "processing" | "results" | "done" | "connecting";

const WAVEFORM_BARS = 9;

interface ProcessResult {
  provider: string;
  transcript: string;
  translation: string;
  summary: string;
  entities: {
    people: string[];
    locations: string[];
    years: string[];
    events: string[];
  };
  publicSafeVersion: string;
  tags: string[];
}

export function RecordingStudio() {
  const router = useRouter();
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState("0:00");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [saveError, setSaveError] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const realtimeAPIRef = useRef<RealtimeAPIClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const liveTranscriptRef = useRef<string>("");

  // ── Initialize Realtime API ───────────────────────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      console.warn("MINIMAX_API_KEY not configured, will use mock API");
    } else {
      try {
        realtimeAPIRef.current = new RealtimeAPIClient(apiKey);
      } catch (error) {
        console.error("Failed to initialize Realtime API:", error);
      }
    }

    return () => {
      realtimeAPIRef.current?.disconnect();
      setIsRealtimeConnected(false);
    };
  }, []);

  // ── Load context and handle component cleanup ─────────────────────────
  useEffect(() => {
    const ctx = readRecordContext();
    if (ctx) {
      setQuestion(ctx.question);
      setMediaPreview(ctx.mediaPreview);
      setMediaType(ctx.mediaType);
    } else {
      setQuestion(t("record.defaultQuestion"));
    }

    return () => {
      realtimeAPIRef.current?.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [t]);

  // Initialize Web Speech API for real-time transcription (fallback for MiniMax)
  const initializeWebSpeechAPI = (stream: MediaStream) => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn(
          "Web Speech API not supported in this browser, transcription will use API endpoint"
        );
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Try to set language - support both simplified and traditional Chinese
      try {
        recognition.lang = "zh-CN"; // Chinese Simplified
      } catch (e) {
        console.debug("Failed to set language, using default");
      }

      let lastTranscriptTime = Date.now();
      
      recognition.onstart = () => {
        console.log("✓ Web Speech API started - listening for speech");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let shouldUpdate = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: ${transcript} (isFinal: ${event.results[i].isFinal})`);

          if (event.results[i].isFinal) {
            // Add final results to transcript
            liveTranscriptRef.current += transcript;
            shouldUpdate = true;
          } else {
            // Show interim results
            interimTranscript += transcript;
          }
        }

        // Update display immediately with both final and interim results
        if (shouldUpdate || interimTranscript) {
          const displayText = interimTranscript 
            ? liveTranscriptRef.current + interimTranscript 
            : liveTranscriptRef.current;
          setLiveTranscript(displayText);
          lastTranscriptTime = Date.now();
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = event.error || "unknown";
        console.warn("Web Speech API error:", errorMessage);
        
        // Some errors are recoverable, others need restart
        if (errorMessage === "no-speech") {
          console.log("No speech detected yet, waiting...");
        } else if (errorMessage === "network") {
          console.warn("Network error in speech recognition");
        } else if (errorMessage === "audio-capture") {
          console.error("Failed to capture audio - please check microphone permissions");
        }
      };

      recognition.onend = () => {
        console.log("✓ Web Speech API ended");
      };

      try {
        recognition.start();
        // Store reference to stop later
        (mediaRecorderRef as any).speechRecognition = recognition;
        console.log("Web Speech API recognition started successfully");
      } catch (e) {
        console.debug("Recognition already running or failed to start:", e);
      }
    } catch (error) {
      console.warn("Failed to initialize Web Speech API:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Web Speech API for real-time transcription
      initializeWebSpeechAPI(stream);

      // Try to connect to Realtime API for live transcription
      const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || process.env.MINIMAX_API_KEY;
      if (apiKey && realtimeAPIRef.current) {
        setStatus("connecting");
        try {
          await realtimeAPIRef.current.connect({
            onTranscriptUpdate: (delta) => {
              liveTranscriptRef.current = delta.transcript;
              setLiveTranscript(delta.transcript);
            },
            onResponseUpdate: (response) => {
              if (response.isDone) {
                // Realtime API finished processing
                setResult({
                  provider: "minimax",
                  transcript: response.content || liveTranscriptRef.current,
                  translation: response.translation || "",
                  summary: response.summary || "",
                  entities: response.entities || {
                    people: [],
                    locations: [],
                    years: [],
                    events: [],
                  },
                  publicSafeVersion: "",
                  tags: [],
                });
              }
            },
            onConnected: () => {
              console.log("Realtime API connected");
              setIsRealtimeConnected(true);
            },
            onError: (error) => {
              console.error("Realtime API error:", error);
              setSaveError(`Realtime connection error: ${error.message}`);
              // Fall back to regular recording
            },
          });
        } catch (error) {
          console.warn("Failed to connect to Realtime API, using regular mode:", error);
          setSaveError("");
        }
      }

      // Setup standard MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        setStatus("preview");

        // Calculate duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
        };
      };

      recorder.start();
      setStatus("recording");
      setLiveTranscript("");
      liveTranscriptRef.current = "";
    } catch (error) {
      console.error("Recording error:", error);
      alert(t("record.micUnavailable"));
      setStatus("idle");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    // Stop Web Speech API if it was started
    const speechRecognition = (mediaRecorderRef as any).current?.speechRecognition;
    if (speechRecognition) {
      speechRecognition.stop();
    }
    // Disconnect from Realtime API if connected
    if (isRealtimeConnected) {
      realtimeAPIRef.current?.disconnect();
      setIsRealtimeConnected(false);
    }
  };

  const submitRecording = async () => {
    if (!audioBlob) return;

    // If we already have results from Realtime API, just move to results
    if (result && isRealtimeConnected) {
      setStatus("results");
      return;
    }

    // If we have real-time transcript from Web Speech API, use it directly
    if (liveTranscript && liveTranscript.trim().length > 0) {
      setStatus("processing");
      setSaveError("");

      try {
        const enrichRes = await fetch("/api/ai/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story: liveTranscript,
            memberName: t("record.familyMember"),
            location: "Kaili, Guizhou",
          }),
        });

        if (!enrichRes.ok) {
          throw new Error(`Enrich API error: ${enrichRes.statusText}`);
        }

        const enrichedData = (await enrichRes.json()) as ProcessResult;
        setResult(enrichedData);
        setStatus("results");
      } catch (error) {
        console.error("Enrichment error:", error);
        // Fallback to backend processing
        submitWithBackendTranscription();
      }
      return;
    }

    // Otherwise, fall back to backend processing
    submitWithBackendTranscription();
  };

  const submitWithBackendTranscription = async () => {
    if (!audioBlob) return;
    
    setStatus("processing");
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("transcriptHint", liveTranscriptRef.current);
      formData.append("question", question);
      formData.append("location", "Kaili, Guizhou");

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = (await res.json()) as ProcessResult;
      setResult(data);
      setStatus("results");
    } catch (error) {
      console.error("Submission error:", error);
      setSaveError(
        error instanceof TypeError
          ? t("record.requestFailed")
          : error instanceof Error
            ? error.message
            : t("record.processingFailed")
      );
      setStatus("preview");
    }
  };

  const saveToArchive = () => {
    if (!result || !audioBlob) return;

    try {
      const memory: SavedMemory = {
        id: `mem_${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: t("record.storyTitle", {
          name: result.entities.people?.[0] || t("record.familyMemberTitle"),
        }),
        memberName: result.entities.people?.[0] || t("record.familyMemberTitle"),
        location: result.entities.locations?.[0] || "Kaili, Guizhou",
        language: "Mandarin",
        audioUrl: audioUrl || "", // Keep the blob URL for playback
        duration,
        transcript: result.transcript,
        translation: result.translation,
        summary: result.summary,
        tags: result.tags || [],
        entities: result.entities,
        publicSafeVersion: result.publicSafeVersion,
        provider: result.provider,
      };

      saveMemory(memory);
      clearRecordContext();
      setStatus("done");
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error instanceof Error ? error.message : t("record.saveFailed"));
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (status === "done") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center gap-6 px-4">
        <div className="text-6xl">❤️</div>
        <h1 className="font-display text-5xl text-[var(--ink)]">{t("record.storySaved")}</h1>
        <p className="max-w-sm text-lg leading-8 text-[var(--muted)]">
          {result?.summary || t("record.savedFallback")}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/archive")}
            className="glass-button rounded-full px-6 py-3 text-sm font-medium"
          >
            {t("record.viewArchive")}
          </button>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAudioUrl(null);
              setAudioBlob(null);
              setStatus("idle");
              setLiveTranscript("");
              liveTranscriptRef.current = "";
            }}
            className="glass-button-secondary rounded-full px-6 py-3 text-sm"
          >
            {t("record.recordAnother")}
          </button>
        </div>
      </div>
    );
  }

  // ── Connecting screen ────────────────────────────────────────────────────
  if (status === "connecting") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <div className="flex gap-1.5 items-end h-10">
          {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-white/60"
              style={{
                height: `${16 + Math.sin(i * 0.9) * 12}px`,
                animation: "wave 1s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <p className="font-display text-3xl text-[var(--ink)]">{t("record.connecting")}</p>
        <p className="text-sm text-[var(--muted)]">{t("record.connectingSub")}</p>
      </div>
    );
  }

  // ── Processing screen ────────────────────────────────────────────────────
  if (status === "processing") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <div className="flex gap-1.5 items-end h-10">
          {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-white/60"
              style={{
                height: `${16 + Math.sin(i * 0.9) * 12}px`,
                animation: "wave 1s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <p className="font-display text-3xl text-[var(--ink)]">{t("record.structuring")}</p>
        <p className="text-sm text-[var(--muted)]">{t("record.structuringSub")}</p>
      </div>
    );
  }

  // ── Results review screen ───────────────────────────────────────────────────
  if (status === "results" && result) {
    return (
      <div className="page-shell space-y-6">
        <div className="glass-panel-strong rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("record.reviewEyebrow")}</p>
          <h1 className="mt-4 font-display text-4xl text-[var(--ink)]">{t("record.reviewHeading")}</h1>
        </div>

        {/* Transcript */}
        <div className="glass-panel rounded-[28px] p-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("common.transcript")}</p>
          <p className="text-base leading-7 text-[var(--ink)]">{result.transcript}</p>
        </div>

        {/* Translation */}
        <div className="glass-panel rounded-[28px] p-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("record.englishTranslation")}</p>
          <p className="text-base leading-7 text-[var(--muted)]">{result.translation}</p>
        </div>

        {/* Summary */}
        <div className="glass-panel rounded-[28px] p-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("common.summary")}</p>
          <p className="text-base leading-7 font-medium text-[var(--ink)]">{result.summary}</p>
        </div>

        {/* Extracted entities */}
        <div className="glass-panel rounded-[28px] p-6 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("record.extractedDetails")}</p>
          <div className="grid grid-cols-2 gap-4">
            {result.entities.people.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">{t("record.people")}</p>
                <div className="flex flex-wrap gap-2">
                  {result.entities.people.map((p) => (
                    <span key={p} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.entities.locations.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">{t("record.places")}</p>
                <div className="flex flex-wrap gap-2">
                  {result.entities.locations.map((l) => (
                    <span key={l} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.entities.years.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">{t("record.years")}</p>
                <div className="flex flex-wrap gap-2">
                  {result.entities.years.map((y) => (
                    <span key={y} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {y}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.entities.events.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">{t("record.events")}</p>
                <div className="flex flex-wrap gap-2">
                  {result.entities.events.map((e) => (
                    <span key={e} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Public safe version */}
        <div className="glass-panel rounded-[28px] p-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{t("record.publicSafeVersion")}</p>
          <p className="text-sm leading-6 text-[var(--muted)]">{result.publicSafeVersion}</p>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="glass-panel rounded-[28px] p-4 bg-red-500/10 border border-red-400/30">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setStatus("preview");
            }}
            className="glass-button-secondary rounded-full px-6 py-3 text-sm"
          >
            {t("record.backToRecording")}
          </button>
          <button
            type="button"
            onClick={saveToArchive}
            className="glass-button rounded-full px-6 py-3 text-sm font-medium flex-1"
          >
            {t("record.saveToArchive")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Waveform keyframe */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <div className="flex min-h-[85vh] flex-col">
        {/* Top half — photo + question */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
          {mediaPreview ? (
            mediaType === "video" ? (
              <video
                src={mediaPreview}
                controls
                className="h-44 w-auto max-w-full rounded-[22px] object-cover shadow-lg"
              />
            ) : (
              <img
                src={mediaPreview}
                alt={t("record.memoryRefAlt")}
                className="h-40 w-auto rounded-[22px] object-cover shadow-lg"
              />
            )
          ) : (
            <div className="h-20 w-20 rounded-full glass-chip flex items-center justify-center text-3xl">
              📷
            </div>
          )}

          <h1
            className="font-display text-[var(--ink)] leading-snug max-w-lg"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            {question || t("record.loadingPrompt")}
          </h1>

          {status === "recording" ? (
            <div className="flex gap-1.5 items-end h-10 mt-2">
              {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-[var(--accent)]"
                  style={{
                    height: "32px",
                    animation: "wave 0.7s ease-in-out infinite",
                    animationDelay: `${i * 0.08}s`,
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom half — single action */}
        <div className="flex flex-col items-center gap-4 pb-14 px-4">
          {status === "idle" ? (
            <button
              type="button"
              onClick={startRecording}
              className="h-24 w-24 rounded-full glass-button flex items-center justify-center text-4xl shadow-2xl active:scale-95 transition-transform"
              aria-label={t("record.startRecordingAria")}
            >
              🎙
            </button>
          ) : null}

          {status === "recording" ? (
            <button
              type="button"
              onClick={stopRecording}
              className="h-24 w-24 rounded-full bg-red-500/80 backdrop-blur border border-red-400/40 flex items-center justify-center text-4xl shadow-2xl active:scale-95 transition-transform"
              aria-label={t("record.stopRecordingAria")}
            >
              ⏹
            </button>
          ) : null}

          {status === "idle" && (
            <p className="text-sm text-[var(--muted)]">{t("record.tapToRecord")}</p>
          )}
          {status === "recording" && (
            <div className="max-w-md space-y-3">
              <p className="text-sm text-[var(--muted)] text-center">
                {t("record.recordingLabel")}
              </p>
              {/* Show live transcript from Web Speech API or Realtime API */}
              {liveTranscript && (
                <div className="glass-panel rounded-[16px] p-4 bg-white/5 max-h-40 overflow-y-auto animate-pulse">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
                    {t("record.liveTranscript")}
                  </p>
                  <p className="text-sm text-[var(--ink)] leading-6 whitespace-pre-wrap">{liveTranscript}</p>
                </div>
              )}
              {!liveTranscript && (
                <p className="text-xs text-[var(--muted)] text-center mt-3 italic">
                  {t("record.listening")}
                </p>
              )}
            </div>
          )}

          {status === "preview" && audioUrl ? (
            <div className="glass-panel-strong rounded-[28px] p-6 w-full max-w-md space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                {t("record.previewEyebrow")}
              </p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} className="w-full rounded-[12px]" />
              <p className="text-xs text-[var(--muted)]">{t("record.duration", { duration })}</p>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              {/* Show live transcript if available */}
              {liveTranscript && (
                <div className="glass-panel rounded-[12px] p-3 bg-white/5 max-h-20 overflow-y-auto text-left">
                  <p className="text-xs uppercase text-[var(--muted)] mb-1">{t("record.liveTranscriptLabel")}</p>
                  <p className="text-xs text-[var(--ink)]">{liveTranscript}</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                    setSaveError("");
                    setLiveTranscript("");
                    liveTranscriptRef.current = "";
                    setStatus("idle");
                  }}
                  className="glass-button-secondary rounded-full px-5 py-3 text-sm flex-1"
                >
                  {t("record.recordAgain")}
                </button>
                <button
                  type="button"
                  onClick={submitRecording}
                  className="glass-button rounded-full px-6 py-3 text-sm font-medium flex-1"
                >
                  {isRealtimeConnected && result ? t("common.continue") : t("record.processWithAI")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
