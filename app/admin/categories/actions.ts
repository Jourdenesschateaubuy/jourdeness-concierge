"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";
import {
  createCatalogCategory,
  createCatalogSeries,
  deleteCatalogCategory,
  deleteCatalogSeries,
  updateCatalogCategoryName,
  updateCatalogCategorySortOrders,
  updateCatalogCategoryStatus,
  updateCatalogSeriesName,
  updateCatalogSeriesSortOrders,
  updateCatalogSeriesStatus,
} from "../../../lib/catalog-repository";

async function requireAdmin() {
  if (!(await hasValidAdminSession())) redirect("/admin-login");
}

function stringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function positiveId(formData: FormData, name = "id") {
  const value = Number(stringValue(formData, name));
  if (!Number.isInteger(value) || value <= 0) throw new Error("資料 ID 無效");
  return value;
}

function revalidateCatalogPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  await createCatalogCategory(stringValue(formData, "name"));
  revalidateCatalogPaths();
}

export async function renameCategoryAction(formData: FormData) {
  await requireAdmin();
  await updateCatalogCategoryName(
    positiveId(formData),
    stringValue(formData, "name")
  );
  revalidateCatalogPaths();
}

export async function changeCategoryStatusAction(formData: FormData) {
  await requireAdmin();
  await updateCatalogCategoryStatus(
    positiveId(formData),
    stringValue(formData, "isActive") === "true"
  );
  revalidateCatalogPaths();
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  await deleteCatalogCategory(positiveId(formData));
  revalidateCatalogPaths();
}

export async function saveCategoryOrderAction(
  items: Array<{ id: number; sortOrder: number }>
) {
  await requireAdmin();
  await updateCatalogCategorySortOrders(items);
  revalidateCatalogPaths();
}

export async function createSeriesAction(formData: FormData) {
  await requireAdmin();
  await createCatalogSeries(
    positiveId(formData, "categoryId"),
    stringValue(formData, "name")
  );
  revalidateCatalogPaths();
}

export async function renameSeriesAction(formData: FormData) {
  await requireAdmin();
  await updateCatalogSeriesName(
    positiveId(formData),
    stringValue(formData, "name")
  );
  revalidateCatalogPaths();
}

export async function changeSeriesStatusAction(formData: FormData) {
  await requireAdmin();
  await updateCatalogSeriesStatus(
    positiveId(formData),
    stringValue(formData, "isActive") === "true"
  );
  revalidateCatalogPaths();
}

export async function deleteSeriesAction(formData: FormData) {
  await requireAdmin();
  await deleteCatalogSeries(positiveId(formData));
  revalidateCatalogPaths();
}

export async function saveSeriesOrderAction(
  items: Array<{ id: number; sortOrder: number }>
) {
  await requireAdmin();
  await updateCatalogSeriesSortOrders(items);
  revalidateCatalogPaths();
}
