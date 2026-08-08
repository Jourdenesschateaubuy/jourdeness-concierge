"use server";

import { revalidatePath } from "next/cache";

import {
  publishWebsiteSettingsDraft,
  rollbackWebsiteSettingsToVersion,
  saveWebsiteSettingsDraft,
} from "../../../../lib/cms/modules/website-settings/repository";

import type {
  WebsiteSettingsData,
} from "../../../../lib/cms/modules/website-settings/types";

function field(
  formData: FormData,
  name: string
) {
  return String(
    formData.get(name) || ""
  ).trim();
}

export async function saveWebsiteSettingsAction(
  formData: FormData
) {
  const settings: WebsiteSettingsData = {
    siteName:
      field(formData, "siteName") ||
      "Jourdeness",
    siteTagline:
      field(formData, "siteTagline"),

    supportPhone:
      field(formData, "supportPhone"),
    supportEmail:
      field(formData, "supportEmail"),
    lineUrl:
      field(formData, "lineUrl"),
    serviceHours:
      field(formData, "serviceHours"),
    companyAddress:
      field(formData, "companyAddress"),

    facebookUrl:
      field(formData, "facebookUrl"),
    instagramUrl:
      field(formData, "instagramUrl"),
    threadsUrl:
      field(formData, "threadsUrl"),
    youtubeUrl:
      field(formData, "youtubeUrl"),
    tiktokUrl:
      field(formData, "tiktokUrl"),

    seoTitle:
      field(formData, "seoTitle"),
    seoDescription:
      field(formData, "seoDescription"),

    companyName:
      field(formData, "companyName"),
    taxId:
      field(formData, "taxId"),
    copyrightText:
      field(formData, "copyrightText"),

    language:
      field(formData, "language") ||
      "zh-TW",
    timezone:
      field(formData, "timezone") ||
      "Asia/Taipei",
    currency:
      field(formData, "currency") ||
      "TWD",
  };

  await saveWebsiteSettingsDraft(
    settings
  );

  revalidatePath(
    "/admin/website-studio/settings"
  );
}

export async function publishWebsiteSettingsAction() {
  await publishWebsiteSettingsDraft();

  revalidatePath(
    "/admin/website-studio/settings"
  );
}

export async function rollbackWebsiteSettingsAction(
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
      "Website Settings Version 無效。"
    );
  }

  await rollbackWebsiteSettingsToVersion(
    versionNumber
  );

  revalidatePath(
    "/admin/website-studio/settings"
  );
}
