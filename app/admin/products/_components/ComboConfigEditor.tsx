"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  ComboConfig,
  ComboOption,
  ComboPlan,
} from "../../../../lib/storefront-core";
import styles from "./combo-config-editor.module.css";

type Props = {
  productId: number;
  initialConfig: ComboConfig;
};

type ComboMode = "fixed_bundle" | "mix_match" | "buy_get";

type CatalogProduct = {
  id: number;
  name: string;
  price: string;
  comboConfig?: ComboConfig;
};

type OptionDraft = {
  id: string;
  productId?: number;
  name: string;
  quantity: string;
  singleUnitPrice: string;
};

type PlanDraft = {
  id: string;
  requiredQuantity: string;
  price: string;
  buyQuantity: string;
  freeQuantity: string;
  note: string;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function numberText(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "";
}

function positiveNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function money(value: number) {
  return `$${value.toLocaleString("zh-TW")}`;
}

function normalizeInitialOptions(config: ComboConfig): OptionDraft[] {
  return config.options.map((option) => ({
    id: option.id,
    productId: option.productId,
    name: option.name,
    quantity: numberText(option.quantity ?? 1),
    singleUnitPrice: numberText(option.singleUnitPrice),
  }));
}

function normalizeInitialPlans(config: ComboConfig): PlanDraft[] {
  if (config.plans.length > 0) {
    return config.plans.map((plan) => ({
      id: plan.id,
      requiredQuantity: numberText(plan.requiredQuantity),
      price: numberText(plan.price),
      buyQuantity: numberText(
        plan.buyQuantity ?? Math.max(plan.requiredQuantity - 1, 1)
      ),
      freeQuantity: numberText(plan.freeQuantity ?? 1),
      note: plan.note ?? "",
    }));
  }

  return [
    {
      id: createId("plan"),
      requiredQuantity: "1",
      price: "",
      buyQuantity: "2",
      freeQuantity: "1",
      note: "",
    },
  ];
}

export default function ComboConfigEditor({
  productId,
  initialConfig,
}: Props) {
  const [mode, setMode] = useState<ComboMode>(
    initialConfig.type ?? "mix_match"
  );
  const [unitLabel, setUnitLabel] = useState(
    initialConfig.unitLabel || "件"
  );
  const [allowSameProduct, setAllowSameProduct] = useState(
    initialConfig.allowSameProduct ?? true
  );
  const [singleUnitPrice, setSingleUnitPrice] = useState(
    numberText(initialConfig.singleUnitPrice)
  );
  const [note, setNote] = useState(initialConfig.note ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(
    normalizeInitialOptions(initialConfig)
  );
  const [plans, setPlans] = useState<PlanDraft[]>(
    normalizeInitialPlans(initialConfig)
  );
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [manualName, setManualName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const response = await fetch("/api/storefront/products", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          products?: CatalogProduct[];
        };

        if (!cancelled) {
          setCatalog(
            (payload.products ?? []).filter(
              (product) => product.id !== productId && !product.comboConfig
            )
          );
        }
      } catch (error) {
        console.error("組合商品目錄讀取失敗", error);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (mode === "fixed_bundle" && plans.length > 1) {
      setPlans([plans[0]]);
    }
  }, [mode, plans]);

  const selectedProductIds = useMemo(
    () =>
      new Set(
        options
          .map((option) => option.productId)
          .filter((id): id is number => typeof id === "number")
      ),
    [options]
  );

  const filteredCatalog = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return catalog.filter((product) => {
      if (selectedProductIds.has(product.id)) return false;
      if (!keyword) return true;
      return product.name.toLowerCase().includes(keyword);
    });
  }, [catalog, search, selectedProductIds]);

  const normalizedConfig = useMemo<ComboConfig>(() => {
    const normalizedOptions: ComboOption[] = options
      .filter((option) => option.name.trim())
      .map((option) => ({
        id: option.id,
        name: option.name.trim(),
        productId: option.productId,
        quantity:
          mode === "fixed_bundle"
            ? positiveNumber(option.quantity, 1)
            : undefined,
        singleUnitPrice:
          mode === "fixed_bundle"
            ? undefined
            : positiveNumber(option.singleUnitPrice) || undefined,
      }));

    let normalizedPlans: ComboPlan[];

    if (mode === "fixed_bundle") {
      const price = positiveNumber(plans[0]?.price ?? "");
      const totalQuantity = normalizedOptions.reduce(
        (total, option) => total + (option.quantity ?? 1),
        0
      );

      normalizedPlans = [
        {
          id: plans[0]?.id || "fixed-bundle",
          label: "固定套組",
          requiredQuantity: Math.max(totalQuantity, 1),
          price,
          priceLabel: price ? money(price) : "",
          note: plans[0]?.note.trim() || undefined,
        },
      ];
    } else if (mode === "buy_get") {
      normalizedPlans = plans.map((plan) => {
        const buyQuantity = positiveNumber(plan.buyQuantity, 1);
        const freeQuantity = positiveNumber(plan.freeQuantity, 1);
        const price = positiveNumber(plan.price);

        return {
          id: plan.id,
          label: `買 ${buyQuantity} 送 ${freeQuantity}`,
          requiredQuantity: buyQuantity + freeQuantity,
          buyQuantity,
          freeQuantity,
          price,
          priceLabel: price ? money(price) : "",
          note: plan.note.trim() || undefined,
        };
      });
    } else {
      normalizedPlans = plans.map((plan) => {
        const requiredQuantity = positiveNumber(
          plan.requiredQuantity,
          1
        );
        const price = positiveNumber(plan.price);

        return {
          id: plan.id,
          label: `任選 ${requiredQuantity} ${unitLabel || "件"}`,
          requiredQuantity,
          price,
          priceLabel: price ? money(price) : "",
          note: plan.note.trim() || undefined,
        };
      });
    }

    const commonSinglePrice = positiveNumber(singleUnitPrice);

    return {
      productId,
      type: mode,
      unitLabel: unitLabel.trim() || "件",
      allowSameProduct: mode === "fixed_bundle" ? false : allowSameProduct,
      options: normalizedOptions,
      plans: normalizedPlans,
      note: note.trim() || undefined,
      singleUnitPrice:
        mode === "fixed_bundle" ? undefined : commonSinglePrice || undefined,
      singlePriceLabel:
        mode === "fixed_bundle" || !commonSinglePrice
          ? undefined
          : `單${unitLabel.trim() || "件"} ${money(commonSinglePrice)}`,
    };
  }, [
    allowSameProduct,
    mode,
    note,
    options,
    plans,
    productId,
    singleUnitPrice,
    unitLabel,
  ]);

  const pricePreview = useMemo(() => {
    if (mode === "fixed_bundle") {
      const price = normalizedConfig.plans[0]?.price ?? 0;
      return price ? `組合價 ${money(price)}` : "尚未設定套組價格";
    }

    const parts: string[] = [];
    if (normalizedConfig.singleUnitPrice) {
      parts.push(
        `單${normalizedConfig.unitLabel} ${money(
          normalizedConfig.singleUnitPrice
        )}`
      );
    }

    for (const plan of normalizedConfig.plans) {
      if (!plan.price) continue;
      parts.push(`${plan.label.replace(/\s+/g, "")} ${money(plan.price)}`);
    }

    return parts.join("｜") || "尚未設定優惠方案";
  }, [mode, normalizedConfig]);

  function addCatalogProduct(product: CatalogProduct) {
    setOptions((current) => [
      ...current,
      {
        id: `product-${product.id}`,
        productId: product.id,
        name: product.name,
        quantity: "1",
        singleUnitPrice: "",
      },
    ]);
  }

  function addManualOption() {
    const name = manualName.trim();
    if (!name) return;

    setOptions((current) => [
      ...current,
      {
        id: createId("option"),
        name,
        quantity: "1",
        singleUnitPrice: "",
      },
    ]);
    setManualName("");
  }

  function updateOption(
    index: number,
    field: keyof OptionDraft,
    value: string
  ) {
    setOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex === index ? { ...option, [field]: value } : option
      )
    );
  }

  function moveOption(index: number, direction: -1 | 1) {
    setOptions((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function addPlan() {
    setPlans((current) => [
      ...current,
      {
        id: createId("plan"),
        requiredQuantity: "2",
        price: "",
        buyQuantity: "2",
        freeQuantity: "1",
        note: "",
      },
    ]);
  }

  function updatePlan(
    index: number,
    field: keyof PlanDraft,
    value: string
  ) {
    setPlans((current) =>
      current.map((plan, itemIndex) =>
        itemIndex === index ? { ...plan, [field]: value } : plan
      )
    );
  }

  return (
    <section className={styles.editor}>
      <input
        type="hidden"
        name="comboConfig"
        value={JSON.stringify(normalizedConfig)}
      />

      <header className={styles.hero}>
        <div>
          <span>COMBO PRICING</span>
          <h2>組合價格與方案</h2>
          <p>所有組合商品都在這一頁修改價格、內容與優惠規則。</p>
        </div>
        <strong>{pricePreview}</strong>
      </header>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <b>01</b>
          <div>
            <h3>販售方式</h3>
            <p>先選擇這個組合商品屬於哪一種。</p>
          </div>
        </div>

        <div className={styles.modeGrid}>
          {[
            ["fixed_bundle", "固定套組", "固定內容、單一套組價格"],
            ["mix_match", "任選搭配", "客人自由選數量與品項"],
            ["buy_get", "買幾送幾", "設定買幾、送幾與活動價"],
          ].map(([value, title, description]) => (
            <button
              key={value}
              type="button"
              className={mode === value ? styles.modeActive : ""}
              onClick={() => setMode(value as ComboMode)}
            >
              <strong>{title}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <b>02</b>
          <div>
            <h3>價格與優惠方案</h3>
            <p>真正影響前台與購物車的價格只在這裡修改。</p>
          </div>
        </div>

        <div className={styles.basicGrid}>
          <label>
            <span>計量單位</span>
            <input
              value={unitLabel}
              onChange={(event) => setUnitLabel(event.target.value)}
              placeholder="件、盒、瓶、組"
            />
          </label>

          {mode !== "fixed_bundle" && (
            <label>
              <span>共同單買價（選填）</span>
              <div className={styles.moneyInput}>
                <em>NT$</em>
                <input
                  type="number"
                  min="0"
                  value={singleUnitPrice}
                  onChange={(event) => setSingleUnitPrice(event.target.value)}
                  placeholder="例如 500"
                />
              </div>
            </label>
          )}
        </div>

        <div className={styles.planList}>
          {plans.map((plan, index) => (
            <article key={plan.id} className={styles.planCard}>
              <div className={styles.planHeader}>
                <div>
                  <small>方案 {index + 1}</small>
                  <strong>
                    {mode === "fixed_bundle"
                      ? "固定套組售價"
                      : mode === "buy_get"
                        ? `買 ${plan.buyQuantity || "-"} 送 ${
                            plan.freeQuantity || "-"
                          }`
                        : `任選 ${plan.requiredQuantity || "-"} ${unitLabel}`}
                  </strong>
                </div>

                {mode !== "fixed_bundle" && plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setPlans((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    刪除
                  </button>
                )}
              </div>

              <div className={styles.planFields}>
                {mode === "mix_match" && (
                  <label>
                    <span>任選數量</span>
                    <input
                      type="number"
                      min="1"
                      value={plan.requiredQuantity}
                      onChange={(event) =>
                        updatePlan(index, "requiredQuantity", event.target.value)
                      }
                    />
                  </label>
                )}

                {mode === "buy_get" && (
                  <>
                    <label>
                      <span>購買數量</span>
                      <input
                        type="number"
                        min="1"
                        value={plan.buyQuantity}
                        onChange={(event) =>
                          updatePlan(index, "buyQuantity", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span>贈送數量</span>
                      <input
                        type="number"
                        min="1"
                        value={plan.freeQuantity}
                        onChange={(event) =>
                          updatePlan(index, "freeQuantity", event.target.value)
                        }
                      />
                    </label>
                  </>
                )}

                <label>
                  <span>{mode === "fixed_bundle" ? "套組售價" : "優惠價"}</span>
                  <div className={styles.moneyInput}>
                    <em>NT$</em>
                    <input
                      type="number"
                      min="0"
                      value={plan.price}
                      onChange={(event) =>
                        updatePlan(index, "price", event.target.value)
                      }
                      placeholder="輸入價格"
                    />
                  </div>
                </label>

                <label className={styles.fullField}>
                  <span>方案補充說明（選填）</span>
                  <input
                    value={plan.note}
                    onChange={(event) =>
                      updatePlan(index, "note", event.target.value)
                    }
                    placeholder="例如：同款可重複選"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>

        {mode !== "fixed_bundle" && (
          <button type="button" className={styles.addButton} onClick={addPlan}>
            ＋ 新增優惠方案
          </button>
        )}
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <b>03</b>
          <div>
            <h3>組合商品內容</h3>
            <p>
              {mode === "fixed_bundle"
                ? "設定固定套組包含哪些商品與數量。"
                : "設定客人可選擇的商品。"}
            </p>
          </div>
        </div>

        <div className={styles.optionList}>
          {options.length === 0 ? (
            <div className={styles.empty}>尚未加入商品內容。</div>
          ) : (
            options.map((option, index) => (
              <article key={option.id} className={styles.optionCard}>
                <div className={styles.optionOrder}>{index + 1}</div>
                <label>
                  <span>品項名稱</span>
                  <input
                    value={option.name}
                    onChange={(event) =>
                      updateOption(index, "name", event.target.value)
                    }
                  />
                </label>

                {mode === "fixed_bundle" ? (
                  <label className={styles.smallField}>
                    <span>數量</span>
                    <input
                      type="number"
                      min="1"
                      value={option.quantity}
                      onChange={(event) =>
                        updateOption(index, "quantity", event.target.value)
                      }
                    />
                  </label>
                ) : (
                  <label className={styles.smallField}>
                    <span>個別單買價</span>
                    <input
                      type="number"
                      min="0"
                      value={option.singleUnitPrice}
                      onChange={(event) =>
                        updateOption(index, "singleUnitPrice", event.target.value)
                      }
                      placeholder="選填"
                    />
                  </label>
                )}

                <div className={styles.optionActions}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveOption(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === options.length - 1}
                    onClick={() => moveOption(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    刪除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className={styles.addRow}>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setShowPicker((current) => !current)}
          >
            ＋ 從商品目錄加入
          </button>

          <div className={styles.manualAdd}>
            <input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="或輸入自訂品項名稱"
            />
            <button type="button" onClick={addManualOption}>
              加入
            </button>
          </div>
        </div>

        {showPicker && (
          <div className={styles.picker}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜尋商品名稱"
            />
            <div>
              {filteredCatalog.slice(0, 50).map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addCatalogProduct(product)}
                >
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode !== "fixed_bundle" && (
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={allowSameProduct}
              onChange={(event) => setAllowSameProduct(event.target.checked)}
            />
            允許同一品項重複選擇
          </label>
        )}
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <b>04</b>
          <div>
            <h3>商品卡價格預覽</h3>
            <p>首頁、分類頁與商品詳情將使用同一份價格資料。</p>
          </div>
        </div>
        <div className={styles.preview}>{pricePreview}</div>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <b>05</b>
          <div>
            <h3>補充說明</h3>
            <p>活動限制、贈品或其他需要告知客人的內容。</p>
          </div>
        </div>
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="例如：實際庫存與活動期限依 LINE 小幫手確認。"
        />
      </section>
    </section>
  );
}
