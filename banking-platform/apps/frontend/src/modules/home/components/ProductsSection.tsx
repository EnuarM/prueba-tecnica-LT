import ProductCard from './ProductCard';

export default function ProductsSection() {
  return (
    <section className="py-24 px-margin-desktop bg-background" id="products">
      <div className="max-w-container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg text-primary mb-4">
            Soluciones de Portafolio Principal
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Diseñadas para eficiencia de capital y crecimiento, nuestros instrumentos
            financieros brindan la estabilidad requerida para la gestión moderna de activos
            empresariales y personales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[240px]">
          <ProductCard
            variant="standard"
            colSpanClass="md:col-span-2 lg:col-span-4"
            icon="person_pin_circle"
            iconBgClass="bg-primary-fixed"
            iconColorClass="text-primary"
            title="Crédito Personal"
            description="Liquidez flexible diseñada para hitos individuales con esquemas de amortización competitivos."
          />
          <ProductCard
            variant="standard"
            colSpanClass="md:col-span-2 lg:col-span-4"
            icon="savings"
            iconBgClass="bg-secondary-fixed"
            iconColorClass="text-secondary"
            title="Cuenta de Ahorros"
            description="Preservación de capital de alto rendimiento con liquidez 24/7 y protocolos de seguridad institucionales."
          />
          <ProductCard
            variant="standard"
            colSpanClass="md:col-span-2 lg:col-span-4"
            icon="home_work"
            iconBgClass="bg-tertiary-fixed"
            iconColorClass="text-on-tertiary-fixed-variant"
            title="Crédito Hipotecario"
            description="Estructuras de financiamiento inmobiliario a largo plazo optimizadas para construcción de patrimonio estable."
          />
          <ProductCard
            variant="standard"
            colSpanClass="md:col-span-3 lg:col-span-4 lg:col-start-3"
            icon="credit_card"
            iconBgClass="bg-primary-fixed"
            iconColorClass="text-primary"
            title="Tarjeta de Crédito"
            description="Nuestras tarjetas premium ofrecen poder adquisitivo global con recompensas y cobertura de seguro integral."
          />
          <ProductCard
            variant="standard"
            colSpanClass="md:col-span-3 lg:col-span-4 lg:col-start-7"
            icon="monitoring"
            iconBgClass="bg-secondary-fixed"
            iconColorClass="text-secondary"
            title="Fondo de Inversión"
            description="Instrumentos de inversión colectiva para maximizar rendimientos con diversificación de cartera y gestión profesional."
          />
        </div>
      </div>
    </section>
  );
}
