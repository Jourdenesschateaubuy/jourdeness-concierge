"use client";

import { useRef, useState } from "react";
import styles from "../admin-v2-shell.module.css";

export default function AdminStorefrontShell() {
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const storefrontFrameRef = useRef<HTMLIFrameElement>(null);

  function updateEditMode(next: boolean) {
    setEditMode(next);

    storefrontFrameRef.current?.contentWindow?.postMessage(
      {
        type: "jourdeness-admin-edit-mode",
        enabled: next,
      },
      window.location.origin
    );
  }

  if (previewMode) {
    return (
      <div className={styles.previewShell}>
        <iframe
          className={styles.previewFrame}
          src="/"
          title="佐登妮絲城堡網站預覽"
        />

        <button
          type="button"
          className={styles.returnManageButton}
          onClick={() => setPreviewMode(false)}
        >
          返回管理
        </button>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.manageBar}>
        <div className={styles.manageTitle}>
          <span className={styles.manageBadge}>
            {editMode ? "正在修改" : "管理模式"}
          </span>

          <div>
            <strong>佐登妮絲城堡</strong>
            <small>
              {editMode
                ? "點選要修改的商品"
                : "直接在網站畫面上管理內容"}
            </small>
          </div>
        </div>

        <div className={styles.manageActions}>
          <button
            type="button"
            className={
              editMode
                ? `${styles.editModeButton} ${styles.editModeButtonActive}`
                : styles.editModeButton
            }
            onClick={() => updateEditMode(!editMode)}
          >
            {editMode ? "完成" : "修改模式"}
          </button>

          <button
            type="button"
            className={styles.previewButton}
            onClick={() => {
              updateEditMode(false);
              setPreviewMode(true);
            }}
          >
            預覽
          </button>
        </div>
      </header>

      <div className={styles.manageHint}>
        {editMode
          ? "點選商品卡，再按下方「修改」"
          : "按「修改模式」開始編輯網站"}
      </div>

      <iframe
        ref={storefrontFrameRef}
        className={styles.storefrontFrame}
        src={
          editMode
            ? "/?admin=1&edit=1"
            : "/?admin=1"
        }
        title="佐登妮絲城堡管理畫面"
        onLoad={() => {
          storefrontFrameRef.current?.contentWindow?.postMessage(
            {
              type: "jourdeness-admin-edit-mode",
              enabled: editMode,
            },
            window.location.origin
          );
        }}
      />
    </div>
  );
}
