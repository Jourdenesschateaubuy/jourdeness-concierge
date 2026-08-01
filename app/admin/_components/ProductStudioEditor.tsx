"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import styles from "./product-studio-editor.module.css";

type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

type StudioProduct = {
  id: number;
  name: string;
  cardName?: string | null;
  cardSubtitle?: string | null;
  originalPrice?: string | null;
  price: string;
  priceNote?: string | null;
  status?: ProductStatus;
  image?: string | null;
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

function productToForm(
  product: StudioProduct
): ProductCardForm {
  return {
    cardName:
      product.cardName?.trim() || product.name || "",
    cardSubtitle: product.cardSubtitle ?? "",
    originalPrice: product.originalPrice ?? "",
    price: product.price ?? "",
    priceNote: product.priceNote ?? "",
    status: product.status ?? "active",
    image: product.image ?? "",
  };
}

function getUploadedImageUrl(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  for (const value of [
    record.url,
    record.publicUrl,
    record.imageUrl,
  ]) {
    if (typeof value === "string" && value) {
      return value;
    }
  }

  if (record.file && typeof record.file === "object") {
    const file = record.file as Record<string, unknown>;

    for (const value of [file.publicUrl, file.url]) {
      if (typeof value === "string" && value) {
        return value;
      }
    }
  }

  return "";
}

export default function ProductStudioEditor({
  productId,
  onDraftChange,
  onSaved,
}: ProductStudioEditorProps) {
  const [product, setProduct] =
    useState<StudioProduct | null>(null);
  const [form, setForm] =
    useState<ProductCardForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

        const payload = (await response.json()) as {
          product?: StudioProduct;
          error?: string;
        };

        if (!response.ok || !payload.product) {
          throw new Error(
            payload.error || "讀取商品失敗"
          );
        }

        if (cancelled) return;

        setProduct(payload.product);
        setForm(productToForm(payload.product));
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "讀取商品失敗"
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
      JSON.stringify(productToForm(product)) !==
      JSON.stringify(form)
    );
  }, [form, product]);

  useEffect(() => {
    if (!form || loading) return;

    onDraftChange?.(productId, form);
  }, [form, loading, onDraftChange, productId]);

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

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
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

      const payload = (await response.json()) as {
        error?: string;
        [key: string]: unknown;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "圖片上傳失敗"
        );
      }

      const imageUrl = getUploadedImageUrl(payload);

      if (!imageUrl) {
        throw new Error(
          "圖片已上傳，但沒有取得圖片網址"
        );
      }

      updateField("image", imageUrl);
      setMessage(
        "新圖片已上傳，請按「儲存商品卡」。"
      );
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

  async function saveProductCard(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form) return;

    if (!form.cardName.trim()) {
      setError("請輸入商品卡名稱");
      return;
    }

    if (!form.price.trim()) {
      setError("請輸入目前售價");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const payload = (await response.json()) as {
        product?: StudioProduct;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.product) {
        throw new Error(
          payload.error || "商品卡儲存失敗"
        );
      }

      setProduct(payload.product);
      setForm(productToForm(payload.product));
      setMessage("商品卡已儲存");
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
    <form
      className={styles.form}
      onSubmit={saveProductCard}
    >
      <div className={styles.topLine}>
        <div>
          <span>商品卡編輯</span>
          <h2>{form.cardName}</h2>
        </div>

        <span
          className={`${styles.syncBadge} ${
            hasChanges ? styles.unsavedBadge : ""
          }`}
        >
          {hasChanges ? "尚未儲存" : "已同步"}
        </span>
      </div>

      <section className={styles.cardSection}>
        <div className={styles.imageColumn}>
          <div className={styles.imagePreview}>
            {form.image ? (
              <img
                src={form.image}
                alt={form.cardName}
              />
            ) : (
              <span>尚未設定商品圖片</span>
            )}
          </div>

          <label className={styles.uploadButton}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadImage}
              disabled={uploading || saving}
            />
            {uploading
              ? "圖片上傳中…"
              : "更換商品卡圖片"}
          </label>

          <small>常用比例：1 : 1.06</small>
        </div>

        <div className={styles.fieldsColumn}>
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
                value={form.originalPrice}
                onChange={(event) =>
                  updateField(
                    "originalPrice",
                    event.target.value
                  )
                }
                placeholder="例如：原價 $890"
                disabled={saving}
              />
            </label>

            <label className={styles.field}>
              <span>目前售價</span>
              <input
                value={form.price}
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value
                  )
                }
                placeholder="例如：產地價 $660"
                disabled={saving}
              />
            </label>
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
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className={styles.noteBox}>
        這裡只修改商品卡上的名稱、圖片、價格與顯示狀態。
        商品詳細內容之後使用雙擊商品卡開啟。
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

      <div className={styles.stickyActions}>
        <a
          href={`/admin/products/${productId}/edit`}
          target="_blank"
          rel="noreferrer"
          className={styles.fullEditorLink}
        >
          完整商品資料
        </a>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={
            saving || uploading || !hasChanges
          }
        >
          {saving ? "儲存中…" : "儲存商品卡"}
        </button>
      </div>
    </form>
  );
}
