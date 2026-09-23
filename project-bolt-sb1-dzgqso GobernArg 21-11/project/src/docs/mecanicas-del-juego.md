# Cómo Funciona GobernArg V2
## Manual de mecánicas del juego

---

## ¿De qué se trata?

GobernArg es un juego de estrategia política argentina. Vos sos un dirigente político — intendente, gobernador o presidente — y tenés que administrar recursos, construir poder político y sobrevivir a las presiones de los distintos sectores.

> **Nota (MVP actual):** la carrera intendente → gobernador → presidente **no está disponible** en el MVP: se juega directo como presidente. El código de la carrera se conserva para el modo campaña futuro (ver `roadmap.md`).

No alcanza con hacer "buenas políticas". También tenés que negociar, ceder cuando conviene, resistir cuando hace falta, y pensar las consecuencias de tus decisiones a varios turnos.

---

## Las métricas principales

### Popularidad (0 a 100%)
Es tu capital político. Se calcula como:
- **40%** del promedio de relaciones con todos los grupos de interés
- **60%** de tu popularidad política (lo que ganás o perdés con acciones y eventos)

Si tu popularidad baja del umbral de tu cargo **2 turnos consecutivos**, perdés:
- Intendente: por debajo de 20%
- Gobernador: por debajo de 25%
- Presidente: por debajo de 30%

Cada turno, todos los gobernantes sufren **desgaste natural**:
- Intendente: -5
- Gobernador: -7
- Presidente: -10

Pero el desgaste no te lleva a 0 solo — el 40% que viene de los grupos actúa como piso. Un presidente inactivo se estabiliza alrededor de 35%.

### Presupuesto (en millones de pesos)
Es tu capacidad de gasto. Cada turno recibís ingresos y pagás gastos fijos:

| Cargo | Ingreso bruto | Mantenimiento | Neto por turno |
|-------|-------------|--------------|-----|
| Intendente | +200M | -120M | +80M |
| Gobernador | +350M | -200M | +150M |
| Presidente | +500M | -350M | +150M |

Si tenés presupuesto negativo **2 turnos consecutivos**, perdés por colapso fiscal.

Podés pedir préstamos (máximo 3) pero cada uno reduce tus ingresos en 10%. Y si emitís dinero, generás inflación — 7 emisiones provocan hiperinflación y derrota instantánea.

### Estabilidad (0 a 100%)
Mide la paz social e institucional. No se desgasta sola: solo cambia por tus acciones, elecciones, tu estrategia post-legislativa y eventos.

Si la estabilidad baja de 20 **y además** tu popularidad está por debajo de 10%, se activa el tracking de **impeachment** (2 turnos consecutivos = derrota). Si baja de 10 **y además** tu apoyo legislativo es menor a 25%, tracking de **golpe institucional** (3 turnos = derrota).

### Legitimidad (0 a 100%)
Refleja cuán legítimo es tu gobierno. Sube con acciones de cultura y diplomacia (+3). Baja con decretos forzosos (-8) y acciones impopulares. Si llega a **0**, todas tus acciones cuestan **el doble** de puntos de acción.

### Intención de voto (0 a 100%)
Se calcula con 6 factores:
- **Popularidad:** 35% — promedio de los últimos 4 turnos
- **Presupuesto:** 15% — cuánto creció tu economía
- **Apoyo de grupos:** 15% — promedio de relaciones sectoriales
- **Objetivos cumplidos:** 15% — proporción de objetivos del mandato
- **Estabilidad:** 5% — tu estabilidad actual
- **Actividad:** 15% — proporción de acciones tomadas sobre las esperadas (16 turnos); penaliza la inacción

Necesitás **45% o más** para ganar una elección.

---

## Cómo funciona una elección

### Elecciones de medio término (Año 2, Turno 4)
Solo legislativas. Definen tu apoyo en el Congreso (entre 28% y 58%). No consumen presupuesto. El resultado afecta:
- Tu estabilidad (+10 si ganás por paliza, -15 si perdés)
- El costo en acciones de las reformas (más caras con congreso hostil)
- La probabilidad de eventos de oposición

### Elecciones generales (Año 4, Turno 4)
Son a todo o nada. Tu intención de voto se ajusta según lo que elijas:
- Reelección: +5 (ventaja de ser oficialismo)
- Ascenso a gobernador: -15
- Ascenso a presidente: -40

