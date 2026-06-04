interface ProductRadioCardProps {
  value: string;
  name: string;
  icon: string;
  label: string;
  description: string;
}

export default function ProductRadioCard({
  value,
  name,
  icon,
  label,
  description,
}: ProductRadioCardProps) {
  return (
    <label className="relative flex flex-col p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:border-secondary has-[:checked]:ring-2 has-[:checked]:ring-secondary has-[:checked]:bg-secondary-fixed/30">
      <input
        className="absolute opacity-0 w-0 h-0"
        name={name}
        type="radio"
        value={value}
      />
      <span className="material-symbols-outlined text-secondary mb-2">{icon}</span>
      <span className="text-label-md text-primary">{label}</span>
      <span className="text-label-sm text-on-surface-variant">{description}</span>
    </label>
  );
}
