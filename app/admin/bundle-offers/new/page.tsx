import { listDatabaseProducts } from "../../../../lib/product-repository";
import BundleOfferCreateForm from "../_components/BundleOfferCreateForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewBundleOfferPage() {
  const products = await listDatabaseProducts({
    includeInactive: true,
  });

  const standardProducts = products.filter(
    (product) => product.productType === "standard"
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            NEW BUNDLE OFFER
          </p>

          <h1>新增組合優惠</h1>

          <p>
            組合優惠只能從既有一般商品建立。
          </p>
        </div>
      </header>

      <BundleOfferCreateForm
        products={standardProducts.map((product) => ({
          id: product.id,
          displayCode: product.displayCode,
          name: product.name,
          image: product.image,
          price: product.price,
          salePriceAmount: product.salePriceAmount,
          status: product.status,
          category: product.category,
          series: product.series,
        }))}
      />
    </div>
  );
}
