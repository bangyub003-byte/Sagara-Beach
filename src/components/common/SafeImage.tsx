import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  fallbackSrc?: string;
  containerClassName?: string;
}

/**
 * Normalizes image paths to permanent public URLs accessible across Android & iPhone browsers
 */
export const getPublicImageUrl = (rawUrl?: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '/images/sundak_fullhouse_1790552054893.jpg';
  }
  // Full HTTP/HTTPS, Data URI, or Blob URI
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }
  // Convert relative /src/assets/images/... to public permanent /images/...
  if (rawUrl.startsWith('/src/assets/images/')) {
    return rawUrl.replace('/src/assets/images/', '/images/');
  }
  if (rawUrl.startsWith('/assets/images/')) {
    return rawUrl.replace('/assets/images/', '/images/');
  }
  return rawUrl;
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackText = 'Griya Barokah Homestay',
  fallbackSrc,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...props
}) => {
  const normalizedSrc = getPublicImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(normalizedSrc);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [retryAttempted, setRetryAttempted] = useState<boolean>(false);

  // Synchronize state when src prop changes
  useEffect(() => {
    const next = getPublicImageUrl(src);
    setCurrentSrc(next);
    setHasError(false);
    setIsLoaded(false);
    setRetryAttempted(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 6. Tampilkan log error jika URL gambar gagal dipanggil agar mudah debugging
    console.error(`[SafeImage Error] Gagal memuat gambar: "${currentSrc}" (Input: "${src}"). Alt: "${alt}". Browser: ${navigator.userAgent}`, e);

    if (!retryAttempted) {
      setRetryAttempted(true);
      // Coba fallbackSrc kustom jika tersedia
      if (fallbackSrc && fallbackSrc !== currentSrc) {
        setCurrentSrc(getPublicImageUrl(fallbackSrc));
        return;
      }
      // Coba path asli jika berbeda dari normalized
      if (src && src !== currentSrc) {
        setCurrentSrc(src);
        return;
      }
      // Coba gambar default homestay jika belum dicoba
      if (currentSrc !== '/images/sundak_fullhouse_1790552054893.jpg') {
        setCurrentSrc('/images/sundak_fullhouse_1790552054893.jpg');
        return;
      }
    }

    // 4. Tambahkan fallback jika gambar gagal dimuat: tampilkan placeholder, jangan membuat halaman putih kosong
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${containerClassName}`}>
      {/* Skeleton loading yang ringan & optimal untuk mobile */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="w-5 h-5 border-2 border-neutral-600 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Fallback Placeholder (Mencegah layar putih kosong, mempertahankan tata letak UI) */}
      {hasError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-3 text-center z-20 select-none">
          <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-emerald-400 mb-1.5 shadow-xs">
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-neutral-200 line-clamp-1 max-w-[90%]">
            {fallbackText}
          </span>
          <span className="text-[9px] text-neutral-400 font-medium mt-0.5">
            Griya Barokah Homestay
          </span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
