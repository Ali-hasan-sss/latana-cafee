import type { Metadata } from "next";
import { ContactSettingsAdminPanel } from "@/components/admin/ContactSettingsAdminPanel";
import { getContactForAdmin } from "@/app/actions/contact-settings-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("contact");
}

export default async function AdminContactPage() {
  const contact = await getContactForAdmin();

  return <ContactSettingsAdminPanel initialContact={contact} />;
}
