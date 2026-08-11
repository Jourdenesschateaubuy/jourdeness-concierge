// Jourdeness storefront build: V3.8.6 — 龍血玫瑰皂改為自由配選項，不再單獨顯示商品卡。

export const categoryConfig = {
  本月優惠: ["全部", "組合優惠", "買一送一", "任選優惠"],
  臉部保養: ["全部", "龍血系列", "保濕修護", "亮白保養", "舒緩敏感", "面膜", "高級養護"],
  身體洗護: ["全部", "口腔護理", "手工皂", "洗髮沐浴", "身體保養", "身體舒壓"],
  健康補給: ["全部", "益生菌", "葉黃素", "膠原蛋白", "魚油"],
  精油香氛: ["全部", "單方精油", "複方精油", "七序精油", "精萃油", "美體精油保養", "精油配件", "擴香設備"],
  新品預告: ["全部"],

  // 以下舊分類保留為資料型別相容與內部搜尋用，不再顯示為前台主分類。
  本月精選: ["全部", "回購主打", "組合優惠", "高級養護"],
  保養美肌: ["全部", "龍血系列", "薰衣草系列", "水光肌能系列", "櫻の雪傳明酸美白系列", "玫瑰超微晶萃系列", "肌光緊緻速妍系列", "冰河淨化系列", "杏仁酸系列", "冷杉系列", "面膜"],
  健康保健: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列", "口腔保健", "魚油組合"],
  組合價: ["全部", "本月主打", "保健食品組合", "貼布組合", "牙膏組合", "保養套組", "肥皂組合", "護唇膏組合", "面膜組合"],
  全部: ["全部"],
  保養品: ["全部", "冷杉系列", "薰衣草系列", "龍血系列", "INSK乳酸平衡系列", "水光肌能系列", "晶淬雪系列", "玫瑰超微晶萃系列", "肌光緊緻速妍系列", "冰河淨化系列", "櫻の雪傳明酸美白系列", "茶樹控油系列", "杏仁酸系列", "膠原蛋白系列", "鳳梨酵素系列", "防曬", "特殊護理", "頂級養護", "面膜"],
  保健食品: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐: ["全部", "洗沐系列", "阿甘綠柔護髮系列"],
  精油: ["全部", "單方精油", "複方精油", "七序精油", "精萃油", "美體精油保養", "精油配件", "擴香設備"],
  牙膏: ["全部", "牙膏"],
  肥皂: ["全部", "肥皂"],
  護唇膏: ["全部", "護唇膏"],
  護手霜: ["全部", "護手霜"],
  香水: ["全部", "香水"],
  面膜: ["全部", "保濕面膜", "亮白面膜", "修護面膜", "面膜組合"],
  貼布: ["全部", "貼布"],
  外部廠商: ["全部"],
} as const;

export type MainCategory = keyof typeof categoryConfig;

export type Product = {
  id: number;
  displayCode?: string;
  productType?: "standard" | "combo";
  name: string;
  category: MainCategory;
  series: string;
  storefrontCategory?: MainCategory;
  // 結構化價格欄位。舊 price/originalPrice 暫時保留作前台相容與回滾。
  salePriceAmount?: number;
  originalPriceAmount?: number;
  promotionText?: string;
  originalPrice?: string;
  price: string;
  image: string;
  description: string;

  // 正式商城欄位：首頁商品卡 / 商品資訊頁可分開維護
  cardName?: string;
  cardSubtitle?: string;
  spec?: string;
  intro?: string;
  priceNote?: string;
  expiryNote?: string;
  internalExpiryDate?: string; // 內部庫存管理用；前台可不顯示
  features?: string[];
  suitableFor?: string[];
  usage?: string;
  notice?: string;
  gallery?: string[];
  expandedInfo?: Array<{
    title: string;
    content: string;
  }>;
  comboConfig?: ComboConfig;
};

export type ComboOption = {
  id: string;
  name: string;
  productId?: number;
  quantity?: number;
  singleUnitPrice?: number;
  singlePriceLabel?: string;
};

export type ComboPlan = {
  id: string;
  label: string;
  requiredQuantity: number;
  price: number;
  priceLabel: string;
  note?: string;
  buyQuantity?: number;
  freeQuantity?: number;
  bonusGift?: {
    name: string;
    quantity: number;
    unitLabel?: string;
  };
};

export type ComboConfig = {
  productId: number;
  type?: "fixed_bundle" | "mix_match" | "buy_get";
  unitLabel: string;
  allowSameProduct?: boolean;
  options: ComboOption[];
  plans: ComboPlan[];
  note?: string;
  singleUnitPrice?: number;
  singlePriceLabel?: string;
};

export type ComboSelection = {
  optionId: string;
  name: string;
  quantity: number;
};

export type CartItem = {
  cartKey: string;
  product: Product;
  quantity: number;
  comboPlanId?: string;
  comboPlanLabel?: string;
  comboSelections?: ComboSelection[];
  comboPrice?: number;
};

type CartPromotionAllocationV366 = {
  productId: number;
  quantity: number;
  unitPrice: number;
  optionId?: string;
  optionName?: string;
};

export type CartPromotionSuggestionV366 = {
  id: string;
  title: string;
  detail: string;
  comboProductId: number;
  comboPlanId?: string;
  allocations: CartPromotionAllocationV366[];
  comboSelections?: ComboSelection[];
  bundlePrice: number;
  savings: number;
  note?: string;
};

export type CustomerForm = {
  customerName: string;
  lineId: string;
  phone: string;
  deliveryMethod: string;
  address: string;
  note: string;
};

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type LiffProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type LiffApi = {
  init: (config: { liffId: string }) => Promise<void>;
  isLoggedIn: () => boolean;
  login: () => void;
  getProfile: () => Promise<LiffProfile>;
};

declare global {
  interface Window {
    liff?: LiffApi;
  }
}

// V3.3.0：主視覺改為單張滿版圖片，首頁主要區塊去卡片化，活動入口改為流動式橫列。
export const ORDER_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycby0y2ZUqvK1NirASTytkDcuQEkYSfSOIqpmmzDilxQfqaYDVPwxPmOjlX2337aQeyfzQg/exec";

export const CART_STORAGE_KEY = "jourdeness_saved_cart_v2";
export const CUSTOMER_DRAFT_STORAGE_KEY = "jourdeness_customer_draft_v1";
export const LINE_PROFILE_STORAGE_KEY = "jourdeness_line_profile_v1";
export const LINE_LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID || "";
export const LIFF_SDK_SRC = "https://static.line-scdn.net/liff/edge/2/sdk.js";

const comboConfigsV360: Record<number, ComboConfig> = {
  1: {
    productId: 1,
    unitLabel: "盒",
    singlePriceLabel: "高鈣單盒 $800｜蔓越莓單盒 $990",
    options: [
      {
        id: "cranberry-probiotic",
        name: "蔓越莓益生菌",
        singleUnitPrice: 990,
        singlePriceLabel: "單盒 $990",
      },
      {
        id: "calcium-probiotic",
        name: "高鈣益生菌",
        singleUnitPrice: 800,
        singlePriceLabel: "單盒 $800",
      },
    ],
    plans: [
      {
        id: "three-boxes",
        label: "任選 3 盒",
        requiredQuantity: 3,
        price: 1600,
        priceLabel: "$1,600",
      },
    ],
  },
  51: {
    productId: 51,
    unitLabel: "盒",
    singleUnitPrice: 500,
    singlePriceLabel: "單盒 $500",
    options: [
      { id: "cool-patch", name: "石墨烯電氣石精油貼布（涼感）" },
      { id: "warm-patch", name: "石墨烯電氣石精油貼布（溫感）" },
    ],
    plans: [
      {
        id: "four-boxes",
        label: "任選 4 盒",
        requiredQuantity: 4,
        price: 1099,
        priceLabel: "$1,099",
      },
      {
        id: "ten-boxes",
        label: "任選 10 盒",
        requiredQuantity: 10,
        price: 2500,
        priceLabel: "$2,500",
      },
    ],
  },
  54: {
    productId: 54,
    unitLabel: "條",
    singleUnitPrice: 250,
    singlePriceLabel: "單條 $250",
    options: [
      { id: "lavender-toothpaste", name: "薰衣草齒齦保健牙膏" },
      { id: "dragon-blood-toothpaste", name: "龍血齒齦保健牙膏" },
    ],
    plans: [
      {
        id: "three-tubes",
        label: "買二送一・共 3 條",
        requiredQuantity: 3,
        price: 500,
        priceLabel: "$500",
      },
    ],
  },
  55: {
    productId: 55,
    unitLabel: "桶",
    singleUnitPrice: 599,
    singlePriceLabel: "單桶 $599",
    options: [
      { id: "water-mask-35", name: "水搖滾保濕面膜 35片" },
      { id: "white-mask-35", name: "極光白美白面膜 35片" },
    ],
    plans: [
      {
        id: "two-buckets",
        label: "任選 2 桶",
        requiredQuantity: 2,
        price: 1100,
        priceLabel: "$1,100",
      },
      {
        id: "five-buckets",
        label: "任選 5 桶",
        requiredQuantity: 5,
        price: 2750,
        priceLabel: "$2,750",
        note: "任選 5 桶加贈面膜 10 片。",
      },
    ],
  },
  67: {
    productId: 67,
    unitLabel: "入",
    singleUnitPrice: 290,
    singlePriceLabel: "單入 $290",
    options: [
      { id: "lavender-soap", name: "龍血薰衣草舒緩皂" },
      { id: "rose-soap", name: "龍血玫瑰美膚皂" },
      { id: "mugwort-soap", name: "龍血艾草保庇皂" },
      { id: "lemon-soap", name: "龍血檸檬馬鞭草皂" },
    ],
    plans: [
      {
        id: "four-soaps",
        label: "任選 4 入",
        requiredQuantity: 4,
        price: 799,
        priceLabel: "$799",
      },
    ],
  },
  108: {
    productId: 108,
    unitLabel: "條",
    singleUnitPrice: 290,
    singlePriceLabel: "單條 $290",
    options: [
      { id: "lavender-hand-cream", name: "薰衣草舒緩護手霜" },
      { id: "sakura-hand-cream", name: "櫻之雪亮澤護手霜" },
      { id: "tea-tree-hand-cream", name: "茶樹防禦護手霜" },
    ],
    plans: [
      {
        id: "three-hand-creams",
        label: "買二送一・共 3 條",
        requiredQuantity: 3,
        price: 580,
        priceLabel: "$580",
      },
    ],
  },
  119: {
    productId: 119,
    unitLabel: "瓶",
    singleUnitPrice: 590,
    singlePriceLabel: "單瓶 $590",
    options: [
      { id: "dragon-blood-shampoo", name: "龍血求麗頭皮修護洗髮精" },
      { id: "dragon-blood-body-wash", name: "龍血求麗潤澤修護沐浴乳" },
    ],
    plans: [
      {
        id: "three-bottles",
        label: "任選 3 瓶",
        requiredQuantity: 3,
        price: 1100,
        priceLabel: "$1,100",
      },
    ],
  },
};

export function getComboConfig(_productId: number) {
  // 所有正式組合方案已改由資料庫 combo_config 管理。
  // 保留函式只為相容既有呼叫，不再回傳舊寫死設定。
  return null;
}

type FlexibleComboPricingV369 = {
  price: number;
  label: string;
  priceLabel: string;
  note?: string;
};

export function hasFlexibleSinglePricingV373(config: ComboConfig) {
  if (config.type === "fixed_bundle") return false;

  return Boolean(
    config.singleUnitPrice ||
      config.options.some((option) => option.singleUnitPrice)
  );
}

export function calculateFlexibleComboPricingV369(
  config: ComboConfig,
  selections: Record<string, number>
): FlexibleComboPricingV369 | null {
  if (config.type === "fixed_bundle") return null;

  const selectedUnitPrices: number[] = [];

  for (const option of config.options) {
    const quantity = selections[option.id] ?? 0;
    const unitPrice = option.singleUnitPrice ?? config.singleUnitPrice;

    if (quantity <= 0) continue;
    if (!unitPrice) return null;

    for (let index = 0; index < quantity; index += 1) {
      selectedUnitPrices.push(unitPrice);
    }
  }

  const quantity = selectedUnitPrices.length;
  if (quantity <= 0) return null;

  // 優惠組合可以由任意品項搭配；未被組合價涵蓋的品項則以各自單價計算。
  // 將較便宜的品項留作單買，可得到固定選擇內容下的最低應付金額。
  selectedUnitPrices.sort((a, b) => a - b);
  const prefixSingleCost = Array<number>(quantity + 1).fill(0);
  for (let index = 0; index < quantity; index += 1) {
    prefixSingleCost[index + 1] = prefixSingleCost[index] + selectedUnitPrices[index];
  }

  const planDp = Array<number>(quantity + 1).fill(Number.POSITIVE_INFINITY);
  planDp[0] = 0;

  for (let bundledCount = 1; bundledCount <= quantity; bundledCount += 1) {
    for (const plan of config.plans) {
      if (plan.requiredQuantity <= bundledCount) {
        planDp[bundledCount] = Math.min(
          planDp[bundledCount],
          planDp[bundledCount - plan.requiredQuantity] + plan.price
        );
      }
    }
  }

  let bestPrice = prefixSingleCost[quantity];
  let bestBundledQuantity = 0;

  for (let bundledCount = 1; bundledCount <= quantity; bundledCount += 1) {
    if (!Number.isFinite(planDp[bundledCount])) continue;
    const singleCount = quantity - bundledCount;
    const candidatePrice = planDp[bundledCount] + prefixSingleCost[singleCount];

    if (candidatePrice < bestPrice) {
      bestPrice = candidatePrice;
      bestBundledQuantity = bundledCount;
    }
  }

  const exactPlan = config.plans.find(
    (plan) =>
      plan.requiredQuantity === quantity &&
      plan.price === bestPrice
  );
  const label = exactPlan
    ? exactPlan.label
    : bestBundledQuantity === 0
      ? `單買 ${quantity} ${config.unitLabel}`
      : `彈性選購 ${quantity} ${config.unitLabel}`;

  return {
    price: bestPrice,
    label,
    priceLabel: `$${bestPrice.toLocaleString("zh-TW")}`,
    note: exactPlan?.note,
  };
}

export function buildSimpleCartKey(productId: number) {
  return `product-${productId}`;
}

export function buildComboCartKey(
  productId: number,
  planId: string,
  selections: ComboSelection[]
) {
  const selectionKey = selections
    .filter((selection) => selection.quantity > 0)
    .slice()
    .sort((a, b) => a.optionId.localeCompare(b.optionId))
    .map((selection) => `${selection.optionId}:${selection.quantity}`)
    .join("|");

  return `combo-${productId}-${planId}-${selectionKey}`;
}

export function getSimpleCartQuantityV366(cartItems: CartItem[], productId: number) {
  const simpleKey = buildSimpleCartKey(productId);
  return cartItems.reduce((total, item) => {
    if (item.cartKey !== simpleKey || item.comboSelections) return total;
    return total + item.quantity;
  }, 0);
}

function allocateSimpleProductsV366(
  cartItems: CartItem[],
  candidates: Array<{
    productId: number;
    unitPrice: number;
    optionId?: string;
    optionName?: string;
  }>,
  requiredQuantity: number
) {
  let remaining = requiredQuantity;
  const allocations: CartPromotionAllocationV366[] = [];

  for (const candidate of candidates) {
    if (remaining <= 0) break;
    const available = getSimpleCartQuantityV366(cartItems, candidate.productId);
    const quantity = Math.min(available, remaining);
    if (quantity <= 0) continue;

    allocations.push({
      ...candidate,
      quantity,
    });
    remaining -= quantity;
  }

  return remaining === 0 ? allocations : [];
}

export function buildCartPromotionSuggestionsV366(
  cartItems: CartItem[],
  resolveComboConfig: (productId: number) => ComboConfig | null = getComboConfig
): CartPromotionSuggestionV366[] {
  const suggestions: CartPromotionSuggestionV366[] = [];

  const currentBundlePrice = (
    comboProductId: number,
    comboPlanId: string | undefined,
    requiredQuantity: number | undefined,
    fallbackPrice: number
  ) => {
    const config = resolveComboConfig(comboProductId);
    if (!config) return fallbackPrice;

    const plan =
      (comboPlanId
        ? config.plans.find((item) => item.id === comboPlanId)
        : undefined) ??
      (requiredQuantity
        ? config.plans.find(
            (item) => item.requiredQuantity === requiredQuantity
          )
        : undefined) ??
      (config.type === "fixed_bundle"
        ? config.plans.find(
            (item) => Number.isFinite(item.price) && item.price > 0
          )
        : undefined);

    return plan && Number.isFinite(plan.price) && plan.price > 0
      ? plan.price
      : fallbackPrice;
  };

  const pushFlexibleSuggestion = ({
    id,
    title,
    detail,
    comboProductId,
    comboPlanId,
    candidates,
    requiredQuantity,
    bundlePrice,
    note,
  }: {
    id: string;
    title: string;
    detail: string;
    comboProductId: number;
    comboPlanId: string;
    candidates: Array<{
      productId: number;
      unitPrice: number;
      optionId: string;
      optionName: string;
    }>;
    requiredQuantity: number;
    bundlePrice: number;
    note?: string;
  }) => {
    const currentConfig = resolveComboConfig(comboProductId);
    const effectiveCandidates = candidates.map((candidate) => {
      const option = currentConfig?.options.find(
        (item) =>
          item.productId === candidate.productId ||
          item.id === candidate.optionId
      );
      const currentUnitPrice =
        option?.singleUnitPrice ??
        currentConfig?.singleUnitPrice ??
        candidate.unitPrice;

      return {
        ...candidate,
        unitPrice:
          Number.isFinite(currentUnitPrice) && currentUnitPrice > 0
            ? currentUnitPrice
            : candidate.unitPrice,
      };
    });
    const allocations = allocateSimpleProductsV366(
      cartItems,
      effectiveCandidates,
      requiredQuantity
    );
    if (allocations.length === 0) return;

    const effectiveBundlePrice = currentBundlePrice(
      comboProductId,
      comboPlanId,
      requiredQuantity,
      bundlePrice
    );
    const regularPrice = allocations.reduce(
      (total, allocation) => total + allocation.unitPrice * allocation.quantity,
      0
    );
    const savings = regularPrice - effectiveBundlePrice;
    if (savings <= 0) return;

    const comboSelections: ComboSelection[] = allocations
      .filter((allocation) => allocation.optionId && allocation.optionName)
      .map((allocation) => ({
        optionId: allocation.optionId as string,
        name: allocation.optionName as string,
        quantity: allocation.quantity,
      }));

    suggestions.push({
      id,
      title,
      detail,
      comboProductId,
      comboPlanId,
      allocations,
      comboSelections,
      bundlePrice: effectiveBundlePrice,
      savings,
      note,
    });
  };

  // 石墨烯貼布：滿 10 盒優先套 10 盒方案，否則套 4 盒方案。
  const patchCandidates = [
    {
      productId: 30,
      unitPrice: 500,
      optionId: "cool-patch",
      optionName: "石墨烯電氣石精油貼布（涼感）",
    },
    {
      productId: 31,
      unitPrice: 500,
      optionId: "warm-patch",
      optionName: "石墨烯電氣石精油貼布（溫感）",
    },
  ];
  const patchQuantity = patchCandidates.reduce(
    (total, item) => total + getSimpleCartQuantityV366(cartItems, item.productId),
    0
  );
  if (patchQuantity >= 10) {
    pushFlexibleSuggestion({
      id: "patch-10",
      title: "石墨烯貼布任選 10 盒",
      detail: "涼感／溫感可自由搭配，共 10 盒",
      comboProductId: 51,
      comboPlanId: "ten-boxes",
      candidates: patchCandidates,
      requiredQuantity: 10,
      bundlePrice: 2500,
    });
  } else if (patchQuantity >= 4) {
    pushFlexibleSuggestion({
      id: "patch-4",
      title: "石墨烯貼布任選 4 盒",
      detail: "涼感／溫感可自由搭配，共 4 盒",
      comboProductId: 51,
      comboPlanId: "four-boxes",
      candidates: patchCandidates,
      requiredQuantity: 4,
      bundlePrice: 1099,
    });
  }

  // 龍血洗髮精／沐浴乳任選 3 瓶。
  const washCandidates = [
    {
      productId: 15,
      unitPrice: 590,
      optionId: "dragon-blood-shampoo",
      optionName: "龍血求麗頭皮修護洗髮精",
    },
    {
      productId: 16,
      unitPrice: 590,
      optionId: "dragon-blood-body-wash",
      optionName: "龍血求麗潤澤修護沐浴乳",
    },
  ];
  if (
    washCandidates.reduce(
      (total, item) => total + getSimpleCartQuantityV366(cartItems, item.productId),
      0
    ) >= 3
  ) {
    pushFlexibleSuggestion({
      id: "dragon-wash-3",
      title: "龍血洗髮精／沐浴乳任選 3 瓶",
      detail: "洗髮精與沐浴乳可自由搭配，共 3 瓶",
      comboProductId: 119,
      comboPlanId: "three-bottles",
      candidates: washCandidates,
      requiredQuantity: 3,
      bundlePrice: 1100,
    });
  }

  // 龍血洗髮精＋阿甘養護液 1+1 固定組合。
  const hasOneShampoo = getSimpleCartQuantityV366(cartItems, 15) >= 1;
  const hasOneHairCare = getSimpleCartQuantityV366(cartItems, 57) >= 1;
  if (hasOneShampoo && hasOneHairCare) {
    const allocations: CartPromotionAllocationV366[] = [
      { productId: 15, quantity: 1, unitPrice: 590 },
      { productId: 57, quantity: 1, unitPrice: 1260 },
    ];
    const regularPrice = allocations.reduce(
      (total, allocation) => total + allocation.unitPrice * allocation.quantity,
      0
    );
    const bundlePrice = currentBundlePrice(112, undefined, 2, 1500);
    suggestions.push({
      id: "shampoo-haircare-1plus1",
      title: "龍血洗髮精＋阿甘養護液 1+1",
      detail: "龍血求麗頭皮修護洗髮精 × 1＋阿甘甦醒髮根養護液 × 1",
      comboProductId: 112,
      allocations,
      bundlePrice,
      savings: regularPrice - bundlePrice,
    });
  }

  // 香氛皂任選 4 入。
  const soapCandidates = [
    {
      productId: 50,
      unitPrice: 290,
      optionId: "lavender-soap",
      optionName: "龍血薰衣草舒緩皂",
    },
    {
      productId: 114,
      unitPrice: 290,
      optionId: "rose-soap",
      optionName: "龍血玫瑰美膚皂",
    },
    {
      productId: 115,
      unitPrice: 290,
      optionId: "mugwort-soap",
      optionName: "龍血艾草保庇皂",
    },
    {
      productId: 116,
      unitPrice: 290,
      optionId: "lemon-soap",
      optionName: "龍血檸檬馬鞭草皂",
    },
  ];
  if (
    soapCandidates.reduce(
      (total, item) => total + getSimpleCartQuantityV366(cartItems, item.productId),
      0
    ) >= 4
  ) {
    pushFlexibleSuggestion({
      id: "soap-4",
      title: "香氛皂任選 4 入",
      detail: "薰衣草、玫瑰、艾草、檸檬馬鞭草可自由搭配，共 4 入",
      comboProductId: 67,
      comboPlanId: "four-soaps",
      candidates: soapCandidates,
      requiredQuantity: 4,
      bundlePrice: 799,
    });
  }

  // 35 片面膜：滿 5 桶優先套 5 桶方案，否則套 2 桶方案。
  const maskCandidates = [
    {
      productId: 38,
      unitPrice: 599,
      optionId: "water-mask-35",
      optionName: "水搖滾保濕面膜 35片",
    },
    {
      productId: 39,
      unitPrice: 599,
      optionId: "white-mask-35",
      optionName: "極光白美白面膜 35片",
    },
  ];
  const maskQuantity = maskCandidates.reduce(
    (total, item) => total + getSimpleCartQuantityV366(cartItems, item.productId),
    0
  );
  if (maskQuantity >= 5) {
    pushFlexibleSuggestion({
      id: "mask-5",
      title: "35片面膜任選 5 桶",
      detail: "水搖滾／極光白可自由搭配，共 5 桶",
      comboProductId: 55,
      comboPlanId: "five-buckets",
      candidates: maskCandidates,
      requiredQuantity: 5,
      bundlePrice: 2750,
      note: "套用後加贈面膜 10 片。",
    });
  } else if (maskQuantity >= 2) {
    pushFlexibleSuggestion({
      id: "mask-2",
      title: "35片面膜任選 2 桶",
      detail: "水搖滾／極光白可自由搭配，共 2 桶",
      comboProductId: 55,
      comboPlanId: "two-buckets",
      candidates: maskCandidates,
      requiredQuantity: 2,
      bundlePrice: 1100,
    });
  }

  return suggestions
    .filter((suggestion) => suggestion.savings > 0)
    .sort((a, b) => b.savings - a.savings);
}


