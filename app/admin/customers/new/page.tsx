"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const form =
      new FormData(
        event.currentTarget
      );

    try {
      const response =
        await fetch(
          "/api/admin/customers",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              customerName:
                form.get(
                  "customerName"
                ),

              phone:
                form.get(
                  "phone"
                ),

              lineDisplayName:
                form.get(
                  "lineDisplayName"
                ),

              lineId:
                form.get(
                  "lineId"
                ),

              note:
                form.get(
                  "note"
                ),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "建立客戶失敗"
        );
      }

      router.push(
        "/admin/customers"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "建立客戶失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            CRM / NEW CUSTOMER
          </p>

          <h1 style={styles.title}>
            新增客戶
          </h1>

          <p style={styles.subtitle}>
            建立基本客戶資料。購買紀錄與標籤之後再從客戶詳細頁補充。
          </p>
        </div>

        <Link
          href="/admin/customers"
          style={styles.backButton}
        >
          返回客戶資料
        </Link>
      </section>

      <form
        onSubmit={handleSubmit}
        style={styles.form}
      >
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            基本資料
          </h2>

          <div style={styles.grid}>
            <label style={styles.field}>
              <span style={styles.label}>
                客戶姓名 *
              </span>

              <input
                name="customerName"
                required
                style={styles.input}
                placeholder="例如：王小姐"
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                電話
              </span>

              <input
                name="phone"
                style={styles.input}
                placeholder="例如：0912345678"
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                LINE 顯示名稱
              </span>

              <input
                name="lineDisplayName"
                style={styles.input}
                placeholder="LINE 上看到的名稱"
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                LINE ID
              </span>

              <input
                name="lineId"
                style={styles.input}
                placeholder="客人提供時再填"
              />
            </label>
          </div>

          <label style={styles.field}>
            <span style={styles.label}>
              備註
            </span>

            <textarea
              name="note"
              rows={5}
              style={styles.textarea}
              placeholder="例如：城堡現場認識、偏好商品、客服備註"
            />
          </label>
        </section>

        {error ? (
          <div style={styles.error}>
            {error}
          </div>
        ) : null}

        <div style={styles.actions}>
          <Link
            href="/admin/customers"
            style={styles.cancelButton}
          >
            取消
          </Link>

          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.saveButton,
              opacity:
                saving ? 0.6 : 1,
            }}
          >
            {saving
              ? "儲存中..."
              : "建立客戶"}
          </button>
        </div>
      </form>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    display: "grid",
    gap: 20,
    padding: 28,
    color: "#2f2528",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: 20,
    padding: 24,
    border:
      "1px solid #eadfe1",
    borderRadius: 20,
    background: "#fff",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  title: {
    margin: 0,
    fontSize: 26,
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#88777b",
    fontSize: 13,
  },

  backButton: {
    padding: "9px 14px",
    border:
      "1px solid #8c2940",
    borderRadius: 999,
    color: "#8c2940",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 900,
  },

  form: {
    display: "grid",
    gap: 16,
  },

  card: {
    display: "grid",
    gap: 18,
    padding: 24,
    border:
      "1px solid #eadfe1",
    borderRadius: 20,
    background: "#fff",
  },

  sectionTitle: {
    margin: 0,
    fontSize: 18,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  field: {
    display: "grid",
    gap: 7,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
  },

  input: {
    minHeight: 44,
    border:
      "1px solid #dbcfd2",
    borderRadius: 10,
    padding: "0 12px",
    background: "#fff",
  },

  textarea: {
    border:
      "1px solid #dbcfd2",
    borderRadius: 10,
    padding: 12,
    resize: "vertical",
    background: "#fff",
  },

  error: {
    padding: 12,
    borderRadius: 12,
    background: "#f8eef1",
    color: "#7d2638",
    fontSize: 13,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 42,
    padding: "0 16px",
    border:
      "1px solid #dbcfd2",
    borderRadius: 10,
    color: "#5f5054",
    textDecoration: "none",
    fontWeight: 800,
  },

  saveButton: {
    minHeight: 42,
    padding: "0 18px",
    border: 0,
    borderRadius: 10,
    background: "#8c2940",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
