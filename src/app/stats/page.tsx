"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Sun, Moon, Home, ListTodo, Calendar, TrendingUp, Target, Flame, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getToday, calculateStreak, getPastDays } from "@/lib/date-utils";
import type { Habit } from "@/types/database";

interface HabitStats {
  habit: Habit;
  totalDays: number;
  completedDays: number;
  achievementRate: number;
  currentStreak: number;
  longestStreak: number;
}

function StatsContent() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalHabits: 0,
    totalCompletions: 0,
    overallRate: 0,
    bestHabit: "",
  });
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
      // 過去30日間のデータを取得
      const past30Days = getPastDays(30);
      const startDate = past30Days[0];

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

      // 各習慣の統計を計算
      const stats: HabitStats[] = fetchedHabits.map((habit) => {
        const habitLogs = fetchedLogs.filter((log) => log.habit_id === habit.id);

        // 完了した日を集める
        const completedDates = habitLogs
          .filter((log) => {
            if (habit.goal_type === "boolean") return log.completed;
            return (log.value || 0) >= habit.goal_value;
          })
          .map((log) => log.date);

        const completedDays = completedDates.length;
        const totalDays = 30;
        const achievementRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

        // ストリーク計算
        const currentStreak = calculateStreak(completedDates, today);

        // 最長ストリークを計算
        let longestStreak = 0;
        if (completedDates.length > 0) {
          const sortedDates = [...completedDates].sort();
          let tempStreak = 1;

          for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = Math.floor(
              (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        }

        return {
          habit,
          totalDays,
          completedDays,
          achievementRate,
          currentStreak,
          longestStreak,
        };
      });

      setHabitStats(stats);

      // 全体統計
      const totalCompletions = stats.reduce((sum, s) => sum + s.completedDays, 0);
      const overallRate =
        stats.length > 0
          ? stats.reduce((sum, s) => sum + s.achievementRate, 0) / stats.length
          : 0;
      const bestHabitStat = stats.reduce(
        (best, s) => (s.achievementRate > (best?.achievementRate || 0) ? s : best),
        stats[0]
      );

      setOverallStats({
        totalHabits: fetchedHabits.length,
        totalCompletions,
        overallRate,
        bestHabit: bestHabitStat?.habit.name || "-",
      });
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

  const getRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-500";
    if (rate >= 60) return "text-yellow-500";
    if (rate >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getRateBgColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-yellow-500";
    if (rate >= 40) return "bg-orange-500";
    return "bg-red-500";
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
                  <Link href="/calendar">
                    <Button variant="ghost" size="icon">
                      <Calendar className="size-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>カレンダー</p>
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
          <h2 className="text-2xl font-bold text-foreground">統計</h2>
          <p className="text-muted-foreground">過去30日間の習慣達成状況</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Target className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">習慣数</p>
                      <p className="text-2xl font-bold">{overallStats.totalHabits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">総完了数</p>
                      <p className="text-2xl font-bold">{overallStats.totalCompletions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
                      <TrendingUp className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">平均達成率</p>
                      <p className={`text-2xl font-bold ${getRateColor(overallStats.overallRate)}`}>
                        {overallStats.overallRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-orange-500/10">
                      <Flame className="size-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ベスト習慣</p>
                      <p className="text-lg font-bold truncate">{overallStats.bestHabit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Habit-specific Stats */}
            <Card>
              <CardHeader>
                <CardTitle>習慣別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {habitStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    習慣がありません。
                    <Link href="/habits" className="text-primary hover:underline ml-1">
                      習慣を追加
                    </Link>
                    してください。
                  </p>
                ) : (
                  <div className="space-y-4">
                    {habitStats.map((stat) => (
                      <div
                        key={stat.habit.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{stat.habit.name}</h3>
                            {stat.habit.description && (
                              <p className="text-sm text-muted-foreground">
                                {stat.habit.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-2xl font-bold ${getRateColor(stat.achievementRate)}`}
                          >
                            {stat.achievementRate.toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 rounded-full bg-muted mb-3">
                          <div
                            className={`h-full rounded-full transition-all ${getRateBgColor(stat.achievementRate)}`}
                            style={{ width: `${stat.achievementRate}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground">完了日数</p>
                            <p className="font-medium">
                              {stat.completedDays} / {stat.totalDays}日
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">現在のストリーク</p>
                            <p className="font-medium">{stat.currentStreak}日</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">最長ストリーク</p>
                            <p className="font-medium">{stat.longestStreak}日</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StatsPage() {
  return (
    <AuthGuard>
      <StatsContent />
    </AuthGuard>
  );
}
