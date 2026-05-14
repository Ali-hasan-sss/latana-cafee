import type { Metadata } from "next";
import { AboutSectionAdminPanel } from "@/components/admin/AboutSectionAdminPanel";
import { getAboutSectionForAdmin } from "@/app/actions/about-section-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("aboutSection");
}

export default async function AdminAboutSectionPage() {
  const about = await getAboutSectionForAdmin();

  return <AboutSectionAdminPanel initialAbout={about} />;
}
