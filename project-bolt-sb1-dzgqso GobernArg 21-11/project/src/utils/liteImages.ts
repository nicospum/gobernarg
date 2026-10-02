/**
 * Imágenes propias de la B Lite (listado en docs/imagenes-b-lite.md, en la raíz
 * del repositorio). Se conectan por nombre de archivo: para sumar una tanda
 * alcanza con copiar los .webp en src/assets/images/b-lite/<carpeta>/ con el
 * nombre del listado (actores/<id del actor>.webp, politicas/<id>.webp,
 * pantallas/<nombre>.webp). Si falta una, quien la pide usa su respaldo.
 *
 * Acá solo se guardan direcciones: el navegador baja cada imagen recién
 * cuando se muestra.
 */
const files = import.meta.glob<string>('../assets/images/b-lite/**/*.webp', { eager: true, query: '?url', import: 'default' });

const byFolder: Record<string, Record<string, string>> = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/\/b-lite\/(.+)\/([^/]+)\.webp$/);
  if (match) (byFolder[match[1]] ??= {})[match[2]] = url;
}

/** Dirección de `b-lite/<carpeta>/<nombre>.webp`, o undefined si todavía no está. */
export function liteImage(folder: string, name: string): string | undefined {
  return byFolder[folder]?.[name];
}

export const actorImage = (actorId: string) => liteImage('actores', actorId);
export const policyImage = (policyId: string) => liteImage('politicas', policyId);
export const screenImage = (name: string) => liteImage('pantallas', name);
