export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
