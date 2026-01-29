"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          エラーが発生しました
        </h1>
        <p className="text-muted-foreground mb-6">
          申し訳ありません。予期しないエラーが発生しました。
          <br />
          もう一度お試しいただくか、ホームに戻ってください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="size-4" />
            もう一度試す
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full">
              <Home className="size-4" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
