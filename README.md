# GobernArg · versión B Lite

Simulación política: gobernás la Argentina durante uno o dos mandatos, negociás con empresas, sindicatos, gobernadores y el resto de los actores, y buscás la reelección. Hecho con React 18, Vite, TypeScript y Tailwind.

## Versiones

Hay dos versiones en paralelo, cada una en su rama:

| Rama | Versión | Qué tiene |
| --- | --- | --- |
| `rediseno-despacho` | **A · Despacho** (principal) | Motor causal de 15 indicadores y 17 actores, estética "Despacho" (papel, azul marino, oro y celeste) |
| `version-b` | **B** | Motor causal propio (14 indicadores, 18 actores, 45 políticas), estética "Sala de situación" |
| `version-b-lite` | **B Lite** | La B compacta: mismo motor y misma estética, menos sistemas (ver abajo) |

Las dos comparten las funciones de las fases 0 a 3: inicio en dos pasos con niveles Fácil / Normal / Argentina, escenarios históricos que se desbloquean con reelecciones, guardado automático, versión para celular, tutorial del primer turno, glosario aplicado y formulario de playtest.

## Versión Lite (rama `version-b-lite`)

Versión reducida de la B, con la misma estética "Sala de situación". Sale de `version-b` y se recortó por fases (un commit cada una):

- **Sin código heredado**: el motor viejo (`engine/`, `utils/`, `data/`, `systems/`), sus pruebas, las imágenes que no se usaban y las dependencias `embla-carousel-react`, `@radix-ui/react-tooltip`, `clsx` y `tailwind-merge`.
- **Sin estos sistemas**: gabinete de asesores (y Charly Abad), habilidades activas de los perfiles, cuaderno de gestión, historial de gobierno, plataforma del partido y escenarios históricos desbloqueables (Corralito, País en llamas).
- **Se mantiene**: los 4 perfiles con sus ventajas fijas, las estrategias postlegislativas, los niveles Fácil / Normal / Argentina, mandatos, elecciones, eventos, indicadores, actores y políticas.
- **Inicio en una sola pantalla**: nombre, foto (grilla o "Subir mi foto", que se recorta a 256 × 256), perfil y nivel.
- **Guardado propio**: `localStorage['gobernarg.lite.v1']`, con versión de guardado (`SAVE_VERSION` en `src/causal/persistence.ts`). No pisa ni lee la partida de la versión completa.

### Publicar la Lite en Netlify

Es un sitio aparte del de la B, con el mismo `netlify.toml`:

1. Add new site → Import from GitHub → rama `version-b-lite`.
2. Site configuration → Forms → **Enable form detection** (las respuestas llegan a Forms → playtest con `version: B Lite`).
3. Trigger deploy.

## Correr el juego

El proyecto vive en `project-bolt-sb1-dzgqso GobernArg 21-11/project`.

```bash
cd "project-bolt-sb1-dzgqso GobernArg 21-11/project"
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm test` | Pruebas del motor, del glosario, del guardado y de la interfaz |
| `npm run typecheck` | Chequeo de tipos |
| `npm run lint` | ESLint |

## Publicar en Netlify

El `netlify.toml` de la raíz ya configura la carpeta, el comando y Node 22. Por cada versión:

1. Add new site → Import from GitHub → esta rama.
2. Site configuration → Forms → **Enable form detection** (el formulario "Contanos cómo te fue" llega a Forms → playtest).
3. Trigger deploy.

El sitio no se indexa en buscadores (`X-Robots-Tag` y `robots` meta). La vista previa al compartir el link usa `public/og-image.jpg`; Netlify completa la dirección del sitio con `VITE_SITE_URL=$URL`.

## Estructura (versión B Lite)

| Carpeta (dentro de `project/src`) | Contenido |
| --- | --- |
| `causal/` | Motor de la versión B: catálogo, cierre de turno, campaña y elecciones, escenarios, guardado por comandos (`persistence.ts`), formato argentino (`format.ts`) |
| `CausalApp.tsx` | Flujo de pantallas: portada, nueva partida y tablero |
| `components/NewGameScreen.tsx` | Nueva partida en una sola pantalla (`lib/avatars.ts` y `lib/photo.ts` para la foto) |
| `components/causal/` | Tablero (`CausalDashboard.tsx`, con la versión para celular), `SituationRoom.tsx`, paneles, diálogos, tutorial y formulario de playtest |
| `situation-room.css` | Estética "Sala de situación" |
| `utils/` | Imágenes que usa el juego (`imageAssets.ts`, `iconThumbnails.ts`) |
| `__tests__/` | Pruebas (Vitest); `smoke.test.tsx` recorre la interfaz en un navegador simulado |

## Imágenes

El juego usa solo las imágenes optimizadas de `src/assets/images` (unos 2 MB en la Lite). El arte crudo (`new assets/`, los `.zip` de la raíz y `src/assets/images/raw/`) queda fuera del repositorio desde la Fase 4; sigue en el historial de Git. Para optimizar imágenes nuevas hace falta ffmpeg con libwebp:

```bash
scripts/optimizar-imagenes.sh src/assets/images
```

## Documentos

- `_analisis_gobernarg/`: radiografía del MVP, motor causal en Excel, datos de playtest con bots.
- Guías de trabajo (en Claude): glosario de textos, asimetría ideológica y guía del playtest con personas.
