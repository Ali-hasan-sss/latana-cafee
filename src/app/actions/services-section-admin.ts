"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { getFallbackServicesSectionDocument } from "@/lib/cms/services-section-fallback";
import { leanToServices, mergeServicesDbWithFallback } from "@/lib/cms/services-section-merge";
import type { ServicesSectionDocument } from "@/lib/cms/services-section-types";
import { connectDB } from "@/lib/db/connect";
import ServicesSectionSettings from "@/lib/models/ServicesSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

function trimSection(s: ServicesSectionDocument["en"]) {
  return {
    sub: (s.sub ?? "").trim(),
    title: (s.title ?? "").trim(),
    lead: (s.lead ?? "").trim(),
  };
}

function trimCopy(c: { title: string; text: string }) {
  return {
    title: (c.title ?? "").trim(),
    text: (c.text ?? "").trim(),
  };
}

export async function getServicesSectionForAdmin(): Promise<ServicesSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackServicesSectionDocument();
  if (!session) {
    return fallback;
  }
  try {
    await connectDB();
    const raw = await ServicesSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToServices(raw as Parameters<typeof leanToServices>[0]);
    return mergeServicesDbWithFallback(db, fallback);
  } catch {
    return fallback;
  }
}

export async function saveServicesSectionSettings(
  data: ServicesSectionDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const fallback = getFallbackServicesSectionDocument();
  if (fallback.items.length === 0) {
    return { ok: false, error: "Services template is empty." };
  }

  const incomingItems = data.items ?? [];
  if (incomingItems.length !== fallback.items.length) {
    return { ok: false, error: "Services items count does not match template." };
  }

  for (let i = 0; i < fallback.items.length; i++) {
    if (incomingItems[i]?.id !== fallback.items[i].id) {
      return { ok: false, error: "Service item ids must match the site template." };
    }
  }

  const payload: ServicesSectionDocument = {
    en: trimSection(data.en ?? { sub: "", title: "", lead: "" }),
    ar: trimSection(data.ar ?? { sub: "", title: "", lead: "" }),
    de: trimSection(data.de ?? { sub: "", title: "", lead: "" }),
    items: fallback.items.map((fb, i) => {
      const row = incomingItems[i]!;
      return {
        id: fb.id,
        icon: fb.icon,
        en: trimCopy(row.en ?? { title: "", text: "" }),
        ar: trimCopy(row.ar ?? { title: "", text: "" }),
        de: trimCopy(row.de ?? { title: "", text: "" }),
      };
    }),
  };

  try {
    await connectDB();
    await ServicesSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save services section." };
  }
}
