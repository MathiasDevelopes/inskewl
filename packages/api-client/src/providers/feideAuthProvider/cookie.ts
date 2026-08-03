interface StoredCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expiresAt: number | null;
}

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

class CookieJar {
  private cookies = new Map<string, StoredCookie>();

  applyFromResponse(response: Response, requestUrl: string): void {
    const defaultHost = new URL(requestUrl).hostname.toLowerCase();
    for (const raw of getSetCookieHeaders(response)) {
      const cookie = this.parse(raw, defaultHost);
      if (!cookie) continue;
      const key = `${cookie.domain}|${cookie.path}|${cookie.name}`;
      if (cookie.expiresAt !== null && cookie.expiresAt <= Date.now()) {
        this.cookies.delete(key);
      } else {
        this.cookies.set(key, cookie);
      }
    }
  }

  header(url: string): string {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname || "/";
    const now = Date.now();
    const parts: string[] = [];
    for (const cookie of this.cookies.values()) {
      if (cookie.expiresAt !== null && cookie.expiresAt <= now) continue;
      if (host !== cookie.domain && !host.endsWith(`.${cookie.domain}`)) continue;
      if (cookie.path !== "/" && !path.startsWith(cookie.path)) continue;
      parts.push(`${cookie.name}=${cookie.value}`);
    }
    return parts.join("; ");
  }

  private parse(raw: string, defaultHost: string): StoredCookie | null {
    const [nameValue, ...attrParts] = raw.split(";").map((p) => p.trim());
    const eq = nameValue.indexOf("=");
    if (eq === -1) return null;

    const name = nameValue.slice(0, eq).trim();
    const value = nameValue.slice(eq + 1).trim();
    let domain = defaultHost;
    let path = "/";
    let expiresAt: number | null = null;

    for (const attr of attrParts) {
      const eqIdx = attr.indexOf("=");
      const key = (eqIdx === -1 ? attr : attr.slice(0, eqIdx)).trim().toLowerCase();
      const val = eqIdx === -1 ? "" : attr.slice(eqIdx + 1).trim();
      if (key === "domain" && val) domain = val.replace(/^\./, "").toLowerCase();
      else if (key === "path" && val) path = val;
      else if (key === "max-age" && val) {
        const seconds = Number(val);
        if (!Number.isNaN(seconds)) expiresAt = Date.now() + seconds * 1000;
      } else if (key === "expires" && val && expiresAt === null) {
        const t = Date.parse(val);
        if (!Number.isNaN(t)) expiresAt = t;
      }
    }

    return { name, value, domain, path, expiresAt };
  }
}

function cookieNames(cookieHeader: string): string[] {
  return cookieHeader ? cookieHeader.split("; ").map((c) => c.split("=")[0]) : [];
}

export { CookieJar, StoredCookie, getSetCookieHeaders, cookieNames };