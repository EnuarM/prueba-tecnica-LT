interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/50">
      <span className="material-symbols-outlined text-secondary mb-3 block">{icon}</span>
      <h4 className="text-label-md text-primary mb-2">{title}</h4>
      <p className="text-body-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
