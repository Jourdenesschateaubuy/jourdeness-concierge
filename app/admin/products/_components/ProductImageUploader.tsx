"use client";

import MediaPicker from "../../_components/MediaPicker";

type ProductImageUploaderProps = {
  initialImage?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

export default function ProductImageUploader({
  initialImage = "",
  onUploadingChange,
}: ProductImageUploaderProps) {
  // 保留舊介面，避免現有 ProductForm / ProductCardEditForm 需要同時改動。
  // 圖片不再上傳，因此永遠回報 false。
  onUploadingChange?.(false);

  return (
    <MediaPicker
      name="image"
      value={initialImage}
      label="商品圖片"
      placeholder="/products/no1.png"
      helperText="圖片請先放入 public/products，再輸入 /products/檔名。"
      required
    />
  );
}
