"use client";
import { usePathname, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, Building2, LogOut, Search, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/api/auth";
import { clearToken, getToken, parseTokenUser } from "@/lib/auth";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const VIEW_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/explorer": "Explorer",
  "/oportunidades": "Oportunidades",
  "/leads": "Leads",
  "/campanas": "Campañas",
  "/reportes": "Reportes",
  "/integraciones": "Integraciones",
  "/configuracion": "Configuración",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = VIEW_TITLES[pathname] ?? "LeadScout";
  const tokenUser = parseTokenUser(getToken() ?? "");
  const userEmail = tokenUser?.email ?? "";
  const initials = userEmail ? userEmail.split("@")[0].slice(0, 2).toUpperCase() : "LS";

  async function handleSignOut() {
    const token = getToken();
    if (token) await logout(token);
    clearToken();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header
      className="h-14.5 shrink-0 flex items-center justify-between px-8"
      style={{ background: "var(--surface)", borderBottom: "2px solid var(--border)" }}
    >
      <div>
        <h1 className="text-sm font-semibold tracking-normal" style={{ ...bodyFont, color: "var(--text)" }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
          style={{ color: "var(--text)", background: "var(--surface-2)", border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
        >
          <Search size={15} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
          style={{ color: "var(--text)", background: "var(--surface-2)", border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
        >
          <Bell size={15} />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="ml-1 flex h-8 items-center gap-2 rounded-none border-2 border-[var(--border)] bg-[var(--pixel-highlight)] px-2 shadow-[2px_2px_0_0_var(--pixel-shadow)] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Menu de usuario"
            >
              <span className="text-xs font-extrabold tracking-normal text-[var(--text)]" style={bodyFont}>
                {initials}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-72 border-2 border-[var(--border)] bg-[var(--surface)] p-2 shadow-[3px_3px_0_var(--pixel-shadow)] animate-scale-in"
            >
              <div className="border-2 border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] text-xs font-extrabold"
                    style={bodyFont}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold" style={{ color: "var(--text)" }}>
                      {userEmail || "Usuario"}
                    </p>
                    <p className="truncate text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                  <Building2 size={13} />
                  <span className="truncate">LeadScout AI</span>
                </div>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/configuracion"
                  className="mt-2 flex cursor-pointer items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-semibold outline-none hover:border-[var(--border)] hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text)" }}
                >
                  <Settings size={14} />
                  Configuracion
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item className="flex cursor-default items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-semibold outline-none" style={{ color: "var(--text-3)" }}>
                <UserRound size={14} />
                LeadScout AI
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-2 h-0.5 bg-[var(--border)]" />

              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="flex cursor-pointer items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-bold outline-none hover:border-[var(--border)] hover:bg-[var(--surface-2)]"
                style={{ color: "var(--c-hi)" }}
              >
                <LogOut size={14} />
                Cerrar sesion
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
