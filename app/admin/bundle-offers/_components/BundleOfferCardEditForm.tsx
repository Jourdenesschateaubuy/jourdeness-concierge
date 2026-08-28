"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import MediaPicker, {
  type PickerMediaAsset,
} from "../../website-studio/components/MediaPicker";

import ProductImageUploader from "../../products/_components/ProductImageUploader";
import styles from "../../products/_components/product-card-edit-form.module.css";

type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

type Tab = "card" | "detail";

type ExpandedItem = {
  title: string;
  content: string;
};

type CategoryOption = {
  id: number;
  name: string;
  isActive: boolean;
};

type SeriesOption = {
  id: number;
  categoryName: string;
  name: string;
  isActive: boolean;
};

type InitialOffer = {
  id: number;
  name: string;
  coverImage?: string;
  cardSubtitle?: string;
    cardOriginalPriceText?: string;
  cardPriceText?: string;
storefrontCategory?: string;
  series?: string;
  status: ProductStatus;

  spec?: string;
  expiryNote?: string;
  intro?: string;
  features: string[];
  expandedInfo: ExpandedItem[];
  suitableFor: string[];
  usage?: string;
  gallery: string[];

  priceSummary: string;
};

type Props = {
  initialOffer: InitialOffer;
  categories: CategoryOption[];
  series: SeriesOption[];
};

const statusLabels: Record<ProductStatus, string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

