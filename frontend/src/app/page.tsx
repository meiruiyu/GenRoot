import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <img src="/logo_transparent.svg" alt="GenRoot logo" className="w-32 h-32" />
          <h1 className="display-title font-display text-[var(--ink)]">GenRoot</h1>
        </div>
        <div className="flex flex-row gap-4">
          <Link
            href="/create"
            className="glass-button rounded-full px-8 py-4 text-base font-medium"
          >
            Create Memory
          </Link>
          <Link
            href="/explore"
            className="glass-button-secondary rounded-full px-8 py-4 text-base"
          >
            Explore Memories
          </Link>
        </div>
      </div>
    </main>
  );
}
