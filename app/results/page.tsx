"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(full)}
      <span className="text-slate-200">{"★".repeat(5 - full)}</span>
      <span className="text-slate-400 ml-1.5 text-xs">{rating?.toFixed(1)}</span>
    </span>
  );
}

function CardContent({ agent, rank }: { agent: Agent; rank: number }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-indigo-500 text-xs font-mono font-semibold">#{rank}</span>
        {agent.price && (
          <span className="text-xs px-2 py-0.5 rounded-full border text-emerald-600 bg-emerald-50 border-emerald-200">
            {agent.price}
          </span>
        )}
      </div>

      <div className="flex justify-center mb-4">
        {agent.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agent.avatar_url}
            alt={agent.name}
            className="w-24 h-24 rounded-full object-cover border border-slate-200"
            draggable={false}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl text-indigo-300">
            ⬡
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <h3 className="text-slate-900 font-bold text-lg">{agent.name}</h3>
        {agent.tagline && (
          <p className="text-slate-500 text-sm mt-1 leading-snug">{agent.tagline}</p>
        )}
        {agent.rating != null && (
          <div className="mt-2">
            <Stars rating={agent.rating} />
          </div>
        )}
      </div>

      <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-2.5 mb-4">
        <p className="text-indigo-500 text-[10px] uppercase tracking-widest mb-1 font-semibold">Why it matches</p>
        <p className="text-slate-600 text-sm leading-relaxed">{agent.reason}</p>
      </div>

      {agent.models?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto justify-center">
          {agent.models.map((m) => (
            <span
              key={m}
              className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full font-mono"
            >
              {m}
            </span>
          ))}
        </div>
      )}
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
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm h-[480px] flex items-center justify-center select-none">
        {agents.map((agent, i) => {
          const offset = i - active;
          // already swiped away
          if (offset < 0) {
            return (
              <div
                key={agent.id}
                className="absolute w-80 transition-all duration-300 ease-out pointer-events-none"
                style={{ transform: "translateX(-130%) rotate(-8deg)", opacity: 0 }}
              />
            );
          }
          const isActive = offset === 0;
          // stacked behind to the right
          const baseTranslate = Math.min(offset, 3) * 32;
          const scale = 1 - Math.min(offset, 3) * 0.06;
          const opacity = offset > 3 ? 0 : 1 - Math.min(offset, 3) * 0.15;
          const z = agents.length - offset;

          const transform = isActive
            ? `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`
            : `translateX(${baseTranslate}px) scale(${scale})`;

          return (
            <div
              key={agent.id}
              className={`absolute w-80 h-[440px] ${isActive ? "" : "transition-all duration-300 ease-out"}`}
              style={{ transform, opacity, zIndex: z }}
            >
              <div
                onPointerDown={isActive ? onPointerDown : undefined}
                onPointerMove={isActive ? onPointerMove : undefined}
                onPointerUp={isActive ? onPointerUp : undefined}
                onClick={() => {
                  if (isActive && !moved.current) router.push(`/agent/${agent.id}`);
                }}
                className={`h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-md ${
                  isActive ? "cursor-grab active:cursor-grabbing hover:shadow-lg" : "pointer-events-none"
                } transition-shadow`}
              >
                <CardContent agent={agent} rank={i + 1} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={prev}
          disabled={active === 0}
          className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous"
        >
          ←
        </button>
        <div className="flex gap-1.5">
          {agents.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-indigo-500" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={active === agents.length - 1}
          className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next"
        >
          →
        </button>
      </div>
      <p className="text-slate-400 text-xs mt-3">Swipe or use arrows · tap a card for details</p>
    </div>
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
    if (!query) return;

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
        setError("Something went wrong. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [query]);

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">
          ← Back
        </Link>
        <div className="mt-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Query</p>
          <h2 className="text-slate-900 text-xl font-medium leading-snug">"{query}"</h2>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Matching agents...</p>
        </div>
      )}

      {error && (
        <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <p className="text-slate-400 text-sm">No matching agents found.</p>
      )}

      {!loading && !error && matches.length > 0 && (
        <>
          <p className="text-slate-400 text-sm mb-6 text-center">Top {matches.length} matches</p>
          <Deck agents={matches} />
        </>
      )}

      {/* New search */}
      {!loading && (
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Try a different query
          </button>
        </div>
      )}
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
