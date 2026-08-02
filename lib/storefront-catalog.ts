import type {
  CatalogCategory,
  CatalogSeries,
} from "./catalog-repository";

export const STOREFRONT_CATEGORY_NAMES = [
  "本月優惠",
  "臉部保養",
  "身體洗護",
  "健康補給",
  "精油香氛",
  "新品預告",
] as const;

export type StorefrontCategoryName =
  (typeof STOREFRONT_CATEGORY_NAMES)[number];

export const DEFAULT_STOREFRONT_SERIES: Record<
  StorefrontCategoryName,
  string[]
> = {
  本月優惠: ["組合優惠", "買一送一", "任選優惠"],
  臉部保養: [
    "龍血系列",
    "保濕修護",
    "亮白保養",
    "舒緩敏感",
    "面膜",
    "高級養護",
  ],
  身體洗護: [
    "口腔護理",
    "手工皂",
    "洗髮沐浴",
    "身體保養",
    "身體舒壓",
  ],
  健康補給: ["益生菌", "葉黃素", "膠原蛋白", "魚油"],
  精油香氛: [
    "精萃油",
    "美體精油保養",
    "單方精油",
    "複方精油",
    "七序精油",
    "精油配件",
    "擴香設備",
  ],
  新品預告: ["新品預告"],
};

export function isStorefrontCategoryName(
  value: string
): value is StorefrontCategoryName {
  return STOREFRONT_CATEGORY_NAMES.includes(
    value as StorefrontCategoryName
  );
}

export function buildFallbackStorefrontCatalog(): {
  categories: CatalogCategory[];
  series: CatalogSeries[];
} {
  const categories = STOREFRONT_CATEGORY_NAMES.map(
    (name, index) => ({
      id: index + 1,
      name,
      sortOrder: index,
      isActive: true,
    })
  );

  const series = categories.flatMap((category) =>
    DEFAULT_STOREFRONT_SERIES[
      category.name as StorefrontCategoryName
    ].map((name, index) => ({
      id: category.id * 100 + index + 1,
      categoryId: category.id,
      categoryName: category.name,
      name,
      sortOrder: index,
      isActive: true,
    }))
  );

  return { categories, series };
}
