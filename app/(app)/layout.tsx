import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/leadscout/page-transition";
import { NavProgress } from "@/components/leadscout/nav-progress";
import { Sidebar } from "@/components/leadscout/sidebar";
import { Topbar } from "@/components/leadscout/topbar";
import { env } from "@/lib/env";
import { AuthSessionGuard } from "@/components/shared/auth-session-guard";
import { MobileNavProvider } from "@/contexts/mobile-nav-context";
import { NavigationProvider } from "@/contexts/navigation-context";

interface AuthUser {
  onboarded: boolean;
  workspace_id?: string | null;
  email?: string;
  full_name?: string;
  // Backend must populate this field — absence is treated as a compromised session.
  user_signature?: string;
}

async function getCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${env.apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (!token) redirect("/login");

  const user = await getCurrentUser(token);
  if (!user) redirect("/api/auth/force-logout");
  if (!user.onboarded || !user.workspace_id) redirect("/onboarding");
  if (!user.user_signature) redirect("/api/auth/force-logout");

  return (
    <MobileNavProvider>
      <NavigationProvider>
        <NavProgress />
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar initialEmail={user.email} />
            <main className="flex-1 overflow-auto">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          <AuthSessionGuard signature={user.user_signature} />
        </div>
      </NavigationProvider>
    </MobileNavProvider>
  );
}
