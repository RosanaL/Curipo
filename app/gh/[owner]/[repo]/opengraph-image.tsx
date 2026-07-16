import { ImageResponse } from "next/og";
import { fetchRepoCard } from "@/lib/github";

export const alt = "Curipo agent card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const crayons = ["#f4a261", "#8ab17d", "#7fb3d5", "#e8909c", "#eec170"];

export default async function Image({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const card = await fetchRepoCard(owner, repo);

  const name = card?.name || repo;
  const by = card?.owner || owner;
  const description = card?.description || "";
  const overall = card?.overall ?? 60;
  const vibe = card?.vibe || "Worth remembering";
  const stats = card?.stats || [];
  const avatar = card?.avatarUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#faf3e8",
          padding: 48,
          fontFamily: "sans-serif",
          color: "#4a3421",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            background: "#ffffff",
            border: "5px solid #4a3421",
            borderTopLeftRadius: 64,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 56,
            borderBottomLeftRadius: 20,
            boxShadow: "10px 12px 0 rgba(74,52,33,0.15)",
            padding: 52,
          }}
        >
          {/* left: identity */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1.2, paddingRight: 40 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  width={110}
                  height={110}
                  style={{
                    borderRadius: 999,
                    border: "5px solid #4a3421",
                    background: "#ffffff",
                    objectFit: "contain",
                    transform: "rotate(-3deg)",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: 110,
                    height: 110,
                    borderRadius: 999,
                    border: "5px solid #4a3421",
                    background: "#f6e2c4",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 56,
                    fontWeight: 700,
                    transform: "rotate(-3deg)",
                  }}
                >
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 28 }}>
                <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{name}</div>
                <div style={{ display: "flex", fontSize: 30, opacity: 0.65, marginTop: 8 }}>by {by}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#c96f4a" style={{ marginRight: 12 }}>
                <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
              </svg>
              <div style={{ display: "flex", fontSize: 32, color: "#c96f4a" }}>{vibe}</div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.4,
                opacity: 0.85,
                marginTop: 14,
              }}
            >
              {description.length > 110 ? `${description.slice(0, 110)}…` : description}
            </div>

            <div style={{ display: "flex", marginTop: "auto", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  background: "#f4a261",
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

          {/* right: overall + stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 360,
              borderLeft: "3px dashed #d8c6ac",
              paddingLeft: 40,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 120,
                  height: 120,
                  borderRadius: 999,
                  border: "5px solid #4a3421",
                  background: "#eec170",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  fontWeight: 900,
                  transform: "rotate(3deg)",
                }}
              >
                {overall}
              </div>
              <div style={{ display: "flex", fontSize: 28, marginLeft: 20, opacity: 0.7 }}>overall</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{ display: "flex", alignItems: "center", marginBottom: 18 }}
                >
                  <div style={{ display: "flex", width: 90, fontSize: 26 }}>{stat.label}</div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      height: 20,
                      border: "3px solid #4a3421",
                      borderRadius: 999,
                      background: "#faf3e8",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: `${stat.value}%`,
                        background: crayons[i % crayons.length],
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", width: 52, fontSize: 26, justifyContent: "flex-end" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
