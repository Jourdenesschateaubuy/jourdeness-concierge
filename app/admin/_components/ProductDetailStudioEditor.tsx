"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type { ComboConfig } from "../../../lib/storefront-core";
import MediaPicker, {
  type PickerMediaAsset,
} from "../website-studio/components/MediaPicker";
import styles from "./product-detail-studio-editor.module.css";

type ExpandedInfoItem = {
  title: string;
  content: string;
};

type StudioProduct = {
  id: number;
  displayCode?: string;
  productType?: "standard" | "combo";
  name: string;
  image?: string | null;
  series?: string | null;
  category?: string | null;
  originalPrice?: string | null;
  price?: string | null;
  priceNote?: string | null;
  spec?: string | null;
  description?: string | null;
  intro?: string | null;
  expiryNote?: string | null;
  features?: string[] | null;
  suitableFor?: string[] | null;
  usage?: string | null;
  notice?: string | null;
  gallery?: string[] | null;
  expandedInfo?: ExpandedInfoItem[] | null;
  comboConfig?: ComboConfig | null;
};

type ProductDetailForm = {
  name: string;
  spec: string;
  description: string;
  intro: string;
  expiryNote: string;
  features: string[];
  suitableFor: string[];
  usage: string;
  notice: string;
  gallery: string[];
  expandedInfo: ExpandedInfoItem[];
};

type ProductDetailStudioEditorProps = {
  productId: number;
  onDraftChange?: (
    productId: number,
    draft: ProductDetailForm
  ) => void;
  onEditPrice?: () => void;
  onSaved?: (product: StudioProduct) => void;
};

function fixedBundleFallback(product: StudioProduct): ComboConfig | null {
  if (product.productType !== "combo" && product.category !== "組合價") return null;

  const prices = [...String(product.price ?? "").matchAll(/([\d,]+)/g)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  const price = prices.at(-1) ?? 0;

  return {
    productId: product.id,
    type: "fixed_bundle",
    unitLabel: "組",
    options: [],
    plans: [
      {
        id: "fixed-bundle",
        label: "固定套組",
        requiredQuantity: 1,
        price,
        priceLabel: price ? `$${price.toLocaleString("zh-TW")}` : "",
      },
    ],
  };
}

function comboPriceSummary(config: ComboConfig) {
  if (config.type === "fixed_bundle") {
    const plan = config.plans.find(
      (item) => Number.isFinite(item.price) && item.price > 0
    );
    return plan
      ? `組合價 $${plan.price.toLocaleString("zh-TW")}`
      : "尚未設定固定套組價格";
  }

  const unitLabel = config.unitLabel || "件";
  const parts: string[] = [];
  if (config.singleUnitPrice) {
    parts.push(`單${unitLabel} $${config.singleUnitPrice.toLocaleString("zh-TW")}`);
  }
  for (const plan of config.plans) {
    if (!Number.isFinite(plan.price) || plan.price <= 0) continue;
    if (config.type === "buy_get") {
      const buy = plan.buyQuantity ?? Math.max(plan.requiredQuantity - 1, 1);
      const free = plan.freeQuantity ?? 1;
      parts.push(`買${buy}送${free} $${plan.price.toLocaleString("zh-TW")}`);
    } else {
      parts.push(`任選${plan.requiredQuantity}${unitLabel} $${plan.price.toLocaleString("zh-TW")}`);
    }
  }
  return parts.join("｜") || "尚未設定組合方案";
}

function productToForm(
  product: StudioProduct
): ProductDetailForm {
  return {
    name: product.name ?? "",
    spec: product.spec ?? "",
    description: product.description ?? "",
    intro: product.intro ?? "",
    expiryNote: product.expiryNote ?? "",
    features: product.features ?? [],
    suitableFor: product.suitableFor ?? [],
    usage: product.usage ?? "",
    notice: product.notice ?? "",
    gallery: product.gallery ?? [],
    expandedInfo: product.expandedInfo ?? [],
  };
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(value: string[]) {
  return value.join("\n");
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
      if (typeof value === "string" && value) {
        return value;
      }
    }
  }

  return "";
}

