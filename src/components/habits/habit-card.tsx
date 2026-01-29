"use client";

import { MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Habit, Category } from "@/types/database";

interface HabitCardProps {
  habit: Habit;
  category?: Category | null;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export function HabitCard({ habit, category, onEdit, onArchive, onDelete }: HabitCardProps) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-card-foreground">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {habit.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(habit)}>
              <Pencil className="mr-2 size-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive(habit)}>
              <Archive className="mr-2 size-4" />
              {habit.is_archived ? "アーカイブ解除" : "アーカイブ"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(habit)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Badge
              variant="secondary"
              className="gap-1"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
                borderColor: category.color
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Badge>
          )}
          <Badge variant="outline">
            {habit.frequency === "daily" ? "毎日" : "毎週"}
          </Badge>
          {habit.goal_type === "count" && (
            <Badge variant="outline">
              {habit.goal_value} {habit.unit || "回"}
            </Badge>
          )}
          {habit.is_archived && (
            <Badge variant="secondary">アーカイブ済み</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
