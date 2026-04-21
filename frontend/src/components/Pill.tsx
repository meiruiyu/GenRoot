import type { ReactNode } from "react";

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "light";
}) {
  const styles = {
    default: "glass-chip text-[var(--ink)]",
    accent: "bg-[rgba(255,255,255,0.22)] text-[var(--ink)] border border-white/30",
    light: "bg-[rgba(255,255,255,0.08)] text-[var(--muted)] border border-white/10 backdrop-blur-md",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
