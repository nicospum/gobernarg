# Informe de playtest — motor causal

**Método:** 11 bots juegan partidas completas usando **las mismas funciones que la UI** (`processEndTurn`, `interactWithActor`, `getPolicyAvailability`…). Cada bot juega con 30 semillas, en total 330 partidas.

Los datos completos están en `PLAYTEST_DATOS.md`: una tabla agregada y la bitácora turno por turno de la semilla 1 de cada bot (acciones, eventos, indicadores, causas, actores, política y cuentas). Además hay un JSON por bot (`partida_<bot>.json`). Todo se regenera con `npm run playtest`.

**Victoria:** ganar la reelección en T16 y que el espacio retenga el gobierno en la sucesión de T32 (IV ≥ 45 %).

**Configuración:** escenario *Herencia pesada* (el del Excel), plataforma del partido según el arquetipo e interna del oficialismo activa. La comparación entre escenarios, con la plataforma desactivada que es el default del juego, está al final y en `ESCENARIOS.md`.

## Resultado global (30 semillas por estrategia)

| Estrategia | Gana | Reelecto | Votos en la reelección | Cómo termina |
|---|---|---|---|---|
| A · Pasivo | 0 % | 0 % | 28,1 | Pierde la elección |
| B · Emisión | 0 % | 0 % | — | Hiperinflación en 6 turnos |
| C · Deuda | 0 % | 0 % | — | Hiperinflación en ~11 turnos |
| D · Obra pública | 0 % | 0 % | 26,6 | Pierde la elección |
| E · Técnico sin reuniones | 10 % | 33 % | 43,4 | Suele perder, pero por poco |
| F · Hipernegociador | 0 % | 0 % | 30,6 | Pierde la elección |
| G1 · Rígido heterodoxo | 0 % | 0 % | — | Hiperinflación en ~10 turnos |
| G1b · Heterodoxo coherente | 0 % | 0 % | 19,7 | Pierde la elección (5 de 30 por juicio político) |
| G2 · Rígido ortodoxo | 0 % | 0 % | 24,4 | Juicio político (29 de 30) |
| G2b · Ortodoxo coherente | 23 % | 57 % | 45,6 | Gana o pierde por poco (2 de 30 por juicio político) |
| H · Adaptable | 100 % | 100 % | 67,5 | Gana siempre |

**Lectura general.** El motor castiga los atajos (emitir, endeudarse, repetir recetas) y premia leer el contexto. La causalidad es visible: cada derrota se explica por una cadena de indicadores, actores y canales. Hay dos alertas de balance: el jugador adaptable gana con demasiada holgura, y existe una asimetría ideológica (ver Conclusiones).

**Sensibilidad al azar.** Los eventos aleatorios cambian los resultados de las estrategias que quedan cerca del umbral del 45 %. En una corrida anterior con otra secuencia aleatoria (antes de que los ids de las notificaciones dejaran de consumir `Math.random`), E ganaba 13 % / 23 % reelecto y G2b 40 % / 50 %. Las demás estrategias no cambiaron de categoría. Las tasas de E y G2b hay que leerlas con ±10 puntos. Las conclusiones cualitativas son estables.

**Efecto de la interna del oficialismo.** Frente a la corrida anterior, sin interna, las estrategias impopulares caen más por juicio político (G2 pasa de 20 a 29 de 30; G1b de 1 a 5), porque un partido enojado resta gobernabilidad. Las estrategias populares no cambian de categoría.

---

## A · Jugador pasivo
**Qué hace:** ejecuta una política barata cada dos turnos y casi no interactúa con nadie.
**Qué pasa (semilla 1):** el deterioro es lento, sin crisis grandes al principio.
- La inflación baja sola por el ancla de fundamentos (R01), de 58 a 46.
- La infraestructura se desgasta, la educación cae y el poder adquisitivo se erosiona.
- Desde T8 los sindicatos toman medidas de fuerza y desde T10 la industria posterga inversiones.
- En T11 se rompe el bloque oficialista (las bancas bajan de 40 a 31).
- En T12 y T15 hay emisiones forzadas.

La aprobación baja de 34 a 17 y pierde en T16 con 27,4 %.
**Veredicto:** ✅ correcto. No hacer nada no gana. El deterioro llega por el desgaste acumulado y por los actores, no por un castigo arbitrario.

