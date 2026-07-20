/*
Feide login flow, for use with inschool api.
Uses a headless fetch-based client to follow redirects, submit forms, and maintain cookies.
The flow is designed to be robust against variations in the HTML of the login pages, and to handle common SSO patterns (e.g., identity-provider selection, SAML responses, etc.).
*/

import { AuthProvider } from "../../authProvider";
import { ParsedForm, selectForm, responseHasPasswordForm, extractHtmlRedirect, extractErrorMessage } from "./html";
import { CookieJar, getSetCookieHeaders, cookieNames } from "./cookie";

export interface InschoolAuthOptions {
  startUrl: string;
  username: string;
  password: string;
  /** Extra field overrides applied to every form submission (case-insensitive keys). */
  extraFields?: Record<string, string>;
  /** Field names (case-insensitive) treated as the username input. */
  usernameFields?: string[];
  /** Field names (case-insensitive) treated as the password input. */
  passwordFields?: string[];
  /** Safety cap on the number of form submissions / redirects followed. */
  maxSteps?: number;
  /** Per-request timeout, in ms. */
  timeoutMs?: number;
  userAgent?: string;
  /** Appended as `?idp=<value>` when a bare identity-provider picker page is hit. */
  identityProvider?: string;
  /** Optional hook, called before each step is processed — handy for debugging. */
  onStep?: (step: number, status: number, url: string) => void;
  /**
   * Logs every step, redirect hop, form match, and cookie sent/received to
   * the console (via `console.error`, prefixed `[inschool-auth]`). Cookie
   * *values* and the password are never logged — only names/lengths.
   */
  debug?: boolean;
}


const DEFAULT_USERNAME_FIELDS = ["feidename", "username", "user", "email", "login"];
const DEFAULT_PASSWORD_FIELDS = ["password", "passwd"];
const MAX_REDIRECTS_PER_REQUEST = 10;

function buildPayload(
  form: ParsedForm,
  username: string,
  password: string,
  extraFields: Record<string, string>,
  usernameFields: Set<string>,
  passwordFields: Set<string>
): Record<string, string> {
  const payload: Record<string, string> = {};
  const overrides: Record<string, string> = {};
  for (const [k, v] of Object.entries(extraFields)) overrides[k.toLowerCase()] = v;

  for (const { name, value } of form.inputs) {
    const lname = name.toLowerCase();
    if (usernameFields.has(lname)) {
      payload[name] = username;
    } else if (passwordFields.has(lname)) {
      payload[name] = password;
    } else if (lname === "has_js" && !value && !("has_js" in overrides)) {
      payload[name] = "1";
    } else {
      payload[name] = value;
    }
  }

  for (const [k, v] of Object.entries(extraFields)) payload[k] = v;
  for (const name of Object.keys(payload)) {
    const lname = name.toLowerCase();
    if (lname in overrides) payload[name] = overrides[lname];
  }

  return payload;
}

