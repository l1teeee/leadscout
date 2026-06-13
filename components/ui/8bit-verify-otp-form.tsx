"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, ArrowRight, RotateCcw } from "lucide-react";
import {
  forgotPassword,
  verifyRegistrationOtp,
  verifyResetOtp,
} from "@/lib/api/auth";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const DIGIT_COUNT = 6;
const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export default function VerifyOtpForm({ email }: { email: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const tr = translations[lang].auth.verifyOtp;
  const mode = searchParams.get("mode") === "reset" ? "reset" : "register";
  const [digits, setDigits] = useState<string[]>(() => Array(DIGIT_COUNT).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const setDigitsFrom = (startIndex: number, value: string) => {
    const pastedDigits = value.replace(/\D/g, "").slice(0, DIGIT_COUNT - startIndex);
    if (!pastedDigits) return;

    setDigits((current) => {
      const next = [...current];
      pastedDigits.split("").forEach((digit, offset) => {
        next[startIndex + offset] = digit;
      });
      return next;
    });

    const nextIndex = Math.min(startIndex + pastedDigits.length, DIGIT_COUNT - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, "");
    setErrorMsg(null);

    if (!numeric) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    if (numeric.length > 1) {
      setDigitsFrom(index, numeric);
      return;
    }

    setDigits((current) => {
      const next = [...current];
      next[index] = numeric;
      return next;
    });

    if (index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setDigitsFrom(index, event.clipboardData.getData("text"));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== DIGIT_COUNT) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (mode === "reset") {
        const result = await verifyResetOtp(email, code);
        sessionStorage.removeItem("otp_pending_email");
        router.replace(`/reset-password?token=${encodeURIComponent(result.message)}`);
        return;
      }

      const result = await verifyRegistrationOtp(email, code);
      setToken(result.access_token);
      sessionStorage.removeItem("otp_pending_email");
      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : tr.error);
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMsg(null);

    try {
      await forgotPassword(email);
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : translations[lang].auth.forgot.error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="animate-scale-in w-full">
      <div className="pixel-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </div>
          <div>
            <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>ScoutIA</p>
            <p className="retro pixel-text-xs mt-1.5 uppercase" style={{ color: "#A1A1AA" }}>{tr.header}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>{tr.title}</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>
              {tr.descriptionPrefix}{" "}
              <span className="font-semibold" style={{ color: "var(--text-2)" }}>{email}</span>
              {tr.descriptionSuffix}
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2" aria-label={tr.title}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputRefs.current[index] = node;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                aria-label={`OTP ${index + 1}`}
                className="h-11 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] text-center text-lg text-[var(--text)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
                style={body}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={code.length !== DIGIT_COUNT || isSubmitting}
            className="retro pixel-text-sm motion-retro-control inline-flex h-10 w-full items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}
          >
            {tr.submit}
            {!isSubmitting && <ArrowRight size={13} />}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="retro pixel-text-xs inline-flex h-9 w-full items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 font-bold text-[var(--text-2)] active:translate-x-px active:translate-y-px disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            {cooldown > 0 ? translations[lang].auth.forgot.resendIn(cooldown) : translations[lang].auth.forgot.resend}
          </button>

          <p className="text-center text-xs" style={{ ...body, color: "var(--text-3)" }}>
            <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--text-2)" }}>
              {translations[lang].common.backToLogin}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
