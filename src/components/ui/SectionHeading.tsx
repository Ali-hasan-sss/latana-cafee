import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  sub?: string;
  title: string;
  lead?: string;
  align?: "left" | "center" | "right";
  className?: string;
  children?: ReactNode;
  /** Internal route (e.g. `/menu`) or hash (e.g. `/#contact`). */
  moreHref?: string;
  moreLabel?: string;
  /** Extra classes for the “view more” control (e.g. light text on dark sections). */
  moreButtonClassName?: string;
  /** AOS animation; set false to skip (e.g. inside nested animated regions). */
  dataAos?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | false;
  dataAosDelay?: number;
};

const defaultMoreBtn =
  "inline-flex items-center justify-center border border-brand-primary bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary no-underline transition hover:bg-brand-primary hover:text-white";

export function SectionHeading({
  sub,
  title,
  lead,
  align = "center",
  className = "",
  children,
  moreHref,
  moreLabel,
  moreButtonClassName,
  dataAos = "fade-up",
  dataAosDelay,
}: Props) {
  const alignCls =
    align === "left"
      ? "text-start"
      : align === "right"
        ? "text-end"
        : "text-center";

  const aosProps =
    dataAos === false
      ? {}
      : {
          "data-aos": dataAos,
          "data-aos-duration": "800",
          ...(dataAosDelay != null
            ? { "data-aos-delay": String(dataAosDelay) }
            : {}),
        };

  return (
    <div
      className={`mb-10 md:mb-14 ${alignCls} ${className}`}
      {...aosProps}
    >
      {sub ? (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary">
          {sub}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-semibold text-brand-dark md:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-muted md:text-lg">
          {lead}
        </p>
      ) : null}
      {moreHref && moreLabel ? (
        <div
          className={
            align === "center"
              ? "mt-10 flex justify-center"
              : align === "right"
                ? "mt-10 flex justify-end"
                : "mt-10 flex justify-start"
          }
        >
          {moreHref.startsWith("http") ? (
            <a
              href={moreHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${moreButtonClassName ?? defaultMoreBtn}`}
            >
              {moreLabel}
            </a>
          ) : (
            <Link
              href={moreHref}
              className={`${moreButtonClassName ?? defaultMoreBtn}`}
            >
              {moreLabel}
            </Link>
          )}
        </div>
      ) : null}
      {children}
    </div>
  );
}
