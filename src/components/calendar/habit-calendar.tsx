"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";

interface DayData {
  date: string;
  completed: number;
  total: number;
}

interface HabitCalendarProps {
  data: DayData[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

export function HabitCalendar({ data, onSelectDate, selectedDate }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の日数を取得
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 月の最初の日の曜日を取得
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // データマップを作成
  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  // 達成率に基づいて色を取得
  const getColorClass = (dayData: DayData | undefined) => {
    if (!dayData || dayData.total === 0) return "bg-muted";

    const rate = dayData.completed / dayData.total;

    if (rate === 0) return "bg-muted";
    if (rate < 0.25) return "bg-red-500/30";
    if (rate < 0.5) return "bg-orange-500/40";
    if (rate < 0.75) return "bg-yellow-500/50";
    if (rate < 1) return "bg-green-500/60";
    return "bg-green-500";
  };

  const today = formatDate(new Date());

  // カレンダーの日付を生成
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // 前月の空白を追加
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // 当月の日付を追加
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [firstDayOfMonth, daysInMonth]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {year}年 {monthNames[month]}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-medium py-1",
                index === 0 && "text-red-500",
                index === 6 && "text-blue-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = formatDate(new Date(year, month, day));
            const dayData = dataMap.get(dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isFuture = new Date(dateStr) > new Date(today);
            const dayOfWeek = new Date(year, month, day).getDay();

            return (
              <button
                key={dateStr}
                onClick={() => !isFuture && onSelectDate(dateStr)}
                disabled={isFuture}
                className={cn(
                  "aspect-square rounded-md flex flex-col items-center justify-center text-sm transition-all",
                  getColorClass(dayData),
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  isSelected && "ring-2 ring-foreground",
                  isFuture && "opacity-30 cursor-not-allowed",
                  !isFuture && "hover:ring-2 hover:ring-primary/50 cursor-pointer",
                  dayOfWeek === 0 && "text-red-500",
                  dayOfWeek === 6 && "text-blue-500"
                )}
              >
                <span className="font-medium">{day}</span>
                {dayData && dayData.total > 0 && (
                  <span className="text-[10px] opacity-70">
                    {dayData.completed}/{dayData.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>達成率:</span>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-muted" />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-orange-500/40" />
            <span>~50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-yellow-500/50" />
            <span>~75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-green-500" />
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
