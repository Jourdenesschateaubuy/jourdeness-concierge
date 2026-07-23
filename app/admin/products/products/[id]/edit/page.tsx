import { notFound } from "next/navigation";
import { getDatabaseProduct } from "../../../../../lib/product-repository";
import { updateProductAction } from "../../../products/actions";
import ProductForm from "../../../products/_components/ProductForm";
import styles from "../../../admin.module.css";
import formStyles from "../../../products/_components/product-form.module.css";

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

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>EDIT PRODUCT</p>
          <h1>編輯商品</h1>
          <p>{product.name}</p>
        </div>
      </header>

      {saved ? (
        <div className={formStyles.section} style={{ padding: 14 }}>
          <strong style={{ color: "#286242" }}>
            ✓ {saved === "created" ? "商品已建立" : "商品變更已儲存"}
          </strong>
        </div>
      ) : null}

      <ProductForm
        product={product}
        action={updateProductAction}
        submitLabel="儲存變更"
      />
    </div>
  );
}
