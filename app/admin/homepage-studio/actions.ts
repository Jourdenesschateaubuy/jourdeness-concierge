"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import {
  addProductToStorefrontSection,
  createHomepageStorefrontSection,
  deleteHomepageStorefrontSection,
  removeProductFromStorefrontSection,
  updateHomepageStorefrontSection,
  updateStorefrontSectionItemSortOrders,
  updateStorefrontSectionSortOrders,
} from "../../../lib/storefront-section-repository";
import { withDbClient } from "../../../lib/db";
import {
  publishHomepageDraft,
  rollbackHomepageToVersion,
} from "../../../lib/cms/modules/homepage/publication";

function revalidateHomepageStudio() {
  revalidatePath("/admin/homepage-studio");
  revalidatePath("/");
  revalidatePath("/api/storefront/homepage-sections");
}

export async function createHomepageSectionAction(
  formData: FormData
) {
  const name = String(
    formData.get("name") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const desktopColumnsRaw = Number(
    formData.get("desktopColumns") || 4
  );
  const desktopColumns =
    desktopColumnsRaw === 3 || desktopColumnsRaw === 5
      ? desktopColumnsRaw
      : 4;

  const mobileColumns =
    Number(formData.get("mobileColumns") || 2) === 1
      ? 1
      : 2;

  const maxItems = Math.max(
    1,
    Math.min(24, Number(formData.get("maxItems") || 8))
  );

  const backgroundStyleRaw = String(
    formData.get("backgroundStyle") || "default"
  );

  const backgroundStyle =
    backgroundStyleRaw === "soft" ||
    backgroundStyleRaw === "white"
      ? backgroundStyleRaw
      : "default";

  if (!name) {
    throw new Error("首頁區塊名稱必填");
  }

  const code = `home-${randomUUID().slice(0, 8)}`;

  await createHomepageStorefrontSection({
    code,
    name,
    description,
    desktopColumns,
    mobileColumns,
    maxItems,
    backgroundStyle,
  });

  revalidateHomepageStudio();
}

export async function updateHomepageSectionAction(
  formData: FormData
) {
  const sectionId = Number(
    formData.get("sectionId")
  );

  const name = String(
    formData.get("name") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const desktopColumnsRaw = Number(
    formData.get("desktopColumns") || 4
  );
  const desktopColumns =
    desktopColumnsRaw === 3 || desktopColumnsRaw === 5
      ? desktopColumnsRaw
      : 4;

  const mobileColumns =
    Number(formData.get("mobileColumns") || 2) === 1
      ? 1
      : 2;

  const maxItems = Math.max(
    1,
    Math.min(24, Number(formData.get("maxItems") || 8))
  );

  const backgroundStyleRaw = String(
    formData.get("backgroundStyle") || "default"
  );

  const backgroundStyle =
    backgroundStyleRaw === "soft" ||
    backgroundStyleRaw === "white"
      ? backgroundStyleRaw
      : "default";

  await updateHomepageStorefrontSection(
    sectionId,
    {
      name,
      description,
      desktopColumns,
      mobileColumns,
      maxItems,
      backgroundStyle,
    }
  );

  revalidateHomepageStudio();
}

export async function deleteHomepageSectionAction(
  formData: FormData
) {
  const sectionId = Number(
    formData.get("sectionId")
  );

  await deleteHomepageStorefrontSection(
    sectionId
  );

  revalidateHomepageStudio();
}

export async function addProductAction(
  formData: FormData
) {
  const sectionId = Number(
    formData.get("sectionId")
  );

  const productId = Number(
    formData.get("productId")
  );

  if (!sectionId || !productId) {
    throw new Error(
      "缺少 sectionId 或 productId"
    );
  }

  await addProductToStorefrontSection(
    sectionId,
    productId
  );

  revalidatePath(
    `/admin/homepage-studio/${sectionId}`
  );

  revalidateHomepageStudio();
}

export async function toggleHomepageSectionStatusAction(
  formData: FormData
) {
  const sectionId = Number(
    formData.get("sectionId")
  );

  if (!sectionId) {
    throw new Error("缺少 sectionId");
  }

  await withDbClient(
    async (client) => {
      const result = await client.query(
        `
          UPDATE storefront_sections
          SET
            is_active = NOT is_active,
            updated_at = NOW()
          WHERE id = $1
            AND section_type = 'homepage'
          RETURNING id
        `,
        [sectionId]
      );

      if (!result.rows[0]) {
        throw new Error("找不到首頁區塊");
      }
    }
  );

  revalidateHomepageStudio();
}

export async function saveHomepageSectionSortOrderAction(
  orderedSectionIds: number[]
) {
  if (!Array.isArray(orderedSectionIds)) {
    throw new Error("首頁區塊排序資料無效");
  }

  await updateStorefrontSectionSortOrders(
    orderedSectionIds
  );

  revalidateHomepageStudio();
}

export async function publishHomepageAction() {
  await publishHomepageDraft();
  revalidateHomepageStudio();
}

export async function rollbackHomepageAction(
  formData: FormData
) {
  const versionId = Number(
    formData.get("versionId")
  );

  if (
    !Number.isInteger(versionId) ||
    versionId <= 0
  ) {
    throw new Error("版本 ID 無效");
  }

  await rollbackHomepageToVersion(
    versionId
  );

  revalidateHomepageStudio();
}

export async function addHomepageProductInlineAction(
  sectionId: number,
  productId: number
) {
  if (
    !Number.isInteger(sectionId) ||
    sectionId <= 0 ||
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("首頁商品資料無效");
  }

  await addProductToStorefrontSection(
    sectionId,
    productId
  );

  revalidateHomepageStudio();
}

export async function removeHomepageProductInlineAction(
  sectionId: number,
  productId: number
) {
  if (
    !Number.isInteger(sectionId) ||
    sectionId <= 0 ||
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("首頁商品資料無效");
  }

  await removeProductFromStorefrontSection(
    sectionId,
    productId
  );

  revalidateHomepageStudio();
}

export async function saveHomepageProductSortOrderAction(
  sectionId: number,
  orderedProductIds: number[]
) {
  if (
    !Number.isInteger(sectionId) ||
    sectionId <= 0 ||
    !Array.isArray(orderedProductIds)
  ) {
    throw new Error("首頁商品排序資料無效");
  }

  const uniqueIds =
    new Set(orderedProductIds);

  if (
    uniqueIds.size !==
    orderedProductIds.length
  ) {
    throw new Error(
      "首頁商品排序含有重複商品"
    );
  }

  await updateStorefrontSectionItemSortOrders(
    sectionId,
    orderedProductIds
  );

  revalidateHomepageStudio();
}

