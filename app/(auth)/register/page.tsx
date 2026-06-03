import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/ui/8bit-register-form";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ls_token")?.value;
  if (token) redirect("/dashboard");
  return <RegisterForm />;
}
