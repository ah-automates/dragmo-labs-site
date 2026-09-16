# Khatri Real Estate WhatsApp Inbox: Project Context

Orientation document for anyone (human or agent) picking this codebase up. It covers what
the system is, how every piece fits together, the reasoning behind the non-obvious choices,
and the real problems hit while building it and how each was actually resolved.

---

## 1. What this is

A single application that does two jobs at once for a Dubai real estate business's WhatsApp
number:

1. **An AI customer-support and lead-qualification agent.** Every inbound WhatsApp message
   (text, voice note, image, document) is received, understood, and — for text and voice —
   answered automatically by an LLM agent that knows the company's own property/service
   knowledge base, asks only for the information it's actually missing, and emails a
   structured lead to the company the moment a request is ready for human follow-up.
2. **A live web inbox for the business owner.** A WhatsApp-Desktop-style two-pane UI that
   shows every conversation in real time, lets the owner take over any single conversation
   by hand (silencing the AI just for that contact), send messages and media themselves,
   correct or remove something from their own view, and manage contacts — all backed by the
   same database the agent reads and writes.

There is no separate backend service and no third-party automation platform in the request
path: one Next.js application owns webhook receipt, signature verification, media handling,
the agent's reasoning loop, reply delivery, and the UI, end to end.

It is internal-only. There is no public signup; the owner signs in with an email/password
account created directly in Supabase.

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.4, App Router, Turbopack |
| Runtime | React 19.2, TypeScript `strict: true` |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| Database | Supabase Postgres — tables, Row Level Security, Realtime (`postgres_changes`) |
| Auth | Supabase Auth, email + password, session cookie via `@supabase/ssr` |
| File storage | Supabase Storage (`wa-media` bucket, public read) |
| WhatsApp connectivity | YCloud (a WhatsApp Business Platform provider) — REST send API + webhooks |
| LLM | OpenAI `gpt-4o-mini` (chat + tool calling), `text-embedding-3-small` (retrieval), `whisper-1` (voice transcription) |
| Email | Nodemailer over SMTP |

### Who can reach what

Every browser page except `/login` requires a session; every `/api/**` route re-checks the
session itself (`requireUser()`) rather than trusting anything upstream — see section 8 for
exactly why that duplication is deliberate, not an oversight.

---

## 2. How the code is organized

```
app/
  layout.tsx                root HTML shell, metadata, viewport (see section 9)
  page.tsx                  renders <InboxApp /> — the entire UI lives behind auth
  login/page.tsx            Supabase email+password sign-in
  icon.png, apple-icon.png  favicon / home-screen icon (Next's file-convention icons)
  api/
    whatsapp/webhook/route.ts   the single entry point for everything YCloud sends us
    send/route.ts               owner sends a free-form text message
    send-media/route.ts         owner sends an image/video/document
    agent/route.ts              flips agent_active (the Detach control) for one contact
    read/route.ts                resets a contact's unread badge
    contacts/[phone]/route.ts   rename (PATCH) / delete (DELETE) a contact
    messages/[id]/route.ts      remove one message from the owner's own view (DELETE)
    settings/route.ts           read/update the sitewide default reply mode
components/            the UI — see section 7
lib/                   all business logic, framework-agnostic where possible — see 2.1
supabase/
  schema.sql               the full schema, run once
  002_app_settings.sql     incremental migration for the Settings feature
  003_leads_and_events.sql incremental migration for webhook idempotency + lead tracking
scripts/
  simulate-webhook.js  signs and posts a synthetic YCloud payload at localhost, for
                       testing the agent/detach logic without needing a real phone
                       (an `--id` flag pins the event id, to replay the exact same
                       delivery a provider retry would send)
proxy.ts               the auth guard (Next 16 renamed middleware.ts -> proxy.ts)
```

### 2.1 `lib/`, by concern

