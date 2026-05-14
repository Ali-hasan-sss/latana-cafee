"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveServicesSectionSettings } from "@/app/actions/services-section-admin";
import { AdminModal } from "@/components/admin/AdminModal";
import type { ServicesSectionDocument } from "@/lib/cms/services-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function emptyServices(): ServicesSectionDocument {
  return {
    en: { sub: "", title: "", lead: "" },
    ar: { sub: "", title: "", lead: "" },
    de: { sub: "", title: "", lead: "" },
    items: [],
  };
}

type ModalProps = {
  open: boolean;
  initial: ServicesSectionDocument;
  onClose: () => void;
  onSaved: () => void;
};

function ServicesSectionModal({ open, initial, onClose, onSaved }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<ServicesSectionDocument>(emptyServices());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
      items: initial.items.map((row) => ({
        id: row.id,
        icon: row.icon,
        en: { ...row.en },
        ar: { ...row.ar },
        de: { ...row.de },
      })),
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setSectionField = (loc: CmsLocale, field: "sub" | "title" | "lead", value: string) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const setItemField = (
    index: number,
    loc: CmsLocale,
    field: "title" | "text",
    value: string,
  ) => {
    setDraft((d) => {
      const items = d.items.map((row, i) =>
        i === index
          ? {
              ...row,
              [loc]: { ...row[loc], [field]: value },
            }
          : row,
      );
      return { ...d, items };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveServicesSectionSettings(draft);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? t("common.saveFailed"));
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t("panels.services.modalTitle")}
      panelMaxClassName="max-w-3xl"
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
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? t("shared.saving") : t("shared.save")}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="border-b border-white/10">
          <p className="mb-2 text-xs font-medium text-white/60">{t("shared.copyByLanguage")}</p>
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
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
            {t("shared.sectionHeading")}
          </p>
          <div>
            <label className={labelClass}>{t("shared.subheading")}</label>
            <input
              value={draft[tab].sub}
              onChange={(e) => setSectionField(tab, "sub", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.title")}</label>
            <input
              value={draft[tab].title}
              onChange={(e) => setSectionField(tab, "title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.lead")}</label>
            <textarea
              value={draft[tab].lead}
              onChange={(e) => setSectionField(tab, "lead", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-6 border-t border-white/10 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
            {t("shared.serviceCards")}
          </p>
          {draft.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-xs text-white/50">
                {t("shared.cardN", { n: index + 1 })} · <span className="font-mono">{item.id}</span>
              </p>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>{t("shared.title")}</label>
                  <input
                    value={item[tab].title}
                    onChange={(e) => setItemField(index, tab, "title", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("shared.text")}</label>
                  <textarea
                    value={item[tab].text}
                    onChange={(e) => setItemField(index, tab, "text", e.target.value)}
                    rows={4}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = { initialServices: ServicesSectionDocument };

export function ServicesSectionAdminPanel({ initialServices }: PanelProps) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<ServicesSectionDocument>(initialServices);

  useEffect(() => {
    setSnapshot(initialServices);
  }, [initialServices]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.services.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.services.lead")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110"
        >
          {t("shared.editInModal")}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
        <p>
          <span className="text-white/45">{t("shared.enTitle")}:</span>{" "}
          {snapshot.en.title || t("common.dash")}
        </p>
        <p className="mt-2">
          <span className="text-white/45">{t("shared.cardsCount")}:</span> {snapshot.items.length}
        </p>
      </div>

      <ServicesSectionModal
        open={open}
        initial={snapshot}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
