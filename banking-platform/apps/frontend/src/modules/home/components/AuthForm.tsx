'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success';

const DOCUMENT_TYPES = [
  { value: 'cc',       label: 'Cédula de Ciudadanía' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'business', label: 'Registro Empresarial' },
  { value: 'license',  label: 'Licencia Institucional' },
];

export default function AuthForm() {
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState !== 'idle') return;

    setFormState('loading');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 2000);
    }, 1500);
  };

  const buttonBg =
    formState === 'success' ? 'bg-on-tertiary-container' : 'bg-primary';

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
            type="text"
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2">
            Contraseña de Seguridad
          </label>
          <input
            className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-body-md outline-none"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <button
          className={`w-full py-4 ${buttonBg} text-white text-label-md rounded-xl hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-70`}
          disabled={formState !== 'idle'}
          type="submit"
        >
          {formState === 'idle' && (
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
