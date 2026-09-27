import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackText = 'Sagara Beach Stay',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${containerClassName}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neutral-600 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-amber-300 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="text-xs text-neutral-400 font-medium">{fallbackText}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
