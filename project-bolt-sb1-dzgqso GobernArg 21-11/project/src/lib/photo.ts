/** Foto propia: se recorta al centro en cuadrado y se reduce a 256 × 256 JPEG. */
export const PHOTO_SIZE = 256;
export const PHOTO_QUALITY = 0.85;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Motivo para rechazar el archivo antes de abrirlo, o null si se puede usar. */
export function photoFileError(file: { type: string; size: number }): string | null {
  if (!file.type.startsWith('image/')) return 'Elegí un archivo de imagen (JPG, PNG, WebP…).';
  if (file.size > MAX_PHOTO_BYTES) return 'La imagen pesa más de 10 MB. Elegí una más liviana.';
  return null;
}

/** Recorte centrado: el lado del cuadrado es el lado menor de la imagen. */
export function centerSquare(width: number, height: number) {
  const side = Math.min(width, height);
  return { sx: (width - side) / 2, sy: (height - side) / 2, side };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo abrir la imagen. Probá con otra.')); };
    img.src = url;
  });
}

/** Devuelve la foto lista para guardar (dataURL JPEG). Lanza un Error con un mensaje para el jugador. */
export async function processPhoto(file: File): Promise<string> {
  const error = photoFileError(file);
  if (error) throw new Error(error);
  const img = await loadImage(file);
  if (!img.naturalWidth || !img.naturalHeight) throw new Error('No se pudo abrir la imagen. Probá con otra.');
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE; canvas.height = PHOTO_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Este navegador no permite procesar la foto.');
  const { sx, sy, side } = centerSquare(img.naturalWidth, img.naturalHeight);
  context.imageSmoothingQuality = 'high';
  context.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  const data = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
  if (!data.startsWith('data:image/jpeg')) throw new Error('Este navegador no permite procesar la foto.');
  return data;
}
