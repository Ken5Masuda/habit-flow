# HabitFlow

## プロジェクト概要

HabitFlow - 毎日の習慣を記録し、ストリーク（連続日数）やグラフで継続状況を可視化するパーソナル習慣トラッカー

## 技術スタック

- **フロントエンド:** Next.js 14+ (App Router), TypeScript (strict mode), Tailwind CSS, shadcn/ui
- **バックエンド:** Supabase (Auth + PostgreSQL)
- **グラフ:** Recharts
- **デプロイ:** Vercel

## 現在のフェーズ

**Phase 1: プロジェクト初期化 + 認証**

詳細は [docs/PHASES.md](./docs/PHASES.md) を参照

## ドキュメント構成

| ファイル | 内容 |
|---------|------|
| [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 機能要件、画面構成 |
| [docs/DATABASE.md](./docs/DATABASE.md) | テーブル定義、RLS、プリセット値 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | ディレクトリ構造、認証フロー、データ取得パターン |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | コーディング規約、命名規則 |
| [docs/PHASES.md](./docs/PHASES.md) | 5フェーズの開発計画と完了条件 |

## クイックスタート

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 開発サーバー起動
npm run dev
```

## コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # プロダクションビルド
npm run lint     # ESLint
npm run test     # テスト実行
```
