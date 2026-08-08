"use server";

import { revalidatePath } from "next/cache";

import {
  publishBannerDraft,
  rollbackBannerToVersion,
  saveBannerDraft,
} from "../../../../lib/cms/modules/banner/repository";

import type {
  BannerItem,
} from "../../../../lib/cms/modules/banner/types";

function parseItems(
  formData: FormData
): BannerItem[] {
  const raw = String(
    formData.get("itemsJson") || "[]"
  );

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Banner Draft 資料格式錯誤。"
    );
  }

  return parsed.map(
    (item, index) => ({
      id:
        String(
          item?.id ||
            `banner-${index + 1}`
        ),
      name:
        String(
          item?.name ||
            `Banner ${index + 1}`
        ).trim(),
      title:
        String(
          item?.title || ""
        ).trim(),
      subtitle:
        String(
          item?.subtitle || ""
        ).trim(),
      buttonLabel:
        String(
          item?.buttonLabel || ""
        ).trim(),
      mobileMediaId:
        Number.isInteger(
          Number(item?.mobileMediaId)
        ) &&
        Number(item?.mobileMediaId) > 0
          ? Number(item.mobileMediaId)
          : null,
      desktopMediaId:
        Number.isInteger(
          Number(item?.desktopMediaId)
        ) &&
        Number(item?.desktopMediaId) > 0
          ? Number(item.desktopMediaId)
          : null,
      mobileImage:
        String(
          item?.mobileImage || ""
        ).trim(),
      desktopImage:
        String(
          item?.desktopImage || ""
        ).trim(),
      alt:
        String(
          item?.alt || ""
        ).trim(),
      linkType:
        ["url", "category", "product", "none"].includes(
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

export async function saveBannerDraftAction(
  formData: FormData
) {
  await saveBannerDraft({
    items: parseItems(formData),
  });

  revalidatePath(
    "/admin/website-studio/banner"
  );
}

export async function publishBannerAction() {
  await publishBannerDraft();

  revalidatePath(
    "/admin/website-studio/banner"
  );
}

export async function rollbackBannerAction(
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
      "Banner Version 無效。"
    );
  }

  await rollbackBannerToVersion(
    versionNumber
  );

  revalidatePath(
    "/admin/website-studio/banner"
  );
}
