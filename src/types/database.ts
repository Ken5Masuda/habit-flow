// Database Types for HabitFlow

export type GoalType = "boolean" | "count";
export type Frequency = "daily" | "weekly";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  goal_type: GoalType;
  goal_value: number;
  unit: string | null;
  frequency: Frequency;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitWithCategory extends Habit {
  category: Category | null;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  value: number | null;
  note: string | null;
  created_at: string;
}

// Form types
export interface HabitFormData {
  name: string;
  description?: string;
  category_id?: string;
  goal_type: GoalType;
  goal_value: number;
  unit?: string;
  frequency: Frequency;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
}

// Preset category icons
export const CATEGORY_ICONS = [
  { value: "heart", label: "ハート" },
  { value: "book", label: "本" },
  { value: "briefcase", label: "仕事" },
  { value: "palette", label: "趣味" },
  { value: "dumbbell", label: "運動" },
  { value: "utensils", label: "食事" },
  { value: "bed", label: "睡眠" },
  { value: "music", label: "音楽" },
  { value: "code", label: "コード" },
  { value: "pencil", label: "筆記" },
] as const;

// Preset colors
export const CATEGORY_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
] as const;
