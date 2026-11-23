import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BLUEPRINT_LIMITS } from '../types/cms';
import { storage } from './firebase';
import { createMediaAsset } from './firestoreActions';

const PARTNER_LOGO_MAX_CHARS = 220000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function compressRasterImageToDataUrl(
  file: File,
  maxChars: number = PARTNER_LOGO_MAX_CHARS
): Promise<string> {
  const rawUrl = await readFileAsDataUrl(file);
  if (file.type === 'image/svg+xml') {
    if (rawUrl.length <= maxChars) return rawUrl;
    throw new Error('SVG file is too large to store directly (max ~160KB).');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 560;
      let width = img.naturalWidth || maxDim;
      let height = img.naturalHeight || maxDim;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable.'));
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP (supports transparency + high compression); fallback to PNG
      const qualities = [0.88, 0.76, 0.62, 0.48];
      for (const q of qualities) {
        const webpUrl = canvas.toDataURL('image/webp', q);
        if (webpUrl.startsWith('data:image/webp') && webpUrl.length <= maxChars) {
          resolve(webpUrl);
          return;
        }
      }

      const pngUrl = canvas.toDataURL('image/png');
      if (pngUrl.length <= maxChars) {
        resolve(pngUrl);
        return;
      }

      // Final downscale attempt if PNG was still too large
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = Math.max(1, Math.round(width * 0.6));
      smallCanvas.height = Math.max(1, Math.round(height * 0.6));
      const smallCtx = smallCanvas.getContext('2d');
      if (smallCtx) {
        smallCtx.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height);
        const smallUrl = smallCanvas.toDataURL('image/webp', 0.72);
        if (smallUrl.length <= maxChars) {
          resolve(smallUrl);
          return;
        }
      }

      reject(new Error('Image exceeds maximum allowed size even after optimization.'));
    };
    img.onerror = () => reject(new Error('Invalid image file.'));
    img.src = rawUrl;
  });
}

export async function uploadPartnerLogoFile(params: {
  file: File;
  label: string;
  userUid: string;
}): Promise<string> {
  const { file, label, userUid } = params;
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (!allowed.includes(file.type)) {
    throw new Error('Unsupported format. Please choose PNG, JPG, WEBP, or SVG.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File exceeds 5MB limit.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `hcc-media/partners/${Date.now()}_${safeName}`;
  let finalUrl = '';
  let usedStoragePath: string | undefined = undefined;

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType: file.type });
    finalUrl = await getDownloadURL(storageRef);
    usedStoragePath = storagePath;
  } catch {
    finalUrl = await compressRasterImageToDataUrl(file, PARTNER_LOGO_MAX_CHARS);
  }

  if (finalUrl.length > BLUEPRINT_LIMITS.mediaUrlMax) {
    throw new Error('Encoded image URL exceeds database limit.');
  }

  // Register in Media Library for reuse across the CMS
  try {
    await createMediaAsset({
      name: (label || file.name).slice(0, 160),
      category: 'logo',
      mimeType: file.type,
      url: finalUrl,
      storagePath: usedStoragePath,
      uploadedByUid: userUid,
    });
  } catch {
    // Non-blocking: still return logo URL for partner record
  }

  return finalUrl;
}
