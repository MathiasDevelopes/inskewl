import type { z, ZodType } from "zod";
import { createLogger } from "@inskewl/core";
import type { AuthProvider } from "./authProvider";

const logger = createLogger("ApiClient");

export const Method = { GET: "GET", POST: "POST" } as const;
export type Method = (typeof Method)[keyof typeof Method];

type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
};

export class ApiClient {
  private readonly baseUrl: URL;
  private readonly authProvider: AuthProvider;

  constructor(baseUrl: URL, authProvider: AuthProvider) {
    this.baseUrl = baseUrl;
    this.authProvider = authProvider;
  }

  private async request<T>(
    method: Method,
    path: string,
    opts: RequestOptions = {},
    body?: unknown,
  ): Promise<T> {
    const { headers = {}, query } = opts;

    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        url.searchParams.set(k, String(v));
      }
    }

    const init: RequestInit = {
      method,
      headers: { ...headers },
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    await this.authProvider.authorize(init);

    logger.debug(`${method} ${url.pathname}`);
    const res = await fetch(url, init);

    if (!res.ok) {
      // Log status and path only; the response body may contain student data.
      logger.warn(`${method} ${url.pathname} failed with ${res.status}`);
      // Keep the body out of the message too, so it can't leak into logs or alerts.
      throw new Error(`inskewl: api ${path} went ${res.status}`);
    }

    logger.debug(`${method} ${url.pathname} -> ${res.status}`);
    return res.json() as Promise<T>;
  }

  get<T>(path: string, opts?: RequestOptions) {
    return this.request<T>(Method.GET, path, opts);
  }

  post<T>(path: string, body?: unknown, opts?: RequestOptions) {
    return this.request<T>(Method.POST, path, opts, body);
  }

  async getWithSchema<S extends ZodType>(
    path: string,
    schema: S,
    opts?: RequestOptions,
  ): Promise<z.output<S>> {
    const json = await this.get(path, opts);
    const result = schema.safeParse(json);
    if (!result.success) {
      logger.error(`Schema mismatch for GET ${path}:`, result.error);
      throw new Error(`API Schema mismatch for ${path}`);
    }
    return result.data;
  }

  async postWithSchema<S extends ZodType>(
    path: string,
    body: unknown,
    schema: S,
    opts?: RequestOptions,
  ): Promise<z.output<S>> {
    const json = await this.post(path, body, opts);
    const result = schema.safeParse(json);
    if (!result.success) {
      logger.error(`Schema mismatch for POST ${path}:`, result.error);
      throw new Error(`API Schema mismatch for POST ${path}`);
    }
    return result.data;
  }
}
