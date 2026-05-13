"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  ar: "ع",
  de: "DE",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-1 rounded border border-white/15 bg-black/20 p-0.5"
      role="navigation"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`min-w-[2.25rem] rounded px-2 py-1 text-xs font-semibold transition-colors ${
            locale === loc
              ? "bg-brand-primary text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {labels[loc] ?? loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
