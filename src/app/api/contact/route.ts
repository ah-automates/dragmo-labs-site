import { NextResponse } from "next/server";

import { validateContact, type ContactFormValues } from "@/lib/contact-schema";
import {
  isEmailConfigured,
  sendContactAutoReply,
  sendContactNotification,
} from "@/lib/email";

import {
  checkDailyCap,
  checkRateLimit,
  recordSend,
} from "@/lib/rate-limit";
import { detectSpam } from "@/lib/spam";
import { isTurnstileConfigured, verifyTurnstile } from "@/lib/turnstile";

/** The Resend SDK and the in-memory limiter both need the Node runtime. */
export const runtime = "nodejs";

/** Never prerendered, never cached: every call has to run the checks below. */
export const dynamic = "force-dynamic";

/** Two sequential Resend calls plus a Turnstile round trip, with headroom. */
export const maxDuration = 15;

const DELIVERY_FAILED =
  "We couldn't send your message. Please email info@dragmolabs.com directly.";

const VERIFICATION_FAILED =
  "Verification failed. Please refresh the page and try again.";

/**
 * The form posts roughly 6 KB at the schema's own limits. Anything past this is
 * refused before it is parsed, so a large body can never be turned into work.
 */
const MAX_BODY_BYTES = 32 * 1024;

/**
 * The endpoint is public by necessity — the contact form is unauthenticated —
 * so responses are marked never-cache and never-index. Without `no-store` a
 * proxy could hold one sender's error response and replay it to another.
 */
function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Vercel populates both; the first entry of x-forwarded-for is the client. */
function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

/**
 * Rejects a cross-site post from a page the user did not load from us.
 *
 * A browser always sends `Origin` on a JSON POST, so a mismatch is a real
 * cross-origin caller and is refused. A missing header means a non-browser
 * client (curl, a script), which is allowed through here and stopped by
 * Turnstile instead — rejecting on absence would break nothing an attacker
 * relies on while breaking legitimate uptime probes.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "Request rejected." }, 403);
  }

  // Guards the parse itself: `request.json()` on a huge body would buffer it all
  // before failing.
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json({ error: "Message is too long." }, 413);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Invalid request body." }, 415);
  }

  let payload: unknown;
  try {
    // Read as text first, so a body that lied about its length is still capped.
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ error: "Message is too long." }, 413);
    }
    payload = JSON.parse(text);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return json({ error: "Invalid request body." }, 400);
  }

  const ip = clientIp(request);

  // Cheapest checks first, so a flood is turned away before any work is done.
  const limited = checkRateLimit(ip);
  if (!limited.ok) {
    return json({ error: limited.message }, 429);
  }

  const capped = checkDailyCap();
  if (!capped.ok) {
    console.error("[contact] daily cap reached, submission refused");
    return json({ error: capped.message }, 429);
  }

  const raw = payload as Record<string, unknown>;
  const values: ContactFormValues = {
    name: asString(raw.name).slice(0, 200),
    company: asString(raw.company).slice(0, 200),
    email: asString(raw.email).slice(0, 200),
    phone: asString(raw.phone).slice(0, 60),
    interest: asString(raw.interest).slice(0, 120),
    budget: asString(raw.budget).slice(0, 60),
    message: asString(raw.message).slice(0, 5000),
  };

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) {
    return json(
      { error: "Please check the highlighted fields and try again.", errors },
      422,
    );
  }

  const verdict = detectSpam(values, asString(raw.website));
  if (verdict?.kind === "discard") {
    // Answer as though it succeeded, so the sender learns nothing.
    console.warn("[contact] discarded:", verdict.reason);
    return json({ ok: true });
  }
  if (verdict?.kind === "reject") {
    return json(
      {
        error: "Please check the highlighted fields and try again.",
        errors: { message: verdict.message },
      },
      422,
    );
  }

  // Verified last of all the checks: the token is single-use and expires after
  // five minutes, so spending it on a submission that some cheaper rule would
  // have rejected anyway would force the sender to re-solve a challenge just to
  // correct a typo.
  if (isTurnstileConfigured()) {
    const verified = await verifyTurnstile(asString(raw.turnstileToken), ip);
    if (!verified) {
      return json({ error: VERIFICATION_FAILED }, 403);
    }
  } else if (process.env.NODE_ENV === "production") {
    // Fail closed. A production deploy missing the secret would otherwise leave
    // the endpoint open to scripted submissions with no bot check at all.
    console.error("[contact] TURNSTILE_SECRET_KEY missing, submission refused");
    return json({ error: DELIVERY_FAILED }, 500);
  }

  if (!isEmailConfigured()) {
    // Keep local work on the form unblocked, but never let production accept a
    // submission it cannot deliver.
    if (process.env.NODE_ENV === "production") {
      console.error("[contact] email env vars missing, submission dropped");
      return json({ error: DELIVERY_FAILED }, 500);
    }

    console.warn("[contact] email not configured, logging instead", values);
    return json({ ok: true });
  }

  try {
    await sendContactNotification(values);
  } catch (error) {
    // Returning ok here would show the success screen and lose the lead.
    console.error("[contact] notification failed", error);
    return json({ error: DELIVERY_FAILED }, 500);
  }

  recordSend();

  // The enquiry already reached the inbox, so a failed courtesy email must not
  // tell the sender their message did not go through.
  try {
    await sendContactAutoReply(values);
  } catch (error) {
    console.error("[contact] auto-reply failed", error);
  }

  return json({ ok: true });
}
