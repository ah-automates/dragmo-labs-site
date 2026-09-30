/**
 * Serializes a JSON-LD graph into a string safe to embed inside a `<script>`
 * tag. A blanket less-than replace is enough on its own: in JSON output that
 * character can only ever occur inside a string literal, where the escape
 * sequence used here is valid, so this one rule defeats a closing script
 * tag, an opening one, and an HTML comment opener alike, without touching
 * any structural character. The two Unicode line/paragraph separators are
 * stripped too: valid JSON, but historically unsafe inside a script body in
 * some engines.
 */
function serialize(data: unknown): string {
  const LESS_THAN = String.fromCharCode(0x3c);
  const LINE_SEPARATOR = String.fromCharCode(0x2028);
  const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

  return JSON.stringify(data)
    .split(LESS_THAN)
    .join("\\u003c")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}

/**
 * Renders one `application/ld+json` block. CSP needs no change for this: an
 * inline `<script>` is already emitted for the accessibility bootstrap in
 * `layout.tsx`, and `next.config.ts` already carries `'unsafe-inline'` on
 * `script-src`.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
