import type {
  CounterItemDocument,
  CounterItemLocaleLabel,
  CounterLocaleSection,
  CounterSectionDocument,
} from "./counter-section-types";

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeNum(db: unknown, fb: number): number {
  const n = typeof db === "number" ? db : Number(db);
  return Number.isFinite(n) ? n : fb;
}

function mergeLabel(db: CounterItemLocaleLabel, fb: CounterItemLocaleLabel): CounterItemLocaleLabel {
  return { label: pickStr(db.label, fb.label) };
}

function mergeSection(db: CounterLocaleSection, fb: CounterLocaleSection): CounterLocaleSection {
  return {
    sub: pickStr(db.sub, fb.sub),
    title: pickStr(db.title, fb.title),
    lead: pickStr(db.lead, fb.lead),
  };
}

export function leanToCounter(raw: {
  bgImageSrc?: string;
  en?: Partial<CounterLocaleSection>;
  ar?: Partial<CounterLocaleSection>;
  de?: Partial<CounterLocaleSection>;
  items?: Array<{
    id?: string;
    value?: number;
    suffix?: string;
    en?: Partial<CounterItemLocaleLabel>;
    ar?: Partial<CounterItemLocaleLabel>;
    de?: Partial<CounterItemLocaleLabel>;
  }>;
}): CounterSectionDocument {
  const loc = (x?: Partial<CounterLocaleSection>): CounterLocaleSection => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    lead: x?.lead ?? "",
  });
  const lab = (x?: Partial<CounterItemLocaleLabel>): CounterItemLocaleLabel => ({
    label: x?.label ?? "",
  });
  const items: CounterItemDocument[] = (raw.items ?? []).map((row) => ({
    id: row.id ?? "",
    value: mergeNum(row.value, 0),
    suffix: row.suffix ?? "",
    en: lab(row.en),
    ar: lab(row.ar),
    de: lab(row.de),
  }));
  return {
    bgImageSrc: raw.bgImageSrc ?? "",
    en: loc(raw.en),
    ar: loc(raw.ar),
    de: loc(raw.de),
    items,
  };
}

export function mergeCounterDbWithFallback(
  db: CounterSectionDocument,
  fallback: CounterSectionDocument,
): CounterSectionDocument {
  const mergedItems: CounterItemDocument[] = fallback.items.map((fb) => {
    const d = db.items.find((x) => x.id === fb.id);
    if (!d) {
      return { ...fb };
    }
    return {
      id: fb.id,
      value: mergeNum(d.value, fb.value),
      suffix: pickStr(d.suffix, fb.suffix),
      en: mergeLabel(d.en, fb.en),
      ar: mergeLabel(d.ar, fb.ar),
      de: mergeLabel(d.de, fb.de),
    };
  });
  return {
    bgImageSrc: pickStr(db.bgImageSrc, fallback.bgImageSrc),
    en: mergeSection(db.en, fallback.en),
    ar: mergeSection(db.ar, fallback.ar),
    de: mergeSection(db.de, fallback.de),
    items: mergedItems,
  };
}
