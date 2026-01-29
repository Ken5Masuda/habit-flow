"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Sun, Moon, ListTodo, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Habit } from "@/types/database";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const activeHabits = habits.filter((h) => !h.is_archived);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          <div className="flex items-center gap-2">
            <Link href="/habits">
              <Button variant="ghost" size="icon">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">こんにちは！</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>今日の習慣</CardTitle>
              <CardDescription>本日のタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0 / {activeHabits.length}</p>
              <p className="text-sm text-muted-foreground">
                {activeHabits.length === 0 ? "習慣を追加しましょう" : "Phase 3で記録機能を実装"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>現在のストリーク</CardTitle>
              <CardDescription>連続達成日数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0日</p>
              <p className="text-sm text-muted-foreground">Phase 3で実装予定</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>週間達成率</CardTitle>
              <CardDescription>過去7日間</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">Phase 3で実装予定</p>
            </CardContent>
          </Card>
        </div>

        {/* Habits Section */}
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>習慣管理</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "読み込み中..."
                    : `${activeHabits.length}個の習慣を管理中`}
                </CardDescription>
              </div>
              <Link href="/habits">
                <Button className="gap-2">
                  <Plus className="size-4" />
                  習慣を管理
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : activeHabits.length === 0 ? (
                <div className="flex h-24 flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">まだ習慣がありません</p>
                  <Link href="/habits" className="mt-2">
                    <Button variant="outline" size="sm">
                      習慣を追加する
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeHabits.slice(0, 5).map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <span className="font-medium">{habit.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {habit.frequency === "daily" ? "毎日" : "毎週"}
                      </span>
                    </div>
                  ))}
                  {activeHabits.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      他 {activeHabits.length - 5} 件の習慣
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
