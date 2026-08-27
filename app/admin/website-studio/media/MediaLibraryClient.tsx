"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  MediaAsset,
} from "../../../../lib/cms/modules/media/types";

type LibraryView =
  | "library"
  | "trash";

type MediaUsageReference = {
  kind:
    | "product"
    | "bundle"
    | "site-studio";
  label: string;
};

type MediaUsageResult = {
  mediaId: number;
  mediaUrl: string;
  inUse: boolean;
  references:
    MediaUsageReference[];
};

function bytesLabel(
  value: number
) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function publishStatusLabel(
  status:
    | MediaAsset["publishStatus"]
    | undefined
) {
  switch (status) {
    case "pending":
      return "🟡 等待發布";

    case "processing":
      return "🔵 發布中";

    case "published":
      return "🟢 已發布";

    case "failed":
      return "🔴 發布失敗";

    default:
      return "⚪ 尚未發布";
  }
}

export default function MediaLibraryClient({
  initialAssets,
}: {
  initialAssets: MediaAsset[];
}) {
  const [assets, setAssets] =
    useState(initialAssets);

  const [
    trashAssets,
    setTrashAssets,
  ] = useState<MediaAsset[]>([]);

  const [view, setView] =
    useState<LibraryView>(
      "library"
    );

  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(
      initialAssets[0]?.id ?? null
    );

  const [message, setMessage] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [archiving, setArchiving] =
    useState(false);

  const [restoring, setRestoring] =
    useState(false);

  const [
    cleanupQueuing,
    setCleanupQueuing,
  ] = useState(false);

  const [
    usage,
    setUsage,
  ] =
    useState<MediaUsageResult | null>(
      null
    );

  const [
    usageLoading,
    setUsageLoading,
  ] = useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
    void refresh("trash");
  }, []);

  useEffect(() => {
    if (
      view !== "trash" ||
      !selectedId
    ) {
      setUsage(null);
      setUsageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUsage() {
      setUsageLoading(true);
      setUsage(null);

      try {
        const response =
          await fetch(
            `/api/studio/media/${selectedId}/usage`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          cancelled
        ) {
          return;
        }

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ||
              "無法檢查圖片使用狀態。"
          );
        }

        setUsage(
          data as
            MediaUsageResult
        );
      } catch (error) {
        if (
          cancelled
        ) {
          return;
        }

        setUsage(null);

        setMessage(
          error instanceof Error
            ? error.message
            : "無法檢查圖片使用狀態。"
        );
      } finally {
        if (
          !cancelled
        ) {
          setUsageLoading(
            false
          );
        }
      }
    }

    void loadUsage();

    return () => {
      cancelled = true;
    };
  }, [
    view,
    selectedId,
  ]);

  const currentAssets =
    view === "trash"
      ? trashAssets
      : assets;

  const filtered =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLocaleLowerCase(
            "zh-TW"
          );

      if (!needle) {
        return currentAssets;
      }

      return currentAssets.filter(
        (asset) =>
          [
            asset.title,
            asset.originalName,
          ]
            .join(" ")
            .toLocaleLowerCase(
              "zh-TW"
            )
            .includes(needle)
      );
    }, [
      currentAssets,
      search,
    ]);

  const selected =
    currentAssets.find(
      (asset) =>
        asset.id === selectedId
    ) ?? null;

  async function refresh(
    target:
      LibraryView = "library"
  ) {
    const url =
      target === "trash"
        ? "/api/studio/media?status=trash&limit=200"
        : "/api/studio/media?limit=200";

    const response =
      await fetch(
        url,
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return [] as MediaAsset[];
    }

    const data =
      await response.json();

    const next =
      Array.isArray(data.assets)
        ? data.assets
        : [];

    if (target === "trash") {
      setTrashAssets(next);
    } else {
      setAssets(next);
    }

    return next as MediaAsset[];
  }

  async function changeView(
    nextView: LibraryView
  ) {
    if (nextView === view) {
      return;
    }

    setView(nextView);
    setSearch("");
    setMessage("");

    const next =
      await refresh(nextView);

    setSelectedId(
      next[0]?.id ?? null
    );
  }

  async function upload(
    event: React.FormEvent<
      HTMLFormElement
    >
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setUploading(true);
    setMessage("圖片上傳中…");

    try {
      const response =
        await fetch(
          "/api/studio/media",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "圖片上傳失敗。"
        );
      }

      form.reset();

      await refresh();

      setSelectedId(
        Number(data.id)
      );

      setMessage(
        "圖片已加入 Media Library。"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "圖片上傳失敗。"
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveMetadata(
    event: React.FormEvent<
      HTMLFormElement
    >
  ) {
    event.preventDefault();

    if (!selected) return;

    const formData =
      new FormData(
        event.currentTarget
      );

    const response =
      await fetch(
        `/api/studio/media/${selected.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title:
              String(
                formData.get(
                  "title"
                ) || ""
              ),
            altText:
              String(
                formData.get(
                  "altText"
                ) || ""
              ),
            tags:
              String(
                formData.get(
                  "tags"
                ) || ""
              )
                .split(",")
                .map(
                  (value) =>
                    value.trim()
                )
                .filter(Boolean),
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      setMessage(
        data.error ||
          "儲存失敗。"
      );
      return;
    }

    await refresh();

    setMessage(
      "圖片資料已儲存。"
    );
  }

  async function queuePublish() {
    if (!selected) return;

    const ok =
      window.confirm(
        `確定要將「${selected.originalName}」加入發布佇列嗎？`
      );

    if (!ok) return;

    setMessage(
      "正在加入發布佇列…"
    );

    const response =
      await fetch(
        `/api/studio/media/${selected.id}/publish`,
        {
          method: "POST",
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      setMessage(
        data.error ||
          "加入發布佇列失敗。"
      );
      return;
    }

    await refresh();

    setMessage(
      data.message ||
        "已加入發布佇列。"
    );
  }

  async function archiveSelected() {
    if (
      !selected ||
      archiving
    ) {
      return;
    }

    const ok =
      window.confirm(
        `確定要將「${selected.title || selected.originalName}」從 Media Library 移除嗎？\n\n圖片會從 Media Library 隱藏，但既有商品、TOP 或首頁若仍使用這張圖片，會繼續正常顯示。`
      );

    if (!ok) {
      return;
    }

    setArchiving(true);
    setMessage(
      "正在從 Media Library 移除…"
    );

    try {
      const response =
        await fetch(
          `/api/studio/media/${selected.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "移除圖片失敗。"
        );
      }

      const remaining =
        assets.filter(
          (asset) =>
            asset.id !==
            selected.id
        );

      setAssets(remaining);

      setTrashAssets(
        (current) => [
          selected,
          ...current.filter(
            (asset) =>
              asset.id !==
              selected.id
          ),
        ]
      );

      setSelectedId(
        remaining[0]?.id ??
          null
      );

      setMessage(
        "圖片已從 Media Library 移除。既有網站引用仍會保留。"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "移除圖片失敗。"
      );
    } finally {
      setArchiving(false);
    }
  }

  async function restoreSelected() {
    if (
      !selected ||
      view !== "trash" ||
      restoring
    ) {
      return;
    }

    const ok =
      window.confirm(
        `確定要將「${selected.title || selected.originalName}」還原到 Media Library 嗎？`
      );

    if (!ok) {
      return;
    }

    setRestoring(true);
    setMessage(
      "正在還原圖片…"
    );

    try {
      const response =
        await fetch(
          `/api/studio/media/${selected.id}/restore`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "還原圖片失敗。"
        );
      }

      const remaining =
        trashAssets.filter(
          (asset) =>
            asset.id !==
            selected.id
        );

      setTrashAssets(
        remaining
      );

      setAssets(
        (current) => [
          selected,
          ...current.filter(
            (asset) =>
              asset.id !==
              selected.id
          ),
        ]
      );

      setSelectedId(
        remaining[0]?.id ??
          null
      );

      setMessage(
        "圖片已還原到 Media Library。"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "還原圖片失敗。"
      );
    } finally {
      setRestoring(false);
    }
  }

  async function queuePermanentCleanup() {
    if (
      !selected ||
      view !== "trash" ||
      cleanupQueuing
    ) {
      return;
    }

    if (
      !usage ||
      usage.inUse
    ) {
      setMessage(
        "此圖片仍被網站使用，不能永久刪除。"
      );
      return;
    }

    const ok =
      window.confirm(
        `確定要永久刪除「${selected.title || selected.originalName}」嗎？\n\n此動作之後會刪除 NAS 原始檔與 Media 資料，無法從回收桶還原。\n\n目前先加入公司電腦永久清理佇列。`
      );

    if (!ok) {
      return;
    }

    setCleanupQueuing(true);
    setMessage(
      "正在建立永久清理工作…"
    );

    try {
      const response =
        await fetch(
          `/api/studio/media/${selected.id}/cleanup`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (data.usage) {
          setUsage(
            data.usage as
              MediaUsageResult
          );
        }

        throw new Error(
          data.error ||
            "建立永久清理工作失敗。"
        );
      }

      setMessage(
        data.message ||
          "已加入永久清理佇列。"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "建立永久清理工作失敗。"
      );
    } finally {
      setCleanupQueuing(false);
    }
  }

  return (
    <div style={styles.pageGrid}>
      <section style={styles.main}>
        <div style={styles.toolbar}>
          <div>
            <span style={styles.eyebrow}>
              MEDIA ASSETS
            </span>

            <h2 style={styles.title}>
              圖片資產
            </h2>
          </div>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="搜尋圖片名稱"
            style={styles.search}
          />
        </div>

        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() =>
              void changeView(
                "library"
              )
            }
            style={{
              ...styles.tabButton,
              ...(view === "library"
                ? styles.tabButtonActive
                : {}),
            }}
          >
            圖片庫
            {" "}
            {assets.length}
          </button>

          <button
            type="button"
            onClick={() =>
              void changeView(
                "trash"
              )
            }
            style={{
              ...styles.tabButton,
              ...(view === "trash"
                ? styles.tabButtonActive
                : {}),
            }}
          >
            回收桶
            {" "}
            {trashAssets.length}
          </button>
        </div>

        <form
          onSubmit={upload}
          style={{
            ...styles.uploadBox,
            display:
              view === "library"
                ? "grid"
                : "none",
          }}
        >
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
          />

          <input
            name="title"
            placeholder="圖片名稱（可選）"
            style={styles.input}
          />

          <input
            name="altText"
            placeholder="Alt 圖片說明"
            style={styles.input}
          />

          <input
            name="tags"
            placeholder="標籤，例如：banner, 商品, 首頁"
            style={styles.input}
          />

          <button
            type="submit"
            disabled={uploading}
            style={styles.primaryButton}
          >
            {uploading
              ? "上傳中…"
              : "上傳圖片"}
          </button>
        </form>

        <div style={styles.summary}>
          <span>
            {filtered.length} 張圖片
          </span>

          <strong>
            {message}
          </strong>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            Media Library 目前沒有符合條件的圖片。
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(
              (asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() =>
                    setSelectedId(
                      asset.id
                    )
                  }
                  style={{
                    ...styles.card,
                    ...(selectedId ===
                    asset.id
                      ? styles.cardActive
                      : {}),
                  }}
                >
                  <img
                    src={asset.fileUrl}
                    alt={
                      asset.altText ||
                      asset.title
                    }
                    style={styles.image}
                  />

                  <span style={styles.cardBody}>
                    <strong>
                      {asset.title}
                    </strong>

                    <small>
                      {bytesLabel(
                        asset.byteSize
                      )}
                    </small>

                    <small
                      style={
                        styles.publishBadge
                      }
                    >
                      {publishStatusLabel(
                        asset.publishStatus
                      )}
                    </small>
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </section>

      <aside style={styles.inspector}>
        <div style={styles.inspectorHeader}>
          <strong>
            圖片資料
          </strong>
        </div>

        {!selected ? (
          <div style={styles.emptyInspector}>
            請選擇一張圖片。
          </div>
        ) : (
          <>
            <form
              key={selected.id}
              onSubmit={
                view === "library"
                  ? saveMetadata
                  : (event) =>
                      event.preventDefault()
              }
              style={styles.form}
            >
              <div
                style={
                  styles.publishPanel
                }
              >
                <strong>
                  發布狀態
                </strong>

                <span
                  style={
                    styles.publishStatus
                  }
                >
                  {publishStatusLabel(
                    selected.publishStatus
                  )}
                </span>

                {hydrated &&
                selected.publishRequestedAt ? (
                  <small>
                    申請發布：
                    {" "}
                    {new Date(
                      selected.publishRequestedAt
                    ).toLocaleString(
                      "zh-TW"
                    )}
                  </small>
                ) : null}

                {hydrated &&
                selected.publishFinishedAt ? (
                  <small>
                    最後完成：
                    {" "}
                    {new Date(
                      selected.publishFinishedAt
                    ).toLocaleString(
                      "zh-TW"
                    )}
                  </small>
                ) : null}

                {selected.publishedCommit ? (
                  <small>
                    Git Commit：
                    {" "}
                    {selected.publishedCommit}
                  </small>
                ) : null}

                {selected.publishError ? (
                  <small
                    style={
                      styles.errorText
                    }
                  >
                    發布錯誤：
                    {" "}
                    {selected.publishError}
                  </small>
                ) : null}
              </div>

              <label style={styles.field}>
                <span>名稱</span>

                <input
                  name="title"
                  defaultValue={
                    selected.title
                  }
                  style={styles.input}
                />
              </label>

              <input
                type="hidden"
                name="altText"
                value={
                  selected.altText
                }
                readOnly
              />

              <input
                type="hidden"
                name="tags"
                value={
                  selected.tags.join(
                    ", "
                  )
                }
                readOnly
              />

              {view === "library" ? (
                <>
                  <button
                    type="submit"
                    style={
                      styles.primaryButton
                    }
                  >
                    儲存圖片資料
                  </button>

                  <button
                    type="button"
                    onClick={
                      queuePublish
                    }
                    style={
                      styles.primaryButton
                    }
                  >
                    加入發布佇列
                  </button>

                  <div
                    style={
                      styles.dangerZone
                    }
                  >
                    <strong>
                      圖片清理
                    </strong>

                    <small>
                      移除後會進入回收桶。
                      已經被商品、TOP
                      或首頁使用的圖片
                      仍會保留顯示。
                    </small>

                    <button
                      type="button"
                      onClick={
                        archiveSelected
                      }
                      disabled={
                        archiving
                      }
                      style={
                        styles.dangerButton
                      }
                    >
                      {archiving
                        ? "移除中…"
                        : "移到回收桶"}
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={
                    styles.restoreZone
                  }
                >
                  <strong>
                    回收桶
                  </strong>

                  <small>
                    這張圖片目前已從
                    Media Library 移除。
                  </small>

                  <div
                    style={
                      styles.usagePanel
                    }
                  >
                    <strong>
                      圖片使用狀態
                    </strong>

                    {usageLoading ? (
                      <small>
                        正在檢查網站引用…
                      </small>
                    ) : usage?.inUse ? (
                      <>
                        <span
                          style={
                            styles.usageLocked
                          }
                        >
                          🔒 使用中
                        </span>

                        <small>
                          此圖片仍被網站引用，
                          目前不可永久刪除。
                        </small>

                        <div
                          style={
                            styles.usageList
                          }
                        >
                          {usage.references.map(
                            (
                              reference,
                              index
                            ) => (
                              <span
                                key={
                                  `${reference.kind}-${reference.label}-${index}`
                                }
                              >
                                •{" "}
                                {
                                  reference.label
                                }
                              </span>
                            )
                          )}
                        </div>
                      </>
                    ) : usage ? (
                      <>
                        <span
                          style={
                            styles.usageSafe
                          }
                        >
                          ⚪ 未使用
                        </span>

                        <small>
                          目前沒有找到商品、
                          組合優惠或
                          Website Studio
                          的圖片引用。
                        </small>
                      </>
                    ) : (
                      <small>
                        尚未取得使用狀態。
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      restoreSelected
                    }
                    disabled={
                      restoring
                    }
                    style={
                      styles.restoreButton
                    }
                  >
                    {restoring
                      ? "還原中…"
                      : "還原到 Media Library"}
                  </button>

                  {!usageLoading &&
                  usage &&
                  !usage.inUse ? (
                    <>
                      <small
                        style={
                          styles.safeDeleteHint
                        }
                      >
                        ✓ 此圖片已通過使用中檢查，
                        可以加入永久清理佇列。
                      </small>

                      <div
                        style={
                          styles.permanentDeleteZone
                        }
                      >
                        <strong>
                          永久清理
                        </strong>

                        <small>
                          執行前後端會再次檢查
                          圖片是否仍被網站使用。
                        </small>

                        <button
                          type="button"
                          onClick={
                            queuePermanentCleanup
                          }
                          disabled={
                            cleanupQueuing
                          }
                          style={
                            styles.permanentDeleteButton
                          }
                        >
                          {cleanupQueuing
                            ? "加入佇列中…"
                            : "永久刪除此圖片"}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </form>
          </>
        )}
      </aside>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  pageGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,1fr) 340px",
    gap: 18,
    alignItems: "start",
  },

  main: {
    display: "grid",
    gap: 16,
    minWidth: 0,
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "end",
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  title: {
    margin: "4px 0 0",
  },

  search: {
    width: 300,
    maxWidth: "45%",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 999,
    padding: "10px 14px",
    background: "#fff",
  },

  uploadBox: {
    display: "grid",
    gridTemplateColumns:
      "minmax(190px,1.2fr) repeat(3,minmax(140px,1fr)) auto",
    gap: 8,
    padding: 12,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 16,
    background: "#fffafb",
  },

  input: {
    minWidth: 0,
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

  primaryButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 14px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  dangerZone: {
    display: "grid",
    gap: 8,
    marginTop: 8,
    padding: 12,
    border:
      "1px solid rgba(180,35,24,.16)",
    borderRadius: 12,
    background:
      "rgba(180,35,24,.035)",
    color: "#7a3029",
    lineHeight: 1.5,
  },

  dangerButton: {
    border:
      "1px solid rgba(180,35,24,.28)",
    borderRadius: 999,
    padding: "10px 14px",
    background: "#fff",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 900,
  },

  summary: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#796a6e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: 12,
  },

  card: {
    overflow: "hidden",
    padding: 0,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },

  cardActive: {
    border:
      "2px solid #8c2940",
  },

  image: {
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    background: "#f4efec",
  },

  cardBody: {
    display: "grid",
    gap: 4,
    padding: 10,
  },

  publishBadge: {
    display: "inline-block",
    marginTop: 4,
    fontSize: 11,
    fontWeight: 800,
  },

  inspector: {
    position: "sticky",
    top: 18,
    overflow: "hidden",
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 18,
    background: "#fff",
  },

  inspectorHeader: {
    padding: 14,
    borderBottom:
      "1px solid rgba(140,41,64,.08)",
  },

  previewImage: {
    display: "block",
    width: "100%",
    maxHeight: 360,
    objectFit: "contain",
    background: "#f7f0ea",
  },

  form: {
    display: "grid",
    gap: 12,
    padding: 14,
  },

  publishPanel: {
    display: "grid",
    gap: 6,
    padding: 12,
    border:
      "1px solid rgba(140,41,64,.10)",
    borderRadius: 12,
    background: "#fffafb",
  },

  publishStatus: {
    fontWeight: 900,
    fontSize: 14,
  },

  errorText: {
    color: "#b42318",
    lineHeight: 1.5,
  },

  field: {
    display: "grid",
    gap: 6,
    fontWeight: 800,
    fontSize: 12,
  },

  meta: {
    display: "grid",
    gap: 4,
    color: "#7d6e72",
    fontSize: 12,
  },

  empty: {
    padding: 28,
    border:
      "1px dashed rgba(140,41,64,.18)",
    borderRadius: 16,
    color: "#796a6e",
    textAlign: "center",
  },

  emptyInspector: {
    padding: 24,
    color: "#796a6e",
  },

  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 14,
  },

  tabButton: {
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 999,
    padding: "9px 15px",
    background: "#fff",
    color: "#796a6e",
    cursor: "pointer",
    fontWeight: 900,
  },

  tabButtonActive: {
    border: "1px solid #8c2940",
    background: "#8c2940",
    color: "#fff",
  },

  restoreZone: {
    display: "grid",
    gap: 8,
    marginTop: 8,
    padding: 12,
    border:
      "1px solid rgba(47,111,78,.18)",
    borderRadius: 12,
    background:
      "rgba(47,111,78,.04)",
    color: "#315d45",
    lineHeight: 1.5,
  },

  restoreButton: {
    border:
      "1px solid rgba(47,111,78,.25)",
    borderRadius: 999,
    padding: "10px 14px",
    background: "#fff",
    color: "#315d45",
    cursor: "pointer",
    fontWeight: 900,
  },

  usagePanel: {
    display: "grid",
    gap: 7,
    padding: 11,
    border:
      "1px solid rgba(61,45,49,.10)",
    borderRadius: 10,
    background: "#fff",
  },

  usageLocked: {
    color: "#b42318",
    fontWeight: 900,
  },

  usageSafe: {
    color: "#315d45",
    fontWeight: 900,
  },

  usageList: {
    display: "grid",
    gap: 4,
    padding: "4px 0",
    color: "#6f5e63",
    fontSize: 12,
    lineHeight: 1.5,
  },

  safeDeleteHint: {
    color: "#315d45",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  permanentDeleteZone: {
    display: "grid",
    gap: 8,
    marginTop: 4,
    padding: 11,
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 10,
    background:
      "rgba(180,35,24,.035)",
    color: "#7a3029",
    lineHeight: 1.5,
  },

  permanentDeleteButton: {
    border:
      "1px solid rgba(180,35,24,.32)",
    borderRadius: 999,
    padding: "10px 14px",
    background: "#fff",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 900,
  },
};
