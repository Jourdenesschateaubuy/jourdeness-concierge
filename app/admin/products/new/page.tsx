import { redirect } from "next/navigation";
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

  if (params.type === "combo") {
    redirect("/admin/bundle-offers/new");
  }
  const productType =
    params.type === "combo" ? "combo" : "product";

  const isCombo = productType === "combo";

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            "NEW PRODUCT"
          </p>

          <h1>
            "新增一般商品"
          </h1>

          <p>
            {isCombo
              ? "先建立組合商品主資料，系統會自動分配 C-xxxx 編號，再設定方案與組合內容。"
              : "建立一般商品主資料。系統會自動分配 P-xxxx 商品編號，內部資料庫 ID 保留自動產生。"}
          </p>
        </div>
      </header>

      <ProductForm
        action={createProductAction}
        submitLabel="建立一般商品"
        productType={productType}
      />
    </div>
  );
}
