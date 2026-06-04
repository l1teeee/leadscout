"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function LandingCta() {
  const { ref, isVisible } = useIntersection<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-up w-full px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20 ${isVisible ? "is-visible" : ""}`}
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="retro text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          ¿LISTO PARA ESCALAR TUS VENTAS?
        </h2>
        <p className="mt-5 text-base font-medium sm:text-lg" style={{ ...bodyFont, color: "var(--text-2)" }}>
          Empieza gratis hoy. Sin tarjeta de crédito.
        </p>
        <Link
          href="/login"
          className="lnd-cta-btn retro pixel-text-sm mt-8 inline-flex h-12 items-center justify-center gap-2 px-6 font-bold active:translate-x-0.5 active:translate-y-0.5"
        >
          Crear cuenta gratis
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
