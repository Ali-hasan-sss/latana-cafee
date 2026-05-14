import { getMenuPage } from "@/lib/data";
import type { MenuPageData } from "@/lib/data";
import { getFallbackMenuPageCms } from "@/lib/cms/menu-page-settings-fallback";
import {
  leanToMenuPageCms,
  mergeMenuPageCmsForAdmin,
  mergeMenuPageCmsIntoFullBase,
} from "@/lib/cms/menu-page-settings-merge";
import { connectDB } from "@/lib/db/connect";
import MenuPageSettings from "@/lib/models/MenuPageSettings";

export async function getPublicMenuPage(): Promise<MenuPageData> {
  const base = getMenuPage();
  const fallback = getFallbackMenuPageCms();
  try {
    await connectDB();
    const raw = await MenuPageSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return base;
    }
    const db = leanToMenuPageCms(raw as Parameters<typeof leanToMenuPageCms>[0]);
    const cms = mergeMenuPageCmsForAdmin(db, fallback);
    if (!cms.pricingColumns.length) {
      return base;
    }
    return mergeMenuPageCmsIntoFullBase(cms, base);
  } catch {
    return base;
  }
}
