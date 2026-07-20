import { ZodType } from "zod";
import { createLogger } from "../utils/logger";
import { AuthProvider } from "./authProvider";

const logger = createLogger("ApiClient");

export enum Method {
  GET = "GET",
  POST = "POST",
}

type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
};

export class ApiClient {
  constructor(private readonly baseUrl: URL, private readonly authProvider: AuthProvider) {}

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

    const res = await fetch(url, init);

    if (!res.ok) {
      throw new Error(
        `inskewl: api ${path} went ${res.status}...\n${await res.text()}`,
      );
    }

    return res.json() as Promise<T>;
  }

  get<T>(path: string, opts?: RequestOptions) {
    return this.request<T>(Method.GET, path, opts);
  }

  post<T>(path: string, body?: unknown, opts?: RequestOptions) {
    return this.request<T>(Method.POST, path, opts, body);
  }

  async getWithSchema<T>(
    path: string,
    schema: ZodType<T>,
    opts?: RequestOptions,
  ) {
    const json = await this.get(path, opts);
    const result = schema.safeParse(json);
    if (!result.success) {
      logger.error(`Schema mismatch for GET ${path}:`, result.error);
      throw new Error(`API Schema mismatch for ${path}`);
    }
    return result.data;
  }

  async postWithSchema<T>(
    path: string,
    body: unknown,
    schema: ZodType<T>,
    opts?: RequestOptions,
  ) {
    const json = await this.post(path, body, opts);
    const result = schema.safeParse(json);
    if (!result.success) {
      logger.error(`Schema mismatch for POST ${path}:`, result.error);
      throw new Error(`API Schema mismatch for POST ${path}`);
    }
    return result.data;
  }
}
