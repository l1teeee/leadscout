"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set("ls_token", "", { maxAge: 0, path: "/", sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  redirect("/login");
}
