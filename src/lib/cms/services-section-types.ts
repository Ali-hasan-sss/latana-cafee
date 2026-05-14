export type ServicesLocaleSection = {
  sub: string;
  title: string;
  lead: string;
};

export type ServiceItemLocaleCopy = {
  title: string;
  text: string;
};

export type ServiceItemDocument = {
  id: string;
  icon: string;
  en: ServiceItemLocaleCopy;
  ar: ServiceItemLocaleCopy;
  de: ServiceItemLocaleCopy;
};

export type ServicesSectionDocument = {
  en: ServicesLocaleSection;
  ar: ServicesLocaleSection;
  de: ServicesLocaleSection;
  items: ServiceItemDocument[];
};

export type ServicesSectionPublic = {
  section: ServicesLocaleSection;
  items: Array<{
    id: string;
    icon: string;
    title: string;
    text: string;
  }>;
};

export function pickServicesPublic(doc: ServicesSectionDocument, locale: string): ServicesSectionPublic {
  const section = locale === "ar" ? doc.ar : locale === "de" ? doc.de : doc.en;
  const items = doc.items.map((item) => {
    const block = locale === "ar" ? item.ar : locale === "de" ? item.de : item.en;
    return {
      id: item.id,
      icon: item.icon,
      title: block.title,
      text: block.text,
    };
  });
  return { section, items };
}
