# Propuesta de Eventos Aleatorios y Contextuales — GobernArg

> Documento de diseño v2. Propuesta completa para ampliar de 12 a 28 eventos.
> Arquitectura actual: `src/data/events/*.ts` + `src/engine/eventResolver.ts` + `src/data/calendar.ts`

---

## Índice

1. [Arquitectura del sistema](#arquitectura)
2. [Tipos de eventos](#tipos)
3. [Eventos contextuales (no aleatorios)](#contextuales)
4. [Eventos aleatorios por categoría](#aleatorios)
5. [Eventos de calendario (scheduled)](#calendario)
6. [Mecánica de reversión](#reversion)
7. [Frecuencia y balance](#frecuencia)

---

## 1. Arquitectura del sistema {#arquitectura}

El sistema tiene 4 tipos de activación:

| Tipo | Cómo se activa | Ejemplo actual |
|------|----------------|----------------|
| `random` | Probabilidad por turno con condiciones | `foreign_investment` |
| `crisis` | Probabilidad + condiciones de estado crítico | `inflation_crisis` |
| `triggered` | Contexto específico (decisión tomada, apoyo legislativo) | `oppositionEvents` |
| `scheduled` | Turno fijo del calendario político | `elecciones-medio-termino` |

**Efectos disponibles:**
- `immediate`: aplicados al instante
- `delayed`: se aplican N turnos después (`turnsUntil`)
- `permanent`: modificadores permanentes (requiere implementación)

---

## 2. Tipos de eventos {#tipos}

### Por origen

| Origen | Descripción | Frecuencia esperada |
|--------|-------------|---------------------|
| **Contextual** | Se disparan por decisiones del jugador o estado del juego | 100% cuando se cumple la condición |
| **Aleatorio** | Probabilidad por turno con condiciones | 1-2 por mandato |
| **Crisis** | Probabilidad + estado crítico del juego | 0-1 por mandato |
| **Calendario** | Turno fijo del calendario político | Siempre en ese turno |

### Por reversibilidad

| Tipo | Reversión |
|------|-----------|
| **Efecto inmediato** | Se puede compensar con acciones posteriores |
| **Efecto sostenido** | Dura N turnos, luego desaparece solo |
| **Efecto permanente** | Requiere acción específica para revertir |

---

## 3. Eventos contextuales (no aleatorios) {#contextuales}

Estos se disparan por decisiones del jugador o por estado del juego, NO por probabilidad.

### 3.1. Escándalo de Violencia Policial (mencionado en documento de diseño)

| Campo | Valor |
|-------|-------|
| **ID** | `police_violence_scandal` |
| **Tipo** | `triggered` |
| **Categoría** | social |
| **Severidad** | critical |
| **Activación** | Se dispara si el jugador ejecutó `lucha_narcotrafico` o `seguridad_ciudadana` Y tiene apoyo de `sectores-populares` < 40 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un video de brutalidad policial se viraliza. Sectores sociales exigen respuestas. |
| **Efecto inmediato** | pop -20, estabilidad -15, sectores-populares -25, clase-media -10 |
| **Opciones** | |
| → Investigar a fondo | Presupuesto -150, pop +10, sectores-populares +20, aliados +5 (requiere estabilidad ≥ 40) |
| → Defender a la policía | Pop -15, sectores-populares -30, clase-alta +10, aliados +10 |
| → Pedir calma sin acción | Pop -5, estabilidad -10 (sin costo) |
| **Duración** | Inmediato (1 turno) |
| **Reversión** | Ejecutar `prevencion_delito` o `programa_desarme` dentro de 3 turnos da +15 sectores-populares |

### 3.2. Renuncia de Ministro

| Campo | Valor |
|-------|-------|
| **ID** | `minister_resignation` |
| **Tipo** | `triggered` |
| **Categoría** | political |
| **Severidad** | high |
| **Activación** | Se dispara si `stability < 35` Y hay al menos 1 asesor contratado |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un ministro clave renuncia en medio de la crisis, citando "diferencias irreconciliables". |
| **Efecto inmediato** | estabilidad -10, pop -8, asesor aleatorio desactivado |
| **Opciones** | |
| → Aceptar la renuncia | Presupuesto -100 (indemnización), estabilidad +5 |
| → Convencerlo de quedarse | Presupuesto -200, estabilidad +15, pop +5 (prob 0.6 éxito) |
| → Usar la renuncia a tu favor | Pop +8, estabilidad -5, opositores -10 |
| **Duración** | Inmediato |
| **Reversión** | Contratar nuevo asesor en los próximos 2 turnos da +5 estabilidad |

### 3.3. Crisis de Gabinete

| Campo | Valor |
|-------|-------|
| **ID** | `cabinet_crisis` |
| **Tipo** | `triggered` |
| **Categoría** | political |
| **Severidad** | critical |
| **Activación** | Se dispara si `stability < 25` Y `legislativeSupport < 35` |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | La oposición exige cambios en el gabinete a cambio de no bloquear la agenda. |
| **Efecto inmediato** | estabilidad -15, legislativeSupport -10 |
| **Opciones** | |
| → Ceder a la presión | Estabilidad +20, pop -10, legislativeSupport +15 |
| → Rechazar las exigencias | Estabilidad -20, pop +5, legislativeSupport -20 |
| **Duración** | Inmediato |
| **Reversión** | Si legislativeSupport sube a > 45, recuperás +10 estabilidad en el próximo turno |

### 3.4. Escándalo de Corrupción (contextual)

| Campo | Valor |
|-------|-------|
| **ID** | `corruption_scandal_triggered` |
| **Tipo** | `triggered` |
| **Categoría** | political |
| **Severidad** | critical |
| **Activación** | Se dispara si el jugador ejecutó `prestamo_internacional` o `prestamo_local` Y tiene `debtCount > 2` |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Un informe periodístico revela sobreprecios en contratos vinculados a un préstamo. |
| **Efecto inmediato** | pop -25, estabilidad -20, empresarios -15, clase-media -20 |
| **Opciones** | |
| → Abrir investigación | Presupuesto -200, pop +15, estabilidad +10 |
| → Desmentir | Pop -10, estabilidad -5 (si pop < 40, se agrava: pop -20 adicional) |
| **Duración** | 3 turnos de efecto sostenido (-3 pop/turno si no se investiga) |
| **Reversión** | Investigar detiene el sangrado. Ejecutar `reforma_impositiva` da +10 pop permanente |

### 3.5. Aliados Incómodos (contextual post-victoria)

| Campo | Valor |
|-------|-------|
| **ID** | `allies_uncomfortable_triggered` |
| **Tipo** | `triggered` |
| **Categoría** | political |
| **Severidad** | medium |
| **Activación** | Se dispara si el jugador ganó la elección con > 55% de votos Y ejecutó acciones que antagonizan a `aliados` (opposes) en los últimos 2 turnos |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Tus aliados de coalición te pasan factura por haberlos ignorado tras la victoria. |
| **Efecto inmediato** | aliados -15, estabilidad -5 |
| **Opciones** | |
| → Reunión con aliados | Presupuesto -50, aliados +20, estabilidad +5 |
| → Ignorar la queja | Aliados -10 adicional, pop -3 |
| **Duración** | Inmediato |
| **Reversión** | Ejecutar `alianza_politica` da +10 aliados |

---

## 4. Eventos aleatorios por categoría {#aleatorios}

### 4.1. Económicos (agregar 3)

#### 4.1.1. Default Selectivo de Deuda

| Campo | Valor |
|-------|-------|
| **ID** | `debt_default` |
| **Tipo** | crisis |
| **Categoría** | economic |
| **Severidad** | critical |
| **Activación** | `debtCount >= 3` Y `debtServiceRatio > 0.3`, prob 0.35, turnos 5-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Los acreedores internacionales advierten que el país está al borde del default. |
| **Efecto inmediato** | presupuesto -500, estabilidad -25, pop -15 |
| **Opciones** | |
| → Renegociar deuda | Presupuesto -300, estabilidad +15, pop -5 (prob 0.7 éxito) |
| → Default técnico | Presupuesto +200, estabilidad -30, pop -25, empresarios -30 |
| **Duración** | 4 turnos sostenido (-3 estabilidad/turno si default) |
| **Reversión** | `mejorar_recaudacion` reduce el servicio de deuda y revierte el efecto |

#### 4.1.2. Crisis Energética

| Campo | Valor |
|-------|-------|
| **ID** | `energy_crisis` |
| **Tipo** | crisis |
| **Categoría** | economic |
| **Severidad** | high |
| **Activación** | `maxBudget < 800` O `minMoneyPrinting >= 5`, prob 0.3, turnos 4-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un apagón masivo revela la fragilidad del sistema energético. |
| **Efecto inmediato** | pop -18, estabilidad -15, presupuesto -250 |
| **Opciones** | |
| → Invertir en infraestructura | Presupuesto -400, pop +15, estabilidad +10, infraestructura desbloqueada |
| → Tarifazos | Pop -20, presupuesto +200, empresarios +15 |
| **Duración** | 2 turnos sostenido (-5 pop/turno si no se invierte) |
| **Reversión** | Ejecutar `energia_renovable` elimina el efecto y da +10 pop |

#### 4.1.3. Burbuja Financiera

| Campo | Valor |
|-------|-------|
| **ID** | `financial_bubble` |
| **Tipo** | random |
| **Categoría** | economic |
| **Severidad** | medium |
| **Activación** | `budget > 2500` Y `stability > 60`, prob 0.25, turnos 6-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Inversores detectan una posible burbuja especulativa en el sector inmobiliario. |
| **Efecto inmediato** | presupuesto +150 (ingreso temporal), estabilidad -5 |
| **Opciones** | |
| → Regular el sector | Presupuesto -100, estabilidad +10, pop +5, empresarios -10 |
| → Dejar que siga | Presupuesto +300, estabilidad -15 (riesgo de burst en 3 turnos: -400 presupuesto) |
| **Duración** | 3 turnos (si no se regula, burst en turno 3) |
| **Reversión** | Regular antes del turno 3 evita el burst |

---

### 4.2. Políticos (agregar 3)

#### 4.2.1. Elecciones Anticipadas (presión)

| Campo | Valor |
|-------|-------|
| **ID** | `early_elections_pressure` |
| **Tipo** | crisis |
| **Categoría** | political |
| **Severidad** | critical |
| **Activación** | `stability < 30` Y `popularity < 35`, prob 0.3, turnos 6-14 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | La oposición exige elecciones anticipadas alegando falta de legitimidad. |
| **Efecto inmediato** | estabilidad -15, pop -10 |
| **Opciones** | |
| → Rechazar categóricamente | Estabilidad -10, pop +5 |
| → Negociar una salida | Estabilidad +10, pop -15 (cede capital político) |
| **Duración** | 3 turnos sostenido (-3 estabilidad/turno si se rechaza) |
| **Reversión** | Recuperar pop > 45 detiene la presión |

#### 4.2.2. Traición de un Aliado

| Campo | Valor |
|-------|-------|
| **ID** | `ally_betrayal` |
| **Tipo** | random |
| **Categoría** | political |
| **Severidad** | high |
| **Activación** | `aliados` apoyo < 50 Y `opositores` apoyo > 60, prob 0.2, turnos 5-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un aliado clave anuncia su pase a la oposición. |
| **Efecto inmediato** | aliados -25, opositores +20, estabilidad -10 |
| **Opciones** | |
| → Ofrecer compensación | Presupuesto -200, aliados +20 |
| → Aceptar la pérdida | Pop -5, estabilidad -5 |
| **Duración** | Inmediato |
| **Reversión** | `alianza_politica` con aliados > 60 da +15 aliados |

#### 4.2.3. Escándalo de Espionaje

| Campo | Valor |
|-------|-------|
| **ID** | `spying_scandal` |
| **Tipo** | random |
| **Categoría** | political |
| **Severidad** | high |
| **Activación** | `category: political`, prob 0.15, turnos 4-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Se filtran documentos que revelan espionaje interno a opositores. |
| **Efecto inmediato** | pop -20, estabilidad -15, opositores -20 |
| **Opciones** | |
| → Negar todo | Pop -10 adicional (si se descubre: -20 más) |
| → Asumir responsabilidad | Pop +5, estabilidad +10, opositores +10 |
| **Duración** | Inmediato |
| **Reversión** | `fortalecimiento_justicia` da +10 estabilidad |

---

### 4.3. Sociales (agregar 3)

#### 4.3.1. Paro General

| Campo | Valor |
|-------|-------|
| **ID** | `general_strike` |
| **Tipo** | crisis |
| **Categoría** | social |
| **Severidad** | critical |
| **Activación** | `sindicatos` apoyo < 40 Y `sectores-populares` apoyo < 45, prob 0.35, turnos 3-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Los sindicatos convocan un paro general de 48 horas. |
| **Efecto inmediato** | estabilidad -20, pop -15, presupuesto -200 |
| **Opciones** | |
| → Negociar | Presupuesto -150, estabilidad +15, sindicatos +20 |
| → Descontar el día | Presupuesto +50, pop -10, sindicatos -25, estabilidad -10 |
| **Duración** | 2 turnos sostenido (-5 estabilidad/turno si se descuenta) |
| **Reversión** | `acuerdo_sindical` da +20 sindicatos y elimina el efecto |

#### 4.3.2. Ola de Calor Extrema

| Campo | Valor |
|-------|-------|
| **ID** | `heat_wave` |
| **Tipo** | random |
| **Categoría** | natural (nueva) |
| **Severidad** | medium |
| **Activación** | Prob 0.2, turnos 1-16 |
| **Frecuencia** | Máx 2 veces por partida |
| **Descripción** | Una ola de calor histórica afecta a las grandes ciudades. |
| **Efecto inmediato** | pop -8, estabilidad -5 |
| **Opciones** | |
| → Declarar emergencia | Presupuesto -150, pop +10, estabilidad +5 |
| → Medidas mínimas | Pop -5, estabilidad -5 |
| **Duración** | 2 turnos |
| **Reversión** | Automática al terminar la ola |

#### 4.3.3. Escándalo de Espionaje Estudiantil (nuevo)

| Campo | Valor |
|-------|-------|
| **ID** | `student_spying` |
| **Tipo** | triggered |
| **Categoría** | social |
| **Severidad** | high |
| **Activación** | Se dispara si el jugador tiene `seguridad_ciudadana` ejecutada Y `estudiantiles` apoyo < 50 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Se revela que el gobierno espió a organizaciones estudiantiles. |
| **Efecto inmediato** | pop -18, estabilidad -10, estudiantiles -20 |
| **Opciones** | |
| → Desmentir | Pop -10 (riesgo de agravamiento) |
| → Investigar | Presupuesto -100, pop +10, estabilidad +10 |
| **Duración** | Inmediato |
| **Reversión** | `promover_educacion` da +15 estudiantiles |

---

### 4.4. Internacionales (nuevos, 3)

#### 4.4.1. Conflicto Diplomático

| Campo | Valor |
|-------|-------|
| **ID** | `diplomatic_conflict` |
| **Tipo** | random |
| **Categoría** | international |
| **Severidad** | high |
| **Activación** | Prob 0.2, turnos 3-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un país vecino denuncia supuestas violaciones a un tratado bilateral. |
| **Efecto inmediato** | pop -10, estabilidad -8, presupuesto -100 |
| **Opciones** | |
| → Escalar el conflicto | Pop +5 (nacionalismo), estabilidad -15, presupuesto -200 |
| → Buscar mediación | Presupuesto -100, estabilidad +10, pop -5 |
| **Duración** | 3 turnos sostenido (-3 estabilidad/turno si escala) |
| **Reversión** | `cooperacion_internacional` da +10 estabilidad |

#### 4.4.2. Cumbre Internacional

| Campo | Valor |
|-------|-------|
| **ID** | `international_summit` |
| **Tipo** | random |
| **Categoría** | international |
| **Severidad** | medium |
| **Activación** | `stability > 55` Y `popularity > 50`, prob 0.25, turnos 4-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | El país es invitado a una cumbre internacional clave. |
| **Efecto inmediato** | pop +10, presupuesto +100 (inversión externa) |
| **Opciones** | |
| → Asistir | Presupuesto -150, pop +15, estabilidad +5 |
| → No asistir | Pop -10, empresarios -10 |
| **Duración** | Inmediato |
| **Reversión** | N/A (beneficio) |

#### 4.4.3. Sanciones Externas

| Campo | Valor |
|-------|-------|
| **ID** | `external_sanctions` |
| **Tipo** | crisis |
| **Categoría** | international |
| **Severidad** | critical |
| **Activación** | `debtCount >= 2` Y `stability < 40`, prob 0.25, turnos 5-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Organismos internacionales imponen sanciones económicas al país. |
| **Efecto inmediato** | presupuesto -400, pop -15, estabilidad -10 |
| **Opciones** | |
| → Aceptar las condiciones | Presupuesto -200, estabilidad +10, pop -10 |
| → Resistir | Presupuesto -100 adicional por 3 turnos, pop +10 (nacionalismo) |
| **Duración** | 4 turnos sostenido (-50 presupuesto/turno) |
| **Reversión** | `tratado_comercio` o `cooperacion_internacional` elimina las sanciones |

---

### 4.5. Naturales (nuevos, 3)

#### 4.5.1. Inundación

| Campo | Valor |
|-------|-------|
| **ID** | `flood` |
| **Tipo** | crisis |
| **Categoría** | natural |
| **Severidad** | high |
| **Activación** | Prob 0.2, turnos 2-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Lluvias torrenciales causan inundaciones en zonas pobladas. |
| **Efecto inmediato** | pop -15, presupuesto -300, estabilidad -10 |
| **Opciones** | |
| → Ayuda inmediata | Presupuesto -200, pop +15, estabilidad +10 |
| → Pedir ayuda internacional | Presupuesto +100, pop -5 (dependencia) |
| **Duración** | 2 turnos |
| **Reversión** | Automática con ayuda |

#### 4.5.2. Sequía

| Campo | Valor |
|-------|-------|
| **ID** | `drought` |
| **Tipo** | crisis |
| **Categoría** | natural |
| **Severidad** | high |
| **Activación** | Prob 0.15, turnos 3-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Una sequía prolongada afecta al sector agropecuario. |
| **Efecto inmediato** | presupuesto -250, sector-agricola -20, pop -8 |
| **Opciones** | |
| → Subsidios de emergencia | Presupuesto -300, sector-agricola +25, pop +10 |
| → Esperar a que pase | Sector-agricola -15 adicional, pop -10 |
| **Duración** | 4 turnos sostenido (-50 presupuesto/turno) |
| **Reversión** | `subsidios_agricolas` o `tratamiento_agua` revierte |

#### 4.5.3. Pandemia Sanitaria

| Campo | Valor |
|-------|-------|
| **ID** | `pandemic` |
| **Tipo** | crisis |
| **Categoría** | natural |
| **Severidad** | critical |
| **Activación** | Prob 0.08 (muy rara), turnos 1-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Un brote sanitario se propaga rápidamente. |
| **Efecto inmediato** | pop -25, estabilidad -20, presupuesto -500 |
| **Opciones** | |
| → Cuarentena estricta | Presupuesto -300, pop +10, estabilidad -10 |
| → Medidas graduales | Presupuesto -150, pop -10, estabilidad +5 |
| **Duración** | 5 turnos sostenido (-3 pop/turno y -100 presupuesto/turno) |
| **Reversión** | `construccion_hospitales` acorta la duración a 2 turnos |

---

### 4.6. Seguridad (nuevos, 2)

#### 4.6.1. Motín Carcelario

| Campo | Valor |
|-------|-------|
| **ID** | `prison_riot` |
| **Tipo** | crisis |
| **Categoría** | social (seguridad) |
| **Severidad** | high |
| **Activación** | `maxBudget < 600` O `stability < 35`, prob 0.25, turnos 3-16 |
| **Frecuencia** | Máx 1 vez por mandato |
| **Descripción** | Un motín en una cárcel de máxima seguridad deja víctimas. |
| **Efecto inmediato** | pop -18, estabilidad -15 |
| **Opciones** | |
| → Negociar | Presupuesto -100, pop +5, estabilidad +10 |
| → Reprimir | Pop +5 (mano dura), estabilidad -10, sectores-populares -15 |
| **Duración** | Inmediato |
| **Reversión** | `fortalecimiento_justicia` da +10 estabilidad |

#### 4.6.2. Ola de Narcotráfico

| Campo | Valor |
|-------|-------|
| **ID** | `drug_wave` |
| **Tipo** | crisis |
| **Categoría** | social (seguridad) |
| **Severidad** | critical |
| **Activación** | `maxStability < 40`, prob 0.2, turnos 4-16 |
| **Frecuencia** | Máx 1 vez por partida |
| **Descripción** | Aumentan los crímenes vinculados al narcotráfico en zonas urbanas. |
| **Efecto inmediato** | pop -20, estabilidad -15, presupuesto -200 |
| **Opciones** | |
| → Operativo de seguridad | Presupuesto -300, pop +10, estabilidad +15, clase-media +15 |
| → Programas sociales | Presupuesto -200, pop +5, sectores-populares +15 |
| **Duración** | 3 turnos sostenido (-5 pop/turno si no se actúa) |
| **Reversión** | `lucha_narcotrafico` elimina el efecto |

---

## 5. Eventos de calendario (scheduled) {#calendario}

| Turno | Evento | Efecto |
|-------|--------|--------|
| Año 1, T2 | Apertura de sesiones | Ya existe |
| Año 1, T4 | Primer informe | Ya existe |
| Año 2, T2 | Campaña legislativa | Ya existe |
| Año 2, T4 | Elecciones de medio término | Ya existe |
| Año 3, T1 | Definición de estrategia | Ya existe |
| **Año 3, T3 (nuevo)** | **Cumbre de gobernadores** | Pop +5, estabilidad +5, presupuesto -100 |
| Año 3, T2 | Apertura del último período | Ya existe |
| **Año 4, T1 (nuevo)** | **Debate presidencial** | Pop ±10 según estabilidad (si > 50: +10; si < 40: -10) |
| Año 4, T2 | Campaña presidencial | Ya existe |

---

## 6. Mecánica de reversión {#reversion}

Cada evento negativo debe tener al menos una forma de revertirse. Tres mecanismos:

### 6.1. Reversión por acción específica
| Evento | Acción que revierte |
|--------|---------------------|
| Violencia policial | `prevencion_delito` o `programa_desarme` |
| Crisis energética | `energia_renovable` |
| Paro general | `acuerdo_sindical` |
| Sequía | `subsidios_agricolas` o `tratamiento_agua` |
| Sanciones externas | `tratado_comercio` o `cooperacion_internacional` |
| Pandemia | `construccion_hospitales` |
| Ola de narcotráfico | `lucha_narcotrafico` |

### 6.2. Reversión por estado del juego
| Evento | Condición que revierte |
|--------|------------------------|
| Presión electoral anticipada | Recuperar pop > 45 |
| Crisis de gabinete | legislativeSupport > 45 |
| Default de deuda | `debtServiceRatio < 0.2` |

### 6.3. Reversión automática por tiempo
| Evento | Duración |
|--------|----------|
| Ola de calor | 2 turnos |
| Inundación | 2 turnos |
| Efectos sostenidos | 3-5 turnos según severidad |

---

## 7. Frecuencia y balance {#frecuencia}

### Objetivo por mandato (16 turnos)

| Tipo | Cantidad esperada |
|------|-------------------|
| Eventos aleatorios | 2-3 |
| Crisis | 1-2 |
| Eventos contextuales | 0-2 (según decisiones) |
| Calendario | 2 (fijos) |
| **Total** | **5-7 eventos por mandato** |

### Reglas de anti-spam

1. **Cooldown por categoría**: un evento de la misma categoría no puede dispararse 2 turnos seguidos.
2. **Máximo por turno**: 1 evento aleatorio + 1 crisis máximo por turno.
3. **Máximo por mandato**: cada evento tiene `cooldown` o `maxOccurrences` definido.
4. **Probabilidad acumulativa**: si no se dispara un evento en 4 turnos, la probabilidad se incrementa 1.5× (pity timer).

### Fórmula de probabilidad efectiva

```
P_efectiva = P_base × modificador_estado × modificador_turno × pity_timer
```

Donde:
- `P_base` = probabilidad definida en el evento (0.08-0.4)
- `modificador_estado` = según `eventWeights.ts` (baja estabilidad ×1.5, alta ×0.6)
- `modificador_turno` = early 0.8, mid 1.0, late 1.2
- `pity_timer` = 1.5 si hace 4+ turnos sin evento de esa categoría

---

## 8. Impacto en la dificultad

Con estos 16 eventos nuevos (total 28):

| Métrica | Antes | Después |
|---------|-------|---------|
| Eventos por mandato | 2-4 | 5-7 |
| Presión económica | Baja | Media-alta |
| Presión social | Baja | Media |
| Presión internacional | Nula | Media |
| Reversibilidad | No existía | 3 mecanismos |
| Rejugabilidad | Baja (12 eventos) | Alta (28 eventos) |

**Riesgo de frustración**: mitigado por los 3 mecanismos de reversión. Ningún evento es un "game over" inevitable; todos tienen salida.
