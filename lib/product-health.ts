import path from "node:path";
import { access } from "node:fs/promises";

import type {
  CatalogCategory,
  CatalogSeries,
} from "./catalog-repository";
import type {
  DatabaseProduct,
  ProductStatus,
} from "./product-repository";

export type ProductHealthSeverity = "error" | "warning";

export type ProductHealthIssue = {
  id: string;
  severity: ProductHealthSeverity;
  code: string;
  title: string;
  detail: string;
  suggestion: string;
  productId?: number;
  productName?: string;
  displayCode?: string;
  editHref?: string;
};

export type ProductHealthReport = {
  generatedAt: string;
  totalProducts: number;
  healthyProducts: number;
  affectedProducts: number;
  errorCount: number;
  warningCount: number;
  statusCounts: Record<ProductStatus, number>;
  localImagesChecked: number;
  localImagesMissing: number;
  remoteImagesSkipped: number;
  issues: ProductHealthIssue[];
};

type ImageCheckResult =
  | "exists"
  | "missing"
  | "remote"
  | "unverifiable";

function normalized(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function moneyValues(value: string | undefined) {
  if (!value) return [];

  return [...value.matchAll(/(?:\$|NT\$)?\s*([\d,]+)/g)]
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((amount) => Number.isFinite(amount) && amount > 0);
}

function primaryMoneyValue(value: string | undefined) {
  return moneyValues(value).at(-1) ?? null;
}

function safeLocalPath(root: string, relativePath: string) {
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, absolutePath);

  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    return null;
  }

  return absolutePath;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkProductImage(image: string): Promise<ImageCheckResult> {
  const cleanImage = normalized(image);

  if (!cleanImage || cleanImage.includes("placeholder")) {
    return "missing";
  }

  if (/^(?:https?:|data:|blob:)/i.test(cleanImage)) {
    return "remote";
  }

  const uploadRoot = normalized(process.env.UPLOAD_ROOT);
  const publicRoot = path.join(process.cwd(), "public");
  const candidates: string[] = [];

  if (cleanImage.startsWith("/api/uploads/")) {
    if (!uploadRoot) return "unverifiable";

    const relativePath = cleanImage
      .slice("/api/uploads/".length)
      .replaceAll("/", path.sep);
    const absolutePath = safeLocalPath(uploadRoot, relativePath);

    if (!absolutePath) return "missing";
    candidates.push(absolutePath);
  } else if (cleanImage.startsWith("/")) {
    const absolutePath = safeLocalPath(
      publicRoot,
      cleanImage.slice(1).replaceAll("/", path.sep)
    );

    if (!absolutePath) return "missing";
    candidates.push(absolutePath);
  } else {
    const fileName = path.basename(cleanImage);

    if (uploadRoot) {
      candidates.push(path.join(uploadRoot, "products", fileName));
    }

    candidates.push(
      path.join(publicRoot, "products", fileName),
      path.join(publicRoot, "images", fileName),
      path.join(publicRoot, fileName)
    );
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return "exists";
  }

  return candidates.length > 0 ? "missing" : "unverifiable";
}

function issueForProduct(
  product: DatabaseProduct,
  issue: Omit<
    ProductHealthIssue,
    "id" | "productId" | "productName" | "displayCode" | "editHref"
  >
): ProductHealthIssue {
  return {
    ...issue,
    id: `${product.id}-${issue.code}`,
    productId: product.id,
    productName: product.name,
    displayCode: product.displayCode,
    editHref: `/admin/products/${product.id}/edit?from=health`,
  };
}

function comboPlanPriceSummary(product: DatabaseProduct) {
  const config = product.comboConfig;
  if (!config) return [];

  return config.plans
    .map((plan) => Number(plan.price))
    .filter((price) => Number.isFinite(price) && price > 0);
}

