"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPastDays, getDayOfWeek, formatDateShort } from "@/lib/date-utils";

interface DailyData {
  date: string;
  completed: number;
  total: number;
}

interface WeeklyChartProps {
  data: DailyData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const past7Days = getPastDays(7);

  const chartData = past7Days.map((date) => {
    const dayData = data.find((d) => d.date === date);
    return {
      date,
      label: `${formatDateShort(date)}(${getDayOfWeek(date)})`,
      completed: dayData?.completed || 0,
      total: dayData?.total || 0,
      rate: dayData && dayData.total > 0
        ? Math.round((dayData.completed / dayData.total) * 100)
        : 0,
    };
  });

  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
  const totalHabits = chartData.reduce((sum, d) => sum + d.total, 0);
  const weeklyRate = totalHabits > 0
    ? Math.round((totalCompleted / totalHabits) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>週間進捗</span>
          <span className="text-2xl font-bold text-primary">{weeklyRate}%</span>
        </CardTitle>
        <CardDescription>過去7日間の達成率</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="font-medium">{data.label}</p>
                        <p className="text-sm text-muted-foreground">
                          達成: {data.completed} / {data.total}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {data.rate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rate >= 100 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
