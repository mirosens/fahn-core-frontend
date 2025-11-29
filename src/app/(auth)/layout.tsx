// app/(auth)/layout.tsx - Reduziertes Layout für Login/Passwort-Reset

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reduziertes Layout ohne Header/Footer für Auth-Bereich
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      {children}
    </div>
  );
}
