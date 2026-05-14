import type { ServicesSectionDocument } from "./services-section-types";
import { getServicesData } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type ServicesMsg = { sub?: string; title?: string; lead?: string };

function sectionBlock(lang: ServicesMsg): ServicesSectionDocument["en"] {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    lead: lang.lead ?? "",
  };
}

export function getFallbackServicesSectionDocument(): ServicesSectionDocument {
  const { items } = getServicesData();
  return {
    en: sectionBlock(en.servicesSection as ServicesMsg),
    ar: sectionBlock(ar.servicesSection as ServicesMsg),
    de: sectionBlock(de.servicesSection as ServicesMsg),
    items: items.map((row) => ({
      id: row.id,
      icon: row.icon,
      en: { title: row.en.title ?? "", text: row.en.text ?? "" },
      ar: { title: row.ar.title ?? "", text: row.ar.text ?? "" },
      de: { title: row.de.title ?? "", text: row.de.text ?? "" },
    })),
  };
}
