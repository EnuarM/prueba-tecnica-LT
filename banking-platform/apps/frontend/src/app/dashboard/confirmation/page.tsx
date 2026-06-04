'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { InfoCard } from '@/modules/applications';

const PRODUCT_LABELS: Record<string, string> = {
  PERSONAL_LOAN:   'Crédito Personal',
  SAVINGS_ACCOUNT: 'Cuenta de Ahorros',
  MORTGAGE:        'Crédito Hipotecario',
  CREDIT_CARD:     'Tarjeta de Crédito',
  INVESTMENT_FUND: 'Fondo de Inversión',
};

const INFO_CARDS = [
  {
    icon: 'security',
    title: 'Procesamiento Seguro',
    description: 'Todas las solicitudes se cifran con estándares AES-256 antes de la revisión bancaria.',
  },
  {
    icon: 'verified_user',
    title: 'Verificación AML',
    description: 'Controles automáticos contra el Lavado de Activos con listas globales de vigilancia.',
  },
  {
    icon: 'timer',
    title: 'Aprobación Rápida',
    description: 'El tiempo de respuesta típico para nuevas solicitudes es inferior a 15 minutos hábiles.',
  },
];

function ConfirmationContent() {
  const params = useSearchParams();
  const id = params.get('id') ?? '—';
  const productKey = params.get('product') ?? '';
  const productLabel = PRODUCT_LABELS[productKey] ?? productKey;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-lg font-semibold text-primary">Confirmación de Solicitud</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Tu solicitud ha sido recibida y está siendo procesada.
          </p>
        </div>
        <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-label-sm uppercase tracking-wider">
          ID: {id}
        </span>
      </div>

      {/* Confirmation card */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden p-8 text-center">
        <div className="flex flex-col items-center py-8">
          {/* Success icon */}
          <div className="w-16 h-16 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>

          <h3 className="text-headline-md font-semibold text-primary mb-3">
            ¡Solicitud Enviada con Éxito!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
            La solicitud ha sido procesada y se encuentra en revisión. Puedes hacer seguimiento
            desde el historial de solicitudes.
          </p>

          {/* Summary card */}
          <div className="w-full max-w-sm bg-surface-container-low rounded-lg p-6 mb-8 text-left border border-outline-variant">
            <div className="flex justify-between mb-3">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">ID de Solicitud</span>
              <span className="text-label-md text-primary font-bold">#{id}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</span>
              <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded text-label-sm">
                En Proceso
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Producto</span>
              <span className="text-label-md text-primary">{productLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/dashboard/history"
              className="px-8 py-3 border border-secondary text-secondary text-label-md rounded-lg hover:bg-surface-container transition-colors text-center"
            >
              Ver en Historial
            </Link>
            <Link
              href="/dashboard/new-application"
              className="px-8 py-3 text-secondary text-label-md rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nueva Solicitud
            </Link>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {INFO_CARDS.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="p-10">
      <Suspense fallback={<div className="text-body-md text-on-surface-variant">Cargando...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
