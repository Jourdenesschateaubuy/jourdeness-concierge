"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type HomepageSectionPreviewPatch = {
  sectionId: number;
  patch: Record<string, unknown>;
};

export default function HomepagePreview() {
  const [version, setVersion] = useState(0);
  const iframeRef =
    useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function forwardPreviewPatch(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<HomepageSectionPreviewPatch>;

      if (
        !customEvent.detail ||
        !Number.isInteger(
          customEvent.detail.sectionId
        )
      ) {
        return;
      }

      iframeRef.current?.contentWindow?.postMessage(
        {
          type:
            "jourdeness-homepage-section-preview",
          sectionId:
            customEvent.detail.sectionId,
          patch: customEvent.detail.patch,
        },
        window.location.origin
      );
    }

    function refreshSavedDraft() {
      setVersion((current) => current + 1);
    }

    window.addEventListener(
      "jourdeness-homepage-preview-patch",
      forwardPreviewPatch
    );

    window.addEventListener(
      "jourdeness-homepage-draft-saved",
      refreshSavedDraft
    );

    return () => {
      window.removeEventListener(
        "jourdeness-homepage-preview-patch",
        forwardPreviewPatch
      );

      window.removeEventListener(
        "jourdeness-homepage-draft-saved",
        refreshSavedDraft
      );
    };
  }, []);

  return (
    <aside style={styles.preview}>
      <div style={styles.previewHeader}>
        <div>
          <strong>手機首頁預覽</strong>
          <span>
            以手機版為主要設計基準，編輯時即時同步。
          </span>
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={() =>
            setVersion(
              (current) => current + 1
            )
          }
        >
          重新整理
        </button>
      </div>

      <div style={styles.phone}>
        <iframe
          ref={iframeRef}
          key={version}
          src="/?admin=1&homepagePreview=draft"
          title="首頁手機預覽"
          style={styles.iframe}
        />
      </div>
    </aside>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  preview: {
    position: "sticky",
    top: 18,
    display: "grid",
    alignSelf: "start",
    gap: 12,
    maxHeight: "calc(100vh - 36px)",
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  refreshButton: {
    flexShrink: 0,
    border:
      "1px solid rgba(140,41,64,.22)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  phone: {
    overflow: "hidden",
    width: "100%",
    height:
      "min(760px, calc(100vh - 110px))",
    minHeight: 560,
    border: "10px solid #2e292b",
    borderRadius: 34,
    background: "#fff",
    boxShadow:
      "0 24px 50px rgba(48,34,39,.16)",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: 0,
    background: "#fff",
  },
};
