"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { resolveAgentMedia } from "@/lib/agent-media";

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  animation_url?: string;
  poster_url?: string;
  tagline?: string;
  description?: string;
  price?: string;
  rating?: number;
  created_at?: string;
}

const tabs = [
  { label: "Ask", href: "/" },
  { label: "My Crew", href: "/crew" },
  { label: "Recommended", href: "/recommendations", active: true },
];

function clampColor(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToCss(red: number, green: number, blue: number) {
  return `rgb(${clampColor(red)} ${clampColor(green)} ${clampColor(blue)})`;
}

function mixColor(color: { red: number; green: number; blue: number }, target: number, amount: number) {
  return rgbToCss(
    color.red + (target - color.red) * amount,
    color.green + (target - color.green) * amount,
    color.blue + (target - color.blue) * amount
  );
}

function getRelativeLuminance({ red, green, blue }: { red: number; green: number; blue: number }) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function sampleTopRightColor(element: HTMLImageElement | HTMLVideoElement) {
  const sourceWidth = element instanceof HTMLVideoElement ? element.videoWidth : element.naturalWidth;
  const sourceHeight = element instanceof HTMLVideoElement ? element.videoHeight : element.naturalHeight;

  if (!sourceWidth || !sourceHeight) return null;

  try {
    const sampleSize = Math.min(10, sourceWidth, sourceHeight);
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    context.drawImage(
      element,
      sourceWidth - sampleSize,
      0,
      sampleSize,
      sampleSize,
      0,
      0,
      sampleSize,
      sampleSize
    );

    const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3];
      if (alpha < 24) continue;
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      count += 1;
    }

    if (!count) return null;

    return {
      red: red / count,
      green: green / count,
      blue: blue / count,
    };
  } catch {
    return null;
  }
}

function getSameOriginMediaUrl(url: string) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) return url;
  return `/api/media?url=${encodeURIComponent(url)}`;
}

function getSampledCardTheme(sample: { red: number; green: number; blue: number } | null, fallback: ReturnType<typeof getAgentCardTheme>) {
  if (!sample) return fallback;

  const isDark = getRelativeLuminance(sample) < 0.34;
  const inkTarget = isDark ? 255 : 0;
  const controlTarget = isDark ? 255 : 255;
  const borderTarget = isDark ? 255 : 0;
  const background = rgbToCss(sample.red, sample.green, sample.blue);

  return {
    avatarBg: background,
    ink: mixColor(sample, inkTarget, isDark ? 0.88 : 0.82),
    muted: mixColor(sample, inkTarget, isDark ? 0.68 : 0.58),
    border: mixColor(sample, borderTarget, isDark ? 0.42 : 0.36),
    control: mixColor(sample, controlTarget, isDark ? 0.18 : 0.62),
  };
}

