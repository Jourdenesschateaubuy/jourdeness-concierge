export type WebsiteSettingsData = {
  siteName: string;
  siteTagline: string;

  supportPhone: string;
  supportEmail: string;
  lineUrl: string;
  serviceHours: string;
  companyAddress: string;

  facebookUrl: string;
  instagramUrl: string;
  threadsUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;

  seoTitle: string;
  seoDescription: string;

  companyName: string;
  taxId: string;
  copyrightText: string;

  language: string;
  timezone: string;
  currency: string;
};

export type WebsiteSettingsPublicationVersion = {
  id: number;
  versionNumber: number;
  action: "migration" | "publish" | "rollback";
  sourceVersionNumber?: number;
  createdAt: string;
};

export type WebsiteSettingsStatus = {
  draft: WebsiteSettingsData;
  published: WebsiteSettingsData;
  publishedVersionNumber: number | null;
  publishedAt: string | null;
  history: WebsiteSettingsPublicationVersion[];
};

export const defaultWebsiteSettings: WebsiteSettingsData = {
  siteName: "Jourdeness",
  siteTagline: "",

  supportPhone: "",
  supportEmail: "",
  lineUrl: "",
  serviceHours: "",
  companyAddress: "",

  facebookUrl: "",
  instagramUrl: "",
  threadsUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",

  seoTitle: "Jourdeness",
  seoDescription: "",

  companyName: "",
  taxId: "",
  copyrightText: "",

  language: "zh-TW",
  timezone: "Asia/Taipei",
  currency: "TWD",
};
