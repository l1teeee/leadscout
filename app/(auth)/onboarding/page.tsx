import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/ui/8bit-onboarding-form";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (!token) redirect("/login");
  return <OnboardingForm />;
}
