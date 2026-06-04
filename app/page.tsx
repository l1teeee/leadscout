import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