export const MASK_BUCKET_PRODUCT_IDS_V361 = new Set<number>([]);
export const MASK_BUCKET_UNIT_PRICE_V361 = 599;

type MaskPromotionCountsV361 = {
  single: number;
  two: number;
  five: number;
};

type MaskPromotionV361 = {
  quantity: number;
  totalPrice: number;
  regularPrice: number;
  savings: number;
  giftSheetCount: number;
  counts: MaskPromotionCountsV361;
  label: string;
};

export function calculateMaskPromotionV361(quantity: number): MaskPromotionV361 {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  const emptyCounts: MaskPromotionCountsV361 = { single: 0, two: 0, five: 0 };

  if (safeQuantity === 0) {
    return {
      quantity: 0,
      totalPrice: 0,
      regularPrice: 0,
      savings: 0,
      giftSheetCount: 0,
      counts: emptyCounts,
      label: "尚未選購",
    };
  }

  type PromotionState = {
    cost: number;
    counts: MaskPromotionCountsV361;
  };

  const plans: Array<{
    size: number;
    price: number;
    key: keyof MaskPromotionCountsV361;
  }> = [
    { size: 1, price: 599, key: "single" },
    { size: 2, price: 1100, key: "two" },
    { size: 5, price: 2750, key: "five" },
  ];

  const states: Array<PromotionState | null> = Array(safeQuantity + 1).fill(null);
  states[0] = { cost: 0, counts: { ...emptyCounts } };

  const isBetter = (candidate: PromotionState, current: PromotionState | null) => {
    if (!current) return true;
    if (candidate.cost !== current.cost) return candidate.cost < current.cost;
    if (candidate.counts.five !== current.counts.five) {
      return candidate.counts.five > current.counts.five;
    }
    if (candidate.counts.two !== current.counts.two) {
      return candidate.counts.two > current.counts.two;
    }
    return candidate.counts.single < current.counts.single;
  };

  for (let currentQuantity = 1; currentQuantity <= safeQuantity; currentQuantity += 1) {
    plans.forEach((plan) => {
      if (currentQuantity < plan.size) return;
      const previous = states[currentQuantity - plan.size];
      if (!previous) return;

      const nextCounts = { ...previous.counts };
      nextCounts[plan.key] += 1;
      const candidate: PromotionState = {
        cost: previous.cost + plan.price,
        counts: nextCounts,
      };

      if (isBetter(candidate, states[currentQuantity])) {
        states[currentQuantity] = candidate;
      }
    });
  }

  const best = states[safeQuantity] ?? {
    cost: safeQuantity * MASK_BUCKET_UNIT_PRICE_V361,
    counts: { single: safeQuantity, two: 0, five: 0 },
  };
  const labelParts: string[] = [];

  if (best.counts.five > 0) {
    labelParts.push(`5桶優惠${best.counts.five > 1 ? ` × ${best.counts.five}` : ""}`);
  }
  if (best.counts.two > 0) {
    labelParts.push(`2桶優惠${best.counts.two > 1 ? ` × ${best.counts.two}` : ""}`);
  }
  if (best.counts.single > 0) {
    labelParts.push(`單桶${best.counts.single > 1 ? ` × ${best.counts.single}` : ""}`);
  }

  const regularPrice = safeQuantity * MASK_BUCKET_UNIT_PRICE_V361;

  return {
    quantity: safeQuantity,
    totalPrice: best.cost,
    regularPrice,
    savings: Math.max(regularPrice - best.cost, 0),
    giftSheetCount: best.counts.five * 10,
    counts: best.counts,
    label: labelParts.join("＋"),
  };
}

export function getMaskBucketQuantityV361(items: CartItem[]) {
  return items.reduce((total, item) => {
    if (!MASK_BUCKET_PRODUCT_IDS_V361.has(item.product.id)) return total;
    return total + item.quantity;
  }, 0);
}

export function getMaskPromotionNoticeV361(quantity: number) {
  const promotion = calculateMaskPromotionV361(quantity);

  if (promotion.savings > 0) {
    const giftText = promotion.giftSheetCount > 0
      ? `，另贈 ${promotion.giftSheetCount} 片`
      : "";
    return `✓ 已自動套用${promotion.label}｜優惠價 NT$${promotion.totalPrice.toLocaleString("zh-TW")}，現省 NT$${promotion.savings.toLocaleString("zh-TW")}${giftText}`;
  }

  if (quantity === 1) {
    return "已加入購物車｜再選 1 桶可享任選 2 桶 NT$1,100";
  }

  return "已加入購物車";
}

