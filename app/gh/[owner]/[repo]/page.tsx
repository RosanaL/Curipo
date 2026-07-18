import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Patrick_Hand } from "next/font/google";
import { fetchRepoCard } from "@/lib/github";
import { ShareCardButton } from "@/app/components/share-card-button";

const hand = Patrick_Hand({ weight: "400", subsets: ["latin"] });

// Warm, cozy rarity tiers by overall score — not neon.
function getTier(overall: number) {
  if (overall >= 90)
    return { name: "Legendary", frame: "#d99a1c", tint: "#fdf1d6", ink: "#8a5e0c", badge: "#f0c14b" };
  if (overall >= 80)
    return { name: "Epic", frame: "#cf6a52", tint: "#fbe6df", ink: "#8f4131", badge: "#e79079" };
  if (overall >= 70)
    return { name: "Rare", frame: "#3f9591", tint: "#d9efed", ink: "#2c6a67", badge: "#68b8b3" };
  if (overall >= 60)
    return { name: "Solid", frame: "#7a9f52", tint: "#e7f0d9", ink: "#556f38", badge: "#a3c274" };
  return { name: "Rookie", frame: "#6f8fb0", tint: "#e3ecf4", ink: "#456180", badge: "#9bb6d2" };
}

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

  const tier = getTier(card.overall);

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
      <div className="mx-auto max-w-[380px]">
        {/* top nav */}
        <div className="mb-5 flex items-center justify-between text-lg">
          <Link href="/make" className="underline decoration-wavy underline-offset-4 hover:opacity-70">
            ← make another
          </Link>
          <span className="opacity-60">curipo card</span>
        </div>

        {/* ===== the trading card (portrait) ===== */}
        <div
          className="relative mx-auto bg-white"
          style={{
            border: `5px solid ${tier.frame}`,
            borderRadius: "24px",
            boxShadow: `0 0 0 3px #fff, 6px 9px 0 rgba(74,52,33,0.18)`,
            padding: 14,
          }}
        >
          {/* rarity ribbon */}
          <div className="flex items-center justify-between px-1 pb-2">
            <span
              className="rounded-full px-3 py-0.5 text-base uppercase tracking-wide"
              style={{ background: tier.tint, color: tier.ink, border: `2px solid ${tier.frame}` }}
            >
              {tier.name}
            </span>
            <div className="flex items-center gap-2">
              <div
                className="grid size-12 place-items-center rounded-full text-2xl"
                style={{ background: tier.badge, border: "3px solid #4a3421", transform: "rotate(3deg)" }}
              >
                {card.overall}
              </div>
            </div>
          </div>

          {/* portrait */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              height: 220,
              borderRadius: "16px",
              background: `radial-gradient(circle at 50% 35%, #ffffff, ${tier.tint})`,
              border: `3px solid ${tier.frame}`,
            }}
          >
            {card.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.avatarUrl}
                alt={`${card.name} logo`}
                className="max-h-[80%] max-w-[80%] object-contain"
              />
            ) : (
              <div className="text-8xl" style={{ color: tier.ink }}>
                {card.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            {/* language chip */}
            {card.language && (
              <span
                className="absolute bottom-2 right-2 rounded-full bg-white/90 px-3 py-0.5 text-sm"
                style={{ border: "2px solid #4a3421" }}
              >
                {card.language}
              </span>
            )}
          </div>

          {/* name + owner */}
          <div className="mt-3 px-1 text-center">
            <h1 className="truncate text-4xl leading-tight">{card.name}</h1>
            <p className="text-lg opacity-70">by {card.owner}</p>
            <p className="mt-1 text-xl" style={{ color: tier.ink }}>
              ✦ {card.vibe}
            </p>
          </div>

          {/* description */}
          <p className="mt-2 px-1 text-center text-base leading-5 opacity-80">{card.description}</p>

          <div className="my-3 border-t-2 border-dashed" style={{ borderColor: "#e2d3ba" }} />

          {/* stats */}
          <div className="space-y-2 px-1">
            {card.stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="w-14 text-base">{stat.label}</span>
                <div
                  className="h-3 flex-1 overflow-hidden rounded-full"
                  style={{ border: "2px solid #4a3421", background: "#faf3e8" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stat.value}%`, background: crayons[i % crayons.length] }}
                  />
                </div>
                <span className="w-7 text-right text-base">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* footer facts */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 px-1 text-sm">
            <span className="rounded-full px-2.5 py-0.5" style={{ border: "2px solid #4a3421" }}>
              ★ {card.stars.toLocaleString()}
            </span>
            <span className="rounded-full px-2.5 py-0.5" style={{ border: "2px solid #4a3421" }}>
              ♥ {card.contributors.toLocaleString()} humans
            </span>
            <span className="rounded-full px-2.5 py-0.5" style={{ border: "2px solid #4a3421" }}>
              seen {timeAgo(card.pushedAt)}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-col gap-3">
          <ShareCardButton
            title={`${card.name} — a Curipo agent card`}
            text={card.description}
            className="w-full py-3 text-xl transition hover:-translate-y-0.5"
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
