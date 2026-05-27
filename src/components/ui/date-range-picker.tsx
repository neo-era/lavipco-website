"use client";

/**
 * Date range picker dùng Popover + Calendar (react-day-picker mode="range").
 *
 * Trả về value qua callback `onChange({ from, to })`.
 * Hiển thị label "Từ - Đến" theo định dạng dd/MM/yyyy.
 */
import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  className,
}: Props) {
  const display =
    value?.from && value?.to
      ? `${formatDate(value.from)} - ${formatDate(value.to)}`
      : value?.from
        ? `${formatDate(value.from)} - …`
        : placeholder;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 justify-start gap-2 font-normal",
              !value?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{display}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {value?.from && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => onChange(undefined)}
          aria-label="Xoá khoảng thời gian"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
