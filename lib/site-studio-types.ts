export type HeroSlot = "primary" | "secondary";

export type SiteStudioHero = {
  slot: HeroSlot;
  label: string;
  image: string;
  desktopImage: string;
  alt: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  linkType: "none" | "product" | "category" | "url";
  linkValue: string;
  visible: boolean;
  imageSpec: string;
  productIds?: number[];
};

export type SiteStudioRankingItem = {
  rank: number;
  targetType?: "product" | "bundle_offer";
  targetId?: number;
  displayProductId: number;
  actionProductId: number;
  action: "detail" | "combo";
  image: string;
  title: string;
  subtitle: string;
  priceLine: string;
  promoLine: string;
  buttonLabel: string;
  layout: "wide" | "portrait" | "wide-compact";
  imageSpec: string;
  visible: boolean;
};

export type BuiltInSiteStudioSectionKey =
  | "ranking"
  | "monthlyOffers"
  | "bodyCare"
  | "health"
  | "aroma"
  | "comingSoon";

export type SiteStudioSectionKey = string;

export type SiteStudioSectionKind =
  | "system"
  | "products"
  | "image";

export type SiteStudioSection = {
  key: SiteStudioSectionKey;
  label: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  visible: boolean;
  kind?: SiteStudioSectionKind;
  sortOrder?: number;
  locked?: boolean;
  productIds?: number[];
  image?: string;
  desktopImage?: string;
  alt?: string;
  buttonLabel?: string;
  linkType?: "none" | "product" | "category" | "url";
  linkValue?: string;
};

export type SiteStudioConfig = {
  hero: SiteStudioHero;
  secondaryHero: SiteStudioHero;
  rankings: SiteStudioRankingItem[];
  sections: SiteStudioSection[];
};

