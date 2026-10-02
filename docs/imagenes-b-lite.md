# Imágenes a generar para la B Lite

Listado de las imágenes que faltan (o conviene rehacer) para que la B Lite de GobernArg se vea completa. La Lite se simplificó en texto y opciones; las imágenes tienen que compensar: que cada actor, cada política, cada evento y cada final tengan su propia imagen.

Cómo usar este documento:

1. Leer la **guía de estilo** (sección 3) una vez.
2. Generar por **prioridad** (sección 4): primero las P1, después P2 y P3.
3. Cada ficha (sección 5) trae el **prompt completo en inglés**, ya con el bloque de estilo pegado al final: se copia tal cual al generador.
4. Guardar cada imagen con el **nombre de archivo exacto** de su ficha y subirlas como dice la sección 6.

Las rutas de las fichas son relativas al proyecto: `project-bolt-sb1-dzgqso GobernArg 21-11/project/`. Rama: `version-b-lite`.

En total: **166 imágenes a generar** (49 P1 imprescindibles, 88 P2, 29 P3) y 6 que se conservan como están.

---

## 1. Qué contenido puede llevar imagen

Relevado de `src/causal/catalog.ts`, `src/causal/campaignCatalog.ts`, `src/causal/scenarios.ts`, `src/causal/campaign.ts` y los componentes de `src/components`.

| Contenido | Cantidad | Dónde se ve hoy | Imagen hoy |
|---|---:|---|---|
| Actores / factores de poder | 18 (6 familias: Producción, Trabajo, Hogares, Conocimiento, Sociedad civil, Política) | Lista "Factores de poder" y diálogo del actor | 14 íconos para 18 actores: 7 actores comparten imagen; 3 son íconos planos con fondo blanco |
| Políticas públicas | 45 en 7 categorías (Economía 16, Infraestructura 10, Servicios 7, Seguridad 4, Instituciones 3, Desarrollo 3, Cultura 2) | Grilla de tarjetas y diálogo de la política | Solo el ícono de su categoría (28 px); el diálogo no tiene imagen |
| Interacciones con actores | 3 (reunirse, negociar, firmar compromiso) | Dentro del diálogo del actor | Ninguna (no se propone imagen propia: las cubre el actor) |
| Indicadores | 14 en 4 grupos (Economía, Estado y servicios, Instituciones y sociedad, Desarrollo) | "Briefing del país", diálogo del indicador, cierre de turno | Ninguna |
| Eventos | 23 | Diálogo del evento | 16 imágenes para 23 eventos: 11 eventos usan una ajena (p. ej. "Crisis en el sistema de salud" muestra una protesta; "Bloqueo legislativo", la jornada electoral) |
| Perfiles | 4 | Nueva partida y tarjeta "Tu perfil" | 4 íconos (uno plano con fondo blanco, justo el perfil por defecto) |
| Avatares del presidente | 15 + foto propia | Nueva partida y encabezado | 14 retratos pintados + 1 ícono plano |
| Niveles | 3 (Fácil, Normal, Argentina) | Nueva partida | Tarjetas de solo texto. `scenarios.ts` define una imagen por escenario pero ningún componente la muestra |
| Escenarios ocultos | 2 (Corralito, País en llamas; `LITE_FEATURES.escenariosHistoricos = false`) | Nueva partida, si se reactivan | Igual que los niveles |
| Estrategias postlegislativas | 4 | Diálogo del turno 9 | Una banda común (`bg-congress-interior`), tarjetas sin imagen |
| Objetivos de gobierno | 3 | Tablero, elecciones y legado | Ninguna |
| Pantallas | Bienvenida, Nueva partida, Tablero (escritorio con pestañas Decisiones/Tesoro/Gestión; celular con Acciones/País/Actores), Cierre de turno, Legislativas, Estrategia, Elecciones presidenciales, Resultado presidencial, Legado | — | Bienvenida y tablero comparten la misma ilustración; cierre de turno sin imagen |
| Finales | Victoria, etapa concluida, retiro voluntario y 6 derrotas (electoral, pérdida de apoyo, insolvencia, juicio político, ruptura institucional, colapso inflacionario) | Diálogo "Legado de tu gobierno" | Victoria: ícono plano recortado; las 6 derrotas: la misma foto de protesta |
| Modales y estados vacíos | Menú, Cómo se juega, Contanos cómo te fue, Reiniciar, Error; 5 estados vacíos | — | Ninguna |

## 2. Imágenes que ya existen

Están en `src/assets/images/` (65 archivos, ~2,2 MB). Se cargan desde `src/utils/imageAssets.ts` e `iconThumbnails.ts`; las que no figuran ahí no se publican. Se revisaron todas (hojas de contacto y lectura directa).

**Estilo real que tienen:** conviven cuatro lenguajes distintos, y por eso hoy el juego se ve desparejo:

- **Pintura oscura y cinematográfica** (casi fotográfica): `bg-presidential-office`, `bg-congress-interior`, y los eventos de sequía, narcotráfico, crisis energética, ola de calor, violencia policial y motín. Interiores de noche, luz cálida de lámpara contra azules fríos. **Es lo que mejor encaja con la sala de situación** y es la base de la guía de estilo.
- **Ilustración plana luminosa** (cielo celeste, colores pastel, gente sonriente): `balcony-casa-rosada-sunset`, `congress-sunrise-panorama`, `balcony-congress-flags`, `bg-casa-rosada-morning` y los eventos de corrupción, crisis económica, jornada electoral, inundación, obra pública y protesta social. Lindas, pero diurnas y claras: atenuadas sobre fondo negro quedan lavadas.
- **Insignias hexagonales brillantes** (oro y celeste, con transparencia): 11 de los 14 íconos de grupos, 2 categorías y 3 perfiles. Coherentes entre sí, se ven bien sobre oscuro, pero son muy brillantes y "de videojuego móvil".
- **Íconos planos de línea con fondo blanco opaco**: 3 grupos (agro, empresas, trabajadores), 5 categorías, el perfil Político de Raza, los dos escudos de `ui/` y el avatar del atril. **Sobre el panel oscuro se ven como recuadros blancos**: es el problema visual más evidente del tablero.

| Archivo(s) | Dónde se usa | Veredicto |
|---|---|---|
| `backgrounds/bg-congress-interior.webp` | Diálogo "Estrategia postlegislativa" | **Bien.** Se conserva. |
| `characters/*` (14 retratos) | Avatares de nueva partida y encabezado | **Bien** (retratos pintados, fondos de color variados pero aceptables). Se conservan. |
| `characters/character-podium-official.webp` | Avatar 15 | **Reemplazar** (ícono plano con fondo blanco) → `PER-05`. |
| `events/` sequía, narcotráfico, crisis energética, ola de calor, violencia policial, motín | Sus eventos | **Bien.** Se conservan (6). |
| `events/event-debt-default`, `event-external-sanctions`, `event-general-strike` | Sus eventos | **Reemplazar:** tienen texto legible ("DEFAULT", "SANCTIONS", consignas en pancartas); sanciones muestra banderas de EE. UU., UE y Reino Unido. |
| `events/event-diplomatic-conflict` | Su evento | **Reemplazar:** bandera de Uruguay reconocible (un conflicto con un país real). |
| `events/event-economic-crisis`, `event-flood-emergency` | Inflación, inundación | **Reemplazar** (estilo plano luminoso; el de inflación tiene gráfico con números). |
| `events/event-corruption-scandal`, `event-election-day`, `event-social-protest`, `event-infrastructure-plan` | Prestadas a 11 eventos, a resultados y a escenarios | **Dejan de usarse** cuando lleguen las nuevas (se pueden borrar). |
| `backgrounds/balcony-casa-rosada-sunset` | Portada y banda del tablero | **Reemplazar** → `PAN-01`, `PAN-04`. |
| `backgrounds/congress-sunrise-panorama` | Fondo de nueva partida (atenuado al 30 %) | **Aceptable.** Reemplazo opcional → `PAN-03` (P3). |
| `backgrounds/balcony-congress-flags` | Terminal electoral (solo celular) | **Reemplazar:** es vertical (941 × 1672) y se recorta en una tira de 112 px; además trae un emblema con forma de logo → `PAN-05`. |
| `backgrounds/bg-casa-rosada-morning`, `bg-map-argentina`, `bg-presidential-office` | Ninguna pantalla (solo `scenarios.ts`, sin componente que las muestre) | **Se publican sin verse** (~240 KB). Las reemplazan las imágenes de niveles; el mapa además tiene texto ilegible. |
| `icons/groups/*` (14) | Retratos de los 18 actores | **Reemplazar todas:** son 14 para 18 actores (Industria y PyMEs comparten; Docentes y Científicos también; Oficialismo, Aliados y Gobernadores, las tres la misma) y 3 tienen fondo blanco → `ACT-01` a `ACT-18`. |
| `icons/categories/*` (7) | Categorías de políticas | **Reemplazar:** 5 con fondo blanco y 2 hexagonales, mezcladas en la misma fila → `CAT-01` a `CAT-07`. |
| `icons/archetypes/*` (4) | Perfiles | **Reemplazar:** el de Político de Raza (perfil por defecto) es plano con fondo blanco; el de Sindicalista muestra una torre → `PER-01` a `PER-04`. |
| `ui/shield-emblem-premium.webp` | Imagen del final con victoria | **Reemplazar:** un ícono plano recortado como si fuera una foto → `RES-05`. |
| `ui/shield-emblem.webp` | Respaldo si un actor no tiene imagen | Deja de hacer falta con los 18 actores. |
| `public/og-image.jpg` | Vista previa al compartir | **Reemplazar** (P2): logo en recuadro blanco sobre ilustración pastel → `PAN-10`. |

**Huecos visuales vistos en las capturas** (escritorio 1440 × 900 y celular 390 × 844, partida completa de dos mandatos):

- **Portada:** una sola ilustración pastel a la derecha; el resto de la página es texto sobre negro liso.
- **Nueva partida:** los cuatro perfiles mezclan estilos (el elegido por defecto es un ícono blanco); los tres niveles son tarjetas de solo texto.
- **Tablero de escritorio:** el "Briefing del país" es una columna de 14 filas de texto; las 16 tarjetas de Economía muestran el mismo ícono de 28 px; "Factores de poder" alterna recuadros blancos con insignias brillantes y repite imágenes; el panel "Congreso de la Nación" y el "Expediente del trimestre" son solo texto.
- **Celular:** la pestaña Acciones abre con tres tarjetas de objetivos sin imagen; la de Actores es una lista larguísima donde la única imagen es la tira recortada de la terminal electoral.
- **Diálogos:** el **cierre de turno** (se ve 32 veces por partida) no tiene imagen; tampoco el de cada política ni el de cada indicador; el del actor muestra un ícono blanco de 80 px; varios eventos muestran una imagen que no corresponde; el final con victoria muestra un ícono recortado, y las seis derrotas, la misma protesta.

## 3. Guía de estilo común

Una sola dirección para todo, pensada para la estética de **sala de situación presidencial** (fondo `#06090D`, paneles azul noche, filetes dorados, tipografías Cinzel / Inter / JetBrains Mono) y para que las imágenes que se conservan (la oficina presidencial, el recinto del Congreso, los seis eventos oscuros) no desentonen.

### 3.1. Técnica

- **Escenas** (fondos, eventos, políticas, actores, niveles, resultados): **pintura digital editorial semirrealista**, tipo ilustración de revista o arte conceptual de cine. Pincelada visible pero formas limpias. No fotografía, no 3D brillante, no anime, no caricatura.
- **Emblemas** (categorías, indicadores, perfiles, objetivos, sellos): **medallón de metal y esmalte**: un único símbolo grande en el centro, aro fino de bronce dorado, campo azul noche, brillos celestes y dorados. Reemplaza a las insignias hexagonales con un tono más sobrio. Siempre con **fondo transparente**.
- **Viñetas** (estados vacíos): un objeto pintado simple, con mucho aire, fondo transparente.
- **Texturas y ornamentos**: casi invisibles, bajo contraste.

### 3.2. Paleta

Tomada de `src/situation-room.css` y `src/components/causal/visuals.ts`.

| Uso | Color | Hex |
|---|---|---|
| Fondo de la app (la imagen tiene que fundirse con esto en los bordes) | Negro azulado | `#06090D` |
| Paneles y diálogos | Azul noche | `#0B1017`, `#101721`, `#16202D` |
| Filetes y bordes | Azul pizarra | `#1E2D40`, `#2C405B` |
| Acento principal (cielo, bandera, luz fría) | Celeste | `#75AADB` |
| Brillos fríos | Celeste claro | `#99C5E8`, `#DCE9F3` |
| Acento institucional (oro, bronce, lámparas) | Bronce | `#C9A96E` |
| Luz cálida principal, sol de mayo | Oro | `#E5BE61` |
| Alerta (usar poco) | Ámbar | `#FBBF24` |
| Positivo (usar poco) | Verde | `#34D399` |
| Crisis (usar poco) | Rojo apagado | `#F87171` |
| Electoral | Violeta | `#C4A0FF` |

Colores de categoría (solo como tinte en íconos y bandas de su categoría): Economía `#55D6A0`, Servicios `#F8AB67`, Instituciones `#C5A3FF`, Infraestructura `#78C3EE`, Desarrollo `#76DBDA`, Seguridad `#86A9FF`, Cultura `#EFD274`.

Regla práctica: **60–70 % de cada escena en tonos oscuros** (azul noche y carbón); la luz cálida dorada como protagonista y el celeste como contraluz.

### 3.3. Luz

- Hora azul, anochecer o noche; interiores con lámpara de escritorio. Mañanas solo para finales felices (victoria) o niveles fáciles, y aun así doradas, no celestes pastel.
- Luz principal cálida (oro `#E5BE61`) y contraluz frío (celeste `#75AADB`). Algo de bruma.
- **Viñeta oscura en los bordes**: la imagen se funde con el panel.
- Crisis y derrotas: más frías y con menos luz, pero sin dramatismo gore.

### 3.4. Encuadre

- Sujeto **centrado** y con **márgenes generosos**: casi todas las imágenes se muestran con `object-fit: cover` y se recortan distinto en escritorio y celular.
- Imágenes 2:1 (eventos, resultados, políticas): lo importante en la **franja horizontal central** (en escritorio se ven a casi 4:1).
- Donde hay texto encima (portada, banda del tablero, finales, niveles) la ficha indica qué zona dejar **oscura y limpia**.
- Retratos de actores: busto, cabeza y hombros en el 60 % central, fondo desenfocado. Tienen que leerse a 40 px.
- Emblemas: símbolo grande y simple que se lea a 20–24 px; el aro ocupa casi todo el cuadro.
- Personas **anónimas y genéricas**, diversas en edad, género y origen; en multitudes, de espaldas o a contraluz. El presidente nunca tiene cara: es el jugador.

