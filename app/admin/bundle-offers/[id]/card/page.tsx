import { notFound } from "next/navigation";

import {
  getBundleOffer,
} from "../../../../../lib/bundle-offer-repository";

import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../../../lib/catalog-repository";

import BundleOfferCardEditForm from "../../_components/BundleOfferCardEditForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BundleOfferCardPage({
  params,
}: PageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    notFound();
  }

  const [
    bundleOffer,
    categories,
    series,
  ] = await Promise.all([
    getBundleOffer(id),

    getCatalogCategories({
      includeInactive: true,
    }),

    getCatalogSeries({
      includeInactive: true,
    }),
  ]);

  if (!bundleOffer) {
    notFound();
  }

  const priceSummary =
    bundleOffer.plans.length > 0
      ? bundleOffer.plans
          .map((plan) => {
            const price =
              Number(
                plan.priceAmount ?? 0
              ).toLocaleString(
                "en-US"
              );

            return plan.label
              ? `${plan.label}｜NT$ ${price}`
              : `NT$ ${price}`;
          })
          .join("　")
      : "尚未設定組合優惠價格";

  return (
    <div className={styles.page}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            EDIT BUNDLE OFFER PRODUCT
          </p>

          <h1>
            編輯組合優惠商品
          </h1>

          <p>
            商品卡與商品資訊的管理方式與一般商品一致；組合規則另外由「編輯組合」管理。
          </p>
        </div>
      </header>

      <BundleOfferCardEditForm
        initialOffer={{
          id: bundleOffer.id,
          name: bundleOffer.name,
          coverImage:
            bundleOffer.coverImage,
          cardSubtitle:
            bundleOffer.cardSubtitle,
            cardOriginalPriceText:
              bundleOffer.cardOriginalPriceText,
            cardPriceText:
              bundleOffer.cardPriceText,
          storefrontCategory:
            bundleOffer.storefrontCategory,
          series:
            bundleOffer.series,
          status:
            bundleOffer.status,

          spec:
            bundleOffer.spec,
          expiryNote:
            bundleOffer.expiryNote,
          intro:
            bundleOffer.intro,
          features:
            bundleOffer.features ?? [],
          expandedInfo:
            bundleOffer.expandedInfo ?? [],
          suitableFor:
            bundleOffer.suitableFor ?? [],
          usage:
            bundleOffer.usage,
          gallery:
            bundleOffer.gallery ?? [],

          priceSummary,
        }}
        categories={categories.map(
          (item) => ({
            id: item.id,
            name: item.name,
            isActive:
              item.isActive,
          })
        )}
        series={series.map(
          (item) => ({
            id: item.id,
            categoryName:
              item.categoryName,
            name: item.name,
            isActive:
              item.isActive,
          })
        )}
      />
    </div>
  );
}