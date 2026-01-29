"use client";

import { Flame, Trophy, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: number;
  todayTotal: number;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  todayCompleted,
  todayTotal,
}: StreakCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Today's Progress */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Target className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">今日の達成</p>
            <p className="text-2xl font-bold">
              {todayCompleted}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}/ {todayTotal}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/10">
            <Flame className="size-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">現在のストリーク</p>
            <p className="text-2xl font-bold">
              {currentStreak}
              <span className="text-lg font-normal text-muted-foreground"> 日</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-yellow-500/10">
            <Trophy className="size-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">最長ストリーク</p>
            <p className="text-2xl font-bold">
              {longestStreak}
              <span className="text-lg font-normal text-muted-foreground"> 日</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
