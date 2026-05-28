/**
 * Thông tin liên hệ/site cho các component public (Footer, ContactInfo...).
 * Đọc từ bảng Setting (admin sửa ở /admin/settings → Liên hệ), fallback về
 * SITE_CONFIG tĩnh nếu admin chưa điền. Nhờ vậy đổi hotline/email/địa chỉ
 * không cần sửa code + deploy lại.
 */
import { loadSettings } from "@/lib/actions/admin-settings";
import { SITE_CONFIG } from "@/lib/constants";

export type SiteContact = {
  hotline: string;
  email: string;
  address: string;
  taxCode: string;
  workingHours: string;
  social: { facebook: string; zalo: string; youtube: string };
};

export async function getSiteContact(): Promise<SiteContact> {
  const s = await loadSettings();
  return {
    hotline: s.contact_hotline || SITE_CONFIG.hotline,
    email: s.contact_email || SITE_CONFIG.email,
    address: s.contact_address || SITE_CONFIG.address,
    taxCode: s.contact_taxCode || SITE_CONFIG.taxCode,
    workingHours: s.contact_workingHours || SITE_CONFIG.workingHours,
    social: {
      facebook: s.social_facebook || SITE_CONFIG.social.facebook,
      zalo: s.social_zalo || SITE_CONFIG.social.zalo,
      youtube: s.social_youtube || SITE_CONFIG.social.youtube,
    },
  };
}
