/**
 * Dữ liệu phụ cho từng dịch vụ (slug → process steps, benefits, related project category).
 *
 * Hiện hardcode ở file này vì Service model chưa có các trường tương ứng.
 * Khi cần admin tự sửa nội dung, migrate sang các cột Json trong Prisma:
 *   processSteps Json?  benefits Json?  relatedProjectCategory ProjectCategory?
 */
import {
  ClipboardList,
  PencilRuler,
  Truck,
  Wrench,
  Headphones,
  ShieldCheck,
  Zap,
  Building2,
  Cctv,
  type LucideIcon,
} from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

export type ProcessStep = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export type Benefit = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export type ServiceExtras = {
  /** Map sang ProjectCategory để query dự án liên quan. */
  relatedCategory: ProjectCategory | null;
  /** Quy trình thực hiện - 5 bước. */
  processSteps: ProcessStep[];
  /** Lợi ích / điểm mạnh - 4 mục. */
  benefits: Benefit[];
};

// Quy trình chung 5 bước - áp dụng cho mọi dịch vụ
const DEFAULT_PROCESS: ProcessStep[] = [
  {
    title: "Khảo sát hiện trạng",
    description: "Đến tận nơi đo đạc, đánh giá nhu cầu kỹ thuật và đề xuất giải pháp phù hợp.",
    Icon: ClipboardList,
  },
  {
    title: "Thiết kế kỹ thuật",
    description: "Lập bản vẽ chi tiết, tính toán tải, mô phỏng chiếu sáng và lựa chọn thiết bị.",
    Icon: PencilRuler,
  },
  {
    title: "Cung cấp thiết bị",
    description: "Đặt hàng từ nhà sản xuất uy tín, kiểm tra QC trước khi vận chuyển tới công trình.",
    Icon: Truck,
  },
  {
    title: "Thi công lắp đặt",
    description: "Đội kỹ thuật triển khai, đảm bảo an toàn và đúng tiến độ cam kết.",
    Icon: Wrench,
  },
  {
    title: "Vận hành & bảo trì",
    description: "Bàn giao, hướng dẫn vận hành và bảo trì định kỳ trong thời hạn bảo hành.",
    Icon: Headphones,
  },
];

const DEFAULT_BENEFITS: Benefit[] = [
  {
    title: "Tuân thủ tiêu chuẩn",
    description: "Đáp ứng QCVN, TCVN và tiêu chuẩn ITS hiện hành.",
    Icon: ShieldCheck,
  },
  {
    title: "Tiết kiệm điện năng",
    description: "Sử dụng LED hiệu suất cao, điều khiển thông minh giảm 30-50% điện năng.",
    Icon: Zap,
  },
  {
    title: "Sẵn sàng Smart City",
    description: "Kiến trúc mở, tích hợp camera, IoT và nền tảng điều hành đô thị.",
    Icon: Building2,
  },
  {
    title: "Bảo hành dài hạn",
    description: "Bảo hành 24-60 tháng tùy thiết bị, hỗ trợ kỹ thuật 24/7.",
    Icon: Headphones,
  },
];

// Override per service - chỉ những điểm khác biệt
const SERVICE_EXTRAS: Record<string, Partial<ServiceExtras>> = {
  "den-tin-hieu-giao-thong": {
    relatedCategory: "TRAFFIC_LIGHT",
    benefits: [
      DEFAULT_BENEFITS[0],
      {
        title: "Đếm lùi đồng bộ thời gian thực",
        description: "Đèn tín hiệu liên động giữa các nút giao, ưu tiên xe ưu tiên/cứu thương.",
        Icon: Cctv,
      },
      DEFAULT_BENEFITS[2],
      DEFAULT_BENEFITS[3],
    ],
  },
  "chieu-sang-do-thi-thong-minh": {
    relatedCategory: "URBAN_LIGHTING",
  },
  "chieu-sang-canh-quan": {
    relatedCategory: "LANDSCAPE_LIGHTING",
    benefits: [
      DEFAULT_BENEFITS[0],
      DEFAULT_BENEFITS[1],
      {
        title: "Tùy biến màu sắc DMX",
        description: "Đèn RGB điều khiển DMX-512, đổi màu theo sự kiện hoặc kịch bản lễ hội.",
        Icon: Building2,
      },
      DEFAULT_BENEFITS[3],
    ],
  },
  "ha-tang-dien": {
    relatedCategory: "POWER_INFRASTRUCTURE",
  },
};

/** Lấy extras (process + benefits + relatedCategory) cho 1 service slug. */
export function getServiceExtras(slug: string): ServiceExtras {
  const override = SERVICE_EXTRAS[slug] ?? {};
  return {
    relatedCategory: override.relatedCategory ?? null,
    processSteps: override.processSteps ?? DEFAULT_PROCESS,
    benefits: override.benefits ?? DEFAULT_BENEFITS,
  };
}
