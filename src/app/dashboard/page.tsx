"use client";

import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // 初期テーマを設定
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          <div className="flex items-center gap-2">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>今日の習慣</CardTitle>
              <CardDescription>本日のタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0 / 0</p>
              <p className="text-sm text-muted-foreground">習慣を追加しましょう</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>現在のストリーク</CardTitle>
              <CardDescription>連続達成日数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0日</p>
              <p className="text-sm text-muted-foreground">習慣を始めましょう</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>週間達成率</CardTitle>
              <CardDescription>過去7日間</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">データがありません</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Phase 1 完了</CardTitle>
              <CardDescription>認証システムが動作しています</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ログイン/サインアップ機能が正常に動作しています。
                Phase 2では習慣のCRUD機能を実装します。
              </p>
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
