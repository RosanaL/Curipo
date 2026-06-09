import { notFound } from "next/navigation";
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

const complexityColor: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = (agentsData as Agent[]).find((a) => a.id === id);

  if (!agent) notFound();

  return (
    <main className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
        ← Home
      </Link>

      <div className="mt-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-slate-400 text-base">{agent.tagline}</p>
          </div>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${complexityColor[agent.complexity]}`}>
            {agent.complexity} complexity
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {agent.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-500 bg-[#1e1e2e] border border-[#2a2a3d] px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">About</h2>
          <p className="text-slate-300 leading-relaxed">{agent.description}</p>
        </section>

        {/* Use cases */}
        <section className="mb-8">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Use cases</h2>
          <ul className="flex flex-col gap-2">
            {agent.use_cases.map((uc) => (
              <li key={uc} className="flex items-start gap-2.5 text-slate-300 text-sm">
                <span className="text-indigo-400 mt-0.5">▸</span>
                {uc}
              </li>
            ))}
          </ul>
        </section>

        {/* Example prompt */}
        <section className="mb-8">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Example prompt</h2>
          <div className="bg-[#13131f] border border-[#2a2a3d] rounded-xl px-4 py-3">
            <p className="text-slate-300 text-sm italic">"{agent.example_prompt}"</p>
          </div>
        </section>

        {/* Models & stack */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <section className="bg-[#13131f] border border-[#2a2a3d] rounded-xl p-4">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Supported models</h2>
            <ul className="flex flex-col gap-1.5">
              {agent.models_supported.map((m) => (
                <li key={m} className="text-slate-300 text-xs font-mono">{m}</li>
              ))}
            </ul>
          </section>
          <section className="bg-[#13131f] border border-[#2a2a3d] rounded-xl p-4">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Built with</h2>
            <ul className="flex flex-col gap-1.5">
              {agent.built_with.map((b) => (
                <li key={b} className="text-slate-300 text-xs font-mono">{b}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* CTA */}
        <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
          Request Access
        </button>
        <p className="text-center text-slate-600 text-xs mt-2">Access requests are reviewed manually</p>
      </div>
    </main>
  );
}
