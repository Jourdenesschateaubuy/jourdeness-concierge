
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";
import {
  createPromotion,
  deletePromotion,
  updatePromotion,
  updatePromotionStatus,
  type GiftMode,
  type PromotionStatus,
  type PromotionType,
  type PromotionWriteInput,
} from "../../../lib/promotion-repository";

async function requireAdmin() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin-login");
  }
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : undefined;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function ids(formData: FormData, key: string) {
  return Array.from(
    new Set(
      formData
        .getAll(key)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
}

function parseInput(formData: FormData): PromotionWriteInput {
  const type = text(formData, "type") as PromotionType;
  const status = text(formData, "status") as PromotionStatus;
  const giftMode = text(formData, "giftMode") as GiftMode;

  return {
    name: text(formData, "name"),
    type: type === "buy_x_get_y" ? "buy_x_get_y" : "mix_match",
    status: status === "inactive" ? "inactive" : "active",
    description: text(formData, "description") || undefined,

    storefrontProductId: numberValue(formData, "storefrontProductId"),
    unitLabel: text(formData, "unitLabel") || "件",

    requiredQuantity: numberValue(formData, "requiredQuantity"),
    bundlePrice: numberValue(formData, "bundlePrice"),
    allowSameProduct: bool(formData, "allowSameProduct"),

    buyQuantity: numberValue(formData, "buyQuantity"),
    giftQuantity: numberValue(formData, "giftQuantity"),
    giftMode:
      giftMode === "fixed_product" || giftMode === "gift_pool"
        ? giftMode
        : "same_product",
    repeatable: bool(formData, "repeatable"),

    priority: numberValue(formData, "priority") ?? 50,
    stackable: bool(formData, "stackable"),
    startsAt: text(formData, "startsAt") || undefined,
    endsAt: text(formData, "endsAt") || undefined,

    eligibleProductIds: ids(formData, "eligibleProductIds"),
    buyProductIds: ids(formData, "buyProductIds"),
    giftProductIds: ids(formData, "giftProductIds"),
  };
}

export async function createPromotionAction(formData: FormData) {
  await requireAdmin();

  const promotion = await createPromotion(parseInput(formData));

  if (!promotion) throw new Error("建立優惠失敗");

  revalidatePath("/admin/promotions");
  redirect(`/admin/promotions/${promotion.id}/edit?saved=created`);
}

export async function updatePromotionAction(formData: FormData) {
  await requireAdmin();

  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("優惠 ID 無效");
  }

  await updatePromotion(id, parseInput(formData));

  revalidatePath("/admin/promotions");
  redirect(`/admin/promotions/${id}/edit?saved=updated`);
}

export async function changePromotionStatusAction(formData: FormData) {
  await requireAdmin();

  const id = Number(text(formData, "id"));
  const status =
    text(formData, "status") === "inactive" ? "inactive" : "active";

  if (!Number.isInteger(id) || id <= 0) return;

  await updatePromotionStatus(id, status);
  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(formData: FormData) {
  await requireAdmin();

  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await deletePromotion(id);
  revalidatePath("/admin/promotions");
}
