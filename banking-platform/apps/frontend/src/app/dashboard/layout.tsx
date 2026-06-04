import SideNavBar from '@/components/layout/SideNavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNavBar />
      <div className="ml-[280px] min-h-screen">
        {children}
      </div>
    </>
  );
}
