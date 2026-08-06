"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasValidAdminSession } from "../../../lib/admin-auth";
import {
  addProductToStorefrontSection,
  removeProductFromStorefrontSection,
  updateStorefrontSectionItemSortOrders,
  updateStorefrontSectionItemVisibility,
} from "../../../lib/storefront-section-repository";

async function requireAdmin() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin-login");
  }
}

function numberValue(formData: FormData, name: string) {
  const value = Number(formData.get(name));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} 無效`);
  }

  return value;
}

function refreshStorefront() {
  revalidatePath("/admin/storefront");
  revalidatePath("/");
}

export async function addProductToSectionAction(
  formData: FormData
) {
  await requireAdmin();

  const sectionId = numberValue(formData, "sectionId");
  const productId = numberValue(formData, "productId");

  await addProductToStorefrontSection(sectionId, productId);
  refreshStorefront();
}

export async function removeProductFromSectionAction(
  formData: FormData
) {
  await requireAdmin();

  const sectionId = numberValue(formData, "sectionId");
  const productId = numberValue(formData, "productId");

  await removeProductFromStorefrontSection(
    sectionId,
    productId
  );
  refreshStorefront();
}

export async function toggleProductVisibilityAction(
  formData: FormData
) {
  await requireAdmin();

  const sectionId = numberValue(formData, "sectionId");
  const productId = numberValue(formData, "productId");
  const nextVisible =
    String(formData.get("nextVisible")) === "true";

  await updateStorefrontSectionItemVisibility(
    sectionId,
    productId,
    nextVisible
  );

  refreshStorefront();
}

export async function saveSectionSortOrderAction(
  sectionId: number,
  orderedProductIds: number[]
) {
  await requireAdmin();

  const normalizedSectionId = Number(sectionId);

  if (
    !Number.isInteger(normalizedSectionId) ||
    normalizedSectionId <= 0
  ) {
    throw new Error("商城區塊 ID 無效");
  }

  if (
    !Array.isArray(orderedProductIds) ||
    orderedProductIds.length === 0
  ) {
    throw new Error("缺少商城商品排序資料");
  }

  const normalizedProductIds = orderedProductIds.map(
    (productId) => {
      const value = Number(productId);

      if (!Number.isInteger(value) || value <= 0) {
        throw new Error("商城商品排序資料無效");
      }

      return value;
    }
  );

  if (
    new Set(normalizedProductIds).size !==
    normalizedProductIds.length
  ) {
    throw new Error("商城商品排序資料重複");
  }

  await updateStorefrontSectionItemSortOrders(
    normalizedSectionId,
    normalizedProductIds
  );

  refreshStorefront();
}
