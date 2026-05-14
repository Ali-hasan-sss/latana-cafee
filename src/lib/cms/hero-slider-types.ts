export type HeroSlideLocale = {
  title: string;
  text: string;
};

export type HeroSlideI18n = {
  imageSrc: string;
  order: number;
  en: HeroSlideLocale;
  ar: HeroSlideLocale;
  de: HeroSlideLocale;
};

/** Serialized slide for admin UI / server actions (Mongo subdoc _id as string when present) */
export type HeroSlideAdmin = HeroSlideI18n & { _id?: string };

export type HeroSlidePublic = {
  src: string;
  title: string;
  text: string;
};

export const CMS_LOCALES = ["en", "ar", "de"] as const;
export type CmsLocale = (typeof CMS_LOCALES)[number];
