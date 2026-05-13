"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

type Props = {
  images: string[];
};

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const navBtnClass =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition hover:border-brand-primary hover:bg-brand-primary/25 hover:text-brand-primary md:h-14 md:w-14";

/** Cycle portrait / landscape / near-square tiles for an editorial gallery feel */
const TILE_ASPECTS = [
  "aspect-[3/4]",
  "aspect-[5/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[16/10]",
  "aspect-[2/3]",
  "aspect-[4/3]",
  "aspect-[5/6]",
] as const;

function tileAspectClass(i: number): string {
  return TILE_ASPECTS[i % TILE_ASPECTS.length] ?? TILE_ASPECTS[0];
}

export function GalleryLightboxGrid({ images }: Props) {
  const t = useTranslations("gallery");
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const len = images.length;

  const close = useCallback(() => setActive(null), []);

  const goPrev = useCallback(() => {
    setActive((i) => {
      if (i === null || len < 1) return i;
      return (i - 1 + len) % len;
    });
  }, [len]);

  const goNext = useCallback(() => {
    setActive((i) => {
      if (i === null || len < 1) return i;
      return (i + 1) % len;
    });
  }, [len]);

  const open = active !== null;
  const current = open && active !== null ? active : 0;
  const src = images[current] ?? "";

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tId = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(tId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, goPrev, goNext]);

  if (len === 0) return null;

  return (
    <>
      <section
        className="gallery-page-grid ftco-section menu-pricing-section py-16 md:py-24"
        aria-label={t("open")}
      >
        <Container className="container">
          <div
            className="columns-1 [column-gap:0.75rem] sm:columns-2 sm:[column-gap:1rem] md:columns-3 md:[column-gap:1.125rem] lg:columns-4 lg:[column-gap:1.25rem]"
            role="list"
          >
            {images.map((imageSrc, i) => (
              <div
                key={`${imageSrc}-${i}`}
                className="break-inside-avoid mb-3 sm:mb-4"
                role="listitem"
                data-aos="zoom-in"
                data-aos-duration="800"
                data-aos-delay={String(Math.min(i * 80, 400))}
              >
                <button
                  type="button"
                  className="group relative block w-full overflow-hidden rounded-sm border border-white/[0.06]  outline-none ring-brand-primary/40 transition focus-visible:ring-2"
                  onClick={() => setActive(i)}
                  aria-label={t("viewFull", { current: i + 1, total: len })}
                >
                  <div
                    className={`relative w-full overflow-hidden ${tileAspectClass(i)}`}
                  >
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 92vw"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="rounded-full border border-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white md:text-xs">
                      {t("search")}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {open ? (
        <div
          className="fixed inset-0 z-[100] bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={t("dialogTitle")}
          onClick={close}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute end-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-brand-primary hover:bg-brand-primary/20 hover:text-brand-primary md:end-6 md:top-6"
            aria-label={t("close")}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          {len > 1 ? (
            <>
              <button
                type="button"
                className={`absolute start-3 top-1/2 z-20 -translate-y-1/2 md:start-6 ${navBtnClass}`}
                aria-label={t("previous")}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </button>

              <button
                type="button"
                className={`absolute end-3 top-1/2 z-20 -translate-y-1/2 md:end-6 ${navBtnClass}`}
                aria-label={t("next")}
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            </>
          ) : null}

          <div
            className="relative z-10 flex h-full w-full items-center justify-center px-14 py-20 md:px-24 md:py-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[min(82vh,880px)] w-full max-w-6xl">
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              ) : null}
            </div>
          </div>

          <p className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-sm font-medium tabular-nums text-white/65">
            {t("counter", { current: current + 1, total: len })}
          </p>
        </div>
      ) : null}
    </>
  );
}
