import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("login");
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
