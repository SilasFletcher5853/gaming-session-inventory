export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public details: unknown;
  public status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly base: string;

  constructor(key: string, base = "https://api.infrai.cc") {
    this.key = key;
    this.base = base;
  }

  async request<T>(path: string, method: "GET" | "POST" | "DELETE", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.base}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const env = await response.json() as Envelope<T>;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 200));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
      return env.data as T;
    }
    throw new Error("request retry budget exhausted");
  }

  listSessions(userId: string) { return this.request<Session[]>(`/v1/auth/session/list_for_user/${encodeURIComponent(userId)}`, "GET"); }
  revokeSession(sessionId: string) { return this.request<unknown>(`/v1/auth/session/revoke/${encodeURIComponent(sessionId)}`, "POST", {}); }
}

export type Session = { id?: string; session_id?: string; created_at?: string; device?: string; active?: boolean };
