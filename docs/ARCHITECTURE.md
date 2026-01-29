# アーキテクチャ

## ディレクトリ構造

```
habit-flow/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/             # 認証グループ
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/        # 認証必須グループ
│   │   │   ├── dashboard/
│   │   │   ├── habits/
│   │   │   ├── calendar/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # ランディング
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── auth/               # 認証関連
│   │   ├── habits/             # 習慣関連
│   │   ├── dashboard/          # ダッシュボード
│   │   └── calendar/           # カレンダー
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # ブラウザ用クライアント
│   │   │   ├── server.ts       # サーバー用クライアント
│   │   │   └── middleware.ts   # 認証ミドルウェア
│   │   ├── utils.ts            # ユーティリティ
│   │   └── constants.ts        # 定数
│   ├── hooks/                  # カスタムフック
│   │   ├── use-habits.ts
│   │   ├── use-logs.ts
│   │   └── use-streak.ts
│   └── types/                  # 型定義
│       └── database.ts
├── public/
├── CLAUDE.md
└── docs/
```

## 認証フロー

```
1. ユーザーがログインページにアクセス
2. メール/パスワードを入力
3. Supabase Auth で認証
4. セッションCookieを設定
5. /dashboard にリダイレクト
6. middleware.ts でセッション検証
7. 未認証なら /auth/login にリダイレクト
```

## データ取得パターン

### Server Components（推奨）

```typescript
// app/(dashboard)/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('is_archived', false);

  return <Dashboard habits={habits} />;
}
```

### Client Components（インタラクション用）

```typescript
// components/habits/habit-checkbox.tsx
'use client';

import { createBrowserClient } from '@/lib/supabase/client';

export function HabitCheckbox({ habitId, date }) {
  const supabase = createBrowserClient();

  const toggleComplete = async () => {
    await supabase.from('habit_logs').upsert({...});
  };
}
```

## 状態管理

- **サーバー状態:** Supabase + Server Components
- **クライアント状態:** React useState/useReducer
- **フォーム:** React Hook Form + Zod
