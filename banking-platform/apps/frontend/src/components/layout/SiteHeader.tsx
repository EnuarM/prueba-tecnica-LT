interface SiteHeaderProps {
  className?: string;
}

export default function SiteHeader({ className = '' }: SiteHeaderProps) {
  return (
    <header
      className={`flex items-center h-16 px-margin-desktop bg-secondary border-b border-secondary shadow-sm ${className}`}
    >
      <span className="text-headline-md font-black text-white">
        Gestor de Solicitudes Bancarias
      </span>
    </header>
  );
}
