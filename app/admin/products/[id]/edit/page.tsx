import { notFound } from "next/navigation";
import { getDatabaseProduct } from "../../../../../lib/product-repository";
import { updateProductAction } from "../../actions";
import ProductCardEditForm from "../../_components/ProductCardEditForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tab?: string; from?: string }>;
};

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id: idRaw } = await params;
  const { saved, tab, from } = await searchParams;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getDatabaseProduct(id);
  if (!product) notFound();


  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            {product.displayCode} · PRODUCT EDITOR
          </p>
          <h1>編輯一般商品</h1>
          <p>
            內部資料庫 ID #{product.id} 保留不變；後台以 {product.displayCode} 管理。
          </p>
        </div>
      </header>

      {saved ? (
        <div
          id="save-status"
          role="status"
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
          ✓ 商品變更已儲存
        </div>
      ) : null}

      <ProductCardEditForm
        product={product}
        action={updateProductAction}
        initialTab={tab === "detail" ? "detail" : "card"}
        returnTo={from === "health" ? "/admin/products/health" : undefined}
      />
    </div>
  );
}
