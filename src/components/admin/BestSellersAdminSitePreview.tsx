"use client";

import { useState } from "react";
import { BestSellersSectionView } from "@/components/sections/BestSellersSectionView";
import {
  pickBestSellersPublic,
  type BestSellersSectionDocument,
} from "@/lib/cms/best-sellers-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";
import { hrefForMenu } from "@/lib/i18n/href-menu";

const tabLabels: Record<CmsLocale, string> = {
  en: "English",
  ar: "العربية",
  de: "Deutsch",
};

type Props = {
  document: BestSellersSectionDocument;
  viewMoreLabels: Record<CmsLocale, string>;
};

export function BestSellersAdminSitePreview({ document, viewMoreLabels }: Props) {
  const [loc, setLoc] = useState<CmsLocale>("en");
  const data = pickBestSellersPublic(document, loc);
  const isRtl = loc === "ar";
  const menuHref = hrefForMenu(loc);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Live preview</h2>
          <p className="mt-0.5 text-xs text-white/45">Matches the home best sellers section layout and styles.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/30 p-0.5">
          {CMS_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLoc(l)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                loc === l
                  ? "bg-brand-primary/25 text-brand-primary"
                  : "text-white/55 hover:bg-white/5 hover:text-white/85"
              }`}
            >
              {tabLabels[l]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        dir={isRtl ? "rtl" : "ltr"}
        lang={loc}
      >
        <div className="ftco-section best-sellers-section py-16 md:py-24">
          <BestSellersSectionView
            data={data}
            viewMoreLabel={viewMoreLabels[loc]}
            isRtl={isRtl}
            menuHref={menuHref}
            preview
          />
        </div>
      </div>
    </div>
  );
}
