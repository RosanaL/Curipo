// Fetch a GitHub repo and turn it into agent card data.
// Uses only public REST endpoints; set GITHUB_TOKEN to raise rate limits.

export interface RepoCard {
  owner: string;
  repo: string;
  name: string;
  description: string;
  avatarUrl?: string; // logo/mascot from the README; undefined → placeholder
  homepage?: string;
  githubUrl: string;
  language?: string;
  languages: string[];
  stars: number;
  forks: number;
  contributors: number;
  topics: string[];
  license?: string;
  createdAt: string;
  pushedAt: string;
  stats: { label: string; value: number }[];
  overall: number;
  vibe: string;
}

const API = "https://api.github.com";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "curipo-card-maker",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

// Count contributors via the Link pagination header (1 cheap request).
async function contributorCount(owner: string, repo: string): Promise<number> {
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
    { headers: headers(), next: { revalidate: 3600 } }
  );
  if (!res.ok) return 1;
  const link = res.headers.get("link");
  const match = link?.match(/&page=(\d+)>; rel="last"/);
  if (match) return parseInt(match[1], 10);
  const body = (await res.json()) as unknown[];
  return Array.isArray(body) ? Math.max(body.length, 1) : 1;
}

// Badge / shield image hosts we never want as an avatar.
const BADGE_PATTERN =
  /shields\.io|badgen|trendshift|codecov|circleci|travis-ci|snyk\.io|fossa|visitor|forthebadge|deepsource|codacy|coveralls|herokucdn|vercel\.com\/button|\/badge|badge\.svg|buymeacoffee|ko-fi|patreon/i;

function resolveReadmeImage(src: string, owner: string, repo: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  const clean = src.replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${clean}`;
}

// Pull the first non-badge image out of the repo README (its logo/mascot).
async function fetchReadmeImage(owner: string, repo: string): Promise<string | null> {
  const readme = await gh<{ download_url: string | null }>(`/repos/${owner}/${repo}/readme`);
  if (!readme?.download_url) return null;

  const res = await fetch(readme.download_url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const md = await res.text();

  // Scan HTML <img src> and markdown ![](url) in document order.
  const regex = /<img[^>]+src=["']([^"']+)["']|!\[[^\]]*\]\(\s*<?([^)\s>]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(md)) !== null) {
    const src = match[1] || match[2];
    if (!src || BADGE_PATTERN.test(src)) continue;
    return resolveReadmeImage(src, owner, repo);
  }
  return null;
}

function clamp(value: number, min = 30, max = 99) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function logScale(value: number, ceiling: number) {
  // 0 → 0, ceiling → ~99 on a log curve so small repos still score okay
  return (Math.log10(value + 1) / Math.log10(ceiling + 1)) * 99;
}

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

const VIBES: Record<string, string> = {
  Charm: "Everyone's favorite neighbor",
  Hustle: "Up early, still going",
  Crew: "Better with friends",
  Craft: "Sharpened over time",
  Care: "Reads the manual twice",
};

interface RepoResponse {
  name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  license?: { spdx_id?: string | null } | null;
  created_at: string;
  pushed_at: string;
  owner: { login: string; avatar_url: string };
}

export async function fetchRepoCard(owner: string, repo: string): Promise<RepoCard | null> {
  const data = await gh<RepoResponse>(`/repos/${owner}/${repo}`);
  if (!data) return null;

  const [langs, contributors, readmeImage] = await Promise.all([
    gh<Record<string, number>>(`/repos/${owner}/${repo}/languages`),
    contributorCount(owner, repo),
    fetchReadmeImage(owner, repo),
  ]);

  const languages = Object.keys(langs || {});
  const ageDays = daysSince(data.created_at);
  const quietDays = daysSince(data.pushed_at);

  // Real signals, friendly names.
  const charm = clamp(logScale(data.stargazers_count, 50_000)); // stars
  const hustle = clamp(99 - Math.min(quietDays, 365) * 0.19); // recency of last push
  const crew = clamp(logScale(contributors, 500) + 20); // people involved
  const craft = clamp(
    languages.length * 9 + Math.min(ageDays / 365, 5) * 8 + logScale(data.forks_count, 5_000) * 0.4
  );
  const care = clamp(
    18 +
      (data.description ? 22 : 0) +
      (data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? 20 : 0) +
      (data.homepage ? 20 : 0) +
      ((data.topics?.length || 0) > 0 ? 19 : 0)
  );

  const stats = [
    { label: "Charm", value: charm },
    { label: "Hustle", value: hustle },
    { label: "Crew", value: crew },
    { label: "Craft", value: craft },
    { label: "Care", value: care },
  ];

  const overall = clamp(
    charm * 0.3 + hustle * 0.2 + crew * 0.15 + craft * 0.2 + care * 0.15,
    35
  );
  const best = stats.reduce((a, b) => (b.value > a.value ? b : a));

  return {
    owner: data.owner.login,
    repo: data.name,
    name: data.name,
    description: data.description || "A quiet little project with no description yet.",
    avatarUrl: readmeImage || undefined,
    homepage: data.homepage || undefined,
    githubUrl: data.html_url,
    language: data.language || undefined,
    languages,
    stars: data.stargazers_count,
    forks: data.forks_count,
    contributors,
    topics: data.topics || [],
    license: data.license?.spdx_id || undefined,
    createdAt: data.created_at,
    pushedAt: data.pushed_at,
    stats,
    overall,
    vibe: VIBES[best.label],
  };
}

// Accepts "owner/repo", full github.com URLs, or URLs with extra path segments.
export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  const urlMatch = trimmed.match(
    /github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#]|$)/
  );
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  const shorthand = trimmed.match(/^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/);
  if (shorthand) return { owner: shorthand[1], repo: shorthand[2] };

  return null;
}
