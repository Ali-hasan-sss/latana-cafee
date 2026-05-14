import type {
  CounterItemDocument,
  CounterLocaleSection,
  CounterSectionDocument,
} from "./counter-section-types";
import { getAssets, getCatalog, type Catalog } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type CountersMsg = Record<string, string | undefined>;

function sectionBlock(lang: { sub?: string; title?: string; lead?: string }): CounterLocaleSection {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    lead: lang.lead ?? "",
  };
}

function labelFor(lang: CountersMsg, key: string): string {
  return String(lang[key] ?? "").trim();
}

function itemFromCatalogRow(
  row: Catalog["counters"][number],
  enM: CountersMsg,
  arM: CountersMsg,
  deM: CountersMsg,
): CounterItemDocument {
  const id = row.labelKey;
  return {
    id,
    value: typeof row.value === "number" ? row.value : Number(row.value) || 0,
    suffix: row.suffix ?? "",
    en: { label: labelFor(enM, id) },
    ar: { label: labelFor(arM, id) },
    de: { label: labelFor(deM, id) },
  };
}

export function getFallbackCounterSectionDocument(): CounterSectionDocument {
  const { counters } = getCatalog();
  const assets = getAssets();
  const enM = en.counters as CountersMsg;
  const arM = ar.counters as CountersMsg;
  const deM = de.counters as CountersMsg;

  return {
    bgImageSrc: assets.counterBg,
    en: sectionBlock(en.counters),
    ar: sectionBlock(ar.counters),
    de: sectionBlock(de.counters),
    items: counters.map((row) => itemFromCatalogRow(row, enM, arM, deM)),
  };
}
