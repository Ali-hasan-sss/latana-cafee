import type { Metadata } from "next";
import { HeroSliderAdminPanel } from "@/components/admin/HeroSliderAdminPanel";
import { getHeroSlidesForAdmin } from "@/app/actions/hero-slider-admin";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("heroSlider");
}

export default async function AdminHeroSliderPage() {
  const slides = await getHeroSlidesForAdmin();

  return <HeroSliderAdminPanel initialSlides={slides} />;
}
