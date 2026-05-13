"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
};

function PostHeader() {
  const tf = useTranslations("blog.feed");
  return (
    <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white px-3 py-2.5">
      <div
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand-primary/50 to-brand-primary/15 ring-2 ring-white"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-brand-dark">
          {tf("handle")}
        </p>
        <p className="truncate text-xs text-brand-muted">{tf("meta")}</p>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  if (dir === "left") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function MediaSingle({ src }: { src: string }) {
  return (
    <div className="relative aspect-[4/5] w-full bg-black/[0.04] sm:aspect-[3/4]">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 40vw, 92vw"
      />
    </div>
  );
}

function MediaCarousel({ srcs }: { srcs: string[] }) {
  const tg = useTranslations("gallery");
  const tf = useTranslations("blog.feed");
  const [idx, setIdx] = useState(0);
  const len = srcs.length;
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => {
      setIdx((i) => (i + d + len) % len);
    },
    [len],
  );

  useEffect(() => {
    setIdx(0);
  }, [srcs]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={tf("galleryAria")}
      tabIndex={0}
      className="relative aspect-[4/5] w-full bg-black/[0.04] outline-none ring-brand-primary/30 focus-visible:ring-2 sm:aspect-[3/4]"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const x = e.changedTouches[0]?.clientX ?? touchStartX.current;
        const dx = x - touchStartX.current;
        if (dx > 48) go(-1);
        else if (dx < -48) go(1);
        touchStartX.current = null;
      }}
    >
      {srcs.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            i === idx ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={i !== idx}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 92vw"
            priority={i === idx && i === 0}
          />
        </div>
      ))}

      {len > 1 ? (
        <>
          <button
            type="button"
            className="absolute start-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-[2px] transition hover:bg-black/50"
            aria-label={tg("previous")}
            onClick={() => go(-1)}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="absolute end-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-[2px] transition hover:bg-black/50"
            aria-label={tg("next")}
            onClick={() => go(1)}
          >
            <Chevron dir="right" />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {srcs.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2 w-2 rounded-full p-0 transition ${
                  i === idx
                    ? "scale-125 bg-white shadow"
                    : "bg-white/45 hover:bg-white/75"
                }`}
                aria-label={tg("counter", { current: i + 1, total: len })}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function BlogArticleInstagramGallery({ images }: Props) {
  const list = images.filter(
    (x): x is string => typeof x === "string" && x.length > 0,
  );
  const len = list.length;
  if (len === 0) return null;

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] lg:ms-auto lg:me-0">
      <PostHeader />
      {len === 1 ? <MediaSingle src={list[0]} /> : <MediaCarousel srcs={list} />}
    </div>
  );
}
