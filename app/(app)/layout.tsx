import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/leadscout/sidebar";
import { Topbar } from "@/components/leadscout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto animate-fade-up">{children}</main>
      </div>
    </div>
  );
}
