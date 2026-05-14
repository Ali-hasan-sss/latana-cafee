"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { adminLogin, type AdminLoginState } from "@/app/actions/admin-auth";

export function LoginForm() {
  const t = useTranslations("adminUi");
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    adminLogin,
    null,
  );

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-white/10 bg-[#1a1a1a] p-8 shadow-xl">
      <h1 className="mb-1 text-xl font-semibold text-white">{t("login.title")}</h1>
      <p className="mb-6 text-sm text-white/60">{t("login.subtitle")}</p>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-xs font-medium text-white/80">
            {t("login.username")}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            disabled={pending}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-primary/40 placeholder:text-white/35 focus:ring-2"
            placeholder={t("login.placeholderUsername")}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-white/80">
            {t("login.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-primary/40 placeholder:text-white/35 focus:ring-2"
          />
        </div>

        {state?.error ? (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? t("login.signingIn") : t("login.signIn")}
        </button>
      </form>
    </div>
  );
}
