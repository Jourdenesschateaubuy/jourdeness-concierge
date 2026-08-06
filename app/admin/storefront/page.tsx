import Link from "next/link";

import {
  listStorefrontSectionItems,
  listStorefrontSections,
  type StorefrontSection,
  type StorefrontSectionItem,
} from "../../../lib/storefront-section-repository";
import {
  listDatabaseProducts,
  type DatabaseProduct,
} from "../../../lib/product-repository";
import {
  addProductToSectionAction,
} from "./actions";
import StorefrontSectionSorter from "./StorefrontSectionSorter";

export const dynamic = "force-dynamic";

const statusLabels: Record<DatabaseProduct["status"], string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

const typeLabels: Record<StorefrontSection["sectionType"], string> = {
  category: "商城分類",
  homepage: "首頁區塊",
  campaign: "活動專區",
  custom: "自訂區塊",
};

export default async function StorefrontConfigurationPage() {
  const [sections, products] = await Promise.all([
    listStorefrontSections({ includeInactive: true }),
    listDatabaseProducts({ includeInactive: true }),
  ]);

  const groups = await Promise.all(
    sections.map(async (section) => ({
      section,
      items: await listStorefrontSectionItems(section.id, {
        includeHidden: true,
        includeInactiveProducts: true,
      }),
    }))
  );

  const allItems = groups.flatMap((group) => group.items);
  const uniqueProducts = new Set(allItems.map((item) => item.productId));
  const hiddenCount = allItems.filter((item) => !item.isVisible).length;
  const inactiveItems = allItems.filter(
    (item) => item.product.status === "inactive"
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.eyebrow}>STOREFRONT CONFIGURATION V2</span>
          <h1 style={styles.title}>商城配置</h1>
          <p style={styles.subtitle}>
            商品資料與商城展示位置已分離。現在可直接加入、移除及切換顯示狀態。
          </p>
        </div>
        <Link href="/admin/products" style={styles.button}>
          返回商品管理
        </Link>
      </header>

      <section style={styles.summary}>
        <Summary label="商城區塊" value={sections.length} />
        <Summary
          label="啟用中區塊"
          value={sections.filter((section) => section.isActive).length}
        />
        <Summary label="已配置商品" value={uniqueProducts.size} />
        <Summary
          label="隱藏項目"
          value={hiddenCount}
          warning={hiddenCount > 0}
        />
      </section>

      {inactiveItems.length > 0 ? <Warning items={inactiveItems} /> : null}

      <section style={styles.list}>
        {groups.map(({ section, items }) => {
          const assignedIds = new Set(items.map((item) => item.productId));
          const availableProducts = products.filter(
            (product) => !assignedIds.has(product.id)
          );

          return (
            <SectionCard
              key={section.id}
              section={section}
              items={items}
              availableProducts={availableProducts}
            />
          );
        })}
      </section>
    </main>
  );
}

function SectionCard({
  section,
  items,
  availableProducts,
}: {
  section: StorefrontSection;
  items: StorefrontSectionItem[];
  availableProducts: DatabaseProduct[];
}) {
  return (
    <article style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.titleRow}>
            <h2 style={styles.sectionTitle}>{section.name}</h2>
            <Badge ok={section.isActive}>
              {section.isActive ? "啟用中" : "已停用"}
            </Badge>
            <span style={styles.typeBadge}>
              {typeLabels[section.sectionType]}
            </span>
          </div>
          <p style={styles.meta}>
            Code：{section.code}・{items.length} 項商品・區塊排序{" "}
            {section.sortOrder}
          </p>
        </div>
      </div>

      <form action={addProductToSectionAction} style={styles.addForm}>
        <input type="hidden" name="sectionId" value={section.id} />
        <select
          name="productId"
          required
          defaultValue=""
          style={styles.select}
          disabled={availableProducts.length === 0}
        >
          <option value="" disabled>
            {availableProducts.length > 0
              ? "選擇要加入的商品"
              : "所有商品都已加入"}
          </option>
          {availableProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.displayCode}｜{product.name}｜{statusLabels[product.status]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={styles.primaryButton}
          disabled={availableProducts.length === 0}
        >
          ＋ 加入商品
        </button>
      </form>

      {items.length ? (
        <StorefrontSectionSorter
          sectionId={section.id}
          initialItems={items}
        />
      ) : (
        <div style={styles.empty}>
          此區塊目前沒有商品，可使用上方選單加入。
        </div>
      )}
    </article>
  );
}

