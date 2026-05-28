/**
 * Zod schema cho nội dung trang chủ + giới thiệu (CMS).
 * Mỗi key = 1 section, lưu JSON trong bảng Setting.
 * Ảnh là chuỗi URL (Cloudinary/http) hoặc "" (fallback gradient/icon ở component).
 */
import { z } from "zod";

const shortText = z.string().max(300);
const longText = z.string().max(5000);
const href = z.string().max(300);
const imageUrl = z.string().max(2000);

// ---- Home: Hero carousel ----
export const heroSlideSchema = z.object({
  image: imageUrl,
  badge: z.string().max(120),
  heading: z.string().max(200),
  subHeading: z.string().max(600),
  ctaLabel: z.string().max(120),
  ctaHref: href,
});
export const homeHeroSchema = z.object({
  slides: z.array(heroSlideSchema).min(1).max(6),
});
export type HeroSlide = z.infer<typeof heroSlideSchema>;

// ---- Home: About summary ----
export const statSchema = z.object({
  value: z.string().max(40),
  label: z.string().max(120),
});
export const homeAboutSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  paragraph1: longText,
  paragraph2: longText,
  ctaLabel: shortText,
  ctaHref: href,
  stats: z.array(statSchema).max(8),
});

// ---- Home: Services section header ----
export const sectionHeaderSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  subHeading: longText,
});

// ---- Home: Why choose us ----
export const reasonSchema = z.object({
  title: z.string().max(200),
  description: longText,
});
export const homeWhySchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  reasons: z.array(reasonSchema).max(8),
});

// ---- Home: CTA ----
export const homeCtaSchema = z.object({
  heading: z.string().max(300),
  paragraph: longText,
  items: z.array(z.string().max(200)).max(8),
  button1Label: shortText,
  button1Href: href,
  button2Label: shortText,
  button2Href: href,
});

// ---- About: Hero ----
export const aboutHeroSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  paragraph: longText,
});

// ---- About: Company story ----
export const aboutStorySchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  paragraph1: longText,
  paragraph2: longText,
  image: imageUrl,
  overlayBadge: shortText,
  overlayCaption: z.string().max(300),
});

// ---- About: Vision / Mission / Values ----
export const pillarSchema = z.object({
  label: z.string().max(120),
  title: z.string().max(300),
  description: longText,
});
export const aboutVmvSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  pillars: z.array(pillarSchema).max(6),
});

// ---- About: Timeline ----
export const milestoneSchema = z.object({
  year: z.string().max(20),
  title: z.string().max(200),
  description: longText,
});
export const aboutTimelineSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  milestones: z.array(milestoneSchema).max(12),
});

// ---- About: Leadership ----
export const leaderSchema = z.object({
  name: z.string().max(120),
  role: z.string().max(120),
  bio: longText,
  photo: imageUrl,
});
export const aboutLeadershipSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  leaders: z.array(leaderSchema).max(8),
});

// ---- About: Certifications ----
export const certSchema = z.object({
  name: z.string().max(200),
  issuer: z.string().max(200),
  logo: imageUrl,
});
export const aboutCertsSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  paragraph: longText,
  certs: z.array(certSchema).max(12),
});

// ---- About: Partners ----
export const partnerSchema = z.object({
  name: z.string().max(200),
  logo: imageUrl,
});
export const aboutPartnersSchema = z.object({
  badge: shortText,
  heading: z.string().max(300),
  paragraph: longText,
  partners: z.array(partnerSchema).max(20),
});

// ---- About: CTA ----
export const aboutCtaSchema = z.object({
  heading: z.string().max(300),
  paragraph: longText,
  button1Label: shortText,
  button1Href: href,
  button2Label: shortText,
  button2Href: href,
});

/** Map key → schema. Nguồn chân lý duy nhất cho các key nội dung. */
export const contentSchemas = {
  home_hero: homeHeroSchema,
  home_about: homeAboutSchema,
  home_services_header: sectionHeaderSchema,
  home_why: homeWhySchema,
  home_cta: homeCtaSchema,
  about_hero: aboutHeroSchema,
  about_story: aboutStorySchema,
  about_vmv: aboutVmvSchema,
  about_timeline: aboutTimelineSchema,
  about_leadership: aboutLeadershipSchema,
  about_certs: aboutCertsSchema,
  about_partners: aboutPartnersSchema,
  about_cta: aboutCtaSchema,
} as const;

export type ContentKey = keyof typeof contentSchemas;
export type ContentValue<K extends ContentKey> = z.infer<(typeof contentSchemas)[K]>;

export const HOME_CONTENT_KEYS = [
  "home_hero",
  "home_about",
  "home_services_header",
  "home_why",
  "home_cta",
] as const satisfies readonly ContentKey[];

export const ABOUT_CONTENT_KEYS = [
  "about_hero",
  "about_story",
  "about_vmv",
  "about_timeline",
  "about_leadership",
  "about_certs",
  "about_partners",
  "about_cta",
] as const satisfies readonly ContentKey[];
