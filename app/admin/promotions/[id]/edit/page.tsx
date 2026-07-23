
import { notFound } from "next/navigation";
import { listDatabaseProducts } from "../../../../../lib/product-repository";
import { getPromotion } from "../../../../../lib/promotion-repository";
import { updatePromotionAction } from "../../actions";
import PromotionForm from "../../_components/PromotionForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditPromotionPage({
  params,
  searchParams,
}: Props) {
  const { id: rawId } = await params;
  const { saved } = await searchParams;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const [promotion, products] = await Promise.all([
    getPromotion(id),
    listDatabaseProducts({ includeInactive: true }),
  ]);

  if (!promotion) notFound();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>EDIT PROMOTION</p>
          <h1>編輯優惠</h1>
          <p>{promotion.name}</p>
        </div>
      </header>

      {saved ? (
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            border: "1px solid #cce7d6",
            borderRadius: 12,
            background: "#eef8f1",
            color: "#286242",
          }}
        >
          ✓ {saved === "created" ? "優惠已建立" : "優惠已儲存"}
        </div>
      ) : null}

      <PromotionForm
        promotion={promotion}
        products={products}
        action={updatePromotionAction}
        submitLabel="儲存變更"
      />
    </div>
  );
}
