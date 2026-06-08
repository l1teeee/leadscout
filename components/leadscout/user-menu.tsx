"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Building2, LogOut, Settings, UserRound } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { logout } from "@/lib/api/auth";
import { clearToken, getToken, parseTokenUser } from "@/lib/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function getUserEmail() {
  const tokenUser = parseTokenUser(getToken() ?? "");
  return tokenUser?.email ?? "";
}

export function UserMenu({ initialEmail }: { initialEmail?: string }) {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const [userEmail] = useState(initialEmail ?? getUserEmail);
  const [isPending, startTransition] = useTransition();
  const initials = userEmail ? userEmail.split("@")[0].slice(0, 2).toUpperCase() : "LS";

  function handleSignOut() {
    const token = getToken();
    if (token) {
      logout(token).catch(() => {});
    }
    clearToken();
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="ml-1 flex h-8 items-center gap-2 rounded-none border-2 border-[var(--border)] bg-[var(--pixel-highlight)] px-2 shadow-[2px_2px_0_0_var(--pixel-shadow)] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          aria-label={tr.topbar.userMenu}
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
                  {userEmail || tr.topbar.userFallback}
                </p>
                <p className="truncate text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              <Building2 size={13} />
              <span className="truncate">ScoutIA</span>
            </div>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="mt-2 flex cursor-pointer items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-semibold outline-none hover:border-[var(--border)] hover:bg-[var(--surface-2)]"
              style={{ color: "var(--text)" }}
            >
              <Settings size={14} />
              {tr.topbar.settings}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="flex cursor-default items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-semibold outline-none" style={{ color: "var(--text-3)" }}>
            <UserRound size={14} />
            ScoutIA
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-2 h-0.5 bg-[var(--border)]" />

          <DropdownMenu.Item
            onSelect={handleSignOut}
            disabled={isPending}
            className="flex cursor-pointer items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-bold outline-none hover:border-[var(--border)] hover:bg-[var(--surface-2)]"
            style={{ color: "var(--c-hi)" }}
          >
            <LogOut size={14} />
            {tr.topbar.signOut}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
