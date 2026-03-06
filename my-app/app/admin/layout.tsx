import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <Sidebar role="admin" />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
