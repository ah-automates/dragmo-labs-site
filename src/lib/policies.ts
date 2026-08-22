/**
 * Policy documents, transcribed from the PDFs that Dragmo Labs issues.
 *
 * The content lives here as data rather than as JSX so the three pages stay
 * identical in structure and a wording change is a one-line edit next to the
 * source document. Only two inline forms are recognised by the renderer:
 * `**bold**`, and the site email address, which becomes a mailto link wherever
 * it appears in prose. See `components/shared/policy-document.tsx`.
 */

export type PolicyBlock =
  | { kind: "text"; text: string }
  /** A labelled group inside a numbered section, as in Privacy section 1. */
  | { kind: "subheading"; text: string }
  /** `ordered` is for lists that are genuinely sequential, like milestones. */
  | { kind: "list"; items: string[]; ordered?: boolean }
  /** Renders the studio name and a mailto link, not free text. */
  | { kind: "contact" };

export type PolicySection = {
  /** Stable anchor target. Hardcoded so a shared link survives a re-wording. */
  id: string;
  heading: string;
  blocks: PolicyBlock[];
};

export type Policy = {
  slug: string;
  title: string;
  /** Machine-readable, for the <time> element. */
  updatedISO: string;
  /** Pre-formatted, so the server and the client cannot disagree on a locale. */
  updated: string;
  /** Search-result copy; never rendered on the page itself. */
  description: string;
  /** Unnumbered opening paragraphs, above section 1. */
  intro: string[];
  sections: PolicySection[];
};

