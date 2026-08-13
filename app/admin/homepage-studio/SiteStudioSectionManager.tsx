"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

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

import type {
  SiteStudioSection,
} from "../../../lib/site-studio-types";

import SiteStudioSectionProductManager, {
  type SectionProductOption,
} from "./SiteStudioSectionProductManager";

type Props = {
  initialSections: SiteStudioSection[];
  products: SectionProductOption[];
};

export default function SiteStudioSectionManager({
  initialSections,
  products,
}: Props) {
  const [sections, setSections] =
    useState(initialSections);

  const [message, setMessage] =
    useState("");

  const [editingKey, setEditingKey] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    })
  );

  const ids = useMemo(
    () =>
      sections.map(
        (section) => section.key
      ),
    [sections]
  );

  async function requestSave(
    body: Record<string, unknown>
  ) {
    const response = await fetch(
      "/api/admin/site-studio",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "首頁設定儲存失敗"
      );
    }

    return result;
  }

  async function saveAllSections(
    nextSections: SiteStudioSection[]
  ) {
    return requestSave({
      kind: "sections",
      sections: nextSections,
    });
  }

  function updateLocalSection(
    sectionKey: string,
    patch: Partial<SiteStudioSection>
  ) {
    setSections((current) =>
      current.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              ...patch,
            }
          : section
      )
    );
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      sections.findIndex(
        (section) =>
          section.key === active.id
      );

    const newIndex =
      sections.findIndex(
        (section) =>
          section.key === over.id
      );

    if (
      oldIndex < 0 ||
      newIndex < 0
    ) {
      return;
    }

    const previous = sections;

    const reordered = arrayMove(
      sections,
      oldIndex,
      newIndex
    ).map(
      (section, index) => ({
        ...section,
        sortOrder: index + 1,
      })
    );

    setSections(reordered);
    setMessage("排序儲存中…");

    startTransition(async () => {
      try {
        await saveAllSections(
          reordered
        );

        setMessage("排序已儲存");
      } catch (error) {
        setSections(previous);

        setMessage(
          error instanceof Error
            ? `排序失敗：${error.message}`
            : "排序失敗，已恢復原順序"
        );
      }
    });
  }

  async function saveOneSection(
    section: SiteStudioSection
  ) {
    const previous = sections;

    setMessage(
      `${section.label} 儲存中…`
    );

    try {
      const result =
        await requestSave({
          kind: "section",
          section,
        });

      const savedSections =
        result?.config?.sections;

      if (
        Array.isArray(savedSections)
      ) {
        setSections(
          savedSections
            .filter(
              (item: SiteStudioSection) =>
                item.key !== "ranking"
            )
            .sort(
              (
                a: SiteStudioSection,
                b: SiteStudioSection
              ) =>
                (a.sortOrder ?? 999) -
                (b.sortOrder ?? 999)
            )
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "jourdeness-homepage-draft-saved"
        )
      );

      setEditingKey(null);
      setMessage(
        `${section.label} 已儲存`
      );
    } catch (error) {
      setSections(previous);

      setMessage(
        error instanceof Error
          ? `儲存失敗：${error.message}`
          : "儲存失敗"
      );
    }
  }

  function toggleVisibility(
    section: SiteStudioSection
  ) {
    const previous = sections;

    const nextSections =
      sections.map((item) =>
        item.key === section.key
          ? {
              ...item,
              visible: !item.visible,
            }
          : item
      );

    setSections(nextSections);
    setMessage(
      `${section.label} 儲存中…`
    );

    startTransition(async () => {
      try {
        const result =
          await saveAllSections(
            nextSections
          );

        const savedSections =
          result?.config?.sections;

        if (
          Array.isArray(
            savedSections
          )
        ) {
          setSections(
            savedSections
              .filter(
                (
                  item: SiteStudioSection
                ) =>
                  item.key !==
                    "ranking"
              )
              .sort(
                (
                  a: SiteStudioSection,
                  b: SiteStudioSection
                ) =>
                  (a.sortOrder ??
                    999) -
                  (b.sortOrder ??
                    999)
              )
          );
        }

        window.dispatchEvent(
          new CustomEvent(
            "jourdeness-homepage-draft-saved"
          )
        );

        setMessage(
          `${section.label} 已儲存`
        );
      } catch (error) {
        setSections(previous);

        setMessage(
          error instanceof Error
            ? `儲存失敗：${error.message}`
            : "儲存失敗，已恢復原狀態"
        );
      }
    });
  }

  return (
    <section style={styles.list}>
      <div
        style={styles.statusBar}
        aria-live="polite"
      >
        <span>
          ☰ 拖曳可調整區塊順序
        </span>

        <strong>
          {isPending
            ? "儲存中…"
            : message}
        </strong>
      </div>

      <DndContext
        id="site-studio-section-manager"
        sensors={sensors}
        collisionDetection={
          closestCenter
        }
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ids}
          strategy={
            verticalListSortingStrategy
          }
        >
          {sections.map(
            (section) => (
              <SectionCard
                key={section.key}
                section={section}
                products={products}
                disabled={isPending}
                editing={
                  editingKey ===
                  section.key
                }
                onEdit={() =>
                  setEditingKey(
                    editingKey ===
                      section.key
                      ? null
                      : section.key
                  )
                }
                onChange={(
                  patch
                ) =>
                  updateLocalSection(
                    section.key,
                    patch
                  )
                }
                onSave={() =>
                  startTransition(
                    async () => {
                      await saveOneSection(
                        section
                      );
                    }
                  )
                }
                onToggleVisibility={() =>
                  toggleVisibility(
                    section
                  )
                }
              />
            )
          )}
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SectionCard({
  section,
  products,
  disabled,
  editing,
  onEdit,
  onChange,
  onSave,
  onToggleVisibility,
}: {
  section: SiteStudioSection;
  products: SectionProductOption[];
  disabled: boolean;
  editing: boolean;
  onEdit: () => void;
  onChange: (
    patch: Partial<SiteStudioSection>
  ) => void;
  onSave: () => void;
  onToggleVisibility: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.key,
    disabled,
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        ...styles.card,
        transform:
          CSS.Transform.toString(
            transform
          ),
        transition,
        opacity:
          isDragging
            ? 0.6
            : section.visible
              ? 1
              : 0.58,
      }}
    >
      <div style={styles.cardTop}>
        <button
          type="button"
          aria-label={`拖曳 ${section.title}`}
          disabled={disabled}
          style={styles.dragHandle}
          {...attributes}
          {...listeners}
        >
          ☰
        </button>

        <div style={styles.content}>
          <div style={styles.titleRow}>
            <strong>
              {section.title ||
                section.label}
            </strong>

            <span
              style={
                section.visible
                  ? styles.enabled
                  : styles.hidden
              }
            >
              {section.visible
                ? "顯示中"
                : "已隱藏"}
            </span>

            <span style={styles.kindBadge}>
              {section.kind ===
              "products"
                ? "商品區塊"
                : "系統區塊"}
            </span>
          </div>

          {editing ? (
            <>
              <span style={styles.eyebrow}>
                {section.eyebrow ||
                  section.key}
              </span>

              {section.subtitle ? (
                <p style={styles.subtitle}>
                  {section.subtitle}
                </p>
              ) : null}

              <small style={styles.meta}>
                Key：{section.key}
                {" · "}
                排序：
                {section.sortOrder ??
                  "-"}
              </small>
            </>
          ) : (
            <small style={styles.compactMeta}>
              {section.productIds?.length ?? 0}
              {" 個商品"}
            </small>
          )}
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={
              section.visible
                ? styles.secondaryButton
                : styles.enableButton
            }
            disabled={disabled}
            onClick={
              onToggleVisibility
            }
          >
            {section.visible
              ? "隱藏"
              : "顯示"}
          </button>

          <button
            type="button"
            style={styles.editButton}
            disabled={disabled}
            onClick={onEdit}
          >
            {editing
              ? "收合"
              : "編輯"}
          </button>
        </div>
      </div>

      {editing ? (
        <section
          style={styles.editor}
        >
          <label style={styles.field}>
            <span>
              英文小標 Eyebrow
            </span>

            <input
              value={
                section.eyebrow
              }
              onChange={(event) =>
                onChange({
                  eyebrow:
                    event.target
                      .value,
                })
              }
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span>
              區塊標題
            </span>

            <input
              value={section.title}
              onChange={(event) =>
                onChange({
                  title:
                    event.target
                      .value,
                })
              }
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span>
              區塊說明
            </span>

            <textarea
              value={
                section.subtitle
              }
              onChange={(event) =>
                onChange({
                  subtitle:
                    event.target
                      .value,
                })
              }
              rows={3}
              style={styles.textarea}
            />
          </label>

          {(
            section.kind === "products" ||
            section.key === "monthlyOffers" ||
            section.key === "comingSoon"
          ) ? (
            <SiteStudioSectionProductManager
              section={section}
              products={products}
              onSaved={(savedSection) =>
                onChange({
                  productIds:
                    savedSection.productIds ?? [],
                })
              }
            />
          ) : null}

          <div
            style={
              styles.editorFooter
            }
          >
            <small>
              商品編排可在上方直接調整。
            </small>

            <button
              type="button"
              onClick={onSave}
              disabled={disabled}
              style={styles.saveButton}
            >
              儲存區塊
            </button>
          </div>
        </section>
      ) : null}
    </article>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  list: {
    display: "grid",
    gap: 12,
  },

  statusBar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 10,
    padding: "4px 2px",
    color: "#8f7c81",
    fontSize: 12,
  },

  card: {
    display: "grid",
    gap: 10,
    padding: "12px 14px",
    border:
      "1px solid rgba(140,41,64,.14)",
    borderRadius: 18,
    background: "#fff",
    boxShadow:
      "0 8px 24px rgba(48,34,39,.05)",
  },

  cardTop: {
    display: "grid",
    gridTemplateColumns:
      "34px minmax(0,1fr) auto",
    alignItems: "center",
    gap: 10,
  },

  dragHandle: {
    width: 32,
    height: 34,
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 12,
    background: "#fff8f9",
    color: "#8c2940",
    cursor: "grab",
    fontSize: 18,
    touchAction: "none",
  },

  content: {
    display: "grid",
    gap: 3,
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  eyebrow: {
    color: "#9b777f",
    fontSize: 12,
    fontWeight: 700,
  },

  subtitle: {
    margin: 0,
    color: "#75666a",
    lineHeight: 1.5,
  },

  meta: {
    color: "#9a8b8e",
  },

  compactMeta: {
    color: "#9a8b8e",
    fontSize: 12,
    fontWeight: 700,
  },

  enabled: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#eef8f1",
    color: "#26734d",
    fontSize: 11,
    fontWeight: 800,
  },

  hidden: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#f3f0f1",
    color: "#786c70",
    fontSize: 11,
    fontWeight: 800,
  },

  kindBadge: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#fff4e8",
    color: "#8a5d2b",
    fontSize: 11,
    fontWeight: 800,
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  editButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  secondaryButton: {
    border:
      "1px solid rgba(140,41,64,.14)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#fff",
    color: "#75666a",
    cursor: "pointer",
  },

  enableButton: {
    border:
      "1px solid rgba(38,115,77,.18)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#eef8f1",
    color: "#26734d",
    cursor: "pointer",
    fontWeight: 800,
  },

  editor: {
    display: "grid",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    background: "#fff8f9",
  },

  field: {
    display: "grid",
    gap: 6,
    color: "#6f5f63",
    fontSize: 12,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    background: "#fff",
    color: "#3d2d31",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    resize: "vertical",
    background: "#fff",
    color: "#3d2d31",
    font: "inherit",
  },

  editorFooter: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 12,
    color: "#8d7d81",
  },

  saveButton: {
    border: 0,
    borderRadius: 999,
    padding: "9px 14px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
};