## B · Abusa de la emisión
**Qué hace:** emite todos los turnos para pagar salarios, subsidios y transferencias.
**Qué pasa (semilla 1):**
- En T1–T2 la aprobación sube de 35 a 47: la emisión compra actividad y salario en el corto plazo.
- En T3, la tercera emisión dentro de la ventana de 6 turnos dispara la aceleración (REPETITION) y la inflación llega a 62. En T4 llega a 72.
- En T5 la caja queda negativa y el Tesoro emite solo (emisión forzada). Llega la **corrida cambiaria**, el agro retiene la cosecha y la industria posterga inversiones. La inflación salta a 95.
- En T6 llega a 100: hiperinflación.

**Veredicto:** ✅ correcto. La emisión es una trampa: la mejora inicial es real y el costo llega con rezago, amplificado por los canales.

## C · Se endeuda
**Qué hace:** toma préstamos (de organismos y del mercado local) y los gasta en salarios, programas y obras.
**Qué pasa (semilla 1):**
- La aprobación sube hasta 57 en T5: la deuda sí compra tiempo.
- El gasto corriente persistente de los programas deja un déficit estructural. Desde T5 hay emisiones forzadas turno tras turno.
- En T6 sube el riesgo país y en T7 llega la corrida cambiaria.
- La inflación va de 58 a 69, 82 y 98, y en T11 hay hiperinflación.

La deuda final es de ~4.900.
**Veredicto:** ✅ correcto. Tarda más que la emisión directa y termina en el mismo lugar si no se corrige el gasto corriente.

## D · Obra pública
**Qué hace:** encadena estudios de factibilidad y obras, y cuida a los gobernadores.
**Qué pasa:** las obras grandes cuestan entre $400M y $600M y exigen un estudio vigente del turno anterior. El bot tiene una guarda fiscal, así que ejecuta pocas obras y deja muchos turnos vacíos esperando caja. En la semilla 1:
- Desde T8 presionan los sindicatos.
- En T10 se rompe el bloque oficialista.
- La aprobación cae a 13 y pierde con 25,5 %.

En promedio firma 2 acuerdos con gobernadores por partida e incumple 1,8.
**Veredicto:** ⚠️ Parcial. El motor se comporta bien: las obras rinden tarde y cuestan caro. Pero este bot es una prueba débil del camino "obra pública", porque la caja lo frena. La conclusión útil es que la obra pública no se sostiene sola sin financiamiento previo. Conviene que un jugador humano pruebe D combinada con recaudación o deuda.

## E · Técnico que ignora a los grupos
**Qué hace:** toma buenas decisiones técnicas (tasas con inflación alta, recaudación, crédito, educación, ciencia, prevención) y no se reúne nunca con nadie.
**Qué pasa (semilla 1, pierde por poco):**
- La inflación baja de 58 a 35 y los mercados responden: baja el riesgo país.
- En T8 acepta una oportunidad de coalición: las bancas suben de 41 a 53, pero se abre la interna en su partido.
- Llega a T16 con 41 % de intención de voto y pierde la reelección con 44,6 %, a menos de medio punto del umbral, aun con la incumbencia.

En el agregado, lo típico es que llegue con 40–44 % y pierda. Sin reuniones, la relación con los actores deriva, la oposición interpela y los sindicatos presionan. Gana el 10 % de las partidas y es reelecto en el 33 %.
**Veredicto:** ✅ correcto. Gestionar bien sin hacer política queda al borde del umbral. La diferencia con H, que sí se reúne, mide el valor de la capa política.

## F · Hipernegociador
**Qué hace:** se reúne con todos, negocia y firma acuerdos con todos (~82 reuniones por partida).
**Qué pasa:** gasta los PA en negociar y casi no ejecuta políticas. Firma acuerdos (1,7 por partida) y los **incumple** (1,7) porque no le quedan PA para cumplirlos. Cada incumplimiento cuesta −20 de relación y −5 de credibilidad. Sin políticas, los indicadores se deterioran como en A. En la semilla 1:
- En T10 se rompe el bloque oficialista y las bancas caen de 41 a 22.
- La aprobación termina en 12 y la intención de voto en 20 %.

