import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from './AuthForm';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ setUser: jest.fn(), user: null }),
}));

jest.mock('@/lib/graphql', () => ({
  LOGIN_MUTATION: 'LOGIN_MUTATION',
}));

describe('AuthForm', () => {
  beforeEach(() => {
    render(<AuthForm />);
  });

  it('renders all form fields and submit button', () => {
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese el número de identificación')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Autenticar Sesión/i })).toBeInTheDocument();
  });

  it('only accepts numeric characters in doc number', () => {
    const input = screen.getByPlaceholderText('Ingrese el número de identificación');
    fireEvent.change(input, { target: { value: 'abc123def' } });
    expect(input).toHaveValue('123');
  });

  it('limits doc number to 10 digits', () => {
    const input = screen.getByPlaceholderText('Ingrese el número de identificación');
    fireEvent.change(input, { target: { value: '12345678901234' } });
    expect(input).toHaveValue('1234567890');
  });

  it('strips non-alphanumeric characters from password', () => {
    const input = screen.getByPlaceholderText('••••••••');
    fireEvent.change(input, { target: { value: 'abc!@#123' } });
    expect(input).toHaveValue('abc123');
  });

  it('limits password to 15 alphanumeric characters', () => {
    const input = screen.getByPlaceholderText('••••••••');
    fireEvent.change(input, { target: { value: 'abcdefghijklmnopqrstuvwxyz' } });
    expect(input).toHaveValue('abcdefghijklmno');
  });

  it('doc number input has required attribute', () => {
    const input = screen.getByPlaceholderText('Ingrese el número de identificación');
    expect(input).toBeRequired();
  });

  it('password input has required attribute', () => {
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toBeRequired();
  });
});
