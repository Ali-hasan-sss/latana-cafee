import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { IntroBar } from "@/components/sections/IntroBar";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { MenuPreviewSection } from "@/components/sections/MenuPreviewSection";
import { CounterSection } from "@/components/sections/CounterSection";
import { BestSellersSection } from "@/components/sections/BestSellersSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ProductsTabsSection } from "@/components/sections/ProductsTabsSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { AppointmentSection } from "@/components/sections/AppointmentSection";
import { getPublicHeroSlides } from "@/lib/cms/get-public-hero-slides";
import { getAssets } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const assets = getAssets();
  const heroSlides = await getPublicHeroSlides(locale);

  return (
    <>
      <Navbar />
      <main>
        <HeroSlider slides={heroSlides} />
        <IntroBar />
        <AboutSection />
        <ServicesSection />
        <MenuPreviewSection />
        <CounterSection />
        <BestSellersSection />
        <GallerySection />
        <ProductsTabsSection />
        <BlogSection />
        <AppointmentSection mapImageFallback={assets.appointmentMapPlaceholder} />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}
