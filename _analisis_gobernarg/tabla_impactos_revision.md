# INFORME DE REVISIÓN — tabla_impactos_acciones.md

**Rol:** Revisor_Impactos (auditoría independiente) · **Fecha:** 2026-09-23
**Método:** lectura completa de la tabla + verificación contra `actionRegistry.ts` (1104 líneas, 61 acciones), `actionEffects.ts` (lógica real de `calculateGroupEffects`, líneas 144-164), `interestGroups.ts` (18 subgrupos), `turnProcessor.ts`, `actionEngine.ts`, `ActionCard.tsx` y `actionCategories.ts`. Además se reprodujo el matching en un script Node ejecutado sobre los datos reales (no solo análisis mental), y se contaron las menciones grupales por parseo del registry.

---

## 1. Veredicto general

**La tabla es ALTAMENTE CONFIABLE en su columna central (EFECTO GRUPAL REAL) y en su diagnóstico arquitectónico**, pero contiene **4 errores numéricos** (3 en la tabla de grupos de la sección 3 y 1 en la sección 0), todos de conteo, ninguno de interpretación. Las conclusiones cualitativas (hallazgo crítico, veredictos, peores casos, recomendaciones) se sostienen íntegros tras la corrección.

## 2. Lo verificado como CORRECTO (línea por línea)

### 2.1 Muestra obligatoria de 15 acciones (matching mental + script)

| Acción | Descripción real | Resultado del matching | ¿Tabla OK? |
|---|---|---|---|
| emitir_dinero | "Aumentar la masa monetaria para financiar gastos" | NINGUNO | ✅ |
| aumento_salarial | "Incrementar salarios del sector público" | NINGUNO ("salarios" ≠ "aumentos salariales") | ✅ |
| acuerdo_sindical | "Negociar con sindicatos" | NINGUNO | ✅ |
| energia_renovable | "Desarrollar energías limpias" | NINGUNO ("limpias" ≠ "renovables") | ✅ |
| igualdad_genero | "Promover la equidad de género" | NINGUNO ("equidad" ≠ "igualdad") | ✅ |
| subsidios_industriales | "Apoyo económico al sector industrial" | deportistas +6 (10 × 6/10) | ✅ |
| tercera_edad | "Apoyo a adultos mayores" | deportistas +9 (15 × 6/10) | ✅ |
| fomento_emprendimiento | "Apoyo a nuevos emprendedores…" | deportistas +7.2 (12 × 6/10) | ✅ |
| plan_viviendas | "Construir viviendas sociales" | sectores-populares +12 (20 × 6/10) | ✅ |
| seguridad_ciudadana | "Mejorar la seguridad pública" | clase-media +14 (20 × 7/10) | ✅ |
| sistema_vigilancia | "Implementar cámaras de seguridad" | clase-media +10.5 (15 × 7/10) | ✅ |
| reforma_impositiva | "Modificar el sistema tributario" | NINGUNO | ✅ |
| construccion_hospitales | "Ampliar la red hospitalaria" | NINGUNO | ✅ |
| control_precios | "Regular precios de productos básicos" | NINGUNO | ✅ |
| tratado_comercio | "Establecer acuerdos comerciales" | NINGUNO | ✅ |
| modernizacion_aeropuertos | "Actualizar infraestructura aeroportuaria" | NINGUNO | ✅ |

### 2.2 Verificación exhaustiva por script (61/61 acciones)

Se replicó `description.toLowerCase().includes(interest.toLowerCase())` contra los 18 subgrupos reales. Resultado: **exactamente 8 acciones con efecto** y magnitudes idénticas a las de la tabla:
`subsidios_industriales→deportistas +6`, `fomento_emprendimiento→deportistas +7.2`, `tercera_edad→deportistas +9`, `plan_viviendas→sectores-populares +12`, `cobertura_social→sectores-populares +12`, `viviendas_rurales→sectores-populares +9`, `seguridad_ciudadana→clase-media +14`, `sistema_vigilancia→clase-media +10.5`.

No existen matches omitidos por la tabla (trampas verificadas y descartadas: `promover_educacion` "educativa" no contiene "educación"; `estudio_factibilidad` "económica" no contiene "estabilidad económica"; `empleo_joven` "laboral" no contiene "trabajo" ni "Derechos laborales"; ninguna descripción contiene "cargos", "becas", "transparencia", "investigación", "apoyo estatal" como substring del interest completo de cooperativas).

