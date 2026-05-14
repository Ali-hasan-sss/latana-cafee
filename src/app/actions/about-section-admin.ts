"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { getFallbackAboutSectionDocument } from "@/lib/cms/about-section-fallback";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { leanToAbout } from "@/lib/cms/about-section-merge";
import type { AboutSectionDocument } from "@/lib/cms/about-section-types";
import { connectDB } from "@/lib/db/connect";
import AboutSectionSettings from "@/lib/models/AboutSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

export async function getAboutSectionForAdmin(): Promise<AboutSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackAboutSectionDocument();
  if (!session) {
    return fallback;
  }
  try {
    await connectDB();
    const raw = await AboutSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    return leanToAbout(raw as Parameters<typeof leanToAbout>[0]);
  } catch {
    return fallback;
  }
}

export async function saveAboutSectionSettings(
  data: AboutSectionDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const payload: AboutSectionDocument = {
    imageSrc: (data.imageSrc ?? "").trim(),
    en: {
      sub: (data.en?.sub ?? "").trim(),
      title: (data.en?.title ?? "").trim(),
      text: (data.en?.text ?? "").trim(),
    },
    ar: {
      sub: (data.ar?.sub ?? "").trim(),
      title: (data.ar?.title ?? "").trim(),
      text: (data.ar?.text ?? "").trim(),
    },
    de: {
      sub: (data.de?.sub ?? "").trim(),
      title: (data.de?.title ?? "").trim(),
      text: (data.de?.text ?? "").trim(),
    },
  };

  if (!payload.imageSrc) {
    return { ok: false, error: "Section image is required." };
  }

  try {
    await connectDB();
    const prev = await AboutSectionSettings.findOne({ key: "default" }).lean().exec();
    const prevImg =
      prev && typeof prev === "object" && "imageSrc" in prev
        ? String((prev as { imageSrc?: string }).imageSrc ?? "").trim()
        : "";

    if (prevImg && prevImg !== payload.imageSrc && prevImg.startsWith("/uploads/")) {
      await deletePublicUploadIfSafe(prevImg);
    }

    await AboutSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save about section." };
  }
}
