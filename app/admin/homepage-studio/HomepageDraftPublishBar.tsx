"use client";

import Link from "next/link";
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
    <div style={styles.wrapper}>
      <div style={styles.status}>
        <strong>
          草稿模式
        </strong>

        <span>
          發布後才更新正式首頁
        </span>

        {message ? (
          <em style={styles.message}>
            {message}
          </em>
        ) : null}
      </div>

      <div style={styles.actions}>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          style={styles.frontButton}
        >
          開啟前台首頁
        </Link>

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
          {working === "publish"
            ? "發布中…"
            : "發布首頁"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  wrapper: {
    display: "grid",
    justifyItems: "end",
    gap: 8,
  },

  status: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#75666a",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },

  message: {
    color: "#8c2940",
    fontStyle: "normal",
    fontWeight: 700,
  },

  frontButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "8px 13px",
    background: "#fff",
    color: "#8c2940",
    textDecoration: "none",
    fontWeight: 800,
  },

  secondaryButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "8px 13px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  publishButton: {
    border: 0,
    borderRadius: 999,
    padding: "8px 15px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
