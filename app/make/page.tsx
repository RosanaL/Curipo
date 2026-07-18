"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Patrick_Hand } from "next/font/google";
import { parseRepoInput } from "@/lib/github";
import { parseSiteInput } from "@/lib/site-card";

const hand = Patrick_Hand({ weight: "400", subsets: ["latin"] });

const examples = [
  "DietrichGebert/ponytail",
  "anthropics/claude-code",
  "okara.ai",
];

export default function MakeCardPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // GitHub repo → stat card; any other URL → website identity card.
    const repo = parseRepoInput(input);
    if (repo) {
      setError("");
      setLoading(true);
      router.push(`/gh/${repo.owner}/${repo.repo}`);
      return;
    }

    const host = parseSiteInput(input);
    if (host) {
      setError("");
      setLoading(true);
      router.push(`/site/${host}`);
      return;
    }

    setError("Hmm, that doesn't look like a repo or a website. Try owner/repo or a link.");
  }

  return (
    <main
      className={`${hand.className} grid min-h-screen place-items-center px-4 py-10`}
      style={{
        background: "#faf3e8",
        backgroundImage: "radial-gradient(#e8dcc8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: "#4a3421",
      }}
    >
      <div className="w-full max-w-lg text-center">
        <p className="text-xl opacity-70">curipo</p>
        <h1 className="mt-2 text-5xl leading-tight">
          Turn a repo or a website into a little card
        </h1>
        <p className="mt-3 text-xl opacity-75">
          Paste a GitHub repo or any product link. We&apos;ll make it a card you
          can share, like a business card for your favorite agent.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <input
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setError("");
            }}
            placeholder="github.com/owner/repo  ·  or  okara.ai"
            spellCheck={false}
            className="w-full bg-white px-5 py-4 text-center text-2xl outline-none placeholder:opacity-40"
            style={{
              border: "3px solid #4a3421",
              borderRadius: "255px 18px 225px 18px / 18px 225px 18px 255px",
            }}
          />
          {error && (
            <p className="mt-3 text-lg" style={{ color: "#c96f4a" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="mt-4 w-full py-3 text-2xl transition hover:-translate-y-0.5 disabled:opacity-40"
            style={{
              border: "3px solid #4a3421",
              borderRadius: "18px 225px 18px 255px / 255px 18px 225px 18px",
              background: "#f4a261",
            }}
          >
            {loading ? "drawing your card…" : "make the card ✦"}
          </button>
        </form>

        <div className="mt-8 text-lg opacity-70">
          <p>or try one of these:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="rounded-full bg-white px-4 py-1.5 transition hover:-translate-y-0.5"
                style={{ border: "2px solid #4a3421" }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
