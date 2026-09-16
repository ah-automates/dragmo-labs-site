import type { IconName } from "@/lib/icons";
import type { ProofEntry } from "@/lib/proof";
import { proofBySlug } from "@/lib/proof";

/**
 * Product pages, structured on Sabri Suby's 17-Step Secret Selling System
 * (`Projects/17-Step-Selling-System.pdf`). The steps live in this type, not
 * in JSX, for one reason above the others: the type is the enforcement
 * mechanism. A missing step is a compile error. A seventh fascination bullet
 * is a compile error. See `design-system/pages/product.md` for how the 17
 * steps map onto 10 layout sections without repeating a layout family.
 *
 * Every claim in this file traces to something real: a named client, a
 * recorded demo, or a verified engineering fix in `src/lib/proof.ts`. Nowhere
 * here invents a number. See `design-system/MASTER.md` §7 and §8.
 */

/** Exactly six, per the selling system. A seventh is a compile error. */
export type SixFascinations = readonly [string, string, string, string, string, string];

export type Poster = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Step 06's reveal. Three honest forms: a real recorded demo, real still
 * photography, or a labeled process sequence for a product with no footage
 * yet (the invoice system). Never a fabricated screenshot standing in for a
 * product shot, which `design-system/MASTER.md` §7 rules out directly.
 */
export type SolutionMedia =
  | {
      kind: "video";
      src: string;
      poster: Poster;
      durationLabel: string;
      /** Read from the video's own burned-in captions, not paraphrased. */
      captionSummary: string;
    }
  | {
      kind: "stills";
      shots: { src: string; alt: string; caption: string }[];
    }
  | {
      kind: "process";
      steps: { label: string; description: string }[];
    };

export type ClientCredit = {
  name: string;
  context: string;
  location?: string;
};

type CommonSteps = {
  /** 01 — Call Out to Your Audience. Short, badge length: the first thing on
   *  the page. The fuller picture of who this is for lives in `problem`. */
  calloutAudience: string;
  /** 02 — Demand Their Attention */
  promise: { headline: string; headlineAccent: string };
  /** 03 — Back Up Your Big Promise */
  promiseBacking: string;
  /** 04 — Create Irresistible Intrigue */
  fascinations: SixFascinations;
  /** 05 — Floodlight the Problem */
  problem: {
    heading: string;
    paragraphs: string[];
    failedAttempts: { tried: string; whyItFailed: string }[];
  };
  /** 06 — Provide the Solution */
  solution: {
    heading: string;
    paragraphs: string[];
    categoricalDifference: string;
    media: SolutionMedia;
  };
  /** 14 — Inject Scarcity (honest capacity, no countdown) */
  capacity: string;
  /** 15 — Give a Powerful Guarantee */
  guarantee: { heading: string; promises: string[] };
  /** 16 — Call to Action */
  callToAction: {
    heading: string;
    command: string;
    formLocation: string;
    bookingHref?: string;
  };
  /** 17 — Close With a P.S. */
  postscript: string[];
};

export type ProductOffer =
  | ({ kind: "showcase" } & CommonSteps)
  | ({ kind: "full-offer" } & CommonSteps & {
        /** 07 — Show Your Credentials */
        credentials: {
          heading: string;
          intro: string;
          client: ClientCredit;
          proof: ProofEntry[];
          crossReference?: { label: string; description: string; href: string };
        };
        /** 08 — Detail the Benefits */
        benefits: { heading: string; rows: { feature: string; benefit: string }[] };
        /** 09 — Social Proof */
        socialProof: {
          heading: string;
          statement: string;
          caseStudySlug: string;
          testimonialIds: string[];
        };
        /** 10 — Make Your Godfather Offer */
        godfatherOffer: { heading: string; body: string };
        /** 11 — Add Bonuses */
        bonuses: { title: string; body: string; href?: string }[];
        /** 12 — Stack the Value */
        valueStack: { item: string; worth: string }[];
        valueStackClose: string;
        /** 13 — Reveal Your Price */
        priceReveal: { heading: string; paragraphs: string[] };
      });

export type Product = {
  slug: "voice-agent" | "whatsapp-agent" | "3d-property-website" | "ai-invoice-system";
  /** SEO-first: the phrase a buyer actually searches. */
  name: string;
  /** Internal build name, shown as a pill beside `name`, never instead of it. */
  codename?: string;
  /** One line. Drives the index card and anchors step 01 on the page. */
  dreamBuyer: string;
  shortLabel: string;
  summary: string;
  icon: IconName;
  /**
   * `/products` index card art (2026-09-15). Deliberately separate from
   * `offer.solution.media`'s video poster: that poster is the frozen frame of
   * a *real* recorded video and must stay a genuine screenshot (see
   * `design-system/MASTER.md` §7/§8 — no fabricated screenshots standing in
   * for real proof). `cardImage` is illustrative marketing art shown only on
   * the index card, which plays no video and makes no evidentiary claim, so
   * a generated image is fine there. Falls back to the video poster (or the
   * text-only card) when absent — see `ProductSummaryCard`.
   */
  cardImage?: Poster;
  /**
   * Overrides for the `<title>`/meta description only, when researched
   * search demand (see `context.md`'s SEO note) points at a phrase sharper
   * than `name`/`summary` but a rename would be premature — e.g. real
   * buyers search "AI receptionist" more than "voice agent", but the
   * product is still named and sold as the Voice Agent. Unset falls back
   * to `name`/`summary`, so most products need nothing here.
   */
  seo?: { title?: string; description?: string };
  offer: ProductOffer;
};

