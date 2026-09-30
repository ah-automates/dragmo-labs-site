/**
 * Shared FAQ entry shape for products and services. Lives in its own module
 * rather than inside `products.ts` or `services.ts` so neither file gains an
 * import edge on the other just to share a type (see `context.md` §2 on the
 * `products.ts` / `case-studies.ts` type-only-import rule).
 */
export type FaqEntry = { question: string; answer: string };
