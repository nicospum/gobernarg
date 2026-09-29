# GobernArg

Simulación política: gobernás la Argentina durante uno o dos mandatos, negociás con empresas, sindicatos, gobernadores y el resto de los actores, y buscás la reelección. Hecho con React 18, Vite, TypeScript y Tailwind.

## Versiones

Hay dos versiones en paralelo, cada una en su rama:

| Rama | Versión | Qué tiene |
| --- | --- | --- |
| `rediseno-despacho` | **A · Despacho** (principal) | Motor causal de 15 indicadores y 17 actores, estética "Despacho" (papel, azul marino, oro y celeste) |
| `version-b` | **B** | Motor causal propio (14 indicadores, 18 actores, 45 políticas), estética oscura |

Las dos comparten las funciones de las fases 0 a 3: inicio en dos pasos con niveles Fácil / Normal / Argentina, escenarios históricos que se desbloquean con reelecciones, guardado automático, versión para celular, tutorial del primer turno, glosario aplicado y formulario de playtest.

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
| `npm run playtest` | Partidas completas con bots y matriz de escenarios |
| `npm run playtest:ideologia` | Asimetría ideológica: heterodoxo y ortodoxo, coherentes y bien jugados, en los 5 escenarios |

Los resultados del playtest con bots quedan en `_analisis_gobernarg/playtest/`.

## Publicar en Netlify

El `netlify.toml` de la raíz ya configura la carpeta, el comando y Node 22. Por cada versión:

1. Add new site → Import from GitHub → esta rama.
2. Site configuration → Forms → **Enable form detection** (el formulario "Contanos cómo te fue" llega a Forms → playtest).
3. Trigger deploy.

El sitio no se indexa en buscadores (`X-Robots-Tag` y `robots` meta). La vista previa al compartir el link usa `public/og-image.jpg`; Netlify completa la dirección del sitio con `VITE_SITE_URL=$URL`.

## Estructura

| Carpeta (dentro de `project/src`) | Contenido |
| --- | --- |
| `engine/causal`, `data/causal` | Motor causal: indicadores, actores, acciones, efectos y cierre de turno |
| `data/causal/playerTexts.ts` | Textos para el jugador (notas de acciones y "Poder" de los actores, sin siglas del motor) |
| `engine/` | Puente entre el motor causal y el estado del juego, elecciones, eventos |
| `components/` | Pantallas y paneles; `components/mobile/` tiene el tablero para celular |
| `lib/` | Guardado (`savegame.ts`), formato argentino de números (`format.ts`), modales (`useDialog.ts`), playtest |
| `playtest/` | Bots y runner de partidas automáticas |
| `__tests__/` | Pruebas (Vitest); `smoke.test.tsx` recorre la interfaz en un navegador simulado |

## Imágenes

El juego usa solo las imágenes optimizadas de `src/assets/images` (unos 3 MB). El arte crudo (`new assets/`, los `.zip` de la raíz y `src/assets/images/raw/`) queda fuera del repositorio desde la Fase 4; sigue en el historial de Git. Para optimizar imágenes nuevas hace falta ffmpeg con libwebp:

```bash
scripts/optimizar-imagenes.sh src/assets/images
```

## Documentos

- `_analisis_gobernarg/`: radiografía del MVP, motor causal en Excel, datos de playtest con bots.
- Guías de trabajo (en Claude): glosario de textos, asimetría ideológica y guía del playtest con personas.
