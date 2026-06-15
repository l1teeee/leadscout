export const SITE_NAME = "ScoutIA";
export const SITE_URL = "https://www.scoutia.dev";

export function absoluteUrl(path = "") {
  return new URL(path, SITE_URL).toString().replace(/\/$/, "");
}
