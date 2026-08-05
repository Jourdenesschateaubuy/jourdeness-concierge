"use client";

import { useMemo, useState } from "react";
import type { DatabaseProduct } from "../../../../lib/product-repository";
import type {
  SiteStudioSection,
  SiteStudioSectionKind,
} from "../../../../lib/site-studio-types";
import styles from "./home-manager.module.css";

type Props = {
  initialSections: SiteStudioSection[];
  products: DatabaseProduct[];
};

function createKey(kind: "image" | "products") {
  return `custom-${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function sectionKindLabel(section: SiteStudioSection) {
  if (section.key === "ranking") return "固定排行榜";
  if (section.kind === "image") return "視覺圖片";
  if (section.kind === "products") return "商品區塊";
  return "系統區塊";
}

export default function HomeManager({ initialSections, products }: Props) {
  const [sections, setSections] = useState(
    initialSections
      .filter((section) => section.key !== "skincareNeeds")
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  );
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [productDragId, setProductDragId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const availableProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      if (product.status === "inactive") return false;
      if (!keyword) return true;
      return `${product.name} ${product.cardName ?? ""}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [products, search]);

  function normalizeOrder(items: SiteStudioSection[]) {
    return items.map((section, index) => ({
      ...section,
      sortOrder: (index + 1) * 10,
    }));
  }

  function updateSection(
    key: string,
    patch: Partial<SiteStudioSection>
  ) {
    setSections((current) =>
      current.map((section) =>
        section.key === key ? { ...section, ...patch } : section
      )
    );
    setMessage("");
    setError("");
  }

  function reorderSections(fromKey: string, toKey: string) {
    const from = sections.findIndex((section) => section.key === fromKey);
    const to = sections.findIndex((section) => section.key === toKey);
    if (from < 0 || to < 0) return;
    if (sections[from]?.locked || sections[to]?.locked) return;
    setSections(normalizeOrder(moveItem(sections, from, to)));
  }

  function addSection(kind: SiteStudioSectionKind) {
    const customKind = kind === "image" ? "image" : "products";
    const key = createKey(customKind);
    const section: SiteStudioSection = {
      key,
      label: customKind === "image" ? "新視覺圖片" : "新商品區塊",
      eyebrow: "",
      title: customKind === "image" ? "視覺圖片" : "商品精選",
      subtitle: "",
      visible: true,
      kind: customKind,
      sortOrder: (sections.length + 1) * 10,
      locked: false,
      productIds: [],
      image: "",
      desktopImage: "",
      alt: "",
      buttonLabel: "",
      linkType: "none",
      linkValue: "",
    };
    setSections((current) => normalizeOrder([...current, section]));
    setExpandedKey(key);
  }

  function toggleProduct(section: SiteStudioSection, productId: number) {
    const currentIds = section.productIds ?? [];
    const productIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];
    updateSection(section.key, { productIds });
  }

  function reorderProduct(
    section: SiteStudioSection,
    fromId: number,
    toId: number
  ) {
    const ids = section.productIds ?? [];
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    updateSection(section.key, { productIds: moveItem(ids, from, to) });
  }

  async function uploadImage(
    sectionKey: string,
    file: File | undefined
  ) {
    if (!file) return;
    setError("");
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("/api/admin/product-images/upload", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json()) as {
        url?: string;
        publicUrl?: string;
        imageUrl?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "圖片上傳失敗");
      const image = payload.url || payload.publicUrl || payload.imageUrl;
      if (!image) throw new Error("沒有取得圖片網址");
      updateSection(sectionKey, { image, desktopImage: image });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "圖片上傳失敗"
      );
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/site-studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "sections",
          sections: normalizeOrder(sections),
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        error?: string;
        config?: { sections?: SiteStudioSection[] };
      };
      if (!response.ok) throw new Error(payload.error || "首頁版面儲存失敗");
      if (payload.config?.sections) {
        setSections(
          payload.config.sections
            .filter((section) => section.key !== "skincareNeeds")
            .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
        );
      }
      setMessage(payload.message || "首頁版面已儲存");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "首頁版面儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.layout}>
      <main className={styles.editor}>
        <div className={styles.toolbar}>
          <div>
            <strong>首頁區塊</strong>
            <span>拖曳一般區塊調整順序；排行榜固定。</span>
          </div>
          <div>
            <button type="button" onClick={() => addSection("image")}>
              ＋ 視覺圖片
            </button>
            <button type="button" onClick={() => addSection("products")}>
              ＋ 商品區塊
            </button>
          </div>
        </div>

        {message ? <p className={styles.success}>✓ {message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.list}>
          {sections.map((section, index) => {
            const expanded = expandedKey === section.key;
            const selectedProducts = (section.productIds ?? [])
              .map((id) => products.find((product) => product.id === id))
              .filter((product): product is DatabaseProduct => Boolean(product));

            return (
              <article
                key={section.key}
                className={`${styles.card} ${
                  section.visible ? "" : styles.hiddenCard
                }`}
                draggable={!section.locked}
                onDragStart={() => setDragKey(section.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragKey) reorderSections(dragKey, section.key);
                  setDragKey(null);
                }}
              >
                <div className={styles.cardHead}>
                  <span className={styles.drag}>{section.locked ? "◆" : "⋮⋮"}</span>
                  <span className={styles.order}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    className={styles.titleButton}
                    onClick={() => setExpandedKey(expanded ? null : section.key)}
                  >
                    <strong>{section.title || section.label}</strong>
                    <small>
                      {sectionKindLabel(section)}
                      {section.kind === "products"
                        ? `・${section.productIds?.length ?? 0} 個商品`
                        : ""}
                    </small>
                  </button>
                  <span className={styles.status}>
                    {section.visible ? "顯示中" : "已隱藏"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(section.key, { visible: !section.visible })
                    }
                  >
                    {section.visible ? "隱藏" : "顯示"}
                  </button>
                  {!section.locked && section.key.startsWith("custom-") ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => {
                        if (!window.confirm(`確定刪除「${section.title}」？`)) return;
                        setSections((current) =>
                          normalizeOrder(
                            current.filter((item) => item.key !== section.key)
                          )
                        );
                      }}
                    >
                      刪除
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setExpandedKey(expanded ? null : section.key)}
                  >
                    {expanded ? "收合" : "編輯"}
                  </button>
                </div>

                {expanded && (
                  <div className={styles.panel}>
                    <div className={styles.fields}>
                      <label>
                        <span>英文小標</span>
                        <input
                          value={section.eyebrow}
                          onChange={(event) =>
                            updateSection(section.key, {
                              eyebrow: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>區塊標題</span>
                        <input
                          value={section.title}
                          onChange={(event) =>
                            updateSection(section.key, {
                              title: event.target.value,
                              label: event.target.value || section.label,
                            })
                          }
                        />
                      </label>
                      <label className={styles.full}>
                        <span>區塊說明</span>
                        <textarea
                          rows={3}
                          value={section.subtitle}
                          onChange={(event) =>
                            updateSection(section.key, {
                              subtitle: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>

                    {section.kind === "image" && (
                      <div className={styles.imageEditor}>
                        {section.image ? (
                          <img src={section.image} alt={section.alt || section.title} />
                        ) : (
                          <div>尚未設定視覺圖片</div>
                        )}
                        <label>
                          上傳圖片
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                              uploadImage(section.key, event.target.files?.[0])
                            }
                          />
                        </label>
                        <label>
                          圖片網址
                          <input
                            value={section.image ?? ""}
                            onChange={(event) =>
                              updateSection(section.key, {
                                image: event.target.value,
                                desktopImage: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          圖片替代文字
                          <input
                            value={section.alt ?? ""}
                            onChange={(event) =>
                              updateSection(section.key, { alt: event.target.value })
                            }
                          />
                        </label>
                      </div>
                    )}

                    {section.kind === "products" && (
                      <div className={styles.productEditor}>
                        <div className={styles.selectedProducts}>
                          <strong>目前商品順序</strong>
                          {selectedProducts.length === 0 ? (
                            <p>尚未加入商品。</p>
                          ) : (
                            selectedProducts.map((product, productIndex) => (
                              <div
                                key={product.id}
                                draggable
                                onDragStart={() => setProductDragId(product.id)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                  if (productDragId) {
                                    reorderProduct(
                                      section,
                                      productDragId,
                                      product.id
                                    );
                                  }
                                  setProductDragId(null);
                                }}
                              >
                                <span>{String(productIndex + 1).padStart(2, "0")}</span>
                                <strong>{product.cardName || product.name}</strong>
                                <button
                                  type="button"
                                  onClick={() => toggleProduct(section, product.id)}
                                >
                                  移除
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        <div className={styles.productPicker}>
                          <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="搜尋商品"
                          />
                          <div>
                            {availableProducts.slice(0, 80).map((product) => {
                              const selected = section.productIds?.includes(product.id);
                              return (
                                <button
                                  type="button"
                                  key={product.id}
                                  className={selected ? styles.productSelected : ""}
                                  onClick={() => toggleProduct(section, product.id)}
                                >
                                  <span>{selected ? "✓" : "＋"}</span>
                                  <strong>{product.cardName || product.name}</strong>
                                  <small>{product.status}</small>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className={styles.stickySave}>
          <span>變更儲存後才會正式套用到首頁。</span>
          <button type="button" onClick={save} disabled={saving}>
            {saving ? "儲存中…" : "儲存首頁版面"}
          </button>
        </div>
      </main>

      <aside className={styles.preview}>
        <div>
          <span>手機網站預覽</span>
          <a href="/" target="_blank" rel="noreferrer">
            開啟前台
          </a>
        </div>
        <iframe src="/?admin=1" title="首頁手機預覽" />
      </aside>
    </div>
  );
}
