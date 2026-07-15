#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_SOURCES = path.join(ROOT, "data/agent-scrape/sources.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "data/agent-scrape/out");
const USER_AGENT = "CuripoAgentDiscovery/0.1 (+https://curipo.ai; discovery research)";

const AGENT_SIGNALS = [
  ["agent", /\b(ai\s+)?agent(s)?\b/i],
  ["assistant", /\bassistant\b/i],
  ["copilot", /\bcopilot\b/i],
  ["teammate", /\bteammate\b/i],
  ["operator", /\boperator\b/i],
  ["automates", /\bautomates?\b/i],
  ["handles", /\bhandles?\b/i],
  ["manages", /\bmanages?\b/i],
  ["monitors", /\bmonitors?\b/i],
  ["researches", /\bresearches?\b/i],
  ["drafts", /\bdrafts?\b/i],
  ["books", /\bbooks?\b/i],
  ["summarizes", /\bsummarizes?\b/i],
  ["on your behalf", /\bon your behalf\b/i],
];

const CARD_SIGNALS = [
  ["clear audience", /\bfor\s+(founders|sales|recruiters|lawyers|students|creators|engineers|marketers|support|teams)\b/i],
  ["built for", /\bbuilt for\b/i],
  ["best for", /\bbest for\b/i],
  ["ideal for", /\bideal for\b/i],
  ["helps", /\bhelps?\b/i],
  ["turns", /\bturns?\b/i],
  ["finds", /\bfinds?\b/i],
  ["plans", /\bplans?\b/i],
  ["reviews", /\breviews?\b/i],
  ["use case", /\buse case\b/i],
];

const EXCLUSION_SIGNALS = [
  ["marketplace", /\bmarketplace\b/i],
  ["directory", /\bdirectory\b/i],
  ["social network", /\bsocial network\b/i],
  ["community", /\bcommunity\b/i],
  ["api", /\bapi\b/i],
  ["sdk", /\bsdk\b/i],
  ["framework", /\bframework\b/i],
  ["infrastructure", /\binfrastructure\b/i],
  ["database", /\bdatabase\b/i],
  ["casino", /\bcasino\b/i],
  ["betting", /\bbetting\b/i],
  ["adult", /\badult\b/i],
  ["nsfw", /\bnsfw\b/i],
  ["crypto pump", /\bcrypto pump\b/i],
];

const SKIP_HOSTS = new Set([
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "youtube.com",
]);

