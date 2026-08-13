"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { StorefrontSection } from "../../../lib/storefront-section-repository";
import HomepageProductComposer, {
  type HomepageComposerProduct,
} from "./HomepageProductComposer";
import {
  deleteHomepageSectionAction,
  saveHomepageSectionSortOrderAction,
  toggleHomepageSectionStatusAction,
  updateHomepageSectionAction,
} from "./actions";

export type HomepageSectionSummary = {
  section: StorefrontSection;
  itemCount: number;
  visibleItemCount: number;
  productIds: number[];
};

export default function HomepageSectionSorter({
  initialGroups,
  products,
}: {
  initialGroups: HomepageSectionSummary[];
  products: HomepageComposerProduct[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [message, setMessage] = useState("");
  const [activePanel, setActivePanel] = useState<{
    sectionId: number;
    panel: "edit" | "products";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    })
  );

  const ids = useMemo(
    () => groups.map((group) => group.section.id),
    [groups]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = groups.findIndex(
      (group) => group.section.id === Number(active.id)
    );
    const newIndex = groups.findIndex(
      (group) => group.section.id === Number(over.id)
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const previousGroups = groups;
    const reordered = arrayMove(groups, oldIndex, newIndex).map(
      (group, index) => ({
        ...group,
        section: {
          ...group.section,
          sortOrder: index + 1,
        },
      })
    );

    setGroups(reordered);

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-section-order-preview",
        {
          detail: {
            sectionIds: reordered.map(
              (group) => group.section.id
            ),
          },
        }
      )
    );

    setMessage("排序儲存中…");

    startTransition(async () => {
      try {
        await saveHomepageSectionSortOrderAction(
          reordered.map((group) => group.section.id)
        );
        setMessage("排序已儲存");
      } catch (error) {
        setGroups(previousGroups);

        window.dispatchEvent(
          new CustomEvent(
            "jourdeness-homepage-section-order-preview",
            {
              detail: {
                sectionIds: previousGroups.map(
                  (group) => group.section.id
                ),
              },
            }
          )
        );

        setMessage(
          error instanceof Error
            ? `排序失敗：${error.message}`
            : "排序失敗，已恢復原順序"
        );
      }
    });
  }

  return (
    <section style={styles.sectionList}>
      <div style={styles.statusBar} aria-live="polite">
        <span>
          {groups.length > 1
            ? "按住 ☰ 拖曳首頁區塊"
            : "建立第二個首頁區塊後即可拖曳排序"}
        </span>
        <strong>{isPending ? "儲存中…" : message}</strong>
      </div>

      <DndContext
        id="homepage-section-sorter"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ids}
          strategy={verticalListSortingStrategy}
        >
          {groups.map((group) => (
            <SortableHomepageSectionCard
              key={group.section.id}
              group={group}
              disabled={isPending || groups.length < 2}
              products={products}
              activePanel={activePanel}
              onPanelChange={setActivePanel}
            />
          ))}
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SortableHomepageSectionCard({
  group,
  disabled,
  products,
  activePanel,
  onPanelChange,
}: {
  group: HomepageSectionSummary;
  disabled: boolean;
  products: HomepageComposerProduct[];
  activePanel: {
    sectionId: number;
    panel: "edit" | "products";
  } | null;
  onPanelChange: React.Dispatch<
    React.SetStateAction<{
      sectionId: number;
      panel: "edit" | "products";
    } | null>
  >;
}) {
  const {
    section,
    itemCount,
    visibleItemCount,
    productIds,
  } = group;
  const editing =
    activePanel?.sectionId === section.id &&
    activePanel.panel === "edit";

  const editingProducts =
    activePanel?.sectionId === section.id &&
    activePanel.panel === "products";

  function togglePanel(
    panel: "edit" | "products"
  ) {
    onPanelChange((current) =>
      current?.sectionId === section.id &&
      current.panel === panel
        ? null
        : {
            sectionId: section.id,
            panel,
          }
    );
  }

  function sendPreviewPatch(
    patch: Record<string, unknown>
  ) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-preview-patch",
        {
          detail: {
            sectionId: section.id,
            patch,
          },
        }
      )
    );
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled,
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        ...styles.sectionCard,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 2 : 1,
        position: "relative",
      }}
    >
      <div style={styles.sectionHeader}>
        <div style={styles.sectionInfo}>
          <div style={styles.sectionTitleRow}>
            <button
              type="button"
              aria-label={`拖曳 ${section.name}`}
              title={
                disabled
                  ? "建立第二個區塊後即可拖曳"
                  : "拖曳首頁區塊"
              }
              style={{
                ...styles.dragHandle,
                ...(disabled ? styles.dragHandleDisabled : {}),
              }}
              disabled={disabled}
              {...attributes}
              {...listeners}
            >
              ☰
            </button>

            <h2 style={styles.sectionTitle}>
              {section.name}
            </h2>

            <span
              style={
                section.isActive
                  ? styles.activeBadge
                  : styles.inactiveBadge
              }
            >
              {section.isActive ? "啟用中" : "已停用"}
            </span>
          </div>

          <p style={styles.sectionMeta}>
            Code：{section.code}
            {" ・ "}
            排序：{section.sortOrder}
            {" ・ "}
            商品：{itemCount}
            {" ・ "}
            顯示中：{visibleItemCount}
            {" ・ "}
            版型：Grid
            {" ・ "}
            桌機：{section.desktopColumns} 欄
            {" ・ "}
            手機：{section.mobileColumns} 欄
            {" ・ "}
            最多：{section.maxItems}
          </p>

          {section.description ? (
            <p style={styles.description}>
              {section.description}
            </p>
          ) : null}
        </div>

        <div style={styles.cardActions}>
          <button
            type="button"
            style={styles.toggleButton}
            onClick={() => togglePanel("edit")}
          >
            {editing ? "收合編輯" : "編輯"}
          </button>

          <form action={toggleHomepageSectionStatusAction}>
            <input
              type="hidden"
              name="sectionId"
              value={section.id}
            />

            <button
              type="submit"
              style={styles.toggleButton}
              disabled={isDragging}
            >
              {section.isActive ? "停用" : "啟用"}
            </button>
          </form>

          <button
            type="button"
            style={styles.primaryInlineButton}
            onClick={() => togglePanel("products")}
          >
            {editingProducts
              ? "收合商品"
              : "編排商品"}
          </button>

          <Link
            href={`/admin/homepage-studio/${section.id}`}
            style={styles.legacyLink}
            title="保留舊商品管理頁作為備援"
          >
            舊管理頁
          </Link>
        </div>
      </div>

      {editingProducts ? (
        <HomepageProductComposer
          sectionId={section.id}
          sectionName={section.name}
          initialProductIds={productIds}
          products={products}
          onPreviewProductIds={(nextIds) =>
            sendPreviewPatch({
              productIds: nextIds,
            })
          }
        />
      ) : null}

      {editing ? (
        <form
          key={`${section.id}-${section.updatedAt}`}
          action={updateHomepageSectionAction}
          style={styles.editForm}
        >
          <input
            type="hidden"
            name="sectionId"
            value={section.id}
          />

          <label style={styles.field}>
            <span>區塊名稱</span>
            <input
              name="name"
              defaultValue={section.name}
              required
              style={styles.input}
              onChange={(event) =>
                sendPreviewPatch({
                  name: event.target.value,
                })
              }
            />
          </label>

          <label style={styles.field}>
            <span>Code（系統識別碼，建立後鎖定）</span>
            <input
              value={section.code}
              readOnly
              style={styles.readonlyInput}
            />
          </label>

          <label style={styles.field}>
            <span>桌機每列商品數</span>
            <select
              name="desktopColumns"
              defaultValue={String(section.desktopColumns)}
              style={styles.input}
              onChange={(event) =>
                sendPreviewPatch({
                  desktopColumns: Number(
                    event.target.value
                  ),
                })
              }
            >
              <option value="3">3 個</option>
              <option value="4">4 個</option>
              <option value="5">5 個</option>
            </select>
          </label>

          <label style={styles.field}>
            <span>手機每列商品數</span>
            <select
              name="mobileColumns"
              defaultValue={String(section.mobileColumns)}
              style={styles.input}
              onChange={(event) =>
                sendPreviewPatch({
                  mobileColumns: Number(
                    event.target.value
                  ),
                })
              }
            >
              <option value="1">1 個</option>
              <option value="2">2 個</option>
            </select>
          </label>

          <label style={styles.field}>
            <span>最多顯示商品</span>
            <input
              name="maxItems"
              type="number"
              min="1"
              max="24"
              defaultValue={section.maxItems}
              style={styles.input}
              onChange={(event) =>
                sendPreviewPatch({
                  maxItems: Math.max(
                    1,
                    Number(event.target.value) || 1
                  ),
                })
              }
            />
          </label>

          <label style={styles.field}>
            <span>區塊背景</span>
            <select
              name="backgroundStyle"
              defaultValue={section.backgroundStyle}
              style={styles.input}
              onChange={(event) =>
                sendPreviewPatch({
                  backgroundStyle:
                    event.target.value,
                })
              }
            >
              <option value="default">預設背景</option>
              <option value="soft">柔和米色</option>
              <option value="white">純白背景</option>
            </select>
          </label>

          <label style={styles.fullField}>
            <span>區塊描述</span>
            <textarea
              name="description"
              defaultValue={section.description ?? ""}
              rows={3}
              style={styles.textarea}
              onChange={(event) =>
                sendPreviewPatch({
                  description:
                    event.target.value,
                })
              }
            />
          </label>

          <div style={styles.editActions}>
            <button
              type="submit"
              style={styles.saveButton}
            >
              儲存修改
            </button>

            <button
              type="submit"
              formAction={deleteHomepageSectionAction}
              style={
                itemCount > 0
                  ? styles.deleteButtonDisabled
                  : styles.deleteButton
              }
              disabled={itemCount > 0}
              title={
                itemCount > 0
                  ? "請先移除所有商品後再刪除"
                  : "刪除首頁區塊"
              }
              onClick={(event) => {
                if (
                  !window.confirm(
                    `確定刪除「${section.name}」？`
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              刪除區塊
            </button>
          </div>

          {itemCount > 0 ? (
            <small style={styles.deleteHint}>
              此區塊仍有 {itemCount} 個商品，請先到「管理商品」移除後才能刪除。
            </small>
          ) : null}
        </form>
      ) : null}
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionList: {
    display: "grid",
    gap: 16,
  },

  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#75666a",
    fontSize: 12,
  },

  sectionCard: {
    padding: 22,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(140, 41, 64, 0.12)",
    borderRadius: 20,
    background: "#fff",
  },

  sectionHeader: {
    position: "sticky",
    top: 0,
    zIndex: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    margin: "-22px -22px 0",
    padding: "16px 22px",
    borderBottom:
      "1px solid rgba(140,41,64,.08)",
    borderRadius: "20px 20px 12px 12px",
    background:
      "rgba(255,255,255,.96)",
    backdropFilter: "blur(8px)",
  },

  sectionInfo: {
    minWidth: 0,
  },

  sectionTitleRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },

  dragHandle: {
    display: "grid",
    placeItems: "center",
    width: 34,
    height: 34,
    border: "1px solid rgba(140, 41, 64, 0.18)",
    borderRadius: 9,
    color: "#8c2940",
    background: "#fffafb",
    cursor: "grab",
    touchAction: "none",
    fontSize: 16,
  },

  dragHandleDisabled: {
    cursor: "not-allowed",
    opacity: 0.45,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 24,
  },

  sectionMeta: {
    margin: "9px 0 0",
    color: "#7c6d71",
  },

  description: {
    margin: "8px 0 0",
    color: "#8b7b7f",
    lineHeight: 1.5,
  },

  activeBadge: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 9px",
    color: "#26734d",
    fontSize: 12,
    fontWeight: 800,
    background: "#edf8f1",
  },

  inactiveBadge: {
    display: "inline-flex",
    borderRadius: 999,
    padding: "4px 9px",
    color: "#b42318",
    fontSize: 12,
    fontWeight: 800,
    background: "#fff1f0",
  },

  cardActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  primaryInlineButton: {
    border: 0,
    borderRadius: 999,
    padding: "8px 14px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  legacyLink: {
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "none",
    opacity: 0.72,
  },

  toggleButton: {
    border: "1px solid rgba(140,41,64,.22)",
    borderRadius: 999,
    padding: "8px 14px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  textLink: {
    color: "#8c2940",
    fontWeight: 800,
    textDecoration: "none",
  },

  editForm: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid rgba(140,41,64,.1)",
  },

  field: {
    display: "grid",
    gap: 7,
    color: "#66565a",
    fontSize: 13,
    fontWeight: 800,
  },

  fullField: {
    display: "grid",
    gridColumn: "1 / -1",
    gap: 7,
    color: "#66565a",
    fontSize: 13,
    fontWeight: 800,
  },

  input: {
    border: "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fff",
  },

  readonlyInput: {
    border: "1px solid rgba(140,41,64,.1)",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#f6f3f4",
    color: "#85787b",
  },

  textarea: {
    resize: "vertical",
    border: "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fff",
    font: "inherit",
  },

  editActions: {
    display: "flex",
    gridColumn: "1 / -1",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },

  saveButton: {
    border: 0,
    borderRadius: 999,
    padding: "9px 15px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  deleteButton: {
    border: "1px solid rgba(180,35,24,.24)",
    borderRadius: 999,
    padding: "9px 15px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 800,
  },

  deleteButtonDisabled: {
    border: "1px solid rgba(120,110,113,.14)",
    borderRadius: 999,
    padding: "9px 15px",
    background: "#f5f3f3",
    color: "#aaa",
    cursor: "not-allowed",
    fontWeight: 800,
  },

  deleteHint: {
    gridColumn: "1 / -1",
    color: "#9b6e67",
    lineHeight: 1.5,
  },
};

