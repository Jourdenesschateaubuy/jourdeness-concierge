"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductOption = {
  id: number;
  displayCode: string;
  name: string;
  image: string;
  price: string;
  salePriceAmount?: number;
  status: string;
  category: string;
  series: string;
};

type BundleType =
  | "fixed_bundle"
  | "mix_match"
  | "buy_get";

type InitialBundleOffer = {
  id: number;
  name: string;
  bundleType: BundleType;
  unitLabel: string;
  allowSameProduct: boolean;
  status: string;
  sortOrder: number;

  items: Array<{
    productId: number;
    role: "fixed" | "option" | "buy" | "free";
    quantity: number;
    sortOrder: number;
  }>;

  plans: Array<{
    code: string;
    label: string;
    requiredQuantity?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    priceAmount: number;
    sortOrder: number;
  }>;
};

type Props = {
  products: ProductOption[];
  mode?: "create" | "edit";
  initialOffer?: InitialBundleOffer;
};

type SelectedItem = {
  productId: number;
  quantity: number;
  role: "fixed" | "option" | "buy" | "free";
};

type MixMatchPlanDraft = {
  code: string;
  label: string;
  requiredQuantity: string;
  priceAmount: string;
};

export default function BundleOfferCreateForm({
  products,
  mode = "create",
  initialOffer,
}: Props) {
  const router = useRouter();

  const initialPlan = initialOffer?.plans[0];

  const [bundleType, setBundleType] =
    useState<BundleType>(
      initialOffer?.bundleType ?? "fixed_bundle"
    );

  const [name, setName] =
    useState(initialOffer?.name ?? "");

  const [priceAmount, setPriceAmount] =
    useState(
      initialPlan?.priceAmount != null
        ? String(initialPlan.priceAmount)
        : ""
    );
  const [unitLabel, setUnitLabel] = useState(initialOffer?.unitLabel ?? "組");
  const [status, setStatus] =
    useState(initialOffer?.status ?? "inactive");

  const [requiredQuantity, setRequiredQuantity] =
    useState(
      initialPlan?.requiredQuantity != null
        ? String(initialPlan.requiredQuantity)
        : "3"
    );

  const [mixMatchPlans, setMixMatchPlans] =
    useState<MixMatchPlanDraft[]>(
      initialOffer?.bundleType === "mix_match" &&
      initialOffer.plans.length > 0
        ? initialOffer.plans.map((plan, index) => ({
            code: plan.code || `plan-${index + 1}`,
            label: plan.label || "",
            requiredQuantity:
              plan.requiredQuantity != null
                ? String(plan.requiredQuantity)
                : "",
            priceAmount: String(plan.priceAmount),
          }))
        : [
            {
              code: "default",
              label: "",
              requiredQuantity:
                initialPlan?.requiredQuantity != null
                  ? String(initialPlan.requiredQuantity)
                  : "3",
              priceAmount:
                initialPlan?.priceAmount != null
                  ? String(initialPlan.priceAmount)
                  : "",
            },
          ]
    );

  const [allowSameProduct, setAllowSameProduct] =
    useState(initialOffer?.allowSameProduct ?? true);


  const [buyQuantity, setBuyQuantity] =
    useState(
      initialPlan?.buyQuantity != null
        ? String(initialPlan.buyQuantity)
        : String(
            initialOffer?.items.find(
              (item) => item.role === "buy"
            )?.quantity ?? 1
          )
    );

  const [freeQuantity, setFreeQuantity] =
    useState(
      initialPlan?.freeQuantity != null
        ? String(initialPlan.freeQuantity)
        : String(
            initialOffer?.items.find(
              (item) => item.role === "free"
            )?.quantity ?? 1
          )
    );

  const [query, setQuery] = useState("");

  const [selectedItems, setSelectedItems] = useState<
    SelectedItem[]
  >(
    initialOffer?.items
      .filter(
        (item) =>
          item.role === "fixed" ||
          item.role === "option" ||
          (
            initialOffer.bundleType === "buy_get" &&
            (
              item.role === "buy" ||
              item.role === "free"
            )
          )
      )
      .map((item) => ({
        productId: item.productId,
        quantity:
          initialOffer.bundleType === "buy_get"
            ? 1
            : item.quantity,
        role: item.role,
      })) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const text = [
        product.displayCode,
        product.name,
        product.category,
        product.series,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [products, query]);

  const originalTotal = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const product = products.find(
        (candidate) => candidate.id === item.productId
      );

      const unitPrice = product?.salePriceAmount ?? 0;

      return total + unitPrice * item.quantity;
    }, 0);
  }, [products, selectedItems]);

  const normalizedOfferPrice = Number(priceAmount);

  const savings =
    Number.isFinite(normalizedOfferPrice) &&
    normalizedOfferPrice > 0 &&
    originalTotal > normalizedOfferPrice
      ? originalTotal - normalizedOfferPrice
      : 0;

  function addProduct(
    productId: number,
    role?: SelectedItem["role"]
  ) {
    const resolvedRole =
      role ??
      (bundleType === "fixed_bundle"
        ? "fixed"
        : bundleType === "mix_match"
          ? "option"
          : "buy");

    setSelectedItems((current) => {
      if (
        current.some(
          (item) =>
            item.productId === productId &&
            item.role === resolvedRole
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          productId,
          quantity: 1,
          role: resolvedRole,
        },
      ];
    });
  }

  function removeProduct(
    productId: number,
    role?: SelectedItem["role"]
  ) {
    setSelectedItems((current) =>
      current.filter(
        (item) =>
          !(
            item.productId === productId &&
            (role === undefined || item.role === role)
          )
      )
    );
  }

  function updateQuantity(
    productId: number,
    quantity: number
  ) {
    const safeQuantity = Math.max(1, quantity);

    setSelectedItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item
      )
    );
  }

  function addMixMatchPlan() {
    setMixMatchPlans((current) => [
      ...current,
      {
        code: `plan-${Date.now()}`,
        label: "",
        requiredQuantity: "",
        priceAmount: "",
      },
    ]);
  }

  function updateMixMatchPlan(
    index: number,
    patch: Partial<MixMatchPlanDraft>
  ) {
    setMixMatchPlans((current) =>
      current.map((plan, planIndex) =>
        planIndex === index
          ? { ...plan, ...patch }
          : plan
      )
    );
  }

  function removeMixMatchPlan(index: number) {
    setMixMatchPlans((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter(
        (_plan, planIndex) => planIndex !== index
      );
    });
  }
  async function handleSubmit() {
    setError("");


    if (!name.trim()) {
      setError("請輸入組合優惠名稱。");
      return;
    }

    if (
      bundleType !== "buy_get" &&
      !selectedItems.length
    ) {
      setError("請至少選擇一個一般商品。");
      return;
    }

    if (bundleType === "buy_get") {
      const hasBuyProduct = selectedItems.some(
        (item) => item.role === "buy"
      );
      const hasFreeProduct = selectedItems.some(
        (item) => item.role === "free"
      );

      if (!hasBuyProduct || !hasFreeProduct) {
        setError(
          "買送活動請至少各選擇一個購買商品與贈送商品。"
        );
        return;
      }
    }

    const normalizedPrice = Number(priceAmount);

    if (
      bundleType !== "mix_match" &&
      (
        !Number.isInteger(normalizedPrice) ||
        normalizedPrice <= 0
      )
    ) {
      setError("優惠價請輸入大於 0 的整數。");
      return;
    }

    const normalizedMixMatchPlans =
      mixMatchPlans.map((plan, index) => ({
        code:
          plan.code.trim() ||
          `plan-${index + 1}`,
        label: plan.label.trim(),
        requiredQuantity:
          Number(plan.requiredQuantity),
        priceAmount:
          Number(plan.priceAmount),
        sortOrder: index,
      }));

    if (
      bundleType === "mix_match" &&
      normalizedMixMatchPlans.some(
        (plan) =>
          !Number.isInteger(plan.requiredQuantity) ||
          plan.requiredQuantity <= 0 ||
          !Number.isInteger(plan.priceAmount) ||
          plan.priceAmount <= 0
      )
    ) {
      setError(
        "每個任選方案的數量與優惠價都必須是大於 0 的整數。"
      );
      return;
    }

    setSaving(true);

    try {
      const fixedRequiredQuantity = selectedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const mixMatchRequiredQuantity = Number(requiredQuantity);
      const normalizedBuyQuantity = Number(buyQuantity);
      const normalizedFreeQuantity = Number(freeQuantity);

      if (
        bundleType === "buy_get" &&
        (
          !Number.isInteger(normalizedBuyQuantity) ||
          normalizedBuyQuantity <= 0 ||
          !Number.isInteger(normalizedFreeQuantity) ||
          normalizedFreeQuantity <= 0
        )
      ) {
        setError("購買數量與贈送數量都必須是大於 0 的整數。");
        setSaving(false);
        return;
      }

      if (
        bundleType === "mix_match" &&
        (!Number.isInteger(mixMatchRequiredQuantity) ||
          mixMatchRequiredQuantity <= 0)
      ) {
        setError("任選數量請輸入大於 0 的整數。");
        setSaving(false);
        return;
      }

      const payload =
        bundleType === "fixed_bundle"
          ? {
              name: name.trim(),
              bundleType: "fixed_bundle",
              unitLabel: "組",
              allowSameProduct: false,
              status,
              sortOrder: 0,

              items: selectedItems.map((item, index) => ({
                productId: item.productId,
                role: "fixed",
                quantity: item.quantity,
                sortOrder: index,
              })),

              plans: [
                {
                  code: "default",
                  label: name.trim(),
                  requiredQuantity: fixedRequiredQuantity,
                  priceAmount: normalizedPrice,
                  sortOrder: 0,
                },
              ],
            }
          : bundleType === "mix_match"
            ? {
                name: name.trim(),
                bundleType: "mix_match",
                unitLabel: "件",
                allowSameProduct,
                status,
                sortOrder: 0,

                items: selectedItems.map((item, index) => ({
                  productId: item.productId,
                  role: "option",
                  quantity: 1,
                  sortOrder: index,
                })),

                plans: normalizedMixMatchPlans.map(
                  (plan, index) => ({
                    code:
                      plan.code ||
                      `plan-${index + 1}`,
                    label:
                      plan.label ||
                      `任選 ${plan.requiredQuantity} ${unitLabel || "件"}`,
                    requiredQuantity:
                      plan.requiredQuantity,
                    priceAmount:
                      plan.priceAmount,
                    sortOrder: index,
                  })
                ),
              }
            : {
                name: name.trim(),
                bundleType: "buy_get",
                unitLabel: "組",
                allowSameProduct: false,
                status,
                sortOrder: 0,

                items: selectedItems
                  .filter(
                    (item) =>
                      item.role === "buy" ||
                      item.role === "free"
                  )
                  .map((item, index) => ({
                    productId: item.productId,
                    role: item.role,
                    quantity: 1,
                    sortOrder: index,
                  })),
                plans: [
                  {
                    code: "default",
                    label: `買 ${normalizedBuyQuantity} 送 ${normalizedFreeQuantity}`,
                    buyQuantity: normalizedBuyQuantity,
                    freeQuantity: normalizedFreeQuantity,
                    priceAmount: normalizedPrice,
                    sortOrder: 0,
                  },
                ],
              };

      const endpoint =
        mode === "edit" && initialOffer
          ? `/api/admin/bundle-offers/${initialOffer.id}`
          : "/api/admin/bundle-offers";

      const response = await fetch(
        endpoint,
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || (mode === "edit" ? "更新組合優惠失敗。" : "建立組合優惠失敗。")
        );
      }

      router.push("/admin/bundle-offers");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit" ? "更新組合優惠失敗。" : "建立組合優惠失敗。"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        maxWidth: 1100,
      }}
    >
      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>1. 選擇優惠類型</h2>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label>
            <input
              type="radio"
              name="bundleType"
              checked={bundleType === "fixed_bundle"}
              onChange={() =>
                setBundleType("fixed_bundle")
              }
            />
            {" "}
            <strong>固定組合</strong>
            <div>
              指定商品與數量，客人不能更換內容。
            </div>
          </label>

          <label>
            <input
              type="radio"
              name="bundleType"
              checked={bundleType === "mix_match"}
              onChange={() =>
                setBundleType("mix_match")
              }
            />
            {" "}
            <strong>任選組合</strong>
            <div>
              從指定商品中自由選滿數量。
            </div>
          </label>

          <label>
            <input
              type="radio"
              name="bundleType"
              checked={bundleType === "buy_get"}
              onChange={() =>
                setBundleType("buy_get")
              }
            />
            {" "}
            <strong>買送活動</strong>
            <div>
              購買指定商品並搭配贈品。
            </div>
          </label>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>2. 優惠基本資料</h2>

        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <label>
            <div>組合優惠名稱</div>
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="例如：龍血潔顏慕絲 2 瓶優惠"
              style={{
                width: "100%",
                padding: 12,
              }}
            />
          </label>


          <label>
            <div>狀態</div>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              style={{
                width: "100%",
                padding: 12,
              }}
            >
              <option value="inactive">下架</option>
              <option value="active">上架中</option>
              <option value="coming_soon">
                新品預告
              </option>
              <option value="sold_out">售罄</option>
            </select>
          </label>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>
          3. {bundleType === "buy_get"
            ? "選擇買送商品"
            : "從一般商品選擇"}
        </h2>

        {bundleType !== "buy_get" ? (
          <>
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="搜尋 P-編號、商品名稱、分類或系列"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
          }}
        />

        <div
          style={{
            display: "grid",
            gap: 12,
            maxHeight: 420,
            overflowY: "auto",
          }}
        >
          {filteredProducts.map((product) => {
            const selected = selectedItems.some(
              (item) =>
                item.productId === product.id
            );

            return (
              <div
                key={product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "72px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "contain",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                      background: "#f7f2ef",
                      color: "#8a7670",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    尚無圖片
                  </div>
                )}

                <div>
                  <strong>
                    {product.displayCode}
                    {"　"}
                    {product.name}
                  </strong>

                  <div>
                    {product.category}
                    {" · "}
                    {product.series}
                  </div>

                  <div>{product.price}</div>
                </div>

                <button
                  type="button"
                  disabled={selected}
                  onClick={() =>
                    addProduct(product.id)
                  }
                >
                  {selected ? "已選擇" : "加入組合"}
                </button>
              </div>
            );
          })}
        </div>
          </>
        ) : (
          <div>
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="搜尋 P-編號、商品名稱、分類或系列"
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 16,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <label>
                <div>
                  <strong>購買數量</strong>
                </div>
                <input
                  type="number"
                  min={1}
                  value={buyQuantity}
                  onChange={(event) => setBuyQuantity(event.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 8,
                  }}
                />
              </label>

              <label>
                <div>
                  <strong>贈送數量</strong>
                </div>
                <input
                  type="number"
                  min={1}
                  value={freeQuantity}
                  onChange={(event) => setFreeQuantity(event.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 8,
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {filteredProducts.map((product) => {
                const selectedAsBuy = selectedItems.some(
                  (item) =>
                    item.productId === product.id &&
                    item.role === "buy"
                );

                const selectedAsFree = selectedItems.some(
                  (item) =>
                    item.productId === product.id &&
                    item.role === "free"
                );

                return (
                  <div
                    key={product.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "72px 1fr auto",
                      gap: 16,
                      alignItems: "center",
                      border: "1px solid #eee",
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "contain",
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 10,
                          background: "#f7f2ef",
                          color: "#8a7670",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        尚無圖片
                      </div>
                    )}

                    <div>
                      <strong>
                        {product.displayCode}
                        {"　"}
                        {product.name}
                      </strong>

                      <div>
                        {product.category}
                        {" · "}
                        {product.series}
                      </div>

                      <div>{product.price}</div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        disabled={selectedAsBuy}
                        onClick={() =>
                          addProduct(product.id, "buy")
                        }
                      >
                        {selectedAsBuy
                          ? "已在購買池"
                          : "加入購買池"}
                      </button>

                      <button
                        type="button"
                        disabled={selectedAsFree}
                        onClick={() =>
                          addProduct(product.id, "free")
                        }
                      >
                        {selectedAsFree
                          ? "已在贈送池"
                          : "加入贈送池"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>4. 組合內容</h2>

        {!selectedItems.length ? (
          <p>尚未選擇商品。</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {selectedItems.map((item) => {
              const product = products.find(
                (candidate) =>
                  candidate.id === item.productId
              );

              if (!product) return null;

              return (
                <div
                  key={`${item.productId}-${item.role}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 120px auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>
                      {product.displayCode}
                      {"　"}
                      {product.name}
                    </strong>
                  </div>

                  {bundleType === "fixed_bundle" ? (
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.productId,
                          Number(event.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        padding: 10,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderRadius: 10,
                        background: "#f8f4f2",
                      }}
                    >
                      {bundleType === "buy_get"
                        ? item.role === "buy"
                          ? "購買候選"
                          : item.role === "free"
                            ? "贈送候選"
                            : "可選商品"
                        : "可選商品"}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removeProduct(
                        item.productId,
                        bundleType === "buy_get"
                          ? item.role
                          : undefined
                      )
                    }
                  >
                    移除
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {bundleType === "mix_match" ? (
        <section
          style={{
            border: "1px solid #eadfda",
            borderRadius: 18,
            padding: 24,
            background: "#fff",
          }}
        >
          <h2>5. 任選組合規則</h2>

          <div
            style={{
              display: "grid",
              gap: 18,
              marginTop: 16,
            }}
          >
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={allowSameProduct}
                onChange={(event) =>
                  setAllowSameProduct(event.target.checked)
                }
              />

              <span>允許同款商品重複選擇</span>
            </label>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "#f8f4f2",
              }}
            >
              {allowSameProduct
                ? "顧客可從商品池自由搭配，同一商品可以重複選擇。"
                : "顧客可從商品池自由搭配，每款商品最多選 1 件。"}
            </div>
          </div>
        </section>
      ) : null}

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>
          {bundleType === "mix_match"
            ? "6. 設定優惠方案"
            : "5. 設定優惠方案"}
        </h2>

        <p>
          商品與數量確認後，再設定這一組的實際優惠售價。
        </p>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
          }}
        >
          {bundleType === "fixed_bundle" ? (
            <div>
              <strong>一般商品合計</strong>
              <div style={{ fontSize: 24, marginTop: 6 }}>
                NT${originalTotal.toLocaleString()}
              </div>
            </div>
          ) : bundleType === "mix_match" ? (
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              {mixMatchPlans.map((plan, index) => (
                <div
                  key={plan.code}
                  style={{
                    border: "1px solid #eadfda",
                    borderRadius: 14,
                    padding: 16,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <strong>方案 {index + 1}</strong>

                    <button
                      type="button"
                      disabled={mixMatchPlans.length <= 1}
                      onClick={() =>
                        removeMixMatchPlan(index)
                      }
                    >
                      刪除方案
                    </button>
                  </div>

                  <label>
                    <div>
                      <strong>任選數量</strong>
                    </div>

                    <input
                      type="number"
                      min={1}
                      value={plan.requiredQuantity}
                      onChange={(event) =>
                        updateMixMatchPlan(index, {
                          requiredQuantity:
                            event.target.value,
                        })
                      }
                      placeholder="例如：4"
                      style={{
                        width: "100%",
                        padding: 12,
                        marginTop: 8,
                      }}
                    />
                  </label>

                  <label>
                    <div>
                      <strong>優惠價（NT$）</strong>
                    </div>

                    <input
                      type="number"
                      min={1}
                      value={plan.priceAmount}
                      onChange={(event) =>
                        updateMixMatchPlan(index, {
                          priceAmount:
                            event.target.value,
                        })
                      }
                      placeholder="例如：1099"
                      style={{
                        width: "100%",
                        padding: 12,
                        marginTop: 8,
                      }}
                    />
                  </label>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#f8f4f2",
                    }}
                  >
                    任選{" "}
                    {plan.requiredQuantity || "指定"}{" "}
                    {unitLabel || "件"}
                    {"　"}
                    NT${plan.priceAmount || "尚未設定"}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMixMatchPlan}
              >
                ＋ 新增方案
              </button>
            </div>
          ) : (
            <div>
              <strong>買送規則</strong>
              <div style={{ fontSize: 18, marginTop: 6 }}>
                買 {buyQuantity || "指定"} 送 {freeQuantity || "指定"}
              </div>
            </div>
          )}

          <label>
            <div>
              <strong>
                {bundleType === "buy_get"
                  ? "活動售價（NT$）"
                  : "組合優惠價（NT$）"}
              </strong>
            </div>

            <input
              type="number"
              min={1}
              value={priceAmount}
              onChange={(event) =>
                setPriceAmount(event.target.value)
              }
              placeholder="例如：960"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
              }}
            />
          </label>

          {bundleType === "fixed_bundle" && savings > 0 ? (
            <div>
              現省{" "}
              <strong>
                NT${savings.toLocaleString()}
              </strong>
            </div>
          ) : null}
        </div>
      </section>

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>
          {bundleType === "mix_match"
            ? "7. 建立前預覽"
            : "6. 建立前預覽"}
        </h2>

        {bundleType === "buy_get" ? (
          !selectedItems.some((item) => item.role === "buy") &&
          !selectedItems.some((item) => item.role === "free") ? (
            <p>
              選擇購買商品與贈送商品後，這裡會顯示完整活動摘要。
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 16,
              }}
            >
              <div>
                <strong>
                  {name.trim() || "尚未輸入組合優惠名稱"}
                </strong>
              </div>

              <div>買送活動</div>

              <div>
                <strong>購買商品池：</strong>
              </div>

              {selectedItems.some((item) => item.role === "buy") ? (
                <div
                  style={{
                    display: "grid",
                    gap: 6,
                  }}
                >
                  {selectedItems
                    .filter((item) => item.role === "buy")
                    .map((item) => {
                      const product = products.find(
                        (candidate) =>
                          candidate.id === item.productId
                      );

                      if (!product) return null;

                      return (
                        <div key={`${item.productId}-buy`}>
                          {product.displayCode}
                          {"　"}
                          {product.name}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div>尚未選擇購買商品</div>
              )}

              <div>
                <strong>贈送商品池：</strong>
              </div>

              {selectedItems.some((item) => item.role === "free") ? (
                <div
                  style={{
                    display: "grid",
                    gap: 6,
                  }}
                >
                  {selectedItems
                    .filter((item) => item.role === "free")
                    .map((item) => {
                      const product = products.find(
                        (candidate) =>
                          candidate.id === item.productId
                      );

                      if (!product) return null;

                      return (
                        <div key={`${item.productId}-free`}>
                          {product.displayCode}
                          {"　"}
                          {product.name}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div>尚未選擇贈送商品</div>
              )}

              <div>
                買送規則：
                買 {buyQuantity || "指定"} 送{" "}
                {freeQuantity || "指定"}
              </div>

              <div>
                活動售價：
                {normalizedOfferPrice > 0
                  ? `NT$${normalizedOfferPrice.toLocaleString()}`
                  : "尚未設定"}
              </div>

              <div>
                狀態：
                {status === "active"
                  ? "上架中"
                  : status === "inactive"
                    ? "下架"
                    : status === "coming_soon"
                      ? "新品預告"
                      : "售罄"}
              </div>
            </div>
          )
        ) : !selectedItems.length ? (
          <p>
            選擇商品後，這裡會顯示完整組合摘要。
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div>
              <strong>
                {name.trim() || "尚未輸入組合優惠名稱"}
              </strong>
            </div>

            <div>
              {bundleType === "fixed_bundle"
                ? "固定組合"
                : "任選組合"}
            </div>

            <div>
              {selectedItems.map((item) => {
                const product = products.find(
                  (candidate) =>
                    candidate.id === item.productId
                );

                if (!product) return null;

                return (
                  <div key={item.productId}>
                    {product.displayCode}
                    {"　"}
                    {product.name}

                    {bundleType === "fixed_bundle" ? (
                      <>
                        {" × "}
                        {item.quantity}
                      </>
                    ) : (
                      <>・可選</>
                    )}
                  </div>
                );
              })}
            </div>

            {bundleType === "fixed_bundle" ? (
              <div>
                一般商品合計：
                NT${originalTotal.toLocaleString()}
              </div>
            ) : (
              <div>
                任選規則：
                任選 {requiredQuantity || "指定"} 件
                {allowSameProduct
                  ? "・可同款重複"
                  : "・每款限 1 件"}
              </div>
            )}

            <div>
              優惠價：
              {normalizedOfferPrice > 0
                ? `NT$${normalizedOfferPrice.toLocaleString()}`
                : "尚未設定"}
            </div>

            {bundleType === "fixed_bundle" &&
            savings > 0 ? (
              <div>
                現省：NT${savings.toLocaleString()}
              </div>
            ) : null}

            <div>
              狀態：
              {status === "active"
                ? "上架中"
                : status === "inactive"
                  ? "下架"
                  : status === "coming_soon"
                    ? "新品預告"
                    : "售罄"}
            </div>
          </div>
        )}
      </section>

      {error ? (
        <div
          style={{
            color: "#a12632",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={handleSubmit}
        style={{
          padding: 16,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {saving
          ? mode === "edit"
            ? "儲存中..."
            : "建立中..."
          : mode === "edit"
            ? "儲存修改"
            : "建立組合優惠"}
      </button>
    </div>
  );
}
