/**
 * Utility kompresi dan pengelolaan file gambar untuk CMS Griya Barokah.
 * Menghasilkan Data URL resolusi tinggi (maks 1400px, JPEG 0.85) yang ringan (~100-250KB),
 * aman disimpan di localStorage / database, dan langsung dirender di browser smartphone.
 */

export const compressImageFile = async (
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Jika bukan gambar raster (misal SVG), baca langsung sebagai Data URL
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Render gambar halus ke canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Ekspor sebagai JPEG berkualitas tinggi tapi hemat memori
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          // Fallback ke data URL mentah jika canvas gagal
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
