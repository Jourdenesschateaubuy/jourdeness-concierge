"use client";

import {
  useEffect,
  useState,
} from "react";

import MediaPicker, {
  type PickerMediaAsset,
} from "../../website-studio/components/MediaPicker";

type ProductImageUploaderProps = {
  initialImage?: string;
  onUploadingChange?: (
    uploading: boolean
  ) => void;
};

function mediaUrl(
  assetId: number
) {
  return `/api/studio/media/${assetId}/file`;
}

export default function ProductImageUploader({
  initialImage = "",
  onUploadingChange,
}: ProductImageUploaderProps) {
  const [image, setImage] =
    useState(initialImage);
  const [pickerOpen, setPickerOpen] =
    useState(false);

  useEffect(() => {
  onUploadingChange?.(false);
}, [onUploadingChange]);

  function selectAsset(
    asset: PickerMediaAsset
  ) {
    setImage(mediaUrl(asset.id));
  }

  return (
    <div style={styles.wrapper}>
      <input
        type="hidden"
        name="image"
        value={image}
      />

      <div style={styles.preview}>
        {image ? (
          <img
            src={image}
            alt=""
            style={styles.image}
          />
        ) : (
          <span style={styles.placeholder}>
            尚未設定商品圖片
          </span>
        )}
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() =>
            setPickerOpen(true)
          }
          style={styles.pickButton}
        >
          從 Media Library 選擇
        </button>

        {image ? (
          <button
            type="button"
            onClick={() =>
              setImage("")
            }
            style={styles.clearButton}
          >
            清除
          </button>
        ) : null}
      </div>

      <small style={styles.helper}>
        商品圖片統一從 Media Library 選擇。
        既有 /products/... 圖片仍保留相容；
        新選圖片會保存為 Media Asset API 路徑。
      </small>

      <MediaPicker
        open={pickerOpen}
        title="選擇商品主圖"
        onClose={() =>
          setPickerOpen(false)
        }
        onSelect={selectAsset}
      />
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  wrapper: {
    display: "grid",
    gap: 10,
  },

  preview: {
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    minHeight: 220,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 14,
    background: "#f8f2ee",
  },

  image: {
    display: "block",
    width: "100%",
    maxHeight: 360,
    objectFit: "contain",
  },

  placeholder: {
    color: "#8b7c80",
  },

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  pickButton: {
    border: 0,
    borderRadius: 999,
    padding: "9px 13px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  clearButton: {
    border:
      "1px solid rgba(140,41,64,.16)",
    borderRadius: 999,
    padding: "9px 13px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  helper: {
    color: "#75666a",
    lineHeight: 1.5,
  },
};
