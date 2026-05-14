"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { setAdminUiLocale } from "@/app/actions/admin-locale";

type Props = { current: string };

export function AdminLangSwitch({ current }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations("adminUi");

  const pick = (loc: string) => {
    startTransition(async () => {
      await setAdminUiLocale(loc);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
      <span className="hidden px-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40 sm:inline">
        {t("shell.language")}
      </span>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={pending}
          onClick={() => pick(loc)}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase transition disabled:opacity-50 ${
            current === loc ? "bg-brand-primary text-[#212529]" : "text-white/55 hover:text-white"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