| File | Owns |
|---|---|
| `ycloud.ts` | The **only** file that knows how to talk to the WhatsApp provider — endpoint, auth header, request shape. Swapping providers is a rewrite of this one adapter. |
| `signature.ts` | Verifies the webhook's HMAC signature header |
| `agent.ts` | The manual tool-calling loop: builds the message list, calls the chat model, executes any tool call, feeds the result back, repeats |
| `agentPrompt.ts` | The full system prompt the agent runs under (see section 5) |
| `rag.ts` | Embeds a query and searches the knowledge-base vector table |
| `leads.ts` | The stateful lead-submission decision: diffs new information against what was already submitted, decides whether anything should actually be emailed, and builds the email itself (see section 5.4) |
| `mailer.ts` | Thin SMTP transport — sends exactly the subject/HTML it's given, no decision-making of its own |
| `chatHistory.ts` | Reads/writes the agent's long-term conversation memory |
| `messageStore.ts` | All the plain Postgres writes for the webhook path: upsert a contact, insert a message, log an AI reply, update delivery status, claim a webhook event id (idempotency, see section 4.2), re-check `agent_active` immediately before a send |
| `mediaStore.ts` | Downloads a provider media link and re-hosts it in Supabase Storage |
| `settings.ts` | Reads the one sitewide setting that exists today (default reply mode for new contacts) |
| `auth.ts` | `requireUser()` — the session guard every API route calls first |
| `format.ts` | Date/name formatting helpers for the UI |
| `types.ts` | Shared TypeScript types mirroring the schema |
| `supabase/client.ts` | Browser client, anon key, cookie session |
| `supabase/server.ts` | Server client, anon key, cookie session (Server Components / Route Handlers that need the *caller's* identity) |
| `supabase/admin.ts` | Service-role client — bypasses Row Level Security entirely; only ever used after `requireUser()` has already run |

---

## 3. Data model

Five tables of its own, kept deliberately separate from the pre-existing conversation-memory
and knowledge-base tables described in section 5 (those already existed with real production
data before this application's own read/write code was written, and are treated as
external dependencies this app must format its I/O to match, not schemas it owns).

```sql
wa_contacts (
  phone             text primary key,        -- E.164, e.g. +923303059777
  business_phone    text not null,           -- the WhatsApp Business number they wrote to
  name              text,
  agent_active      boolean not null default true,  -- false = detached, owner is handling
  detached_at       timestamptz,
  detached_by       uuid references auth.users(id),
  last_message      text,
  last_message_at   timestamptz,
  last_direction    text check (in 'in'/'out'),
  unread_count      int not null default 0,
  window_expires_at timestamptz,             -- last inbound + 24h, see section 6
  created_at        timestamptz not null default now()
)

wa_messages (
  id            uuid primary key,
  contact_phone text references wa_contacts(phone) on delete cascade,
  direction     text check (in 'in'/'out'),
  sender        text check (in 'customer'/'ai'/'human'),
  type          text check (in 'text'/'audio'/'image'/'document'/'video'/'sticker'/'unsupported'),
  body          text,             -- text body, voice transcript, or media caption
  media_url, media_mime, media_name text,
  wamid, ycloud_id text,          -- ycloud_id is unique; the status webhook matches on it
  status        text check (in 'sent'/'delivered'/'read'/'failed'),
  error         text,
  created_at    timestamptz not null default now()
)

app_settings (
  id                   smallint primary key default 1 check (id = 1),  -- singleton row
  default_agent_active boolean not null default true,
  updated_at           timestamptz,
  updated_by           uuid references auth.users(id)
)

wa_webhook_events (
  event_id     text primary key,   -- the provider's own event id -- the entire idempotency
                                    -- claim is this column's uniqueness constraint
  event_type   text not null,
  received_at  timestamptz not null default now()
)

wa_leads (
  id             uuid primary key,
  contact_phone  text references wa_contacts(phone) on delete cascade,
  request_no     int not null default 1,   -- increments only for a genuinely new enquiry
  revision       int not null default 0,   -- increments for each accepted change to the same request
  fields         jsonb not null,           -- the full LeadFields snapshot as of this row
  changed_fields text[],                   -- null on the first submission of a request
  change_reason  text,                     -- the customer's own words, null on first submission
  subject        text not null,            -- the exact email subject line sent for this row
  created_at     timestamptz not null default now()
)
```

**`wa_leads` is append-only.** Every accepted submission — new or updated — inserts a new row;
existing rows are never updated or deleted. The latest row for a contact (by `created_at`) is
always the current state of their request, and the full row history is a complete audit trail
of exactly what was sent to the company and when. See section 5.4 for how a row here maps
1:1 to exactly one email actually sent.

**`sender` is what makes the UI honest.** `'ai'` vs `'human'` lets an outgoing bubble carry
a small "AI" or "You" tag, so the owner can always tell who actually said what, even
scrolling back through a conversation that was handed back and forth several times.

**RLS and the service-role split.** Row Level Security is enabled on all five tables. The
browser (anon key + session cookie) can `select` everything and `update` `wa_contacts`
directly for one specific case — the Detach toggle writes optimistically from the client so
the UI feels instant (see section 7) — but every *insert* and every other write goes through
a Route Handler using the service-role key, which bypasses RLS entirely. That split exists
because the webhook handler and the send/settings/contacts routes need to write rows on
behalf of the whole system, not on behalf of one logged-in browser session, and RLS has no
concept of "the server acting for itself."

**Realtime.** `wa_contacts`, `wa_messages`, and `wa_leads` are all added to the
`supabase_realtime` publication. The UI never polls — see section 7.

**Storage.** One bucket, `wa-media`, public read. Public, not private, because both the
provider (fetching a link to deliver an outbound file) and the browser (`<img>`/`<video>`
tags) need to load it directly with no signed-URL dance.

---

## 4. The inbound message pipeline

`app/api/whatsapp/webhook/route.ts` is the single HTTP endpoint the provider calls for
everything. `export const maxDuration = 60` because a full agent turn (retrieval + a tool
call + a second model round trip) can comfortably exceed a default serverless timeout.

### 4.1 Every request, in order

1. Read the raw body as text (signature verification needs the *exact* bytes, not a
   re-serialized `JSON.parse` round trip).
2. Verify `verifyYCloudSignature(rawBody, header)` — HMAC-SHA256 over `${timestamp}.${rawBody}`
   using a shared secret, compared with `timingSafeEqual`, rejecting anything more than 300
   seconds old (replay protection). A failure returns `401` before any other code runs.
3. Parse the body and branch on its top-level `type` field with a strict `if`/`else if` on
   the **exact** event name — never a loose or partial match. This single design choice is
   what makes the two event types structurally incapable of interfering with each other (see
   4.3).
4. For an inbound message, claim the event id and respond immediately — the actual work
   (running the agent, sending the reply, writing every row) happens *after* the response is
   sent, not before. See 4.2 for why this exists and how it works. For a status update, the
   work is small enough to just do inline and then respond. Either way, an internal failure
   is logged and swallowed rather than surfaced as a non-`200` — returning a non-`200` would
   make the provider retry the webhook, and retrying something that failed for an unrelated
   reason (a transient OpenAI hiccup, say) risks a duplicate reply reaching the customer on
   top of whatever already went wrong.

### 4.2 Ack fast, claim the event, do the real work after

> [!bug] The same customer message answered three times
> **Symptom.** A customer sent one message. They received the same AI reply three times, and
> the company's inbox received three identical lead-notification emails for what should have
> been a single request — all from that one message.
>
> **Why.** The original handler did the *entire* agent turn — build the message list, call
> the chat model, run a tool call (a knowledge-base lookup or a lead submission), possibly
> call the model a second time, send the WhatsApp reply, write every row — all **before**
> responding to the webhook. A full turn like that routinely takes 15-30 seconds. YCloud's own
> webhook documentation asks for a response within about 6 seconds, calls anything over 10
> seconds "deprioritised," and retries a webhook it didn't get a fast `2xx` from on a
> **10s → 30s → 5min → 30min → 1h → 2h → 2h** ladder — seven attempts in total. Nothing in the
> handler recognized a retry as "the same delivery I already saw" — it had no memory of
> deliveries at all — so every retry re-ran the *entire* pipeline again from scratch: another
> chat completion, another WhatsApp send, another email, another row in every table. The
> roughly one-minute gap between the customer's message appearing twice in the inbox lined up
> exactly with the 10s → 30s step of that ladder.
>
> **Fix, two parts working together.**
>
> 1. **Claim the event before doing anything else.** `wa_webhook_events.event_id` — the
>    provider's own id for this specific delivery — is a primary key. `claimWebhookEvent()`
>    does one `insert`; if it succeeds, this is the first time this exact delivery has been
>    seen, so processing continues. If it fails on a uniqueness violation (Postgres error
>    `23505`), this delivery has already been claimed — by the original attempt, or by an
>    earlier retry, running or finished — and the handler responds
>    `{ ok: true, duplicate: true }` immediately, doing nothing else. The primary key makes
>    this atomic: a retry that arrives *while* the first attempt is still mid-flight loses the
>    race just as reliably as one that arrives after it's already finished. Any *other*
>    database error is deliberately treated the same way — as unclaimed, do nothing — rather
>    than risking a double-send; a message that silently gets no reply this one time and
>    relies on the provider's own retry ladder to try again is a far better failure mode here
>    than a second reply and a second email reaching the customer.
> 2. **Respond before doing the actual work, not after.** Once an inbound message's event is
>    claimed, the handler no longer waits for the agent turn to finish. It schedules the real
>    work — `handleInboundMessage()` — inside `after()` (from `next/server`), which runs once
>    the HTTP response has already been sent, but still inside the same `maxDuration` budget.
>    The provider gets its fast `2xx` in well under a second; the agent still gets its full
>    15-30 seconds to think, look things up, and reply, just without the provider's retry
>    clock running against it. A `whatsapp.message.updated` status event doesn't go through
>    this at all — it's a single idempotent `UPDATE`, already fast enough that the provider has
>    no reason to retry it, and re-applying the same status twice is harmless anyway.
>
> **Verified**, not just reasoned about: replaying the identical event id twice through
> `scripts/simulate-webhook.js --id <fixed-id>` produces exactly one inbound row, one AI
> reply, and (once a lead was involved) one email on the first call, and
> `{ ok: true, duplicate: true }` with no further writes at all on the second — confirmed
> directly against the live database, not inferred from the response alone.

### 4.3 The two event types can never cross-contaminate

A WhatsApp message doesn't just "send" — it naturally transitions through
`sent → delivered → read` (and sometimes `failed`), and the provider posts a **separate**
webhook call for every single transition, for every message, inbound or outbound. That is a
lot of extra traffic relative to actual conversation volume, and it's an easy category of
bug for a chatbot's message-handling code to fall into: if a status-update payload ever gets
routed into the same path built for real messages, the agent can end up "replying" to a
delivery receipt, and that reply then generates its own delivery receipts, which can
themselves get routed the same way — a self-sustaining storm of replies from nothing.

Two independent properties in this codebase make that impossible here:

- The branch is `body.type === "whatsapp.inbound_message.received"` /
  `"whatsapp.message.updated"` — exact string equality, not a substring or prefix check. A
  status update can only ever reach the status-update branch.
- That branch calls exactly one function, `updateMessageStatus()`, and that function is a
  **structural dead end**: it does one `UPDATE wa_messages SET status = ...` and returns. It
  never calls the send function, never calls the agent, never touches `wa_contacts`. There is
  no code path — buggy routing or not — by which a status update can produce outbound
  traffic. No send means no new status event means the loop has nothing to close.

### 4.4 Routing an inbound message by type

`handleInboundMessage` switches on the inbound message's own `type`:

- **`text`** → straight to the conversational handler (4.5) with the message body.
- **`audio`** → fires the typing indicator, downloads the voice note, transcribes it with
  Whisper (`whisper-1`), then hands the transcript to the same conversational handler. From
  the agent's point of view, a voice note and a typed message are identical once
  transcribed.
- **`image` / `document`** → the media handler (4.6). **Deliberately no AI reply for media**
  — the file is downloaded, re-hosted, and shown in the inbox for the owner to handle by
  hand. This is a scope decision, not a limitation of the pipeline: nothing prevents adding a
  vision-capable path later.
- **anything else** (video, sticker, location, a contact card, a reaction, …) — logged as an
  `unsupported` message with no body, so the thread at least shows *something* arrived
  instead of the message vanishing with no trace.

### 4.5 The conversational handler — where the Detach gate lives

For every text/voice message:

1. `sendTypingIndicator()` fires (fire-and-forget; a failed typing indicator must never block
   the actual reply).
2. `upsertInboundContact()` does a SELECT-then-INSERT/UPDATE (not a single `upsert()` call,
   because the unread counter has to increment off its *previous* value, which PostgREST's
   upsert can't express in one round trip): a returning contact gets `unread_count + 1` and a
   refreshed 24-hour window; a genuinely new contact is inserted with `agent_active` taken
   from the sitewide default (section 7.5) rather than a hardcoded value. Either way it
   returns the contact's **current** `agent_active`.
3. The inbound message itself is logged to `wa_messages` unconditionally, detached or not —
   the owner should see every message that arrives regardless of who's answering it.
4. **If `agent_active` is false:** the message is appended to conversation memory as a
   `"human"` turn and the function returns. No AI reply, no typing indicator continuation —
   the customer simply sees the owner reply whenever they get to it. Logging to memory even
   though nobody is replying automatically matters: without it, re-attaching the AI later
   would have no idea what was said during the handoff and would re-ask questions the owner
   already answered.
5. **If `agent_active` is true:** load recent conversation memory and run the agent
   (section 5). Once it has a reply, **`isAgentActive()` is checked again**, immediately
   before sending — not reused from step 2. A full agent turn can take 15-30 seconds; if the
   owner hits Detach while it's still running, they've already decided to take over, and the
   reply generated before that decision must not go out anyway. If the recheck comes back
   false, the reply is still written to conversation memory (so re-attaching later isn't
   amnesiac about what the AI would have said) but is never sent. Otherwise, the reply goes
   out through the provider, gets logged as an `'ai'`-sender message, and both the customer's
   message and the agent's reply are appended to memory.

### 4.6 Media handling

Provider-hosted media links expire after a few days, so `handleMediaMessage` downloads the
file immediately and re-uploads it into the `wa-media` Storage bucket, storing *that* stable
URL rather than the original link — otherwise the inbox would show a broken thumbnail once
the original link expired. The contact and message rows are written the same way as the
conversational path, just with `sender: 'customer'` and no reply.

---

## 5. The AI agent

### 5.1 The reasoning loop

`runAgent()` (`lib/agent.ts`) is a small, explicit tool-calling loop written directly against
the OpenAI SDK — no framework in between:

```
messages = [system prompt, ...recent memory, current user message]
repeat up to 6 times:
  completion = chat.completions.create({ model, messages, tools })
  if no tool_calls: return the model's text as the reply
  else: push the assistant's tool_calls message, execute each tool,
        push each tool's result back as a role:"tool" message, loop
```

Six iterations is a deliberate ceiling — a real conversation turn needs at most a couple of
tool calls (look something up, maybe send an email), and a hard cap means a model stuck in a
call/re-call cycle fails safely with an apology message instead of hanging or looping
forever.

### 5.2 The two tools

- **`search_knowledge_base(query)`** — the model's only source of truth for anything about
  the company's properties, services, areas, pricing, or policies. It is explicitly
  instructed never to invent an answer it can't retrieve.
- **`submit_lead(fields, change_reason?, is_new_enquiry?)`** — hands the model's current
  understanding of the customer's request, as *structured* fields (name, phone, email,
  intent, property type, area, bedrooms, budget, timeline, etc.), to `lib/leads.ts`, which
  decides in code whether anything should actually be sent — see 5.4. The model does not
  write the email itself and does not decide whether this is a duplicate; it only supplies
  accurate fields and reacts to the plain-text status the tool hands back.

### 5.3 The system prompt's behavioral contract

The prompt (`agentPrompt.ts`) is long and specific because it's standing in for a lot of
business logic that would otherwise need to be hardcoded. Its rules, summarized:

- **Identify intent** — `BUY`, `SELL`, `RENT`, `INVEST`, or `GENERAL_INQUIRY` — from what the
  customer actually says, never by asking them to pick from a menu.
- **Two stages, in order: qualify, then contact details.** Stage 1 collects whatever the
  customer's intent actually requires (property type, area, bedrooms, budget + currency,
  purpose, timeline, and the RENT/SELL/GENERAL_INQUIRY equivalents). Only once Stage 1 is
  complete does Stage 2 ask for name, phone, and email. A general inquiry is never forced
  through a full qualification form for a simple question — see 5.4 for why this ordering
  exists and what broke without it.
