"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { readJsonResponse } from "../../../lib/http-json";
import type {
  SiteStudioConfig,
  SiteStudioPreviewPatch,
  SiteStudioSection,
  SiteStudioSectionKey,
} from "../../../lib/site-studio-types";
import styles from "./site-content-studio-editor.module.css";

type HomeSectionStudioEditorProps = {
  sectionKey: SiteStudioSectionKey;
  onDraftChange?: (patch: SiteStudioPreviewPatch) => void;
  onSaved?: (config: SiteStudioConfig) => void;
};

export default function HomeSectionStudioEditor({
  sectionKey,
  onDraftChange,
  onSaved,
}: HomeSectionStudioEditorProps) {
  const [original, setOriginal] = useState<SiteStudioSection | null>(null);
  const [draft, setDraft] = useState<SiteStudioSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setError("");

      try {
        const response = await fetch("/api/admin/site-studio", {
          cache: "no-store",
        });
        const payload =
          await readJsonResponse<{
            config?: SiteStudioConfig;
            error?: string;
          }>(
            response,
            "首頁區塊讀取失敗"
          );

        if (!response.ok || !payload.config) {
          throw new Error(payload.error || "首頁區塊讀取失敗");
        }

        const section = payload.config.sections.find(
          (item) => item.key === sectionKey
        );

        if (!section) throw new Error("找不到這個首頁區塊");
        if (cancelled) return;

        setOriginal(section);
        setDraft(section);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "首頁區塊讀取失敗"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [sectionKey]);

  useEffect(() => {
    if (draft) onDraftChange?.({ section: draft });
  }, [draft, onDraftChange]);

  const hasChanges = useMemo(
    () => Boolean(original && draft && JSON.stringify(original) !== JSON.stringify(draft)),
    [draft, original]
  );

  function update<K extends keyof SiteStudioSection>(
    field: K,
    value: SiteStudioSection[K]
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
    setMessage("");
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/site-studio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "section", section: draft }),
      });
      const payload =
        await readJsonResponse<{
          config?: SiteStudioConfig;
          message?: string;
          error?: string;
        }>(
          response,
          "首頁區塊儲存失敗"
        );

      if (!response.ok || !payload.config) {
        throw new Error(payload.error || "首頁區塊儲存失敗");
      }

      const saved = payload.config.sections.find(
        (item) => item.key === sectionKey
      );
      if (!saved) throw new Error("儲存後找不到首頁區塊");

      setOriginal(saved);
      setDraft(saved);
      setMessage(payload.message || "首頁區塊已儲存");
      onSaved?.(payload.config);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "首頁區塊儲存失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <span className={styles.spinner} />
        <strong>正在讀取首頁區塊</strong>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.stateCard}>
        <strong>無法開啟首頁區塊</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={save}>
      <div className={styles.topLine}>
        <div>
          <span>首頁區塊</span>
          <h2>{draft.label}</h2>
          <small>修改區塊標題、說明與顯示狀態。</small>
        </div>

        <span
          className={`${styles.syncBadge} ${
            hasChanges ? styles.unsavedBadge : ""
          }`}
        >
          {hasChanges ? "尚未儲存" : "已同步"}
        </span>
      </div>

      <section className={styles.section}>
        <label className={styles.toggleRow}>
          <span>在首頁顯示此區塊</span>
          <input
            type="checkbox"
            checked={draft.visible}
            onChange={(event) => update("visible", event.target.checked)}
          />
        </label>

        <label className={styles.field}>
          <span>英文小標／Eyebrow</span>
          <input
            value={draft.eyebrow}
            onChange={(event) => update("eyebrow", event.target.value)}
            placeholder="可留白"
          />
        </label>

        <label className={styles.field}>
          <span>區塊標題</span>
          <input
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>區塊說明</span>
          <textarea
            value={draft.subtitle}
            onChange={(event) => update("subtitle", event.target.value)}
            rows={3}
            placeholder="可留白"
          />
        </label>
      </section>

      <div className={styles.noteBox}>
        商品內容與順序仍在商品卡上直接修改；這裡只控制整個首頁區塊。
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      {message ? <p className={styles.successMessage}>✓ {message}</p> : null}

      <div className={styles.stickyActions}>
        <span>右側即時預覽；按儲存後才會正式寫入。</span>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={saving || !hasChanges}
        >
          {saving ? "儲存中…" : "儲存首頁區塊"}
        </button>
      </div>
    </form>
  );
}
