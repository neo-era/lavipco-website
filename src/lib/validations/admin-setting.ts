/**
 * Zod schema cho admin settings.
 *
 * Settings lưu key-value trong bảng Setting (DB). Field grouped theo tab UI
 * nhưng đều flatten ra cùng level để dễ persist (1 row Setting / key).
 *
 * Không dùng .default() ở schema để tránh input/output type diverge (zodResolver
 * yêu cầu match). Defaults được cung cấp ở SETTINGS_DEFAULTS bên dưới.
 */
import { z } from "zod";

export const settingsInputSchema = z.object({
  // General
  general_logo: z.string().max(500),
  general_favicon: z.string().max(500),
  general_siteName: z.string().max(120),
  general_tagline: z.string().max(255),

  // Contact
  contact_hotline: z.string().max(40),
  contact_email: z.string().max(255),
  contact_address: z.string().max(500),
  contact_taxCode: z.string().max(40),
  contact_workingHours: z.string().max(120),

  // Social
  social_facebook: z.string().max(500),
  social_zalo: z.string().max(500),
  social_youtube: z.string().max(500),

  // Payment
  payment_vnpayEnabled: z.boolean(),
  payment_codEnabled: z.boolean(),
  payment_bankAccount: z.string().max(500),

  // Shipping
  shipping_freeThreshold: z.number().nonnegative().nullable(),
  shipping_defaultFee: z.number().nonnegative().nullable(),
  shipping_ghnEnabled: z.boolean(),

  // Email
  email_fromName: z.string().max(120),
  email_fromAddress: z.string().max(255),
  email_replyTo: z.string().max(255),

  // SEO
  seo_defaultMetaTitle: z.string().max(160),
  seo_defaultMetaDescription: z.string().max(320),
  seo_googleAnalyticsId: z.string().max(40),
  seo_googleTagManagerId: z.string().max(40),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

/** Defaults dùng khi DB chưa có row cho key đó. */
export const SETTINGS_DEFAULTS: SettingsInput = {
  general_logo: "",
  general_favicon: "",
  general_siteName: "",
  general_tagline: "",
  contact_hotline: "",
  contact_email: "",
  contact_address: "",
  contact_taxCode: "",
  contact_workingHours: "",
  social_facebook: "",
  social_zalo: "",
  social_youtube: "",
  payment_vnpayEnabled: false,
  payment_codEnabled: true,
  payment_bankAccount: "",
  shipping_freeThreshold: null,
  shipping_defaultFee: null,
  shipping_ghnEnabled: false,
  email_fromName: "",
  email_fromAddress: "",
  email_replyTo: "",
  seo_defaultMetaTitle: "",
  seo_defaultMetaDescription: "",
  seo_googleAnalyticsId: "",
  seo_googleTagManagerId: "",
};

/** Danh sách key được phép. */
export const SETTING_KEYS = Object.keys(SETTINGS_DEFAULTS) as Array<
  keyof SettingsInput
>;