- **One question at a time**, and never re-ask for something already given.
- **Always use the latest value.** If a customer revises their budget or any other detail
  mid-conversation, the new value replaces the old one everywhere the model tracks it.
- **React to `submit_lead`'s result, never assume it.** The tool always returns one of six
  exact status words (`SENT_NEW`, `SENT_UPDATE`, `NOT_SENT_DUPLICATE`, `NEEDS_REASON`,
  `TOO_SOON`, `SEND_FAILED`), each with a scripted customer-facing reaction — see 5.4. The
  model is explicitly forbidden from telling the customer their details were sent (or
  re-sent) unless *this turn's* tool result actually starts with `SENT_NEW` or `SENT_UPDATE`.
- **A changed value needs a reason; new information doesn't.** Adding a detail the customer
  never gave before needs no justification. Replacing a value they already gave — a
  different budget, a different area — means asking why before it's accepted.
- **Never fabricate confirmation.** No property is "definitely available," no viewing is
  "confirmed" — a successful submission means the details reached the company, nothing more.
- **Output is customer-facing text only.** No JSON, no "reply:" prefixes, no leaked reasoning
  or tool arguments — whatever the model returns goes straight to WhatsApp verbatim.

### 5.4 Lead state lives in the database, not in the model's memory

> [!bug] "I have sent your details" — three times, for one request
> **Symptom.** Once a customer had given everything needed for a booking, the agent kept
> declaring their details had been sent — repeatedly, on later turns where nothing had
> changed — and the company's inbox received a fresh identical lead email on some of those
> turns too. Section 4.2 explains one whole cause of this (the same webhook delivery being
> processed several times). This bug is the other, independent cause, and it needed a
> completely different fix.
>
> **Why.** Tool calls are not part of the conversation memory this app persists — only plain
> human/AI *text* turns are saved (section 5.7). Every time the agent ran, it was rebuilt from
> scratch with no record it had ever called the lead tool before. The prompt's rule was "call
> the tool once all required information is present," and once that condition became true, it
> **stayed true forever** — the model had no way to know it had already acted on it, so it
> re-satisfied the same rule, and re-sent, on every subsequent turn. The email tool itself
> (`mailer.ts`) sent whatever it was given, unconditionally, with no memory or rate limit of
> its own either.
>
> **Fix.** The decision was moved out of the model's (non-existent) memory of its own past
> actions and into `lib/leads.ts`, backed by the append-only `wa_leads` table (section 3).
> `submitLead(phone, { fields, changeReason?, isNewEnquiry? })` looks up the contact's most
> recent lead row and decides:
>
> | Situation | Action | What the model is told |
> |---|---|---|
> | No prior lead for this contact | send, `request_no 1 / revision 0` | `SENT_NEW` |
> | `is_new_enquiry` and materially different from the last one | send, `request_no + 1 / revision 0` | `SENT_NEW` |
> | Identical to the latest lead on file | **nothing sent** | `NOT_SENT_DUPLICATE` — must not claim anything was sent |
> | Differs from the latest lead, no reason given yet | **nothing sent** | `NEEDS_REASON` — ask why, then call again |
> | Differs, and a reason was given | send, `revision + 1` | `SENT_UPDATE` |
> | Any submission within 60 seconds of the last one | **nothing sent** | `TOO_SOON` (a backstop against a tool-call loop) |
>
> The email itself is built by `buildLeadEmail()` in code — not by the model — from the
> structured fields, so the New/UPDATE subject-line convention and the old→new "what changed"
> table in an update email are guaranteed consistent rather than hoped for. A row is only ever
> written to `wa_leads` *after* the email actually sends successfully; a send failure returns
> `SEND_FAILED` and records nothing, so a failed send can be retried on the next customer
> message rather than being silently treated as done.
>
> This is also why Stage 1 (qualification) has to come strictly before Stage 2 (contact
> details, section 5.3): the earlier prompt listed name/phone/email alongside the property
> questions with no ordering, so "all required information" — and therefore the mandatory
> submit condition — became true the moment contact details arrived, regardless of whether the
> actual property questions had been answered yet.
>
> **Verified** end-to-end against the live database (not just read as code): a fresh
> conversation was qualified, submitted once (`request_no 1 / revision 0`), told "no changes
> needed" twice with zero further sends, then had its budget changed — which correctly
> produced a "why?" question with no send, and only sent again (`revision 1`, with the stated
> reason and the old→new values) once that reason was given.