const THREE_D_BONUS = {
  title: "A Free 3D Property Website Template",
  body: "The same scroll driven, cinematic property site we built for Khatri Real Estate, cloned and rebranded for your agency at no charge. It normally ships as its own engagement. See it in motion on its own product page before you decide anything.",
  href: "/products/3d-property-website",
};

const PRIVACY_PROMISES = [
  "Your details are used to answer this one enquiry and nothing else.",
  "We do not sell your information or add you to a marketing list.",
  "If the honest answer is that you do not need what we build, you will hear that on the call, not a sales pitch anyway.",
];

const CALL_TO_ACTION_INTRO =
  "One command. No second option to weigh, no form buried three clicks down.";

/* -------------------------------------------------------------------------- */
/* Voice Agent                                                                */
/* -------------------------------------------------------------------------- */

const voiceAgent: Product = {
  slug: "voice-agent",
  name: "AI Voice Agent for Real Estate",
  codename: "DragVo",
  dreamBuyer: "Real estate agencies whose phone rings after the desk has emptied out.",
  shortLabel: "AI Voice Agent",
  summary:
    "An AI that answers your business phone line, qualifies the caller, and logs a ready to work lead before you have even seen a missed call notification.",
  icon: "cpu",
  cardImage: {
    src: "/images/voice-agent-card.jpg",
    width: 1672,
    height: 941,
    alt: "A glowing phone screen answering an incoming call beside a lead card showing a name, purpose, and timeline just logged",
  },
  // Real buyers search "AI receptionist" / "AI answering service" far more
  // than "voice agent" (dedicated, beatable competitor set: Dialzara,
  // Voksha, SpeakNode) — the product stays the Voice Agent, this is the
  // <title>/meta description only.
  seo: {
    title: "AI Receptionist For Real Estate Agents",
    description:
      "An AI receptionist that answers your business phone line, qualifies the caller, and logs a ready-to-work lead before you have even seen a missed call notification.",
  },
  offer: {
    kind: "full-offer",
    calloutAudience: "For Real Estate Agencies Losing Calls After Hours",
    promise: {
      headline: "Your Phone Line, Answered By",
      headlineAccent: "AI That Never Clocks Out.",
    },
    // Folds in "AI receptionist" — the term real buyers search — without
    // exceeding the hero's fixed four-element budget (MASTER §4) or
    // touching `name`; see the `seo` field above for the <title> override.
    promiseBacking:
      "Every inbound call gets picked up by an AI receptionist that already knows your inventory, qualifies the caller, and logs a ready lead, any hour, any day.",
    fascinations: [
      "The little known reason most agencies lose a listing enquiry before their agent even sees the missed call.",
      "Why a caller who hears three rings and voicemail has usually already dialed your competitor before your callback lands.",
      "How an AI agent reads a caller's phone number back digit by digit so a mistyped lead never reaches your inbox.",
      "What actually happens to a call that comes in at 11pm, and why most agencies still have no good answer for it.",
      "The one question every caller asks in the first ten seconds that determines whether they stay on the line.",
      "Why the busiest hour for real estate enquiries is almost never the hour your office is fully staffed.",
    ],
    problem: {
      heading: "Every Unanswered Ring Is A Listing Enquiry Walking To Your Competitor",
      paragraphs: [
        "A phone that rings out does not pause the enquiry, it moves it. The caller does not wait for your office to open, they scroll to the next agency in the same search and try that number instead. By the time you see the missed call, the property they were asking about may already be spoken for by someone else's client.",
        "This is not a staffing problem you can hire your way out of. The call that matters most, the one from a serious buyer with a specific address in mind, does not announce itself in advance. It arrives during a viewing, over a lunch break, or at the exact hour nobody expected the phone to ring.",
      ],
      failedAttempts: [
        {
          tried: "Hiring a receptionist for extended hours",
          whyItFailed:
            "Solves daytime coverage and does nothing for the 9pm call, and adds a full salary for hours that may see one enquiry a week.",
        },
        {
          tried: "A generic voicemail greeting asking callers to leave a message",
          whyItFailed:
            "Most callers hang up rather than leave a voicemail, and the ones who do rarely get a callback before they have already spoken to another agency.",
        },
        {
          tried: "Forwarding the office line to a personal mobile",
          whyItFailed:
            "Works until the agent is in a viewing, on another call, or simply asleep, which is precisely when the missed enquiry costs the most.",
        },
      ],
    },
    solution: {
      heading: "An AI Agent That Actually Knows What You Sell",
      paragraphs: [
        "This is not a call router or an auto attendant reading a menu of numbers to press. It is an AI agent that has your current listings, your off plan launches, and your resale inventory, and can talk about all three the way a well briefed agent would.",
        "It answers every call, asks the questions your own team would ask, and hands you a qualified lead instead of a missed call notification.",
      ],
      categoricalDifference:
        "A phone tree gets a caller to a department. Voicemail gets you a name and a callback later, if you get anything at all. This gets you a caller who has already been asked the right questions, in the moment their interest was highest, by something that picked up on the first ring.",
      media: {
        kind: "video",
        src: "/videos/dragvo-demo.mp4",
        poster: {
          src: "/images/dragvo-poster.jpg",
          width: 1280,
          height: 720,
          alt: "A Notion database with two lead rows already filled in by the AI voice agent during real calls, including names, purpose, and timeline",
        },
        durationLabel: "A real inbound call, recorded in full",
        captionSummary:
          "A real call to Khatri Real Estate, a Dubai real estate agency. Nobody on their side picks up. The agent answers, speaks across off plan launches, current inventory, and resale, qualifies the caller conversationally, reads the caller's phone number back digit by digit to confirm it, and a fully populated lead row (name, notes, purpose, timeline) appears live in a Notion database before the call ends.",
      },
    },
    credentials: {
      heading: "Built For A Live Agency, Answering Real Calls",
      intro:
        "This agent was built for Khatri Real Estate, a real estate agency in Dubai, and the recording above is a genuine inbound call to their business line, not a staged demo. The engineering credibility behind it is documented in full on the WhatsApp system built for the same client, covering the retrieval, lead logic, and qualification discipline that this voice agent shares in spirit.",
      client: {
        name: "Khatri Real Estate",
        context:
          "A real estate agency in Dubai handling off plan launches, current inventory, and resale across the city.",
        location: "Dubai, UAE",
      },
      proof: [],
      crossReference: {
        label: "Read the full engineering case study",
        description:
          "The WhatsApp AI agent built for the same client, with five documented bugs and exactly how each one was found, fixed, and verified against a live database.",
        href: "/case-studies/khatri-real-estate",
      },
    },
    benefits: {
      heading: "What Your AI Receptionist Does, And What That Means For Your Desk",
      rows: [
        {
          feature: "Answers every inbound call, day or night",
          benefit: "No enquiry ever reaches voicemail or a dead ring again.",
        },
        {
          feature: "Knows off plan, current inventory, and resale",
          benefit: "A caller gets a real answer about a real property, not a hold message.",
        },
        {
          feature: "Qualifies the caller conversationally",
          benefit: "You receive a lead with purpose, budget, and timeline already gathered, not just a name.",
        },
        {
          feature: "Reads the caller's number back to confirm it",
          benefit: "A callback never fails because a digit was mistyped under pressure.",
        },
        {
          feature: "Logs the lead the instant the call ends",
          benefit: "Your team follows up while the caller's interest is still at its peak, not tomorrow morning.",
        },
      ],
    },
    socialProof: {
      heading: "Proven On A Real Agency's Live Number",
      statement:
        "Khatri Real Estate is a named, working client, not a case study written up after the fact with the names changed. The call above happened on their real business line.",
      caseStudySlug: "khatri-real-estate",
      testimonialIds: ["haseeb-khatri-real-estate"],
    },
    godfatherOffer: {
      heading: "A Free Strategy Call, Not A Sales Pitch",
      body: "Book a free strategy call and we map exactly how many calls your business currently loses to no answer, what a working voice agent would look like on your actual number, and whether this is even the right tool for how your business runs. No proposal fee, no obligation to move forward.",
    },
    bonuses: [THREE_D_BONUS],
    valueStack: [
      {
        item: "A written map of every call your business currently loses to no answer",
        worth:
          "You cannot fix a leak you have not measured, and most agencies have never actually counted it.",
      },
      {
        item: "A straight answer on whether a voice agent is the wrong tool for your call volume",
        worth: "The expensive version of this question is finding out after the build.",
      },
      {
        item: "The qualification script we would use, adapted to your actual inventory and process",
        worth: "The exact questions a caller needs to hear, in the order that keeps them on the line.",
      },
      {
        item: "The failure list. Every way we have watched a voice agent build go wrong, and what fixed each one",
        worth: "You get the fixes without paying for the discovery.",
      },
    ],
    valueStackClose:
      "We are not going to put a figure on that stack, because we would be making it up. What we can tell you is that every line on it is work we normally do inside a paid engagement, and on this call you get it before anyone has signed anything.",
    priceReveal: {
      heading: "What The Call Costs",
      paragraphs: [
        "Nothing, and that is the whole of it. No invoice at the end, no proposal fee, no charge for the map you walk away with.",
        "What it does cost you is one sitting, and some honesty about how many calls actually go unanswered on your line today, because a map built on a tidied up version of your call volume is worth less than no map at all.",
        "This is not what the build costs. We do not publish a price for the build, because we have not heard your call volume yet, and any figure printed on this page would be a guess dressed up as a quote. You get a real number after the call, in writing, for your situation.",
      ],
    },
    capacity:
      "There is no countdown on this page. We take a small number of builds at a time because the same people who scope your call end up building it, and when we are full we say so on the call rather than after you have waited weeks for a proposal.",
    guarantee: {
      heading: "A Privacy Promise, Not A Hard Sell",
      promises: PRIVACY_PROMISES,
    },
    callToAction: {
      heading: CALL_TO_ACTION_INTRO,
      command: "Request your free strategy call for the AI Voice Agent below.",
      formLocation: "product_voice_agent",
    },
    postscript: [
      "P.S. Every call your line drops today is an enquiry another agency answers instead. The map above costs you nothing and the call itself is free, so the only real cost left is the one you are already paying every time the phone rings out.",
      "Request your free strategy call above, or if this page is not the right fit for your business today, at least count how many calls you actually missed last week. The number tends to be higher than it feels.",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* WhatsApp Agent                                                             */
/* -------------------------------------------------------------------------- */

const whatsappAgent: Product = {
  slug: "whatsapp-agent",
  name: "AI WhatsApp Agent for Real Estate",
  codename: "DragW",
  dreamBuyer: "Real estate agencies drowning in WhatsApp enquiries their own team cannot keep up with.",
  shortLabel: "AI WhatsApp Agent",
  summary:
    "An AI that answers every inbound WhatsApp message, including voice notes and images, qualifies the buyer, and hands your team a lead they can act on in minutes.",
  icon: "message-circle",
  cardImage: {
    src: "/images/whatsapp-agent-card.jpg",
    width: 1672,
    height: 941,
    alt: "A stack of unanswered WhatsApp enquiries resolving into a single organized conversation on a phone screen, with an AI/human handoff toggle beside it",
  },
  // Covers both search terms deliberately: "chatbot" is the higher-volume,
  // colloquial term buyers actually type, "AI agent" is what the page itself
  // calls the product (see `solution.heading` below, which distances the
  // product from a *rules based* chatbot specifically, not from the word).
  seo: {
    title: "AI WhatsApp Agent & Chatbot For Real Estate Lead Qualification",
    description:
      "An AI WhatsApp agent and chatbot that answers every inbound message, including voice notes and images, qualifies the buyer, and hands your team a lead they can act on in minutes.",
  },
  offer: {
    kind: "full-offer",
    calloutAudience: "For Real Estate Agencies Drowning In WhatsApp Enquiries",
    promise: {
      headline: "Every WhatsApp Enquiry, Answered In",
      headlineAccent: "Seconds, Not Tomorrow Morning.",
    },
    promiseBacking:
      "An AI agent reads every WhatsApp message, text, voice note, or image, answers from your real inventory, and qualifies the buyer, with a human able to take over any chat by hand.",
    fascinations: [
      "Why every unread WhatsApp chat sitting in your inbox tonight is a commission another agency is quietly collecting instead.",
      "The exact two questions an AI agent asks before it ever asks for a buyer's name or number, and why the order matters more than the questions themselves.",
      "What happens when a customer sends a voice note instead of typing, and why most automation tools go completely blind the moment audio arrives.",
      "The one thing Zapier, Make, and n8n cannot actually do that a real conversational agent does without being asked.",
      "How a business owner can take over one single conversation by hand without breaking the AI's memory of everything said before.",
      "Why a customer changing their mind on budget mid conversation is exactly the moment most automated replies quietly fall apart.",
    ],
    problem: {
      heading: "Every Unanswered Chat Is A Commission Someone Else Collects",
      paragraphs: [
        "A WhatsApp inbox does not politely wait its turn. Fatima is asking about areas near Downtown, Chen wants to know if Marina Gate is still available, Sofia needs a furnished option, Layla is waiting on a floor plan, and Omar has sent 'hello' twice with no reply. Every one of those is a live buyer, and every hour one sits unread is an hour closer to them messaging your competitor instead.",
        "The volume is not the actual problem. The problem is that a serious enquiry and a tire kicker look identical in a chat list until someone reads them, and by the time a human gets to the bottom of the list, the buyer at the top has often already moved on.",
      ],
      failedAttempts: [
        {
          tried: "Off the shelf automation tools like Zapier, Make, or n8n",
          whyItFailed:
            "These move data between apps on a trigger. They cannot hold a real conversation, cannot answer 'is there a 3 bed in Dubai Hills for rent' from your actual inventory, and cannot ask a follow up question based on what the buyer just said.",
        },
        {
          tried: "A junior team member assigned to WhatsApp full time",
          whyItFailed:
            "Works until they are on lunch, handling another chat, or asleep, and a real estate enquiry rarely waits politely for someone to become free.",
        },
        {
          tried: "A saved-replies template library",
          whyItFailed:
            "Answers the question a buyer typed, not the one they actually meant, and cannot ask a qualifying follow up on its own.",
        },
      ],
    },
    solution: {
      heading: "An Agent That Actually Converses, Not A Bot That Matches Keywords",
      paragraphs: [
        "This is a real conversational AI agent, not a rules based chatbot and not an automation platform bolted onto WhatsApp. It reads your actual property data, asks the qualifying questions a good agent would ask, and only pulls in a human when a human is genuinely needed.",
        "And when a human is needed, your team can detach the AI for that one conversation, WhatsApp Desktop style, take over by hand, and hand it back later without the AI losing the thread of what was said while they were in control.",
      ],
      categoricalDifference:
        "Zapier, Make, and n8n move a message from one app to another. They do not know what a 3 bedroom apartment in Dubai Hills rents for, and they cannot ask a follow up question in response to what a buyer just said. This does both, from your own knowledge base, in a real back and forth conversation.",
      media: {
        kind: "video",
        src: "/videos/dragw-demo.mp4",
        poster: {
          src: "/images/dragw-poster.jpg",
          width: 1280,
          height: 720,
          alt: "A completed WhatsApp conversation showing the AI agent's full reply, a fully checked qualification list, and a Request #1 sent confirmation badge",
        },
        durationLabel: "A real conversation, recorded in full",
        captionSummary:
          "A chat list stacked with unanswered buyer questions. A caller asks about a 3 bed in Dubai Hills for rent, and the agent answers instantly with a real listing and a real price. It gathers area, bedrooms, budget, furnished preference, and move in date one field at a time, each shown checked off as it is collected, then logs a new rental request. The agent is shown next to every off the shelf automation tool it replaces, then the owner's own Detach control, letting a human take over any single conversation instantly. Closes on: AI when you want it, you, when it matters.",
      },
    },
    credentials: {
      heading: "Five Real Bugs, Found And Fixed On A Live System",
      intro:
        "This is not a demo built to look good in a sales video. It is a production system running on Khatri Real Estate's real WhatsApp number, and every fix below happened on that live system, verified against the actual database, not reasoned about in the abstract.",
      client: {
        name: "Khatri Real Estate",
        context: "A real estate agency in Dubai running this system on their live WhatsApp Business number.",
        location: "Dubai, UAE",
      },
      proof: proofBySlug["whatsapp-agent"],
    },
    benefits: {
      heading: "What It Does, And What That Actually Means For Your Team",
      rows: [
        {
          feature: "Reads text, voice notes, and images",
          benefit: "A buyer who sends a voice note gets answered exactly like one who typed.",
        },
        {
          feature: "Answers from your real property knowledge base",
          benefit: "No generic reply. A specific answer about a specific listing, in seconds.",
        },
        {
          feature: "Asks one qualifying question at a time, in order",
          benefit: "A buyer never feels interrogated, and never gets asked something they already answered.",
        },
        {
          feature: "Tracks the latest value when a buyer changes their mind",
          benefit: "A revised budget or area updates the lead cleanly instead of creating a confused duplicate.",
        },
        {
          feature: "Detach control per conversation",
          benefit: "Your team takes over any single chat by hand, instantly, without losing the AI's memory of it.",
        },
        {
          feature: "Live web inbox with full conversation history",
          benefit: "Every message, from every channel of that chat, visible in one place, in real time.",
        },
      ],
    },
    socialProof: {
      heading: "Running On A Live Agency's Real Inbox",
      statement:
        "Khatri Real Estate uses this system on their actual WhatsApp Business number today. This is not a pitch deck screenshot, it is a working piece of their business.",
      caseStudySlug: "khatri-real-estate",
      testimonialIds: ["haseeb-khatri-real-estate"],
    },
    godfatherOffer: {
      heading: "A Free Strategy Call, Not A Sales Pitch",
      body: "Book a free strategy call and we walk through exactly how your WhatsApp inbox actually behaves today, where enquiries are genuinely falling through, and whether an AI agent is the right fix or overkill for your volume. No proposal fee, no obligation to move forward.",
    },
    bonuses: [THREE_D_BONUS],
    valueStack: [
      {
        item: "A written map of every inbound message your business currently answers by hand",
        worth: "You cannot automate a process nobody has written down, and writing it down is the part that always gets skipped.",
      },
      {
        item: "A straight answer on whether an AI agent is the wrong tool for your situation",
        worth: "The expensive version of this question is finding out after the build.",
      },
      {
        item: "The two stage qualification script we use, adapted to what you actually sell",
        worth: "The ordering is the part that breaks. Ask for contact details before the qualifying questions and the agent submits half a lead, confidently.",
      },
      {
        item: "The failure list. Every way we have watched this kind of system break, and what each one cost to fix",
        worth: "You get the fixes without paying for the discovery.",
      },
      {
        item: "A build sequence with the risky parts first",
        worth: "The cheapest time to find out something will not work is week one.",
      },
    ],
    valueStackClose:
      "We are not going to put a figure on that stack, because we would be making it up. What we can tell you is that every line on it is work we normally do inside a paid engagement, and on this call you get it before anyone has signed anything.",
    priceReveal: {
      heading: "What The Call Costs",
      paragraphs: [
        "Nothing, and that is the whole of it. No invoice at the end, no proposal fee, no charge for the map you walk away with.",
        "What it does cost you is one sitting, and some honesty about how your inbound WhatsApp actually gets handled today, because a map built on a tidied up version of your process is worth less than no map at all.",
        "This is not what the build costs. We do not publish a price for the build, because we have not seen your process yet, and any figure printed on this page would be a guess dressed up as a quote. You get a real number after the call, in writing, for your situation.",
      ],
    },
    capacity:
      "There is no countdown on this page. We take a small number of builds at a time because the same people who scope your project end up building it, and when we are full we say so on the call rather than after you have waited weeks for a proposal.",
    guarantee: {
      heading: "A Privacy Promise, Not A Hard Sell",
      promises: PRIVACY_PROMISES,
    },
    callToAction: {
      heading: CALL_TO_ACTION_INTRO,
      command: "Request your free strategy call for the AI WhatsApp Agent below.",
      formLocation: "product_whatsapp_agent",
    },
    postscript: [
      "P.S. Every unread chat in your WhatsApp inbox tonight is a buyer deciding whether to wait for you or message someone else. The map above costs you nothing and the call itself is free, so the real cost is the one you are already paying every time a chat sits unread past the hour it arrived.",
      "Request your free strategy call above, or at minimum, count how many chats in your inbox right now have gone more than an hour without a reply. That number is the one worth solving for.",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* 3D Property Website (showcase page, steps 07 to 13 skipped)               */
/* -------------------------------------------------------------------------- */

const threeDPropertyWebsite: Product = {
  slug: "3d-property-website",
  name: "3D Property Website for Real Estate",
  dreamBuyer: "Real estate agencies whose website still reads like a printed brochure.",
  shortLabel: "3D Property Website",
  summary:
    "A scroll driven, cinematic property website that moves a visitor through a listing the way walking through the front door would, not a grid of thumbnails.",
  icon: "layout-panel-left",
  cardImage: {
    src: "/images/3d-property-card.jpg",
    width: 1672,
    height: 941,
    alt: "A twilight villa overlooking a city skyline and waterfront, with an interior view opening beside it",
  },
  // "3D property website" collides in search with 3D tour-capture tools
  // (Matterport, HomeJab) — a different market (scanning hardware/SaaS) from
  // what this product actually is: a bespoke, scroll-driven cinematic site.
  // The <title>/meta description lean on the honest description instead.
  seo: {
    title: "Luxury Real Estate Website Design",
    description:
      "A scroll-driven, cinematic property website that moves a visitor through a listing the way walking through the front door would, not a grid of thumbnails.",
  },
  offer: {
    kind: "showcase",
    calloutAudience: "For Agencies Selling Properties Worth Walking Through",
    promise: {
      headline: "A Property Website That Sells The",
      headlineAccent: "Address Before The Viewing.",
    },
    promiseBacking:
      "A scroll driven cinematic site where scrolling itself moves the visitor from the water, through the front door, to a skyline view, before the rest of the page even loads in.",
    fascinations: [
      "Why a grid of thumbnail photos undersells a property that a visitor would gladly spend three minutes exploring if you let them.",
      "How scrolling itself becomes the camera move, without a single click, tap, or loading spinner interrupting it.",
      "The little known reason a slow, cinematic first impression converts a serious buyer better than a fast, generic one.",
      "What a website built around one flagship property teaches a visitor to expect from every other listing on the site.",
      "Why the site that took the longest to load used to be the one nobody stayed on, and how that is no longer true.",
      "The one section every luxury property site needs above the fold that almost none of them actually have.",
    ],
    problem: {
      heading: "A Brochure Website Undersells A Property Worth Walking Through",
      paragraphs: [
        "Most real estate websites are the same template with a different photo swapped in: a hero image, a grid of thumbnails, a contact form. That format works for volume listings. It does nothing for a property where the entrance, the light, and the view are the actual sale.",
        "A visitor who has to imagine the experience from four static photos is a visitor who has already discounted the property before they have even booked a viewing.",
      ],
      failedAttempts: [
        {
          tried: "A standard listings-grid template",
          whyItFailed: "Treats a flagship villa exactly like every other unit in the portfolio, with nothing to make the visitor slow down.",
        },
        {
          tried: "A photo gallery with a lightbox viewer",
          whyItFailed: "Puts the visitor in control of pacing they do not yet have the context to use well, so most people click through in seconds.",
        },
        {
          tried: "A drone video embedded at the top of the page",
          whyItFailed: "Autoplay video gets muted or skipped by most visitors within the first two seconds, and tells nobody where to look next.",
        },
      ],
    },
    solution: {
      heading: "Scrolling Becomes The Camera",
      paragraphs: [
        "Instead of a static hero image, the page opens on a pinned scene: scrolling pushes the visitor in from the water, through the villa's front door, and up into a penthouse looking out at the skyline, with the property's own copy appearing in step with the movement.",
        "Once that sequence releases, the rest of the site follows: selected properties with real pricing, an advantage section, area guides, off plan listings, and a valuation form, all in the same restrained, editorial visual language.",
      ],
      categoricalDifference:
        "A photo gallery shows a property. This moves a visitor through one, at a pace the design controls, before they have made up their mind about anything.",
      media: {
        kind: "video",
        src: "/videos/khatri-3d-demo.mp4",
        poster: {
          src: "/images/khatri-3d-poster.jpg",
          width: 1280,
          height: 720,
          alt: "A scroll driven cinematic real estate website opening on a twilight villa, moving into a Selected Properties grid with real AED pricing, and a property valuation form",
        },
        durationLabel: "The scroll sequence, recorded in full",
        captionSummary:
          "The site opens on a twilight villa with the line 'Every address tells you something before you walk in,' scrolls to reveal Selected Properties with real AED pricing across a villa, a penthouse duplex, and a marina apartment, then closes on a valuation form asking for a property's location and type.",
      },
    },
    capacity:
      "This exists today as a real build for Khatri Real Estate, offered as a free template with either AI agent above. We take a small number of custom builds at a time, and if you want your own brand and your own listings in it rather than the free template, we will tell you honestly on the call whether that fits our current schedule.",
    guarantee: {
      heading: "A Privacy Promise, Not A Hard Sell",
      promises: PRIVACY_PROMISES,
    },
    callToAction: {
      heading: CALL_TO_ACTION_INTRO,
      command: "Ask about the 3D Property Website below, free with either AI agent.",
      formLocation: "product_3d_property_website",
    },
    postscript: [
      "P.S. This site is not live to the public today; it has no backend, and the phone number and listings you see in the recording are placeholders standing in for real data. What is real is the build itself, working exactly as shown, and offered free with either AI agent above.",
      "Request your free strategy call above and ask about the site by name, or view either AI agent's own page to see the bonus offer directly.",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* AI Invoice System                                                         */
/* -------------------------------------------------------------------------- */

const aiInvoiceSystem: Product = {
  slug: "ai-invoice-system",
  name: "AI Invoice System",
  dreamBuyer: "Any business still typing out the same invoice template by hand, every single time.",
  shortLabel: "AI Invoice System",
  summary:
    "Read a vendor invoice automatically and check its arithmetic before anyone trusts it, and build your own client invoices from one fixed, branded template instead of retyping it from scratch.",
  icon: "receipt",
  cardImage: {
    src: "/images/invoice-system-card.jpg",
    width: 1672,
    height: 941,
    alt: "An invoice document with its fields extracting into a structured data panel, with a verified checkmark on the total",
  },
  // "Accounts payable automation" / "AP automation" is the real dominant
  // industry term (Bill.com, Tipalti, Stampli own the generic SaaS head
  // term) — "custom" is the honest differentiator against that funded
  // competition, not a claim to out-rank them outright.
  seo: {
    title: "Custom Accounts Payable Automation System",
    description:
      "A custom accounts payable automation system that reads a vendor invoice, checks its own arithmetic before anyone trusts it, and builds your client invoices from one fixed, branded template.",
  },
  offer: {
    kind: "full-offer",
    calloutAudience: "For Any Business Still Retyping Invoices By Hand",
    promise: {
      headline: "Stop Retyping The Same Invoice",
      headlineAccent: "Template Every Single Time.",
    },
    promiseBacking:
      "An AI system that reads a vendor invoice, checks its own arithmetic before anyone trusts it, and builds your client invoices from one fixed, branded template.",
    fascinations: [
      "The exact kind of invoice mistake that looks completely plausible and is the expensive kind, not the obvious kind.",
      "Why an AI reading an invoice is only half the job, and what the other half quietly protects you from.",
      "How a finance team stops retyping the same client invoice template from a saved copy of last month's version.",
      "The one detail on an already sent invoice that should never change again, no matter what happens to the template afterward.",
      "Why an admin who is deactivated should lose access on their very next click, not whenever their login happens to expire.",
      "What happens to a vendor bill the moment its numbers do not add up, before a human ever sees it.",
    ],
    problem: {
      heading: "Every Manually Typed Invoice Is A Small Bet That Nothing Gets Mistyped",
      paragraphs: [
        "Somewhere in most finance workflows, a person opens a vendor invoice, reads the numbers off a PDF or a photo, and types them into a spreadsheet or a system by hand. Or they open last month's client invoice, copy it, and retype the parts that changed. Both are quiet, repetitive, and exactly the kind of task where a small mistake goes unnoticed until it is expensive.",
        "It is not that anyone is careless. It is that retyping the same structure over and over is precisely the condition under which a transposed digit or a missed line slips through, because the task has stopped feeling like it needs full attention.",
      ],
      failedAttempts: [
        {
          tried: "A shared spreadsheet template for client invoices",
          whyItFailed: "Still means opening the last one, copying it, and retyping every changed field by hand, with no check on whether the totals actually add up.",
        },
        {
          tried: "Manually typing vendor invoice data into accounting software",
          whyItFailed: "Slow, and nothing about manual entry catches a misread digit before it becomes a recorded number.",
        },
        {
          tried: "A generic OCR tool with no verification step",
          whyItFailed: "Extracts text from a document but does not check whether the line items, tax, and total actually agree with each other.",
        },
      ],
    },
    solution: {
      heading: "Read Automatically. Verified Before It Is Trusted. Built From One Template.",
      paragraphs: [
        "Upload a vendor invoice, or type it in by hand if that is faster for a particular bill, and the system extracts every field into a structured record, then re-checks the arithmetic itself before anything is treated as correct.",
        "For your own client invoices, one fixed, branded template replaces the retype-from-last-month habit entirely: build the invoice, generate a proper PDF, and download or email it directly.",
      ],
      categoricalDifference:
        "A generic OCR tool reads a document and stops there. This reads it, then independently recomputes the line totals, tax, and grand total, and flags anything that does not add up for a human to check, rather than filing a plausible looking number.",
      media: {
        kind: "process",
        steps: [
          {
            label: "Upload or type",
            description: "A vendor invoice comes in as a file for the system to read, or gets typed in directly when that is faster.",
          },
          {
            label: "Structured extraction",
            description: "Every field, line items, tax, vendor, total, is pulled into a structured record, not left as a flat block of text.",
          },
          {
            label: "Arithmetic verification",
            description: "The line totals, tax, and grand total are independently recomputed and checked against what was extracted before anything is trusted.",
          },
          {
            label: "Synced and ready",
            description: "A verified record syncs to your Notion database, and client invoices generate from one fixed, branded template as a proper PDF.",
          },
        ],
      },
    },
    credentials: {
      heading: "Built And Running For A Real, Paying Client",
      intro:
        "This system was built for Purafall, a water filtration company, who use it for their own invoicing today. The engineering decisions below were made to solve real problems that came up while building it, not written after the fact to sound impressive.",
      client: {
        name: "Purafall",
        context: "A water filtration company using this system for their client and vendor invoicing.",
      },
      proof: proofBySlug["ai-invoice-system"],
      crossReference: {
        label: "Read the full case study",
        description: "How Purafall's website and invoicing system were built, including the website Javed Akhter's own quote refers to.",
        href: "/case-studies/purafall",
      },
    },
    benefits: {
      heading: "What It Does, And What That Actually Means For Your Team",
      rows: [
        {
          feature: "Reads a vendor invoice from an upload",
          benefit: "Nobody manually types a vendor bill's numbers into your system again.",
        },
        {
          feature: "Independently re-verifies every total before trusting it",
          benefit: "A misread digit gets flagged for a human, not filed as fact.",
        },
        {
          feature: "One fixed, branded template for client invoices",
          benefit: "Build an invoice in minutes, not by copying and retyping last month's version.",
        },
        {
          feature: "Generates a real, branded PDF",
          benefit: "Download it or email it directly, with no separate design step.",
        },
        {
          feature: "Freezes an invoice's template the moment it is sent",
          benefit: "A later template change can never silently rewrite a document a client has already relied on.",
        },
        {
          feature: "Database backed sessions with immediate revocation",
          benefit: "Deactivating a team member's access takes effect on their very next request, not whenever a token happens to expire.",
        },
      ],
    },
    socialProof: {
      heading: "In Daily Use At A Real Business",
      statement:
        "Purafall uses this system for their own invoicing today. This is working software inside a real finance workflow, not a demo built to look good on a page.",
      caseStudySlug: "purafall",
      testimonialIds: ["javed-purafall"],
    },
    godfatherOffer: {
      heading: "A Free Strategy Call, Not A Sales Pitch",
      body: "Book a free strategy call and we walk through exactly how your invoicing actually works today, vendor and client side, where the manual retyping and the real risk actually sit, and whether this system is the right fit or overkill for your volume. No proposal fee, no obligation to move forward.",
    },
    bonuses: [
      {
        title: "The Notion Sync, Set Up For You",
        body: "We configure the Notion database connection as part of the build, not as a separate line item, so every verified invoice lands somewhere your team already works.",
      },
      {
        title: "The Extraction Schema We Use",
        body: "The exact structured fields we extract from a vendor invoice, adapted to your document formats, so nothing important gets left out of the record.",
      },
    ],
    valueStack: [
      {
        item: "A written map of every invoice your business currently types or retypes by hand",
        worth: "You cannot fix a process nobody has actually written down, and writing it down is the step almost everyone skips.",
      },
      {
        item: "A straight answer on whether this system is the wrong tool for your invoice volume",
        worth: "The expensive version of this question is finding out after the build.",
      },
      {
        item: "The arithmetic verification approach we use, explained for your actual invoice formats",
        worth: "The check that catches a misread number before it becomes a recorded fact.",
      },
      {
        item: "The failure list. Every real problem we hit building this system, and exactly what fixed each one",
        worth: "You get the fixes without paying for the discovery.",
      },
    ],
    valueStackClose:
      "We are not going to put a figure on that stack, because we would be making it up. What we can tell you is that every line on it is work we normally do inside a paid engagement, and on this call you get it before anyone has signed anything.",
    priceReveal: {
      heading: "What The Call Costs",
      paragraphs: [
        "Nothing, and that is the whole of it. No invoice at the end, no proposal fee, no charge for the map you walk away with.",
        "What it does cost you is one sitting, and some honesty about how many invoices your team actually retypes by hand today, because a map built on a tidied up version of your process is worth less than no map at all.",
        "This is not what the build costs. We do not publish a price for the build, because we have not seen your invoice volume yet, and any figure printed on this page would be a guess dressed up as a quote. You get a real number after the call, in writing, for your situation.",
      ],
    },
    capacity:
      "There is no countdown on this page. We take a small number of builds at a time because the same people who scope your project end up building it, and when we are full we say so on the call rather than after you have waited weeks for a proposal.",
    guarantee: {
      heading: "A Privacy Promise, Not A Hard Sell",
      promises: PRIVACY_PROMISES,
    },
    callToAction: {
      heading: CALL_TO_ACTION_INTRO,
      command: "Request your free strategy call for the AI Invoice System below.",
      formLocation: "product_ai_invoice_system",
    },
    postscript: [
      "P.S. Every invoice retyped from a copy of last month's version is a small, repeated bet that nothing gets mistyped this time. The map above costs you nothing and the call itself is free, so the real cost is the one your team is already paying every billing cycle.",
      "Request your free strategy call above, or at minimum, count how many invoices your team retyped from scratch last month. The number tends to be higher than it feels.",
    ],
  },
};

export const products: Product[] = [voiceAgent, whatsappAgent, threeDPropertyWebsite, aiInvoiceSystem];

export const productsBySlug = Object.fromEntries(
  products.map((product) => [product.slug, product]),
) as Record<Product["slug"], Product>;

export function getProduct(slug: string): Product | undefined {
  return productsBySlug[slug as Product["slug"]];
}