const allProducts: Product[] = [
{
    id: 1,
    name: "BC-CA複合益生菌高鈣活力配方",
    category: "健康補給",
    series: "益生菌系列",
    originalPrice: "原價 $ 800",
    price: "產地價 3盒 $ 1,100",
    image: "/api/studio/media/95/file",
    gallery: ["/api/studio/media/95/file"],
    description: "3g x 30包 / 盒。複合益生菌 × 高鈣活力配方，日常保健與補鈣一起補給。",
  },
{
    id: 2,
    name: "EC晶眸葉黃素",
    category: "健康補給",
    series: "晶眸保健系列",
    originalPrice: "原價 $ 1,500",
    price: "產地價 $ 1,125",
    image: "/api/studio/media/79/file",
    gallery: ["/api/studio/media/79/file"],
    description: "精華凍 + 精華飲綜合組。適合 3C 族、學生與上班族日常晶亮營養補給。",
  },
{
    id: 3,
    name: "亮妍魚膠原蛋白飲",
    category: "健康補給",
    series: "美妍飲品系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/api/studio/media/47/file",
    gallery: ["/api/studio/media/47/file"],
    description: "15mL x 10瓶 / 盒。魚膠原蛋白美妍飲，日常美容保健與水潤光澤補給。",
  },
{
    id: 4,
    name: "薰衣草肌安舒緩化妝水",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/api/studio/media/73/file",
    gallery: ["/api/studio/media/73/file"],
    description: "150mL。薰衣草肌安舒緩系列。",
  },
{
    id: 5,
    name: "薰衣草肌安舒緩精華液",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/api/studio/media/74/file",
    gallery: ["/api/studio/media/74/file"],
    description: "30mL。薰衣草肌安舒緩系列。",
  },
{
    id: 6,
    name: "薰衣草肌安舒緩保濕乳",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/api/studio/media/75/file",
    gallery: ["/api/studio/media/75/file"],
    description: "100mL。薰衣草肌安舒緩系列。",
  },
{
    id: 7,
    name: "玫瑰超微晶萃活膚液",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/103/file",
    gallery: ["/api/studio/media/103/file"],
    description: "130mL / 瓶。玫瑰超微晶萃活膚液，洗臉後調理肌膚並維持柔嫩光澤。",
  },
{
    id: 8,
    name: "玫瑰超微晶萃瞬效霜",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,880",
    price: "產地價 $ 2,160",
    image: "/api/studio/media/106/file",
    gallery: ["/api/studio/media/106/file"],
    description: "50mL / 瓶。玫瑰超微晶萃瞬效霜，保養最後一步加強鎖水與潤澤。",
  },
{
    id: 9,
    name: "龍血求麗化妝水",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,190",
    price: "產地價 $ 890",
    image: "/api/studio/media/32/file",
    gallery: ["/api/studio/media/32/file"],
    description: "120mL / 瓶。前導補水、油水平衡，龍血系列肌膚乖乖水。",
  },
{
    id: 10,
    name: "龍血求麗修護乳",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,290",
    price: "產地價 $ 1,290",
    image: "/api/studio/media/34/file",
    gallery: ["/api/studio/media/34/file"],
    description: "80mL / 瓶。買一送一，清爽水凝質地修護乳。",
  },
{
    id: 11,
    name: "肌光緊緻速妍雪膚液",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,280",
    price: "產地價 $ 2,460",
    image: "/api/studio/media/97/file",
    gallery: ["/api/studio/media/97/file"],
    description: "130mL / 瓶。緊緻前導雪膚液，洗臉後調理肌膚紋理與彈力光澤。",
  },
{
    id: 12,
    name: "肌光緊緻速妍精華露",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,880",
    price: "產地價 $ 2,910",
    image: "/api/studio/media/98/file",
    gallery: ["/api/studio/media/98/file"],
    description: "35mL / 瓶。高濃縮緊緻精華，適合細紋、鬆弛感與熬夜疲憊肌加強保養。",
  },
{
    id: 13,
    name: "肌光緊緻速妍霜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 4,680",
    price: "產地價 $ 3,510",
    image: "/api/studio/media/99/file",
    gallery: ["/api/studio/media/99/file"],
    description: "50mL / 瓶。緊緻修護霜，保養最後一步鎖住水分與滋養。",
  },
{
    id: 14,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,680",
    price: "產地價 $ 2,760",
    image: "/api/studio/media/100/file",
    gallery: ["/api/studio/media/100/file"],
    description: "23mL x 10入 / 盒。集中型緊緻修護面膜，適合重要場合前與熬夜後加強保養。",
  },
{
    id: 15,
    name: "龍血求麗頭皮修護洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "任選3瓶 $ 1,100",
    image: "/api/studio/media/21/file",
    gallery: ["/api/studio/media/21/file"],
    description: "500mL / 瓶。龍血頭皮修護洗髮精，0矽靈配方，洗後蓬鬆柔順。",
  },
{
    id: 16,
    name: "龍血求麗潤澤修護沐浴乳",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "任選3瓶 $ 1,100",
    image: "/api/studio/media/20/file",
    gallery: ["/api/studio/media/20/file"],
    description: "500mL / 瓶。龍血潤澤修護沐浴乳，洗後水潤柔嫩不緊繃。",
  },
{
    id: 17,
    name: "純淨洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 780",
    price: "產地價 $ 585",
    image: "/api/studio/media/102/file",
    gallery: ["/api/studio/media/102/file"],
    description: "洗髮品項。",
  },
{
    id: 18,
    name: "薰衣草齒齦保健牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價 $ 250",
    price: "單條 $ 250｜買二送一 $ 500",
    image: "/api/studio/media/71/file",
    gallery: ["/api/studio/media/71/file"],
    description: "120g / 支。薰衣草草本香氣，溫和潔牙並維持口氣清新。",
  },
{
    id: 19,
    name: "龍血齒齦保健牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價 $ 250",
    price: "單條 $ 250｜買二送一 $ 500",
    image: "/api/studio/media/16/file",
    gallery: ["/api/studio/media/16/file"],
    description: "120g / 支。龍血齒齦保健牙膏，溫和清潔牙齒與齒齦邊緣。",
  },
{
    id: 20,
    name: "智慧之冠",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 21,
    name: "亮采橙真",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 22,
    name: "呼暢護隨",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 23,
    name: "魔力輕盈",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 24,
    name: "順暢平衡",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 25,
    name: "心之綻放",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。精油系列。",
  },
{
    id: 26,
    name: "青春密碼維 E 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/api/studio/media/43/file",
    gallery: ["/api/studio/media/43/file"],
    description: "50mL。精萃油系列。",
  },
{
    id: 27,
    name: "防護盾牌維 C 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/api/studio/media/42/file",
    gallery: ["/api/studio/media/42/file"],
    description: "50mL。精萃油系列。",
  },
{
    id: 28,
    name: "晚安無瑕維 A 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/api/studio/media/41/file",
    gallery: ["/api/studio/media/41/file"],
    description: "50mL。精萃油系列。",
  },
{
    id: 29,
    name: "高頻霧化香薰機一台（買1台送1瓶茶樹精油10ml）",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 1,980",
    image: "/api/studio/media/136/file",
    gallery: ["/api/studio/media/136/file"],
    description: "高頻霧化香薰機一台，買1台送1瓶茶樹精油10mL。",
  },
{
    id: 30,
    name: "石墨烯電氣石精油貼布(涼感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "",
    gallery: [],
    description: "10片 / 盒。清爽涼感款，適合運動後、久坐肩頸與炎熱天氣的局部放鬆保養。",
  },
{
    id: 31,
    name: "石墨烯電氣石精油貼布(溫感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "",
    gallery: [],
    description: "10片 / 盒。溫感款，適合冷氣房、家事勞動後與肩頸腰背局部放鬆保養。",
  },
{
    id: 32,
    name: "茶樹K痘精華",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價 $ 290",
    price: "產地價 $ 240",
    image: "/api/studio/media/135/file",
    gallery: ["/api/studio/media/135/file"],
    description: "8mL / 盒。局部控油淨痘精華，適合粉刺、痘痘與局部油光調理。",
  },
{
    id: 33,
    name: "肌可佳膠原蛋白彈潤原液",
    category: "保養品",
    series: "膠原蛋白系列",
    originalPrice: "原價 $ 1,290",
    price: "產地價 $ 960",
    image: "/api/studio/media/28/file",
    gallery: ["/api/studio/media/28/file"],
    description: "30mL / 瓶。膠原蛋白彈潤原液，適合加強澎潤、保濕與肌膚彈性感。",
  },
{
    id: 34,
    name: "龍血玻尿酸保濕精華液",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,390",
    price: "產地價 $ 1,980",
    image: "/api/studio/media/37/file",
    gallery: ["/api/studio/media/37/file"],
    description: "300mL / 瓶。買一送一，城堡必敗國民保濕精華。",
  },
{
    id: 35,
    name: "龍血求麗卸妝油",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 590",
    image: "/api/studio/media/18/file",
    gallery: ["/api/studio/media/18/file"],
    description: "150mL / 瓶。輕盈卸妝油，快速溶解彩妝、防曬與毛孔髒污。",
  },
{
    id: 36,
    name: "龍血求麗潔顏慕絲",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/api/studio/media/17/file",
    gallery: ["/api/studio/media/17/file"],
    description: "150mL / 瓶。細緻綿密潔顏慕絲，洗後不緊繃、不乾澀。",
  },
{
    id: 37,
    name: "水搖滾保濕面膜 (10片裝)",
    category: "保養品",
    series: "龍血系列",
    price: "售價 $ 199",
    image: "/api/studio/media/140/file",
    gallery: ["/api/studio/media/140/file"],
    description: "22mL x 10pcs / 盒。水搖滾保濕面膜，日常補水與集中保養。",
  },
{
    id: 38,
    name: "水搖滾保濕面膜 (35片大容量桶裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/api/studio/media/139/file",
    gallery: ["/api/studio/media/139/file"],
    description: "22mL x 35pcs / 桶。兩款35片桶裝可自由混搭，購物車滿2桶或5桶會自動套用優惠。",
  },
{
    id: 39,
    name: "極光白美白面膜 (35片大容量桶裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/api/studio/media/143/file",
    gallery: ["/api/studio/media/143/file"],
    description: "35pcs / 桶。兩款35片桶裝可自由混搭，購物車滿2桶或5桶會自動套用優惠。",
  },
{
    id: 40,
    name: "水光肌能乳液",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 2,180",
    price: "產地價 $ 1,185",
    image: "/api/studio/media/54/file",
    gallery: ["/api/studio/media/54/file"],
    description: "130mL / 瓶。水光肌能乳液，清爽鎖水並維持柔嫩彈潤感。",
  },
{
    id: 41,
    name: "水光肌能晚霜",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 2,380",
    price: "產地價 $ 1,785",
    image: "/api/studio/media/55/file",
    gallery: ["/api/studio/media/55/file"],
    description: "50mL / 瓶。水光肌能晚霜，夜間加強潤澤與保濕，維持柔嫩澎潤感。",
  },
{
    id: 42,
    name: "苦杏仁酸溫和煥顏露",
    category: "保養品",
    series: "杏仁酸系列",
    originalPrice: "原價 $ 880",
    price: "產地價 $ 630",
    image: "/api/studio/media/82/file",
    gallery: ["/api/studio/media/82/file"],
    description: "30mL / 瓶。溫和煥顏保養品項，適合日常代謝老廢角質與維持細緻光澤。",
  },
{
    id: 43,
    name: "冰河淨化淨膚露",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價 $ 1,380",
    price: "產地價 $ 1,035",
    image: "/api/studio/media/50/file",
    gallery: ["/api/studio/media/50/file"],
    description: "120mL / 瓶。冰河淨化淨膚露，調理老廢皮脂、油光與毛孔。",
  },
{
    id: 44,
    name: "冰河淨化柔膚面膜",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/api/studio/media/51/file",
    gallery: ["/api/studio/media/51/file"],
    description: "100mL / 瓶。冰河淨化柔膚面膜，水洗式淨化保養，維持肌膚潔淨柔嫩。",
  },
{
    id: 45,
    name: "鳳梨酵素代謝角質凝露",
    category: "保養品",
    series: "鳳梨酵素系列",
    originalPrice: "原價 $ 590",
    price: "產地價 $ 460",
    image: "/api/studio/media/91/file",
    gallery: ["/api/studio/media/91/file"],
    description: "120g / 瓶。溫和代謝老廢角質，改善粗糙暗沉與吸收感不佳。",
  },
{
    id: 46,
    name: "櫻の雪淨白潔顏慕絲",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 590",
    price: "新品預告",
    image: "/api/studio/media/118/file",
    gallery: ["/api/studio/media/118/file"],
    description: "150mL / 瓶。櫻の雪淨白潔顏慕絲新品預告中，正式開放後可加入購物車確認。",
  },
{
    id: 47,
    name: "櫻の雪傳明酸美白化妝水",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/api/studio/media/119/file",
    gallery: ["/api/studio/media/119/file"],
    description: "150mL / 瓶。亮白前導化妝水，補充亮白水分並打開吸收通道。",
  },
{
    id: 48,
    name: "櫻の雪傳明酸美白精華液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/api/studio/media/115/file",
    gallery: ["/api/studio/media/115/file"],
    description: "30mL / 瓶。密集亮白核心精華，針對斑點、暗沉與膚色不均加強調理。",
  },
{
    id: 49,
    name: "櫻の雪傳明酸美白乳液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 660",
    image: "/api/studio/media/117/file",
    gallery: ["/api/studio/media/117/file"],
    description: "100mL / 瓶。美白乳液，鎖住亮白保養並維持水嫩不黏膩。",
  },
{
    id: 50,
    name: "龍血薰衣草舒緩皂",
    category: "肥皂",
    series: "肥皂",
    price: "單入 $ 290｜4入優惠 $ 799",
    image: "/api/studio/media/111/file",
    gallery: ["/api/studio/media/111/file"],
    description: "200g±10g / 塊。目前上架薰衣草款，單入 $290，4入優惠 $799。",
  },
{
    id: 51,
    name: "石墨烯電氣石精油貼布任選4盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 3,200",
    price: "產地價 $ 1,099",
    image: "/api/studio/media/87/file",
    gallery: ["/api/studio/media/87/file"],
    description: "涼感 / 溫感可任選搭配，共4盒。",
  },
{
    id: 52,
    name: "石墨烯電氣石精油貼布任選10盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 8,000",
    price: "產地價 $ 2,500",
    image: "/api/studio/media/88/file",
    gallery: ["/api/studio/media/88/file"],
    description: "涼感 / 溫感可任選搭配，共10盒。",
  },
{
    id: 53,
    name: "能量牛樟芝保健潔口液 3罐贈薰衣草牙膏1條",
    category: "組合價",
    series: "口腔保健",
    originalPrice: "原價待補",
    price: "3罐贈1條牙膏 $ 1,500",
    image: "/api/studio/media/141/file",
    gallery: ["/api/studio/media/141/file"],
    description: "能量牛樟芝保健潔口液 3罐，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
  },
{
    id: 54,
    name: "齒齦保健牙膏任選3條",
    category: "組合價",
    series: "牙膏組合",
    originalPrice: "原價 $ 750",
    price: "產地價 $ 500",
    image: "/api/studio/media/125/file",
    gallery: ["/api/studio/media/125/file"],
    description: "薰衣草舒緩 / 龍血修護可混搭，共3條。",
  },
{
    id: 55,
    name: "水搖滾 / 極光白美白面膜桶裝任選組",
    category: "組合價",
    series: "面膜組合",
    originalPrice: "原價 $ 3,000 / 桶",
    price: "1桶 $ 599｜任選2桶 $ 1,100｜任選5桶 $ 2,750",
    image: "/api/studio/media/145/file",
    gallery: ["/api/studio/media/145/file"],
    description: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選。任選5桶再送10片水搖滾保濕面膜。",
  },
{
    id: 56,
    name: "挪威 EPAX 高活性 rTG 魚油軟膠囊買一送一",
    category: "組合價",
    series: "口腔保健",
    originalPrice: "原價待補",
    price: "買一送一 $ 1,580",
    image: "/api/studio/media/48/file",
    gallery: ["/api/studio/media/48/file"],
    description: "挪威 EPAX 高活性 rTG 魚油軟膠囊買1送1，共2盒，規格依商品標示。",
  },
{
    id: 57,
    name: "阿甘甦醒髮根養護液",
    category: "洗沐",
    series: "阿甘綠柔護髮系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/api/studio/media/11/file",
    gallery: ["/api/studio/media/11/file"],
    description: "80mL / 瓶。阿甘甦醒髮根養護液，適合日常頭皮與髮根養護。",
  },
{
    id: 58,
    name: "玻尿酸益生菌 2盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價價值 $ 2,600",
    price: "產地價 2盒 $ 2,000",
    image: "/api/studio/media/15/file",
    gallery: ["/api/studio/media/15/file"],
    description: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒。",
  },
{
    id: 59,
    name: "龍血求麗潔顏慕絲 + 龍血求麗卸妝油 1+1組",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價價值 $ 1,680",
    price: "1+1 兩瓶 $ 1,080",
    image: "/api/studio/media/137/file",
    gallery: ["/api/studio/media/137/file"],
    description: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶。",
  },
{
    id: 60,
    name: "賽洛美潤膚美體油(C+E)",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/api/studio/media/25/file",
    gallery: ["/api/studio/media/25/file"],
    description: "200mL / 瓶。賽洛美潤膚美體油(C+E)，沐浴後滋潤乾燥粗糙肌膚。",
  },
{
    id: 61,
    name: "24小時賦活液",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,980",
    price: "產地價 $ 2,160",
    image: "/api/studio/media/2/file",
    gallery: ["/api/studio/media/2/file"],
    description: "100mL / 瓶。24小時賦活液，適合疲憊暗沉與保養撞牆期加強打底。",
  },
{
    id: 62,
    name: "24小時黃金璀璨賦活液",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/api/studio/media/1/file",
    gallery: ["/api/studio/media/1/file"],
    description: "40mL / 瓶。24小時黃金璀璨賦活液，維持澎潤、透亮與細緻光澤。",
  },
{
    id: 63,
    name: "水光苦杏仁酸慕絲",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/api/studio/media/52/file",
    gallery: ["/api/studio/media/52/file"],
    description: "150mL / 瓶。水光苦杏仁酸慕絲，溫和清潔並維持肌膚細緻透亮感。",
  },
{
    id: 64,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/api/studio/media/121/file",
    gallery: ["/api/studio/media/121/file"],
    description: "26mL x 6入 / 盒。超導水網瞬效面膜，集中補水並加強柔嫩光澤。",
  },
{
    id: 65,
    name: "Exo-雙粹秘泌凍晶組",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價 $ 1,580",
    price: "產地價 $ 1,185",
    image: "/api/studio/media/93/file",
    gallery: ["/api/studio/media/93/file"],
    description: "一組 / 盒裝。頂級凍晶密集保養組，使用時混合激活，適合急救修護。",
  },
{
    id: 66,
    name: "奧勒岡小白花美體乳",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/api/studio/media/109/file",
    gallery: ["/api/studio/media/109/file"],
    description: "500mL / 瓶。小白花美體乳，水潤好推不黏膩，適合每日全身保養。",
  },
{
    id: 67,
    name: "龍血薰衣草舒緩皂 4入優惠",
    category: "組合價",
    series: "肥皂組合",
    originalPrice: "原價價值 $ 1,160",
    price: "4入優惠 $ 799",
    image: "/api/studio/media/111/file",
    gallery: ["/api/studio/media/111/file"],
    description: "目前上架薰衣草款，購買 4 塊同款享優惠價 $799。",
  },
{
    id: 68,
    name: "櫻の雪傳明酸美白精華液 + 美白乳液贈化妝水",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價價值 $ 2,470",
    price: "組合價 $ 1,780",
    image: "/api/studio/media/116/file",
    gallery: ["/api/studio/media/116/file"],
    description: "購買櫻の雪傳明酸美白精華液30mL + 櫻の雪傳明酸美白乳液100mL，贈送櫻の雪傳明酸美白化妝水150mL。",
  },
{
    id: 69,
    name: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價價值 $ 5,900",
    price: "組合價 $ 4,400",
    image: "/api/studio/media/12/file",
    gallery: ["/api/studio/media/12/file"],
    description: "亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入 共兩盒，贈 EC 晶眸葉黃素精華凍+精華飲綜合組。",
  },
{
    id: 70,
    name: "龍血求麗甦醒精油滾珠",
    category: "精油",
    series: "精油",
    originalPrice: "牌價 $ 390",
    price: "$ 390",
    image: "/api/studio/media/31/file",
    gallery: ["/api/studio/media/31/file"],
    description: "9mL。龍血系列隨身精油滾珠，適合日常香氛與放鬆舒緩保養。",
  },
{
    id: 71,
    name: "薰衣草萬用精油滾珠",
    category: "精油",
    series: "精油",
    originalPrice: "牌價 $ 390",
    price: "$ 390",
    image: "/api/studio/media/69/file",
    gallery: ["/api/studio/media/69/file"],
    description: "9mL。薰衣草香氛精油滾珠，適合睡前放鬆與日常隨身舒緩。",
  },
{
    id: 72,
    name: "絕美溫感變色護唇膏",
    category: "護唇膏",
    series: "護唇膏",
    originalPrice: "原價 $ 290",
    price: "單支 $ 290",
    image: "",
    gallery: [],
    description: "3.5g / 支。溫感變色護唇膏，依唇溫呈現自然氣色。",
  },
{
    id: 73,
    name: "絕美保濕護唇膏",
    category: "護唇膏",
    series: "護唇膏",
    originalPrice: "原價 $ 290",
    price: "單支 $ 290",
    image: "",
    gallery: [],
    description: "3.5g / 支。日常保濕護唇膏，滋潤乾燥雙唇。",
  },
{
    id: 74,
    name: "甜橙單方精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/api/studio/media/122/file",
    gallery: ["/api/studio/media/122/file"],
    description: "30mL。甜橙單方精油，適合日常擴香營造清新愉悅的香氣氛圍。",
  },
{
    id: 75,
    name: "尤加利精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/api/studio/media/45/file",
    gallery: ["/api/studio/media/45/file"],
    description: "30mL。尤加利精油，適合居家擴香與清新空間香氣使用。",
  },
{
    id: 76,
    name: "45格精油木盒",
    category: "精油",
    series: "精油配件",
    originalPrice: "原價 $ 980",
    price: "產地價 $ 680",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "精油收納木盒，適合整理單方、複方精油與居家香氛收藏。",
  },
{
    id: 77,
    name: "擴香木球5入禮盒",
    category: "精油",
    series: "精油配件",
    originalPrice: "原價 $ 250",
    price: "產地價 $ 168",
    image: "/api/studio/media/44/file",
    gallery: ["/api/studio/media/44/file"],
    description: "5入禮盒。可搭配精油滴入使用，適合桌面、衣櫃或小空間擴香。",
  },
{
    id: 78,
    name: "薰衣草單方精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/api/studio/media/68/file",
    gallery: ["/api/studio/media/68/file"],
    description: "30mL。薰衣草單方精油，適合睡前、放鬆與居家香氛擴香。",
  },
{
    id: 79,
    name: "佐登妮絲5號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/65/file",
    gallery: ["/api/studio/media/65/file"],
    description: "10mL。佐登妮絲5號複方精油，適合搭配擴香設備或擴香配件使用。",
  },
{
    id: 80,
    name: "呼暢護隨精油（30mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/api/studio/media/40/file",
    gallery: ["/api/studio/media/40/file"],
    description: "30mL。呼暢護隨精油，適合日常擴香，營造清爽舒適的空間感。",
  },
{
    id: 81,
    name: "佐登妮絲OMA律動精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/63/file",
    gallery: ["/api/studio/media/63/file"],
    description: "10mL。OMA律動精油，適合日常香氛儀式與擴香搭配。",
  },
{
    id: 82,
    name: "快樂鼠尾草精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/27/file",
    gallery: ["/api/studio/media/27/file"],
    description: "10mL。快樂鼠尾草精油，適合營造柔和、放鬆的香氛氛圍。",
  },
{
    id: 83,
    name: "魔力輕盈精油（30mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 3,280",
    price: "產地價 $ 2,460",
    image: "/api/studio/media/80/file",
    gallery: ["/api/studio/media/80/file"],
    description: "30mL。魔力輕盈精油，適合日常擴香與空間香氛使用。",
  },
{
    id: 84,
    name: "柚見快樂精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/67/file",
    gallery: ["/api/studio/media/67/file"],
    description: "15mL。柚見快樂精油，適合營造明亮、清新的香氣氛圍。",
  },
{
    id: 85,
    name: "佐登4號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,620",
    image: "/api/studio/media/64/file",
    gallery: ["/api/studio/media/64/file"],
    description: "功效：清新醒腦。適合日常擴香，讓空間維持清新感。",
  },
{
    id: 86,
    name: "佐登妮絲1號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/62/file",
    gallery: ["/api/studio/media/62/file"],
    description: "10mL。佐登妮絲1號複方精油，適合居家擴香與日常香氛使用。",
  },
{
    id: 87,
    name: "智慧之冠精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。智慧之冠精油，適合工作、閱讀與日常空間香氛搭配。",
  },
{
    id: 88,
    name: "魔力輕盈精油（10mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。魔力輕盈精油小容量規格，適合初次體驗或外出攜帶。",
  },
{
    id: 89,
    name: "能量之源精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。能量之源精油，適合日常擴香與空間活力氛圍。",
  },
{
    id: 90,
    name: "順暢平衡精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。順暢平衡精油，適合日常香氛與放鬆儀式使用。",
  },
{
    id: 91,
    name: "亮采橙真精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。亮采橙真精油，適合喜歡明亮果香調的日常擴香。",
  },
{
    id: 92,
    name: "心之綻放精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。心之綻放精油，適合營造柔和、溫暖的居家香氣。",
  },
{
    id: 93,
    name: "呼暢護隨精油（10mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/api/studio/media/26/file",
    gallery: ["/api/studio/media/26/file"],
    description: "10mL。呼暢護隨精油小容量規格，適合日常擴香與初次體驗。",
  },
{
    id: 94,
    name: "無印風簡約水氧機（粉）",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 899",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "精油香氛擴香設備，簡約粉色外型，適合居家與辦公空間使用。",
  },
{
    id: 95,
    name: "木紋USB夜光霧化機",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 899",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "USB 霧化擴香設備，木紋外型搭配夜光氛圍，適合居家香氛使用。",
  },
{
    id: 96,
    name: "檸檬精油 10mL",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,080",
    price: "產地價 $ 810",
    image: "/api/studio/media/76/file",
    gallery: ["/api/studio/media/76/file"],
    description: "10mL。清新明亮的檸檬香氣，適合日常擴香與空間清新；可搭配單方精油任選 2 瓶 $1,600。",
    priceNote: "單瓶產地價 $810；單方精油任選 2 瓶 $1,600。",
    expiryNote: "效期：2028.11.16。實際效期以商品包裝標示為準。",
  },
{
    id: 97,
    name: "茶樹精油 15mL",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/api/studio/media/124/file",
    gallery: ["/api/studio/media/124/file"],
    description: "15mL。茶樹精油清爽草本香氣，適合居家擴香、空間清新與日常香氛搭配。",
    expiryNote: "效期：2030.04.19。實際效期以商品包裝標示為準。",
  },
{
    id: 98,
    name: "天空葵芳香精油 10mL",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/api/studio/media/49/file",
    gallery: ["/api/studio/media/49/file"],
    description: "10mL。天空葵芳香精油，清新花草香氣，適合日常擴香與居家香氛儀式。",
    expiryNote: "效期：2030.03.30。實際效期以商品包裝標示為準。",
  },
{
    id: 99,
    name: "佐登妮絲6號複方精油 10mL",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/api/studio/media/66/file",
    gallery: ["/api/studio/media/66/file"],
    description: "10mL。佐登妮絲6號複方精油，適合日常擴香與空間香氛搭配。",
    expiryNote: "效期：2028.02.13。實際效期以商品包裝標示為準。",
  },
{
    id: 100,
    name: "擴香木片（買一送一）",
    category: "精油",
    series: "精油配件",
    price: "售價 $ 199",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "買一送一。可搭配精油滴入使用，適合衣櫃、抽屜、桌面或小空間香氛。",
  },
{
    id: 101,
    name: "刮痧板 2入",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 390",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "2入組。居家日常舒壓工具，適合搭配身體保養油或日常按摩放鬆。",
  },
{
    id: 102,
    name: "溫灸棒－特大",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 1,500",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "特大尺寸溫灸棒，適合居家舒壓保養與日常放鬆儀式。",
  },
{
    id: 103,
    name: "溫灸棒－小",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 1,100",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "小尺寸溫灸棒，握感輕巧，適合居家日常舒壓使用。",
  },
{
    id: 104,
    name: "艾草條－小",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 240",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "小規格艾草條，適合搭配溫灸棒作為居家舒壓保養使用。",
  },
{
    id: 105,
    name: "艾草條－特大",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 240",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "特大規格艾草條，適合搭配溫灸棒作為居家舒壓保養使用。",
  },
{
    id: 106,
    name: "如意棒",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 2,500",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "居家舒壓工具，適合日常按摩、放鬆與身體保養搭配使用。",
  },
{
    id: 107,
    name: "升級版柔筋棒（小）",
    category: "身體洗護",
    series: "身體舒壓",
    price: "售價 $ 400",
    image: "/api/studio/media/92/file",
    gallery: ["/api/studio/media/92/file"],
    description: "小尺寸柔筋棒，適合日常局部放鬆與居家舒壓使用。",
  },
{
    id: 108,
    name: "護手霜三款買二送一組",
    category: "組合價",
    series: "護手霜組合",
    originalPrice: "原價價值 $ 870",
    price: "買二送一 $ 580",
    image: "/api/studio/media/8/file",
    gallery: ["/api/studio/media/8/file"],
    description: "薰衣草舒緩、櫻之雪亮澤、茶樹防禦護手霜可搭配，買二送一 $580。",
    expiryNote: "效期：薰衣草舒緩 2029.01.20；櫻之雪亮澤 2029.01.25；茶樹防禦 2029.01.18。實際效期以商品包裝標示為準。",
    priceNote: "護手霜三款買二送一 $580，實際可搭配品項依 LINE 小幫手確認。",
  },
{
    id: 109,
    name: "EC晶眸葉黃素精華凍 20包",
    category: "健康補給",
    series: "葉黃素",
    originalPrice: "原價 $ 1,500",
    price: "產地價 $ 1,125",
    image: "/api/studio/media/78/file",
    gallery: ["/api/studio/media/78/file"],
    description: "20包。晶眸葉黃素精華凍，適合 3C 族、學生與上班族日常晶亮營養補給。",
    expiryNote: "效期：2027.04.28。實際效期以商品包裝標示為準。",
  },
{
    id: 110,
    name: "超防禦輕透隔離乳 30mL",
    category: "保養品",
    series: "防曬隔離",
    originalPrice: "原價 $ 1,380",
    price: "產地價 $ 1,035",
    image: "/api/studio/media/120/file",
    gallery: ["/api/studio/media/120/file"],
    description: "30mL。輕透隔離乳，日常外出前打底使用，維持清爽防護感。",
    expiryNote: "效期：2029.06.14。實際效期以商品包裝標示為準。",
  },
{
    id: 111,
    name: "玫瑰超微晶萃精華 30mL",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "產地價 $ 2,760",
    image: "/api/studio/media/104/file",
    gallery: ["/api/studio/media/104/file"],
    description: "30mL。玫瑰超微晶萃精華，潤澤修護與日常保養加強，維持柔嫩光澤感。",
    expiryNote: "效期：2029.06.07。實際效期以商品包裝標示為準。",
  },
{
    id: 112,
    name: "龍血洗髮精＋阿甘甦醒髮根養護液組合",
    category: "組合價",
    series: "洗沐組合",
    originalPrice: "原價價值 $ 2,470",
    price: "組合價 $ 1,500",
    image: "/api/studio/media/56/file",
    gallery: ["/api/studio/media/56/file"],
    description: "龍血求麗頭皮修護洗髮精 500mL × 1 瓶，加阿甘甦醒髮根養護液 80mL × 1 瓶。",
    priceNote: "龍血求麗頭皮修護洗髮精 1 瓶＋阿甘甦醒髮根養護液 1 瓶，組合價 $1,500。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  }
];

const comingSoonRollerProducts: Product[] = [
{
    id: 113,
    name: "冷杉酷涼活絡精油滾珠",
    category: "新品預告",
    series: "新品預告",
    originalPrice: "牌價 $ 390",
    price: "新品預告",
    image: "/api/studio/media/108/file",
    gallery: ["/api/studio/media/108/file"],
    description: "9mL。冷杉系清爽香氣滾珠，清新感受適合日常隨身使用。",
    cardSubtitle: "9mL・冷杉系列滾珠",
    priceNote: "新品預告・敬請期待。",
    features: ["冷杉清爽香氣，適合喜歡涼感氛圍的人。", "新品預告，更多回購資訊陸續更新。"],
    usage: "依商品標示使用，避免接觸眼睛與傷口。",
    notice: "新品預告，更多香氛滾珠品項陸續登場。",
  },
{
    id: 114,
    name: "龍血玫瑰美膚皂",
    category: "新品預告",
    series: "香氛皂",
    price: "新品預告",
    image: "/api/studio/media/113/file",
    gallery: ["/api/studio/media/113/file"],
    description: "200g±10g / 塊。柔和花香，打造日常沐浴儀式感。",
    cardSubtitle: "柔和花香・新品預告",
    priceNote: "新品預告・敬請期待。",
    features: ["柔和玫瑰香氣，讓日常洗沐更有儀式感。", "新品預告，更多資訊陸續登場。"],
    usage: "依日常洗沐習慣使用。",
    notice: "新品預告，更多香型陸續登場。",
  },
{
    id: 115,
    name: "龍血艾草保庇皂",
    category: "新品預告",
    series: "香氛皂",
    price: "新品預告",
    image: "/api/studio/media/110/file",
    gallery: ["/api/studio/media/110/file"],
    description: "200g±10g / 塊。草本香氣，適合喜歡清爽感的日常洗沐。",
    cardSubtitle: "草本香氣・新品預告",
    priceNote: "新品預告・敬請期待。",
    features: ["艾草草本香調，清爽洗沐更有安定感。", "新品預告，更多資訊陸續登場。"],
    usage: "依日常洗沐習慣使用。",
    notice: "新品預告，更多香型陸續登場。",
  },
{
    id: 116,
    name: "龍血檸檬馬鞭草皂",
    category: "新品預告",
    series: "香氛皂",
    price: "新品預告",
    image: "/api/studio/media/112/file",
    gallery: ["/api/studio/media/112/file"],
    description: "200g±10g / 塊。清新柑橘調，洗後帶來明亮清爽感。",
    cardSubtitle: "柑橘清香・新品預告",
    priceNote: "新品預告・敬請期待。",
    features: ["檸檬馬鞭草清香，適合喜歡明亮清爽調性的人。", "新品預告，更多資訊陸續登場。"],
    usage: "依日常洗沐習慣使用。",
    notice: "新品預告，更多香型陸續登場。",
  },
{
    id: 117,
    name: "龍血檀香靜心皂",
    category: "新品預告",
    series: "香氛皂",
    price: "新品預告",
    image: "/api/studio/media/114/file",
    gallery: ["/api/studio/media/114/file"],
    description: "200g±10g / 塊。木質香氣，沉穩放鬆的沐浴選擇。",
    cardSubtitle: "木質檀香・新品預告",
    priceNote: "新品預告・敬請期待。",
    features: ["沉穩檀香木質調，適合晚間放鬆洗沐。", "新品預告，更多資訊陸續登場。"],
    usage: "依日常洗沐習慣使用。",
    notice: "新品預告，更多香型陸續登場。",
  },
{
    id: 118,
    name: "繡球花漾香氛皂",
    category: "新品預告",
    series: "香氛皂",
    price: "新品預告",
    image: "/api/studio/media/57/file",
    gallery: ["/api/studio/media/57/file"],
    description: "200g±10g / 塊。花香系香氛皂，讓日常洗沐更有質感。",
    cardSubtitle: "花香系・新品預告",
    priceNote: "新品預告・敬請期待。",
    features: ["繡球花系香氣，溫柔花香讓洗沐更有質感。", "新品預告，更多資訊陸續登場。"],
    usage: "依日常洗沐習慣使用。",
    notice: "新品預告，更多香型陸續登場。",
  }
];


const additionalProductsV359: Product[] = [
  {
    id: 119,
    name: "龍血洗髮精／沐浴乳任選3瓶",
    category: "組合價",
    series: "洗沐組合",
    originalPrice: "原價價值 $ 2,370",
    price: "任選 3 瓶 $ 1,100",
    image: "/api/studio/media/138/file",
    gallery: ["/api/studio/media/138/file"],
    description: "龍血求麗頭皮修護洗髮精與龍血求麗潤澤修護沐浴乳可自由搭配，共 3 瓶 $1,100。",
    cardSubtitle: "500mL × 3 瓶・洗髮精／沐浴乳自由搭配",
    spec: "500mL × 3 瓶",
    intro: "龍血洗髮精與沐浴乳任選組合，可依日常使用需求自由搭配 3 瓶。",
    priceNote: "龍血洗髮精／沐浴乳任選 3 瓶 $1,100。",
    features: [
      "洗髮精與沐浴乳可自由搭配，共選 3 瓶。",
      "500mL 大容量，適合家庭日常補貨。",
      "組合價 $1,100，比單瓶購買更划算。",
    ],
    suitableFor: ["洗沐補貨", "自由搭配", "家庭使用"],
    usage: "洗髮精與沐浴乳請依各商品標示方式使用。",
    notice: "實際可選品項與庫存依賣場顯示及 LINE 小幫手確認為準。",
  },
];

const additionalProductsV378: Product[] = [
  {
    id: 120,
    name: "龍血求麗精華液＋肌可佳膠原蛋白彈潤原液",
    category: "組合價",
    series: "龍血系列",
    price: "組合價 $ 1,290",
    image: "/api/studio/media/33/file",
    gallery: ["/api/studio/media/33/file", "/api/studio/media/28/file"],
    description: "龍血求麗精華液 30mL ＋ 肌可佳膠原蛋白彈潤原液 30mL，限定組合價 $1,290。龍血求麗精華液目前不提供單買。",
    expiryNote: "龍血求麗精華液效期：2026年12月；實際日期依商品包裝或 LINE 小幫手確認為準。",
  },
  {
    id: 121,
    name: "龍血求麗修護霜",
    category: "保養品",
    series: "龍血系列",
    price: "單瓶 $ 1,190｜第二件 5 折",
    image: "/api/studio/media/35/file",
    gallery: ["/api/studio/media/35/file"],
    description: "35mL / 瓶。龍血系列滋潤修護霜，單瓶 $1,190，第二件 5 折，2 瓶優惠價 $1,785。",
    cardSubtitle: "35mL・龍血系列・第二件5折",
    spec: "35mL / 瓶",
    intro: "龍血系列滋潤型修護霜，適合作為保養最後一道加強鎖水、柔嫩與日常修護。",
    priceNote: "單瓶 $1,190；第二件 5 折；2 瓶優惠價 $1,785。",
    features: [
      "滋潤型霜體，適合作為保養最後一道加強鎖水與柔嫩感。",
      "納入龍血系列，可從臉部保養的龍血系列、保濕修護與高級養護入口找到。",
      "活動期間單瓶 $1,190，第二件 5 折，2 瓶 $1,785。",
    ],
    suitableFor: ["龍血系列", "乾燥缺水", "保濕修護", "高級養護"],
    usage: "化妝水、精華與乳液後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適請停止使用；避免接觸眼睛與黏膜。實際庫存與效期依商品標示或 LINE 小幫手確認為準。",
  },
];

function normalizeProductForV31(product: Product): Product {
  if (product.id === 1) {
    return {
      ...product,
      name: "蔓越莓／補鈣益生菌",
      category: "健康補給",
      series: "益生菌系列",
      originalPrice: "高鈣單盒 $ 800｜蔓越莓單盒 $ 990",
      price: "單盒 $ 800 起｜任選 3 盒 $ 1,600",
      image: "/api/studio/media/126/file",
      gallery: ["/api/studio/media/126/file"],
      description: "蔓越莓益生菌與高鈣益生菌皆可單盒購買；高鈣單盒 $800、蔓越莓單盒 $990，任選搭配共 3 盒優惠價 $1,600。",
      priceNote: "高鈣益生菌單盒 $800；蔓越莓益生菌單盒 $990；任選搭配共 3 盒 $1,600。實際庫存依 LINE 小幫手確認。",
    };
  }

  if (product.id === 15 || product.id === 16) {
    return {
      ...product,
      originalPrice: undefined,
      price: "任選 3 瓶 $ 1,100",
      description:
        product.id === 15
          ? "500mL / 瓶。龍血求麗頭皮修護洗髮精與龍血求麗潤澤修護沐浴乳可任選搭配，共 3 瓶 $1,100。"
          : "500mL / 瓶。龍血求麗潤澤修護沐浴乳與龍血求麗頭皮修護洗髮精可任選搭配，共 3 瓶 $1,100。",
      priceNote: "龍血洗髮精／沐浴乳可自由搭配，任選 3 瓶 $1,100；不提供此頁單瓶優惠價。",
    };
  }

  if (product.id === 70) {
    return {
      ...product,
      category: "新品預告",
      series: "新品預告",
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "9mL。龍血求麗甦醒精油滾珠先列為新品預告，新品預告，更多回購資訊陸續更新。",
    };
  }

  if (product.id === 71) {
    return {
      ...product,
      category: "新品預告",
      series: "新品預告",
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "9mL。薰衣草萬用精油滾珠先列為新品預告，新品預告，更多回購資訊陸續更新。",
    };
  }

  if (product.id === 53) {
    return {
      ...product,
      category: "新品預告",
      series: "潔口液",
      originalPrice: undefined,
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "能量牛樟芝保健潔口液 3罐組列入新品預告，後續開放後更新活動內容。",
    };
  }

  if (product.id === 56) {
    return {
      ...product,
      category: "新品預告",
      series: "魚油",
      originalPrice: undefined,
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "魚油組合列入新品預告，後續開放後更新活動內容。",
    };
  }

  if (product.id === 74) {
    return {
      ...product,
      originalPrice: "原價 $ 2,200",
      price: "產地價 $ 899",
      description: "30mL。甜橙單方精油，清新柑橘香氣，適合日常擴香營造明亮活力；可搭配單方精油任選 2 瓶 $1,600。",
      priceNote: "單瓶產地價 $899；單方精油任選 2 瓶 $1,600。",
    };
  }

  if (product.id === 75) {
    return {
      ...product,
      originalPrice: "原價 $ 2,200",
      price: "產地價 $ 899",
      description: "30mL。尤加利精油，清爽草本香氣，適合居家擴香與空間清新；可搭配單方精油任選 2 瓶 $1,600。",
      priceNote: "單瓶產地價 $899；單方精油任選 2 瓶 $1,600。",
    };
  }

  if (product.id === 78) {
    return {
      ...product,
      originalPrice: "原價 $ 2,800",
      price: "產地價 $ 899",
      description: "30mL。薰衣草單方精油，適合睡前、放鬆與居家香氛擴香；可搭配單方精油任選 2 瓶 $1,600。",
      priceNote: "單瓶產地價 $899；單方精油任選 2 瓶 $1,600。",
    };
  }

  if (product.id === 85) {
    return {
      ...product,
      name: "佐登4號複方精油 10mL",
      description: "10mL。佐登4號複方精油，清新醒腦香氣，適合日常擴香，讓空間維持清新感。",
    };
  }

  if (product.id === 50) {
    return {
      ...product,
      category: "身體洗護",
      series: "手工皂",
      price: "單入 $ 290｜4入優惠 $ 799",
      description: "200g±10g / 塊。薰衣草香氛皂現正上架，單入 $290，4入優惠 $799。",
    };
  }

  return product;
}

export const sevenSequenceOilIdsV354 = new Set([87, 88, 89, 90, 91, 92, 93]);

function normalizeProductForV354(product: Product): Product {
  const updates: Record<number, Partial<Product>> = {
    26: { name: "青春密碼維 E 精萃油 50mL", series: "精萃油 50mL" },
    27: { name: "防護盾牌維 C 精萃油 50mL", series: "精萃油 50mL" },
    28: { name: "晚安無瑕維 A 精萃油 50mL", series: "精萃油 50mL" },
    58: {
      name: "玻尿酸益生菌 2盒組",
      description: "玻尿酸益生菌 3g x 60包 / 盒，共2盒。",
    },
    70: { category: "新品預告", series: "精油滾珠" },
    71: { category: "新品預告", series: "精油滾珠" },
    74: { name: "甜橙單方精油 30mL", series: "單方精油 30mL" },
    75: { name: "尤加利單方精油 30mL", series: "單方精油 30mL" },
    78: {
      name: "薰衣草單方精油 10mL",
      series: "單方精油 10mL",
      description: "10mL。薰衣草單方精油，適合睡前、放鬆與居家香氛擴香。",
    },
    79: { name: "佐登妮絲5號精油 10mL", series: "複方精油 10mL" },
    80: { name: "呼暢護隨精油 30mL", series: "複方精油 30mL" },
    81: {
      name: "佐登妮絲十二號複方精油（OMA律動精油）10mL",
      series: "複方精油 10mL",
    },
    82: { name: "快樂鼠尾草精油 10mL", series: "單方精油 10mL" },
    83: { name: "魔力輕盈精油 30mL", series: "複方精油 30mL" },
    84: { name: "柚見快樂精油 15mL", series: "複方精油 15mL" },
    85: { name: "佐登妮絲4號精油 10mL", series: "複方精油 10mL" },
    86: { name: "佐登妮絲1號精油 10mL", series: "複方精油 10mL" },
    87: { name: "智慧之冠精油 10mL", series: "七序精油" },
    88: { name: "魔力輕盈精油 10mL", series: "七序精油" },
    89: { name: "能量之源精油 10mL", series: "七序精油" },
    90: { name: "順暢平衡精油 10mL", series: "七序精油" },
    91: { name: "亮采橙真精油 10mL", series: "七序精油" },
    92: { name: "心之綻放精油 10mL", series: "七序精油" },
    93: { name: "呼暢護隨精油 10mL", series: "七序精油" },
    96: { name: "檸檬精油 10mL", series: "單方精油 10mL" },
    97: { name: "茶樹精油 15mL", series: "單方精油 15mL" },
    98: {
      name: "天竺葵芳香精油 10mL",
      series: "單方精油 10mL",
      description: "10mL。天竺葵芳香精油，清新花草香氣，適合日常擴香與居家香氛儀式。",
    },
    99: { name: "佐登妮絲6號複方精油 10mL", series: "複方精油 10mL" },
    113: { category: "新品預告", series: "精油滾珠" },
  };

  return updates[product.id] ? { ...product, ...updates[product.id] } : product;
}


function normalizeProductForV359(product: Product): Product {
  const updates: Record<number, Partial<Product>> = {
    15: {
      originalPrice: "原價 $ 790",
      price: "單瓶 $ 590",
      description: "500mL / 瓶。龍血求麗頭皮修護洗髮精，0矽靈配方，洗後蓬鬆柔順。",
      priceNote: "單瓶售價 $590；任選 3 瓶組合請選購獨立組合商品。",
    },
    16: {
      originalPrice: "原價 $ 790",
      price: "單瓶 $ 590",
      description: "500mL / 瓶。龍血求麗潤澤修護沐浴乳，洗後水潤柔嫩不緊繃。",
      priceNote: "單瓶售價 $590；任選 3 瓶組合請選購獨立組合商品。",
    },
    29: {
      name: "高頻霧化香薰機",
      description: "高頻霧化香薰機一台；活動贈品為茶樹精油 10mL 一瓶。",
      priceNote: "售價 $1,980；活動贈茶樹精油 10mL 一瓶，庫存依 LINE 小幫手確認為準。",
    },
  };

  return updates[product.id] ? { ...product, ...updates[product.id] } : product;
}

function normalizeProductForV362(product: Product): Product {
  const updates: Record<number, Partial<Product>> = {
    33: {
      category: "保養品",
      series: "高級養護",
    },
    38: {
      price: "單桶 $ 599",
      description: "22mL x 35pcs / 桶。水搖滾保濕面膜大容量桶裝；組合優惠請選購「35片面膜自由配」。",
    },
    39: {
      price: "單桶 $ 599",
      description: "35pcs / 桶。極光白美白面膜大容量桶裝；組合優惠請選購「35片面膜自由配」。",
    },
    51: {
      name: "石墨烯貼布自由配",
      originalPrice: "原價最高 $ 8,000",
      price: "單盒 $ 500｜任選 4 盒 $ 1,099｜任選 10 盒 $ 2,500",
      description: "涼感與溫感貼布整合在同一張商品卡，可單盒購買；選滿 4 盒或 10 盒時自動採用對應優惠價。",
    },
    54: {
      name: "齒齦保健牙膏自由配",
      price: "單條 $ 250｜買二送一 $ 500",
      description: "薰衣草舒緩與龍血修護牙膏整合在同一張商品卡，可單條購買；買 2 條送 1 條，共 3 條 $500，可自由搭配或同款重複選。",
    },
    55: {
      name: "35片面膜自由配",
      originalPrice: "單桶原價價值 $ 3,000",
      price: "單桶 $ 599｜任選 2 桶 $ 1,100｜任選 5 桶 $ 2,750",
      description: "水搖滾保濕面膜與極光白美白面膜整合在同一張商品卡，可單桶購買；選滿 2 桶或 5 桶時自動採用優惠價，5 桶加贈面膜 10 片。",
    },
    67: {
      name: "香氛皂自由配",
      originalPrice: "原價價值 $ 1,160",
      price: "單入 $ 290｜任選 4 入 $ 799",
      image: "/api/studio/media/19/file",
      gallery: ["/api/studio/media/19/file"],
      description: "龍血薰衣草舒緩皂、龍血玫瑰美膚皂、龍血艾草保庇皂與龍血檸檬馬鞭草皂整合在同一張商品卡，可單入購買；選滿 4 入時自動採用 $799 優惠價。",
    },
    68: {
      name: "櫻花美白三件組",
      price: "組合價 $ 1,780",
      description: "櫻の雪傳明酸美白化妝水、精華液與乳液各 1 件，一套組合價 $1,780。",
    },
    108: {
      name: "護手霜自由配",
      price: "單條 $ 290｜買二送一・3 條 $ 580",
      description: "薰衣草舒緩、櫻之雪亮澤與茶樹防禦護手霜整合在同一張商品卡，可單條購買；選滿 3 條時自動採用買二送一 $580 優惠價。",
    },
    50: {
      internalExpiryDate: "2029-05-26",
      expiryNote: "",
    },
    114: {
      category: "身體洗護",
      series: "手工皂",
      originalPrice: undefined,
      price: "單入 $ 290",
      cardSubtitle: "200g±10g・柔和玫瑰花香",
      priceNote: "單入 $290；可搭配香氛皂任選 4 入 $799。",
      description: "200g±10g / 塊。柔和玫瑰花香，適合日常洗沐；可搭配香氛皂自由配。",
      notice: "依日常洗沐習慣使用，使用後若有不適請暫停使用。",
      internalExpiryDate: "2028-10-16",
      expiryNote: "",
    },
    119: {
      name: "龍血洗髮精／沐浴乳自由配",
      price: "單瓶 $ 590｜任選 3 瓶 $ 1,100",
      description: "龍血求麗頭皮修護洗髮精與龍血求麗潤澤修護沐浴乳整合在同一張商品卡，可單瓶購買；選滿 3 瓶時自動採用 $1,100 優惠價。",
    },
    115: {
      category: "身體洗護",
      series: "手工皂",
      internalExpiryDate: "2029-05-26",
      expiryNote: "",
      originalPrice: undefined,
      price: "單入 $ 290",
      cardSubtitle: "200g±10g・草本香氣",
      priceNote: "單入 $290；可搭配香氛皂任選 4 入 $799。",
      description: "200g±10g / 塊。艾草草本香氣，適合日常洗沐；可搭配香氛皂自由配。",
      notice: "依日常洗沐習慣使用，使用後若有不適請暫停使用。",
    },
    116: {
      category: "身體洗護",
      series: "手工皂",
      internalExpiryDate: "2029-05-26",
      expiryNote: "",
      originalPrice: undefined,
      price: "單入 $ 290",
      cardSubtitle: "200g±10g・清新柑橘香",
      priceNote: "單入 $290；可搭配香氛皂任選 4 入 $799。",
      description: "200g±10g / 塊。檸檬馬鞭草清新香氣，適合日常洗沐；可搭配香氛皂自由配。",
      notice: "依日常洗沐習慣使用，使用後若有不適請暫停使用。",
    },
  };

  return updates[product.id] ? { ...product, ...updates[product.id] } : product;
}


function normalizeProductForV376(product: Product): Product {
  const updates: Record<number, Partial<Product>> = {
    3: {
      description: "50mL x 10瓶 / 盒。玫瑰風味魚膠原蛋白飲，每瓶含 10,000mg 膠原蛋白，適合作為日常美容營養補給。",
    },
    8: {
      description: "50g / 瓶。玫瑰超微晶萃瞬效霜，滋潤型保養最後一步，幫助維持柔嫩潤澤。",
    },
    9: {
      description: "120mL / 瓶。龍血求麗化妝水，清爽前導補水，適合日常保濕與膚況調理。",
    },
    10: {
      price: "產地價 $ 1,290｜買一送一",
      priceNote: "產地價 $1,290，活動買一送一。",
      description: "80mL / 瓶。龍血求麗修護乳，清爽水凝質地，活動買一送一。",
    },
    12: {
      description: "35mL / 瓶。肌光緊緻速妍精華露，適合熟齡、乾燥與疲憊膚況的集中型保養。",
    },
    13: {
      description: "50g / 瓶。肌光緊緻速妍霜，滋潤不厚重，適合作為保養最後一步加強鎖水與彈潤感。",
    },
    14: {
      description: "23mL x 10入 / 盒。肌光緊緻速妍面膜，適合熬夜後、重要場合前或需要集中加強保養時使用。",
    },
    34: {
      originalPrice: undefined,
      price: "買一送一 $ 1,980",
      description: "300mL / 瓶。大容量龍血玻尿酸保濕精華液，臉部、頸部與身體皆可依需求使用；活動價 $1,980 買一送一。",
    },
    41: {
      description: "50g / 瓶。水光肌能晚霜，夜間加強補水、鎖水與潤澤，維持柔嫩澎潤感。",
    },
    72: {
      category: "新品預告",
      series: "護唇膏",
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "3.3g / 支。絕美溫感變色護唇膏列入新品預告，正式上架後再開放購買。",
    },
    73: {
      category: "新品預告",
      series: "護唇膏",
      price: "新品預告",
      priceNote: "新品預告・敬請期待。",
      description: "3.3g / 支。絕美保濕護唇膏列入新品預告，正式上架後再開放購買。",
    },
    110: {
      name: "超防禦清透隔離乳 SPF50+ 30mL",
      description: "30mL。SPF50+ 清透隔離乳，適合日常外出前作為防曬隔離與底妝前打底使用。",
    },
    111: {
      name: "玫瑰超微晶萃精華油 30mL",
      description: "30mL。玫瑰超微晶萃精華油，適合乾燥、缺水或想加強滋養光澤的日常保養。",
    },
  };

  return updates[product.id] ? { ...product, ...updates[product.id] } : product;
}

export const sevenSequenceOilOrderV377 = [87, 91, 93, 92, 90, 88, 89] as const;

function normalizeProductForV377(product: Product): Product {
  const updates: Record<number, Partial<Product>> = {
    87: { name: "佐登妮絲 七序精油－智慧之冠精油", series: "七序精油" },
    91: { name: "佐登妮絲 七序精油－亮采精油", series: "七序精油" },
    93: { name: "佐登妮絲 七序精油－呼暢護隨精油", series: "七序精油" },
    92: { name: "佐登妮絲 七序精油－心之綻放精油", series: "七序精油" },
    90: { name: "佐登妮絲 七序精油－順暢平衡精油", series: "七序精油" },
    88: { name: "佐登妮絲 七序精油－魔力輕盈精油", series: "七序精油" },
    89: { name: "佐登妮絲 七序精油－能量之源精油", series: "七序精油" },
  };

  return updates[product.id] ? { ...product, ...updates[product.id] } : product;
}

export function isSevenSequenceOilV354(product: Product) {
  return sevenSequenceOilIdsV354.has(product.id);
}

export const products: Product[] = [...allProducts, ...comingSoonRollerProducts, ...additionalProductsV359, ...additionalProductsV378]
  .map(normalizeProductForV31)
  .map(normalizeProductForV354)
  .map(normalizeProductForV359)
  .map(normalizeProductForV362)
  .map(normalizeProductForV376)
  .map(normalizeProductForV377)
  .filter((product) => ![20, 21, 22, 23, 24, 25, 52].includes(product.id));

export const productContentOverrides: Record<number, Partial<Product>> = {
  1: {
    cardName: "蔓越莓／補鈣益生菌",
    cardSubtitle: "蔓越莓與補鈣益生菌自由搭配",
    spec: "3g x 30包 / 盒，可單盒購買或任選 3 盒",
    intro: "蔓越莓益生菌與高鈣益生菌可依需求單盒購買，也可自由搭配任選 3 盒享組合優惠。",
    features: [
      "高鈣益生菌單盒 $800；蔓越莓益生菌單盒 $990。",
      "任選 3 盒組合價 $1,600，可自由搭配兩款益生菌。",
      "可依日常需求選擇單買或組合優惠。",
    ],
    suitableFor: [
      "益生菌補給",
      "高鈣營養",
      "女性日常保健",
      "任選組合",
    ],
    usage: "每日 1～3 包，餐前餐後均可食用；請依各商品標示或客服說明補充。",
    notice: "可搭配品項與庫存依 LINE 小幫手確認為準。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "高鈣益生菌單盒 $800；蔓越莓益生菌單盒 $990；任選 3 盒 $1,600。",
  },
  2: {
    cardName: "EC晶眸葉黃素",
    cardSubtitle: "精華凍 + 精華飲綜合組・3C族晶亮補給",
    spec: "精華凍 + 精華飲綜合組（20g x 10入 + 20mL x 10入）/ 盒",
    intro: "EC晶眸葉黃素為晶眸保健系列明星品項，結合精華凍與精華飲雙劑型，適合重度 3C 使用者、學生與上班族作為日常晶亮營養補給。",
    features: [
      "精華凍 + 精華飲雙劑型設計，攜帶與補充都方便。",
      "含葉黃素、玉米黃素與花青素相關營養成分，適合作為日常晶眸保健參考。",
      "一盒兼具 Q 彈果凍與水感飲品，適合全家依產品標示補充。",
    ],
    suitableFor: [
      "重度3C學生",
      "久看螢幕上班族",
      "中老年日常保健",
      "晶眸營養補給需求者",
    ],
    usage: "每日建議依產品標示或客服說明食用；兒童每日 1 包、成人每日 1～2 包，餐後補充更適合日常安排。",
    notice: "請依產品標示食用。內含維生素 A 有助於維持在暗處的視覺；若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  3: {
    cardName: "亮妍魚膠原蛋白飲",
    cardSubtitle: "15mL x 10瓶 / 盒・美妍飲品系列",
    spec: "美妍保健飲品（15mL x 10瓶）/ 盒",
    intro: "亮妍魚膠原蛋白飲為美妍飲品系列，結合魚膠原蛋白、鮭魚蛋白聚醣與植萃亮妍成分，適合作為日常美容保健與水潤光澤補給。",
    features: [
      "採用小分子魚膠原蛋白肽，適合日常美妍營養補給。",
      "搭配鮭魚蛋白聚醣與保濕概念營養成分，支持水潤光澤保養。",
      "融入燕窩、玫瑰與櫻花植萃概念，作為日常亮妍保健參考。",
    ],
    suitableFor: [
      "日常美容保健",
      "膠原蛋白補給",
      "水潤光澤需求",
      "熬夜疲憊保養族",
    ],
    usage: "每日建議依產品標示食用，一瓶即飲；可依客服說明安排早上或睡前補充。",
    notice: "請依產品標示食用。本產品含有大豆、魚類及其製品，為動物性來源、非素食；不適合對其過敏體質者食用。若有特殊體質或孕哺乳，請先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  4: {
    cardName: "薰衣草肌安舒緩化妝水",
    cardSubtitle: "150mL・薰衣草系列",
    spec: "150mL",
    intro: "薰衣草肌安舒緩化妝水為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "薰衣草系列",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  5: {
    cardName: "薰衣草肌安舒緩精華液",
    cardSubtitle: "30mL・薰衣草系列",
    spec: "30mL",
    intro: "薰衣草肌安舒緩精華液為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "薰衣草系列",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  6: {
    cardName: "薰衣草肌安舒緩保濕乳",
    cardSubtitle: "100mL・薰衣草系列",
    spec: "100mL",
    intro: "薰衣草肌安舒緩保濕乳為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  113: {
    cardName: "冷杉酷涼活絡精油滾珠",
    cardSubtitle: "9mL・冷杉系列",
    spec: "9mL",
    intro: "冷杉酷涼活絡精油滾珠為冷杉系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入購物車後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "男士保養",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "新品預告・敬請期待。",
  },
  7: {
    cardName: "玫瑰活膚液",
    cardSubtitle: "130mL・玫瑰超微晶萃系列",
    spec: "130mL",
    intro: "玫瑰超微晶萃活膚液為玫瑰超微晶萃系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  8: {
    cardName: "玫瑰瞬效霜",
    cardSubtitle: "50g・滋潤修護・細緻保養",
    spec: "50g",
    intro: "玫瑰超微晶萃瞬效霜為滋潤型保養品項，適合作為日常保養最後一道使用。",
    features: [
      "滋潤霜狀質地，適合日常保濕與修護保養。",
      "可作為保養程序最後一道，幫助維持肌膚潤澤感。",
      "適合偏乾、想加強滋潤度的保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
      "滋潤修護",
      "日常保養",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠依 LINE 小幫手確認為準。",
  },
  9: {
    cardName: "龍血求麗化妝水",
    cardSubtitle: "120mL・肌膚乖乖水・前導補水",
    spec: "120mL / 瓶",
    intro: "網美與美妝部落客口碑盛讚的「肌膚乖乖水」，專為日間醒膚與夜間調理打造。洗臉後第一步快速補水、穩定膚況，幫助調控皮脂與油水平衡，讓後續精華與乳液更好吸收。",
    features: [
      "秘魯龍血前導修護：嚴選歐盟 ECOCERT 有機認證秘魯龍血素，幫助安撫不穩定膚況，強化肌膚防禦力。",
      "玻尿酸鈉高效補水：快速補充肌膚水分，提升長效保濕續航力，讓肌膚維持水潤光澤。",
      "調理油水平衡：溫和調理肌膚紋理，改善因乾燥引起的出油問題，妝前使用也能讓妝感更服貼。",
      "4 大安心零負擔：無酒精、無香精、無色素、無 PARABEN 防腐劑，搭配檸檬、尤加利等天然精油植萃香調。",
    ],
    suitableFor: [
      "乾燥缺水",
      "油水不平衡",
      "熬夜暗沉肌",
      "3C 壓力疲憊肌",
      "保養吸收感不佳",
    ],
    usage: "每日早晚於臉部清潔後，取適量化妝水於掌心或化妝棉上，均勻輕拍、擦拭於臉部與頸部肌膚直到吸收。也可針對局部乾燥部位短時間濕敷。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。對精油成分過敏者，建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  10: {
    cardName: "龍血求麗修護乳",
    cardSubtitle: "80mL・修護水乳液・買一送一",
    spec: "80mL / 瓶",
    intro: "網美口碑盛讚、被譽為地表最強的「修護水乳液」。專為亞洲氣候與膚質研發，水凝科技打造清爽如厚精華般的質地，幫助穩定換季不乖肌，補水、修護、鎖水一次完成。",
    features: [
      "輕盈水凝科技質地：擁有乳液與乳霜的滋養力，卻能甩掉黏膩感，一年四季皆適用。",
      "秘魯龍血樹脂 × 五、六胜肽：結合 ECOCERT 有機認證龍血素與高效撫紋胜肽，幫助修護屏障、找回彈潤膚感。",
      "三大黃金鎖水因子：添加玫瑰花水、玻尿酸鈉與卵磷脂，建立保濕防護網，提升肌膚持水力。",
      "植萃精油香調紓壓：無酒精、無色素、無香精與 PARABEN 防腐劑，搭配檸檬、尤加利、快樂鼠尾草等天然植物精油。",
    ],
    suitableFor: [
      "乾燥缺水",
      "敏感舒緩",
      "初老暗沉肌",
      "怕乳液厚重黏膩",
      "冷氣房與換季乾燥",
    ],
    usage: "每日早晚於化妝水與精華液後使用。建議全臉約 1.5 次按壓量，點塗於臉部與頸部肌膚，順著肌膚紋理輕柔拍勻、按壓至完全吸收。妝前使用也能讓後續底妝更服貼。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。配方含天然植物精油，對精油成分過敏者建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "買一送一，實際活動、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  11: {
    cardName: "肌光緊緻速妍雪膚液",
    cardSubtitle: "130mL・肌光緊緻速妍系列",
    spec: "130mL / 瓶",
    intro: "洗臉後的緊緻前導第一步，幫助調理肌膚紋理，為肌底注入細緻彈力與光澤。",
    features: [
      "清潔後第一道緊緻前導保養。",
      "可搭配同系列精華露、霜與面膜層層加乘。",
      "支援初老、暗沉與彈力不足的日常保養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "初老保養",
      "彈力光澤",
      "肌光緊緻速妍系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  12: {
    cardName: "肌光緊緻速妍精華露",
    cardSubtitle: "30mL・肌光緊緻速妍系列",
    spec: "30mL / 瓶",
    intro: "高濃縮加強型緊緻精華，適合局部細紋、鬆弛與熬夜疲憊肌，幫助密集修護老態感。",
    features: [
      "加強型精華品項，密集補充緊緻修護能量。",
      "可搭配雪膚液與霜，封存保養活性。",
      "適合細紋、鬆弛與熟齡修護需求。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "局部細紋",
      "熟齡修護",
      "熬夜疲憊肌"
    ],
    usage: "化妝水後取適量塗抹全臉，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  13: {
    cardName: "肌光緊緻速妍霜",
    cardSubtitle: "50mL・肌光緊緻速妍系列",
    spec: "50mL / 瓶",
    intro: "滋潤細緻的緊緻修護霜，適合保養後段使用，幫助鎖住水分與滋養，維持澎彈立體感。",
    features: [
      "保養最後步驟，長效潤澤並鎖住前序保養。",
      "適合搭配雪膚液與精華露加強抗皺修護。",
      "支援乾燥、彈力不足與熟齡肌日常保養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "長效潤澤",
      "熟齡肌",
      "乾燥缺水"
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  14: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "單片 / 盒裝・肌光緊緻速妍系列",
    spec: "單片 / 盒裝",
    intro: "集中型緊緻修護面膜，適合約會前、熬夜後或需要快速加強保養時使用。",
    features: [
      "特殊場合與急救保養時的集中修護。",
      "敷後幫助肌膚維持水亮、潤澤與彈力感。",
      "可搭配同系列日常保養維持緊緻光澤。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "面膜保養",
      "約會前",
      "熬夜後"
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  15: {
    cardName: "龍血求麗頭皮修護洗髮精",
    cardSubtitle: "500mL・龍血洗沐髮品",
    spec: "500mL / 瓶",
    intro: "龍血系列日常洗髮品，0 矽靈配方，適合頭皮與髮絲清潔使用。",
    features: [
      "0 矽靈配方，洗後蓬鬆不厚重。",
      "龍血修護概念，幫助頭皮與髮根維持舒適狀態。",
      "搭配自然精油草本香氣，洗後柔順有光澤。"
    ],
    suitableFor: [
      "頭皮清潔",
      "髮根扁塌",
      "乾枯髮絲",
      "日常洗髮"
    ],
    usage: "取適量洗髮精於濕髮與頭皮，按摩起泡後以清水沖洗；可視需求重複清潔一次。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單瓶售價 $590；任選 3 瓶組合請選購獨立組合商品。",
  },
  16: {
    cardName: "龍血求麗潤澤修護沐浴乳",
    cardSubtitle: "500mL・龍血洗沐髮品",
    spec: "500mL / 瓶",
    intro: "龍血系列日常沐浴品，清潔肌膚同時維持洗後水潤柔嫩感。",
    features: [
      "龍血修護概念，洗淨同時維持肌膚柔嫩。",
      "搭配燕麥、洋甘菊等植萃保養概念。",
      "洗後水潤滑順、不易感到緊繃。"
    ],
    suitableFor: [
      "乾燥肌膚",
      "水潤不緊繃",
      "日常沐浴",
      "家庭使用"
    ],
    usage: "取適量沐浴乳於濕潤肌膚或沐浴球，搓揉起泡後按摩全身，再以清水沖洗。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單瓶售價 $590；任選 3 瓶組合請選購獨立組合商品。",
  },
  119: {
    cardName: "龍血洗髮精／沐浴乳任選3瓶",
    cardSubtitle: "500mL × 3 瓶・自由搭配",
    spec: "500mL × 3 瓶",
    intro: "龍血洗髮精與沐浴乳可依需求自由搭配，共選 3 瓶，適合日常補貨。",
    features: [
      "洗髮精與沐浴乳可自由搭配，共選 3 瓶。",
      "500mL 大容量，適合家庭日常使用。",
      "組合價 $1,100，比單瓶購買更划算。"
    ],
    suitableFor: [
      "洗沐補貨",
      "自由搭配",
      "家庭使用"
    ],
    usage: "洗髮精與沐浴乳請依各商品標示方式使用。",
    notice: "實際可選品項與庫存依賣場顯示及 LINE 小幫手確認為準。",
    expiryNote: "效期依各商品包裝標示為準。",
    priceNote: "龍血洗髮精／沐浴乳任選 3 瓶 $1,100。",
  },
  17: {
    cardName: "純淨洗髮精",
    cardSubtitle: "洗髮品項・洗沐系列",
    spec: "洗髮品項",
    intro: "純淨洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入購物車。",
      "商品優惠與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  18: {
    cardName: "薰衣草齒齦保健牙膏",
    cardSubtitle: "120g・牙膏",
    spec: "120g / 支",
    intro: "薰衣草齒齦保健牙膏，添加薰衣草植萃香氣，溫和清潔牙齒與牙齦邊緣，適合喜歡草本香氛與夜間舒緩潔牙的人。",
    features: [
      "薰衣草精油草本調理，帶來溫和口腔舒適感。",
      "泡沫細緻，協助維護牙齒與牙齦健康。",
      "天然薰衣草氣息，刷牙同時維持口氣怡人。"
    ],
    suitableFor: [
      "口腔清潔",
      "齒齦保健",
      "薰衣草香氣",
      "夜間潔牙"
    ],
    usage: "每天至少刷牙兩次，取適量牙膏於牙刷上，輕柔刷洗牙齒與牙齦邊緣，最後以清水徹底漱口吐出。",
    notice: "請配合正確刷牙習慣。不可吞食，刷牙後應徹底漱口吐出。若不慎出現敏感不適，請暫停使用並諮詢牙醫師。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配齒齦保健牙膏任選活動，庫存與優惠依 LINE 小幫手確認為準。",
  },
  19: {
    cardName: "龍血齒齦保健牙膏",
    cardSubtitle: "120g・牙膏",
    spec: "120g / 支",
    intro: "龍血齒齦保健牙膏，將秘魯龍血樹脂調理概念融入日常潔牙，幫助溫和清潔牙齒與齒縫，維持牙齦健康與清新口氣。",
    features: [
      "秘魯龍血調理概念，溫和呵護牙齦與口腔環境。",
      "協助維持日常口腔清潔與牙齦健康。",
      "溫和潔淨不刺激，刷後維持乾淨舒爽。"
    ],
    suitableFor: [
      "口腔清潔",
      "齒齦保健",
      "龍血牙膏",
      "清新口氣"
    ],
    usage: "每天至少刷牙兩次，每次 2–3 分鐘；取適量牙膏於牙刷上仔細刷洗牙齒各面，最後以清水徹底漱口吐出。",
    notice: "請配合正確刷牙習慣。不可吞食，刷牙後應徹底漱口吐出。6 歲以下孩童使用量約綠豆大小，需成人在旁指導。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配齒齦保健牙膏任選活動，庫存與優惠依 LINE 小幫手確認為準。",
  },
  20: {
    cardName: "智慧之冠",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "智慧之冠為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  21: {
    cardName: "亮采橙真",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "亮采橙真為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  22: {
    cardName: "呼暢護隨",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "呼暢護隨為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  23: {
    cardName: "魔力輕盈",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "魔力輕盈為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  24: {
    cardName: "順暢平衡",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "順暢平衡為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  25: {
    cardName: "心之綻放",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "心之綻放為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  26: {
    cardName: "青春密碼維 E 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "青春密碼維 E 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  27: {
    cardName: "防護盾牌維 C 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "防護盾牌維 C 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  28: {
    cardName: "晚安無瑕維 A 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "晚安無瑕維 A 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  29: {
    cardName: "高頻霧化香薰機",
    cardSubtitle: "擴香設備・售價 $1,980",
    spec: "香薰機 1 台＋活動贈茶樹精油 10mL 1 瓶",
    intro: "高頻霧化香薰機，適合日常空間擴香；目前活動贈茶樹精油 10mL 一瓶。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "擴香設備",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "售價 $1,980，庫存依 LINE 小幫手確認為準。",
  },
  30: {
    cardName: "石墨烯電氣石精油貼布｜涼感",
    cardSubtitle: "10片 / 盒・清爽沁涼款",
    spec: "10片 / 盒",
    intro: "石墨烯電氣石精油貼布涼感款結合石墨烯、電氣石與草本薄荷精油概念，帶來清爽沁涼的局部放鬆感，適合運動後、久坐肩頸與炎熱天氣日常保健使用。",
    features: [
      "石墨烯科技概念，幫助涼感精油氣息與清爽感更均勻延展。",
      "電氣石能量概念，適合肩頸、腰背與四肢局部舒緩放鬆。",
      "草本薄荷精油配方，帶來溫和沁涼感，適合喜歡清爽貼布的人。",
    ],
    suitableFor: [
      "運動後放鬆",
      "久坐肩頸緊繃",
      "喜歡涼感清爽",
      "日常局部保健",
    ],
    usage: "清潔並擦乾需要貼敷的部位，撕去背膠紙後將貼布平整貼於肌膚。建議每片貼敷時間不超過 4～6 小時。",
    notice: "本產品僅供外用，請勿直接貼敷於傷口、濕疹、潰爛或黏膜受損部位。使用後若出現發紅、搔癢或刺痛等不適，請立即撕除並以清水洗淨。請存放於避免陽光直射、高溫或潮濕的陰涼密閉場所，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單盒價格保留既有設定；另有任選 4 盒、10 盒優惠組合，庫存與最終金額依 LINE 小幫手確認為準。",
    gallery: [],
  },
  31: {
    cardName: "石墨烯電氣石精油貼布｜溫感",
    cardSubtitle: "10片 / 盒・溫熱舒緩款",
    spec: "10片 / 盒",
    intro: "石墨烯電氣石精油貼布溫感款主打溫和持續的溫熱感，像為肩頸、腰背與四肢局部敷上一層舒適熱毛巾，適合冷氣房、家事勞動後與日常放鬆保養。",
    features: [
      "石墨烯科技概念，幫助溫感精油氣息與溫熱感更均勻延展。",
      "電氣石能量概念，適合久坐、勞動後的局部放鬆保養。",
      "溫感草本精油帶來持續暖感，避免過度辛辣刺激的貼布感受。",
    ],
    suitableFor: [
      "冷氣房族群",
      "家事勞動後",
      "肩頸腰背緊繃",
      "喜歡溫熱放鬆",
    ],
    usage: "清潔肌膚表面並擦乾後，取一片貼布撕下襯紙，平整貼於肩頸、腰背或四肢關節等需要溫熱調理之處。",
    notice: "本產品僅供外用，請勿直接貼敷於傷口、紅腫潰爛或皮膚異常部位。孕婦、哺乳期婦女及 2 歲以下兒童使用前，請先諮詢專業醫師。撕除時請勿用力猛撕，建議溫和地順著毛髮生長方向撕下。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單盒價格保留既有設定；另有任選 4 盒、10 盒優惠組合，庫存與最終金額依 LINE 小幫手確認為準。",
    gallery: [],
  },
  32: {
    cardName: "茶樹K痘精華",
    cardSubtitle: "8mL・茶樹控油系列",
    spec: "8mL / 盒",
    intro: "高濃縮茶樹局部精華，針對局部出油、粗大毛孔與不安定油脂肌膚進行重點平衡調理。",
    features: [
      "日常控油保養中的局部加強品項。",
      "可依膚況搭配日常保濕步驟，作為局部控油加強保養。",
      "適合特定皮脂粗糙、毛孔油光與面皰瑕疵需求。"
    ],
    suitableFor: [
      "油性毛孔",
      "粉刺痘痘",
      "局部控油",
      "茶樹控油系列"
    ],
    usage: "化妝水後取適量點塗於局部出油或面皰瑕疵部位，再依需求搭配乳液。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  33: {
    cardName: "肌可佳膠原蛋白彈潤原液",
    cardSubtitle: "30mL・膠原蛋白系列",
    spec: "30mL",
    intro: "肌可佳膠原蛋白彈潤原液為膠原蛋白系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入購物車後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  34: {
    cardName: "龍血玻尿酸保濕精華液",
    cardSubtitle: "300mL・國民保濕精華・買一送一",
    spec: "300mL / 瓶",
    intro: "被譽為佐登妮絲城堡必敗的「國民保濕精華」，專為現代人因作息不正常、生活壓力大而導致的缺水、暗沉與脫屑問題設計。清爽好吸收，臉部、頸部到身體肌膚皆可使用。",
    features: [
      "雙倍保濕 × 長效補水：嚴選日本小分子玻尿酸，幫助補充肌膚水分，維持長時間水潤感。",
      "秘魯龍血樹脂修護力：蘊含穩膚與修護力，幫助強健肌膚屏障，改善缺水疲憊感。",
      "解鎖四大危肌：針對壓力、疲憊、乾燥、脫屑等肌膚狀態，提供日常快充修護。",
      "300mL 大容量高 CP 值：臉部、頸部到身體肌膚皆可使用，適合日常大量保濕。",
    ],
    suitableFor: [
      "乾燥缺水",
      "敏感舒緩",
      "熬夜暗沉肌",
      "外油內乾肌",
      "全身保濕",
    ],
    usage: "每日早晚於化妝水後，取適量精華液，均勻塗抹於臉部與頸部肌膚，以指腹輕柔拍勻並按摩至吸收。也可作為身體保濕精華，塗抹於手臂、腿部或容易乾燥的部位。",
    notice: "僅供外用，請勿使用於傷口或肌膚不適部位。使用後若出現敏感或不適，請立即停止使用並諮詢皮膚科醫師。本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤與氣味略有差異，屬正常現象。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "買一送一，依通路活動為準。實際活動、庫存與最終金額依 LINE 小幫手確認。",
  },
  35: {
    cardName: "龍血求麗卸妝油",
    cardSubtitle: "150mL・龍血系列",
    spec: "150mL / 瓶",
    intro: "龍血系列卸妝油，輕盈高親膚質地能快速溶解彩妝、防曬與毛孔髒污，遇水迅速乳化、好沖洗。",
    features: [
      "柔滑好推勻，能包覆並溶解頑固彩妝與防曬。",
      "溫和潔膚，卸妝同時維持肌膚水潤舒適。",
      "乳化快速、洗後不留厚重殘留感，可搭配龍血潔顏慕絲。"
    ],
    suitableFor: [
      "清潔卸妝",
      "毛孔潔淨",
      "卸後不緊繃",
      "龍血系列"
    ],
    usage: "保持雙手及臉部乾燥，取適量卸妝油按摩全臉；加少量清水乳化變白後，以清水徹底沖洗。",
    notice: "使用後若有不適，請暫停使用。請避免直接接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  36: {
    cardName: "龍血求麗潔顏慕絲",
    cardSubtitle: "150mL・龍血系列",
    spec: "150mL / 瓶",
    intro: "龍血系列潔顏慕絲，細緻綿密泡泡溫和帶走毛孔髒污與多餘皮脂，洗後不緊繃、不乾澀。",
    features: [
      "免手動搓泡，超微米泡泡溫和包覆髒污。",
      "日常潔顏與保養前清潔使用，為後續保養打好基礎。",
      "溫和潔淨不傷肌膚屏障，可與龍血卸妝油搭配雙重清潔。"
    ],
    suitableFor: [
      "清潔卸妝",
      "洗後不緊繃",
      "龍血系列",
      "日常潔顏"
    ],
    usage: "每日早晚打濕臉部後，按壓適量慕絲於掌心，均勻塗抹全臉並輕柔按摩，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請立即以大量清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  37: {
    cardName: "水搖滾保濕面膜 (10片裝)",
    cardSubtitle: "22mL x 10pcs・保濕面膜",
    spec: "22mL x 10pcs / 盒",
    intro: "明星保濕面膜 10 片裝，適合日常補水、熬夜後急救與集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "高持水面膜剪裁，快速補足肌膚日常保濕需求。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "龍血系列"
    ],
    usage: "臉部清潔後取出面膜並撕下外層襯膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "售價 $199。",
  },
  38: {
    cardName: "水搖滾保濕面膜 (35片桶裝)",
    cardSubtitle: "22mL x 35pcs・保濕面膜",
    spec: "22mL x 35pcs / 桶",
    intro: "明星保濕面膜大容量桶裝，適合長期日常補水、乾燥缺水與面膜集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "35 片大容量，適合固定敷臉與家庭回購。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單桶 $599；水搖滾與極光白可混搭，購物車自動套用任選2桶 $1,100、5桶 $2,750；每滿5桶另贈面膜10片。",
  },
  39: {
    cardName: "極光白美白面膜 (35片桶裝)",
    cardSubtitle: "35pcs・亮白面膜",
    spec: "35pcs / 桶",
    intro: "集中亮白面膜大容量桶裝，適合膚色不均、熬夜暗沉與日常亮白集中保養。",
    features: [
      "密集勻亮去暗沉，適合日常亮白特別調理。",
      "35 片大容量，適合長期固定亮白保養。",
      "敷後搭配日常保養，維持柔嫩、透亮與妝前服貼感。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "熬夜暗沉",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻平整敷於全臉；依標示時間取下後，輕拍幫助吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單桶 $599；水搖滾與極光白可混搭，購物車自動套用任選2桶 $1,100、5桶 $2,750；每滿5桶另贈面膜10片。",
  },
  40: {
    cardName: "水光肌能乳液",
    cardSubtitle: "130mL・水光肌能系列",
    spec: "130mL / 瓶",
    intro: "水光肌能乳液主打清爽鎖水與水屏障保養，補充水分同時封存潤澤，讓肌膚維持柔嫩彈潤。",
    features: [
      "Double 保濕水屏障，補水並減少乾燥流失。",
      "質地清爽好推，適合日常油水平衡與保濕修護。",
      "可搭配同系列化妝水與晚霜，完成水光保養流程。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "換季修護",
      "水光肌能系列"
    ],
    usage: "化妝水或精華後，取適量均勻塗抹於臉部與頸部，按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  41: {
    cardName: "水光肌能晚霜",
    cardSubtitle: "50mL・水光肌能系列",
    spec: "50mL / 瓶",
    intro: "水光肌能晚霜是夜間深度潤澤奇肌霜，適合乾燥、疲憊與粗糙肌在睡前加強鎖水修護。",
    features: [
      "夜間鎖水保養，幫助肌膚醒來維持柔嫩光澤。",
      "復活草保濕概念，支援乾燥細紋與疲憊膚況保養。",
      "滋潤但不厚重，適合作為晚間保養最後一步。"
    ],
    suitableFor: [
      "乾燥缺水",
      "夜間鎖水",
      "乾燥細紋",
      "水光肌能系列"
    ],
    usage: "夜間於化妝水、精華或乳液後，取適量塗抹全臉與頸部並按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  42: {
    cardName: "苦杏仁酸溫和煥顏露",
    cardSubtitle: "30mL・杏仁酸系列",
    spec: "30mL",
    intro: "苦杏仁酸溫和煥顏露為杏仁酸系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入購物車後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  43: {
    cardName: "冰河淨化淨膚露",
    cardSubtitle: "120mL・冰河淨化系列",
    spec: "120mL / 瓶",
    intro: "清透高滲透質地，洗臉後迅速浸潤角質，調理老廢皮脂、平衡出油並收斂毛孔。",
    features: [
      "清潔後作為保養前導，溫和淨化多餘角質。",
      "可搭配同系列精華、乳液或霜，建立完整淨化保養。",
      "維持臉部澄淨不泛油光。"
    ],
    suitableFor: [
      "油性毛孔",
      "油水平衡",
      "粗糙肌",
      "冰河淨化系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或均勻擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  44: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL・水洗泥膜",
    spec: "100mL / 瓶",
    intro: "水洗式冰河淨化泥膜，富含高礦物質淨化因子，幫助吸附毛孔髒污與多餘油脂，重塑平滑透亮膚質。",
    features: [
      "適合特別保養或深層淨化髒污時使用。",
      "泥膜調理可溫和舒緩，同步補足保濕修護需求。",
      "水洗後搭配日常保養，維持細緻潤澤感。"
    ],
    suitableFor: [
      "油性毛孔",
      "毛孔粗大",
      "面膜保養",
      "深層淨化"
    ],
    usage: "臉部清潔後，避開眼唇均勻塗抹全臉，依標示時間靜置後以清水溫和洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  45: {
    cardName: "鳳梨酵素代謝角質凝露",
    cardSubtitle: "120g・鳳梨酵素系列",
    spec: "120g / 瓶",
    intro: "溫和代謝老廢角質的鳳梨酵素凝露，改善角質堆積造成的粗糙、暗沉與吸收感不佳。",
    features: [
      "運用鳳梨酵素溫和分解肌膚表層髒污與粗糙角質。",
      "定期調理角質，平滑肌膚紋理並提升透亮感。",
      "清爽凝露質地好推勻，幫助後續精華與面膜更好吸收。"
    ],
    suitableFor: [
      "清潔卸妝",
      "暗沉粗糙",
      "保養吸收不佳",
      "鳳梨酵素系列"
    ],
    usage: "卸妝清潔後擦乾臉部，避開眼唇塗抹並輕柔畫圈按摩至出屑，再以清水洗淨；建議每週 1–2 次。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  46: {
    cardName: "櫻の雪淨白潔顏慕絲",
    cardSubtitle: "150mL・新品預告",
    spec: "150mL / 瓶",
    intro: "櫻の雪淨白潔顏慕絲新品預告，亮白保養系列的清潔第一步。",
    features: [
      "櫻の雪系列清潔保養新品預告。",
      "亮白保養前的清潔步驟，洗後清爽不厚重。",
      "適合放在櫻の雪亮白保養系列中作為清潔第一步。",
    ],
    suitableFor: ["新品預告", "清潔卸妝", "櫻の雪系列"],
    usage: "正式上架後請依商品標示方式使用。",
    notice: "新品預告・敬請期待。",
    expiryNote: "上架後依商品標示或 LINE 小幫手確認為準。",
    priceNote: "新品預告・敬請期待。",
  },
  47: {
    cardName: "櫻の雪傳明酸美白化妝水",
    cardSubtitle: "150mL・櫻の雪系列",
    spec: "150mL / 瓶",
    intro: "洗臉後的亮白前導化妝水，水感輕盈好吸收，補充亮白水分並打開後續美白吸收通道。",
    features: [
      "清潔後前導使用，迅速浸潤角質層。",
      "傳明酸亮白保養概念，調理蠟黃與暗沉。",
      "可搭配同系列精華與乳液，讓亮白流程更完整。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "暗沉蠟黃",
      "櫻の雪系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部與頸部至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  49: {
    cardName: "櫻の雪傳明酸美白乳液",
    cardSubtitle: "100mL・櫻の雪系列",
    spec: "100mL / 瓶",
    intro: "櫻の雪美白乳液負責鎖住亮白保養，質地輕盈好推勻，兼顧保濕與亮白，維持水嫩透亮不黏膩。",
    features: [
      "保養程序後段使用，幫助鎖水補水。",
      "傳明酸與滋潤因子雙效加成，亮白同時滋潤。",
      "維持油水平衡，打造清爽亮白防護網。"
    ],
    suitableFor: [
      "美白淡斑",
      "乾燥缺水",
      "膚色不均",
      "櫻の雪系列"
    ],
    usage: "化妝水與精華液後，取適量均勻塗抹於臉部與頸部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  50: {
    cardName: "龍血薰衣草舒緩皂",
    cardSubtitle: "薰衣草香氛皂・4入優惠",
    spec: "200g±10g / 塊",
    intro: "龍血薰衣草舒緩皂主打日常香氛清潔，目前薰衣草款已上架，單入 $290，購買 4 塊同款享 $799 優惠。",
    features: [
      "薰衣草香氣，日常洗沐更有儀式感。",
      "單入 $290，4入優惠 $799。",
      "更多香型陸續登場，可先從薰衣草款開始回購。",
    ],
    suitableFor: ["肥皂", "薰衣草舒緩", "日常清潔", "4入優惠"],
    usage: "將手工皂沾水起泡後清潔肌膚，再以清水沖淨。",
    notice: "薰衣草款現正上架，更多香型陸續登場。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前上架薰衣草款；單入 $290，4入優惠 $799。",
  },
  51: {
    cardName: "石墨烯電氣石精油貼布任選4盒",
    cardSubtitle: "涼感 / 溫感爆款貼布任選",
    spec: "涼感 / 溫感可任選搭配，共4盒",
    intro: "石墨烯電氣石精油貼布任選4盒是本月 TOP 3 主打，涼感與溫感可依需求搭配，適合肩頸、腰背與日常局部放鬆補貨。",
    features: [
      "TOP 3 回購主打，涼感 / 溫感任選共 4 盒。",
      "4盒組合價 $1,099，比單盒補貨更划算。",
      "適合家中常備、運動後或久坐族日常放鬆使用。",
    ],
    suitableFor: [
      "組合優惠",
    ],
    usage: "清潔並擦乾欲貼敷部位，撕下背膠後平整貼上；建議每片貼敷時間不超過 4–6 小時。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  52: {
    cardName: "石墨烯電氣石精油貼布任選10盒",
    cardSubtitle: "涼感 / 溫感可任選搭配，共10盒・貼布組合",
    spec: "涼感 / 溫感可任選搭配，共10盒",
    intro: "石墨烯電氣石精油貼布任選10盒為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出資料後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
    ],
    usage: "依照組合內各品項使用方式使用；保健食品依商品標示食用，保養與生活用品依品項標示操作。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  53: {
    cardName: "牛樟芝潔口液3罐組",
    cardSubtitle: "贈薰衣草牙膏1條・$1,500",
    spec: "能量牛樟芝保健潔口液 3罐 + 齒齦保健薰衣草舒緩牙膏120g 1條",
    intro: "能量牛樟芝保健潔口液 3罐組為回購組合優惠，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
    features: [
      "能量牛樟芝保健潔口液 3罐，搭配薰衣草舒緩牙膏1條。",
      "組合價 $1,500，適合日常口腔清潔用品補貨。",
      "組合內容、效期與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "口腔清潔",
    ],
    usage: "刷牙後取適量潔口液漱口約 30 秒至 1 分鐘後吐出；牙膏依日常刷牙方式使用並徹底漱口。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "3罐潔口液贈薰衣草牙膏1條，組合價 $1,500；庫存與效期依 LINE 小幫手確認為準。",
  },
  54: {
    cardName: "齒齦保健牙膏買二送一",
    cardSubtitle: "薰衣草舒緩／龍血修護自由搭配",
    spec: "120g / 支，買 2 送 1，共 3 支",
    intro: "薰衣草舒緩與龍血修護兩款齒齦保健牙膏可自由搭配或同款重複選；買 2 支送 1 支，共 3 支 $500。",
    features: [
      "薰衣草舒緩與龍血修護兩款可自由搭配。",
      "可同款重複選，買 2 送 1，共 3 支 $500。",
      "適合日常口腔清潔與家庭補貨。",
    ],
    suitableFor: [
      "買二送一",
      "口腔清潔",
      "自由搭配",
    ],
    usage: "每天至少刷牙兩次，每次 2–3 分鐘；取適量牙膏刷洗牙齒各面後徹底漱口吐出。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "買 2 送 1，共 3 支 $500；兩款可自由搭配或同款重複選。",
  },
  55: {
    cardName: "水搖滾 / 極光白美白面膜桶裝任選組",
    cardSubtitle: "爆水面膜 / 亮白面膜桶裝任選",
    spec: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選",
    intro: "水搖滾主打爆水感保濕，極光白主打透亮保養；桶裝大容量適合日常敷臉回購補貨。",
    features: [
      "水搖滾：爆水感保濕，適合乾燥缺水時加強補水。",
      "極光白：透亮保養，適合暗沉與膚色不均時日常敷臉。",
      "桶裝大容量，適合固定敷臉與家庭回購補貨。",
    ],
    suitableFor: [
      "組合優惠",
      "面膜保養",
    ],
    usage: "清潔後取出面膜平整敷於臉部，依標示時間使用後取下，輕拍殘留精華至吸收。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  57: {
    cardName: "阿甘甦醒髮根養護液",
    cardSubtitle: "80mL・洗沐系列",
    spec: "80mL",
    intro: "阿甘甦醒髮根養護液為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入購物車。",
      "商品優惠與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  112: {
    cardName: "龍血洗髮精＋阿甘養護液組合",
    cardSubtitle: "洗髮精 500mL＋髮根養護液 80mL",
    spec: "龍血求麗頭皮修護洗髮精 500mL × 1 瓶＋阿甘甦醒髮根養護液 80mL × 1 瓶",
    intro: "洗髮清潔與髮根養護一次補齊，適合想建立完整頭皮與髮根日常保養流程的客人。",
    features: [
      "龍血求麗頭皮修護洗髮精 500mL，0 矽靈配方，日常清潔頭皮與髮絲。",
      "阿甘甦醒髮根養護液 80mL，洗髮後搭配使用，完成髮根日常養護。",
      "兩件組合價 $1,500，直接一次補齊洗護步驟。",
    ],
    suitableFor: ["洗髮清潔", "頭皮養護", "髮根保養", "組合優惠"],
    usage: "先以洗髮精清潔頭皮與髮絲並沖洗乾淨；擦乾後依商品標示取適量養護液使用於頭皮與髮根。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "龍血求麗頭皮修護洗髮精 1 瓶＋阿甘甦醒髮根養護液 1 瓶，組合價 $1,500。",
  },
  58: {
    cardName: "玻尿酸益生菌 2盒組",
    cardSubtitle: "玻尿酸益生菌 3g x 60包 / 盒，共2盒・保健食品組合",
    spec: "玻尿酸益生菌 3g x 60包 / 盒，共2盒",
    intro: "玻尿酸益生菌 2盒組為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出資料後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "益生菌補給",
    ],
    usage: "每日 1–2 包，早晚或餐後依商品標示食用；持續補充作為日常營養保健。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  59: {
    cardName: "龍血洗卸1+1組",
    cardSubtitle: "潔顏慕絲 + 卸妝油・$1,080",
    spec: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶",
    intro: "龍血洗卸1+1組固定搭配龍血求麗潔顏慕絲與龍血求麗卸妝油，各1瓶，共2瓶。",
    features: [
      "固定搭配潔顏慕絲 1 瓶與卸妝油 1 瓶，不是任選。",
      "洗卸清潔一次補齊，適合日常卸妝與潔顏流程。",
      "組合價 $1,080，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "龍血系列",
      "清潔卸妝",
    ],
    usage: "手臉乾燥時先以卸妝油按摩全臉並加水乳化沖淨，再使用潔顏慕絲清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "潔顏慕絲 1 瓶 + 卸妝油 1 瓶，1+1 兩瓶 $1,080；庫存與效期依 LINE 小幫手確認為準。",
  },
  60: {
    cardName: "賽洛美潤膚美體油(C+E)",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "頂級身體養護美體油，結合賽洛美與維他命 C、E 滋養因子，沐浴後使用能幫助乾燥粗糙肌膚維持柔嫩光澤。",
    features: [
      "賽洛美修護概念，滋養並強化身體肌膚水脂屏障。",
      "C+E 養膚因子，保濕同時兼顧亮澤與彈嫩感。",
      "輕盈植物油質地快速吸收，潤而不膩。"
    ],
    suitableFor: [
      "乾燥粗糙",
      "身體保養",
      "美白淡斑",
      "頂級養護"
    ],
    usage: "沐浴後擦乾身體，取適量美體油均勻塗抹並按摩於全身；手肘、膝蓋等乾燥處可加強。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  61: {
    cardName: "24小時賦活液",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "頂級養護前導賦活液，適合保養撞牆期與疲憊暗沉肌，水感質地快速吸收，幫助後續精華與乳霜延展吸收。",
    features: [
      "全天候持續滋養肌底，強化日常環境防禦感。",
      "迅速安撫環境壓力造成的疲憊暗沉。",
      "高效前導加乘，打通肌膚保養通道。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "初老肌",
      "熟齡肌",
      "保養撞牆期"
    ],
    usage: "每日早晚清潔後，取適量賦活液於掌心，均勻輕拍並按摩於臉部與頸部至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  62: {
    cardName: "24小時黃金璀璨賦活液",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "奢華金箔前導賦活液，結合 24K 金箔與高效保濕修護精華，幫助肌膚維持澎潤、透亮與細緻光澤。",
    features: [
      "24K 金箔導入奢華保養感。",
      "24 小時持潤，改善乾燥引起的暗沉與乾紋感。",
      "頂級抗老活化肌底概念，提升細緻度與彈力感。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "乾燥缺水",
      "透亮光澤",
      "頂級養護"
    ],
    usage: "每日早晚清潔後，取適量黃金賦活液塗抹於全臉與頸部，以手掌溫熱按壓幫助吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  63: {
    cardName: "水光苦杏仁酸慕絲",
    cardSubtitle: "水光肌能系列品項・水光肌能系列",
    spec: "水光肌能系列品項",
    intro: "水光苦杏仁酸慕絲為水光肌能系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
      "乾燥缺水",
      "油性毛孔",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  64: {
    cardName: "超導水網瞬效面膜",
    cardSubtitle: "頂級養護面膜品項・頂級養護",
    spec: "頂級養護面膜品項",
    intro: "超導水網瞬效面膜為頂級養護集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "抗皺緊緻",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  65: {
    cardName: "Exo-雙粹秘泌凍晶組",
    cardSubtitle: "一組・頂級養護",
    spec: "一組 / 盒裝",
    intro: "頂級凍晶密集保養組，使用時混合激活，適合膚況不穩、暗沉粗糙與想做高階急救修護保養的人。",
    features: [
      "植物外泌體概念，搭配高效修護能量保養。",
      "凍晶真空新鮮封存，使用時才混合激活。",
      "密集改善鬆弛、細紋、粗糙、敏弱與暗沉感。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "敏感舒緩",
      "暗沉粗糙",
      "高階修護"
    ],
    usage: "依產品標示說明，將精華液與凍晶粉按比例混合，每天取適量塗抹於全臉與頸部；開封後請依標示時間使用完畢。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  66: {
    cardName: "奧勒岡小白花美體乳",
    cardSubtitle: "500mL・頂級養護",
    spec: "500mL / 瓶",
    intro: "500mL 大容量身體乳，結合奧勒岡草本與小白花保濕精華，質地水潤好推不黏膩，適合每日沐浴後全身保養。",
    features: [
      "小白花高持水柔膚，柔嫩身體粗糙角質。",
      "草本安撫與屏障修護，適合季節乾燥不適。",
      "大容量高 CP 值，適合每日全身大量保養。"
    ],
    suitableFor: [
      "乾燥粗糙",
      "身體保養",
      "香氛保養",
      "頂級養護"
    ],
    usage: "每日沐浴清潔後，取適量美體乳均勻塗抹全身，順著肌肉線條按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  67: {
    cardName: "龍血薰衣草舒緩皂 4入優惠",
    cardSubtitle: "目前上架薰衣草款・4入優惠",
    spec: "龍血薰衣草舒緩皂 200g±10g / 塊，共4塊",
    intro: "目前肥皂區先上架薰衣草款，購買 4 塊同款享優惠價 $799。",
    features: [
      "目前上架薰衣草款。",
      "共4塊，適合自用囤貨或送禮。",
      "單顆 $290，4入優惠 $799。",
    ],
    suitableFor: ["組合優惠", "肥皂", "薰衣草舒緩", "日常清潔"],
    usage: "依一般手工皂使用方式，沾濕搓揉起泡後清潔肌膚，再以清水沖淨。",
    notice: "薰衣草款現正上架，更多香型陸續登場。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前薰衣草款 4入優惠 $799。",
  },
  68: {
    cardName: "櫻の雪美白精華乳液組",
    cardSubtitle: "買精華液+乳液・贈化妝水・$1,780",
    spec: "精華液30mL + 乳液100mL，贈化妝水150mL",
    intro: "櫻の雪傳明酸美白組合為亮白保養套組，購買精華液與乳液，贈送同系列化妝水。",
    features: [
      "購買櫻の雪傳明酸美白精華液30mL + 美白乳液100mL。",
      "贈送櫻の雪傳明酸美白化妝水150mL。",
      "組合價 $1,780，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "美白淡斑",
      "櫻の雪系列",
    ],
    usage: "臉部清潔後依序使用化妝水、精華液與乳液，均勻塗抹並輕拍按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "購買精華液30mL + 乳液100mL，贈化妝水150mL，組合價 $1,780；庫存與效期依 LINE 小幫手確認為準。",
  },
  69: {
    cardName: "亮妍膠原飲兩盒贈晶眸",
    cardSubtitle: "玫瑰風味50mL/10入兩盒・贈EC晶眸・$4,400",
    spec: "亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入 x 2盒，贈 EC 晶眸葉黃素精華凍+精華飲綜合組",
    intro: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素為回購群保健食品組合優惠，適合日常美容與晶眸保健補給。",
    features: [
      "購買亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入兩盒。",
      "贈送 EC 晶眸葉黃素精華凍+精華飲綜合組。",
      "組合價 $4,400，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "美容補給",
      "晶眸保健",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素綜合組，組合價 $4,400；庫存與效期依 LINE 小幫手確認為準。",
  },
  48: {
    cardName: "櫻の雪傳明酸美白精華液",
    cardSubtitle: "30mL・櫻の雪系列",
    spec: "30mL / 瓶",
    intro: "櫻の雪系列密集亮白核心精華，針對斑點、曬後暗沉與蠟黃膚色加強調理，幫助肌膚找回透亮感。",
    features: [
      "日常保養中的加強型亮白精華。",
      "傳明酸核心精華，支援膚色均勻與暗沉保養。",
      "高滲透質地清爽不黏膩，適合局部亮白需求。"
    ],
    suitableFor: [
      "美白淡斑",
      "斑點暗沉",
      "痘疤暗沉",
      "櫻の雪系列"
    ],
    usage: "化妝水後取適量均勻塗抹於臉部與頸部，再搭配同系列美白乳液。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
  },
  70: {
    cardName: "龍血求麗甦醒精油滾珠",
    cardSubtitle: "9mL・精油滾珠",
    spec: "9mL / 支",
    intro: "龍血系列隨身精油滾珠，適合日常香氛、肩頸放鬆感與隨身舒緩保養。",
    features: [
      "滾珠設計方便隨身使用。",
      "龍血系列香氣，適合日常放鬆與香氛保養。",
      "小容量好攜帶，可放包包或辦公桌備用。",
    ],
    suitableFor: [
      "精油滾珠",
      "龍血系列",
      "隨身香氛",
      "生活選品",
    ],
    usage: "取適量滾珠輕抹於手腕、耳後、肩頸等部位，避開眼周與傷口。",
    notice: "僅供外用。使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "牌價 $390；庫存與效期依 LINE 小幫手確認為準。",
  },
  71: {
    cardName: "薰衣草萬用精油滾珠",
    cardSubtitle: "9mL・精油滾珠",
    spec: "9mL / 支",
    intro: "薰衣草香氛精油滾珠，適合睡前放鬆、隨身舒緩與日常香氣保養。",
    features: [
      "薰衣草香氣，適合夜間與日常放鬆使用。",
      "滾珠設計方便局部塗抹，不易沾手。",
      "小容量好攜帶，適合隨身香氛保養。",
    ],
    suitableFor: [
      "薰衣草精油",
      "隨身滾珠",
      "睡前放鬆",
      "生活選品",
    ],
    usage: "取適量滾珠輕抹於手腕、耳後、肩頸等部位，避開眼周與傷口。",
    notice: "僅供外用。使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "牌價 $390；庫存與效期依 LINE 小幫手確認為準。",
  },
  72: {
    cardName: "絕美溫感變色護唇膏",
    cardSubtitle: "3.5g・護唇膏",
    spec: "3.5g / 支",
    intro: "溫感變色護唇膏，依唇溫呈現自然氣色，素顏也有柔嫩紅潤感。",
    features: [
      "依唇溫呈現自然顯色效果。",
      "兼具護唇滋潤與氣色修飾感。",
      "質地輕盈好塗抹，適合日常補擦。",
    ],
    suitableFor: [
      "護唇膏",
      "變色護唇",
      "保濕潤澤",
      "生活選品",
    ],
    usage: "日常感到雙唇乾燥或想提升氣色時，轉出適量護唇膏均勻塗抹於雙唇；可單獨使用或作為唇膏前打底。",
    notice: "請避免轉出過長以免折斷。使用後若有不適，請暫停使用。請放置於陰涼處，避免陽光直射與高溫。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單支 $290；護唇膏任選2條 $500。",
  },
  73: {
    cardName: "絕美保濕護唇膏",
    cardSubtitle: "3.5g・護唇膏",
    spec: "3.5g / 支",
    intro: "日常保濕護唇膏，滋潤乾燥雙唇，適合白天補擦或夜間厚敷保養。",
    features: [
      "滋潤乾燥、緊繃的雙唇。",
      "可日常補擦，也可睡前厚敷加強保養。",
      "溫和植萃保養感，維持柔嫩不緊繃。",
    ],
    suitableFor: [
      "護唇膏",
      "保濕護唇",
      "乾燥唇",
      "夜間厚敷",
    ],
    usage: "每日日常或感覺嘴唇乾燥時，適量塗抹於雙唇；夜間睡前可加量厚敷，作為夜間密集護唇保養。",
    notice: "請避免轉出過長以免折斷。使用後若有紅腫或不適，請暫停使用並視情況諮詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單支 $290；護唇膏任選2條 $500。",
  }
};

export const productContentOverridesV362: Record<number, Partial<Product>> = {
  51: {
    cardName: "石墨烯貼布自由配",
    cardSubtitle: "涼感／溫感自由搭配",
    spec: "任選 4 盒或任選 10 盒",
    intro: "涼感與溫感貼布整合為一張組合卡，先選優惠方案，再選實際搭配。",
    priceNote: "任選 4 盒 $1,099；任選 10 盒 $2,500。",
  },
  55: {
    cardName: "35片面膜自由配",
    cardSubtitle: "水搖滾／極光白自由搭配",
    spec: "任選 2 桶或任選 5 桶",
    intro: "水搖滾保濕面膜與極光白美白面膜可自由搭配，選定方案後再選各款數量。",
    features: [
      "任選 2 桶組合價 $1,100。",
      "任選 5 桶組合價 $2,750，加贈面膜 10 片。",
      "兩款可同款重複選，也可以自由混搭。",
    ],
    priceNote: "任選 2 桶 $1,100；任選 5 桶 $2,750，加贈面膜 10 片。",
  },
  67: {
    cardName: "香氛皂自由配",
    cardSubtitle: "薰衣草／玫瑰／艾草／檸檬自由搭配",
    spec: "200g±10g × 4 入",
    intro: "四款香氛皂可自由搭配，選滿 4 入後以組合價 $799 加入購物車。",
    features: [
      "龍血薰衣草舒緩皂、龍血玫瑰美膚皂、龍血艾草保庇皂與龍血檸檬馬鞭草皂可選。",
      "同款可重複選，也可以混搭。",
      "任選 4 入組合價 $799。",
    ],
    priceNote: "香氛皂任選 4 入 $799。",
  },
  68: {
    cardName: "櫻花美白三件組",
    cardSubtitle: "化妝水＋精華液＋乳液",
    spec: "化妝水150mL＋精華液30mL＋乳液100mL",
    intro: "櫻の雪傳明酸美白化妝水、精華液與乳液一次備齊，固定三件組 $1,780。",
    features: [
      "櫻の雪傳明酸美白化妝水 1 瓶。",
      "櫻の雪傳明酸美白精華液 1 瓶。",
      "櫻の雪傳明酸美白乳液 1 瓶。",
    ],
    priceNote: "固定三件組，組合價 $1,780。",
  },
  108: {
    cardName: "護手霜自由配",
    cardSubtitle: "買二送一・三款自由搭配",
    spec: "30g × 3 條",
    intro: "薰衣草舒緩、櫻之雪亮澤與茶樹防禦護手霜可自由搭配，共 3 條 $580。",
    priceNote: "買二送一，共 3 條 $580。",
  },
};


export const productContentOverridesV376: Record<number, Partial<Product>> = {
  2: {
    cardName: "EC晶眸葉黃素",
    cardSubtitle: "精華凍＋精華飲・雙劑型同配方",
    spec: "精華凍 20g x 10入＋精華飲 20mL x 10入 / 盒",
    intro: "精華凍與精華飲採用相同核心配方，依個人喜好選擇 Q 彈或飲用劑型，作為日常晶亮營養補給。",
    features: [
      "核心營養包含游離型葉黃素、玉米黃素、消旋玉米黃素、C3G 花青素與維生素 A。",
      "精華凍與精華飲成分配方相同，雙劑型更方便依日常情境補充。",
      "適合長時間使用 3C、學生與上班族作為日常營養補給。",
    ],
    suitableFor: ["3C 使用族群", "學生與上班族", "晶亮營養補給"],
    notice: "請依產品標示食用；若有特殊體質、孕哺乳或正在接受醫囑，建議先諮詢專業人員。",
  },
  3: {
    cardName: "亮妍魚膠原蛋白飲",
    cardSubtitle: "玫瑰風味・50mL x 10瓶",
    spec: "50mL x 10瓶 / 盒",
    intro: "玫瑰風味魚膠原蛋白飲，搭配小分子魚膠原蛋白肽與深海彈力相關營養成分，作為日常美容營養補給。",
    features: [
      "每瓶 50mL，每盒 10 瓶。",
      "每瓶含 10,000mg 膠原蛋白。",
      "玫瑰風味、減糖設計，方便日常補充。",
    ],
    suitableFor: ["美容營養補給", "膠原蛋白補充", "日常保養族群"],
  },
  9: {
    cardName: "龍血求麗化妝水",
    cardSubtitle: "120mL・龍血系列前導保濕",
    spec: "120mL / 瓶",
    intro: "以秘魯龍血樹脂萃取、玻尿酸與大馬士革玫瑰花水打造清爽前導保濕，適合乾燥、缺水或環境變化下的日常保養。",
    features: [
      "秘魯龍血樹脂萃取搭配玻尿酸，補充肌膚所需水分。",
      "大馬士革玫瑰花水帶來柔和保養感。",
      "清爽水感質地，不含酒精、香精與色素。",
    ],
    suitableFor: ["乾燥缺水", "日常前導保濕", "膚況調理"],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部與頸部，再銜接後續精華與乳液。",
  },
  10: {
    cardName: "龍血求麗修護乳",
    cardSubtitle: "80mL・清爽鎖水修護・買一送一",
    spec: "80mL / 瓶",
    intro: "以秘魯龍血樹脂萃取、角鯊烷與多重鎖水因子打造清爽好吸收的日常保濕乳液。",
    features: [
      "角鯊烷與多重鎖水因子協助維持油水平衡。",
      "質地清爽好推勻，適合台灣氣候下的日常保濕。",
      "幫助改善乾燥造成的粗糙與細紋外觀，維持柔滑膚觸。",
    ],
    suitableFor: ["乾燥缺水", "換季保養", "日常修護"],
  },
  11: {
    cardName: "肌光緊緻速妍雪膚液",
    cardSubtitle: "130mL・緊緻前導保養",
    spec: "130mL / 瓶",
    intro: "結合 LAC-J 嘉寶果精華、七胜肽與益菌平衡概念的高階前導保養，幫助維持細緻、彈潤與水嫩膚感。",
    features: ["LAC-J 嘉寶果精華搭配胜肽保養。", "作為肌光系列第一步前導，提升後續保養的完整度。", "適合熟齡、乾燥與疲憊膚況日常使用。"],
    suitableFor: ["抗皺緊緻", "熟齡保養", "乾燥疲憊肌"],
  },
  12: {
    cardName: "肌光緊緻速妍精華露",
    cardSubtitle: "35mL・高機能緊緻精華",
    spec: "35mL / 瓶",
    intro: "以 LAC-J 嘉寶果精華、複合胜肽與植物微囊概念打造的集中型精華，維持飽滿、彈潤與細緻膚感。",
    features: ["輕盈精華露質地，適合日常集中保養。", "搭配多重胜肽與植萃保養概念。", "針對乾燥細紋與鬆弛感外觀加強保養。"],
    suitableFor: ["抗皺緊緻", "熟齡保養", "熬夜疲憊肌"],
  },
  13: {
    cardName: "肌光緊緻速妍霜",
    cardSubtitle: "50g・滋潤緊緻封存保養",
    spec: "50g / 瓶",
    intro: "以 LAC-J 嘉寶果精華、神經醯胺與植物果油打造滋潤不厚重的最後一道保養，幫助維持柔嫩、彈潤與光澤。",
    features: ["神經醯胺與植物果油加強滋潤。", "適合作為晚間或乾燥季節的保養最後一步。", "維持細緻彈潤與柔嫩膚觸。"],
    suitableFor: ["抗皺緊緻", "乾燥缺水", "高級養護"],
  },
  14: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "23mL x 10入・集中型面膜保養",
    spec: "23mL x 10入 / 盒",
    intro: "肌光系列集中型面膜，適合熬夜後、重要場合前或想快速加強保濕彈潤感時使用。",
    features: ["每盒 10 入，每片 23mL。", "特殊服貼膜布承載精華，集中補充水分與潤澤。", "適合重要場合前與疲憊膚況加強保養。"],
    suitableFor: ["面膜保養", "抗皺緊緻", "重要場合前保養"],
    notice: "僅供一般肌膚保養使用；肌膚正處於醫療處置後或有傷口、不適時，請依專業醫療人員建議使用。",
  },
  26: {
    cardName: "青春密碼維 E 精萃油",
    cardSubtitle: "50mL・含基底油・可直接身體保養",
    spec: "50mL / 瓶",
    intro: "含基底植萃油的身體精萃油，結合維他命 E、神經醯胺Ⅲ與黃耆萃取，適合夜間滋養與全身按摩。",
    features: [
      "複方植萃油搭配維他命 E 與神經醯胺Ⅲ，提升乾燥肌膚的潤澤感。",
      "葡萄柚、佛手柑、快樂鼠尾草與天竺葵香氣，營造放鬆的夜間保養時光。",
      "適合胸部、腹部與全身按摩保養，使用方式依商品標示。",
    ],
    suitableFor: ["乾燥肌膚", "夜間滋養", "身體按摩"],
    usage: "取適量直接塗抹於身體肌膚並輕柔按摩至吸收；實際用量與部位請依商品標示。",
    notice: "本品為含基底油的身體精萃油，並非單方純精油。避免接觸眼睛與黏膜；使用後若有不適請停止使用。",
  },
  27: {
    cardName: "防護盾牌維 C 精萃油",
    cardSubtitle: "50mL・含基底油・透亮滋養",
    spec: "50mL / 瓶",
    intro: "含基底植萃油的身體精萃油，結合維他命 C、神經醯胺Ⅲ與黃耆萃取，適合粗糙乾燥肌膚的日常滋養。",
    features: [
      "複方植萃油搭配維他命 C 與神經醯胺Ⅲ，維持柔嫩與透亮膚感。",
      "檸檬、甜橙、迷迭香、羅文莎葉、茶樹與薄荷形成清新柑橘草本香氣。",
      "適合全身按摩與日常身體保養。",
    ],
    suitableFor: ["粗糙乾燥", "身體滋養", "透亮保養"],
    usage: "取適量直接塗抹於身體肌膚並輕柔按摩至吸收；實際用量與部位請依商品標示。",
    notice: "本品為含基底油的身體精萃油。含柑橘類精油成分，肌膚使用後請依商品標示留意日曬；使用後若有不適請停止使用。",
  },
  28: {
    cardName: "晚安無瑕維 A 精萃油",
    cardSubtitle: "50mL・含基底油・夜間細緻保養",
    spec: "50mL / 瓶",
    intro: "含基底植萃油的夜間身體精萃油，結合維他命 A、神經醯胺Ⅲ與黃耆萃取，適合熟齡與乾燥粗糙肌膚加強滋養。",
    features: ["維他命 A 搭配神經醯胺Ⅲ，作為夜間身體保養。", "複方植萃油提升滋潤度，維持細緻柔滑膚觸。", "舒壓香氣適合睡前按摩與 Me Time。"],
    suitableFor: ["夜間保養", "熟齡身體肌", "乾燥粗糙"],
    usage: "建議於晚間取適量塗抹身體肌膚並按摩至吸收；實際使用頻率請依商品標示。",
    notice: "本品含維他命 A 類成分；孕哺乳或有特殊使用需求者，建議先依商品標示或諮詢專業人員。使用後若有不適請停止使用。",
  },
  30: {
    cardName: "石墨烯電氣石精油貼布（涼感）",
    cardSubtitle: "10片 / 盒・清爽涼感",
    spec: "10片 / 盒",
    intro: "以石墨烯、電氣石、薄荷葉萃取、茶樹精油與一條根萃取物打造的涼感貼布，適合運動後或久坐久站時局部舒適保養。",
    features: ["清爽微涼感，適合肩頸、腰背與腿部等局部使用。", "大尺寸設計可依需求裁切。", "適合日常放鬆與運動後舒適保養。"],
    suitableFor: ["久坐久站", "運動後", "局部舒適保養"],
  },
  31: {
    cardName: "石墨烯電氣石精油貼布（溫感）",
    cardSubtitle: "10片 / 盒・溫熱舒適",
    spec: "10片 / 盒",
    intro: "以石墨烯、電氣石、左手香精油與辣椒萃取打造的溫感貼布，適合冷氣房、家事勞動後或久坐久站時局部舒適保養。",
    features: ["穩定溫熱感，適合腰背、肩頸與四肢局部使用。", "大尺寸設計可依需求裁切。", "適合日常放鬆與溫熱舒適保養。"],
    suitableFor: ["冷氣房", "久坐久站", "溫熱舒適保養"],
  },
  34: {
    cardName: "龍血玻尿酸保濕精華液",
    cardSubtitle: "300mL・大容量國民保濕精華・買一送一",
    spec: "300mL / 瓶",
    intro: "結合日本高純度玻尿酸、小分子玻尿酸、小核菌膠與祕魯龍血樹脂萃取的大容量保濕精華，臉部到身體皆可依需求使用。",
    features: ["大小分子玻尿酸提供多層次補水與鎖水概念。", "小核菌膠搭配龍血樹脂萃取，維持柔嫩與潤澤膚感。", "300mL 大容量，適合全身乾燥部位日常保濕。"],
    suitableFor: ["乾燥缺水", "全身保濕", "疲憊粗糙肌"],
    priceNote: "300mL，$1,980 買一送一；不顯示原價。實際活動與庫存依賣場顯示為準。",
  },
  35: {
    cardName: "龍血求麗卸妝油",
    cardSubtitle: "150mL・快速乳化卸妝",
    spec: "150mL / 瓶",
    intro: "結合秘魯龍血樹脂、多重植物油基底與快樂鼠尾草、尤加利等香氣的卸妝油，幫助卸除彩妝與防曬。",
    features: ["遇水快速乳化，減少洗後油悶殘留感。", "適合日常彩妝與防曬卸除。", "植物油基底在清潔同時維持柔潤膚感。"],
    suitableFor: ["清潔卸妝", "日常彩妝", "防曬卸除"],
  },
  36: {
    cardName: "龍血求麗潔顏慕絲",
    cardSubtitle: "150mL・胺基酸系綿密泡沫",
    spec: "150mL / 瓶",
    intro: "以秘魯龍血樹脂萃取、胺基酸潔顏因子與尤加利、快樂鼠尾草香氣打造的綿密潔顏慕絲。",
    features: ["直接按壓出綿密泡沫，減少清潔時的摩擦。", "胺基酸系潔顏概念，洗後維持舒適不緊繃。", "適合作為早晚日常臉部清潔。"],
    suitableFor: ["清潔卸妝", "日常潔顏", "乾燥缺水"],
  },
  41: {
    cardName: "水光肌能晚霜",
    cardSubtitle: "50g・夜間密集保濕",
    spec: "50g / 瓶",
    intro: "結合復活草保濕複合物、神經醯胺、三色堇萃取與膠原相關保養概念，適合夜間加強補水與鎖水。",
    features: ["夜間集中滋潤，維持柔嫩澎潤。", "神經醯胺搭配復活草保濕概念，加強乾燥肌膚保養。", "適合作為晚間保養最後一道。"],
    suitableFor: ["乾燥缺水", "夜間保養", "抗皺緊緻"],
  },
  72: {
    cardName: "絕美溫感變色護唇膏",
    cardSubtitle: "3.3g・新品預告",
    spec: "3.3g / 支",
    intro: "以野芒果脂、蘭花萃取、向日葵油、天然維他命 E 與橄欖油滋潤雙唇，依唇溫與唇部狀態呈現自然色澤。",
    features: ["兼具日常滋潤與自然氣色修飾。", "質地滑順不厚重，適合隨身補擦。", "磁吸外殼設計，日常攜帶方便。"],
    suitableFor: ["乾燥雙唇", "自然氣色", "日常護唇"],
    priceNote: "新品預告・敬請期待。",
  },
  73: {
    cardName: "絕美保濕護唇膏",
    cardSubtitle: "3.3g・新品預告",
    spec: "3.3g / 支",
    intro: "以乳油木果脂、植物保濕因子、維他命 E 與植物滋養油提供日常潤澤，適合白天補擦與夜間厚敷。",
    features: ["不變色，專注日常保濕滋潤。", "可於妝前打底或睡前加強厚敷。", "維持柔嫩膚觸並改善乾燥緊繃感。"],
    suitableFor: ["乾燥雙唇", "夜間厚敷", "妝前護唇"],
    priceNote: "新品預告・敬請期待。",
  },
  74: {
    cardName: "甜橙單方精油",
    cardSubtitle: "30mL・100% 單方純精油・柑橘果香",
    spec: "30mL / 瓶",
    intro: "100% 甜橙單方純精油，帶有溫暖明亮的甜橙果香，適合客廳、工作空間與日常居家擴香。",
    features: ["單一植物來源的甜橙純精油。", "香氣甜美明亮，適合營造愉悅、放鬆的空間氛圍。", "可依產品標示搭配擴香設備，肌膚使用前需以適合的基底油稀釋。"],
    suitableFor: ["柑橘果香", "白天清新", "擴香入門"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。避免接觸眼睛與黏膜；使用後若有不適請停止使用。",
  },
  75: {
    cardName: "尤加利單方精油",
    cardSubtitle: "30mL・100% 單方純精油・草本清新",
    spec: "30mL / 瓶",
    intro: "100% 尤加利單方純精油，帶有清新通透的木質草本香氣，適合居家與工作空間擴香。",
    features: ["單一植物來源的尤加利純精油。", "清爽具穿透力的草本香氣，提升空間清新感。", "可依產品標示搭配擴香設備，肌膚使用前需以適合的基底油稀釋。"],
    suitableFor: ["草本清新", "白天清新", "居家擴香"],
    usage: "建議依產品標示用於擴香；如需製作環境噴霧或其他用途，請依產品標示與安全比例使用。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。避免接觸眼睛與黏膜；使用後若有不適請停止使用。",
  },
  78: {
    cardName: "薰衣草單方精油",
    cardSubtitle: "10mL・100% 單方純精油・柔和花草香",
    spec: "10mL / 瓶",
    intro: "100% 真正薰衣草單方純精油，帶有柔和草本花香，適合睡前與居家放鬆時的香氛儀式。",
    features: ["單一植物來源的真正薰衣草純精油。", "柔和花草香氣，營造沉靜放鬆的空間氛圍。", "可依產品標示搭配擴香，或以基底油充分稀釋後用於身體按摩。"],
    suitableFor: ["花香柔和", "居家放鬆", "睡前香氛"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。避免接觸眼睛與黏膜。",
  },
  79: {
    cardName: "佐登妮絲五號精油",
    cardSubtitle: "10mL・複方純精油・柔美女性香調",
    spec: "10mL / 瓶",
    intro: "以快樂鼠尾草、天竺葵、依蘭依蘭與絲柏調和的複方純精油，呈現濃郁柔美的花草木質香氣。",
    features: ["四款經典植物精油調和，香氣柔美有層次。", "適合擴香營造放鬆氛圍。", "身體按摩使用時需先以適合的基底油充分稀釋。"],
    suitableFor: ["花香柔和", "居家放鬆", "身體按摩香氛"],
    usage: "可依產品標示用於擴香；身體按摩前需以適合的基底油稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。",
  },
  80: {
    cardName: "呼暢護隨精油",
    cardSubtitle: "30mL・複方純精油・草本柑橘清新",
    spec: "30mL / 瓶",
    intro: "以天竺葵、檸檬與尤加利調和的複方純精油，草本與柑橘香氣交織，適合日常空間擴香與清新香氛。",
    features: ["天竺葵、檸檬與尤加利三種香氣調和。", "適合擴香石、擴香設備與隨身香氛配件使用。", "相關產學合作與期刊研究資訊待佐證資料確認後再於公開頁面呈現。"],
    suitableFor: ["草本清新", "白天清新", "空間香氛"],
    usage: "建議依產品標示用於擴香或香氛配件；其他用途請依產品標示與安全比例使用。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  81: {
    cardName: "佐登妮絲十二號複方精油（OMA律動精油）",
    cardSubtitle: "10mL・複方純精油・溫暖草本木質",
    spec: "10mL / 瓶",
    intro: "以葡萄柚、馬喬蘭、尤加利、薑、廣藿香與迷迭香調和，呈現溫暖草本木質香氣。",
    features: ["加入薑精油，香氣溫暖厚實。", "適合擴香營造舒適、沉靜的空間氛圍。", "身體按摩使用時需先以適合的基底油充分稀釋。"],
    suitableFor: ["溫暖香調", "居家放鬆", "草本木質"],
    usage: "可依產品標示用於擴香；身體按摩前需以適合的基底油稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。",
  },
  82: {
    cardName: "快樂鼠尾草單方精油",
    cardSubtitle: "10mL・100% 單方純精油・沉靜草本",
    spec: "10mL / 瓶",
    intro: "100% 快樂鼠尾草單方純精油，帶有微甜、堅果與藥草氣息，適合打造沉靜放鬆的 Me Time。",
    features: ["單一植物來源的快樂鼠尾草純精油。", "香氣溫暖沉穩，適合夜間與個人放鬆時光。", "可依產品標示用於擴香，或稀釋後搭配身體按摩。"],
    suitableFor: ["居家放鬆", "沉靜香氣", "Me Time"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。孕哺乳或有特殊使用需求者請依產品標示並先諮詢專業人員。",
  },
  83: {
    cardName: "魔力輕盈精油",
    cardSubtitle: "30mL・複方純精油・清爽木質草本",
    spec: "30mL / 瓶",
    intro: "以杜松莓、葡萄柚、絲柏與迷迭香調和的複方純精油，清爽微帶木質感，適合搭配身體按摩香氛。",
    features: ["杜松莓、葡萄柚、絲柏與迷迭香四種香氣調和。", "適合洗澡後搭配基底油稀釋，用於四肢與身體按摩。", "也可依產品標示用於擴香。"],
    suitableFor: ["身體按摩香氛", "清爽木質", "久坐久站後放鬆"],
    usage: "身體按摩前需先以適合的基底油充分稀釋；亦可依產品標示用於擴香。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含葡萄柚精油，肌膚使用時請依產品標示留意日曬。",
  },
  84: {
    cardName: "柚見快樂精油",
    cardSubtitle: "15mL・複方純精油・明亮柑橘果香",
    spec: "15mL / 瓶",
    intro: "以葡萄柚、甜橙與山雞椒調和的複方純精油，帶來明亮多汁的柑橘香氣。",
    features: ["葡萄柚與甜橙形成甜美果香。", "山雞椒增添清新檸檬調，讓香氣更有層次。", "適合客廳、工作空間與白天擴香。"],
    suitableFor: ["柑橘果香", "白天清新", "愉悅空間香氛"],
    usage: "建議依產品標示用於擴香；肌膚使用前需以適合的基底油充分稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  85: {
    cardName: "佐登妮絲四號複方精油",
    cardSubtitle: "10mL・複方純精油・清新提振",
    spec: "10mL / 瓶",
    intro: "以迷迭香、薄荷與檸檬等精油調和，呈現清新有穿透力的草本柑橘香氣。",
    features: ["迷迭香、薄荷與檸檬形成清爽醒目的香氣層次。", "適合工作、閱讀或需要轉換空間氣氛時擴香。", "肌膚使用前需以適合的基底油充分稀釋。"],
    suitableFor: ["白天清新", "工作閱讀", "草本柑橘"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  86: {
    cardName: "佐登妮絲一號複方精油",
    cardSubtitle: "10mL・複方純精油・經典放鬆",
    spec: "10mL / 瓶",
    intro: "以佛手柑、羅文莎葉、薰衣草與尤加利調和的經典複方純精油，適合營造柔和、沉靜的放鬆氛圍。",
    features: ["佛手柑與薰衣草帶來柔和香氣。", "羅文莎葉與尤加利增添清新草本層次。", "適合居家與 SPA 香氛儀式使用。"],
    suitableFor: ["居家放鬆", "沉靜香氣", "SPA 香氛"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含佛手柑等柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  96: {
    cardName: "檸檬單方精油",
    cardSubtitle: "10mL・100% 單方純精油・明亮果香",
    spec: "10mL / 瓶",
    intro: "100% 檸檬單方純精油，帶有如現切檸檬般的明亮清新果香，適合工作空間與居家擴香。",
    features: ["單一植物來源的檸檬純精油。", "果香清新明亮，適合提升空間清爽感。", "可依產品標示用於擴香或居家香氛。"],
    suitableFor: ["柑橘果香", "白天清新", "工作閱讀"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  97: {
    cardName: "茶樹單方精油",
    cardSubtitle: "15mL・100% 單方純精油・清新潔淨感",
    spec: "15mL / 瓶",
    intro: "100% 澳洲茶樹單方純精油，氣味清新略帶辛香，適合居家空間香氛與清新潔淨感的日常使用。",
    features: ["單一植物來源的澳洲茶樹純精油。", "清新草本辛香，適合居家擴香與空間香氛。", "如需加入洗沐或其他產品，請依商品標示與安全比例使用。"],
    suitableFor: ["草本清新", "居家香氛", "潔淨感"],
    usage: "建議依產品標示用於擴香；其他用途需依產品標示與安全比例使用。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
  },
  98: {
    cardName: "天竺葵芳香精油",
    cardSubtitle: "10mL・100% 單方純精油・玫瑰草本香",
    spec: "10mL / 瓶",
    intro: "100% 天竺葵單方純精油，帶有草本與玫瑰般甜美香氣，適合居家放鬆與女性偏好的柔和花香氛圍。",
    features: ["單一植物來源的天竺葵純精油。", "草本與玫瑰調交織，香氣柔美有層次。", "可依產品標示用於擴香，或充分稀釋後搭配身體保養。"],
    suitableFor: ["花香柔和", "居家放鬆", "女性香氛"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為單方純精油，不可直接大面積塗抹肌膚。",
  },
  99: {
    cardName: "佐登妮絲六號複方精油（橙花複方）",
    cardSubtitle: "10mL・複方純精油・橙花高階香調",
    spec: "10mL / 瓶",
    intro: "以橙花、苦橙葉、甜橙與佛手柑調和，呈現細緻花香與果香交織的高階複方香氣。",
    features: ["橙花與苦橙葉帶來細緻花香與綠意。", "甜橙與佛手柑增加明亮柔和的果香層次。", "適合晚間、個人獨處與居家放鬆時擴香。"],
    suitableFor: ["花香柔和", "柑橘果香", "居家放鬆"],
    usage: "建議依產品標示用於擴香；肌膚使用前需先以適合的基底油充分稀釋。",
    notice: "本品為複方純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分，肌膚使用時請依產品標示留意日曬。",
  },
  101: {
    cardName: "刮痧板 2入",
    cardSubtitle: "居家按摩輔助工具・2入",
    spec: "2入組",
    intro: "圓潤多弧度設計的居家按摩輔助工具，可搭配身體保養油使用，適合臉部輪廓、下巴與四肢等部位輕柔按摩。",
    features: ["圓滑厚實邊緣，便於握持與操作。", "多弧度設計可貼合不同身體曲線。", "適合搭配按摩油或身體保養油使用。"],
    notice: "請避免於傷口、發炎或明顯不適部位使用；按摩力道以舒適為原則。",
  },
  102: {
    cardName: "溫灸棒－特大",
    cardSubtitle: "大尺寸・全身溫熱舒適保養",
    spec: "特大尺寸 / 1支",
    intro: "大尺寸溫灸輔助工具，適合腰背、腹部與大面積身體部位的居家溫熱舒適保養。",
    features: ["導熱材質搭配大號艾草條使用。", "滾動式設計便於大面積移動操作。", "適合居家放鬆與溫熱保養。"],
    notice: "使用時請依商品標示控制溫度與距離，避免燙傷；孕期、特殊體質或對熱敏感者請先諮詢專業人員。",
  },
  103: {
    cardName: "溫灸棒－小",
    cardSubtitle: "小尺寸・局部溫熱舒適保養",
    spec: "小尺寸 / 1支",
    intro: "小巧便攜的溫灸輔助工具，適合肩頸、四肢關節周邊等較小部位的居家溫熱舒適保養。",
    features: ["小巧好握，便於局部操作。", "可搭配小規格艾草條使用。", "適合需要較精準位置的日常溫熱保養。"],
    notice: "使用時請依商品標示控制溫度與距離，避免燙傷；臉部與眼周等敏感區域不建議自行高溫使用。",
  },
  104: {
    cardName: "艾草條－小",
    cardSubtitle: "搭配小號溫灸棒",
    spec: "小規格艾草條",
    intro: "以艾絨為主要原料的小規格艾草條，適合搭配小號溫灸棒使用。",
    features: ["小規格設計，搭配對應溫灸棒。", "燃燒時間與熱感依實際使用環境而異。", "適合居家溫熱舒適保養。"],
    notice: "燃燒使用時請保持通風並遠離易燃物；使用後確認完全熄滅。請放置於孩童與寵物不易取得處。",
    expiryNote: "",
  },
  105: {
    cardName: "艾草條－特大",
    cardSubtitle: "搭配特大號溫灸棒",
    spec: "特大規格艾草條",
    intro: "大直徑艾草條，適合搭配特大號溫灸棒使用，提供較長時間的大面積溫熱舒適保養。",
    features: ["大規格設計，搭配對應特大號溫灸棒。", "燃燒時間較長，適合大面積身體部位。", "適合居家溫熱舒適保養。"],
    notice: "燃燒使用時請保持通風並遠離易燃物；使用後確認完全熄滅。請放置於孩童與寵物不易取得處。",
    expiryNote: "",
  },
  106: {
    cardName: "如意棒",
    cardSubtitle: "多功能按摩舒壓工具",
    spec: "1支",
    intro: "流線型多功能按摩工具，圓珠與弧面設計便於日常按壓、刮拭與身體放鬆保養。",
    features: ["多弧度結構可配合不同部位使用。", "圓潤接觸面便於控制力道。", "適合搭配身體保養油進行居家按摩。"],
    notice: "請避免於傷口、發炎或明顯不適部位使用；按摩力道以舒適為原則。",
  },
  107: {
    cardName: "升級版柔筋棒（小）",
    cardSubtitle: "小尺寸・局部按摩放鬆",
    spec: "小尺寸 / 1支",
    intro: "小尺寸按摩棒，圓潤頭部設計便於肩頸、手足與四肢等局部位置進行日常按壓放鬆。",
    features: ["握感好控制，方便居家使用。", "圓潤接觸面便於局部施力。", "適合久坐久站後的日常按摩放鬆。"],
    notice: "請避免於傷口、發炎或明顯不適部位使用；若有持續疼痛或不適，請尋求專業評估。",
  },
  109: {
    cardName: "EC晶眸葉黃素精華凍 20包",
    cardSubtitle: "20包・與精華飲同核心配方",
    spec: "20包 / 盒",
    intro: "葉黃素精華凍以游離型葉黃素、玉米黃素、消旋玉米黃素、C3G 花青素與維生素 A 等作為核心營養，配方方向與精華飲相同。",
    features: ["Q 彈精華凍劑型，方便攜帶。", "與 EC 晶眸精華飲採用相同核心成分配方。", "適合作為日常晶亮營養補給。"],
    suitableFor: ["3C 使用族群", "學生與上班族", "晶亮營養補給"],
  },
  110: {
    cardName: "超防禦清透隔離乳 SPF50+",
    cardSubtitle: "30mL・SPF50+・清透防曬隔離",
    spec: "30mL / 瓶",
    intro: "油感較低的清透隔離乳，結合防曬與自然修飾概念，適合日常外出與底妝前使用。",
    features: ["SPF50+ 日常防曬。", "清透質地，適合妝前打底。", "搭配自然修飾膚色的隔離概念。"],
    suitableFor: ["防曬隔離", "妝前打底", "日常外出"],
    notice: "防曬效果與補擦頻率請依商品標示；長時間戶外活動建議搭配遮陽並適時補擦。",
  },
  111: {
    cardName: "玫瑰超微晶萃精華油",
    cardSubtitle: "30mL・高階滋養精華油",
    spec: "30mL / 瓶",
    intro: "玫瑰超微晶萃系列滋養型精華油，結合玫瑰相關植萃與滋養油相，適合乾燥、缺水與想提升柔嫩光澤感的膚況。",
    features: ["滋養油相質地，加強乾燥肌膚潤澤。", "適合晚間或乾燥季節加強保養。", "可依膚況搭配同系列活膚液與瞬效霜。"],
    suitableFor: ["乾燥缺水", "高級養護", "滋養光澤"],
  },
  120: {
    cardName: "龍血求麗精華液＋肌可佳膠原蛋白彈潤原液",
    cardSubtitle: "30mL＋30mL・限定雙精華組合",
    spec: "龍血求麗精華液 30mL ＋ 肌可佳膠原蛋白彈潤原液 30mL",
    intro: "龍血求麗精華液搭配肌可佳膠原蛋白彈潤原液的限定雙精華組合，適合日常加強保濕、柔嫩與彈潤感保養。",
    features: [
      "龍血求麗精華液 30mL，作為龍血系列集中型精華保養。",
      "肌可佳膠原蛋白彈潤原液 30mL，適合加強澎潤、保濕與肌膚彈性感。",
      "兩款精華固定搭配，組合價 $1,290；龍血求麗精華液目前不提供單買。",
    ],
    suitableFor: ["龍血系列", "乾燥缺水", "彈潤保養", "限定組合"],
    usage: "可依個人保養習慣分別使用；化妝水後取適量精華均勻塗抹於臉部與頸部，再銜接乳液或乳霜。",
    notice: "使用後若有不適請停止使用；避免接觸眼睛與黏膜。實際庫存與效期依賣場顯示或 LINE 小幫手確認為準。",
    expiryNote: "龍血求麗精華液效期：2026年12月；實際日期依商品包裝或 LINE 小幫手確認為準。",
    priceNote: "限定組合價 $1,290。龍血求麗精華液目前不提供單買，需搭配肌可佳膠原蛋白彈潤原液 30mL。",
  },
  121: {
    cardName: "龍血求麗修護霜",
    cardSubtitle: "35mL・龍血系列・第二件5折",
    spec: "35mL / 瓶",
    intro: "龍血系列滋潤型修護霜，適合作為保養最後一道，加強日常保濕、柔嫩與修護感。",
    features: [
      "滋潤型霜體，適合作為保養最後一道加強鎖水與柔嫩感。",
      "正式歸入臉部保養的龍血系列，同時可從保濕修護與高級養護找到。",
      "單瓶 $1,190；第二件 5 折；2 瓶優惠價 $1,785。",
    ],
    suitableFor: ["龍血系列", "乾燥缺水", "保濕修護", "高級養護"],
    usage: "化妝水、精華與乳液後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適請停止使用；避免接觸眼睛與黏膜。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單瓶 $1,190；第二件 5 折；2 瓶優惠價 $1,785。",
  },
};

export const productContentOverridesV377: Record<number, Partial<Product>> = {
  87: {
    cardName: "七序精油－智慧之冠",
    cardSubtitle: "靜心沉澱｜清晰思緒｜專注香氛",
    spec: "10mL / 瓶",
    intro: "七序精油系列中偏沉靜專注的香氣，適合需要安靜整理思緒、閱讀工作或靜心時作為空間擴香。",
    features: [
      "以沉澱思緒、澄淨心靈與專注感為香氛主題。",
      "適合靜心冥想、閱讀工作或高壓決策前後的空間擴香。",
      "在思緒繁雜時，以沉靜香氣協助切換到更平穩的生活節奏。",
    ],
    suitableFor: ["靜心冥想", "工作專注", "閱讀時光", "思緒沉澱"],
    usage: "建議依產品標示搭配擴香設備或擴香配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
    expandedInfo: [
      { title: "產品特色", content: "沉澱思緒、澄淨心靈，以深度專注與清晰感為香氛概念。" },
      { title: "推薦情境", content: "適合靜心冥想、高壓決策、閱讀工作，或思緒較為雜亂時作為空間擴香使用。" },
      { title: "香氛定位", content: "沉靜、清晰、專注，是需要安靜切換節奏時的七序香氣選擇。" },
    ],
  },
  91: {
    cardName: "七序精油－亮采",
    cardSubtitle: "靈感覺察｜清新思緒｜明亮香氛",
    spec: "10mL / 瓶",
    intro: "七序精油系列中偏明亮清新的香氣，適合長時間工作、使用 3C 或需要創作靈感時擴香，營造有精神的空間氛圍。",
    features: [
      "以靈感、覺察與清新思緒為香氛主題。",
      "適合長時間使用 3C、挑燈工作或創作卡關時使用。",
      "明亮清新的香氛定位，幫助空間轉換為更有精神的工作節奏。",
    ],
    suitableFor: ["工作創作", "3C 使用族群", "清新思緒", "靈感時光"],
    usage: "建議依產品標示搭配擴香設備或擴香配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
    expandedInfo: [
      { title: "產品特色", content: "以激發工作與創作靈感、舒展疲憊感與提升覺察力為香氛概念。" },
      { title: "推薦情境", content: "適合長時間使用 3C、夜間工作、讀書或創作遇到瓶頸時薰香，營造清新有精神的空間氛圍。" },
      { title: "香氛定位", content: "明亮、清新、有精神，適合工作桌、書房與創作空間。" },
    ],
  },
  93: {
    cardName: "七序精油－呼暢護隨",
    cardSubtitle: "草本清新｜空間香氛｜明星人氣款",
    spec: "10mL / 瓶",
    intro: "七序精油系列中的明星人氣香氣，以清新具有穿透感的草本氣息為特色，適合日常空間擴香與清新香氛。",
    features: [
      "草本與柑橘香氣交織，呈現清新、開闊的香氛感受。",
      "適合居家、工作空間與車內擴香。",
      "依品牌提供資料，本系列呼暢護隨配方曾與國立中興大學進行產學合作研究。",
    ],
    suitableFor: ["草本清新", "空間香氛", "居家擴香", "明星人氣款"],
    usage: "建議依產品標示搭配擴香設備、擴香石或香氛配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免直接接觸眼睛、黏膜與敏感部位。具體獎項資訊待正式佐證資料確認後再於公開頁面標示。",
    expandedInfo: [
      { title: "產品特色", content: "清新具有穿透感的草本香氣，以開闊、清爽與日常空間香氛為核心，是七序系列中的明星人氣香氣。" },
      { title: "中興大學產學合作", content: "依品牌提供資料，呼暢護隨精油曾與國立中興大學進行產學合作；中興大學森林系團隊從約 60 種植物素材中進行研究與篩選，發展草本香氛配方。" },
      { title: "配方香氣亮點", content: "品牌資料提及天竺葵、檸檬與尤加利等植物精油，呈現草本與柑橘交織的清新香氣。" },
      { title: "推薦情境", content: "適合居家、工作空間、車內或隨身香氛配件使用，營造清新舒適的空間感。" },
    ],
  },
  92: {
    cardName: "七序精油－心之綻放",
    cardSubtitle: "溫暖花香｜情緒沉澱｜睡前放鬆",
    spec: "10mL / 瓶",
    intro: "以溫暖花香與和諧木質調為核心，適合壓力較大、想安靜沉澱或睡前放鬆時擴香，營造柔和有包覆感的空間氣息。",
    features: [
      "溫暖花香與木質調交織，營造柔和、有包覆感的空間氣息。",
      "適合忙碌後獨處、睡前或需要切換情緒節奏時使用。",
      "以和緩、溫柔與身心放鬆為主要香氛定位。",
    ],
    suitableFor: ["花香木質", "居家放鬆", "睡前香氛", "獨處時光"],
    usage: "建議依產品標示搭配擴香設備或擴香配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
    expandedInfo: [
      { title: "產品特色", content: "以和緩情緒起伏與身心和諧為香氛概念，帶有溫暖花香與和諧木質調。" },
      { title: "推薦情境", content: "適合感到壓力、想沉澱獨處或睡前使用，讓空間多一點柔和與被包覆的氛圍。" },
      { title: "香氛定位", content: "溫暖、柔和、安靜，適合晚間與居家休息時使用。" },
    ],
  },
  90: {
    cardName: "七序精油－順暢平衡",
    cardSubtitle: "清新舒展｜日常薰香｜身心平衡",
    spec: "10mL / 瓶",
    intro: "以清新舒展與身心平衡為核心，適合生活步調緊湊或久坐後想切換節奏時使用，作為日常環境薰香選擇。",
    features: [
      "香氣層次清新，營造舒展、放鬆的空間感受。",
      "適合日常環境薰香，陪伴久坐工作與忙碌生活後的轉場時刻。",
      "品牌資料提及杜松子、馬鬱蘭、迷迭香與薄荷等植物香氣。",
    ],
    suitableFor: ["日常薰香", "清新舒展", "忙碌生活", "久坐工作"],
    usage: "建議依產品標示搭配擴香設備或擴香配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
    expandedInfo: [
      { title: "產品特色", content: "專為生活步調緊湊與久坐族群打造的清新香氛概念，以舒展與身心平衡為主軸。" },
      { title: "主要香氣", content: "品牌資料提及杜松子、馬鬱蘭、迷迭香與薄荷，呈現清新、有層次的草本調。" },
      { title: "推薦情境", content: "適合日常環境薰香、久坐工作後或需要重新整理生活節奏時使用。" },
    ],
  },
  88: {
    cardName: "七序精油－魔力輕盈",
    cardSubtitle: "輕盈香氛｜活力調性｜稀釋按摩",
    spec: "10mL / 瓶",
    intro: "以輕盈、活力與身體線條保養為品牌概念，適合久坐久站後搭配香氛或充分稀釋後按摩使用。",
    features: [
      "品牌配方概念以杜松莓、葡萄柚等明星植物香氣為特色。",
      "適合久坐久站後的放鬆時刻，營造清爽有活力的香氛氛圍。",
      "身體按摩使用前需先以適合的基底油充分稀釋。",
    ],
    suitableFor: ["輕盈香氛", "久坐久站後放鬆", "身體按摩香氛", "活力調性"],
    usage: "可依產品標示用於擴香；身體按摩前需先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。含柑橘類精油成分時，肌膚使用請依商品標示留意日曬。",
    expandedInfo: [
      { title: "產品特色", content: "品牌以揮別沉重水悶感、注入活力與身體線條保養作為產品概念。" },
      { title: "香氣亮點", content: "品牌資料提及杜松莓、葡萄柚等明星植物香氣，呈現清爽、有活力的調性。" },
      { title: "推薦情境", content: "適合久坐或久站後，以擴香營造輕盈氛圍；身體按摩時請先以基底油充分稀釋。" },
    ],
  },
  89: {
    cardName: "七序精油－能量之源",
    cardSubtitle: "木質大地｜沉穩安定｜溫暖香氣",
    spec: "10mL / 瓶",
    intro: "以厚實木質與大地調營造沉穩、溫暖與踏實感，適合疲憊、晚間放鬆或想讓生活節奏慢下來時使用。",
    features: [
      "醇厚木質大地香調，營造溫暖而穩定的空間氣息。",
      "適合忙碌一天後、感到疲憊或想讓身心慢下來時擴香。",
      "以沉穩、踏實與包覆感作為主要香氛定位。",
    ],
    suitableFor: ["木質大地", "溫暖沉穩", "晚間放鬆", "安靜時光"],
    usage: "建議依產品標示搭配擴香設備或擴香配件使用；如需接觸肌膚，請先以適合的基底油充分稀釋。",
    notice: "本品為純精油，不可直接大面積塗抹肌膚。避免接觸眼睛、黏膜與敏感部位。",
    expandedInfo: [
      { title: "產品特色", content: "以溫暖、沉穩與內在安定感為香氛概念，帶有醇厚穩定的木質大地調。" },
      { title: "推薦情境", content: "適合忙碌或疲憊後、夜間放鬆與想營造溫暖安定空間氛圍時使用。" },
      { title: "香氛定位", content: "厚實木質、大地氣息與溫暖包覆感，適合晚間使用。" },
    ],
  },
};

export const skinFilters = [
  "全部",
  "乾燥缺水",
  "油性毛孔",
  "敏感舒緩",
  "美白淡斑",
  "抗皺緊緻",
  "清潔卸妝",
  "面膜保養",
  "男士保養",
] as const;

export type SkinFilter = (typeof skinFilters)[number];

export const comboProductIds = new Set<number>([
  1, 10, 51, 54, 55, 56, 58, 59, 67, 68, 69, 100, 108, 112, 119, 120,
]);

export const expiringProductIds = new Set<number>([38, 74]);

export const expiryNotesV315: Record<number, string> = {
  1: "高鈣益生菌效期：2027.10.14；蔓越莓益生菌效期：2028.01.03。實際效期以商品包裝標示為準。",
  2: "晶眸葉黃素精華凍效期：2027.04.28；晶眸葉黃素綜合莓果口味效期：2027.05.05。實際效期以商品包裝標示為準。",
  3: "效期：2028.03.08。實際效期以商品包裝標示為準。",
  4: "效期：2028.03.09。實際效期以商品包裝標示為準。",
  5: "效期：2028.03.09。實際效期以商品包裝標示為準。",
  6: "效期：2028.03.24。實際效期以商品包裝標示為準。",
  7: "效期：2029.06.13。實際效期以商品包裝標示為準。",
  8: "效期：2029.05.19。實際效期以商品包裝標示為準。",
  9: "效期：2029.01.26。實際效期以商品包裝標示為準。",
  10: "效期：2027.03.04。實際效期以商品包裝標示為準。",
  11: "效期：2028.02.05。實際效期以商品包裝標示為準。",
  12: "效期：2028.01.12。實際效期以商品包裝標示為準。",
  13: "效期：2029.01.03。實際效期以商品包裝標示為準。",
  14: "效期：2028.03.09。實際效期以商品包裝標示為準。",
  15: "效期：2029.04.21。實際效期以商品包裝標示為準。",
  16: "效期：2029.03.29。實際效期以商品包裝標示為準。",
  17: "效期：2027.07.26。實際效期以商品包裝標示為準。",
  18: "效期：2029.04.22。實際效期以商品包裝標示為準。",
  19: "效期：2028.07.17。實際效期以商品包裝標示為準。",
  20: "效期：2029.05.21。實際效期以商品包裝標示為準。",
  22: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  23: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  24: "效期：2029.05.21。實際效期以商品包裝標示為準。",
  25: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  26: "效期：2029.02.28。實際效期以商品包裝標示為準。",
  27: "效期：2029.03.07。實際效期以商品包裝標示為準。",
  28: "效期：2029.05.25。實際效期以商品包裝標示為準。",
  30: "效期：2031.04.26。實際效期以商品包裝標示為準。",
  31: "效期：2031.04.26。實際效期以商品包裝標示為準。",
  32: "效期：2028.07.07。實際效期以商品包裝標示為準。",
  33: "效期：2028.03.15。實際效期以商品包裝標示為準。",
  34: "效期：2029.06.04。實際效期以商品包裝標示為準。",
  35: "效期：2029.06.08。實際效期以商品包裝標示為準。",
  36: "效期：2029.06.08。實際效期以商品包裝標示為準。",
  37: "效期：2027.06.10。實際效期以商品包裝標示為準。",
  38: "效期：2026.11.02。限量優惠品項，建議確認可於效期內使用後再加入購物車。",
  39: "效期：2027.04.22。實際效期以商品包裝標示為準。",
  40: "效期：2029.03.15。實際效期以商品包裝標示為準。",
  41: "效期之後更新，實際效期以商品包裝標示或 LINE 小幫手確認為準。",
  42: "效期：2029.03.08。實際效期以商品包裝標示為準。",
  43: "效期：2029.03.17。實際效期以商品包裝標示為準。",
  44: "效期：2027.11.26。實際效期以商品包裝標示為準。",
  45: "效期：2028.11.09。實際效期以商品包裝標示為準。",
  47: "效期：2029.02.03。實際效期以商品包裝標示為準。",
  50: "效期：2029.05.26。實際效期以商品包裝標示為準。",
  114: "效期：2028.10.16。實際效期以商品包裝標示為準。",
  115: "效期：2029.05.26。實際效期以商品包裝標示為準。",
  116: "效期：2029.05.26。實際效期以商品包裝標示為準。",
  51: "涼感 / 溫感貼布效期：2031.04.26。實際效期以商品包裝標示為準。",
  52: "涼感 / 溫感貼布效期：2031.04.26。實際效期以商品包裝標示為準。",
  54: "龍血牙膏效期：2028.07.17；薰衣草牙膏效期：2029.04.22。實際效期以商品包裝標示為準。",
  55: "水搖滾桶裝效期：2026.11.02；極光白桶裝效期：2027.04.22。實際效期以商品包裝標示為準。",
  57: "效期：2028.10.28。實際效期以商品包裝標示為準。",
  58: "效期：2027.05.26。實際效期以商品包裝標示為準。",
  59: "潔顏慕絲 / 卸妝油效期：2029.06.08。實際效期以商品包裝標示為準。",
  60: "效期：2027.07.22。實際效期以商品包裝標示為準。",
  61: "效期：2028.11.19。實際效期以商品包裝標示為準。",
  63: "效期：2029.03.09。實際效期以商品包裝標示為準。",
  64: "效期：2027.10.07。實際效期以商品包裝標示為準。",
  65: "效期：2028.10.15。實際效期以商品包裝標示為準。",
  66: "效期：2029.06.08。實際效期以商品包裝標示為準。",
  67: "效期：2029.05.26。實際效期以商品包裝標示為準。",
  69: "亮妍魚膠原蛋白飲效期：2028.03.08；EC 晶眸葉黃素效期依商品包裝標示為準。",
  48: "效期：2029.06.15。實際效期以商品包裝標示為準。",
  49: "效期：2029.06.15。實際效期以商品包裝標示為準。",
  74: "效期：2026.10.17。限量優惠品項，建議確認可於效期內使用後再加入購物車。",
  75: "效期：2028.01.03。實際效期以商品包裝標示為準。",
  78: "效期：2028.03.03。實際效期以商品包裝標示為準。",
  79: "效期：2027.09.11。實際效期以商品包裝標示為準。",
  80: "效期：2031.03.16。實際效期以商品包裝標示為準。",
  81: "效期：2031.01.17。實際效期以商品包裝標示為準。",
  82: "效期：2028.03.17。實際效期以商品包裝標示為準。",
  83: "效期：2028.10.01。實際效期以商品包裝標示為準。",
  84: "效期：2028.09.21。實際效期以商品包裝標示為準。",
  85: "效期：2030.06.18。實際效期以商品包裝標示為準。",
  86: "效期：2028.11.04。實際效期以商品包裝標示為準。",
  87: "效期：2029.05.21。實際效期以商品包裝標示為準。",
  88: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  89: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  90: "效期：2029.05.21。實際效期以商品包裝標示為準。",
  91: "效期：2029.05.04。實際效期以商品包裝標示為準。",
  92: "效期：2029.04.05。實際效期以商品包裝標示為準。",
  93: "效期：2029.04.05。實際效期以商品包裝標示為準。"
};



export const productImageFallbacks: Record<number, string[]> = {
  30: ["/api/studio/media/23/file"],
  31: ["/api/studio/media/101/file"],
  18: [




    "/api/studio/media/125/file",
  ],
  19: [
    "/api/studio/media/16/file",



    "/api/studio/media/125/file",
  ],
  50: ["/api/studio/media/111/file", "/api/studio/media/19/file"],
  114: ["/api/studio/media/113/file", "/api/studio/media/19/file"],
  70: ["/products/龍血求麗甦醒精油滾珠.jpg", "/products/龍血求麗甦醒精油滾珠.png"],
  71: [],
  72: [],
  73: []
};
