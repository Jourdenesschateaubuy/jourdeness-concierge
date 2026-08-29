"use client";

import {
  useEffect,
  useState,
} from "react";

export default function HomepagePreview() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    function refreshSavedDraft() {
      setVersion(
        (current) =>
          current + 1
      );
    }

    window.addEventListener(
      "jourdeness-homepage-draft-saved",
      refreshSavedDraft
    );

    return () => {
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
          <strong>
            手機首頁預覽
          </strong>

          <span>
            草稿即時同步
          </span>
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={() =>
            setVersion(
              (current) =>
                current + 1
            )
          }
        >
          重新整理
        </button>
      </div>

      <div style={styles.phone}>
        <iframe
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
    top: 12,
    display: "grid",
    alignSelf: "start",
    gap: 7,
    maxHeight:
      "calc(100vh - 36px)",
  },

  previewHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    gap: 12,
  },

  refreshButton: {
    flexShrink: 0,
    border:
      "1px solid rgba(140,41,64,.22)",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  phone: {
    overflow: "hidden",
    width: "100%",
    height:
      "min(790px, calc(100vh - 90px))",
    minHeight: 560,
    border:
      "10px solid #2e292b",
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



