import { ImageResponse } from "next/og";
import { getAgentById } from "@/lib/supabase";

export const alt = "Curipo agent card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getRarity(rating?: number) {
  if ((rating || 0) >= 4.7) return { name: "Legendary", accent: "#f59e0b" };
  if ((rating || 0) >= 4.4) return { name: "Epic", accent: "#ef4444" };
  if ((rating || 0) >= 4.1) return { name: "Rare", accent: "#06b6d4" };
  return { name: "Skilled", accent: "#10b981" };
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(id);

  const name = agent?.name || "Curipo";
  const tagline = agent?.tagline || agent?.description || "Collect AI agents worth remembering and referring.";
  const rating = agent?.rating ?? 0;
  const price = agent?.price;
  const rarity = getRarity(rating);
  const full = Math.round(rating || 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f4f1e8",
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        {/* Card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            border: "6px solid #0f172a",
            boxShadow: `20px 20px 0 ${rarity.accent}`,
            padding: 52,
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 52,
                  height: 52,
                  background: "#c9f16c",
                  border: "3px solid #20380a",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#20380a",
                }}
              >
                C
              </div>
              <div
                style={{
                  marginLeft: 18,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 6,
                  color: "#0f172a",
                }}
              >
                CURIPO
              </div>
            </div>
            <div
              style={{
                display: "flex",
                border: "3px solid #0f172a",
                padding: "8px 18px",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 3,
                color: rarity.accent,
                textTransform: "uppercase",
              }}
            >
              {rarity.name}
            </div>
          </div>

          {/* Name */}
          <div
            style={{
              display: "flex",
              marginTop: 60,
              fontSize: 108,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {name}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 34,
              fontWeight: 600,
              color: "#475569",
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {tagline.length > 120 ? `${tagline.slice(0, 120)}…` : tagline}
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <svg
                  key={i}
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill={i < full ? "#f59e0b" : "#cbd5e1"}
                  style={{ marginRight: 6 }}
                >
                  <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" />
                </svg>
              ))}
              {rating ? (
                <span style={{ color: "#64748b", fontSize: 30, marginLeft: 14, fontWeight: 700 }}>
                  {rating.toFixed(1)}
                </span>
              ) : null}
            </div>
            {price ? (
              <div
                style={{
                  display: "flex",
                  border: "3px solid #0f172a",
                  padding: "10px 22px",
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#047857",
                }}
              >
                {price}
              </div>
            ) : (
              <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#94a3b8", letterSpacing: 2 }}>
                AGENT CARD
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
