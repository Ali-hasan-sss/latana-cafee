"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { getFallbackHeroSlidesAdmin } from "@/lib/cms/hero-slider-fallback";
import type { HeroSlideAdmin } from "@/lib/cms/hero-slider-types";
import { connectDB } from "@/lib/db/connect";
import HeroSliderSettings from "@/lib/models/HeroSliderSettings";
import { routing } from "@/i18n/routing";

function revalidateHomePages() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

export async function getHeroSlidesForAdmin(): Promise<HeroSlideAdmin[]> {
  const session = await getAdminSession();
  if (!session) {
    return [];
  }
  try {
    await connectDB();
    const doc = await HeroSliderSettings.findOne({ key: "default" }).lean().exec();
    if (doc?.slides?.length) {
      return [...doc.slides]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          _id: s._id?.toString(),
          imageSrc: s.imageSrc,
          order: s.order,
          en: { title: s.en?.title ?? "", text: s.en?.text ?? "" },
          ar: { title: s.ar?.title ?? "", text: s.ar?.text ?? "" },
          de: { title: s.de?.title ?? "", text: s.de?.text ?? "" },
        }));
    }
  } catch {
    return getFallbackHeroSlidesAdmin();
  }
  return getFallbackHeroSlidesAdmin();
}

export async function saveHeroSlidesForAdmin(
  slides: HeroSlideAdmin[],
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const cleaned = slides.map((s, i) => ({
    imageSrc: (s.imageSrc ?? "").trim(),
    order: i,
    en: {
      title: (s.en?.title ?? "").trim(),
      text: (s.en?.text ?? "").trim(),
    },
    ar: {
      title: (s.ar?.title ?? "").trim(),
      text: (s.ar?.text ?? "").trim(),
    },
    de: {
      title: (s.de?.title ?? "").trim(),
      text: (s.de?.text ?? "").trim(),
    },
  }));

  if (cleaned.length === 0) {
    try {
      await connectDB();
      await HeroSliderSettings.deleteMany({ key: "default" });
      revalidateHomePages();
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Could not update the database." };
    }
  }

  for (const s of cleaned) {
    if (!s.imageSrc) {
      return { ok: false, error: "Each slide needs an image path or URL." };
    }
  }

  try {
    await connectDB();
    await HeroSliderSettings.findOneAndUpdate(
      { key: "default" },
      { $set: { slides: cleaned } },
      { upsert: true, new: true },
    );
    revalidateHomePages();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save to the database." };
  }
}
