// app/(dashboard)/layout.tsx - Layout für geschützten Dashboard-Bereich

// Dynamisches Rendering: Auth-Check im Layout
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Sidebar-Navigation für Dashboard in späterer Phase
  // Aktuell nutzen wir das Standard-Layout mit Header/Footer
  return <>{children}</>;
}
