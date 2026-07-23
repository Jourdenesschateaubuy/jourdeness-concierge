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

    // 只要某個前台商品曾經被資料庫優惠接管，就不再退回 hardcoded combo。
    // 因此在後台停用優惠後，前台會真的停用，不會又顯示舊活動。
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

      // 現有商城 ComboConfig 的 options 是共用的，因此同一入口商品下，
      // 只有「可任搭商品完全相同」的促銷才能合併成多個方案。
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

        // candidates 已依 priority 排序，所以同件數時保留最高優先級。
        if (planByQuantity.has(promotion.requiredQuantity)) continue;

        planByQuantity.set(promotion.requiredQuantity, {
          id: `promotion-${promotion.id}`,
          label: `任選 ${promotion.requiredQuantity} ${promotion.unitLabel || "件"}`,
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

    return NextResponse.json(
      {
        comboConfigs,
        managedProductIds,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Jourdeness] storefront promotions API failed", error);

    // API 失敗時不要標記 managed，前端會保留既有 hardcoded 優惠作 fallback。
    return NextResponse.json(
      {
        comboConfigs: {},
        managedProductIds: [],
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
