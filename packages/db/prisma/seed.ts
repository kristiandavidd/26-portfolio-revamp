import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ManifestAsset = {
  silosFileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder: string;
  kind: string;
  width: number | null;
  height: number | null;
};

type Manifest = {
  generatedAt: string | null;
  files: Record<string, ManifestAsset>;
};

const manifest: Manifest = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "seed/assets.manifest.json"),
    "utf8",
  ),
);

function assetRecord(key: string) {
  const record = manifest.files[key];
  if (!record) {
    throw new Error(
      `Asset "${key}" is missing from the manifest. Run "npm run assets:upload" first.`,
    );
  }
  return record;
}

function assetId(key?: string) {
  if (!key) return null;
  return assetIds.get(key) ?? null;
}

const assetIds = new Map<string, string>();

async function seedAssets() {
  for (const [key, record] of Object.entries(manifest.files)) {
    const asset = await prisma.asset.upsert({
      where: { silosFileId: record.silosFileId },
      update: {
        url: record.url,
        width: record.width,
        height: record.height,
        folder: record.folder,
      },
      create: {
        silosFileId: record.silosFileId,
        filename: record.filename,
        originalName: record.originalName,
        mimeType: record.mimeType,
        sizeBytes: record.size,
        url: record.url,
        width: record.width,
        height: record.height,
        kind: record.kind,
        scope: "portfolio",
        folder: record.folder,
        alt: path.basename(record.originalName, path.extname(record.originalName)),
      },
    });

    assetIds.set(key, asset.id);
  }

  console.log(`✓ ${assetIds.size} assets registered`);
}

async function clearContent() {
  await prisma.projectTag.deleteMany();
  await prisma.projectFeature.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.experienceHighlight.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.company.deleteMany();
  await prisma.heroPattern.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.dephiliaProduct.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.communityRole.deleteMany();
  await prisma.education.deleteMany();
  await prisma.personalSection.deleteMany();
}

