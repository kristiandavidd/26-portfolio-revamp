export type SocialLink = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  fullName: string;
  role: string;
  location: string;
  email: string;
  bio: string;
  socials: SocialLink[];
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type ExperienceItem = {
  company: string;
  /** Optional path under /public, e.g. "/images/logo-nexa.png". Falls back to a monogram. */
  logo?: string;
  role: string;
  period: string;
  current: boolean;
  highlights: string[];
};

export type Project = {
  slug: string;
  name: string;
  /** Optional path under /public, e.g. "/images/logo-loyalty.png". Falls back to a monogram. */
  logo?: string;
  /**
   * Optional path under /public for the background layer of the frame. 4:3, so
   * it fills the frame exactly. Falls back to a drawn panel.
   */
  background?: string;
  /**
   * Optional path under /public for the foreground layer, drawn over the
   * background. Same 4:3 canvas and the same pixel size, so the two line up
   * exactly before the motion pulls them apart. Transparent PNG. Without one
   * only the background is shown.
   */
  foreground?: string;
  /**
   * Optional path under /public for the full-bleed backdrop of this project's
   * slot on the wall. Sits behind everything and is dimmed at both edges into
   * black, so consecutive projects dissolve into each other instead of butting
   * against a seam. Without one the slot stays on flat black.
   */
  sectionBackground?: string;
  /** Per-project accent for the corners, rule and hover states. Defaults to the brand orange. */
  accent?: string;
  /** One line, used on the wall and as the meta description. */
  blurb: string;
  /** Longer framing, shown only on the detail page. */
  summary: string;
  /** Where the work was done. Left out where the source notes do not name a client. */
  company?: string;
  /** Left out where the source notes do not give a date. */
  period?: string;
  role?: string;
  tags: string[];
  /** The scope list from the source notes, shown as "What it does". */
  features: string[];
};

/** A product built under Dephilia. These are infrastructure and marketplaces
 * rather than client work, so they get a shorter shape and no case pages. */
export type DephiliaProduct = {
  name: string;
  category: string;
  description: string;
  /** Accent for the icon tile. Defaults to the brand orange. */
  accent?: string;
  /**
   * Optional path under /public for the mark centred at the top of the card,
   * e.g. "/images/dephilia/icon-echo.png". Falls back to a monogram tile.
   */
  icon?: string;
  /**
   * Optional path under /public for the card's backdrop, e.g.
   * "/images/dephilia/bg-echo.png". Held desaturated until the card is hovered.
   * Without one the card sits on plain white.
   */
  background?: string;
};

/** A programme the community work was done for. */
export type CommunityRole = {
  programme: string;
  role: string;
  period: string;
};

export type Certification = {
  name: string;
  issuer: string;
  period: string;
  /** Optional accent for the row rule, seal and hover states. */
  accent?: string;
  /** Optional path under /public, e.g. "/images/cert-aws.png". Falls back to a monogram. */
  logo?: string;
  /** Optional serial shown on the plate, e.g. a credential id. */
  credentialId?: string;
  /** Optional link that verifies the credential. */
  url?: string;
};

export type Education = {
  school: string;
  degree: string;
  period: string;
  detail: string;
};

/** Keys map to icons in the Activities section. Add a key here and a matching
 * entry in that component's ICONS map. */
export type ActivityIcon =
  | "design"
  | "writing"
  | "selling"
  | "building"
  | "teaching"
  | "community";

export type Activity = {
  title: string;
  description: string;
  icon: ActivityIcon;
  /** Optional external link, e.g. a shop or a newsletter. */
  url?: string;
};

export const profile: Profile = {
  name: "Kristian David",
  fullName: "",
  role: "",
  location: "Semarang, Indonesia",
  // Taken from this repo's git commit author. Confirm before shipping.
  email: "kristiandavid644@gmail.com",
  bio: "I'm a fullstack software engineer based in Semarang, Indonesia. I build web products end to end, from the Laravel and Next.js services behind the scenes to the React interfaces people actually use. That has meant SaaS platforms, loyalty systems, and IoT dashboards serving thousands of users.",
  socials: [],
};

