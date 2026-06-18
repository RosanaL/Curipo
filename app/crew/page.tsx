"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ShareAgentButton } from "@/app/components/crew-controls";
import { useCrew } from "@/app/components/use-crew";
import { CrewAgent } from "@/lib/crew";

function CrewPortrait({ agent }: { agent: CrewAgent }) {
  if (agent.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={agent.avatar_url} alt={agent.name} className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-amber-100 via-white to-cyan-100">
      <div className="grid size-24 place-items-center rounded-full border-2 border-slate-950 bg-white text-4xl font-black shadow-[5px_5px_0_#f59e0b]">
        {agent.name.slice(0, 1)}
      </div>
    </div>
  );
}

export default function CrewPage() {
  const { crew, loaded, startCrew, renameCrew, removeAgent } = useCrew();
  const [name, setName] = useState("My Crew");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (crew?.name) setName(crew.name);
  }, [crew?.name]);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    startCrew(name);
  }

  function handleRename(event: FormEvent) {
    event.preventDefault();
    renameCrew(name);
    setEditingName(false);
  }

  if (!loaded) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="size-16 animate-spin border-4 border-slate-950 border-t-amber-400" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-300 pb-6">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-950"
          >
            ← draft room
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            crew management
          </p>
        </header>

        {!crew ? (
          <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-xl flex-col justify-center py-12">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
              your first roster
            </p>
            <h1 className="mt-3 text-5xl font-black leading-none tracking-tight text-slate-950 sm:text-6xl">
              Create your crew.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Name your team, then recruit agent cards from the draft board. Your crew stays
              saved in this browser.
            </p>
            <form
              onSubmit={handleCreate}
              className="mt-8 border-2 border-slate-950 bg-white p-4 shadow-[8px_8px_0_#0f172a]"
            >
              <label
                htmlFor="crew-name"
                className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
              >
                crew name
              </label>
              <input
                id="crew-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={36}
                className="mt-3 w-full border-b-2 border-slate-950 bg-transparent py-3 text-2xl font-black text-slate-950 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="mt-6 w-full border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create crew
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-6 border-b border-slate-300 py-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
                  active roster
                </p>
                {editingName ? (
                  <form onSubmit={handleRename} className="mt-3 flex max-w-xl gap-2">
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={36}
                      autoFocus
                      className="min-w-0 flex-1 border-b-2 border-slate-950 bg-transparent py-1 text-4xl font-black tracking-tight text-slate-950 focus:outline-none sm:text-5xl"
                    />
                    <button
                      type="submit"
                      className="border-2 border-slate-950 bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-5xl font-black leading-none tracking-tight text-slate-950 sm:text-6xl">
                      {crew.name}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="border border-slate-400 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600 hover:border-slate-950 hover:text-slate-950"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
              <div className="border-l-4 border-amber-400 bg-white/70 px-4 py-3">
                <p className="text-3xl font-black text-slate-950">{crew.agents.length}</p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  crew members
                </p>
              </div>
            </section>

            {crew.agents.length === 0 ? (
              <section className="py-16">
                <div className="max-w-xl border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    empty roster
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    Your crew needs its first agent.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Search for a job, inspect the cards, and recruit the agents that fit your team.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-block border-2 border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#f59e0b]"
                  >
                    Find agents
                  </Link>
                </div>
              </section>
            ) : (
              <section className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
                {crew.agents.map((agent, index) => (
                  <article
                    key={agent.id}
                    className="border-2 border-slate-950 bg-white p-4 shadow-[7px_7px_0_#0f172a]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          crew slot {String(index + 1).padStart(2, "0")}
                        </p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                          {agent.name}
                        </h2>
                      </div>
                      <span className="border border-emerald-500 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800">
                        Active
                      </span>
                    </div>

                    <Link
                      href={`/agent/${agent.id}`}
                      className="mt-4 block aspect-[4/3] overflow-hidden border-2 border-slate-950"
                    >
                      <CrewPortrait agent={agent} />
                    </Link>

                    {agent.tagline && (
                      <p className="mt-4 min-h-12 text-sm font-semibold leading-6 text-slate-600">
                        {agent.tagline}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      <ShareAgentButton agent={agent} />
                      <button
                        type="button"
                        onClick={() => removeAgent(agent.id)}
                        className="border border-rose-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-rose-700 transition hover:border-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
