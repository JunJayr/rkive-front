import cn from 'classnames';
import { ImSpinner3 } from 'react-icons/im';

interface Props {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  className?: string;
  label?: string;
}

export default function Spinner({ sm, md, lg, className, label = 'Loading' }: Props) {
  const iconClassName = cn(
    'animate-spin',
    className?.match(/\btext-/) ? null : 'text-[#103F78]',
    {
      'h-4 w-4': sm,
      'h-6 w-6': md || (!sm && !lg),
      'h-8 w-8': lg,
    },
    className,
  );

  return (
    <div role="status" aria-live="polite" className="inline-flex items-center justify-center">
      <ImSpinner3 className={iconClassName} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
