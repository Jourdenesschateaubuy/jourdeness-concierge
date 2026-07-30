import fs from "node:fs";

const file = "app/page.tsx";
let source = fs.readFileSync(file, "utf8");
const eol = source.includes("\r\n") ? "\r\n" : "\n";

function replaceOnce(label, from, to) {
  from = from.replace(/\r?\n/g, eol);
  to = to.replace(/\r?\n/g, eol);

  if (!source.includes(from)) {
    throw new Error(`Cannot find target: ${label}`);
  }

  source = source.replace(from, to);
}

if (source.includes("adminSeriesCategoryId")) {
  console.log("Admin series create UI already wired. Nothing changed.");
  process.exit(0);
}

/* FormEvent type */
replaceOnce(
  "FormEvent import",
  `"use client";`,
  `"use client";

import type { FormEvent } from "react";`
);

/* State */
replaceOnce(
  "series create states",
  `  const [isAdminCreateMenuOpen, setIsAdminCreateMenuOpen] = useState(false);`,
  `  const [isAdminCreateMenuOpen, setIsAdminCreateMenuOpen] = useState(false);
  const [adminCreateView, setAdminCreateView] = useState<"menu" | "series">("menu");
  const [adminCatalogCategories, setAdminCatalogCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [adminSeriesName, setAdminSeriesName] = useState("");
  const [adminSeriesCategoryId, setAdminSeriesCategoryId] = useState("");
  const [adminSeriesLoading, setAdminSeriesLoading] = useState(false);
  const [adminSeriesSaving, setAdminSeriesSaving] = useState(false);
  const [adminSeriesMessage, setAdminSeriesMessage] = useState("");
  const [adminSeriesError, setAdminSeriesError] = useState("");`
);

/* Functions */
replaceOnce(
  "series create handlers",
  `  function handleDrawerCategory(category: MainCategory, series = "全部") {`,
  `  async function openAdminCreateSeries() {
    setAdminCreateView("series");
    setAdminSeriesMessage("");
    setAdminSeriesError("");

    if (adminCatalogCategories.length > 0) {
      if (!adminSeriesCategoryId) {
        setAdminSeriesCategoryId(String(adminCatalogCategories[0].id));
      }
      return;
    }

    setAdminSeriesLoading(true);

    try {
      const response = await fetch("/api/admin/catalog/series", {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        categories?: Array<{ id: number; name: string }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "讀取分類失敗");
      }

      const categories = Array.isArray(payload.categories)
        ? payload.categories
        : [];

      setAdminCatalogCategories(categories);

      if (categories.length > 0) {
        setAdminSeriesCategoryId(String(categories[0].id));
      }
    } catch (error) {
      setAdminSeriesError(
        error instanceof Error ? error.message : "讀取分類失敗"
      );
    } finally {
      setAdminSeriesLoading(false);
    }
  }

  async function handleAdminSeriesSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = adminSeriesName.trim();
    const categoryId = Number(adminSeriesCategoryId);

    setAdminSeriesMessage("");
    setAdminSeriesError("");

    if (!name) {
      setAdminSeriesError("請輸入系列名稱");
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setAdminSeriesError("請選擇所屬分類");
      return;
    }

    setAdminSeriesSaving(true);

    try {
      const response = await fetch("/api/admin/catalog/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
          name,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        series?: {
          id: number;
          name: string;
          categoryName: string;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "新增系列失敗");
      }

      setAdminSeriesMessage(
        "已建立「" + (payload.series?.name || name) + "」"
      );
      setAdminSeriesName("");
    } catch (error) {
      setAdminSeriesError(
        error instanceof Error ? error.message : "新增系列失敗"
      );
    } finally {
      setAdminSeriesSaving(false);
    }
  }

  function handleDrawerCategory(category: MainCategory, series = "全部") {`
);

/* Opening button resets to menu */
replaceOnce(
  "open create menu",
  `                onClick={() => setIsAdminCreateMenuOpen(true)}`,
  `                onClick={() => {
                  setAdminCreateView("menu");
                  setAdminSeriesMessage("");
                  setAdminSeriesError("");
                  setIsAdminCreateMenuOpen(true);
                }}`
);

/* Dynamic header */
replaceOnce(
  "create sheet header",
  `                  <span className="admin-v2-create-kicker">新增</span>
                  <h2 id="admin-v2-create-title">新增內容</h2>`,
  `                  <span className="admin-v2-create-kicker">
                    {adminCreateView === "series" ? "系列" : "新增"}
                  </span>
                  <h2 id="admin-v2-create-title">
                    {adminCreateView === "series" ? "新增系列" : "新增內容"}
                  </h2>`
);

