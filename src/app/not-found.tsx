import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="size-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-medium text-foreground mb-2">
          ページが見つかりません
        </h2>
        <p className="text-muted-foreground mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="size-4" />
            ホームに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
