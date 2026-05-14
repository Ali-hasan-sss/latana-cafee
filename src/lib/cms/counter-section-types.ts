export type CounterLocaleSection = {
  sub: string;
  title: string;
  lead: string;
};

export type CounterItemLocaleLabel = {
  label: string;
};

export type CounterItemDocument = {
  id: string;
  value: number;
  suffix: string;
  en: CounterItemLocaleLabel;
  ar: CounterItemLocaleLabel;
  de: CounterItemLocaleLabel;
};

export type CounterSectionDocument = {
  bgImageSrc: string;
  en: CounterLocaleSection;
  ar: CounterLocaleSection;
  de: CounterLocaleSection;
  items: CounterItemDocument[];
};

export type CounterStatPublic = {
  id: string;
  value: number;
  suffix: string;
  label: string;
};

export type CounterSectionPublic = CounterLocaleSection & {
  bgImageSrc: string;
  stats: CounterStatPublic[];
};

export function pickCounterPublic(doc: CounterSectionDocument, locale: string): CounterSectionPublic {
  const sec = locale === "ar" ? doc.ar : locale === "de" ? doc.de : doc.en;
  const stats = doc.items.map((item) => ({
    id: item.id,
    value: item.value,
    suffix: item.suffix,
    label: locale === "ar" ? item.ar.label : locale === "de" ? item.de.label : item.en.label,
  }));
  return {
    bgImageSrc: doc.bgImageSrc,
    sub: sec.sub,
    title: sec.title,
    lead: sec.lead,
    stats,
  };
}
