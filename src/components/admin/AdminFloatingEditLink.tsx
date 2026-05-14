"use client";

import Link from "next/link";
import { useAdminSessionVisible } from "@/components/admin/use-admin-session-visible";

type Props = {
  href: string;
  label?: string;
};

export function AdminFloatingEditLink({ href, label = "Edit section" }: Props) {
  const show = useAdminSessionVisible();

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute end-4 top-4 z-[30] md:end-8 md:top-8">
      <Link
        href={href}
        className="pointer-events-auto inline-flex rounded-md border border-brand-primary/80 bg-black/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-primary shadow-md backdrop-blur-sm transition hover:bg-brand-primary hover:text-[#212529]"
      >
        {label}
      </Link>
    </div>
  );
}
