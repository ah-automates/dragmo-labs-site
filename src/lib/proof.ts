/**
 * Verified engineering incidents, shared by product pages (17-step selling
 * system, step 07 "Show Your Credentials") and case study detail pages.
 *
 * This file exists separately from `products.ts` and `case-studies.ts` so
 * neither has to import the other — both import this instead. It is also
 * the site's answer to the "no invented numbers" rule (see
 * `design-system/MASTER.md` §7 and §8): rather than a percentage or a dollar
 * figure nobody can check, credibility here comes from naming a real
 * symptom, a real cause, a real fix, and what the fix was verified against.
 * Every entry below is drawn directly from a project's own `context.md`.
 */

export type ProofEntry = {
  id: string;
  /** What was observed, in plain language. Never a statistic. */
  symptom: string;
  /** Why it actually happened, not just where. */
  cause: string;
  /** What changed, stated as a real engineering decision. */
  fix: string;
  /** What the fix was checked against, so the claim is falsifiable. */
  verifiedAgainst: string;
};

export const chatshiftProof: ProofEntry[] = [
  {
    id: "triple-reply",
    symptom:
      "One customer message answered three times, and the company inbox received three identical lead emails for a single enquiry.",
    cause:
      "A full agent turn (retrieval, a tool call, a second model round trip) routinely took 15 to 30 seconds. The provider's own webhook rules call anything over 10 seconds slow and retry on a 10s / 30s / 5min ladder, and nothing in the handler recognised a retry as a delivery it had already seen, so every retry re-ran the entire pipeline from scratch.",
    fix:
      "The provider's own delivery id became a database primary key, claimed before any work starts. A second delivery of the same id fails the insert and is dropped immediately. The actual reply now runs after the HTTP response is already sent, so the provider gets its fast acknowledgement and stops retrying, while the agent still gets its full 15 to 30 seconds to think.",
    verifiedAgainst:
      "Replaying the identical delivery id twice through a signed test webhook produced one inbound row, one AI reply, and one email on the first call, and a no-op response with zero further writes on the second, checked directly against the live database.",
  },
  {
    id: "lead-amnesia",
    symptom:
      "Once a customer had given everything needed for a booking, the agent kept declaring their details had been sent again on later turns where nothing had changed.",
    cause:
      "Tool calls are not part of the conversation memory the system persists, so every reply was built from scratch with no record the lead tool had ever been called before. The rule was 'submit once everything is present,' and once that became true it stayed true on every following turn.",
    fix:
      "The submission decision moved out of the model's memory and into an append-only leads table in the database. Every reply is now told, in plain language, exactly what was last submitted for that contact and instructed not to submit again unless something has actually changed.",
    verifiedAgainst:
      "A fresh conversation was qualified, submitted once, told 'no changes needed' twice with zero further sends, then had its budget changed, which correctly produced a 'why did this change' question with no send, and only sent again once a reason was given.",
  },
  {
    id: "own-company-name",
    symptom:
      "Asked what the agency is called, the agent refused to answer, even though the company's name sits in the browser tab title and on the WhatsApp profile the customer was already messaging.",
    cause:
      "Retrieval returned the numerically closest chunk to the question, which happened to be a caution rule about never stating an unlisted detail, written to guard a licence number or a direct line. The prompt never stated the company's own name as a plain fact, so the model generalised that caution to cover its own identity.",
    fix:
      "The company's name now sits directly in the system prompt as a known, always-safe fact, with an explicit note that the 'don't state unlisted details' rule governs licence numbers and direct phone lines, not the company's own identity.",
    verifiedAgainst:
      "The exact question that failed was re-sent through the live pipeline after the fix and answered correctly.",
  },
  {
    id: "flat-vs-nested-json",
    symptom:
      "The agent had total amnesia on every single message. Code compiled and ran with no error at any point.",
    cause:
      "The conversation-memory table stored each turn as a flat object with the message text directly on one field. The code reading it assumed a more commonly documented nested shape one level deeper, so every read silently returned empty history with nothing to point at the cause.",
    fix:
      "Writes were checked against the table's actual real rows rather than a documented convention. Reads now accept either shape, so both the existing rows and any newly written ones work uniformly.",
    verifiedAgainst:
      "Confirmed by inspecting the table's live rows directly, not by trusting the shape that was assumed at first.",
  },
  {
    id: "webhook-redirect",
    symptom:
      "In an early build, every inbound WhatsApp message would have silently disappeared in production, with no error surfaced anywhere.",
    cause:
      "The authentication layer's route matcher did not exclude API routes, so an unauthenticated call to the webhook endpoint, which is every call, since the provider never carries a login session, was silently redirected to the login page instead of ever reaching the handler.",
    fix:
      "An explicit early-return guard for any API path was added inside the authentication check itself, plus a matching exclusion in the route matcher, so the same failure cannot come back if either safeguard alone is later reverted.",
    verifiedAgainst:
      "Found by calling the endpoint directly and noticing the redirect rather than the expected response, ahead of production use.",
  },
];

