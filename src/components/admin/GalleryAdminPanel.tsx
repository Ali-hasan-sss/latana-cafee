"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteAdminPublicUploads } from "@/app/actions/admin-upload-cleanup";
import { saveGallerySettings } from "@/app/actions/gallery-settings-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { useAdminUnsavedChanges } from "@/components/admin/AdminUnsavedChangesProvider";
import { collectOrphanUploadUrls } from "@/lib/cms/gallery-upload-orphans";
import type { GallerySettingsDocument } from "@/lib/cms/gallery-settings-types";

/** Ordered unique picks for home (0–4), no empty strings */
function homeOrderFromTeaser(teaser: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of teaser.map((s) => String(s ?? "").trim()).filter(Boolean)) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= 4) break;
  }
  return out;
}

function teaserFromOrder(order: string[]): string[] {
  const o = [...order].slice(0, 4);
  while (o.length < 4) {
    o.push("");
  }
  return o.slice(0, 4);
}

function isGalleryDirty(draft: GallerySettingsDocument, initial: GallerySettingsDocument): boolean {
  if (JSON.stringify(draft.pool) !== JSON.stringify(initial.pool)) return true;
  const dh = homeOrderFromTeaser(draft.homeTeaser).join("\0");
  const ih = homeOrderFromTeaser(initial.homeTeaser).join("\0");
  return dh !== ih;
}

function HomeIconOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIconFilled({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </svg>
  );
}

type Props = {
  initial: GallerySettingsDocument;
};

export function GalleryAdminPanel({ initial }: Props) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const { setGuard } = useAdminUnsavedChanges();
  const [draft, setDraft] = useState<GallerySettingsDocument>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const draftRef = useRef(draft);
  const initialRef = useRef(initial);
  draftRef.current = draft;
  initialRef.current = initial;

  useEffect(() => {
    setDraft({
      pool: [...initial.pool],
      homeTeaser: teaserFromOrder(homeOrderFromTeaser(initial.homeTeaser)),
    });
    setOk(false);
  }, [initial]);

  const homeCount = homeOrderFromTeaser(draft.homeTeaser).length;

  const addToPool = useCallback((url: string) => {
    const u = url.trim();
    if (!u) return;
    setDraft((d) => (d.pool.includes(u) ? d : { ...d, pool: [...d.pool, u] }));
  }, []);

  const removeFromPool = useCallback((url: string) => {
    const initialSet = new Set(
      [...initialRef.current.pool, ...initialRef.current.homeTeaser]
        .map((s) => String(s ?? "").trim())
        .filter(Boolean),
    );
    setDraft((d) => {
      const pool = d.pool.filter((x) => x !== url);
      const order = homeOrderFromTeaser(d.homeTeaser).filter((h) => h !== url);
      return { pool, homeTeaser: teaserFromOrder(order) };
    });
    if (url.startsWith("/uploads/") && !initialSet.has(url)) {
      void deleteAdminPublicUploads([url]);
    }
  }, []);

  const toggleHome = useCallback((url: string) => {
    setDraft((d) => {
      const order = homeOrderFromTeaser(d.homeTeaser);
      let next: string[];
      if (order.includes(url)) {
        next = order.filter((x) => x !== url);
      } else if (order.length < 4) {
        next = [...order, url];
      } else {
        next = [...order.slice(1), url];
      }
      return { ...d, homeTeaser: teaserFromOrder(next) };
    });
  }, []);

  const performSave = useCallback(async (): Promise<boolean> => {
    const d = draftRef.current;
    const order = homeOrderFromTeaser(d.homeTeaser);
    if (order.length < 4) {
      setError(t("panels.gallery.errNeedFour"));
      setOk(false);
      return false;
    }
    if (order.some((h) => !d.pool.includes(h))) {
      setError(t("panels.gallery.errMustBeInPool"));
      setOk(false);
      return false;
    }
    setSaving(true);
    setError(null);
    setOk(false);
    const res = await saveGallerySettings(d);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? t("common.saveFailed"));
      return false;
    }
    setOk(true);
    router.refresh();
    return true;
  }, [router, t]);

  const handleSave = useCallback(() => {
    void performSave();
  }, [performSave]);

  const discardDraft = useCallback(async () => {
    const ir = initialRef.current;
    const dr = draftRef.current;
    const orphans = collectOrphanUploadUrls(dr, ir);
    if (orphans.length) {
      await deleteAdminPublicUploads(orphans);
    }
    setDraft({
      pool: [...ir.pool],
      homeTeaser: teaserFromOrder(homeOrderFromTeaser(ir.homeTeaser)),
    });
    setError(null);
    setOk(false);
  }, []);

  const dirty = useMemo(() => isGalleryDirty(draft, initial), [draft, initial]);

  useEffect(() => {
    if (!dirty) {
      setGuard(null);
      return;
    }
    setGuard({
      isDirty: () => isGalleryDirty(draftRef.current, initialRef.current),
      save: performSave,
      discard: discardDraft,
    });
    return () => setGuard(null);
  }, [dirty, discardDraft, performSave, setGuard]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-white">{t("panels.gallery.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.gallery.lead")}</p>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/20 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{t("panels.gallery.sectionTitle")}</h2>
            <p className="mt-1 text-xs text-white/45">
              {t("panels.gallery.homeLine")}:{" "}
              <span className={homeCount === 4 ? "text-emerald-400" : "text-amber-300"}>
                {homeCount} / 4
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 max-w-md">
          <AdminFileUpload
            key={draft.pool.length}
            label={t("panels.gallery.uploadLabel")}
            value=""
            onChange={(url) => addToPool(url)}
            hint={t("panels.gallery.uploadHint")}
          />
        </div>

        {draft.pool.length === 0 ? (
          <p className="mt-4 text-sm text-amber-400/90">{t("panels.gallery.emptyPool")}</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {draft.pool.map((url) => {
              const onHome = homeOrderFromTeaser(draft.homeTeaser).includes(url);
              const homeIdx = onHome ? homeOrderFromTeaser(draft.homeTeaser).indexOf(url) + 1 : null;
              return (
                <li
                  key={url}
                  className="overflow-hidden rounded-lg border border-white/10 bg-black/30"
                >
                  <div className="relative aspect-[4/3] bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => toggleHome(url)}
                      title={onHome ? t("panels.gallery.removeFromHomeTitle") : t("panels.gallery.addToHomeTitle")}
                      aria-pressed={onHome}
                      className={`absolute end-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition ${
                        onHome
                          ? "border-brand-primary bg-brand-primary text-[#212529] hover:brightness-110"
                          : "border-white/30 bg-black/60 text-white/90 hover:border-brand-primary/60 hover:bg-black/75 hover:text-brand-primary"
                      }`}
                    >
                      {onHome ? (
                        <HomeIconFilled className="h-5 w-5" />
                      ) : (
                        <HomeIconOutline className="h-5 w-5" />
                      )}
                    </button>
                    {onHome ? (
                      <span className="absolute start-2 top-2 rounded bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                        {homeIdx}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate font-mono text-[10px] text-white/50">{url}</p>
                    <button
                      type="button"
                      onClick={() => removeFromPool(url)}
                      className="w-full rounded border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                    >
                      {t("panels.gallery.removeFromPool")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-emerald-400" role="status">
          {t("panels.gallery.saved")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="text-xs text-white/45">{t("panels.gallery.homeOrderHint")}</p>
        <button
          type="button"
          disabled={saving || draft.pool.length === 0 || homeCount < 4}
          onClick={handleSave}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? t("panels.gallery.saving") : t("panels.gallery.save")}
        </button>
      </div>
    </div>
  );
}
