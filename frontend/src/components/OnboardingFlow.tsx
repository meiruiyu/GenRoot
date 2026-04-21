"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultPreference, interestOptions } from "@/lib/demo-data";
import { clearPreference, hasPreference, readPreference, writePreference } from "@/lib/storage";
import type { InterestTag, OnboardingPreference, UserRole } from "@/lib/types";

const roleOptions: Array<{
  value: UserRole;
  title: string;
  description: string;
}> = [
  {
    value: "record",
    title: "I want to preserve family stories",
    description: "Start with recording and building a private archive.",
  },
  {
    value: "explore",
    title: "I want to explore culture",
    description: "Start with the public map and story discovery.",
  },
  {
    value: "both",
    title: "I want both",
    description: "Keep both entry points and switch between them.",
  },
];

function destinationForRole(role: OnboardingPreference["role"]) {
  if (role === "record") return "/create";
  if (role === "explore") return "/explore";
  return "/archive";
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<OnboardingPreference>(defaultPreference);

  useEffect(() => {
    const isReset = window.location.search.includes("reset=1");
    if (isReset) {
      clearPreference();
      return;
    }
    if (hasPreference()) {
      const saved = readPreference();
      router.replace(destinationForRole(saved.role));
    }
  }, [router]);

  const toggleInterest = (tag: InterestTag) => {
    const current = value.interests;
    const next = current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag].slice(0, 3);

    setValue({ ...value, interests: next });
  };

  const saveAndRoute = (preference: OnboardingPreference) => {
    writePreference(preference);
    router.push(destinationForRole(preference.role));
  };

  return (
    <div className="glass-panel-strong rounded-[32px] p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Onboarding
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
            Answer three questions to shape your cultural entry point.
          </h1>
        </div>
        <p className="text-sm text-[var(--muted)]">{step + 1} / 3</p>
      </div>
      <div className="mb-8 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/70 transition-all duration-300"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue({ ...value, role: option.value })}
              className={`w-full rounded-[24px] p-5 text-left transition ${
                value.role === option.value
                  ? "glass-panel-strong border-white/35"
                  : "glass-chip"
              }`}
            >
              <p className="font-display text-2xl text-[var(--ink)]">{option.title}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{option.description}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <label className="block text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Where is home for you?
          </label>
          <input
            value={value.hometown}
            onChange={(event) => setValue({ ...value, hometown: event.target.value })}
            className="glass-input w-full rounded-[24px] px-5 py-4 text-lg outline-none ring-0"
            placeholder="For example: Kaili, Guizhou"
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            We use this to center the map and prioritize relevant stories.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Which kinds of cultural memory matter to you most?
          </p>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInterest(tag)}
                className={`rounded-full px-4 py-3 text-sm transition ${
                  value.interests.includes(tag)
                    ? "glass-button"
                    : "glass-chip"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Choose up to 3. Selected: {value.interests.length} / 3.
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            step === 2 ? saveAndRoute(value) : setStep((current) => Math.min(2, current + 1))
          }
          className="glass-button rounded-full px-6 py-3 text-sm font-medium"
        >
          {step === 2 ? "Finish setup" : "Continue"}
        </button>
        <button
          type="button"
          onClick={() =>
            step === 0 ? saveAndRoute(defaultPreference) : setStep((current) => Math.max(0, current - 1))
          }
          className="glass-button-secondary rounded-full px-6 py-3 text-sm"
        >
          {step === 0 ? "Skip and use defaults" : "Back"}
        </button>
      </div>
    </div>
  );
}
