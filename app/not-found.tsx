import { LandingNavbar } from "@/components/landing/landing-navbar";
import NotFound1 from "@/components/ui/8bit-not-found1";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen w-full flex-col"
      style={{ background: "var(--bg)" }}
    >
      <LandingNavbar />
      <div className="flex flex-1 items-center justify-center pt-14">
        <NotFound1
          title="Esta sala no existe"
          description="La página que buscás no existe. Volvé al inicio para retomar el camino."
          cta="Volver al inicio"
          href="/"
        />
      </div>
    </main>
  );
}
