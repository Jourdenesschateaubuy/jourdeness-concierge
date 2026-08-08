"use client";

import type {
  ReactNode,
} from "react";

export default function PickerShell({
  open,
  eyebrow = "CONTENT PICKER",
  title,
  searchValue,
  searchPlaceholder = "搜尋",
  onSearchChange,
  onClose,
  loading = false,
  empty = false,
  emptyText = "目前沒有符合條件的項目。",
  countText,
  children,
}: {
  open: boolean;
  eyebrow?: string;
  title: string;
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (
    value: string
  ) => void;
  onClose: () => void;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  countText?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      style={styles.backdrop}
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={styles.dialog}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>
              {eyebrow}
            </span>

            <h2 style={styles.title}>
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            關閉
          </button>
        </div>

        <div style={styles.toolbar}>
          <input
            value={searchValue}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder={
              searchPlaceholder
            }
            autoFocus
            style={styles.search}
          />

          {countText ? (
            <span style={styles.count}>
              {countText}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div style={styles.empty}>
            讀取中…
          </div>
        ) : empty ? (
          <div style={styles.empty}>
            {emptyText}
          </div>
        ) : (
          children
        )}
      </section>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "rgba(40,30,33,.48)",
  },

  dialog: {
    width: "min(1040px, 96vw)",
    maxHeight: "88vh",
    overflow: "auto",
    padding: 18,
    borderRadius: 22,
    background: "#fff",
    boxShadow:
      "0 30px 80px rgba(40,30,33,.28)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  title: {
    margin: "4px 0 0",
  },

  closeButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  toolbar: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    margin: "16px 0",
  },

  search: {
    flex: 1,
    minWidth: 0,
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 999,
    padding: "11px 14px",
    background: "#fffafb",
  },

  count: {
    color: "#796a6e",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  empty: {
    display: "grid",
    minHeight: 260,
    placeItems: "center",
    color: "#847579",
  },
};
