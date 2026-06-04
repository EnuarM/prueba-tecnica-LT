import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth, UserProfile } from './auth-context';

function TestConsumer() {
  const { user, setUser, isAuthenticated } = useAuth();
  const mockUser: UserProfile = { fullName: 'Ana López', docType: 'cc', docNumber: '1234567890' };
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="name">{user?.fullName ?? 'none'}</span>
      <button onClick={() => setUser(mockUser)}>login</button>
      <button onClick={() => setUser(null)}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('starts unauthenticated with no user', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(screen.getByTestId('name')).toHaveTextContent('none');
  });

  it('sets user and marks isAuthenticated on login', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click();
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('true');
    expect(screen.getByTestId('name')).toHaveTextContent('Ana López');
  });

  it('clears user on logout', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click();
    });
    await act(async () => {
      screen.getByRole('button', { name: 'logout' }).click();
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(screen.getByTestId('name')).toHaveTextContent('none');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
