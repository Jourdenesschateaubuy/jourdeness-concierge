"use client";

import { useEffect, useRef, useState } from "react";
import { readJsonResponse } from "../../../../lib/http-json";
import styles from "./product-image-uploader.module.css";

type ProductImageUploaderProps = {
  initialImage?: string;
};

type UploadResponse = {
  url?: string;
  error?: string;
};

export default function ProductImageUploader({
  initialImage = "",
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const localPreviewRef = useRef("");

  const [imageUrl, setImageUrl] = useState(initialImage);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
    type: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("只支援 JPG、PNG 或 WebP 圖片");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("圖片不可超過 10 MB");
      event.target.value = "";
      return;
    }

    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }

    const localPreview = URL.createObjectURL(file);
    localPreviewRef.current = localPreview;

    try {
      const dimensions = await new Promise<{
        width: number;
        height: number;
      }>((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };

        image.onerror = () => {
          reject(new Error("無法讀取圖片尺寸"));
        };

        image.src = localPreview;
      });

      setImageInfo({
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        type: file.type,
      });

      setPreviewUrl(localPreview);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/product-images/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const result =
        await readJsonResponse<UploadResponse>(
          response,
          "圖片上傳失敗"
        );

      if (!response.ok || !result.url) {
        throw new Error(result.error || "圖片上傳失敗");
      }

      setImageUrl(result.url);
      setPreviewUrl(result.url);

      URL.revokeObjectURL(localPreview);
      localPreviewRef.current = "";
    } catch (uploadError) {
      console.warn(uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "圖片上傳失敗，請再試一次",
      );

      setPreviewUrl(imageUrl);
      setImageInfo(null);

      URL.revokeObjectURL(localPreview);
      localPreviewRef.current = "";
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage() {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = "";
    }

    setImageUrl("");
    setPreviewUrl("");
    setImageInfo(null);
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

          {imageInfo ? (
            <div className={styles.imageInfo}>
              <strong>目前圖片資訊</strong>

              <span>
                尺寸：{imageInfo.width} × {imageInfo.height} px
              </span>

              <span>
                比例：1 :{" "}
                {(imageInfo.height / imageInfo.width).toFixed(2)}
              </span>

              <span>
                格式：
                {imageInfo.type
                  .replace("image/", "")
                  .replace("jpeg", "JPG")
                  .toUpperCase()}
              </span>

              <span>
                大小：
                {imageInfo.size >= 1024 * 1024
                  ? `${(imageInfo.size / 1024 / 1024).toFixed(2)} MB`
                  : `${Math.round(imageInfo.size / 1024)} KB`}
              </span>
            </div>
          ) : null}

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
          <strong>
            {uploading ? "圖片上傳中…" : "＋ 加入圖片"}
          </strong>
          <span>從手機相簿或檔案選擇</span>
        </button>
      )}

      {uploading ? (
        <p className={styles.status}>圖片正在上傳，請稍候…</p>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}