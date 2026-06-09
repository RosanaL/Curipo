import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.LLM_MODEL || "anthropic/claude-opus-4-5";
const BASE_URL = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
const API_KEY = process.env.LLM_API_KEY || "";

export async function POST(req: NextRequest) {
  const { query, agents } = await req.json();

  if (!query || !agents) {
    return NextResponse.json({ error: "Missing query or agents" }, { status: 400 });
  }

  const prompt = `You are an AI agent matchmaker. A user wants to automate something and you must find the best matching agents from the list below.

User query: "${query}"

Available agents (JSON):
${JSON.stringify(agents, null, 2)}

Return ONLY a valid JSON array of exactly 3 objects, each with:
- "id": the agent's id string
- "reason": a 1-2 sentence explanation of why this agent fits the user's need

Example format:
[
  { "id": "some-agent-id", "reason": "This agent is a great fit because..." },
  { "id": "another-id", "reason": "..." },
  { "id": "third-id", "reason": "..." }
]

Return ONLY the JSON array. No markdown, no explanation, no code blocks.`;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  let matches;
  try {
    matches = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 });
  }

  return NextResponse.json({ matches });
}
