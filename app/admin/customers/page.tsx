import Link from "next/link";

import {
  listCustomers,
} from "@/lib/customer-repository";

import styles from "./customers.module.css";

export const dynamic = "force-dynamic";

function formatCustomerCode(id: number) {
  return `C${String(id).padStart(6, "0")}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>CRM / CUSTOMER DATA</p>
          <h1>客戶資料</h1>
          <span>
            整理客戶基本資料、LINE 身分、聯絡方式與後續購買紀錄。
          </span>
        </div>

        <div className={styles.summary}>
          <strong>{customers.length}</strong>
          <span>位客戶</span>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>客戶名單</h2>
            <p>
              網站正式訂單與後續人工建立的客戶，會逐步整合到這裡。
            </p>
          </div>

          <Link
            href="/admin/customers/new"
            className={styles.addButton}
          >
            ＋ 新增客戶
          </Link>
        </div>

        {customers.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>目前尚無 CRM 客戶資料</strong>
            <p>
              現有測試訂單不會自動匯入。之後新的正式客戶會從這裡開始建立與整理。
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>客戶編號</th>
                  <th>姓名</th>
                  <th>LINE</th>
                  <th>電話</th>
                  <th>最近互動</th>
                  <th aria-label="操作" />
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const lineName =
                    customer.lineDisplayName ||
                    customer.lineId ||
                    (customer.lineUserId ? "已連結 LINE" : "");

                  return (
                    <tr key={customer.id}>
                      <td>
                        <span className={styles.customerCode}>
                          {formatCustomerCode(customer.id)}
                        </span>
                      </td>

                      <td>
                        <strong className={styles.customerName}>
                          {customer.customerName || "未填姓名"}
                        </strong>
                      </td>

                      <td>
                        {lineName ? (
                          <span>{lineName}</span>
                        ) : (
                          <span className={styles.muted}>尚未連結</span>
                        )}
                      </td>

                      <td>
                        {customer.phone || (
                          <span className={styles.muted}>—</span>
                        )}
                      </td>

                      <td>{formatDateTime(customer.lastSeenAt)}</td>

                      <td className={styles.actionCell}>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className={styles.detailLink}
                        >
                          查看
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
