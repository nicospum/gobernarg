# Reporte 12 — Oportunidades de diseño de GobernArg (MVP v4.4)

**Autor:** Disenador_Oportunidades (diseño, no técnico)
**Alcance:** mejoras de *game design* sobre el código real leído (`src/engine/`, `src/data/`, `src/components/EventModal.tsx`, `TurnSummaryModal.tsx`, `RightSidebar.tsx`, `GameLog.tsx`, `GameOverModal.tsx`) y las docs `mecanicas-del-juego.md` y `future-engine-features.md`.
**Excluido (ya conocido):** 10 eventos restantes, modo campaña, legitimidad incompleta, ironman, ManagementNotebook, sonidos/tutorial, Fase 6, playtesting de balance, intención de voto, docs desactualizados.

---

## 0. Diagnóstico rápido (qué observé en el código)

Antes de proponer, el estado real del loop:

1. **Un turno = elegir acciones de una lista con números exactos** (`actionEngine.ts` + `actionRegistry.ts`). Toda acción muestra su costo y su efecto determinista. Con 61 acciones, la decisión óptima es una suma — hay una solución de spreadsheet. Los cooldowns con `×0.80` por uso (`actionUsageCount`) desincentivan spam, pero no crean *tensión*.
2. **Los eventos aleatorios están casi apagados**: `GLOBAL_COOLDOWN_TURNS = 3` y `MAX_RANDOM_EVENTS_PER_TERM = 5` (`eventResolver.ts`). En un mandato de 16 turnos hay ~11 turnos cuyo resumen es "El trimestre transcurrió sin novedades destacadas" (`turnProcessor.ts`, línea 599). Los valles aburridos son estructurales, no accidentales.
3. **Las elecciones de eventos muestran sus efectos exactos** (`EventModal.tsx`): badges con `+15 popularidad`, barra de probabilidad. La decisión casi siempre se resuelve comparando dos números. No hay información asimétrica ni consecuencias ocultas.
4. **Las legislativas son 100% automáticas** (`processCalendarEvents` → `calculateLegislativeResults`): el jugador no toca nada. Es el momento político argentino *por excelencia* y es un popup que se mira.
5. **La elección general es una fórmula + ruido ±3%** y umbral único de 45%. No hay rival, no hay campaña, no hay promesas. "Noche electoral" (`narrativeEngine.ts`) es texto bonito sobre un dado.
6. **Los trackings de impeachment/golpe existen pero son invisibles** (`impeachmentConsecutiveTurns`, `coupConsecutiveTurns` en `turnProcessor.ts`). El jugador no ve la navaja acercándose a su cuello hasta que cae.
7. **El motor es puro** (`GameState → GameState`, inmutable en `processEndTurn`). Esto hace trivialmente barato el undo, el autoguardado y el sandbox — aprovecharlo es la oportunidad de QoL más rentable del proyecto.
8. **La victoria es un booleano con texto genérico** (`checkVictoryConditions`: todos los objetivos + pop≥60 + budget>0 → `GameOverModal` muestra "¡Victoria!"). No hay epílogo, grado, ni peso emocional diferencial entre ganar con 46% con 62%.
9. **Reunirse con grupos es siempre positivo y barato** (docs: +5 apoyo, $10×influencia, 2 turnos de calma). Es un botón de rutina sin decisión.
10. **La rejugabilidad actual descansa en 4 arquetipos + dificultad + ejes**. Las 4 dificultades difieren casi solo en multiplicadores (`difficultyEngine.ts`); `baseActionsModifier` ni se consume, así que hard y legend tienen los mismos puntos de acción.

---

## 1. Momentos de decisión

### 1.1 "Rumores" — telegraphear los eventos (PRIORIDAD ALTA)
- **Mecánica:** cuando el motor sortea que un evento *va* a dispararse la próxima vez que su cooldown lo permita, o cuando un evento triggered está a 1 turno de activar sus condiciones, emitir una notificación de "rumor" un turno antes: *"Se rumora malestar en el gremio docente"*, *"Los mercados miran con preocupación tus últimas medidas"*. El evento concreto llega igual, pero el jugador tuvo un turno para pre-emptear (reunirse, guardar presupuesto, subir estabilidad).
- **Por qué mejora:** hoy los eventos son sorpresa pura o silencio puro (`resolveRandomEvents`). El rumor convierte los valles en anticipación: la tensión no está en el evento, está en el turno anterior. Es el cambio de diseño de mayor impacto sobre el ritmo de partida.
- **Costo:** chico (notificación extra en `eventResolver`/`turnProcessor`; el sistema de notificaciones ya existe).
- **Riesgos:** si el rumor es demasiado específico, revela el contenido del evento; mantenerlo vago ("malestar docente" puede ser paro o marcha). No telegraphar eventos positivos o el jugador farmea anticipación.

