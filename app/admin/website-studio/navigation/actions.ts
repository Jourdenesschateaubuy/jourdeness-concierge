"use server";

import { revalidatePath } from "next/cache";

import {
  publishNavigationDraft,
  rollbackNavigationToVersion,
  saveNavigationDraft,
} from "../../../../lib/cms/modules/navigation/repository";

import type {
  NavigationItem,
} from "../../../../lib/cms/modules/navigation/types";

function parseItems(
  formData: FormData
): NavigationItem[] {
  const raw = String(
    formData.get("itemsJson") || "[]"
  );

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Navigation Draft 資料格式錯誤。"
    );
  }

  return parsed.map(
    (item, index) => ({
      id:
        String(
          item?.id ||
            `item-${index + 1}`
        ),
      label:
        String(
          item?.label ||
            `選單 ${index + 1}`
        ).trim(),
      linkType:
        ["url", "category", "homepage", "none"].includes(
          item?.linkType
        )
          ? item.linkType
          : "url",
      linkValue:
        String(
          item?.linkValue || ""
        ).trim(),
      isVisible:
        item?.isVisible !== false,
    })
  );
}

export async function saveNavigationDraftAction(
  formData: FormData
) {
  await saveNavigationDraft({
    items: parseItems(formData),
  });

  revalidatePath(
    "/admin/website-studio/navigation"
  );
}

export async function publishNavigationAction() {
  await publishNavigationDraft();

  revalidatePath(
    "/admin/website-studio/navigation"
  );
}

export async function rollbackNavigationAction(
  formData: FormData
) {
  const versionNumber = Number(
    formData.get("versionNumber")
  );

  if (
    !Number.isInteger(versionNumber) ||
    versionNumber <= 0
  ) {
    throw new Error(
      "Navigation Version 無效。"
    );
  }

  await rollbackNavigationToVersion(
    versionNumber
  );

  revalidatePath(
    "/admin/website-studio/navigation"
  );
}