const deliveryPolicy: Policy = {
  slug: "delivery-policy",
  title: "Delivery Policy",
  updatedISO: "2026-08-13",
  updated: "August 13, 2026",
  description:
    "How Dragmo Labs delivers projects: delivery methods, timelines, milestones, revisions, and what final handover includes.",
  intro: [
    "Dragmo Labs provides digital and technology-based services. We do not generally ship physical products. All services, project deliverables, software, websites, AI systems, and digital assets are delivered electronically unless otherwise agreed in writing.",
  ],
  sections: [
    {
      id: "service-delivery",
      heading: "Service Delivery",
      blocks: [
        { kind: "text", text: "Our services may include:" },
        {
          kind: "list",
          items: [
            "AI customer support systems",
            "AI receptionists",
            "Custom AI agents",
            "Chatbots",
            "Automation workflows",
            "Custom SaaS platforms",
            "Custom web applications",
            "Website development",
            "UI/UX design",
            "AI-generated content systems",
            "Lead generation and automation solutions",
            "API and third-party integrations",
          ],
        },
        {
          kind: "text",
          text: "Deliverables may be provided through email, cloud storage, a client dashboard, source code repositories, hosting platforms, project management platforms, or other agreed digital methods.",
        },
      ],
    },
    {
      id: "delivery-timeline",
      heading: "Delivery Timeline",
      blocks: [
        { kind: "text", text: "Project timelines depend on several factors, including:" },
        {
          kind: "list",
          items: [
            "Project complexity",
            "Scope of work",
            "Required features",
            "Third-party integrations",
            "Client feedback and approvals",
            "Availability of required content and access credentials",
            "Changes requested during development",
          ],
        },
        {
          kind: "text",
          text: "Estimated delivery dates provided by Dragmo Labs are estimates unless a specific deadline is explicitly guaranteed in a written agreement.",
        },
      ],
    },
    {
      id: "client-responsibilities",
      heading: "Client Responsibilities",
      blocks: [
        { kind: "text", text: "To ensure timely delivery, clients may be required to provide:" },
        {
          kind: "list",
          items: [
            "Project requirements",
            "Content and branding materials",
            "Required login credentials or authorized access",
            "API keys or third-party accounts",
            "Timely feedback and approvals",
          ],
        },
        {
          kind: "text",
          text: "Delays caused by missing information, delayed feedback, unavailable third-party services, or changes to the project scope may extend the delivery timeline.",
        },
      ],
    },
    {
      id: "project-milestones",
      heading: "Project Milestones",
      blocks: [
        {
          kind: "text",
          text: "For larger projects, Dragmo Labs may deliver work in stages or milestones, such as:",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Discovery and planning",
            "Strategy and system architecture",
            "UI/UX design",
            "Development",
            "AI or automation integration",
            "Testing and quality assurance",
            "Client review",
            "Final deployment or delivery",
          ],
        },
        {
          kind: "text",
          text: "Clients may be asked to review and approve specific stages before the next stage begins.",
        },
      ],
    },
    {
      id: "revisions",
      heading: "Revisions",
      blocks: [
        {
          kind: "text",
          text: "Revision requests must remain within the originally agreed project scope.",
        },
        {
          kind: "text",
          text: "Additional features, major changes, or requests outside the agreed scope may require:",
        },
        {
          kind: "list",
          items: [
            "Additional development time",
            "A revised delivery date",
            "Additional payment",
          ],
        },
      ],
    },
    {
      id: "final-delivery",
      heading: "Final Delivery",
      blocks: [
        {
          kind: "text",
          text: "Once the agreed project is completed and applicable payments have been received, final deliverables will be provided using the agreed delivery method.",
        },
        { kind: "text", text: "Depending on the project, final delivery may include:" },
        {
          kind: "list",
          items: [
            "A live website or web application",
            "Access to an AI system",
            "Automation workflows",
            "Source files or code, where included in the agreement",
            "Design files",
            "Documentation",
            "Login credentials or access instructions",
          ],
        },
      ],
    },
    {
      id: "deployment-and-third-party-services",
      heading: "Deployment and Third-Party Services",
      blocks: [
        {
          kind: "text",
          text: "Some projects require third-party services such as hosting providers, AI platforms, APIs, CRM systems, communication platforms, or cloud infrastructure.",
        },
        {
          kind: "text",
          text: "Dragmo Labs is not responsible for delays, outages, pricing changes, policy changes, or service interruptions caused by third-party providers.",
        },
      ],
    },
    {
      id: "acceptance-of-delivery",
      heading: "Acceptance of Delivery",
      blocks: [
        {
          kind: "text",
          text: "A project may be considered delivered when the agreed deliverables have been made available to the client.",
        },
        {
          kind: "text",
          text: "Clients should review deliverables promptly and report any issues related to the agreed scope within a reasonable period.",
        },
      ],
    },
    {
      id: "support-after-delivery",
      heading: "Support After Delivery",
      blocks: [
        {
          kind: "text",
          text: "Any post-launch support, maintenance, updates, or ongoing management will be provided only if included in the project agreement or purchased as a separate service.",
        },
      ],
    },
    {
      id: "contact-us",
      heading: "Contact Us",
      blocks: [
        { kind: "text", text: "For questions about project delivery, please contact:" },
        { kind: "contact" },
      ],
    },
  ],
};

