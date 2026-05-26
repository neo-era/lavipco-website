/**
 * Map tên icon (string trong DB) sang component lucide-react.
 *
 * Service.icon ở Prisma là `String?` để admin có thể chọn icon từ một
 * danh sách hữu hạn (đỡ phải lưu cả file SVG vào DB). File này tập trung
 * mapping để type-safe và tránh dynamic import lucide.
 */
import {
  TrafficCone,
  Lightbulb,
  Sparkles,
  Zap,
  Building2,
  Cctv,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Settings,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrafficCone,
  Lightbulb,
  Sparkles,
  Zap,
  Building2,
  Cctv,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Settings,
};

/**
 * Trả về component icon theo tên. Fallback `Sparkles` nếu tên không có trong map.
 */
export function getServiceIcon(name?: string | null): LucideIcon {
  if (!name) return Sparkles;
  return ICON_MAP[name] ?? Sparkles;
}

export type ServiceIconName = keyof typeof ICON_MAP;
