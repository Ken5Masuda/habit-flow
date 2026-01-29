"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDayOfWeek, parseDate } from "@/lib/date-utils";
import type { Habit, HabitLog } from "@/types/database";

interface DayDetailProps {
  date: string | null;
  habits: Habit[];
  logs: HabitLog[];
  onClose: () => void;
  onToggleComplete: (habitId: string, completed: boolean) => Promise<void>;
  onUpdateValue: (habitId: string, value: number) => Promise<void>;
  isToday: boolean;
}

export function DayDetail({
  date,
  habits,
  logs,
  onClose,
  onToggleComplete,
  onUpdateValue,
  isToday,
}: DayDetailProps) {
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  if (!date) return null;

  const parsedDate = parseDate(date);
  const dayOfWeek = getDayOfWeek(date);
  const dateDisplay = `${parsedDate.getFullYear()}年${parsedDate.getMonth() + 1}月${parsedDate.getDate()}日（${dayOfWeek}）`;

  const getLogForHabit = (habitId: string) => {
    return logs.find((log) => log.habit_id === habitId);
  };

  const completedCount = habits.filter((habit) => {
    const log = getLogForHabit(habit.id);
    if (!log) return false;
    if (habit.goal_type === "boolean") return log.completed;
    return (log.value || 0) >= habit.goal_value;
  }).length;

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

  return (
    <Dialog open={!!date} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{dateDisplay}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {completedCount} / {habits.length} 完了
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              この日に習慣はありません
            </p>
          ) : (
            habits.map((habit) => {
              const log = getLogForHabit(habit.id);
              const isCompleted =
                habit.goal_type === "boolean"
                  ? log?.completed
                  : (log?.value || 0) >= habit.goal_value;
              const isLoading = loadingHabitId === habit.id;
              const canEdit = isToday;

              return (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    isCompleted
                      ? "border-primary/50 bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {habit.goal_type === "boolean" ? (
                      <button
                        onClick={() => canEdit && handleToggle(habit)}
                        disabled={isLoading || !canEdit}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2 transition-all",
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30",
                          canEdit && !isCompleted && "hover:border-primary",
                          !canEdit && "cursor-default"
                        )}
                      >
                        {isCompleted && <Check className="size-4" />}
                      </button>
                    ) : (
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2",
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
                          "font-medium text-sm",
                          isCompleted && "text-muted-foreground line-through"
                        )}
                      >
                        {habit.name}
                      </p>
                      {habit.goal_type === "count" && (
                        <p className="text-xs text-muted-foreground">
                          目標: {habit.goal_value} {habit.unit || "回"}
                        </p>
                      )}
                    </div>
                  </div>

                  {habit.goal_type === "count" && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleValueChange(habit, -1)}
                          disabled={isLoading || (log?.value || 0) <= 0}
                        >
                          <Minus className="size-3" />
                        </Button>
                      )}
                      <span className="w-14 text-center font-mono text-sm">
                        {log?.value || 0}/{habit.goal_value}
                      </span>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleValueChange(habit, 1)}
                          disabled={isLoading}
                        >
                          <Plus className="size-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {habit.goal_type === "boolean" && !canEdit && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isCompleted ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {isCompleted ? "完了" : "未完了"}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {!isToday && (
          <p className="text-center text-xs text-muted-foreground">
            過去の記録は今日の日付からのみ編集できます
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
