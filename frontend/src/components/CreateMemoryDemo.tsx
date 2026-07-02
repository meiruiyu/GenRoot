"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { writeRecordContext } from "@/lib/storage";

type IcebreakerState = { questions: string[] } | null;

type EnrichResult = {
  provider: string;
  summary: string;
  tags: string[];
  publicSafeVersion: string;
  entities: { people: string[]; locations: string[]; years: string[]; events: string[] };
} | null;

export function CreateMemoryDemo() {
  const router = useRouter();
  const { t, locale } = useLanguage();

  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>(undefined);
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [icebreakers, setIcebreakers] = useState<IcebreakerState>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [memberName, setMemberName] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [story, setStory] = useState("");
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [result, setResult] = useState<EnrichResult>(null);

  useEffect(() => {
    setPrompt(t("create.defaultPrompt"));
    setMemberName(t("create.defaultMember"));
    setLocation(t("create.defaultLocation"));
    setLanguage(t("create.defaultLanguage"));
  }, [locale, t]);

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextMediaType = file.type.startsWith("video/") ? "video" : "image";
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setMediaPreview(dataUrl);
      setMediaType(nextMediaType);
      setImageBase64(nextMediaType === "image" ? dataUrl.split(",")[1] : undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateIcebreakers = async () => {
    setIcebreakerLoading(true);
    const response = await fetch("/api/ai/icebreakers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, imageBase64 }),
    });
    const data = await response.json();
    setIcebreakers(data);
    setIcebreakerLoading(false);
  };

  const selectQuestion = (q: string) => {
    setSelectedQuestion(q);
    setTitle(q);
  };

  const handleEnrich = async () => {
    setEnrichLoading(true);
    const response = await fetch("/api/ai/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, memberName, location, language, story }),
    });
    const data = await response.json();
    setResult(data);
    setEnrichLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-strong rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("create.step1Eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">{t("create.step1Heading")}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="glass-input rounded-[22px] px-5 py-4 outline-none"
            placeholder={t("create.promptPlaceholder")}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass-button-secondary rounded-[22px] px-5 py-4 text-sm whitespace-nowrap"
          >
            {mediaPreview ? t("create.replaceMedia") : t("create.uploadMedia")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaChange}
          />
        </div>

        {mediaPreview ? (
          mediaType === "video" ? (
            <video
              src={mediaPreview}
              controls
              className="mt-4 h-40 w-auto max-w-full rounded-[18px] object-cover"
            />
          ) : (
            <img
              src={mediaPreview}
              alt={t("create.uploadedAlt")}
              className="mt-4 h-32 w-auto rounded-[18px] object-cover"
            />
          )
        ) : null}

        {mediaType === "video" ? (
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("create.videoNote")}</p>
        ) : null}

        <button
          type="button"
          onClick={handleGenerateIcebreakers}
          disabled={icebreakerLoading}
          className="mt-5 glass-button inline-flex rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50"
        >
          {icebreakerLoading ? t("create.generating") : t("create.generateIcebreakers")}
        </button>

        {icebreakers ? (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {icebreakers.questions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => selectQuestion(q)}
                  className={`rounded-[22px] p-4 text-left text-sm leading-6 transition ${
                    selectedQuestion === q
                      ? "glass-panel-strong border-white/35 text-[var(--ink)]"
                      : "glass-chip text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            {selectedQuestion ? (
              <button
                type="button"
                onClick={() => {
                  writeRecordContext({
                    question: selectedQuestion,
                    mediaPreview,
                    mediaType,
                  });
                  router.push("/record");
                }}
                className="glass-button rounded-full px-8 py-4 text-base font-medium"
              >
                {t("create.startRecording")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel-strong rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("create.step2Eyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">{t("create.step2Heading")}</h2>
          <div className="mt-6 grid gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input rounded-[22px] px-5 py-4 outline-none"
              placeholder={t("create.titlePlaceholder")}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="glass-input rounded-[22px] px-5 py-4 outline-none"
                placeholder={t("create.memberPlaceholder")}
              />
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="glass-input rounded-[22px] px-5 py-4 outline-none"
                placeholder={t("create.languagePlaceholder")}
              />
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input rounded-[22px] px-5 py-4 outline-none"
              placeholder={t("create.locationPlaceholder")}
            />
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="glass-input min-h-36 resize-none rounded-[22px] px-5 py-4 outline-none"
              placeholder={t("create.storyPlaceholder")}
            />
            <button
              type="button"
              onClick={handleEnrich}
              disabled={enrichLoading || !story}
              className="glass-button inline-flex w-fit rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50"
            >
              {enrichLoading ? t("create.structuring") : t("create.runEnrichment")}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("create.outputEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--ink)]">{t("create.outputHeading")}</h2>
          {result ? (
            <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--muted)]">
              <div>
                <p className="font-medium text-[var(--ink)]">{t("common.summary")}</p>
                <p>{result.summary}</p>
              </div>
              <div>
                <p className="font-medium text-[var(--ink)]">{t("memory.publicSafe")}</p>
                <p>{result.publicSafeVersion}</p>
              </div>
              <div>
                <p className="font-medium text-[var(--ink)]">{t("common.tags")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span key={tag} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-[var(--ink)]">{t("common.entities")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[...result.entities.people, ...result.entities.locations, ...result.entities.events].map(
                    (e) => (
                      <span key={e} className="glass-chip rounded-full px-3 py-1 text-xs">
                        {e}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
              {icebreakers ? t("create.outputEmptyWithIcebreakers") : t("create.outputEmptyNoIcebreakers")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
