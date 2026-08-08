"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  WebsiteSettingsData,
} from "../../../../lib/cms/modules/website-settings/types";

type Category =
  | "brand"
  | "contact"
  | "social"
  | "seo"
  | "legal"
  | "system";

const categoryLabels: Record<
  Category,
  string
> = {
  brand: "品牌資訊",
  contact: "聯絡資訊",
  social: "社群平台",
  seo: "SEO",
  legal: "法律資訊",
  system: "系統設定",
};

export default function WebsiteSettingsEditor({
  initialSettings,
  saveAction,
}: {
  initialSettings: WebsiteSettingsData;
  saveAction: (
    formData: FormData
  ) => void | Promise<void>;
}) {
  const [category, setCategory] =
    useState<Category>("brand");

  const [settings, setSettings] =
    useState(initialSettings);

  function update(
    key: keyof WebsiteSettingsData,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const fields = useMemo(() => {
    if (category === "brand") {
      return [
        ["siteName", "網站名稱"],
        ["siteTagline", "網站副標題"],
      ] as const;
    }

    if (category === "contact") {
      return [
        ["supportPhone", "客服電話"],
        ["supportEmail", "客服 Email"],
        ["lineUrl", "LINE Official URL"],
        ["serviceHours", "客服時間"],
        ["companyAddress", "公司地址"],
      ] as const;
    }

    if (category === "social") {
      return [
        ["facebookUrl", "Facebook URL"],
        ["instagramUrl", "Instagram URL"],
        ["threadsUrl", "Threads URL"],
        ["youtubeUrl", "YouTube URL"],
        ["tiktokUrl", "TikTok URL"],
      ] as const;
    }

    if (category === "seo") {
      return [
        ["seoTitle", "全站 SEO Title"],
        ["seoDescription", "全站 SEO Description"],
      ] as const;
    }

    if (category === "legal") {
      return [
        ["companyName", "公司名稱"],
        ["taxId", "統一編號"],
        ["copyrightText", "Copyright"],
      ] as const;
    }

    return [
      ["language", "網站語言"],
      ["timezone", "時區"],
      ["currency", "幣別"],
    ] as const;
  }, [category]);

  return (
    <form
      action={saveAction}
      style={styles.layout}
    >
      {Object.entries(settings).map(
        ([key, value]) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={String(value)}
          />
        )
      )}

      <aside style={styles.sidebar}>
        <strong style={styles.sidebarTitle}>
          Website Settings
        </strong>

        {(Object.keys(
          categoryLabels
        ) as Category[]).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setCategory(item)
              }
              style={{
                ...styles.navButton,
                ...(category === item
                  ? styles.navButtonActive
                  : {}),
              }}
            >
              {
                categoryLabels[item]
              }
            </button>
          )
        )}
      </aside>

      <section style={styles.editor}>
        <div style={styles.editorHeader}>
          <div>
            <span style={styles.eyebrow}>
              {
                categoryLabels[
                  category
                ]
              }
            </span>

            <h2 style={styles.sectionTitle}>
              {
                categoryLabels[
                  category
                ]
              }
            </h2>
          </div>

          <button
            type="submit"
            style={styles.saveButton}
          >
            儲存 Draft
          </button>
        </div>

        <div style={styles.fields}>
          {fields.map(
            ([key, label]) => (
              <label
                key={key}
                style={styles.field}
              >
                <span>{label}</span>

                {key ===
                "seoDescription" ? (
                  <textarea
                    rows={5}
                    value={
                      settings[key]
                    }
                    onChange={(event) =>
                      update(
                        key,
                        event.target.value
                      )
                    }
                    style={styles.textarea}
                  />
                ) : (
                  <input
                    value={
                      settings[key]
                    }
                    onChange={(event) =>
                      update(
                        key,
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                )}
              </label>
            )
          )}
        </div>
      </section>

      <aside style={styles.previewWrap}>
        <div style={styles.previewHeader}>
          <strong>
            手機網站預覽
          </strong>
          <span>
            Live Preview
          </span>
        </div>

        <div style={styles.phone}>
          <div style={styles.phoneTop}>
            <span>☰</span>
            <strong>
              {settings.siteName ||
                "Jourdeness"}
            </strong>
            <span>⌕ ♡ 🛒</span>
          </div>

          <div style={styles.phoneHero}>
            <small>
              {settings.siteTagline ||
                "品牌副標題"}
            </small>
            <strong>
              {settings.siteName ||
                "Jourdeness"}
            </strong>
          </div>

          <div style={styles.phoneBody}>
            <strong>
              Website Settings Preview
            </strong>

            <span>
              {settings.supportPhone ||
                "客服電話尚未設定"}
            </span>

            <span>
              {settings.supportEmail ||
                "客服 Email 尚未設定"}
            </span>

            <span>
              {settings.companyAddress ||
                "公司地址尚未設定"}
            </span>
          </div>

          <div style={styles.phoneFooter}>
            <span>
              Instagram
            </span>
            <span>
              Facebook
            </span>
            <small>
              {settings.copyrightText ||
                "Copyright"}
            </small>
          </div>
        </div>
      </aside>
    </form>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  layout: {
    display: "grid",
    gridTemplateColumns:
      "180px minmax(0,1fr) 360px",
    gap: 18,
    alignItems: "start",
  },

  sidebar: {
    position: "sticky",
    top: 18,
    display: "grid",
    gap: 8,
    padding: 12,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 18,
    background: "#fff",
  },

  sidebarTitle: {
    padding: "8px 10px",
    color: "#8c2940",
  },

  navButton: {
    border: 0,
    borderRadius: 12,
    padding: "11px 12px",
    background: "transparent",
    color: "#59484d",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 800,
  },

  navButtonActive: {
    background: "#f8edef",
    color: "#8c2940",
  },

  editor: {
    display: "grid",
    gap: 18,
    padding: 20,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 20,
    background: "#fff",
  },

  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  sectionTitle: {
    margin: "4px 0 0",
  },

  saveButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 16px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  fields: {
    display: "grid",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 7,
    fontWeight: 800,
  },

  input: {
    width: "100%",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 12,
    padding: "12px 13px",
    background: "#fff",
  },

  textarea: {
    width: "100%",
    resize: "vertical",
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 12,
    padding: "12px 13px",
    background: "#fff",
  },

  previewWrap: {
    position: "sticky",
    top: 18,
    display: "grid",
    gap: 10,
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#6c5a60",
  },

  phone: {
    overflow: "hidden",
    minHeight: 650,
    border: "10px solid #2d292a",
    borderRadius: 34,
    background: "#f8efe3",
    boxShadow:
      "0 24px 50px rgba(48,34,39,.16)",
  },

  phoneTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: 16,
    background: "#fffaf4",
  },

  phoneHero: {
    display: "grid",
    gap: 8,
    minHeight: 240,
    placeContent: "center",
    padding: 24,
    textAlign: "center",
    background:
      "linear-gradient(180deg,#f6e9d8,#efe1cd)",
  },

  phoneBody: {
    display: "grid",
    gap: 12,
    padding: 22,
    background: "#fff",
  },

  phoneFooter: {
    display: "grid",
    gap: 10,
    padding: 22,
    background: "#3f2c31",
    color: "#fff",
  },
};
