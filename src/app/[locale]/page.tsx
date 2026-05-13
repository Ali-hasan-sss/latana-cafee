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
import { getAssets, getCatalog } from "@/lib/data";

export default async function HomePage() {
  const assets = getAssets();
  const catalog = getCatalog();

  return (
    <>
      <Navbar />
      <main>
        <HeroSlider slides={assets.heroSlides} />
        <IntroBar />
        <AboutSection image={assets.aboutImage} />
        <ServicesSection />
        <MenuPreviewSection
          images={assets.menuPreview}
          menuPdf={assets.menuPdf}
        />
        <CounterSection bg={assets.counterBg} counters={catalog.counters} />
        <BestSellersSection
          images={assets.bestSellers}
          items={catalog.bestSellers}
        />
        <GallerySection images={assets.gallery} />
        <ProductsTabsSection
          productImages={assets.products}
          tabs={catalog.productTabs}
        />
        <BlogSection images={assets.blog} posts={catalog.blog} />
        <AppointmentSection
          mapEmbedSrc={assets.cafeGoogleMapsEmbedSrc}
          mapLat={assets.cafeMapLat}
          mapLng={assets.cafeMapLng}
          mapImageFallback={assets.appointmentMapPlaceholder}
        />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}
