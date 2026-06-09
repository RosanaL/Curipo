"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import agentsData from "@/data/agents.json";

interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  use_cases: string[];
  tags: string[];
  complexity: string;
  models_supported: string[];
  built_with: string[];
  example_prompt: string;
}

interface Match {
  id: string;
  reason: string;
}

const complexityColor: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [matches, setMatches] = useState<(Agent & { reason: string })[]>([]);
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
          body: JSON.stringify({ query, agents: agentsData }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const enriched = (data.matches as Match[]).map((m) => {
          const agent = (agentsData as Agent[]).find((a) => a.id === m.id);
          return agent ? { ...agent, reason: m.reason } : null;
        }).filter(Boolean) as (Agent & { reason: string })[];

        setMatches(enriched);
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
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Back
        </Link>
        <div className="mt-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Query</p>
          <h2 className="text-white text-xl font-medium leading-snug">"{query}"</h2>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Matching agents...</p>
        </div>
      )}

      {error && (
        <div className="text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          <p className="text-slate-500 text-sm mb-2">Top {matches.length} matches</p>
          {matches.map((agent, i) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.id}`}
              className="group block bg-[#13131f] border border-[#2a2a3d] hover:border-indigo-500/40 rounded-xl p-6 transition-all hover:bg-[#15152a]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-indigo-400 text-xs font-mono">#{i + 1}</span>
                    <h3 className="text-white font-semibold text-lg group-hover:text-indigo-300 transition-colors">
                      {agent.name}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm">{agent.tagline}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full border ${complexityColor[agent.complexity]}`}>
                  {agent.complexity}
                </span>
              </div>

              {/* Why it matches */}
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-4 py-3 mb-4">
                <p className="text-indigo-300 text-xs uppercase tracking-widest mb-1 font-medium">Why it matches</p>
                <p className="text-slate-300 text-sm leading-relaxed">{agent.reason}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-[#1e1e2e] border border-[#2a2a3d] px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New search */}
      {!loading && (
        <div className="mt-10 pt-8 border-t border-[#2a2a3d]">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-400 hover:text-white transition-colors"
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
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
