export type SocialLinkView = {
  label: string;
  url: string;
  icon: string;
};

export type HeroPatternView = {
  url: string;
  width: number | null;
  height: number | null;
};

export type ProfileView = {
  name: string;
  fullName: string;
  role: string;
  location: string;
  email: string;
  bio: string;
  heroLine1: string;
  heroLine2: string;
  aboutHeading: string;
  footerTagline: string;
  logoUrl: string | null;
  heroPortraitUrl: string | null;
  heroPortraitWidth: number | null;
  heroPortraitHeight: number | null;
  aboutBackgroundUrl: string | null;
  footerBackgroundUrl: string | null;
  heroPatterns: HeroPatternView[];
  socials: SocialLinkView[];
};

export type ExperienceView = {
  company: string;
  logo: string | null;
  role: string;
  period: string;
  current: boolean;
  highlights: string[];
};

export type ProjectView = {
  slug: string;
  name: string;
  logo?: string;
  background?: string;
  foreground?: string;
  sectionBackground?: string;
  accent?: string;
  blurb: string;
  summary: string;
  company?: string;
  period?: string;
  role?: string;
  tags: string[];
  features: string[];
};

export type DephiliaView = {
  name: string;
  legalName: string;
  role: string;
  tagline: string;
  url: string;
  description: string;
};

export type DephiliaProductView = {
  name: string;
  category: string;
  description: string;
  accent?: string;
  icon?: string;
  background?: string;
};

export type CertificationView = {
  name: string;
  issuer: string;
  period: string;
  accent?: string;
  logo?: string;
  credentialId?: string;
  url?: string;
};

export type CommunityRoleView = {
  programme: string;
  role: string;
  period: string;
  icon: string;
  metric: string;
  metricNote: string;
};

export type EducationView = {
  school: string;
  degree: string;
  period: string;
  detail: string;
};

export type SiteSettings = {
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
};

export type SiteContent = {
  profile: ProfileView;
  experience: ExperienceView[];
  projects: ProjectView[];
  dephilia: DephiliaView;
  dephiliaProducts: DephiliaProductView[];
  certifications: CertificationView[];
  community: CommunityRoleView[];
  education: EducationView;
  settings: SiteSettings;
};

export type PersonalImageView = {
  url: string;
  width: number | null;
  height: number | null;
};

export type PersonalProfileView = {
  name: string;
  headline: string;
  intro: string;
  location: string;
  email: string;
  portrait: PersonalImageView | null;
  hero: PersonalImageView | null;
};

export type PersonalParagraphView = {
  id: string;
  body: string;
};

export type PersonalSubchapterView = {
  id: string;
  title: string;
  paragraphs: PersonalParagraphView[];
};

export type PersonalChapterView = {
  id: string;
  year: string;
  title: string;
  subchapters: PersonalSubchapterView[];
};

export type PersonalPlaceView = {
  id: string;
  name: string;
  region: string;
  year: string;
  note: string;
  mapsUrl: string | null;
  image: PersonalImageView | null;
};

export type PersonalGalleryView = {
  id: string;
  title: string;
  year: string;
  note: string;
  image: PersonalImageView | null;
};

export type PersonalWishlistView = {
  id: string;
  title: string;
  note: string;
  done: boolean;
  image: PersonalImageView | null;
};

export type PersonalContent = {
  profile: PersonalProfileView;
  story: PersonalChapterView[];
  places: PersonalPlaceView[];
  gallery: PersonalGalleryView[];
  wishlist: PersonalWishlistView[];
};

export type GeneralSettingsView = {
  music: { url: string } | null;
  favicons: {
    portfolio: string | null;
    personal: string | null;
    manage: string | null;
  };
};

export const BRAND_ACCENT = "#ff5c1a";

export const FALLBACK_CONTENT: SiteContent = {
  profile: {
    name: "Kristian David",
    fullName: "",
    role: "",
    location: "",
    email: "",
    bio: "",
    heroLine1: "Complex products,",
    heroLine2: "made simple.",
    aboutHeading: "",
    footerTagline: "",
    logoUrl: null,
    heroPortraitUrl: null,
    heroPortraitWidth: null,
    heroPortraitHeight: null,
    aboutBackgroundUrl: null,
    footerBackgroundUrl: null,
    heroPatterns: [],
    socials: [],
  },
  experience: [],
  projects: [],
  dephilia: {
    name: "Dephilia Solution",
    legalName: "PT Pelita Solusi Digital",
    role: "Founder & Builder",
    tagline: "Solutions Made Different",
    url: "https://dephilia.com",
    description:
      "Every great product starts with an idea. Dephilia helps turn those ideas into digital products that solve real problems, create better experiences, and give businesses room to grow.",
  },
  dephiliaProducts: [],
  certifications: [],
  community: [],
  education: { school: "", degree: "", period: "", detail: "" },
  settings: {
    siteUrl: "https://kristiandav.id",
    siteTitle: "Kristian David · Fullstack Software Engineer",
    siteDescription:
      "Portfolio of Kristian David, a fullstack software engineer in Semarang, Indonesia. Laravel, Next.js and React systems for loyalty, ticketing, tournaments and IoT.",
  },
};
