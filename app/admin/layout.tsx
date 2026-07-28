import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jourdeness 管理模式",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin-login");
  }

  return children;
}
