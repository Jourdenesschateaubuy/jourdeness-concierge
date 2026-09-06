import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl =
  "https://jourdeness-concierge.vercel.app";

const siteDescription =
  "精選佐登妮絲人氣保養、美妝、精油與健康商品，城堡限定優惠線上輕鬆選購。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "佐登妮絲城堡嚴選",
  description: siteDescription,
  openGraph: {
    title: "佐登妮絲城堡嚴選",
    description: siteDescription,
    url: siteUrl,
    siteName: "佐登妮絲城堡嚴選",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "佐登妮絲城堡嚴選",
    description: siteDescription,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
