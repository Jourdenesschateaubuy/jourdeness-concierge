import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCustomerById,
  listCustomerTags,
} from "@/lib/customer-repository";

import styles from "../customers.module.css";

export const dynamic = "force-dynamic";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCustomerCode(id: number) {
  return "C" + String(id).padStart(6, "0");
}

function displayValue(value: string) {
  return value.trim() || "—";
}

function formatOptionalDateTime(
  value: string | null
) {
  if (!value) {
    return "尚無資料";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const customerTags =
    await listCustomerTags(id);

  const displayName =
    customer.lineDisplayName ||
    customer.customerName ||
    "未命名客戶";

  return (
    <main className={styles.page}>
      <section className={styles.profileHeader}>
        <div>
          <Link
            href="/admin/customers"
            className={styles.profileBack}
          >
            ← 返回客戶資料
          </Link>

          <p className={styles.eyebrow}>
            CUSTOMER PROFILE
          </p>

          <div className={styles.profileTitleRow}>
            <h1>{displayName}</h1>

            <span className={styles.codePill}>
              {formatCustomerCode(customer.id)}
            </span>
          </div>

          <p className={styles.profileSubtitle}>
            單一客戶資料與 LINE 互動紀錄。
          </p>
        </div>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.detailCard}>
          <p className={styles.sectionEyebrow}>
            LINE DATA
          </p>

          <h2 className={styles.sectionTitle}>
            LINE 資料
          </h2>

          <div className={styles.dataList}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                LINE 顯示名稱
              </span>

              <strong className={styles.dataValue}>
                {displayValue(customer.lineDisplayName)}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                LINE 標籤
              </span>

              {customerTags.length > 0 ? (
                <div className={styles.tagList}>
                  {customerTags.map((tag) => (
                    <span
                      key={tag}
                      className={styles.tagPill}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className={styles.tagEmpty}>
                  尚無標籤
                </span>
              )}
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                加入 LINE 時間
              </span>

              <strong className={styles.dataValue}>
                {formatOptionalDateTime(
                  customer.lineJoinedAt
                )}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                第一次聊天時間
              </span>

              <strong className={styles.dataValue}>
                {formatOptionalDateTime(
                  customer.firstChatAt
                )}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                最後聊天時間
              </span>

              <strong className={styles.dataValue}>
                {formatOptionalDateTime(
                  customer.lastChatAt
                )}
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.detailCard}>
          <p className={styles.sectionEyebrow}>
            INTERACTION
          </p>

          <h2 className={styles.sectionTitle}>
            互動紀錄
          </h2>

          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <strong>
                {customer.customerMessageCount}
              </strong>
              <span>客戶訊息</span>
            </div>

            <div className={styles.statCard}>
              <strong>
                {customer.staffReplyCount}
              </strong>
              <span>真人客服回覆</span>
            </div>

            <div className={styles.statCard}>
              <strong>
                {customer.totalMessageCount}
              </strong>
              <span>聊天總訊息</span>
            </div>
          </div>

          <p className={styles.helperText}>
            數字來自已匯入的 LINE 聊天紀錄。
          </p>
        </article>

        <article className={styles.detailCard}>
          <p className={styles.sectionEyebrow}>
            BASIC INFORMATION
          </p>

          <h2 className={styles.sectionTitle}>
            基本資料
          </h2>

          <div className={styles.dataList}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                客戶姓名
              </span>

              <strong className={styles.dataValue}>
                {displayValue(customer.customerName)}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                電話
              </span>

              <strong className={styles.dataValue}>
                {displayValue(customer.phone)}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                LINE ID
              </span>

              <strong className={styles.dataValue}>
                {displayValue(customer.lineId)}
              </strong>
            </div>

            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>
                LINE User ID
              </span>

              <strong className={styles.dataValue}>
                {displayValue(customer.lineUserId)}
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.detailCard}>
          <p className={styles.sectionEyebrow}>
            INTERNAL NOTE
          </p>

          <h2 className={styles.sectionTitle}>
            補充資料
          </h2>

          <div className={styles.noteBlock}>
            {customer.note.trim() || "目前沒有補充資料。"}
          </div>
        </article>
      </section>
    </main>
  );
}
