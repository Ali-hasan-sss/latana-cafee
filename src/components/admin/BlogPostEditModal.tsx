"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { saveBlogPost } from "@/app/actions/blog-posts-admin";
import { AdminBlogRichEditor } from "@/components/admin/AdminBlogRichEditor";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import type { BlogPostDocument } from "@/lib/cms/blog-cms-types";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";

const FORM_ID = "blog-post-edit-form";
const MAX_GALLERY_IMAGES = 12;

const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none ring-brand-primary/30 focus:ring-2";

const labelClass = "mb-1 block text-xs font-medium text-white/70";

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date((iso ?? "").trim());
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalValueToIso(val: string): string {
  if (!val.trim()) return "";
  const d = new Date(val);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

function clonePost(p: BlogPostDocument): BlogPostDocument {
  return JSON.parse(JSON.stringify(p)) as BlogPostDocument;
}

type Props = {
  open: boolean;
  post: BlogPostDocument | null;
  onClose: () => void;
  onSaved: () => void;
};

export function BlogPostEditModal({ open, post, onClose, onSaved }: Props) {
  const t = useTranslations("adminUi");
  const tLocales = useTranslations("adminUi.cmsLocales");
  const [tab, setTab] = useState<CmsLocale>("en");
  const [draft, setDraft] = useState<BlogPostDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !post) return;
    setDraft(clonePost(post));
    setTab("en");
    setError(null);
  }, [open, post]);

  const setLocaleField = (loc: CmsLocale, field: keyof BlogPostDocument["en"], value: string) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            [loc]: { ...d[loc], [field]: value },
          }
        : d,
    );
  };

  const setBodyHtml = useCallback((loc: CmsLocale, html: string) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            [loc]: { ...d[loc], bodyHtml: html },
          }
        : d,
    );
  }, []);

  const setGalleryImageAt = useCallback((index: number, url: string) => {
    setDraft((d) => {
      if (!d) return d;
      const images = [...d.images];
      images[index] = url;
      return { ...d, images };
    });
  }, []);

  const removeGalleryImageAt = useCallback((index: number) => {
    setDraft((d) => {
      if (!d) return d;
      return { ...d, images: d.images.filter((_, i) => i !== index) };
    });
  }, []);

  const appendGalleryImage = useCallback((url: string) => {
    setDraft((d) => {
      if (!d) return d;
      if (d.images.length >= MAX_GALLERY_IMAGES) return d;
      return { ...d, images: [...d.images, url] };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!draft) return;
      setSaving(true);
      setError(null);
      const images = (draft.images ?? []).map((s) => String(s ?? "").trim()).filter(Boolean);
      const payload: BlogPostDocument = { ...draft, images };
      const res = await saveBlogPost(payload);
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

  if (!post) return null;

  const galleryCount = draft?.images?.length ?? 0;

  return (
    <AdminModal
      open={open && !!draft}
      onClose={onClose}
      title={t("panels.blog.editModalTitle", { slug: draft?.slug ?? post.slug })}
      panelMaxClassName="max-w-4xl"
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
            disabled={saving || !draft}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? t("shared.saving") : t("shared.save")}
          </button>
        </div>
      }
    >
      {draft ? (
        <form
          id={FORM_ID}
          onSubmit={(ev) => void handleSubmit(ev)}
          className="max-h-[70vh] space-y-5 overflow-y-auto pe-1"
        >
          <p className="text-xs text-white/50">{t("panels.blog.introRich")}</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t("shared.urlSlug")}</label>
              <input
                value={draft.slug}
                onChange={(e) => setDraft((d) => (d ? { ...d, slug: e.target.value } : d))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.commentCount")}</label>
              <input
                type="number"
                min={0}
                value={draft.comments}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, comments: Math.max(0, Number(e.target.value) || 0) } : d,
                  )
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.publishedAt")}</label>
              <input
                type="datetime-local"
                value={isoToDatetimeLocalValue(draft.publishedAt)}
                onChange={(e) => {
                  const iso = datetimeLocalValueToIso(e.target.value);
                  setDraft((d) =>
                    d ? { ...d, publishedAt: iso || d.publishedAt || new Date().toISOString() } : d,
                  );
                }}
                className={inputClass}
              />
            </div>
          </div>

          <AdminFileUpload
            label={t("shared.coverImage")}
            value={draft.coverImageSrc}
            onChange={(url) => setDraft((d) => (d ? { ...d, coverImageSrc: url } : d))}
            hint={t("shared.coverHint")}
          />

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className={labelClass}>{t("panels.blog.inlineGalleryTitle")}</label>
              <span className="text-[10px] text-white/40">
                {galleryCount} / {MAX_GALLERY_IMAGES}
              </span>
            </div>
            <div className="space-y-4">
              {draft.images.map((url, idx) => (
                <div
                  key={`${idx}-${url || "empty"}`}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-start"
                >
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md bg-black/40 sm:h-24 sm:w-36">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-white/35">
                        {t("shared.pendingUpload")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <AdminFileUpload
                      label={t("shared.galleryImageN", { n: idx + 1 })}
                      value={url}
                      onChange={(u) => setGalleryImageAt(idx, u)}
                      hint={t("shared.replaceSlotHint")}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImageAt(idx)}
                      className="text-xs font-medium text-red-300/90 underline-offset-2 hover:text-red-200 hover:underline"
                    >
                      {t("shared.removeFromGallery")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {galleryCount < MAX_GALLERY_IMAGES ? (
              <div className="mt-4 border-t border-white/10 pt-4">
                <AdminFileUpload
                  key={`add-gallery-${galleryCount}`}
                  label={t("shared.addGalleryImage")}
                  value=""
                  onChange={(url) => {
                    if (url) appendGalleryImage(url);
                  }}
                  hint={t("shared.addGalleryHint")}
                />
              </div>
            ) : null}
          </div>

          <div className="border-b border-white/10 pb-2">
            <p className="mb-2 text-xs font-medium text-white/60">{t("panels.blog.articleCopyHeading")}</p>
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
              <label className={labelClass}>{t("shared.title")}</label>
              <input
                value={draft[tab].title}
                onChange={(e) => setLocaleField(tab, "title", e.target.value)}
                className={inputClass}
                dir={tab === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.dateDisplay")}</label>
              <input
                value={draft[tab].date}
                onChange={(e) => setLocaleField(tab, "date", e.target.value)}
                className={inputClass}
                dir={tab === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.excerpt")}</label>
              <textarea
                value={draft[tab].excerpt}
                onChange={(e) => setLocaleField(tab, "excerpt", e.target.value)}
                rows={2}
                className={inputClass}
                dir={tab === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className={labelClass}>{t("shared.body")}</label>
              <AdminBlogRichEditor
                key={`${draft.id}-${tab}-${open}`}
                value={draft[tab].bodyHtml || "<p></p>"}
                onChange={(html) => setBodyHtml(tab, html)}
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </AdminModal>
  );
}
