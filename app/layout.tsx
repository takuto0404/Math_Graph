import "katex/dist/katex.min.css";
import "./globals.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "関数グラフ4択ゲーム",
  description: "受験で頻出の関数の概形を4択で見抜く学習ゲーム",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
