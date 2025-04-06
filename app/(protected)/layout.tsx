import { Sidebar } from "@/components/layout/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 border-r" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
