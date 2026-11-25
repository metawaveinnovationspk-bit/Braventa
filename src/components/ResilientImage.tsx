import { useState } from 'react';
import { Package } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackSubtitle,
  loading = 'eager',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F4F7F6] via-white to-[#E6EFEC] p-8 text-center ${className}`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#075E50]/20 bg-white text-[#075E50]">
          <Package className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="font-display text-sm font-semibold tracking-tight text-[#123C34]">
          {fallbackTitle}
        </p>
        {fallbackSubtitle ? (
          <p className="mt-1 text-xs text-[#123C34]/70">{fallbackSubtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
