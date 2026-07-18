"use client";

import Link from "next/link";
import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { ShareAgentButton } from "@/app/components/crew-controls";
import { useCrew } from "@/app/components/use-crew";
import { resolveAgentMedia } from "@/lib/agent-media";
import { CrewAgent } from "@/lib/crew";

function CrewPortrait({ agent }: { agent: CrewAgent }) {
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
      <img src={media.avatarUrl} alt={agent.name} className="h-full w-full object-contain" />
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

function getAgentCardCopy(agent: CrewAgent) {
  if (agent.name.trim().toLowerCase() === "okara") {
    return {
      role: "AI CMO",
      tagline: "Your growth & marketing copilot",
      detail: "Runs 10+ marketing agents 24/7",
      link: "okara.ai/cmo",
    };
  }

  const host = agent.description ? "curipo.ai/agent" : "curipo.ai/crew";

  return {
    role: "AI AGENT",
    tagline: agent.tagline || "Saved to your Curipo crew",
    detail: agent.description || "Ready for your next mission",
    link: host,
  };
}

function getAgentCardTheme(agent: CrewAgent) {
  const agentName = agent.name.trim().toLowerCase();

  if (agentName === "okara") {
    return {
      avatarBg: "#fbfaf6",
      ink: "#12100d",
      muted: "#7a746c",
      border: "#c8c1b5",
      control: "#ffffff",
    };
  }

  if (agentName === "daemons") {
    return {
      avatarBg: "#c9f16c",
      ink: "#20380a",
      muted: "#5b7d24",
      border: "#7db238",
      control: "#f7ffd9",
    };
  }

  const palettes = [
    {
      avatarBg: "#dff8ff",
      ink: "#082f49",
      muted: "#356477",
      border: "#78c7dc",
      control: "#f4fdff",
    },
    {
      avatarBg: "#fff0c7",
      ink: "#3a2600",
      muted: "#806126",
      border: "#d8ad42",
      control: "#fff8df",
    },
    {
      avatarBg: "#eadcff",
      ink: "#2b164d",
      muted: "#705397",
      border: "#a98ae7",
      control: "#f7f0ff",
    },
    {
      avatarBg: "#dcfce7",
      ink: "#073b22",
      muted: "#3d7254",
      border: "#75c99b",
      control: "#f4fff8",
    },
  ];
  const seed = [...agent.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palettes[seed % palettes.length];
}

function CrewCollectibleCard({
  agent,
  categoryId,
  categories,
  index,
  moveAgentToCategory,
  removeAgent,
}: {
  agent: CrewAgent;
  categoryId: string;
  categories: { id: string; name: string }[];
  index: number;
  moveAgentToCategory: (agentId: string, categoryId: string) => void;
  removeAgent: (agentId: string) => void;
}) {
  const copy = getAgentCardCopy(agent);
  const theme = getAgentCardTheme(agent);
  const cardStyle = {
    "--agent-card-bg": theme.avatarBg,
    "--agent-card-ink": theme.ink,
    "--agent-card-muted": theme.muted,
    "--agent-card-border": theme.border,
    "--agent-avatar-bg": theme.avatarBg,
    "--agent-card-control": theme.control,
  } as CSSProperties;

  return (
    <Reorder.Item
      key={agent.id}
      value={agent}
      as="article"
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.96 }}
      whileDrag={{ scale: 1.025, rotate: -0.6, zIndex: 20 }}
      transition={{ type: "spring", stiffness: 330, damping: 28 }}
      className="agent-color-card group relative h-[500px] w-[292px] shrink-0 cursor-grab overflow-hidden rounded-[30px] border-2 p-5 text-center active:cursor-grabbing"
      style={cardStyle}
    >
      <Link
        href={`/agent/${agent.id}`}
        className="agent-art-pad relative z-10 block h-[220px] overflow-hidden rounded-[24px]"
        style={{ backgroundColor: theme.avatarBg }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2">
          <CrewPortrait agent={agent} />
        </div>
        <div className="agent-avatar-shadow absolute bottom-7 left-1/2 h-3 w-28 -translate-x-1/2 rounded-full" />
      </Link>

      <div className="relative z-10 mt-5 px-5">
        <p className="agent-muted text-[10px] font-black uppercase tracking-[0.16em]">
          slot {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-1 truncate text-5xl font-black tracking-tight">
          {agent.name}
        </h3>
        <p className="mt-3 text-lg font-semibold uppercase tracking-[0.28em]">
          {copy.role}
        </p>
        <p className="mt-4 line-clamp-2 text-base font-semibold leading-6">
          {copy.tagline}
        </p>
        <p className="agent-muted mt-4 truncate text-sm font-semibold">
          {copy.detail}
        </p>
        <p className="agent-link-pill mt-4 truncate rounded-full px-4 py-1.5 text-lg font-semibold">
          {copy.link}
        </p>
      </div>

      <div
        className="absolute inset-x-5 bottom-5 z-20 grid grid-cols-[1fr_auto] gap-2 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <label className="agent-muted grid gap-1 text-left text-[10px] font-black uppercase tracking-[0.14em]">
          Move
          <select
            value={categoryId}
            onChange={(event) => moveAgentToCategory(agent.id, event.target.value)}
            className="agent-card-control h-9 border px-2 text-xs font-bold normal-case tracking-normal focus:outline-none"
          >
            {categories.map((targetCategory) => (
              <option key={targetCategory.id} value={targetCategory.id}>
                {targetCategory.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-1">
          <ShareAgentButton agent={agent} />
          <motion.button
            type="button"
            onClick={() => removeAgent(agent.id)}
            className="agent-card-control border px-2 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition hover:brightness-95"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Remove
          </motion.button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function CrewPage() {
  const {
    crew,
    loaded,
    startCrew,
    renameCrew,
    removeAgent,
    addCategory,
    moveAgentToCategory,
    reorderCategory,
  } = useCrew();
  const [name, setName] = useState("My Crew");
  const [shelfName, setShelfName] = useState("");
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

  function handleCreateShelf(event: FormEvent) {
    event.preventDefault();
    addCategory(shelfName);
    setShelfName("");
  }

  if (!loaded) {
    return (
      <main className="crt-shell grid min-h-screen place-items-center">
        <div className="size-16 animate-spin border-4 border-slate-950 border-t-amber-400" />
      </main>
    );
  }

  return (
    <main className="crt-shell relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
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
                  agent shelves
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
              <div className="grid gap-3 sm:min-w-72">
                <div className="border-l-4 border-amber-400 bg-white/70 px-4 py-3">
                  <p className="text-3xl font-black text-slate-950">{crew.agents.length}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    saved agents
                  </p>
                </div>
                <form
                  onSubmit={handleCreateShelf}
                  className="flex gap-2 border-2 border-slate-950 bg-white/80 p-2 shadow-[4px_4px_0_#0f172a]"
                >
                  <label htmlFor="shelf-name" className="sr-only">
                    Shelf name
                  </label>
                  <input
                    id="shelf-name"
                    value={shelfName}
                    onChange={(event) => setShelfName(event.target.value)}
                    maxLength={28}
                    placeholder="New shelf"
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!shelfName.trim()}
                    className="border-2 border-slate-950 bg-slate-950 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>
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
              <section className="space-y-10 py-10">
                {crew.categories.map((category) => {
                  const shelfAgents = category.agentIds
                    .map((agentId) => crew.agents.find((agent) => agent.id === agentId))
                    .filter((agent): agent is CrewAgent => Boolean(agent));

                  return (
                    <section key={category.id} className="relative">
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            shelf
                          </p>
                          <h2 className="text-3xl font-black tracking-tight text-slate-950">
                            {category.name}
                          </h2>
                        </div>
                        <span className="border border-slate-400 bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                          {shelfAgents.length} {shelfAgents.length === 1 ? "agent" : "agents"}
                        </span>
                      </div>

                      <div className="relative border-y-2 border-slate-950 bg-white/35 px-3 py-5 shadow-[0_8px_0_rgba(15,23,42,0.16)]">
                        <div className="absolute inset-x-0 bottom-0 h-4 border-t-2 border-slate-950 bg-[#173b3a]" />
                        {shelfAgents.length === 0 ? (
                          <div className="relative z-10 grid min-h-40 place-items-center border border-dashed border-slate-400 bg-white/55 px-5 text-center">
                            <p className="text-sm font-bold text-slate-500">
                              This shelf is waiting for its first agent.
                            </p>
                          </div>
                        ) : (
                          <Reorder.Group
                            axis="x"
                            values={shelfAgents}
                            onReorder={(agents) =>
                              reorderCategory(
                                category.id,
                                agents.map((agent) => agent.id)
                              )
                            }
                            as="div"
                            className="relative z-10 flex min-h-[550px] gap-6 overflow-x-auto px-2 pb-6 pt-2"
                          >
                            <AnimatePresence initial={false}>
                              {shelfAgents.map((agent, index) => (
                                <CrewCollectibleCard
                                  key={agent.id}
                                  agent={agent}
                                  categoryId={category.id}
                                  categories={crew.categories}
                                  index={index}
                                  moveAgentToCategory={moveAgentToCategory}
                                  removeAgent={removeAgent}
                                />
                              ))}
                            </AnimatePresence>
                          </Reorder.Group>
                        )}
                      </div>
                    </section>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
