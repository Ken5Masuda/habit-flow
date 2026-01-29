# 開発振り返り（Development Retrospective）

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | HabitFlow |
| 開発期間 | 1セッション（Claude Codeによる対話型開発） |
| 本番URL | https://habit-flow-nine-beige.vercel.app |
| リポジトリ | https://github.com/Ken5Masuda/habit-flow |

## 実装した機能一覧

### Phase 1: プロジェクト初期化 + 認証
- [x] Next.js 14+ プロジェクト作成（TypeScript, App Router）
- [x] Tailwind CSS + shadcn/ui セットアップ
- [x] Supabase クライアント設定
- [x] 環境変数テンプレート（.env.example）
- [x] 認証UI実装（ログイン/サインアップ）
- [x] AuthGuard コンポーネント作成
- [x] ダークモード切替機能
- [x] ランディングページ

### Phase 2: データベース + 習慣CRUD
- [x] Supabase テーブル作成（categories, habits, habit_logs）
- [x] RLS ポリシー設定
- [x] 型定義ファイル作成
- [x] 習慣一覧ページ実装
- [x] 習慣作成フォーム実装
- [x] 習慣編集/削除機能実装
- [x] カテゴリフィルタリング実装
- [x] アーカイブ機能

### Phase 3: 記録機能 + ダッシュボード
- [x] ダッシュボードレイアウト作成
- [x] 今日の習慣リスト実装
- [x] 完了チェック機能（boolean型）
- [x] 数値入力機能（count型）
- [x] ストリーク計算ロジック実装
- [x] 週間進捗グラフ（Recharts）

### Phase 4: カレンダー + 統計
- [x] カレンダーコンポーネント作成
- [x] 月間ヒートマップ実装
- [x] 日付選択で詳細表示
- [x] 習慣別統計ページ
- [x] 達成率計算

### Phase 5: 仕上げ + デプロイ
- [x] レスポンシブ対応確認
- [x] エラーハンドリング強化（error.tsx, not-found.tsx）
- [x] ローディング状態の改善（loading.tsx）
- [x] SEO対策（メタタグ、OGP）
- [x] Vercel デプロイ
- [x] 本番環境テスト

### 追加機能
- [x] ツールチップ（shadcn/ui Tooltip）
- [x] チュートリアル/オンボーディング
  - ウェルカムダイアログ（初回ログイン時）
  - ヘルプページ（/help）

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16.1.6 (App Router) |
| 言語 | TypeScript (strict mode) |
| スタイリング | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| バックエンド | Supabase (Auth + PostgreSQL) |
| グラフ | Recharts |
| デプロイ | Vercel |
| バージョン管理 | Git / GitHub |

## ファイル構成（最終形）

```
habit-flow/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── habits/page.tsx
│   │   ├── help/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   │   └── auth-guard.tsx
│   │   ├── calendar/
│   │   │   ├── day-detail.tsx
│   │   │   └── habit-calendar.tsx
│   │   ├── dashboard/
│   │   │   ├── streak-card.tsx
│   │   │   ├── today-habits.tsx
│   │   │   └── weekly-chart.tsx
│   │   ├── habits/
│   │   │   ├── habit-card.tsx
│   │   │   └── habit-form.tsx
│   │   ├── onboarding/
│   │   │   └── welcome-dialog.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── lib/
│   │   ├── date-utils.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       └── database.ts
├── supabase/
│   └── schema.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── DATABASE.md
│   ├── PHASES.md
│   └── REQUIREMENTS.md
├── CLAUDE.md
└── .env.example
```

## 発生した問題と解決策

### 1. ビルドエラー（Supabase環境変数）
- **問題:** ビルド時にSupabase環境変数がないとエラー
- **原因:** Supabaseクライアントが空文字列で初期化できない
- **解決:** プレースホルダー値を使用してビルド時エラーを回避
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
```

### 2. ESLint エラー（useEffect内のsetState）
- **問題:** `useEffect`内で同期的に`setState`を呼ぶとlintエラー
- **原因:** React 18以降の厳格なルール
- **解決:** `useLayoutEffect`（または`useIsomorphicLayoutEffect`）を使用

### 3. 新規ユーザー作成エラー
- **問題:** "Database error saving new user"
- **原因:** デフォルトカテゴリ作成トリガーの権限問題
- **解決:** トリガーを一時的に削除し、カテゴリは手動作成に変更

### 4. 認証リダイレクト失敗
- **問題:** 本番環境でログイン後リダイレクトされない
- **原因:** SupabaseのSite URL / Redirect URLs未設定
- **解決:** Supabaseダッシュボードで本番URLを設定

## Git コミット履歴

```
7a78e05 feat: ツールチップとチュートリアル機能を追加
88685c1 fix: lint エラーと未使用インポートを修正
11160d8 feat: Phase 5 仕上げ - デプロイ準備完了
298d149 feat: Phase 4 完了 - カレンダー + 統計機能
b9cc106 feat: Phase 3 完了 - 記録機能 + ダッシュボード
ac670eb feat: Phase 2 完了 - データベース + 習慣CRUD
cf9860b docs: Phase 1 完了をドキュメントに反映
9fa7e19 feat: Phase 1 完了 - プロジェクト初期化 + 認証システム
fca46ad Initial commit from Create Next App
```

## 所要時間の内訳（概算）

| フェーズ | 作業内容 |
|---------|---------|
| Phase 1 | プロジェクト初期化、認証、ダークモード |
| Phase 2 | DB設計、習慣CRUD、フォーム |
| Phase 3 | ダッシュボード、記録機能、グラフ |
| Phase 4 | カレンダー、統計、ヒートマップ |
| Phase 5 | 仕上げ、デプロイ、本番設定 |
| 追加 | ツールチップ、チュートリアル |
| トラブル対応 | 環境変数、lint、認証設定 |

## 成果物

1. **本番アプリケーション:** https://habit-flow-nine-beige.vercel.app
2. **ソースコード:** https://github.com/Ken5Masuda/habit-flow
3. **ドキュメント:** `/docs` ディレクトリ内

## 今後の拡張案

- プッシュ通知（リマインダー）
- ソーシャル機能（友達との共有）
- データエクスポート（CSV/JSON）
- 習慣テンプレート
- ウィジェット対応
- 多言語対応
