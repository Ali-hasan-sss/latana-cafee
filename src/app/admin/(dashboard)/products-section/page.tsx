import type { Metadata } from "next";
import { ProductsSectionAdminPanel } from "@/components/admin/ProductsSectionAdminPanel";
import { getProductsSectionForAdmin } from "@/app/actions/products-section-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("products");
}

export default async function AdminProductsSectionPage() {
  const products = await getProductsSectionForAdmin();

  return <ProductsSectionAdminPanel initialProducts={products} />;
}
