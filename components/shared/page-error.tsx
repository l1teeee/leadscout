"use client";

interface PageErrorProps {
  module: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({ module, message, onRetry }: PageErrorProps) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8">
      <div className="pixel-card w-full max-w-md p-6 text-center">
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
          {module}
        </p>
        <h2 className="retro pixel-text-sm mt-3 uppercase" style={{ color: "var(--text)" }}>
          Error al cargar
        </h2>
        {message && (
          <p
            className="mt-3 text-sm font-semibold"
            style={{ fontFamily: "var(--font-body), system-ui, sans-serif", color: "var(--text-2)" }}
          >
            {message}
          </p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="retro pixel-text-xs mt-5 inline-flex h-9 items-center justify-center border-2 border-[var(--border)] bg-[var(--border)] px-4 font-bold uppercase text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