function Summary({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.summaryCard,
        ...(warning ? styles.warningCard : {}),
      }}
    >
      <span>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

function Badge({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <span style={ok ? styles.goodBadge : styles.badBadge}>
      {children}
    </span>
  );
}

function Warning({ items }: { items: StorefrontSectionItem[] }) {
  return (
    <section style={styles.warningBox}>
      <div>
        <strong>需要處理：商城區塊仍引用下架商品</strong>
        <p style={styles.warningText}>
          可在對應區塊中先隱藏或直接移除。
        </p>
      </div>
      <div style={styles.warningList}>
        {items.map((item) => (
          <Link
            key={`${item.sectionId}-${item.productId}`}
            href={`/admin/products/${item.product.id}/edit`}
            style={styles.warningItem}
          >
            {item.product.displayCode}　{item.product.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { width: "min(1480px, calc(100% - 48px))", margin: "0 auto", padding: "40px 0 80px", color: "#3d2d31" },
  header: { display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", marginBottom: 28 },
  eyebrow: { display: "block", marginBottom: 8, color: "#8c2940", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em" },
  title: { margin: 0, fontSize: 42 },
  subtitle: { margin: "12px 0 0", color: "#75666a" },
  button: { border: "1px solid rgba(140,41,64,.22)", borderRadius: 999, padding: "10px 16px", color: "#8c2940", textDecoration: "none", background: "#fff" },
  summary: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 24 },
  summaryCard: { display: "grid", gap: 8, padding: 20, border: "1px solid rgba(140,41,64,.12)", borderRadius: 18, background: "#fff" },
  warningCard: { borderColor: "rgba(180,35,24,.3)", background: "#fff7f6" },
  summaryValue: { fontSize: 28 },
  list: { display: "grid", gap: 18 },
  card: { padding: 22, border: "1px solid rgba(140,41,64,.12)", borderRadius: 20, background: "#fff" },
  cardHeader: { display: "flex", justifyContent: "space-between" },
  titleRow: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },
  sectionTitle: { margin: 0, fontSize: 24 },
  meta: { margin: "8px 0 0", color: "#7c6d71" },
  typeBadge: { borderRadius: 999, padding: "4px 9px", background: "#f7f0f2", color: "#7e2940", fontSize: 12, fontWeight: 800 },
  goodBadge: { display: "inline-flex", width: "fit-content", borderRadius: 999, padding: "4px 9px", background: "#edf8f1", color: "#26734d", fontSize: 12, fontWeight: 800 },
  badBadge: { display: "inline-flex", width: "fit-content", borderRadius: 999, padding: "4px 9px", background: "#fff1f0", color: "#b42318", fontSize: 12, fontWeight: 800 },
  addForm: { display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, marginTop: 18 },
  select: { minHeight: 44, border: "1px solid rgba(140,41,64,.18)", borderRadius: 12, padding: "0 12px", background: "#fff" },
  primaryButton: { border: 0, borderRadius: 12, padding: "0 16px", background: "#8c2940", color: "#fff", fontWeight: 800, cursor: "pointer" },
  empty: { marginTop: 18, padding: 20, border: "1px dashed rgba(140,41,64,.2)", borderRadius: 14, color: "#7c6d71", textAlign: "center", background: "#fffafb" },
  warningBox: { display: "grid", gridTemplateColumns: "minmax(260px,.8fr) minmax(0,1.4fr)", gap: 22, marginBottom: 20, padding: 22, border: "1px solid rgba(180,35,24,.22)", borderRadius: 18, background: "#fff7f6" },
  warningText: { margin: "8px 0 0", color: "#7d625f" },
  warningList: { display: "grid", gap: 8 },
  warningItem: { padding: "10px 12px", borderRadius: 12, color: "#4a3438", textDecoration: "none", background: "#fff" },
};
