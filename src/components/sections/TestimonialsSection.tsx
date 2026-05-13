import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Assets } from "@/lib/data";
import type { Catalog } from "@/lib/data";

type Props = {
  bg: string;
  avatars: Assets["testimonials"]["avatars"];
  items: Catalog["testimonials"];
};

export async function TestimonialsSection({ bg, avatars, items }: Props) {
  const t = await getTranslations("testimonials");
  const ti = await getTranslations("testimonials.items");

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0">
        <Image
          src={bg}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-darker/80" />
      </div>
      <Container className="relative z-10">
        <SectionHeading
          sub={t("sub")}
          title={t("title")}
          lead={t("lead")}
          className="text-white [&_h2]:text-white [&_p]:text-white/80"
        />
      </Container>
      <div className="relative z-10 mt-4 overflow-x-auto pb-4">
        <div className="flex min-w-full gap-0 px-4 md:px-8 lg:justify-center">
          {items.map((item) => {
            const avatar = avatars[item.avatarIndex] ?? avatars[0];
            return (
              <blockquote
                key={item.itemKey}
                className={`min-w-[min(100%,320px)] shrink-0 border-e border-white/10 px-6 py-8 text-white last:border-e-0 md:min-w-[280px] ${
                  item.overlay ? "bg-white/5" : ""
                }`}
                data-aos="fade-up"
                data-aos-duration="800"
              >
                <p className="text-sm leading-relaxed text-white/90 md:text-base">
                  “{ti(`${item.itemKey}.quote`)}”
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-brand-primary/40">
                    <Image
                      src={avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="text-start">
                    <div className="font-semibold text-white">
                      {ti(`${item.itemKey}.name`)}
                    </div>
                    <div className="text-xs text-brand-primary">
                      {ti(`${item.itemKey}.role`)}
                    </div>
                  </div>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}