**Veredicto:** ✅ correcto según el diseño: la reunión abre la puerta pero no compra satisfacción, y prometer sin poder cumplir es peor que no prometer. La UI ya lo avisa al firmar un acuerdo inviable ("Ojo: hoy no podrías ejecutarla").

## G1 · Rígido heterodoxo
**Qué hace:** repite todo el mandato salario mínimo, transferencias, congelamiento de tarifas, retenciones y control de precios.
**Qué pasa (semilla 1):**
- Hasta T4 le va muy bien: aprobación 53, intención de voto 51 %.
- Los subsidios a tarifas y el gasto persistente vacían la caja, y desde T5 hay emisión forzada.
- La industria posterga inversiones, el agro retiene la cosecha y llega la corrida (T7).
- La inflación sube de 52 a 62, 68, 74, 90 y 100: hiperinflación en T10.

**Veredicto:** ✅ correcto. La rigidez se paga por la caja, no por un castigo ideológico.

## G1b · Heterodoxo coherente
**Qué hace:** sigue el mismo programa, pero sin abusar de cada herramienta y cuidando la caja.
**Qué pasa (semilla 1):**
- Hasta T4 funciona: aprobación 52.
- Tras el cepo (T4) y las retenciones se activan los canales del agro (retiene la cosecha) y de la industria (posterga inversiones). Después se suma el giro de utilidades y la dolarización.
- El sector externo queda en restricción (EXTE < 35), así que R07 empuja la inflación hacia arriba y la actividad hacia abajo. Sin divisas no hay recuperación: paro agrario (T12), corrida, paro general, cacerolazo y paro docente.
- Termina con 6 de aprobación, gobernabilidad 9 e intención de voto de 13 %: pierde la elección con 16,9 %.

**Veredicto:** ⚠️ **Asimetría a revisar.** El programa coherente no gana nunca, mientras su espejo ortodoxo (G2b) gana el 23 % y es reelecto en el 57 %. El Excel modela bien la restricción externa, pero la caja de herramientas heterodoxa no tiene cómo generar divisas: no hay acción de "administración del comercio" ni "acuerdo con el agro", y la liquidación depende de la relación con el agro, que estas medidas deterioran. Es una decisión de diseño, no un bug.

## G2 · Rígido ortodoxo
**Qué hace:** repite todo el mandato ajuste, tarifas, suba de tasas, baja de impuestos, reforma laboral y DNU.
**Qué pasa (semilla 1):**
- La inflación baja mucho (de 58 a 21) y los mercados responden.
- El ajuste repetido y el DNU cada dos turnos encienden la calle: medidas de fuerza, piquetes, tres paros generales, paro docente, plan de lucha y cacerolazo. En T9 se rompe el bloque oficialista.
- Con la aprobación por debajo de 30, su propio partido le abre una interna que resta gobernabilidad.
- La gobernabilidad baja de 50 a 14 y cae por juicio político en T14.

En el agregado, termina en juicio político en 29 de 30 partidas.
**Veredicto:** ✅ correcto. Bajar la inflación no alcanza si se rompe la gobernabilidad.

## G2b · Ortodoxo coherente
**Qué hace:** sigue el mismo programa ortodoxo, espaciado y sin DNU.
**Qué pasa (semilla 1, gana):**
- El costo social inicial es alto: aprobación 28 en T2–T3.
- Desde T6 los canales positivos ("mercados abiertos: baja el riesgo país", "liquidación fluida de la cosecha" y, desde T16, "industria anuncia inversiones") sostienen la recuperación.
- La inflación baja a 18 y gana la reelección con 50,8 %.
- En el segundo mandato la recuperación se consolida y gana la sucesión con 67,8 %.

En el agregado es reelecto en el 57 % y gana la carrera en el 23 %.
**Veredicto:** ✅ en sí mismo. ⚠️ Comparado con G1b, muestra la asimetría descrita arriba.

## H · Adaptable
**Qué hace:** se reúne con los actores más tensos, atiende sus pedidos cuando convienen, ataca los indicadores peor ubicados, alterna herramientas y cuida la caja.
**Qué pasa (semilla 1):**
- Los primeros turnos son duros: la aprobación baja a 30 en T3.
- Desde T5 combina política social focalizada, ajuste espaciado y tasas. La inflación baja de 55 a 40 y la aprobación sube a 60 en T12.
- En T16 acepta una coalición, pero con la aprobación alta la interna se ordena sola.
- Gana la reelección con 64,7 % y la sucesión con 72,4 %.

