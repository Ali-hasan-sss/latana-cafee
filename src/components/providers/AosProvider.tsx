"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

type Props = {
  children: React.ReactNode;
};

export function AosProvider({ children }: Props) {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    AOS.init({
      duration: 800,
      easing: "ease-in-out-cubic",
      once: true,
      offset: 72,
      anchorPlacement: "top-bottom",
      disable: reduceMotion,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [pathname, locale]);

  return <>{children}</>;
}
