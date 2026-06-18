import { NextRequest, NextResponse } from "next/server";
import { getAllAgents, Agent } from "@/lib/supabase";

// Simple stopwords so generic words don't dominate scoring.
const STOPWORDS = new Set([
  "a", "an", "the", "to", "for", "of", "and", "or", "my", "me", "i", "with",
  "help", "want", "need", "can", "you", "please", "how", "do", "that", "this",
  "is", "are", "it", "on", "in", "at", "be", "have", "get",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Weighted keyword score: matches in name/tagline count more than description.
function scoreAgent(agent: Agent, terms: string[]): { score: number; hits: string[] } {
  const name = (agent.name || "").toLowerCase();
  const tagline = (agent.tagline || "").toLowerCase();
  const description = (agent.description || "").toLowerCase();
  const models = (agent.models || []).join(" ").toLowerCase();

  let score = 0;
  const hits: string[] = [];

  for (const term of terms) {
    let matched = false;
    if (name.includes(term)) { score += 5; matched = true; }
    if (tagline.includes(term)) { score += 3; matched = true; }
    if (models.includes(term)) { score += 3; matched = true; }
    if (description.includes(term)) { score += 1; matched = true; }
    if (matched) hits.push(term);
  }
  return { score, hits };
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  let agents: Agent[];
  try {
    agents = await getAllAgents();
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load agents from database", detail: String(e) },
      { status: 500 }
    );
  }

  const terms = tokenize(query);

  const ranked = agents
    .map((agent) => {
      const { score, hits } = scoreAgent(agent, terms);
      return { agent, score, hits };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (b.agent.rating || 0) - (a.agent.rating || 0))
    .slice(0, 5);

  const matches = ranked.map(({ agent, hits }) => ({
    ...agent,
    reason:
      hits.length > 0
        ? `Matched your search for ${hits.map((h) => `"${h}"`).join(", ")}.`
        : "A relevant match for your query.",
  }));

  return NextResponse.json({ matches });
}
