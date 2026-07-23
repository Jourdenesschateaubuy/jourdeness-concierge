import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../lib/admin-auth";
import styles from "./admin.module.css";
import authStyles from "./auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jourdeness 後台",
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

  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>J</span>
          <div>
            <strong>Jourdeness</strong>
            <small>回購網站後台</small>
          </div>
        </div>

        <nav className={styles.nav} aria-label="後台導覽">
          <Link href="/admin">總覽</Link>
          <Link href="/admin/products">商品管理</Link>
          <span className={styles.navDisabled}>分類管理 <em>下一階段</em></span>
          <span className={styles.navDisabled}>優惠管理 <em>下一階段</em></span>
          <span className={styles.navDisabled}>首頁管理 <em>下一階段</em></span>
          <span className={styles.navDisabled}>訂單管理 <em>下一階段</em></span>
          <span className={styles.navDisabled}>客戶管理 <em>下一階段</em></span>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank">
            開啟正式商城 ↗
          </Link>

          <form method="post" action="/api/admin/logout" className={authStyles.logoutForm}>
            <button className={authStyles.logoutButton} type="submit">
              登出
            </button>
          </form>

          <small>Admin</small>
        </div>
      </aside>

      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
