/*
Html helpers for feideAuthProvider
*/

interface FormInput {
  name: string;
  value: string;
  type: string;
}

interface ParsedForm {
  action: string;
  method: "GET" | "POST";
  inputs: FormInput[];
}

function decodeHtmlEntities(value: string): string {
  if (!value.includes("&")) return value;
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&nbsp;/g, "\u00A0");
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw)) !== null) {
    attrs[m[1].toLowerCase()] = decodeHtmlEntities(m[3] ?? m[4] ?? m[5] ?? "");
  }
  return attrs;
}

function parseForms(html: string): ParsedForm[] {
  const forms: ParsedForm[] = [];
  const formRe = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  const inputRe = /<input\b([^>]*?)\/?>/gi;

  let formMatch: RegExpExecArray | null;
  while ((formMatch = formRe.exec(html)) !== null) {
    const attrs = parseAttrs(formMatch[1]);
    const body = formMatch[2];
    const inputs: FormInput[] = [];

    inputRe.lastIndex = 0;
    let inputMatch: RegExpExecArray | null;
    while ((inputMatch = inputRe.exec(body)) !== null) {
      const iattrs = parseAttrs(inputMatch[1]);
      const name = iattrs["name"] ?? "";
      if (!name) continue;
      inputs.push({
        name,
        value: iattrs["value"] ?? "",
        type: (iattrs["type"] ?? "text").toLowerCase(),
      });
    }

    forms.push({
      action: attrs["action"] ?? "",
      method: (attrs["method"] ?? "GET").toUpperCase() === "POST" ? "POST" : "GET",
      inputs,
    });
  }

  return forms;
}

function selectForm(
  html: string,
  usernameFields: Set<string>,
  passwordFields: Set<string>
): ParsedForm | null {
  const forms = parseForms(html);
  if (forms.length === 0) return null;

  // Prefer a combined login form, then a SAML response form, then any
  // password form, then whatever the first form on the page is.
  for (const form of forms) {
    const names = form.inputs.map((i) => i.name.toLowerCase());
    const hasUsername = names.some((n) => usernameFields.has(n));
    const hasPassword = names.some((n) => passwordFields.has(n));
    if (hasUsername && hasPassword) return form;
  }
  for (const form of forms) {
    if (form.inputs.some((i) => i.name.toLowerCase() === "samlresponse")) return form;
  }
  for (const form of forms) {
    if (form.inputs.some((i) => passwordFields.has(i.name.toLowerCase()))) return form;
  }
  return forms[0];
}

function responseHasPasswordForm(html: string, passwordFields: Set<string>): boolean {
  return parseForms(html).some((f) =>
    f.inputs.some((i) => passwordFields.has(i.name.toLowerCase()))
  );
}


function extractHtmlRedirect(html: string): string | null {
  if (!html) return null;

  const metaMatch = html.match(
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\s*\d+\s*;\s*url=([^"'>]+)["']?/i
  );
  if (metaMatch) return metaMatch[1].trim();

  const jsPatterns = [
    /location\.href\s*=\s*['"]([^'"]+)['"]/i,
    /location\.assign\(\s*['"]([^'"]+)['"]\s*\)/i,
    /location\.replace\(\s*['"]([^'"]+)['"]\s*\)/i,
    /window\.location\s*=\s*['"]([^'"]+)['"]/i,
    /document\.location\s*=\s*['"]([^'"]+)['"]/i,
  ];
  for (const pattern of jsPatterns) {
    const m = html.match(pattern);
    if (m) return m[1].trim();
  }
  return null;
}

function extractErrorMessage(html: string): string | null {
  if (!html) return null;

  const patterns = [
    /id=["']error-info["'][^>]*>([\s\S]*?)<\//i,
    /class=["']error["'][^>]*>([\s\S]*?)<\//i,
    /class=["']alert[^"']*["'][^>]*>([\s\S]*?)<\//i,
  ];
  const candidates: string[] = [];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m) candidates.push(m[1]);
  }
  if (candidates.length === 0) return null;

  const text = candidates
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

export { ParsedForm, selectForm, responseHasPasswordForm, extractHtmlRedirect, extractErrorMessage };