function parseArgs(argv) {
  const args = {
    sources: DEFAULT_SOURCES,
    outDir: DEFAULT_OUT_DIR,
    limit: 80,
    maxLinksPerSource: 80,
    delayMs: 350,
    sourceId: undefined,
    includeRejected: true,
  };

  for (const arg of argv) {
    if (arg.startsWith("--sources=")) args.sources = path.resolve(arg.slice("--sources=".length));
    else if (arg.startsWith("--out=")) args.outDir = path.resolve(arg.slice("--out=".length));
    else if (arg.startsWith("--limit=")) args.limit = Number(arg.slice("--limit=".length));
    else if (arg.startsWith("--max-links-per-source=")) {
      args.maxLinksPerSource = Number(arg.slice("--max-links-per-source=".length));
    } else if (arg.startsWith("--delay-ms=")) args.delayMs = Number(arg.slice("--delay-ms=".length));
    else if (arg.startsWith("--source=")) args.sourceId = arg.slice("--source=".length);
    else if (arg === "--no-rejected") args.includeRejected = false;
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Curipo agent discovery

Usage:
  npm run agents:discover -- --limit=50

Options:
  --sources=PATH              JSON source list. Default: data/agent-scrape/sources.json
  --out=DIR                   Output directory. Default: data/agent-scrape/out
  --source=ID                 Run one source from sources.json
  --limit=N                   Max candidate pages to fetch. Default: 80
  --max-links-per-source=N    Max links pulled from each listing page. Default: 80
  --delay-ms=N                Polite delay between candidate fetches. Default: 350
  --no-rejected               Do not write rejected JSONL
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sources = JSON.parse(await readFile(args.sources, "utf8"));
  const selectedSources = args.sourceId
    ? sources.filter((source) => source.id === args.sourceId)
    : sources;

  if (selectedSources.length === 0) {
    throw new Error(`No sources matched ${args.sourceId}`);
  }

  await mkdir(args.outDir, { recursive: true });

  const discoveredAt = new Date().toISOString();
  const listingResults = [];
  const seenUrls = new Set();
  const candidateLinks = [];

  for (const source of selectedSources) {
    console.log(`Fetching source: ${source.name}`);
    const listing = await fetchPage(source.url);
    const links = extractLinks(listing.html, source)
      .slice(0, args.maxLinksPerSource)
      .filter((link) => {
        if (seenUrls.has(link.url)) return false;
        seenUrls.add(link.url);
        return true;
      });

    listingResults.push({
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      fetchedAt: discoveredAt,
      status: listing.status,
      meta: listing.meta,
      linkCount: links.length,
      error: listing.error,
    });

    candidateLinks.push(...links.map((link) => ({ ...link, sourceId: source.id, sourceName: source.name })));
  }

  const limitedLinks = candidateLinks.slice(0, args.limit);
  const raw = [];
  const candidates = [];
  const rejected = [];

  for (const [index, link] of limitedLinks.entries()) {
    console.log(`Inspecting ${index + 1}/${limitedLinks.length}: ${link.url}`);
    const page = await fetchPage(link.url);
    const candidate = buildCandidate(link, page, discoveredAt);
    raw.push(candidate.raw);

    if (candidate.accepted) candidates.push(candidate.record);
    else if (args.includeRejected) rejected.push(candidate.record);

    await sleep(args.delayMs);
  }

  const stamp = discoveredAt.replace(/[:.]/g, "-");
  const summary = {
    generatedAt: discoveredAt,
    sourceCount: selectedSources.length,
    discoveredLinks: candidateLinks.length,
    inspectedLinks: limitedLinks.length,
    candidateCount: candidates.length,
    rejectedCount: rejected.length,
    outputs: {
      raw: `agents.raw.${stamp}.jsonl`,
      candidates: `agents.candidates.${stamp}.jsonl`,
      rejected: args.includeRejected ? `agents.rejected.${stamp}.jsonl` : null,
      latestCandidates: "agents.candidates.latest.jsonl",
    },
    sources: listingResults,
  };

  await writeJsonl(path.join(args.outDir, summary.outputs.raw), raw);
  await writeJsonl(path.join(args.outDir, summary.outputs.candidates), candidates);
  await writeJsonl(path.join(args.outDir, "agents.candidates.latest.jsonl"), candidates);
  if (args.includeRejected) {
    await writeJsonl(path.join(args.outDir, summary.outputs.rejected), rejected);
  }
  await writeFile(path.join(args.outDir, `summary.${stamp}.json`), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(args.outDir, "summary.latest.json"), `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`Done. Candidates: ${candidates.length}. Rejected: ${rejected.length}.`);
  console.log(`Latest candidates: ${path.relative(ROOT, path.join(args.outDir, "agents.candidates.latest.jsonl"))}`);
}

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return {
        url,
        finalUrl: response.url,
        status: response.status,
        html: "",
        text: "",
        meta: {},
        error: `Skipped non-HTML content: ${contentType}`,
      };
    }

    const html = await response.text();
    return {
      url,
      finalUrl: response.url,
      status: response.status,
      html,
      text: htmlToText(html),
      meta: extractMeta(html, response.url),
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      status: 0,
      html: "",
      text: "",
      meta: {},
      error: String(error?.message || error),
    };
  }
}

function extractLinks(html, source) {
  const sourceUrl = new URL(source.url);
  const links = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRegex.exec(html))) {
    const href = decodeHtml(match[1].trim());
    const label = cleanText(htmlToText(match[2]));
    const url = resolveUrl(href, source.url);
    if (!url || !label || shouldSkipLink(url, label, source)) continue;

    const target = new URL(url);
    const sameDomain = target.hostname === sourceUrl.hostname;
    if (sameDomain && !source.includeSameDomain) continue;
    if (!sameDomain && !source.includeExternal) continue;
    if (sameDomain && Array.isArray(source.sameDomainPathPrefixes) && source.sameDomainPathPrefixes.length > 0) {
      if (!source.sameDomainPathPrefixes.some((prefix) => target.pathname.startsWith(prefix))) continue;
    }

    links.push({
      url,
      label,
      sourceUrl: source.url,
      sameDomain,
    });
  }

  return dedupeLinks(links);
}

function shouldSkipLink(url, label, source) {
  const target = new URL(url);
  const sourceUrl = new URL(source.url);
  const host = target.hostname.replace(/^www\./, "");
  const lowerLabel = label.toLowerCase();
  const lowerPath = `${target.pathname} ${target.search}`.toLowerCase();

  if (!["http:", "https:"].includes(target.protocol)) return true;
  if ([...SKIP_HOSTS].some((skipHost) => host === skipHost || host.endsWith(`.${skipHost}`))) return true;
  if (label.length < 2 || label.length > 90) return true;
  if (/^(home|login|signup|sign up|join for free|privacy|terms|contact|about us|newsletter|newsletter archive|resources|blog|pricing)$/i.test(label)) {
    return true;
  }
  if (/^(ai tools|ai agents|ai innovations|ai tutorials|ai automations 101|all ai tools|new ai tools|free ai tools|top 100 ai tools)$/i.test(label)) {
    return true;
  }
  if (/^(#|image:|rated|visit|get deal|add bookmark|free|freemium|paid)$/i.test(lowerLabel)) return true;
  if (lowerPath.includes("/privacy") || lowerPath.includes("/terms") || lowerPath.includes("/login")) return true;
  if (lowerPath.includes("/category") || lowerPath.includes("/tag/")) return true;
  if (target.hostname === sourceUrl.hostname && target.pathname === sourceUrl.pathname) return true;
  if (target.hostname === sourceUrl.hostname && target.pathname === "/ai-tools") return true;
  return false;
}

function dedupeLinks(links) {
  const seen = new Set();
  const result = [];
  for (const link of links) {
    const normalized = normalizeUrl(link.url);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push({ ...link, url: normalized });
  }
  return result;
}

function buildCandidate(link, page, discoveredAt) {
  const meta = page.meta || {};
  const name = pickName(meta, link);
  const description = cleanText(meta.ogDescription || meta.description || firstSentence(page.text));
  const combined = cleanText([name, link.label, description, page.text.slice(0, 4000)].join(" "));
  const agentSignals = matchSignals(combined, AGENT_SIGNALS);
  const cardSignals = matchSignals(combined, CARD_SIGNALS);
  const exclusionSignals = matchSignals(combined, EXCLUSION_SIGNALS);
  const linkPreview = {
    hasTitle: Boolean(meta.ogTitle || meta.title),
    hasDescription: Boolean(meta.ogDescription || meta.description),
    hasImage: Boolean(meta.ogImage || meta.twitterImage),
    hasCanonical: Boolean(meta.canonicalUrl),
  };
  const rejectionReason = getRejectionReason({ page, name, description, agentSignals, exclusionSignals });

  const raw = {
    discoveredAt,
    sourceId: link.sourceId,
    sourceName: link.sourceName,
    sourceUrl: link.sourceUrl,
    directoryLabel: link.label,
    url: page.finalUrl || link.url,
    requestedUrl: link.url,
    status: page.status,
    error: page.error,
    meta,
    textSample: page.text.slice(0, 2000),
  };

  const record = {
    discoveredAt,
    sourceId: link.sourceId,
    sourceName: link.sourceName,
    name,
    url: page.finalUrl || link.url,
    sourceUrl: link.sourceUrl,
    directoryLabel: link.label,
    tagline: description,
    imageUrl: meta.ogImage || meta.twitterImage || null,
    signals: {
      agent: agentSignals,
      card: cardSignals,
      exclusion: exclusionSignals,
      linkPreview,
    },
    status: rejectionReason ? "rejected" : "needs_review",
    rejectionReason,
    rawTextSample: page.text.slice(0, 1200),
  };

  return {
    accepted: !rejectionReason,
    raw,
    record,
  };
}

function getRejectionReason({ page, name, description, agentSignals, exclusionSignals }) {
  if (page.error) return "fetch_failed";
  if (page.status < 200 || page.status >= 400) return "bad_status";
  if (!name || !description || description.length < 30) return "insufficient_public_info";
  if (agentSignals.length === 0) return "missing_agent_signal";
  if (exclusionSignals.length > 0 && agentSignals.length < 2) return "platform_or_directory_signal";
  if (exclusionSignals.some((signal) => /\b(adult|nsfw|casino|betting|crypto pump)\b/i.test(signal))) {
    return "unsafe_or_spam_signal";
  }
  return null;
}

function pickName(meta, link) {
  const title = cleanTitle(meta.ogTitle || meta.title || "");
  const label = cleanTitle(link.label || "");
  if (label && title.includes("Reviews: Use Cases")) return label.slice(0, 80);
  if (title && title.length <= 80) return title;
  return label.slice(0, 80);
}

function cleanTitle(value) {
  return cleanText(value)
    .replace(/\s+AI\s+Reviews: Use Cases, Pricing & Alternatives$/i, "")
    .replace(/\s+Reviews: Use Cases, Pricing & Alternatives$/i, "")
    .replace(/\s+[|\-–—]\s+(AI Tools?.*|Futurepedia.*|AITopTools.*|Agent\.ai.*)$/i, "")
    .replace(/\s+-\s+.*Directory$/i, "")
    .trim();
}

function extractMeta(html, baseUrl) {
  const meta = {};
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) meta.title = decodeHtml(cleanText(titleMatch[1]));

  const tagRegex = /<meta\b([^>]+)>/gi;
  let match;
  while ((match = tagRegex.exec(html))) {
    const attrs = parseAttrs(match[1]);
    const key = (attrs.property || attrs.name || "").toLowerCase();
    const content = decodeHtml(attrs.content || "").trim();
    if (!key || !content) continue;
    if (key === "description") meta.description = content;
    if (key === "og:title") meta.ogTitle = content;
    if (key === "og:description") meta.ogDescription = content;
    if (key === "og:image") meta.ogImage = resolveUrl(content, baseUrl);
    if (key === "twitter:image") meta.twitterImage = resolveUrl(content, baseUrl);
  }

  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (canonical) meta.canonicalUrl = resolveUrl(decodeHtml(canonical[1]), baseUrl);
  return meta;
}

function parseAttrs(value) {
  const attrs = {};
  const attrRegex = /([^\s=]+)=["']([^"']*)["']/g;
  let match;
  while ((match = attrRegex.exec(value))) attrs[match[1].toLowerCase()] = match[2];
  return attrs;
}

function htmlToText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function firstSentence(text) {
  const cleaned = cleanText(text);
  const match = cleaned.match(/^(.{40,240}?[.!?])\s/);
  return match ? match[1] : cleaned.slice(0, 240);
}

function matchSignals(text, patterns) {
  return patterns
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  const target = new URL(url);
  target.hash = "";
  if (target.pathname !== "/") target.pathname = target.pathname.replace(/\/$/, "");
  for (const key of [...target.searchParams.keys()]) {
    if (/^(utm_|ref|source|fbclid|gclid)/i.test(key)) target.searchParams.delete(key);
  }
  return target.toString();
}

async function writeJsonl(filePath, records) {
  await writeFile(filePath, records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
