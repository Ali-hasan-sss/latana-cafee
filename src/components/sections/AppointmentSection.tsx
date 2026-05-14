import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { IntroBookingForm } from "@/components/sections/IntroBookingForm";
import { getPublicSiteContact } from "@/lib/cms/get-public-site-contact";

type Props = {
  mapImageFallback: string;
};

function resolveMapIframeSrc(
  embedSrc: string,
  lat: number | null,
  lng: number | null,
): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_SRC?.trim();
  if (fromEnv) return fromEnv;

  const fromData = embedSrc?.trim();
  if (fromData) return fromData;

  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed&iwloc=near`;
  }

  return null;
}

export async function AppointmentSection({ mapImageFallback }: Props) {
  const t = await getTranslations("appointment");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const contact = await getPublicSiteContact(locale);

  const iframeSrc = resolveMapIframeSrc(
    contact.mapEmbedSrc,
    contact.mapLat,
    contact.mapLng,
  );
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;

  return (
    <section
      id="contact"
      className="relative border-t border-brand-primary/20 bg-[#151311] text-white"
    >
      <div className="grid md:grid-cols-2">
        <div
          className="relative min-h-[280px] md:min-h-[520px]"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          {iframeSrc ? (
            <iframe
              title={t("mapAlt")}
              src={iframeSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <>
              <Image
                src={mapImageFallback}
                alt={t("mapAlt")}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-black/25" />
            </>
          )}
        </div>
        <div
          className="flex items-center justify-center px-6 py-12 md:justify-start md:px-12 lg:px-16"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-delay="100"
        >
          <IntroBookingForm variant="embedded" />
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#151311] px-6 py-5 text-center">
        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex border border-white/25 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:border-brand-primary hover:text-brand-primary"
        >
          {tc("viewMap")}
        </a>
      </div>
    </section>
  );
}
