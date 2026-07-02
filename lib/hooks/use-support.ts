"use client";

import { useCallback, useState } from "react";
import { sendSupportRequest } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/errors";

export type SupportStatus = "idle" | "sending" | "ok" | "error";

export interface UseSupportReturn {
  subject: string;
  setSubject: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  status: SupportStatus;
  error: string | null;
  submit: () => Promise<boolean>;
}

export function useSupport(): UseSupportReturn {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SupportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<boolean> => {
    setStatus("sending");
    setError(null);
    try {
      await sendSupportRequest({ subject, message });
      setStatus("ok");
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
      return true;
    } catch (err) {
      setError(parseApiError(err));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return false;
    }
  }, [subject, message]);

  return { subject, setSubject, message, setMessage, status, error, submit };
}
