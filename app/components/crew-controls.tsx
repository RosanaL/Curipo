"use client";

import Link from "next/link";
import { useState } from "react";
import { CrewAgent } from "@/lib/crew";
import { useCrew } from "./use-crew";

export function CrewLink({ className = "" }: { className?: string }) {
  const { crew, loaded } = useCrew();
  const count = loaded ? crew?.agents.length || 0 : 0;

  return (
    <Link href="/crew" className={className}>
      My Crew{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}

export function CrewToggleButton({
  agent,
  className = "",
}: {
  agent: CrewAgent;
  className?: string;
}) {
  const { loaded, hasAgent, addAgent, removeAgent } = useCrew();
  const joined = hasAgent(agent.id);

  return (
    <button
      type="button"
      disabled={!loaded}
      onClick={(event) => {
        event.stopPropagation();
        if (joined) removeAgent(agent.id);
        else addAgent(agent);
      }}
      className={className}
      aria-pressed={joined}
    >
      {joined ? "In my crew" : "+ Add to my crew"}
    </button>
  );
}

export function ShareAgentButton({ agent }: { agent: CrewAgent }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/agent/${agent.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${agent.name} on Curipo`,
          text: agent.tagline || `Meet ${agent.name}, an AI agent in my crew.`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="border border-slate-950 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition hover:bg-amber-100"
    >
      {copied ? "Link copied" : "Share link"}
    </button>
  );
}
