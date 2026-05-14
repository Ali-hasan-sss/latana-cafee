"use client";

import { useEffect } from "react";

type Props = { locale: string };

/** Syncs document `lang` / `dir` with the active locale (root layout stays generic). */
export function DocumentLang({ locale }: Props) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
