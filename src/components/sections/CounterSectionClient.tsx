"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { Container } from "@/components/ui/Container";
import type { CounterSectionPublic } from "@/lib/cms/counter-section-types";

type Props = {
  data: CounterSectionPublic;
  viewMoreLabel: string;
};

function useCountUp(target: number, start: boolean) {
  const [v, setV] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;
    const duration = 1400;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) * (1 - p);
      setV(Math.round(target * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, start]);

  return v;
}

function Stat({
  value,
  suffix,
  label,
  delayMs,
}: {
  value: number;
  suffix: string;
  label: string;
  delayMs: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const display = useCountUp(value, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="counter-wrap w-full"
      data-aos="fade-up"
      data-aos-duration="800"
      data-aos-delay={String(delayMs)}
    >
      <div className="block-18 text-center">
        <div className="text">
          <div className="icon">
            <span className="icon-box" aria-hidden="true">
              <span className="flaticon-coffee-cup" />
            </span>
          </div>
          <strong className="number">
            {display.toLocaleString()}
            {suffix}
          </strong>
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

export function CounterSectionClient({ data, viewMoreLabel }: Props) {
  const { bgImageSrc, sub, title, lead, stats } = data;

  return (
    <section
      className="ftco-counter ftco-bg-dark img relative py-20 md:py-28"
      style={{
        backgroundImage: `url(${bgImageSrc})`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <AdminFloatingEditLink href="/admin/counter-section" />
      <div className="absolute inset-0 bg-brand-darker/75" />
      <Container className="relative z-10">
        <header className="mb-14 text-center md:mb-16">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary">{sub}</p>
          <h2 className="mb-4 font-display text-3xl font-semibold text-white md:text-4xl">{title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">{lead}</p>
          <Link
            href="/menu"
            className="inline-flex border border-white/70 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:bg-white hover:text-brand-dark"
          >
            {viewMoreLabel}
          </Link>
        </header>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((c, i) => (
            <Stat
              key={c.id}
              value={c.value}
              suffix={c.suffix}
              label={c.label}
              delayMs={i * 100}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
