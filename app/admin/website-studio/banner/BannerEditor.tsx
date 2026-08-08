"use client";

import {
  useMemo,
  useState,
} from "react";

import MediaPicker from "../components/MediaPicker";

import type {
  BannerItem,
} from "../../../../lib/cms/modules/banner/types";

type PickTarget =
  | "mobile"
  | "desktop"
  | null;

function newBanner(
  index: number
): BannerItem {
  return {
    id:
      `banner-${Date.now()}-${index}`,
    name: `Banner ${index}`,
    title: "",
    subtitle: "",
    buttonLabel: "",
    mobileMediaId: null,
    desktopMediaId: null,
    mobileImage: "",
    desktopImage: "",
    alt: "",
    linkType: "url",
    linkValue: "",
    isVisible: true,
  };
}

function mediaUrl(
  id?: number | null
) {
  return id
    ? `/api/studio/media/${id}/file`
    : "";
}

export default function BannerEditor({
  initialItems,
  saveAction,
}: {
  initialItems: BannerItem[];
  saveAction: (
    formData: FormData
  ) => void | Promise<void>;
}) {
  const [items, setItems] =
    useState(initialItems);
  const [selectedId, setSelectedId] =
    useState<string | null>(
      initialItems[0]?.id ?? null
    );
  const [draggingId, setDraggingId] =
    useState<string | null>(null);
  const [pickTarget, setPickTarget] =
    useState<PickTarget>(null);

  const selected =
    useMemo(
      () =>
        items.find(
          (item) =>
            item.id === selectedId
        ) ?? null,
      [items, selectedId]
    );

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
    patch: Partial<BannerItem>
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

    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function addItem() {
    setItems((current) => {
      const next = newBanner(
        current.length + 1
      );

      setSelectedId(next.id);

      return [...current, next];
    });
  }

  const previewItem =
    selected &&
    selected.isVisible
      ? selected
      : visibleItems[0] ?? null;

  const previewImage =
    previewItem
      ? mediaUrl(
          previewItem.mobileMediaId
        ) ||
        previewItem.mobileImage
      : "";

  return (
    <>
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
                MOBILE BANNER
              </span>

              <h2 style={styles.title}>
                Banner Builder
              </h2>

              <p style={styles.subtitle}>
                Banner 圖片改由 Media Library 選取；手機版仍是主要設計基準。
              </p>
            </div>

            <div style={styles.headerActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={addItem}
              >
                ＋ 新增 Banner
              </button>

              <button
                type="submit"
                style={styles.saveButton}
              >
                儲存 Draft
              </button>
            </div>
          </div>

          <div style={styles.workspace}>
            <aside style={styles.bannerList}>
              <strong>
                Banner 順序
              </strong>

              {items.length === 0 ? (
                <div style={styles.empty}>
                  尚無 Banner
                </div>
              ) : (
                items.map(
                  (item, index) => (
                    <button
                      key={item.id}
                      type="button"
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
                      onClick={() =>
                        setSelectedId(
                          item.id
                        )
                      }
                      style={{
                        ...styles.bannerButton,
                        ...(selectedId ===
                        item.id
                          ? styles.bannerButtonActive
                          : {}),
                      }}
                    >
                      <span>
                        ☰ {index + 1}
                      </span>

                      <strong>
                        {item.name ||
                          `Banner ${index + 1}`}
                      </strong>

                      <em>
                        {item.isVisible
                          ? "顯示"
                          : "隱藏"}
                      </em>
                    </button>
                  )
                )
              )}
            </aside>

            <section style={styles.formPanel}>
              {!selected ? (
                <div style={styles.emptyLarge}>
                  新增或選擇一個 Banner 開始編輯。
                </div>
              ) : (
                <>
                  <div style={styles.formHeader}>
                    <strong>
                      {selected.name}
                    </strong>

                    <div style={styles.formHeaderActions}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={
                            selected.isVisible
                          }
                          onChange={(event) =>
                            updateItem(
                              selected.id,
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
                          removeItem(
                            selected.id
                          )
                        }
                      >
                        刪除 Banner
                      </button>
                    </div>
                  </div>

                  <div style={styles.fields}>
                    <label style={styles.field}>
                      <span>
                        Banner Name（後台辨識）
                      </span>
                      <input
                        value={selected.name}
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              name:
                                event.target
                                  .value,
                            }
                          )
                        }
                        style={styles.input}
                      />
                    </label>

                    <div style={styles.field}>
                      <span>
                        手機圖片
                      </span>

                      <div style={styles.assetField}>
                        {selected.mobileMediaId ? (
                          <>
                            <img
                              src={mediaUrl(
                                selected.mobileMediaId
                              )}
                              alt=""
                              style={styles.assetThumb}
                            />

                            <span>
                              Media #{selected.mobileMediaId}
                            </span>
                          </>
                        ) : selected.mobileImage ? (
                          <span>
                            舊圖片路徑：
                            {selected.mobileImage}
                          </span>
                        ) : (
                          <span>
                            尚未選擇圖片
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setPickTarget(
                              "mobile"
                            )
                          }
                          style={styles.pickButton}
                        >
                          選擇圖片
                        </button>

                        {(selected.mobileMediaId ||
                          selected.mobileImage) ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(
                                selected.id,
                                {
                                  mobileMediaId:
                                    null,
                                  mobileImage:
                                    "",
                                }
                              )
                            }
                            style={styles.clearButton}
                          >
                            清除
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <label style={styles.field}>
                      <span>標題</span>
                      <input
                        value={
                          selected.title
                        }
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              title:
                                event.target
                                  .value,
                            }
                          )
                        }
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.field}>
                      <span>副標題</span>
                      <textarea
                        rows={3}
                        value={
                          selected.subtitle
                        }
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              subtitle:
                                event.target
                                  .value,
                            }
                          )
                        }
                        style={styles.textarea}
                      />
                    </label>

                    <label style={styles.field}>
                      <span>按鈕文字</span>
                      <input
                        value={
                          selected.buttonLabel
                        }
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              buttonLabel:
                                event.target
                                  .value,
                            }
                          )
                        }
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.field}>
                      <span>圖片 Alt</span>
                      <input
                        value={selected.alt}
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              alt:
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
                          selected.linkType
                        }
                        onChange={(event) =>
                          updateItem(
                            selected.id,
                            {
                              linkType:
                                event.target
                                  .value as BannerItem["linkType"],
                            }
                          )
                        }
                        style={styles.input}
                      >
                        <option value="url">
                          URL
                        </option>
                        <option value="category">
                          分類
                        </option>
                        <option value="product">
                          商品
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
                          selected.linkValue
                        }
                        onChange={(event) =>
                          updateItem(
                            selected.id,
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

                    <details style={styles.advanced}>
                      <summary>
                        進階／桌機相容設定
                      </summary>

                      <div style={styles.advancedBody}>
                        <div style={styles.field}>
                          <span>
                            桌機圖片（可選）
                          </span>

                          <div style={styles.assetField}>
                            {selected.desktopMediaId ? (
                              <>
                                <img
                                  src={mediaUrl(
                                    selected.desktopMediaId
                                  )}
                                  alt=""
                                  style={styles.assetThumb}
                                />

                                <span>
                                  Media #{selected.desktopMediaId}
                                </span>
                              </>
                            ) : selected.desktopImage ? (
                              <span>
                                舊圖片路徑：
                                {selected.desktopImage}
                              </span>
                            ) : (
                              <span>
                                未設定
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setPickTarget(
                                  "desktop"
                                )
                              }
                              style={styles.pickButton}
                            >
                              選擇圖片
                            </button>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>

        <aside style={styles.previewWrap}>
          <div style={styles.previewHeader}>
            <strong>
              手機 Banner 預覽
            </strong>
            <span>Live Preview</span>
          </div>

          <div style={styles.phone}>
            <div style={styles.phoneTop}>
              <span>☰</span>
              <strong>
                Jourdeness
              </strong>
              <span>⌕ ♡ 🛒</span>
            </div>

            {!previewItem ? (
              <div style={styles.previewEmpty}>
                尚無顯示中的 Banner
              </div>
            ) : (
              <div style={styles.bannerPreview}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={
                      previewItem.alt ||
                      previewItem.title
                    }
                    style={styles.previewImage}
                  />
                ) : (
                  <div
                    style={styles.imagePlaceholder}
                  >
                    請從 Media Library 選擇手機 Banner 圖片
                  </div>
                )}

                <div style={styles.overlay}>
                  {previewItem.title ? (
                    <strong>
                      {previewItem.title}
                    </strong>
                  ) : null}

                  {previewItem.subtitle ? (
                    <span>
                      {
                        previewItem.subtitle
                      }
                    </span>
                  ) : null}

                  {previewItem.buttonLabel ? (
                    <button
                      type="button"
                      style={styles.previewCta}
                    >
                      {
                        previewItem.buttonLabel
                      }
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <div style={styles.phoneBody}>
              <strong>
                Banner Draft Preview
              </strong>

              <span>
                {visibleItems.length} 個 Banner 顯示中
              </span>
            </div>
          </div>
        </aside>
      </form>

      <MediaPicker
        open={Boolean(pickTarget)}
        title={
          pickTarget === "desktop"
            ? "選擇桌機 Banner 圖片"
            : "選擇手機 Banner 圖片"
        }
        selectedId={
          pickTarget === "desktop"
            ? selected?.desktopMediaId
            : selected?.mobileMediaId
        }
        onClose={() =>
          setPickTarget(null)
        }
        onSelect={(asset) => {
          if (!selected) return;

          if (
            pickTarget === "desktop"
          ) {
            updateItem(
              selected.id,
              {
                desktopMediaId:
                  asset.id,
                desktopImage: "",
              }
            );
          } else {
            updateItem(
              selected.id,
              {
                mobileMediaId:
                  asset.id,
                mobileImage: "",
                alt:
                  selected.alt ||
                  asset.altText ||
                  asset.title,
              }
            );
          }
        }}
      />
    </>
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

  workspace: {
    display: "grid",
    gridTemplateColumns:
      "220px minmax(0,1fr)",
    gap: 14,
  },

  bannerList: {
    display: "grid",
    alignContent: "start",
    gap: 8,
    padding: 10,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fffafb",
  },

  bannerButton: {
    display: "grid",
    gridTemplateColumns:
      "auto minmax(0,1fr) auto",
    gap: 8,
    alignItems: "center",
    border:
      "1px solid rgba(140,41,64,.08)",
    borderRadius: 12,
    padding: "10px 11px",
    background: "#fff",
    color: "#55464a",
    cursor: "grab",
    textAlign: "left",
  },

  bannerButtonActive: {
    border:
      "1px solid rgba(140,41,64,.28)",
    background: "#f8edef",
    color: "#8c2940",
  },

  formPanel: {
    padding: 14,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fff",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 14,
  },

  formHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  checkboxLabel: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontWeight: 800,
  },

  fields: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0,1fr))",
    gap: 12,
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

  textarea: {
    width: "100%",
    resize: "vertical",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#fff",
  },

  assetField: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    padding: 8,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 10,
    background: "#fffafb",
  },

  assetThumb: {
    width: 44,
    height: 44,
    objectFit: "cover",
    borderRadius: 8,
  },

  pickButton: {
    marginLeft: "auto",
    border: 0,
    borderRadius: 999,
    padding: "8px 11px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  clearButton: {
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 999,
    padding: "8px 10px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
  },

  removeButton: {
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 800,
  },

  advanced: {
    gridColumn: "1 / -1",
    padding: 10,
    border:
      "1px solid rgba(140,41,64,.08)",
    borderRadius: 12,
    background: "#fffafb",
  },

  advancedBody: {
    paddingTop: 10,
  },

  empty: {
    padding: 18,
    color: "#8b7b7f",
    textAlign: "center",
  },

  emptyLarge: {
    display: "grid",
    minHeight: 260,
    placeItems: "center",
    color: "#8b7b7f",
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

  bannerPreview: {
    position: "relative",
    minHeight: 420,
    overflow: "hidden",
    background: "#efe1cd",
  },

  previewImage: {
    width: "100%",
    height: 420,
    objectFit: "cover",
    display: "block",
  },

  imagePlaceholder: {
    display: "grid",
    height: 420,
    placeItems: "center",
    padding: 20,
    color: "#8c7a7f",
    textAlign: "center",
    background:
      "linear-gradient(180deg,#f3e4d2,#ead5bc)",
  },

  overlay: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    display: "grid",
    gap: 7,
    padding: 14,
    borderRadius: 14,
    background:
      "rgba(255,250,244,.88)",
    backdropFilter: "blur(8px)",
  },

  previewCta: {
    justifySelf: "start",
    border: 0,
    borderRadius: 999,
    padding: "9px 13px",
    background: "#8c2940",
    color: "#fff",
    fontWeight: 900,
  },

  previewEmpty: {
    display: "grid",
    minHeight: 420,
    placeItems: "center",
    color: "#8c7a7f",
  },

  phoneBody: {
    display: "grid",
    gap: 10,
    padding: 20,
    background: "#fff",
  },
};
