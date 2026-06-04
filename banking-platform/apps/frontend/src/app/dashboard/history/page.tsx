'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import {
  PRODUCT_REQUESTS_QUERY,
  UPDATE_PRODUCT_REQUEST_STATUS_MUTATION,
} from '@/lib/graphql/mutations/product-requests.mutations';

const PAGE_SIZE = 5;

const PRODUCT_LABELS: Record<string, string> = {
  PERSONAL_LOAN:   'Crédito Personal',
  SAVINGS_ACCOUNT: 'Cuenta de Ahorros',
  MORTGAGE:        'Crédito Hipotecario',
  CREDIT_CARD:     'Tarjeta de Crédito',
  INVESTMENT_FUND: 'Fondo de Inversión',
};

const STATUS_LABELS: Record<string, string> = {
  CREATED:   'Creada',
  IN_REVIEW: 'En Revisión',
  APPROVED:  'Aprobada',
  REJECTED:  'Rechazada',
  COMPLETED: 'Completada',
  ABANDONED: 'Abandonada',
};

type StatusStyle = { bg: string; text: string };
const STATUS_STYLES: Record<string, StatusStyle> = {
  CREATED:   { bg: 'bg-secondary-fixed',     text: 'text-on-secondary-fixed' },
  IN_REVIEW: { bg: 'bg-secondary/10',        text: 'text-secondary' },
  APPROVED:  { bg: 'bg-tertiary-fixed-dim/20', text: 'text-on-tertiary-container' },
  REJECTED:  { bg: 'bg-error-container',     text: 'text-on-error-container' },
  COMPLETED: { bg: 'bg-tertiary-fixed/30',   text: 'text-on-tertiary-container' },
  ABANDONED: { bg: 'bg-surface-container',   text: 'text-on-surface-variant' },
};

interface ProductRequest {
  id: string;
  productType: string;
  status: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function HistorialPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [abandoningId, setAbandoningId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{ productRequests: ProductRequest[] }>(PRODUCT_REQUESTS_QUERY, {
    variables: { clientDocNumber: user?.docNumber ?? '' },
    skip: !user?.docNumber,
  });

  const [updateStatus] = useMutation(UPDATE_PRODUCT_REQUEST_STATUS_MUTATION);

  const requests = useMemo<ProductRequest[]>(
    () => data?.productRequests ?? [],
    [data]
  );

  // Summary counts
  const counts = useMemo(() => ({
    total:    requests.length,
    inReview: requests.filter((r) => r.status === 'IN_REVIEW').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  }), [requests]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const paginated = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAbandon = async (id: string) => {
    if (!confirm('¿Está seguro de que desea abandonar esta solicitud? Esta acción no se puede deshacer.')) return;
    setAbandoningId(id);
    try {
      await updateStatus({ variables: { id, input: { status: 'ABANDONED' } } });
      refetch();
    } finally {
      setAbandoningId(null);
    }
  };

  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto py-8">

        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-headline-lg font-semibold text-primary">Historial de Solicitudes</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Gestione y supervise el estado de sus solicitudes financieras vigentes.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg">assignment</span>
            </div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Solicitudes</p>
            <p className="text-headline-md font-semibold text-primary">{loading ? '—' : counts.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg">pending_actions</span>
            </div>
            <p className="text-label-md text-on-surface-variant mb-1">En Revisión</p>
            <p className="text-headline-md font-semibold text-primary">{loading ? '—' : counts.inReview}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-fixed p-2 rounded-lg">check_circle</span>
            </div>
            <p className="text-label-md text-on-surface-variant mb-1">Aprobadas</p>
            <p className="text-headline-md font-semibold text-primary">{loading ? '—' : counts.approved}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-error bg-error-container p-2 rounded-lg">cancel</span>
            </div>
            <p className="text-label-md text-on-surface-variant mb-1">Rechazadas</p>
            <p className="text-headline-md font-semibold text-primary">{loading ? '—' : counts.rejected}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">

          {/* Loading / error states */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">refresh</span>
              <span className="text-body-md">Cargando solicitudes...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-6 text-on-error-container bg-error-container">
              <span className="material-symbols-outlined">error</span>
              <span className="text-body-md">{error.message}</span>
            </div>
          )}
          {!loading && !error && (
            <table className="w-full text-left table-fixed border-collapse">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[17%]" />
                <col className="w-[25%]" />
                <col className="w-[22%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-4 py-4 text-label-md text-on-surface-variant">ID DE SOLICITUD</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant">FECHA</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant">PRODUCTO</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant">ESTADO</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-body-md text-on-surface-variant">
                      No hay solicitudes registradas.
                    </td>
                  </tr>
                ) : (
                  paginated.map((req) => {
                    const style = STATUS_STYLES[req.status] ?? STATUS_STYLES.CREATED;
                    const canAbandon = req.status === 'IN_REVIEW' || req.status === 'CREATED';
                    const isAbandoning = abandoningId === req.id;
                    return (
                      <tr key={req.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-4 py-5 font-mono text-body-sm text-primary break-all">{req.id}</td>
                        <td className="px-4 py-5 text-body-sm text-on-surface whitespace-nowrap">{formatDate(req.createdAt)}</td>
                        <td className="px-4 py-5 text-body-sm text-on-surface">
                          {PRODUCT_LABELS[req.productType] ?? req.productType}
                        </td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex items-center justify-center w-28 py-1 rounded-full text-label-sm ${style.bg} ${style.text}`}>
                            {STATUS_LABELS[req.status] ?? req.status}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-right">
                          {canAbandon ? (
                            <button
                              disabled={isAbandoning}
                              onClick={() => handleAbandon(req.id)}
                              className="px-4 py-1.5 rounded-lg border border-error text-error text-label-md hover:bg-error/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                            >
                              {isAbandoning ? 'Procesando...' : 'Abandonar'}
                            </button>
                          ) : (
                            <span className="text-on-surface-variant/40 text-label-md">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && !error && requests.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-outline-variant flex justify-between items-center">
              <p className="text-body-sm text-on-surface-variant">
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, requests.length)}–{Math.min(page * PAGE_SIZE, requests.length)} de {requests.length} resultado{requests.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-1 rounded-lg text-label-md transition-colors ${
                      n === page
                        ? 'bg-secondary text-white'
                        : 'border border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

