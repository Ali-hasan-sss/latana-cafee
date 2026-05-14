"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveAboutSectionSettings } from "@/app/actions/about-section-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import type { AboutSectionDocument } from "@/lib/cms/about-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function emptyAbout(): AboutSectionDocument {
  return {
    imageSrc: "",
    en: { sub: "", title: "", text: "" },
    ar: { sub: "", title: "", text: "" },
    de: { sub: "", title: "", text: "" },
  };
}

type ModalProps = {
  open: boolean;
  initial: AboutSectionDocument;
  onClose: () => void;
  onSaved: () => void;
};

function AboutSectionModal({ open, initial, onClose, onSaved }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<AboutSectionDocument>(emptyAbout());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      ...initial,
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setLocaleField = (loc: CmsLocale, field: "sub" | "title" | "text", value: string) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveAboutSectionSettings(draft);
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
      title={t("shared.aboutModalTitle")}
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

        <AdminFileUpload
          label={t("shared.image")}
          value={draft.imageSrc}
          onChange={(url) => setDraft((d) => ({ ...d, imageSrc: url }))}
          hint={t("shared.uploadSectionImageHint")}
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
          <div>
            <label className={labelClass}>{t("shared.subheadingDiscover")}</label>
            <input
              value={draft[tab].sub}
              onChange={(e) => setLocaleField(tab, "sub", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.titleOurStory")}</label>
            <input
              value={draft[tab].title}
              onChange={(e) => setLocaleField(tab, "title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.bodyText")}</label>
            <textarea
              value={draft[tab].text}
              onChange={(e) => setLocaleField(tab, "text", e.target.value)}
              rows={6}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = { initialAbout: AboutSectionDocument };

export function AboutSectionAdminPanel({ initialAbout }: PanelProps) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<AboutSectionDocument>(initialAbout);

  useEffect(() => {
    setSnapshot(initialAbout);
  }, [initialAbout]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.about.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.about.lead")}</p>
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
          <span className="text-white/45">{t("shared.snapshotImage")}:</span>{" "}
          <span className="font-mono text-xs">{snapshot.imageSrc || t("common.dash")}</span>
        </p>
        <p className="mt-2">
          <span className="text-white/45">{t("shared.enTitle")}:</span>{" "}
          {snapshot.en.title || t("common.dash")}
        </p>
      </div>

      <AboutSectionModal
        open={open}
        initial={snapshot}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
