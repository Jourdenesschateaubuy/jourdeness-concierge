import type { ComboConfig } from "./storefront-core";

export type StructuredPriceInput = {
  salePriceAmount?: number;
  originalPriceAmount?: number;
  promotionText?: string;
};

export function normalizeMoneyAmount(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const normalized = String(value).trim().replaceAll(",", "");

  if (!/^\d+$/.test(normalized)) {
    return undefined;
  }

  const amount = Number(normalized);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : undefined;
}

export function extractPrimaryMoneyAmount(value: string | undefined | null) {
  if (!value) return undefined;

  const amounts = [...value.matchAll(/(?:NT\$|\$)?\s*([\d,]+)/gi)]
    .map((match) => normalizeMoneyAmount(match[1]))
    .filter((amount): amount is number => amount !== undefined);

  return amounts.at(-1);
}

export function formatMoneyAmount(amount: number) {
  return amount.toLocaleString("en-US");
}

export function formatOriginalPriceText(amount: number | undefined) {
  return amount ? `原價 $ ${formatMoneyAmount(amount)}` : undefined;
}

export function formatStandardPriceText(
  amount: number,
  category: string
) {
  const label = category === "外部廠商" ? "售價" : "產地價";
  return `${label} $ ${formatMoneyAmount(amount)}`;
}

export function formatComboCardPrice(
  comboConfig: ComboConfig,
  fallbackPrice = ""
) {
  const unitLabel = comboConfig.unitLabel?.trim() || "件";

  if (comboConfig.type === "fixed_bundle") {
    const plan = comboConfig.plans.find(
      (item) => Number.isFinite(item.price) && item.price > 0
    );

    return plan
      ? `組合價 $${formatMoneyAmount(plan.price)}`
      : fallbackPrice;
  }

  const parts: string[] = [];

  if (
    typeof comboConfig.singleUnitPrice === "number" &&
    Number.isFinite(comboConfig.singleUnitPrice) &&
    comboConfig.singleUnitPrice > 0
  ) {
    parts.push(
      `單${unitLabel} $${formatMoneyAmount(comboConfig.singleUnitPrice)}`
    );
  }

  for (const plan of comboConfig.plans) {
    if (!Number.isFinite(plan.price) || plan.price <= 0) continue;

    const formattedPrice = formatMoneyAmount(plan.price);

    if (comboConfig.type === "buy_get") {
      const buyQuantity =
        plan.buyQuantity ?? Math.max(plan.requiredQuantity - 1, 1);
      const freeQuantity = plan.freeQuantity ?? 1;
      parts.push(`買${buyQuantity}送${freeQuantity} $${formattedPrice}`);
    } else {
      parts.push(
        `任選${plan.requiredQuantity}${unitLabel} $${formattedPrice}`
      );
    }
  }

  return parts.length > 0 ? parts.join("｜") : fallbackPrice;
}
