# Escenarios históricos de GobernArg Light: Corralito 2001 e Hiper 1989

Nota única de diseño, calibración y verificación. Rama `codex/gobernarg-light-cierre-2026-10-27` (publica en https://valigt.netlify.app). El plan original está en `PLAN-HISTORICOS-Y-CONSULTOR.md`.

## 1. Qué cambió y por qué

| Antes (commit 49196ab) | Ahora | Por qué |
|---|---|---|
| Corralito arrancaba con depósitos atrapados, default, +12 de gobernabilidad y rebote automático, todo mezclado desde el turno 1. | Arranca el 30/11/2001: convertibilidad vigente, corrida en marcha, deflación, retiros libres y deuda pagándose. Corralito, default, devaluación y pesificación son decisiones del jugador. | Separar las etapas históricas y hacer que las salidas de la crisis sean elecciones, no condiciones iniciales. |
| Hiper arrancaba "al borde" (precios 72) y la regla general de hiper mataba en dos trimestres. | Arranca el 1/6/1989 con precios en 97 de 100 y acelerando, default desde 1988 sin vencimiento, estado de sitio ya declarado, gobierno en transición. Regla propia: dos meses con precios en 95 o más y acelerando, y el gobierno cae. | Empezar dentro de la hiperinflación con un plazo razonable para intervenir. |
| El default vencía solo a los 8 turnos. | Dura hasta que se renegocia (medida incierta con quita del 35 %). | La deuda impaga necesita resolución; no se cura con un contador. |
| Rebote de actividad gratis. | Rebote condicional: solo con nuevo régimen y precios contenidos (2001) o con la inflación calmada (1989). | La recuperación depende de condiciones observables y rezagos. |
| Sin medidas propias de la crisis. | 22 medidas extraordinarias sin costo, una por turno, con impacto fuerte ya y una apuesta que se resuelve 2 a 4 trimestres después. Catálogo regular recortado a 28 políticas. | "Sin medidas extraordinarias no se puede ganar; con medidas y buen juego, la partida despega." |
| Calendario trimestral de 16 turnos desde el minuto uno. | Emergencia de tres subrondas (semanas de diciembre de 2001; junio, julio y agosto de 1989) y después los 16 trimestres. | Varias decisiones significativas durante la crisis sin ejecutar un trimestre completo por semana. |

## 2. Base histórica usada

Hechos documentados (fuentes al final), separados de las interpretaciones y de las decisiones de balance.

**Corralito, 30 de noviembre de 2001**
- Corrida del 30/11: salida aproximada de 1.800 millones de depósitos, 2,5 % en una jornada (BCRA, H3).
- Desocupación 18,3 % (EPH octubre 2001, H1); pobreza 38,3 % e indigencia 13,6 % (28 aglomerados, H2).
- PIB 2001: −4,4 %; IPC dic/dic: −1,5 % (FMI, retrospectivo, H4). La deflación se representa con el índice de precios en 12 (abstracción: el índice no simula una tasa negativa).
- Convertibilidad vigente (1 peso = 1 dólar). Cronología de referencia que el jugador puede reproducir o no: 1/12 Decreto 1570 (250 pesos o dólares por semana por titular y entidad; transferencias, cheques y tarjetas siguen; H5); 23/12 default parcial (H6); 6/1/2002 Ley 25.561 (H7); enero 2002 reprogramación de depósitos, Resolución 6/2002 (H8); 3/2/2002 Decreto 214 de pesificación (deudas a 1 por dólar, depósitos a 1,40; H9).
- Interpretaciones del diseño: el gobierno perdió las legislativas de octubre (bancas −4 respecto de la base), imagen 25, relaciones negativas con finanzas, sindicatos, organizaciones sociales, oposición y gobernadores.

**Hiper, 1 de junio de 1989**
- IPC mensual (CEPAL, cuadro 12; Capital y GBA): abril 33,4 %, mayo 78,5 %, junio 114,5 %, julio 196,6 % (H11, H16). Junio y julio son referencia de lo que pasó después, no resultados obligatorios.
- BCRA: interrupción de la intervención cambiaria a comienzos de febrero por escasez de reservas (H10).
- Pobreza GBA: 25,9 % en mayo y 47,3 % en octubre de 1989 (H12). No se carga 47,3 % como inicial.
- Elección del 14/5 perdida; traspaso histórico el 8/7/1989 (H13, H15). Estado de sitio declarado el 29/5 (vigente una subronda). Saqueos del 24 al 30 de mayo.
- Moratoria de hecho de la deuda externa desde abril de 1988 (hecho documentado en la literatura; pendiente: enlazar fuente primaria).
- La moneda es el austral. No se introducen como medidas el Plan Bonex (enero 1990), la convertibilidad (1991) ni la pesificación (2002).

## 3. Calibración (hipótesis de diseño, no estadísticas)

### 3.1 Estado inicial

| Indicador (0-100) | Corralito | Hiper | Dato que lo orienta |
|---|---|---|---|
| Precios (INFL) | 12 | 97 | deflación 2001 / 78,5 % mensual mayo 1989 (97 ≈ 83 % mensual en el mapeo orientativo) |
| Actividad (ACTV) | 35 | 37 | PIB −4,4 %, desocupación 18,3 % / recesión 1989 |
| Bolsillo (PODA) | 35 | 24 | pobreza 38,3 % / pobreza en aumento y salarios licuados |
| Inversión y crédito (INVC) | 24 | 22 | sin crédito |
| Divisas (EXTE) | 20 | 16 | corrida / BCRA sin reservas |
| Solvencia (SOLV) | 15 | 12 | riesgo país extremo / moratoria (se recalcula cada cierre) |
| Protección social (PSOC) | 33 | 30 | |
| Seguridad (SEGU) | 38 | 38 | |
| Instituciones (INST) | 40 | 42 | |
| Conflictividad (CONF, subir empeora) | 60 | 70 | calle caliente / saqueos |
| Caja, gasto corriente, deuda (unidades internas) | 450, 820, 6.000 | 250, 850, 5.000 | caja vacía; deuda alta |
| Recaudación (multiplicador) | 0,9 | 0,85 | recesión / Olivera-Tanzi (además el motor descuenta por inflación) |
| Expectativas (desanclaje, oculto) | 2 | 30 | la convertibilidad ancla / sin ancla |
| Congreso (bancas) e imagen | −4, 25 | −6, 22 | derrota de octubre / gobierno saliente |
| Relaciones | finanzas −10, sindicatos −10, org. sociales −12, oposición −10, gobernadores −8 | finanzas −10, sindicatos −5, industria −5, org. sociales −5, oposición +5 | |
| Condiciones iniciales | convertibilidad, corrida, liquidez bancaria 40 | default sin vencimiento, estado de sitio (1 subronda) | |

### 3.2 Emergencia (tres subrondas)

Una subronda ≈ 3 a 4 semanas. Aplica: efectos inmediatos de la medida elegida; dinámica propia; humor de los actores a la mitad de la velocidad trimestral. Lo diferido queda en la agenda trimestral.

- Corralito, por semana: retiros libres → liquidez −14, divisas −4 (con convertibilidad) y crédito −2; retiros limitados → liquidez −3, conflicto +3, actividad −1,5, bolsillo −1; reprogramados → liquidez +6, conflicto +2. Liquidez ≤ 10 → colapso bancario (una vez). Divisas < 10 con convertibilidad → salida forzada del régimen. Calle: conflicto +2 (+2 si protección social < 35; 0 con estado de sitio) y la calle se cansa (un tercio del decaimiento trimestral). Protección social −1.
- Hiper, por mes: precios +3 + 0,05 × (desanclaje − 20) − 0,04 × (divisas − 16) (−2 con congelamiento, −3 con moneda nueva o dolarización); bolsillo −2 (−0,5 con congelamiento); actividad −1,5; protección social −1; divisas −1,5. Calle: conflicto +3 (+1 si protección social ≥ 35: −2; 0 con estado de sitio) y decaimiento parcial. La aceleración (cambio de precios del mes) sube el desanclaje si es positiva.
- Cada medida tomada da un impulso en sí (gobernabilidad +4 por dos cierres, imagen +2) y mueve la liquidez bancaria en el Corralito (limitar +6, reprogramar +18, liberar −8, rescate +10, dolarizar +8, pesificar −4, devaluar −3, cuasimonedas +3).

### 3.3 Derrotas y plazos

- Emergencia: Corralito, gobernabilidad bajo 15 dos subrondas seguidas → renuncia. Hiper, precios ≥ 95 y acelerando dos subrondas seguidas → hiperinflación (también renuncia por gobernabilidad). La inacción pierde en los dos (Hiper en dos meses; Corralito colapsa los bancos la tercera semana y cae en los trimestres siguientes).
- Gestión: reglas generales, con una excepción documentada: en la Hiper, los primeros cinco trimestres los precios en zona de hiper (≥ 90) no cuentan para la derrota mientras vengan bajando al menos un punto por trimestre.

### 3.4 Medidas extraordinarias

Catálogo completo con efectos y apuestas en `project/src/data/causal/crisisActions.ts`. Reglas: costo cero en caja y acciones; una por turno o subronda; las de una sola vez no se repiten; los cambios de régimen son permanentes; se vuelve a verificar la disponibilidad al cerrar; la apuesta se resuelve con dos filas condicionales evaluadas al aplicar (premio si se cumple, castigo si no). Medidas inciertas (renegociar la deuda, rescate del FMI) se sortean con el generador de la partida: la probabilidad sube con solvencia, relación con finanzas, cuentas ordenadas y gestión diplomática; nunca es un rescate garantizado.

Condiciones de apuesta (se eligieron para que sean alcanzables con buen juego desde el piso de la crisis, no gratis): corralito (salir del corralito en 3 trimestres), corralón (precios < 60 y divisas ≥ 25), liberar depósitos (divisas ≥ 25), devaluar (precios < 55), dolarizar (cuentas sin déficit), pesificar (crédito ≥ 15 y precios < 60), default (deuda renegociada en 6 trimestres), cuasimonedas (precios < 45 y déficit chico), estado de sitio (protección social ≥ 35 o asistencia reciente), rescate (déficit chico a los 4 trimestres), apertura (divisas ≥ 30 y crédito ≥ 15), reforma constitucional (aprobación ≥ 30), congelamiento (déficit ≤ 150 a los 2 trimestres), moneda nueva (déficit ≤ 100 y divisas ≥ 20), shock fiscal (precios < 70), vender reservas (desanclaje < 20 y déficit ≤ 150), devaluación de shock (divisas ≥ 25 y precios < 85), emergencia alimentaria (precios < 85), transición (precios < 80), privatizar todo (crédito ≥ 20 e instituciones ≥ 40).

### 3.5 Catálogo regular en los históricos

Siguen 28: emisión, tasas, cepo y liberar cepo, control de precios, ajuste del gasto, deuda local, recaudación, retenciones (subir y bajar), salarios estatales, salario mínimo, pacto social, transferencias sociales, asistencia alimentaria, bono a jubilados, tarifas (congelar y actualizar), crédito PyME, promoción industrial, incentivos a la exportación, reforma laboral, seguridad, antipiquetes, DNU, ampliar la coalición, transferencias a provincias y agenda internacional. Se ocultan 30 (menores en una crisis o reemplazadas por una extraordinaria: devaluación, privatización, préstamo internacional). Con la economía dolarizada no hay emisión; la caja en rojo se paga con atraso de sueldos.

## 4. Objetivos visibles

Corralito: contener la corrida (bancos estables), pagos esenciales al día (caja positiva), bancos en pie y depósitos libres, deuda al día o renegociada, precios bajo control (≤ 50), la calle se calma (conflictividad ≤ 45). Hiper: frenar la aceleración (precios ≤ 85), estabilizar (≤ 60), ingresos básicos (protección social ≥ 35 y bolsillo ≥ 30), transición acordada, una moneda que se sostiene, deuda renegociada. Son metas de legado: no deciden la victoria (la decide la elección, como siempre) y un éxito de escenario no inventa reelecciones en el progreso.

## 5. Trayectorias observadas (bots)

Se completa con `npm run playtest:historicos` (informe en `_analisis_gobernarg/playtest/HISTORICOS.md`). Trayectorias cortas observadas a mano con la semilla 7 durante la calibración (`closeCrisisRound` y `closeTurn` directos, sin eventos ni reuniones):

- Corralito, inacción: la corrida vacía los bancos (liquidez 40 → 26 → 12 → 0), colapso bancario y salida forzada de la convertibilidad en la tercera semana; después, caja en rojo, emisión forzada y gobernabilidad bajo 15 en el sexto trimestre.
- Corralito, corralito + devaluar + pesificar y después cepo, asistencia, tasas, retenciones y liberar depósitos: cuatro apuestas salen bien; actividad 35 → 48, crédito 24 → 43, divisas 20 → 40 al sexto trimestre; la caja sigue en rojo porque no se suspendieron los pagos de la deuda (intereses de 300 por trimestre): la decisión de default o rescate es parte del buen juego.
- Corralito, dolarizar + rescate + apertura total sin bajar el gasto a tiempo: el rescate sale bien pero la dolarización y la apertura explotan (déficit y desindustrialización); gobernabilidad bajo 15 al sexto trimestre.
- Hiper, inacción: precios 96 → 100 acelerando; hiperinflación en el segundo mes.
- Hiper, congelamiento + emergencia alimentaria + transición: sale de la emergencia con precios en 69, gobernabilidad 78 y aprobación en alza; sin un ancla fiscal (shock o privatización) el déficit obliga a emitir y el congelamiento y la moneda nueva explotan.
- Hiper, shock + privatización total + apertura: la caja se ordena y los precios bajan a 56 con la moneda nueva; la apertura sobre el ajuste destruye la actividad y el bolsillo y la gobernabilidad cae.

Conclusión provisoria de la calibración: la inacción pierde; cada escenario tiene al menos una secuencia que supera la emergencia con margen; las combinaciones "todo ajuste" o "todo gasto" explotan por donde se esperaba. Falta la medición sistemática con bots y semillas.

## 6. Compatibilidad de guardados

Las partidas históricas anteriores (sin `causal.crisis`) siguen con sus reglas: default con vencimiento, rebote automático, sin bloque de emergencia ni medidas extraordinarias (`crisisEngine.test.ts` carga un guardado así y verifica el servicio de deuda en cero y el rebote aplicado). Las nuevas llevan `causal.crisis` validado al cargar (`savegameValidation.ts`). Las claves no cambian: `gobernarg.lite.partida` y `gobernarg.lite.progress.v1`. Los desbloqueos tampoco: Corralito con una reelección, Hiper con dos.

## 7. Pendientes

- Medición sistemática con bots (informe HISTORICOS.md) y segunda pasada de calibración con esos números.
- Recorrido en navegador de las tres subrondas de cada escenario a 1440 y 390 px.
- Enlazar una fuente primaria para la moratoria de 1988.
- Opcional: generalizar algunas medidas (ley de emergencia, estado de sitio) a otros escenarios con condiciones propias.

## 8. Fuentes

- [H1] INDEC, EPH octubre de 2001: https://biblioteca.indec.gob.ar/bases/minde/2mi605_5.pdf
- [H2] INDEC, pobreza e indigencia 28 aglomerados: https://biblioteca.indec.gob.ar/bases/minde/pobreza_adic_total_oct02.pdf
- [H3] BCRA, situación monetaria de diciembre de 2001: https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/bol0102.pdf
- [H4] FMI, Artículo IV (25/7/2003): https://www.imf.org/en/news/articles/2015/09/28/04/53/pn0388
- [H5] DNU 1570/2001: https://www.argentina.gob.ar/normativa/nacional/decreto-1570-2001-70355/texto
- [H6] FMI, Oficina de Evaluación Independiente, The IMF and Argentina 1991-2001: https://www.imf.org/-/media/websites/imf/imported-full-text-pdf/external/np/ieo/2004/arg/eng/pdf/_report.pdf
- [H7] Ley 25.561: https://www.argentina.gob.ar/normativa/nacional/ley-25561-71477/texto
- [H8] Boletín Oficial 10/1/2002 (Resolución 6/2002, Decreto 71/2002): https://www4.hcdn.gob.ar/BO/boletin02/2002-01/BO10-01-02LEG.pdf
- [H9] DNU 214/2002: https://www.argentina.gob.ar/normativa/nacional/decreto-214-2002-72017/texto
- [H10] BCRA, Memoria Anual 1989.
- [H11, H16] CEPAL, cuadro 12 (IPC mensual 1989, Capital y GBA).
- [H12] INDEC, EPH mayo y octubre de 1989 (GBA).
- [H13, H15] Traspaso presidencial del 8/7/1989.
