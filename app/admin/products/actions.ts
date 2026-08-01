"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";

import {
  createDatabaseProduct,
  deleteDatabaseProduct,
  getDatabaseProduct,
  updateDatabaseProduct,
  updateProductSortOrders,
  updateProductStatus,
  type ProductStatus,
  type ProductWriteInput,
} from "../../../lib/product-repository";

import {
  deleteUploadedImage,
} from "../../../lib/upload-storage";

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

function stringValues(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function expandedInfoValues(formData: FormData) {
  const titles = formData
    .getAll("expandedInfoTitle")
    .map((value) => String(value).trim());

  const contents = formData
    .getAll("expandedInfoContent")
    .map((value) => String(value).trim());

  const length = Math.max(titles.length, contents.length);

  return Array.from({ length }, (_, index) => ({
    title: titles[index] ?? "",
    content: contents[index] ?? "",
  })).filter((item) => item.title && item.content);
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

function parseComboConfig(
  formData: FormData
): ProductWriteInput["comboConfig"] {
  const raw = stringValue(formData, "comboConfig");
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as ProductWriteInput["comboConfig"];

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.unitLabel ||
      !Array.isArray(parsed.options) ||
      !Array.isArray(parsed.plans)
    ) {
      throw new Error("invalid combo config");
    }

    return parsed;
  } catch {
    throw new Error("組合價設定格式無效");
  }
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
    storefrontCategory: optionalString(formData, "storefrontCategory"),
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
    features: stringValues(formData, "features"),
    suitableFor: stringValues(formData, "suitableFor"),
    usage: optionalString(formData, "usage"),
    notice: optionalString(formData, "notice"),
    gallery: stringValues(formData, "gallery"),
    expandedInfo: expandedInfoValues(formData),
    comboConfig: parseComboConfig(formData),
    status: parseStatus(stringValue(formData, "status")),
    sortOrder: parseSortOrder(stringValue(formData, "sortOrder")),
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const productType =
    stringValue(formData, "productType") === "combo"
      ? "combo"
      : "product";

  const product = await createDatabaseProduct(
    productInputFromForm(formData),
    productType
  );

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}/edit?saved=created`);
}

export async function changeProductStatusAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));
  const status = parseStatus(stringValue(formData, "status"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  await updateProductStatus(id, status);

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
}


export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("商品 ID 無效");
  }

  const existingProduct = await getDatabaseProduct(id);

  if (!existingProduct) {
    throw new Error("找不到這筆商品");
  }

  const input = productInputFromForm(formData);

  const product = await updateDatabaseProduct(id, input);

  if (!product) {
    throw new Error("找不到這筆商品");
  }

  if (
    existingProduct.image &&
    existingProduct.image !== product.image
  ) {
    try {
      await deleteUploadedImage(existingProduct.image);
    } catch (error) {
      console.error("舊商品圖片刪除失敗：", error);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/admin/products/${id}/edit`);

  redirect(`/admin/products/${id}/edit?saved=updated`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const existingProduct = await getDatabaseProduct(id);

  if (!existingProduct) {
    return;
  }

  const deleted = await deleteDatabaseProduct(id);

  if (!deleted) {
    throw new Error("商品刪除失敗");
  }

  if (existingProduct.image) {
    try {
      await deleteUploadedImage(existingProduct.image);
    } catch (error) {
      console.error("商品圖片刪除失敗：", error);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
}
export async function saveProductSortOrderAction(
  items: Array<{
    id: number;
    sortOrder: number;
  }>
) {
  await requireAdmin();

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("缺少商品排序資料");
  }

  const normalizedItems = items.map((item) => {
    const id = Number(item.id);
    const sortOrder = Number(item.sortOrder);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(sortOrder) ||
      sortOrder <= 0
    ) {
      throw new Error("商品排序資料無效");
    }

    return {
      id,
      sortOrder,
    };
  });

  await updateProductSortOrders(normalizedItems);

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
}
