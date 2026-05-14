"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveMenuPreviewSectionSettings } from "@/app/actions/menu-preview-section-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import type { MenuPreviewSectionDocument } from "@/lib/cms/menu-preview-section-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function padFour(slots: string[]): string[] {
  const a = [...slots].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

function emptyDoc(): MenuPreviewSectionDocument {
  return {
    imageSrcs: ["", "", "", ""],
    en: { sub: "", title: "", text: "", cta: "", gridAria: "" },
    ar: { sub: "", title: "", text: "", cta: "", gridAria: "" },
    de: { sub: "", title: "", text: "", cta: "", gridAria: "" },
  };
}

type ModalProps = {
  open: boolean;
  initial: MenuPreviewSectionDocument;
  onClose: () => void;
  onSaved: () => void;
};

function MenuPreviewSectionModal({ open, initial, onClose, onSaved }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<MenuPreviewSectionDocument>(emptyDoc());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      imageSrcs: padFour(initial.imageSrcs),
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setImage = (index: number, url: string) => {
    setDraft((d) => {
      const imageSrcs = padFour(d.imageSrcs);
      imageSrcs[index] = url;
      return { ...d, imageSrcs };
    });
  };

  const setLocaleField = (
    loc: CmsLocale,
    field: "sub" | "title" | "text" | "cta" | "gridAria",
    value: string,
  ) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveMenuPreviewSectionSettings(draft);
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
      title={t("panels.menuPreview.modalTitle")}
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

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
            {t("shared.previewImagesFour")}
          </p>
          <p className="mb-4 text-[11px] text-white/45">{t("shared.uploadReplaceHint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <AdminFileUpload
                key={i}
                label={t("shared.imageN", { n: i + 1 })}
                value={draft.imageSrcs[i] ?? ""}
                onChange={(url) => setImage(i, url)}
                hint={t("shared.imageHintRequired")}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="border-b border-white/10 pb-3">
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

          <div className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>{t("shared.subheading")}</label>
              <input
                value={draft[tab].sub}
                onChange={(e) => setLocaleField(tab, "sub", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.title")}</label>
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
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.primaryCta")}</label>
              <input
                value={draft[tab].cta}
                onChange={(e) => setLocaleField(tab, "cta", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.gridAriaLabel")}</label>
              <input
                value={draft[tab].gridAria}
                onChange={(e) => setLocaleField(tab, "gridAria", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = {
  initialMenuPreview: MenuPreviewSectionDocument;
  previewSlot: ReactNode;
};

export function MenuPreviewSectionAdminPanel({ initialMenuPreview, previewSlot }: PanelProps) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<MenuPreviewSectionDocument>(initialMenuPreview);

  useEffect(() => {
    setSnapshot(initialMenuPreview);
  }, [initialMenuPreview]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.menuPreview.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.menuPreview.lead")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110"
        >
          {t("shared.editInModal")}
        </button>
      </div>

      {previewSlot}

      <MenuPreviewSectionModal
        open={open}
        initial={snapshot}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
