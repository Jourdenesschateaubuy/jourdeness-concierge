"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import styles from "./product-image-uploader.module.css";

type ProductImageUploaderProps = {
  initialImage?: string;
};

export default function ProductImageUploader({
  initialImage = "",
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [imageUrl, setImageUrl] = useState(initialImage);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("圖片不可超過 10MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const blob = await upload(
        `products/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/admin/product-images/upload",
        }
      );

      setImageUrl(blob.url);
      setPreviewUrl(blob.url);
    } catch (uploadError) {
      console.error(uploadError);
      setError("圖片上傳失敗，請再試一次");
      setPreviewUrl(imageUrl);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage() {
    setImageUrl("");
    setPreviewUrl("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      <input type="hidden" name="image" value={imageUrl} />

      {previewUrl ? (
        <div className={styles.previewCard}>
          <img
            src={previewUrl}
            alt="商品圖片預覽"
            className={styles.preview}
          />

          <div className={styles.previewActions}>
            <span>主圖</span>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              更換圖片
            </button>

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
            >
              刪除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <strong>{uploading ? "圖片上傳中…" : "＋ 加入圖片"}</strong>
          <span>從手機相簿或檔案選擇</span>
        </button>
      )}

      {uploading && (
        <p className={styles.status}>圖片正在上傳，請稍候…</p>
      )}

      {error && (
        <p className={styles.error}>{error}</p>
      )}
    </div>
  );
}