function withQuery(url: string, params: Record<string, string>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export class InschoolAuthClient {
  private readonly cookieJar = new CookieJar();
  private readonly usernameFields: Set<string>;
  private readonly passwordFields: Set<string>;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private readonly debug: boolean;

  private _lastResponse: Response | null = null;
  private _lastError: string | null = null;

  constructor(
    opts: {
      usernameFields?: string[];
      passwordFields?: string[];
      timeoutMs?: number;
      userAgent?: string;
      debug?: boolean;
    } = {}
  ) {
    this.usernameFields = new Set((opts.usernameFields ?? DEFAULT_USERNAME_FIELDS).map((f) => f.toLowerCase()));
    this.passwordFields = new Set((opts.passwordFields ?? DEFAULT_PASSWORD_FIELDS).map((f) => f.toLowerCase()));
    this.timeoutMs = opts.timeoutMs ?? 20_000;
    this.userAgent = opts.userAgent ?? "inschool-auth/1.0";
    this.debug = opts.debug ?? false;
  }

  private log(...args: unknown[]): void {
    if (this.debug) console.error("[inschool-auth]", ...args);
  }

  get lastResponse(): Response | null {
    return this._lastResponse;
  }

  get lastError(): string | null {
    return this._lastError;
  }

  /** Cookie header for the URL the flow last landed on. */
  get cookieHeader(): string {
    return this._lastResponse ? this.cookieJar.header(this._lastResponse.url) : "";
  }

  async authenticate(options: InschoolAuthOptions): Promise<void> {
    const { startUrl, username, password, extraFields = {}, maxSteps = 20, identityProvider, onStep } = options;

    this._lastError = null;
    this.log(`starting at ${startUrl}`);
    if (identityProvider) this.log(`identityProvider configured: ${identityProvider}`);
    let response = await this.request("GET", startUrl, {});

    for (let step = 1; step <= maxSteps; step++) {
      onStep?.(step, response.status, response.url);
      this.log(`step ${step}: status=${response.status} url=${response.url}`);
      const html = await response.text();

      const form = selectForm(html, this.usernameFields, this.passwordFields);

      if (!form) {
        this.log(`step ${step}: no form found on the page`);
        const redirect = extractHtmlRedirect(html);
        if (redirect) {
          const target = new URL(redirect, response.url).toString();
          this.log(`step ${step}: following meta/JS redirect -> ${target}`);
          response = await this.request("GET", target, { referer: response.url });
          continue;
        }
        if (identityProvider && response.url.includes("Login.jsp") && !response.url.includes("idp=")) {
          const target = withQuery(response.url, { idp: identityProvider });
          this.log(`step ${step}: selecting identity provider -> ${target}`);
          response = await this.request("GET", target, { referer: response.url });
          continue;
        }
        this.log(
          `step ${step}: no redirect and no identity-provider match — stopping here.`,
          `First 300 chars of body:`,
          JSON.stringify(html.slice(0, 300))
        );
        break; // no form, no redirect — nothing more we can do
      }

      const names = form.inputs.map((i) => i.name);
      this.log(`step ${step}: form found — method=${form.method} action=${JSON.stringify(form.action)} fields=[${names.join(", ")}]`);

      const target = new URL(form.action || response.url, response.url).toString();
      const payload = buildPayload(form, username, password, extraFields, this.usernameFields, this.passwordFields);
      const submittedPasswordForm = form.inputs.some((i) => this.passwordFields.has(i.name.toLowerCase()));

      this.log(`step ${step}: submitting ${form.method} ${target} fields=[${Object.keys(payload).join(", ")}]`);

      response =
        form.method === "POST"
          ? await this.request("POST", target, { referer: response.url, body: payload })
          : await this.request("GET", target, { referer: response.url, query: payload });

      this.log(`step ${step}: submit result -> status=${response.status} url=${response.url}`);

      if (submittedPasswordForm) {
        const checkHtml = await response.clone().text();
        if (responseHasPasswordForm(checkHtml, this.passwordFields)) {
          this._lastError = extractErrorMessage(checkHtml);
          this.log(`step ${step}: still on a password form after submitting — login failed.`, `Error message: ${this._lastError ?? "(none found)"}`);
          break; // still on a password form after submitting — login failed
        }
        this.log(`step ${step}: password form cleared, continuing`);
      }
    }

    this.log(`finished: status=${response.status} url=${response.url}`);
    this._lastResponse = response;
  }

  private async request(
    method: "GET" | "POST",
    url: string,
    opts: { referer?: string; query?: Record<string, string>; body?: Record<string, string> }
  ): Promise<Response> {
    let currentUrl = opts.query && Object.keys(opts.query).length > 0 ? withQuery(url, opts.query) : url;
    let currentMethod: "GET" | "POST" = method;
    let currentBody = currentMethod === "POST" && opts.body ? new URLSearchParams(opts.body).toString() : undefined;
    let referer = opts.referer;

    // Redirects are followed manually (rather than via fetch's own
    // `redirect: "follow"`) so the cookie jar can see, and resend, cookies
    // set at every hop — mirroring what `requests.Session` does for free.
    for (let redirects = 0; redirects < MAX_REDIRECTS_PER_REQUEST; redirects++) {
      const headers: Record<string, string> = { "User-Agent": this.userAgent };
      if (referer) headers["Referer"] = referer;
      if (currentMethod === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";
      const cookie = this.cookieJar.header(currentUrl);
      if (cookie) headers["Cookie"] = cookie;

      if (cookie) this.log(`  -> ${currentMethod} ${currentUrl} (sending cookies: [${cookieNames(cookie).join(", ")}])`);
      else this.log(`  -> ${currentMethod} ${currentUrl} (no cookies to send)`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method: currentMethod,
          headers,
          body: currentMethod === "POST" ? currentBody : undefined,
          redirect: "manual",
          signal: controller.signal,
        });
      } catch (err) {
        this.log(`  !! fetch failed for ${currentUrl}:`, err instanceof Error ? err.message : err);
        throw err;
      } finally {
        clearTimeout(timer);
      }

      const receivedCookies = getSetCookieHeaders(response).map((c) => c.split(";")[0].split("=")[0]);
      this.cookieJar.applyFromResponse(response, currentUrl);
      this.log(
        `  <- ${response.status} ${currentUrl}` +
          (receivedCookies.length ? ` (set cookies: [${receivedCookies.join(", ")}])` : " (no cookies set)")
      );

      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        referer = currentUrl;
        const nextUrl = new URL(location, currentUrl).toString();
        this.log(`  redirect ${response.status} -> ${nextUrl}`);
        // A 303 (or a 301/302 following a POST) turns the next hop into a GET.
        if (response.status === 303 || (currentMethod === "POST" && (response.status === 301 || response.status === 302))) {
          currentMethod = "GET";
          currentBody = undefined;
        }
        currentUrl = nextUrl;
        continue;
      }

      return response;
    }

    throw new Error(`Too many redirects while requesting ${url}`);
  }
}

