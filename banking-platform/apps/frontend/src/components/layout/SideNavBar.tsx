'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Nueva Solicitud', icon: 'add_circle', href: '/dashboard/new-application' },
  { label: 'Historial',       icon: 'history',    href: '/dashboard/history' },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-surface border-r border-outline-variant flex flex-col py-8 px-4 z-50">
      {/* Brand */}
      <div className="mb-10 px-2">
        <h1 className="text-headline-md font-bold text-primary">CoreBank Admin</h1>
        <p className="text-body-md text-on-surface-variant">Plataforma de Productos</p>
      </div>

      {/* Primary nav */}
      <nav className="flex-grow space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center px-3 py-3 text-body-md text-secondary font-bold border-r-4 border-secondary bg-surface-container-low rounded-lg'
                  : 'flex items-center px-3 py-3 text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg'
              }
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

