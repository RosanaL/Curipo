import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgentById } from "@/lib/supabase";
import { CrewLink, CrewToggleButton } from "@/app/components/crew-controls";

const rarityStyles = [
  { name: "Legendary", border: "border-amber-500", text: "text-amber-800", accent: "#f59e0b" },
  { name: "Epic", border: "border-rose-500", text: "text-rose-800", accent: "#ef4444" },
  { name: "Rare", border: "border-cyan-500", text: "text-cyan-800", accent: "#06b6d4" },
  { name: "Skilled", border: "border-emerald-500", text: "text-emerald-800", accent: "#10b981" },
];

function clampStat(value: number) {
  return Math.max(42, Math.min(99, Math.round(value)));
}

function getStats(agent: { rating: number; models?: string[]; name: string }) {
  const rating = agent.rating || 4;
  const modelCount = agent.models?.length || 1;

  return [
    ["Judgment", clampStat(rating * 19)],
    ["Output", clampStat(74 + modelCount * 6)],
    ["Taste", clampStat(68 + agent.name.length * 2)],
    ["Reliability", clampStat(rating * 17 + 8)],
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

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) notFound();

  const rarity = getRarity(agent.rating);
  const stats = getStats(agent);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-slate-300 pb-6">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-950"
          >
            ← home
          </Link>
          <div className="flex items-center gap-4">
            <CrewLink className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-950" />
            <p className="border-l border-slate-300 pl-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              agent dossier
            </p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="lg:sticky lg:top-6">
            <div className="border-2 border-slate-950 bg-white p-4 shadow-[10px_10px_0_#0f172a]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    playable agent
                  </p>
                  <h1 className="mt-1 text-3xl font-black leading-none tracking-tight text-slate-950">
                    {agent.name}
                  </h1>
                </div>
                <span
                  className={`border bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${rarity.border} ${rarity.text}`}
                >
                  {rarity.name}
                </span>
              </div>

              <div className="relative overflow-hidden border-2 border-slate-950 bg-gradient-to-br from-amber-100 via-white to-cyan-100">
                <div className="aspect-[4/3]">
                  {agent.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agent.avatar_url}
                      alt={agent.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <div
                        className="grid size-32 place-items-center rounded-full border-2 border-slate-950 bg-white text-6xl font-black text-slate-950"
                        style={{ boxShadow: `7px 7px 0 ${rarity.accent}` }}
                      >
                        {agent.name.slice(0, 1)}
                      </div>
                    </div>
                  )}
                </div>
                {agent.price && (
                  <span className="absolute bottom-3 right-3 border border-slate-950 bg-white px-3 py-1.5 text-sm font-black text-emerald-700 shadow-[3px_3px_0_#0f172a]">
                    {agent.price}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <Stars rating={agent.rating} />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  roster ready
                </span>
              </div>

              {agent.tagline && (
                <p className="mt-4 text-base font-semibold leading-7 text-slate-700">
                  {agent.tagline}
                </p>
              )}

              <CrewToggleButton
                agent={agent}
                className="mt-6 w-full border-2 border-slate-950 bg-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-0.5 disabled:opacity-50"
              />

              {agent.url ? (
                <a
                  href={agent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-full border-2 border-slate-950 bg-slate-950 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b] transition hover:-translate-y-0.5"
                >
                  Visit agent
                </a>
              ) : (
                <button className="mt-3 w-full border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b]">
                  Request access
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <section className="border-b border-slate-300 pb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                what they do
              </p>
              <p className="mt-3 max-w-3xl text-xl font-semibold leading-9 text-slate-800">
                {agent.description}
              </p>
            </section>

            <section className="border-b border-slate-300 pb-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  ability sheet
                </p>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  based on roster metadata
                </span>
              </div>
              <div className="space-y-4">
                {stats.map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-black uppercase tracking-[0.14em] text-slate-600">
                        {label}
                      </span>
                      <span className="font-black text-slate-950">{value}</span>
                    </div>
                    <div className="h-3 border border-slate-950 bg-white">
                      <div
                        className="h-full bg-slate-950"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {agent.models?.length > 0 && (
              <section className="border-b border-slate-300 pb-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  supported models
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {agent.models.map((m) => (
                    <span
                      key={m}
                      className="border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                event hook
              </p>
              <div className="mt-4 border-l-4 border-amber-400 bg-white/70 px-5 py-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Prove this agent in the plaza.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Later, creators can publish challenges around their agents, such as
                  asking people to guess which writing sample came from AI. The event
                  becomes both a game and a proof of work for the agent.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
