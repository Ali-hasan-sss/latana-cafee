"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminModal } from "@/components/admin/AdminModal";

export type AdminUnsavedGuard = {
  isDirty: () => boolean;
  save: () => Promise<boolean>;
  discard: () => void | Promise<void>;
};

type Ctx = {
  setGuard: (guard: AdminUnsavedGuard | null) => void;
  tryNavigate: (href: string) => void;
};

const AdminUnsavedCtx = createContext<Ctx | null>(null);

function sameAdminPath(a: string, b: string) {
  const norm = (p: string) => {
    const s = (p.split("?")[0] ?? "").replace(/\/+$/, "") || "";
    return s === "" ? "/" : s;
  };
  return norm(a) === norm(b);
}

export function AdminUnsavedChangesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("adminUi");
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const guardRef = useRef<AdminUnsavedGuard | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  const setGuard = useCallback((g: AdminUnsavedGuard | null) => {
    guardRef.current = g;
  }, []);

  const tryNavigate = useCallback(
    (href: string) => {
      const g = guardRef.current;
      if (!g?.isDirty() || sameAdminPath(href, pathname)) {
        router.push(href);
        return;
      }
      pendingHrefRef.current = href;
      setBlockedOpen(true);
    },
    [pathname, router],
  );

  const closeModal = useCallback(() => {
    if (!saving) {
      pendingHrefRef.current = null;
      setBlockedOpen(false);
    }
  }, [saving]);

  const flushNavigate = useCallback(() => {
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    setBlockedOpen(false);
    if (href) router.push(href);
  }, [router]);

  const onSave = useCallback(async () => {
    const g = guardRef.current;
    if (!g || !pendingHrefRef.current) return;
    setSaving(true);
    const ok = await g.save();
    setSaving(false);
    if (!ok) return;
    flushNavigate();
  }, [flushNavigate]);

  const onDiscard = useCallback(() => {
    void (async () => {
      const g = guardRef.current;
      if (!g || !pendingHrefRef.current) return;
      await Promise.resolve(g.discard());
      flushNavigate();
    })();
  }, [flushNavigate]);

  const value = useMemo(() => ({ setGuard, tryNavigate }), [setGuard, tryNavigate]);

  return (
    <AdminUnsavedCtx.Provider value={value}>
      {children}
      <AdminModal
        open={blockedOpen}
        onClose={closeModal}
        title={t("unsaved.title")}
        panelMaxClassName="max-w-md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={closeModal}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/5 disabled:opacity-50"
            >
              {t("unsaved.stay")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onDiscard()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-amber-200/90 transition hover:bg-white/5 disabled:opacity-50"
            >
              {t("unsaved.discard")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSave()}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? t("shared.saving") : t("unsaved.save")}
            </button>
          </div>
        }
      >
        <p className="text-sm text-white/70">{t("unsaved.body")}</p>
      </AdminModal>
    </AdminUnsavedCtx.Provider>
  );
}

export function useAdminUnsavedChanges() {
  const ctx = useContext(AdminUnsavedCtx);
  if (!ctx) {
    throw new Error("useAdminUnsavedChanges must be used within AdminUnsavedChangesProvider");
  }
  return ctx;
}
