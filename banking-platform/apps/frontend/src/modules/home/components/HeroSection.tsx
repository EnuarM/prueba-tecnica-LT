import AuthForm from './AuthForm';
import ScrollLink from '@/components/ui/ScrollLink';

export default function HeroSection() {
  return (
    <section className="relative py-20 px-margin-desktop overflow-hidden bg-surface-container-lowest">
      <div className="max-w-container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <h2 className="text-display-lg text-primary leading-tight mb-6">
            Gestión ágil de <br />
            <span className="text-secondary">Solicitudes Bancarias.</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-xl">
            Centralice y tramite solicitudes de productos financieros en un solo lugar.
            Créditos personales, hipotecarios y empresariales con seguimiento en tiempo real,
            trazabilidad completa y decisiones respaldadas por datos.
          </p>
          <div className="flex gap-4 flex-wrap">
            <ScrollLink
              href="#products"
              duration={1400}
              className="px-8 py-4 bg-secondary text-white text-label-md rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              Explorar Productos
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </ScrollLink>
          </div>
        </div>

        <AuthForm />
      </div>

      {/* Elemento de fondo abstracto */}
      <div className="absolute -right-20 top-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg
          height="100%"
          viewBox="0 0 400 400"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-primary"
            cx="200"
            cy="200"
            fill="none"
            r="180"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            className="text-secondary"
            cx="200"
            cy="200"
            fill="none"
            r="140"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <circle
            className="text-primary"
            cx="200"
            cy="200"
            fill="none"
            r="100"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </section>
  );
}
