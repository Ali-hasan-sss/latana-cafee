import type { AbstractIntlMessages } from "next-intl";
import { createTranslator } from "use-intl/core";
import adminUiEn from "../../../messages/admin-ui/en.json";
import adminUiAr from "../../../messages/admin-ui/ar.json";
import adminUiDe from "../../../messages/admin-ui/de.json";
import type { AdminUiLocale } from "./get-admin-locale";

const bundles: Record<AdminUiLocale, typeof adminUiEn> = {
  en: adminUiEn,
  ar: adminUiAr,
  de: adminUiDe,
};

/** Messages shape expected by `NextIntlClientProvider` for admin client components. */
export function getAdminUiClientMessages(locale: AdminUiLocale): AbstractIntlMessages {
  return { adminUi: bundles[locale] } as AbstractIntlMessages;
}

export function getAdminTranslator(locale: AdminUiLocale) {
  return createTranslator({
    locale,
    messages: { adminUi: bundles[locale] } as Record<string, unknown>,
    namespace: "adminUi",
  });
}