/* Replace menu body with menu + series form */
replaceOnce(
  "create menu body",
  `              <div className="admin-v2-create-options">
                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>商品</strong>
                    <small>新增一般或組合商品</small>
                  </span>
                </button>

                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>系列</strong>
                    <small>在指定分類下建立新系列</small>
                  </span>
                </button>

                <button type="button" disabled>
                  <span className="admin-v2-create-option-icon">+</span>
                  <span>
                    <strong>分類</strong>
                    <small>建立新的商品分類</small>
                  </span>
                </button>
              </div>

              <p className="admin-v2-create-preview-note">
                目前先確認新增入口的位置與操作手感
              </p>

              <button
                type="button"
                className="admin-v2-create-cancel"
                onClick={() => setIsAdminCreateMenuOpen(false)}
              >
                取消
              </button>`,
  `              {adminCreateView === "menu" ? (
                <>
                  <div className="admin-v2-create-options">
                    <button type="button" disabled>
                      <span className="admin-v2-create-option-icon">+</span>
                      <span>
                        <strong>商品</strong>
                        <small>新增一般或組合商品</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void openAdminCreateSeries()}
                    >
                      <span className="admin-v2-create-option-icon">+</span>
                      <span>
                        <strong>系列</strong>
                        <small>在指定分類下建立新系列</small>
                      </span>
                    </button>

                    <button type="button" disabled>
                      <span className="admin-v2-create-option-icon">+</span>
                      <span>
                        <strong>分類</strong>
                        <small>建立新的商品分類</small>
                      </span>
                    </button>
                  </div>

                  <p className="admin-v2-create-preview-note">
                    商品與分類功能將陸續開放
                  </p>

                  <button
                    type="button"
                    className="admin-v2-create-cancel"
                    onClick={() => setIsAdminCreateMenuOpen(false)}
                  >
                    取消
                  </button>
                </>
              ) : (
                <form
                  className="admin-v2-series-form"
                  onSubmit={handleAdminSeriesSubmit}
                >
                  <label className="admin-v2-series-field">
                    <span>系列名稱</span>
                    <input
                      type="text"
                      value={adminSeriesName}
                      onChange={(event) => {
                        setAdminSeriesName(event.target.value);
                        setAdminSeriesMessage("");
                        setAdminSeriesError("");
                      }}
                      placeholder="例如：玫瑰系列"
                      autoFocus
                      disabled={adminSeriesSaving}
                    />
                  </label>

                  <label className="admin-v2-series-field">
                    <span>所屬分類</span>
                    <select
                      value={adminSeriesCategoryId}
                      onChange={(event) => {
                        setAdminSeriesCategoryId(event.target.value);
                        setAdminSeriesMessage("");
                        setAdminSeriesError("");
                      }}
                      disabled={
                        adminSeriesLoading ||
                        adminSeriesSaving ||
                        adminCatalogCategories.length === 0
                      }
                    >
                      {adminSeriesLoading ? (
                        <option value="">讀取分類中…</option>
                      ) : adminCatalogCategories.length === 0 ? (
                        <option value="">沒有可用分類</option>
                      ) : (
                        adminCatalogCategories.map((category) => (
                          <option
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </option>
                        ))
                      )}
                    </select>
                  </label>

                  {adminSeriesError && (
                    <p className="admin-v2-series-feedback error">
                      {adminSeriesError}
                    </p>
                  )}

                  {adminSeriesMessage && (
                    <p className="admin-v2-series-feedback success">
                      ✓ {adminSeriesMessage}
                    </p>
                  )}

                  <div className="admin-v2-series-actions">
                    <button
                      type="button"
                      className="admin-v2-series-back"
                      onClick={() => {
                        setAdminCreateView("menu");
                        setAdminSeriesMessage("");
                        setAdminSeriesError("");
                      }}
                      disabled={adminSeriesSaving}
                    >
                      返回
                    </button>

                    <button
                      type="submit"
                      className="admin-v2-series-submit"
                      disabled={
                        adminSeriesLoading ||
                        adminSeriesSaving ||
                        !adminSeriesName.trim() ||
                        !adminSeriesCategoryId
                      }
                    >
                      {adminSeriesSaving ? "建立中…" : "建立系列"}
                    </button>
                  </div>
                </form>
              )}`
);

/* Styles */
replaceOnce(
  "series form styles",
  `        .admin-v2-create-preview-note {`,
  `        .admin-v2-series-form {
          display: grid;
          gap: 15px;
        }

        .admin-v2-series-field {
          display: grid;
          gap: 7px;
        }

        .admin-v2-series-field > span {
          color: #594139;
          font-size: 13px;
          font-weight: 900;
        }

        .admin-v2-series-field input,
        .admin-v2-series-field select {
          box-sizing: border-box;
          width: 100%;
          min-height: 52px;
          padding: 0 14px;
          border: 1px solid rgba(154, 48, 66, 0.18);
          border-radius: 15px;
          outline: none;
          background: #fff;
          color: #49332c;
          font-family: inherit;
          font-size: 15px;
          font-weight: 750;
        }

        .admin-v2-series-field input:focus,
        .admin-v2-series-field select:focus {
          border-color: rgba(154, 48, 66, 0.72);
          box-shadow: 0 0 0 3px rgba(154, 48, 66, 0.08);
        }

        .admin-v2-series-field input:disabled,
        .admin-v2-series-field select:disabled {
          opacity: 0.65;
        }

        .admin-v2-series-feedback {
          margin: 0;
          padding: 11px 13px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .admin-v2-series-feedback.error {
          background: #fff0f1;
          color: #9a3042;
        }

        .admin-v2-series-feedback.success {
          background: #f1f7ef;
          color: #48633f;
        }

        .admin-v2-series-actions {
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          gap: 10px;
          margin-top: 4px;
        }

        .admin-v2-series-back,
        .admin-v2-series-submit {
          min-height: 50px;
          border-radius: 15px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .admin-v2-series-back {
          border: 0;
          background: #eee6e0;
          color: #5c443b;
        }

        .admin-v2-series-submit {
          border: 1px solid #9a3042;
          background: linear-gradient(135deg, #9a3042, #7f2635);
          color: #fff;
        }

        .admin-v2-series-submit:disabled,
        .admin-v2-series-back:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .admin-v2-create-preview-note {`
);

fs.writeFileSync(file, source, "utf8");

console.log("✅ Admin V2 新增系列 UI/API 已接通");
