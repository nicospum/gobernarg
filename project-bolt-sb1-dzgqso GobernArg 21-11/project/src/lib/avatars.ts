import { IMAGES } from '../utils/imageAssets';

/**
 * Fotos del presidente. En la partida se guarda el id ("avatar:3") y no la
 * dirección del archivo, que cambia en cada publicación. Una foto subida por
 * el jugador se guarda entera como dataURL (JPEG de 256 × 256).
 */
const C = IMAGES.characters;
export const AVATARS: { id: string; src: string }[] = [
  C.executive1, C.executive2, C.femaleExecutive1, C.femaleExecutive2, C.seniorLeader,
  C.indigenousLeader, C.youthActivist, C.businessExecutive, C.popularLeader, C.spokesperson,
  C.candidateHandshake, C.conservative, C.fighter, C.youngOrator, C.podiumOfficial,
].map((src, i) => ({ id: `avatar:${i + 1}`, src }));

export const DEFAULT_AVATAR = AVATARS[0].id;
/** Tope del texto de una foto subida (256 × 256 en JPEG ronda los 15–40 KB). */
export const MAX_PHOTO_DATA_URL = 400_000;

export const isUploadedPhoto = (avatar: string) => avatar.startsWith('data:image/jpeg;base64,');

/** Avatar válido para guardar: vacío, uno de la grilla o una foto subida razonable. */
export function isValidAvatar(avatar: string): boolean {
  if (avatar === '' || AVATARS.some(a => a.id === avatar)) return true;
  return isUploadedPhoto(avatar) && avatar.length <= MAX_PHOTO_DATA_URL && /^[A-Za-z0-9+/=]+$/.test(avatar.slice(23));
}

/** Dirección para mostrar el avatar: la foto subida o la de la grilla. */
export function avatarSrc(avatar: string): string | null {
  if (isUploadedPhoto(avatar)) return avatar;
  return AVATARS.find(a => a.id === avatar)?.src ?? null;
}