export const skills: SkillGroup[] = [];

export const experience: ExperienceItem[] = [
  {
    company: "NEXA",
    role: "Fullstack Web Developer",
    period: "Jun 2025 – Present",
    current: true,
    highlights: [
      "Engineered responsive, user-facing applications with React.js and Next.js, improving performance and user experience.",
      "Developed and optimized scalable web applications in an agile environment, contributing to systems serving 20,000+ users.",
      "Built SaaS and enterprise systems on Laravel, including WhatsApp Business platforms, loyalty CMS for mall clients, and HRIS applications.",
      "Shipped features for omnichannel platforms and real-time event systems, including coupon drawing and loyalty applications.",
    ],
  },
  {
    company: "Dephilia Solution",
    role: "Software Engineer",
    period: "Apr 2023 – Jun 2025",
    current: false,
    highlights: [
      "Led development of a scalable online election system supporting 700–800+ users with real-time vote counting and secure authentication.",
      "Built event management platforms handling 1000+ participants, covering registration, submission, and evaluation workflows with Laravel and React.",
      "Developed responsive frontend interfaces in Next.js, including participant dashboards and real-time announcement systems.",
    ],
  },
  {
    company: "Swiftlead Indonesia",
    role: "Fullstack Developer",
    period: "Dec 2023 – Feb 2025",
    current: false,
    highlights: [
      "Developed an IoT-based smart farm management system with real-time monitoring of temperature and humidity.",
      "Built web and mobile applications with data visualization, role-based access control, and automated notifications.",
      "Improved operational efficiency through centralized monitoring and data-driven insights.",
    ],
  },
];

