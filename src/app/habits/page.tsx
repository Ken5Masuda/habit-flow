"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, Sun, Moon, LogOut, LayoutDashboard, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AuthGuard, useAuth } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import type { Habit, Category, HabitFormData } from "@/types/database";

function HabitsContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // テーマ初期化
  useEffect(() => {
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

  // データ取得
  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [habitsRes, categoriesRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true }),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setHabits(habitsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 習慣の作成/更新
  const handleSaveHabit = async (data: HabitFormData) => {
    if (!user) return;

    try {
      if (editingHabit) {
        // 更新
        const { error } = await supabase
          .from("habits")
          .update({
            name: data.name,
            description: data.description || null,
            category_id: data.category_id || null,
            goal_type: data.goal_type,
            goal_value: data.goal_value,
            unit: data.unit || null,
            frequency: data.frequency,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingHabit.id);

        if (error) throw error;
        toast.success("習慣を更新しました");
      } else {
        // 作成
        const { error } = await supabase.from("habits").insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          goal_type: data.goal_type,
          goal_value: data.goal_value,
          unit: data.unit || null,
          frequency: data.frequency,
        });

        if (error) throw error;
        toast.success("習慣を作成しました");
      }

      setEditingHabit(null);
      fetchData();
    } catch (error) {
      console.error("Error saving habit:", error);
      toast.error("保存に失敗しました");
    }
  };

  // 習慣のアーカイブ
  const handleArchive = async (habit: Habit) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({
          is_archived: !habit.is_archived,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habit.id);

      if (error) throw error;
      toast.success(habit.is_archived ? "アーカイブを解除しました" : "アーカイブしました");
      fetchData();
    } catch (error) {
      console.error("Error archiving habit:", error);
      toast.error("操作に失敗しました");
    }
  };

  // 習慣の削除
  const handleDelete = async (habit: Habit) => {
    if (!confirm(`「${habit.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const { error } = await supabase.from("habits").delete().eq("id", habit.id);

      if (error) throw error;
      toast.success("習慣を削除しました");
      fetchData();
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("削除に失敗しました");
    }
  };

  // フィルタリング
  const filteredHabits = habits.filter((habit) => {
    if (!showArchived && habit.is_archived) return false;
    if (filterCategory !== "all" && habit.category_id !== filterCategory) return false;
    return true;
  });

  const getCategoryById = (id: string | null) => {
    if (!id) return null;
    return categories.find((cat) => cat.id === id) || null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} title="ダッシュボード">
              <LayoutDashboard className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/calendar")} title="カレンダー">
              <Calendar className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/stats")} title="統計">
              <BarChart3 className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">習慣一覧</h2>
            <p className="text-muted-foreground">
              {filteredHabits.length}個の習慣
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="size-4" />
            新しい習慣
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
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
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            アーカイブ済みを表示
          </Button>
        </div>

        {/* Habits Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {habits.length === 0
                ? "まだ習慣がありません"
                : "表示する習慣がありません"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {habits.length === 0
                ? "「新しい習慣」ボタンから追加しましょう"
                : "フィルターを変更してみてください"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                category={getCategoryById(habit.category_id)}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setIsFormOpen(true);
                }}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Habit Form Dialog */}
      <HabitForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        categories={categories}
        habit={editingHabit}
      />
    </div>
  );
}

export default function HabitsPage() {
  return (
    <AuthGuard>
      <HabitsContent />
    </AuthGuard>
  );
}
