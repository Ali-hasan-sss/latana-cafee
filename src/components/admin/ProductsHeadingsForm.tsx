"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { saveProductsSectionHeadings } from "@/app/actions/products-section-admin";
import { AdminModal } from "@/components/admin/AdminModal";
import type { ProductsHeadingsOnly } from "@/lib/cms/products-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const FORM_ID = "products-section-headings-form";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

type Props = {
  open: boolean;
  onClose: () => void;
  initial: ProductsHeadingsOnly;
  onSaved: () => void;
};

export function ProductsHeadingsForm({ open, onClose, initial, onSaved }: Props) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<ProductsHeadingsOnly>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setField = (loc: CmsLocale, field: "sub" | "title" | "lead", value: string) => {
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
      const res = await saveProductsSectionHeadings(draft);
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
      title={t("shared.headingsModalProducts")}
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
        <p className="text-xs text-white/50">{t("shared.headingsLead")}</p>

        <div className="border-b border-white/10 pb-3">
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
            <label className={labelClass}>{t("shared.subheading")}</label>
            <input
              value={draft[tab].sub}
              onChange={(e) => setField(tab, "sub", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.title")}</label>
            <input
              value={draft[tab].title}
              onChange={(e) => setField(tab, "title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.lead")}</label>
            <textarea
              value={draft[tab].lead}
              onChange={(e) => setField(tab, "lead", e.target.value)}
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
