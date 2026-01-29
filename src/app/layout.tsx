import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HabitFlow - 習慣トラッカー",
    template: "%s | HabitFlow",
  },
  description: "毎日の習慣を記録し、ストリークやグラフで継続状況を可視化するパーソナル習慣トラッカー",
  keywords: ["習慣", "トラッカー", "習慣管理", "ストリーク", "目標達成", "自己改善"],
  authors: [{ name: "HabitFlow" }],
  openGraph: {
    title: "HabitFlow - 習慣トラッカー",
    description: "毎日の習慣を記録し、ストリークやグラフで継続状況を可視化",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "HabitFlow - 習慣トラッカー",
    description: "毎日の習慣を記録し、ストリークやグラフで継続状況を可視化",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
