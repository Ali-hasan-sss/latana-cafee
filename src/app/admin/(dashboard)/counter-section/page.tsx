import type { Metadata } from "next";
import { CounterSectionAdminPanel } from "@/components/admin/CounterSectionAdminPanel";
import { getCounterSectionForAdmin } from "@/app/actions/counter-section-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("counter");
}

export default async function AdminCounterSectionPage() {
  const counter = await getCounterSectionForAdmin();

  return <CounterSectionAdminPanel initialCounter={counter} />;
}