// The wall, in the order the source notes number them. A warm ramp rather than
// one brand orange repeated nine times, so the wall reads as a sequence advancing.
export const projects: Project[] = [
  {
    slug: "foryou",
    name: "ForYou",
    accent: "#ff5c1a",
    background: "/images/projects/foryou-1.webp",
    foreground: "/images/projects/foryou-2.webp",
    sectionBackground: "/images/projects/bg-foryou.webp",
    blurb:
      "The internal CMS behind Sinar Mas Land's loyalty and rewards programme.",
    summary:
      "ForYou is a loyalty and rewards application built by Sinar Mas Land to drive customer engagement across its retail ecosystem. I developed and maintained the internal CMS that operations teams use to run it — campaign content, redeemable rewards, user segments and reporting dashboards.",
    company: "Nexa",
    role: "Web Developer",
    tags: ["Laravel", "MySQL"],
    features: [
      "Internal CMS development",
      "Campaign content management",
      "Reward management",
      "User segmentation",
      "Voucher management",
      "Coupon management",
      "Point management",
      "Member tiering",
      "Reward drawing",
      "Tenant management",
      "Marketing and campaign management",
      "Reporting and analytics",
      "Transaction gamification",
    ],
  },
  {
    slug: "nexa-padel-tournament",
    name: "Nexa Corporate Padel Tournament",
    accent: "#ff8a1a",
    background: "/images/projects/padel-1.webp",
    foreground: "/images/projects/padel-2.webp",
    sectionBackground: "/images/projects/bg-padel.webp",
    blurb:
      "End-to-end tournament platform that carried 120+ competing pairs from registration to live scoring.",
    summary:
      "An end-to-end tournament management platform built to power the Nexa Corporate Padel Tournament, supporting more than 120 competing pairs across multiple companies. It covers the whole lifecycle: corporate registration and multi-level approval, payment verification, tournament operations and live match scoring.",
    company: "NEXA",
    role: "Web Developer",
    tags: ["Next.js", "TypeScript", "WebSocket"],
    features: [
      "Corporate registration",
      "Multi-level approval workflow",
      "Participant portal",
      "Payment integration",
      "Tournament management",
      "Match management",
      "Live scoring",
      "Umpire dashboard",
      "Scoreboard",
      "Tournament operations",
    ],
  },
  {
    slug: "home-of-sound",
    name: "Home of Sound",
    accent: "#ffb020",
    background: "/images/projects/hos-1.webp",
    foreground: "/images/projects/hos-2.webp",
    sectionBackground: "/images/projects/bg-hos.webp",
    blurb:
      "The official digital experience for an 11,000-attendee music festival.",
    summary:
      "Home of Sound is a large-scale music festival with more than 11,000 attendees. I built the official digital experience: the central destination for event information, voucher redemption, ticket availability and personalised invitations, with seamless integration to the NexaTiket ticketing platform.",
    company: "NEXA",
    role: "Web Developer",
    tags: ["React.js", "TypeScript", "REST API"],
    features: [
      "Event landing page",
      "Event information",
      "Voucher campaign",
      "Voucher redemption",
      "Ticket availability",
      "Ticket sales integration",
      "Eligibility handling",
      "Invitation portal",
      "Personalised invitations",
      "NexaTiket integration",
    ],
  },
  {
    slug: "nexatiket",
    name: "NexaTiket",
    accent: "#ff6f61",
    background: "/images/projects/nexatiket-1.webp",
    foreground: "/images/projects/nexatiket-2.webp",
    sectionBackground: "/images/projects/bg-nexatiket.webp",
    blurb:
      "Ticketing platform covering the whole event lifecycle, from purchase to on-site entry.",
    summary:
      "NexaTiket is an end-to-end ticketing platform connecting the entire event lifecycle from ticket purchase to on-site entry. It manages payments, transactions, vouchers, events, tickets and reporting, with attendee validation handled through a PWA-based ticket scanner that keeps working offline on event day.",
    company: "NEXA",
    role: "Web Developer",
    tags: ["Python", "CodeIgniter", "MySQL", "PWA"],
    features: [
      "Ticket transactions",
      "Payment gateway integration",
      "Event management",
      "Ticket management",
      "Voucher management",
      "Transaction management",
      "Event reporting",
      "Ticket reporting",
      "PWA ticket scanner",
      "Offline synchronization",
      "On-site ticket validation",
    ],
  },
  {
    slug: "findpix",
    name: "FindPix",
    accent: "#ff3d3d",
    background: "/images/projects/findpix-1.webp",
    foreground: "/images/projects/findpix-2.webp",
    sectionBackground: "/images/projects/bg-findpix.webp",
    blurb:
      "AI-powered event photo platform, searched by face recognition or BIB number.",
    summary:
      "FindPix is an AI-powered web platform for event photo management, letting people find, purchase or access event photos through face recognition or BIB number detection. I built the responsive interfaces and wired the AI-driven search results into the web experience.",
    role: "Frontend Developer",
    tags: ["React.js", "Framer Motion"],
    company: "Nexa",
    features: [
      "Event management",
      "Photographer management",
      "AI-based photo search",
      "Face recognition search",
      "BIB number detection",
      "Photo marketplace",
      "Payment gateway integration",
      "Instant image processing",
      "Responsive web interface",
    ],
  },
  {
    slug: "nexa-messenger",
    name: "Nexa Messenger",
    accent: "#e04a0d",
    background: "/images/projects/messenger-1.webp",
    foreground: "/images/projects/messenger-2.webp",
    sectionBackground: "/images/projects/bg-messenger.webp",
    blurb:
      "WhatsApp Business SaaS platform, later migrated to a wallet-based pricing model.",
    summary:
      "Nexa Messenger is a SaaS platform for WhatsApp Business services powered by Meta's API, covering marketing messages, automated replies, template management and agent-based customer communication. As Meta's pricing and policies changed, I moved the platform's business processes onto a new wallet-based pricing model.",
    company: "NEXA",
    role: "Web Developer",
    tags: ["Laravel", "MySQL"],
    features: [
      "WhatsApp Business integration",
      "Message broadcasting",
      "Agent-based chat",
      "Template management",
      "Wallet management",
      "Split budget",
      "Usage-based pricing",
      "Overage handling",
      "Hard-block configuration",
      "Usage reporting",
      "Margin reporting",
      "Broadcast cost estimation",
      "Broadcast balance reservation",
      "Wallet reconciliation",
      "Webhook retry and logging",
      "Meta API migration",
    ],
  },
  {
    slug: "semarang-great-sale",
    name: "Semarang Great Sale",
    accent: "#ff9f45",
    company: "Nexa",
    background: "/images/projects/semargres-1.webp",
    foreground: "/images/projects/semargres-2.webp",
    sectionBackground: "/images/projects/bg-semargres.webp",
    blurb:
      "City-wide shopping campaign connecting customers, merchants and tenants in one ecosystem.",
    summary:
      "Semarang Great Sale is a large-scale city-wide shopping campaign that connects customers, merchants and tenants through a unified digital ecosystem. I worked across both sides of it: the public-facing event experience and the operational systems used to manage merchants, tenants, campaigns, coupons, vouchers, users and events.",
    role: "Web Developer",
    tags: ["Laravel", "CodeIgniter", "MySQL"],
    features: [
      "Public landing page",
      "Event information",
      "Merchant CMS",
      "Tenant CMS",
      "User management",
      "Coupon management",
      "Voucher management",
      "Member tiering",
      "Reward drawing",
      "Marketing and campaign management",
      "Event management",
      "Reporting and analytics",
    ],
  },
  {
    slug: "swiftlead",
    name: "Swiftlead",
    accent: "#ffcf5c",
    background: "/images/projects/swiftlead-1.webp",
    foreground: "/images/projects/swiftlead-2.webp",
    sectionBackground: "/images/projects/bg-swiftlead.webp",
    blurb:
      "IoT platform for swiftlet farmers, monitoring birdhouses through live sensors.",
    summary:
      "Swiftlead is an IoT platform that helps swiftlet farmers monitor and manage their birdhouses through real-time temperature and humidity sensors. I built the web monitoring system and landing page, and contributed to selected features of the mobile application.",
    company: "Swiftlead Indonesia",
    role: "Fullstack Developer",
    tags: ["Next.js", "Express.js", "Flutter", "WebSocket", "IoT"],
    features: [
      "Real-time sensor monitoring",
      "Temperature monitoring",
      "Humidity monitoring",
      "IoT device control",
      "Web monitoring dashboard",
      "Mobile application",
      "Revenue and sales tracking",
      "Harvest management",
      "Nest management",
      "Reporting and analytics",
      "Freemium features",
      "WebSocket communication",
    ],
  },
  {
    slug: "sea-design",
    name: "Sea Design",
    accent: "#ff7b2e",
    background: "/images/projects/sea-1.webp",
    foreground: "/images/projects/sea-2.webp",
    sectionBackground: "/images/projects/bg-sea.webp",
    company:"Sea Design",
    blurb:
      "Print-on-demand storefront letting creators sell designs without holding inventory.",
    summary:
      "Sea Design is a print-on-demand e-commerce platform focused on custom apparel, letting creators sell their designs while products are produced and shipped on demand. The model is what makes it interesting: designers earn from their work without ever touching inventory or logistics.",
    role: "Web Developer",
    tags: ["WordPress"],
    features: [
      "E-commerce website",
      "Print-on-demand",
      "Product management",
      "Custom product sales",
      "Design marketplace",
      "Creator-focused commerce",
    ],
  },
];

