/**
 * Typed environment variable access.
 *
 * Required at runtime:
 *   API_URL  — Backend base URL (server-side only). Default: http://127.0.0.1:8000
 *
 * No NEXT_PUBLIC_ vars needed: the backend proxy (/backend/*) handles
 * client→server communication, so the raw API_URL is never exposed to browsers.
 */

export const env = {
  /** FastAPI backend base URL. Used server-side only; client uses /backend proxy. */
  apiUrl: process.env.API_URL ?? "http://127.0.0.1:8000",
} as const;
