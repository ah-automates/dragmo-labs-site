const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type VerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verifies a Turnstile token against Cloudflare.
 *
 * Tokens are single-use and expire after five minutes, so a replayed one comes
 * back as `timeout-or-duplicate` — that is the code to look for in logs when a
 * user reports being stuck on a retry.
 */
export async function verifyTurnstile(
  token: string,
  ip: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body });
    const result = (await response.json()) as VerifyResponse;

    if (!result.success) {
      console.warn("[turnstile] rejected", result["error-codes"] ?? []);
    }
    return result.success;
  } catch (error) {
    // Fail closed. Treating an unreachable Cloudflare as a pass would let a bot
    // skip the check entirely by inducing a timeout.
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
