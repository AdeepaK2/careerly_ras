// Client-safe JWT utilities that don't require server-side secrets

// Lightweight client-safe parser to decode JWT payload without verification
// Do NOT use this to trust data; only for quick checks like expiry on client.
export function parseJwt<T = any>(
  token: string
): (T & { exp?: number }) | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    // handle UTF-8
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(
          json,
          (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
