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
  SiteStudioConfig,
  SiteStudioPreviewPatch,
  SiteStudioRankingItem,
} from "../../../lib/site-studio-types";
import styles from "./site-content-studio-editor.module.css";

type StorefrontProductOption = {
  id: number;
  name: string;
  cardName?: string;
};

type RankingStudioEditorProps = {
  rank: number;
  onDraftChange?: (
    patch: SiteStudioPreviewPatch
  ) => void;
  onSaved?: (
    config: SiteStudioConfig
  ) => void;
};

function getUploadedImageUrl(
  payload: unknown
) {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return "";
  }

  const record =
    payload as Record<string, unknown>;

  for (const value of [
    record.url,
    record.publicUrl,
    record.imageUrl,
  ]) {
    if (
      typeof value === "string" &&
      value
    ) {
      return value;
    }
  }

  if (
    record.file &&
    typeof record.file === "object"
  ) {
    const file =
      record.file as Record<string, unknown>;

    for (const value of [
      file.publicUrl,
      file.url,
    ]) {
      if (
        typeof value === "string" &&
        value
      ) {
        return value;
      }
    }
  }

  return "";
}

export default function RankingStudioEditor({
  rank,
  onDraftChange,
  onSaved,
}: RankingStudioEditorProps) {
  const [original, setOriginal] =
    useState<SiteStudioRankingItem | null>(
      null
    );
  const [draft, setDraft] =
    useState<SiteStudioRankingItem | null>(
      null
    );
  const [products, setProducts] =
    useState<StorefrontProductOption[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [uploading, setUploading] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setError("");

      try {
        const [
          configResponse,
          productsResponse,
        ] = await Promise.all([
          fetch(
            "/api/admin/site-studio",
            { cache: "no-store" }
          ),
          fetch(
            "/api/storefront/products",
            { cache: "no-store" }
          ),
        ]);

        const configPayload =
          await readJsonResponse<{
            config?: SiteStudioConfig;
            error?: string;
          }>(
            configResponse,
            "排行榜讀取失敗"
          );

        const productsPayload =
          await readJsonResponse<{
            products?: StorefrontProductOption[];
            error?: string;
          }>(
            productsResponse,
            "商品清單讀取失敗"
          );

        if (
          !configResponse.ok ||
          !configPayload.config
        ) {
          throw new Error(
            configPayload.error ||
              "排行榜讀取失敗"
          );
        }

        const item =
          configPayload.config.rankings.find(
            (candidate) =>
              candidate.rank === rank
          );

        if (!item) {
          throw new Error(
            `找不到排行榜第 ${rank} 名`
          );
        }

        if (cancelled) return;

        const normalizedItem = {
          ...item,
          action: "detail" as const,
          buttonLabel: "",
        };

        setOriginal(normalizedItem);
        setDraft(normalizedItem);
        setProducts(
          Array.isArray(
            productsPayload.products
          )
            ? productsPayload.products
            : []
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "排行榜讀取失敗"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [rank]);

  useEffect(() => {
    if (draft) {
      onDraftChange?.({
        ranking: {
          ...draft,
          action: "detail",
          buttonLabel: "",
        },
      });
    }
  }, [draft, onDraftChange]);

  const hasChanges = useMemo(
    () =>
      Boolean(
        original &&
          draft &&
          JSON.stringify(original) !==
            JSON.stringify(draft)
      ),
    [draft, original]
  );

  function update<
    K extends keyof SiteStudioRankingItem,
  >(
    field: K,
    value: SiteStudioRankingItem[K]
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

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/product-images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const payload =
        await readJsonResponse<
          Record<string, unknown> & {
            error?: string;
          }
        >(
          response,
          "排行榜圖片上傳失敗"
        );

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "排行榜圖片上傳失敗"
        );
      }

      const imageUrl =
        getUploadedImageUrl(payload);

      if (!imageUrl) {
        throw new Error(
          "圖片已上傳，但沒有取得網址"
        );
      }

      update("image", imageUrl);
      setMessage(
        "新圖片已上傳，請按儲存排行榜。"
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "排行榜圖片上傳失敗"
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!draft) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const rankingToSave = {
        ...draft,
        action: "detail" as const,
        buttonLabel: "",
      };

      const response = await fetch(
        "/api/admin/site-studio",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            kind: "ranking",
            ranking: rankingToSave,
          }),
        }
      );

      const payload =
        await readJsonResponse<{
          config?: SiteStudioConfig;
          message?: string;
          error?: string;
        }>(
          response,
          "排行榜儲存失敗"
        );

      if (
        !response.ok ||
        !payload.config
      ) {
        throw new Error(
          payload.error ||
            "排行榜儲存失敗"
        );
      }

      const saved =
        payload.config.rankings.find(
          (item) => item.rank === rank
        );

      if (!saved) {
        throw new Error(
          "排行榜儲存後找不到資料"
        );
      }

      const normalizedSaved = {
        ...saved,
        action: "detail" as const,
        buttonLabel: "",
      };

      setOriginal(normalizedSaved);
      setDraft(normalizedSaved);
      setMessage(
        payload.message ||
          "排行榜已儲存"
      );
      onSaved?.(payload.config);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "排行榜儲存失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>正在讀取排行榜</strong>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.stateCard}>
        <strong>無法開啟排行榜</strong>
        <p>{error}</p>
      </div>
    );
  }

  const selectedProduct =
    products.find(
      (product) =>
        product.id ===
        draft.actionProductId
    );

  return (
    <form
      className={styles.form}
      onSubmit={save}
    >
      <div className={styles.topLine}>
        <div>
          <span>熱銷排行榜</span>
          <h2>TOP {rank}</h2>
          <small>
            整張排行榜卡片點擊後，
            直接開啟指定商品詳情。
          </small>
        </div>

        <span
          className={`${styles.syncBadge} ${
            hasChanges
              ? styles.unsavedBadge
              : ""
          }`}
        >
          {hasChanges
            ? "尚未儲存"
            : "已同步"}
        </span>
      </div>

      <section className={styles.section}>
        <div
          className={styles.sectionHeading}
        >
          <div>
            <h3>排行榜圖片</h3>
            <p>
              建議尺寸：
              {draft.imageSpec}
            </p>
          </div>
        </div>

        <div className={styles.imageArea}>
          <div
            className={`${styles.imagePreview} ${
              draft.layout === "portrait"
                ? styles.portrait
                : styles.wide
            }`}
          >
            {draft.image ? (
              <img
                src={draft.image}
                alt={draft.title}
              />
            ) : (
              <span>
                尚未設定圖片
              </span>
            )}
          </div>

          <div
            className={styles.imageControls}
          >
            <label
              className={styles.uploadButton}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadImage}
                disabled={
                  uploading || saving
                }
              />
              {uploading
                ? "圖片上傳中…"
                : "更換排行榜圖片"}
            </label>

            <label
              className={styles.field}
            >
              <span>圖片網址</span>
              <input
                value={draft.image}
                onChange={(event) =>
                  update(
                    "image",
                    event.target.value
                  )
                }
              />
            </label>

            <div
              className={styles.metaBox}
            >
              TOP {rank} 版型：
              {draft.layout}；
              建議圖片：
              {draft.imageSpec}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div
          className={styles.sectionHeading}
        >
          <div>
            <h3>指定商品</h3>
            <p>
              顧客點整張 TOP 卡片後，
              直接進入這個商品的詳情。
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span>指定商品</span>
          <select
            value={draft.actionProductId}
            onChange={(event) => {
              const productId = Number(
                event.target.value
              );

              update(
                "actionProductId",
                productId
              );
              update(
                "displayProductId",
                productId
              );
            }}
          >
            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                #{product.id}{" "}
                {product.cardName ||
                  product.name}
              </option>
            ))}
          </select>
        </label>

        <label
          className={styles.toggleRow}
        >
          <span>顯示此排名</span>
          <input
            type="checkbox"
            checked={draft.visible}
            onChange={(event) =>
              update(
                "visible",
                event.target.checked
              )
            }
          />
        </label>

        <div className={styles.noteBox}>
          目前指定：
          {selectedProduct
            ? selectedProduct.cardName ||
              selectedProduct.name
            : `商品 #${draft.actionProductId}`}
        </div>
      </section>

      <section className={styles.section}>
        <div
          className={styles.sectionHeading}
        >
          <div>
            <h3>排行榜文字</h3>
            <p>
              不再顯示「查看商品／開始選配」按鈕文字。
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span>標題</span>
          <input
            value={draft.title}
            onChange={(event) =>
              update(
                "title",
                event.target.value
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>副標題</span>
          <input
            value={draft.subtitle}
            onChange={(event) =>
              update(
                "subtitle",
                event.target.value
              )
            }
          />
        </label>

        <div className={styles.twoColumns}>
          <label className={styles.field}>
            <span>價格文字</span>
            <input
              value={draft.priceLine}
              onChange={(event) =>
                update(
                  "priceLine",
                  event.target.value
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>優惠文字</span>
            <input
              value={draft.promoLine}
              onChange={(event) =>
                update(
                  "promoLine",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      {error ? (
        <p className={styles.errorMessage}>
          {error}
        </p>
      ) : null}

      {message ? (
        <p className={styles.successMessage}>
          ✓ {message}
        </p>
      ) : null}

      <div
        className={styles.stickyActions}
      >
        <span>
          右側即時預覽；按儲存後才會正式寫入。
        </span>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={
            saving ||
            uploading ||
            !hasChanges
          }
        >
          {saving
            ? "儲存中…"
            : `儲存 TOP ${rank}`}
        </button>
      </div>
    </form>
  );
}