export const DEFAULT_SITE_STUDIO_CONFIG: SiteStudioConfig = {
  hero: {
    slot: "primary",
    label: "首頁主視覺",
    image: "/api/studio/media/85/file",
    desktopImage: "/api/studio/media/85/file",
    alt: "佐登妮絲城堡龍血系列主視覺",
    title: "",
    subtitle: "",
    buttonLabel: "",
    linkType: "none",
    linkValue: "",
    visible: true,
    imageSpec: "手機版 750 × 900 px",
  },
  secondaryHero: {
    slot: "secondary",
    label: "首頁副主視覺",
    image: "/api/studio/media/86/file",
    desktopImage: "/api/studio/media/86/file",
    alt: "櫻の雪傳明酸夏日美白系列主視覺",
    title: "",
    subtitle: "",
    buttonLabel: "",
    linkType: "none",
    linkValue: "",
    visible: true,
    imageSpec: "手機版 750 × 900 px",
    productIds: [68, 47, 48, 49, 110],
  },
  rankings: [
    {
      rank: 1,
      displayProductId: 34,
      actionProductId: 34,
      action: "detail",
      image: "/api/studio/media/128/file",
      title: "龍血玻尿酸保濕精華液",
      subtitle: "300mL・人氣保濕明星商品",
      priceLine: "$1,980",
      promoLine: "買一送一",
      buttonLabel: "查看商品",
      layout: "wide",
      imageSpec: "750 × 500 px",
      visible: true,
    },
    {
      rank: 2,
      displayProductId: 15,
      actionProductId: 119,
      action: "combo",
      image: "/api/studio/media/129/file",
      title: "龍血求麗頭皮修護洗髮精",
      subtitle: "500mL・頭皮清潔修護",
      priceLine: "單瓶 $590",
      promoLine: "任選 3 瓶 $1,100",
      buttonLabel: "選擇搭配",
      layout: "portrait",
      imageSpec: "640 × 800 px",
      visible: true,
    },
    {
      rank: 3,
      displayProductId: 16,
      actionProductId: 119,
      action: "combo",
      image: "/api/studio/media/130/file",
      title: "龍血求麗潤澤修護沐浴乳",
      subtitle: "500mL・潤澤潔淨肌膚",
      priceLine: "單瓶 $590",
      promoLine: "任選 3 瓶 $1,100",
      buttonLabel: "選擇搭配",
      layout: "portrait",
      imageSpec: "640 × 800 px",
      visible: true,
    },
    {
      rank: 4,
      displayProductId: 120,
      actionProductId: 120,
      action: "detail",
      image: "/api/studio/media/131/file",
      title: "龍血求麗精華液",
      subtitle: "30mL＋肌可佳膠原蛋白彈潤原液 30mL",
      priceLine: "限定組合",
      promoLine: "$1,290",
      buttonLabel: "查看組合",
      layout: "wide-compact",
      imageSpec: "750 × 420 px",
      visible: true,
    },
    {
      rank: 5,
      displayProductId: 55,
      actionProductId: 55,
      action: "combo",
      image: "/api/studio/media/132/file",
      title: "人氣面膜雙選",
      subtitle: "爆水保濕 × 美白透亮",
      priceLine: "單桶 $599",
      promoLine: "任選 2 桶 $1,100｜任選 5 桶 $2,750",
      buttonLabel: "選擇搭配",
      layout: "portrait",
      imageSpec: "640 × 800 px",
      visible: true,
    },
    {
      rank: 6,
      displayProductId: 1,
      actionProductId: 1,
      action: "combo",
      image: "/api/studio/media/133/file",
      title: "人氣益生菌雙選",
      subtitle: "BC-CA 加鈣 × 蔓越莓益生菌",
      priceLine: "加鈣 $800｜蔓越莓 $990",
      promoLine: "任選 3 盒 $1,600",
      buttonLabel: "選擇搭配",
      layout: "portrait",
      imageSpec: "640 × 800 px",
      visible: true,
    },
  ],
  sections: [
    {
      key: "ranking",
      label: "熱銷排行榜",
      kind: "system",
      sortOrder: 10,
      locked: true,
      eyebrow: "",
      title: "熱銷排行榜",
      subtitle: "",
      visible: true,
    },
    {
      key: "monthlyOffers",
      label: "本月優惠",
      kind: "system",
      sortOrder: 20,
      productIds: [59, 112, 68, 54, 108, 67, 51, 121],
      eyebrow: "MONTHLY PICKS",
      title: "本月優惠・活動方案",
      subtitle: "排行榜看熱銷；這裡直接告訴你現在怎麼買更划算。",
      visible: true,
    },
    {
      key: "bodyCare",
      label: "身體洗護精選",
      kind: "products",
      sortOrder: 30,
      productIds: [54, 67, 108, 119, 112],
      eyebrow: "Body Care",
      title: "身體洗護精選",
      subtitle: "洗髮沐浴、牙膏、手工皂與身體保養集中選購。",
      visible: true,
    },
    {
      key: "health",
      label: "健康補給精選",
      kind: "products",
      sortOrder: 40,
      productIds: [1, 58, 2, 3, 69, 56],
      eyebrow: "Health Hall",
      title: "健康補給精選",
      subtitle: "益生菌、葉黃素、膠原蛋白與日常營養補給。",
      visible: true,
    },
    {
      key: "aroma",
      label: "精油香氛精選",
      kind: "products",
      sortOrder: 50,
      productIds: [85, 74, 79, 82, 75, 76],
      eyebrow: "Aroma Hall",
      title: "精油香氛精選",
      subtitle: "單方、複方精油與擴香選品，打造日常香氛儀式。",
      visible: true,
    },
    {
      key: "comingSoon",
      label: "新品預告",
      kind: "system",
      sortOrder: 60,
      productIds: [72, 73, 117, 118],
      eyebrow: "New Preview",
      title: "新品預告",
      subtitle: "新品與新香型陸續登場，搶先查看。",
      visible: true,
    },
  ],
};

function normalizeHero(
  value: Partial<SiteStudioHero> | null | undefined,
  fallback: SiteStudioHero
): SiteStudioHero {
  return {
    ...fallback,
    ...(value ?? {}),
    slot: fallback.slot,
    visible:
      typeof value?.visible === "boolean"
        ? value.visible
        : fallback.visible,
  };
}

function normalizeRanking(
  value: Partial<SiteStudioRankingItem> | null | undefined,
  fallback: SiteStudioRankingItem
): SiteStudioRankingItem {
  return {
    ...fallback,
    ...(value ?? {}),
    rank: fallback.rank,
    visible:
      typeof value?.visible === "boolean"
        ? value.visible
        : fallback.visible,
  };
}

