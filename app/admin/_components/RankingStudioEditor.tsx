"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { readJsonResponse } from "../../../lib/http-json";
import type {
  SiteStudioConfig,
  SiteStudioPreviewPatch,
  SiteStudioRankingItem,
} from "../../../lib/site-studio-types";
import styles from "./site-content-studio-editor.module.css";
import WebsiteMediaPicker from "../website-studio/components/MediaPicker";

type StorefrontProductOption = {
  id: number;
  name: string;
  cardName?: string;
};

type BundleOfferOption = {
  id: number;
  name: string;
  status?: string;
};

function bundleOfferStatusLabel(
  status?: string
) {
  if (status === "active") return "上架中";
  if (status === "inactive") return "下架";
  if (status === "coming_soon") return "新品預告";
  if (status === "sold_out") return "售罄";
  return status || "未設定";
}

type RankingStudioEditorProps = {
  rank: number;
  onDraftChange?: (
    patch: SiteStudioPreviewPatch
  ) => void;
  onSaved?: (
    config: SiteStudioConfig
  ) => void;
};

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
  const [bundleOffers, setBundleOffers] =
    useState<BundleOfferOption[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");
  const [
    mediaPickerOpen,
    setMediaPickerOpen,
  ] = useState(false);

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
    let cancelled = false;

    async function loadBundleOffers() {
      try {
        const response = await fetch(
          "/api/admin/bundle-offers",
          { cache: "no-store" }
        );

        const payload =
          await readJsonResponse<{
            bundleOffers?: BundleOfferOption[];
            error?: string;
          }>(
            response,
            "組合優惠清單讀取失敗"
          );

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "組合優惠清單讀取失敗"
          );
        }

        if (!cancelled) {
          setBundleOffers(
            Array.isArray(
              payload.bundleOffers
            )
              ? payload.bundleOffers
              : []
          );
        }
      } catch {
        if (!cancelled) {
          setBundleOffers([]);
        }
      }
    }

    void loadBundleOffers();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const targetType =
    draft.targetType === "bundle_offer"
      ? "bundle_offer"
      : "product";

  const targetId =
    Number.isInteger(draft.targetId) &&
    Number(draft.targetId) > 0
      ? Number(draft.targetId)
      : draft.actionProductId;

  const selectedProduct =
    targetType === "product"
      ? products.find(
          (product) =>
            product.id === targetId
        )
      : undefined;

  const selectedBundleOffer =
    targetType === "bundle_offer"
      ? bundleOffers.find(
          (offer) =>
            offer.id === targetId
        )
      : undefined;

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
            直接開啟指定的一般商品或組合優惠。
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
              className={styles.field}
            >
              <span>圖片網址</span>
              <input
                value={draft.image}
                placeholder="請從 Media Library 選擇圖片"
                onChange={(event) =>
                  update(
                    "image",
                    event.target.value
                  )
                }
              />
              <small>
                可直接輸入圖片網址，
                或從 Media Library 選擇。
              </small>
            </label>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setMediaPickerOpen(true)
                }
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: "10px 16px",
                  background: "#8c2940",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                從 Media Library 選擇
              </button>

              {draft.image ? (
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "image",
                      ""
                    )
                  }
                  style={{
                    border:
                      "1px solid rgba(140,41,64,.18)",
                    borderRadius: 999,
                    padding: "10px 16px",
                    background: "#fff",
                    color: "#8c2940",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  清除圖片
                </button>
              ) : null}
            </div>

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

        <WebsiteMediaPicker
          open={mediaPickerOpen}
          title={`選擇 TOP ${rank} 排行榜圖片`}
          onClose={() =>
            setMediaPickerOpen(false)
          }
          onSelect={(asset) => {
            update(
              "image",
              `/api/studio/media/${asset.id}/file`
            );
          }}
        />
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
          <span>連結類型</span>

          <select
            value={targetType}
            onChange={(event) => {
              const nextType =
                event.target.value ===
                "bundle_offer"
                  ? "bundle_offer"
                  : "product";

              setDraft((current) => {
                if (!current) return current;

                const nextTargetId =
                  nextType ===
                  "bundle_offer"
                    ? bundleOffers[0]?.id ??
                      current.targetId ??
                      current.actionProductId
                    : products[0]?.id ??
                      current.targetId ??
                      current.actionProductId;

                return {
                  ...current,
                  targetType: nextType,
                  targetId: nextTargetId,
                };
              });

              setMessage("");
              setError("");
            }}
          >
            <option value="product">
              一般商品
            </option>

            <option value="bundle_offer">
              組合優惠
            </option>
          </select>
        </label>

        <label className={styles.field}>
          <span>指定內容</span>

          <select
            value={targetId}
            onChange={(event) => {
              const nextTargetId =
                Number(
                  event.target.value
                );

              setDraft((current) => {
                if (!current) return current;

                if (
                  targetType ===
                  "product"
                ) {
                  return {
                    ...current,
                    targetType:
                      "product",
                    targetId:
                      nextTargetId,
                    actionProductId:
                      nextTargetId,
                    displayProductId:
                      nextTargetId,
                  };
                }

                return {
                  ...current,
                  targetType:
                    "bundle_offer",
                  targetId:
                    nextTargetId,
                };
              });

              setMessage("");
              setError("");
            }}
          >
            {targetType === "product"
              ? products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      #{product.id}{" "}
                      {product.cardName ||
                        product.name}
                    </option>
                  )
                )
              : bundleOffers.map(
                  (offer) => (
                    <option
                      key={offer.id}
                      value={offer.id}
                    >
                      #{offer.id}{" "}
                      {offer.name}
                      {" ｜ "}
                      {bundleOfferStatusLabel(
                        offer.status
                      )}
                    </option>
                  )
                )}
          </select>
        </label>

        <div className={styles.noteBox}>
          目前指定：
          {targetType ===
          "bundle_offer"
            ? selectedBundleOffer
              ? `組合優惠 #${selectedBundleOffer.id} ${selectedBundleOffer.name}（${bundleOfferStatusLabel(
                  selectedBundleOffer.status
                )}）`
              : `組合優惠 #${targetId}`
            : selectedProduct
              ? `一般商品 #${selectedProduct.id} ${selectedProduct.cardName ||
                  selectedProduct.name}`
              : `一般商品 #${targetId}`}
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

