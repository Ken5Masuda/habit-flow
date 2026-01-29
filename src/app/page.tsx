"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sun, Moon, CheckCircle2, Calendar, TrendingUp, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // テーマ初期化
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    // 認証状態チェック
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: CheckCircle2,
      title: "習慣トラッキング",
      description: "毎日の習慣を簡単に記録",
    },
    {
      icon: Calendar,
      title: "カレンダービュー",
      description: "月間の達成状況を一目で確認",
    },
    {
      icon: TrendingUp,
      title: "ストリーク",
      description: "連続達成日数でモチベーションUP",
    },
    {
      icon: Zap,
      title: "シンプル設計",
      description: "複雑な設定なしで今すぐ開始",
    },
  ];

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
            <Link href="/auth/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>始める</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
          習慣を可視化して
          <br />
          <span className="text-primary">継続力</span>を高めよう
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          HabitFlowは、毎日の習慣を記録し、ストリークやグラフで
          継続状況を可視化するパーソナル習慣トラッカーです。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              無料で始める
              <Zap className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h3 className="mb-12 text-center text-2xl font-bold text-foreground">
          機能紹介
        </h3>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="size-6 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold text-card-foreground">
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 HabitFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
