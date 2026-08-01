"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "../../../lib/admin-auth";
import {
  createCatalogCategory,
  updateCatalogCategoryName,
  updateCatalogCategoryStatus,
} from "../../../lib/catalog-repository";

async function requireAdmin() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin-login");
  }
}

function stringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function positiveIntegerValue(formData: FormData, name: string) {
  const value = Number(stringValue(formData, name));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("分類 ID 無效");
  }

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

  const name = stringValue(formData, "name");

  if (!name) {
    throw new Error("分類名稱不能空白");
  }

  await createCatalogCategory(name);
  revalidateCatalogPaths();
}

export async function renameCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = positiveIntegerValue(formData, "id");
  const name = stringValue(formData, "name");

  if (!name) {
    throw new Error("分類名稱不能空白");
  }

  await updateCatalogCategoryName(id, name);
  revalidateCatalogPaths();
}

export async function changeCategoryStatusAction(formData: FormData) {
  await requireAdmin();

  const id = positiveIntegerValue(formData, "id");
  const isActive = stringValue(formData, "isActive") === "true";

  await updateCatalogCategoryStatus(id, isActive);
  revalidateCatalogPaths();
}