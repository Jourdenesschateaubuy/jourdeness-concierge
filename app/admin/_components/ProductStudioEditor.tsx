"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { readJsonResponse } from "../../../lib/http-json";
import MediaPicker, {
  type PickerMediaAsset,
} from "../website-studio/components/MediaPicker";
import styles from "./product-studio-editor.module.css";

type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

type StudioProduct = {
  id: number;
  displayCode?: string;
  name: string;
  cardName?: string | null;
  cardSubtitle?: string | null;
  originalPrice?: string | null;
  price: string;
  priceNote?: string | null;
  status?: ProductStatus;
  image?: string | null;
  category?: string | null;
};

type ProductCardForm = {
  cardName: string;
  cardSubtitle: string;
  originalPrice: string;
  price: string;
  priceNote: string;
  status: ProductStatus;
  image: string;
};

type ProductStudioEditorProps = {
  productId: number;
  onDraftChange?: (
    productId: number,
    draft: ProductCardForm
  ) => void;
  onOpenDetail?: () => void;
  onSaved?: (product: StudioProduct) => void;
};

const statusOptions: Array<{
  value: ProductStatus;
  label: string;
}> = [
  { value: "active", label: "上架中" },
  { value: "inactive", label: "下架" },
  { value: "coming_soon", label: "新品預告" },
  { value: "sold_out", label: "售罄" },
];

function cleanMoneyForEditor(
  value: string | null | undefined,
  kind: "original" | "selling"
) {
  const clean = value?.trim() ?? "";

  if (!clean) return "";

  const label =
    kind === "original"
      ? "(?:原價)?"
      : "(?:產地價|售價|活動價)?";

  const match = clean.match(
    new RegExp(
      `^${label}\\s*\\$?\\s*([\\d,]+)$`
    )
  );

  return match?.[1]?.replace(/,/g, "") ?? clean;
}

function normalizeMoneyForPreview(
  value: string,
  kind: "original" | "selling"
) {
  return cleanMoneyForEditor(value, kind);
}



function productToForm(
  product: StudioProduct
): ProductCardForm {
  return {
    cardName:
      product.cardName?.trim() ||
      product.name ||
      "",
    cardSubtitle:
      product.cardSubtitle ?? "",
    originalPrice: cleanMoneyForEditor(
      product.originalPrice,
      "original"
    ),
    price: cleanMoneyForEditor(
      product.price,
      "selling"
    ),
    priceNote: product.priceNote ?? "",
    status: product.status ?? "active",
    image: product.image ?? "",
  };
}