export const invoiceSystemProof: ProofEntry[] = [
  {
    id: "arithmetic-guard",
    symptom:
      "A model reading a vendor invoice can misread a digit or a decimal point, and a wrong number that looks plausible is the expensive kind of mistake, not the obvious kind.",
    cause:
      "Structured extraction from a scanned or photographed invoice is read, not calculated. Nothing about the extraction step itself confirms the line items, tax, and total actually add up to what is printed on the document.",
    fix:
      "Every extracted invoice is re-verified in code before it is trusted: line totals, tax, and the grand total are recomputed independently and checked against what the model read. A mismatch is flagged for a human to look at rather than silently filed.",
    verifiedAgainst:
      "Built as a dedicated verification step separate from extraction itself, so the check runs the same way regardless of which model produced the reading.",
  },
  {
    id: "hand-rolled-sessions",
    symptom:
      "An admin deactivating a staff account needs to take effect immediately, not whenever that person's login token happens to expire.",
    cause:
      "The standard drop-in authentication library's credential login is built around signed tokens that stay valid on their own terms once issued, which is a known limitation for exactly this kind of immediate revocation, not a configuration that can be turned off.",
    fix:
      "A deliberately small session layer was written directly against the database instead: one sessions table, an opaque token hashed at rest, and a short list of functions to create, check, and revoke a session. Deactivating an account now means the very next request from that browser fails.",
    verifiedAgainst:
      "The scope was kept intentionally narrow, exactly the functions this requirement needs, rather than adopting a general auth framework and fighting its defaults.",
  },
  {
    id: "frozen-invoice-snapshot",
    symptom:
      "A client invoice template can change after an invoice built from it has already been sent, which would silently rewrite a document a client has already relied on.",
    cause:
      "A live template and a generated invoice are two different things with two different lifespans, and treating an issued invoice as 'still following the current template' means every future template edit reaches backward into documents that should never move again.",
    fix:
      "The moment an invoice is finalised, the exact template state it was built from is frozen into that invoice's own record, and the PDF is generated from that frozen snapshot, never from whatever the template happens to say today.",
    verifiedAgainst:
      "Checked by editing the live template after issuing an invoice and confirming the already-sent PDF and its record were unchanged.",
  },
];

/**
 * The voice agent has no `context.md` of its own (unlike Chatshift
 * and the invoice portal), so it earns no entry here. Borrowing the WhatsApp
 * agent's bug fixes for it would misattribute engineering work that happened
 * on a different system to one it never ran on. Its product page draws
 * credibility from the recording itself (step 06) and an honest cross-link to
 * the WhatsApp case study, not from a fabricated proof log. See
 * `src/lib/products.ts`.
 */
export const proofBySlug = {
  "chatshift": chatshiftProof,
  "ai-invoice-system": invoiceSystemProof,
} satisfies Record<string, ProofEntry[]>;