export const dephilia = {
  name: "Dephilia Solution",
  legalName: "PT Pelita Solusi Digital",
  role: "Founder & Builder",
  tagline: "Not Your Ordinary Solution.",
  // Confirm the domain before shipping.
  url: "https://dephilia.com",
  description:
    "A product studio I founded to turn real business challenges into practical digital solutions. From custom websites and business systems to applications and AI-powered solutions, the work is built around how businesses actually operate.",
};

// Dephilia's own products: shared infrastructure the studio's client work runs
// on, plus two marketplaces. Grouped products, not client engagements, which is
// why they are kept apart from the wall above.
export const dephiliaProducts: DephiliaProduct[] = [
  {
    name: "Echo",
    category: "Internal Messaging Infrastructure",
    description:
      "A centralized communication layer built to handle transactional email and messaging across Dephilia's digital products and services.",
    accent: "#ff5c1a",
    icon: "/images/dephilia/icon-echo.png",
    background: "/images/dephilia/bg-echo-3.png",
  },
  {
    name: "Silos",
    category: "Internal Storage Infrastructure",
    description:
      "A centralized storage layer built to manage and deliver digital assets across Dephilia's applications and services.",
    accent: "#ff8a1a",
    icon: "/images/dephilia/icon-silos.png",
    background: "/images/dephilia/bg-silos-1.png",
  },
  {
    name: "Vessel",
    category: "Internal Payment Infrastructure",
    description:
      "A payment layer that connects Dephilia's digital products with payment providers through a unified system, simplifying payment operations.",
    accent: "#ffb020",
    icon: "/images/dephilia/icon-vessel.png",
    background: "/images/dephilia/bg-vessel-1.png",
  },
  {
    name: "PAD",
    category: "Logo Marketplace",
    description:
      "A digital marketplace designed to make professional logo design more accessible by connecting creators with businesses.",
    accent: "#ff6f61",
    icon: "/images/dephilia/icon-pad.png",
    background: "/images/dephilia/bg-pad-1.png",
  },
  {
    name: "Surname",
    category: "Link Shortener",
    description:
      "A lightweight URL shortening service that turns complex URLs into simple, manageable links for easier sharing.",
    accent: "#e04a0d",
    icon: "/images/dephilia/icon-surname.png",
    background: "/images/dephilia/bg-surname-3.png",
  },
];

