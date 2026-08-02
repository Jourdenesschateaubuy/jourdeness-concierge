"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryConfig } from "../../../../lib/storefront-core";
import type {
  DatabaseProduct,
  ProductStatus,
} from "../../../../lib/product-repository";
import ProductImageUploader from "./ProductImageUploader";
import ComboConfigEditor from "./ComboConfigEditor";
import styles from "./product-card-edit-form.module.css";

type Props = {
  product: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
};

type Tab = "card" | "combo" | "detail";

type ExpandedItem = {
  title: string;
  content: string;
};

const categories = Object.keys(categoryConfig);

function normalizeOriginalPriceInput(value: string) {
  const match = value.trim().match(/^原價\s*\$\s*([\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function normalizeSellingPriceInput(value: string) {
  const match = value.trim().match(/^產地價\s*\$\s*([\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function formatMoney(value: string) {
  const normalized = value.trim().replace(/,/g, "");

  if (!/^\d+$/.test(normalized)) return null;

  return Number(normalized).toLocaleString("en-US");
}

function formatOriginalPricePreview(value: string) {
  const formatted = formatMoney(value);
  return formatted ? `原價 $ ${formatted}` : value;
}

function formatSellingPricePreview(
  value: string,
  category: string
) {
  const formatted = formatMoney(value);

  if (!formatted) return value;

  const label =
    category === "外部廠商"
      ? "售價"
      : category === "組合價"
        ? "活動價"
        : "產地價";

  return `${label} $ ${formatted}`;
}

const statusLabels: Record<ProductStatus, string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function defaultUsageText(product: DatabaseProduct) {
  const existing = product.usage?.trim();
  if (existing) return existing;

  const fullText = [
    product.name,
    product.series,
    product.category,
    ...(product.suitableFor ?? []),
  ].join(" ");

  if (
    product.category === "保健食品" ||
    product.category === "健康補給"
  ) {
    return "每日建議依產品標示或客服說明食用。";
  }

  if (
    fullText.includes("卸妝") ||
    fullText.includes("潔顏") ||
    fullText.includes("洗顏")
  ) {
    return "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。";
  }

  if (fullText.includes("面膜")) {
    return "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。";
  }

  if (product.category === "保養品") {
    return "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。";
  }

  if (
    product.category === "精油" ||
    product.category === "精油香氛"
  ) {
    if (
      product.series.includes("精油配件") ||
      product.series.includes("擴香設備") ||
      fullText.includes("擴香機") ||
      fullText.includes("水氧機")
    ) {
      return "依商品標示搭配精油或擴香配件使用，實際操作請以產品說明為準。";
    }

    return "依商品標示搭配擴香設備或擴香配件使用，請避免直接接觸眼周與黏膜。";
  }

  if (
    product.category === "洗沐" ||
    product.category === "身體洗護" ||
    product.category === "牙膏" ||
    product.category === "護唇膏"
  ) {
    return "依商品標示方式日常使用，使用後如有不適請暫停使用並洽詢客服。";
  }

  return "";
}

export default function ProductCardEditForm({
  product,
  action,
}: Props) {
  const [tab, setTab] = useState<Tab>("card");
  const hasCombo = Boolean(product.comboConfig);

  const [name, setName] = useState(product.name ?? "");
  const [originalPrice, setOriginalPrice] = useState(
    normalizeOriginalPriceInput(product.originalPrice ?? "")
  );
  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean((product.originalPrice ?? "").trim())
  );
  const [price, setPrice] = useState(
    normalizeSellingPriceInput(product.price ?? "")
  );
  const [status, setStatus] = useState<ProductStatus>(
    product.status ?? "active"
  );

const initialCategory = product.category?.trim() ?? "";

const [category, setCategory] = useState<string>(
  categories.includes(initialCategory)
    ? initialCategory
    : categories[0] || "保養品"
);
  const [series, setSeries] = useState(product.series ?? "");
  const [spec, setSpec] = useState(product.spec ?? "");
  const [expiryNote, setExpiryNote] = useState(
    product.expiryNote ?? ""
  );
  const [intro, setIntro] = useState(product.intro ?? "");
  const [priceNote, setPriceNote] = useState(
    product.priceNote ?? ""
  );
  const [usage, setUsage] = useState(
    defaultUsageText(product)
  );
  const [notice, setNotice] = useState(
    product.notice ??
      "滿 NT$3,000 享免運，僅提供宅配。\n送出資料後，請至 LINE 與小幫手確認庫存、效期、金額、付款方式與宅配資訊。"
  );

  const [features, setFeatures] = useState<string[]>(
    product.features?.length ? product.features : [""]
  );

  const [suitableFor, setSuitableFor] = useState<string[]>(
    product.suitableFor?.length ? product.suitableFor : [""]
  );

  const [expandedInfo, setExpandedInfo] = useState<ExpandedItem[]>(
    product.expandedInfo?.length
      ? product.expandedInfo
      : []
  );

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="category" value={category} />

      {/* 不顯示，但保留原資料 */}
      <input type="hidden" name="sku" value={product.sku ?? ""} />
      <input
        type="hidden"
        name="description"
        value={product.description ?? ""}
      />
      <input
        type="hidden"
        name="cardName"
        value={product.cardName ?? ""}
      />
      <input
        type="hidden"
        name="cardSubtitle"
        value={product.cardSubtitle ?? ""}
      />
      <input
        type="hidden"
        name="internalExpiryDate"
        value={product.internalExpiryDate ?? ""}
      />
      <input
        type="hidden"
        name="sortOrder"
        value={product.sortOrder ?? 0}
      />

      {(product.gallery ?? []).map((image, index) => (
        <input
          key={`gallery-${index}`}
          type="hidden"
          name="gallery"
          value={image}
        />
      ))}

      <div
        className={styles.tabs}
        style={{
          gridTemplateColumns: hasCombo
            ? "repeat(3, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
        }}
      >
        <button
          type="button"
          className={tab === "card" ? styles.activeTab : ""}
          onClick={() => setTab("card")}
        >
          商品卡
        </button>

        {hasCombo && (
          <button
            type="button"
            className={tab === "combo" ? styles.activeTab : ""}
            onClick={() => setTab("combo")}
          >
            組合內容
          </button>
        )}

        <button
          type="button"
          className={tab === "detail" ? styles.activeTab : ""}
          onClick={() => setTab("detail")}
        >
          商品資訊
        </button>
      </div>

      {tab === "card" && (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>商品卡</span>
            <h2>客人第一眼看到的內容</h2>
          </div>

          <section className={styles.imageSection}>
            <div className={styles.imageHeading}>
              <div>
                <strong>商品主圖</strong>
                <span>商品卡＋商品詳情主圖</span>
              </div>

               <small>
                建議尺寸：750 × 795 px
                <br />
                建議比例：1 : 1.06
                <br />
                建議格式：JPG
                <br />
                使用位置：商品卡＋商品詳情主圖
              </small>
            </div>

            <ProductImageUploader
              initialImage={product.image ?? ""}
            />
          </section>

          <div className={styles.fields}>
            <label>
              <span>商品名稱</span>
              <input
                name="name"
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </label>

            <label className={styles.priceToggle}>
              <span>
                <input
                  className={styles.priceToggleBox}
                  type="checkbox"
                  checked={showOriginalPrice}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setShowOriginalPrice(checked);

                    if (!checked) {
                      setOriginalPrice("");
                    }
                  }}
                />
                顯示原價
              </span>
            </label>

            <div className={styles.twoColumns}>
              <label>
                <span>原價（NT$）</span>
                <input
                  name="originalPrice"
                  value={showOriginalPrice ? originalPrice : ""}
                  disabled={!showOriginalPrice}
                  inputMode="numeric"
                  onChange={(event) =>
                    setOriginalPrice(event.target.value)
                  }
                  placeholder="例如：2980"
                />
                {!showOriginalPrice ? (
                  <input
                    type="hidden"
                    name="originalPrice"
                    value=""
                  />
                ) : null}
              </label>

              <label>
                <span>售價（NT$）</span>
                <input
                  name="price"
                  required
                  inputMode="numeric"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="例如：2160"
                />
              </label>
            </div>

            <label>
              <span>價格下方說明</span>
              <textarea
                name="priceNote"
                rows={3}
                value={priceNote}
                onChange={(event) =>
                  setPriceNote(event.target.value)
                }
                placeholder="例如：實際優惠與庫存依 LINE 小幫手確認為準。"
              />
            </label>

            <label>
              <span>商品狀態</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProductStatus)
                }
              >
                <option value="active">上架中</option>
                <option value="inactive">下架</option>
                <option value="coming_soon">
                  新品預告
                </option>
                <option value="sold_out">售罄</option>
              </select>
            </label>
          </div>

          <div className={styles.cardPreview}>
            <small>即時預覽</small>

            {status !== "active" && (
              <span className={styles.previewBadge}>
                {statusLabels[status]}
              </span>
            )}

            <strong>{name || "商品名稱"}</strong>

            {originalPrice && (
              <del>{formatOriginalPricePreview(originalPrice)}</del>
            )}

            <b>
              {price
                ? formatSellingPricePreview(price, category)
                : "尚未設定售價"}
            </b>

            <button type="button" disabled>
              加入
            </button>
          </div>
        </div>
      )}

      {hasCombo && product.comboConfig && (
        <div hidden={tab !== "combo"}>
          <ComboConfigEditor
            productId={product.id}
            initialConfig={product.comboConfig}
          />
        </div>
      )}

      {tab === "detail" && (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>商品資訊</span>
            <h2>照客人看到的商品頁順序修改</h2>
            <p className={styles.frontOrderNote}>
              從上往下就是前台商品資訊的顯示順序。
            </p>
          </div>

          {/* 1. 商品資訊 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>01</span>
              <div>
                <h3>商品資訊</h3>
                <small>對應前台「商品資訊」卡片</small>
              </div>
            </div>

            <label>
              <span>規格／組合內容</span>
              <input
                name="spec"
                value={spec}
                onChange={(event) =>
                  setSpec(event.target.value)
                }
                placeholder="例如：30mL／瓶"
              />
            </label>

            <label>
              <span>效期</span>
              <textarea
                name="expiryNote"
                rows={3}
                value={expiryNote}
                onChange={(event) =>
                  setExpiryNote(event.target.value)
                }
                placeholder="例如：2029.06.14　實際效期以商品包裝標示為準"
              />
            </label>

            <label>
              <span>商品簡介</span>
              <textarea
                name="intro"
                rows={4}
                value={intro}
                onChange={(event) =>
                  setIntro(event.target.value)
                }
                placeholder="顯示在規格、效期下方的商品介紹文字"
              />
            </label>
          </section>

          {/* 2. 三張全站共用服務卡 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>02</span>
              <div>
                <h3>購買服務提醒</h3>
                <small>目前為全站共用內容</small>
              </div>
            </div>

            <div className={styles.servicePreviewGrid}>
              <div className={styles.servicePreviewCard}>
                <strong>滿額免運</strong>
                <span>滿 NT$3,000 享免運</span>
              </div>

              <div className={styles.servicePreviewCard}>
                <strong>宅配出貨</strong>
                <span>目前僅提供宅配</span>
              </div>

              <div className={styles.servicePreviewCard}>
                <strong>LINE 確認</strong>
                <span>庫存效期確認</span>
              </div>
            </div>

            <p className={styles.sectionHelp}>
              這三張卡片屬於全站設定，因此在單一商品內先顯示預覽，不重複修改。
            </p>
          </section>

          {/* 3. 商品特色 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>03</span>
                <div>
                  <h3>商品特色</h3>
                  <small>前台一條一條顯示</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeatures([...features, ""])
                }
              >
                ＋新增
              </button>
            </div>

            <div className={styles.repeatList}>
              {features.map((feature, index) => (
                <div
                  className={styles.repeatItem}
                  key={`feature-${index}`}
                >
                  <input
                    name="features"
                    value={feature}
                    placeholder={`商品特色 ${index + 1}`}
                    onChange={(event) => {
                      const next = [...features];
                      next[index] = event.target.value;
                      setFeatures(next);
                    }}
                  />

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(
                          moveItem(features, index, index - 1)
                        )
                      }
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(
                          moveItem(features, index, index + 1)
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
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. 了解更多 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>04</span>
                <div>
                  <h3>了解更多</h3>
                  <small>前台可展開的完整產品資訊</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExpandedInfo([
                    ...expandedInfo,
                    { title: "", content: "" },
                  ])
                }
              >
                ＋新增
              </button>
            </div>

            {expandedInfo.length === 0 ? (
              <p className={styles.emptyText}>
                目前沒有額外資訊。
              </p>
            ) : (
              <div className={styles.repeatList}>
                {expandedInfo.map((item, index) => (
                  <div
                    className={styles.expandedItem}
                    key={`expanded-${index}`}
                  >
                    <input
                      name="expandedInfoTitle"
                      value={item.title}
                      placeholder="區塊標題"
                      onChange={(event) => {
                        const next = [...expandedInfo];

                        next[index] = {
                          ...next[index],
                          title: event.target.value,
                        };

                        setExpandedInfo(next);
                      }}
                    />

                    <textarea
                      name="expandedInfoContent"
                      rows={3}
                      value={item.content}
                      placeholder="區塊內容"
                      onChange={(event) => {
                        const next = [...expandedInfo];

                        next[index] = {
                          ...next[index],
                          content: event.target.value,
                        };

                        setExpandedInfo(next);
                      }}
                    />

                    <button
                      type="button"
                      className={styles.deleteWide}
                      onClick={() =>
                        setExpandedInfo(
                          expandedInfo.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除這一段
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 5. 適合需求 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>05</span>
                <div>
                  <h3>適合需求</h3>
                  <small>前台會顯示成標籤</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuitableFor([...suitableFor, ""])
                }
              >
                ＋新增
              </button>
            </div>

            <div className={styles.repeatList}>
              {suitableFor.map((item, index) => (
                <div
                  className={styles.repeatItem}
                  key={`suitable-${index}`}
                >
                  <input
                    name="suitableFor"
                    value={item}
                    placeholder={`需求標籤 ${index + 1}`}
                    onChange={(event) => {
                      const next = [...suitableFor];
                      next[index] = event.target.value;
                      setSuitableFor(next);
                    }}
                  />

                  <div className={styles.itemActions}>
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
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. 使用方式 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>06</span>
              <div>
                <h3>
                  {category === "保健食品"
                    ? "食用方式"
                    : "使用方式"}
                </h3>
                <small>對應前台使用說明</small>
              </div>
            </div>

            <textarea
              name="usage"
              rows={5}
              value={usage}
              onChange={(event) =>
                setUsage(event.target.value)
              }
              placeholder="輸入客人會在商品頁看到的完整使用方式"
            />
          </section>

          {/* 7. 配送提醒 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>07</span>
              <div>
                <h3>配送提醒</h3>
                <small>前台會依換行分成不同段落</small>
              </div>
            </div>

            <textarea
              name="notice"
              rows={5}
              value={notice}
              onChange={(event) =>
                setNotice(event.target.value)
              }
              placeholder="每一段可用換行分開"
            />
          </section>

          {/* 8. 更多商品圖片 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>08</span>
              <div>
                <h3>更多商品圖片</h3>
                <small>商品資訊頁的其他圖片</small>
              </div>
            </div>

            <p className={styles.emptyText}>
              目前共 {product.gallery?.length ?? 0} 張。
              多圖片上傳與拖曳排序會在圖片管理階段接入；
              現有圖片這次儲存不會遺失。
            </p>
          </section>

          {/* 管理資料，不屬於商品頁內容 */}
          <section
            className={`${styles.detailSection} ${styles.managementSection}`}
          >
            <div className={styles.frontSectionHeading}>
              <span>⚙</span>
              <div>
                <h3>管理設定</h3>
                <small>客人不會直接看到這一區</small>
              </div>
            </div>

            <div className={styles.twoColumns}>
              <label>
                <span>商品分類</span>
                <select
                  name="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>商品系列</span>
                <input
                  name="series"
                  value={series}
                  onChange={(event) =>
                    setSeries(event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/admin">返回管理</Link>

        <button type="submit">
          儲存變更
        </button>
      </div>
    </form>
  );
}
