"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, ListTodo, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getToday, getPastDays, calculateStreak } from "@/lib/date-utils";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { StreakCard } from "@/components/dashboard/streak-card";
import type { Habit, HabitLog } from "@/types/database";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ date: string; completed: number; total: number }[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const today = getToday();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
      const past7Days = getPastDays(7);
      const startDate = past7Days[0];

      // 習慣と過去7日間のログを取得
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
          .gte("date", startDate)
          .lte("date", today),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (logsRes.error) throw logsRes.error;

      const fetchedHabits = habitsRes.data || [];
      const fetchedLogs = logsRes.data || [];

      setHabits(fetchedHabits);

      // 今日のログをフィルタ
      const todaysLogs = fetchedLogs.filter((log) => log.date === today);
      setTodayLogs(todaysLogs);

      // 週間データを計算
      const weekData = past7Days.map((date) => {
        const dayLogs = fetchedLogs.filter((log) => log.date === date);
        const completed = fetchedHabits.filter((habit) => {
          const log = dayLogs.find((l) => l.habit_id === habit.id);
          if (!log) return false;
          if (habit.goal_type === "boolean") return log.completed;
          return (log.value || 0) >= habit.goal_value;
        }).length;

        return {
          date,
          completed,
          total: fetchedHabits.length,
        };
      });
      setWeeklyData(weekData);

      // ストリーク計算
      // すべての習慣が完了した日を集める
      const allCompletedDates: string[] = [];
      past7Days.forEach((date) => {
        const dayLogs = fetchedLogs.filter((log) => log.date === date);
        const allCompleted = fetchedHabits.every((habit) => {
          const log = dayLogs.find((l) => l.habit_id === habit.id);
          if (!log) return false;
          if (habit.goal_type === "boolean") return log.completed;
          return (log.value || 0) >= habit.goal_value;
        });
        if (allCompleted && fetchedHabits.length > 0) {
          allCompletedDates.push(date);
        }
      });

      const streak = calculateStreak(allCompletedDates, today);
      setCurrentStreak(streak);
      setLongestStreak(Math.max(streak, longestStreak));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [user, today, longestStreak]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 習慣の完了状態を切り替え
  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    if (!user) return;

    try {
      const existingLog = todayLogs.find((log) => log.habit_id === habitId);

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
          date: today,
          completed,
        });

        if (error) throw error;
      }

      await fetchData();
    } catch (error) {
      console.error("Error updating log:", error);
      toast.error("更新に失敗しました");
    }
  };

  // 数値を更新
  const handleUpdateValue = async (habitId: string, value: number) => {
    if (!user) return;

    try {
      const habit = habits.find((h) => h.id === habitId);
      const completed = value >= (habit?.goal_value || 1);
      const existingLog = todayLogs.find((log) => log.habit_id === habitId);

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
          date: today,
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

  const todayCompleted = habits.filter((habit) => {
    const log = todayLogs.find((l) => l.habit_id === habit.id);
    if (!log) return false;
    if (habit.goal_type === "boolean") return log.completed;
    return (log.value || 0) >= habit.goal_value;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          <div className="flex items-center gap-2">
            <Link href="/habits">
              <Button variant="ghost" size="icon" title="習慣管理">
                <ListTodo className="size-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">こんにちは！</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Link href="/habits">
            <Button className="gap-2">
              <Plus className="size-4" />
              習慣を追加
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <StreakCard
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              todayCompleted={todayCompleted}
              todayTotal={habits.length}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Today's Habits */}
              <TodayHabits
                habits={habits}
                logs={todayLogs}
                onToggleComplete={handleToggleComplete}
                onUpdateValue={handleUpdateValue}
              />

              {/* Weekly Chart */}
              <WeeklyChart data={weeklyData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