Gana 30 de 30 partidas.
**Veredicto:** ⚠️ **Probablemente demasiado fácil.** La curva logística de APRO es empinada: cuando los actores con peso electoral pasan de "divididos" a "conformes", la aprobación se dispara. Un humano atento puede replicar lo que hace H.

---

## Escenarios (plataforma desactivada, 20 semillas por celda)

Cada celda: gana la carrera / reelecto · votos promedio en la reelección · caídas antes de tiempo. Datos en `ESCENARIOS.md`.

| Escenario | A · Pasivo | B · Emisión | E · Técnico | G2b · Ortodoxo coherente | H · Adaptable |
|---|---|---|---|---|---|
| País en calma (Exploración) | 60 % / 100 % · 58 | 0 % · 20 caídas | 100 % / 100 % · 67 | 100 % / 100 % · 74 | 100 % / 100 % · 85 |
| Herencia pesada (Normal) | 0 % / 0 % · 27 | 0 % · 20 caídas | 10 % / 35 % · 44 | 15 % / 30 % · 43 | 100 % / 100 % · 68 |
| Viento de cola (Normal) | 0 % / 5 % · 37 | 0 % · 20 caídas | 55 % / 100 % · 49 | 90 % / 95 % · 50 | 100 % / 100 % · 73 |
| Corralito (Difícil) | 0 % / 0 % · 26 | 0 % · 20 caídas | 0 % / 0 % · 30 | 0 % / 0 % · 23 | 80 % / 100 % · 61 |
| País en llamas (Muy difícil) | 0 % / 0 % · 21 | 0 % · 20 caídas | 0 % / 0 % · 34 | 0 % / 0 % · 24 | 25 % / 45 % · 44 |

**Lectura.**
- El orden de dificultad es el buscado: Calma < Viento de cola < Herencia pesada < Corralito < País en llamas.
- En todos los escenarios, emitir sin freno termina en hiperinflación: la lección central del motor se mantiene incluso en el modo tranquilo.
- En País en calma se puede explorar sin miedo: hasta el jugador pasivo es reelecto. Es a propósito.
- Corralito y País en llamas sólo se ganan leyendo el contexto (bot H).
- Calibración de las crisis:
  - En default no se pagan intereses.
  - Hay una ley de emergencia que da +12 de gobernabilidad durante 6 turnos.
  - Hay un rebote de actividad por capacidad ociosa.
  - Sin esto, la actividad caía sin piso y nadie sobrevivía.

---

## Conclusiones y recomendaciones

1. **Causalidad (objetivo principal): cumplida.** Cada resultado se puede rastrear en la bitácora: acción → indicador → actor → canal → política. Los atajos fallan por mecanismos del motor, no por reglas ad hoc.
2. **Balance: dos decisiones abiertas** (también en `NEW_ENGINE_INTEGRATION.md` §14):
   - **Dificultad:** suavizar la logística de APRO (pendiente de /10 a /12–14) o subir el umbral en la sucesión. Hoy H gana con más de 15 puntos de margen.
   - **Asimetría ideológica:** darle al programa heterodoxo una vía de divisas. Puede ser una acción o reunión con el agro que mejore la liquidación, o atenuar R07/R17 cuando hay cepo con superávit comercial.
3. **Calibraciones ya aplicadas durante el playtest:**
   - Historial fiscal heredado.
   - Saturación anti-espiral.
   - Proyección de caja en la UI.
   - Bots más justos: guarda fiscal, sin repetir la misma receta, y un negociador que reserva PA.
   - Los ids de las notificaciones ya no consumen aleatoriedad, así un cambio de UI no altera las partidas con semilla.
4. **Tests de regresión de balance** (`playtestBalance.test.ts`). Verifican que:
   - el jugador pasivo no se reelige;
   - la emisión termina en hiperinflación en 10 turnos o menos;
   - endeudarse sin límite no sostiene el gobierno;
   - hipernegociar no alcanza;
   - la rigidez se paga;
   - el adaptable puede ganar;
   - todo es reproducible con la misma semilla.
5. **Pendiente humano:** que un jugador real pruebe D (obra pública financiada) y H (para confirmar si es demasiado fácil) antes de tocar parámetros.
