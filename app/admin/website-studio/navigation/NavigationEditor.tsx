"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  NavigationItem,
} from "../../../../lib/cms/modules/navigation/types";

function createItem(
  index: number
): NavigationItem {
  return {
    id:
      `nav-${Date.now()}-${index}`,
    label: "新選單",
    linkType: "url",
    linkValue: "/",
    isVisible: true,
  };
}

export default function NavigationEditor({
  initialItems,
  saveAction,
}: {
  initialItems: NavigationItem[];
  saveAction: (
    formData: FormData
  ) => void | Promise<void>;
}) {
  const [items, setItems] =
    useState(initialItems);
  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  const visibleItems =
    useMemo(
      () =>
        items.filter(
          (item) => item.isVisible
        ),
      [items]
    );

  function updateItem(
    id: string,
    patch: Partial<NavigationItem>
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }

  function moveItem(
    sourceId: string,
    targetId: string
  ) {
    if (sourceId === targetId) {
      return;
    }

    setItems((current) => {
      const from = current.findIndex(
        (item) =>
          item.id === sourceId
      );

      const to = current.findIndex(
        (item) =>
          item.id === targetId
      );

      if (from < 0 || to < 0) {
        return current;
      }

      const next = [...current];
      const [moved] =
        next.splice(from, 1);

      next.splice(to, 0, moved);

      return next;
    });
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  return (
    <form
      action={saveAction}
      style={styles.layout}
    >
      <input
        type="hidden"
        name="itemsJson"
        value={JSON.stringify(items)}
      />

      <section style={styles.editor}>
        <div style={styles.editorHeader}>
          <div>
            <span style={styles.eyebrow}>
              MOBILE NAVIGATION
            </span>

            <h2 style={styles.title}>
              Navigation Builder
            </h2>

            <p style={styles.subtitle}>
              拖曳排序、修改文字、連結與顯示狀態。
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() =>
                setItems((current) => [
                  ...current,
                  createItem(
                    current.length + 1
                  ),
                ])
              }
            >
              ＋ 新增選單
            </button>

            <button
              type="submit"
              style={styles.saveButton}
            >
              儲存 Draft
            </button>
          </div>
        </div>

        <div style={styles.list}>
          {items.map(
            (item, index) => (
              <article
                key={item.id}
                draggable
                onDragStart={() =>
                  setDraggingId(
                    item.id
                  )
                }
                onDragEnd={() =>
                  setDraggingId(null)
                }
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={() => {
                  if (draggingId) {
                    moveItem(
                      draggingId,
                      item.id
                    );
                  }
                }}
                style={{
                  ...styles.item,
                  ...(draggingId ===
                  item.id
                    ? styles.itemDragging
                    : {}),
                }}
              >
                <div style={styles.dragCell}>
                  <span style={styles.dragHandle}>
                    ☰
                  </span>
                  <strong>
                    {index + 1}
                  </strong>
                </div>

                <label style={styles.field}>
                  <span>名稱</span>
                  <input
                    value={item.label}
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        {
                          label:
                            event.target
                              .value,
                        }
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.field}>
                  <span>連結類型</span>
                  <select
                    value={
                      item.linkType
                    }
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        {
                          linkType:
                            event.target
                              .value as NavigationItem["linkType"],
                        }
                      )
                    }
                    style={styles.input}
                  >
                    <option value="homepage">
                      首頁
                    </option>
                    <option value="url">
                      URL
                    </option>
                    <option value="category">
                      分類
                    </option>
                    <option value="none">
                      不連結
                    </option>
                  </select>
                </label>

                <label style={styles.field}>
                  <span>連結內容</span>
                  <input
                    value={
                      item.linkValue
                    }
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        {
                          linkValue:
                            event.target
                              .value,
                        }
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.visibleField}>
                  <input
                    type="checkbox"
                    checked={
                      item.isVisible
                    }
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        {
                          isVisible:
                            event.target
                              .checked,
                        }
                      )
                    }
                  />
                  顯示
                </label>

                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() =>
                    removeItem(item.id)
                  }
                >
                  移除
                </button>
              </article>
            )
          )}
        </div>
      </section>

      <aside style={styles.previewWrap}>
        <div style={styles.previewHeader}>
          <strong>
            手機導覽預覽
          </strong>
          <span>Live Preview</span>
        </div>

        <div style={styles.phone}>
          <div style={styles.phoneTop}>
            <span>☰</span>
            <strong>Jourdeness</strong>
            <span>⌕ ♡ 🛒</span>
          </div>

          <div style={styles.drawer}>
            <span style={styles.drawerTitle}>
              MENU
            </span>

            {visibleItems.length ===
            0 ? (
              <div style={styles.empty}>
                目前沒有顯示中的選單
              </div>
            ) : (
              visibleItems.map(
                (item, index) => (
                  <div
                    key={item.id}
                    style={styles.previewItem}
                  >
                    <span>
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <strong>
                      {item.label}
                    </strong>

                    <em>
                      {item.linkType ===
                      "none"
                        ? "—"
                        : "›"}
                    </em>
                  </div>
                )
              )
            )}
          </div>

          <div style={styles.phoneBody}>
            <span>
              Navigation Draft Preview
            </span>
          </div>
        </div>
      </aside>
    </form>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,1fr) 360px",
    gap: 18,
    alignItems: "start",
  },

  editor: {
    display: "grid",
    gap: 16,
    padding: 20,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 20,
    background: "#fff",
  },

  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  title: {
    margin: "4px 0",
  },

  subtitle: {
    margin: 0,
    color: "#75666a",
  },

  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  saveButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 15px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  secondaryButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "10px 15px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 900,
  },

  list: {
    display: "grid",
    gap: 10,
  },

  item: {
    display: "grid",
    gridTemplateColumns:
      "70px minmax(140px,1fr) 150px minmax(160px,1fr) 90px auto",
    gap: 10,
    alignItems: "end",
    padding: 12,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fffafb",
  },

  itemDragging: {
    opacity: 0.5,
  },

  dragCell: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    paddingBottom: 10,
  },

  dragHandle: {
    color: "#8c2940",
    cursor: "grab",
    fontWeight: 900,
  },

  field: {
    display: "grid",
    gap: 6,
    fontWeight: 800,
    fontSize: 12,
  },

  input: {
    width: "100%",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#fff",
  },

  visibleField: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    paddingBottom: 11,
    fontWeight: 800,
  },

  removeButton: {
    marginBottom: 2,
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "8px 10px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 800,
  },

  previewWrap: {
    position: "sticky",
    top: 18,
    display: "grid",
    gap: 10,
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#6c5a60",
  },

  phone: {
    overflow: "hidden",
    minHeight: 650,
    border: "10px solid #2d292a",
    borderRadius: 34,
    background: "#f8efe3",
    boxShadow:
      "0 24px 50px rgba(48,34,39,.16)",
  },

  phoneTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: 16,
    background: "#fffaf4",
  },

  drawer: {
    display: "grid",
    gap: 1,
    padding: 14,
    background: "#fff",
  },

  drawerTitle: {
    padding: "7px 8px 12px",
    color: "#8c2940",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  previewItem: {
    display: "grid",
    gridTemplateColumns:
      "34px minmax(0,1fr) auto",
    gap: 10,
    alignItems: "center",
    padding: "15px 8px",
    borderBottom:
      "1px solid rgba(140,41,64,.08)",
  },

  empty: {
    padding: 24,
    color: "#8a7d80",
    textAlign: "center",
  },

  phoneBody: {
    minHeight: 280,
    display: "grid",
    placeItems: "center",
    color: "#8f7b80",
  },
};
