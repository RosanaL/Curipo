const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const mediaUrl = requestUrl.searchParams.get("url");

  if (!mediaUrl) {
    return Response.json({ error: "Missing media URL" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(mediaUrl);
  } catch {
    return Response.json({ error: "Invalid media URL" }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    return Response.json({ error: "Unsupported media URL" }, { status: 400 });
  }

  const upstream = await fetch(parsedUrl, {
    headers: {
      Accept: "*/*",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Failed to fetch media" }, { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
    },
  });
}
