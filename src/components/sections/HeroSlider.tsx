"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { HeroSlidePublic } from "@/lib/cms/hero-slider-types";

type Props = {
  slides: HeroSlidePublic[];
};

const bgEase = [0.22, 1, 0.36, 1] as const;
const slideDuration = 1.05;
const textDuration = 0.55;

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function HeroSlider({ slides }: Props) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const [index, setIndex] = useState(0);

  const len = slides.length;
  const goPrev = useCallback(() => {
    if (len < 1) return;
    setIndex((i) => (i - 1 + len) % len);
  }, [len]);
  const goNext = useCallback(() => {
    if (len < 1) return;
    setIndex((i) => (i + 1) % len);
  }, [len]);

  useEffect(() => {
    if (len < 1) return;
    const id = window.setInterval(goNext, 6500);
    return () => window.clearInterval(id);
  }, [goNext, len]);

  if (len < 1) {
    return null;
  }

  const current = slides[index]!;
  const src = current.src;

  return (
    <section
      id="home"
      className="home-slider owl-carousel relative min-h-screen w-full overflow-hidden"
    >
      {/* Background slide — slider-item + overlay (ftco) */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={src}
          className="slider-item absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: slideDuration, ease: bgEase }}
        >
          {/^https?:\/\//i.test(src) ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote hero URLs from CMS
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="overlay absolute inset-0 bg-black/35" aria-hidden />
        </motion.div>
      </AnimatePresence>

      {/* Content — container + slider-text + col-md-8 */}
      <div className="relative z-10 flex min-h-screen items-center">
        <Container className="w-full">
          <div className="slider-text flex min-h-[calc(100svh-5.5rem)] flex-col items-center justify-center py-16 md:min-h-[calc(100svh-4rem)] md:py-20">
            <div className="col-md-8 w-full max-w-[720px] text-center sm:max-w-[85%] md:w-2/3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  className="ftco-animate fadeInUp"
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: textDuration, ease: bgEase }}
                >
                  {locale === "ar" ? (
                    <span className="subheading mb-2 block text-2xl font-semibold text-brand-primary md:text-3xl">
                      {t("welcome")}
                    </span>
                  ) : (
                    <span className="subheading mb-2 block font-accent text-3xl leading-none text-brand-primary md:text-4xl lg:text-[2.75rem]">
                      {t("welcome")}
                    </span>
                  )}

                  <h1 className="mb-4 font-display text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl xl:text-[3.5rem]">
                    {current.title}
                  </h1>

                  <p className="mb-4 max-w-2xl text-base leading-relaxed text-white/90 md:mx-auto md:mb-8 md:text-lg">
                    {current.text}
                  </p>

                  <p className="mb-0 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    <a
                      href="#book"
                      className="btn btn-primary inline-flex items-center justify-center rounded-sm border border-brand-primary bg-brand-primary p-3 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover md:text-sm xl:px-10 xl:py-3"
                    >
                      {t("orderNow")}
                    </a>
                    <Link
                      href="/menu"
                      className="btn btn-white btn-outline-white inline-flex items-center justify-center rounded-sm border-2 border-white bg-transparent p-3 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-[#232323] md:text-sm xl:px-10 xl:py-3"
                    >
                      {t("viewMenu")}
                    </Link>
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>

      {/* owl-nav — prev / next */}
      <div className="owl-nav pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden md:block">
        <button
          type="button"
          className="owl-prev pointer-events-auto absolute start-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-sm border border-white/25 bg-black/25 text-white backdrop-blur-[2px] transition hover:border-brand-primary hover:bg-brand-primary hover:text-white lg:start-6"
          aria-label="Previous slide"
          onClick={goPrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="owl-next pointer-events-auto absolute end-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-sm border border-white/25 bg-black/25 text-white backdrop-blur-[2px] transition hover:border-brand-primary hover:bg-brand-primary hover:text-white lg:end-6"
          aria-label="Next slide"
          onClick={goNext}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* owl-dots */}
      <div className="owl-dots absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2 md:bottom-10">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`owl-dot flex items-center justify-center p-1 transition ${
              i === index ? "active" : ""
            }`}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          >
            <span
              className={`block h-2.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-brand-primary"
                  : "w-2.5 bg-white/45 hover:bg-white/75"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
