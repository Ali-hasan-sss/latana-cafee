import { getLocale, getTranslations } from "next-intl/server";
import { CounterSectionClient } from "@/components/sections/CounterSectionClient";
import { getPublicCounterSection } from "@/lib/cms/get-public-counter-section";

export async function CounterSection() {
  const locale = await getLocale();
  const data = await getPublicCounterSection(locale);
  const tc = await getTranslations("common");

  return <CounterSectionClient data={data} viewMoreLabel={tc("viewMore")} />;
}
