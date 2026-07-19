/**
 * Compresse et redimensionne les images côté client via Canvas API.
 * - Aucune dépendance externe
 * - Conserve la transparence (PNG → PNG, sinon JPEG)
 * - Ne touche pas aux fichiers non-image (PDF, video, etc.)
 *
 * @param {File} file - Le fichier image à compresser
 * @param {Object} opts
 * @param {number} opts.maxWidth  - Largeur max en px (défaut 1920)
 * @param {number} opts.maxHeight - Hauteur max en px (défaut 1920)
 * @param {number} opts.quality   - Qualité JPEG 0-1 (défaut 0.82)
 * @returns {Promise<File>} - Nouveau fichier compressé
 */
export async function compressImage(file, opts = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
  } = opts;

  if (!file || !(file instanceof File)) return file;

  const type = file.type || '';
  if (!type.startsWith('image/') || type === 'image/gif' || type === 'image/svg+xml') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = type === 'image/png' ? 'image/png' : 'image/jpeg';
  const q = outputType === 'image/png' ? undefined : quality;

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, q));

  if (!blob || blob.size >= file.size) return file;

  const ext = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.${ext}`, { type: outputType, lastModified: Date.now() });
}
