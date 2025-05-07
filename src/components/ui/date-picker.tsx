"use client"

import * as React from "react"
import { format as formatDateFns } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { enUS, th } from 'date-fns/locale';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  buttonClassName?: string;
  placeholder?: string;
}

export function DatePicker({ date, setDate, buttonClassName, placeholder }: DatePickerProps) {
  const t = useTranslations('DatePicker');
  const currentLocale = useLocale();
  const datePickerLocale = currentLocale === 'th' ? th : enUS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDateFns(date, "PPP", { locale: datePickerLocale }) : <span>{placeholder || t('placeholder')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card text-card-foreground">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={datePickerLocale}
        />
      </PopoverContent>
    </Popover>
  )
}
