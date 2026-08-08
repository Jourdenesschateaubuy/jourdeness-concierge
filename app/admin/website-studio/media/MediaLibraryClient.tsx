"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  MediaAsset,
} from "../../../../lib/cms/modules/media/types";

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

export default function MediaLibraryClient({
  initialAssets,
}: {
  initialAssets: MediaAsset[];
}) {
  const [assets, setAssets] =
    useState(initialAssets);
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

  const filtered =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLocaleLowerCase(
            "zh-TW"
          );

      if (!needle) {
        return assets;
      }

      return assets.filter(
        (asset) =>
          [
            asset.title,
            asset.originalName,
            asset.altText,
            asset.tags.join(" "),
          ]
            .join(" ")
            .toLocaleLowerCase(
              "zh-TW"
            )
            .includes(needle)
      );
    }, [assets, search]);

  const selected =
    assets.find(
      (asset) =>
        asset.id === selectedId
    ) ?? null;

  async function refresh() {
    const response =
      await fetch(
        "/api/studio/media?limit=200",
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    setAssets(
      Array.isArray(data.assets)
        ? data.assets
        : []
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
    setMessage("上傳中…");

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
            "圖片上傳失敗"
        );
      }

      form.reset();
      await refresh();

      setSelectedId(
        Number(data.id)
      );

      setMessage(
        "圖片已加入 Media Library"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "圖片上傳失敗"
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
          "儲存失敗"
      );
      return;
    }

    await refresh();
    setMessage(
      "媒體資訊已儲存"
    );
  }

  async function archive() {
    if (!selected) return;

    const ok =
      window.confirm(
        "要將這張圖片封存嗎？封存不會刪除硬碟上的原始檔案。"
      );

    if (!ok) return;

    const response =
      await fetch(
        `/api/studio/media/${selected.id}`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      setMessage(
        "封存失敗"
      );
      return;
    }

    setSelectedId(null);
    await refresh();
    setMessage(
      "圖片已封存"
    );
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
              圖片庫
            </h2>
          </div>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="搜尋名稱、Alt、標籤"
            style={styles.search}
          />
        </div>

        <form
          onSubmit={upload}
          style={styles.uploadBox}
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
            placeholder="Alt 文字（建議填寫）"
            style={styles.input}
          />

          <input
            name="tags"
            placeholder="標籤，例如：banner, 夏季, 首頁"
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
            {filtered.length} 個媒體
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
            媒體資訊
          </strong>
        </div>

        {!selected ? (
          <div style={styles.emptyInspector}>
            選擇一張圖片查看資訊
          </div>
        ) : (
          <>
            <img
              src={selected.fileUrl}
              alt={
                selected.altText ||
                selected.title
              }
              style={styles.previewImage}
            />

            <form
              key={selected.id}
              onSubmit={
                saveMetadata
              }
              style={styles.form}
            >
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

              <label style={styles.field}>
                <span>Alt</span>
                <textarea
                  name="altText"
                  rows={3}
                  defaultValue={
                    selected.altText
                  }
                  style={styles.textarea}
                />
              </label>

              <label style={styles.field}>
                <span>標籤</span>
                <input
                  name="tags"
                  defaultValue={
                    selected.tags.join(
                      ", "
                    )
                  }
                  style={styles.input}
                />
              </label>

              <div style={styles.meta}>
                <span>
                  原檔：
                  {selected.originalName}
                </span>

                <span>
                  類型：
                  {selected.mimeType}
                </span>

                <span>
                  大小：
                  {bytesLabel(
                    selected.byteSize
                  )}
                </span>
              </div>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                儲存媒體資訊
              </button>

              <button
                type="button"
                onClick={archive}
                style={styles.archiveButton}
              >
                封存圖片
              </button>
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

  archiveButton: {
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "9px 12px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 800,
  },

  empty: {
    display: "grid",
    minHeight: 260,
    placeItems: "center",
    border:
      "1px dashed rgba(140,41,64,.16)",
    borderRadius: 18,
    color: "#8a7c80",
  },

  emptyInspector: {
    display: "grid",
    minHeight: 260,
    placeItems: "center",
    color: "#8a7c80",
  },
};
