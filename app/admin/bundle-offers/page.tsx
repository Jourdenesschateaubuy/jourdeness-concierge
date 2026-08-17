import Link from "next/link";

import {
  listBundleOffers,
} from "../../../lib/bundle-offer-repository";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

function bundleTypeLabel(type: string) {
  if (type === "fixed_bundle") return "固定組合";
  if (type === "mix_match") return "任選組合";
  if (type === "buy_get") return "買送活動";
  return type;
}

function statusLabel(status: string) {
  if (status === "active") return "上架中";
  if (status === "inactive") return "下架";
  if (status === "coming_soon") return "新品預告";
  if (status === "sold_out") return "售罄";
  return status;
}

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
            組合優惠只能從既有一般商品建立，
            不再建立獨立的組合商品。
          </p>
        </div>

        <Link href="/admin/bundle-offers/new">
          ＋ 新增組合優惠
        </Link>
      </header>

      {bundleOffers.length === 0 ? (
        <section className={styles.panel}>
          <p>目前尚未建立新的組合優惠。</p>
        </section>
      ) : (
        <section className={styles.panel}>
          <div style={{ display: "grid", gap: 16 }}>
            {bundleOffers.map((offer) => (
              <article
                key={offer.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <strong>{offer.name}</strong>

                    <p>
                      {bundleTypeLabel(offer.bundleType)}
                      {" · "}
                      {statusLabel(offer.status)}
                    </p>

                    <p>
                      {offer.items.map((item) => (
                        <span key={item.id}>
                          {item.product.displayCode}
                          {"　"}
                          {item.product.name}
                          {" × "}
                          {item.quantity}
                          {"　"}
                        </span>
                      ))}
                    </p>

                    <p>
                      {offer.plans.map((plan) => (
                        <span key={plan.id}>
                          {plan.label}
                          {"　$"}
                          {plan.priceAmount.toLocaleString()}
                          {"　"}
                        </span>
                      ))}
                    </p>
                  </div>

                  <Link
                    href={`/admin/bundle-offers/${offer.id}`}
                  >
                    查看
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
