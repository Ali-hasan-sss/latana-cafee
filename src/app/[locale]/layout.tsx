import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Great_Vibes,
  Noto_Sans,
  Noto_Sans_Arabic,
  Playfair_Display,
} from "next/font/google";
import { AosProvider } from "@/components/providers/AosProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const sans = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const sansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-body-arabic",
  weight: ["400", "500", "600", "700"],
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const accent = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "Latana Cafe",
  description: "Specialty coffee, simple food, and neighborhood hospitality.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const messages = await getMessages();

  const bodyFont =
    locale === "ar" ? sansArabic.className : sans.className;

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${sans.variable} ${sansArabic.variable} ${display.variable} ${accent.variable}`}
      suppressHydrationWarning
    >
      <body className={`${bodyFont} min-h-screen text-brand-dark antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AosProvider>{children}</AosProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
