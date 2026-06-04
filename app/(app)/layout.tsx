import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/leadscout/sidebar";
import { Topbar } from "@/components/leadscout/topbar";
import { LanguageProvider } from "@/contexts/language-context";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface AuthUser {
  onboarded: boolean;
  workspace_id?: string | null;
}

async function getCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
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
  if (!user) redirect("/login");
  if (!user.onboarded || !user.workspace_id) redirect("/onboarding");

  return (
    <LanguageProvider>
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-auto animate-fade-up">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  );
}
