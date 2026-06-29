import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jourdeness Concierge｜Digital Skin Concierge",
  description:
    "Jourdeness Concierge 是數位肌膚顧問中心，協助顧客理解肌膚狀態，找到適合的保養方式。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}