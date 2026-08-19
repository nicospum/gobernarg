# Inventario de Eventos Aleatorios — GobernArg

> Estado actual al 2026-08-19. Fuente: `src/data/events/` + `src/engine/eventResolver.ts`

## Resumen

| Categoría | Cantidad | Eventos |
|-----------|----------|---------|
| Económicos | 2 | `inflation_crisis`, `foreign_investment` |
| Políticos | 2 | `coalition_opportunity`, `legislative_block` |
| Sociales | 2 | `student_protests`, `healthcare_crisis` |
| Oposición (eventResolver) | 3 | `oposicion_bloqueo`, `oposicion_marcha`, `oposicion_juicio` |
| Soberbia post-victoria (eventResolver) | 3 | `desgaste_soberbia`, `desgaste_alianza`, `desgaste_medios` |
| **Total** | **12** | |

---

## Detalle por evento

### Económicos (`src/data/events/economic.ts`)

#### 1. Crisis Inflacionaria
- **Tipo**: crisis | **Severidad**: critical
- **Condiciones**: `minMoneyPrinting >= 3`, prob 0.4, turnos 3-16
- **Efecto base**: pop -25, estabilidad -20, presupuesto -300
- **Opciones**:
  - Austeridad → pop -15, estabilidad +10, presupuesto +200
  - Control de precios → pop +10, estabilidad -15, empresarios -20

#### 2. Inversión Extranjera
- **Tipo**: random | **Severidad**: medium
- **Condiciones**: `minStability >= 60`, `minPopularity >= 50`, prob 0.3, turnos 4-16
- **Efecto base**: presupuesto +400, estabilidad +10
- **Opciones**:
  - Facilitar → presupuesto +600, empresarios +20, sindicatos -10
  - Restringir → presupuesto +200, empresarios -15, sindicatos +15

---

### Políticos (`src/data/events/political.ts`)

#### 3. Oportunidad de Coalición
- **Tipo**: random | **Severidad**: medium
- **Condiciones**: `minPopularity >= 45`, `minStability >= 50`, `requiredGroups: ['aliados']`, prob 0.25, turnos 3-16
- **Efecto base**: pop +15, estabilidad +10
- **Opciones**:
  - Aceptar → pop +15, estabilidad +10, opositores +20
  - Rechazar → pop -5, estabilidad -5, opositores -10

#### 4. Bloqueo Legislativo
- **Tipo**: crisis | **Severidad**: high
- **Condiciones**: `maxPopularity <= 40`, `maxStability <= 45`, prob 0.3, turnos 2-16
- **Efecto base**: pop -15, estabilidad -20
- **Opciones**:
  - Negociar → presupuesto -200, estabilidad +15, aliados +10
  - Forzar agenda → pop -10, estabilidad -15, opositores -20

---

### Sociales (`src/data/events/social.ts`)

#### 5. Protestas Estudiantiles
- **Tipo**: crisis | **Severidad**: high
- **Condiciones**: `maxPopularity <= 50`, prob 0.25, turnos 1-16
- **Efecto base**: pop -15, estabilidad -10
- **Opciones**:
  - Aumentar presupuesto educativo → presupuesto -300, pop +20, estudiantiles +25
  - Cambios mínimos → presupuesto -100, pop -5, estudiantiles -10

#### 6. Crisis en el Sistema de Salud
- **Tipo**: crisis | **Severidad**: critical
- **Condiciones**: `maxBudget <= 500`, prob 0.2, turnos 2-16
- **Efecto base**: pop -20, estabilidad -15
- **Opciones**:
  - Fondos de emergencia → presupuesto -400, pop +25, estabilidad +15
  - Asociación con privados → presupuesto -200, pop -10, sindicatos -15

---

### Oposición (`src/data/events/legislativeConsequences.ts` → `oppositionEvents`)

> Se disparan desde `eventResolver.ts` según situación de oposición legislativa.

#### 7. Bloqueo Legislativo
- **Tipo**: crisis | **Severidad**: high
- **Efecto**: pop -8, estabilidad -5

#### 8. Marcha Opositora al Congreso
- **Tipo**: crisis | **Severidad**: medium
- **Efecto**: pop -5, estabilidad -3

#### 9. Intento de Juicio Político
- **Tipo**: crisis | **Severidad**: critical
- **Efecto**: pop -10, estabilidad -8

---

### Soberbia post-victoria (`legislativeConsequences.ts` → `overconfidenceEvents`)

> Se disparan desde `eventResolver.ts` tras victorias electorales contundentes.

#### 10. Críticas por Soberbia
- **Tipo**: random | **Severidad**: medium
- **Efecto**: pop -4, estabilidad -3

#### 11. Aliados Incómodos
- **Tipo**: random | **Severidad**: medium
- **Efecto**: estabilidad -5, aliados -10

#### 12. Editoriales de Advertencia
- **Tipo**: random | **Severidad**: low
- **Efecto**: pop -2

---

## Huecos identificados (lo que falta según documento de diseño)

| Categoría | Eventos existentes | Faltan ejemplos |
|-----------|--------------------|-----------------|
| **Económicos** | 2 | Escándalo de corrupción, default de deuda, crisis energética |
| **Políticos** | 2 | Renuncia de ministro, elecciones anticipadas, crisis de gabinete |
| **Sociales** | 2 | **Violencia policial** (mencionado explícitamente), paro general, ola de calor |
| **Internacional** | 0 | Conflicto diplomático, cumbre internacional, sanción externa |
| **Natural** | 0 | Inundación, sequía, pandemia, incendio forestal |
| **Seguridad** | 0 | Escándalo policial, narcotráfico, motín carcelario |

**Total actual: 12 eventos. Objetivo razonable para MVP: 20-24 eventos.**
