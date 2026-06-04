'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/lib/graphql';
import { useAuth, UserProfile } from '@/lib/auth-context';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface LoginMutationResult {
  login: { user: UserProfile };
}

interface LoginMutationVariables {
  input: { docNumber: string; password: string };
}

const DOCUMENT_TYPES = [
  { value: 'cc',       label: 'Cédula de Ciudadanía' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'business', label: 'Registro Empresarial' },
  { value: 'license',  label: 'Licencia Institucional' },
];

export default function AuthForm() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>('idle');
  const [docNumber, setDocNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [loginMutation] = useMutation<LoginMutationResult, LoginMutationVariables>(
    LOGIN_MUTATION,
    {
      onCompleted(data) {
        setUser(data.login.user);
        setFormState('success');
        setTimeout(() => router.push('/dashboard/new-application'), 800);
      },
      onError(error) {
        const msg =
          (error as { graphQLErrors?: Array<{ message: string }> }).graphQLErrors?.[0]?.message ??
          'No fue posible autenticar. Verifique sus credenciales.';
        setErrorMessage(msg);
        setFormState('error');
        setTimeout(() => setFormState('idle'), 3000);
      },
    },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState !== 'idle' && formState !== 'error') return;

    setErrorMessage('');
    setFormState('loading');
    loginMutation({ variables: { input: { docNumber, password } } });
  };

  const buttonBg =
    formState === 'success'
      ? 'bg-on-tertiary-container'
      : formState === 'error'
        ? 'bg-error'
        : 'bg-primary';

  return (
    <div
      id="auth"
      className="bg-white p-8 rounded-2xl soft-shadow border border-outline-variant lg:max-w-md ml-auto w-full"
    >
      <div className="mb-8">
        <h3 className="text-headline-md text-primary mb-2">Acceso Seguro</h3>
        <p className="text-body-sm text-on-surface-variant">
          Por favor identifíquese para continuar la evaluación técnica.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-label-md text-on-surface mb-2">
            Tipo de Documento
          </label>
          <select className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-body-md outline-none">
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2">
            Número de Documento
          </label>
          <input
            className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-body-md outline-none"
            placeholder="Ingrese el número de identificación"
            required
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2">
            Contraseña de Seguridad
          </label>
          <input
            className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-body-md outline-none"
            placeholder="••••••••"
            required
            type="password"
            maxLength={15}
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15))}
          />
        </div>

        {formState === 'error' && (
          <p className="text-body-sm text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMessage}
          </p>
        )}

        <button
          className={`w-full py-4 ${buttonBg} text-white text-label-md rounded-xl hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-70`}
          disabled={formState === 'loading' || formState === 'success'}
          type="submit"
        >
          {(formState === 'idle' || formState === 'error') && (
            <>
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Autenticar Sesión
            </>
          )}
          {formState === 'loading' && (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              Verificando...
            </>
          )}
          {formState === 'success' && (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Acceso Concedido
            </>
          )}
        </button>

        <div className="text-center">
          <a className="text-label-sm text-secondary hover:underline" href="#">
            ¿Olvidó sus datos de acceso?
          </a>
        </div>
      </form>
    </div>
  );
}
