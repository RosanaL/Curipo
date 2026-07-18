// Turn a plain website URL into agent card data from its OG/meta tags.
// No GitHub stats here — a product site is an identity card, not a stat card.

export interface SiteCard {
  host: string;
  url: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl?: string;      // og:image / favicon (still image)
  animationUrl?: string;  // local animation mapped by host
}

// Animations you've made, keyed by host. Same idea as main's name→file map.
const SITE_ANIMATIONS: Record<string, string> = {
  "okara.ai": "/agents/okara.webm",
};

export function parseSiteInput(input: string): string | null {
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    return u.host.toLowerCase();
  } catch {
    return null;
  }
}

function pick(html: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

function resolve(src: string | undefined, host: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return `https://${host}/${src.replace(/^\//, "")}`;
}

export async function fetchSiteCard(host: string): Promise<SiteCard | null> {
  const url = `https://${host}`;
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "curipo-card-maker", Accept: "text/html" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    html = (await res.text()).slice(0, 120_000);
  } catch {
    return null;
  }

  const ogTitle = pick(html, [
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);
  const ogDescription = pick(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  ]);
  const ogImage = pick(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
  ]);

  // Split "Okara - The AI CMO" → name "Okara", tagline "The AI CMO".
  // Tagline only comes from the title's subtitle so it never duplicates the
  // description below it.
  const parts = (ogTitle || host).split(/\s*[|\-–—:]\s*/).map((p) => p.trim()).filter(Boolean);
  const name = parts[0] || host;
  const tagline = parts.slice(1).join(" · ");

  return {
    host,
    url,
    name,
    tagline,
    description: ogDescription || "",
    imageUrl: resolve(ogImage, host),
    animationUrl: SITE_ANIMATIONS[host],
  };
}

// Deterministic 0–4 index so each site gets a stable (decorative) color.
export function hostColorIndex(host: string): number {
  let h = 0;
  for (let i = 0; i < host.length; i++) h = (h * 31 + host.charCodeAt(i)) >>> 0;
  return h % 5;
}
