"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { addProductsSectionTab } from "@/app/actions/products-section-admin";
import { AdminModal } from "@/components/admin/AdminModal";

const FORM_ID = "products-tab-add-form";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function ProductsTabAddForm({ open, onClose, onSaved }: Props) {
  const t = useTranslations("adminUi");
  const [draft, setDraft] = useState({ en: "", ar: "", de: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({ en: "", ar: "", de: "" });
    setError(null);
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      const res = await addProductsSectionTab(draft);
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
      title={t("shared.addProductTab")}
      panelMaxClassName="max-w-lg"
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
            {saving ? t("shared.saving") : t("shared.addTab")}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
        <p className="text-xs text-white/50">{t("shared.addProductTabHint")}</p>
        <div>
          <label className={labelClass}>{t("shared.englishTabTitle")}</label>
          <input
            value={draft.en}
            onChange={(e) => setDraft((d) => ({ ...d, en: e.target.value }))}
            className={inputClass}
            placeholder={t("shared.englishTabTitlePh")}
          />
        </div>
        <div>
          <label className={labelClass}>{t("shared.arabicTabTitle")}</label>
          <input
            value={draft.ar}
            onChange={(e) => setDraft((d) => ({ ...d, ar: e.target.value }))}
            className={inputClass}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass}>{t("shared.germanTabTitle")}</label>
          <input
            value={draft.de}
            onChange={(e) => setDraft((d) => ({ ...d, de: e.target.value }))}
            className={inputClass}
          />
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