### 1.2 Mini-campaña legislativa y sprint final presidencial
- **Mecánica:** (a) En Año 2 T3–T4 (ante las legislativas), ofrecer 2–3 decisiones de campaña: *¿cuánto gastás en actos?* (presupuesto → votos), *¿aliás con qué sector?* (sube un grupo, baja su antagonista), *¿cabezas de lista técnica o militante?* (pop vs estabilidad). El resultado legislativo actual (`calculateLegislativeResults`) se ajusta con los modificadores acumulados. (b) En Año 4 T3, una decisión análoga de cierre de campaña general.
- **Por qué mejora:** las legislativas son hoy un popup pasivo; pasarían a ser el primer pico de decisión del mandato. Además da *agencia* sobre un resultado que hoy es formula + ruido.
- **Costo:** medio (diálogo nuevo + ajuste del cálculo legislativo + persistencia de modificadores).
- **Riesgos:** puede trivializarse si un gasto grande siempre compra votos; poner rendimientos decrecientes al gasto de campaña. No duplicar: esto se solapa con el pendiente "modo campaña" — implementar la versión chica aquí.

### 1.3 Hacer "Reunirse" una decisión, no un tic
- **Mecánica:** la reunión deja de dar +5 garantizado: el resultado depende del mood del grupo (un grupo *radicalizado* da +1 o incluso -1 si tu eje está en el extremo opuesto; un grupo *contento* da +8). Mostrar una estimación cualitativa ("esperás una buena recepción" / "el clima es hostil") en vez del número exacto.
- **Por qué mejora:** hoy es un botón de rutina cada 2 turnos (docs de mecánicas). Con esto, reunirse con un grupo enojado *después* de moderar tu discurso se vuelve una secuencia estratégica, y el eje ideológico deja de ser solo un modificador pasivo para condicionar el trato cara a cara.
- **Costo:** chico (ajustar `groupAgendaEngine`/interacciones + tooltip).
- **Riesgos:** frustración si el resultado se siente arbitrario; la pista cualitativa es obligatoria. No tocar Negociar/Conceder, que ya tienen trade-offs bien diseñados.

### 1.4 Decisiones de eventos con costos ocultos (efectos diferidos ya soportados)
- **Mecánica:** el sistema soporta `effects.delayed` (`applyEventChoice` ya los procesa), pero casi ningún evento con opciones lo usa. Escribir las opciones de los ~18 eventos actuales para que las opciones "fáciles" tengan cola de factura (ej.: "Forzar la agenda" añade un efecto diferido de -estabilidad en 2 turnos; "Aceptar la coalición" genera una demanda futura del aliado).
- **Por qué mejora:** hoy la comparación de badges decide sola. La factura diferida rompe la optimalidad de spreadsheet y es exactamente el principio filosófico #1 de la propia doc ("el camino es sinuoso").
- **Costo:** chico (es data: editar los eventos existentes, no tocar el motor).
- **Riesgos:** si el jugador no puede rastrear los efectos diferidos, se siente engaño. Obligatorio: mostrar en la opción un indicador "consecuencias a futuro" y listarlas en `PendingEffectsPanel` (ya existe).

---

## 2. Feedback y legibilidad

### 2.1 Medidores de presión: hacer visibles los trackings de derrota
- **Mecánica:** contadores visibles: *"Riesgo de revocatoria: 1/2 turnos"*, *"Presión de impeachment: 1/2"*, *"Rumor de golpe institucional: 1/3"*, junto al indicador de riesgo electoral que ya existe en `RightSidebar`.
- **Por qué mejora:** hoy `consecutiveLowPopularity`, `impeachmentConsecutiveTurns` y `coupConsecutiveTurns` computan en silencio. Ver la navaja en 1/2 convierte "me cayó una derrota" en "sobreviví a tiempo" o "la arruiné yo".
- **Costo:** chico (UI de sidebar con datos ya en el estado).
- **Riesgos:** casi ninguno; a lo sumo ruido visual si se muestran cuando están en 0 (mostrar solo cuando >0).

