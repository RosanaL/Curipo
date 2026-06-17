"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center min-h-screen px-4">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-indigo-500 text-3xl">⬡</span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Curipo
            </h1>
          </div>
          <p className="text-slate-500 text-sm tracking-wide uppercase">
            Find the right AI agent for any task
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Ignore Enter while composing with an IME (e.g. Chinese input)
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent);
                }
              }}
              placeholder="Describe what you want to automate..."
              rows={3}
              className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 text-base resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Find agents →
          </button>
        </form>

        {/* Example prompts */}
        <div className="w-full">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Automatically respond to customer support emails",
              "Summarize my weekly sales data into a report",
              "Review my pull requests for bugs",
              "Schedule meetings without back-and-forth",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="text-xs text-slate-500 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
