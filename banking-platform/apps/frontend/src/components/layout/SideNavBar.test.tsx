import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SideNavBar from './SideNavBar';

const mockPush = jest.fn();
const mockSetUser = jest.fn();
const mockClearStore = jest.fn().mockResolvedValue(undefined);

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/new-application',
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ clearStore: mockClearStore }),
}));

jest.mock('next/link', () => {
  const Link = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  );
  Link.displayName = 'Link';
  return Link;
});

describe('SideNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<SideNavBar />);
  });

  it('renders nav links', () => {
    expect(screen.getByText('Nueva Solicitud')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('renders brand name', () => {
    expect(screen.getByText('CoreBank Admin')).toBeInTheDocument();
  });

  it('marks active link for current pathname', () => {
    const activeLink = screen.getByText('Nueva Solicitud').closest('a');
    expect(activeLink).toHaveClass('font-bold');
  });

  it('renders logout button', () => {
    expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();
  });

  it('clears Apollo cache, calls setUser(null) and redirects to / on logout', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));
    await waitFor(() => {
      expect(mockClearStore).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
