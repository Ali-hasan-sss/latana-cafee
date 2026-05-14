"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { saveBestSellersSectionItem } from "@/app/actions/best-sellers-section-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import type { BestSellerItemDocument } from "@/lib/cms/best-sellers-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const FORM_ID = "best-sellers-item-form";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

type Props = {
  open: boolean;
  onClose: () => void;
  productIndex: number;
  initial: BestSellerItemDocument;
  onSaved: () => void;
};

export function BestSellersItemForm({ open, onClose, productIndex, initial, onSaved }: Props) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<BestSellerItemDocument>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      id: initial.id,
      imageSrc: initial.imageSrc,
      price: initial.price,
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setCopyField = (loc: CmsLocale, field: "name" | "desc", value: string) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      const res = await saveBestSellersSectionItem(draft);
      setSaving(false);
      if (!res.ok) {
        setError(res.error ?? t("common.saveFailed"));
        return;
      }
      onSaved();
      onClose();
    },
    [draft, onClose, onSaved, t],
  );

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t("shared.bestSellerItemTitle", { n: productIndex, id: initial.id })}
      panelMaxClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/5"
          >
            {t("shared.cancel")}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={saving}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? t("shared.saving") : t("shared.save")}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
        <p className="text-xs text-white/50">{t("shared.productFormIntro")}</p>

        <AdminFileUpload
          label={t("shared.image")}
          value={draft.imageSrc}
          onChange={(url) => setDraft((d) => ({ ...d, imageSrc: url }))}
          hint={t("shared.productImageHint")}
        />

        <div>
          <label className={labelClass}>{t("shared.priceDisplay")}</label>
          <input
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="border-b border-white/10 pb-3">
          <p className="mb-2 text-xs font-medium text-white/60">{t("shared.productCopy")}</p>
          <div className="flex flex-wrap gap-1">
            {CMS_LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setTab(loc)}
                className={`rounded-t-md px-3 py-2 text-xs font-medium transition ${
                  tab === loc
                    ? "bg-white/10 text-brand-primary"
                    : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
              >
                {tLocales(loc)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>{t("shared.name")}</label>
            <input
              value={draft[tab].name}
              onChange={(e) => setCopyField(tab, "name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.description")}</label>
            <textarea
              value={draft[tab].desc}
              onChange={(e) => setCopyField(tab, "desc", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </AdminModal>
  );
}
