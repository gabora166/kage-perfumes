export class RateLimitError extends Error {
  constructor() {
    super("محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.");
    this.name = "RateLimitError";
  }
}

type RateDb = {
  exec(sql: string): void;
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): { changes: number | bigint };
  };
};

type WindowInput = {
  bucket: string;
  ip: string;
  limit: number;
  windowMs: number;
  now?: number;
};

export function consumeWindow(db: RateDb, input: WindowInput): void {
  if (!input.ip || input.ip === "unknown") {
    throw new Error("Rate limit key is missing.");
  }
  const now = input.now ?? Date.now();
  let isBlocked = false;
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db.prepare(
      "SELECT hits, window_started_at FROM rate_limits WHERE bucket = ? AND ip = ?",
    ).get(input.bucket, input.ip) as { hits: number; window_started_at: number } | undefined;
    if (!row || now - row.window_started_at >= input.windowMs) {
      db.prepare(`
        INSERT INTO rate_limits (bucket, ip, hits, window_started_at)
        VALUES (?, ?, 1, ?)
        ON CONFLICT(bucket, ip) DO UPDATE SET hits = 1, window_started_at = excluded.window_started_at
      `).run(input.bucket, input.ip, now);
    } else if (row.hits >= input.limit) {
      isBlocked = true;
    } else {
      db.prepare("UPDATE rate_limits SET hits = hits + 1 WHERE bucket = ? AND ip = ?").run(input.bucket, input.ip);
    }
    db.prepare("DELETE FROM rate_limits WHERE ? - window_started_at > ?").run(now, input.windowMs * 4);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  if (isBlocked) throw new RateLimitError();
}
