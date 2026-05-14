"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { getFallbackSiteContactDocument } from "@/lib/cms/site-contact-fallback";
import { leanToSiteContact, type SiteContactLeanRaw } from "@/lib/cms/site-contact-merge";
import type { SiteContactDocument } from "@/lib/cms/site-contact-types";
import { connectDB } from "@/lib/db/connect";
import SiteContactSettings from "@/lib/models/SiteContactSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/menu`);
    revalidatePath(`/${loc}/blog`);
    revalidatePath(`/${loc}/gallery`);
  }
}

export async function getContactForAdmin(): Promise<SiteContactDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackSiteContactDocument();
  if (!session) {
    return fallback;
  }
  try {
    await connectDB();
    const raw = await SiteContactSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    return leanToSiteContact(raw as SiteContactLeanRaw);
  } catch {
    return fallback;
  }
}

export async function saveSiteContactSettings(
  data: SiteContactDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const payload: SiteContactDocument = {
    phone: (data.phone ?? "").trim(),
    whatsapp: (data.whatsapp ?? "").trim(),
    email: (data.email ?? "").trim(),
    mapLat:
      data.mapLat === null || data.mapLat === undefined || Number.isNaN(Number(data.mapLat))
        ? null
        : Number(data.mapLat),
    mapLng:
      data.mapLng === null || data.mapLng === undefined || Number.isNaN(Number(data.mapLng))
        ? null
        : Number(data.mapLng),
    mapEmbedSrc: (data.mapEmbedSrc ?? "").trim(),
    en: {
      address: (data.en?.address ?? "").trim(),
      hours: (data.en?.hours ?? "").trim(),
    },
    ar: {
      address: (data.ar?.address ?? "").trim(),
      hours: (data.ar?.hours ?? "").trim(),
    },
    de: {
      address: (data.de?.address ?? "").trim(),
      hours: (data.de?.hours ?? "").trim(),
    },
    social: {
      facebook: (data.social?.facebook ?? "").trim(),
      instagram: (data.social?.instagram ?? "").trim(),
      tiktok: (data.social?.tiktok ?? "").trim(),
      linkedin: (data.social?.linkedin ?? "").trim(),
      youtube: (data.social?.youtube ?? "").trim(),
      x: (data.social?.x ?? "").trim(),
    },
  };

  try {
    await connectDB();
    await SiteContactSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save contact settings." };
  }
}
