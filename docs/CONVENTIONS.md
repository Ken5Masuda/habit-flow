# コーディング規約

## TypeScript

- `strict: true` を有効化
- `any` 禁止、必ず型定義
- 型は `types/` ディレクトリに集約

```typescript
// Good
interface Habit {
  id: string;
  name: string;
  goalType: 'boolean' | 'count';
}

// Bad
const habit: any = {...};
```

## 命名規則

### ファイル・ディレクトリ

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | kebab-case | `habit-card.tsx` |
| ページ | kebab-case | `page.tsx`, `layout.tsx` |
| フック | kebab-case | `use-habits.ts` |
| ユーティリティ | kebab-case | `date-utils.ts` |

### 変数・関数

| 種類 | 規則 | 例 |
|------|------|-----|
| 変数 | camelCase | `habitList`, `isLoading` |
| 関数 | camelCase | `fetchHabits`, `handleSubmit` |
| 定数 | UPPER_SNAKE | `MAX_HABITS`, `API_URL` |
| 型/Interface | PascalCase | `Habit`, `HabitLog` |
| コンポーネント | PascalCase | `HabitCard`, `Dashboard` |

## コンポーネント

### 構造

```typescript
'use client'; // 必要な場合のみ

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
}

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  // hooks
  const [isLoading, setIsLoading] = useState(false);

  // handlers
  const handleClick = () => {...};

  // render
  return <div>...</div>;
}
```

### Props

- インターフェース名: `ComponentNameProps`
- 分割代入で受け取る
- デフォルト値は分割代入で設定

## スタイリング

- Tailwind CSS を使用
- `cn()` でクラス結合
- カスタムスタイルは `globals.css` に CSS変数で定義

```typescript
<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-primary',
  className
)} />
```

## エラーハンドリング

```typescript
try {
  const { data, error } = await supabase.from('habits').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Failed to fetch habits:', error);
  toast.error('習慣の取得に失敗しました');
}
```
