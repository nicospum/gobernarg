# GobernArg Full: cierre del 27 de octubre de 2026

Full conserva el motor y la profundidad de A · Despacho. La decisión muestra objetivo, intercambio principal, caja/acciones reales, frecuencia y bloqueos completos. La interfaz identifica Full en portada, encabezados y metadata.

## Política de información

| Información anterior en la acción | Tratamiento y destino |
| --- | --- |
| Cronograma completo con magnitudes de plantilla | Retirado de tarjetas y ayudas. Después de ejecutar, la agenda real se consulta en Efectos en camino y Cuaderno; lo vigente, en Informes de Gestión. |
| Listas previstas de favorecidos/perjudicados | Retiradas: las sensibilidades de plantilla no incluyen todo el contexto. Actores conserva satisfacción, relación, preocupaciones reveladas y negociación; el resumen explica reacciones efectivas. |
| Riesgo bajo/medio/alto deducido por palabras | Retirado. Ayuda conserva advertencias específicas, en lenguaje de jugador. |
| Todas las condiciones técnicas y penalidades | Retiradas como lista exhaustiva. Se conservan requisitos/bloqueos reales, aviso vigente de repetición, tensión de la interna y contexto estratégico de las notas existentes. |
| Costo y requisitos de decisión | Permanecen visibles: costo calculado por availability, acciones, ley/DNU, frecuencia y todos los motivos de bloqueo. |
| Demandas | Solo se identifican pedidos que ya llegan revelados desde ControlPanel. Las ayudas no consultan demandas ocultas. |

La ayuda no contiene una calculadora oculta. Se abre con foco/mouse o como hoja persistente mediante Enter, click y tacto; al cerrar vuelve el foco. Las superficies informativas del país y la ayuda electoral son alcanzables con teclado. Los botones de perfil conservan su selección original. Se mejoraron tamaño de ayuda y contraste de texto sobre papel, conservando barras y estética.

Agregar una medida la prepara para el turno y permite quitarla incluso cuando se gastaron las acciones disponibles. Ayuda nunca selecciona una medida. El verbo anterior «Ejecutar» se reemplazó por «Agregar al turno»; el tutorial explica este flujo. Los bloqueos distinguen recursos, elección pendiente y fin de partida. El resumen añade un vistazo a lo todavía programado, con seguimiento en los espacios existentes.

## Correcciones

- Los motivos largos de bloqueo ya no dependen de un title inaccesible al tacto.
- La proyección fiscal se identifica como estimación, con limitaciones visibles. La advertencia de emisión depende de que el turno cierre efectivamente con caja negativa.
- La proyección de Corralito ahora usa `debtService`, la misma fuente que las cuentas reales. Antes restaba intereses aunque el escenario suspendía su pago. La suspensión y su vencimiento tienen regresión. No se modificaron reglas, efectos, negociación, satisfacción ni ponderación electoral.
- La ayuda de indicadores y resultados electorales funciona con teclado/tacto y tiene contraste adecuado para el tema claro.

## Validación

Desde `project-bolt-sb1-dzgqso GobernArg 21-11/project`:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 4173
npm run lint
npm run typecheck
npm test
npm run build
npm run playtest
```

Resultados registrados: lint PASS (0 errores, 7 advertencias preexistentes de Fast Refresh), typecheck PASS, 29 archivos / 311 tests PASS, build PASS y 2 suites de playtest PASS (incluye matriz con 20 semillas por celda). No se agregaron dependencias ni se desactivaron assertions. `fullClosing.test.tsx` verifica ayuda sin selección accidental en mouse/tacto, retorno del foco, consulta por teclado/Escape, quitar una selección sin acciones e intereses de Corralito antes/después del vencimiento.

El cambio de proyección puede modificar decisiones de bots que la consultan, particularmente en Corralito. No representa un cambio de balance: `closeTurn`, agenda, efectos y cálculo electoral no se modificaron. Los informes generados del playtest se conservan como artefactos de ejecución separados del cambio de implementación.

La QA de navegador y la relación SHA/despliegue se registran en el informe integrado del cierre. Este documento no declara publicación ni sustituye esa comprobación. Las partidas Full conservan su esquema y clave existentes; no se cambió persistencia.

Se aplicó la checklist React: estado local mínimo para ayuda, sin efectos de sincronización nuevos, hooks en orden estable, controles de selección separados de ayuda, triggers enfocables, semántica de estado y TypeScript sin `any` añadido.

## Verificación visual final

La QA integrada completó una partida real de 32 turnos desde la interfaz, con dos legislativas, reelección, eventos y victoria final; también comprobó selección/cancelación por teclado, ayuda, reunión, recarga, persistencia y primera secuencia móvil sin errores de consola.

El tema Despacho invierte las escalas numéricas de Tailwind. Para evitar que una clase aparentemente oscura termine siendo pálida, las superficies revisadas usan texto semántico explícito (`positive`, `negative`, `caution`, `info-ink`) sin modificar fondos ni etiquetas blancas. Una nueva comprobación en Chromium tomó 36 muestras de colores calculados de KPI, tarjetas, Congreso, proyección y resumen: contraste mínimo observado 6,28:1 sobre sus fondos, sin errores. Capturas y `computed.json` se guardaron en la carpeta de evidencia `qa/Full-contrast` del informe integrado.
