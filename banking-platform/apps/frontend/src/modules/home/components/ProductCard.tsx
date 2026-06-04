interface StandardCardProps {
  variant: 'standard';
  colSpanClass: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  title: string;
  description: string;
}

interface FeaturedCardProps {
  variant: 'featured';
  colSpanClass: string;
  icon: string;
  title: string;
  description: string;
  decorativeIcon: string;
}

interface HorizontalCardProps {
  variant: 'horizontal';
  colSpanClass: string;
  icon: string;
  title: string;
  description: string;
}

type ProductCardProps = StandardCardProps | FeaturedCardProps | HorizontalCardProps;

export default function ProductCard(props: ProductCardProps) {
  if (props.variant === 'featured') {
    return (
      <div
        className={`${props.colSpanClass} bg-primary-container p-8 rounded-2xl border border-outline text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
      >
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white mb-6">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {props.icon}
            </span>
          </div>
          <h4 className="text-headline-lg mb-3">{props.title}</h4>
          <p className="text-body-md text-white/80 max-w-md">{props.description}</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <span
            className="material-symbols-outlined text-[200px]"
            style={{ fontVariationSettings: "'wght' 200" }}
          >
            {props.decorativeIcon}
          </span>
        </div>
      </div>
    );
  }

  if (props.variant === 'horizontal') {
    return (
      <div
        className={`${props.colSpanClass} bg-white p-8 rounded-2xl border border-outline-variant soft-shadow group hover:-translate-y-1 transition-all duration-300 flex items-center gap-8`}
      >
        <div className="flex-shrink-0 w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
          <span
            className="material-symbols-outlined text-[40px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {props.icon}
          </span>
        </div>
        <div>
          <h4 className="text-headline-md text-primary mb-2">{props.title}</h4>
          <p className="text-body-sm text-on-surface-variant">{props.description}</p>
        </div>
      </div>
    );
  }

  // variant === 'standard'
  return (
    <div
      className={`${props.colSpanClass} bg-white p-8 rounded-2xl border border-outline-variant soft-shadow group hover:-translate-y-1 transition-all duration-300`}
    >
      <div
        className={`w-12 h-12 ${props.iconBgClass} rounded-lg flex items-center justify-center ${props.iconColorClass} mb-6 group-hover:scale-110 transition-transform`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {props.icon}
        </span>
      </div>
      <h4 className="text-headline-md text-primary mb-3">{props.title}</h4>
      <p className="text-body-sm text-on-surface-variant">{props.description}</p>
    </div>
  );
}
