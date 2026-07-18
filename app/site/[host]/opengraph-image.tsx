import { ImageResponse } from "next/og";
import { fetchSiteCard, hostColorIndex } from "@/lib/site-card";

export const alt = "Curipo agent card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const palettes = [
  { frame: "#d99a1c", tint: "#fdf1d6", ink: "#8a5e0c", badge: "#f0c14b" },
  { frame: "#cf6a52", tint: "#fbe6df", ink: "#8f4131", badge: "#e79079" },
  { frame: "#3f9591", tint: "#d9efed", ink: "#2c6a67", badge: "#68b8b3" },
  { frame: "#7a9f52", tint: "#e7f0d9", ink: "#556f38", badge: "#a3c274" },
  { frame: "#6f8fb0", tint: "#e3ecf4", ink: "#456180", badge: "#9bb6d2" },
];

export default async function Image({
  params,
}: {
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;
  const card = await fetchSiteCard(host);

  const name = card?.name || host;
  const tagline = card?.tagline || "";
  const description = card?.description || "";
  const p = palettes[hostColorIndex(host)];

  // Satori can't render video or (reliably) remote SVG — use raster or a letter.
  const image = card?.imageUrl && !/\.svg(\?|$)/i.test(card.imageUrl) ? card.imageUrl : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: p.tint,
          padding: 48,
          fontFamily: "sans-serif",
          color: "#4a3421",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            border: `6px solid ${p.frame}`,
            borderTopLeftRadius: 64,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 56,
            borderBottomLeftRadius: 20,
            boxShadow: "10px 12px 0 rgba(74,52,33,0.15)",
            padding: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                width={130}
                height={130}
                style={{ borderRadius: 28, border: `5px solid ${p.frame}`, background: "#fff", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: 130,
                  height: 130,
                  borderRadius: 28,
                  border: `5px solid ${p.frame}`,
                  background: p.badge,
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 68,
                  fontWeight: 700,
                }}
              >
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 32 }}>
              <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1 }}>{name}</div>
              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  padding: "2px 18px",
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  background: p.tint,
                  border: `2px solid ${p.frame}`,
                  color: p.ink,
                  fontSize: 24,
                }}
              >
                {host}
              </div>
            </div>
          </div>

          {tagline ? (
            <div style={{ display: "flex", fontSize: 40, color: p.ink, marginTop: 40 }}>
              {tagline.length > 70 ? `${tagline.slice(0, 70)}…` : tagline}
            </div>
          ) : null}

          {description ? (
            <div style={{ display: "flex", fontSize: 30, opacity: 0.82, marginTop: 16, lineHeight: 1.4 }}>
              {description.length > 130 ? `${description.slice(0, 130)}…` : description}
            </div>
          ) : null}

          <div style={{ display: "flex", marginTop: "auto", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: 44,
                height: 44,
                background: p.badge,
                border: "3px solid #4a3421",
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              c
            </div>
            <div style={{ display: "flex", fontSize: 26, marginLeft: 14, opacity: 0.7 }}>
              curipo — collect agents worth remembering
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
