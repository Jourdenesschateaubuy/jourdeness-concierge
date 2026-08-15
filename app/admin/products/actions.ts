"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";

import {
  createDatabaseProduct,
  deleteDatabaseProduct,
  getDatabaseProduct,
  updateDatabaseProduct,
  updateDatabaseProductPartial,
  updateProductSortOrders,
  updateProductStatus,
  type ProductStatus,
  type ProductWriteInput,
} from "../../../lib/product-repository";

import {
  deleteUploadedImage,
} from "../../../lib/upload-storage";
import {
  formatComboCardPrice,
  formatOriginalPriceText,
  formatStandardPriceText,
  normalizeMoneyAmount,
} from "../../../lib/product-pricing";

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
      !Array.isArray(parsed.plans) ||
      parsed.plans.length === 0
    ) {
      throw new Error("invalid combo config");
    }

    const mode = parsed.type ?? "mix_match";
    const validPlans = parsed.plans.every(
      (plan) =>
        Number.isFinite(plan.price) &&
        plan.price > 0 &&
        Number.isFinite(plan.requiredQuantity) &&
        plan.requiredQuantity > 0
    );

    if (!validPlans) {
      throw new Error("invalid combo price");
    }

    if (
      mode !== "fixed_bundle" &&
      parsed.options.length === 0
    ) {
      throw new Error("missing combo options");
    }

    return parsed;
  } catch {
    throw new Error("組合價設定格式無效");
  }
}


function productInputFromForm(
  formData: FormData,
  productType: "product" | "combo" = "product"
): ProductWriteInput {
  const name = stringValue(formData, "name");
  const category = stringValue(formData, "category");
  const image = stringValue(formData, "image");
  const comboConfig = parseComboConfig(formData);
  const rawSalePrice = stringValue(formData, "price");
  const rawOriginalPrice = stringValue(formData, "originalPrice");
  const promotionText = optionalString(formData, "priceNote");
  const storefrontCategory = optionalString(
    formData,
    "storefrontCategory"
  );
  const status = parseStatus(stringValue(formData, "status"));
  const salePriceAmount =
    productType === "combo"
      ? undefined
      : normalizeMoneyAmount(rawSalePrice);
  const originalPriceAmount = normalizeMoneyAmount(rawOriginalPrice);

  if (!name) throw new Error("商品名稱不能空白");
  if (!category) throw new Error("商品分類不能空白");
  if (!image) throw new Error("商品圖片路徑不能空白");

  if (status === "active" && !storefrontCategory) {
    throw new Error(
      "上架中的商品必須設定前台主分類，否則正式商城不會顯示。"
    );
  }

  if (productType === "combo" && !comboConfig) {
    throw new Error("請完成組合價格與方案設定");
  }

  if (productType !== "combo" && !salePriceAmount) {
    throw new Error("售價請填入大於 0 的整數");
  }

  const price =
    productType === "combo" && comboConfig
      ? formatComboCardPrice(comboConfig, rawSalePrice)
      : formatStandardPriceText(salePriceAmount as number, category);

  return {
    sku: optionalString(formData, "sku"),
    name,
    category,
    series: stringValue(formData, "series"),
    storefrontCategory,
    salePriceAmount,
    originalPriceAmount,
    promotionText,
    originalPrice: formatOriginalPriceText(originalPriceAmount),
    price,
    image,
    description: stringValue(formData, "description"),
    cardName: optionalString(formData, "cardName"),
    cardSubtitle: optionalString(formData, "cardSubtitle"),
    spec: optionalString(formData, "spec"),
    intro: optionalString(formData, "intro"),
    priceNote: promotionText,
    expiryNote: optionalString(formData, "expiryNote"),
    internalExpiryDate: optionalString(formData, "internalExpiryDate"),
    features: stringValues(formData, "features"),
    suitableFor: stringValues(formData, "suitableFor"),
    usage: optionalString(formData, "usage"),
    notice: optionalString(formData, "notice"),
    gallery: stringValues(formData, "gallery"),
    expandedInfo: expandedInfoValues(formData),
    comboConfig,
    status,
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
    productInputFromForm(formData, productType),
    productType
  );

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/health");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}/edit?saved=created`);
}