async function main() {
  await seedAssets();
  await clearContent();

  // -------------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------------
  const companySeeds = [
    { slug: "nexa", name: "NEXA", logo: "company/nexa.png", sortOrder: 0 },
    {
      slug: "dephilia",
      name: "Dephilia Solution",
      logo: "company/dephilia.png",
      sortOrder: 1,
    },
    {
      slug: "swiftlead",
      name: "Swiftlead Indonesia",
      logo: "company/swiftlead.png",
      sortOrder: 2,
    },
    { slug: "sea-design", name: "Sea Design", logo: "company/sea.png", sortOrder: 3 },
  ];

  const companyIds = new Map<string, string>();
  for (const company of companySeeds) {
    const row = await prisma.company.create({
      data: {
        slug: company.slug,
        name: company.name,
        logoAssetId: assetId(company.logo),
        sortOrder: company.sortOrder,
      },
    });
    companyIds.set(company.slug, row.id);
  }

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------
  await prisma.profile.create({
    data: {
      id: 1,
      name: "Kristian David",
      location: "Semarang, Indonesia",
      email: "kristiandavid@dephilia.com",
      bio: "Being a software engineer here has meant following problems wherever they show up, then building the cleanest answer possible. That habit led to a variety of projects across web, mobile, and beyond, each with its own vibe. Let’s dive into those chapters and what was solved in each one.",
      heroLine1: "Complex products,",
      heroLine2: "made simple.",
      aboutHeading: "the person behind the work",
      footerTagline: "Fullstack engineer building web products end to end.",
      logoAssetId: assetId("primary-logo.png"),
      heroPortraitAssetId: assetId("hero-portrait.png"),
      aboutBackgroundAssetId: assetId("about-bg.png"),
      footerBackgroundAssetId: assetId("bg-footer.png"),
    },
  });

  await prisma.socialLink.createMany({
    data: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/kristiandavidd/",
        icon: "instagram",
        sortOrder: 0,
      },
      {
        label: "LinkedIn",
        url: "https://linkedin.com/in/kristiandavidd/",
        icon: "linkedin",
        sortOrder: 1,
      },
      {
        label: "Website",
        url: "https://kristiandav.id/",
        icon: "website",
        sortOrder: 2,
      },
    ],
  });

  await prisma.heroPattern.createMany({
    data: [1, 2, 3, 4].map((index) => ({
      assetId: assetId(`hero-pattern-${index}.png`)!,
      sortOrder: index,
    })),
  });

  // -------------------------------------------------------------------------
  // Experience
  // -------------------------------------------------------------------------
  const experienceSeeds = [
    {
      company: "nexa",
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
      company: "dephilia",
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
      company: "swiftlead",
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

  for (const [index, item] of experienceSeeds.entries()) {
    await prisma.experience.create({
      data: {
        companyId: companyIds.get(item.company)!,
        role: item.role,
        periodLabel: item.period,
        isCurrent: item.current,
        sortOrder: index,
        highlights: {
          create: item.highlights.map((content, order) => ({
            content,
            sortOrder: order,
          })),
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------
  const projectSeeds = [
    {
      slug: "foryou",
      name: "ForYou",
      company: "nexa",
      background: "projects/foryou-1.webp",
      foreground: "projects/foryou-2.webp",
      sectionBackground: "projects/bg-foryou.webp",
      blurb:
        "The internal CMS behind Sinar Mas Land's loyalty and rewards programme.",
      summary:
        "ForYou is a loyalty and rewards application built by Sinar Mas Land to drive customer engagement across its retail ecosystem. I developed and maintained the internal CMS that operations teams use to run it: campaign content, redeemable rewards, user segments and reporting dashboards.",
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
      company: "nexa",
      background: "projects/padel-1.webp",
      foreground: "projects/padel-2.webp",
      sectionBackground: "projects/bg-padel.webp",
      blurb:
        "End-to-end tournament platform that carried 120+ competing pairs from registration to live scoring.",
      summary:
        "An end-to-end tournament management platform built to power the Nexa Corporate Padel Tournament, supporting more than 120 competing pairs across multiple companies. It covers the whole lifecycle: corporate registration and multi-level approval, payment verification, tournament operations and live match scoring.",
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
      company: "nexa",
      background: "projects/hos-1.webp",
      foreground: "projects/hos-2.webp",
      sectionBackground: "projects/bg-hos.webp",
      blurb:
        "The official digital experience for an 11,000-attendee music festival.",
      summary:
        "Home of Sound is a large-scale music festival with more than 11,000 attendees. I built the official digital experience: the central destination for event information, voucher redemption, ticket availability and personalised invitations, with seamless integration to the NexaTiket ticketing platform.",
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
      company: "nexa",
      background: "projects/nexatiket-1.webp",
      foreground: "projects/nexatiket-2.webp",
      sectionBackground: "projects/bg-nexatiket.webp",
      blurb:
        "Ticketing platform covering the whole event lifecycle, from purchase to on-site entry.",
      summary:
        "NexaTiket is an end-to-end ticketing platform connecting the entire event lifecycle from ticket purchase to on-site entry. It manages payments, transactions, vouchers, events, tickets and reporting, with attendee validation handled through a PWA-based ticket scanner that keeps working offline on event day.",
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
      company: "nexa",
      background: "projects/findpix-1.webp",
      foreground: "projects/findpix-2.webp",
      sectionBackground: "projects/bg-findpix.webp",
      blurb:
        "AI-powered event photo platform, searched by face recognition or BIB number.",
      summary:
        "FindPix is an AI-powered web platform for event photo management, letting people find, purchase or access event photos through face recognition or BIB number detection. I built the responsive interfaces and wired the AI-driven search results into the web experience.",
      role: "Frontend Developer",
      tags: ["React.js", "Framer Motion"],
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
      company: "nexa",
      background: "projects/messenger-1.webp",
      foreground: "projects/messenger-2.webp",
      sectionBackground: "projects/bg-messenger.webp",
      blurb:
        "WhatsApp Business SaaS platform, later migrated to a wallet-based pricing model.",
      summary:
        "Nexa Messenger is a SaaS platform for WhatsApp Business services powered by Meta's API, covering marketing messages, automated replies, template management and agent-based customer communication. As Meta's pricing and policies changed, I moved the platform's business processes onto a new wallet-based pricing model.",
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
      company: "nexa",
      background: "projects/semargres-1.webp",
      foreground: "projects/semargres-2.webp",
      sectionBackground: "projects/bg-semargres.webp",
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
      company: "swiftlead",
      background: "projects/swiftlead-1.webp",
      foreground: "projects/swiftlead-2.webp",
      sectionBackground: "projects/bg-swiftlead.webp",
      blurb:
        "IoT platform for swiftlet farmers, monitoring birdhouses through live sensors.",
      summary:
        "Swiftlead is an IoT platform that helps swiftlet farmers monitor and manage their birdhouses through real-time temperature and humidity sensors. I built the web monitoring system and landing page, and contributed to selected features of the mobile application.",
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
      company: "sea-design",
      background: "projects/sea-1.webp",
      foreground: "projects/sea-2.webp",
      sectionBackground: "projects/bg-sea.webp",
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

  const tagNames = Array.from(
    new Set(projectSeeds.flatMap((project) => project.tags)),
  ).sort();

  const tagIds = new Map<string, string>();
  for (const [index, name] of tagNames.entries()) {
    const tag = await prisma.tag.create({
      data: {
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        sortOrder: index,
      },
    });
    tagIds.set(name, tag.id);
  }

  for (const [index, project] of projectSeeds.entries()) {
    await prisma.project.create({
      data: {
        slug: project.slug,
        name: project.name,
        companyId: companyIds.get(project.company)!,
        logoAssetId: assetId(`company/${
          project.company === "sea-design" ? "sea" : project.company
        }.png`),
        backgroundAssetId: assetId(project.background),
        foregroundAssetId: assetId(project.foreground),
        sectionBackgroundAssetId: assetId(project.sectionBackground),
        blurb: project.blurb,
        summary: project.summary,
        role: project.role,
        sortOrder: index,
        features: {
          create: project.features.map((content, order) => ({
            content,
            sortOrder: order,
          })),
        },
        tags: {
          create: project.tags.map((tag) => ({ tagId: tagIds.get(tag)! })),
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Dephilia products
  // -------------------------------------------------------------------------
  await prisma.dephiliaProduct.createMany({
    data: [
      {
        slug: "echo",
        name: "Echo",
        category: "Internal Messaging Infrastructure",
        description:
          "A centralized communication layer built to handle transactional email and messaging across Dephilia's digital products and services.",
        accent: "#ff5c1a",
        iconAssetId: assetId("dephilia/icon-echo.png"),
        backgroundAssetId: assetId("dephilia/bg-echo-3.png"),
        sortOrder: 0,
      },
      {
        slug: "silos",
        name: "Silos",
        category: "Internal Storage Infrastructure",
        description:
          "A centralized storage layer built to manage and deliver digital assets across Dephilia's applications and services.",
        accent: "#ff8a1a",
        iconAssetId: assetId("dephilia/icon-silos.png"),
        backgroundAssetId: assetId("dephilia/bg-silos-1.png"),
        sortOrder: 1,
      },
      {
        slug: "vessel",
        name: "Vessel",
        category: "Internal Payment Infrastructure",
        description:
          "A payment layer that connects Dephilia's digital products with payment providers through a unified system, simplifying payment operations.",
        accent: "#ffb020",
        iconAssetId: assetId("dephilia/icon-vessel.png"),
        backgroundAssetId: assetId("dephilia/bg-vessel-1.png"),
        sortOrder: 2,
      },
      {
        slug: "pad",
        name: "PAD",
        category: "Logo Marketplace",
        description:
          "A digital marketplace designed to make professional logo design more accessible by connecting creators with businesses.",
        accent: "#ff6f61",
        iconAssetId: assetId("dephilia/icon-pad.png"),
        backgroundAssetId: assetId("dephilia/bg-pad-1.png"),
        sortOrder: 3,
      },
      {
        slug: "surname",
        name: "Surname",
        category: "Link Shortener",
        description:
          "A lightweight URL shortening service that turns complex URLs into simple, manageable links for easier sharing.",
        accent: "#e04a0d",
        iconAssetId: assetId("dephilia/icon-surname.png"),
        backgroundAssetId: assetId("dephilia/bg-surname-3.png"),
        sortOrder: 4,
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Certifications and community
  // -------------------------------------------------------------------------
  await prisma.certification.createMany({
    data: [
      {
        name: "AWS Certified\nCloud Practitioner",
        issuer: "Amazon Web Services",
        periodLabel: "Nov 2025 – Nov 2028",
        logoAssetId: assetId("cert-aws-2.png"),
        sortOrder: 0,
      },
      {
        name: "Microsoft Certified:\nAzure AI Engineer Associate",
        issuer: "Microsoft",
        periodLabel: "Oct 2025 – Oct 2026",
        logoAssetId: assetId("cert-microsoft-2.png"),
        sortOrder: 1,
      },
    ],
  });

  await prisma.communityRole.createMany({
    data: [
      {
        programme: "Google Cloud Arcade Facilitator",
        role: "Facilitator",
        periodLabel: "2024",
        icon: "cloud",
        metric: "Top 30",
        metricNote: "of 100 facilitators",
        sortOrder: 0,
      },
      {
        programme: "Microsoft ElevAIte by Dicoding",
        role: "Facilitator",
        periodLabel: "2025",
        icon: "brain",
        metric: "2nd",
        metricNote: "of 5 facilitators",
        sortOrder: 1,
      },
      {
        programme: "Google Cloud Arcade Facilitator",
        role: "Facilitator",
        periodLabel: "2025",
        icon: "layers",
        metric: "70+",
        metricNote: "cohorts facilitated",
        sortOrder: 2,
      },
      {
        programme: "Google Cloud Arcade Facilitator",
        role: "Facilitator",
        periodLabel: "2026",
        icon: "flame",
        metric: "Top 40",
        metricNote: "of 400+ facilitators, milestone met",
        sortOrder: 3,
      },
    ],
  });

  await prisma.education.create({ data: { id: 1 } });

  // -------------------------------------------------------------------------
  // Personal placeholder
  // -------------------------------------------------------------------------
  await prisma.personalSection.createMany({
    data: [
      { key: "about", title: "About", body: "", sortOrder: 0 },
      { key: "now", title: "Now", body: "", sortOrder: 1 },
      { key: "notes", title: "Notes", body: "", sortOrder: 2 },
    ],
  });

  console.log("✓ Content seeded");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
