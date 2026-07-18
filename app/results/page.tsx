"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CrewLink, CrewToggleButton } from "@/app/components/crew-controls";
import { resolveAgentMedia } from "@/lib/agent-media";

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  animation_url?: string;
  poster_url?: string;
  tagline?: string;
  models: string[];
  price: string;
  description: string;
  rating: number;
  reason: string;
  url?: string;
}

const rarityStyles = [
  {
    name: "Legendary",
    text: "text-amber-800",
    border: "border-amber-500",
    accent: "#f59e0b",
    art: "from-amber-100 via-white to-rose-100",
  },
  {
    name: "Epic",
    text: "text-rose-800",
    border: "border-rose-500",
    accent: "#ef4444",
    art: "from-rose-100 via-white to-cyan-100",
  },
  {
    name: "Rare",
    text: "text-cyan-800",
    border: "border-cyan-500",
    accent: "#06b6d4",
    art: "from-cyan-100 via-white to-emerald-100",
  },
  {
    name: "Skilled",
    text: "text-emerald-800",
    border: "border-emerald-500",
    accent: "#10b981",
    art: "from-emerald-100 via-white to-slate-100",
  },
];

function clampStat(value: number) {
  return Math.max(42, Math.min(99, Math.round(value)));
}

function getStats(agent: Agent, rank: number) {
  const rating = agent.rating || 4;
  const modelCount = agent.models?.length || 1;

  return [
    ["FIT", clampStat(96 - rank * 5 + rating)],
    ["OPS", clampStat(rating * 18 + modelCount * 3)],
    ["AURA", clampStat(70 + (agent.name?.length || 5) * 2 - rank * 2)],
  ];
}

function getRarity(rating?: number) {
  if ((rating || 0) >= 4.7) return rarityStyles[0];
  if ((rating || 0) >= 4.4) return rarityStyles[1];
  if ((rating || 0) >= 4.1) return rarityStyles[2];
  return rarityStyles[3];
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating || 0);

  return (
    <span className="text-sm font-black text-amber-500" aria-label={`${rating?.toFixed(1)} out of 5`}>
      {"★".repeat(full)}
      <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - full))}</span>
      <span className="ml-2 text-xs font-bold text-slate-500">{rating?.toFixed(1)}</span>
    </span>
  );
}

