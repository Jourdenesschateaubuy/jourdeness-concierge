import styles from "./customers.module.css";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>CRM / CUSTOMER DATA</p>
        <h1>客戶資料</h1>
        <span>
          後續將整合客戶基本資料、LINE 身分、聯絡方式與歷史訂單。
        </span>
      </section>

      <section className={styles.placeholder}>
        <strong>客戶資料中心</strong>
        <p>
          此入口已建立，下一階段再開始整理客戶資料與訂單關聯。
        </p>
      </section>
    </main>
  );
}
