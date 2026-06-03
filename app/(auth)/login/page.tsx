import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/ui/8bit-login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (token) redirect("/dashboard");
  return <LoginForm />;
}
