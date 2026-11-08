import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Companion Note | catalyst",
  description: "多職種間の「前提」を埋めるアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Tailwind CDN */}
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <Script id="tailwind-config" strategy="beforeInteractive">
          {`
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "on-primary": "#ffffff",
                    "on-primary-fixed": "#001b3e",
                    "error": "#ba1a1a",
                    "surface-bright": "#f9f9f6",
                    "primary-container": "#1a5fb4",
                    "surface-dim": "#dadad7",
                    "primary-fixed-dim": "#aac7ff",
                    "on-primary-container": "#cbdcff",
                    "tertiary-fixed-dim": "#ffb68a",
                    "on-tertiary-fixed": "#321300",
                    "surface-container-low": "#f4f4f1",
                    "primary": "#004790",
                    "surface": "#f9f9f6",
                    "on-error-container": "#93000a",
                    "error-container": "#ffdad6",
                    "inverse-surface": "#2f312f",
                    "on-background": "#1a1c1b",
                    "on-tertiary-fixed-variant": "#743500",
                    "on-primary-fixed-variant": "#00458d",
                    "on-secondary": "#ffffff",
                    "tertiary-container": "#9b4900",
                    "secondary": "#904d00",
                    "surface-variant": "#e2e3e0",
                    "secondary-container": "#fe932c",
                    "on-tertiary": "#ffffff",
                    "inverse-primary": "#aac7ff",
                    "on-surface": "#1a1c1b",
                    "on-secondary-fixed": "#2f1500",
                    "surface-container-lowest": "#ffffff",
                    "background": "#f9f9f6",
                    "on-secondary-container": "#663500",
                    "surface-tint": "#175db2",
                    "primary-fixed": "#d6e3ff",
                    "outline-variant": "#c2c6d4",
                    "on-error": "#ffffff",
                    "surface-container-highest": "#e2e3e0",
                    "secondary-fixed-dim": "#ffb77d",
                    "outline": "#727783",
                    "on-tertiary-container": "#ffd3b9",
                    "secondary-fixed": "#ffdcc3",
                    "tertiary": "#773600",
                    "on-secondary-fixed-variant": "#6e3900",
                    "tertiary-fixed": "#ffdbc8",
                    "on-surface-variant": "#424752",
                    "surface-container": "#eeeeeb",
                    "inverse-on-surface": "#f1f1ee",
                    "surface-container-high": "#e8e8e5",
                  },
                  borderRadius: {
                    DEFAULT: "0.25rem",
                    lg: "0.5rem",
                    xl: "0.75rem",
                    full: "9999px",
                  },
                  spacing: {
                    "space-md": "1.125rem",
                    "space-sm": "0.75rem",
                    "margin": "1rem",
                    "gutter": "1rem",
                    "margin-desktop": "2.5rem",
                    "space-lg": "1.5rem",
                    "gutter-desktop": "2rem",
                    "space-xl": "2.25rem",
                    "space-2xl": "3rem",
                    "gutter-tablet": "1.5rem",
                    "space-xs": "0.375rem",
                    "margin-tablet": "1.5rem",
                  },
                  fontFamily: {
                    "headline-md": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "ruby": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "label-lg": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "label-sm": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "body-lg": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "headline-lg": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "headline-lg-mobile": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "body-md": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "body-sm": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "label-md": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                    "headline-sm": ["Noto Sans JP", "Noto Sans", "sans-serif"],
                  },
                  fontSize: {
                    "headline-md": ["1.5rem", { lineHeight: "2.4rem", fontWeight: "700" }],
                    "ruby": ["0.6875rem", { lineHeight: "1rem", fontWeight: "500" }],
                    "label-lg": ["1.125rem", { lineHeight: "1.8rem", fontWeight: "700" }],
                    "label-sm": ["0.875rem", { lineHeight: "1.4rem", fontWeight: "500" }],
                    "body-lg": ["1.25rem", { lineHeight: "2.2rem", fontWeight: "700" }],
                    "headline-lg": ["1.75rem", { lineHeight: "2.8rem", fontWeight: "700" }],
                    "headline-lg-mobile": ["1.5rem", { lineHeight: "2.4rem", fontWeight: "700" }],
                    "body-md": ["1.125rem", { lineHeight: "2.0rem", fontWeight: "400" }],
                    "body-sm": ["1rem", { lineHeight: "1.75rem", fontWeight: "400" }],
                    "label-md": ["1rem", { lineHeight: "1.6rem", fontWeight: "700" }],
                    "headline-sm": ["1.25rem", { lineHeight: "2.1rem", fontWeight: "700" }],
                  },
                },
              },
            };
          `}
        </Script>
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