export default function ProductStudioEditor({
  productId,
  onDraftChange,
  onOpenDetail,
  onSaved,
}: ProductStudioEditorProps) {
  const [product, setProduct] =
    useState<StudioProduct | null>(null);
  const [form, setForm] =
    useState<ProductCardForm | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setProduct(null);
      setForm(null);
      setMessage("");
      setError("");

      try {
        const response = await fetch(
          `/api/admin/products/${productId}`,
          { cache: "no-store" }
        );

        const payload =
          await readJsonResponse<{
            product?: StudioProduct;
            error?: string;
          }>(
            response,
            "商品卡讀取失敗"
          );

        if (
          !response.ok ||
          !payload.product
        ) {
          throw new Error(
            payload.error ||
              "商品卡讀取失敗"
          );
        }

        if (cancelled) return;

        setProduct(payload.product);
        setForm(
          productToForm(payload.product)
        );
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "商品卡讀取失敗"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const hasChanges = useMemo(() => {
    if (!product || !form) return false;

    return (
      JSON.stringify(
        productToForm(product)
      ) !== JSON.stringify(form)
    );
  }, [form, product]);



  useEffect(() => {
    if (!form || loading) return;

    onDraftChange?.(productId, {
      ...form,
      originalPrice:
        normalizeMoneyForPreview(
          form.originalPrice,
          "original"
        ),
      price: normalizeMoneyForPreview(
            form.price,
            "selling"
          ),
    });
  }, [

    form,

    loading,
    onDraftChange,
    product,
    productId,
  ]);

  function updateField(
    field: keyof ProductCardForm,
    value: string
  ) {
    setForm((current) =>
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
  function selectProductImage(
  asset: PickerMediaAsset
) {
  updateField(
    "image",
    `/api/studio/media/${asset.id}/file`
  );
}

  async function saveProductCard(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form) return;

    if (!form.cardName.trim()) {
      setError("請輸入商品卡名稱");
      return;
    }

    if (
      !false &&
      !form.price.trim()
    ) {
      setError("請輸入目前售價");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const requestBody = {
        ...form,
        originalPrice:
          normalizeMoneyForPreview(
            form.originalPrice,
            "original"
          ),
        price: normalizeMoneyForPreview(
              form.price,
              "selling"
            ),
      };

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const payload =
        await readJsonResponse<{
          product?: StudioProduct;
          message?: string;
          error?: string;
        }>(
          response,
          "商品卡儲存失敗"
        );

      if (
        !response.ok ||
        !payload.product
      ) {
        throw new Error(
          payload.error ||
            "商品卡儲存失敗"
        );
      }

      setProduct(payload.product);
      setForm(
        productToForm(payload.product)
      );
      setMessage(
        payload.message ||
          "商品卡已儲存"
      );
      onSaved?.(payload.product);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "商品卡儲存失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>正在讀取商品卡</strong>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className={styles.stateCard}>
        <strong>無法開啟商品卡</strong>
        <p>{error}</p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <>
    <form
      className={styles.form}
      onSubmit={saveProductCard}
    >
      <div className={styles.topLine}>
        <div>
          <span>{product?.displayCode ?? "商品卡"} · 商品卡編輯</span>
          <h2>{form.cardName}</h2>
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

      <section
        className={styles.cardSection}
      >
        <div
          className={styles.imageColumn}
        >
          <div
            className={styles.imagePreview}
          >
            {form.image ? (
              <img
                src={form.image}
                alt={form.cardName}
              />
            ) : (
              <span>
                尚未設定商品圖片
              </span>
            )}
          </div>

          <div className={styles.field}>
            <span>商品主圖</span>

            <button
              type="button"
              onClick={() =>
                setMediaPickerOpen(true)
              }
              disabled={saving}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "9px 13px",
                background: "#8c2940",
                color: "#fff",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 900,
              }}
            >
              從 Media Library 選擇
            </button>

            {form.image ? (
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "image",
                    ""
                  )
                }
                disabled={saving}
                style={{
                  marginTop: 8,
                  border:
                    "1px solid rgba(140,41,64,.16)",
                  borderRadius: 999,
                  padding: "8px 11px",
                  background: "#fff",
                  color: "#8c2940",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 800,
                }}
              >
                清除圖片
              </button>
            ) : null}

            <small>
              新圖片統一從 Media Library 選擇；既有
              /products/... 圖片仍保留相容。
            </small>
          </div>

          <small>
            常用比例：1 : 1.06
          </small>
        </div>

        <div
          className={styles.fieldsColumn}
        >
          <label className={styles.field}>
            <span>品項名稱</span>
            <input
              value={form.cardName}
              onChange={(event) =>
                updateField(
                  "cardName",
                  event.target.value
                )
              }
              disabled={saving}
            />
          </label>

          <label className={styles.field}>
            <span>商品卡副標題</span>
            <input
              value={form.cardSubtitle}
              onChange={(event) =>
                updateField(
                  "cardSubtitle",
                  event.target.value
                )
              }
              placeholder="沒有副標題可留白"
              disabled={saving}
            />
          </label>

          <div className={styles.priceGrid}>
            <label className={styles.field}>
              <span>原價</span>
              <input
                inputMode="numeric"
                value={form.originalPrice}
                onChange={(event) =>
                  updateField(
                    "originalPrice",
                    event.target.value
                  )
                }
                placeholder="例如：890"
                disabled={saving}
              />
              <small>
                輸入數字即可，前台會自動加上「原價」。
              </small>
            </label>

            {(
              <label className={styles.field}>
                <span>目前售價</span>
                <input
                  inputMode="numeric"
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      event.target.value
                    )
                  }
                  placeholder="例如：660"
                  disabled={saving}
                />
                <small>
                  輸入數字即可，前台會自動加上價格標籤。
                </small>
              </label>
            )}
          </div>

          <label className={styles.field}>
            <span>優惠補充文字</span>
            <input
              value={form.priceNote}
              onChange={(event) =>
                updateField(
                  "priceNote",
                  event.target.value
                )
              }
              placeholder="例如：買一送一"
              disabled={saving}
            />
          </label>

          <label className={styles.field}>
            <span>顯示狀態</span>
            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
              disabled={saving}
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      </section>

      <div className={styles.noteBox}>
        {"這裡只修改商品卡上的名稱、圖片、價格與顯示狀態。商品詳細內容使用「商品詳情」開啟。"}
      </div>

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
        <button
          type="button"
          onClick={onOpenDetail}
          className={styles.fullEditorLink}
        >
          商品詳情
        </button>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={
            saving ||
            !hasChanges
          }
        >
          {saving
            ? "儲存中…"
            : "儲存商品卡"}
        </button>
      </div>
    </form>

    <MediaPicker
      open={mediaPickerOpen}
      title="選擇商品主圖"
      onClose={() =>
        setMediaPickerOpen(false)
      }
      onSelect={selectProductImage}
    />
    </>
  );
}
