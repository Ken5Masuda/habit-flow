# データベース設計

## テーブル定義

### categories（カテゴリ）

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### habits（習慣）

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'boolean', -- 'boolean' | 'count'
  goal_value INTEGER DEFAULT 1,              -- count型の目標値
  unit TEXT,                                  -- count型の単位（ページ、分など）
  frequency TEXT NOT NULL DEFAULT 'daily',   -- 'daily' | 'weekly'
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### habit_logs（記録）

```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  value INTEGER,                              -- count型の実績値
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);
```

## RLS（Row Level Security）

```sql
-- 全テーブル共通パターン
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own data"
  ON [table_name]
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## プリセットカテゴリ

新規ユーザー登録時に自動作成：

| name | color | icon |
|------|-------|------|
| 健康 | #22c55e | heart |
| 学習 | #3b82f6 | book |
| 仕事 | #f59e0b | briefcase |
| 趣味 | #ec4899 | palette |

## インデックス

```sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, date);
```
