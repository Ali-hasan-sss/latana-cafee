import { redirect } from "next/navigation";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminSession } from "@/lib/auth/get-admin-session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const adminUiLocale = await getAdminLocale();

  return <AdminDashboardShell adminUiLocale={adminUiLocale}>{children}</AdminDashboardShell>;
}
