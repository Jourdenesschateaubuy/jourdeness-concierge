"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PickerShell from "./PickerShell";

export type PickerMediaAsset = {
  id: number;
  originalName: string;
  title: string;
  altText: string;
  mimeType: string;
  byteSize: number;
  tags: string[];
  createdAt: string;
  fileUrl: string;
};

export default function MediaPicker({
  open,
  title = "選擇圖片",
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean;
  title?: string;
  selectedId?: number | null;
  onSelect: (
    asset: PickerMediaAsset
  ) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] =
    useState<PickerMediaAsset[]>([]);
  const [search, setSearch] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/studio/media?limit=200",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !cancelled &&
          response.ok
        ) {
          setAssets(
            Array.isArray(
              data.assets
            )
              ? data.assets
              : []
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLocaleLowerCase(
            "zh-TW"
          );

      if (!needle) {
        return assets;
      }

      return assets.filter(
        (asset) =>
          [
            asset.title,
            asset.originalName,
            asset.altText,
            asset.tags.join(" "),
          ]
            .join(" ")
            .toLocaleLowerCase(
              "zh-TW"
            )
            .includes(needle)
      );
    }, [assets, search]);

  return (
    <PickerShell
      open={open}
      eyebrow="MEDIA LIBRARY"
      title={title}
      searchValue={search}
      searchPlaceholder="搜尋圖片名稱、Alt、標籤"
      onSearchChange={setSearch}
      onClose={onClose}
      loading={loading}
      empty={
        !loading &&
        filtered.length === 0
      }
      emptyText="目前沒有符合條件的圖片。"
      countText={`${filtered.length} 張`}
    >
      <div style={styles.grid}>
        {filtered.map(
          (asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                onSelect(asset);
                onClose();
              }}
              style={{
                ...styles.card,
                ...(selectedId ===
                asset.id
                  ? styles.cardActive
                  : {}),
              }}
            >
              <img
                src={asset.fileUrl}
                alt={
                  asset.altText ||
                  asset.title
                }
                style={styles.image}
              />

              <span style={styles.cardBody}>
                <strong>
                  {asset.title}
                </strong>

                <small>
                  #{asset.id}
                </small>
              </span>
            </button>
          )
        )}
      </div>
    </PickerShell>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0,1fr))",
    gap: 12,
  },

  card: {
    overflow: "hidden",
    padding: 0,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },

  cardActive: {
    border:
      "2px solid #8c2940",
  },

  image: {
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    background: "#f4efec",
  },

  cardBody: {
    display: "grid",
    gap: 3,
    padding: 9,
  },
};