### 5.5 What each turn tells the model about its own state

Every system prompt is built with `getLatestLead(phone)` already resolved
(`buildSystemPrompt(userName, leadState)`), so the model is told, in plain language, either
that no request has been submitted for this contact yet, or exactly what was last submitted
(request number, revision, every field) plus an explicit instruction not to call `submit_lead`
again unless something has actually changed. This is what actually cures the amnesia
described in 5.4 — the fix isn't "make the model remember calling a tool," it's "stop needing
it to."

### 5.6 Retrieval (RAG)

`searchKnowledgeBase()` embeds the query with `text-embedding-3-small` at **1536 dimensions**
and calls a Postgres RPC (`match_khatri_real_estate_db`) against a pre-existing
pgvector-backed table of roughly 70 chunks. The embedding model and dimensionality are not a
free choice — they have to exactly match whatever originally populated that table's vectors,
or similarity search doesn't error, it just silently returns wrong (or empty) results, which
is a much worse failure mode than a crash. This was confirmed working by directly querying
the live table and RPC with a real embedding and inspecting the returned rows and similarity
scores, not just by absence of errors.

> [!bug] The agent didn't know its own company's name
> **Symptom.** Asked "what is your real estate agency called," the agent refused to answer —
> even though the company's name is the first thing in the knowledge base document, sits in
> the browser tab title, and is on the WhatsApp Business profile the customer was already
> messaging.
>
> **Why.** Vector search has no concept of "this appeared first in the source document" — the
> document was split into independent chunks at ingestion time, and retrieval just returns
> whichever chunks are numerically closest to the query's embedding, regardless of position.
> For a vague identity question, the closest chunk by a narrow margin turned out to be one
> containing a caution rule — "never state a company detail that is not in it... a licence
> number... take the request and pass it to a human rather than improvising," written to guard
> things like an unlisted direct mobile number or a second office — sitting right next to,
> but not clearly separated from, a plain statement of the company's name. The prompt itself
> never stated the company's name anywhere as a hard fact; it only ever said "a Dubai real
> estate company." With nothing certain to anchor to, and a strongly-worded caution rule
> retrieved alongside the name, the model generalized that caution to cover its own identity
> and refused.
>
> **Fix.** The company's name shouldn't depend on winning a similarity-ranking contest in the
> first place — it's an identity fact, not something that needs looking up, the same way an
> employee doesn't consult the staff handbook to remember who they work for. `agentPrompt.ts`
> now states the company's name directly in the Personality section as a known, always-safe
> fact, and explicitly notes that the knowledge base's "don't state unlisted details" caution
> governs things like licence numbers and direct phone lines, not the company's own name.
> **Verified**: the exact question that failed was re-sent through the live pipeline after the
> fix and answered correctly.

