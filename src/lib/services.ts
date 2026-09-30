import type { ImageId } from "@/lib/images";
import type { FaqEntry } from "@/lib/faq";
// Type-only imports: `services.ts` has zero runtime edge to either module,
// so importing `services` (as `footer.tsx` and `nav.ts` both do) never pulls
// case-study or product copy into a bundle that only needed a slug. See
// `design-system/pages/product.md` §6 and `context.md` §2 for the same rule
// applied to `products.ts` / `case-studies.ts`. Never import this file from
// `src/lib/data.ts` or from a client component.
import type { CaseStudy } from "@/lib/case-studies";
import type { Product } from "@/lib/products";

export type ServiceSlug =
  | "ai-solutions"
  | "ai-automation"
  | "web-development"
  | "web-applications"
  | "ui-ux-design"
  | "ai-consultation";

export type Signal = { situation: string; cost: string };
export type Deliverable = { name: string; body: string };
export type Stage = { term: string; definition: string };
export type CostFactor = { factor: string; detail: string };

export type ProofRef =
  | { kind: "case-study"; slug: CaseStudy["slug"] }
  | { kind: "product"; slug: Product["slug"] };

export type ServiceDetail = {
  eyebrow: string;
  headline: string;
  lede: string;
  signals: {
    heading: string;
    entries: readonly [Signal, Signal, Signal];
  };
  deliverables: {
    heading: string;
    entries: readonly [Deliverable, Deliverable, Deliverable, Deliverable];
  };
  engagement: {
    heading: string;
    paragraphs: readonly [string, string];
    stages: readonly [Stage, Stage, Stage];
  };
  /**
   * Only set for services with no honest single number to quote — every
   * engagement is scoped per client, so this answers the real "what does
   * this cost" search intent qualitatively instead of publishing a price
   * (MASTER §7/§8: no invented numbers, and a fabricated range is exactly
   * that). `null`/unset elsewhere; not every service needs this section.
   */
  costFactors?: {
    heading: string;
    intro: string;
    entries: readonly [CostFactor, CostFactor, CostFactor, CostFactor];
    note: string;
  };
  /**
   * `null` when no real client work backs this capability. That is the
   * honest value for at least two services here — never stretch a case
   * study or product onto a capability it did not actually involve.
   */
  proof: {
    label: string;
    heading: string;
    cases: readonly [ProofRef] | readonly [ProofRef, ProofRef];
  } | null;
  closing: {
    title: string;
    description: string;
    /**
     * Which of the site's two standing CTA labels applies (MASTER §7: one
     * label per intent, so this is a discriminant onto existing constants,
     * never a free-text label). Defaults to `"contact"`.
     */
    cta?: "contact" | "strategy-call";
  };
};

export type Service = {
  slug: ServiceSlug;
  icon: "brain-circuit" | "bot" | "globe" | "layout-panel-left" | "pen-tool" | "briefcase";
  title: string;
  description: string;
  /**
   * Overrides for the `<title>`/meta description only, when the researched
   * primary search term (see `context.md`'s SEO note) differs from the
   * on-page `title`/`description` — e.g. buyers search "AI readiness
   * assessment" more than "AI Consultation". Unset falls back to
   * `title`/`description`, so most services need nothing here.
   */
  seo?: { title?: string; description?: string };
  /** Category labels shown on the `/services` row regardless of imagery.
   *  `ai-consultation` is the only service that carries these today. */
  tags?: string[];
  /** Art from the generated pipeline (`scripts/generate-images.mjs`). */
  image?: ImageId;
  /** Hand-supplied art for a service with no generated slot yet — mirrors
   *  `CaseStudy.poster`. Takes priority over `image` where both are set.
   *  A service with neither gets the photo-less hero (see
   *  `design-system/pages/service.md` §3). */
  poster?: { src: string; alt: string };
  /** Same shape and same rule as `Product.faq`: only a question this
   *  service's own copy already answers elsewhere. Optional — most services
   *  need nothing here. */
  faq?: readonly FaqEntry[];
  detail: ServiceDetail;
};