### 2.2 "¿Por qué cambió mi popularidad?" — desglose en el resumen de turno
- **Mecánica:** el `TurnSummaryModal` ya muestra el delta agregado de popularidad y presupuesto. Agregar desglose por fuente: desgaste natural (-10), acciones (+X), eventos (±Y), estrategia post-legislativa (±Z). El turnProcessor ya acumula `totalPopularityChange` por fases; falta etiquetar.
- **Por qué mejora:** con un desgaste de -10/turno fijo (presidente), el jugador nuevo no entiende por qué "todo baja". Hoy la curva de aprendizaje depende de leer la doc. El desglose enseña la economía del juego sin tutorial.
- **Costo:** chico (etiquetar contribuciones por fase en `processEndTurn` y renderizar).
- **Riesgos:** revelar demasiado puede gamificarse; el desglose histórico completo puede quedar solo en `GameLog` y el modal mostrar los top-3.

### 2.3 Encuestador: convertir la incertidumbre en recurso jugable
- **Mecánica:** nueva acción (o asesor) "Encuesta de opinión": revela la intención de voto con margen de error (±4%) y el mood exacto de un grupo elegido. Sin encuesta, los moods muestran solo etiquetas cualitativas. El `votingIntention` existe ya en el estado (`RightSidebar` lo lee) — esto regula *cómo* se presenta.
- **Por qué mejora:** la incertidumbre es feature (no revelar todo), pero hoy la información llega gratis y exacta. Cobrarla en presupuesto/acción crea una decisión de gestión de información muy política ("¿gasto plata en saber si voy perdiendo?").
- **Costo:** chico-medio (acción nueva + variantes de display con/sin dato).
- **Riesgos:** alto riesgo de frustración si se esconde info que antes era visible. Mitigación: aplicarlo primero a moods y factores de voto, no al número crudo de intención.

### 2.4 Diario "El Balance" — el resumen de turno como tapa de periódico
- **Mecánica:** rediseñar `TurnSummaryModal` como tapa de diario: titular periodístico ("AUSTERIDAD Y QUEJAS: EL AJUSTE LLEGA AL CONURBANO"), subtítulo, y los números abajo en un recuadro de "números del trimestre". Los titulares se generan por plantillas desde los eventos ocurridos y las magnitudes de cambio.
- **Por qué mejora:** transforma el momento más repetido del juego (16+ veces por partida) en el principal portador de fantasía argentina. Texto barato, impacto emocional altísimo, y reemplaza el genérico "sin novedades destacadas" por humor periodístico.
- **Costo:** chico (plantillas + reestructuración del modal; imágenes ya existen en `imageAssets`).
- **Riesgos:** repetición de titulares si el pool de plantillas es chico; invertir en variedad desde el día uno.

---

## 3. Variedad y rejugabilidad

### 3.1 Ciclo macro exógeno (el "clima" de cada mandato)
- **Mecánica:** al iniciar mandato, sortear un contexto mundial que dura 4 años: *Boom de commodities* (ingresos +20%, eventos de sobreconfianncia), *Sequía/agro en crisis* (ingresos -15%, eventos rurales), *Crisis global* (crisis prob ×1.5, préstamos caros), *Calma internacional* (neutral, mayor peso de errores propios). Se anuncia en el inicio y aparece en el header.
- **Por qué mejora:** dos partidas hoy difieren solo por arquetipo y RNG de eventos. El ciclo macro obliga a releer la partida ("esta vez el problema no fui yo, es el contexto — ¿o sí?") y modulariza dificultad sin tocar multiplicadores. Muy fiel a la experiencia argentina real.
- **Costo:** medio (campo en estado + multiplicadores en `turnProcessor`/`eventResolver` + UI).
- **Riesgos:** puede sentirse como dificultad disfrazada si el ciclo se sabe injusto; anunciarlo y dar 1 turno de gracia. Balancear los cuatro ciclos entre sí.