export type LoginAuthProviderOptions = Omit<InschoolAuthOptions, "username" | "password" | "startUrl">;

export class LoginAuthProvider implements AuthProvider {
  private readonly client: InschoolAuthClient;
  private readonly authOptions: InschoolAuthOptions;
  private authPromise: Promise<void> | null = null;

  constructor(username: string, password: string, startUrl: string, options: LoginAuthProviderOptions = {}) {
    this.authOptions = { username, password, startUrl, ...options };
    this.client = new InschoolAuthClient({
      usernameFields: options.usernameFields,
      passwordFields: options.passwordFields,
      timeoutMs: options.timeoutMs,
      userAgent: options.userAgent,
      debug: options.debug,
    });
  }

  async authorize(init: RequestInit): Promise<void> {
    await this.login();
    const cookie = this.client.cookieHeader;
    if (!cookie) {
      return;
    }

    if (init.headers instanceof Headers) {
      init.headers.set("Cookie", cookie);
      return;
    }

    const headers = new Headers(init.headers ?? {});
    headers.set("Cookie", cookie);
    init.headers = headers;
  }

  /**
   * Runs the SSO flow now, if it hasn't already run (or isn't already in
   * flight). Safe to call more than once — later calls just await the same
   * cached result. Throws if the flow ends up back on a login form with a
   * visible error message.
   */
  async login(): Promise<void> {
    if (!this.authPromise) {
      this.authPromise = this.client.authenticate(this.authOptions).catch((err) => {
        this.authPromise = null; // allow a retry on the next call
        throw err;
      });
    }
    await this.authPromise;

    if (this.client.lastError) {
      this.authPromise = null; // authenticate() resolved, but landed on an error — allow retry
      throw new Error(`Inschool login failed: ${this.client.lastError}`);
    }
  }

  async getRequestInit(): Promise<RequestInit> {
    await this.login(); // no-op if login() already ran successfully

    const cookie = this.client.cookieHeader;
    return { headers: cookie ? { Cookie: cookie } : {} };
  }
}