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
  role: string;
  period: string;
  current: boolean;
  highlights: string[];
};

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  role: string;
  tags: string[];
  features: string[];
};

export type Certification = {
  name: string;
  issuer: string;
  period: string;
};

export type Education = {
  school: string;
  degree: string;
  period: string;
  detail: string;
};

export const profile: Profile = {
  name: "Kristian David",
  fullName: "",
  role: "",
  location: "",
  email: "",
  bio: "I'm a fullstack software engineer based in Semarang, Indonesia. I build web products end to end, from the Laravel and Next.js services behind the scenes to the React interfaces people actually use. That has meant SaaS platforms, loyalty systems, and IoT dashboards serving thousands of users.",
  socials: [],
};

export const skills: SkillGroup[] = [];

export const experience: ExperienceItem[] = [];

export const projects: Project[] = [];

export const certifications: Certification[] = [];

export const education: Education = {
  school: "",
  degree: "",
  period: "",
  detail: "",
};