### 3.2 Promesas de campaña elegidas
- **Mecánica:** al asumir/iniciar mandato, elegir 3 promesas de una lista (ej.: "Bajar la inflación", "Terminar la obra X", "Ningún paro docente en el año 1"). Se convierten en objetivos extra con recompensa alta; incumplirlas genera noticia de tapa y -legitimidad/-pop. Cumplirlas da el momento más dulce del juego.
- **Por qué mejora:** hoy los objetivos se asignan automáticos (`getPositionObjectives`). Elegirlos = identidad de gobierno, dos partidas con el mismo arquetipo se sienten distintas, y el jugador deja de evaluarse con la vara del diseñador sino con la propia.
- **Costo:** medio (listado de promesas + UI de elección + reacción de incumplimiento).
- **Riesgos:** promesas mal calibradas (imposibles) rompen la confianza; hacerlas todas alcanzables y testeables.

### 3.3 Rival político con agenda simple
- **Mecánica:** un líder opositor con nombre, personalidad (agresivo/institucional/oportunista) y una barra de "fuerza opositora". Cada tanto hace movidas: pedido de juicio político (con probabilidad ligada a su fuerza y tus trackings), crítica pública (-pop), oferta de pacto (evento con opciones). Su fuerza crece con tu desgaste.
- **Por qué mejora:** el antagonismo hoy es estadístico (`opositores` es un número). Un rostro humano (aunque sea texto) convierte las crisis en duelo narrativo. Es el mayor generador de historias "contables en el bar" que el juego podría tener.
- **Costo:** medio-grande (estado del rival + generador de acciones + eventos asociados + UI).
- **Riesgos:** sensibilidad política (mantenerlo ficticio y caricaturesco, no mapear a personas reales); riesgo de que el rival sea una molestia plana si sus movidas no tienen counterplay.

### 3.4 Condiciones iniciales aleatorias
- **Mecánica:** al crear partida, sortear 1 "herencia": presupuesto heredado deficitario, un grupo radicalizado, una obra inconclusa (prerequisito), o un escándalo del gobierno anterior (-legitimidad inicial). Mostrarla en pantalla de inicio como "Lo que te dejó la gestión anterior".
- **Por qué mejora:** arranques distintos sin tocar el balance global; inmediatamente narrativo ("heredé el desastre").
- **Costo:** chico (tabla de herencias + aplicación en init).
- **Riesgos:** herencias que invaliden arquetipos; testear combinaciones.

---

## 4. Fantasía argentina (barato y de alto impacto)

### 4.1 Pack de eventos icónicos (data-only, PRIORIDAD ALTA)
- **Mecánica:** 8–10 eventos nuevos usando el sistema existente (condiciones + choices + efectos diferidos). Los más rentables:
  - **"Acuerdo con el Fondo"**: oferta de préstamo gigante (+$800M) vs. condiciones (-pop con sectores populares, -legitimidad, demanda futura de ajuste).
  - **"Cepo cambiario"**: ponerlo (+estabilidad corto plazo, -legitimidad, efecto diferido: evento "fuga de capitales"), no ponerlo (-reservas→presupuesto).
  - **"Paro docente"** (triggered si educación desatendida): pagar aumento / resistir (estabilidad vs presupuesto, con efecto diferido de repetición).
  - **"Tarifazo"**: subir tarifas (+presupuesto mensual por 3 turnos, -sectores populares, cacerolazo diferido si estabilidad <40).
  - **"Cacerolazo"** (triggered: estabilidad <30 y eje cerrado): salir a explicar / reprimir / ignorar.
  - **"Reforma previsional"**: gran reforma (consume apoyo legislativo alto, +presupuesto permanente, -estabilidad inmediata, efecto diferido positivo).
  - **"Devaluación súbita"** (crisis): aceptar devaluación (-pop, +competitividad diferida) / gastar reservas tapándola (-presupuesto).
  - **"Coparticipación en disputa"**: pacto con gobernadores (ceder % de ingresos a cambio de +apoyo legislativo).
  - **"Marcha universitaria"** / **"Piquete en la ruta"**: eventos sociales con choices de contención vs confrontación.
- **Por qué mejora:** son los memes emocionales de la política argentina; cada uno es una historia que el jugador ya conoce y quiere "vivir distinto esta vez". Aprovecha el `MAX_RANDOM_EVENTS_PER_TERM` y el limitador de cooldown ya existentes.
- **Costo:** chico (solo data + alguno triggered; el motor ya soporta todo).
- **Riesgos:** tono (evitar realismo de partido; usar arquetipos genéricos). No saturar: respetar el límite de 5/mandato o subirlo a 6.

