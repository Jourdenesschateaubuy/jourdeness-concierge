import { createProductAction } from "../actions";
import ProductForm from "../_components/ProductForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type NewProductPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const params = await searchParams;
  const productType =
    params.type === "combo" ? "combo" : "product";

  const isCombo = productType === "combo";

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            {isCombo ? "NEW COMBO PRODUCT" : "NEW PRODUCT"}
          </p>

          <h1>
            {isCombo ? "新增組合商品" : "新增一般商品"}
          </h1>

          <p>
            {isCombo
              ? "先建立組合商品主資料，建立完成後再設定方案與組合內容。"
              : "建立一般商品主資料。商品 ID 會由資料庫自動產生。"}
          </p>
        </div>
      </header>

      <ProductForm
        action={createProductAction}
        submitLabel={isCombo ? "建立組合商品" : "建立一般商品"}
        productType={productType}
      />
    </div>
  );
}