### 3.5. Qué evitar (siempre)

- **Texto de cualquier tipo**: letras, números, pancartas legibles, carteles, titulares, gráficos con cifras. Si el generador mete letras, descartar o retocar. (En pancartas, diarios y planillas pedir "blank" / "illegible".)
- **Logos y marcas reales** (bancos, medios, empresas, autos).
- **Caras de políticos reales** o de cualquier persona reconocible. Si un resultado se parece a alguien conocido, descartarlo.
- **Banderas, colores, siglas o símbolos partidarios**, pecheras de agrupaciones, el pañuelo blanco, el puño en alto como consigna.
- **Banderas de otros países** reconocibles (usar banderas genéricas sin diseño). La bandera argentina sí, con moderación y mejor en segundo plano; el escudo nacional detallado no (la IA lo deforma): un sol de mayo simplificado alcanza.
- **Billetes reales**, sangre, armas apuntando, tanques o militares (aun en "ruptura institucional").
- **Mapas de la Argentina generados por IA**: salen con los contornos mal y es un tema sensible (Malvinas, Antártida). Si hace falta un mapa, se arma en SVG con datos del IGN, no con IA.
- Marcas de agua, firmas, bordes blancos, fondos a cuadritos "falsamente transparentes".

### 3.6. Bloques de estilo (en inglés, para pegar al final de cada prompt)

Los prompts de las fichas ya los traen pegados. Están acá por si se quiere escribir un prompt nuevo.

**Bloque ESCENA** (fondos, eventos, políticas, actores, niveles, resultados):

```text
Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

**Bloque EMBLEMA** (categorías, indicadores, perfiles, objetivos, sellos):

```text
Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

**Bloque VIÑETA** (estados vacíos):

```text
Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

**Bloque TEXTURA** (texturas, ornamentos, fondos casi invisibles):

```text
Style: subtle decorative asset for a dark presidential situation-room interface, very low contrast, deep navy and charcoal (#06090D, #0B1017, #101721) with faint sky-blue (#75AADB) and brass gold (#C9A96E) lines, refined and quiet, no focal subject competing with the interface. No text, no letters, no numbers, no logos, no watermark.
```

Consejos para el generador:

- Si admite **imagen de referencia de estilo**, usar `src/assets/images/backgrounds/bg-presidential-office.webp` para escenas y la primera insignia de categoría que salga bien para todos los emblemas: así el juego queda parejo.
- Generar **cada grupo en una misma sesión** (los 18 actores seguidos, los 14 indicadores seguidos) y fijar la semilla si el generador lo permite.
- Si el generador no ofrece la relación de aspecto exacta, usar la más cercana con margen: recortamos nosotros (sujeto centrado).

## 4. Resumen priorizado

- **P1, imprescindible**: lo que hoy se ve mal o falta en las pantallas que todo jugador ve en la primera partida (portada, perfiles, niveles, factores de poder, categorías, cierre de turno, los eventos con imagen equivocada o con texto, elecciones y finales principales).
- **P2**: completa la experiencia (una ilustración por política, indicadores, eventos condicionales, derrotas específicas, bandas, textura, sello, imagen para compartir).
- **P3**: pulido (tutorial, estados vacíos, estrategias, objetivos, ornamentos, escenarios ocultos).

| Grupo | P1 | P2 | P3 | Total a generar | Conservadas |
|---|---:|---:|---:|---:|---:|
| Pantallas, fondos, estados vacíos y modales | 2 | 4 | 13 | **19** | — |
| Actores (los 18 factores de poder) | 18 | 0 | 0 | **18** | — |
| Políticas: categorías y una ilustración por política (45) | 7 | 52 | 0 | **59** | — |
| Indicadores (14 íconos) | 0 | 14 | 0 | **14** | — |
| Eventos (23) | 9 | 8 | 0 | **17** | 6 |
| Perfiles y avatar | 4 | 1 | 0 | **5** | — |
| Niveles y escenarios | 3 | 0 | 2 | **5** | — |
| Resultados: elecciones, legislativas, victoria, derrotas, legado | 6 | 7 | 7 | **20** | — |
| Elementos decorativos | 0 | 2 | 7 | **9** | — |
| **Total** | **49** | **88** | **29** | **166** | 6 |


Índice por prioridad (ids de las fichas):

**P1** (49): `PAN-01`, `PAN-06`, `ACT-01`, `ACT-02`, `ACT-03`, `ACT-04`, `ACT-05`, `ACT-06`, `ACT-07`, `ACT-08`, `ACT-09`, `ACT-10`, `ACT-11`, `ACT-12`, `ACT-13`, `ACT-14`, `ACT-15`, `ACT-16`, `ACT-17`, `ACT-18`, `CAT-01`, `CAT-02`, `CAT-03`, `CAT-04`, `CAT-05`, `CAT-06`, `CAT-07`, `EVT-02`, `EVT-04`, `EVT-06`, `EVT-07`, `EVT-18`, `EVT-19`, `EVT-20`, `EVT-21`, `EVT-22`, `PER-01`, `PER-02`, `PER-03`, `PER-04`, `NIV-01`, `NIV-02`, `NIV-03`, `RES-01`, `RES-02`, `RES-03`, `RES-05`, `RES-06`, `RES-08`.

**P2** (88): `PAN-02`, `PAN-04`, `PAN-05`, `PAN-10`, `CATB-01`, `CATB-02`, `CATB-03`, `CATB-04`, `CATB-05`, `CATB-06`, `CATB-07`, `POL-01`, `POL-02`, `POL-03`, `POL-04`, `POL-05`, `POL-06`, `POL-07`, `POL-08`, `POL-09`, `POL-10`, `POL-11`, `POL-12`, `POL-13`, `POL-14`, `POL-15`, `POL-16`, `POL-17`, `POL-18`, `POL-19`, `POL-20`, `POL-21`, `POL-22`, `POL-23`, `POL-24`, `POL-25`, `POL-26`, `POL-27`, `POL-28`, `POL-29`, `POL-30`, `POL-31`, `POL-32`, `POL-33`, `POL-34`, `POL-35`, `POL-36`, `POL-37`, `POL-38`, `POL-39`, `POL-40`, `POL-41`, `POL-42`, `POL-43`, `POL-44`, `POL-45`, `IND-01`, `IND-02`, `IND-03`, `IND-04`, `IND-05`, `IND-06`, `IND-07`, `IND-08`, `IND-09`, `IND-10`, `IND-11`, `IND-12`, `IND-13`, `IND-14`, `EVT-11`, `EVT-12`, `EVT-13`, `EVT-14`, `EVT-15`, `EVT-16`, `EVT-17`, `EVT-23`, `PER-05`, `RES-04`, `RES-07`, `RES-09`, `RES-10`, `RES-11`, `RES-12`, `RES-13`, `DEC-01`, `DEC-02`.

**P3** (29): `PAN-03`, `PAN-07`, `PAN-T01`, `PAN-T02`, `PAN-T03`, `PAN-T04`, `PAN-08`, `PAN-09`, `VAC-noticias`, `VAC-obras`, `VAC-efectos`, `VAC-busqueda`, `VAC-reunion`, `NIV-04`, `NIV-05`, `EST-01`, `EST-02`, `EST-03`, `EST-04`, `OBJ-01`, `OBJ-02`, `OBJ-03`, `DEC-03`, `DEC-04`, `DEC-05`, `DEC-06`, `DEC-07`, `DEC-08`, `DEC-09`.


## 5. Fichas por imagen

Cada ficha tiene: id, archivo final exacto, dónde aparece, tamaño final y relación de aspecto, formato, prioridad, qué reemplaza, qué debe transmitir y el prompt listo para pegar.

### 5.1. Pantallas, fondos, estados vacíos y modales

#### PAN-01 · Escena de bienvenida

- **Archivo:** `src/assets/images/b-lite/pantallas/bienvenida-hero.webp`
- **Dónde aparece:** `WelcomeScreen` → `.b-welcome-scene` (recuadro derecho de la portada; 555 × 510 en escritorio, ancho completo × 250 en celular; se muestra con opacidad .78 y un epígrafe abajo a la izquierda).
- **Tamaño final:** 1600 × 1200 px · **Relación:** 4:3 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `backgrounds/balcony-casa-rosada-sunset.webp` en la portada (pastel diurno, desentona con la sala oscura).
- **Qué debe transmitir:** Primera imagen que ve el jugador: tiene que decir "Presidencia, de noche, todo por decidir". Dejar el tercio inferior más oscuro y limpio: ahí va el epígrafe "El país espera tus decisiones". El recorte cambia mucho entre escritorio (casi cuadrado) y celular (apaisado): el sujeto bien centrado.
- **Prompt** (bloque ESCENA incluido):

```text
The Casa Rosada presidential palace in Buenos Aires seen from Plaza de Mayo at blue hour, warm lights glowing in a few windows, a tall flagpole with a softly waving Argentine flag, wet paving stones reflecting the lamps, a few anonymous silhouettes crossing the square, a sense of quiet responsibility before a long night of decisions. The lower third of the image is darker and uncluttered for a caption overlay. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-02 · Fondo de la portada

- **Archivo:** `src/assets/images/b-lite/pantallas/bienvenida-fondo.webp`
- **Dónde aparece:** `WelcomeScreen` → fondo de página completo detrás de título y escena (hoy solo un degradado radial de `.situation-room`). Se usaría con opacidad 0,15–0,25.
- **Tamaño final:** 1920 × 1080 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Atmósfera, no protagonista: va casi invisible detrás del texto. Zona izquierda (donde está el título) muy oscura y sin detalle.
- **Prompt** (bloque ESCENA incluido):

```text
A dark presidential situation room seen from a low angle: a large table with a softly glowing map projection, a wall of dim screens with abstract light patterns, empty leather chairs, a single desk lamp. Very low contrast, the left half almost black and empty, details only on the right side, heavy shadows. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-03 · Fondo de nueva partida

- **Archivo:** `src/assets/images/b-lite/pantallas/nueva-partida-fondo.webp`
- **Dónde aparece:** `NewGameScreen` → `.b-new-bg` (fondo fijo detrás del formulario, opacidad .3 + degradado oscuro).
- **Tamaño final:** 1920 × 1080 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** `backgrounds/congress-sunrise-panorama.webp` (amanecer pastel; atenuado funciona, por eso P3).
- **Qué debe transmitir:** Momento de "asumir": el Congreso y la ciudad de noche, en vísperas de la jura. El centro queda tapado por el formulario: el interés en los bordes.
- **Prompt** (bloque ESCENA incluido):

```text
The National Congress building in Buenos Aires at night seen from across the plaza, its green dome softly lit, the avenue with light trails, fog, the night before a presidential inauguration. Main shapes toward the left and right edges, the center calm and dark. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-04 · Banda del tablero (Mandato · Sala de situación)

- **Archivo:** `src/assets/images/b-lite/pantallas/tablero-banda.webp`
- **Dónde aparece:** `CausalDashboard` → `hero` (`.b-mission`): pestaña Gestión en escritorio y pestaña País en celular. Tira de ~780 × 165 (escritorio) y ~360 × 165 (celular), opacidad .32 y degradado desde la izquierda.
- **Tamaño final:** 1600 × 480 px · **Relación:** 10:3 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `backgrounds/balcony-casa-rosada-sunset.webp` en el tablero.
- **Qué debe transmitir:** Encabezado de la gestión. El texto ocupa la mitad izquierda: dejarla oscura; el interés a la derecha.
- **Prompt** (bloque ESCENA incluido):

```text
Panoramic view from inside a dark presidential office toward a tall window: the night city of Buenos Aires and the lit facade of a government palace outside, a desk with folders and a brass lamp in the right half, the left half in deep shadow. Wide cinematic strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-05 · Terminal electoral

- **Archivo:** `src/assets/images/b-lite/pantallas/terminal-electoral.webp`
- **Dónde aparece:** `CivicPanels` → `PoliticalSidebar` (`.b-electoral-panel`, imagen superior de 112 px de alto). Hoy se ve solo en celular (pestaña Actores); en escritorio está oculta por CSS.
- **Tamaño final:** 1200 × 320 px · **Relación:** 15:4 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `backgrounds/balcony-congress-flags.webp` (imagen vertical 941 × 1672 recortada en una tira; además incluye un emblema con forma de logo).
- **Qué debe transmitir:** Encabezado de la proyección de voto: pulso electoral, encuestas, calle. Composición muy apaisada.
- **Prompt** (bloque ESCENA incluido):

```text
Wide strip of a crowd of anonymous citizens at dusk seen from behind and slightly above, many small plain light-blue and white flags without symbols, a glow of screens and stage lights in the distance, a sense of a nation measuring its mood before an election. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-06 · Cierre del turno

- **Archivo:** `src/assets/images/b-lite/pantallas/cierre-turno.webp`
- **Dónde aparece:** `CausalDashboard` → diálogo "Cierre del turno N" (`ReportContent`). Hoy no tiene imagen; iría como banda superior de ~160 px de alto. Aparece al terminar cada turno: es el diálogo más visto del juego.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Cierre de trimestre: carpeta del despacho cerrada y sellada, reloj, informes. Se ve 32 veces por partida: tiene que ser sobria y no cansar.
- **Prompt** (bloque ESCENA incluido):

```text
Close-up of a presidential desk late at night: a closed dossier folder tied with a ribbon and sealed with a red wax seal bearing a small sun, a fountain pen, a brass desk lamp, a few blank report sheets, a wall clock blurred in the background. Calm, end-of-quarter mood. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-07 · Cómo se juega

- **Archivo:** `src/assets/images/b-lite/pantallas/como-se-juega.webp`
- **Dónde aparece:** `Tutorial` → diálogo `HowToPlay` (menú → Cómo se juega). Banda superior.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Invitación a la sala: mesa de situación vacía esperando al jugador.
- **Prompt** (bloque ESCENA incluido):

```text
An empty presidential situation room seen from the doorway: a long table with a softly glowing map projection, chairs waiting, screens with abstract light patterns, a warm lamp at the head of the table inviting someone to sit. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-T01 · Tutorial, paso 1: Elegí qué hacer

- **Archivo:** `src/assets/images/b-lite/pantallas/tutorial-paso-1.webp`
- **Dónde aparece:** `Tutorial` → `TutorialCard` ("Tu primer turno", primer turno de la partida) y `HowToPlay`: viñeta encima de cada paso.
- **Tamaño final:** 480 × 300 px · **Relación:** 8:5 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Ilustra el paso "Elegí qué hacer". Se ve chica (~240 px de ancho): una sola acción, clara.
- **Prompt** (bloque ESCENA incluido):

```text
A hand choosing one folder from a fan of policy dossiers spread on a dark desk, warm lamp light, a few brass tokens beside them. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-T02 · Tutorial, paso 2: Mirá el país

- **Archivo:** `src/assets/images/b-lite/pantallas/tutorial-paso-2.webp`
- **Dónde aparece:** `Tutorial` → `TutorialCard` ("Tu primer turno", primer turno de la partida) y `HowToPlay`: viñeta encima de cada paso.
- **Tamaño final:** 480 × 300 px · **Relación:** 8:5 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Ilustra el paso "Mirá el país". Se ve chica (~240 px de ancho): una sola acción, clara.
- **Prompt** (bloque ESCENA incluido):

```text
A glowing map table of a country seen from above with small light points and soft gauges around it, an advisor's hands pointing at one region. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-T03 · Tutorial, paso 3: Cuidá a los actores

- **Archivo:** `src/assets/images/b-lite/pantallas/tutorial-paso-3.webp`
- **Dónde aparece:** `Tutorial` → `TutorialCard` ("Tu primer turno", primer turno de la partida) y `HowToPlay`: viñeta encima de cada paso.
- **Tamaño final:** 480 × 300 px · **Relación:** 8:5 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Ilustra el paso "Cuidá a los actores". Se ve chica (~240 px de ancho): una sola acción, clara.
- **Prompt** (bloque ESCENA incluido):

```text
A round negotiation table seen from above with diverse anonymous representatives (a worker with a hard hat, a businesswoman, a farmer, a student) sitting around it. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-T04 · Tutorial, paso 4: Cerrá el turno

- **Archivo:** `src/assets/images/b-lite/pantallas/tutorial-paso-4.webp`
- **Dónde aparece:** `Tutorial` → `TutorialCard` ("Tu primer turno", primer turno de la partida) y `HowToPlay`: viñeta encima de cada paso.
- **Tamaño final:** 480 × 300 px · **Relación:** 8:5 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Ilustra el paso "Cerrá el turno". Se ve chica (~240 px de ancho): una sola acción, clara.
- **Prompt** (bloque ESCENA incluido):

```text
A hand pressing a brass seal onto a closed dossier, a clock blurred in the background, the end of a working night. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-08 · Contanos cómo te fue

- **Archivo:** `src/assets/images/b-lite/pantallas/opinion.webp`
- **Dónde aparece:** `FeedbackForm` → diálogo del formulario de opinión (menú y final de la partida). Banda superior.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Cartas de ciudadanos que llegan al despacho: el jugador ahora es el que escribe.
- **Prompt** (bloque ESCENA incluido):

```text
A pile of handwritten letters and envelopes from citizens on a presidential desk under a warm lamp, the handwriting blurred and illegible, a fountain pen resting on top. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-09 · Pantalla de error

- **Archivo:** `src/assets/images/b-lite/pantallas/error.webp`
- **Dónde aparece:** `ErrorBoundary` → pantalla "Algo salió mal".
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Tono amable, no dramático: un corte de luz en la sala, se resuelve.
- **Prompt** (bloque ESCENA incluido):

```text
A presidential office during a brief power outage, lit only by a flashlight beam and a candle on the desk, papers neatly stacked, calm and slightly humorous mood, the city outside also dark. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### PAN-10 · Imagen para compartir (OG)

- **Archivo:** `public/og-image-lite.jpg`
- **Dónde aparece:** `index.html` → `og:image` (vista previa al compartir el enlace en WhatsApp, redes, etc.). El logotipo GobernArg se superpone después, no lo genera la IA.
- **Tamaño final:** 1200 × 630 px · **Relación:** 1,91:1 · **Formato:** jpg (calidad 82, ≤ 120 KB) · **Prioridad:** P2
- **Reemplaza:** `public/og-image.jpg` (logo en un recuadro blanco sobre una ilustración pastel).
- **Qué debe transmitir:** Dejar el centro-izquierda oscuro y vacío para poner encima el logotipo y "Lite". Es lo que ve quien todavía no jugó.
- **Prompt** (bloque ESCENA incluido):

```text
Wide panoramic illustration of Plaza de Mayo and the Casa Rosada at blue hour with an Argentine flag on a tall pole on the right, warm window lights, the center-left area dark, calm and empty to receive a logo overlay later. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### VAC-noticias · Estado vacío: Sin noticias

- **Archivo:** `src/assets/images/b-lite/pantallas/vacios/vacio-noticias.png`
- **Dónde aparece:** `CivicPanels` → "Noticias y avisos" cuando no hay avisos ("No hay noticias pendientes").
- **Tamaño final:** 480 × 320 px · **Relación:** 3:2 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy solo texto gris).
- **Qué debe transmitir:** Se muestra a ~160 px de ancho, centrada sobre el texto del estado vacío. Un objeto, nada más.
- **Prompt** (bloque VIÑETA incluido):

```text
A quiet vintage teleprinter with a blank paper strip curling out of it. Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

#### VAC-obras · Estado vacío: Sin obras

- **Archivo:** `src/assets/images/b-lite/pantallas/vacios/vacio-obras.png`
- **Dónde aparece:** `CivicPanels` → `ProjectReports` ("Informes de obras") antes de iniciar una obra.
- **Tamaño final:** 480 × 320 px · **Relación:** 3:2 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy solo texto gris).
- **Qué debe transmitir:** Se muestra a ~160 px de ancho, centrada sobre el texto del estado vacío. Un objeto, nada más.
- **Prompt** (bloque VIÑETA incluido):

