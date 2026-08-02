"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { readJsonResponse } from "../../../lib/http-json";
import styles from "./site-content-studio-editor.module.css";

type CatalogCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type CatalogSeries = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type CatalogStudioEditorProps = {
  onChanged?: () => void;
};

export default function CatalogStudioEditor({
  onChanged,
}: CatalogStudioEditorProps) {
  const [categories, setCategories] =
    useState<CatalogCategory[]>([]);
  const [series, setSeries] =
    useState<CatalogSeries[]>([]);
  const [newSeriesName, setNewSeriesName] =
    useState("");
  const [
    newSeriesCategoryId,
    setNewSeriesCategoryId,
  ] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  async function loadCatalog() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/catalog/series",
        { cache: "no-store" }
      );

      const payload =
        await readJsonResponse<{
          categories?: CatalogCategory[];
          series?: CatalogSeries[];
          error?: string;
        }>(
          response,
          "分類與系列讀取失敗"
        );

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "分類與系列讀取失敗"
        );
      }

      const nextCategories =
        Array.isArray(payload.categories)
          ? payload.categories
          : [];
      const nextSeries =
        Array.isArray(payload.series)
          ? payload.series
          : [];

      setCategories(nextCategories);
      setSeries(nextSeries);

      if (
        nextCategories.length > 0 &&
        !newSeriesCategoryId
      ) {
        setNewSeriesCategoryId(
          String(nextCategories[0].id)
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "分類與系列讀取失敗"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        series: series
          .filter(
            (item) =>
              item.categoryId ===
              category.id
          )
          .sort(
            (a, b) =>
              a.sortOrder -
                b.sortOrder ||
              a.id - b.id
          ),
      })),
    [categories, series]
  );

  async function request(
    method: "POST" | "PATCH",
    body: Record<string, unknown>,
    successMessage: string
  ) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/catalog/series",
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const payload =
        await readJsonResponse<{
          categories?: CatalogCategory[];
          series?: CatalogSeries[];
          error?: string;
        }>(
          response,
          "分類與系列更新失敗"
        );

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "分類與系列更新失敗"
        );
      }

      setCategories(
        Array.isArray(payload.categories)
          ? payload.categories
          : []
      );
      setSeries(
        Array.isArray(payload.series)
          ? payload.series
          : []
      );
      setMessage(successMessage);
      onChanged?.();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "分類與系列更新失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addSeries(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name =
      newSeriesName.trim();
    const categoryId = Number(
      newSeriesCategoryId
    );

    if (!name || !categoryId) return;

    await request(
      "POST",
      {
        entity: "series",
        categoryId,
        name,
      },
      `已新增系列「${name}」`
    );

    setNewSeriesName("");
  }

  async function renameSeries(
    item: CatalogSeries,
    name: string
  ) {
    const cleanName = name.trim();

    if (
      !cleanName ||
      cleanName === item.name
    ) {
      return;
    }

    await request(
      "PATCH",
      {
        entity: "series",
        action: "rename",
        id: item.id,
        name: cleanName,
      },
      "系列名稱已更新"
    );
  }

  async function moveSeries(
    item: CatalogSeries,
    direction: -1 | 1
  ) {
    const siblings = series
      .filter(
        (candidate) =>
          candidate.categoryId ===
          item.categoryId
      )
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder ||
          a.id - b.id
      );

    const index = siblings.findIndex(
      (candidate) =>
        candidate.id === item.id
    );
    const nextIndex = index + direction;

    if (
      index < 0 ||
      nextIndex < 0 ||
      nextIndex >= siblings.length
    ) {
      return;
    }

    const ordered = [...siblings];

    [
      ordered[index],
      ordered[nextIndex],
    ] = [
      ordered[nextIndex],
      ordered[index],
    ];

    await request(
      "PATCH",
      {
        entity: "series",
        action: "sort",
        categoryId: item.categoryId,
        orderedIds: ordered.map(
          (candidate) => candidate.id
        ),
      },
      "系列順序已更新"
    );
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>
          正在讀取分類與系列
        </strong>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <div className={styles.topLine}>
        <div>
          <span>漢堡選單</span>
          <h2>分類與系列</h2>
          <small>
            前台主分類固定為六大分類，
            系列可新增、改名、移動、排序與停用。
          </small>
        </div>
      </div>

      <section className={styles.section}>
        <div
          className={styles.sectionHeading}
        >
          <div>
            <h3>新增系列</h3>
            <p>
              選擇正確的前台主分類，
              再建立系列。
            </p>
          </div>
        </div>

        <form
          className={styles.twoColumns}
          onSubmit={addSeries}
        >
          <label className={styles.field}>
            <span>所屬主分類</span>
            <select
              value={
                newSeriesCategoryId
              }
              onChange={(event) =>
                setNewSeriesCategoryId(
                  event.target.value
                )
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label className={styles.field}>
            <span>新系列名稱</span>
            <input
              value={newSeriesName}
              onChange={(event) =>
                setNewSeriesName(
                  event.target.value
                )
              }
              placeholder="例如：保濕修護"
            />
          </label>

          <button
            className={styles.primaryButton}
            type="submit"
            disabled={
              saving ||
              !newSeriesName.trim() ||
              !newSeriesCategoryId
            }
          >
            新增系列
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div
          className={styles.sectionHeading}
        >
          <div>
            <h3>前台六大主分類</h3>
            <p>
              主分類名稱與順序固定，
              避免前台商品導覽失效。
            </p>
          </div>
        </div>

        <div className={styles.list}>
          {grouped.map(
            ({
              category,
              series: categorySeries,
            }) => (
              <div
                className={`${styles.catalogGroup} ${
                  category.isActive
                    ? ""
                    : styles.muted
                }`}
                key={category.id}
              >
                <div
                  className={
                    styles.catalogGroupHeader
                  }
                >
                  <strong>
                    {category.name}
                  </strong>

                  <div
                    className={
                      styles.inlineActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.iconButton
                      }
                      onClick={() =>
                        void request(
                          "PATCH",
                          {
                            entity:
                              "category",
                            action:
                              "status",
                            id: category.id,
                            isActive:
                              !category.isActive,
                          },
                          category.isActive
                            ? "主分類已停用"
                            : "主分類已啟用"
                        )
                      }
                      disabled={saving}
                    >
                      {category.isActive
                        ? "停用"
                        : "啟用"}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    styles.catalogSeriesList
                  }
                >
                  {categorySeries.length >
                  0 ? (
                    categorySeries.map(
                      (item, index) => (
                        <div
                          className={`${styles.catalogSeriesItem} ${
                            item.isActive
                              ? ""
                              : styles.muted
                          }`}
                          key={item.id}
                        >
                          <input
                            defaultValue={
                              item.name
                            }
                            onBlur={(
                              event
                            ) =>
                              void renameSeries(
                                item,
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={saving}
                          />

                          <select
                            value={
                              item.categoryId
                            }
                            onChange={(
                              event
                            ) =>
                              void request(
                                "PATCH",
                                {
                                  entity:
                                    "series",
                                  action:
                                    "category",
                                  id: item.id,
                                  categoryId:
                                    Number(
                                      event
                                        .target
                                        .value
                                    ),
                                },
                                "系列所屬主分類已更新"
                              )
                            }
                            disabled={saving}
                            aria-label={`${item.name} 所屬主分類`}
                          >
                            {categories.map(
                              (
                                targetCategory
                              ) => (
                                <option
                                  key={
                                    targetCategory.id
                                  }
                                  value={
                                    targetCategory.id
                                  }
                                >
                                  {
                                    targetCategory.name
                                  }
                                </option>
                              )
                            )}
                          </select>

                          <div
                            className={
                              styles.inlineActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.iconButton
                              }
                              onClick={() =>
                                void moveSeries(
                                  item,
                                  -1
                                )
                              }
                              disabled={
                                saving ||
                                index === 0
                              }
                            >
                              上移
                            </button>

                            <button
                              type="button"
                              className={
                                styles.iconButton
                              }
                              onClick={() =>
                                void moveSeries(
                                  item,
                                  1
                                )
                              }
                              disabled={
                                saving ||
                                index ===
                                  categorySeries.length -
                                    1
                              }
                            >
                              下移
                            </button>

                            <button
                              type="button"
                              className={
                                styles.iconButton
                              }
                              onClick={() =>
                                void request(
                                  "PATCH",
                                  {
                                    entity:
                                      "series",
                                    action:
                                      "status",
                                    id: item.id,
                                    isActive:
                                      !item.isActive,
                                  },
                                  item.isActive
                                    ? "系列已停用"
                                    : "系列已啟用"
                                )
                              }
                              disabled={saving}
                            >
                              {item.isActive
                                ? "停用"
                                : "啟用"}
                            </button>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div
                      className={
                        styles.noteBox
                      }
                    >
                      此主分類目前沒有系列。
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {error ? (
        <p className={styles.errorMessage}>
          {error}
        </p>
      ) : null}

      {message ? (
        <p
          className={styles.successMessage}
        >
          ✓ {message}
        </p>
      ) : null}
    </div>
  );
}
