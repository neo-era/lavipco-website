import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo LAVIPCO - reusable.
 * Render `public/images/lavipco-logo.png` (icon + text "LAVIPCO" lồng vào nhau).
 *
 * Vì PNG đã chứa cả icon và text, KHÔNG cần render thêm chữ "LAVIPCO" bên cạnh.
 * Subtitle/tagline có thể đặt cạnh nếu cần (ví dụ "Kỹ Nghệ Lâm Việt Phát" ở Header).
 */
const SIZE_CLASS: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  xl: "h-20",
};

export function BrandLogo({
  size = "md",
  className,
  alt = "LAVIPCO",
  priority = false,
}: {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/lavipco-logo.png"
      alt={alt}
      // Native dimensions của file PNG - giữ tỉ lệ thật khi Tailwind set height
      width={1957}
      height={2069}
      priority={priority}
      className={cn(SIZE_CLASS[size], "w-auto select-none", className)}
    />
  );
}
