export function PixelPageLoader() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <div
        style={{
          width: 36,
          height: 36,
          background: "var(--text)",
          border: "3px solid var(--border)",
          boxShadow: "4px 4px 0 0 var(--pixel-shadow)",
          animation: "pixelSpin 1s steps(8, end) infinite",
        }}
      />
    </div>
  );
}
