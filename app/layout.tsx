import type { Metadata } from "next";
import { Alexandria, Cormorant_Garamond, Manrope, Noto_Sans_JP } from "next/font/google";
import { brand, brandAssets, brandSeo } from "@/lib/brand";
import { getSiteUrl } from "@/lib/seo/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-alexandria",
  display: "swap",
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-jp",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: brandSeo.titleDefault,
    template: brandSeo.titleTemplate,
  },
  description: brandSeo.description,
  icons: {
    icon: brandAssets.favicon,
  },
  openGraph: {
    title: brand.name,
    description: brandSeo.description,
    locale: "ar_EG",
    type: "website",
    siteName: brand.name,
    images: [{ url: brandAssets.socialAvatar }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brandSeo.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar-EG"
      dir="rtl"
      className={`${cormorant.variable} ${manrope.variable} ${alexandria.variable} ${notoJp.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-arabic text-ivory">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
