import type { Metadata } from "next";
import Link from "next/link";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Jourdeness 後台",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <small>Admin Phase 2A</small>
        </div>
      </aside>

      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
