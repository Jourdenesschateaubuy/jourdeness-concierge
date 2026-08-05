import { notFound } from "next/navigation";
import { getDatabaseProduct } from "../../../../../lib/product-repository";
import { getComboConfig as getFallbackComboConfig } from "../../../../../lib/storefront-core";
import type { ComboConfig } from "../../../../../lib/storefront-core";
import { updateProductAction } from "../../actions";
import ProductCardEditForm from "../../_components/ProductCardEditForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tab?: string }>;
};

function firstMoneyValue(value: string) {
  const matches = [...value.matchAll(/(?:\$|NT\$?)?\s*([\d,]+)/g)];
  const candidate = matches.at(-1)?.[1]?.replace(/,/g, "");
  const price = Number(candidate);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function createFixedBundleConfig(
  productId: number,
  priceText: string
): ComboConfig {
  const price = firstMoneyValue(priceText);

  return {
    productId,
    type: "fixed_bundle",
    unitLabel: "組",
    allowSameProduct: false,
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

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id: idRaw } = await params;
  const { saved, tab } = await searchParams;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getDatabaseProduct(id);
  if (!product) notFound();

  const comboConfig =
    product.comboConfig ??
    getFallbackComboConfig(product.id) ??
    (product.category === "組合價"
      ? createFixedBundleConfig(product.id, product.price)
      : undefined);

  const editableProduct = comboConfig
    ? { ...product, comboConfig }
    : product;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>PRODUCT EDITOR</p>
          <h1>{comboConfig ? "編輯組合商品" : "編輯商品"}</h1>
          <p>商品卡、價格方案與商品資訊分頁儲存，不會互相覆蓋。</p>
        </div>
      </header>

      {saved ? (
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 14, background: "#f7eef0", color: "#862642", fontWeight: 800, fontSize: 13 }}>
          ✓ 商品變更已儲存
        </div>
      ) : null}

      <ProductCardEditForm
        product={editableProduct}
        action={updateProductAction}
        initialTab={tab === "combo" && comboConfig ? "combo" : "card"}
      />
    </div>
  );
}
