import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/ui/8bit-forgot-password-form";

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (token) redirect("/dashboard");
  return <ForgotPasswordForm />;
}
