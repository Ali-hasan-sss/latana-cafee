import type {
  ServiceItemDocument,
  ServiceItemLocaleCopy,
  ServicesLocaleSection,
  ServicesSectionDocument,
} from "./services-section-types";

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeLocaleCopy(db: ServiceItemLocaleCopy, fb: ServiceItemLocaleCopy): ServiceItemLocaleCopy {
  return {
    title: pickStr(db.title, fb.title),
    text: pickStr(db.text, fb.text),
  };
}

function mergeSection(db: ServicesLocaleSection, fb: ServicesLocaleSection): ServicesLocaleSection {
  return {
    sub: pickStr(db.sub, fb.sub),
    title: pickStr(db.title, fb.title),
    lead: pickStr(db.lead, fb.lead),
  };
}

export function leanToServices(raw: {
  en?: { sub?: string; title?: string; lead?: string };
  ar?: { sub?: string; title?: string; lead?: string };
  de?: { sub?: string; title?: string; lead?: string };
  items?: Array<{
    id?: string;
    icon?: string;
    en?: { title?: string; text?: string };
    ar?: { title?: string; text?: string };
    de?: { title?: string; text?: string };
  }>;
}): ServicesSectionDocument {
  const loc = (x?: { sub?: string; title?: string; lead?: string }): ServicesLocaleSection => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    lead: x?.lead ?? "",
  });
  const copy = (x?: { title?: string; text?: string }): ServiceItemLocaleCopy => ({
    title: x?.title ?? "",
    text: x?.text ?? "",
  });
  const items: ServiceItemDocument[] = (raw.items ?? []).map((row) => ({
    id: row.id ?? "",
    icon: row.icon ?? "",
    en: copy(row.en),
    ar: copy(row.ar),
    de: copy(row.de),
  }));
  return {
    en: loc(raw.en),
    ar: loc(raw.ar),
    de: loc(raw.de),
    items,
  };
}

export function mergeServicesDbWithFallback(
  db: ServicesSectionDocument,
  fallback: ServicesSectionDocument,
): ServicesSectionDocument {
  const mergedItems: ServiceItemDocument[] = fallback.items.map((fb) => {
    const d = db.items.find((x) => x.id === fb.id);
    if (!d) {
      return { ...fb };
    }
    return {
      id: fb.id,
      icon: fb.icon,
      en: mergeLocaleCopy(d.en, fb.en),
      ar: mergeLocaleCopy(d.ar, fb.ar),
      de: mergeLocaleCopy(d.de, fb.de),
    };
  });
  return {
    en: mergeSection(db.en, fallback.en),
    ar: mergeSection(db.ar, fallback.ar),
    de: mergeSection(db.de, fallback.de),
    items: mergedItems,
  };
}