function normalizeSection(
  value: Partial<SiteStudioSection> | null | undefined,
  fallback: SiteStudioSection
): SiteStudioSection {
  const merged = {
    ...fallback,
    ...(value ?? {}),
    key: fallback.key,
    visible:
      typeof value?.visible === "boolean"
        ? value.visible
        : fallback.visible,
  };

  return {
    ...merged,
    kind: merged.kind ?? "system",
    sortOrder:
      typeof merged.sortOrder === "number"
        ? merged.sortOrder
        : fallback.sortOrder ?? 999,
    locked: Boolean(merged.locked),
    productIds: Array.isArray(merged.productIds)
      ? merged.productIds
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      : [],
    linkType: merged.linkType ?? "none",
    linkValue: merged.linkValue ?? "",
  };
}

function normalizeCustomSection(
  value: Partial<SiteStudioSection>,
  index: number
): SiteStudioSection | null {
  if (!value.key || !String(value.key).startsWith("custom-")) return null;

  const kind: SiteStudioSectionKind =
    value.kind === "image" ? "image" : "products";

  return {
    key: String(value.key),
    label: String(value.label ?? value.title ?? "自訂首頁區塊"),
    eyebrow: String(value.eyebrow ?? ""),
    title: String(value.title ?? "自訂首頁區塊"),
    subtitle: String(value.subtitle ?? ""),
    visible: value.visible !== false,
    kind,
    sortOrder:
      typeof value.sortOrder === "number" ? value.sortOrder : 100 + index,
    locked: false,
    productIds: Array.isArray(value.productIds)
      ? value.productIds
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      : [],
    image: String(value.image ?? ""),
    desktopImage: String(value.desktopImage ?? ""),
    alt: String(value.alt ?? value.title ?? "首頁視覺圖片"),
    buttonLabel: String(value.buttonLabel ?? ""),
    linkType: value.linkType ?? "none",
    linkValue: String(value.linkValue ?? ""),
  };
}

export function normalizeSiteStudioConfig(
  value: Partial<SiteStudioConfig> | null | undefined
): SiteStudioConfig {
  const rankings = DEFAULT_SITE_STUDIO_CONFIG.rankings.map((fallback) =>
    normalizeRanking(
      value?.rankings?.find((item) => item.rank === fallback.rank),
      fallback
    )
  );

  const builtInKeys = new Set(
    DEFAULT_SITE_STUDIO_CONFIG.sections.map((item) => item.key)
  );
  const builtInSections = DEFAULT_SITE_STUDIO_CONFIG.sections.map((fallback) =>
    normalizeSection(
      value?.sections?.find((item) => item.key === fallback.key),
      fallback
    )
  );
  const customSections = (value?.sections ?? [])
    .filter((item) => !builtInKeys.has(item.key))
    .map((item, index) => normalizeCustomSection(item, index))
    .filter((item): item is SiteStudioSection => Boolean(item));
  const sections = [...builtInSections, ...customSections].sort(
    (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
  );

  return {
    hero: normalizeHero(value?.hero, DEFAULT_SITE_STUDIO_CONFIG.hero),
    secondaryHero: normalizeHero(
      value?.secondaryHero,
      DEFAULT_SITE_STUDIO_CONFIG.secondaryHero
    ),
    rankings,
    sections,
  };
}

export type SiteStudioPreviewPatch =
  | { hero: SiteStudioHero }
  | { secondaryHero: SiteStudioHero }
  | { ranking: SiteStudioRankingItem }
  | { section: SiteStudioSection };

export function applySiteStudioPreviewPatch(
  current: SiteStudioConfig,
  patch: SiteStudioPreviewPatch
): SiteStudioConfig {
  if ("hero" in patch) {
    return {
      ...current,
      hero: patch.hero,
    };
  }

  if ("secondaryHero" in patch) {
    return {
      ...current,
      secondaryHero: patch.secondaryHero,
    };
  }

  if ("ranking" in patch) {
    return {
      ...current,
      rankings: current.rankings.map((item) =>
        item.rank === patch.ranking.rank ? patch.ranking : item
      ),
    };
  }

  return {
    ...current,
    sections: current.sections.map((item) =>
      item.key === patch.section.key ? patch.section : item
    ),
  };
}







