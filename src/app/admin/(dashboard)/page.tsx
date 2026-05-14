import type { Metadata } from "next";
import Link from "next/link";
import { getAdminTranslator } from "@/lib/admin/admin-i18n";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("overview");
}

const cards = [
  { href: "/admin/hero-slider", key: "heroSlider" },
  { href: "/admin/about-section", key: "aboutSection" },
  { href: "/admin/services-section", key: "servicesSection" },
  { href: "/admin/menu-preview-section", key: "menuPreview" },
  { href: "/admin/menu-page", key: "menuPage" },
  { href: "/admin/counter-section", key: "counter" },
  { href: "/admin/best-sellers-section", key: "bestSellers" },
  { href: "/admin/products-section", key: "products" },
  { href: "/admin/blog-posts", key: "blog" },
  { href: "/admin/gallery", key: "gallery" },
  { href: "/admin/contact", key: "contact" },
] as const;

export default async function AdminOverviewPage() {
  const locale = await getAdminLocale();
  const t = getAdminTranslator(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{t("overview.title")}</h1>
        <p className="mt-1 text-sm text-white/55">{t("overview.lead")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, key }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-primary/40 hover:bg-white/[0.06]"
          >
            <h2 className="text-sm font-semibold text-brand-primary">
              {t(`overview.cards.${key}.title`)}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              {t(`overview.cards.${key}.desc`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
