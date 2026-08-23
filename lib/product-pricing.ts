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
