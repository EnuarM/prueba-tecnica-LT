'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import ProductRadioCard from './ProductRadioCard';
import { useAuth } from '@/lib/auth-context';
import { CREATE_PRODUCT_REQUEST_MUTATION } from '@/lib/graphql/mutations/product-requests.mutations';

const DOCUMENT_TYPES = [
  { value: 'cc',       label: 'Cédula de Ciudadanía' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'business', label: 'Registro Empresarial' },
  { value: 'license',  label: 'Licencia Institucional' },
];

const PRODUCTS = [
  { value: 'PERSONAL_LOAN',   icon: 'person',                 label: 'Crédito Personal',    description: 'Préstamos de consumo' },
  { value: 'SAVINGS_ACCOUNT', icon: 'account_balance_wallet', label: 'Cuenta de Ahorros',   description: 'Depósitos de alto rendimiento' },
  { value: 'MORTGAGE',        icon: 'home',                   label: 'Crédito Hipotecario', description: 'Financiación de vivienda' },
  { value: 'CREDIT_CARD',     icon: 'credit_card',            label: 'Tarjeta de Crédito',  description: 'Líneas rotativas' },
  { value: 'INVESTMENT_FUND', icon: 'factory',                label: 'Fondo de Inversión',  description: 'Desarrollo empresarial' },
];

type FormState = 'idle' | 'loading' | 'error';

const NAME_REGEX = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g;

export default function NewApplicationForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>('idle');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [errorMsg, setErrorMsg] = useState('');

  const [createProductRequest] = useMutation(CREATE_PRODUCT_REQUEST_MUTATION);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) return;
    const clean = e.target.value.replace(NAME_REGEX, '');
    setFullName(clean.slice(0, 50));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const productType = data.get('product') as string;

    if (!productType) {
      setErrorMsg('Por favor selecciona un producto.');
      setFormState('error');
      return;
    }

    setFormState('loading');
    setErrorMsg('');

    try {
      const result = await createProductRequest({
        variables: {
          input: {
            clientDocNumber: user?.docNumber ?? (data.get('docNumber') as string),
            clientName: fullName,
            productType,
          },
        },
      });
      const id = (result.data as { createProductRequest: { id: string } })
        .createProductRequest.id;
      router.push(`/dashboard/confirmation?id=${id}&product=${productType}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear la solicitud.';
      setErrorMsg(message);
      setFormState('error');
    }
  };

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="bg-surface-container-low px-8 py-4 border-b border-outline-variant flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">assignment_add</span>
        <span className="text-label-md text-primary">DATOS DEL CLIENTE Y PRODUCTO</span>
      </div>

      <form className="p-8 space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Documento */}
          <div className="space-y-2">
            <label className="text-label-md text-primary block">Tipo de Documento</label>
            <div className="relative">
              <select
                defaultValue={user?.docType ?? ''}
                disabled={!!user}
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-secondary focus:border-secondary text-body-md outline-none transition-all disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>
          </div>

          {/* Número de Documento */}
          <div className="space-y-2">
            <label className="text-label-md text-primary block">Número de Documento</label>
            <input
              className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-body-md outline-none transition-all disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
              placeholder="ej. 1029384756"
              type="text"
              name="docNumber"
              maxLength={10}
              defaultValue={user?.docNumber ?? ''}
              disabled={!!user}
            />
          </div>

          {/* Nombre Completo */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-label-md text-primary block">Nombre Completo</label>
            <input
              className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-body-md outline-none transition-all disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
              placeholder="Tal como aparece en el documento de identidad"
              type="text"
              value={fullName}
              onChange={handleNameChange}
              maxLength={50}
              disabled={!!user}
            />
          </div>

          {/* Selección de Producto */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-label-md text-primary block">Selección de Producto</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map((p) => (
                <ProductRadioCard key={p.value} name="product" {...p} />
              ))}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {formState === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-error-container text-on-error-container">
            <span className="material-symbols-outlined">error</span>
            <span className="text-body-md">{errorMsg}</span>
          </div>
        )}

        {/* Form footer */}
        <div className="pt-6 border-t border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span className="text-label-sm">La solicitud será procesada en tiempo real.</span>
          </div>
          <button
            type="submit"
            disabled={formState === 'loading'}
            className="px-8 py-3 bg-secondary text-white text-label-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {formState === 'loading' ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                Procesando...
              </>
            ) : (
              <>
                Crear Solicitud
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
