import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-8.5 w-8.5',
} as const;

type BrandLogoSize = keyof typeof sizeClasses;

interface BrandLogoProps {
  id?: string;
  size?: BrandLogoSize;
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function BrandLogo({
  id,
  size = 'md',
  className,
  imgClassName,
  alt = 'CoworkingOS Logo',
}: BrandLogoProps) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden shrink-0',
        'ring-2 ring-brand-500/35 ring-offset-2 ring-offset-zinc-950',
        'border border-brand-500/25 bg-zinc-950 shadow-md',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src="/logo-icon.png"
        alt={alt}
        className={cn('h-full w-full object-contain p-0.5', imgClassName)}
      />
    </div>
  );
}
