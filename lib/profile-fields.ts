// Shared workspace/profile field helpers used by onboarding and settings.

export type CountryEntry = { dialCode: string; apiName: string };

export const COUNTRY_DATA: Record<string, CountryEntry> = {
  "El Salvador":  { dialCode: "+503", apiName: "El Salvador" },
  "Guatemala":    { dialCode: "+502", apiName: "Guatemala" },
  "Honduras":     { dialCode: "+504", apiName: "Honduras" },
  "Costa Rica":   { dialCode: "+506", apiName: "Costa Rica" },
  "Panama":       { dialCode: "+507", apiName: "Panama" },
  "Mexico":       { dialCode: "+52",  apiName: "Mexico" },
  "Argentina":    { dialCode: "+54",  apiName: "Argentina" },
  "Colombia":     { dialCode: "+57",  apiName: "Colombia" },
  "Peru":         { dialCode: "+51",  apiName: "Peru" },
  "Chile":        { dialCode: "+56",  apiName: "Chile" },
  "Otro":         { dialCode: "",     apiName: "" },
};

// Strip HTML angle brackets and null bytes from free text
export function sanitizeText(val: string, maxLen = 100): string {
  return val.replace(/[<>\x00]/g, "").slice(0, maxLen);
}

// Phone: digits, spaces, dashes, parens, dots only
export function sanitizePhone(val: string): string {
  return val.replace(/[^\d\s\-().]/g, "").slice(0, 20);
}

// URLs: strip injection chars while preserving slashes and query strings
export function sanitizeUrl(val: string): string {
  return val.replace(/[<>"'`\x00]/g, "").slice(0, 200);
}

// Split a stored phone like "+503 1234-5678" into dial code + local number,
// matching it against a known country dial code when possible.
export function splitPhone(stored: string, dialCode: string): string {
  const trimmed = (stored ?? "").trim();
  if (dialCode && trimmed.startsWith(dialCode)) {
    return trimmed.slice(dialCode.length).trim();
  }
  return trimmed;
}
