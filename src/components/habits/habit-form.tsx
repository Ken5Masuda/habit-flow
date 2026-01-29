"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category, Habit, HabitFormData, GoalType, Frequency } from "@/types/database";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HabitFormData) => Promise<void>;
  categories: Category[];
  habit?: Habit | null;
}

export function HabitForm({ isOpen, onClose, onSave, categories, habit }: HabitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<HabitFormData>({
    name: "",
    description: "",
    category_id: "",
    goal_type: "boolean",
    goal_value: 1,
    unit: "",
    frequency: "daily",
  });

  const isEditing = !!habit;

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || "",
        category_id: habit.category_id || "",
        goal_type: habit.goal_type,
        goal_value: habit.goal_value,
        unit: habit.unit || "",
        frequency: habit.frequency,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category_id: "",
        goal_type: "boolean",
        goal_value: 1,
        unit: "",
        frequency: "daily",
      });
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "習慣を編集" : "新しい習慣を作成"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "習慣の詳細を編集します" : "追跡したい習慣を追加しましょう"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">習慣名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 毎日読書する"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="習慣の詳細や目標を記入"
                rows={2}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>カテゴリ</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goal Type */}
            <div className="grid gap-2">
              <Label>目標タイプ</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value: GoalType) =>
                  setFormData({ ...formData, goal_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">完了/未完了</SelectItem>
                  <SelectItem value="count">数値目標</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal Value & Unit (for count type) */}
            {formData.goal_type === "count" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal_value">目標値</Label>
                  <Input
                    id="goal_value"
                    type="number"
                    min={1}
                    value={formData.goal_value}
                    onChange={(e) =>
                      setFormData({ ...formData, goal_value: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">単位</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="例: ページ、分"
                  />
                </div>
              </div>
            )}

            {/* Frequency */}
            <div className="grid gap-2">
              <Label>頻度</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: Frequency) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "保存中..." : isEditing ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
