import { NewApplicationForm, InfoCard } from '@/modules/applications';

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

export default function NewApplicationPage() {
  return (
    <div className="p-10">
      <div className="max-w-4xl mx-auto py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-headline-lg font-semibold text-primary">Nueva Solicitud</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              Inicia una nueva solicitud de producto bancario para un cliente verificado.
            </p>
          </div>
          <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-label-sm uppercase tracking-wider">
            ID: AP-8842-X
          </span>
        </div>

        {/* Application form */}
        <NewApplicationForm />

        {/* Info cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {INFO_CARDS.map((card) => (
            <InfoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
