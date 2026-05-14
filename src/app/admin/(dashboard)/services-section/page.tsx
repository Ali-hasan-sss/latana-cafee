import type { Metadata } from "next";
import { ServicesSectionAdminPanel } from "@/components/admin/ServicesSectionAdminPanel";
import { getServicesSectionForAdmin } from "@/app/actions/services-section-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("servicesSection");
}

export default async function AdminServicesSectionPage() {
  const services = await getServicesSectionForAdmin();

  return <ServicesSectionAdminPanel initialServices={services} />;
}
