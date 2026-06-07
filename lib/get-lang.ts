import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n-types";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const val = store.get("ls_lang")?.value;
  return val === "en" || val === "es" ? val : "es";
}