const refundPolicy: Policy = {
  slug: "refund-policy",
  title: "Refund Policy",
  updatedISO: "2026-08-13",
  updated: "August 13, 2026",
  description:
    "Dragmo Labs refund terms: deposits, custom service work, refund eligibility, non-refundable costs, subscriptions, and how to request a review.",
  intro: [
    "At Dragmo Labs, we provide customized digital services, including AI solutions, AI agents, automation, chatbots, AI receptionists, custom SaaS platforms, web applications, websites, UI/UX design, social media automation, and other technology services.",
    "Because many of our services involve custom work, development time, third-party tools, software licenses, and resources specifically allocated to a client’s project, our refund policy is as follows.",
  ],
  sections: [
    {
      id: "project-deposits",
      heading: "Project Deposits",
      blocks: [
        {
          kind: "text",
          text: "Unless otherwise agreed in writing, project deposits or advance payments are generally **non-refundable** once project work has started.",
        },
        {
          kind: "text",
          text: "Deposits are used to reserve development time, begin planning, research, design, development, and other project-related activities.",
        },
      ],
    },
    {
      id: "custom-services",
      heading: "Custom Services",
      blocks: [
        {
          kind: "text",
          text: "Custom-built services are created specifically for each client. This includes, but is not limited to:",
        },
        {
          kind: "list",
          items: [
            "Custom AI agents",
            "AI customer support systems",
            "AI receptionists",
            "Chatbots",
            "Automation workflows",
            "Custom SaaS applications",
            "Web applications",
            "Websites",
            "UI/UX design",
            "API integrations",
            "Lead generation and automation systems",
          ],
        },
        {
          kind: "text",
          text: "Because these services are customized, completed work and work already performed are generally non-refundable.",
        },
      ],
    },
    {
      id: "refund-eligibility",
      heading: "Refund Eligibility",
      blocks: [
        {
          kind: "text",
          text: "A refund may be considered in limited circumstances, including situations where:",
        },
        {
          kind: "list",
          items: [
            "Dragmo Labs is unable to begin the agreed project due to our own fault.",
            "We are unable to deliver the agreed core service after reasonable attempts to resolve the issue.",
            "A refund is specifically required under applicable law.",
          ],
        },
        {
          kind: "text",
          text: "Any approved refund amount may be calculated based on the portion of the project that has not yet been completed or delivered.",
        },
      ],
    },
    {
      id: "non-refundable-costs",
      heading: "Non-Refundable Costs",
      blocks: [
        { kind: "text", text: "The following costs are generally non-refundable:" },
        {
          kind: "list",
          items: [
            "Third-party software subscriptions",
            "AI model or API usage fees",
            "Domain registration fees",
            "Hosting fees",
            "Cloud infrastructure costs",
            "Paid plugins or licenses",
            "Advertising costs",
            "External service fees",
            "Payment processing fees",
            "Work already completed",
            "Development hours already used",
          ],
        },
      ],
    },
    {
      id: "revisions-and-issue-resolution",
      heading: "Revisions and Issue Resolution",
      blocks: [
        {
          kind: "text",
          text: "Before requesting a refund, clients are encouraged to contact Dragmo Labs so that we can review the issue and make reasonable efforts to resolve it.",
        },
        {
          kind: "text",
          text: "If the project includes revisions under the agreed scope, we will work according to the terms of the project agreement or proposal.",
        },
        {
          kind: "text",
          text: "Requests for features or changes outside the original agreed scope may require additional time and payment.",
        },
      ],
    },
    {
      id: "subscription-or-recurring-services",
      heading: "Subscription or Recurring Services",
      blocks: [
        {
          kind: "text",
          text: "For monthly, subscription-based, maintenance, hosting, or ongoing services:",
        },
        {
          kind: "list",
          items: [
            "Payments already made for the current billing period are generally non-refundable.",
            "Clients may cancel future services according to the applicable service agreement.",
            "Cancellation does not automatically result in a refund for services already provided or resources already allocated.",
          ],
        },
      ],
    },
    {
      id: "chargebacks",
      heading: "Chargebacks",
      blocks: [
        {
          kind: "text",
          text: "Clients are encouraged to contact Dragmo Labs before initiating a payment dispute or chargeback.",
        },
        {
          kind: "text",
          text: "We will make reasonable efforts to resolve legitimate billing concerns. Unauthorized or fraudulent chargebacks may result in suspension of services and the collection of outstanding amounts where permitted by law.",
        },
      ],
    },
    {
      id: "how-to-request-a-refund-review",
      heading: "How to Request a Refund Review",
      blocks: [
        { kind: "text", text: "To request a refund review, contact:" },
        { kind: "contact" },
        {
          kind: "text",
          text: "Please include your name, company name, project details, payment information, and a clear explanation of the issue.",
        },
        {
          kind: "text",
          text: "Each request will be reviewed based on the specific circumstances and applicable agreement.",
        },
      ],
    },
    {
      id: "changes-to-this-policy",
      heading: "Changes to This Policy",
      blocks: [
        {
          kind: "text",
          text: "Dragmo Labs may update this Refund Policy at any time. Updates will become effective when posted on our website.",
        },
      ],
    },
  ],
};

