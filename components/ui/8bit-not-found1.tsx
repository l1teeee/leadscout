"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/8bit-button";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

interface NotFound1Props {
  className?: string;
  cta?: string;
  description?: string;
  href?: string;
  imageSrc?: string;
  title?: string;
}

export default function NotFound1({
  title,
  description,
  cta,
  href = "/",
  imageSrc = "https://www.8bitcn.com/_next/image?url=%2Fimages%2F8bit-ogre.png&w=256&q=75&dpl=dpl_B9Q5u7DD6qZpoCz3VRwuR19npVHK",
  className,
}: NotFound1Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].notFound;
  const displayTitle = title ?? tr.title;
  const displayDescription = description ?? tr.description;
  const displayCta = cta ?? tr.cta;

  return (
    <div
      className={cn(
        "retro grid w-full place-content-center gap-5 bg-background px-4 py-16 text-center md:py-24",
        className,
      )}
    >
      <div className="retro font-bold text-6xl tracking-tight sm:text-8xl">
        404
      </div>
      {imageSrc && (
        <div className="flex justify-center -mt-10">
          <div
            aria-label="404"
            role="img"
            className="pixelated"
            style={{
              width: 200,
              height: 200,
              backgroundImage: `url(${imageSrc})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
          />
        </div>
      )}
      <h1 className="retro font-bold text-2xl tracking-tight sm:text-4xl">
        {displayTitle}
      </h1>
      <p className="retro text-muted-foreground text-xs">{displayDescription}</p>
      <div className="flex justify-center">
        <Link href={href}>
          <Button>{displayCta}</Button>
        </Link>
      </div>
    </div>
  );
}