export async function changeProductStatusValueAction(
  id: number,
  status: ProductStatus
) {
  await requireAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !VALID_STATUSES.includes(status)
  ) {
    throw new Error("商品狀態資料無效。");
  }

  if (status === "active") {
    const product =
      await getDatabaseProduct(id);

    if (!product?.storefrontCategory) {
      throw new Error(
        "無法上架：請先在商品編輯頁設定前台主分類。"
      );
    }
  }

  await updateProductStatus(
    id,
    status
  );

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/health");
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

  const input = productInputFromForm(
    formData,
    existingProduct.productType === "combo" ? "combo" : "product"
  );

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
  revalidatePath("/admin/products/health");
  revalidatePath("/");
  revalidatePath(`/admin/products/${id}/edit`);

  redirect(`/admin/products/${id}/edit?saved=updated#save-status`);
}


export async function updateProductEditorAction(
  formData: FormData
) {
  await requireAdmin();

  const id = Number(stringValue(formData, "id"));
  const editorTab = stringValue(formData, "editorTab");

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("商品 ID 無效");
  }

  const existingProduct = await getDatabaseProduct(id);

  if (!existingProduct) {
    throw new Error("找不到這筆商品");
  }

  if (editorTab === "combo") {
    const comboConfig = parseComboConfig(formData);

    if (!comboConfig) {
      throw new Error("缺少組合價設定");
    }

    const normalizedComboConfig = {
      ...comboConfig,
      productId: id,
    };

    const product = await updateDatabaseProductPartial(id, {
      comboConfig: normalizedComboConfig,
      price: formatComboCardPrice(
        normalizedComboConfig,
        existingProduct.price
      ),
    });

    if (!product) {
      throw new Error("找不到這筆商品");
    }
  } else if (editorTab === "detail") {
    const category = stringValue(formData, "category");

    if (!category) {
      throw new Error("商品分類不能空白");
    }

    const product = await updateDatabaseProductPartial(id, {
      category,
      series: stringValue(formData, "series"),
      spec: stringValue(formData, "spec"),
      intro: stringValue(formData, "intro"),
      expiryNote: stringValue(formData, "expiryNote"),
      features: stringValues(formData, "features"),
      suitableFor: stringValues(formData, "suitableFor"),
      usage: stringValue(formData, "usage"),
      notice: stringValue(formData, "notice"),
      gallery: stringValues(formData, "gallery"),
      expandedInfo: expandedInfoValues(formData),
    });

    if (!product) {
      throw new Error("找不到這筆商品");
    }
  } else {
    const name = stringValue(formData, "name");
    const image = stringValue(formData, "image");
    const hasCombo = existingProduct.productType === "combo";
    const rawSalePrice = stringValue(formData, "price");
    const salePriceAmount = hasCombo
      ? undefined
      : normalizeMoneyAmount(rawSalePrice);
    const originalPriceAmount = normalizeMoneyAmount(
      stringValue(formData, "originalPrice")
    );
    const promotionText = optionalString(formData, "priceNote");
    const nextStatus = parseStatus(stringValue(formData, "status"));

    if (!name) {
      throw new Error("商品名稱不能空白");
    }

    if (!hasCombo && !salePriceAmount) {
      throw new Error("售價請填入大於 0 的整數");
    }

    if (!image) {
      throw new Error("商品圖片路徑不能空白");
    }

    if (
      nextStatus === "active" &&
      existingProduct.status !== "active" &&
      !existingProduct.storefrontCategory
    ) {
      throw new Error(
        "無法上架：請先在商品管理設定中指定前台主分類。"
      );
    }

    const product = await updateDatabaseProductPartial(id, {
      name,
      originalPriceAmount: originalPriceAmount ?? null,
      originalPrice: formatOriginalPriceText(originalPriceAmount) ?? "",
      promotionText: promotionText ?? null,
      ...(hasCombo
        ? {}
        : {
            salePriceAmount,
            price: formatStandardPriceText(
              salePriceAmount as number,
              existingProduct.category
            ),
          }),
      image,
      priceNote: promotionText ?? "",
      status: nextStatus,
    });

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
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/health");
  revalidatePath("/");
  revalidatePath(`/admin/products/${id}/edit`);

  const returnTo = stringValue(formData, "returnTo");

  if (returnTo === "/admin/products/health") {
    redirect(`/admin/products/health?refreshed=${id}`);
  }

  const safeTab =
    editorTab === "combo" || editorTab === "detail"
      ? editorTab
      : "card";

  redirect(
    `/admin/products/${id}/edit?saved=updated&tab=${safeTab}#save-status`
  );
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
  revalidatePath("/admin/products/health");
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
  revalidatePath("/admin/products/health");
  revalidatePath("/");
}
