import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand header */}
      <header
        className="shrink-0 w-full flex items-center justify-center gap-3 px-6 py-3"
        style={{ background: "#17110D", borderBottom: "2px solid #000" }}
      >
        <Link href="/landing" className="flex items-center gap-3" aria-label="Ir a la landing">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center"
            style={{
              background: "#FFFFFF",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 0 #000",
            }}
          >
            <Zap size={13} color="#17110D" strokeWidth={2.5} />
          </div>
          <span
            className="retro pixel-text-sm leading-none"
            style={{ color: "#FFFFFF" }}
          >
            LeadScout
          </span>
        </Link>
      </header>

      {/* Page content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
