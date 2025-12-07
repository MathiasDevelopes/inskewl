import { ZodType } from "zod";

export enum Method {
  GET = "GET",
  POST = "POST",
}

type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
};

export class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(
    method: Method,
    path: string,
    opts: RequestOptions = {},
    body?: unknown,
  ): Promise<T> {
    const { headers = {}, query } = opts;

    /* hacky fix for url joining, /control should probably be in this.baseUrl,
    but URL class strips everything except the base url for base? property */
    const url = new URL("/control" + path, this.baseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

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
    return schema.parse(json);
  }

  async postWithSchema<T>(
    path: string,
    body: unknown,
    schema: ZodType<T>,
    opts?: RequestOptions,
  ) {
    const json = await this.post(path, body, opts);
    return schema.parse(json);
  }
}
