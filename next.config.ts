import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  /**
   * Next checks `public/` before App routes. Uploaded files live on disk under
   * `public/uploads` but are gitignored — the static layer can still 404 before
   * our handlers run. `beforeFiles` runs first and forwards `/uploads/…` here.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:filename",
          destination: "/api/internal-uploads/:filename",
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
