"use client";
import { useEffect } from "react";
import { setUserSignature } from "@/lib/auth";

interface Props {
  signature: string;
}

// Bridges the server-verified user_signature into client sessionStorage
// so Explorer (and any future client code) can read it without an extra API call.
export function AuthSessionGuard({ signature }: Props) {
  useEffect(() => {
    setUserSignature(signature);
  }, [signature]);
  return null;
}
