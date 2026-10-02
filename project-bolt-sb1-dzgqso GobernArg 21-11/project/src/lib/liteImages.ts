/**
 * Direcciones de las imágenes de la Lite (tabla en src/lite/imageMap.ts).
 * Solo se guardan direcciones: el navegador baja cada imagen recién cuando
 * se muestra. Si falta un archivo, devuelve undefined y quien la pide usa su
 * respaldo.
 */
import type { ActorId } from '@/data/causal';
import { ACTION_IMAGE, ACTION_PHOTO, ACTOR_IMAGE, SCREEN_IMAGE } from '@/lite/imageMap';

const files = import.meta.glob<string>('../assets/images/a-lite/**/*.webp', { eager: true, query: '?url', import: 'default' });

const byFolder: Record<string, Record<string, string>> = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/\/a-lite\/(.+)\/([^/]+)\.webp$/);
  if (match) (byFolder[match[1]] ??= {})[match[2]] = url;
}

const image = (folder: string, name: string | undefined) => (name ? byFolder[folder]?.[name] : undefined);

export const actorPortrait = (actor: ActorId) => image('actores', ACTOR_IMAGE[actor]);
export const actionImage = (actionId: string) =>
  image('fotos', ACTION_PHOTO[actionId]) ?? image('politicas', ACTION_IMAGE[actionId]);
export const screenImage = (key: keyof typeof SCREEN_IMAGE) => image('pantallas', SCREEN_IMAGE[key]);
