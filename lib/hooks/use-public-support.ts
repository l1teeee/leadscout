"use client";

import { useCallback, useState } from "react";
import { sendPublicSupportRequest } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/errors";

export type PublicSupportStatus = "idle" | "sending" | "ok" | "error";

export interface UsePublicSupportReturn {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  status: PublicSupportStatus;
  error: string | null;
  submit: () => Promise<boolean>;
}

export function usePublicSupport(): UsePublicSupportReturn {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<PublicSupportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<boolean> => {
    setStatus("sending");
    setError(null);
    try {
      await sendPublicSupportRequest({ name: name || undefined, email, subject, message });
      setStatus("ok");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 4000);
      return true;
    } catch (err) {
      setError(parseApiError(err));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
      return false;
    }
  }, [name, email, subject, message]);

  return { name, setName, email, setEmail, subject, setSubject, message, setMessage, status, error, submit };
}