Además, si tenés varios mandatos acumulados, hay una penalización multiplicativa por ascenso que baja con la experiencia (chapa): hasta **30%** para un intendente que aspira a presidente sin experiencia, y menos cuantos más mandatos completaste. La inacción durante el mandato también pesa: el factor de actividad (15%) castiga a los gobiernos que toman pocas decisiones.

**No hay segunda vuelta.** Con 45% ganás, con menos perdés.

---

## Los 18 subgrupos de interés

Están organizados en 5 familias. Cada subgrupo tiene:
- **Influencia** (estrellas ⭐, de 1 a 10): a más influencia, más caro interactuar y más impacto electoral
- **Apoyo base**: con cuánto arrancan (de 20% a 70%)
- **Intereses**: palabras clave que determinan qué acciones los afectan
- **Mood**: estado de ánimo (contento → neutral → disconforme → enojado → radicalizado)

### Cómo interactuás con los grupos

**Reunión** (+5 apoyo, cuesta $10 × influencia):
- El grupo queda tranquilo **2 turnos** sin hacer demandas

**Negociar** (+10 apoyo, cuesta $25 × influencia):
- El grupo te va a presentar una demanda concreta en **1 o 2 turnos**
- Esa demanda tendrá un plazo de 4 turnos para cumplirla

**Conceder** (+15 apoyo, cuesta $50 × influencia):
- El grupo queda satisfecho **4 turnos** (un año entero)
- Es caro pero te compra tiempo y paz social
- Está **limitado a 4 concesiones por mandato**
- Requiere trabajo previo: al menos 1 reunión o 1 negociación con el grupo en el mandato actual
- Tiene **costo cruzado**: los demás grupos pierden apoyo (proporcional a la influencia del grupo beneficiado)

### Demandas de grupos
Las demandas son **eventos raros**: probabilidad base de **8%** por turno (hasta 25% con condiciones) y **máximo 2 demandas activas** a la vez. Si no las cumplís antes del plazo, perdés apoyo con ese grupo **proporcional a su influencia**.

Si las cumplís (botón verde):
- **Consume 1 acción**
- +5 apoyo al grupo
- El grupo vuelve a estar contento
- +1 popularidad general
- Sus antagonistas pierden apoyo (impacto cruzado)

Si ya ejecutaste la acción pedida dentro del plazo, la demanda se cumple automáticamente con **+10 apoyo** al grupo.

### Antagonismos
Los grupos no son islas: cuando un grupo gana apoyo, sus rivales pierden automáticamente. Por ejemplo, si los empresarios ganan +10, los sindicatos pierden -5.

---

## Las acciones políticas

Tenés **61 acciones en 9 categorías** (registradas en `actionRegistry.ts`). Cada acción:
- Cuesta presupuesto y puntos de acción
- Tiene efectos inmediatos en popularidad, presupuesto, estabilidad, legitimidad
- Afecta a los grupos según sus intereses
- Pierde efectividad si la usás repetidas veces (×0.80 por uso)

### Efectos diferidos
Algunas acciones estratégicas generan beneficios **a futuro**:
- **Estudio de factibilidad**: reduce el costo de infraestructura los próximos turnos
- **Mejorar recaudación**: genera +$50M extra por 3 turnos
- **Fomento al emprendimiento**: genera +$30M por 3 turnos (tarda más en madurar)
- **Infraestructura grande** (costo ≥ $200M): genera mantenimiento del 15% en 2-4 turnos

Los beneficios activos se muestran en el panel "Beneficios activos" de la barra lateral.

---

## Los 4 arquetipos

### Político de Raza
- **Habilidades activas:**
  - Discurso Patriótico (+12 pop, +5 estabilidad, +8 legitimidad, cooldown 4 turnos)
  - Pacto de Gobernabilidad (+10 estabilidad, +5 legitimidad, aliados +5, opositores +5, cooldown 5 turnos)
- **Pasiva 1:** +10% retención de voto en reelección
- **Pasiva 2:** Reuniones con aliados no cuestan acción
- **Fuerte en:** Diplomacia (×1.2)
- **Estilo:** Construye poder político, negocia, suma aliados

### Empresario
- **Habilidades activas:**
  - Inversión Privada (+$400M, -3 popularidad, cooldown 5 turnos)
  - Llamado a Inversores (+$500M, -5 legitimidad, empresarios +8, sector financiero +5, cooldown 6 turnos)
- **Pasiva 1:** Economía genera +20% presupuesto
- **Pasiva 2:** Puede tomar 1 préstamo extra (máximo 4)
- **Fuerte en:** Economía (×1.3), penalizado en el resto (×0.9)
- **Estilo:** Genera riqueza pero puede generar desigualdad