export const services: Service[] = [
  {
    slug: "ai-solutions",
    icon: "brain-circuit",
    title: "AI Solutions",
    description:
      "Custom models and LLM-powered features trained on your data, your workflows, and your commercial goals rather than a generic template.",
    seo: { title: "Custom AI Solutions & Development" },
    image: "capabilityAi",
    faq: [
      {
        question: "Will the AI be trained on our own data, or a generic model?",
        answer:
          "It is configured against your own data and workflows, so answers reflect your actual business rather than a generic training set.",
      },
      {
        question: "Does the AI know when to hand a conversation to a person?",
        answer:
          "Yes. The agents are built to hold a real conversation, ask follow-up questions, and know when to hand off to a person, on the channel your customers already use.",
      },
      {
        question: "Who owns the system once it is live?",
        answer:
          "You do. We hand over the code, the data pipelines, and documentation, and stay available for the tuning that real usage surfaces.",
      },
      {
        question: "How do you make sure the system does not fail on edge cases?",
        answer:
          "We test against real conversations and edge cases before launch, with monitoring in place so drift and failure modes get caught, not discovered by a customer.",
      },
    ],
    detail: {
      eyebrow: "Custom AI Systems",
      headline: "AI Systems Trained On Your Own Data",
      lede: "We build custom models and AI-powered features around your own data and workflows, not a generic template with your logo on it.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation:
              "Your team answers the same category of question over and over, and a generic chatbot keeps giving generic answers because it was never trained on your actual inventory, policies, or history.",
            cost: "Every one of those repeated answers is a person's attention pulled away from the work only a person can do.",
          },
          {
            situation:
              "You have years of internal data, documents, or conversation history sitting unused because nothing in your stack can reason over it.",
            cost: "The knowledge exists, but it lives in someone's head or a folder nobody searches, so it gets rebuilt from scratch every time it is needed.",
          },
          {
            situation:
              "You want an AI feature inside your own product, not a bolted-on widget that sends your customers' data to a third party.",
            cost: "Off-the-shelf AI tools force you to shape your workflow around their limits instead of the other way around.",
          },
        ],
      },
      deliverables: {
        heading: "What We Build",
        entries: [
          {
            name: "Domain-Trained Models",
            body: "Language models and retrieval systems configured against your own data, so answers reflect your actual business, not a generic training set.",
          },
          {
            name: "Conversational Agents",
            body: "Agents that hold a real conversation, ask the right follow-up questions, and know when to hand off to a person, built for the channel your customers already use.",
          },
          {
            name: "Embedded AI Features",
            body: "AI capability built directly into your existing product or internal tools, under your own authentication and your own data boundaries.",
          },
          {
            name: "Evaluation And Guardrails",
            body: "Testing against real conversations and edge cases before launch, with monitoring in place so drift and failure modes get caught, not discovered by a customer.",
          },
        ],
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We start by mapping the exact decisions and data the system needs access to, then scope a first version narrow enough to ship and evaluate quickly rather than guessing at the full scope up front.",
          "Once it is live, you own the system outright. We hand over the code, the data pipelines, and documentation, and stay available for the tuning that real usage always surfaces.",
        ],
        stages: [
          {
            term: "Data And Scope Mapping",
            definition: "We identify what data the system can draw on and what decisions it is actually allowed to make.",
          },
          {
            term: "Build And Evaluate",
            definition: "We build against real examples and test the system on cases it has not seen before it ever reaches a customer.",
          },
          {
            term: "Handover And Tuning",
            definition: "You receive full ownership of the system, and we stay on to tune it against real usage patterns.",
          },
        ],
      },
      proof: {
        label: "Built And Shipped",
        heading: "A custom AI system, live on two channels",
        cases: [{ kind: "case-study", slug: "khatri-real-estate" }],
      },
      closing: {
        title: "Have data worth building on?",
        description:
          "Tell us what your team answers on repeat, and we will map out whether a custom AI system is the right fix.",
        cta: "contact",
      },
    },
  },
  {
    slug: "ai-automation",
    icon: "bot",
    title: "AI Automation",
    description:
      "Connect the tools you already run, remove the manual handoffs between them, and scale volume without scaling headcount.",
    // "AI automation services" over "agency": autocomplete research shows
    // "AI automation agency" is dominated by people wanting to start their
    // own agency (saturated/profitable/reddit), not hire one.
    seo: {
      title: "AI Automation Services For Business",
      description:
        "AI automation services that connect the tools you already run and remove the manual handoffs between them, so you scale volume without scaling headcount.",
    },
    image: "capabilityAutomation",
    faq: [
      {
        question: "What kind of workflow is worth automating first?",
        answer:
          "We start with the workflow that costs the most hours today and automate the steps that are genuinely repetitive, not the ones that only look that way.",
      },
      {
        question: "Will we be able to see the automation actually running?",
        answer:
          "Yes. It ships behind an operational dashboard, so your team can see the workflow running rather than trusting it blindly.",
      },
      {
        question: "What stops a wrong number or a missing field from reaching a client?",
        answer:
          "Verification checks are built into the workflow itself at every point data changes hands, so mistakes get caught before they reach a client.",
      },
      {
        question: "Can automation replace hiring for repetitive work?",
        answer:
          "In workflows where the added work is repetitive rather than judgment calls, a connected system can absorb volume that would otherwise mean growing headcount.",
      },
    ],
    detail: {
      eyebrow: "Workflow Automation",
      headline: "Automation That Removes The Manual Handoffs",
      lede: "We wire the tools you already use into one workflow, so the manual handoffs between them stop costing you time.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation:
              "The same piece of information gets typed into three different systems by three different people, because nothing talks to anything else.",
            cost: "Every manual re-entry is a chance for the number to change on the way, and nobody notices until a customer does.",
          },
          {
            situation: "A process that should take minutes waits in a queue because it depends on someone remembering to run it.",
            cost: "Work backs up behind a person's availability instead of moving as soon as it is ready.",
          },
          {
            situation: "You are hiring to keep up with volume, and the work being added is repetitive, not judgment calls.",
            cost: "Headcount grows in step with volume that a connected system could absorb instead.",
          },
        ],
      },
      deliverables: {
        heading: "What We Build",
        entries: [
          {
            name: "System Integrations",
            body: "Direct connections between the tools you already run, so data moves between them without a person copying it by hand.",
          },
          {
            name: "Automated Workflows",
            body: "Multi-step processes that trigger themselves the moment the work is ready, instead of waiting on someone to notice and start them.",
          },
          {
            name: "Verification Steps",
            body: "Automated checks built into the workflow itself, so a wrong number or a missing field gets caught before it reaches a client, not after.",
          },
          {
            name: "Operational Dashboards",
            body: "A live view of what the automation is doing, so your team can see the workflow running rather than trusting it blindly.",
          },
        ],
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We start with the workflow that costs the most hours today, map every manual step in it, and automate the steps that are genuinely repetitive rather than the ones that only look that way.",
          "The system ships behind monitoring you can see, and we stay on to widen it to the next workflow once the first one is proven in production.",
        ],
        stages: [
          {
            term: "Workflow Mapping",
            definition: "We trace the current process step by step, including the manual handoffs nobody has written down.",
          },
          {
            term: "Build And Connect",
            definition: "We build the integration and put verification checks at every point data changes hands.",
          },
          {
            term: "Monitor And Expand",
            definition: "The workflow runs in production under monitoring, and we extend it to the next bottleneck once it is proven.",
          },
        ],
      },
      proof: {
        label: "Running In Production",
        heading: "Invoicing that checks its own arithmetic",
        cases: [{ kind: "case-study", slug: "purafall" }],
      },
      closing: {
        title: "Know which workflow costs you the most?",
        description: "Tell us where the manual handoffs are, and we will map out what a connected workflow would look like.",
        cta: "contact",
      },
    },
  },
  {
    slug: "web-development",
    icon: "globe",
    title: "Website Design & Development",
    description:
      "Fast, accessible sites built on modern infrastructure and engineered to turn traffic into qualified pipeline.",
    image: "serviceWeb",
    faq: [
      {
        question: "Do you design before writing code, or build directly?",
        answer:
          "Every page is designed and approved before development starts, so you see the site before it exists and there are no surprises at launch.",
      },
      {
        question: "Who owns the site and where is it hosted?",
        answer: "You own the codebase outright, hosted on infrastructure you control.",
      },
      {
        question: "Can you tell which pages are actually bringing in enquiries?",
        answer:
          "Yes. Analytics are set up on the pages and actions that matter, so you can see which pages are earning enquiries and which are not.",
      },
      {
        question: "What happens after the site launches?",
        answer: "We remain available for the changes a live site always needs.",
      },
    ],
    detail: {
      eyebrow: "Website Design",
      headline: "Websites Built To Convert Your Traffic",
      lede: "We design and build fast, accessible sites on modern infrastructure, engineered to turn a visit into a qualified enquiry.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation: "Your site takes long enough to load that a visitor on a slow connection leaves before it finishes.",
            cost: "Every second of load time is a visitor who never saw what you actually offer.",
          },
          {
            situation: "The site was built for a business you no longer run, patched over with sections that do not match the rest.",
            cost: "A visitor notices the mismatch before they read a single line of your copy.",
          },
          {
            situation: "You cannot tell which pages are actually bringing in enquiries, because nothing on the site is set up to tell you.",
            cost: "Marketing spend keeps flowing to a page with no way to prove it is working.",
          },
        ],
      },
      deliverables: {
        heading: "What We Build",
        entries: [
          {
            name: "A Fast, Accessible Site",
            body: "Built on modern infrastructure with real performance budgets, so it loads quickly and works for every visitor, not just the ones on a new device.",
          },
          {
            name: "A Brand-Consistent Design",
            body: "Every page carries the same visual language, so a visitor trusts the site before they have read a word of copy.",
          },
          {
            name: "Conversion-Focused Pages",
            body: "Pages structured around the action you actually want a visitor to take, not a generic template stretched to fit.",
          },
          {
            name: "Analytics You Can Read",
            body: "Tracking set up on the pages and actions that matter, so you can see which pages are earning enquiries and which are not.",
          },
        ],
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We start from your brand and your actual customer, not a template, and design every page before a line of code gets written, so you see the site before it exists.",
          "Once it launches, you own the codebase outright, hosted on infrastructure you control, and we stay available for the changes a live site always needs.",
        ],
        stages: [
          {
            term: "Design Before Code",
            definition: "Every page is designed and approved before development starts, so there are no surprises at launch.",
          },
          {
            term: "Build On Modern Infrastructure",
            definition: "The site is built for real performance and accessibility, not just how it looks in a mockup.",
          },
          {
            term: "Ship And Support",
            definition: "You receive the full codebase and hosting access, and we remain available for post-launch changes.",
          },
        ],
      },
      proof: {
        label: "Live Today",
        heading: "A brand-ready site, and the product pages behind it",
        cases: [
          { kind: "case-study", slug: "purafall" },
          { kind: "product", slug: "3d-property-website" },
        ],
      },
      closing: {
        title: "Ready for a site that matches what you sell?",
        description: "Tell us about your current site and what it is failing to do, and we will map out what a rebuild would look like.",
        cta: "contact",
      },
    },
  },
  {
    slug: "web-applications",
    icon: "layout-panel-left",
    title: "Web Applications",
    description:
      "Bespoke applications for the processes no off-the-shelf product covers. Scalable architecture that integrates with the data infrastructure you already have.",
    seo: {
      title: "Custom Web Application Development",
      description:
        "Custom web application development for the processes no off-the-shelf product covers, on scalable architecture that integrates with the data infrastructure you already have.",
    },
    image: "serviceApps",
    faq: [
      {
        question: "What if no off-the-shelf software does exactly what we need?",
        answer:
          "That is exactly what this service is for: bespoke applications built around your actual process, with direct integrations into the systems you already run.",
      },
      {
        question: "How is pricing worked out for a custom application?",
        answer:
          "We quote after a short scoping conversation, not from a rate card, since scope, integration count, data migration, and timeline are what actually move the number.",
      },
      {
        question: "Will the application handle growth, or need a rewrite later?",
        answer:
          "It is built on scalable architecture sized for where you are headed, not just your current volume, so it can handle more users and data without a rewrite.",
      },
      {
        question: "Do we get full access and documentation at the end?",
        answer:
          "Yes, you receive the full codebase and documentation clear enough for any team to maintain it, not only the one that built it.",
      },
    ],
    detail: {
      eyebrow: "Bespoke Software",
      headline: "Bespoke Software For Your Exact Process",
      lede: "We build bespoke applications for the workflows generic software was never designed to handle, on architecture that grows with you.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation: "You have bent an off-the-shelf tool so far out of its intended use that half your team's effort goes into working around it.",
            cost: "The tool that was supposed to save time now needs its own set of workarounds just to function.",
          },
          {
            situation: "Your process depends on a spreadsheet that only one person fully understands.",
            cost: "The whole workflow is one absence away from stopping.",
          },
          {
            situation: "You need a piece of software that talks to your existing systems, and no vendor product does exactly that.",
            cost: "You keep paying for a subscription that solves most of the problem and leave the rest to manual work.",
          },
        ],
      },
      deliverables: {
        heading: "What We Build",
        entries: [
          {
            name: "A Bespoke Application",
            body: "Software designed around your actual process, not a generic workflow you have to adapt to.",
          },
          {
            name: "Scalable Architecture",
            body: "Built to handle more users and more data without a rewrite, on infrastructure sized for where you are headed, not just where you are now.",
          },
          {
            name: "Real Integrations",
            body: "Direct connections into the systems you already run, so the new application is not one more disconnected tool.",
          },
          {
            name: "Access And Permissions",
            body: "Role-based access built in from the start, so the right people see the right data and nothing more.",
          },
        ],
      },
      costFactors: {
        heading: "What Shapes The Cost",
        intro:
          "There is no rate card, because no two bespoke applications solve the same problem. These are the factors that actually move the number.",
        entries: [
          {
            factor: "Scope Of The Build",
            detail: "A single internal tool costs less than a multi-role application with several connected workflows.",
          },
          {
            factor: "Integration Count",
            detail: "Every existing system the application needs to talk to adds real engineering time, not just a checkbox.",
          },
          {
            factor: "Data And Migration",
            detail: "Moving off a spreadsheet is different work than moving off an existing but outdated system.",
          },
          {
            factor: "Timeline",
            detail: "A compressed launch date costs more than a realistic one, the same way it would with any team.",
          },
        ],
        note: "We quote after a short scoping conversation, not from a rate card, because a number given before that conversation is always a guess.",
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We start by mapping the process the way it actually runs today, including the workarounds, so the application replaces the real workflow rather than an idealized version of it.",
          "You own the full codebase at handover, and the architecture is documented so any team can maintain it, not only the one that built it.",
        ],
        stages: [
          {
            term: "Process Mapping",
            definition: "We document the workflow as it actually runs, workarounds included, before designing its replacement.",
          },
          {
            term: "Build On Scalable Architecture",
            definition: "The application is built on infrastructure sized for growth, not just the current volume.",
          },
          {
            term: "Handover With Documentation",
            definition: "You receive the full codebase and documentation clear enough for any team to maintain it.",
          },
        ],
      },
      proof: {
        label: "In Production",
        heading: "An invoicing system built as a real web application",
        cases: [{ kind: "product", slug: "ai-invoice-system" }],
      },
      closing: {
        title: "Outgrown what off-the-shelf software can do?",
        description: "Tell us about the process the generic tools cannot handle, and we will map out what a bespoke application would look like.",
        cta: "contact",
      },
    },
  },
  {
    slug: "ui-ux-design",
    icon: "pen-tool",
    title: "UI/UX Design",
    description:
      "Interfaces grounded in real user research, with the hierarchy and polish that earn trust on first view.",
    seo: { title: "UI/UX Design Services" },
    image: "serviceDesign",
    faq: [
      {
        question: "Is the design based on real user research, or best guesses?",
        answer:
          "It is grounded in real sessions with real users, so decisions are based on how people actually use the product, not assumptions.",
      },
      {
        question: "What do we actually receive at the end of the engagement?",
        answer:
          "Full design file access and documentation, plus a reusable component system your team can extend without coming back to us for every new screen.",
      },
      {
        question: "How is design pricing determined?",
        answer:
          "We quote after a short scoping conversation. The number of screens, research depth, design system scope, and existing brand work are what actually move it.",
      },
      {
        question: "Do you have standalone design work we can see?",
        answer:
          "Our design work today is inseparable from the sites and systems we have built, like Purafall's website and the 3D Property Website. We do not yet have a design-only engagement to point to on its own.",
      },
    ],
    detail: {
      eyebrow: "Interface Design",
      headline: "Interfaces Built On Research, Not Guesswork",
      lede: "We design interfaces grounded in how your actual users behave, with the hierarchy and polish that earn trust on first view.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation: "Users land on your product and cannot find the one action you actually want them to take.",
            cost: "They leave and try a competitor's product instead of asking where the button is.",
          },
          {
            situation: "Every new feature gets bolted onto the interface without anyone stepping back to see what the whole thing looks like now.",
            cost: "The product gets harder to use with every release meant to improve it.",
          },
          {
            situation: "Your team is guessing at what users want because nobody has actually watched one try to use the product.",
            cost: "Decisions get made on opinion, and the next redesign argues the same points with no more evidence than the last one.",
          },
        ],
      },
      deliverables: {
        heading: "What We Build",
        entries: [
          {
            name: "User Research",
            body: "Real sessions with real users, so design decisions are based on how people actually use the product, not how the team assumes they do.",
          },
          {
            name: "Information Architecture",
            body: "A clear structure for what lives where, so a user finds what they need without hunting for it.",
          },
          {
            name: "A Design System",
            body: "Reusable components and patterns, so new screens stay consistent with the rest of the product instead of drifting further apart.",
          },
          {
            name: "High-Fidelity Interfaces",
            body: "Polished, production-ready screens your development team can build directly from, not a rough sketch that needs reinterpreting.",
          },
        ],
      },
      costFactors: {
        heading: "What Shapes The Cost",
        intro:
          "Design pricing varies more than most services, since the range runs from a single interface audit to a full product design system. These are the factors that actually move the number.",
        entries: [
          {
            factor: "Number Of Screens",
            detail: "A five-screen flow costs less than a full product with dozens of states to design.",
          },
          {
            factor: "Research Depth",
            detail: "Structured user research adds real time before a single screen gets designed, and that time shows in the outcome.",
          },
          {
            factor: "Design System Scope",
            detail: "A one-off set of screens costs less than a reusable component system built to extend itself.",
          },
          {
            factor: "Existing Brand Work",
            detail: "Starting from an established brand is faster than defining visual identity and interface patterns at the same time.",
          },
        ],
        note: "We quote after a short scoping conversation, not from a rate card, because a number given before that conversation is always a guess.",
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We start with research, not screens, so the structure of the product is grounded in how people actually try to use it before a single pixel is placed.",
          "You receive the full design system and file access at handover, so your team can extend it without coming back to us for every new screen.",
        ],
        stages: [
          {
            term: "Research First",
            definition: "We study how real users try to complete their task before designing a single screen.",
          },
          {
            term: "Structure And System",
            definition: "We define the information architecture and build a reusable component system around it.",
          },
          {
            term: "Handover With Files",
            definition: "You receive full design file access and documentation your team can build from directly.",
          },
        ],
      },
      // No real client work backs a design-only deliverable yet — Purafall's
      // and Khatri's design work is inseparable from the sites and systems
      // built around it, and stretching either here would misrepresent what
      // was actually sold. See plan §7 risk 3.
      proof: null,
      closing: {
        title: "Interface losing users before they convert?",
        description: "Tell us where people are dropping off, and we will map out what the research would need to cover.",
        cta: "contact",
      },
    },
  },
  {
    slug: "ai-consultation",
    icon: "briefcase",
    title: "AI Consultation",
    description:
      "An operations audit and a prioritized roadmap for where AI actually pays off, before you commit budget to building anything.",
    // "AI readiness assessment" is the sharper, less-contaminated researched
    // term — real dedicated competitors validate the demand, and it matches
    // what this page actually delivers (audit + roadmap) better than the
    // generic "AI consulting services", which pulls investor/market-size
    // search noise.
    seo: {
      title: "AI Readiness Assessment & Roadmap",
      description:
        "An AI readiness assessment and a prioritized roadmap for where AI actually pays off in your operations, before you commit budget to building anything.",
    },
    tags: ["AI Strategy", "Process Audit", "Build Vs Buy"],
    poster: {
      src: "/images/ai-consultation-card.jpg",
      alt: "A single lit decision path rising above dimmed branching alternatives toward a search, checklist, and balance-scale icon, over a circuit board",
    },
    faq: [
      {
        question: "What do we actually get at the end of an assessment?",
        answer:
          "A written report with a prioritized roadmap ranking every viable AI opportunity by effort against impact, plus a clear build-or-buy recommendation for each one.",
      },
      {
        question: "Is the roadmap ours to use even if we do not build with you?",
        answer:
          "Yes. You receive the full report and roadmap regardless of what you decide to build next, and it is yours to act on with us or any team you choose.",
      },
      {
        question: "How do you actually determine where AI would help, versus just pitching it everywhere?",
        answer:
          "We examine your actual workflows, data, and systems firsthand rather than working from a questionnaire, so the roadmap reflects your business, not a generic AI opportunity list.",
      },
      {
        question: "Do you have consulting-only engagements you can point to?",
        answer:
          "Every client relationship so far started from a defined build rather than a standalone assessment, so we do not have a consulting-only engagement to point to yet. What we can show is the build work itself.",
      },
    ],
    detail: {
      eyebrow: "AI Strategy",
      headline: "Know What Is Worth Building First",
      lede: "We assess your operations, your data, and your existing systems, then hand you a plain-language roadmap of where AI actually pays off, before you commit to building anything.",
      signals: {
        heading: "When You Need This",
        entries: [
          {
            situation: "Every vendor pitching you AI says it will solve everything, and you have no way to tell which claim is real for your business.",
            cost: "You either commit budget on a guess or delay a decision indefinitely because nothing separates the real opportunities from the pitch decks.",
          },
          {
            situation: "You suspect AI could help somewhere in your operations, but nobody on your team has the time to properly map where.",
            cost: "The opportunity stays theoretical because nobody has turned it into a concrete, sequenced plan.",
          },
          {
            situation: "You are choosing between several possible AI projects with no internal framework to compare them honestly.",
            cost: "The loudest opinion in the room wins the budget instead of the option with the clearest return.",
          },
        ],
      },
      deliverables: {
        heading: "What We Deliver",
        entries: [
          {
            name: "An Operations Audit",
            body: "A structured review of your current workflows, data, and systems, to find where an AI system would actually change an outcome.",
          },
          {
            name: "A Prioritized Roadmap",
            body: "Every viable opportunity ranked by effort against impact, so you know what to tackle first and what to leave alone.",
          },
          {
            name: "A Build Or Buy Recommendation",
            body: "A clear recommendation on whether a given opportunity needs a custom system or an existing tool already covers it.",
          },
          {
            name: "A Written Report",
            body: "Findings and recommendations documented in plain language, so you can take it to your own team or another vendor with nothing lost in translation.",
          },
        ],
      },
      engagement: {
        heading: "How It Runs",
        paragraphs: [
          "We spend time with your actual workflows and your actual data before we recommend anything, so the roadmap reflects your business rather than a generic AI opportunity list.",
          "You receive the full report and roadmap regardless of what you decide to build next, and it is yours to act on with us or with any team you choose.",
        ],
        stages: [
          {
            term: "Operations Review",
            definition: "We examine your current workflows, data, and systems firsthand rather than working from a questionnaire.",
          },
          {
            term: "Opportunity Mapping",
            definition: "We identify where AI would change an outcome and rank each opportunity by effort against impact.",
          },
          {
            term: "Roadmap Delivery",
            definition: "You receive a written report and prioritized roadmap that is yours to act on however you choose.",
          },
        ],
      },
      // No engagement to date has been a standalone assessment — every
      // client relationship so far started from a defined build. Honest
      // value is `null`, not a build case study repurposed as consulting
      // proof. See plan §7 risk 3.
      proof: null,
      closing: {
        title: "Not sure where AI actually pays off?",
        description: "Tell us about your operations, and we will scope what an assessment would cover.",
        cta: "strategy-call",
      },
    },
  },
];

export const servicesBySlug = Object.fromEntries(
  services.map((service) => [service.slug, service]),
) as Record<ServiceSlug, Service>;

export function getService(slug: string): Service | undefined {
  return servicesBySlug[slug as ServiceSlug];
}
