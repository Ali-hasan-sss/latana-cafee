"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export const SITE_LOADING_START = "latana-site-loading-start";
export const SITE_LOADING_END = "latana-site-loading-end";
/** Fired before programmatic in-app navigation (e.g. locale switch) so the corner loader appears. */
export const SITE_NAV_INTENT_START = "latana-site-nav-intent-start";

type SiteLoadingContextValue = {
  /** Increment/decrement an internal busy counter (supports nested calls). */
  setBusy: (busy: boolean) => void;
};

const SiteLoadingContext = createContext<SiteLoadingContextValue | null>(null);

export function useSiteLoading(): SiteLoadingContextValue {
  const ctx = useContext(SiteLoadingContext);
  if (!ctx) {
    throw new Error("useSiteLoading must be used within SiteLoadingProvider");
  }
  return ctx;
}

export function useSiteLoadingOptional(): SiteLoadingContextValue | null {
  return useContext(SiteLoadingContext);
}

export function SiteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const reduceMotion = useReducedMotion();

  const [navPending, setNavPending] = useState(false);
  const [manualCount, setManualCount] = useState(0);
  const firstNavClear = useRef(true);

  const setBusy = useCallback((busy: boolean) => {
    setManualCount((c) => (busy ? c + 1 : Math.max(0, c - 1)));
  }, []);

  useLayoutEffect(() => {
    if (firstNavClear.current) {
      firstNavClear.current = false;
      return;
    }
    setNavPending(false);
  }, [pathname, locale]);

  useEffect(() => {
    if (!navPending) return;
    const id = window.setTimeout(() => setNavPending(false), 15000);
    return () => window.clearTimeout(id);
  }, [navPending]);

  useEffect(() => {
    const onStart = () => setManualCount((c) => c + 1);
    const onEnd = () => setManualCount((c) => Math.max(0, c - 1));
    const onNavIntent = () => setNavPending(true);
    window.addEventListener(SITE_LOADING_START, onStart);
    window.addEventListener(SITE_LOADING_END, onEnd);
    window.addEventListener(SITE_NAV_INTENT_START, onNavIntent);
    return () => {
      window.removeEventListener(SITE_LOADING_START, onStart);
      window.removeEventListener(SITE_LOADING_END, onEnd);
      window.removeEventListener(SITE_NAV_INTENT_START, onNavIntent);
    };
  }, []);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const el = (e.target as Element | null)?.closest?.("a[href]");
      if (!el || !(el instanceof HTMLAnchorElement)) return;
      if (el.getAttribute("target") === "_blank" || el.hasAttribute("download")) return;
      const href = el.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      setNavPending(true);
    };

    const onPopState = () => setNavPending(true);

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const visible = navPending || manualCount > 0;

  const ctx = useMemo(() => ({ setBusy }), [setBusy]);

  return (
    <SiteLoadingContext.Provider value={ctx}>
      {children}
      <AnimatePresence>
        {visible ? (
          <motion.div
            key="site-loader"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.94 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 420, damping: 32, mass: 0.85 }
            }
            className="pointer-events-none fixed bottom-5 left-5 z-[9999] flex max-w-[min(240px,calc(100vw-2.5rem))] items-center gap-3 rounded-2xl border border-brand-primary/40 bg-brand-cream/95 px-4 py-3 shadow-[0_14px_44px_rgba(26,21,18,0.18)] backdrop-blur-md"
          >
            <span
              className="relative h-10 w-10 shrink-0 rounded-full border-2 border-brand-primary/20"
              aria-hidden
            >
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-primary border-r-brand-primary/40 motion-safe:animate-spin" />
              <span className="absolute inset-[5px] rounded-full bg-brand-primary/10" />
            </span>
            <span className="min-w-0 text-sm font-semibold leading-snug text-brand-dark">
              {t("loading")}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SiteLoadingContext.Provider>
  );
}