export async function buildProductHealthReport(input: {
  products: DatabaseProduct[];
  categories: CatalogCategory[];
  series: CatalogSeries[];
}): Promise<ProductHealthReport> {
  const { products, categories, series } = input;
  const issues: ProductHealthIssue[] = [];
  const productsById = new Map(products.map((product) => [product.id, product]));
  const categoryNames = new Set(categories.map((category) => category.name));
  const seriesByName = new Map<string, CatalogSeries[]>();
  const seriesPairKeys = new Set<string>();
  const categorySeriesCount = new Map<string, number>();

  for (const item of series) {
    const values = seriesByName.get(item.name) ?? [];
    values.push(item);
    seriesByName.set(item.name, values);
    seriesPairKeys.add(`${item.categoryName}\u0000${item.name}`);
    categorySeriesCount.set(
      item.categoryName,
      (categorySeriesCount.get(item.categoryName) ?? 0) + 1
    );
  }

  const codeOwners = new Map<string, DatabaseProduct[]>();
  for (const product of products) {
    const code = normalized(product.displayCode).toUpperCase();
    if (!code) continue;
    const owners = codeOwners.get(code) ?? [];
    owners.push(product);
    codeOwners.set(code, owners);
  }

  for (const [code, owners] of codeOwners) {
    if (owners.length <= 1) continue;

    for (const product of owners) {
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "duplicate-display-code",
          title: "商品編號重複",
          detail: `${code} 同時被 ${owners.length} 筆商品使用。`,
          suggestion: "請保留其中一筆編號，其他商品重新產生新的 P／C 編號。",
        })
      );
    }
  }

  let localImagesChecked = 0;
  let localImagesMissing = 0;
  let remoteImagesSkipped = 0;

  const imageChecks = await Promise.all(
    products.map(async (product) => ({
      product,
      result: await checkProductImage(product.image),
    }))
  );

  for (const { product, result } of imageChecks) {
    if (result === "remote") {
      remoteImagesSkipped += 1;
      continue;
    }

    if (result === "unverifiable") continue;

    localImagesChecked += 1;

    if (result === "missing") {
      localImagesMissing += 1;
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "missing-image",
          title: "商品圖片找不到",
          detail: `目前主圖路徑為「${product.image || "空白"}」，但伺服器找不到對應檔案。`,
          suggestion: "重新上傳主圖，或修正商品圖片路徑。",
        })
      );
    }
  }

  for (const product of products) {
    const displayCode = normalized(product.displayCode).toUpperCase();
    const expectedPrefix = product.productType === "combo" ? "C-" : "P-";
    const effectiveCategory = normalized(product.storefrontCategory) || normalized(product.category);
    const productSeries = normalized(product.series);

    if (!displayCode) {
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "missing-display-code",
          title: "缺少商品編號",
          detail: "這筆商品沒有 P-xxxx 或 C-xxxx 顯示編號。",
          suggestion: "重新產生符合商品類型的顯示編號。",
        })
      );
    } else if (!displayCode.startsWith(expectedPrefix)) {
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "wrong-display-code-prefix",
          title: "商品編號類型不一致",
          detail: `${product.productType === "combo" ? "組合商品" : "一般商品"}目前使用 ${displayCode}。`,
          suggestion: `此商品應使用 ${expectedPrefix} 開頭的編號。`,
        })
      );
    }

    if (!effectiveCategory || !categoryNames.has(effectiveCategory)) {
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "missing-category",
          title: "前台分類不存在",
          detail: `商品目前指向「${effectiveCategory || "空白"}」，分類管理中找不到這個分類。`,
          suggestion: "將商品移到現有分類，或先在分類管理建立對應分類。",
        })
      );
    }

    if (productSeries) {
      const pairKey = `${effectiveCategory}\u0000${productSeries}`;

      if (!seriesPairKeys.has(pairKey)) {
        const matchingSeries = seriesByName.get(productSeries) ?? [];
        issues.push(
          issueForProduct(product, {
            severity: "warning",
            code: "series-category-mismatch",
            title: matchingSeries.length > 0 ? "系列所屬分類不一致" : "系列不存在",
            detail:
              matchingSeries.length > 0
                ? `「${productSeries}」存在，但不屬於目前分類「${effectiveCategory}」。`
                : `系列管理中找不到「${productSeries}」。`,
            suggestion: "重新選擇正確系列，或在目前分類建立這個系列。",
          })
        );
      }
    } else if ((categorySeriesCount.get(effectiveCategory) ?? 0) > 0) {
      issues.push(
        issueForProduct(product, {
          severity: "warning",
          code: "missing-series",
          title: "尚未指定系列",
          detail: `分類「${effectiveCategory}」已有可選系列，但這筆商品目前沒有系列。`,
          suggestion: "確認此商品是否應歸入某個系列；不需要系列時可保留。",
        })
      );
    }

    if (product.productType === "standard" && product.comboConfig) {
      issues.push(
        issueForProduct(product, {
          severity: "error",
          code: "standard-has-combo-config",
          title: "一般商品誤帶組合設定",
          detail: "商品類型是一般商品，但資料內仍有 comboConfig。",
          suggestion: "移除組合設定，或將商品類型改成組合商品。",
        })
      );
    }

    if (product.productType === "combo") {
      const config = product.comboConfig;

      if (!config) {
        issues.push(
          issueForProduct(product, {
            severity: "error",
            code: "combo-missing-config",
            title: "組合商品缺少方案",
            detail: "商品類型是組合商品，但沒有 comboConfig。",
            suggestion: "進入組合價格與方案，建立固定套組、任選或買幾送幾方案。",
          })
        );
      } else {
        if (config.productId !== product.id) {
          issues.push(
            issueForProduct(product, {
              severity: "error",
              code: "combo-product-id-mismatch",
              title: "組合設定連到錯誤商品",
              detail: `comboConfig.productId 是 ${config.productId}，但商品 DB ID 是 ${product.id}。`,
              suggestion: "重新儲存組合設定，使 productId 與目前商品一致。",
            })
          );
        }

        if (!Array.isArray(config.options) || config.options.length === 0) {
          issues.push(
            issueForProduct(product, {
              severity: "error",
              code: "combo-missing-options",
              title: "組合內容是空的",
              detail: "目前方案沒有任何可販售品項或固定套組內容。",
              suggestion: "至少新增一個組合內容品項。",
            })
          );
        }

        if (!Array.isArray(config.plans) || config.plans.length === 0) {
          issues.push(
            issueForProduct(product, {
              severity: "error",
              code: "combo-missing-plans",
              title: "組合價格是空的",
              detail: "目前沒有任何組合方案與正式價格。",
              suggestion: "至少新增一個有效方案與價格。",
            })
          );
        }

        const duplicateOptionIds = config.options
          .map((option) => option.id.trim())
          .filter((optionId, index, all) => optionId && all.indexOf(optionId) !== index);

        if (duplicateOptionIds.length > 0) {
          issues.push(
            issueForProduct(product, {
              severity: "error",
              code: "duplicate-combo-option-id",
              title: "組合內容代碼重複",
              detail: `重複代碼：${Array.from(new Set(duplicateOptionIds)).join("、")}。`,
              suggestion: "讓每個組合內容使用不同的 option id。",
            })
          );
        }

        const duplicatePlanIds = config.plans
          .map((plan) => plan.id.trim())
          .filter((planId, index, all) => planId && all.indexOf(planId) !== index);

        if (duplicatePlanIds.length > 0) {
          issues.push(
            issueForProduct(product, {
              severity: "error",
              code: "duplicate-combo-plan-id",
              title: "組合方案代碼重複",
              detail: `重複代碼：${Array.from(new Set(duplicatePlanIds)).join("、")}。`,
              suggestion: "讓每個組合方案使用不同的 plan id。",
            })
          );
        }

        for (const option of config.options) {
          if (option.productId === undefined) continue;

          if (option.productId === product.id) {
            issues.push(
              issueForProduct(product, {
                severity: "error",
                code: `combo-self-link-${option.id}`,
                title: "組合內容自我連結",
                detail: `「${option.name}」連回組合商品自己（DB #${product.id}）。`,
                suggestion: "移除自我 productId；買一送一同品項可保留文字內容。",
              })
            );
            continue;
          }

          const linkedProduct = productsById.get(option.productId);

          if (!linkedProduct) {
            issues.push(
              issueForProduct(product, {
                severity: "error",
                code: `missing-combo-product-${option.id}`,
                title: "組合內容商品不存在",
                detail: `「${option.name}」連到不存在的 DB #${option.productId}。`,
                suggestion: "改連到現有一般商品，或移除失效連結。",
              })
            );
          } else if (linkedProduct.productType === "combo") {
            issues.push(
              issueForProduct(product, {
                severity: "warning",
                code: `nested-combo-product-${option.id}`,
                title: "組合內容連到另一個組合商品",
                detail: `「${option.name}」目前連到 ${linkedProduct.displayCode} ${linkedProduct.name}。`,
                suggestion: "確認是否真的需要巢狀組合；一般情況應連到 P 編號商品。",
              })
            );
          }
        }

        for (const plan of config.plans) {
          if (
            !Number.isFinite(plan.price) ||
            plan.price <= 0 ||
            !Number.isInteger(plan.requiredQuantity) ||
            plan.requiredQuantity <= 0
          ) {
            issues.push(
              issueForProduct(product, {
                severity: "error",
                code: `invalid-combo-plan-${plan.id || "blank"}`,
                title: "組合方案數量或價格無效",
                detail: `方案「${plan.label || plan.id || "未命名"}」的數量為 ${plan.requiredQuantity}、價格為 ${plan.price}。`,
                suggestion: "數量需為正整數，價格需大於 0。",
              })
            );
          }
        }

        if (product.salePriceAmount !== undefined) {
          issues.push(
            issueForProduct(product, {
              severity: "warning",
              code: "combo-has-standard-sale-price",
              title: "組合商品仍帶一般售價",
              detail: `salePriceAmount 目前為 $${product.salePriceAmount.toLocaleString("zh-TW")}。`,
              suggestion: "組合商品價格應只放在組合價格與方案；重新儲存組合方案即可清除。",
            })
          );
        }

        const cardPriceValues = moneyValues(product.price);
        const planPrices = comboPlanPriceSummary(product);
        const missingCardPrices = planPrices.filter(
          (price) => !cardPriceValues.includes(price)
        );

        if (planPrices.length > 0 && missingCardPrices.length > 0) {
          issues.push(
            issueForProduct(product, {
              severity: "warning",
              code: "combo-card-price-mismatch",
              title: "商品卡價格與組合方案不一致",
              detail: `商品卡目前顯示「${product.price}」，但方案包含 ${missingCardPrices.map((price) => `$${price.toLocaleString("zh-TW")}`).join("、")}。`,
              suggestion: "重新儲存組合方案，讓商品卡價格摘要由正式方案自動產生。",
            })
          );
        }
      }
    } else {
      const legacySalePrice = primaryMoneyValue(product.price);
      const legacyOriginalPrice = primaryMoneyValue(product.originalPrice);
      const salePrice = product.salePriceAmount ?? legacySalePrice;
      const originalPrice =
        product.originalPriceAmount ?? legacyOriginalPrice;
      const isInquiry = /洽詢|詢價|請洽/i.test(product.price);

      if (!product.salePriceAmount && legacySalePrice) {
        issues.push(
          issueForProduct(product, {
            severity: "warning",
            code: "sale-price-not-structured",
            title: "售價仍只存在舊文字欄位",
            detail: `目前可從「${product.price}」辨識出 $${legacySalePrice.toLocaleString("zh-TW")}，但 salePriceAmount 尚未寫入。`,
            suggestion: "重新儲存商品卡，或執行價格結構化遷移。",
          })
        );
      }

      if (
        product.salePriceAmount &&
        legacySalePrice &&
        product.salePriceAmount !== legacySalePrice
      ) {
        issues.push(
          issueForProduct(product, {
            severity: "error",
            code: "structured-sale-price-mismatch",
            title: "結構化售價與舊顯示文字不一致",
            detail: `正式售價是 $${product.salePriceAmount.toLocaleString("zh-TW")}，舊文字顯示約 $${legacySalePrice.toLocaleString("zh-TW")}。`,
            suggestion: "重新儲存商品卡，讓前台相容文字由正式售價自動產生。",
          })
        );
      }

      if (
        product.originalPriceAmount &&
        legacyOriginalPrice &&
        product.originalPriceAmount !== legacyOriginalPrice
      ) {
        issues.push(
          issueForProduct(product, {
            severity: "warning",
            code: "structured-original-price-mismatch",
            title: "結構化原價與舊顯示文字不一致",
            detail: `正式原價是 $${product.originalPriceAmount.toLocaleString("zh-TW")}，舊文字顯示約 $${legacyOriginalPrice.toLocaleString("zh-TW")}。`,
            suggestion: "重新儲存商品卡，讓原價顯示同步。",
          })
        );
      }

      if (!salePrice && !isInquiry) {
        issues.push(
          issueForProduct(product, {
            severity: "warning",
            code: "invalid-standard-price",
            title: "一般商品售價無法辨識",
            detail: `目前價格文字為「${product.price || "空白"}」。`,
            suggestion: "填入可辨識的數字售價，或明確標記為洽詢。",
          })
        );
      }

      if (
        salePrice &&
        originalPrice &&
        originalPrice < salePrice
      ) {
        issues.push(
          issueForProduct(product, {
            severity: "warning",
            code: "original-price-lower-than-sale",
            title: "原價低於售價",
            detail: `原價約 $${originalPrice.toLocaleString("zh-TW")}，售價約 $${salePrice.toLocaleString("zh-TW")}。`,
            suggestion: "確認原價與售價是否填反。",
          })
        );
      }
    }
  }

  issues.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === "error" ? -1 : 1;
    }

    return (a.displayCode ?? "").localeCompare(
      b.displayCode ?? "",
      "zh-TW",
      { numeric: true }
    );
  });

  const affectedProductIds = new Set(
    issues
      .map((issue) => issue.productId)
      .filter((productId): productId is number => productId !== undefined)
  );

  const statusCounts: Record<ProductStatus, number> = {
    active: 0,
    inactive: 0,
    coming_soon: 0,
    sold_out: 0,
  };

  for (const product of products) {
    statusCounts[product.status] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    healthyProducts: Math.max(products.length - affectedProductIds.size, 0),
    affectedProducts: affectedProductIds.size,
    errorCount: issues.filter((issue) => issue.severity === "error").length,
    warningCount: issues.filter((issue) => issue.severity === "warning").length,
    statusCounts,
    localImagesChecked,
    localImagesMissing,
    remoteImagesSkipped,
    issues,
  };
}