function AgentPortrait({
  agent,
  onColorSample,
}: {
  agent: Agent;
  onColorSample?: (sample: { red: number; green: number; blue: number }) => void;
}) {
  const media = resolveAgentMedia(agent);
  const handleMediaReady = (element: HTMLImageElement | HTMLVideoElement) => {
    const sample = sampleTopRightColor(element);
    if (sample) onColorSample?.(sample);
  };

  if (media.animationUrl) {
    const animationUrl = getSameOriginMediaUrl(media.animationUrl);
    return (
      <video
        aria-label={`${agent.name} animated avatar`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={media.posterUrl ? getSameOriginMediaUrl(media.posterUrl) : undefined}
        onLoadedData={(event) => handleMediaReady(event.currentTarget)}
        onCanPlay={(event) => handleMediaReady(event.currentTarget)}
        className="h-full w-full object-contain"
      >
        <source src={animationUrl} type={media.animationUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"} />
      </video>
    );
  }

  if (media.avatarUrl) {
    const avatarUrl = getSameOriginMediaUrl(media.avatarUrl);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={agent.name}
        onLoad={(event) => handleMediaReady(event.currentTarget)}
        className="h-full w-full object-contain"
      />
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

function getAgentCardCopy(agent: Agent) {
  if (agent.name.trim().toLowerCase() === "okara") {
    return {
      role: "AI CMO",
      tagline: "Your growth & marketing copilot",
      detail: "Runs 10+ marketing agents 24/7",
      link: "okara.ai/cmo",
    };
  }

  return {
    role: "AI AGENT",
    tagline: agent.tagline || "Recommended for your Curipo binder",
    detail: agent.description || agent.price || "Ready for your next mission",
    link: "curipo.ai/agent",
  };
}

function getAgentCardTheme(agent: Agent) {
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

function RecommendedAgentCard({ agent, index }: { agent: Agent; index: number }) {
  const copy = getAgentCardCopy(agent);
  const fallbackTheme = getAgentCardTheme(agent);
  const [sample, setSample] = useState<{ red: number; green: number; blue: number } | null>(null);
  const theme = getSampledCardTheme(sample, fallbackTheme);
  const cardStyle = {
    "--agent-card-bg": theme.avatarBg,
    "--agent-card-ink": theme.ink,
    "--agent-card-muted": theme.muted,
    "--agent-card-border": theme.border,
    "--agent-avatar-bg": theme.avatarBg,
    "--agent-card-control": theme.control,
  } as CSSProperties;

  return (
    <article
      className="agent-color-card group relative h-[500px] w-[292px] shrink-0 overflow-hidden rounded-[30px] border-2 p-5 text-center transition hover:-translate-y-1"
      style={cardStyle}
    >
      <Link
        href={`/agent/${agent.id}`}
        className="agent-art-pad relative z-10 block h-[220px] overflow-hidden rounded-[24px]"
        style={{ backgroundColor: theme.avatarBg }}
        aria-label={`View ${agent.name}`}
      >
        <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2">
          <AgentPortrait agent={agent} onColorSample={setSample} />
        </div>
        <div className="agent-avatar-shadow absolute bottom-7 left-1/2 h-3 w-28 -translate-x-1/2 rounded-full" />
      </Link>

      <div className="relative z-10 mt-5 px-5">
        <p className="agent-muted text-[10px] font-black uppercase tracking-[0.16em]">
          pick {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-1 truncate text-5xl font-black tracking-tight">
          {agent.name}
        </h2>
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
    </article>
  );
}

export default function RecommendationsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      try {
        const response = await fetch("/api/agents");
        const data = await response.json();
        setAgents(Array.isArray(data.agents) ? data.agents : []);
      } catch (error) {
        console.error(error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  const recommendedAgents = useMemo(() => {
    return [...agents]
      .sort((a, b) => {
        const ratingDelta = (b.rating || 0) - (a.rating || 0);
        if (ratingDelta !== 0) return ratingDelta;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      })
      .slice(0, 12);
  }, [agents]);

  return (
    <main className="crt-shell relative min-h-screen overflow-hidden text-[#312d22]">
      <div className="relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-12 sm:px-8">
        <header className="sticky top-0 z-40 flex min-h-20 flex-col gap-3 rounded-b-[28px] border px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 text-left" aria-label="Curipo home">
            <span className="grid size-10 place-items-center border border-[#7db238] bg-[#c9f16c] text-sm font-black text-[#20380a]">
              C
            </span>
            <span>
              <span className="block text-lg font-black">CURIPO</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em]">
                Personal AI agent binder
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Primary">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:-translate-y-0.5 ${
                  tab.active ? "bg-[#c9f16c] text-[#20380a]" : "bg-white/55 text-[#312d22]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="py-10">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#756f61]">
            Recommended
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Agents worth adding to your binder.
          </h1>

          {loading ? (
            <div className="mt-10 grid min-h-64 place-items-center border">
              <div className="size-14 animate-spin border-4 border-[#756f61] border-t-[#c9f16c]" />
            </div>
          ) : recommendedAgents.length > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-6 sm:justify-start">
              {recommendedAgents.map((agent, index) => (
                <RecommendedAgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-10 border p-6">
              <p className="text-sm font-bold text-[#756f61]">
                No agents are available yet. Add agents, then refresh this page.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
