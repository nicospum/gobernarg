import { describe, expect, it } from 'vitest';
import { MAX_PHOTO_BYTES, centerSquare, validatePhotoFile } from '../lib/avatarPhoto';

describe('foto propia del jugador', () => {
  it('acepta imágenes de hasta 10 MB', () => {
    expect(validatePhotoFile({ type: 'image/jpeg', size: 2_000_000 })).toBeNull();
    expect(validatePhotoFile({ type: 'image/png', size: MAX_PHOTO_BYTES })).toBeNull();
  });

  it('rechaza lo que no es imagen y lo que pesa más de 10 MB', () => {
    expect(validatePhotoFile({ type: 'application/pdf', size: 1000 })).toMatch(/no es una imagen/);
    expect(validatePhotoFile({ type: 'image/jpeg', size: MAX_PHOTO_BYTES + 1 })).toMatch(/10 MB/);
  });

  it('recorta al centro en cuadrado', () => {
    expect(centerSquare(4000, 3000)).toEqual({ sx: 500, sy: 0, side: 3000 });
    expect(centerSquare(1080, 1920)).toEqual({ sx: 0, sy: 420, side: 1080 });
    expect(centerSquare(256, 256)).toEqual({ sx: 0, sy: 0, side: 256 });
  });
});