function imageReferenceKey(value: string) {
  const clean = value.trim();

  if (!clean) return "";

  try {
    const url = new URL(
      clean,
      "https://jourdeness.local"
    );

    return url.pathname.replace(/\/+$/g, "");
  } catch {
    return clean
      .split(/[?#]/, 1)[0]
      .replace(/\/+$/g, "");
  }
}

function isSameImageReference(
  left: string,
  right: string
) {
  const leftKey = imageReferenceKey(left);
  const rightKey = imageReferenceKey(right);

  return Boolean(
    leftKey &&
    rightKey &&
    leftKey === rightKey
  );
}

function moveItem<T>(
  items: T[],
  from: number,
  to: number
) {
  if (
    to < 0 ||
    to >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);

  return next;
}

export default function BundleOfferCardEditForm({
  initialOffer,
  categories,
  series: allSeries,
}: Props) {
  const router = useRouter();

  const [tab, setTab] =
    useState<Tab>("card");

  const [name, setName] =
    useState(initialOffer.name);

  const [coverImage, setCoverImage] =
    useState(initialOffer.coverImage ?? "");

  const [cardSubtitle, setCardSubtitle] =
    useState(
      initialOffer.cardSubtitle ?? ""
    );

  const [
    cardOriginalPriceText,
    setCardOriginalPriceText,
  ] = useState(
    initialOffer.cardOriginalPriceText ?? ""
  );

  const [
    cardPriceText,
    setCardPriceText,
  ] = useState(
    initialOffer.cardPriceText ?? ""
  );

  const [
    storefrontCategory,
    setStorefrontCategory,
  ] = useState(
    initialOffer.storefrontCategory ?? ""
  );

  const [series, setSeries] =
    useState(initialOffer.series ?? "");

  const [status, setStatus] =
    useState<ProductStatus>(
      initialOffer.status
    );

  const [spec, setSpec] =
    useState(initialOffer.spec ?? "");

  const [expiryNote, setExpiryNote] =
    useState(
      initialOffer.expiryNote ?? ""
    );

  const [intro, setIntro] =
    useState(initialOffer.intro ?? "");

  const [features, setFeatures] =
    useState<string[]>(
      initialOffer.features.length
        ? initialOffer.features
        : [""]
    );

  const [
    expandedInfo,
    setExpandedInfo,
  ] = useState<ExpandedItem[]>(
    initialOffer.expandedInfo
  );

  const [
    suitableFor,
    setSuitableFor,
  ] = useState<string[]>(
    initialOffer.suitableFor.length
      ? initialOffer.suitableFor
      : [""]
  );

  const [usage, setUsage] =
    useState(initialOffer.usage ?? "");

  const [gallery, setGallery] =
    useState<string[]>(
      initialOffer.gallery.filter(
        (image) =>
          !isSameImageReference(
            image,
            initialOffer.coverImage ?? ""
          )
      )
    );
const [
    galleryPickerOpen,
    setGalleryPickerOpen,
  ] = useState(false);

  const [
    draggingGalleryIndex,
    setDraggingGalleryIndex,
  ] = useState<number | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const seriesOptions = useMemo(
    () =>
      allSeries.filter(
        (item) =>
          item.categoryName ===
          storefrontCategory
      ),
    [allSeries, storefrontCategory]
  );
function addGalleryImage(
    asset: PickerMediaAsset
  ) {
    const imageUrl =
      `/api/studio/media/${asset.id}/file`;

    setGallery((current) => {
      if (
        isSameImageReference(
          imageUrl,
          coverImage
        )
      ) {
        return current;
      }

      if (
        current.some((image) =>
          isSameImageReference(
            image,
            imageUrl
          )
        )
      ) {
        return current;
      }

      return [
        ...current,
        imageUrl,
      ].slice(0, 8);
    });

    setGalleryPickerOpen(false);
  }

  function changeCategory(
    nextCategory: string
  ) {
    setStorefrontCategory(
      nextCategory
    );

    const valid =
      allSeries.some(
        (item) =>
          item.categoryName ===
            nextCategory &&
          item.name === series
      );

    if (!valid) {
      setSeries("");
    }
  }

  function moveGalleryByDrag(
    from: number,
    to: number
  ) {
    if (from === to) return;

    setGallery((current) =>
      moveItem(current, from, to)
    );
  }

  async function saveCard() {
    if (!name.trim()) {
      throw new Error(
        "請輸入商品名稱。"
      );
    }

    if (
      status === "active" &&
      !storefrontCategory
    ) {
      throw new Error(
        "上架中的組合優惠必須設定前台分類。"
      );
    }

    const response = await fetch(
      `/api/admin/bundle-offers/${initialOffer.id}/card`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          coverImage:
            coverImage || undefined,
          cardSubtitle:
            cardSubtitle.trim() ||
            undefined,
          cardOriginalPriceText:
            cardOriginalPriceText.trim() ||
            undefined,
          cardPriceText:
            cardPriceText.trim() ||
            undefined,
          storefrontCategory:
            storefrontCategory ||
            undefined,
          series:
            series || undefined,
          status,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ??
          "無法儲存商品卡。"
      );
    }
  }

  async function saveDetail(
    saveCardAfter = true
  ) {
    const response = await fetch(
      `/api/admin/bundle-offers/${initialOffer.id}/info`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          spec,
          expiryNote,
          intro,
          features,
          expandedInfo,
          suitableFor,
          usage,
          gallery,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ??
          "無法儲存商品資訊。"
      );
    }

    // 管理設定仍由商品卡 API 保存。
    if (saveCardAfter) {
      await saveCard();
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (tab === "card") {
        await saveCard();
        await saveDetail(false);

        setSuccess(
          "商品卡與商品圖片已儲存。"
        );
      }

      if (tab === "detail") {
        await saveDetail();
        setSuccess(
          "商品資訊與管理設定已儲存。"
        );
      }

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "儲存失敗。"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.form}>
        <div
          className={styles.tabs}
          style={{
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
          }}
        >
          <button
            type="button"
            className={
              tab === "card"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setTab("card")
            }
          >
            商品卡
          </button>

          <button
            type="button"
            className={
              tab === "detail"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setTab("detail")
            }
          >
            商品資訊
          </button>
        </div>

        {tab === "card" && (
          <div className={styles.panel}>
            <div
              className={
                styles.panelHeading
              }
            >
              <span>
                B-{initialOffer.id} · 商品卡
              </span>

              <h2>
                客人第一眼看到的內容
              </h2>
            </div>

            <section
              className={
                styles.imageSection
              }
            >
              <div
                className={
                  styles.imageHeading
                }
              >
                <div>
                  <strong>商品圖片</strong>
                  <span>
                    商品主圖＋商品詳情輪播圖片
                  </span>
                </div>

                <small>
                  建議尺寸：750 × 795 px
                  <br />
                  建議比例：1 : 1.06
                  <br />
                  建議格式：JPG
                  <br />
                  商品主圖固定為第一張
                </small>
              </div>

              <ProductImageUploader
                initialImage={coverImage}
                onImageChange={(image) => {
                  setCoverImage(image);

                  if (!image) {
                    return;
                  }

                  setGallery((current) =>
                    current.filter(
                      (galleryImage) =>
                        !isSameImageReference(
                          galleryImage,
                          image
                        )
                    )
                  );
                }}
              />

              <div
                className={
                  styles.sectionTitleRow
                }
                style={{
                  marginTop: 18,
                }}
              >
                <div>
                  <strong>
                    其他輪播圖片
                  </strong>

                  <p
                    className={
                      styles.sectionHelp
                    }
                    style={{
                      margin: "4px 0 0",
                    }}
                  >
                    會接在商品主圖後方，
                    顯示於商品詳情最上方輪播。
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    gallery.length >= 8
                  }
                  onClick={() =>
                    setGalleryPickerOpen(
                      true
                    )
                  }
                >
                  ＋從 Media Library 新增圖片
                </button>
              </div>

              <p
                className={
                  styles.sectionHelp
                }
              >
                目前共 {gallery.length + 1} 張：
                商品主圖 1 張＋其他輪播圖片{" "}
                {gallery.length} 張。
              </p>

              {gallery.length === 0 ? (
                <p
                  className={
                    styles.emptyText
                  }
                >
                  目前沒有其他輪播圖片。
                </p>
              ) : (
                <div
                  className={
                    styles.repeatList
                  }
                >
                  {gallery.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        className={
                          styles.repeatItem
                        }
                        key={`${image}-${index}`}
                        draggable
                        onDragStart={() =>
                          setDraggingGalleryIndex(
                            index
                          )
                        }
                        onDragEnd={() =>
                          setDraggingGalleryIndex(
                            null
                          )
                        }
                        onDragOver={(
                          event
                        ) =>
                          event.preventDefault()
                        }
                        onDrop={() => {
                          if (
                            draggingGalleryIndex !==
                            null
                          ) {
                            moveGalleryByDrag(
                              draggingGalleryIndex,
                              index
                            );
                          }

                          setDraggingGalleryIndex(
                            null
                          );
                        }}
                        style={{
                          cursor: "grab",
                          opacity:
                            draggingGalleryIndex ===
                            index
                              ? 0.55
                              : 1,
                        }}
                      >
                        <div
                          title="拖曳排序"
                          aria-label="拖曳排序"
                          style={{
                            alignSelf:
                              "stretch",
                            display: "grid",
                            placeItems:
                              "center",
                            minWidth: 34,
                            color:
                              "#8c2940",
                            fontWeight:
                              900,
                            fontSize: 18,
                            userSelect:
                              "none",
                          }}
                        >
                          ☰
                        </div>

                        <img
                          src={image}
                          alt={`商品圖片 ${index + 2}`}
                          style={{
                            width: 88,
                            height: 88,
                            objectFit:
                              "contain",
                            borderRadius:
                              10,
                            border:
                              "1px solid rgba(140,41,64,.12)",
                            background:
                              "#fff",
                          }}
                        />

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <strong>
                            第 {index + 2} 張
                          </strong>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop: 4,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {image}
                          </small>
                        </div>

                        <div
                          className={
                            styles.itemActions
                          }
                        >
                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              setGallery(
                                moveItem(
                                  gallery,
                                  index,
                                  index - 1
                                )
                              )
                            }
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              gallery.length - 1
                            }
                            onClick={() =>
                              setGallery(
                                moveItem(
                                  gallery,
                                  index,
                                  index + 1
                                )
                              )
                            }
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setGallery(
                                gallery.filter(
                                  (
                                    _,
                                    itemIndex
                                  ) =>
                                    itemIndex !==
                                    index
                                )
                              )
                            }
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <p
                className={
                  styles.sectionHelp
                }
              >
                可拖曳排序，也可使用 ↑ ↓ 微調。
                商品主圖固定為第一張。
              </p>
            </section>

            <div className={styles.fields}>
              <label>
                <span>商品名稱</span>

                <input
                  value={name}
                  required
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>商品卡副標</span>

                <input
                  value={cardSubtitle}
                  onChange={(event) =>
                    setCardSubtitle(
                      event.target.value
                    )
                  }
                  placeholder="例如：高鈣益生菌買一送一"
                />
              </label>

              <label>
                <span>原價顯示文字（選填）</span>

                <input
                  value={cardOriginalPriceText}
                  onChange={(event) =>
                    setCardOriginalPriceText(
                      event.target.value
                    )
                  }
                  placeholder="例如：原價 $1,680"
                />

                <small>
                  可自由輸入，也可以留空。
                </small>
              </label>

              <label>
                <span>價格顯示文字</span>

                <input
                  value={cardPriceText}
                  onChange={(event) =>
                    setCardPriceText(
                      event.target.value
                    )
                  }
                  placeholder="例如：組合價 $1,080"
                />

                <small>
                  前台商品卡將直接顯示你輸入的文字。
                </small>
              </label>

              <label>
                <span>實際組合設定價格</span>

                <input
                  value={initialOffer.priceSummary}
                  readOnly
                />

                <small>
                  僅供核對。實際結帳價格與優惠規則請至「編輯組合」修改。
                </small>
              </label>

              <label>
                <span>商品狀態</span>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as ProductStatus
                    )
                  }
                >
                  <option value="active">
                    上架中
                  </option>

                  <option value="inactive">
                    下架
                  </option>

                  <option value="coming_soon">
                    新品預告
                  </option>

                  <option value="sold_out">
                    售罄
                  </option>
                </select>
              </label>
            </div>

            <div
              className={
                styles.cardPreview
              }
            >
              <small>即時預覽</small>

              {status !== "active" && (
                <span
                  className={
                    styles.previewBadge
                  }
                >
                  {statusLabels[status]}
                </span>
              )}

              <strong>
                {name || "商品名稱"}
              </strong>

              {cardSubtitle ? (
                <span>
                  {cardSubtitle}
                </span>
              ) : null}

              {cardOriginalPriceText ? (
                <span>
                  {cardOriginalPriceText}
                </span>
              ) : null}

              <b>
                {cardPriceText || "價格顯示文字"}
              </b>
            </div>
          </div>
        )}

        {tab === "detail" && (
          <div className={styles.panel}>
            <div
              className={
                styles.panelHeading
              }
            >
              <span>
                B-{initialOffer.id} · 商品資訊
              </span>

              <h2>
                照客人看到的商品頁順序修改
              </h2>

              <p
                className={
                  styles.frontOrderNote
                }
              >
                從上往下就是前台商品資訊的顯示順序。
              </p>
            </div>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.frontSectionHeading
                }
              >
                <span>01</span>

                <div>
                  <h3>商品資訊</h3>
                  <small>
                    對應前台「商品資訊」卡片
                  </small>
                </div>
              </div>

              <label>
                <span>
                  規格／組合內容
                </span>

                <input
                  value={spec}
                  onChange={(event) =>
                    setSpec(
                      event.target.value
                    )
                  }
                  placeholder="例如：高鈣益生菌 1 盒＋贈品 1 盒"
                />
              </label>

              <label>
                <span>效期</span>

                <textarea
                  rows={3}
                  value={expiryNote}
                  onChange={(event) =>
                    setExpiryNote(
                      event.target.value
                    )
                  }
                  placeholder="例如：實際效期以商品包裝標示為準"
                />
              </label>

              <label>
                <span>商品簡介</span>

                <textarea
                  rows={4}
                  value={intro}
                  onChange={(event) =>
                    setIntro(
                      event.target.value
                    )
                  }
                  placeholder="顯示在規格、效期下方的商品介紹文字"
                />
              </label>
            </section>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.frontSectionHeading
                }
              >
                <span>02</span>

                <div>
                  <h3>
                    購買服務提醒
                  </h3>

                  <small>
                    目前為全站共用內容
                  </small>
                </div>
              </div>

              <div
                className={
                  styles.servicePreviewGrid
                }
              >
                <div
                  className={
                    styles.servicePreviewCard
                  }
                >
                  <strong>
                    滿額免運
                  </strong>

                  <span>
                    滿 NT$3,000 享免運
                  </span>
                </div>

                <div
                  className={
                    styles.servicePreviewCard
                  }
                >
                  <strong>
                    宅配出貨
                  </strong>

                  <span>
                    目前僅提供宅配
                  </span>
                </div>

                <div
                  className={
                    styles.servicePreviewCard
                  }
                >
                  <strong>
                    LINE 確認
                  </strong>

                  <span>
                    庫存效期確認
                  </span>
                </div>
              </div>

              <p
                className={
                  styles.sectionHelp
                }
              >
                這三張卡片屬於全站設定，因此在單一商品內先顯示預覽，不重複修改。
              </p>
            </section>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.sectionTitleRow
                }
              >
                <div
                  className={
                    styles.frontSectionHeading
                  }
                >
                  <span>03</span>

                  <div>
                    <h3>商品特色</h3>
                    <small>
                      前台一條一條顯示
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFeatures([
                      ...features,
                      "",
                    ])
                  }
                >
                  ＋新增
                </button>
              </div>

              <div
                className={
                  styles.repeatList
                }
              >
                {features.map(
                  (
                    feature,
                    index
                  ) => (
                    <div
                      className={
                        styles.repeatItem
                      }
                      key={`feature-${index}`}
                    >
                      <input
                        value={feature}
                        placeholder={`商品特色 ${index + 1}`}
                        onChange={(
                          event
                        ) => {
                          const next =
                            [
                              ...features,
                            ];

                          next[index] =
                            event.target.value;

                          setFeatures(
                            next
                          );
                        }}
                      />

                      <div
                        className={
                          styles.itemActions
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setFeatures(
                              moveItem(
                                features,
                                index,
                                index - 1
                              )
                            )
                          }
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFeatures(
                              moveItem(
                                features,
                                index,
                                index + 1
                              )
                            )
                          }
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFeatures(
                              features.filter(
                                (
                                  _,
                                  itemIndex
                                ) =>
                                  itemIndex !==
                                  index
                              )
                            )
                          }
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.sectionTitleRow
                }
              >
                <div
                  className={
                    styles.frontSectionHeading
                  }
                >
                  <span>04</span>

                  <div>
                    <h3>了解更多</h3>

                    <small>
                      前台可展開的完整產品資訊
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedInfo([
                      ...expandedInfo,
                      {
                        title: "",
                        content: "",
                      },
                    ])
                  }
                >
                  ＋新增
                </button>
              </div>

              {expandedInfo.length ===
              0 ? (
                <p
                  className={
                    styles.emptyText
                  }
                >
                  目前沒有額外資訊。
                </p>
              ) : (
                <div
                  className={
                    styles.repeatList
                  }
                >
                  {expandedInfo.map(
                    (item, index) => (
                      <div
                        className={
                          styles.expandedItem
                        }
                        key={`expanded-${index}`}
                      >
                        <input
                          value={
                            item.title
                          }
                          placeholder="區塊標題"
                          onChange={(
                            event
                          ) => {
                            const next =
                              [
                                ...expandedInfo,
                              ];

                            next[index] = {
                              ...next[
                                index
                              ],
                              title:
                                event
                                  .target
                                  .value,
                            };

                            setExpandedInfo(
                              next
                            );
                          }}
                        />

                        <textarea
                          rows={3}
                          value={
                            item.content
                          }
                          placeholder="區塊內容"
                          onChange={(
                            event
                          ) => {
                            const next =
                              [
                                ...expandedInfo,
                              ];

                            next[index] = {
                              ...next[
                                index
                              ],
                              content:
                                event
                                  .target
                                  .value,
                            };

                            setExpandedInfo(
                              next
                            );
                          }}
                        />

                        <button
                          type="button"
                          className={
                            styles.deleteWide
                          }
                          onClick={() =>
                            setExpandedInfo(
                              expandedInfo.filter(
                                (
                                  _,
                                  itemIndex
                                ) =>
                                  itemIndex !==
                                  index
                              )
                            )
                          }
                        >
                          刪除這一段
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.sectionTitleRow
                }
              >
                <div
                  className={
                    styles.frontSectionHeading
                  }
                >
                  <span>05</span>

                  <div>
                    <h3>適合需求</h3>

                    <small>
                      前台會顯示成標籤
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSuitableFor([
                      ...suitableFor,
                      "",
                    ])
                  }
                >
                  ＋新增
                </button>
              </div>

              <div
                className={
                  styles.repeatList
                }
              >
                {suitableFor.map(
                  (item, index) => (
                    <div
                      className={
                        styles.repeatItem
                      }
                      key={`suitable-${index}`}
                    >
                      <input
                        value={item}
                        placeholder={`需求標籤 ${index + 1}`}
                        onChange={(
                          event
                        ) => {
                          const next =
                            [
                              ...suitableFor,
                            ];

                          next[index] =
                            event.target.value;

                          setSuitableFor(
                            next
                          );
                        }}
                      />

                      <div
                        className={
                          styles.itemActions
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSuitableFor(
                              moveItem(
                                suitableFor,
                                index,
                                index - 1
                              )
                            )
                          }
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSuitableFor(
                              moveItem(
                                suitableFor,
                                index,
                                index + 1
                              )
                            )
                          }
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSuitableFor(
                              suitableFor.filter(
                                (
                                  _,
                                  itemIndex
                                ) =>
                                  itemIndex !==
                                  index
                              )
                            )
                          }
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section
              className={
                styles.detailSection
              }
            >
              <div
                className={
                  styles.frontSectionHeading
                }
              >
                <span>06</span>

                <div>
                  <h3>使用方式</h3>

                  <small>
                    對應前台使用說明
                  </small>
                </div>
              </div>

              <textarea
                rows={5}
                value={usage}
                onChange={(event) =>
                  setUsage(
                    event.target.value
                  )
                }
                placeholder="輸入客人會在商品頁看到的完整使用方式"
              />
            </section>

            <section
              className={`${styles.detailSection} ${styles.managementSection}`}
            >
              <div
                className={
                  styles.frontSectionHeading
                }
              >
                <span>⚙</span>

                <div>
                  <h3>管理設定</h3>

                  <small>
                    客人不會直接看到這一區
                  </small>
                </div>
              </div>

              <div
                className={
                  styles.twoColumns
                }
              >
                <label>
                  <span>
                    前台分類 *
                  </span>

                  <select
                    value={
                      storefrontCategory
                    }
                    onChange={(
                      event
                    ) =>
                      changeCategory(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      請選擇前台分類
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={
                            item.name
                          }
                        >
                          {item.name}
                          {item.isActive
                            ? ""
                            : "（停用）"}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>商品系列</span>

                  <select
                    value={series}
                    disabled={
                      !storefrontCategory
                    }
                    onChange={(
                      event
                    ) =>
                      setSeries(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      不指定系列
                    </option>

                    {seriesOptions.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={
                            item.name
                          }
                        >
                          {item.name}
                          {item.isActive
                            ? ""
                            : "（停用）"}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>
            </section>
          </div>
        )}

        {error ? (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#fff0f0",
              color: "#9d293d",
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#eff8f0",
              color: "#28633a",
            }}
          >
            {success}
          </div>
        ) : null}

        <div className={styles.actions}>
          <Link href="/admin/bundle-offers">
            返回組合優惠管理
          </Link>

          <Link
            href={`/admin/bundle-offers/${initialOffer.id}`}
          >
            編輯組合
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving
              ? "儲存中..."
              : tab === "card"
                ? "儲存商品卡"
                : "儲存商品資訊"}
          </button>
        </div>
      </div>
<MediaPicker
        open={galleryPickerOpen}
        title="選擇商品輪播圖片"
        onClose={() =>
          setGalleryPickerOpen(false)
        }
        onSelect={addGalleryImage}
      />
    </>
  );
}
