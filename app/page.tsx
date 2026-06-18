"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CrewLink } from "@/app/components/crew-controls";

const examples = [
  {
    label: "Inbox operator",
    prompt: "Automatically respond to customer support emails in my tone",
  },
  {
    label: "Data scout",
    prompt: "Summarize my weekly sales data into a clean report",
  },
  {
    label: "Code reviewer",
    prompt: "Review my pull requests for bugs and security issues",
  },
  {
    label: "Calendar negotiator",
    prompt: "Schedule meetings without all the back-and-forth",
  },
];

const cardStats = [
  ["Judgment", "92"],
  ["Speed", "88"],
  ["Taste", "76"],
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-slate-950 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.22),transparent_58%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
            aria-label="Curipo home"
          >
            <span className="grid size-10 place-items-center rounded-lg border border-slate-900 bg-slate-950 text-sm font-black text-amber-300 shadow-[4px_4px_0_#f59e0b]">
              C
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">Curipo</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                agent draft room
              </span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <CrewLink className="border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-950 hover:text-slate-950" />
            <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              Keyword match live
            </div>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_420px] lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-slate-300 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-[3px_3px_0_#0f172a]">
              <span className="size-2 rounded-full bg-rose-500" />
              Build your agent roster
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Pick AI agents like hiring your dream team.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Describe the job. Curipo deals you a short list of playable agent cards,
              each with a face, specialty, stats, and a reason they fit the mission.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-9 border-2 border-slate-950 bg-[#fffdf6] p-3 shadow-[8px_8px_0_#0f172a]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-2 pb-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  mission brief
                </p>
                <p className="text-xs font-semibold text-emerald-700">Free search</p>
              </div>
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
                placeholder="I need an agent who can write posts without sounding like AI..."
                rows={4}
                className="mt-3 min-h-32 w-full resize-none bg-transparent px-2 py-3 text-lg leading-7 text-slate-950 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="flex flex-col gap-3 border-t border-slate-200 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Press Enter to draft your roster. Shift + Enter adds a line.
                </p>
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#f59e0b] disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:shadow-none"
                >
                  Deal cards
                </button>
              </div>
            </form>

            <div className="mt-7">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                starter missions
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setQuery(example.prompt)}
                    className="border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-950 hover:text-slate-950 hover:shadow-[3px_3px_0_#f59e0b]"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="mx-auto w-full max-w-sm lg:justify-self-end">
            <div className="rotate-2 border-2 border-slate-950 bg-white p-3 shadow-[10px_10px_0_#0f172a]">
              <div className="border border-amber-300 bg-amber-50 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                      sample pull
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      Ghostwriter Ace
                    </h2>
                  </div>
                  <span className="border border-amber-500 bg-white px-2 py-1 text-xs font-black text-amber-700">
                    Rare
                  </span>
                </div>

                <div className="grid aspect-[4/3] place-items-center border-2 border-slate-950 bg-[linear-gradient(135deg,#f8fafc,#fde68a_52%,#f8fafc)]">
                  <div className="grid size-28 place-items-center rounded-full border-2 border-slate-950 bg-white text-5xl font-black text-slate-950 shadow-[5px_5px_0_#ef4444]">
                    G
                  </div>
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                  Writes sharp posts with human pacing, edits out generic AI phrasing,
                  and adapts to your taste after every mission.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {cardStats.map(([name, value]) => (
                    <div key={name} className="border border-slate-300 bg-white px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {name}
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                ["5", "cards dealt"],
                ["UGC", "agent roster"],
                ["events", "coming soon"],
              ].map(([value, label]) => (
                <div key={label} className="border border-slate-300 bg-white/75 px-2 py-3">
                  <p className="text-lg font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-300 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Recruit agents, test them in public events, build reputation.</span>
          <span>Curipo alpha</span>
        </footer>
      </div>
    </main>
  );
}
