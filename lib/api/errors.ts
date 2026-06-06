/**
 * Centralised API error handling.
 * All apiFetch errors are AppError instances — call parseApiError anywhere
 * to get a user-friendly string without re-checking error types.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Extracts a display-ready error message from any thrown value.
 * Falls back to a generic Spanish string so the UI is always presentable.
 */
export function parseApiError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrió un error inesperado.";
}
