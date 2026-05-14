"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width + width utilities, e.g. `max-w-3xl` */
  panelMaxClassName?: string;
};

export function AdminModal({
  title,
  open,
  onClose,
  children,
  footer,
  panelMaxClassName = "max-w-lg",
}: Props) {
  const t = useTranslations("adminUi");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const closeLabel = t("modal.closeAria");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className={`relative z-[1] flex max-h-[min(92vh,880px)] w-full ${panelMaxClassName} flex-col overflow-hidden rounded-xl border border-white/12 bg-[#1a1a1a] shadow-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="admin-modal-title" className="text-base font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={closeLabel}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-white/10 bg-[#141414] px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
