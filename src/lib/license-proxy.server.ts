/** Server-only forwarding; the private API origin never reaches browser bundles. */
export async function proxyLicenseRequest(request: Request, environment: unknown) {
  const env = (environment && typeof environment === "object" ? environment : {}) as Record<
    string,
    unknown
  >;
  const configured =
    env["LICENSE_API_ORIGIN"] ||
    (typeof process !== "undefined" ? process.env["LICENSE_API_ORIGIN"] : undefined);
  if (typeof configured !== "string" || !configured)
    return Response.json(
      { error: "license-service-not-configured" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  try {
    const upstream = new URL(configured);
    if (!["http:", "https:"].includes(upstream.protocol) || upstream.username || upstream.password)
      throw new Error("Invalid license origin");
    if (
      upstream.protocol === "http:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(upstream.hostname)
    )
      throw new Error("HTTPS required");
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, upstream.origin);
    const headers = new Headers();
    for (const name of [
      "authorization",
      "content-type",
      "cookie",
      "origin",
      "x-csrf-token",
      "x-nexaflow-timestamp",
      "x-nexaflow-signature",
    ]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    let body = "";
    if (request.body && !["GET", "HEAD"].includes(request.method)) {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let size = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 16384) {
          await reader.cancel();
          return Response.json({ error: "request-too-large" }, { status: 413 });
        }
        body += decoder.decode(chunk.value, { stream: true });
      }
      body += decoder.decode();
    }
    const result = await fetch(target, {
      method: request.method,
      headers,
      ...(!["GET", "HEAD"].includes(request.method) ? { body } : {}),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const outputHeaders = new Headers({
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    const cookie = result.headers.get("set-cookie");
    if (cookie) outputHeaders.set("set-cookie", cookie);
    return new Response(result.body, { status: result.status, headers: outputHeaders });
  } catch {
    return Response.json(
      { error: "license-service-unavailable" },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