### Sindicalista
- **Habilidades activas:**
  - Movilización Social (+8 pop, -5 estabilidad, +5 legitimidad, cooldown 4 turnos)
  - Paro Controlado (+5 pop, -8 estabilidad, sindicatos +15, sectores populares +15, empresarios -10, cooldown 5 turnos)
- **Pasiva 1:** Reuniones con sindicatos y sectores populares no cuestan acción
- **Pasiva 2:** +1 acción base
- **Fuerte en:** Social (×1.3), penalizado en el resto (×0.9)
- **Estilo:** Base popular sólida, pero tensión con sectores económicos

### Comunicador
- **Habilidades activas:**
  - Campaña Mediática (+10 pop, cooldown 3 turnos)
  - Gira de Medios (+15 pop, clase media +4, aliados +3, cooldown 6 turnos)
- **Pasiva 1:** Eventos negativos tienen -30% impacto
- **Pasiva 2:** Todas las acciones rinden ×1.1
- **Fuerte en:** Todo (×1.1)
- **Estilo:** Marca agenda y resiste crisis, pero sin bonus económicos
- **Empieza con:** 70% de popularidad (los demás con 50%)

---

## Los ejes de liderazgo

Tus decisiones van moldeando tu perfil de gobierno en 3 ejes (de -100 a +100):

### Radical ↔ Conciliador
- **Seguridad** te mueve hacia radical (-3)
- **Diplomacia y cultura** te mueven hacia conciliador (+2)
- En extremo radical: tus acciones de seguridad son más efectivas pero la diplomacia sufre
- En extremo conciliador: la cultura y diplomacia cuestan menos acciones

### Populista ↔ Técnico
- **Social y cultura** te mueven hacia populista
- **Economía y tecnología** te mueven hacia técnico
- En extremo populista: acciones sociales más efectivas y baratas
- En extremo técnico: economía más potente pero políticas sociales menos efectivas

### Cerrado ↔ Convocante
- **Seguridad y economía** te mueven hacia cerrado
- **Diplomacia, cultura, educación** te mueven hacia convocante
- En extremo cerrado: +5 estabilidad pero todos los grupos te bajan -10
- En extremo convocante: +10 relación con todos pero -5 estabilidad

---

## La estrategia post-legislativa

A mitad del mandato (Año 3, Turno 1), después de las elecciones de medio término, tenés que definir tu estrategia para la segunda mitad:

| Estrategia | Efectividad | Estabilidad | Popularidad | Disponible si... |
|-----------|------------|-------------|-------------|-----------------|
| **Acelerar** | ×1.25 | -3/turno | -2/turno | Apoyo legislativo > 42% |
| **Negociar** | ×0.85 | +3/turno | 0 | Siempre |
| **Abrirse** | ×1.15 | +5/turno | +1/turno | 3+ grupos con apoyo > 50% |
| **Jugada Audaz** | ×1.50 | -5/turno | -3/turno | Comunicador/Político o pop > 65% |

**Jugada Audaz** solo dura 2 turnos y después te fuerza a negociar.

---

## Cómo perder

Hay 5 formas de perder (más la electoral):

1. **Popularidad baja:** 2 turnos consecutivos por debajo del umbral de tu cargo
2. **Colapso fiscal:** 2 turnos consecutivos con presupuesto negativo
3. **Impeachment:** popularidad < 10% Y estabilidad < 20% por 2 turnos
4. **Golpe institucional:** estabilidad < 10% Y apoyo legislativo < 25% por 3 turnos
5. **Hiperinflación:** 7 o más emisiones monetarias
6. **Derrota electoral:** menos de 45% de los votos

---

## Consejos para empezar

1. **No gastes todo de una.** El presupuesto se recupera lento y el déficit te mata en 2 turnos.
2. **Reunite con los grupos.** Aunque no concedas nada, 2 turnos de calma ayudan.
3. **El estudio de factibilidad parece caro pero se paga solo.** Reduce costos de infraestructura futura.
4. **No emitas dinero más de 3 veces.** La inflación se acumula y a la séptima perdés.
5. **La popularidad no es solo acciones.** El 40% viene de tu relación con los grupos. Si los tenés contentos, tenés un piso.
6. **Fijate en tu perfil ideológico.** Si estás muy radicalizado, la diplomacia te va a costar más.
7. **Las elecciones de medio término importan.** Definen tu margen de maniobra legislativo para la segunda mitad del mandato.