### 4.2 Asado-index: un indicador easter-egg
- **Mecánica:** en el header o sidebar, un indicador humorístico "Precio del asado" que sube con emisiones monetarias y baja con economía sana. Sin efecto mecánico (o mínimo: a 7 emisiones, ya hiperinflación, muestra "asado imposible").
- **Por qué mejora:** comunica inflación mejor que cualquier número, regala sonrisa y captura de pantalla compartible (marketing orgánico).
- **Costo:** chico.
- **Riesgos:** trivial; mantenerlo como sabor, no como mecánica.

### 4.3 Gabinete y escándalos
- **Mecánica:** al inicio del mandato, asignar 3 ministros (Economía/Social/Interior) de un pool: cada uno da un bonus de categoría. Cada tanto puede saltar un escándalo de un ministro; opciones: respaldarlo (risgo de contagio), echarlo (perdés el bonus, +transparencia). La data de asesores (`advisors.ts`) ya es terreno fértil.
- **Por qué mejora:** sacrificar a un ministro es *el* gesto político argentino por antonomasia; además introduce pérdida de bonus = decisión con costo real.
- **Costo:** medio.
- **Riesgos:** complejidad de UI (otro panel); si los escándalos son puro RNG, frustran — ligarlos a ejes/acciones (el ministro de Economía escandaliza si sos muy populista, etc.).

---

## 5. Progresión y sentido de logro

### 5.1 Grado de gestión y epílogo (PRIORIDAD ALTA)
- **Mecánica:** al terminar la partida (victoria o derrota), calcular un grado S/A/B/C/D a partir de métricas ya existentes (popularidad final, presupuesto, estabilidad, objetivos, margen electoral, ejes extremos) y generar un epígrafe: S="Estadista", A="Gestor sólido", B="Sobreviviste", C="Gobierno desgastado", D="Gestión fallida" + 2–3 líneas de crónica generadas desde `turnLog` y `careerHistory` ("Heriste un país con dos cacerolazos y un cepo, pero terminaste con las cuentas en orden").
- **Por qué mejora:** hoy victoria y derrota tienen casi el mismo peso emocional (un modal). El grado da la conversación post-partida ("me saqué un A con el Sindicalista") y es la base natural de un futuro modo campaña con puntuación.
- **Costo:** chico (función de scoring + textos; `GameOverModal` y `LegacyScreen` ya existen como contenedores).
- **Riesgos:** fórmula opaca; mostrar los criterios en el modal.

### 5.2 Hall of Fame local
- **Mecánica:** persistir en localStorage las últimas N partidas (arquetipo, dificultad, resultado, grado, turno de fin). Tabla accesible desde el menú.
- **Porqué:** convierte el grado (5.1) en competencia contra uno mismo; costo ínfimo porque ya hay serialización de estado en juego.
- **Costo:** chico.
- **Riesgos:** casi ninguno.

