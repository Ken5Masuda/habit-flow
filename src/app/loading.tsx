export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto mb-4" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
