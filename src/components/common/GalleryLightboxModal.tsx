import React, { useState, useEffect, useRef } from 'react';
import { SafeImage } from './SafeImage';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';

interface GalleryLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  title = 'Galeri Foto',
  subtitle,
}) => {
  // Filter and deduplicate images to ensure valid URLs
  const validImages = React.useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) return [];
    return images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  // Sync initialIndex when opened
  useEffect(() => {
    if (isOpen) {
      const safeIdx = Math.min(Math.max(0, initialIndex), Math.max(0, validImages.length - 1));
      setCurrentIndex(safeIdx);
      setViewMode('carousel');
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex, validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && viewMode === 'carousel') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
      } else if (e.key === 'ArrowRight' && viewMode === 'carousel') {
        setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, validImages.length, onClose]);

  if (!isOpen || validImages.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaXRef.current) > 50) {
      if (touchDeltaXRef.current > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60 z-20">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {title}
            </h2>
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
            <span>
              Foto {currentIndex + 1} dari {validImages.length}
            </span>
            {subtitle && (
              <>
                <span>•</span>
                <span className="truncate">{subtitle}</span>
              </>
            )}
          </div>
        </div>

        {/* View Mode Toggle & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            title={viewMode === 'carousel' ? 'Tampilkan Semua Foto (Grid)' : 'Tampilan Layar Penuh'}
          >
            {viewMode === 'carousel' ? (
              <>
                <Grid className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Lihat Grid</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Perbesar Foto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Tutup Galeri"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'carousel' ? (
        <div
          className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Photo with object-contain to prevent cropping */}
          <div className="w-full h-full flex items-center justify-center max-w-5xl max-h-[70vh] sm:max-h-[76vh]">
            <SafeImage
              src={validImages[currentIndex]}
              alt={`${title} - Foto ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-200"
              fallbackText={title}
              loading="eager"
            />
          </div>

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all cursor-pointer z-20"
                aria-label="Foto Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all cursor-pointer z-20"
                aria-label="Foto Selanjutnya"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Swipe Hint on Mobile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs text-[10px] text-white/70 pointer-events-none">
            Geser kiri/kanan untuk berpindah foto
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {validImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('carousel');
                  }}
                  className={`relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900 border-2 cursor-pointer transition-all active:scale-95 group ${
                    currentIndex === idx
                      ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <SafeImage
                    src={imgUrl}
                    alt={`${title} - Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackText={`${idx + 1}`}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                    #{idx + 1}
                  </div>
                  {currentIndex === idx && (
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Thumbnail Strip (in carousel mode) */}
      {viewMode === 'carousel' && validImages.length > 1 && (
        <div className="p-3 border-t border-white/10 bg-black/70 z-20">
          <div className="max-w-4xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {validImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-12 sm:w-16 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Pilih foto ${idx + 1}`}
              >
                <SafeImage
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  fallbackText={`${idx + 1}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