// Facilitator roles from the source notes. Kept as data rather than worked into
// a section yet: they are a recurring yearly role rather than a one-off piece
// of work, so they do not fit the Activities list's shape of one line each.
export const community: CommunityRole[] = [
  {
    programme: "Google Cloud Arcade Facilitator",
    role: "Facilitator",
    period: "2024",
  },
  {
    programme: "Microsoft ElevAIte by Dicoding",
    role: "Facilitator",
    period: "2025",
  },
  {
    programme: "Google Cloud Arcade Facilitator",
    role: "Facilitator",
    period: "2025",
  },
  {
    programme: "Google Cloud Arcade Facilitator",
    role: "Facilitator",
    period: "2026",
  },
];

// Titles and validity windows come from the source notes. Credential ids and
// verification links are still open, so the Verify button stays hidden until
// a url is added here.
export const certifications: Certification[] = [
  {
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    period: "Nov 2025 – Nov 2028",
    logo: "/images/cert-aws.png",
  },
  {
    name: "Microsoft Certified: Azure AI Engineer Associate",
    issuer: "Microsoft",
    period: "Oct 2025 – Oct 2026",
    logo: "/images/cert-microsoft.png",
  },
];

// Seeded with the three you named. The descriptions are deliberately blank:
// this section is about what you are actually doing, so the words should be
// yours. Add more entries any time; the grid takes as many as you give it.
export const activities: Activity[] = [
  { title: "Design", description: "", icon: "design" },
  { title: "Writing", description: "", icon: "writing" },
  { title: "Selling", description: "", icon: "selling" },
];

export const education: Education = {
  school: "",
  degree: "",
  period: "",
  detail: "",
};
