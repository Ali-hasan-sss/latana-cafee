"use client";

import { useState } from "react";
import { MenuPreviewSectionView } from "@/components/sections/MenuPreviewSectionView";
import type { MenuPreviewSectionDocument } from "@/lib/cms/menu-preview-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";
import { hrefForMenu } from "@/lib/i18n/href-menu";

const tabLabels: Record<CmsLocale, string> = {
  en: "English",
  ar: "العربية",
  de: "Deutsch",
};

function padFour(slots: string[]): string[] {
  const a = [...slots].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

type Props = {
  document: MenuPreviewSectionDocument;
  menuPdf: string;
  pdfMenuLabels: Record<CmsLocale, string>;
};

/**
 * Live preview of the home menu block (same layout/classes as the public site),
 * with locale tabs and site-like background inside the admin dashboard.
 */
export function MenuPreviewAdminSitePreview({ document, menuPdf, pdfMenuLabels }: Props) {
  const [loc, setLoc] = useState<CmsLocale>("en");
  const b = document[loc];
  const isRtl = loc === "ar";
  const menuHref = hrefForMenu(loc);
  const images = padFour(document.imageSrcs);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Live preview</h2>
          <p className="mt-0.5 text-xs text-white/45">Matches the home section layout and styles.</p>
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
        className="overflow-hidden rounded-xl border border-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        dir={isRtl ? "rtl" : "ltr"}
        lang={loc}
      >
        <div
          className="ftco-section py-16 text-brand-dark md:py-20"
          style={{
            backgroundColor: "#faf8f5",
            backgroundImage: "url(/images/bg_4.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <MenuPreviewSectionView
            sub={b.sub}
            title={b.title}
            text={b.text}
            cta={b.cta}
            gridAria={b.gridAria}
            images={images}
            menuPdf={menuPdf}
            pdfMenuLabel={pdfMenuLabels[loc]}
            isRtl={isRtl}
            menuHref={menuHref}
          />
        </div>
      </div>
    </div>
  );
}
