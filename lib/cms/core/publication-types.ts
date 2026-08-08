export type CmsPublicationAction =
  | "migration"
  | "publish"
  | "rollback";

export type CmsPublicationVersion = {
  id: number;
  versionNumber: number;
  action: CmsPublicationAction;
  sourceVersionNumber?: number;
  createdAt: string;
};

export type CmsPublishedSnapshot<TSnapshot> = {
  snapshot: TSnapshot;
  versionNumber: number | null;
  publishedAt: string | null;
};

export function normalizeHistoryLimit(
  value: number,
  fallback = 12
) {
  const numeric = Number.isFinite(value)
    ? Math.floor(value)
    : fallback;

  return Math.max(
    1,
    Math.min(50, numeric)
  );
}

export function toIsoDate(
  value: Date | string
) {
  return new Date(value).toISOString();
}
