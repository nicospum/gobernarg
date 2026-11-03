# Plan: Corralito 2001, Hiper 1989 y el consultor Gastón Barenboim

Rama: `codex/gobernarg-light-cierre-2026-10-27` (es la que publica https://valigt.netlify.app). Base: commit `778abcf`.
Alcance: solo los dos escenarios históricos y el consultor. No se tocan Fácil, Normal ni Argentina (salvo que Gastón también los visita).

## 1. Qué se construye

1. **Escenarios históricos rehechos**: estado inicial con base histórica, una fase de emergencia de 3 subrondas al arrancar, medidas extraordinarias "TOTAL" sin costo y con apuesta, catálogo regular recortado, reglas de derrota propias y objetivos visibles.
2. **Gastón Barenboim**: consultor político que se acerca solo, dos veces por elección como máximo, con tres opciones y efectos sobre la intención de voto.
3. **Pruebas y publicación**: tests, partidas automáticas con trayectorias documentadas, recorrido en navegador (escritorio y celular) y deploy a valigt para que lo juegues.

## 2. Escenarios históricos

### 2.1 Fases de una partida histórica

| Fase | Qué es | Cuántas decisiones |
|---|---|---|
| **Emergencia** (3 subrondas) | Corralito: "Primera semana de diciembre", "Mediados de diciembre", "Fin de año" (2001). Hiper: "Junio", "Julio", "Agosto" (1989). El calendario no avanza: son semanas o meses dentro del primer trimestre. | Una medida extraordinaria por subronda (o ninguna) y "Cerrar la semana / el mes". Sin grilla de políticas: solo el bloque de emergencia. |
| **Gestión** (16 trimestres) | El mandato normal del calendario histórico (legislativas en T8, presidenciales en T16). | 4 acciones regulares por turno más **una** medida extraordinaria por turno mientras sigan habilitadas. |

En las subrondas no se ejecuta un trimestre completo: solo pasan (a) los efectos inmediatos de la medida elegida, (b) la dinámica propia de la crisis (corrida de depósitos, aceleración de precios, calle) y (c) una actualización parcial del humor de los actores. Lo diferido de cada medida llega con los cierres trimestrales. Es una aproximación explícita: una subronda ≈ 3 a 4 semanas.

### 2.2 Punto de partida (hipótesis de diseño, a calibrar con simulaciones)

| Indicador | Corralito 30/11/2001 | Hiper 1/6/1989 | Dato que lo orienta |
|---|---|---|---|
| Precios (INFL) | 12 (deflación: IPC 2001 −1,5 %) | 96 (mayo 1989: 78,5 % mensual, CEPAL) | índice 0-100, no es % |
| Actividad (ACTV) | 33 (PIB 2001 −4,4 %, desocupación 18,3 %) | 36 | |
| Bolsillo (PODA) | 35 (pobreza 38,3 %, oct-2001) | 24 (pobreza GBA 25,9 % en mayo → 47,3 % en octubre) | |
| Inversión y crédito (INVC) | 20 | 18 | sin crédito |
| Divisas (EXTE) | 20 (corrida del 30/11: −2,5 % de depósitos en un día) | 16 (BCRA sin reservas desde febrero) | |
| Solvencia (SOLV) | 15 | 12 (moratoria de hecho desde abril de 1988) | derivado |
| Conflictividad (CONF) | 60 | 70 (saqueos del 24 al 30 de mayo) | subir empeora |
| Protección social (PSOC) | 33 | 30 | |
| Instituciones (INST) | 40 | 42 | |
| Caja / gasto / deuda | 450 / 820 / 6.000 | 250 / 850 / 5.000 | unidades internas |
| Expectativas (desanclaje) | 2 (la convertibilidad ancla) | 30 (sin ancla) | oculto |
| Congreso / imagen | −6 bancas, imagen 25 (tras perder las legislativas de oct-2001) | −8 bancas, imagen 22 (gobierno saliente, elección del 14/5 perdida) | |
| Condiciones iniciales | Convertibilidad vigente (1 peso = 1 dólar); retiros libres; deuda pagándose; **sin** corralito, **sin** default, **sin** devaluación | Austral; default de deuda vigente (desde 1988) hasta que se renegocie; estado de sitio ya declarado (29/5) por una subronda; transición abierta | |

Se sacan: el +12 de gobernabilidad automático (pasa a ser la medida "Ley de emergencia", que hay que conseguir) y el rebote automático de actividad (pasa a ser condicional: solo si hay nuevo régimen y precios contenidos / si la inflación se calma). El default **no vence por tiempo**: dura hasta que se renegocia.

### 2.3 Reglas de derrota y de éxito propias

- **Durante la emergencia**: Corralito: gobernabilidad bajo 15 dos subrondas seguidas → "El presidente renuncia". Hiper: precios en 95 o más **y acelerando** dos subrondas seguidas → "Hiperinflación". La regla general de hiper (90 dos trimestres) queda suspendida en la emergencia y vuelve en la gestión, arrancando de cero.
- **Después**: las reglas normales. Las elecciones y la reelección funcionan igual; ganar no inventa reelecciones en el progreso.
- **Objetivos visibles** (bloque de emergencia y metas de gestión). Corralito: contener la corrida (depósitos estables), caja positiva, liberar los depósitos, deuda renegociada, precios bajo control, calle calma. Hiper: frenar la aceleración (precios ≤ 85 al salir de la emergencia), estabilizar (≤ 60), ingresos básicos sostenidos, transición o moneda nueva que se sostenga, deuda renegociada.
- **Continuación alternativa**: la ficha del escenario dice que desde el episodio la historia es alternativa (en 1989 la entrega real fue el 8 de julio). Un "Acuerdo de transición" es una medida, no un final: no equivale a perder.

### 2.4 Medidas extraordinarias ("TOTAL")

Reglas comunes: **costo cero** en caja y en acciones; **una por turno** (o por subronda); aparecen solo cuando el régimen y el estado de la crisis lo habilitan (y se vuelve a verificar al ejecutar); se muestran en un bloque aparte con un halo de luz; **no se repiten** (una vez activa no vuelve a aparecer); los cambios de régimen son permanentes. Cada una tiene **impacto fuerte ya** y una **apuesta** que se resuelve 2 a 4 trimestres después: si cumpliste la condición, premio grande; si no, explota. La tarjeta dice en una línea "Sale bien si… / Explota si…", sin números.

**Corralito 2001**

| Medida | Cuándo aparece | Impacto inmediato (resumen) | Apuesta |
|---|---|---|---|
| Limitar los retiros de efectivo (corralito) | retiros libres y corrida en marcha | frena la salida de depósitos y cuida reservas; paraliza pagos, baja actividad y bolsillo, sube el conflicto | Sale bien si en 3 trimestres hay nuevo régimen y liberás los depósitos. Explota si sigue vigente. |
| Reprogramar TODOS los depósitos a plazo (corralón) | corralito vigente y bancos al límite | los bancos respiran; ahorristas furiosos, instituciones y crédito abajo | Sale bien si después estabilizás precios y divisas. Explota si no. |
| Liberar los depósitos | corralito o corralón vigentes y liquidez o divisas recuperadas | alivio de calle y crédito | Sale bien si hay divisas. Explota si vuelve la corrida. |
| Salir de la convertibilidad: devaluar | convertibilidad vigente | divisas arriba, precios y salarios golpeados, financiero enojado, campo e industria contentos | Sale bien si contenés el traslado a precios (tasas o acuerdo). Explota si los precios se disparan. |
| Dolarizar TODA la economía | convertibilidad vigente y algo de reservas | precios anclados para siempre, sin emisión ni devaluación nunca más; reservas y soberanía abajo | Sale bien si ordenás las cuentas. Explota si hay déficit: sin emisión, el ajuste cae en la actividad y los salarios. |
| Pesificar TODO: deudas y depósitos | sin convertibilidad y depósitos restringidos | deudores aliviados, bancos rotos, ahorristas en la calle, el Estado absorbe con bonos | Sale bien si vuelve el crédito y los precios no se disparan. Explota en amparos y más conflicto. |
| Suspender TODOS los pagos de la deuda (default) | deuda pagándose | sin intereses ni crédito; aplausos en el Congreso, finanzas afuera | Sale bien si renegociás dentro de 6 trimestres. Explota si seguís aislado. |
| Renegociar la deuda con quita | default vigente hace 3+ turnos y algo de solvencia o gestión diplomática | resultado incierto (depende de solvencia, relación con finanzas y cuentas) | Si sale: quita del 35 %, intereses reducidos y vuelve el crédito. Si no: imagen y riesgo país peor. |
| Pagar con cuasimonedas (patacones y lecop) | caja floja | plata para pagar sueldos; precios, bolsillo e instituciones abajo; gobernadores contentos | Sale bien si rescatás las cuasimonedas con precios controlados. Explota si se desvalorizan. |
| Ley de emergencia económica | mayoría o consenso (ley, no admite DNU) | gobernabilidad y Congreso con margen por 6 turnos; instituciones un poco abajo | Sin apuesta: cuando vence, el margen se va. |
| Estado de sitio | conflictividad muy alta | la calle se vacía un turno; instituciones, imagen y derechos humanos muy abajo | Sale bien si estabas atendiendo el hambre (protección social). Explota si no: la represión enciende la calle (19/12). |
| Pedir un rescate al FMI | sin default | incierto (depende de solvencia y cuentas): si lo dan, caja, reservas y respaldo; con meta fiscal revisada a 4 turnos | Sale bien si hay superávit a la revisión. Explota si no: se cae el desembolso. |
| Apertura TOTAL de importaciones | siempre | precios y bolsillo mejor; industria y PyMEs furiosas, divisas abajo | Sale bien si hay divisas e inversión. Explota en desindustrialización y desempleo. |
| Reformar la Constitución | acuerdo con la oposición o relación muy alta (ley, no admite DNU) | gobernabilidad y bancas; instituciones y oposición abajo | Sale bien si tenés aprobación. Explota si gobernás sin apoyo. |

**Hiper 1989**

| Medida | Cuándo aparece | Impacto inmediato (resumen) | Apuesta |
|---|---|---|---|
| Congelamiento TOTAL de precios y salarios | siempre (una vez) | el dato de inflación cae de golpe dos turnos; expectativas se calman; crédito y actividad un poco abajo | Sale bien si hay respaldo fiscal y de divisas: precios bajan en serio. Explota en desabastecimiento y rebote. |
| Nueva moneda con respaldo | divisas mínimas | inflación y expectativas abajo, imagen arriba | Sale bien si hay superávit y reservas: la moneda se sostiene. Explota si no: la moneda nueva se derrite. |
| Shock fiscal: tarifazo, recorte TOTAL de subsidios y tasas por las nubes | siempre | gasto fijo baja para siempre; precios suben ahora y bajan después; crédito, actividad, bolsillo y calle golpeados | Sale bien si la inflación baja: vuelve el crédito. Explota si no: ajuste sin resultados y calle encendida. |
| Vender TODAS las reservas para frenar el dólar | divisas > 10 | dólar contenido un par de turnos; reservas abajo | Sale bien si las expectativas se calman. Explota si no: reservas quemadas y dólar disparado (febrero 1989). |
| Devaluación de shock | siempre (una vez) | divisas arriba, precios y bolsillo muy golpeados, campo contento | Sale bien si hay divisas y precios contenidos. Explota en más inflación. |
| Emergencia alimentaria TOTAL (cajas PAN y bonos) | siempre | protección social, bolsillo y calle mejor ya; costo de caja diferido 2 turnos; organizaciones y sindicatos contentos | Sale bien si los precios no se comen la plata. Explota si sí. |
| Acuerdo de transición con la oposición | relación con la oposición mínima | gobernabilidad, Congreso, instituciones y expectativas mejor; tu partido ofendido, imagen abajo | Sale bien si el programa conjunto baja la inflación. Explota si la oposición rompe. |
| Privatizar TODAS las empresas del Estado. Todas. | siempre (una vez) | caja enorme una sola vez y gasto fijo abajo; sindicatos y organizaciones furiosos, despidos | Sale bien si hay crédito e instituciones: llega la inversión. Explota en tarifazos, obras abandonadas y corrupción. |
| Apertura TOTAL de importaciones | siempre | ídem 2001 | ídem |
| Dolarizar TODA la economía | reservas mínimas (en 1989 casi siempre bloqueada: "no hay reservas") | ídem 2001 | ídem |
| Renegociar la deuda con quita | default vigente y 3+ turnos | ídem | ídem |
| Pedir un rescate al FMI | deuda renegociada | ídem | ídem |
| Estado de sitio | conflictividad muy alta (en junio ya rige el del 29/5) | ídem | ídem |
| Reformar la Constitución | acuerdo con la oposición | ídem | ídem |

**Catálogo regular recortado** en estos escenarios (siguen 26): emisión, tasas, cepo y liberar cepo, control de precios, ajuste del gasto, deuda local, recaudación, retenciones (subir y bajar), salarios estatales, salario mínimo, pacto social, transferencias sociales, asistencia alimentaria, bono a jubilados, tarifas (congelar y actualizar), crédito PyME, promoción industrial, incentivos a la exportación, reforma laboral, seguridad, antipiquetes, DNU, ampliar la coalición, transferencias a provincias y agenda internacional. Se ocultan las 30 restantes (turismo, cultura, ciencia, obras, hospitales, ambiente, etc.) y las que reemplaza una extraordinaria (devaluación, privatización, préstamo internacional).

### 2.5 Interfaz

- **Bloque "Emergencia"** arriba de todo (escritorio y celular): etapa y subronda, qué está pasando en tres líneas (contexto histórico separado de lo simulado), estado de la crisis en palabras (régimen cambiario, depósitos, deuda, inflación mensual estimada con tendencia "acelerando / frenando"), objetivos, y la lista de medidas extraordinarias con **halo de luz**, cada una con: qué intenta resolver, principal costo o riesgo, "Sale bien si / Explota si", y por qué está disponible o qué falta. Botón "Cerrar la semana / el mes" durante la emergencia.
- **Resumen de la subronda**: modal corto con lo que pasó y por qué.
- En la gestión, el bloque sigue arriba de la grilla (más chico) con las medidas que quedan habilitadas; la grilla no las repite.
- Ficha de los escenarios en "Nueva partida": fecha de inicio, moneda, qué está pasando y la aclaración de historia alternativa.

### 2.6 Guardados

Las partidas históricas anteriores (sin estado de crisis) siguen con sus reglas: default a 8 turnos, rebote automático, sin bloque de emergencia. Las nuevas llevan `causal.crisis` (versión 1) validado al cargar. Se prueba cargar un guardado anterior con default y rebote programados.

## 3. Gastón Barenboim, consultor político

- Visita como evento con su retrato (pixel art), en todos los escenarios, por cada elección del mandato: **anticipada** (turno 2 del mandato para las legislativas; dos turnos después de las legislativas para las presidenciales) y, solo si en la anticipada seguiste tu instinto, **a último momento** (primer turno del año electoral). Nunca es obligatorio.
- Siempre trae el dato de las encuestas: el sector con votos al que no le venís tirando la soga y la medida concreta que lo mueve (distinta de lo que hiciste en los últimos turnos).
- Tres opciones: **"Lo que diga el encuestador, se hace"** (pagás el honorario; esa medida queda agendada y fijada en el turno), **"No le doy vuelo, me fijo qué dicen en las redes"** (gratis) y **"Sigo mi instinto"** (nada cambia).
- Intención de voto hasta la elección (legislativas): encuestador anticipado +4 · redes anticipado −4 · encuestador a último momento +2 · redes a último momento −2 · instinto 0. **Presidenciales: todo ×1,5.** Honorario: anticipado $150 M, último momento $350 M (×1,5 en presidenciales). Nada de esto se explica en el juego.
- Textos: dos discursos (lejos de la elección: "en la Argentina siempre se vive en elecciones"; año electoral: "el Mundial de la política, ya llegan las encuestas"), reescritos con voseo y tono de chanta simpático.

## 4. Pruebas y cómo probarlo vos

1. Tests nuevos: motor de crisis (subrondas, dinámica, apuestas, una por turno, catálogo recortado, derrotas), escenarios (estado inicial), guardado (nuevo y viejo), consultor (calendario de visitas, recomendación, efectos, honorarios, ×1,5, vencimiento del bono, medida fijada), interfaz (bloque, halo, resumen, evento con retrato).
2. `npm run playtest:historicos`: partidas automáticas por escenario con tres trayectorias (inacción, ortodoxa, heterodoxa) y semillas fijas; tabla de resultados en `_analisis_gobernarg/playtest/HISTORICOS.md`.
3. Recorrido en navegador a 1440 px y 390 px: las tres subrondas de cada escenario, una apuesta que sale bien y una que explota, una visita de Gastón con cada opción.
4. Publicación en valigt. Para probar sin ganar reelecciones, en la consola del navegador: `localStorage.setItem('gobernarg.lite.progress.v1', JSON.stringify({ wonScenarios: [], reelectionsWon: 2, unlockAll: true }))` y recargar.

## 5. Orden de trabajo

1. Datos: escenarios recalibrados, catálogo de medidas extraordinarias con sus efectos y apuestas, textos.
2. Motor: estado de crisis, subrondas, dinámica, regla de una por turno, catálogo recortado, default sin vencimiento, renegociación, derrotas propias, objetivos.
3. Consultor: visitas, recomendación, opciones, bono de voto, honorarios, medida fijada.
4. Interfaz: bloque de emergencia con halo, resumen de subronda, ficha de escenarios, evento de Gastón con retrato, celular.
5. Guardado: validación y compatibilidad.
6. Pruebas, playtest con bots, calibración, recorrido en navegador.
7. Nota única `ESCENARIOS-HISTORICOS-LIGHT.md` (valores definitivos, fuentes, trayectorias, pendientes), commit, push y deploy a valigt.
