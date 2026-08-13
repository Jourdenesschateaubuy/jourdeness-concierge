"use client";

import {
  useState,
} from "react";

export default function HomepageDraftPublishBar() {
  const [message, setMessage] =
    useState("");

  const [working, setWorking] =
    useState<
      "publish" |
      "reset" |
      null
    >(null);

  async function runAction(
    kind:
      | "publish"
      | "reset-draft"
  ) {
    setWorking(
      kind === "publish"
        ? "publish"
        : "reset"
    );

    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/site-studio",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            kind,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "操作失敗"
        );
      }

      setMessage(
        result?.message ||
          (
            kind === "publish"
              ? "首頁已發布"
              : "草稿已還原"
          )
      );

      window.dispatchEvent(
        new CustomEvent(
          "jourdeness-homepage-draft-saved"
        )
      );

      if (
        kind === "reset-draft"
      ) {
        window.location.reload();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "操作失敗"
      );
    } finally {
      setWorking(null);
    }
  }

  return (
    <section style={styles.bar}>
      <div style={styles.copy}>
        <strong>
          首頁草稿
        </strong>

        <span>
          管理頁目前修改的是草稿；
          只有按「發布首頁」後，
          正式首頁才會更新。
        </span>
      </div>

      <div style={styles.actions}>
        {message ? (
          <span
            style={styles.message}
          >
            {message}
          </span>
        ) : null}

        <button
          type="button"
          style={
            styles.secondaryButton
          }
          disabled={
            working !== null
          }
          onClick={() =>
            runAction(
              "reset-draft"
            )
          }
        >
          {working === "reset"
            ? "還原中…"
            : "放棄草稿"}
        </button>

        <button
          type="button"
          style={
            styles.publishButton
          }
          disabled={
            working !== null
          }
          onClick={() =>
            runAction("publish")
          }
        >
          {working ===
          "publish"
            ? "發布中…"
            : "發布首頁"}
        </button>
      </div>
    </section>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  bar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    padding: "16px 18px",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 18,
    background: "#fff7f8",
  },

  copy: {
    display: "grid",
    gap: 4,
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  message: {
    color: "#75666a",
    fontSize: 12,
  },

  secondaryButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "9px 14px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  publishButton: {
    border: 0,
    borderRadius: 999,
    padding: "9px 16px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