### 5.7 Conversation memory

`chatHistory.ts` reads and appends to a pre-existing conversation-memory table
(`khatri_real_estate_whatsapp_chat_history_new`, one row per turn, keyed by the contact's
phone number as the session id). The last 20 turns are loaded on every reply.

> [!bug] The nested-vs-flat JSON shape
> This table's real rows store each message as a **flat** object —
> `{"type": "human"|"ai", "content": "...", "additional_kwargs": {}, "response_metadata": {}}`
> — with the text sitting directly on `content`. A more commonly-documented convention for
> this kind of table nests it one level deeper as `{"type": ..., "data": {"content": ...}}`.
> Code written against that assumption compiled and ran without error, and silently returned
> an empty history on every single read — the agent had total amnesia on every message,
> with no exception anywhere to point at the cause. This was only caught by inspecting the
> table's actual pre-existing rows directly rather than trusting the more common shape.
> **Fix:** writes use the flat shape to match the real data; reads defensively accept
> *either* shape (`content ?? data?.content`), so both old and new rows work uniformly.

### 5.8 The lead email transport

`mailer.ts` is a thin Nodemailer/SMTP wrapper with exactly one job: send whatever subject and
HTML body it's handed, from a fixed sender to a fixed company inbox. It makes no decisions —
it doesn't know what a "duplicate" or an "update" is, has no memory, and enforces no rate
limit. All of that content and decision-making — whether to send at all, the New/UPDATE
subject convention, the old→new "what changed" table — lives in `lib/leads.ts`, one level up
(section 5.4), specifically so the email itself is built from consistent code rather than a
model composing HTML fresh every time.

