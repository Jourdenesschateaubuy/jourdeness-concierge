export type NavigationItem = {
  id: string;
  label: string;
  linkType:
    | "url"
    | "category"
    | "homepage"
    | "none";
  linkValue: string;
  isVisible: boolean;
};

export type NavigationSnapshot = {
  items: NavigationItem[];
};

export type NavigationVersion = {
  id: number;
  versionNumber: number;
  action: "migration" | "publish" | "rollback";
  sourceVersionNumber?: number;
  createdAt: string;
};

export type NavigationStatus = {
  draft: NavigationSnapshot;
  published: NavigationSnapshot;
  publishedVersionNumber: number | null;
  publishedAt: string | null;
  history: NavigationVersion[];
};

export const defaultNavigation: NavigationSnapshot = {
  items: [
    {
      id: "home",
      label: "首頁",
      linkType: "homepage",
      linkValue: "/",
      isVisible: true,
    },
    {
      id: "products",
      label: "商品",
      linkType: "url",
      linkValue: "/#products",
      isVisible: true,
    },
    {
      id: "brand",
      label: "品牌故事",
      linkType: "url",
      linkValue: "/#brand",
      isVisible: true,
    },
  ],
};

