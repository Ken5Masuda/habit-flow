"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Sun, Moon, Home, ListTodo } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate, getToday } from "@/lib/date-utils";
import { HabitCalendar } from "@/components/calendar/habit-calendar";
import { DayDetail } from "@/components/calendar/day-detail";
import type { Habit, HabitLog } from "@/types/database";

function CalendarContent() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [calendarData, setCalendarData] = useState<
    { date: string; completed: number; total: number }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateLogs, setSelectedDateLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = getToday();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
      .matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  };

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 過去90日間のデータを取得
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startDateStr = formatDate(startDate);

      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_archived", false)
          .order("created_at", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", startDateStr)
          .lte("date", today),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (logsRes.error) throw logsRes.error;

      const fetchedHabits = habitsRes.data || [];
      const fetchedLogs = logsRes.data || [];

      setHabits(fetchedHabits);
      setLogs(fetchedLogs);

      // カレンダー用のデータを作成
      const dateMap = new Map<
        string,
        { date: string; completed: number; total: number }
      >();

      // 過去90日間の各日付のデータを計算
      for (let i = 0; i <= 90; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);

        const dayLogs = fetchedLogs.filter((log) => log.date === dateStr);
        const completed = fetchedHabits.filter((habit) => {
          const log = dayLogs.find((l) => l.habit_id === habit.id);
          if (!log) return false;
          if (habit.goal_type === "boolean") return log.completed;
          return (log.value || 0) >= habit.goal_value;
        }).length;

        dateMap.set(dateStr, {
          date: dateStr,
          completed,
          total: fetchedHabits.length,
        });
      }

      setCalendarData(Array.from(dateMap.values()));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 日付選択時
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const dateLogs = logs.filter((log) => log.date === date);
    setSelectedDateLogs(dateLogs);
  };

  // 習慣の完了状態を切り替え
  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    if (!user || !selectedDate) return;

    try {
      const existingLog = selectedDateLogs.find(
        (log) => log.habit_id === habitId
      );

      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed })
          .eq("id", existingLog.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_logs").insert({
          habit_id: habitId,
          user_id: user.id,
          date: selectedDate,
          completed,
        });

        if (error) throw error;
      }

      await fetchData();
      // 選択中の日付のログを更新
      const updatedLogs = logs.filter((log) => log.date === selectedDate);
      setSelectedDateLogs(updatedLogs);
    } catch (error) {
      console.error("Error updating log:", error);
      toast.error("更新に失敗しました");
    }
  };

  // 数値を更新
  const handleUpdateValue = async (habitId: string, value: number) => {
    if (!user || !selectedDate) return;

    try {
      const habit = habits.find((h) => h.id === habitId);
      const completed = value >= (habit?.goal_value || 1);
      const existingLog = selectedDateLogs.find(
        (log) => log.habit_id === habitId
      );

      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ value, completed })
          .eq("id", existingLog.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_logs").insert({
          habit_id: habitId,
          user_id: user.id,
          date: selectedDate,
          value,
          completed,
        });

        if (error) throw error;
      }

      await fetchData();
    } catch (error) {
      console.error("Error updating value:", error);
      toast.error("更新に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                      <Home className="size-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ダッシュボード</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/habits">
                    <Button variant="ghost" size="icon">
                      <ListTodo className="size-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>習慣管理</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDarkMode ? "ライトモード" : "ダークモード"}に切替</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ログアウト</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">カレンダー</h2>
          <p className="text-muted-foreground">
            日付をクリックして詳細を確認できます
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <HabitCalendar
              data={calendarData}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          </div>
        )}

        <DayDetail
          date={selectedDate}
          habits={habits}
          logs={selectedDateLogs}
          onClose={() => setSelectedDate(null)}
          onToggleComplete={handleToggleComplete}
          onUpdateValue={handleUpdateValue}
          isToday={selectedDate === today}
        />
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AuthGuard>
      <CalendarContent />
    </AuthGuard>
  );
}