const privacyPolicy: Policy = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  updatedISO: "2026-08-15",
  updated: "August 15, 2026",
  description:
    "How Dragmo Labs collects, uses, stores, and protects personal information, including identity verification, data sharing, retention, and your rights.",
  intro: [
    "Dragmo Labs (“Dragmo Labs,” “we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information of our clients, website visitors, and users.",
    "This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website or use our services.",
  ],
  sections: [
    {
      id: "information-we-collect",
      heading: "Information We Collect",
      blocks: [
        { kind: "text", text: "We may collect the following information:" },
        { kind: "subheading", text: "Personal Information" },
        {
          kind: "list",
          items: [
            "Name",
            "Email address",
            "Phone number",
            "Company name",
            "Job title",
            "Billing information",
            "Government-issued identity documentation (such as a passport, national identity card, or driver’s licence), and where applicable proof of address, company registration documents, or evidence of authority to act on behalf of a business",
            "Information submitted through contact forms, chatbots, or other communication channels",
          ],
        },
        {
          kind: "text",
          text: "**Identity verification.** Where we onboard a client, process payments, or provide access to systems, accounts, or credentials, we may require you to provide identity documentation before we begin or continue work. We collect this information to confirm that you are who you claim to be, to confirm that you are authorised to act for the business you represent, and to prevent impersonation, fraudulent transactions, and other misuse of our services. We collect only the documentation reasonably necessary for these purposes, use it only for verification and related legal or compliance obligations, and retain it only for as long as required (see Section 6). If you choose not to provide the requested documentation, we may be unable to provide some or all of our services.",
        },
        { kind: "subheading", text: "Business and Project Information" },
        {
          kind: "text",
          text: "When working with clients, we may collect information necessary to deliver our services, including:",
        },
        {
          kind: "list",
          items: [
            "Project requirements",
            "Business processes",
            "Website or application information",
            "Customer service workflows",
            "CRM or automation data",
            "API credentials or other access credentials provided for project implementation",
          ],
        },
        { kind: "subheading", text: "Automatically Collected Information" },
        {
          kind: "text",
          text: "When you visit our website, we may automatically collect certain technical information, such as:",
        },
        {
          kind: "list",
          items: [
            "IP address",
            "Browser type",
            "Device information",
            "Pages visited",
            "Date and time of visits",
            "Cookies and similar technologies",
          ],
        },
      ],
    },
    {
      id: "how-we-use-your-information",
      heading: "How We Use Your Information",
      blocks: [
        { kind: "text", text: "Dragmo Labs may use your information to:" },
        {
          kind: "list",
          items: [
            "Provide and manage our services",
            "Develop custom AI solutions, websites, applications, and automations",
            "Communicate with you about projects or inquiries",
            "Provide customer support",
            "Process payments and invoices",
            "Verify your identity and confirm your authority to instruct us or access accounts and systems",
            "Improve our website, services, and user experience",
            "Maintain security and prevent fraud, impersonation, or misuse of our services",
            "Comply with legal obligations",
          ],
        },
        { kind: "text", text: "We will not sell your personal information to third parties." },
      ],
    },
    {
      id: "ai-and-third-party-platforms",
      heading: "AI and Third-Party Platforms",
      blocks: [
        {
          kind: "text",
          text: "Some Dragmo Labs services may use third-party platforms, APIs, cloud providers, AI models, communication systems, automation platforms, or software tools.",
        },
        {
          kind: "text",
          text: "Depending on the project, client data may be processed through these third-party services to provide the requested functionality.",
        },
        {
          kind: "text",
          text: "Clients are responsible for ensuring that they have the necessary rights and permissions to provide data for processing.",
        },
        {
          kind: "text",
          text: "Dragmo Labs is not responsible for the independent privacy practices, policies, outages, or actions of third-party platforms.",
        },
      ],
    },
    {
      id: "data-security",
      heading: "Data Security",
      blocks: [
        {
          kind: "text",
          text: "We take reasonable administrative, technical, and organizational measures to protect your information. Identity documents are treated as sensitive information and access is restricted to personnel who need it for verification, compliance, or fraud-prevention purposes.",
        },
        {
          kind: "text",
          text: "However, no method of transmitting information over the internet or storing electronic data is completely secure. Therefore, while we take reasonable precautions, we cannot guarantee absolute security.",
        },
        {
          kind: "text",
          text: "Clients should also protect their passwords, API keys, login credentials, and other sensitive access information.",
        },
      ],
    },
    {
      id: "data-sharing",
      heading: "Data Sharing",
      blocks: [
        { kind: "text", text: "We may share information only when necessary to:" },
        {
          kind: "list",
          items: [
            "Deliver requested services",
            "Work with trusted service providers or subcontractors",
            "Process payments",
            "Carry out identity verification, where a verification, payment, or compliance provider is used",
            "Comply with legal requirements",
            "Protect the rights, safety, and security of Dragmo Labs, our clients, or others",
          ],
        },
        { kind: "text", text: "We do not sell personal information." },
      ],
    },
    {
      id: "data-retention",
      heading: "Data Retention",
      blocks: [
        { kind: "text", text: "We retain information for as long as reasonably necessary to:" },
        {
          kind: "list",
          items: [
            "Provide our services",
            "Complete active projects",
            "Meet legal, accounting, or contractual obligations",
            "Resolve disputes",
            "Maintain necessary business records",
          ],
        },
        {
          kind: "text",
          text: "Identity documentation is retained only for as long as needed to complete verification and to meet any applicable legal, accounting, or anti-fraud record-keeping obligations, after which it is securely deleted. When information is no longer required, we may securely delete or anonymize it.",
        },
      ],
    },
    {
      id: "your-rights",
      heading: "Your Rights",
      blocks: [
        {
          kind: "text",
          text: "Depending on applicable laws and your location, you may have the right to request:",
        },
        {
          kind: "list",
          items: [
            "Access to your personal information",
            "Correction of inaccurate information",
            "Deletion of certain personal information",
            "Information about how your data is used",
          ],
        },
        {
          kind: "text",
          text: "Please note that we may be unable to delete identity documentation while we are still required to retain it under applicable law or for the prevention of fraud. To make a privacy-related request, contact us at info@dragmolabs.com.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      blocks: [
        {
          kind: "text",
          text: "Our website may use cookies and similar technologies to improve functionality, analyze website usage, and enhance user experience.",
        },
        {
          kind: "text",
          text: "You may be able to control or disable cookies through your browser settings. Please note that disabling cookies may affect certain website features.",
        },
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-Party Links",
      blocks: [
        {
          kind: "text",
          text: "Our website or services may contain links to third-party websites or platforms. Dragmo Labs is not responsible for the privacy practices, security, or content of external websites.",
        },
      ],
    },
    {
      id: "changes-to-this-privacy-policy",
      heading: "Changes to This Privacy Policy",
      blocks: [
        {
          kind: "text",
          text: "We may update this Privacy Policy from time to time. The updated version will be posted on our website with a revised “Last Updated” date.",
        },
      ],
    },
    {
      id: "contact-us",
      heading: "Contact Us",
      blocks: [
        {
          kind: "text",
          text: "If you have questions about this Privacy Policy or how Dragmo Labs handles your information, please contact us:",
        },
        { kind: "contact" },
      ],
    },
  ],
};

/** Keyed by route slug, and the order the footer lists them in. */
export const policies = {
  "privacy-policy": privacyPolicy,
  "refund-policy": refundPolicy,
  "delivery-policy": deliveryPolicy,
} satisfies Record<string, Policy>;

export type PolicySlug = keyof typeof policies;

/**
 * Footer and sitemap entries, derived so publishing a new policy is a single
 * edit here. Imported only by server components: pulling this module into a
 * client bundle would ship every word of the policies to the browser.
 */
export const policyLinks = Object.values(policies).map((policy) => ({
  label: policy.title,
  href: `/${policy.slug}`,
}));
