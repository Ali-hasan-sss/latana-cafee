import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { getPublicGallerySettings } from "@/lib/cms/get-public-gallery-settings";

export async function GallerySection() {
  const t = await getTranslations("gallery");
  const { homeTeaser } = await getPublicGallerySettings();

  return (
    <section aria-label={t("open")} className="relative">
      <AdminFloatingEditLink href="/admin/gallery" label="Edit gallery" />
      <div className="grid grid-cols-2 md:grid-cols-4">
        {homeTeaser.map((src, i) => (
          <Link
            key={`${src}-${i}`}
            href="/gallery"
            className="group relative block aspect-square overflow-hidden"
            data-aos="zoom-in"
            data-aos-duration="800"
            data-aos-delay={String(i * 80)}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 768px) 25vw, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <span className="rounded-full border border-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                {t("search")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
