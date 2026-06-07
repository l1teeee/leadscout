import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";
const isProd = process.env.NODE_ENV === "production";

// 'unsafe-eval' is required by Turbopack in dev; never ship it to production
const scriptSrc = `'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // HSTS only when actually on HTTPS (production)
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; script-src ${scriptSrc}; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://countriesnow.space https://nominatim.openstreetmap.org https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/backend/:path*", destination: `${apiUrl}/:path*` },
      { source: "/oportunidades", destination: "/opportunities" },
      { source: "/reportes", destination: "/reports" },
      { source: "/campanas", destination: "/campaigns" },
      { source: "/integraciones", destination: "/integrations" },
      { source: "/configuracion", destination: "/settings" },
    ];
  },
};

export default nextConfig;
