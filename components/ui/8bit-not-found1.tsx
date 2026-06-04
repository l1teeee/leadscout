import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/8bit-button";

interface NotFound1Props {
  className?: string;
  cta?: string;
  description?: string;
  href?: string;
  imageSrc?: string;
  title?: string;
}

export default function NotFound1({
  title = "Página no encontrada",
  description = "La ruta que buscás no está disponible.",
  cta = "Volver al inicio",
  href = "/",
  imageSrc = "https://www.8bitcn.com/_next/image?url=%2Fimages%2F8bit-ogre.png&w=256&q=75&dpl=dpl_B9Q5u7DD6qZpoCz3VRwuR19npVHK",
  className,
}: NotFound1Props) {
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
        {title}
      </h1>
      <p className="retro text-muted-foreground text-xs">{description}</p>
      <div className="flex justify-center">
        <Link href={href}>
          <Button>{cta}</Button>
        </Link>
      </div>
    </div>
  );
}
