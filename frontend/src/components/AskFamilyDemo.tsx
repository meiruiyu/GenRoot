"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

export function AskFamilyDemo() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(
    () => [
      t("askFamily.suggestion1"),
      t("askFamily.suggestion2"),
      t("askFamily.suggestion3"),
      t("askFamily.suggestion4"),
    ],
    [t],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const welcomeMessage = t("askFamily.welcome");

  const displayMessages = messages.length
    ? messages
    : [{ role: "assistant" as const, content: welcomeMessage }];

  const handleAsk = async () => {
    if (!question.trim()) return;

    const nextUserMessage: ChatMessage = {
      role: "user",
      content: question.trim(),
    };

    const history = messages.length
      ? messages
      : [{ role: "assistant" as const, content: welcomeMessage }];

    setMessages((prev) => (prev.length ? [...prev, nextUserMessage] : [history[0], nextUserMessage]));
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextUserMessage.content,
          history: (messages.length ? messages : [history[0]]).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          citations: data.citations || [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel-strong rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("askFamily.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">{t("askFamily.heading")}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{t("askFamily.lede")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuestion(suggestion)}
              className="glass-chip rounded-full px-4 py-2 text-sm transition hover:bg-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="glass-input mt-6 min-h-40 w-full rounded-[22px] px-5 py-4 outline-none resize-none"
          placeholder={t("askFamily.placeholder")}
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={loading}
          className="glass-button mt-4 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50"
        >
          {loading ? t("askFamily.thinking") : t("common.send")}
        </button>
      </div>

      <div className="glass-panel rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{t("askFamily.conversation")}</p>
        <div className="mt-4 space-y-4">
          {displayMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[86%] rounded-[24px] bg-[rgba(255,255,255,0.2)] px-5 py-4 text-sm leading-7 text-[var(--ink)]"
                  : "max-w-[92%] rounded-[24px] border border-white/15 bg-[rgba(255,255,255,0.08)] px-5 py-4 text-sm leading-7 text-[var(--ink)]"
              }
            >
              <p>{message.content}</p>
              {message.citations?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <span key={citation} className="glass-chip rounded-full px-3 py-1 text-xs">
                      {citation}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {loading ? (
            <div className="max-w-[92%] rounded-[24px] border border-white/15 bg-[rgba(255,255,255,0.08)] px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              {t("askFamily.loading")}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
