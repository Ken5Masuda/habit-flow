"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  Sun,
  Moon,
  LogOut,
  ListTodo,
  Calendar,
  BarChart3,
  CheckCircle2,
  Plus,
  Minus,
  Target,
  Flame,
  HelpCircle,
  BookOpen,
} from "lucide-react";

function HelpContent() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useIsomorphicLayoutEffect(() => {
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

  const resetTutorial = () => {
    localStorage.removeItem("habitflow_welcome_shown");
    router.push("/dashboard");
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
      <main className="mx-auto max-w-3xl p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-6" />
            使い方ガイド
          </h2>
          <p className="text-muted-foreground">
            HabitFlowの機能と使い方を説明します
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                クイックスタート
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">習慣を登録する</h4>
                  <p className="text-sm text-muted-foreground">
                    ヘッダーの <ListTodo className="inline size-4" /> アイコンから習慣管理ページへ。「新しい習慣」ボタンで習慣を追加します。
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">毎日記録する</h4>
                  <p className="text-sm text-muted-foreground">
                    ダッシュボードで今日の習慣を確認し、完了したらチェック。毎日の積み重ねが大切です。
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">進捗を確認する</h4>
                  <p className="text-sm text-muted-foreground">
                    カレンダーや統計ページで達成状況を確認。継続のモチベーションに！
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                機能説明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="habits">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <ListTodo className="size-4" />
                      習慣管理
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>チェック式:</strong> 完了/未完了で記録（例：瞑想、日記を書く）</p>
                    <p><strong>カウント式:</strong> 数値で記録（例：水を2L飲む、腕立て30回）</p>
                    <p><strong>カテゴリ:</strong> 習慣を分類して管理できます</p>
                    <p><strong>アーカイブ:</strong> 一時的に非表示にしたい習慣はアーカイブ可能</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dashboard">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Home className="size-4" />
                      ダッシュボード
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>今日の習慣:</strong> その日にやるべき習慣の一覧</p>
                    <p><strong>チェック式:</strong> 丸をタップで完了/未完了を切り替え</p>
                    <p><strong>カウント式:</strong> <Plus className="inline size-3" /> <Minus className="inline size-3" /> ボタンで数値を増減</p>
                    <p><strong>週間グラフ:</strong> 過去7日間の達成数を可視化</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="streak">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Flame className="size-4" />
                      ストリーク
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>ストリークとは:</strong> すべての習慣を達成した連続日数</p>
                    <p><strong>現在のストリーク:</strong> 今続いている連続達成日数</p>
                    <p><strong>最長ストリーク:</strong> 過去最高の連続達成記録</p>
                    <p className="text-primary">毎日すべての習慣を完了してストリークを伸ばしましょう！</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="calendar">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      カレンダー
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>ヒートマップ:</strong> 達成率に応じて色が変化（緑が高達成）</p>
                    <p><strong>日付タップ:</strong> その日の詳細を確認</p>
                    <p><strong>今日のみ編集可:</strong> 過去の記録は閲覧のみです</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stats">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <BarChart3 className="size-4" />
                      統計
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>達成率:</strong> 過去30日間の習慣ごとの達成率</p>
                    <p><strong>完了日数:</strong> 何日達成したかの記録</p>
                    <p><strong>習慣別ストリーク:</strong> 各習慣の連続達成日数</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                継続のコツ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>最初は2〜3個の習慣から始めましょう</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>小さな目標から始めて、徐々にレベルアップ</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>毎日同じ時間に記録する習慣をつけましょう</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>ストリークが切れても大丈夫、また始めればOK！</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Reset Tutorial */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={resetTutorial}>
              チュートリアルをもう一度見る
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HelpPage() {
  return (
    <AuthGuard>
      <HelpContent />
    </AuthGuard>
  );
}
