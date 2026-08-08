export type BannerLinkType =
  | "url"
  | "category"
  | "product"
  | "none";

export type BannerItem = {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  mobileMediaId?: number | null;
  desktopMediaId?: number | null;
  mobileImage: string;
  desktopImage: string;
  alt: string;
  linkType: BannerLinkType;
  linkValue: string;
  isVisible: boolean;
};

export type BannerSnapshot = {
  items: BannerItem[];
};

export type BannerVersion = {
  id: number;
  versionNumber: number;
  action: "migration" | "publish" | "rollback";
  sourceVersionNumber?: number;
  createdAt: string;
};

export type BannerStatus = {
  draft: BannerSnapshot;
  published: BannerSnapshot;
  publishedVersionNumber: number | null;
  publishedAt: string | null;
  history: BannerVersion[];
};

export const defaultBannerSnapshot: BannerSnapshot = {
  items: [],
};
