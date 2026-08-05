"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { readJsonResponse } from "../../../lib/http-json";
import type {
  HeroSlot,
  SiteStudioConfig,
  SiteStudioHero,
  SiteStudioPreviewPatch,
} from "../../../lib/site-studio-types";
import styles from "./site-content-studio-editor.module.css";

type HeroStudioEditorProps = {
  slot: HeroSlot;
  onDraftChange?: (patch: SiteStudioPreviewPatch) => void;
  onSaved?: (config: SiteStudioConfig) => void;
};

type ImageMeta = {
  width: number;
  height: number;
  size: number;
  format: string;
};

function getUploadedImageUrl(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;

  for (const value of [record.url, record.publicUrl, record.imageUrl]) {
    if (typeof value === "string" && value) return value;
  }

  if (record.file && typeof record.file === "object") {
    const file = record.file as Record<string, unknown>;

    for (const value of [file.publicUrl, file.url]) {
      if (typeof value === "string" && value) return value;
    }
  }

  return "";
}

function formatBytes(size: number) {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function HeroStudioEditor({
  slot,
  onDraftChange,
  onSaved,
}: HeroStudioEditorProps) {
  const [original, setOriginal] = useState<SiteStudioHero | null>(null);
  const [draft, setDraft] = useState<SiteStudioHero | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visualName = slot === "primary" ? "主視覺" : "副主視覺";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const response = await fetch("/api/admin/site-studio", {
          cache: "no-store",
        });
        const payload =
          await readJsonResponse<{
            config?: SiteStudioConfig;
            error?: string;
          }>(
            response,
            `${visualName}讀取失敗`
          );

        if (!response.ok || !payload.config) {
          throw new Error(payload.error || `${visualName}讀取失敗`);
        }

        if (cancelled) return;

        const hero =
          slot === "primary"
            ? payload.config.hero
            : payload.config.secondaryHero;

        setOriginal(hero);
        setDraft(hero);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : `${visualName}讀取失敗`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  useEffect(() => {
    if (!draft) return;

    onDraftChange?.(
      slot === "primary"
        ? { hero: draft }
        : { secondaryHero: draft }
    );
  }, [draft, onDraftChange, slot]);

  useEffect(() => {
    if (!draft?.image) {
      setImageMeta(null);
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.onload = async () => {
      let size = 0;
      let format = draft.image.split(".").pop()?.split("?")[0]?.toUpperCase() || "—";

      try {
        const response = await fetch(draft.image, { cache: "no-store" });
        const blob = await response.blob();
        size = blob.size;
        format = blob.type.split("/")[1]?.toUpperCase() || format;
      } catch {
        // 圖片尺寸仍可顯示，檔案容量讀不到時保留 0。
      }

      if (!cancelled) {
        setImageMeta({
          width: image.naturalWidth,
          height: image.naturalHeight,
          size,
          format,
        });
      }
    };

    image.onerror = () => {
      if (!cancelled) setImageMeta(null);
    };

    image.src = draft.image;

    return () => {
      cancelled = true;
    };
  }, [draft?.image]);

  const hasChanges = useMemo(
    () => Boolean(original && draft && JSON.stringify(original) !== JSON.stringify(draft)),
    [draft, original]
  );

  function update<K extends keyof SiteStudioHero>(
    field: K,
    value: SiteStudioHero[K]
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
    setMessage("");
    setError("");
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/product-images/upload", {
        method: "POST",
        body: formData,
      });
      const payload =
        await readJsonResponse<
          Record<string, unknown> & {
            error?: string;
          }
        >(
          response,
          "圖片上傳失敗"
        );

      if (!response.ok) {
        throw new Error(payload.error || "圖片上傳失敗");
      }

      const imageUrl = getUploadedImageUrl(payload);
      if (!imageUrl) throw new Error("圖片已上傳，但沒有取得網址");

      update("image", imageUrl);
      update("desktopImage", imageUrl);
      setMessage("新圖片已上傳，請按儲存。右側目前為即時預覽。");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "圖片上傳失敗"
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/site-studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "hero",
          slot,
          hero: draft,
        }),
      });
      const payload =
        await readJsonResponse<{
          config?: SiteStudioConfig;
          message?: string;
          error?: string;
        }>(
          response,
          `${visualName}儲存失敗`
        );

      if (!response.ok || !payload.config) {
        throw new Error(payload.error || `${visualName}儲存失敗`);
      }

      const saved =
        slot === "primary"
          ? payload.config.hero
          : payload.config.secondaryHero;

      setOriginal(saved);
      setDraft(saved);
      setMessage(payload.message || `${visualName}已儲存`);
      onSaved?.(payload.config);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : `${visualName}儲存失敗`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>正在讀取{visualName}</strong>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.stateCard}>
        <strong>無法開啟{visualName}</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={save}>
      <div className={styles.topLine}>
        <div>
          <span>{slot === "primary" ? "首頁主視覺" : "首頁副主視覺"}</span>
          <h2>{draft.label}</h2>
          <small>左側修改時，右側手機預覽會立即同步。</small>
        </div>

        <span
          className={`${styles.syncBadge} ${
            hasChanges ? styles.unsavedBadge : ""
          }`}
        >
          {hasChanges ? "尚未儲存" : "已同步"}
        </span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>視覺圖片</h3>
            <p>建議尺寸：{draft.imageSpec}</p>
          </div>
        </div>

        <div className={styles.imageArea}>
          <div className={`${styles.imagePreview} ${styles.portrait}`}>
            {draft.image ? <img src={draft.image} alt={draft.alt} /> : <span>尚未設定圖片</span>}
          </div>

          <div className={styles.imageControls}>
            <label className={styles.uploadButton}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadImage}
                disabled={uploading || saving}
              />
              {uploading ? "圖片上傳中…" : "更換圖片"}
            </label>

            <label className={styles.field}>
              <span>圖片網址</span>
              <input
                value={draft.image}
                onChange={(event) => {
                 const imageUrl = event.target.value;

                setDraft((current) =>
                 current
                   ? {
                  ...current,
                  image: imageUrl,
                   desktopImage: imageUrl,
                  }
                  : current
                  );

                   setMessage("");
                   setError("");
                  }}
                disabled={saving}
              />
            </label>

            <div className={styles.metaGrid}>
              <div>
                <span>建議規格</span>
                <strong>{draft.imageSpec}</strong>
              </div>
              <div>
                <span>實際尺寸</span>
                <strong>
                  {imageMeta ? `${imageMeta.width} × ${imageMeta.height} px` : "讀取中／無法讀取"}
                </strong>
              </div>
              <div>
                <span>圖片格式</span>
                <strong>{imageMeta?.format || "—"}</strong>
              </div>
              <div>
                <span>檔案大小</span>
                <strong>{imageMeta ? formatBytes(imageMeta.size) : "—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>顯示與替代文字</h3>
            <p>標題與副標題留白時，首頁只顯示原始圖片。</p>
          </div>
        </div>

        <label className={styles.toggleRow}>
          <span>在首頁顯示</span>
          <input
            type="checkbox"
            checked={draft.visible}
            onChange={(event) => update("visible", event.target.checked)}
          />
        </label>

        <label className={styles.field}>
          <span>圖片替代文字</span>
          <input
            value={draft.alt}
            onChange={(event) => update("alt", event.target.value)}
          />
        </label>

        <div className={styles.twoColumns}>
          <label className={styles.field}>
            <span>圖片上方標題（可留白）</span>
            <input
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>副標題（可留白）</span>
            <input
              value={draft.subtitle}
              onChange={(event) => update("subtitle", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>點擊後前往</h3>
            <p>未設定時，{visualName}只展示圖片，不會跳轉。</p>
          </div>
        </div>

        <div className={styles.twoColumns}>
          <label className={styles.field}>
            <span>連結類型</span>
            <select
              value={draft.linkType}
              onChange={(event) =>
                update(
                  "linkType",
                  event.target.value as SiteStudioHero["linkType"]
                )
              }
            >
              <option value="none">不連結</option>
              <option value="product">商品 ID</option>
              <option value="category">分類名稱</option>
              <option value="url">指定網址</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>連結內容</span>
            <input
              value={draft.linkValue}
              onChange={(event) => update("linkValue", event.target.value)}
              placeholder="商品 ID、分類名稱或網址"
              disabled={draft.linkType === "none"}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>按鈕文字（圖片內已有文字可留白）</span>
          <input
            value={draft.buttonLabel}
            onChange={(event) => update("buttonLabel", event.target.value)}
          />
        </label>
      </section>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      {message ? <p className={styles.successMessage}>✓ {message}</p> : null}

      <div className={styles.stickyActions}>
        <span>右側是即時預覽，按儲存後才會正式寫入。</span>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={saving || uploading || !hasChanges}
        >
          {saving ? "儲存中…" : `儲存${visualName}`}
        </button>
      </div>
    </form>
  );
}
