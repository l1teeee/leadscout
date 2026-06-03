// Auth is now handled by the FastAPI backend via lib/api/auth.ts
// This file is kept for backward compatibility only
export async function createClient() {
  return {} as never;
}
