"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const mainLinks = [
  { href: "/", key: "home" as const },
  { href: "/menu", key: "menu" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/blog", key: "blog" as const },
];

/** Latin logo in the navbar for every locale */
const BRAND_NAME_EN = "Latana";
const BRAND_TAG_EN = "Cafe";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const homeActive = !pathname || pathname === "/";
  const menuActive = pathname === "/menu";
  const galleryActive = pathname === "/gallery";
  const blogActive =
    pathname === "/blog" || (pathname?.startsWith("/blog/") ?? false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => {
    setOpen(false);
  };

  const brandBlock = (
    <>
      <span className="font-accent text-[1.75rem] font-normal leading-none text-white md:text-[2rem]">
        {BRAND_NAME_EN}
      </span>
      <small className="ms-0.5 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-brand-primary md:text-[1.05rem]">
        {BRAND_TAG_EN}
      </small>
    </>
  );

  return (
    <nav
      id="ftco-navbar"
      dir="ltr"
      lang="en"
      className={`navbar ftco_navbar fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-out [direction:ltr] ${
        scrolled
          ? "border-white/10 bg-[#0a0a0a] shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          : "border-white/5 bg-[#0a0a0a]/88 backdrop-blur-[2px]"
      }`}
    >
      <Container className="relative">
        <div className="flex flex-wrap items-center justify-between gap-y-2 py-2 md:py-0">
          {/* navbar-brand — Coffee<small>Blend</small> style */}
          <Link
            href="/"
            className="navbar-brand order-1 mb-0 inline-flex items-baseline no-underline hover:opacity-95"
            onClick={closeMobile}
          >
            {brandBlock}
          </Link>

          {/* navbar-toggler — icon + "Menu" */}
          <button
            type="button"
            className="navbar-toggler order-3 inline-flex items-center border border-white/25 bg-transparent px-3 py-2 text-[13px] font-medium uppercase tracking-wide text-white md:hidden"
            aria-expanded={open}
            aria-controls="ftco-nav"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="oi oi-menu me-2 flex flex-col justify-center gap-[5px]" aria-hidden>
              <span className="block h-0.5 w-[22px] bg-white" />
              <span className="block h-0.5 w-[22px] bg-white" />
              <span className="block h-0.5 w-[22px] bg-white" />
            </span>
            {t("toggleNav")}
          </button>

          {/* collapse navbar-collapse — ml-auto nav */}
          <div
            id="ftco-nav"
            className={`navbar-collapse order-4 w-full basis-full md:order-2 md:flex md:w-auto md:basis-auto md:items-stretch ${
              open ? "block" : "hidden md:block"
            }`}
          >
            <ul className="navbar-nav ms-0 flex flex-col md:ms-auto md:flex-row md:items-center md:gap-0">
              {mainLinks.map((item) => {
                const isActive =
                  (item.key === "home" && homeActive) ||
                  (item.key === "menu" && menuActive) ||
                  (item.key === "gallery" && galleryActive) ||
                  (item.key === "blog" && blogActive);
                return (
                <li
                  key={item.key}
                  className={`nav-item border-b border-white/10 md:border-0 ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Link
                    href={item.href}
                    className={`nav-link block px-3 py-3 text-[13px] font-medium uppercase tracking-[0.12em] no-underline transition-colors md:px-3 md:py-[1.35rem] ${
                      isActive
                        ? "text-brand-primary"
                        : "text-white/90 hover:text-brand-primary"
                    }`}
                    onClick={closeMobile}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
              })}

              {/* Language — compact, template has no i18n; keep minimal */}
              <li className="nav-item flex items-center border-b border-white/10 px-3 py-2 md:border-0 md:py-0 md:ps-2 md:pe-1">
                <LanguageSwitcher />
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </nav>
  );
}
