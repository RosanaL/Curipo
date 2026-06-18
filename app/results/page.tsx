"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CrewLink, CrewToggleButton } from "@/app/components/crew-controls";

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  tagline?: string;
  models: string[];
  price: string;
  description: string;
  rating: number;
  reason: string;
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
  {
    name: "Wildcard",
    text: "text-slate-700",
    border: "border-slate-400",
    accent: "#64748b",
    art: "from-slate-100 via-white to-amber-100",
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
  if ((rating || 0) > 0) return rarityStyles[3];
  return rarityStyles[4];
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

  if (agent.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={agent.avatar_url}
        alt={agent.name}
        draggable={false}
        className="h-full w-full object-cover"
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

function CardContent({ agent, rank }: { agent: Agent; rank: number }) {
  const rarity = getRarity(agent.rating);
  const stats = getStats(agent, rank);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            draft pick #{rank}
          </p>
          <h3 className="mt-1 text-2xl font-black leading-none tracking-tight text-slate-950">
            {agent.name}
          </h3>
        </div>
        <span
          className={`border bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${rarity.border} ${rarity.text}`}
        >
          {rarity.name}
        </span>
      </div>

      <div className="relative overflow-hidden border-2 border-slate-950 bg-slate-100">
        <div className="aspect-[4/3]">
          <AgentPortrait agent={agent} />
        </div>
        <CrewToggleButton
          agent={agent}
          className="absolute left-2 top-2 border border-slate-950 bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-950 shadow-[2px_2px_0_#f59e0b] transition hover:bg-amber-100 disabled:opacity-50"
        />
        {agent.price && (
          <span className="absolute bottom-2 right-2 border border-slate-950 bg-white px-2 py-1 text-xs font-black text-emerald-700 shadow-[2px_2px_0_#0f172a]">
            {agent.price}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <Stars rating={agent.rating} />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          employee card
        </span>
      </div>

      {agent.tagline && (
        <p className="mt-3 min-h-10 text-sm font-semibold leading-5 text-slate-700">
          {agent.tagline}
        </p>
      )}

      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          why hire
        </p>
        <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">{agent.reason}</p>
      </div>

      <div className="mt-auto pt-4">
        <div className="grid grid-cols-3 border-y border-slate-200">
          {stats.map(([label, value]) => (
            <div key={label} className="py-2 text-center">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400">{label}</p>
              <p className="mt-0.5 text-xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        {agent.models?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.models.slice(0, 3).map((m) => (
              <span
                key={m}
                className="border border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500"
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Deck({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);
  const activeAgent = agents[active];

  function next() {
    setActive((a) => Math.min(a + 1, agents.length - 1));
  }

  function prev() {
    setActive((a) => Math.max(a - 1, 0));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    setDragX(dx);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = dragX;
    setDragX(0);
    if (dx < -70) next();
    else if (dx > 70) prev();
  }

  return (
    <section className="grid items-start gap-8 lg:grid-cols-[minmax(360px,1fr)_320px]">
      <div className="flex flex-col items-center">
        <div className="relative h-[590px] w-full max-w-[390px] select-none sm:h-[620px]">
          {agents.map((agent, i) => {
            const offset = i - active;
            if (offset < 0) {
              return (
                <div
                  key={agent.id}
                  className="absolute inset-x-0 mx-auto w-[340px] transition-all duration-300 ease-out"
                  style={{ transform: "translateX(-135%) rotate(-10deg)", opacity: 0 }}
                />
              );
            }

            const isActive = offset === 0;
            const baseTranslate = Math.min(offset, 3) * 30;
            const baseRotate = Math.min(offset, 3) * 2;
            const scale = 1 - Math.min(offset, 3) * 0.055;
            const opacity = offset > 3 ? 0 : 1 - Math.min(offset, 3) * 0.16;
            const z = agents.length - offset;

            const transform = isActive
              ? `translateX(${dragX}px) rotate(${dragX * 0.035}deg)`
              : `translateX(${baseTranslate}px) rotate(${baseRotate}deg) scale(${scale})`;

            return (
              <div
                key={agent.id}
                className={`absolute inset-x-0 mx-auto h-[560px] w-[340px] sm:h-[590px] sm:w-[360px] ${
                  isActive ? "" : "transition-all duration-300 ease-out"
                }`}
                style={{ transform, opacity, zIndex: z }}
              >
                <article
                  onPointerDown={isActive ? onPointerDown : undefined}
                  onPointerMove={isActive ? onPointerMove : undefined}
                  onPointerUp={isActive ? onPointerUp : undefined}
                  onClick={() => {
                    if (isActive && !moved.current) router.push(`/agent/${agent.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (isActive && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      router.push(`/agent/${agent.id}`);
                    }
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`Inspect ${agent.name}`}
                  className={`h-full w-full border-2 border-slate-950 bg-white p-4 text-left shadow-[10px_10px_0_#0f172a] transition ${
                    isActive
                      ? "cursor-grab hover:-translate-y-1 active:cursor-grabbing"
                      : "pointer-events-none"
                  }`}
                >
                  <CardContent agent={agent} rank={i + 1} />
                </article>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={prev}
            disabled={active === 0}
            className="grid size-11 place-items-center border-2 border-slate-950 bg-white text-xl font-black text-slate-950 shadow-[3px_3px_0_#f59e0b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:shadow-none"
            aria-label="Previous card"
          >
            ←
          </button>
          <div className="flex gap-2">
            {agents.map((agent, i) => (
              <button
                key={agent.id}
                onClick={() => setActive(i)}
                className={`h-3 transition-all ${
                  i === active ? "w-8 bg-slate-950" : "w-3 border border-slate-400 bg-white hover:bg-amber-300"
                }`}
                aria-label={`Go to ${agent.name}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={active === agents.length - 1}
            className="grid size-11 place-items-center border-2 border-slate-950 bg-white text-xl font-black text-slate-950 shadow-[3px_3px_0_#f59e0b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:shadow-none"
            aria-label="Next card"
          >
            →
          </button>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Swipe cards or tap to inspect
        </p>
      </div>

      <aside className="border-l border-slate-300 pl-0 lg:pl-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">active pick</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {activeAgent.name}
        </h2>
        {activeAgent.tagline && (
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            {activeAgent.tagline}
          </p>
        )}
        <div className="mt-6 border-y border-slate-300 py-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            hiring note
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{activeAgent.reason}</p>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-slate-500">Price</span>
            <span className="font-black text-emerald-700">{activeAgent.price || "Ask"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-slate-500">Rating</span>
            <span className="font-black text-slate-950">{activeAgent.rating?.toFixed(1) || "New"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-slate-500">Models</span>
            <span className="max-w-40 truncate text-right font-black text-slate-950">
              {activeAgent.models?.length ? activeAgent.models.join(", ") : "Flexible"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/agent/${activeAgent.id}`)}
          className="mt-7 w-full border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b] transition hover:-translate-y-0.5"
        >
          Inspect card
        </button>
      </aside>
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
      } catch (e) {
        setError("The draft room jammed. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [query]);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
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
                {matches.length} cards dealt
              </p>
              <button
                onClick={() => router.push("/")}
                className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-950"
              >
                reroll
              </button>
            </div>
            <Deck agents={matches} />
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
