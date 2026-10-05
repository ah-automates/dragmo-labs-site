import type { FaqEntry } from "@/lib/faq";

/**
 * Company-wide FAQ content for `/faq` — questions that belong to no single
 * product or service page. Product- and service-specific questions live
 * beside that data instead (`Product.faq` in `products.ts`, `Service.faq`
 * in `services.ts`) so each answer sits next to the page it is actually
 * true of.
 *
 * Every answer here traces to a real, already-published fact: `data.ts`,
 * `policies.ts`, `about.ts`, or a product/service's own copy. None of this
 * invents a policy the site does not already state elsewhere — the same
 * rule `design-system/MASTER.md` §7 applies to numbers applies here to
 * claims about how the business runs.
 */
export type FaqCategory = {
  id: string;
  heading: string;
  entries: readonly FaqEntry[];
};

export const companyFaq: readonly FaqCategory[] = [
  {
    id: "company",
    heading: "About Dragmo Labs",
    entries: [
      {
        question: "What does Dragmo Labs do?",
        answer:
          "Dragmo Labs is an AI automation and software development studio. We design, build, and ship intelligent systems, AI agents, automation workflows, and custom software, that help businesses run more efficiently.",
      },
      {
        question: "Where is Dragmo Labs based?",
        answer: "We are remote-first, serving clients worldwide.",
      },
      {
        question: "Who founded Dragmo Labs?",
        answer:
          "Abdul Hadi founded Dragmo Labs. You can read his vision for the studio on the About page.",
      },
      {
        question: "What industries do you work with?",
        answer:
          "Our published work today is in real estate (Chatshift, our WhatsApp agent, a voice agent, and a cinematic property website) and a water filtration company's website and invoicing system. Chatshift is built for any niche, and the underlying systems, AI agents, automation, and custom software, apply to any business running repetitive processes.",
      },
    ],
  },
  {
    id: "working-with-us",
    heading: "Working With Us",
    entries: [
      {
        question: "What does your process look like?",
        answer:
          "Every engagement moves through the same six stages: Discover, Strategize, Design, Build, Launch, and Grow, from understanding the problem to measuring what happens after launch.",
      },
      {
        question: "How long does a project take?",
        answer:
          "It depends on scope, complexity, required integrations, and how quickly feedback and access come back from your side. Estimated delivery dates are estimates unless a specific deadline is guaranteed in writing.",
      },
      {
        question: "Do you offer a free consultation?",
        answer:
          "Yes. Every product page offers a free strategy call, no proposal fee, no obligation to move forward.",
      },
      {
        question: "Will I get to review the design before development starts?",
        answer:
          "For website and application work, yes. Every page is designed and approved before development starts, so you see the site before it exists.",
      },
      {
        question: "What happens after launch? Do you offer ongoing support?",
        answer:
          "Post-launch support, maintenance, and updates are provided only if included in your project agreement or purchased as a separate service.",
      },
    ],
  },
  {
    id: "pricing",
    heading: "Pricing & Payment",
    entries: [
      {
        question: "How much does a project cost?",
        answer:
          "We do not publish prices, because a number given before a real conversation about your scope, integrations, and volume is a guess dressed up as a quote. You get a real number after a free strategy call, in writing.",
      },
      {
        question: "What actually affects the price?",
        answer:
          "Scope of the build, how many existing systems it needs to integrate with, data migration complexity, and your timeline.",
      },
      {
        question: "Are deposits refundable?",
        answer:
          "Project deposits are generally non-refundable once work has started. They reserve development time and cover planning, research, design, and development activity.",
      },
      {
        question: "What costs are non-refundable?",
        answer:
          "Work already completed, development hours already used, and costs like third-party subscriptions, AI or API usage fees, domain and hosting fees, and payment processing fees.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "A refund may be considered if we are unable to begin the agreed project due to our own fault, unable to deliver the core service after reasonable attempts, or where a refund is specifically required under applicable law.",
      },
    ],
  },
  {
    id: "support",
    heading: "Support & Guarantees",
    entries: [
      {
        question: "What is your guarantee?",
        answer:
          "A privacy promise, not a hard sell: your details are used to answer your one enquiry and nothing else, we do not sell your information or add you to a marketing list, and if the honest answer is you do not need what we build, you will hear that on the call.",
      },
      {
        question: "What if requirements change mid-project?",
        answer:
          "Revisions within the originally agreed scope are handled under your project agreement. Additional features or changes outside that scope may need additional time and payment.",
      },
      {
        question: "Is there a limit on how many projects you take at once?",
        answer:
          "Yes. We take a small number of builds at a time because the same people who scope your call end up building it, and we will tell you honestly if we are full rather than after weeks of silence.",
      },
    ],
  },
  {
    id: "privacy",
    heading: "Data, Privacy & Security",
    entries: [
      {
        question: "Will my business data be used to train a public AI model?",
        answer:
          "No. AI systems we build are configured against your own data for your own use. We do not sell personal information, and any third-party platform used to deliver a project processes client data only as needed for that project.",
      },
      {
        question: "Do you use cookies or tracking on your own website?",
        answer:
          "We use Google Analytics, gated behind consent. No analytics cookie is set until you choose to accept it, and you can change that choice anytime from the Cookie Preferences link in the footer.",
      },
      {
        question: "How long do you keep our data?",
        answer:
          "Only as long as reasonably necessary to provide the service, complete active projects, and meet legal, accounting, or contractual obligations, after which it is securely deleted or anonymized.",
      },
    ],
  },
];

/** Flattened, for the page's single `FAQPage` schema. */
export function allCompanyFaqEntries(): FaqEntry[] {
  return companyFaq.flatMap((category) => category.entries);
}
