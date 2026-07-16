import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Patrick_Hand } from "next/font/google";
import { fetchSiteCard, hostColorIndex } from "@/lib/site-card";
import { ShareCardButton } from "@/app/components/share-card-button";

const hand = Patrick_Hand({ weight: "400", subsets: ["latin"] });

// Same warm palette family as the repo card, but chosen by host (decorative,
// not a score) since a website has no stats to rank.
const palettes = [
  { frame: "#d99a1c", tint: "#fdf1d6", ink: "#8a5e0c" },
  { frame: "#cf6a52", tint: "#fbe6df", ink: "#8f4131" },
  { frame: "#3f9591", tint: "#d9efed", ink: "#2c6a67" },
  { frame: "#7a9f52", tint: "#e7f0d9", ink: "#556f38" },
  { frame: "#6f8fb0", tint: "#e3ecf4", ink: "#456180" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { host } = await params;
  const card = await fetchSiteCard(host);
  if (!card) return { title: "Card not found — Curipo" };

  const title = `${card.name} — a Curipo agent card`;
  const description = card.tagline || card.description || `Meet ${card.name}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", url: `/site/${host}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SiteCardPage({
  params,
}: {
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;
  const card = await fetchSiteCard(host);
  if (!card) notFound();

  const p = palettes[hostColorIndex(host)];

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
        <div className="mb-5 flex items-center justify-between text-lg">
          <Link href="/make" className="underline decoration-wavy underline-offset-4 hover:opacity-70">
            ← make another
          </Link>
          <span className="opacity-60">curipo card</span>
        </div>

        {/* ===== the card ===== */}
        <div
          className="relative mx-auto bg-white"
          style={{
            border: `5px solid ${p.frame}`,
            borderRadius: "24px",
            boxShadow: `0 0 0 3px #fff, 6px 9px 0 rgba(74,52,33,0.18)`,
            padding: 14,
          }}
        >
          {/* top ribbon */}
          <div className="flex items-center justify-between px-1 pb-2">
            <span
              className="rounded-full px-3 py-0.5 text-base lowercase"
              style={{ background: p.tint, color: p.ink, border: `2px solid ${p.frame}` }}
            >
              the web
            </span>
            <span className="text-base opacity-60">{card.host}</span>
          </div>

          {/* portrait — animation (like main), else image, else initial */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              height: 220,
              borderRadius: "16px",
              background: `radial-gradient(circle at 50% 35%, #ffffff, ${p.tint})`,
              border: `3px solid ${p.frame}`,
            }}
          >
            {card.animationUrl ? (
              <video
                aria-label={`${card.name} animation`}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="max-h-[92%] max-w-[92%] object-contain"
              >
                <source
                  src={card.animationUrl}
                  type={card.animationUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"}
                />
              </video>
            ) : card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt={`${card.name} logo`}
                className="max-h-[80%] max-w-[80%] object-contain"
              />
            ) : (
              <div className="text-8xl" style={{ color: p.ink }}>
                {card.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* name */}
          <div className="mt-3 px-1 text-center">
            <h1 className="truncate text-4xl leading-tight">{card.name}</h1>
            {card.tagline && (
              <p className="mt-1 text-xl" style={{ color: p.ink }}>
                ✦ {card.tagline}
              </p>
            )}
          </div>

          {card.description && (
            <p className="mt-2 px-1 text-center text-base leading-5 opacity-80">{card.description}</p>
          )}
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-col gap-3">
          <ShareCardButton
            title={`${card.name} — a Curipo agent card`}
            text={card.tagline || card.description}
            className="w-full py-3 text-xl transition hover:-translate-y-0.5"
          />
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 text-center text-xl transition hover:-translate-y-0.5"
            style={{
              border: "3px solid #4a3421",
              borderRadius: "225px 15px 255px 15px / 15px 255px 15px 225px",
              background: "#fff",
            }}
          >
            visit their home →
          </a>
        </div>

        <p className="mt-6 text-center text-lg opacity-60">
          made with curipo — collect agents worth remembering
        </p>
      </div>
    </main>
  );
}
