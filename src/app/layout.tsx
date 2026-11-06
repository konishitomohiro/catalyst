import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "catalyst",
  description: "多職種間の「前提」を埋めるアプリ（ハッカソン用・開発中）",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
