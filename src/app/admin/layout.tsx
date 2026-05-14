import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getAdminUiClientMessages } from "@/lib/admin/admin-i18n";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  return (
    <div className="min-h-dvh bg-[#111] text-white">
      <NextIntlClientProvider locale={locale} messages={getAdminUiClientMessages(locale)}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
