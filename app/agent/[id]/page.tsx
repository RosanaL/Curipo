import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgentById } from "@/lib/supabase";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-amber-400">
      {"★".repeat(full)}
      <span className="text-slate-200">{"★".repeat(5 - full)}</span>
      <span className="text-slate-400 ml-2 text-sm">{rating?.toFixed(1)}</span>
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

  return (
    <main className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">
        ← Home
      </Link>

      {/* Vertical card */}
      <div className="mt-8 bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        {/* Header — avatar centered on top */}
        <div className="flex flex-col items-center text-center mb-6">
          {agent.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="w-28 h-28 rounded-full object-cover border border-slate-200 mb-4"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-4xl text-indigo-300 mb-4">
              ⬡
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{agent.name}</h1>
            {agent.price && (
              <span className="text-xs px-2.5 py-1 rounded-full border text-emerald-600 bg-emerald-50 border-emerald-200">
                {agent.price}
              </span>
            )}
          </div>
          {agent.tagline && (
            <p className="text-slate-500 text-base mt-2">{agent.tagline}</p>
          )}
          {agent.rating != null && (
            <div className="mt-3">
              <Stars rating={agent.rating} />
            </div>
          )}
        </div>

        {/* Description / what it does */}
        <section className="mb-6">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">What It Does</h2>
          <p className="text-slate-700 leading-relaxed">{agent.description}</p>
        </section>

        {/* Models */}
        {agent.models?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Supported Models</h2>
            <div className="flex flex-wrap gap-2">
              {agent.models.map((m) => (
                <span
                  key={m}
                  className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full font-mono"
                >
                  {m}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {agent.url ? (
          <a
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors text-center"
          >
            Visit Agent ↗
          </a>
        ) : (
          <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
            Request Access
          </button>
        )}
        <p className="text-center text-slate-400 text-xs mt-2">
          {agent.url ? "Opens the agent's website in a new tab" : "Access requests are reviewed manually"}
        </p>
      </div>
    </main>
  );
}
