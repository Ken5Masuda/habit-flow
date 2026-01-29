"use client";

import { useState, useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, TrendingUp, ListTodo, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const WELCOME_SHOWN_KEY = "habitflow_welcome_shown";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <Sparkles className="size-8 text-primary" />,
    title: "HabitFlowへようこそ！",
    description: "毎日の習慣を記録し、継続状況を可視化するアプリです。簡単な使い方をご紹介します。",
  },
  {
    icon: <ListTodo className="size-8 text-primary" />,
    title: "1. 習慣を登録する",
    description: "まず「習慣管理」ページで、追跡したい習慣を登録しましょう。例：読書、運動、水を飲む など。チェック式と数値カウント式の2種類から選べます。",
  },
  {
    icon: <CheckCircle2 className="size-8 text-primary" />,
    title: "2. 毎日記録する",
    description: "ダッシュボードで今日の習慣をチェック。完了したらタップするだけ！数値タイプの習慣は +/- ボタンで記録できます。",
  },
  {
    icon: <Calendar className="size-8 text-primary" />,
    title: "3. カレンダーで振り返る",
    description: "カレンダーページで過去の達成状況を確認。色の濃さで達成度がわかります。日付をタップすると詳細が見られます。",
  },
  {
    icon: <TrendingUp className="size-8 text-primary" />,
    title: "4. 統計でモチベーションUP",
    description: "統計ページで習慣ごとの達成率やストリーク（連続達成日数）を確認。継続の成果を実感しましょう！",
  },
];

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const hasShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasShown) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              {step.icon}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`size-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-2">
          {isFirstStep ? (
            <Button variant="ghost" onClick={handleSkip}>
              スキップ
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrev} className="gap-1">
              <ChevronLeft className="size-4" />
              戻る
            </Button>
          )}
          <Button onClick={handleNext} className="gap-1">
            {isLastStep ? (
              "始める"
            ) : (
              <>
                次へ
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
