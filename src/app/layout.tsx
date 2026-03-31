import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RouteTransitionProvider } from "@/components/route-transition-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Artist Portfolio Shell",
  description: "A transition-first portfolio shell with persistent red accents and project hover previews."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </body>
    </html>
  );
}
