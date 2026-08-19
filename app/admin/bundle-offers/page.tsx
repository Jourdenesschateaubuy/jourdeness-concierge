import {
  listBundleOffers,
} from "../../../lib/bundle-offer-repository";

import BundleOfferManager from "../products/_components/BundleOfferManager";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function BundleOffersPage() {
  const bundleOffers = await listBundleOffers();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            BUNDLE OFFERS · NEON POSTGRES
          </p>

          <h1>組合優惠管理</h1>

          <p>
            統一管理固定組合、自由任選與買送活動。
            組合主圖統一由 Media Library 選擇，
            前台商城使用相同圖片。
          </p>
        </div>
      </header>

      <section className={styles.panel}>
        <BundleOfferManager
          bundleOffers={bundleOffers}
        />
      </section>
    </div>
  );
}
