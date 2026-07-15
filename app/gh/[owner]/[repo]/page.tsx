import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Patrick_Hand } from "next/font/google";
import { fetchRepoCard } from "@/lib/github";
import { ShareCardButton } from "@/app/components/share-card-button";

const hand = Patrick_Hand({ weight: "400", subsets: ["latin"] });

// Crayon palette for stat bars — warm, no neon.
const crayons = ["#f4a261", "#8ab17d", "#7fb3d5", "#e8909c", "#eec170"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}): Promise<Metadata> {
  const { owner, repo } = await params;
  const card = await fetchRepoCard(owner, repo);

  if (!card) return { title: "Card not found — Curipo" };

  const title = `${card.name} — a Curipo agent card`;
  const description = card.description;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile", url: `/gh/${owner}/${repo}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default async function GithubCardPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const card = await fetchRepoCard(owner, repo);

  if (!card) notFound();

  return (
    <main
      className={`${hand.className} min-h-screen px-4 py-10`}
      style={{
        background: "#faf3e8",
        backgroundImage: "radial-gradient(#e8dcc8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: "#4a3421",
      }}
    >
      <div className="mx-auto max-w-md">
        {/* top nav */}
        <div className="mb-6 flex items-center justify-between text-lg">
          <Link href="/make" className="underline decoration-wavy underline-offset-4 hover:opacity-70">
            ← make another
          </Link>
          <span className="opacity-60">curipo card</span>
        </div>

        {/* the card */}
        <div
          className="relative bg-white p-7"
          style={{
            border: "3px solid #4a3421",
            borderRadius: "255px 18px 225px 18px / 18px 225px 18px 255px",
            boxShadow: "6px 8px 0 rgba(74, 52, 33, 0.16)",
          }}
        >
          {/* tape */}
          <div
            className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-2"
            style={{ background: "rgba(238, 193, 112, 0.55)" }}
          />

          {/* header: avatar + name */}
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.avatarUrl}
              alt={`${card.owner} avatar`}
              className="size-20 rounded-full object-cover"
              style={{ border: "3px solid #4a3421", transform: "rotate(-2deg)" }}
            />
            <div className="min-w-0">
              <h1 className="truncate text-4xl leading-tight">{card.name}</h1>
              <p className="text-lg opacity-70">by {card.owner}</p>
            </div>
            <div className="ml-auto text-center">
              <div
                className="grid size-16 place-items-center rounded-full text-3xl"
                style={{ border: "3px solid #4a3421", background: "#eec170", transform: "rotate(3deg)" }}
              >
                {card.overall}
              </div>
              <p className="mt-1 text-sm opacity-70">overall</p>
            </div>
          </div>

          {/* vibe */}
          <p className="mt-4 text-xl" style={{ color: "#c96f4a" }}>
            ✦ {card.vibe}
          </p>

          {/* description */}
          <p className="mt-2 text-lg leading-6 opacity-85">{card.description}</p>

          {/* divider */}
          <div className="my-5 border-t-2 border-dashed" style={{ borderColor: "#d8c6ac" }} />

          {/* stats */}
          <div className="space-y-3">
            {card.stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="w-16 text-lg">{stat.label}</span>
                <div
                  className="h-4 flex-1 overflow-hidden rounded-full"
                  style={{ border: "2px solid #4a3421", background: "#faf3e8" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stat.value}%`, background: crayons[i % crayons.length] }}
                  />
                </div>
                <span className="w-8 text-right text-lg">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* little facts */}
          <div className="mt-5 flex flex-wrap gap-2 text-base">
            <span className="rounded-full px-3 py-1" style={{ border: "2px solid #4a3421", transform: "rotate(-1deg)" }}>
              ★ {card.stars.toLocaleString()} stars
            </span>
            <span className="rounded-full px-3 py-1" style={{ border: "2px solid #4a3421", transform: "rotate(1deg)" }}>
              ♥ {card.contributors.toLocaleString()} humans
            </span>
            {card.language && (
              <span className="rounded-full px-3 py-1" style={{ border: "2px solid #4a3421" }}>
                speaks {card.language}
              </span>
            )}
            <span className="rounded-full px-3 py-1" style={{ border: "2px solid #4a3421", transform: "rotate(-1deg)" }}>
              last seen {timeAgo(card.pushedAt)}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-7 flex flex-col gap-3">
          <ShareCardButton
            title={`${card.name} — a Curipo agent card`}
            text={card.description}
            className="w-full py-3 text-xl transition hover:-translate-y-0.5"
            // hand-drawn button
          />
          <a
            href={card.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 text-center text-xl transition hover:-translate-y-0.5"
            style={{
              border: "3px solid #4a3421",
              borderRadius: "225px 15px 255px 15px / 15px 255px 15px 225px",
              background: "#fff",
            }}
          >
            visit on GitHub →
          </a>
          {card.homepage && (
            <a
              href={card.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 text-center text-xl transition hover:-translate-y-0.5"
              style={{
                border: "3px solid #4a3421",
                borderRadius: "15px 225px 15px 255px / 255px 15px 225px 15px",
                background: "#fff",
              }}
            >
              visit their home →
            </a>
          )}
        </div>

        <p className="mt-6 text-center text-lg opacity-60">
          made with curipo — collect agents worth remembering
        </p>
      </div>
    </main>
  );
}
