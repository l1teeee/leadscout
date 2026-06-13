import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import LoginNotificationEmail from "@/emails/login-notification";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export async function POST(req: Request) {
  try {
    const { token } = await req.json() as { token?: string };
    if (!token) return NextResponse.json({ sent: false }, { status: 401 });

    const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";
    const meRes = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return NextResponse.json({ sent: false }, { status: 401 });

    const user = await meRes.json() as { email?: string; full_name?: string };
    if (!user.email) return NextResponse.json({ sent: false });

    const brevoKey = process.env.BREVO_API_KEY;
    if (!brevoKey) return NextResponse.json({ sent: false });

    const name = user.full_name || "Usuario";
    const html = await render(
      LoginNotificationEmail({ name, email: user.email })
    );

    const brevoRes = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL ?? "notifications@scoutia.dev",
          name: process.env.BREVO_SENDER_NAME ?? "Scoutia",
        },
        to: [{ email: user.email, ...(user.full_name ? { name: user.full_name } : {}) }],
        subject: "Nuevo inicio de sesion en Scoutia",
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      console.error("Brevo error", brevoRes.status, await brevoRes.text());
      return NextResponse.json({ sent: false });
    }

    return NextResponse.json({ sent: true, to: user.email });
  } catch (err) {
    console.error("Login email route error:", err);
    return NextResponse.json({ sent: false });
  }
}
