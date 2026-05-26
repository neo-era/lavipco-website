import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Container responsive cho mọi section.
 * Max-width 1280px (Tailwind container), padding mobile-first.
 */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
