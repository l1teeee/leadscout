"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function LandingFooter() {
  return (
    <footer
      className="w-full px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: "#17110D", borderTop: "2px solid #000" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand — mismo estilo que el header */}
        <div className="flex items-center gap-3">
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
          <div className="flex flex-col gap-0.5">
            <span className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>
              LeadScout AI
            </span>
            <span className="retro pixel-text-xs leading-none" style={{ color: "#A1A1AA" }}>
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/login"
            className="text-xs font-bold underline-offset-2 hover:underline"
            style={{ ...bodyFont, color: "#A1A1AA" }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-bold underline-offset-2 hover:underline"
            style={{ ...bodyFont, color: "#A1A1AA" }}
          >
            Privacidad
          </Link>
          <Link
            href="/terms"
            className="text-xs font-bold underline-offset-2 hover:underline"
            style={{ ...bodyFont, color: "#A1A1AA" }}
          >
            Términos
          </Link>
        </nav>

        {/* Dev credit */}
        <p className="retro pixel-text-xs" style={{ color: "#71717A" }}>
          developed by{" "}
          <span style={{ color: "#A1A1AA", fontWeight: 700 }}>Numen Agency</span>
        </p>
      </div>
    </footer>
  );
}
