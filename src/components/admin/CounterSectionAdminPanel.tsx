"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveCounterSectionSettings } from "@/app/actions/counter-section-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import type { CounterSectionDocument } from "@/lib/cms/counter-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function emptyCounter(): CounterSectionDocument {
  return {
    bgImageSrc: "",
    en: { sub: "", title: "", lead: "" },
    ar: { sub: "", title: "", lead: "" },
    de: { sub: "", title: "", lead: "" },
    items: [],
  };
}

type ModalProps = {
  open: boolean;
  initial: CounterSectionDocument;
  onClose: () => void;
  onSaved: () => void;
};

function CounterSectionModal({ open, initial, onClose, onSaved }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<CounterSectionDocument>(emptyCounter());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      bgImageSrc: initial.bgImageSrc,
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
      items: initial.items.map((row) => ({
        id: row.id,
        value: row.value,
        suffix: row.suffix,
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

  const setItemValue = (index: number, value: number) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((row, i) => (i === index ? { ...row, value } : row)),
    }));
  };

  const setItemSuffix = (index: number, value: string) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((row, i) => (i === index ? { ...row, suffix: value } : row)),
    }));
  };

  const setItemLabel = (index: number, loc: CmsLocale, value: string) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((row, i) =>
        i === index
          ? {
              ...row,
              [loc]: { ...row[loc], label: value },
            }
          : row,
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveCounterSectionSettings(draft);
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
      title={t("panels.counter.modalTitle")}
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
      <div className="space-y-8">
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <AdminFileUpload
          label={t("panels.counter.bgImage")}
          value={draft.bgImageSrc}
          onChange={(url) => setDraft((d) => ({ ...d, bgImageSrc: url }))}
          hint={t("panels.counter.bgImageHint")}
        />

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
            {t("shared.statistics")}
          </p>
          <p className="text-[11px] text-white/45">{t("shared.fourCountersHint")}</p>
          {draft.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-xs text-white/50">
                {t("shared.statN", { n: index + 1 })} · <span className="font-mono">{item.id}</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("shared.value")}</label>
                  <input
                    type="number"
                    value={Number.isFinite(item.value) ? item.value : 0}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setItemValue(index, Number.isFinite(n) ? n : 0);
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("shared.suffix")}</label>
                  <input
                    value={item.suffix}
                    onChange={(e) => setItemSuffix(index, e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>
                  {t("shared.labelForTab", { tab: tLocales(tab) })}
                </label>
                <input
                  value={item[tab].label}
                  onChange={(e) => setItemLabel(index, tab, e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = { initialCounter: CounterSectionDocument };

export function CounterSectionAdminPanel({ initialCounter }: PanelProps) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<CounterSectionDocument>(initialCounter);

  useEffect(() => {
    setSnapshot(initialCounter);
  }, [initialCounter]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.counter.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.counter.lead")}</p>
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
          <span className="text-white/45">{t("shared.firstStat")}:</span>{" "}
          {snapshot.items[0]
            ? `${snapshot.items[0].value}${snapshot.items[0].suffix}`
            : t("common.dash")}
        </p>
      </div>

      <CounterSectionModal
        open={open}
        initial={snapshot}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
