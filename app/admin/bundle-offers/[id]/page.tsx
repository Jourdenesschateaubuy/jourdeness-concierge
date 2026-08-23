import { notFound } from "next/navigation";

import { getBundleOffer } from "../../../../lib/bundle-offer-repository";
import { listDatabaseProducts } from "../../../../lib/product-repository";
import BundleOfferCreateForm from "../_components/BundleOfferCreateForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type EditBundleOfferPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBundleOfferPage({
  params,
}: EditBundleOfferPageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const [bundleOffer, products] = await Promise.all([
    getBundleOffer(id),
    listDatabaseProducts({
      includeInactive: true,
    }),
  ]);

  if (!bundleOffer) {
    notFound();
  }

  const availableProducts = products;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            EDIT BUNDLE OFFER
          </p>

          <h1>編輯組合優惠</h1>

          <p>
            修改組合優惠的優惠類型、商品、數量、優惠規則與價格。
          </p>
        </div>
      </header>

      <BundleOfferCreateForm
        mode="edit"
        initialOffer={{
          id: bundleOffer.id,
          name: bundleOffer.name,
          bundleType: bundleOffer.bundleType,
          unitLabel: bundleOffer.unitLabel,
          allowSameProduct: bundleOffer.allowSameProduct,
          status: bundleOffer.status,
          sortOrder: bundleOffer.sortOrder,
          items: bundleOffer.items.map((item) => ({
            productId: item.productId,
            role: item.role,
            quantity: item.quantity,
            sortOrder: item.sortOrder ?? 0,
          })),
          plans: bundleOffer.plans.map((plan) => ({
            code: plan.code,
            label: plan.label,
            requiredQuantity: plan.requiredQuantity,
            buyQuantity: plan.buyQuantity,
            freeQuantity: plan.freeQuantity,
            priceAmount: plan.priceAmount,
            sortOrder: plan.sortOrder ?? 0,
            gifts: (plan.gifts ?? []).map((gift) => ({
              productId: gift.productId,
              name: gift.name,
              quantity: gift.quantity,
              unitLabel: gift.unitLabel,
              sortOrder: gift.sortOrder ?? 0,
            })),
          })),
        }}
        products={availableProducts.map((product) => ({
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
