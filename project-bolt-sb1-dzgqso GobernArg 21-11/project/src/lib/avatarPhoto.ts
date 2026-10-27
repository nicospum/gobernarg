/**
 * Foto propia del jugador: se recorta al centro en cuadrado y se reduce a
 * 256×256 en JPEG, así entra cómoda en el guardado (un data URL de ~20 kB).
 */
export const PHOTO_SIZE = 256;
export const PHOTO_QUALITY = 0.85;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Mensaje de error para el jugador, o null si el archivo sirve. */
export function validatePhotoFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/')) return 'Ese archivo no es una imagen. Probá con una foto JPG o PNG.';
  if (file.size > MAX_PHOTO_BYTES) return 'La foto pesa más de 10 MB. Elegí una más liviana.';
  return null;
}

/** Recorte cuadrado centrado: el lado es el menor de los dos. */
export function centerSquare(width: number, height: number): { sx: number; sy: number; side: number } {
  const side = Math.min(width, height);
  return { sx: Math.round((width - side) / 2), sy: Math.round((height - side) / 2), side };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}

/** Foto lista para guardar: data URL JPEG de PHOTO_SIZE×PHOTO_SIZE. */
export async function photoToDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);
  const { sx, sy, side } = centerSquare(img.naturalWidth, img.naturalHeight);
  if (side <= 0) throw new Error('La imagen está vacía.');
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Este navegador no puede procesar la foto.');
  // Fondo blanco: un PNG transparente no queda negro al pasar a JPEG.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
}