---

## 6. Sending messages back out

### 6.1 One adapter, one place that knows the provider

`lib/ycloud.ts` is the only file in the codebase that knows the provider's endpoint, auth
header, and request body shape. Every outbound path — the agent's replies, the owner's
manual text/media sends, the typing indicator — calls through this one module. The
consequence is that a future move to a different WhatsApp Business Platform provider (Meta's
Cloud API directly, or a different BSP) is a rewrite of this one adapter, not a hunt through
every route that happens to send a message.

### 6.2 Manual sends bypass the agent pipeline entirely

`/api/send` and `/api/send-media` (the owner typing in the inbox) call `sendText`/`sendMedia`
directly — they do **not** go through `runAgent` or anything resembling it. Two reasons:

- **Independence.** If anything in the agent's pipeline were ever degraded (a bad deploy, an
  OpenAI outage), the owner should still be able to reply to a customer with a single fetch
  call standing between the button and the provider's API.
- **Unambiguous attribution.** A message that went through the manual-send path is written
  with `sender: 'human'`; a message the agent produced is written with `sender: 'ai'`. Two
  different code paths writing two different values is a much stronger guarantee than one
  shared path relying on a flag to remember which case it's in.

Both manual-send routes also append the sent text to conversation memory (as an `'ai'`-role
turn, from the model's point of view — "ai" here is memory's two-party framing of "the
business side of the conversation," not a claim about who authored the words) so the agent
stays aware of what the owner said if the conversation is later handed back.

### 6.3 The 24-hour customer-service window

WhatsApp only allows free-form business messages inside a 24-hour window opened by the
customer's own last inbound message; outside it, only a pre-approved template message can
reach them. This is a platform rule enforced by WhatsApp's own servers, not something this
app can choose to relax.

- `wa_contacts.window_expires_at` is refreshed to "now + 24h" on every genuine inbound
  message.
- `/api/send` and `/api/send-media` check it **server-side**, on every request, and refuse
  with a `409` and an explanit error if it has passed — this is the actual enforcement.
- The UI's own banner (`isWindowExpired()`) is informational only, computed from the same
  column at render time; it exists so the owner sees the warning before typing, not as the
  thing that actually blocks the send.

`sendTemplate()` exists in the adapter and is fully wired up to the provider's template API,
but no route calls it yet — starting a conversation with a contact outside their window
(rather than just keeping one open) is a deliberately deferred feature; see section 12.

### 6.4 Delivery and read ticks

Every send's response `id` is stored as `wa_messages.ycloud_id`. When a
`whatsapp.message.updated` webhook later arrives reporting `sent`/`delivered`/`read`/`failed`
for that id, `updateMessageStatus()` matches on it and updates the row — which the UI picks
up instantly through the realtime subscription described next, without any polling.

---

## 7. The web inbox UI

### 7.1 Realtime, not polling

`InboxApp` opens two Supabase Realtime subscriptions on mount: one on `wa_contacts` (every
event type), one on `wa_messages` scoped to whichever contact is currently open. A brand-new
contact's first message makes them appear in the sidebar with no refresh; a new message
appends a bubble; a status update flips the ticks; a deletion (contact or message) removes
the row live, including in a second browser tab open on the same conversation. There is no
polling anywhere in the UI.

### 7.2 Layout

Left rail (contact list, search, the settings/sign-out row) and a right pane (conversation
header, scrollback with date separators, composer) — the WhatsApp Desktop layout, at desktop
widths. Section 9 covers how this collapses to a single full-screen pane per view on a phone.

### 7.3 The Detach control

The one piece of the UI **not** modeled on WhatsApp itself, because it's the actual reason
this application exists: a pill in the conversation header that flips `agent_active` for
that one contact.

- **Attached (green, bot icon):** the AI answers this contact automatically, as described in
  section 4.5.
- **Detached (amber, person icon):** the AI is silent for this contact; the owner is expected
  to reply by hand. A persistent banner reinforces this above the composer.

The toggle writes optimistically straight from the browser (so the UI feels instant off the
realtime echo) and then calls `/api/agent`, which re-applies the same write through the
service-role key so that `detached_by` — *who* took over — is recorded server-side, where the
identity is actually trustworthy rather than something the client merely claims.

Every outgoing bubble also carries a small "AI" / "You" tag (from `wa_messages.sender`, see
section 3), so scrolling back through a conversation that changed hands several times is
never ambiguous about who said what.

### 7.4 Message-level actions, and their honest limits

Hovering a message reveals up to two actions:

- **Send a correction** (own outgoing messages only) — pre-fills the composer with a
  reference to the original message, ready to send as a brand-new outbound message.
- **Remove from inbox** (any message) — deletes the row from this app's own database only.

Neither of these edits or deletes anything on the customer's actual phone. That's not a
missing feature to build later — the WhatsApp Business Platform simply does not expose an
endpoint to edit or delete a message that has already been delivered to a customer; "edit
message" and "delete for everyone" are consumer-app, client-to-client features that no
Business Platform provider (YCloud included) has any way to trigger on a business's behalf.
The UI is explicit about this in its own confirmation copy rather than implying a stronger
guarantee than the platform can actually deliver.

### 7.5 Settings: the default reply mode for new contacts

A gear icon next to Sign Out opens a small panel with exactly one setting today: whether a
contact who has **never messaged before** starts out attached to the AI or waiting for a
human. This only decides the starting point for a brand-new phone number —
`upsertInboundContact()`'s insert branch reads it — it never touches an existing contact's
`agent_active`, which stays entirely under the per-conversation Detach control in 7.3.

### 7.6 Contact management

The header's "⋮" menu offers renaming a contact (a purely local display name — WhatsApp
itself has no concept of a business-assigned name) and deleting one entirely. Deleting a
contact cascades to every message in that thread (the foreign key is `on delete cascade`) and
only forgets them on this app's side — it doesn't block or notify the customer, and they
simply reappear as a brand-new contact if they message again.

