"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminLogout } from "@/app/actions/admin-auth";
import type { AdminUiLocale } from "@/lib/admin/get-admin-locale";
import { AdminLangSwitch } from "@/components/admin/AdminLangSwitch";
import {
  AdminUnsavedChangesProvider,
  useAdminUnsavedChanges,
} from "@/components/admin/AdminUnsavedChangesProvider";

const overviewNav = { href: "/admin", navKey: "overview", exact: true } as const;

/** Sections that appear on the public home page (order matches typical home layout). */
const homePageNavItems = [
  { href: "/admin/hero-slider", navKey: "heroSlider", exact: false },
  { href: "/admin/about-section", navKey: "aboutSection", exact: false },
  { href: "/admin/services-section", navKey: "servicesSection", exact: false },
  { href: "/admin/menu-preview-section", navKey: "menuPreview", exact: false },
  { href: "/admin/counter-section", navKey: "counter", exact: false },
  { href: "/admin/best-sellers-section", navKey: "bestSellers", exact: false },
  { href: "/admin/products-section", navKey: "products", exact: false },
] as const;

const otherNavItems = [
  { href: "/admin/menu-page", navKey: "menuPage", exact: false },
  { href: "/admin/blog-posts", navKey: "blog", exact: false },
  { href: "/admin/gallery", navKey: "gallery", exact: false },
  { href: "/admin/contact", navKey: "contact", exact: false },
] as const;

function isNavActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  exact,
  nested = false,
}: {
  href: string;
  label: string;
  exact: boolean;
  nested?: boolean;
}) {
  const pathname = usePathname();
  const { tryNavigate } = useAdminUnsavedChanges();
  const active = isNavActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        tryNavigate(href);
      }}
      className={`block rounded-lg font-medium transition ${
        nested ? "px-2 py-1.5 text-[13px]" : "px-3 py-2 text-sm"
      } ${
        active
          ? "bg-brand-primary/20 text-brand-primary"
          : "text-white/75 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function HomePageNavGroup() {
  const pathname = usePathname();
  const t = useTranslations("adminUi");
  const childActive = homePageNavItems.some((item) => isNavActive(pathname, item.href, item.exact));
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm font-medium transition ${
          childActive
            ? "bg-brand-primary/15 text-brand-primary"
            : "text-white/75 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="min-w-0 flex-1">{t("nav.homePage")}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="ms-1 space-y-0.5 border-s border-white/12 py-1 ps-2">
          {homePageNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.navKey}`)}
              exact={item.exact}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AdminDashboardShellInner({
  children,
  adminUiLocale,
}: {
  children: React.ReactNode;
  adminUiLocale: AdminUiLocale;
}) {
  const t = useTranslations("adminUi");
  const pathname = usePathname();
  const { tryNavigate } = useAdminUnsavedChanges();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#0d0d0d] text-white">
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#111] px-4 md:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
            aria-controls="admin-dashboard-sidebar"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? t("shell.closeNav") : t("shell.openNav")}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <span className="text-sm font-semibold tracking-wide text-white/95">{t("shell.brand")}</span>
          <span className="hidden text-xs text-white/40 sm:inline">{t("shell.badge")}</span>
        </div>
        <div className="flex items-center gap-2">
          <AdminLangSwitch current={adminUiLocale} />
          <Link
            href="/"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              tryNavigate("/");
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {t("shell.viewSite")}
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              {t("shell.signOut")}
            </button>
          </form>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-14 z-30 cursor-default bg-black/55 md:hidden"
            aria-label={t("shell.closeNav")}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        <aside
          id="admin-dashboard-sidebar"
          className={`flex w-[220px] shrink-0 flex-col border-e border-white/10 bg-[#111] md:relative md:z-auto md:flex md:w-[240px] max-md:fixed max-md:bottom-0 max-md:start-0 max-md:top-14 max-md:z-40 max-md:shadow-2xl ${
            mobileNavOpen ? "max-md:flex" : "max-md:hidden"
          }`}
        >
          <div className="shrink-0 border-b border-white/10 px-3 py-3">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t("shell.content")}
            </p>
          </div>
          <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-3">
            <NavLink
              href={overviewNav.href}
              label={t(`nav.${overviewNav.navKey}`)}
              exact={overviewNav.exact}
            />
            <HomePageNavGroup />
            {otherNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={t(`nav.${item.navKey}`)}
                exact={item.exact}
              />
            ))}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#0d0d0d] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminDashboardShell({
  children,
  adminUiLocale,
}: {
  children: React.ReactNode;
  adminUiLocale: AdminUiLocale;
}) {
  return (
    <AdminUnsavedChangesProvider>
      <AdminDashboardShellInner adminUiLocale={adminUiLocale}>{children}</AdminDashboardShellInner>
    </AdminUnsavedChangesProvider>
  );
}
