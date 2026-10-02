# GobernArg

Simulación política: gobernás la Argentina durante uno o dos mandatos, negociás con empresas, sindicatos, gobernadores y el resto de los actores, y buscás la reelección. Hecho con React 18, Vite, TypeScript y Tailwind.

## Versiones

Hay varias versiones en paralelo, cada una en su rama:

| Rama | Versión | Qué tiene |
| --- | --- | --- |
| `rediseno-despacho` | **A · Despacho** (principal) | Motor causal de 15 indicadores y 17 actores, estética "Despacho" (papel, azul marino, oro y celeste) |
| `version-b` | **B** | Motor causal propio (14 indicadores, 18 actores, 45 políticas), estética oscura |
| `version-a-lite` | **A Lite** | La versión A reducida y compacta (ver abajo) |

A y B comparten las funciones de las fases 0 a 3: inicio en dos pasos con niveles Fácil / Normal / Argentina, escenarios históricos que se desbloquean con reelecciones, guardado automático, versión para celular, tutorial del primer turno, glosario aplicado y formulario de playtest.

## Versión Lite (`version-a-lite`)

Versión reducida y compacta de A, con la misma estética y el mismo motor causal (indicadores, actores, acciones, eventos, mandatos, elecciones, legislativas y estrategia post-legislativa sin cambios).

- **Qué se sacó:** asesores y gabinete, habilidades activas de los perfiles (quedan sus ventajas fijas), cuaderno político, plataforma del partido, la pantalla de asunción y el código del juego viejo que ya no se usaba.
- **Tablero:** muestra la barra superior, la barra de comando (próxima elección y riesgo), las 5 métricas, Estado del país, Situación electoral, Acciones políticas, Este turno y Actores. Se sacaron los paneles de condiciones vigentes, próximas maduraciones, informes de gestión, notificaciones (con la campanita) y calendario político; el motor sigue registrando esos datos. Los avisos de "un trimestre más y caés" (hiperinflación, crisis de gobernabilidad) se ven en "Este turno".
- **Qué está oculto (sigue en el código):**
  - *Historial de gestión:* no hay panel ni botón, pero el registro de turnos se sigue grabando y alimenta la pantalla de legado (obras, crisis, estadísticas).
  - *Escenarios históricos* (Corralito y País en llamas), con sus mecánicas (default de deuda, ley de emergencia, rebote) y el desbloqueo por reelecciones. Están apagados en `project/src/lite/config.ts`.
- **Inicio en una pantalla:** bienvenida (Empezar / Continuar) y "Nueva partida" con nombre, foto (de la grilla o propia, recortada a 256×256), perfil y nivel (Fácil, Normal o Argentina).
- **Imágenes:** retratos de los 17 actores, ilustraciones de 15 políticas, portada y banda del resumen del trimestre, tomadas de la tanda de la B Lite. La tabla id → archivo está en `src/lite/imageMap.ts`; los archivos (aclarados para el tema claro: gamma 1,5, menos contraste, leve calidez) se generan con `scripts/aclarar-imagenes-lite.sh <carpeta b-lite>` en `src/assets/images/a-lite/`.
- **Toque de realismo:** 6 acciones llevan foto diurna con carteles reales (`scripts/recortar-fotos-lite.sh`, sin aclarar) y 5 cambian solo el nombre visible (y alguna la descripción) desde `src/lite/actionOverrides.ts`: Desregulación del mercado laboral, Reforma previsional, Reforma tributaria integral, Desarrollo de Vaca Muerta y Promoción de exportaciones. Ids, efectos y costos no cambian, así que los guardados siguen andando.
- **Guardado propio:** la partida se guarda en `gobernarg.lite.partida` (con versión de guardado), así no se mezcla con la de la versión completa en el mismo navegador. El formulario de playtest llega con la versión `A Lite`.
- **Reactivar los escenarios históricos:** en `src/lite/config.ts` poner `LITE_FEATURES.escenariosHistoricos = true`. Con eso vuelven a "Nueva partida" (bloqueados hasta ganar reelecciones; el progreso se guarda en `gobernarg.lite.progress.v1` y se cuenta aun con el flag apagado, así las reelecciones ya ganadas valen) y `npm run playtest` los incluye. No hace falta tocar nada más: los datos están en `src/data/causal/scenarios.ts` y las pruebas (`scenariosInterna.test.ts`, `liteFeatures.test.tsx`) los cubren con el flag apagado o prendido.
- **Publicar en Netlify:** un sitio aparte apuntando a la rama `version-a-lite`, con los mismos pasos de abajo (el `netlify.toml` sirve tal cual).

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
| `npm run playtest:ideologia` | Asimetría ideológica: heterodoxo y ortodoxo, coherentes y bien jugados, en los escenarios (3 en Lite) |

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

El juego usa solo las imágenes optimizadas de `src/assets/images` (unos 3 MB; 2 MB en Lite). El arte crudo (`new assets/`, los `.zip` de la raíz y `src/assets/images/raw/`) queda fuera del repositorio desde la Fase 4; sigue en el historial de Git. Para optimizar imágenes nuevas hace falta ffmpeg con libwebp:

```bash
scripts/optimizar-imagenes.sh src/assets/images
```

## Documentos

- `_analisis_gobernarg/`: radiografía del MVP, motor causal en Excel, datos de playtest con bots.
- Guías de trabajo (en Claude): glosario de textos, asimetría ideológica y guía del playtest con personas.
