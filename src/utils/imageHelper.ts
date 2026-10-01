import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Utility kompresi dan pengelolaan file gambar untuk CMS Griya Barokah.
 * Menghasilkan gambar terkompresi resolusi tinggi (maks 1400px, JPEG 0.85) yang ringan (~100-250KB),
 * diunggah langsung ke Supabase Storage bucket 'media' dan menghasilkan Public URL cloud permanen.
 */

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(';base64,');
  if (parts.length < 2) {
    return new Blob([dataUrl], { type: 'image/jpeg' });
  }
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Mengunggah file gambar ke Supabase Storage (bucket: "media")
 * Didahului dengan kompresi halus agar hemat bandwidth dan cepat dimuat.
 * Mengembalikan Public URL cloud yang valid.
 */
export const uploadImageToSupabaseStorage = async (
  file: File,
  folder = 'media'
): Promise<string> => {
  // 1. Kompresi gambar asli
  const compressedDataUrl = await compressImageFile(file, 1400, 0.85);

  if (!isSupabaseConfigured) {
    return compressedDataUrl;
  }

  try {
    const blob = dataUrlToBlob(compressedDataUrl);
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage Upload Warning]', uploadError.message);
      return compressedDataUrl;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
    return urlData.publicUrl || compressedDataUrl;
  } catch (err) {
    console.warn('[Supabase Storage Error] Gagal upload gambar:', err);
    return compressedDataUrl;
  }
};

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
