export type ImageStorageMode = "public" | "uploads";

const UPLOADABLE_PREFIXES = [
  "/products/",
  "/banners/",
  "/ip/",
] as const;

function getImageStorageMode(): ImageStorageMode {
  return process.env.NEXT_PUBLIC_IMAGE_STORAGE_MODE === "uploads"
    ? "uploads"
    : "public";
}

function isExternalOrTemporaryUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  );
}

export function resolveMediaUrl(
  input: string | null | undefined,
): string {
  if (!input) {
    return "";
  }

  const url = input.trim();

  if (!url) {
    return "";
  }

  if (
    isExternalOrTemporaryUrl(url) ||
    url.startsWith("/api/uploads/")
  ) {
    return url;
  }

  if (getImageStorageMode() !== "uploads") {
    return url;
  }

  const matchingPrefix = UPLOADABLE_PREFIXES.find(
    (prefix) => url.startsWith(prefix),
  );

  if (!matchingPrefix) {
    return url;
  }

  return `/api/uploads${url}`;
}
