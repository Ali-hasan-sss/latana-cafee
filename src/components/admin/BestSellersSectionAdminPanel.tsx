"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { BestSellersAdminSitePreview } from "@/components/admin/BestSellersAdminSitePreview";
import { BestSellersHeadingsForm } from "@/components/admin/BestSellersHeadingsForm";
import { BestSellersItemForm } from "@/components/admin/BestSellersItemForm";
import type { BestSellersSectionDocument } from "@/lib/cms/best-sellers-section-types";
import type { CmsLocale } from "@/lib/cms/hero-slider-types";

type Props = {
  initialBestSellers: BestSellersSectionDocument;
  viewMoreLabels: Record<CmsLocale, string>;
};

export function BestSellersSectionAdminPanel({ initialBestSellers, viewMoreLabels }: Props) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<BestSellersSectionDocument>(initialBestSellers);
  const [headingsOpen, setHeadingsOpen] = useState(false);
  const [itemOpenId, setItemOpenId] = useState<string | null>(null);

  useEffect(() => {
    setSnapshot(initialBestSellers);
  }, [initialBestSellers]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  const headings: Pick<BestSellersSectionDocument, "en" | "ar" | "de"> = {
    en: snapshot.en,
    ar: snapshot.ar,
    de: snapshot.de,
  };

  const openItem = snapshot.items.find((i) => i.id === itemOpenId);
  const openItemIndex = openItem ? snapshot.items.findIndex((i) => i.id === itemOpenId) + 1 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">{t("panels.bestSellers.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.bestSellers.lead")}</p>
      </div>

      <BestSellersAdminSitePreview document={snapshot} viewMoreLabels={viewMoreLabels} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/80">{t("panels.bestSellers.headings")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t("shared.headingsEn")}
            </p>
            <p className="truncate text-sm font-medium text-white">
              {snapshot.en.title || t("common.dash")}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-white/50">
              {snapshot.en.lead || t("common.dash")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHeadingsOpen(true)}
            className="shrink-0 rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
          >
            {t("common.edit")}
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/80">{t("panels.bestSellers.products")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20"
            >
              <div
                className="h-36 bg-cover bg-center sm:h-40"
                style={{ backgroundImage: `url(${item.imageSrc})` }}
                role="img"
                aria-label={item.en.name}
              />
              <div className="flex flex-1 flex-col p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{item.id}</p>
                <p className="line-clamp-2 text-sm font-medium text-white">{item.en.name}</p>
                <p className="mt-1 text-xs text-brand-primary">€{item.price}</p>
                <div className="mt-3 flex flex-1 items-end">
                  <button
                    type="button"
                    onClick={() => setItemOpenId(item.id)}
                    className="w-full rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
                  >
                    {t("common.edit")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BestSellersHeadingsForm
        open={headingsOpen}
        onClose={() => setHeadingsOpen(false)}
        initial={headings}
        onSaved={onSaved}
      />

      {itemOpenId && openItem ? (
        <BestSellersItemForm
          open
          onClose={() => setItemOpenId(null)}
          productIndex={openItemIndex}
          initial={openItem}
          onSaved={onSaved}
        />
      ) : null}
    </div>
  );
}
