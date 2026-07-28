"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  singleUnitPrice: string;
  singlePriceLabel: string;
};

type PlanDraft = {
  id: string;
  requiredQuantity: string;
  price: string;
  note: string;
  buyQuantity: string;
  freeQuantity: string;
  bonusGiftName: string;
  bonusGiftQuantity: string;
  bonusGiftUnitLabel: string;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function numberText(value?: number) {
  return typeof value === "number"
    ? String(value)
    : "";
}

function positiveNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : undefined;
}

function moneyLabel(value: number) {
  return `$${value.toLocaleString("zh-TW")}`;
}

function moveItem<T>(
  items: T[],
  index: number,
  direction: -1 | 1
) {
  const target = index + direction;

  if (target < 0 || target >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);

  return next;
}

export default function ComboConfigEditor({
  productId,
  initialConfig,
}: Props) {
  const [comboType, setComboType] = useState<
    "mix_match" | "buy_get"
  >(initialConfig.type ?? "mix_match");

  const [unitLabel, setUnitLabel] = useState(
    initialConfig.unitLabel || "件"
  );

  const [
    allowSameProduct,
    setAllowSameProduct,
  ] = useState(
    initialConfig.allowSameProduct ?? true
  );

  const [
    singleUnitPrice,
    setSingleUnitPrice,
  ] = useState(
    numberText(initialConfig.singleUnitPrice)
  );

  const [
    originalSinglePriceLabel,
    setOriginalSinglePriceLabel,
  ] = useState(
    initialConfig.singlePriceLabel ?? ""
  );

  const [comboNote, setComboNote] = useState(
    initialConfig.note ?? ""
  );

  const [options, setOptions] =
    useState<OptionDraft[]>(
      initialConfig.options.map((option) => ({
        id: option.id,
        productId: option.productId,
        name: option.name,
        singleUnitPrice: numberText(
          option.singleUnitPrice
        ),
        singlePriceLabel:
          option.singlePriceLabel ?? "",
      }))
    );

  const [plans, setPlans] =
    useState<PlanDraft[]>(
      initialConfig.plans.map((plan) => ({
        id: plan.id,
        requiredQuantity: String(
          plan.requiredQuantity
        ),
        price: String(plan.price),
        note: plan.note ?? "",

        buyQuantity: numberText(
          plan.buyQuantity ??
            Math.max(
              plan.requiredQuantity - 1,
              1
            )
        ),

        freeQuantity: numberText(
          plan.freeQuantity ?? 1
        ),

        bonusGiftName:
          plan.bonusGift?.name ?? "",

        bonusGiftQuantity:
          numberText(
            plan.bonusGift?.quantity
          ),

        bonusGiftUnitLabel:
          plan.bonusGift?.unitLabel ?? "組",
      }))
    );

  const [catalog, setCatalog] = useState<
    CatalogProduct[]
  >([]);

  const [catalogLoading, setCatalogLoading] =
    useState(false);

  const [pickerOpen, setPickerOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);

      try {
        const response = await fetch(
          "/api/storefront/products"
        );

        if (!response.ok) {
          throw new Error(
            "無法讀取商品資料"
          );
        }

        const data = (await response.json()) as {
          products?: CatalogProduct[];
        };

        if (cancelled) return;

        setCatalog(
          (data.products ?? []).filter(
            (product) =>
              product.id !== productId &&
              !product.comboConfig
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const selectedProductIds = useMemo(
    () =>
      new Set(
        options
          .map((option) => option.productId)
          .filter(
            (id): id is number =>
              typeof id === "number"
          )
      ),
    [options]
  );

  const filteredCatalog = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return catalog
      .filter((product) => {
        if (!keyword) return true;

        return product.name
          .toLowerCase()
          .includes(keyword);
      })
      .slice(0, 40);
  }, [catalog, search]);

  function addCatalogProduct(
    product: CatalogProduct
  ) {
    setOptions((current) => {
      if (
        current.some(
          (option) =>
            option.productId === product.id
        )
      ) {
        return current;
      }

      /*
       * 舊組合資料有些只有名稱、沒有 productId。
       * 名稱剛好相同時直接補上連結，
       * 不另外新增重複品項。
       */
      const legacyIndex =
        current.findIndex(
          (option) =>
            !option.productId &&
            option.name === product.name
        );

      if (legacyIndex >= 0) {
        const next = [...current];

        next[legacyIndex] = {
          ...next[legacyIndex],
          productId: product.id,
        };

        return next;
      }

      return [
        ...current,
        {
          id: createId("option"),
          productId: product.id,
          name: product.name,
          singleUnitPrice: "",
          singlePriceLabel: "",
        },
      ];
    });
  }

  function updateOptionName(
    index: number,
    value: string
  ) {
    setOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex === index
          ? {
              ...option,
              name: value,
            }
          : option
      )
    );
  }

  function updateOptionPrice(
    index: number,
    value: string
  ) {
    setOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex === index
          ? {
              ...option,
              singleUnitPrice: value,
              /*
               * 價格有被修改時，
               * 讓顯示文字重新自動產生。
               */
              singlePriceLabel: "",
            }
          : option
      )
    );
  }

  function updatePlan(
    index: number,
    patch: Partial<PlanDraft>
  ) {
    setPlans((current) =>
      current.map((plan, itemIndex) =>
        itemIndex === index
          ? { ...plan, ...patch }
          : plan
      )
    );
  }

  const serializedConfig =
    useMemo<ComboConfig>(() => {
      const commonPrice =
        positiveNumber(singleUnitPrice);

      const nextOptions: ComboOption[] =
        options
          .filter((option) => option.name.trim())
          .map((option) => {
          const optionPrice =
            positiveNumber(
              option.singleUnitPrice
            );

          return {
            id: option.id,
            ...(option.productId
              ? {
                  productId:
                    option.productId,
                }
              : {}),

            name: option.name.trim(),

            ...(optionPrice
              ? {
                  singleUnitPrice:
                    optionPrice,

                  singlePriceLabel:
                    option.singlePriceLabel ||
                    `單${unitLabel} ${moneyLabel(
                      optionPrice
                    )}`,
                }
              : {}),
          };
        });

      const nextPlans: ComboPlan[] =
        plans.map((plan, index) => {
          const price =
            positiveNumber(plan.price) ??
            0;

          const buyQuantity =
            positiveNumber(
              plan.buyQuantity
            );

          const freeQuantity =
            positiveNumber(
              plan.freeQuantity
            );

          const mixQuantity =
            positiveNumber(
              plan.requiredQuantity
            ) ?? 1;

          const requiredQuantity =
            comboType === "buy_get"
              ? (buyQuantity ?? 0) +
                  (freeQuantity ?? 0) ||
                1
              : mixQuantity;

          const label =
            comboType === "buy_get"
              ? `買${buyQuantity ?? 0}送${
                  freeQuantity ?? 0
                }・共 ${requiredQuantity} ${unitLabel}`
              : `任選 ${requiredQuantity} ${unitLabel}`;

          const giftQuantity =
            positiveNumber(
              plan.bonusGiftQuantity
            );

          return {
            id:
              plan.id ||
              `plan-${index + 1}`,

            label,
            requiredQuantity,
            price,
            priceLabel:
              moneyLabel(price),

            ...(plan.note.trim()
              ? {
                  note:
                    plan.note.trim(),
                }
              : {}),

            ...(comboType ===
              "buy_get" &&
            buyQuantity &&
            freeQuantity
              ? {
                  buyQuantity,
                  freeQuantity,
                }
              : {}),

            ...(comboType ===
              "mix_match" &&
            plan.bonusGiftName.trim() &&
            giftQuantity
              ? {
                  bonusGift: {
                    name:
                      plan.bonusGiftName.trim(),

                    quantity:
                      giftQuantity,

                    unitLabel:
                      plan.bonusGiftUnitLabel.trim() ||
                      "組",
                  },
                }
              : {}),
          };
        });

      return {
        productId,
        type: comboType,
        unitLabel:
          unitLabel.trim() || "件",

        allowSameProduct,

        options: nextOptions,
        plans: nextPlans,

        ...(commonPrice
          ? {
              singleUnitPrice:
                commonPrice,

              singlePriceLabel:
                originalSinglePriceLabel ||
                `單${unitLabel} ${moneyLabel(
                  commonPrice
                )}`,
            }
          : {}),

        ...(comboNote.trim()
          ? {
              note:
                comboNote.trim(),
            }
          : {}),
      };
    }, [
      allowSameProduct,
      comboNote,
      comboType,
      options,
      plans,
      productId,
      singleUnitPrice,
      originalSinglePriceLabel,
      unitLabel,
    ]);

  const hasBasicProblem =
    serializedConfig.options.length === 0 ||
    serializedConfig.plans.length === 0;

  return (
    <div className={styles.editor}>
      <input
        type="hidden"
        name="comboConfig"
        value={JSON.stringify(
          serializedConfig
        )}
      />

      {/* 01 組合方式 */}
      <section className={styles.section}>
        <div className={styles.stepHeading}>
          <span>01</span>

          <div>
            <h2>組合方式</h2>
            <small>
              選擇這張組合商品怎麼賣
            </small>
          </div>
        </div>

        <div className={styles.typeSwitch}>
          <button
            type="button"
            className={
              comboType === "mix_match"
                ? styles.active
                : ""
            }
            onClick={() =>
              setComboType("mix_match")
            }
          >
            任選搭配
            <small>
              例如任選 3 件 $1,600
            </small>
          </button>

          <button
            type="button"
            className={
              comboType === "buy_get"
                ? styles.active
                : ""
            }
            onClick={() =>
              setComboType("buy_get")
            }
          >
            買幾送幾
            <small>
              例如買 2 送 1
            </small>
          </button>
        </div>

        <div className={styles.twoColumns}>
          <label>
            <span>商品單位</span>

            <input
              value={unitLabel}
              onChange={(event) =>
                setUnitLabel(
                  event.target.value
                )
              }
              placeholder="盒、瓶、條、桶、件"
            />

            <small>
              客人會看到「任選 3
              盒」之類的文字。
            </small>
          </label>

          <label>
            <span>
              全部品項單買價
              <em>選填</em>
            </span>

            <div className={styles.moneyInput}>
              <b>NT$</b>

              <input
                type="number"
                min="0"
                value={singleUnitPrice}
                onChange={(event) => {
                  setSingleUnitPrice(
                    event.target.value
                  );

                  setOriginalSinglePriceLabel(
                    ""
                  );
                }}
                placeholder="例如 590"
              />
            </div>

            <small>
              每個品項價格不同時可留空。
            </small>
          </label>
        </div>

        <button
          type="button"
          className={
            allowSameProduct
              ? styles.toggleOn
              : styles.toggleOff
          }
          onClick={() =>
            setAllowSameProduct(
              (current) => !current
            )
          }
        >
          <span>
            <strong>
              允許同款重複選擇
            </strong>

            <small>
              例如 3 條都選薰衣草護手霜
            </small>
          </span>

          <i aria-hidden="true" />
        </button>
      </section>

      {/* 02 可選商品 */}
      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div className={styles.stepHeading}>
            <span>02</span>

            <div>
              <h2>可選商品</h2>
              <small>
                客人可以搭配哪些商品
              </small>
            </div>
          </div>

          <div className={styles.sectionActions}>
            <button
              type="button"
              className={styles.primarySmall}
              onClick={() =>
                setOptions((current) => [
                  ...current,
                  {
                    id: createId("option"),
                    name: "",
                    singleUnitPrice: "",
                    singlePriceLabel: "",
                  },
                ])
              }
            >
              ＋組合內品項
            </button>

            <button
              type="button"
              className={styles.primarySmall}
              onClick={() =>
                setPickerOpen(
                  (current) => !current
                )
              }
            >
              {pickerOpen
                ? "收起商品庫"
                : "＋商品庫"}
            </button>
          </div>
        </div>

        {pickerOpen && (
          <div className={styles.picker}>
            <div className={styles.searchBox}>
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="搜尋已建立的一般商品"
                autoFocus
              />
            </div>

            {catalogLoading ? (
              <p className={styles.empty}>
                正在讀取商品…
              </p>
            ) : (
              <div
                className={
                  styles.catalogList
                }
              >
                {filteredCatalog.map(
                  (product) => {
                    const selected =
                      selectedProductIds.has(
                        product.id
                      );

                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={selected}
                        className={
                          styles.catalogItem
                        }
                        onClick={() =>
                          addCatalogProduct(
                            product
                          )
                        }
                      >
                        <span>
                          <strong>
                            {product.name}
                          </strong>

                          <small>
                            {product.price}
                          </small>
                        </span>

                        <b>
                          {selected
                            ? "已加入"
                            : "加入"}
                        </b>
                      </button>
                    );
                  }
                )}

                {!filteredCatalog.length && (
                  <p
                    className={
                      styles.empty
                    }
                  >
                    找不到符合的商品。
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.optionList}>
          {options.map((option, index) => (
            <article
              className={styles.optionCard}
              key={option.id}
            >
              <div
                className={
                  styles.optionHeader
                }
              >
                <div>
                  <small>
                    品項 {index + 1}・
                    {option.productId
                      ? "商品庫"
                      : "組合內品項"}
                  </small>

                  {option.productId && (
                    <strong>
                      {option.name}
                    </strong>
                  )}
                </div>

                <div
                  className={
                    styles.rowActions
                  }
                >
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      setOptions(
                        moveItem(
                          options,
                          index,
                          -1
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
                      options.length - 1
                    }
                    onClick={() =>
                      setOptions(
                        moveItem(
                          options,
                          index,
                          1
                        )
                      )
                    }
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      setOptions(
                        options.filter(
                          (_, itemIndex) =>
                            itemIndex !== index
                        )
                      )
                    }
                  >
                    移除
                  </button>
                </div>
              </div>

              {!option.productId ? (
                <label
                  className={
                    styles.compactField
                  }
                >
                  <span>
                    組合內品項名稱
                  </span>

                  <input
                    value={option.name}
                    onChange={(event) =>
                      updateOptionName(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="例如：薰衣草舒緩護手霜"
                  />

                  <small>
                    此品項只存在這張組合商品內，
                    不會另外建立一般商品卡。
                  </small>
                </label>
              ) : (
                <div
                  className={
                    styles.linkedNotice
                  }
                >
                  已連結商品庫：
                  {option.name}
                </div>
              )}

              <label
                className={
                  styles.compactField
                }
              >
                <span>
                  此品項單買價
                  <em>選填</em>
                </span>

                <div
                  className={
                    styles.moneyInput
                  }
                >
                  <b>NT$</b>

                  <input
                    type="number"
                    min="0"
                    value={
                      option.singleUnitPrice
                    }
                    onChange={(event) =>
                      updateOptionPrice(
                        index,
                        event.target.value
                      )
                    }
                    placeholder={
                      singleUnitPrice
                        ? `共同價 ${singleUnitPrice}`
                        : "例如 990"
                    }
                  />
                </div>
              </label>
            </article>
          ))}

          {options.length === 0 && (
            <div
              className={
                styles.emptyState
              }
            >
              <strong>
                還沒有可選商品
              </strong>

              <span>
                可新增「組合內品項」，或從「商品庫」選擇既有商品。
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 03 優惠方案 */}
      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div className={styles.stepHeading}>
            <span>03</span>

            <div>
              <h2>優惠方案</h2>

              <small>
                {comboType === "mix_match"
                  ? "設定任選數量與組合價"
                  : "設定買幾、送幾與活動價"}
              </small>
            </div>
          </div>

          <button
            type="button"
            className={styles.primarySmall}
            onClick={() =>
              setPlans((current) => [
                ...current,
                {
                  id: createId("plan"),
                  requiredQuantity: "3",
                  price: "",
                  note: "",
                  buyQuantity: "2",
                  freeQuantity: "1",
                  bonusGiftName: "",
                  bonusGiftQuantity: "",
                  bonusGiftUnitLabel: "組",
                },
              ])
            }
          >
            ＋新增方案
          </button>
        </div>

        <div className={styles.planList}>
          {plans.map((plan, index) => {
            const buy =
              positiveNumber(
                plan.buyQuantity
              ) ?? 0;

            const free =
              positiveNumber(
                plan.freeQuantity
              ) ?? 0;

            const total =
              comboType === "buy_get"
                ? buy + free
                : positiveNumber(
                    plan.requiredQuantity
                  ) ?? 0;

            return (
              <article
                key={plan.id}
                className={
                  styles.planCard
                }
              >
                <div
                  className={
                    styles.planHeader
                  }
                >
                  <div>
                    <small>
                      方案 {index + 1}
                    </small>

                    <strong>
                      {comboType ===
                      "buy_get"
                        ? `買 ${buy} 送 ${free}・共 ${total} ${unitLabel}`
                        : `任選 ${total} ${unitLabel}`}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.removeButton
                    }
                    onClick={() =>
                      setPlans(
                        plans.filter(
                          (_, itemIndex) =>
                            itemIndex !== index
                        )
                      )
                    }
                  >
                    刪除
                  </button>
                </div>

                {comboType ===
                "mix_match" ? (
                  <div
                    className={
                      styles.planFields
                    }
                  >
                    <label>
                      <span>任選數量</span>

                      <div
                        className={
                          styles.unitInput
                        }
                      >
                        <input
                          type="number"
                          min="1"
                          value={
                            plan.requiredQuantity
                          }
                          onChange={(event) =>
                            updatePlan(
                              index,
                              {
                                requiredQuantity:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                        <b>
                          {unitLabel}
                        </b>
                      </div>
                    </label>

                    <label>
                      <span>
                        組合價
                      </span>

                      <div
                        className={
                          styles.moneyInput
                        }
                      >
                        <b>NT$</b>

                        <input
                          type="number"
                          min="0"
                          value={
                            plan.price
                          }
                          onChange={(event) =>
                            updatePlan(
                              index,
                              {
                                price:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />
                      </div>
                    </label>
                  </div>
                ) : (
                  <div
                    className={
                      styles.buyGetGrid
                    }
                  >
                    <label>
                      <span>購買</span>

                      <div
                        className={
                          styles.unitInput
                        }
                      >
                        <input
                          type="number"
                          min="1"
                          value={
                            plan.buyQuantity
                          }
                          onChange={(event) =>
                            updatePlan(
                              index,
                              {
                                buyQuantity:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                        <b>
                          {unitLabel}
                        </b>
                      </div>
                    </label>

                    <label>
                      <span>贈送</span>

                      <div
                        className={
                          styles.unitInput
                        }
                      >
                        <input
                          type="number"
                          min="1"
                          value={
                            plan.freeQuantity
                          }
                          onChange={(event) =>
                            updatePlan(
                              index,
                              {
                                freeQuantity:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                        <b>
                          {unitLabel}
                        </b>
                      </div>
                    </label>

                    <label>
                      <span>活動價</span>

                      <div
                        className={
                          styles.moneyInput
                        }
                      >
                        <b>NT$</b>

                        <input
                          type="number"
                          min="0"
                          value={
                            plan.price
                          }
                          onChange={(event) =>
                            updatePlan(
                              index,
                              {
                                price:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />
                      </div>
                    </label>
                  </div>
                )}

                <details
                  className={
                    styles.optional
                  }
                >
                  <summary>
                    其他設定
                    <span>選填</span>
                  </summary>

                  <label>
                    <span>方案說明</span>

                    <textarea
                      rows={2}
                      value={plan.note}
                      onChange={(event) =>
                        updatePlan(index, {
                          note:
                            event.target
                              .value,
                        })
                      }
                      placeholder="例如：限時優惠、活動說明"
                    />
                  </label>

                  {comboType ===
                    "mix_match" && (
                    <div
                      className={
                        styles.giftBox
                      }
                    >
                      <strong>
                        額外贈品
                      </strong>

                      <small>
                        沒有贈品可全部留空。
                      </small>

                      <label>
                        <span>
                          贈品名稱
                        </span>

                        <input
                          value={
                            plan.bonusGiftName
                          }
                          onChange={(
                            event
                          ) =>
                            updatePlan(
                              index,
                              {
                                bonusGiftName:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="例如：面膜 10 片"
                        />
                      </label>

                      <div
                        className={
                          styles.twoColumns
                        }
                      >
                        <label>
                          <span>
                            數量
                          </span>

                          <input
                            type="number"
                            min="1"
                            value={
                              plan.bonusGiftQuantity
                            }
                            onChange={(
                              event
                            ) =>
                              updatePlan(
                                index,
                                {
                                  bonusGiftQuantity:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </label>

                        <label>
                          <span>
                            單位
                          </span>

                          <input
                            value={
                              plan.bonusGiftUnitLabel
                            }
                            onChange={(
                              event
                            ) =>
                              updatePlan(
                                index,
                                {
                                  bonusGiftUnitLabel:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </details>
              </article>
            );
          })}

          {plans.length === 0 && (
            <div
              className={
                styles.emptyState
              }
            >
              <strong>
                還沒有優惠方案
              </strong>

              <span>
                至少新增一個方案才能正常販售。
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 04 補充說明 */}
      <section className={styles.section}>
        <div className={styles.stepHeading}>
          <span>04</span>

          <div>
            <h2>組合補充說明</h2>
            <small>
              沒有需要可留空
            </small>
          </div>
        </div>

        <textarea
          rows={3}
          value={comboNote}
          onChange={(event) =>
            setComboNote(
              event.target.value
            )
          }
          placeholder="例如：不同品項可自由搭配。"
        />
      </section>

      <div
        className={
          hasBasicProblem
            ? styles.summaryWarning
            : styles.summary
        }
      >
        <div>
          <strong>
            {comboType === "buy_get"
              ? "買幾送幾"
              : "任選搭配"}
          </strong>

          <span>
            {serializedConfig.options.length}
            個可選商品 ・{" "}
            {serializedConfig.plans.length}
            個優惠方案
          </span>
        </div>

        <b>
          {hasBasicProblem
            ? "設定尚未完整"
            : "設定完成"}
        </b>
      </div>
    </div>
  );
}