```text
A rolled blueprint tied with a string next to a small folded hard hat. Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

#### VAC-efectos · Estado vacío: Sin efectos futuros

- **Archivo:** `src/assets/images/b-lite/pantallas/vacios/vacio-efectos.png`
- **Dónde aparece:** `CausalDashboard` → "Efectos y compromisos futuros" (pestaña Tesoro) antes de ejecutar políticas.
- **Tamaño final:** 480 × 320 px · **Relación:** 3:2 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy solo texto gris).
- **Qué debe transmitir:** Se muestra a ~160 px de ancho, centrada sobre el texto del estado vacío. Un objeto, nada más.
- **Prompt** (bloque VIÑETA incluido):

```text
An hourglass with all its sand still on top, beside a closed blank calendar block. Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

#### VAC-busqueda · Estado vacío: Búsqueda sin resultados

- **Archivo:** `src/assets/images/b-lite/pantallas/vacios/vacio-busqueda.png`
- **Dónde aparece:** `PolicyPanel` → "No hay políticas que coincidan con la búsqueda".
- **Tamaño final:** 480 × 320 px · **Relación:** 3:2 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy solo texto gris).
- **Qué debe transmitir:** Se muestra a ~160 px de ancho, centrada sobre el texto del estado vacío. Un objeto, nada más.
- **Prompt** (bloque VIÑETA incluido):

