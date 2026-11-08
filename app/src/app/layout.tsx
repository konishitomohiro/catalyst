import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "catalyst",
  description: "多職種間の「前提」を埋めるアプリ（ハッカソン用・開発中）",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <head>
        {/* Stitch の見本と同じ字形（Noto Sans JP）とアイコン（Material Symbols） */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
