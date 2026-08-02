import { notFound } from "next/navigation";

import { getDatabaseProduct } from "../../../../../lib/product-repository";
import { getComboConfig } from "../../../../../lib/storefront-core";
import { updateProductAction } from "../../actions";
import ProductCardEditForm from "../../_components/ProductCardEditForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id: idRaw } = await params;
  const { saved } = await searchParams;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const product = await getDatabaseProduct(id);

  if (!product) {
    notFound();
  }

  const legacyComboConfig =
    product.comboConfig ?? getComboConfig(product.id) ?? undefined;

  const editableProduct = legacyComboConfig
    ? {
        ...product,
        comboConfig: legacyComboConfig,
      }
    : product;

  const isComboProduct = Boolean(editableProduct.comboConfig);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            {isComboProduct ? "COMBO PRODUCT" : "PRODUCT CARD"}
          </p>

          <h1>
            {isComboProduct ? "編輯組合商品" : "編輯商品卡"}
          </h1>

          <p>
            {isComboProduct
              ? "可修改商品卡、組合內容與商品資訊。"
              : "只留下客人會在商品卡上看到的內容。"}
          </p>
        </div>
      </header>

      {saved ? (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 14,
            background: "#f7eef0",
            color: "#862642",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          ✓ {isComboProduct ? "組合商品" : "商品卡"}變更已儲存
        </div>
      ) : null}

      <ProductCardEditForm
        product={editableProduct}
        action={updateProductAction}
      />
    </div>
  );
}
