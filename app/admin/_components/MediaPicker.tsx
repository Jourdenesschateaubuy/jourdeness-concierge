"use client";

import { useEffect, useState } from "react";

import styles from "./media-picker.module.css";

type MediaPickerProps = {
  name?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

type ImageMeta = {
  width: number;
  height: number;
};

export default function MediaPicker({
  name = "image",
  value = "",
  label = "圖片網址",
  placeholder = "請從 Media Library 選擇圖片",
  helperText = "請從 Media Library 選擇圖片。",
  required = false,
  disabled = false,
  onChange,
}: MediaPickerProps) {
  const [imageUrl, setImageUrl] = useState(value);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  useEffect(() => {
    if (!imageUrl) {
      setImageMeta(null);
      setLoadError("");
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      setImageMeta({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setLoadError("");
    };

    image.onerror = () => {
      if (cancelled) return;
      setImageMeta(null);
      setLoadError("找不到圖片，請確認路徑與檔名。");
    };

    image.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  function updateValue(nextValue: string) {
    setImageUrl(nextValue);
    onChange?.(nextValue);
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.field}>
        <span>{label}{required ? " *" : ""}</span>
        <input
          name={name}
          value={imageUrl}
          onChange={(event) => updateValue(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        <small>{helperText}</small>
      </label>

      {imageUrl ? (
        <div className={styles.previewCard}>
          <div className={styles.previewFrame}>
            <img src={imageUrl} alt="圖片預覽" />
          </div>

          <div className={styles.meta}>
            <span>目前路徑</span>
            <strong>{imageUrl}</strong>

            {imageMeta ? (
              <>
                <span>實際尺寸</span>
                <strong>
                  {imageMeta.width} × {imageMeta.height} px
                </strong>

                <span>圖片比例</span>
                <strong>
                  1 : {(imageMeta.height / imageMeta.width).toFixed(2)}
                </strong>
              </>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.clearButton}
            onClick={() => updateValue("")}
            disabled={disabled}
          >
            清除圖片
          </button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          尚未設定圖片。請從 Media Library 選擇圖片。
        </div>
      )}

      {loadError ? (
        <p className={styles.error}>{loadError}</p>
      ) : null}
    </div>
  );
}

