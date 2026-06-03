"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import VerifyOtpForm from "@/components/ui/8bit-verify-otp-form";

export default function VerifyOtpPage() {
  const router = useRouter();
  const email = useMemo(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("otp_pending_email");
  }, []);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  if (!email) return null;

  return <VerifyOtpForm email={email} />;
}
