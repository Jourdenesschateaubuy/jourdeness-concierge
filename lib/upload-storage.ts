import crypto from "node:crypto";
import path from "node:path";
import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

const PRODUCT_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

type SaveUploadedFileOptions = {
  folder: string;
  allowedTypes: Map<string, string>;
  maxSize?: number;
};

export type SavedUploadedFile = {
  fileName: string;
  absolutePath: string;
  relativePath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
};

export type SavedProductImage = SavedUploadedFile;

function getUploadRoot(): string {
  const uploadRoot = process.env.UPLOAD_ROOT?.trim();

  if (!uploadRoot) {
    throw new Error("缺少 UPLOAD_ROOT 環境變數。");
  }

  return path.resolve(uploadRoot);
}

function validateFolderName(folder: string): string {
  const normalized = folder.trim().replaceAll("\\", "/");

  if (
    !normalized ||
    normalized.startsWith("/") ||
    normalized.includes("..") ||
    !/^[a-zA-Z0-9/_-]+$/.test(normalized)
  ) {
    throw new Error("上傳資料夾名稱無效。");
  }

  return normalized;
}

function getExtension(
  file: File,
  allowedTypes: Map<string, string>,
): string {
  const extension = allowedTypes.get(file.type);

  if (!extension) {
    throw new Error("不支援這個檔案格式。");
  }

  return extension;
}

function createSafeFileName(extension: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");

  return `${timestamp}-${randomId}${extension}`;
}

export async function saveUploadedFile(
  file: File,
  options: SaveUploadedFileOptions,
): Promise<SavedUploadedFile> {
  if (!(file instanceof File)) {
    throw new Error("沒有收到有效的檔案。");
  }

  if (file.size <= 0) {
    throw new Error("檔案是空的。");
  }

  const maxSize =
    options.maxSize ?? DEFAULT_MAX_FILE_SIZE;

  if (file.size > maxSize) {
    throw new Error(
      `檔案大小不可超過 ${Math.round(
        maxSize / 1024 / 1024,
      )} MB。`,
    );
  }

  const folder = validateFolderName(options.folder);
  const extension = getExtension(
    file,
    options.allowedTypes,
  );

  const uploadRoot = getUploadRoot();
  const targetDirectory = path.join(
    uploadRoot,
    ...folder.split("/"),
  );

  await mkdir(targetDirectory, {
    recursive: true,
  });

  const fileName = createSafeFileName(extension);
  const absolutePath = path.join(
    targetDirectory,
    fileName,
  );

  const relativePath = path.posix.join(
    folder,
    fileName,
  );

  const publicUrl = `/api/uploads/${relativePath}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(absolutePath, buffer, {
    flag: "wx",
  });

  return {
    fileName,
    absolutePath,
    relativePath,
    publicUrl,
    mimeType: file.type,
    size: file.size,
  };
}

export async function saveProductImage(
  file: File,
): Promise<SavedProductImage> {
  return saveUploadedFile(file, {
    folder: "products",
    allowedTypes: PRODUCT_IMAGE_TYPES,
    maxSize: 10 * 1024 * 1024,
  });
}

export async function deleteUploadedImage(
  publicUrl: string,
): Promise<boolean> {
  if (!publicUrl.startsWith("/api/uploads/")) {
    return false;
  }

  const uploadRoot = getUploadRoot();

  const relativePath = publicUrl
    .replace("/api/uploads/", "")
    .replaceAll("/", path.sep);

  const absolutePath = path.resolve(
    uploadRoot,
    relativePath,
  );

  const relativeToRoot = path.relative(
    uploadRoot,
    absolutePath,
  );

  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error("無效的檔案路徑。");
  }

  try {
    await unlink(absolutePath);
    return true;
  } catch (error) {
    const fileError =
      error as NodeJS.ErrnoException;

    if (fileError.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}