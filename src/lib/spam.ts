import type { ContactFormValues } from "@/lib/contact-schema";

/**
 * `discard` means accept the request and drop it silently, so the sender learns
 * nothing. Reserved for signals a human cannot trip. `reject` means answer with
 * an actionable error, for signals that could misfire on a real person —
 * silently eating a genuine enquiry is worse than letting spam through.
 */
export type SpamVerdict =
  | { kind: "discard"; reason: string }
  | { kind: "reject"; reason: string; message: string };

const URL_PATTERN = /https?:\/\/|www\./gi;
const MARKUP_PATTERN = /<a\s|\[url[=\]]|\[link[=\]]/i;

/** Enough for a genuine enquiry citing a couple of references. */
const MAX_LINKS = 3;

function countLinks(value: string): number {
  return value.match(URL_PATTERN)?.length ?? 0;
}

/**
 * Deliberately no keyword blocklist: the usual spam word lists contain "SEO",
 * "automation", "AI" and "leads", all of which belong in a real enquiry to this
 * business. Link volume and embedded markup are the signals that stay safe here.
 */
export function detectSpam(
  values: ContactFormValues,
  honeypot: string,
): SpamVerdict | null {
  if (honeypot.trim() !== "") {
    return { kind: "discard", reason: "honeypot filled" };
  }

  if (MARKUP_PATTERN.test(values.message)) {
    return {
      kind: "reject",
      reason: "link markup in message",
      message: "Please send your message as plain text, without link markup.",
    };
  }

  if (countLinks(values.message) > MAX_LINKS) {
    return {
      kind: "reject",
      reason: "too many links in message",
      message: `Please include no more than ${MAX_LINKS} links in your message.`,
    };
  }

  if (countLinks(values.name) > 0) {
    return { kind: "discard", reason: "url in name" };
  }

  return null;
}
