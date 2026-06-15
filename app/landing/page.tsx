import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { getLang } from "@/lib/get-lang";
import { translations } from "@/lib/i18n";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

const LANDING_PATH = "/landing";
const LANDING_URL = absoluteUrl(LANDING_PATH);

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const seo = translations[lang].seo;

  return {
    title: seo.title,
    description: seo.description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: LANDING_PATH,
    },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: LANDING_PATH,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function LandingPublicPage() {
  const lang = await getLang();
  const seo = translations[lang].seo;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: LANDING_URL,
    description: seo.description,
    inLanguage: lang,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage />
    </>
  );
}
