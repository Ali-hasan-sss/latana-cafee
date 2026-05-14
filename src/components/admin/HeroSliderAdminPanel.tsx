"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { HeroSlideAdmin, CmsLocale } from "@/lib/cms/hero-slider-types";
import { CMS_LOCALES } from "@/lib/cms/hero-slider-types";
import { saveHeroSlidesForAdmin } from "@/app/actions/hero-slider-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";

function emptySlide(): HeroSlideAdmin {
  return {
    imageSrc: "",
    order: 0,
    en: { title: "", text: "" },
    ar: { title: "", text: "" },
    de: { title: "", text: "" },
  };
}

type ModalProps = {
  open: boolean;
  mode: "add" | "edit";
  initial: HeroSlideAdmin | null;
  onClose: () => void;
  onCommit: (slide: HeroSlideAdmin) => Promise<boolean>;
};

function HeroSlideModal({ open, mode, initial, onClose, onCommit }: ModalProps) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<HeroSlideAdmin>(emptySlide());

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDraft({
        ...initial,
        en: { ...initial.en },
        ar: { ...initial.ar },
        de: { ...initial.de },
      });
    } else {
      setDraft(emptySlide());
    }
    setTab("en");
  }, [open, initial]);

  const setLocaleField = (loc: CmsLocale, field: "title" | "text", value: string) => {
    setDraft((d) => ({
      ...d,
      [loc]: { ...d[loc], [field]: value },
    }));
  };

  const handleSave = async () => {
    const ok = await onCommit(draft);
    if (ok) {
      onClose();
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={mode === "add" ? t("panels.heroSlider.modalAddTitle") : t("panels.heroSlider.modalEditTitle")}
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
            onClick={() => void handleSave()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110"
          >
            {t("panels.heroSlider.saveSlide")}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <AdminFileUpload
          label={t("panels.heroSlider.heroImage")}
          value={draft.imageSrc}
          onChange={(url) => setDraft((d) => ({ ...d, imageSrc: url }))}
          hint={t("panels.heroSlider.heroImageHint")}
        />

        <div className="border-b border-white/10">
          <div className="flex gap-1">
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

        <div className="space-y-3 pt-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/70">
              {t("panels.heroSlider.titleLabel")}
            </label>
            <input
              value={draft[tab].title}
              onChange={(e) => setLocaleField(tab, "title", e.target.value)}
              className="w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/70">
              {t("panels.heroSlider.textLabel")}
            </label>
            <textarea
              value={draft[tab].text}
              onChange={(e) => setLocaleField(tab, "text", e.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2"
            />
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

type PanelProps = { initialSlides: HeroSlideAdmin[] };

type SaveBanner = { kind: "ok" } | { kind: "err"; text: string } | null;

export function HeroSliderAdminPanel({ initialSlides }: PanelProps) {
  const t = useTranslations("adminUi");
  const [slides, setSlides] = useState<HeroSlideAdmin[]>(initialSlides);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalInitial, setModalInitial] = useState<HeroSlideAdmin | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<SaveBanner>(null);

  const persist = useCallback(
    async (next: HeroSlideAdmin[]) => {
      setSaving(true);
      setBanner(null);
      const res = await saveHeroSlidesForAdmin(next);
      setSaving(false);
      if (!res.ok) {
        setBanner({ kind: "err", text: res.error ?? t("common.saveFailed") });
        return false;
      }
      setBanner({ kind: "ok" });
      setSlides(next);
      return true;
    },
    [t],
  );

  const openAdd = () => {
    setModalMode("add");
    setModalInitial(null);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setModalMode("edit");
    setModalInitial(slides[index] ?? null);
    setEditIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const onCommitSlide = async (slide: HeroSlideAdmin): Promise<boolean> => {
    let next: HeroSlideAdmin[];
    if (modalMode === "add") {
      next = [...slides, { ...slide, order: slides.length }];
    } else if (editIndex !== null) {
      next = slides.map((s, i) =>
        i === editIndex ? { ...slide, _id: slides[i]?._id, order: i } : { ...s, order: i },
      );
    } else {
      next = slides;
    }
    return persist(next);
  };

  const removeAt = async (index: number) => {
    if (!window.confirm(t("common.removeSlideConfirm"))) return;
    const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    await persist(next);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[index], next[j]] = [next[j], next[index]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    await persist(reordered);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.heroSlider.title")}</h1>
          <p className="mt-1 max-w-xl text-sm text-white/55">{t("panels.heroSlider.lead")}</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={saving}
          className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
        >
          {t("panels.heroSlider.addSlide")}
        </button>
      </div>

      {banner ? (
        <p
          className={`text-sm ${banner.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}
          role="status"
        >
          {banner.kind === "ok" ? t("common.saved") : banner.text}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">{t("panels.heroSlider.tablePreview")}</th>
              <th className="px-4 py-3 font-medium">{t("panels.heroSlider.tableImage")}</th>
              <th className="px-4 py-3 font-medium">{t("panels.heroSlider.tableEnTitle")}</th>
              <th className="px-4 py-3 font-medium text-end">{t("panels.heroSlider.tableActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {slides.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-white/45">
                  {t("panels.heroSlider.emptyTable")}
                </td>
              </tr>
            ) : (
              slides.map((s, i) => (
                <tr key={s._id ?? `${s.imageSrc}-${i}`} className="bg-black/20">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin previews arbitrary paths/URLs */}
                      <img
                        src={s.imageSrc || ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-white/70">
                    {s.imageSrc}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-white/85">{s.en.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        disabled={saving || i === 0}
                        onClick={() => move(i, -1)}
                        className="rounded border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5 disabled:opacity-30"
                      >
                        {t("common.up")}
                      </button>
                      <button
                        type="button"
                        disabled={saving || i === slides.length - 1}
                        onClick={() => move(i, 1)}
                        className="rounded border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5 disabled:opacity-30"
                      >
                        {t("common.down")}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => openEdit(i)}
                        className="rounded border border-white/10 px-2 py-1 text-xs text-white/85 hover:bg-white/5"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => removeAt(i)}
                        className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <HeroSlideModal
        open={modalOpen}
        mode={modalMode}
        initial={modalInitial}
        onClose={closeModal}
        onCommit={onCommitSlide}
      />
    </div>
  );
}
