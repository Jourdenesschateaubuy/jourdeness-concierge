"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";
import {
  createDatabaseProduct,
  deleteDatabaseProduct,
  updateDatabaseProduct,
  updateProductStatus,
  type ProductStatus,
  type ProductWriteInput,
} from "../../../lib/product-repository";

const VALID_STATUSES: ProductStatus[] = [
  "active",
  "inactive",
  "coming_soon",
  "sold_out",
];

async function requireAdmin() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin-login");
  }
}

function stringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalString(formData: FormData, name: string) {
  const value = stringValue(formData, name);
  return value || undefined;
}

function parseStatus(value: string): ProductStatus {
  return VALID_STATUSES.includes(value as ProductStatus)
    ? (value as ProductStatus)
    : "active";
}

function parseSortOrder(value: string) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

function productInputFromForm(formData: FormData): ProductWriteInput {
  const name = stringValue(formData, "name");
  const category = stringValue(formData, "category");
  const price = stringValue(formData, "price");
  const image = stringValue(formData, "image");

  if (!name) throw new Error("商品名稱不能空白");
  if (!category) throw new Error("商品分類不能空白");
  if (!price) throw new Error("售價不能空白");
  if (!image) throw new Error("商品圖片路徑不能空白");

  return {
    sku: optionalString(formData, "sku"),
    name,
    category,
    series: stringValue(formData, "series"),
    originalPrice: optionalString(formData, "originalPrice"),
    price,
    image,
    description: stringValue(formData, "description"),
    cardName: optionalString(formData, "cardName"),
    cardSubtitle: optionalString(formData, "cardSubtitle"),
    spec: optionalString(formData, "spec"),
    intro: optionalString(formData, "intro"),
    priceNote: optionalString(formData, "priceNote"),
    expiryNote: optionalString(formData, "expiryNote"),
    internalExpiryDate: optionalString(formData, "internalExpiryDate"),
    status: parseStatus(stringValue(formData, "status")),
    sortOrder: parseSortOrder(stringValue(formData, "sortOrder")),
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const product = await createDatabaseProduct(
    productInputFromForm(formData)
  );

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit?saved=created`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("商品 ID 無效");
  }

  const product = await updateDatabaseProduct(
    id,
    productInputFromForm(formData)
  );

  if (!product) {
    throw new Error("找不到這筆商品");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  redirect(`/admin/products/${id}/edit?saved=updated`);
}

export async function changeProductStatusAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));
  const status = parseStatus(stringValue(formData, "status"));

  if (!Number.isInteger(id) || id <= 0) return;

  await updateProductStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteDatabaseProduct(id);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}
