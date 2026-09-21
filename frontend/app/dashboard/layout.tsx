import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas text-ink">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
