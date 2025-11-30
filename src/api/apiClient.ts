export enum Method {
  GET = "GET",
  POST = "POST",
}

type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
};

export class ApiClient {
  constructor(private baseUrl: string) {}

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = Method.GET, body, headers = {}, query } = opts;

    // building of the url, with query if applicable.
    let url = this.baseUrl + path;
    if (query) {
      const qs = new URLSearchParams();
      for (const key in query) {
        const value = query[key];
        if (value !== undefined) qs.append(key, String(value));
      }
      url += "?" + qs.toString();
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`inskewl: api ${path} went ${res.status}...\n${text}`);
    }

    return res.json() as Promise<T>;
  }
}
