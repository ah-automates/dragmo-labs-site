/**
 * In-memory limiting. On Vercel this is per serverless instance rather than
 * global, so a distributed flood can partly evade it — it reliably stops
 * single-source bursts, which is the common case. Moving to durable limiting is
 * a swap of this file's internals for `@upstash/ratelimit`; the exported
 * signatures are shaped so nothing else has to change.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

/**
 * Each submission sends two emails (notification + auto-reply), so Resend's
 * free tier of 100/day is really 50 submissions. This sits below that to leave
 * headroom for genuine traffic once an attack is already being throttled.
 */
const MAX_PER_DAY = 40;

const attempts = new Map<string, number[]>();
let daily = { day: "", count: 0 };

export type LimitResult = { ok: true } | { ok: false; message: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Keeps the map from growing without bound as new IPs arrive. */
function prune(now: number): void {
  for (const [key, times] of attempts) {
    const live = times.filter((time) => now - time < WINDOW_MS);
    if (live.length === 0) {
      attempts.delete(key);
    } else {
      attempts.set(key, live);
    }
  }
}

/** Records the attempt as well as checking it, so repeated tries all count. */
export function checkRateLimit(ip: string | null): LimitResult {
  const now = Date.now();
  prune(now);

  // An unresolvable IP shares one bucket rather than skipping the check.
  const key = ip ?? "unknown";
  const times = attempts.get(key) ?? [];

  if (times.length >= MAX_PER_WINDOW) {
    return {
      ok: false,
      message:
        "You've sent several messages recently. Please wait a few minutes before trying again.",
    };
  }

  attempts.set(key, [...times, now]);
  return { ok: true };
}

/** Read-only; call `recordSend` once delivery actually happens. */
export function checkDailyCap(): LimitResult {
  if (daily.day === today() && daily.count >= MAX_PER_DAY) {
    return {
      ok: false,
      message:
        "We're not able to accept messages right now. Please email info@dragmolabs.com directly.",
    };
  }
  return { ok: true };
}

export function recordSend(): void {
  const day = today();
  daily = day === daily.day ? { day, count: daily.count + 1 } : { day, count: 1 };
}
