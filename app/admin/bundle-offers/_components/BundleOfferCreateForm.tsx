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

type Props = {
  products: ProductOption[];
};

type SelectedItem = {
  productId: number;
  quantity: number;
};

export default function BundleOfferCreateForm({
  products,
}: Props) {
  const router = useRouter();

  const [bundleType, setBundleType] =
    useState<"fixed_bundle" | "mix_match" | "buy_get">(
      "fixed_bundle"
    );

  const [name, setName] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [unitLabel, setUnitLabel] = useState("組");
  const [status, setStatus] = useState("inactive");
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    SelectedItem[]
  >([]);

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

    if (bundleType !== "fixed_bundle") {
      setError("目前先完成固定組合；任選組合與買送活動下一步開放。");
      return;
    }

    if (!name.trim()) {
      setError("請輸入組合優惠名稱。");
      return;
    }

    if (!selectedItems.length) {
      setError("請至少選擇一個一般商品。");
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
      const requiredQuantity = selectedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const response = await fetch(
        "/api/admin/bundle-offers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            bundleType: "fixed_bundle",
            unitLabel: unitLabel.trim() || "組",
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
                requiredQuantity,
                priceAmount: normalizedPrice,
                sortOrder: 0,
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "建立組合優惠失敗。"
        );
      }

      router.push("/admin/bundle-offers");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "建立組合優惠失敗。"
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
        <h2>3. 從一般商品選擇</h2>

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

      <section
        style={{
          border: "1px solid #eadfda",
          borderRadius: 18,
          padding: 24,
          background: "#fff",
        }}
      >
        <h2>5. 設定優惠方案</h2>

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
          <div>
            <strong>一般商品合計</strong>
            <div style={{ fontSize: 24, marginTop: 6 }}>
              NT${originalTotal.toLocaleString()}
            </div>
          </div>

          <label>
            <div>
              <strong>組合優惠價（NT$）</strong>
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

          {savings > 0 ? (
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
        <h2>6. 建立前預覽</h2>

        {!selectedItems.length ? (
          <p>選擇商品後，這裡會顯示完整組合摘要。</p>
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
              固定組合
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
                    {" × "}
                    {item.quantity}
                  </div>
                );
              })}
            </div>

            <div>
              一般商品合計：
              NT${originalTotal.toLocaleString()}
            </div>

            <div>
              優惠價：
              {normalizedOfferPrice > 0
                ? `NT$${normalizedOfferPrice.toLocaleString()}`
                : "尚未設定"}
            </div>

            {savings > 0 ? (
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
          ? "建立中..."
          : "建立組合優惠"}
      </button>
    </div>
  );
}
