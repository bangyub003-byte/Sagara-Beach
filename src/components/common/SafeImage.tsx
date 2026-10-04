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

const DEFAULT_PERMANENT_FALLBACK = '/images/sundak_fullhouse_1790552054893.jpg';

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

    // Logging pengecekan sumber gambar saat debugging
    if (typeof window !== 'undefined') {
      const isDataUrl = next.startsWith('data:');
      const isHttp = next.startsWith('http://') || next.startsWith('https://');
      const sourceDesc = isDataUrl
        ? `CMS Database (Uploaded Image - ${Math.round(next.length / 1024)} KB)`
        : isHttp
        ? `External Database URL (${next})`
        : `CMS Media File (${next})`;

      console.log(
        `%c[CMS Image Debug]%c ${alt}: %c${sourceDesc}`,
        'color: #059669; font-weight: bold;',
        'color: inherit;',
        'color: #0284c7; font-weight: 600;'
      );
    }
  }, [src, alt]);

  // Timeout guard untuk gambar eager di atas layar (above-the-fold) agar tidak pernah menggantung di skeleton kosong
  useEffect(() => {
    if (loading === 'eager' && !isLoaded && !hasError) {
      const timer = setTimeout(() => {
        if (!isLoaded && !hasError) {
          const targetFallback = fallbackSrc ? getPublicImageUrl(fallbackSrc) : DEFAULT_PERMANENT_FALLBACK;
          if (currentSrc !== targetFallback) {
            console.warn(`[SafeImage Timeout] Gambar eager lambat/stuck, langsung beralih ke: ${targetFallback}`);
            setCurrentSrc(targetFallback);
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isLoaded, hasError, currentSrc, fallbackSrc]);

  // Cek mode visual debug jika parameter ?debug=image atau flag window diaktifkan
  const isDebugMode =
    typeof window !== 'undefined' &&
    (window.location.search.includes('debug=image') ||
      (window as any).__DEBUG_CMS_IMAGES__ === true ||
      localStorage.getItem('debug_images') === 'true');

  const getSourceLabel = () => {
    if (currentSrc.startsWith('data:')) return 'CMS Upload (DataURL)';
    if (currentSrc.startsWith('http')) return 'CMS External URL';
    return `CMS: ${currentSrc.split('/').pop()}`;
  };

  const handleError = () => {
    console.warn(`[SafeImage Error] Gagal memuat gambar: "${currentSrc}" (Input: "${src}"). Alt: "${alt}".`);

    const targetFallback = fallbackSrc ? getPublicImageUrl(fallbackSrc) : DEFAULT_PERMANENT_FALLBACK;

    // Jika gambar yang gagal bukan fallback permanen, SEGERA beralih ke gambar default permanen
    if (currentSrc !== targetFallback) {
      setCurrentSrc(targetFallback);
      setRetryAttempted(true);
      return;
    }

    // Jika gambar fallback default pun gagal dimuat, tampilkan placeholder seketika (tanpa skeleton menggantung)
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${containerClassName}`}
      data-image-source={currentSrc.startsWith('data:') ? 'cms-uploaded-dataurl' : currentSrc}
      data-source-origin={currentSrc.startsWith('data:') ? 'CMS_DATABASE_UPLOAD' : 'CMS_DATABASE'}
      title={`[Sumber Gambar CMS]: ${currentSrc.startsWith('data:') ? 'CMS Upload (Base64 Data URL)' : currentSrc}`}
    >
      {/* Skeleton loading shimmer abu-abu lembut (mencegah kotak hitam polos) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse pointer-events-none" />
      )}

      {/* Indikator Pengecekan Sumber Gambar Saat Debugging (hanya muncul jika mode debug aktif) */}
      {isDebugMode && (
        <div className="absolute top-1 left-1 z-30 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-xs">
            {getSourceLabel()}
          </span>
        </div>
      )}

      {/* Fallback Placeholder Lembut (Mencegah kotak hitam / layar putih, ramah mata) */}
      {hasError ? (
        <div className="absolute inset-0 bg-neutral-100 border border-neutral-200/80 flex flex-col items-center justify-center p-3 text-center z-20 select-none">
          <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 mb-1 shadow-2xs">
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] font-bold text-neutral-700 line-clamp-1 max-w-[90%]">
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
          data-image-src={currentSrc.startsWith('data:') ? 'cms-upload-dataurl' : currentSrc}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
