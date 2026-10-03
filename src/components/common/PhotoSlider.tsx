import React, { useState, useEffect, useRef } from 'react';
import { SafeImage, getPublicImageUrl } from './SafeImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoSliderProps {
  images?: string[];
  alt?: string;
  fallbackText?: string;
  className?: string; // For the image
  containerClassName?: string; // For the outer wrapper
  autoPlayInterval?: number; // In ms, default 4500
  showControls?: boolean; // Desktop arrow buttons
  showDots?: boolean; // Indicator dots
  overlayGradient?: boolean; // Optional gradient overlay
}

export const PhotoSlider: React.FC<PhotoSliderProps> = ({
  images = [],
  alt = 'Foto',
  fallbackText = 'Foto',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
  autoPlayInterval = 4500,
  showControls = true,
  showDots = true,
  overlayGradient = false,
}) => {
  // Normalize images array to ensure valid non-empty URLs and no undefined
  const validImages = React.useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return ['/images/sundak_fullhouse_1790552054893.jpg'];
    }
    const filtered = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    return filtered.length > 0 ? filtered : ['/images/sundak_fullhouse_1790552054893.jpg'];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  // Preload semua gambar seawal mungkin agar gambar langsung siap di cache browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    validImages.forEach((imgUrl) => {
      try {
        const resolved = getPublicImageUrl(imgUrl);
        const preloadImg = new Image();
        preloadImg.src = resolved;
        if (typeof preloadImg.decode === 'function') {
          preloadImg.decode().catch(() => {});
        }
      } catch {
        // Abaikan jika browser membatasi preload
      }
    });
  }, [validImages]);

  // Preload aktif foto berikutnya sesaat sebelum timer auto-play berpindah
  useEffect(() => {
    if (typeof window === 'undefined' || validImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % validImages.length;
    try {
      const nextResolved = getPublicImageUrl(validImages[nextIdx]);
      const nextImg = new Image();
      nextImg.src = nextResolved;
      if (typeof nextImg.decode === 'function') {
        nextImg.decode().catch(() => {});
      }
    } catch {
      // Browser decode fallback
    }
  }, [currentIndex, validImages]);

  // Kelola pergantian index dengan cross-fade halus (pertahankan slide sebelumnya sebagai layer dasar agar tidak ada celah hitam)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevIndex(currentIndex);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Keep index within bounds if images change
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
      setPrevIndex(0);
    }
  }, [validImages.length, currentIndex]);

  // Auto-play timer
  useEffect(() => {
    if (validImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [validImages.length, isPaused, autoPlayInterval]);

  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null) {
      const delta = touchDeltaXRef.current;
      if (delta > 40) {
        // Swiped right -> previous
        goToPrevious();
      } else if (delta < -40) {
        // Swiped left -> next
        goToNext();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsPaused(false);
  };

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 group select-none ${containerClassName}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Placeholder skeleton shimmer abu-abu lembut (mencegah kotak hitam jika gambar belum siap) */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse pointer-events-none" />

      {/* Layer Gambar: Dipertahankan di DOM dengan transisi cross-fade mulus tanpa unmount & tanpa kotak hitam */}
      <div className="w-full h-full relative">
        {validImages.map((imgUrl, idx) => {
          const isActive = idx === currentIndex;
          const isPrev = idx === prevIndex;
          
          let layerClass = 'opacity-0 z-0 pointer-events-none';
          if (isActive) {
            layerClass = 'opacity-100 z-10';
          } else if (isPrev) {
            layerClass = 'opacity-100 z-5';
          }

          return (
            <div
              key={`${imgUrl}-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out ${layerClass}`}
            >
              <SafeImage
                src={imgUrl}
                alt={`${alt} (${idx + 1}/${validImages.length})`}
                fallbackText={fallbackText}
                className={className}
                containerClassName="w-full h-full"
                loading="eager"
              />
            </div>
          );
        })}

        {overlayGradient && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 z-15 pointer-events-none" />
        )}
      </div>

      {/* Kontrol Navigasi Panah (Desktop & Hover) */}
      {showControls && validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Foto Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Foto Selanjutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer shadow-sm active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Indikator Titik (Dots) di Bawah Foto */}
      {showDots && validImages.length > 1 && (
        <div
          className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-xs">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                aria-label={`Lihat foto ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-4 bg-white shadow-xs'
                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
