"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveSiteContactSettings } from "@/app/actions/contact-settings-admin";
import { AdminModal } from "@/components/admin/AdminModal";
import type { SiteContactDocument } from "@/lib/cms/site-contact-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function emptyDoc(): SiteContactDocument {
  return {
    phone: "",
    whatsapp: "",
    email: "",
    mapLat: null,
    mapLng: null,
    mapEmbedSrc: "",
    en: { address: "", hours: "" },
    ar: { address: "", hours: "" },
    de: { address: "", hours: "" },
    social: {
      facebook: "",
      instagram: "",
      tiktok: "",
      linkedin: "",
      youtube: "",
      x: "",
    },
  };
}

type ModalProps = {
  open: boolean;
  initial: SiteContactDocument;
  onClose: () => void;
  onSaved: () => void;
};

function ContactSettingsModal({ open, initial, onClose, onSaved }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<SiteContactDocument>(emptyDoc());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({
      ...initial,
      en: { ...initial.en },
      ar: { ...initial.ar },
      de: { ...initial.de },
      social: { ...initial.social },
    });
    setTab("en");
    setError(null);
  }, [open, initial]);

  const setLocaleField = (loc: CmsLocale, field: "address" | "hours", value: string) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveSiteContactSettings(draft);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? t("common.saveFailed"));
      return;
    }
    onSaved();
    onClose();
  };

  const latStr =
    draft.mapLat === null || draft.mapLat === undefined ? "" : String(draft.mapLat);
  const lngStr =
    draft.mapLng === null || draft.mapLng === undefined ? "" : String(draft.mapLng);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t("shared.contactModalTitle")}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="c-phone">
              {t("shared.phone")}
            </label>
            <input
              id="c-phone"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="c-wa">
              {t("shared.whatsappLabel")}
            </label>
            <input
              id="c-wa"
              value={draft.whatsapp}
              onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
              className={inputClass}
              placeholder={t("shared.whatsappPlaceholder")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="c-email">
              {t("shared.email")}
            </label>
            <input
              id="c-email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="c-lat">
              {t("shared.latitude")}
            </label>
            <input
              id="c-lat"
              type="text"
              inputMode="decimal"
              value={latStr}
              onChange={(e) => {
                const v = e.target.value.trim();
                setDraft((d) => ({
                  ...d,
                  mapLat: v === "" ? null : Number.parseFloat(v),
                }));
              }}
              className={inputClass}
              placeholder="52.5219"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="c-lng">
              {t("shared.longitude")}
            </label>
            <input
              id="c-lng"
              type="text"
              inputMode="decimal"
              value={lngStr}
              onChange={(e) => {
                const v = e.target.value.trim();
                setDraft((d) => ({
                  ...d,
                  mapLng: v === "" ? null : Number.parseFloat(v),
                }));
              }}
              className={inputClass}
              placeholder="13.4132"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="c-embed">
              {t("shared.embedUrl")}
            </label>
            <input
              id="c-embed"
              value={draft.mapEmbedSrc}
              onChange={(e) => setDraft((d) => ({ ...d, mapEmbedSrc: e.target.value }))}
              className={inputClass}
              placeholder={t("shared.embedPlaceholder")}
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">{t("shared.embedHelp")}</p>
          </div>
        </div>

        <div>
          <p className={labelClass}>{t("shared.socialLinks")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["facebook", "Facebook"],
                ["instagram", "Instagram"],
                ["tiktok", "TikTok"],
                ["linkedin", "LinkedIn"],
                ["youtube", "YouTube"],
                ["x", "X (Twitter)"],
              ] as const
            ).map(([key, lab]) => (
              <div key={key}>
                <label className="mb-0.5 block text-[10px] uppercase tracking-wide text-white/45">
                  {lab}
                </label>
                <input
                  value={draft.social[key]}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      social: { ...d.social, [key]: e.target.value },
                    }))
                  }
                  className={inputClass}
                  placeholder={t("shared.socialPlaceholder")}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-white/10">
          <p className="mb-2 text-xs font-medium text-white/60">{t("shared.addressHoursByLang")}</p>
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
            <label className={labelClass}>{t("shared.address")}</label>
            <textarea
              value={draft[tab].address}
              onChange={(e) => setLocaleField(tab, "address", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("shared.openingHours")}</label>
            <textarea
              value={draft[tab].hours}
              onChange={(e) => setLocaleField(tab, "hours", e.target.value)}
              rows={5}
              className={inputClass}
              placeholder={tab === "en" ? t("shared.hoursPlaceholder") : undefined}
            />
            <p className="mt-1 text-[10px] text-white/40">{t("shared.hoursHint")}</p>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = { initialContact: SiteContactDocument };

export function ContactSettingsAdminPanel({ initialContact }: PanelProps) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<SiteContactDocument>(initialContact);

  useEffect(() => {
    setSnapshot(initialContact);
  }, [initialContact]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.contact.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.contact.lead")}</p>
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
          <span className="text-white/45">{t("shared.snapshotPhone")}:</span>{" "}
          {snapshot.phone || t("common.dash")}
        </p>
        <p className="mt-1">
          <span className="text-white/45">{t("shared.snapshotWhatsApp")}:</span>{" "}
          {snapshot.whatsapp || t("common.dash")}
        </p>
        <p className="mt-1">
          <span className="text-white/45">{t("shared.snapshotEmail")}:</span>{" "}
          {snapshot.email || t("common.dash")}
        </p>
        <p className="mt-1">
          <span className="text-white/45">{t("shared.snapshotMap")}:</span>{" "}
          {snapshot.mapLat != null && snapshot.mapLng != null
            ? `${snapshot.mapLat}, ${snapshot.mapLng}`
            : t("common.dash")}
        </p>
      </div>

      <ContactSettingsModal
        open={open}
        initial={snapshot}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
