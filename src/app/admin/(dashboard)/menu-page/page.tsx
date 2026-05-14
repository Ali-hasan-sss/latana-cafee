import type { Metadata } from "next";
import { getMenuPage } from "@/lib/data";
import { getMenuPageSettingsForAdmin } from "@/app/actions/menu-page-settings-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";
import { MenuPageAdminPanel } from "@/components/admin/MenuPageAdminPanel";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("menuPage");
}

export default async function AdminMenuPagePage() {
  const initial = await getMenuPageSettingsForAdmin();
  const defaultItemImage =
    getMenuPage().pricingColumns[0]?.items[0]?.image?.trim() || "/images/IMG_8417.JPG.jpeg";

  return <MenuPageAdminPanel initial={initial} defaultItemImage={defaultItemImage} />;
}