function AgentPortrait({ agent }: { agent: Agent }) {
  const rarity = getRarity(agent.rating);
  const media = resolveAgentMedia(agent);

  if (media.animationUrl) {
    return (
      <video
        aria-label={`${agent.name} animated avatar`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={media.posterUrl}
        className="h-full w-full object-contain"
      >
        <source src={media.animationUrl} type={media.animationUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"} />
      </video>
    );
  }

  if (media.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.avatarUrl}
        alt={agent.name}
        draggable={false}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${rarity.art}`}>
      <div
        className="grid size-28 place-items-center rounded-full border-2 border-slate-950 bg-white text-5xl font-black text-slate-950"
        style={{ boxShadow: `6px 6px 0 ${rarity.accent}` }}
      >
        {agent.name?.slice(0, 1) || "A"}
      </div>
    </div>
  );
}

function AgentSelector({ agents }: { agents: Agent[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<"select" | "detail">("select");
  const [candidateGap, setCandidateGap] = useState(300);
  const reduceMotion = useReducedMotion();
  const activeAgent = agents[activeIndex];
  const rarity = getRarity(activeAgent.rating);
  const stats = getStats(activeAgent, activeIndex + 1);
  const hasMultiple = agents.length > 1;

  useEffect(() => {
    const updateCandidateGap = () => setCandidateGap(window.innerWidth < 520 ? 230 : 300);
    updateCandidateGap();
    window.addEventListener("resize", updateCandidateGap);
    return () => window.removeEventListener("resize", updateCandidateGap);
  }, []);

  function selectIndex(index: number) {
    setActiveIndex(Math.max(0, Math.min(index, agents.length - 1)));
    setView("select");
  }

  function previous() {
    selectIndex(activeIndex - 1);
  }

  function next() {
    selectIndex(activeIndex + 1);
  }

  function handleKeyboard(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;

    if (view === "detail" && event.key === "Escape") {
      event.preventDefault();
      setView("select");
      return;
    }

    if (view !== "select") return;
    if (event.key === "ArrowLeft" && activeIndex > 0) {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight" && activeIndex < agents.length - 1) {
      event.preventDefault();
      next();
    } else if (event.key === "Enter") {
      event.preventDefault();
      setView("detail");
    }
  }

  return (
    <section
      className="mx-auto w-full max-w-6xl outline-none"
      tabIndex={0}
      onKeyDown={handleKeyboard}
      aria-label="Agent selector. Use left and right arrow keys to browse."
    >
      <div className="relative min-h-[710px] overflow-hidden pt-5 [perspective:1600px] sm:min-h-[660px]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "select" ? (
            <motion.div
              key="select"
              className="relative min-h-[675px]"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -84 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 84 }}
              transition={{ duration: reduceMotion ? 0 : 0.32 }}
            >
              {hasMultiple && (
                <div className="mx-auto mb-4 flex w-[min(100%,360px)] items-center justify-between px-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {activeIndex + 1} / {agents.length}
                  </p>
                  <div className="h-1.5 w-28 overflow-hidden bg-slate-200">
                    <motion.div
                      className="h-full bg-amber-400"
                      animate={{ width: `${((activeIndex + 1) / agents.length) * 100}%` }}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 top-16 bottom-10" aria-hidden="true">
                {agents.map((agent, index) => {
                  const offset = index - activeIndex;
                  const visible = offset !== 0 && Math.abs(offset) <= 2;

                  return (
                    <motion.div
                      key={agent.id}
                      data-testid="candidate-preview"
                      initial={false}
                      animate={{
                        x: offset * candidateGap,
                        y: Math.abs(offset) * 16,
                        scale: Math.abs(offset) === 1 ? 0.78 : 0.65,
                        opacity: visible ? (Math.abs(offset) === 1 ? 0.5 : 0.18) : 0,
                        filter: "blur(1px)",
                      }}
                      transition={{ type: "spring", stiffness: 280, damping: 30 }}
                      className="absolute left-1/2 top-16 z-0 -ml-[85px] w-[170px]"
                    >
                      <div className="h-72">
                        <AgentPortrait agent={agent} />
                      </div>
                      <p className="mt-2 truncate text-center text-lg font-black text-slate-950">{agent.name}</p>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                data-testid="selected-agent-frame"
                className="relative z-10 mx-auto flex h-[610px] w-[calc(100%_-_20px)] max-w-[360px] flex-col overflow-hidden border-2 border-slate-950 bg-transparent"
                layout
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">current pick</p>
                    <p className={`text-xs font-black uppercase ${rarity.text}`}>{rarity.name}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{activeAgent.price || "Ask"}</span>
                </div>

                <motion.div
                  className={`relative h-[300px] shrink-0 border-b border-slate-200 ${hasMultiple ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
                  drag={hasMultiple ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(_, info) => {
                    if ((info.offset.x < -70 || info.velocity.x < -450) && activeIndex < agents.length - 1) next();
                    else if ((info.offset.x > 70 || info.velocity.x > 450) && activeIndex > 0) previous();
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={activeAgent.id}
                      className="absolute inset-0"
                      initial={reduceMotion ? false : { opacity: 0, x: 35 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -35 }}
                    >
                      <AgentPortrait agent={activeAgent} />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
                  <h2 className="truncate text-2xl font-black tracking-tight text-slate-950">{activeAgent.name}</h2>
                  {activeAgent.tagline && (
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-600">{activeAgent.tagline}</p>
                  )}
                  <div className="mt-3 border-l-4 border-amber-400 pl-3">
                    <p className="line-clamp-2 text-sm leading-5 text-slate-600">{activeAgent.reason}</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setView("detail")}
                    className="mt-auto w-full border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b]"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Select agent
                  </motion.button>
                </div>
              </motion.div>

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={previous}
                    disabled={activeIndex === 0}
                    className="absolute left-1 top-[295px] z-30 grid size-11 place-items-center border-2 border-slate-950 bg-white text-xl font-black shadow-[3px_3px_0_#f59e0b] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:shadow-none sm:left-[calc(50%_-_300px)]"
                    aria-label="Previous agent"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={activeIndex === agents.length - 1}
                    className="absolute right-1 top-[295px] z-30 grid size-11 place-items-center border-2 border-slate-950 bg-white text-xl font-black shadow-[3px_3px_0_#f59e0b] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:shadow-none sm:right-[calc(50%_-_300px)]"
                    aria-label="Next agent"
                  >
                    →
                  </button>
                  <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Swipe the card or use arrows
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              className="mx-auto flex h-[690px] w-full max-w-4xl flex-col overflow-hidden border-2 border-slate-950 bg-white shadow-[10px_10px_0_#0f172a] sm:h-[630px]"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -84 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 84 }}
              transition={{ duration: reduceMotion ? 0 : 0.32 }}
            >
            <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5">
              <button
                type="button"
                onClick={() => setView("select")}
                className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-950"
              >
                ← Back to choices
              </button>
              <span className={`border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${rarity.border} ${rarity.text}`}>
                {rarity.name}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                <div className="size-24 shrink-0 overflow-hidden border-2 border-slate-950 bg-slate-100">
                  <AgentPortrait agent={activeAgent} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    selected agent
                  </p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                    {activeAgent.name}
                  </h2>
                  {activeAgent.tagline && (
                    <p className="mt-1 text-sm font-semibold text-slate-600">{activeAgent.tagline}</p>
                  )}
                  <div className="mt-2">
                    <Stars rating={activeAgent.rating} />
                  </div>
                </div>
              </div>

              <section className="border-b border-slate-200 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  what they do
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeAgent.description}</p>
              </section>

              <section className="border-b border-slate-200 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  why this match
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{activeAgent.reason}</p>
              </section>

              <section className="grid grid-cols-3 border-b border-slate-200 py-4">
                {stats.map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </section>

              {activeAgent.models?.length > 0 && (
                <section className="py-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    supported models
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeAgent.models.map((model) => (
                      <span
                        key={model}
                        className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="grid shrink-0 gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2">
              <CrewToggleButton
                agent={activeAgent}
                className="border-2 border-slate-950 bg-amber-300 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[3px_3px_0_#0f172a] disabled:opacity-50"
              />
              {activeAgent.url ? (
                <a
                  href={activeAgent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-slate-950 bg-slate-950 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_#f59e0b]"
                >
                  Visit agent
                </a>
              ) : (
                <button
                  type="button"
                  className="border-2 border-slate-950 bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_#f59e0b]"
                >
                  Request access
                </button>
              )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [matches, setMatches] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    async function fetchMatches() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMatches(data.matches as Agent[]);
      } catch (fetchError) {
        setError("The draft room jammed. Please try again.");
        console.error(fetchError);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [query]);

  return (
    <main className="crt-shell relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-950"
              >
                ← new mission
              </Link>
              <CrewLink className="border-l border-slate-300 pl-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-950" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              draft board
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Pick the agent you would actually hire.
            </h1>
          </div>
          <div className="max-w-md border-l-4 border-amber-400 bg-white/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              mission
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">"{query}"</p>
          </div>
        </header>

        {loading && (
          <div className="grid min-h-[520px] place-items-center">
            <div className="text-center">
              <div className="mx-auto size-16 animate-spin border-4 border-slate-950 border-t-amber-400" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                shuffling the roster
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-10 border-2 border-rose-500 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="mt-12 max-w-xl border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              no cards drawn
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              No matching agents found.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try a more direct mission with concrete work words like email, report,
              review, schedule, research, or write.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-5 border-2 border-slate-950 bg-slate-950 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Rewrite mission
            </button>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="py-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                {matches.length} {matches.length === 1 ? "match" : "matches"} found
              </p>
              <button
                onClick={() => router.push("/")}
                className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-950"
              >
                reroll
              </button>
            </div>
            <AgentSelector agents={matches} />
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <div className="size-16 animate-spin border-4 border-slate-950 border-t-amber-400" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
