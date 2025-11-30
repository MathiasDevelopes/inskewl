export enum Method {
  GET = "GET",
  POST = "POST",
}

export class ApiClient {
  constructor(private baseUrl: string) {}

  async request<T>(
    path: string,
    opts: {
      method?: Method;
      body?: unknown;
      headers?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const { method = Method.GET, body, headers = {} } = opts;

    const res = await fetch(this.baseUrl + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`inskewl: api ${path} went ${res.status}...\n${text}`);
    }

    const data = await res.json();
    return data;
  }
}
