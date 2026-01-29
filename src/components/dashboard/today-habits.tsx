"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Habit, HabitLog } from "@/types/database";

interface TodayHabitsProps {
  habits: Habit[];
  logs: HabitLog[];
  onToggleComplete: (habitId: string, completed: boolean) => Promise<void>;
  onUpdateValue: (habitId: string, value: number) => Promise<void>;
}

export function TodayHabits({
  habits,
  logs,
  onToggleComplete,
  onUpdateValue,
}: TodayHabitsProps) {
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  const getLogForHabit = (habitId: string) => {
    return logs.find((log) => log.habit_id === habitId);
  };

  const completedCount = habits.filter((habit) => {
    const log = getLogForHabit(habit.id);
    if (!log) return false;
    if (habit.goal_type === "boolean") return log.completed;
    return (log.value || 0) >= habit.goal_value;
  }).length;

  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  const handleToggle = async (habit: Habit) => {
    setLoadingHabitId(habit.id);
    try {
      const log = getLogForHabit(habit.id);
      await onToggleComplete(habit.id, !log?.completed);
    } finally {
      setLoadingHabitId(null);
    }
  };

  const handleValueChange = async (habit: Habit, delta: number) => {
    setLoadingHabitId(habit.id);
    try {
      const log = getLogForHabit(habit.id);
      const currentValue = log?.value || 0;
      const newValue = Math.max(0, currentValue + delta);
      await onUpdateValue(habit.id, newValue);
    } finally {
      setLoadingHabitId(null);
    }
  };

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>今日の習慣</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            習慣がまだありません。習慣を追加しましょう！
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>今日の習慣</span>
          <span className="text-lg font-normal text-muted-foreground">
            {completedCount} / {habits.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.map((habit) => {
          const log = getLogForHabit(habit.id);
          const isCompleted =
            habit.goal_type === "boolean"
              ? log?.completed
              : (log?.value || 0) >= habit.goal_value;
          const isLoading = loadingHabitId === habit.id;

          return (
            <div
              key={habit.id}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 transition-all",
                isCompleted
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                {habit.goal_type === "boolean" ? (
                  <button
                    onClick={() => handleToggle(habit)}
                    disabled={isLoading}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary"
                    )}
                  >
                    {isCompleted && <Check className="size-4" />}
                  </button>
                ) : (
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isCompleted && <Check className="size-4" />}
                  </div>
                )}
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      isCompleted && "text-muted-foreground line-through"
                    )}
                  >
                    {habit.name}
                  </p>
                  {habit.goal_type === "count" && (
                    <p className="text-sm text-muted-foreground">
                      目標: {habit.goal_value} {habit.unit || "回"}
                    </p>
                  )}
                </div>
              </div>

              {habit.goal_type === "count" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handleValueChange(habit, -1)}
                    disabled={isLoading || (log?.value || 0) <= 0}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-16 text-center font-mono text-lg">
                    {log?.value || 0} / {habit.goal_value}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handleValueChange(habit, 1)}
                    disabled={isLoading}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
