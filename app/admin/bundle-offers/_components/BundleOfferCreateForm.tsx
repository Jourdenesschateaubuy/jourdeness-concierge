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

  const [allowSameProduct, setAllowSameProduct] =
    useState(initialOffer?.allowSameProduct ?? true);

  const [buyProductId, setBuyProductId] =
    useState<number | null>(
      initialOffer?.items.find(
        (item) => item.role === "buy"
      )?.productId ?? null
    );

  const [freeProductId, setFreeProductId] =
    useState<number | null>(
      initialOffer?.items.find(
        (item) => item.role === "free"
      )?.productId ?? null
    );

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
          item.role === "option"
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
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

  function addProduct(productId: number) {
    setSelectedItems((current) => {
      if (current.some((item) => item.productId === productId)) {
        return current;
      }

      return [
        ...current,
        {
          productId,
          quantity: 1,
        },
      ];
    });
  }

  function removeProduct(productId: number) {
    setSelectedItems((current) =>
      current.filter((item) => item.productId !== productId)
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

    if (
      bundleType === "buy_get" &&
      (buyProductId === null || freeProductId === null)
    ) {
      setError("請選擇購買商品與贈送商品。");
      return;
    }

    const normalizedPrice = Number(priceAmount);

    if (
      !Number.isInteger(normalizedPrice) ||
      normalizedPrice <= 0
    ) {
      setError("優惠價請輸入大於 0 的整數。");
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

                plans: [
                  {
                    code: "default",
                    label: `任選 ${mixMatchRequiredQuantity} 件`,
                    requiredQuantity: mixMatchRequiredQuantity,
                    priceAmount: normalizedPrice,
                    sortOrder: 0,
                  },
                ],
              }
            : {
                name: name.trim(),
                bundleType: "buy_get",
                unitLabel: "組",
                allowSameProduct: false,
                status,
                sortOrder: 0,

                items: [
                  {
                    productId: buyProductId as number,
                    role: "buy",
                    quantity: normalizedBuyQuantity,
                    sortOrder: 0,
                  },
                  {
                    productId: freeProductId as number,
                    role: "free",
                    quantity: normalizedFreeQuantity,
                    sortOrder: 1,
                  },
                ],

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
            ? "設定購買與贈送商品"
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) 140px minmax(0, 1fr) 140px",
              gap: 16,
              alignItems: "end",
            }}
          >
            <label>
              <div>
                <strong>購買商品</strong>
              </div>

              <select
                value={buyProductId ?? ""}
                onChange={(event) =>
                  setBuyProductId(
                    event.target.value
                      ? Number(event.target.value)
                      : null
                  )
                }
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                }}
              >
                <option value="">請選擇購買商品</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.displayCode}　{product.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div>
                <strong>購買數量</strong>
              </div>

              <input
                type="number"
                min={1}
                value={buyQuantity}
                onChange={(event) =>
                  setBuyQuantity(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                }}
              />
            </label>

            <label>
              <div>
                <strong>贈送商品</strong>
              </div>

              <select
                value={freeProductId ?? ""}
                onChange={(event) =>
                  setFreeProductId(
                    event.target.value
                      ? Number(event.target.value)
                      : null
                  )
                }
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                }}
              >
                <option value="">請選擇贈送商品</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.displayCode}　{product.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div>
                <strong>贈送數量</strong>
              </div>

              <input
                type="number"
                min={1}
                value={freeQuantity}
                onChange={(event) =>
                  setFreeQuantity(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                }}
              />
            </label>
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

        {bundleType === "buy_get" ? (
          buyProductId === null || freeProductId === null ? (
            <p>請先選擇購買商品與贈送商品。</p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "#f8f4f2",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  購買商品
                </div>

                <strong>
                  {
                    products.find(
                      (product) =>
                        product.id === buyProductId
                    )?.displayCode
                  }
                  {"　"}
                  {
                    products.find(
                      (product) =>
                        product.id === buyProductId
                    )?.name
                  }
                  {" × "}
                  {buyQuantity || "0"}
                </strong>
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                ＋
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "#f8f4f2",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  贈送商品
                </div>

                <strong>
                  {
                    products.find(
                      (product) =>
                        product.id === freeProductId
                    )?.displayCode
                  }
                  {"　"}
                  {
                    products.find(
                      (product) =>
                        product.id === freeProductId
                    )?.name
                  }
                  {" × "}
                  {freeQuantity || "0"}
                </strong>
              </div>
            </div>
          )
        ) : !selectedItems.length ? (
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
                  key={item.productId}
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
                      可選商品
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removeProduct(item.productId)
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
            <label>
              <div>
                <strong>需選數量</strong>
              </div>

              <input
                type="number"
                min={1}
                value={requiredQuantity}
                onChange={(event) =>
                  setRequiredQuantity(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 8,
                }}
              />

              <small>
                例如：填 3，代表客人必須選滿 3 件。
              </small>
            </label>

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

              <span>
                允許同款商品重複選擇
              </span>
            </label>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "#f8f4f2",
              }}
            >
              {allowSameProduct
                ? `客人可從目前選定商品中自由搭配，選滿 ${requiredQuantity || "指定"} 件；同一商品可重複。`
                : `客人可從目前選定商品中自由搭配，選滿 ${requiredQuantity || "指定"} 件；每款最多選 1 件。`}
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
            <div>
              <strong>任選規則</strong>
              <div style={{ fontSize: 18, marginTop: 6 }}>
                任選 {requiredQuantity || "指定"} 件
                {allowSameProduct ? "・可同款重複" : "・每款限 1 件"}
              </div>
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
          buyProductId === null || freeProductId === null ? (
            <p>
              選擇購買商品與贈送商品後，
              這裡會顯示完整活動摘要。
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
                <strong>購買：</strong>
                {
                  products.find(
                    (product) =>
                      product.id === buyProductId
                  )?.displayCode
                }
                {"　"}
                {
                  products.find(
                    (product) =>
                      product.id === buyProductId
                  )?.name
                }
                {" × "}
                {buyQuantity || "0"}
              </div>

              <div>
                <strong>贈送：</strong>
                {
                  products.find(
                    (product) =>
                      product.id === freeProductId
                  )?.displayCode
                }
                {"　"}
                {
                  products.find(
                    (product) =>
                      product.id === freeProductId
                  )?.name
                }
                {" × "}
                {freeQuantity || "0"}
              </div>

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
