import { NextResponse } from "next/server";
import { listPromotions } from "../../../../lib/promotion-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StorefrontComboOption = {
  id: string;
  name: string;
};

type StorefrontComboPlan = {
  id: string;
  label: string;
  requiredQuantity: number;
  price: number;
  priceLabel: string;
  note?: string;
};

type StorefrontComboConfig = {
  productId: number;
  unitLabel: string;
  allowSameProduct: boolean;
  options: StorefrontComboOption[];
  plans: StorefrontComboPlan[];
  note?: string;
};

type StorefrontBuyGetConfig = {
  promotionId: number;
  name: string;
  buyProductId: number;
  buyQuantity: number;
  giftQuantity: number;
  giftMode: "same_product" | "fixed_product" | "gift_pool";
  repeatable: boolean;
  priority: number;
  giftProductIds: number[];
  note?: string;
};

function isPromotionActiveNow(
  promotion: Awaited<ReturnType<typeof listPromotions>>[number],
  now: number
) {
  if (promotion.status !== "active") return false;

  if (promotion.startsAt && new Date(promotion.startsAt).getTime() > now) {
    return false;
  }

  if (promotion.endsAt && new Date(promotion.endsAt).getTime() < now) {
    return false;
  }

  return true;
}

function sameProductSet(a: number[], b: number[]) {
  if (a.length !== b.length) return false;

  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);

  return left.every((value, index) => value === right[index]);
}

export async function GET() {
  try {
    const promotions = await listPromotions({ includeInactive: true });
    const now = Date.now();

    // ---- 任搭組合 ---------------------------------------------------------
    const managedProductIds = Array.from(
      new Set(
        promotions
          .filter(
            (promotion) =>
              promotion.type === "mix_match" &&
              Number.isInteger(promotion.storefrontProductId)
          )
          .map((promotion) => promotion.storefrontProductId as number)
      )
    );

    const activeMixMatch = promotions
      .filter(
        (promotion) =>
          promotion.type === "mix_match" &&
          Number.isInteger(promotion.storefrontProductId) &&
          isPromotionActiveNow(promotion, now)
      )
      .sort((a, b) => b.priority - a.priority || a.id - b.id);

    const grouped = new Map<number, typeof activeMixMatch>();

    for (const promotion of activeMixMatch) {
      const productId = promotion.storefrontProductId as number;
      const list = grouped.get(productId) ?? [];
      list.push(promotion);
      grouped.set(productId, list);
    }

    const comboConfigs: Record<number, StorefrontComboConfig> = {};

    for (const [productId, candidates] of grouped.entries()) {
      const primary = candidates[0];
      if (!primary) continue;

      const primaryEligible = primary.products
        .filter((item) => item.role === "eligible")
        .map((item) => item.productId);

      if (primaryEligible.length === 0) continue;

      const compatible = candidates.filter((promotion) => {
        const eligibleIds = promotion.products
          .filter((item) => item.role === "eligible")
          .map((item) => item.productId);

        return sameProductSet(primaryEligible, eligibleIds);
      });

      const eligibleProducts = primary.products
        .filter((item) => item.role === "eligible")
        .sort((a, b) => a.sortOrder - b.sortOrder || a.productId - b.productId);

      const planByQuantity = new Map<number, StorefrontComboPlan>();

      for (const promotion of compatible) {
        if (
          !promotion.requiredQuantity ||
          promotion.requiredQuantity <= 0 ||
          promotion.bundlePrice == null ||
          promotion.bundlePrice < 0
        ) {
          continue;
        }

        if (planByQuantity.has(promotion.requiredQuantity)) continue;

        planByQuantity.set(promotion.requiredQuantity, {
          id: `promotion-${promotion.id}`,
          label: `任選 ${promotion.requiredQuantity} ${
            promotion.unitLabel || "件"
          }`,
          requiredQuantity: promotion.requiredQuantity,
          price: promotion.bundlePrice,
          priceLabel: `$${promotion.bundlePrice.toLocaleString("zh-TW")}`,
          note: promotion.description || undefined,
        });
      }

      const plans = Array.from(planByQuantity.values()).sort(
        (a, b) => a.requiredQuantity - b.requiredQuantity
      );

      if (plans.length === 0) continue;

      comboConfigs[productId] = {
        productId,
        unitLabel: primary.unitLabel || "件",
        allowSameProduct: primary.allowSameProduct,
        options: eligibleProducts.map((item) => ({
          id: `product-${item.productId}`,
          name: item.name,
        })),
        plans,
        note: primary.description || undefined,
      };
    }

    // ---- 買幾送幾 ---------------------------------------------------------
    // Phase 3C-1A 先完整輸出資料；前台購物車在下一小步套用。
    const managedBuyGetProductIds = Array.from(
      new Set(
        promotions
          .filter((promotion) => promotion.type === "buy_x_get_y")
          .flatMap((promotion) =>
            promotion.products
              .filter((item) => item.role === "buy")
              .map((item) => item.productId)
          )
      )
    );

    const activeBuyGet = promotions
      .filter(
        (promotion) =>
          promotion.type === "buy_x_get_y" &&
          isPromotionActiveNow(promotion, now) &&
          Boolean(promotion.buyQuantity && promotion.buyQuantity > 0) &&
          Boolean(promotion.giftQuantity && promotion.giftQuantity > 0) &&
          Boolean(promotion.giftMode)
      )
      .sort((a, b) => b.priority - a.priority || a.id - b.id);

    const buyGetConfigs: Record<number, StorefrontBuyGetConfig> = {};

    for (const promotion of activeBuyGet) {
      const buyProducts = promotion.products
        .filter((item) => item.role === "buy")
        .sort((a, b) => a.sortOrder - b.sortOrder || a.productId - b.productId);

      const giftProductIds = promotion.products
        .filter((item) => item.role === "gift")
        .sort((a, b) => a.sortOrder - b.sortOrder || a.productId - b.productId)
        .map((item) => item.productId);

      for (const buyProduct of buyProducts) {
        // activeBuyGet 已依 priority 排序，同商品只保留最高優先級。
        if (buyGetConfigs[buyProduct.productId]) continue;

        buyGetConfigs[buyProduct.productId] = {
          promotionId: promotion.id,
          name: promotion.name,
          buyProductId: buyProduct.productId,
          buyQuantity: promotion.buyQuantity as number,
          giftQuantity: promotion.giftQuantity as number,
          giftMode: promotion.giftMode as
            | "same_product"
            | "fixed_product"
            | "gift_pool",
          repeatable: promotion.repeatable,
          priority: promotion.priority,
          giftProductIds,
          note: promotion.description || undefined,
        };
      }
    }

    return NextResponse.json(
      {
        comboConfigs,
        managedProductIds,
        buyGetConfigs,
        managedBuyGetProductIds,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Jourdeness] storefront promotions API failed", error);

    return NextResponse.json(
      {
        comboConfigs: {},
        managedProductIds: [],
        buyGetConfigs: {},
        managedBuyGetProductIds: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