### 7.7 The request/revision badge

The conversation header shows a small line under the contact's phone number once a lead
exists for them — "Request #1 sent" for a first submission, or "Request #1 · 2 updates" once
it's been revised — so the one-request-per-enquiry rule (section 5.4) is visible at a glance
from the UI, not just enforced invisibly in the background. It's driven by a Realtime
subscription on `wa_leads` scoped to the open contact's phone (`event: "INSERT"` only, since
`wa_leads` rows are never updated or deleted — the latest insert is always the current state),
plus an initial fetch on open. Because the agent's turn runs in the background after the
webhook responds (section 4.2), a lead can genuinely appear seconds after the owner opened the
conversation — this badge updating live, with no refresh, is what makes that visible rather
than surprising.

### 7.8 Icons and branding

Every icon in the UI is an inline SVG component (`components/icons.tsx`) — no emoji glyphs,
which render inconsistently across platforms and can't take a hover color the way a real
icon button can. The favicon, home-screen icon, and browser tab title are the business's own
branding, set via Next's file-convention icons (`app/icon.png`, `app/apple-icon.png`) and the
root `metadata` export. The Next.js development-mode route indicator badge is turned off
(`devIndicators: false`) since this is a finished internal tool, not something that needs a
visible "you're in dev mode" reminder.

---

## 8. Auth and access control

Supabase Auth, email + password, session held in a cookie via `@supabase/ssr`.

- **`proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`; the old filename simply
  never runs under this version) refreshes the session cookie and redirects unauthenticated
  *browser navigation* to `/login`. It explicitly does nothing for any `/api/**` path.
- **Every API route calls `requireUser()` itself**, independently of the proxy, and returns a
  `401` JSON response rather than a redirect if there's no session.

This duplication is deliberate, not an oversight, for two reasons that both matter:

1. The webhook endpoint (`/api/whatsapp/webhook`) is called directly by the WhatsApp
   provider, which has no Supabase session cookie at all and is authenticated a completely
   different way (the HMAC signature in section 4.1). If the proxy applied its
   redirect-to-`/login` logic to that path, every real inbound WhatsApp message would bounce
   off a 307 redirect and never reach the handler at all.
2. A `fetch()` call from client code expects a JSON error on failure, not an HTML login page
   — a redirect would break every API caller in the UI just as thoroughly as it would break
   the webhook.

> [!bug] The proxy redirecting the webhook
> The very first version of the proxy's route matcher didn't exclude `/api/**`, so an
> unauthenticated call to `/api/whatsapp/webhook` — which is *every* call, since the provider
> never has a session cookie — was silently 307-redirected to `/login` instead of ever
> reaching the handler. This would have completely broken production (every inbound WhatsApp
> message simply disappearing) while returning what looks like a normal HTTP response, not an
> error. Found by directly `curl`-ing the endpoint and noticing the redirect rather than the
> expected JSON response; fixed with both an early-return guard inside `proxy()` for any path
> starting with `/api/` and a matching exclusion in the route matcher itself, so the same bug
> can't come back if either one alone is later reverted.

---

## 9. Mobile and cross-device layout

The UI targets desktop, tablet, and phone from one codebase — not a scaled-down desktop view,
but the same single-pane-vs-two-pane pattern a native chat app uses.

### 9.1 Single pane on mobile, two panes on desktop

Below the `md` breakpoint, the app shows either the contact list *or* an open conversation
full-screen, never a cramped attempt at both — a back button in the conversation header
returns to the list. At `md` and above, both panes sit side by side. The "select a
conversation" empty-state placeholder only exists at desktop widths, since a phone is never
looking at empty space with nothing to fill it.

### 9.2 The on-screen keyboard covering the composer

