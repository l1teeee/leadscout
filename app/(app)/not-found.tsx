import NotFound1 from "@/components/ui/8bit-not-found1";

export default function AppNotFound() {
  return (
    <div
      className="flex flex-1 items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <NotFound1
        title="Esta sala no existe"
        description="La página que buscás no existe en LeadScout. Volvé al dashboard."
        cta="Ir al Dashboard"
        href="/dashboard"
      />
    </div>
  );
}