```text
A magnifying glass resting over an open empty folder. Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

#### VAC-reunion · Estado vacío: Sin reunión con el actor

- **Archivo:** `src/assets/images/b-lite/pantallas/vacios/vacio-reunion.png`
- **Dónde aparece:** `ActorPanel` → `ActorDetails`, sección "Reunión e información" ("Todavía no te reuniste con este actor").
- **Tamaño final:** 480 × 320 px · **Relación:** 3:2 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy solo texto gris).
- **Qué debe transmitir:** Se muestra a ~160 px de ancho, centrada sobre el texto del estado vacío. Un objeto, nada más.
- **Prompt** (bloque VIÑETA incluido):

```text
Two empty chairs facing each other across a small round table with a single coffee cup. Style: small spot illustration for an empty state in a dark user interface, one simple object or tiny scene, painted with soft flat shapes in deep navy and slate (#16202D, #2C405B) with brass gold (#C9A96E) and sky-blue (#75AADB) highlights, gentle rim light, minimal detail, generous empty space around it, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000). No text, no letters, no numbers, no logos.
```

### 5.2. Actores (los 18 factores de poder)

Los 18 actores pasan a tener **retrato propio** (hoy 7 comparten imagen). Todos con el mismo encuadre: busto de un arquetipo anónimo del sector, con uno o dos objetos que lo identifiquen y un fondo oscuro desenfocado. Los cuatro actores políticos (oficialismo, aliados, oposición, gobernadores) se distinguen por escenario y luz, nunca por colores partidarios.

#### ACT-01 · Industria y grandes empresas

- **Archivo:** `src/assets/images/b-lite/actores/industria.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Producción. Canal: Inversión ejecutada.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-business.webp` (fondo blanco; compartida con PyMEs).
- **Qué debe transmitir:** Poder económico concentrado, inversión. Que no sea un villano: es un actor que mide si invierte o no. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a middle-aged industrial executive in a dark suit holding a white hard hat under one arm, standing in front of a softly blurred factory floor with steel beams and distant warm welding sparks. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-02 · Sector agropecuario

- **Archivo:** `src/assets/images/b-lite/actores/agro.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Producción. Canal: Oferta exportable.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-agriculture.webp` (fondo blanco).
- **Qué debe transmitir:** Campo productivo y exportador. Ni postal turística ni protesta. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a weathered farmer in a work shirt and cap, holding a few ears of wheat, standing in front of vast soybean fields at dusk with the silhouette of a combine harvester and a grain silo far away. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-03 · Sector financiero

- **Archivo:** `src/assets/images/b-lite/actores/financiero.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Producción. Canal: Oferta de crédito.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-financial.webp`.
- **Qué debe transmitir:** Crédito y confianza. Frío, prolijo, de vidrio. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a banker in a tailored dark suit standing in a glass-walled office tower at night, blurred trading screens behind showing only abstract glowing lines, cool blue light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-04 · Sindicatos

- **Archivo:** `src/assets/images/b-lite/actores/sindicatos.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Trabajo. Canal: Conflicto laboral.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-workers.webp` (fondo blanco).
- **Qué debe transmitir:** Fuerza organizada del trabajo. Firme, no agresiva. Sin siglas ni pecheras con nombres. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a union delegate in a work jacket with reflective stripes, arms crossed, calm and firm expression, a blurred crowd of workers with plain unmarked light-blue banners behind. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-05 · PyMEs y comercio

- **Archivo:** `src/assets/images/b-lite/actores/pymes.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Producción. Canal: Contratación y actividad local.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-business.webp` (repetida con Industria).
- **Qué debe transmitir:** El comercio de barrio y el pequeño taller. Cercanía. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a small shop owner woman in an apron standing at the doorway of her neighborhood store, the metal roll-up shutter half open, warm light from inside, a quiet street at dusk. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-06 · Hogares de ingresos medios

- **Archivo:** `src/assets/images/b-lite/actores/clase_media.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Hogares. Canal: Componente electoral.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-middle-class.webp`.
- **Qué debe transmitir:** El votante promedio: hace cuentas, compra, espera. Es el actor de más peso electoral. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a middle-aged parent carrying a grocery bag and house keys, standing in front of a row of apartment buildings with lit windows at dusk, a slightly worried but hopeful look. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-07 · Cooperativas y economía social

- **Archivo:** `src/assets/images/b-lite/actores/cooperativas.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Trabajo. Canal: Redes de contención.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-cooperatives.webp`.
- **Qué debe transmitir:** Trabajo autogestionado, comunidad. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a cooperative worker woman wearing work gloves and holding a crate of recycled materials, a community workshop with other members working in the background, warm light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-08 · Estudiantes

- **Archivo:** `src/assets/images/b-lite/actores/estudiantes.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Conocimiento. Canal: Movilización estudiantil.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-students.webp`.
- **Qué debe transmitir:** Juventud universitaria, energía, reclamo posible. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a young university student with a backpack and a folder of notes, standing in a classical university corridor with columns at night, other students blurred behind. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-09 · Docentes

- **Archivo:** `src/assets/images/b-lite/actores/docentes.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Conocimiento. Canal: Continuidad educativa.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-academics.webp` (repetida con Científicos).
- **Qué debe transmitir:** Escuela pública, vocación, cansancio. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a schoolteacher holding a stack of exercise books, a classroom behind with a blank chalkboard and small desks, late afternoon light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-10 · Científicos e investigadores

- **Archivo:** `src/assets/images/b-lite/actores/cientificos.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Conocimiento. Canal: Continuidad de equipos.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-academics.webp` (repetida con Docentes).
- **Qué debe transmitir:** Investigación pública, laboratorio, continuidad. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a researcher in a white lab coat and safety glasses holding a glowing test tube, a laboratory with microscopes behind, cool blue light with a warm accent. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-11 · Organizaciones sociales

- **Archivo:** `src/assets/images/b-lite/actores/organizaciones.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Sociedad civil. Canal: Contención y movilización.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-low-income.webp` (puño en alto).
- **Qué debe transmitir:** Comedor, barrio, organización territorial. Dignidad, no miseria. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a community organizer woman wearing a plain vest without lettering, standing in a neighborhood community kitchen with steaming pots and volunteers behind, warm light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-12 · Organizaciones de derechos

- **Archivo:** `src/assets/images/b-lite/actores/ddhh.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Sociedad civil. Canal: Control institucional.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-ngo.webp`.
- **Qué debe transmitir:** Control del poder, debido proceso, memoria. Evitar el pañuelo blanco: es el símbolo de organizaciones concretas. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a human rights lawyer in a simple dark coat holding a thick case file, a quiet candlelight vigil blurred in the background, serious and serene expression. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-13 · Organizaciones ambientales

- **Archivo:** `src/assets/images/b-lite/actores/ambientalistas.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Sociedad civil. Canal: Condiciones de viabilidad.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-environmentalists.webp`.
- **Qué debe transmitir:** Ambiente y viabilidad de los proyectos, no folclore. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a young environmental activist holding a native tree seedling with soil on the hands, a wetland and forest landscape at dusk behind. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-14 · Sector cultural

- **Archivo:** `src/assets/images/b-lite/actores/cultura.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Sociedad civil. Canal: Agenda y deliberación.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-artists.webp`.
- **Qué debe transmitir:** Cultura y debate público. El bandoneón da identidad argentina sin caer en la postal. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a musician holding a bandoneon, standing on a small theater stage with a dark red curtain and a single spotlight, empty seats blurred behind. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-15 · Oficialismo / partido propio

- **Archivo:** `src/assets/images/b-lite/actores/oficialismo.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Política. Canal: Disciplina de bancada.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-allies.webp` (repetida con Aliados y Gobernadores).
- **Qué debe transmitir:** El propio bloque. Sin colores partidarios: lo distingue la luz cálida y el gesto de respaldo. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a loyal ruling-party legislator in a dark suit standing at a congress bench and raising a hand to vote, the semicircular chamber blurred behind, warm golden light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-16 · Aliados / coalición

- **Archivo:** `src/assets/images/b-lite/actores/aliados.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Política. Canal: Cooperación parlamentaria.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-allies.webp`.
- **Qué debe transmitir:** Socio de coalición: acompaña pero negocia. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a coalition partner legislator woman in a grey suit, one hand extended as if offering a handshake, a congress lobby with marble columns behind, balanced warm and cool light. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-17 · Oposición democrática

- **Archivo:** `src/assets/images/b-lite/actores/oposicion.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Política. Canal: Negociación institucional.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-opposition.webp`.
- **Qué debe transmitir:** Oposición institucional, no enemigo. Luz más fría que el oficialismo. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of an opposition legislator in a navy suit standing and speaking with a firm hand gesture, the congress benches blurred behind, cooler blue lighting. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### ACT-18 · Gobernadores y provincias

- **Archivo:** `src/assets/images/b-lite/actores/gobernadores.webp`
- **Dónde aparece:** `ActorPanel` → lista "Factores de poder" (miniatura 40 × 40, columna derecha en escritorio y pestaña Actores en celular) y `ActorDetails` (diálogo del actor: hoy 80 × 80, se propone 160 × 160). Familia: Política. Canal: Ejecución federal.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `icons/groups/group-allies.webp` (repetida).
- **Qué debe transmitir:** Poder territorial, federalismo. Paisaje del interior, no Buenos Aires. Retrato de busto, cara y hombros ocupando el 60 % central, fondo oscuro y desenfocado: tiene que leerse a 40 px. La persona es un arquetipo anónimo, no alguien reconocible.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of a provincial governor in a suit without tie standing on the steps of a provincial government house, Andes mountains and vineyards at dusk in the far background. Head and shoulders fill the central 60 % of a square frame, background dark and softly blurred so the figure reads clearly at thumbnail size. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

### 5.3. Políticas: categorías y una ilustración por política (45)

Primero los **7 íconos de categoría** (P1: arreglan los recuadros blancos de la grilla) y las **7 bandas de categoría** (P2: sirven de respaldo para cualquier política que todavía no tenga ilustración). Después, **una ilustración por cada una de las 45 políticas**, sin agrupar: en la Lite la grilla de políticas es el corazón del juego, y con una imagen por categoría las 16 tarjetas de Economía se seguirían viendo iguales. Si hay que recortar, el orden sugerido es: primero Economía (es la categoría que se abre por defecto), después Infraestructura y Servicios; las que falten usan la banda de su categoría.

Los dos préstamos (`prestamo_internacional` y `prestamo_local`) y `reestructurar_deuda` son parecidos: se diferenciaron a propósito (organismo externo / sucursal local / reloj de arena) para que el jugador distinga de un vistazo deuda externa, deuda local y reperfilamiento.

#### CAT-01 · Ícono de categoría: Economía

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/economia.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-economy.webp` (fondo blanco: se ve como un recuadro blanco sobre el panel oscuro).
- **Qué debe transmitir:** Categoría con 16 políticas. El brillo interior toma el color de la categoría en la interfaz (#55D6A0) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a rising bar chart crossed by a single coin. Use #55D6A0 as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-02 · Ícono de categoría: Servicios

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/servicios.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-social.webp` (fondo blanco: se ve como un recuadro blanco sobre el panel oscuro).
- **Qué debe transmitir:** Categoría con 7 políticas. El brillo interior toma el color de la categoría en la interfaz (#F8AB67) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of two open hands holding a small house with a heart. Use #F8AB67 as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-03 · Ícono de categoría: Instituciones

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/instituciones.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-government.webp` (fondo blanco: se ve como un recuadro blanco sobre el panel oscuro).
- **Qué debe transmitir:** Categoría con 3 políticas. El brillo interior toma el color de la categoría en la interfaz (#C5A3FF) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a classical building with columns and a dome. Use #C5A3FF as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-04 · Ícono de categoría: Infraestructura

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/infraestructura.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-infrastructure-bridge.webp` (fondo blanco: se ve como un recuadro blanco sobre el panel oscuro).
- **Qué debe transmitir:** Categoría con 10 políticas. El brillo interior toma el color de la categoría en la interfaz (#78C3EE) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a suspension bridge with a power pylon behind it. Use #78C3EE as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-05 · Ícono de categoría: Desarrollo

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/desarrollo.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-technology.webp`.
- **Qué debe transmitir:** Categoría con 3 políticas. El brillo interior toma el color de la categoría en la interfaz (#76DBDA) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a microchip with a small glowing lightbulb in its center. Use #76DBDA as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-06 · Ícono de categoría: Seguridad

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/seguridad.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-security.webp` (fondo blanco: se ve como un recuadro blanco sobre el panel oscuro).
- **Qué debe transmitir:** Categoría con 4 políticas. El brillo interior toma el color de la categoría en la interfaz (#86A9FF) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a shield with a small lantern in its center. Use #86A9FF as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CAT-07 · Ícono de categoría: Cultura

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/cultura.png`
- **Dónde aparece:** `PolicyPanel` → botones de categoría (ícono de 20 px) y tarjeta de cada política (28 px, arriba a la izquierda). Mapeo en `visuals.ts` (`CATEGORY_VISUALS`).
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/categories/category-culture.webp`.
- **Qué debe transmitir:** Categoría con 2 políticas. El brillo interior toma el color de la categoría en la interfaz (#EFD274) para que el ícono y el borde izquierdo de la tarjeta coincidan.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of two theater masks with a small sun above them. Use #EFD274 as the accent color of the inner glow and of the symbol highlights. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### CATB-01 · Banda de categoría: Economía

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/economia-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 16 políticas de Economía. Un leve tinte del color de la categoría (#55D6A0) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A central economic ministry at night: advisors around a table covered with blank reports, a large window to the city, abstract glowing charts on a wall screen. Subtle #55D6A0 tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-02 · Banda de categoría: Servicios

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/servicios-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 7 políticas de Servicios. Un leve tinte del color de la categoría (#F8AB67) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A neighborhood at dusk with a school, a health center and a housing block lit up, families walking, public services working. Subtle #F8AB67 tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-03 · Banda de categoría: Instituciones

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/instituciones-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 3 políticas de Instituciones. Un leve tinte del color de la categoría (#C5A3FF) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
The facade of a historic courthouse and congress-like building at night with warm lit columns, people entering for a public hearing. Subtle #C5A3FF tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-04 · Banda de categoría: Infraestructura

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/infraestructura-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 10 políticas de Infraestructura. Un leve tinte del color de la categoría (#78C3EE) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A large bridge, a highway and power lines crossing a river valley at dusk, construction cranes and work lights. Subtle #78C3EE tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-05 · Banda de categoría: Desarrollo

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/desarrollo-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 3 políticas de Desarrollo. Un leve tinte del color de la categoría (#76DBDA) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A science and technology campus at night with lit laboratories, a satellite dish and researchers walking. Subtle #76DBDA tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-06 · Banda de categoría: Seguridad

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/seguridad-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 4 políticas de Seguridad. Un leve tinte del color de la categoría (#86A9FF) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A calm city neighborhood at night with well-lit streets, a patrol car with soft blue lights parked, residents walking safely. Subtle #86A9FF tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### CATB-07 · Banda de categoría: Cultura

- **Archivo:** `src/assets/images/b-lite/politicas/categorias/cultura-banda.webp`
- **Dónde aparece:** `PolicyPanel` → encabezado de la lista cuando se elige esa categoría, y respaldo del diálogo `PolicyDetails` para las políticas que todavía no tengan ilustración propia.
- **Tamaño final:** 1200 × 400 px · **Relación:** 3:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hueco).
- **Qué debe transmitir:** Resume las 2 políticas de Cultura. Un leve tinte del color de la categoría (#EFD274) en las luces.
- **Prompt** (bloque ESCENA incluido):

```text
A historic theater and public library at night with people entering, warm light spilling onto the sidewalk. Subtle #EFD274 tint in the highlights. Wide strip composition. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-01 · Financiamiento monetario

- **Archivo:** `src/assets/images/b-lite/politicas/emitir_dinero.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Financiamiento monetario" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Liquidez rápida con riesgo inflacionario. Que se sienta la tentación y el peligro. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A dim printing hall at night where a large press rolls out uncut sheets of blank banknote paper without any design or numbers, a lone official watching, warm lamp light and long shadows. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-02 · Modernizar la recaudación

- **Archivo:** `src/assets/images/b-lite/politicas/mejorar_recaudacion.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Modernizar la recaudación" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Gestión moderna, sin persecución. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A modern tax administration office at night, a few civil servants at desks with monitors showing abstract glowing bar charts and flow diagrams, orderly archive shelves, calm blue screen light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-03 · Programa industrial temporal

- **Archivo:** `src/assets/images/b-lite/politicas/subsidios_industriales.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Programa industrial temporal" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Reconversión de fábricas con apoyo estatal. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Inside a factory being retooled: a worker and an engineer beside a new machine under installation, protective plastic still on parts, distant welding sparks, warm industrial light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-04 · Reforma tributaria recaudatoria

- **Archivo:** `src/assets/images/b-lite/politicas/reforma_impositiva.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Reforma tributaria recaudatoria" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Ley de peso, debate parlamentario. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A parliamentary committee room in the evening: a long table with stacks of blank documents and a brass balance scale in the center, hands of legislators gesturing in debate. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-05 · Facilitación exportadora

- **Archivo:** `src/assets/images/b-lite/politicas/incentivos_exportacion.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Facilitación exportadora" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Logística, puertos, salida al mundo. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A river container port at dusk, gantry cranes loading plain unmarked containers onto a cargo ship, trucks waiting in line, warm sodium lights reflected on the water. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-06 · Acuerdo temporal de precios

- **Archivo:** `src/assets/images/b-lite/politicas/control_precios.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Acuerdo temporal de precios" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Acuerdo verificable en góndola, no represión. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A neighborhood supermarket aisle at night with neatly stocked shelves and blank price tags, a store manager and a government inspector reviewing a clipboard together. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-07 · Salarios públicos y piso salarial

- **Archivo:** `src/assets/images/b-lite/politicas/aumento_salarial.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Salarios públicos y piso salarial" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Negociación salarial cerrada con acuerdo. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Late-night negotiation room: a union delegate and a government official shaking hands across a table with blank documents and coffee cups, tired but relieved faces partly in shadow. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-08 · Ajuste de programas y planteles

- **Archivo:** `src/assets/images/b-lite/politicas/reduccion_gasto.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Ajuste de programas y planteles" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Ajuste: oficina que se vacía. Sobrio, sin burla. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
An austere government office being downsized: half-empty desks, stacked chairs, cardboard boxes with files, a single lamp still on, cold bluish light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-09 · Préstamo externo a ocho turnos

- **Archivo:** `src/assets/images/b-lite/politicas/prestamo_internacional.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Préstamo externo a ocho turnos" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Firma con organismo externo: plata hoy, deuda mañana. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Two delegations signing a loan agreement at a polished table in an international conference room, generic unmarked flags in the background, a fountain pen over a blank contract. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-10 · Préstamo local a seis turnos

- **Archivo:** `src/assets/images/b-lite/politicas/prestamo_local.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Préstamo local a seis turnos" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Crédito con bancos locales, más chico y cercano que el externo. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A local bank branch after hours, a treasury official and a banker reviewing a blank contract at a desk, a vault door half open in the background, warm lamp. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-11 · Garantías para inversión productiva

- **Archivo:** `src/assets/images/b-lite/politicas/atraccion_inversiones.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Garantías para inversión productiva" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Proyecto productivo en preparación. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Architects and investors around a scale model of a new industrial plant on a table, rolled blueprints and hard hats beside it, evening light from a large window. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-12 · Acuerdo de apertura comercial

- **Archivo:** `src/assets/images/b-lite/politicas/tratado_comercio.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Acuerdo de apertura comercial" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Apertura: mercados y competencia importada. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Two trade delegations at a long negotiation table with stacked blank folders, a cargo ship visible through a large window behind them, generic unmarked flags. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-13 · Garantías de crédito PyME

- **Archivo:** `src/assets/images/b-lite/politicas/credito_pyme.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Garantías de crédito PyME" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Crédito que llega al taller chico. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A small metal workshop owner receiving a new machine delivered on a pallet, a bank advisor with a folder smiling beside him, warm workshop light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-14 · Programa de estabilización monetaria

- **Archivo:** `src/assets/images/b-lite/politicas/estabilizacion_monetaria.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Programa de estabilización monetaria" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Anclaje y calma: la curva que se aplana. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
An economic team in a central bank meeting room at night around an oval table, a large screen showing a smooth abstract line flattening out, calm focused atmosphere. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-15 · Alivio tributario temporal

- **Archivo:** `src/assets/images/b-lite/politicas/alivio_tributario.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Alivio tributario temporal" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Respiro para el contribuyente. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A shop owner lifting the metal shutter of her store in the early morning, golden light flooding in, a lighter mood, a neat stack of blank forms on the counter. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-16 · Reperfilar un vencimiento

- **Archivo:** `src/assets/images/b-lite/politicas/reestructurar_deuda.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Reperfilar un vencimiento" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Economía.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Economía para todas las políticas de la categoría).
- **Qué debe transmitir:** Ganar tiempo con el acreedor. El reloj de arena es la idea. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Negotiators and creditors at a long dim table with a large hourglass in the center and blank contracts, tense but civil atmosphere. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-17 · Plan federal de vivienda

- **Archivo:** `src/assets/images/b-lite/politicas/plan_viviendas.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Plan federal de vivienda" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Viviendas que se construyen y familias que esperan. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A social housing construction site at dusk on the edge of a city, workers laying bricks, a crane, a family watching the new homes from a dirt road. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-18 · Plan educativo y formación docente

- **Archivo:** `src/assets/images/b-lite/politicas/programa_educativo.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Plan educativo y formación docente" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Aula con materiales nuevos. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A primary school classroom at golden hour, a teacher handing out new books to children, a blank chalkboard, warm light through tall windows. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-19 · Atención primaria y prevención

- **Archivo:** `src/assets/images/b-lite/politicas/salud_preventiva.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Atención primaria y prevención" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Centro de salud de barrio. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A neighborhood primary care center, a nurse taking the blood pressure of an elderly man, a vaccine fridge and clean shelves, soft warm light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-20 · Formación e inserción laboral

- **Archivo:** `src/assets/images/b-lite/politicas/empleo_joven.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Formación e inserción laboral" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Primer empleo, oficio. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Young apprentices in a technical training workshop learning to use tools with an instructor, workbenches, sparks of light, focused faces. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-21 · Cobertura social y cuidados

- **Archivo:** `src/assets/images/b-lite/politicas/cobertura_social.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Cobertura social y cuidados" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Cuidado de mayores y dependientes. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A home caregiver helping an elderly woman stand up from an armchair, a social worker with a folder at the door, cozy warm lamp light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-22 · Alfabetización y educación comunitaria

- **Archivo:** `src/assets/images/b-lite/politicas/alfabetizacion.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Alfabetización y educación comunitaria" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Adultos aprendiendo a leer. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
An adult literacy class in a community center at night, adults of different ages writing in notebooks with illegible handwriting, a volunteer teacher, a single warm lamp. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-23 · Asistencia alimentaria de emergencia

- **Archivo:** `src/assets/images/b-lite/politicas/programa_alimentario.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Asistencia alimentaria de emergencia" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Servicios.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Servicios para todas las políticas de la categoría).
- **Qué debe transmitir:** Emergencia alimentaria, dignidad. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A community kitchen serving hot meals, volunteers ladling stew from large pots, steam rising, people waiting in an orderly line, warm light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-24 · Igualdad, cuidados y acceso a derechos

- **Archivo:** `src/assets/images/b-lite/politicas/igualdad_genero.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Igualdad, cuidados y acceso a derechos" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Instituciones.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Instituciones para todas las políticas de la categoría).
- **Qué debe transmitir:** Atención y cuidados, sin símbolos partidarios ni pañuelos de color. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A community care and rights center: a counselor listening to a woman at a small table, a daycare corner with toys in the background, warm welcoming light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-25 · Justicia y control de legalidad

- **Archivo:** `src/assets/images/b-lite/politicas/fortalecimiento_justicia.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Justicia y control de legalidad" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Instituciones.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Instituciones para todas las políticas de la categoría).
- **Qué debe transmitir:** Tribunal, debido proceso. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
An empty courtroom in a historic courthouse at dusk, the judge's bench, a statue of the scales of justice, case files on a table, warm light through tall windows. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-26 · Transparencia y compras abiertas

- **Archivo:** `src/assets/images/b-lite/politicas/transparencia_publica.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Transparencia y compras abiertas" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Instituciones.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Instituciones para todas las políticas de la categoría).
- **Qué debe transmitir:** Estado de vidrio. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A public records office with glass walls, citizens consulting large screens that show abstract document icons, open filing cabinets, bright and clear light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-27 · Transporte público metropolitano

- **Archivo:** `src/assets/images/b-lite/politicas/transporte_publico.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Transporte público metropolitano" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Tren urbano en hora pico. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A metropolitan commuter train arriving at a station platform at dusk, commuters waiting, overhead lights, slight motion blur. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-28 · Transición energética

- **Archivo:** `src/assets/images/b-lite/politicas/energia_renovable.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Transición energética" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Viento patagónico, energía limpia. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A wind farm and solar panels on the Patagonian steppe at dusk, turbines silhouetted against a deep blue sky, a technician walking toward one of them. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-29 · Red hospitalaria federal

- **Archivo:** `src/assets/images/b-lite/politicas/construccion_hospitales.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Red hospitalaria federal" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Hospital nuevo, recién inaugurado. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A newly built modern hospital at night with lit windows, an ambulance at the entrance, a construction crane being dismantled at the side. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-30 · Conectividad y acceso digital

- **Archivo:** `src/assets/images/b-lite/politicas/plan_conectividad.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Conectividad y acceso digital" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Fibra que llega al pueblo. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A technician on a ladder installing a fiber-optic cable on a pole in a small rural town at dusk, a school in the background with children around lit computer screens. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-31 · Restauración de ecosistemas

- **Archivo:** `src/assets/images/b-lite/politicas/reforestacion.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Restauración de ecosistemas" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Monte nativo que vuelve. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Volunteers planting native tree saplings on a recovered hillside, rows of young trees, misty early light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-32 · Corredores viales productivos

- **Archivo:** `src/assets/images/b-lite/politicas/infraestructura_vial.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Corredores viales productivos" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Ruta nueva en la llanura. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A newly paved highway crossing the Pampas at dusk, trucks with headlights, a road crew finishing the last section. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-33 · Agua segura y resiliencia hídrica

- **Archivo:** `src/assets/images/b-lite/politicas/plan_hidrico.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Agua segura y resiliencia hídrica" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Agua tratada y canales contra la sequía. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A water treatment plant with clear basins, an engineer checking valves, a canal carrying water toward dry fields on the horizon. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-34 · Transición de redes de gas

- **Archivo:** `src/assets/images/b-lite/politicas/red_gas.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Transición de redes de gas" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Gasoducto: energía con costo ambiental. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Workers laying a large natural gas pipeline across a dry landscape at dusk, welding sparks, long pipe sections lined up. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-35 · Estudiar un proyecto nacional

- **Archivo:** `src/assets/images/b-lite/politicas/estudio_factibilidad.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Estudiar un proyecto nacional" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Antes de la obra: planos, mediciones. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Engineers studying large blueprints and a topographic map on a light table at night, a surveyor's theodolite on a tripod beside them. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-36 · Mantenimiento de redes federales

- **Archivo:** `src/assets/images/b-lite/politicas/mantenimiento_urbano.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Mantenimiento de redes federales" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Infraestructura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Infraestructura para todas las políticas de la categoría).
- **Qué debe transmitir:** Reparar lo que hay: obra nocturna. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A night crew repairing a city water main and street lights, orange work lights, safety barriers, a few passers-by. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-37 · Cooperación científica internacional

- **Archivo:** `src/assets/images/b-lite/politicas/cooperacion_internacional.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Cooperación científica internacional" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Desarrollo.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Desarrollo para todas las políticas de la categoría).
- **Qué debe transmitir:** Ciencia compartida con socios externos. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Scientists from different countries assembling a satellite component together in a clean room, white suits, soft blue light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-38 · Transferencia tecnológica productiva

- **Archivo:** `src/assets/images/b-lite/politicas/desarrollar_tecnologia.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Transferencia tecnológica productiva" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Desarrollo.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Desarrollo para todas las políticas de la categoría).
- **Qué debe transmitir:** Del laboratorio a la fábrica. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Engineers in a technology transfer lab demonstrating a prototype robotic arm to a factory manager, mixed blue and warm light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-39 · Sostener equipos científicos

- **Archivo:** `src/assets/images/b-lite/politicas/carrera_cientifica.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Sostener equipos científicos" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Desarrollo.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Desarrollo para todas las políticas de la categoría).
- **Qué debe transmitir:** Continuidad de equipos jóvenes. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Young researchers working late in a university lab with microscopes and notebooks, an older mentor guiding them, cool blue light with a warm desk lamp. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-40 · Operativo federal focalizado

- **Archivo:** `src/assets/images/b-lite/politicas/seguridad_ciudadana.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Operativo federal focalizado" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Seguridad.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Seguridad para todas las políticas de la categoría).
- **Qué debe transmitir:** Presencia federal ordenada, sin violencia. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Federal police officers patrolling a lit neighborhood street at night in an orderly way, a patrol car with soft blue lights, residents in the background. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-41 · Investigación de redes criminales

- **Archivo:** `src/assets/images/b-lite/politicas/lucha_narcotrafico.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Investigación de redes criminales" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Seguridad.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Seguridad para todas las políticas de la categoría).
- **Qué debe transmitir:** Investigación, no balacera. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Investigators in a dark operations room studying a wall board of anonymous silhouettes connected by strings and documents, a desk lamp and case files. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-42 · Vigilancia con trazabilidad

- **Archivo:** `src/assets/images/b-lite/politicas/sistema_vigilancia.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Vigilancia con trazabilidad" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Seguridad.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Seguridad para todas las políticas de la categoría).
- **Qué debe transmitir:** Cámaras con control y auditoría. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A video monitoring center with operators watching a wall of screens showing blurred street scenes, a supervisor reviewing an audit log on a tablet, blue light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-43 · Prevención y proximidad federal

- **Archivo:** `src/assets/images/b-lite/politicas/policia_proximidad.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Prevención y proximidad federal" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Seguridad.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Seguridad para todas las políticas de la categoría).
- **Qué debe transmitir:** Policía de barrio, conversación con vecinos. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A neighborhood police officer talking with residents and shopkeepers on a sidewalk at dusk, friendly community atmosphere. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-44 · Acceso cultural y creación

- **Archivo:** `src/assets/images/b-lite/politicas/programa_cultural.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Acceso cultural y creación" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Cultura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Cultura para todas las políticas de la categoría).
- **Qué debe transmitir:** Biblioteca y centro cultural vivos. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
A public library and community cultural center at night, people reading, a small concert with a guitarist in the background, warm light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### POL-45 · Patrimonio y turismo sostenible

- **Archivo:** `src/assets/images/b-lite/politicas/patrimonio_historico.webp`
- **Dónde aparece:** `PolicyPanel` → diálogo `PolicyDetails` de "Patrimonio y turismo sostenible" (banda superior, ~160 px de alto) y, opcional, franja superior de la tarjeta de la política (~100 px de alto, con `loading="lazy"`). Categoría: Cultura.
- **Tamaño final:** 800 × 400 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy la tarjeta muestra el mismo ícono de Cultura para todas las políticas de la categoría).
- **Qué debe transmitir:** Restauración de un edificio histórico. Lo importante va en la franja horizontal central (el recorte en la tarjeta es muy apaisado).
- **Prompt** (bloque ESCENA incluido):

```text
Restoration workers on scaffolding restoring the facade of a colonial building in a historic town square, tourists watching, golden hour light. Keep the key subject inside the central horizontal band of the frame. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

### 5.4. Indicadores (14 íconos)

#### IND-01 · Presión inflacionaria

- **Archivo:** `src/assets/images/b-lite/indicadores/inflacion.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a thermometer rising next to a small shopping cart. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-02 · Actividad y empleo

- **Archivo:** `src/assets/images/b-lite/indicadores/actividad.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a factory gear with a worker's hard hat on top. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-03 · Poder adquisitivo

- **Archivo:** `src/assets/images/b-lite/indicadores/ingreso_real.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of an open wallet with a single coin and a small rising arrow. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-04 · Crédito productivo

- **Archivo:** `src/assets/images/b-lite/indicadores/credito.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a key crossing a small workshop building. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-05 · Margen fiscal estructural

- **Archivo:** `src/assets/images/b-lite/indicadores/fiscal.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a balance scale with a stack of coins on each side. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-06 · Capacidad exportadora

- **Archivo:** `src/assets/images/b-lite/indicadores/externo.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Economía.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a cargo ship with an arrow pointing outward. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-07 · Infraestructura operativa

- **Archivo:** `src/assets/images/b-lite/indicadores/infraestructura.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Estado y servicios.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a bridge with a power pylon and a water drop. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-08 · Educación

- **Archivo:** `src/assets/images/b-lite/indicadores/educacion.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Estado y servicios.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of an open book with a pencil. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-09 · Salud

- **Archivo:** `src/assets/images/b-lite/indicadores/salud.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Estado y servicios.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a heart with a medical cross. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-10 · Protección social y vivienda

- **Archivo:** `src/assets/images/b-lite/indicadores/proteccion.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Estado y servicios.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a small house sheltered under two open hands. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-11 · Seguridad cotidiana

- **Archivo:** `src/assets/images/b-lite/indicadores/seguridad.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Instituciones y sociedad.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a shield with a street lamp. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-12 · Ciencia e innovación

- **Archivo:** `src/assets/images/b-lite/indicadores/ciencia.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Desarrollo.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a microscope with an atom orbit. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-13 · Garantías e integridad pública

- **Archivo:** `src/assets/images/b-lite/indicadores/derechos.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Instituciones y sociedad.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of the scales of justice inside a laurel wreath. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### IND-14 · Sostenibilidad ambiental

- **Archivo:** `src/assets/images/b-lite/indicadores/ambiente.png`
- **Dónde aparece:** `SituationRoom` → `CountryBriefing` (botón del índice en "Briefing del país", ícono de 20 px junto al nombre), diálogo del indicador en `CausalDashboard` (64 px, junto al título) y filas de "Cambios del país" en el cierre de turno. Grupo: Instituciones y sociedad.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Nada (hoy los 14 índices son solo texto).
- **Qué debe transmitir:** Los 14 forman un juego: mismo aro, mismo grosor, mismo tamaño de símbolo. A 20 px solo se lee la silueta: símbolo grande y simple.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a leaf with a water drop. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

### 5.5. Eventos (23)

Una imagen por evento, nombrada con el id del evento. Seis imágenes actuales ya cumplen la guía y **se conservan** (no se generan). Se rehacen cuatro por tener texto o banderas reales (P1) y dos por estilo (P2), y se crean once para los eventos que hoy usan una imagen prestada. Los eventos `oposicion_*` (tras perder las legislativas) y `desgaste_*` (tras ganarlas) son condicionales: por eso van en P2.

#### EVT-01 · Escándalo de violencia policial

- **Archivo:** `src/assets/images/b-lite/eventos/police_violence_scandal.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Escándalo de violencia policial" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-police-violence-scandal.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-02 · Default selectivo de deuda

- **Archivo:** `src/assets/images/b-lite/eventos/debt_default.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Default selectivo de deuda" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-debt-default.webp` (tiene la palabra "DEFAULT" escrita y billetes reales).
- **Qué debe transmitir:** Debe contar "Default selectivo de deuda" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A dim finance ministry office at night: an official sitting alone at a desk facing a tall stack of blank overdue folders, a large window with storm clouds over the city, a red warning light reflected on the glass. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-03 · Crisis energética

- **Archivo:** `src/assets/images/b-lite/eventos/energy_crisis.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Crisis energética" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-energy-crisis.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-04 · Paro general

- **Archivo:** `src/assets/images/b-lite/eventos/general_strike.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Paro general" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-general-strike.webp` (pancartas con consignas legibles).
- **Qué debe transmitir:** Debe contar "Paro general" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A huge workers' demonstration filling a wide avenue in front of a government palace, seen from above and behind, many plain light-blue and white banners without any writing, closed shops, an empty bus stop, a cloudy sky. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-05 · Ola de calor extrema

- **Archivo:** `src/assets/images/b-lite/eventos/heat_wave.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Ola de calor extrema" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-heat-wave.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-06 · Conflicto diplomático

- **Archivo:** `src/assets/images/b-lite/eventos/diplomatic_conflict.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Conflicto diplomático" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-diplomatic-conflict.webp` (bandera de Uruguay reconocible).
- **Qué debe transmitir:** Debe contar "Conflicto diplomático" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
Two diplomatic delegations facing each other across a long dark table in a formal hall, one diplomat standing and gesturing in protest, generic unmarked flags, a tense cold light. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-07 · Sanciones externas

- **Archivo:** `src/assets/images/b-lite/eventos/external_sanctions.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Sanciones externas" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-external-sanctions.webp` (texto "SANCTIONS" y banderas de EE. UU., UE y Reino Unido).
- **Qué debe transmitir:** Debe contar "Sanciones externas" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A cargo port at night with ships waiting idle and containers stacked behind a closed gate with chains, a customs officer looking at a stop light, cold blue light, a sense of isolation. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-08 · Sequía

- **Archivo:** `src/assets/images/b-lite/eventos/drought.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Sequía" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-drought.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-09 · Motín carcelario

- **Archivo:** `src/assets/images/b-lite/eventos/prison_riot.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Motín carcelario" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-prison-riot.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-10 · Ola de narcotráfico

- **Archivo:** `src/assets/images/b-lite/eventos/drug_wave.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Ola de narcotráfico" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** conservar
- **Reemplaza:** Se conserva `events/event-drug-wave.webp` (estilo oscuro y sin texto: ya cumple la guía).
- **Qué debe transmitir:** No hace falta generarla. En la integración se copia el archivo actual con este nombre.

#### EVT-11 · Bloqueo legislativo post-electoral

- **Archivo:** `src/assets/images/b-lite/eventos/oposicion_bloqueo.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Bloqueo legislativo post-electoral" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-election-day.webp (no corresponde).
- **Qué debe transmitir:** Debe contar "Bloqueo legislativo post-electoral" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A congress chamber with the opposition benches full and standing with arms crossed, the ruling party benches half empty, a vote board glowing with abstract colored lights, tense atmosphere. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-12 · Marcha opositora al Congreso

- **Archivo:** `src/assets/images/b-lite/eventos/oposicion_marcha.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Marcha opositora al Congreso" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-social-protest.webp.
- **Qué debe transmitir:** Debe contar "Marcha opositora al Congreso" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A large peaceful march arriving at the National Congress at dusk, people carrying plain blank placards and light-blue and white flags without symbols, police barriers in front of the steps. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-13 · Intento de juicio político

- **Archivo:** `src/assets/images/b-lite/eventos/oposicion_juicio.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Intento de juicio político" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-corruption-scandal.webp.
- **Qué debe transmitir:** Debe contar "Intento de juicio político" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A congressional commission hearing room: legislators at a raised bench examining thick case files, an empty witness chair in the foreground under a spotlight. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-14 · Críticas por soberbia de gobierno

- **Archivo:** `src/assets/images/b-lite/eventos/desgaste_soberbia.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Críticas por soberbia de gobierno" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-corruption-scandal.webp.
- **Qué debe transmitir:** Debe contar "Críticas por soberbia de gobierno" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
An anonymous president seen from behind on a high balcony looking down at a distant small crowd, long shadow, cold light, a sense of distance and isolation from the people. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-15 · Aliados incómodos

- **Archivo:** `src/assets/images/b-lite/eventos/desgaste_alianza.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Aliados incómodos" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-election-day.webp.
- **Qué debe transmitir:** Debe contar "Aliados incómodos" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A coalition meeting around a round table where several provincial leaders sit with arms crossed and turned slightly away, one empty chair, maps of provinces on the wall without text. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-16 · Editoriales de advertencia

- **Archivo:** `src/assets/images/b-lite/eventos/desgaste_medios.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Editoriales de advertencia" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada propio: hoy usa event-corruption-scandal.webp.
- **Qué debe transmitir:** Debe contar "Editoriales de advertencia" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A newsroom at night with editors around a desk, a printing press visible through glass, stacks of freshly printed newspapers whose pages show only blurred illegible columns and photos. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-17 · Crisis inflacionaria

- **Archivo:** `src/assets/images/b-lite/eventos/inflation.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Crisis inflacionaria" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-economic-crisis.webp` (estilo plano y luminoso; flecha y gráfico con números).
- **Qué debe transmitir:** Debe contar "Crisis inflacionaria" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A grocery store at night where an employee replaces price labels on the shelves (labels blank), shoppers with half-empty baskets looking worried, harsh fluorescent light. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-18 · Inversión extranjera

- **Archivo:** `src/assets/images/b-lite/eventos/investment.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Inversión extranjera" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada propio: hoy usa event-infrastructure-plan.webp (reunión de obra pública; estilo plano).
- **Qué debe transmitir:** Debe contar "Inversión extranjera" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
Foreign investors and local officials walking across a large empty industrial site at dusk, looking at surveyor stakes and a rolled blueprint, a river and wetlands in the background hinting at the environmental debate. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-19 · Oportunidad de coalición

- **Archivo:** `src/assets/images/b-lite/eventos/coalition.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Oportunidad de coalición" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada propio: hoy usa event-election-day.webp.
- **Qué debe transmitir:** Debe contar "Oportunidad de coalición" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
Two groups of politicians meeting in a wood-paneled room, one leader extending a hand across a table with a pot of mate and blank documents, warm hopeful light. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-20 · Bloqueo legislativo

- **Archivo:** `src/assets/images/b-lite/eventos/blockade.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Bloqueo legislativo" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada propio: hoy usa event-election-day.webp.
- **Qué debe transmitir:** Debe contar "Bloqueo legislativo" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A congressional session with legislators standing at their benches demanding documents, a speaker raising a stack of blank folders, the presidency's chair in the chamber empty. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-21 · Protestas estudiantiles

- **Archivo:** `src/assets/images/b-lite/eventos/students.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Protestas estudiantiles" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada propio: hoy usa event-social-protest.webp.
- **Qué debe transmitir:** Debe contar "Protestas estudiantiles" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
University students holding a peaceful public class on the street in front of a classical university building at dusk, chairs on the sidewalk, plain blank placards, books and notebooks. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-22 · Crisis en el sistema de salud

- **Archivo:** `src/assets/images/b-lite/eventos/health.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Crisis en el sistema de salud" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** Nada propio: hoy usa event-social-protest.webp (muestra una protesta).
- **Qué debe transmitir:** Debe contar "Crisis en el sistema de salud" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A crowded public hospital emergency corridor at night, patients waiting on chairs, exhausted nurses, empty supply shelves, harsh fluorescent light. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EVT-23 · Emergencia hídrica

- **Archivo:** `src/assets/images/b-lite/eventos/flood.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo del evento "Emergencia hídrica" (imagen superior a lo ancho, 192 px de alto: ~725 × 192 en escritorio, ~350 × 192 en celular).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-flood-emergency.webp` (estilo plano y luminoso).
- **Qué debe transmitir:** Debe contar "Emergencia hídrica" de un vistazo. Recorte muy apaisado en escritorio: acción en la franja central.
- **Prompt** (bloque ESCENA incluido):

```text
A flooded neighborhood at dusk, rescue workers in a small boat helping a family, water reaching windows, rain, emergency lights reflected on the water. Keep the action inside the central horizontal band. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

### 5.6. Perfiles y avatar

#### PER-01 · Perfil: Político de Raza

- **Archivo:** `src/assets/images/b-lite/perfiles/politico.png`
- **Dónde aparece:** `NewGameScreen` → opciones de "Perfil" (44 px, círculo) y `CivicPanels` → `ProfileCard` ("Tu perfil", 48 px). Mapeo en `iconThumbnails.ts` (`THUMBNAIL_ARCHETYPES`).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/archetypes/archetype-institutional.webp` (ícono plano con fondo blanco; es el perfil elegido por defecto).
- **Qué debe transmitir:** Oficio político, negociación con aliados. Los cuatro tienen que verse como un juego entre sí (mismo aro que categorías e indicadores), con un detalle dorado un poco más rico: es la identidad del jugador.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a classic speaker's lectern with a small microphone between two laurel branches, with a slightly richer gold ring decorated with small sun rays. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### PER-02 · Perfil: Empresario

- **Archivo:** `src/assets/images/b-lite/perfiles/empresario.png`
- **Dónde aparece:** `NewGameScreen` → opciones de "Perfil" (44 px, círculo) y `CivicPanels` → `ProfileCard` ("Tu perfil", 48 px). Mapeo en `iconThumbnails.ts` (`THUMBNAIL_ARCHETYPES`).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/archetypes/archetype-business.webp`.
- **Qué debe transmitir:** Gestión, costos, deuda. Los cuatro tienen que verse como un juego entre sí (mismo aro que categorías e indicadores), con un detalle dorado un poco más rico: es la identidad del jugador.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a closed briefcase with a small rising arrow above it, with a slightly richer gold ring decorated with small sun rays. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### PER-03 · Perfil: Sindicalista

- **Archivo:** `src/assets/images/b-lite/perfiles/sindicalista.png`
- **Dónde aparece:** `NewGameScreen` → opciones de "Perfil" (44 px, círculo) y `CivicPanels` → `ProfileCard` ("Tu perfil", 48 px). Mapeo en `iconThumbnails.ts` (`THUMBNAIL_ARCHETYPES`).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/archetypes/archetype-union.webp` (muestra una torre, no se entiende).
- **Qué debe transmitir:** Organización y más capacidad de acción. Evitar el puño en alto. Los cuatro tienen que verse como un juego entre sí (mismo aro que categorías e indicadores), con un detalle dorado un poco más rico: es la identidad del jugador.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of two clasped hands over a cogwheel, with a slightly richer gold ring decorated with small sun rays. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### PER-04 · Perfil: Comunicador

- **Archivo:** `src/assets/images/b-lite/perfiles/comunicador.png`
- **Dónde aparece:** `NewGameScreen` → opciones de "Perfil" (44 px, círculo) y `CivicPanels` → `ProfileCard` ("Tu perfil", 48 px). Mapeo en `iconThumbnails.ts` (`THUMBNAIL_ARCHETYPES`).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P1
- **Reemplaza:** `icons/archetypes/archetype-communicator.webp` (corazón; poco claro).
- **Qué debe transmitir:** Manejo de crisis y de la opinión pública. Los cuatro tienen que verse como un juego entre sí (mismo aro que categorías e indicadores), con un detalle dorado un poco más rico: es la identidad del jugador.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a vintage broadcast microphone with three sound waves, with a slightly richer gold ring decorated with small sun rays. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### PER-05 · Avatar 15 (funcionario en atril)

- **Archivo:** `src/assets/images/b-lite/perfiles/avatares/avatar-15.webp`
- **Dónde aparece:** `NewGameScreen` → grilla "Foto" (último avatar) y encabezado del tablero (32 px). Se guarda como `avatar:15`: hay que conservar la posición.
- **Tamaño final:** 384 × 384 px · **Relación:** 1:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `characters/character-podium-official.webp` (ícono plano con fondo blanco entre 14 retratos pintados).
- **Qué debe transmitir:** Mismo encuadre que los otros 14 avatares: busto de frente, fondo liso de color, traje. Persona inventada.
- **Prompt** (bloque ESCENA incluido):

```text
Portrait bust of an invented middle-aged statesman with grey temples standing behind a wooden lectern, dark suit and light-blue tie, plain deep navy background with a soft warm glow behind the head, centered, looking at the viewer with a calm confident expression. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

### 5.7. Niveles y escenarios

#### NIV-01 · Fácil · País en calma (Modo exploración)

- **Archivo:** `src/assets/images/b-lite/niveles/pais_en_calma.webp`
- **Dónde aparece:** `NewGameScreen` → tarjeta de "Nivel" (hoy tarjetas de solo texto), como fondo de la tarjeta con degradado oscuro. También sirve para `scenario.image` en `scenarios.ts`.
- **Tamaño final:** 960 × 540 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `backgrounds/bg-casa-rosada-morning.webp` (imagen del escenario en scenarios.ts, que ningún componente muestra).
- **Qué debe transmitir:** Un país ordenado para aprender. Sereno, sin amenaza. El texto de la tarjeta va a la izquierda: dejar ese lado oscuro.
- **Prompt** (bloque ESCENA incluido):

```text
A calm Argentine provincial capital square on a clear evening, families walking, a cathedral and a municipal building softly lit, orderly streets, serene atmosphere. The left third of the frame stays dark and simple for overlaid text. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### NIV-02 · Normal · Viento de cola (2003: el boom de la soja)

- **Archivo:** `src/assets/images/b-lite/niveles/viento_de_cola.webp`
- **Dónde aparece:** `NewGameScreen` → tarjeta de "Nivel" (hoy tarjetas de solo texto), como fondo de la tarjeta con degradado oscuro. También sirve para `scenario.image` en `scenarios.ts`.
- **Tamaño final:** 960 × 540 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `backgrounds/bg-map-argentina.webp` (imagen del escenario que ningún componente muestra; además tiene texto ilegible en el mapa).
- **Qué debe transmitir:** Bonanza exportadora con deuda social pendiente: campo dorado y, al fondo, el conurbano. El texto de la tarjeta va a la izquierda: dejar ese lado oscuro.
- **Prompt** (bloque ESCENA incluido):

```text
Golden soybean fields under a vast sky at dusk, combine harvesters working, grain trucks lined up at a silo, and on the far horizon the modest lights of a city outskirt. The left third of the frame stays dark and simple for overlaid text. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### NIV-03 · Argentina · Herencia pesada (traspasos 2015, 2019, 2023)

- **Archivo:** `src/assets/images/b-lite/niveles/herencia_pesada.webp`
- **Dónde aparece:** `NewGameScreen` → tarjeta de "Nivel" (hoy tarjetas de solo texto), como fondo de la tarjeta con degradado oscuro. También sirve para `scenario.image` en `scenarios.ts`.
- **Tamaño final:** 960 × 540 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `backgrounds/bg-presidential-office.webp` (imagen del escenario que ningún componente muestra).
- **Qué debe transmitir:** Recibís un desorden: carpetas, deuda, caja vacía. El texto de la tarjeta va a la izquierda: dejar ese lado oscuro.
- **Prompt** (bloque ESCENA incluido):

```text
The presidential office at night with towering stacks of folders on the desk, an open empty safe, a ledger, rain on the window, the city lights blurred outside. The left third of the frame stays dark and simple for overlaid text. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### NIV-04 · Escenario oculto · Corralito (diciembre de 2001)

- **Archivo:** `src/assets/images/b-lite/niveles/corralito.webp`
- **Dónde aparece:** `NewGameScreen` → tarjeta de "Escenarios históricos" (oculta mientras `escenariosHistoricos` esté apagado), como fondo de la tarjeta con degradado oscuro. También sirve para `scenario.image` en `scenarios.ts`.
- **Tamaño final:** 960 × 540 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** `events/event-economic-crisis.webp` (imagen del escenario que ningún componente muestra).
- **Qué debe transmitir:** Escenario histórico oculto (`LITE_FEATURES.escenariosHistoricos = false`). Cacerolas y bancos cerrados; sin logos de bancos reales. El texto de la tarjeta va a la izquierda: dejar ese lado oscuro.
- **Prompt** (bloque ESCENA incluido):

```text
A city street at night in summer: bank fronts with metal shutters pulled down, a crowd of ordinary people banging pots and pans, plain unmarked buildings, haze from street lights. The left third of the frame stays dark and simple for overlaid text. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### NIV-05 · Escenario oculto · País en llamas (1989: la hiperinflación)

- **Archivo:** `src/assets/images/b-lite/niveles/pais_en_llamas.webp`
- **Dónde aparece:** `NewGameScreen` → tarjeta de "Escenarios históricos" (oculta mientras `escenariosHistoricos` esté apagado), como fondo de la tarjeta con degradado oscuro. También sirve para `scenario.image` en `scenarios.ts`.
- **Tamaño final:** 960 × 540 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** `events/event-social-protest.webp` (imagen del escenario que ningún componente muestra).
- **Qué debe transmitir:** Escenario histórico oculto. Hiperinflación: góndolas vacías, persianas bajas, humo a lo lejos. Mostrar la crisis sin saqueo explícito. El texto de la tarjeta va a la izquierda: dejar ese lado oscuro.
- **Prompt** (bloque ESCENA incluido):

```text
A city street at dusk in the late 1980s: shuttered shops, a long queue outside a grocery store with empty shelves visible through the window, period cars, smoke rising in the distance, scattered blank newspaper pages blowing in the wind. The left third of the frame stays dark and simple for overlaid text. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

### 5.8. Resultados: elecciones, legislativas, victoria, derrotas, legado

Todas van como banda superior de un diálogo que no se puede cerrar (`CampaignFlow`), con el título superpuesto abajo a la izquierda en los finales. Las seis derrotas tienen causa y frase propias en `campaign.ts` (`checkDefeat` y la elección presidencial): cada una con su imagen.

#### RES-01 · Elecciones presidenciales ("El país decide")

- **Archivo:** `src/assets/images/b-lite/resultados/elecciones-presidenciales.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo de fin de mandato 1 (`state.phase === 'mandate_review'`), antes de elegir reelección o retiro. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Expectativa: el país va a votar. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
Dawn line of citizens of all ages waiting outside a public school used as a polling station, plain cardboard ballot boxes visible through the door, an Argentine flag in the hallway, hopeful quiet mood. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-02 · Resultado presidencial: reelección ganada

- **Archivo:** `src/assets/images/b-lite/resultados/reeleccion-ganada.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Resultado presidencial" (`resultPending`, elección presidencial ganada). Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Festejo contenido, de espaldas: el presidente es el jugador, no tiene cara. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
Victory night: an anonymous president seen from behind on a balcony raising one hand toward a crowd filling a plaza with light-blue and white flags without symbols, confetti in the warm lights. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-03 · Resultado de las legislativas: ganadas

- **Archivo:** `src/assets/images/b-lite/resultados/legislativas-ganadas.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Resultado de las legislativas" con `won = true` (turno 8 de cada mandato). Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Congreso que acompaña. Va encima de la cifra de votos y la barra de bancas. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
The congress chamber at night with ruling-bench legislators standing and applauding under the lit dome, papers in the air, upbeat warm light. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-04 · Resultado de las legislativas: perdidas

- **Archivo:** `src/assets/images/b-lite/resultados/legislativas-perdidas.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Resultado de las legislativas" con `won = false`. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Golpe, no catástrofe: hay que gobernar con un Congreso más difícil. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
Election night in a campaign headquarters: tired staff looking at screens with abstract charts in cold red tones, empty coffee cups, a quiet somber mood. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-05 · Legado: victoria ("Un legado consolidado")

- **Archivo:** `src/assets/images/b-lite/resultados/victoria.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Legado de tu gobierno" con `outcome = 'victory'` (dos mandatos, tres objetivos y respaldo). Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `ui/shield-emblem-premium.webp` (ícono plano con fondo blanco recortado como foto: se ve mal).
- **Qué debe transmitir:** El mejor final del juego. Luz dorada, sereno, orgullo. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
Sunrise seen from inside the presidential office: a folded blue-and-white presidential sash and a ceremonial baton resting on the polished desk, golden light flooding through the tall window over Plaza de Mayo. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-06 · Legado: etapa concluida

- **Archivo:** `src/assets/images/b-lite/resultados/etapa-concluida.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Legado de tu gobierno" con `outcome = 'retired'` tras dos mandatos sin cumplir todo. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Fin digno, agridulce: se terminó el tiempo. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
An empty presidential office at sunset with a few packed cardboard boxes, the folded presidential sash left on the desk, long shadows, the plaza visible through the window. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-07 · Legado: retiro voluntario

- **Archivo:** `src/assets/images/b-lite/resultados/retiro.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Legado de tu gobierno" tras "Retirarse de la presidencia" (`end_game`). Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-election-day.webp`.
- **Qué debe transmitir:** Decisión propia, salida tranquila. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
An anonymous former president seen from behind walking away along a quiet colonnade at dusk, carrying a briefcase, warm light at the end of the corridor. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-08 · Derrota: derrota electoral

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-electoral.webp`
- **Dónde aparece:** `CampaignFlow` → Diálogo "Legado de tu gobierno" ("Fin del gobierno") cuando se pierde la reelección. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P1
- **Reemplaza:** `events/event-social-protest.webp` (la misma protesta para las seis derrotas).
- **Qué debe transmitir:** La derrota más común. Sobria, sin humillación. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
Election night: a deserted campaign stage with fallen confetti and empty chairs, a lone staff member switching off the lights, screens still glowing faintly. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-09 · Derrota: pérdida de apoyo

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-aprobacion.webp`
- **Dónde aparece:** `CampaignFlow` → Fin por aprobación material menor a 25 durante dos cierres. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-social-protest.webp`.
- **Qué debe transmitir:** La calle le soltó la mano al gobierno. Protesta pacífica. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
A peaceful crowd banging pots and pans at night in front of a government palace, plain banners without writing, phone lights, tense but non-violent atmosphere. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-10 · Derrota: insolvencia

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-insolvencia.webp`
- **Dónde aparece:** `CampaignFlow` → Fin por más de 600 U de atrasos durante tres cierres. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-social-protest.webp`.
- **Qué debe transmitir:** Caja vacía, cuentas impagas. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
A treasury office at night with an open empty vault, piles of blank unpaid invoices on a desk, a lone official with his head in his hands under a single lamp. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-11 · Derrota: juicio político

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-juicio-politico.webp`
- **Dónde aparece:** `CampaignFlow` → Fin por legitimidad menor a 20 y garantías menores a 25 durante dos cierres. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-social-protest.webp`.
- **Qué debe transmitir:** Institucional y grave. Recinto, no calle. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
The Senate chamber in a dramatic full session, senators standing to vote under a cold light, an empty chair in the foreground symbolizing the removed president. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-12 · Derrota: ruptura institucional

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-ruptura-institucional.webp`
- **Dónde aparece:** `CampaignFlow` → Fin por estabilidad menor a 15 y relación con el oficialismo menor a 25 durante tres cierres. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-social-protest.webp`.
- **Qué debe transmitir:** El propio partido se va. Sin militares ni tanques: renuncias y sillas vacías. Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
A cabinet room at night with chairs pushed back from the table, scattered blank resignation letters, a broken pen, a storm outside the window. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### RES-13 · Derrota: colapso inflacionario

- **Archivo:** `src/assets/images/b-lite/resultados/derrota-hiperinflacion.webp`
- **Dónde aparece:** `CampaignFlow` → Fin por inflación de 95 o más e ingreso real menor a 20 durante dos cierres. Imagen superior (h-48, ~725 × 192 en escritorio).
- **Tamaño final:** 1200 × 600 px · **Relación:** 2:1 · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** `events/event-social-protest.webp`.
- **Qué debe transmitir:** Precios fuera de control. Que no se parezca al escenario "País en llamas". Dejar el ángulo inferior izquierdo oscuro: ahí se superpone el título.
- **Prompt** (bloque ESCENA incluido):

```text
A small grocery store at closing time with nearly empty shelves, a clerk replacing price labels with a labeling gun (labels blank), a long line of worried shoppers outside the window. The lower-left corner stays dark and calm for an overlaid title. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EST-01 · Estrategia postlegislativa: Acelerar

- **Archivo:** `src/assets/images/b-lite/resultados/estrategia-acelerar.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo "Estrategia postlegislativa" (turno 9): miniatura en cada una de las 4 tarjetas. La banda superior sigue siendo `bg-congress-interior.webp` (se conserva).
- **Tamaño final:** 640 × 360 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (tarjetas de solo texto).
- **Qué debe transmitir:** Metáfora visual de "Acelerar". Se ve chica: una sola idea.
- **Prompt** (bloque ESCENA incluido):

```text
A high-speed train rushing through the night with long light trails. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EST-02 · Estrategia postlegislativa: Negociar

- **Archivo:** `src/assets/images/b-lite/resultados/estrategia-negociar.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo "Estrategia postlegislativa" (turno 9): miniatura en cada una de las 4 tarjetas. La banda superior sigue siendo `bg-congress-interior.webp` (se conserva).
- **Tamaño final:** 640 × 360 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (tarjetas de solo texto).
- **Qué debe transmitir:** Metáfora visual de "Negociar". Se ve chica: una sola idea.
- **Prompt** (bloque ESCENA incluido):

```text
Two hands shaking over a table with blank documents and a pot of mate. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EST-03 · Estrategia postlegislativa: Abrirse

- **Archivo:** `src/assets/images/b-lite/resultados/estrategia-abrirse.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo "Estrategia postlegislativa" (turno 9): miniatura en cada una de las 4 tarjetas. La banda superior sigue siendo `bg-congress-interior.webp` (se conserva).
- **Tamaño final:** 640 × 360 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (tarjetas de solo texto).
- **Qué debe transmitir:** Metáfora visual de "Abrirse". Se ve chica: una sola idea.
- **Prompt** (bloque ESCENA incluido):

```text
The tall doors of a government palace opening wide as citizens walk in, warm light pouring out. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### EST-04 · Estrategia postlegislativa: Jugada Audaz

- **Archivo:** `src/assets/images/b-lite/resultados/estrategia-jugada-audaz.webp`
- **Dónde aparece:** `CampaignFlow` → diálogo "Estrategia postlegislativa" (turno 9): miniatura en cada una de las 4 tarjetas. La banda superior sigue siendo `bg-congress-interior.webp` (se conserva).
- **Tamaño final:** 640 × 360 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (tarjetas de solo texto).
- **Qué debe transmitir:** Metáfora visual de "Jugada Audaz". Se ve chica: una sola idea.
- **Prompt** (bloque ESCENA incluido):

```text
A hand pushing a chess king forward on a dark board under a single dramatic spotlight. Style: cinematic editorial digital painting, semi-realistic, painterly brushwork with clean readable shapes, low-key muted palette dominated by deep navy and charcoal (#06090D, #101721, #1E2D40), accents of soft Argentine sky blue (#75AADB, #99C5E8) and warm brass gold (#C9A96E, #E5BE61), dusk or night lighting with a warm golden key light and a cool blue rim light, light atmospheric haze, dark vignette toward the edges, calm balanced composition with the main subject centered and generous empty margins for cropping, anonymous generic people of diverse ages and backgrounds with faces partly in shadow, contemporary Argentina. No text, no letters, no numbers, no readable signs or banners, no logos, no brand names, no watermark, no signature, no real politicians or recognizable people, no political party flags, symbols or colors, no foreign national flags, no real banknotes, no gore.
```

#### OBJ-01 · Objetivo: Servicios que funcionan

- **Archivo:** `src/assets/images/b-lite/resultados/objetivo-servicios.png`
- **Dónde aparece:** `CivicPanels` → `ObjectivesPanel` (tarjetas de objetivos: tablero y diálogos de elecciones y legado). Ícono de 32 px junto al título.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (en celular es lo primero que se ve al entrar y es solo texto).
- **Qué debe transmitir:** Mismo juego que indicadores y categorías. Cuando el objetivo se cumple, la integración puede sumarle un brillo verde por CSS.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a trio of small symbols: a book, a medical cross and a little house. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### OBJ-02 · Objetivo: Gobierno que cumple

- **Archivo:** `src/assets/images/b-lite/resultados/objetivo-cumple.png`
- **Dónde aparece:** `CivicPanels` → `ObjectivesPanel` (tarjetas de objetivos: tablero y diálogos de elecciones y legado). Ícono de 32 px junto al título.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (en celular es lo primero que se ve al entrar y es solo texto).
- **Qué debe transmitir:** Mismo juego que indicadores y categorías. Cuando el objetivo se cumple, la integración puede sumarle un brillo verde por CSS.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a wax seal with a checkmark pressed onto a folded document. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### OBJ-03 · Objetivo: Capacidad para el futuro

- **Archivo:** `src/assets/images/b-lite/resultados/objetivo-obras.png`
- **Dónde aparece:** `CivicPanels` → `ObjectivesPanel` (tarjetas de objetivos: tablero y diálogos de elecciones y legado). Ícono de 32 px junto al título.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (en celular es lo primero que se ve al entrar y es solo texto).
- **Qué debe transmitir:** Mismo juego que indicadores y categorías. Cuando el objetivo se cumple, la integración puede sumarle un brillo verde por CSS.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a construction crane over a small bridge. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

### 5.9. Elementos decorativos

#### DEC-01 · Textura de expediente

- **Archivo:** `src/assets/images/b-lite/decorativos/textura-expediente.webp`
- **Dónde aparece:** Fondo repetido (CSS `background-repeat`) de `Dialog` (`.b-dialog`) y de los paneles (`.b-panel`), con opacidad 0,05–0,1.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 (tileable) · **Formato:** webp · **Prioridad:** P2
- **Reemplaza:** Nada (hoy degradado liso).
- **Qué debe transmitir:** Tiene que repetirse sin costuras. Papel oscuro, apenas perceptible: da materialidad de "dossier".
- **Prompt** (bloque TEXTURA incluido):

```text
Seamless tileable texture of dark navy archival paper with subtle fibers and a very faint fine grid, perfectly even lighting, no vignette, edges match on all sides. Style: subtle decorative asset for a dark presidential situation-room interface, very low contrast, deep navy and charcoal (#06090D, #0B1017, #101721) with faint sky-blue (#75AADB) and brass gold (#C9A96E) lines, refined and quiet, no focal subject competing with the interface. No text, no letters, no numbers, no logos, no watermark.
```

#### DEC-02 · Sello presidencial (sol de mayo)

- **Archivo:** `src/assets/images/b-lite/decorativos/sello-presidencial.png`
- **Dónde aparece:** `SituationRoom` → `PresidentialMark` (hoy un ícono `Sun` de lucide dentro de `.b-seal`, 43 px) y marca de agua del encabezado de `Dialog`.
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P2
- **Reemplaza:** Ícono `Sun` de lucide en la marca.
- **Qué debe transmitir:** Identidad de la B Lite. Sol de mayo simplificado (no el escudo nacional completo), dorado sobre azul noche.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a simplified Sun of May with sixteen alternating straight and wavy rays and a calm stylized face, in brushed gold. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### DEC-03 · Sello de despacho

- **Archivo:** `src/assets/images/b-lite/decorativos/sello-despacho.png`
- **Dónde aparece:** `CausalDashboard` → "Expediente del trimestre" (`.b-execution-ledger`) cuando hay decisiones ejecutadas, y animación al "Cerrar turno".
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada.
- **Qué debe transmitir:** Lacre o sello de goma sin letras. Rojo apagado con un sol pequeño.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a deep red wax seal impression with a small sun motif in its center, irregular wax edges, seen from the front (no outer ring needed). Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### DEC-04 · Separador ornamental

- **Archivo:** `src/assets/images/b-lite/decorativos/separador-sol.png`
- **Dónde aparece:** Separadores de secciones en `WelcomeScreen` (sobre las cifras) y en los diálogos de legado y elecciones.
- **Tamaño final:** 1200 × 80 px · **Relación:** 15:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada (hoy un borde de 1 px).
- **Qué debe transmitir:** Muy fino. Si el generador no da 15:1, generar 3:1 con mucho aire arriba y abajo: lo recortamos.
- **Prompt** (bloque TEXTURA incluido):

```text
A thin horizontal ornamental divider line in brushed brass gold with a tiny sun in the exact center, symmetrical, fading out at both ends, isolated on a fully transparent background. Style: subtle decorative asset for a dark presidential situation-room interface, very low contrast, deep navy and charcoal (#06090D, #0B1017, #101721) with faint sky-blue (#75AADB) and brass gold (#C9A96E) lines, refined and quiet, no focal subject competing with the interface. No text, no letters, no numbers, no logos, no watermark.
```

#### DEC-05 · Esquina de marco

- **Archivo:** `src/assets/images/b-lite/decorativos/marco-esquina.png`
- **Dónde aparece:** `Dialog` (`.b-dialog`) y `.b-welcome-scene`: se repite en las 4 esquinas rotándolo por CSS.
- **Tamaño final:** 256 × 256 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada.
- **Qué debe transmitir:** Solo la esquina superior izquierda; las otras tres salen girándola.
- **Prompt** (bloque TEXTURA incluido):

```text
An ornamental corner bracket for the top-left corner of a frame, thin brass gold lines in a restrained art deco government style, isolated on a fully transparent background. Style: subtle decorative asset for a dark presidential situation-room interface, very low contrast, deep navy and charcoal (#06090D, #0B1017, #101721) with faint sky-blue (#75AADB) and brass gold (#C9A96E) lines, refined and quiet, no focal subject competing with the interface. No text, no letters, no numbers, no logos, no watermark.
```

#### DEC-06 · Fondo de sala (escritorio)

- **Archivo:** `src/assets/images/b-lite/decorativos/fondo-sala.webp`
- **Dónde aparece:** `CausalDashboard` → `.b-desktop` (detrás de las tres columnas, opacidad 0,06–0,1).
- **Tamaño final:** 1920 × 1080 px · **Relación:** 16:9 · **Formato:** webp · **Prioridad:** P3
- **Reemplaza:** Nada (degradados radiales).
- **Qué debe transmitir:** Casi invisible. Sin sujeto: solo ambiente de sala.
- **Prompt** (bloque TEXTURA incluido):

```text
An empty dark situation room heavily blurred: a long map table glowing faint blue, a wall of dark screens, soft out-of-focus light spots, extremely low contrast, no single focal point. Style: subtle decorative asset for a dark presidential situation-room interface, very low contrast, deep navy and charcoal (#06090D, #0B1017, #101721) with faint sky-blue (#75AADB) and brass gold (#C9A96E) lines, refined and quiet, no focal subject competing with the interface. No text, no letters, no numbers, no logos, no watermark.
```

#### DEC-07 · Sello de legado: bronce

- **Archivo:** `src/assets/images/b-lite/decorativos/sello-legado-bronce.png`
- **Dónde aparece:** `CampaignFlow` → diálogo "Legado de tu gobierno", junto a la casilla "Evaluación" (Evaluación 0 a 4).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada.
- **Qué debe transmitir:** Los tres iguales salvo el metal, para que se lean como niveles.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a laurel wreath medallion with a small sun at the top, made of bronze metal instead of gold for the ring and the laurel. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### DEC-08 · Sello de legado: plata

- **Archivo:** `src/assets/images/b-lite/decorativos/sello-legado-plata.png`
- **Dónde aparece:** `CampaignFlow` → diálogo "Legado de tu gobierno", junto a la casilla "Evaluación" (Evaluación 4 a 7).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada.
- **Qué debe transmitir:** Los tres iguales salvo el metal, para que se lean como niveles.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a laurel wreath medallion with a small sun at the top, made of silver metal instead of gold for the ring and the laurel. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```

#### DEC-09 · Sello de legado: oro

- **Archivo:** `src/assets/images/b-lite/decorativos/sello-legado-oro.png`
- **Dónde aparece:** `CampaignFlow` → diálogo "Legado de tu gobierno", junto a la casilla "Evaluación" (Evaluación 7 a 10).
- **Tamaño final:** 512 × 512 px · **Relación:** 1:1 · **Formato:** png con transparencia · **Prioridad:** P3
- **Reemplaza:** Nada.
- **Qué debe transmitir:** Los tres iguales salvo el metal, para que se lean como niveles.
- **Prompt** (bloque EMBLEMA incluido):

```text
Emblem of a laurel wreath medallion with a small sun at the top, made of gold metal instead of gold for the ring and the laurel. Style: premium emblem icon for a dark government dashboard, one single bold centered symbol inside a thin circular ring of brushed brass gold (#C9A96E), engraved metal and enamel look, deep navy enamel field (#101721) with sky-blue highlights (#75AADB, #99C5E8) and warm gold details (#E5BE61), soft inner glow, subtle bevel, straight front view, simple silhouette that stays readable at 24 pixels, isolated on a fully transparent background (if transparency is not available: plain solid pure black background #000000), no outer drop shadow. No text, no letters, no numbers, no logos, no political party symbols.
```


## 6. Entrega

### 6.1. Nombres y carpetas

- Usar **exactamente** el nombre de archivo de la ficha. Para actores, políticas, eventos y niveles el nombre es **el id del juego tal cual**, con guion bajo (`clase_media.webp`, `pais_en_calma.webp`, `oposicion_juicio.webp`): así la integración los conecta sin tabla de traducción.
- Minúsculas, sin espacios, sin tildes.
- Todo va bajo `src/assets/images/b-lite/` con estas subcarpetas: `pantallas/` (y `pantallas/vacios/`), `actores/`, `politicas/` (y `politicas/categorias/`), `indicadores/`, `eventos/`, `perfiles/` (y `perfiles/avatares/`), `niveles/`, `resultados/`, `decorativos/`. La imagen para compartir va en `public/og-image-lite.jpg`.
- Si se generan variantes para elegir, agregar `-v2`, `-v3` al final (`industria-v2.webp`); elegimos al integrar.

### 6.2. Cómo subirlas

Cualquiera de estas dos vías sirve:

1. **Directo al repositorio**: copiar los archivos en `src/assets/images/b-lite/...` de la rama `version-b-lite` y hacer commit (sin tocar código). Conviene por tandas: primero todas las P1.
2. **Un .zip** con la misma estructura de carpetas (`b-lite/actores/industria.webp`, etc.), adjunto en la conversación.

**Originales vs. finales:** lo ideal es entregar ya en webp al tamaño final (6.3). Si no se puede, subir el original en PNG o JPG **con el mismo nombre base** (`actores/industria.png`) y nosotros lo recortamos, achicamos y convertimos al integrar.

**Transparencia:** las fichas que dicen "png con transparencia" necesitan transparencia **real** (canal alfa). Muchos generadores dibujan un damero gris y blanco que no es transparente: eso no sirve. Si el generador no da transparencia, pedir fondo negro puro `#000000` liso (los prompts ya lo indican) y lo recortamos nosotros.

**Entregas parciales:** se puede subir de a tandas. Lo que todavía no esté sigue usando la imagen actual (o ninguna, donde hoy no hay).

Antes de subir, revisar cada imagen:

- [ ] Nombre exacto de la ficha.
- [ ] Sin letras, números ni logos (mirar carteles, pancartas, pantallas, diarios, billetes).
- [ ] Nadie reconocible; ninguna bandera o color partidario; ninguna bandera extranjera.
- [ ] El sujeto está centrado y sobrevive al recorte indicado.
- [ ] Las transparentes tienen alfa real.
- [ ] Peso dentro del tope (6.3).

### 6.3. Presupuesto de peso

Hoy el sitio publicado pesa ~2,7 MB (`dist/`), de los cuales ~2,2 MB son imágenes. Para que no explote:

| Tipo | Fichas | Tamaño final | Exportación | Tope por archivo |
|---|---|---|---|---|
| Fondos de pantalla | PAN-02, PAN-03, DEC-06 | 1920 × 1080 | webp calidad 75 | 140 KB |
| Escena de portada | PAN-01 | 1600 × 1200 | webp calidad 78 | 140 KB |
| Bandas 3:1 a 4:1 | PAN-04 a PAN-08, CATB-01 a 07 | 1200–1600 de ancho | webp calidad 78 | 60 KB |
| Escenas 2:1 | EVT, RES, PAN-09 | 1200 × 600 | webp calidad 78 | 80 KB |
| Políticas | POL-01 a 45 | 800 × 400 | webp calidad 75 | 40 KB |
| Niveles | NIV-01 a 05 | 960 × 540 | webp calidad 75 | 50 KB |
| Retratos de actores y avatar | ACT, PER-05 | 512 × 512 / 384 × 384 | webp calidad 80 | 35 KB / 25 KB |
| Viñetas chicas | PAN-T01 a T04, EST | 480–640 de ancho | webp calidad 75 | 30 KB |
| Estados vacíos | VAC | 480 × 320 | png (se pasa a webp con alfa) | 20 KB en webp |
| Emblemas | CAT, IND, OBJ, PER-01 a 04, DEC-02, DEC-03, DEC-07 a 09 | 256 o 512 | png (se pasa a webp con alfa, servido a 256) | 12–15 KB en webp |
| Texturas y ornamentos | DEC-01, DEC-04, DEC-05 | según ficha | webp / png | 30 KB / 10 KB |
| Imagen para compartir | PAN-10 | 1200 × 630 | jpg calidad 82 | 120 KB (no entra al paquete) |

Herramientas para exportar: [Squoosh](https://squoosh.app) (arrastrar, elegir WebP, calidad, redimensionar) o `cwebp -q 80 -resize 1200 600 entrada.png -o salida.webp`.

**Cuentas:** sumando los topes, las 166 imágenes llegan como máximo a ~7 MB; con pesos reales (60–70 % del tope) quedan en ~4,5–5 MB. Al integrarlas se borran las que quedan sin uso (los 14 íconos de grupos, 7 de categorías, 4 de perfiles, 2 escudos, 5 fondos y 10 eventos reemplazados o prestados: ~1,3 MB). El sitio publicado quedaría en ~6–6,5 MB **en total**, pero lo que importa es lo que se descarga en cada pantalla, porque el navegador solo descarga una imagen cuando se muestra:

| Pantalla | Hoy (imágenes) | Objetivo |
|---|---:|---:|
| Portada | ~30 KB | ≤ 320 KB |
| Nueva partida | ~330 KB | ≤ 550 KB |
| Tablero, primer turno | ~250 KB | ≤ 600 KB |
| Cada diálogo (evento, política, final) | 40–200 KB | ≤ 80 KB por imagen |

Para lograrlo la integración va a: cargar con `loading="lazy"` todo lo que no está a la vista; generar versiones chicas de los retratos de actores (96 px para la lista, 320 px para el diálogo) y de las políticas (400 × 200 para la tarjeta); y no precargar nada de diálogos ni finales.

## 7. Notas para la integración

- `visuals.ts`: `actorPortrait(id)` pasa a `b-lite/actores/${id}.webp` (se elimina la tabla `actorKeys` y el escudo de respaldo); `CATEGORY_VISUALS` apunta a `b-lite/politicas/categorias/`.
- `campaignTypes.ts`: `CampaignEvent.image` hoy es una de 16 claves compartidas; conviene resolver la imagen por `event.id` (`b-lite/eventos/${id}.webp`) y conservar los 6 archivos actuales copiados con su id.
- `CampaignFlow.tsx`: la imagen del legado se elige por `outcome` y por el texto de `outcomeReason` (las 6 derrotas tienen frases fijas en `campaign.ts`); la de legislativas, por `result.won`.
- `scenarios.ts`: `image` pasa a `b-lite/niveles/${id}.webp` y `NewGameScreen` la muestra en las tarjetas de nivel.
- `iconThumbnails.ts`: `THUMBNAIL_ARCHETYPES` apunta a `b-lite/perfiles/`; `lib/avatars.ts` reemplaza solo el avatar 15 (el id `avatar:15` no cambia, las partidas guardadas siguen andando).
- Diálogos sin imagen que pasan a tenerla: cierre de turno, política, indicador, estrategia (miniaturas), cómo se juega, opinión.
