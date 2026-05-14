import type { Metadata } from "next";
import { GalleryAdminPanel } from "@/components/admin/GalleryAdminPanel";
import { getGallerySettingsForAdmin } from "@/app/actions/gallery-settings-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("gallery");
}

export default async function AdminGalleryPage() {
  const gallery = await getGallerySettingsForAdmin();

  return <GalleryAdminPanel initial={gallery} />;
}
