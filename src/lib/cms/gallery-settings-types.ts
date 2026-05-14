export type GallerySettingsDocument = {
  /** All images shown on the full gallery page */
  pool: string[];
  /** Exactly four URLs (subset of pool) for the home teaser strip */
  homeTeaser: string[];
};
