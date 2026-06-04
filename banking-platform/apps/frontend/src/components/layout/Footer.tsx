export default function Footer() {
  return (
    <section className="mt-auto py-12 px-margin-desktop border-t border-outline-variant bg-surface-bright">
      <div className="max-w-container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-primary">Entorno Técnico CoreBank</span>
          <span className="text-label-sm text-on-surface-variant">
            © 2026 CoreBank Institucional. Todos los derechos reservados.
          </span>
        </div>

        <div className="flex gap-8">
          <a
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
            href="#"
          >
            Política de Privacidad
          </a>
          <a
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
            href="#"
          >
            Auditoría de Seguridad
          </a>
          <a
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
            href="#"
          >
            Estado del Servicio
          </a>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-on-tertiary-container/10 text-on-tertiary-container rounded-full">
          <span className="w-2 h-2 bg-on-tertiary-container rounded-full animate-pulse" />
          <span className="text-label-sm">Sistema Operativo</span>
        </div>
      </div>
    </section>
  );
}