> [!bug] Composer hidden behind the keyboard
> **Symptom.** On a phone, tapping the message box to type made the on-screen keyboard slide
> up as expected, but the composer itself ended up rendered underneath where the keyboard now
> covered the screen, rather than sliding up to sit directly above it.
>
> **Why.** Mobile browsers track two different viewports: a *layout* viewport (what CSS
> sizing is computed against) and a *visual* viewport (what's actually visible right now).
> Opening the keyboard shrinks the visual viewport, but on most browsers the layout viewport
> — and therefore any CSS height, including the dynamic-viewport `dvh` unit — doesn't change
> at all. The app shell is a fixed-height flex column with the composer pinned to the bottom
> of it; if that height never shrinks, the composer's on-screen position never moves, and the
> keyboard simply covers whatever was already there. Normally a browser compensates by
> auto-scrolling the page so a focused input stays visible, but that only works for ordinary
> page scrolling — this app disables page-level scroll entirely (`overflow: hidden` on the
> root) to behave like a fixed native app shell, which removes the one mechanism the browser
> would otherwise have used to fix this itself.
>
> **Fix, two layers.** The `viewport` metadata now sets `interactiveWidget: "resizes-content"`
> — on browsers that honor it, this makes the *layout* viewport genuinely shrink when the
> keyboard opens, so the composer reflows above it through ordinary flexbox with no JavaScript
> involved. For browsers that ignore that hint, a `window.visualViewport` listener explicitly
> sets the app shell's height in pixels to match the real visual viewport on every resize —
> the same outcome, reached in code, everywhere else.
>
> **And the composer being visible isn't enough on its own:** the message thread also needs
> the latest message to still be in view once the keyboard is up. Tapping the composer
> immediately scrolls the thread to the bottom, and — because the keyboard takes a couple
> hundred milliseconds to finish animating in, which shrinks the thread's height *after* that
> first scroll already ran and would otherwise leave a visible gap at the bottom — the same
> scroll re-fires on every `visualViewport` resize event **while the composer is still the
> focused element**. That last condition matters: without it, the exact same listener would
> also fire just because the browser's address bar collapsed while the owner was scrolled up
> reading old messages with the composer untouched, yanking them back down uninvited. Scoping
> the re-scroll to "only while actually typing" gets the keyboard behavior right without ever
> touching scroll position the owner didn't ask to change.

### 9.3 Other device-specific fixes

- **iOS zoom-on-focus.** Any text input under 16px triggers Safari's automatic page zoom on
  focus. Every free-text input (composer, contact-name edit, search, login fields) is
  `text-base` (16px) below the `sm` breakpoint and drops back to a smaller desktop size above
  it, rather than fighting the zoom with a `maximum-scale` lock that would also disable the
  user's own ability to zoom for accessibility.
- **Safe-area insets.** `viewportFit: "cover"` plus `env(safe-area-inset-bottom)` padding on
  the composer and the sidebar's footer row, so the send button and sign-out row aren't
  obscured by the home-indicator bar on notched phones.
- **`overscroll-contain`** on both scrollable panes, so reaching the end of a scroll never
  chains into the browser's own pull-to-refresh/bounce.
- Bubbles, header controls, and padding all scale down progressively (bubble max-width,
  icon-only header pills, tighter side padding) so a 320px-wide screen never causes
  horizontal overflow or visibly cramped controls.

---

## 10. Testing without a live phone

`scripts/simulate-webhook.js` signs a synthetic provider payload with the real webhook
secret and posts it to the local webhook endpoint, so the entire pipeline — signature
verification, contact upsert, the Detach gate, the agent's reasoning and tool calls,
conversation memory — can be exercised end-to-end without needing an actual WhatsApp message
to arrive. It supports simulating a text message, an image, a document, and a delivery-status
update.

An `--id <event-id>` flag pins the outer webhook envelope's own id instead of generating a
fresh random one, which is exactly what a real provider retry of the same delivery looks like.
Running the same command twice with the same `--id` is the actual test for the idempotency
claim in section 4.2: the first call processes normally; the second must come back
`{ ok: true, duplicate: true }` with no second reply, no second email, and no second row
written anywhere.

**Its one real limitation:** it can only affect this application's own database state, not
WhatsApp's own servers. The 24-hour reply window (section 6.3) is enforced by WhatsApp based
on genuine phone-to-business traffic; a simulated inbound message can make this app's own
`window_expires_at` column look open, but it cannot open a real window on WhatsApp's side. A
manual send made against a window that only *looks* open in the local database, but isn't
real, is correctly rejected by the platform — that's WhatsApp doing its job properly, not a
bug in this app. The only way to test a real manual send is a genuine inbound message from an
actual phone.

Local development is normally reached through an `ngrok` tunnel pointed at the dev server,
with the provider's webhook URL updated to match — Next.js's dev server also needs the
tunnel's hostname added to `allowedDevOrigins`, or it silently blocks the tunnel's own
HMR/asset requests, which otherwise looks like the whole UI being non-interactive (buttons
that do nothing) rather than an obvious network error.

---

## 11. Working on this project

### Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```

### Database setup

1. Run `supabase/schema.sql` once, in the Supabase SQL editor.
2. Run `supabase/002_app_settings.sql` once — an incremental migration added after the base
   schema (kept separate because `schema.sql`'s `create policy` statements aren't safe to
   re-run against a database that already has them).
3. Run `supabase/003_leads_and_events.sql` once — adds `wa_webhook_events` and `wa_leads`
   (section 3, section 4.2, section 5.4). A fresh install gets both from `schema.sql` directly;
   this migration exists for a database that already existed before they were added.

### Environment variables

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server Supabase clients, `proxy.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` — server-only, bypasses RLS |
| `YCLOUD_API_KEY` | `lib/ycloud.ts` — every outbound send + typing indicator |
| `YCLOUD_WEBHOOK_SECRET` | `lib/signature.ts` — inbound webhook verification |
| `OPENAI_API_KEY` | chat model, embeddings, Whisper |
| `OPENAI_CHAT_MODEL` | optional, defaults to `gpt-4o-mini` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | `lib/mailer.ts` |

None of these carry a `NEXT_PUBLIC_` prefix except the two Supabase values that are
explicitly meant for the browser (a URL and an anon key, neither of which is a secret by
design) — every other credential is server-only and never reaches the client bundle.

---

## 12. Known gaps and deferred work

- **Owner-initiated new conversations.** Starting a conversation with a contact *outside*
  their 24-hour window needs an approved WhatsApp template message. `sendTemplate()` already
  exists in the provider adapter and the schema already tracks `window_expires_at` for it,
  but no UI or route calls it yet.
- **Single-owner only.** There's one implicit "owner" role; `wa_contacts.detached_by` records
  *which* signed-in user took over a chat, but there's no concept of multiple staff accounts
  with different permissions.
- **No batching for genuinely rapid-fire, distinct messages.** The duplicate-reply bug in
  section 4.2 turned out to be the same delivery retried, not a customer sending several real
  messages seconds apart — so no debounce/batching window was built. If distinct rapid-fire
  messages later prove to need it, section 4.2's idempotency claim would need to coexist with
  it deliberately rather than being replaced by it.
- **No owner-facing "start a new request" control.** `submit_lead`'s `is_new_enquiry` flag lets
  the model itself recognize a genuinely separate enquiry from the same contact, but there's no
  UI button for the owner to force a fresh `request_no` by hand.
- **`.env.local.example` currently holds real-looking credential values rather than
  placeholders** for a couple of variables — worth scrubbing to actual placeholder text
  before this repository is shared any more widely than it already has been.
- **No automated test suite.** Verification so far has been `lint` + `next build` (clean
  TypeScript and ESLint) plus the signed-payload simulation script for the message pipeline,
  and manual testing in the browser for the UI. There is no CI and no Playwright/unit test
  layer yet.
- **Not deployed.** Everything above has been built and tested against a local dev server
  reached through an `ngrok` tunnel; a Vercel (or equivalent) deployment with real
  environment variables is a deliberately separate next step, not yet done.