### 2.3 Afirmaciones arquitectónicas — todas confirmadas

- `calculateGroupEffects` (actionEffects.ts:144-164) ignora `affectedGroups` y `satisfiesDemand`; matching por substring case-insensitive; `supportChange = popularityChange × (influence/10)`. ✅
- `affectedGroups` solo alimenta el tooltip de `ActionCard.tsx:113-131`. ✅
- `satisfiesDemand` no tiene ningún consumidor fuera de `actionRegistry.ts` (grep en todo `src/`: solo el campo y su declaración de tipo). ✅ Metadata muerta confirmada.
- Efectos aplicados en runtime en `turnProcessor.ts:316-320` (y agregados en :357-359 para efectos cruzados). ✅
- Cooldowns, costos, multiEffects (est/leg/vot), prerequisitos (`requiredActions`, `minLegislativeSupport:45` con la NOTA del código, `minGroupSupport: {empresarios:60}`), `availableForPositions` y exclusión de préstamos por dificultad (`actionEngine.ts:36`) — todos reproducidos correctamente en las filas muestreadas.
- Divergencias `minBudget` registry vs categories: promover_educacion 100/200, fomentar_turismo 50/150, desarrollar_tecnologia 200/300 — **confirmadas leyendo `actionCategories.ts`**. ✅
- Veredictos ✅0 / ⚠️5 / ❌56 y resumen por categoría: **correctos** (las 5 ⚠️ son exactamente las acciones donde ≥1 grupo declarado recibe efecto real).
- "53 acciones producen CERO efecto grupal" (61−8): correcto. "14 de 18 grupos jamás reciben efecto": correcto (solo responden sectores-populares, clase-media y deportistas).

## 3. Errores encontrados (4, todos de conteo)

| # | Ubicación | Dice | Debe decir |
|---|---|---|---|
| 1 | Sección 0, "metadata muerta en 35 acciones" | 35 | **44** acciones declaran `satisfiesDemand` (conteo por grep: 44 entradas en actionRegistry.ts) |
| 2 | Sección 3, fila empresarios | "# Acciones que lo DECLARAN: 27" | **29** (faltan `cobertura_social` y `inclusion_digital`, que declaran a empresarios en opposes/supports) |
| 3 | Sección 3, fila academicos | "16" | **15** |
| 4 | Sección 3, totales | "221 menciones declaradas" | **208** (29+26+23+24+13+11+16+15+8+8+7+7+6+6+6+1+2 = 208) |

**Impacto de las correcciones:** ninguna cambia ninguna conclusión. El desfase declarado vs real es aún ligeramente peor de lo que dice la tabla (208 menciones inertes vs 8 efectos), lo que refuerza el hallazgo crítico en vez de debilitarlo.

## 4. Precisiones menores (no errores, pero a tener en cuenta)

1. **Magnitudes de EFECTO GRUPAL REAL** son los valores base (`pop × influencia/10`). En runtime, `temporarySupportBonuses` (reuniones) pueden multiplicar el `supportChange` (actionEffects.ts:77-83). La tabla declara su convención al pie, así que es aceptable, pero conviene recordar que el efecto efectivo puede ser mayor.
2. **Fila `policia_proximidad`**: la redacción de la celda es confusa ("sí matchea… **no**"), aunque la conclusión (NINGUNO) es correcta. Sugerible reescribir: "la descripción 'Acercar la policía a la comunidad' no contiene el interest 'seguridad'".
3. **Claim "`satisfiesDemand` en 35 acciones"** también subyace a la recomendación 2 ("hoy 35 acciones prometen satisfacer demandas"); debe actualizarse a 44.
4. La nota de que "las 3 acciones espurias a deportistas alimentan `applyCrossGroupEffects`" es correcta en dirección (los mismos groupEffects espurios se agregan en turnProcessor.ts:357-359); el alcance exacto del cross-effect no fue auditado en profundidad (fuera del alcance de esta revisión).

## 5. Conclusión

**Tabla aprobada con correcciones menores.** 61/61 filas tienen el efecto grupal correcto; el diagnóstico del hallazgo crítico es exacto y está bien documentado; los 4 errores son conteos numéricos en las secciones 0 y 3 que deben corregirse (35→44, 27→29, 16→15, 221→208) para que la tabla quede 100% exacta. Las recomendaciones de la sección 5 son coherentes con el código real.