### 5.3 Logros/momentos memorables ("huellas")
- **Mecánica:** registrar hitos de partida: "Sobreviví un impeachment", "Gané las legislativas con >50%", "Cero emisiones en el mandato", "7 paros enfrentados". Mostrarlos en la pantalla final como sellos.
- **Por qué mejora:** las victorias "aburridas" (principio filosófico #5: "sostuviste el país en pie") hoy no se celebran. Los sellos celebran el *cómo*, no solo el ganar.
- **Costo:** chico (checks sobre estado/log).
- **Riesgos:** lista de logros que nadie lee si son demasiado; 8–12 bien escritos.

---

## 6. Calidad de vida

### 6.1 Undo de turno (PRIORIDAD ALTA en QoL)
- **Mecánica:** el motor es puro (`GameState → GameState`); guardar un stack de snapshots (o uno solo) antes de cada `processEndTurn` y ofrecer "Deshacer turno" (una vez, o hasta gastar). En dificultades con ironman, deshabilitado.
- **Por qué mejora:** elimina el miedo a experimentar, el principal freno del juego de decisiones opacas. Costo ridículo dada la arquitectura.
- **Costo:** chico.
- **Riesgos:** rompe la tensión de decisiones irreversibles; limitarlo a 1 por mandato o solo en fácil/normal al principio.

### 6.2 Autoguardado + "Continuar"
- **Mecánica:** serializar `GameState` a localStorage al final de cada turno (función ya existe de facto si el estado es serializable) y botón Continuar en el menú.
- **Costo:** chico.
- **Riesgos:** versionado del save al cambiar el schema; guardar `version` y migrar o invalidar.

### 6.3 Dificultades bien diferenciadas
- **Mecánica:** consumir `baseActionsModifier` (hoy ignorado): fácil +1 acción, difícil/leyenda -1. Agregar diferencias cualitativas: difícil arranca con un grupo radicalizado; leyenda arranca con herencia deficitaria y muestra menos pistas (sin desglose 2.2, sin rumores precisos 1.1). Leyenda = ironman sin undo y sin save-scum.
- **Por qué mejora:** hoy hard y legend se distinguen en dos multiplicadores; la diferencia entre un jugador casual y uno experto debería ser *qué información y cuánta agencia* tiene.
- **Costo:** chico-medio.
- **Riesgos:** -1 acción cambia mucho el balance; jugarlo antes de fijar.

### 6.4 Modo sandbox
- **Mecánica:** checkbox en nueva partida: presupuesto y acciones ilimitados (o trucos por tecla), sin derrota. Pensado para probar eventos y para el jugador que quiere armar el "gobierno soñado".
- **Costo:** chico (el motor acepta estado arbitrario).
- **Riesgos:** sin límites, las acciones con cooldown son el único freno; marcar claramente "partida no válida para hall of fame".

### 6.5 Velocidad de partida
- **Mecánica:** opción "saltar resumen" (mostrar modal solo si hay eventos/elecciones), animaciones rápidas, y tecla para confirmar fin de turno.
- **Costo:** chico.
- **Riesgos:** perder el diario (4.1) — resolver poniendo el modo diario condensado en una bandeja de noticias en vez de eliminarlo.

---

## Priorización final (impacto / costo)

| # | Propuesta | Categoría | Impacto | Costo |
|---|-----------|-----------|---------|-------|
| 1 | Rumores (telegraphing de eventos) | 1. Decisiones | Alto | Chico |
| 2 | Pack de eventos argentinos icónicos | 4. Fantasía | Alto | Chico |
| 3 | Grado de gestión + epílogo | 5. Logro | Alto | Chico |
| 4 | Diario "El Balance" (resumen como tapa) | 2. Feedback | Alto | Chico |
| 5 | Undo de turno | 6. QoL | Alto | Chico |
| 6 | Medidores de presión (trackings visibles) | 2. Feedback | Medio-Alto | Chico |
| 7 | Efectos diferidos en opciones de eventos | 1. Decisiones | Medio-Alto | Chico |
| 8 | Promesas de campaña | 3. Rejugabilidad | Alto | Medio |
| 9 | Mini-campaña legislativa + sprint final | 1. Decisiones | Alto | Medio |
| 10 | Ciclo macro exógeno | 3. Rejugabilidad | Alto | Medio |
| 11 | Desglose "por qué cambió mi popularidad" | 2. Feedback | Medio | Chico |
| 12 | Autoguardado + continuar | 6. QoL | Medio | Chico |
| 13 | Hall of fame + sellos memorables | 5. Logro | Medio | Chico |
| 14 | Herencias/condiciones iniciales aleatorias | 3. Rejugabilidad | Medio | Chico |
| 15 | Reunirse como decisión (mood + ejes) | 1. Decisiones | Medio | Chico |
| 16 | Dificultades cualitativas + ironman | 6. QoL | Medio | Chico-Medio |
| 17 | Encuestador / info como recurso | 2. Feedback | Medio | Chico-Medio |
| 18 | Sandbox | 6. QoL | Bajo-Medio | Chico |
| 19 | Rival político con agenda | 3/4. Narrativa | Alto | Medio-Grande |
| 20 | Gabinete y escándalos | 4. Fantasía | Medio-Alto | Medio |
| 21 | Asado-index (easter egg) | 4. Fantasía | Bajo | Chico |

**Orden sugerido de implementación:** el bloque 1–7 son siete cambios chicos que transforman el ritmo, el feedback y el cierre emocional de la partida sin tocar el balance profundo; el bloque 8–10 son los tres medianos que más rejugabilidad aportan; 19 y 20 reservarlos para cuando el MVP esté pulido (Fase 6).

**Dependencia crítica:** casi todas las propuestas chicas (1, 4, 6, 7, 11) se benefician del sistema de notificaciones ya existente — es la infraestructura de diseño más subaprovechada del proyecto.