export default function ProductDetailStudioEditor({
  productId,
  onDraftChange,
  onEditPrice,
  onSaved,
}: ProductDetailStudioEditorProps) {
  const [product, setProduct] =
    useState<StudioProduct | null>(null);
  const [form, setForm] =
    useState<ProductDetailForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const comboConfig = useMemo(() => {
    if (!product) return null;
    return (
      product.comboConfig ??
      fixedBundleFallback(product)
    );
  }, [product]);

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
          {
            cache: "no-store",
          }
        );

        const payload =
          (await response.json()) as {
            product?: StudioProduct;
            error?: string;
          };

        if (!response.ok || !payload.product) {
          throw new Error(
            payload.error ||
              "讀取商品詳情失敗"
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
            : "讀取商品詳情失敗"
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
  }, [
    form,
    loading,
    onDraftChange,
    productId,
  ]);

  function updateField<
    Key extends keyof ProductDetailForm,
  >(
    field: Key,
    value: ProductDetailForm[Key]
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

  function selectGalleryImage(
    asset: PickerMediaAsset
  ) {
    if (!form) return;

    if (form.gallery.length >= 8) {
      setError("商品輪播圖最多 8 張");
      return;
    }

    const imageUrl =
      `/api/studio/media/${asset.id}/file`;

    setForm((current) => {
      if (!current) return current;

      const startingGallery =
        current.gallery.length > 0
          ? current.gallery
          : product?.image
            ? [product.image]
            : [];

      return {
        ...current,
        gallery: Array.from(
          new Set([
            ...startingGallery,
            imageUrl,
          ])
        ).slice(0, 8),
      };
    });

    setMessage(
      "圖片已加入輪播，請按「儲存商品詳情」。"
    );
    setError("");
  }

  function moveGalleryImage(
    index: number,
    direction: -1 | 1
  ) {
    if (!form) return;

    const nextIndex = index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= form.gallery.length
    ) {
      return;
    }

    const gallery = [...form.gallery];
    const currentImage = gallery[index];

    gallery[index] = gallery[nextIndex];
    gallery[nextIndex] = currentImage;

    updateField("gallery", gallery);
  }

  function removeGalleryImage(index: number) {
    if (!form) return;

    updateField(
      "gallery",
      form.gallery.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function updateExpandedInfo(
    index: number,
    field: keyof ExpandedInfoItem,
    value: string
  ) {
    if (!form) return;

    const expandedInfo =
      form.expandedInfo.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      );

    updateField(
      "expandedInfo",
      expandedInfo
    );
  }

  function addExpandedInfo() {
    if (!form) return;

    updateField("expandedInfo", [
      ...form.expandedInfo,
      {
        title: "",
        content: "",
      },
    ]);
  }

  function removeExpandedInfo(index: number) {
    if (!form) return;

    updateField(
      "expandedInfo",
      form.expandedInfo.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  async function saveProductDetail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form) return;

    if (!form.name.trim()) {
      setError("請輸入商品完整名稱");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payloadToSave = {
        ...form,
        expandedInfo:
          form.expandedInfo
            .map((item) => ({
              title: item.title.trim(),
              content: item.content.trim(),
            }))
            .filter(
              (item) =>
                item.title || item.content
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
          body: JSON.stringify(payloadToSave),
        }
      );

      const payload =
        (await response.json()) as {
          product?: StudioProduct;
          error?: string;
        };

      if (!response.ok || !payload.product) {
        throw new Error(
          payload.error ||
            "商品詳情儲存失敗"
        );
      }

      setProduct(payload.product);
      setForm(
        productToForm(payload.product)
      );
      setMessage("商品詳情已儲存");
      onSaved?.(payload.product);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "商品詳情儲存失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>正在讀取商品詳情</strong>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className={styles.stateCard}>
        <strong>無法開啟商品詳情</strong>
        <p>{error}</p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <form
      className={styles.form}
      onSubmit={saveProductDetail}
    >
      <div className={styles.topLine}>
        <div>
          <span>商品詳情編輯</span>
          <h2>{form.name}</h2>
          <small>
            左側順序已依照右側手機商品詳情由上往下排列
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

      <div className={styles.orderGuide}>
        <strong>編輯順序</strong>
        <span>
          圖片 → 標題 → 價格區 → 商品資訊 → 商品特色 → 了解更多 → 適合需求 → 使用方式 → 注意事項
        </span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionStep}>1</span>
            <div>
              <h3>商品輪播圖片</h3>
              <p>對應右側商品詳情最上方的大圖與輪播。</p>
            </div>
          </div>

          <button
            type="button"
            className={styles.uploadButton}
            onClick={() =>
              setGalleryPickerOpen(true)
            }
            disabled={
              saving ||
              form.gallery.length >= 8
            }
          >
            從 Media Library 新增圖片
          </button>
        </div>

        {form.gallery.length > 0 ? (
          <div className={styles.galleryGrid}>
            {form.gallery.map(
              (image, index) => (
                <article
                  className={styles.galleryItem}
                  key={`${image}-${index}`}
                >
                  <div className={styles.galleryImage}>
                    <img
                      src={image}
                      alt={`商品輪播圖 ${index + 1}`}
                    />
                    <span>
                      {index === 0
                        ? "首張主圖"
                        : `第 ${index + 1} 張`}
                    </span>
                  </div>

                  <div className={styles.galleryActions}>
                    <button
                      type="button"
                      onClick={() =>
                        moveGalleryImage(index, -1)
                      }
                      disabled={index === 0}
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        moveGalleryImage(index, 1)
                      }
                      disabled={
                        index ===
                        form.gallery.length - 1
                      }
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        removeGalleryImage(index)
                      }
                    >
                      移除
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div className={styles.emptyGallery}>
            目前右側使用商品卡主圖。新增圖片後，
            會建立商品詳情輪播。
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>2</span>
          <div>
            <h3>商品標題區</h3>
            <p>對應圖片下方的系列、商品名稱與規格說明。</p>
          </div>
        </div>

        {product?.series ? (
          <div className={styles.readOnlyMeta}>
            <span>目前系列</span>
            <strong>{product.series}</strong>
          </div>
        ) : null}

        <label className={styles.field}>
          <span>商品完整名稱</span>
          <input
            value={form.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            disabled={saving}
          />
        </label>

        <label className={styles.field}>
          <span>容量／規格</span>
          <input
            value={form.spec}
            onChange={(event) =>
              updateField(
                "spec",
                event.target.value
              )
            }
            placeholder="例如：30mL／瓶"
            disabled={saving}
          />
        </label>

        <label className={styles.field}>
          <span>商品簡短說明</span>
          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={3}
            placeholder="顯示在商品名稱與規格附近的簡短內容"
            disabled={saving}
          />
        </label>
      </section>

      <section
        className={`${styles.section} ${styles.priceReferenceSection}`}
      >
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>3</span>
          <div>
            <h3>價格與購買區</h3>
            <p>對應右側紅色價格卡與加入購物車按鈕。</p>
          </div>
        </div>

        <div className={styles.priceReference}>
          <span>原價</span>
          <del>
            {product?.originalPrice?.trim() || "未設定"}
          </del>
          <span>{comboConfig ? "組合方案價格" : "目前售價"}</span>
          <strong>
            {comboConfig
              ? comboPriceSummary(comboConfig)
              : product?.price?.trim() || "未設定"}
          </strong>
          {product?.priceNote?.trim() ? (
            <em>{product.priceNote}</em>
          ) : null}
        </div>

        <p className={styles.referenceNote}>
          {comboConfig
            ? "組合商品價格統一在「組合價格與方案」修改，其他頁面只顯示結果。"
            : "一般商品價格屬於商品卡資料，修改後商品卡與商品詳情會一起更新。"}
        </p>

        <button
          type="button"
          className={styles.editPriceButton}
          onClick={() => {
            if (comboConfig) {
              window.location.assign(
                `/admin/products/${productId}/edit?tab=combo`
              );
              return;
            }
            onEditPrice?.();
          }}
        >
          {comboConfig ? "編輯組合價格與方案" : "修改商品價格"}
        </button>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>4</span>
          <div>
            <h3>商品資訊</h3>
            <p>對應右側價格區下方的「商品資訊」。</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>商品完整介紹</span>
          <textarea
            value={form.intro}
            onChange={(event) =>
              updateField(
                "intro",
                event.target.value
              )
            }
            rows={5}
            disabled={saving}
          />
        </label>

        <label className={styles.field}>
          <span>效期說明</span>
          <textarea
            value={form.expiryNote}
            onChange={(event) =>
              updateField(
                "expiryNote",
                event.target.value
              )
            }
            rows={2}
            placeholder="不需要顯示可留白"
            disabled={saving}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>5</span>
          <div>
            <h3>商品特色</h3>
            <p>對應右側「商品特色」，每一行會成為一項。</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>商品特色（每一行一項）</span>
          <textarea
            value={listToText(form.features)}
            onChange={(event) =>
              updateField(
                "features",
                textToList(event.target.value)
              )
            }
            rows={5}
            placeholder={
              "保濕補水\n改善乾燥\n適合日常保養"
            }
            disabled={saving}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionStep}>6</span>
            <div>
              <h3>了解更多</h3>
              <p>對應右側可展開的完整產品資訊。</p>
            </div>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={addExpandedInfo}
          >
            ＋新增區塊
          </button>
        </div>

        {form.expandedInfo.length > 0 ? (
          <div className={styles.expandedList}>
            {form.expandedInfo.map(
              (item, index) => (
                <article
                  className={styles.expandedItem}
                  key={`expanded-${index}`}
                >
                  <div className={styles.expandedItemTop}>
                    <strong>
                      區塊 {index + 1}
                    </strong>
                    <button
                      type="button"
                      onClick={() =>
                        removeExpandedInfo(index)
                      }
                    >
                      刪除
                    </button>
                  </div>

                  <label className={styles.field}>
                    <span>標題</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateExpandedInfo(
                          index,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="例如：主要成分"
                      disabled={saving}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>內容</span>
                    <textarea
                      value={item.content}
                      onChange={(event) =>
                        updateExpandedInfo(
                          index,
                          "content",
                          event.target.value
                        )
                      }
                      rows={4}
                      disabled={saving}
                    />
                  </label>
                </article>
              )
            )}
          </div>
        ) : (
          <div className={styles.emptyGallery}>
            目前沒有額外資訊區塊。
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>7</span>
          <div>
            <h3>適合需求</h3>
            <p>對應右側「適合需求」的標籤。</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>適合需求（每一行一項）</span>
          <textarea
            value={listToText(form.suitableFor)}
            onChange={(event) =>
              updateField(
                "suitableFor",
                textToList(event.target.value)
              )
            }
            rows={4}
            placeholder={
              "乾燥缺水\n日常保濕\n熟齡保養"
            }
            disabled={saving}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>8</span>
          <div>
            <h3>使用方式</h3>
            <p>對應右側「使用方式／食用方式」。</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>使用方式</span>
          <textarea
            value={form.usage}
            onChange={(event) =>
              updateField(
                "usage",
                event.target.value
              )
            }
            rows={4}
            disabled={saving}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionStep}>9</span>
          <div>
            <h3>注意事項／配送提醒</h3>
            <p>對應右側最下方的提醒內容。</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>注意事項</span>
          <textarea
            value={form.notice}
            onChange={(event) =>
              updateField(
                "notice",
                event.target.value
              )
            }
            rows={4}
            disabled={saving}
          />
        </label>
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

      <div className={styles.stickyActions}>
        <span>
          左側區塊順序已與右側手機商品詳情一致
        </span>

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
            : "儲存商品詳情"}
        </button>
      </div>

      <MediaPicker
        open={galleryPickerOpen}
        title="選擇商品輪播圖片"
        onClose={() =>
          setGalleryPickerOpen(false)
        }
        onSelect={selectGalleryImage}
      />
    </form>
  );
}
