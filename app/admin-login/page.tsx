import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  hasValidAdminSession,
  isAdminAuthConfigured,
} from "../../lib/admin-auth";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jourdeness 後台登入",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    config?: string;
    logout?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  if (await hasValidAdminSession()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const configured = isAdminAuthConfigured();

  return (
    <main className={styles.page}>
      <section className={styles.loginCard}>
        <div className={styles.brandMark}>J</div>

        <p className={styles.eyebrow}>JOURDENESS ADMIN</p>
        <h1>後台登入</h1>
        <p className={styles.subtitle}>輸入管理密碼即可進入後台。</p>

        {!configured || params.config === "1" ? (
          <div className={styles.errorBox}>
            尚未設定後台密碼，請先設定 ADMIN_PASSWORD。
          </div>
        ) : null}

        {params.error === "1" ? (
          <div className={styles.errorBox}>
            密碼不正確，請重新輸入。
          </div>
        ) : null}

        {params.logout === "1" ? (
          <div className={styles.successBox}>已登出。</div>
        ) : null}

        <form method="post" action="/api/admin/login" className={styles.form}>
          <label>
            <span>管理密碼</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
              autoFocus
            />
          </label>

          <button type="submit" disabled={!configured}>
            進入後台
          </button>
        </form>

        <a className={styles.storeLink} href="/">
          ← 回正式商城
        </a>
      </section>
    </main>
  );
}
