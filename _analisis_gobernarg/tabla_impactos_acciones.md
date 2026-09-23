# TABLA MAESTRA DE IMPACTOS — ACCIONES × GRUPOS DE INTERÉS (GobernArg)

**Rol:** Analista_Impactos (balance de juego) · **Fecha:** 2026-09-20
**Fuentes:** `src/data/actionRegistry.ts` (61 acciones, fuente VIVA del engine), `src/data/actionCategories.ts` (duplicado), `src/utils/actionEffects.ts` (cálculo real), `src/data/interestGroups.ts` (18 subgrupos), `src/engine/actionEngine.ts` (disponibilidad).

---

## 0. Hallazgo crítico del sistema (leer antes que la tabla)

El motor de efectos grupales **ignora por completo `affectedGroups` y `satisfiesDemand`**:

- `calculateGroupEffects` (`actionEffects.ts:144-164`) calcula el efecto real así: para cada subgrupo, si **algún string de `subgroup.interests` está contenido (substring, case-insensitive) en `action.description`**, se aplica `supportChange = popularityChange × (influencia/10)` con el **signo de la popularidad de la acción** (acciones impopulares lastiman a TODOS los grupos que matchean; no existe oposición declarativa).
- `affectedGroups` (supports/opposes) solo se usa para **mostrar un tooltip** en `ActionCard.tsx:113-131`. Jamás toca `groupRelations`.
- `satisfiesDemand` **no tiene ningún consumidor** en todo `src/` (grep: solo aparece en `actionRegistry.ts`). Es metadata muerta en 35 acciones.
- Los efectos por texto sí se aplican en runtime (`turnProcessor.ts:316-320`) y además disparan `applyCrossGroupEffects` (antagonismos cruzados) con los mismos resultados espúreos.

**Resultado del matching real sobre las 61 acciones:**
- **53 acciones** declaran grupos afectados y producen **CERO** efecto grupal real.
- **8 acciones** producen efecto real: 5 coinciden con lo declarado (⚠️ parcial) y 3 generan **falsos positivos a `deportistas`** por la palabra genérica "apoyo" en la descripción.
- Matching literal sin normalización de acentos ni singular/plural: "educativa" ≠ "educación", "equidad de género" ≠ "Igualdad de género", "energías limpias" ≠ "energías renovables".

**Veredictos globales: ✅ 0 · ⚠️ 5 · ❌ 56 de 61.**

---

## 1. Tabla maestra (61 acciones)

Convenciones: **Costo $** = `budgetChange` (negativo = gasto). **Cooldown** = explícito o default (`getDefaultCooldown`: préstamo/emitir=8, |$|>500=6, |$|≥200=3, si no=1). **Efectos declarados**: pop/bud inmediatos; est/leg/vot = `multiEffects`. **EFECTO GRUPAL REAL** = subgrupos cuyo `interests` matchea la descripción + signo y magnitud (`pop × influencia/10`). **Disp. presidente** = análisis estático por cargo/prereq (asumiendo presupuesto suficiente y dificultad que permite préstamos).

| ID | Nombre | Categoría | Costo $ | CD | Efectos declarados (pop/bud/est/leg) | affectedGroups declarado (S/O) | EFECTO GRUPAL REAL | satisfiesDemand | Prerequisitos | ¿Disp. presidente? | Veredicto |
|---|---|---|---|---|---|---|---|---|---|---|---|
| emitir_dinero | Emitir Dinero | economia | +150 | 4 | +3 / +150 / est-3 / leg-5 | S: sectores-populares, sindicatos · O: empresarios, sector-financiero, clase-alta | **NINGUNO** — ningún interest matchea | — | — | Sí (solo presidente) | ❌ declara 5 grupos, 0 efecto; el daño real es solo est/leg/vot |
| mejorar_recaudacion | Mejorar Recaudación | economia | +250 | 3 | −8 / +250 | S: ongs · O: empresarios, clase-alta, sector-financiero | **NINGUNO** | simplificación tributaria (muerto) | — | Sí | ❌ tooltip engañoso; demanda jamás se consume |
| subsidios_industriales | Subsidios Industriales | economia | −300 | 3 | +10 / −300 | S: empresarios, sindicatos · O: sector-financiero, ongs | **deportistas +6** ("apoyo") — espurio | — | — | Sí | ❌ 0 de 4 declarados aplican; falso positivo a deportistas |
| reforma_impositiva | Reforma Impositiva | economia | +400 | 3 | −10 / +400 | S: ongs, sectores-populares · O: empresarios, clase-alta | **NINGUNO** | simplificación tributaria (muerto) | mejorar_recaudacion + **legislativeSupport≥45 (dudoso: null→0 hasta año 2 y fijo después)** | Condicional (prereq) | ❌ grupos fantasma + prereq potencialmente inalcanzable + demanda muerta |
| incentivos_exportacion | Incentivos a la Exportación | economia | −250 | 3 | +8 / −250 | S: empresarios, sector-agricola | **NINGUNO** | — | — | Sí | ❌ declara 2, 0 efecto |
| control_precios | Control de Precios | economia | −150 | 1 | +15 / −150 | S: sectores-populares, sindicatos, clase-media · O: empresarios, clase-alta | **NINGUNO** | Control de inflación (muerto) | — | Sí | ❌ declara 5, 0 efecto |
| fomento_emprendimiento | Fomento al Emprendimiento | economia | −200 | 3 | +12 / −200 | S: empresarios, cooperativas, clase-media | **deportistas +7.2** ("apoyo") — espurio | — | — | Sí | ❌ 0 de 3 declarados aplican; falso positivo |
| aumento_salarial | Aumento Salarial General | economia | −400 | 3 | +20 / −400 | S: sindicatos, sectores-populares · O: empresarios, clase-alta | **NINGUNO** ("salarios del sector público" no contiene "aumentos salariales") | Paritarias (muerto) | — | Sí | ❌ sindicatos indiferentes a la medida estrella gremial |
| reduccion_gasto | Reducción del Gasto Público | economia | +300 | 3 | −20 / +300 | S: empresarios, sector-financiero, clase-alta · O: sindicatos, sectores-populares | **NINGUNO** | — | — | Sí | ❌ declara 5, 0 efecto |
| prestamo_internacional | Préstamo Internacional | economia | +800 | 8 | −5 / +800 / est+5 / leg-8 | S: sector-financiero · O: opositores, ongs | **NINGUNO** | — | mejorar_recaudacion + **solo si dificultad permite préstamos** | Condicional (prereq + dificultad) | ❌ declara 3, 0 efecto |
| prestamo_local | Préstamo Local | economia | +500 | 8 | −3 / +500 / leg-5 | S: sector-financiero, empresarios · O: opositores | **NINGUNO** | — | solo si dificultad permite préstamos | Condicional (dificultad) | ❌ declara 3, 0 efecto |
| atraccion_inversiones | Atracción de Inversiones | economia | −200 | 3 | +10 / −200 | S: empresarios, sector-financiero · O: sindicatos | **NINGUNO** ("capital extranjero" no matchea "incentivos a la inversión") | — | — | Sí | ❌ declara 3, 0 efecto |
| plan_viviendas | Plan de Viviendas | social | −400 | 3 | +20 / −400 | S: sectores-populares, clase-media, sindicatos · O: clase-alta | **sectores-populares +12** ("vivienda") ✅ · clase-media/sindicatos/clase-alta: sin efecto | acceso a vivienda (muerto) | — | Sí | ⚠️ 1 de 4 declarados aplica; oposición de clase-alta nunca ocurre |
| programa_educativo | Programa Educativo | social | −300 | 3 | +15 / −300 | S: estudiantiles, clase-media, academicos | **NINGUNO** ("educativa" ≠ "Educación"/"Educación pública"/"educación superior") | Presupuesto educativo (muerto) | — | Sí | ❌ declara 3, 0 efecto por mismatch de stemming/acento |
| salud_preventiva | Programa de Salud Preventiva | social | −350 | 3 | +18 / −350 | S: sectores-populares, clase-media, ongs | **NINGUNO** | mejora en servicios públicos (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| empleo_joven | Programa de Empleo Joven | social | −250 | 3 | +15 / −250 | S: estudiantiles, sindicatos, sectores-populares | **NINGUNO** ("laboral" no contiene "Derechos laborales") | condiciones laborales (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| cobertura_social | Ampliación de Cobertura Social | social | −400 | 3 | +20 / −400 | S: sectores-populares, ongs, cooperativas · O: empresarios, clase-alta | **sectores-populares +12** ("Programas sociales") ✅ · resto: sin efecto | Ayuda social (muerto) | — | Sí | ⚠️ 1 de 5 declarados aplica |
| alfabetizacion | Campaña de Alfabetización | social | −200 | 3 | +12 / −200 | S: sectores-populares, estudiantiles, academicos, ongs | **NINGUNO** | — | — | Sí | ❌ declara 4, 0 efecto |
| inclusion_digital | Plan de Inclusión Digital | social | −300 | 3 | +15 / −300 | S: clase-media, estudiantiles, empresarios | **NINGUNO** | — | — | Sí | ❌ declara 3, 0 efecto |
| programa_alimentario | Programa Alimentario | social | −350 | 3 | +20 / −350 | S: sectores-populares, ongs, cooperativas | **NINGUNO** ("alimentaria" no matchea "Programas sociales") | Ayuda social (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| tercera_edad | Asistencia a la Tercera Edad | social | −250 | 3 | +15 / −250 | S: sectores-populares, clase-media, ongs | **deportistas +9** ("apoyo") — espurio | Ayuda social (muerto) | — | Sí | ❌ 0 de 3 declarados aplican; falso positivo |
| igualdad_genero | Plan de Igualdad de Género | social | −200 | 3 | +15 / −200 | S: feministas, ongs, estudiantiles | **NINGUNO** ("equidad de género" ≠ "Igualdad de género") | Paridad salarial, protección contra violencia (muertos) | — | Sí | ❌ feministas jamás afectadas por su acción insignia |
| transporte_publico | Transporte Público | infraestructura | −400 | 3 | +15 / −400 | S: sectores-populares, clase-media, sindicatos · O: empresarios | **NINGUNO** | mejora en servicios públicos (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| energia_renovable | Energía Renovable | infraestructura | −500 | 3 | +12 / −500 | S: ambientalistas, ongs, academicos · O: empresarios | **NINGUNO** ("energías limpias" ≠ "energías renovables") | Políticas ambientales (muerto) | estudio_factibilidad | Condicional (prereq) | ❌ ambientalistas no responden a su tema central |
| construccion_hospitales | Construcción de Hospitales | infraestructura | −600 | 6 | +20 / −600 | S: sectores-populares, clase-media, sindicatos | **NINGUNO** | mejora en servicios públicos (muerto) | estudio_factibilidad | Condicional (prereq) | ❌ declara 3, 0 efecto |
| viviendas_rurales | Desarrollo de Viviendas Rurales | infraestructura | −300 | 3 | +15 / −300 | S: sector-agricola, sectores-populares | **sectores-populares +9** ("vivienda") ✅ · sector-agricola: sin efecto ("rurales" ≠ "infraestructura rural") | acceso a vivienda (muerto) | — | Sí | ⚠️ 1 de 2 declarados aplica |
| modernizacion_aeropuertos | Modernización de Aeropuertos | infraestructura | −700 | 6 | +10 / −700 | S: empresarios, clase-alta · O: ambientalistas | **NINGUNO** | — | estudio_factibilidad + infraestructura_vial | Condicional (prereq, solo presidente) | ❌ declara 3, 0 efecto |
| red_comunicaciones | Red de Comunicaciones | infraestructura | −400 | 3 | +12 / −400 | S: empresarios, clase-media, academicos | **NINGUNO** ("infraestructura aeroportuaria"... "telecomunicaciones" no matchea) | infraestructura (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| reforestacion | Programa de Reforestación | infraestructura | −200 | 3 | +15 / −200 | S: ambientalistas, ongs, cooperativas · O: sector-agricola | **NINGUNO** ("áreas verdes" ≠ "Protección ambiental") | Políticas ambientales, control de contaminación (muertos) | — | Sí | ❌ declara 4, 0 efecto |
| infraestructura_vial | Mejorar Infraestructura Vial | infraestructura | −500 | 3 | +15 / −500 | S: empresarios, sector-agricola, clase-media | **NINGUNO** ("carreteras" ≠ "infraestructura rural") | Mejora de caminos rurales (muerto) | estudio_factibilidad | Condicional (prereq) | ❌ declara 3, 0 efecto |
| tratamiento_agua | Plantas de Tratamiento de Agua | infraestructura | −400 | 3 | +12 / −400 | S: ambientalistas, sectores-populares, ongs | **NINGUNO** ("tratamiento de agua" ≠ "control de contaminación") | control de contaminación (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| red_gas | Red de Gas Natural | infraestructura | −450 | 3 | +15 / −450 | S: empresarios, clase-media, sindicatos · O: ambientalistas | **NINGUNO** | infraestructura (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| estudio_factibilidad | Estudio de factibilidad | infraestructura | −80 | 2 | +2 / −80 | S: empresarios, academicos | **NINGUNO** | — | — | Sí | ❌ declara 2, 0 efecto (su utilidad real es el costReduction del 20%) |
| plan_hidrico | Plan Hídrico | infraestructura | −450 | 3 | +14 / −450 | S: sector-agricola, ambientalistas, cooperativas | **NINGUNO** ("irrigación/canales" no matchea ningún interest) | infraestructura (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| mantenimiento_urbano | Mantenimiento Urbano | infraestructura | −250 | 3 | +10 / −250 | S: clase-media, sectores-populares | **NINGUNO** ("espacios públicos" ≠ "Programas sociales") | mejora en servicios públicos (muerto) | — | Sí | ❌ declara 2, 0 efecto |
| plan_conectividad | Plan de Conectividad | infraestructura | −350 | 3 | +13 / −350 | S: empresarios, clase-media, academicos, estudiantiles | **NINGUNO** ("internet" no matchea) | infraestructura (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| acuerdo_sindical | Acuerdo Sindical | diplomacia | −200 | 3 | +15 / −200 | S: sindicatos, sectores-populares · O: empresarios, clase-alta | **NINGUNO** ("Negociar con sindicatos" no contiene "Derechos laborales"/"aumentos salariales") | Paritarias, condiciones laborales (muertos) | — | Sí | ❌ paradoja: negociar con sindicatos no afecta a sindicatos |
| alianza_politica | Alianza Política | diplomacia | −150 | 1 | +10 / −150 | S: aliados · O: opositores | **NINGUNO** | Espacios de poder (muerto) | — | Sí | ❌ declara 2, 0 efecto |
| tratado_comercio | Tratado de Libre Comercio | diplomacia | −300 | 3 | +8 / −300 | S: empresarios, sector-agricola, sector-financiero · O: sindicatos | **NINGUNO** | — | **empresarios≥60** (baseSupport 40: difícil pero posible) | Condicional (prereq, solo presidente) | ❌ declara 4, 0 efecto |
| cooperacion_internacional | Cooperación Internacional | diplomacia | −250 | 3 | +12 / −250 | S: ongs, academicos, aliados · O: opositores | **NINGUNO** | — | — | Sí | ❌ declara 4, 0 efecto |
| acuerdo_ambiental | Acuerdo Ambiental | diplomacia | −200 | 3 | +15 / −200 | S: ambientalistas, ongs, academicos · O: empresarios | **NINGUNO** ("ambientales" no matchea "Protección ambiental") | Políticas ambientales (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| participacion_cumbres | Participación en Cumbres | diplomacia | −150 | 1 | +8 / −150 | S: aliados, ongs · O: opositores | **NINGUNO** | — | — | Sí (solo presidente) | ❌ declara 3, 0 efecto |
| mediacion_conflictos | Mediación en Conflictos | diplomacia | −200 | 3 | +10 / −200 | S: ongs, aliados · O: opositores | **NINGUNO** | — | — | Sí | ❌ declara 3, 0 efecto |
| seguridad_ciudadana | Seguridad Ciudadana | seguridad | −400 | 3 | +20 / −400 / est+10 / leg+5 | S: clase-media, clase-alta, empresarios | **clase-media +14** ("seguridad") ✅ · clase-alta/empresarios: sin efecto | seguridad (muerto) | — | Sí | ⚠️ 1 de 3 declarados aplica |
| lucha_narcotrafico | Lucha contra el Narcotráfico | seguridad | −500 | 3 | +15 / −500 | S: clase-media, ongs, aliados · O: sectores-populares | **NINGUNO** | seguridad (muerto) | fortalecimiento_justicia | Condicional (prereq) | ❌ declara 4, 0 efecto |
| programa_desarme | Programa de Desarme | seguridad | −300 | 3 | +12 / −300 | S: ongs, clase-media, estudiantiles | **NINGUNO** | seguridad (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| fortalecimiento_justicia | Fortalecimiento de la Justicia | seguridad | −400 | 3 | +10 / −400 | S: ongs, clase-media, aliados · O: opositores | **NINGUNO** ("judicial" ≠ "Transparencia") | Transparencia, rendición de cuentas (muertos) | — | Sí | ❌ declara 4, 0 efecto |
| sistema_vigilancia | Sistema de Vigilancia | seguridad | −350 | 3 | +15 / −350 | S: clase-media, empresarios · O: ongs | **clase-media +10.5** ("seguridad") ✅ · empresarios/ongs: sin efecto | seguridad (muerto) | — | Sí | ⚠️ 1 de 3 declarados aplica |
| policia_proximidad | Policía de Proximidad | seguridad | −300 | 3 | +18 / −300 | S: sectores-populares, clase-media, ongs | **NINGUNO** ("policía" no matchea "seguridad" como interest de clase-media: sí matchea… **no**: "seguridad" está en `interests` de clase-media y la descripción no la contiene) | seguridad (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| prevencion_delito | Prevención del Delito | seguridad | −250 | 3 | +15 / −250 | S: estudiantiles, clase-media, ongs, sectores-populares | **NINGUNO** ("prevención" no contiene "seguridad") | seguridad (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| programa_cultural | Programa Cultural | cultura | −200 | 3 | +12 / −200 | S: artistas, academicos, estudiantiles | **NINGUNO** ("culturales" ≠ "Apoyo cultural" como substring exacto… "actividades culturales" sí contiene "cultural" pero el interest completo es "Apoyo cultural" → no matchea) | Financiamiento cultural (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| festival_arte | Festival Nacional de Arte | cultura | −300 | 3 | +15 / −300 | S: artistas, estudiantiles, clase-media | **NINGUNO** | Financiamiento cultural (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| patrimonio_historico | Protección del Patrimonio | cultura | −250 | 3 | +10 / −250 | S: artistas, academicos, ongs, minorias-etnicas · O: empresarios | **NINGUNO** ("históricos" no matchea "preservación cultural") | Financiamiento cultural, infraestructura (muertos) | — | Sí | ❌ declara 5, 0 efecto |
| red_bibliotecas | Red de Bibliotecas | cultura | −200 | 3 | +12 / −200 | S: estudiantiles, academicos, clase-media | **NINGUNO** | infraestructura (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| centros_culturales | Centros Culturales | cultura | −350 | 3 | +15 / −350 | S: artistas, estudiantiles, cooperativas, sectores-populares | **NINGUNO** | Financiamiento cultural (muerto) | — | Sí | ❌ declara 4, 0 efecto |
| escuelas_arte | Escuelas de Arte | cultura | −250 | 3 | +12 / −250 | S: artistas, estudiantiles, academicos | **NINGUNO** | Financiamiento cultural (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| museos_interactivos | Museos Interactivos | cultura | −400 | 3 | +15 / −400 | S: artistas, academicos, estudiantiles, clase-media | **NINGUNO** | Financiamiento cultural, infraestructura (muertos) | — | Sí | ❌ declara 4, 0 efecto |
| festivales_regionales | Festivales Regionales | cultura | −300 | 3 | +18 / −300 | S: artistas, sectores-populares, minorias-etnicas | **NINGUNO** ("cultura regional" no matchea) | Financiamiento cultural (muerto) | — | Sí | ❌ declara 3, 0 efecto |
| promover_educacion | Promover Educación | educacion | −100 | 1 | +10 / −100 | S: estudiantiles, academicos, clase-media | **NINGUNO** | Presupuesto educativo (muerto) | — | Sí | ❌ declara 3, 0 efecto · **minBudget diverge: registry=100 vs categories=200** (la UI de categorías muestra otro valor) |
| fomentar_turismo | Fomentar Turismo | turismo | −50 | 1 | +8 / −50 | S: empresarios, artistas, clase-media | **NINGUNO** | — | — | Sí | ❌ declara 3, 0 efecto · **minBudget diverge: registry=50 vs categories=150** |
| desarrollar_tecnologia | Desarrollar Tecnología | tecnologia | −200 | 3 | +12 / −200 | S: empresarios, academicos, estudiantiles | **NINGUNO** | Presupuesto científico (muerto) | — | Sí | ❌ declara 3, 0 efecto · **minBudget diverge: registry=200 vs categories=300** |

> Nota de disponibilidad global: `getAvailableActionsForState` exige además que la acción esté en `gameState.unlockedActions` (inicialmente todas, vía `getAllActionIds()` desde `actionCategories`), que el presupuesto ≥ `minBudget` (fuente viva = registry), y que no haya cooldown activo. `POSITION_ACTION_EXCLUSIONS` está vacío para los 3 cargos; la restricción real de cargo vive en `availableForPositions`.

---

## 2. Resumen por categoría

| Categoría | Acciones | ✅ | ⚠️ | ❌ |
|---|---|---|---|---|
| economia | 12 | 0 | 0 | 12 |
| social | 10 | 0 | 2 | 8 |
| infraestructura | 14 | 0 | 1 | 13 |
| diplomacia | 7 | 0 | 0 | 7 |
| seguridad | 7 | 0 | 2 | 5 |
| cultura | 8 | 0 | 0 | 8 |
| educacion | 1 | 0 | 0 | 1 |
| turismo | 1 | 0 | 0 | 1 |
| tecnologia | 1 | 0 | 0 | 1 |
| **TOTAL** | **61** | **0** | **5** | **56** |

Las 5 ⚠️ (plan_viviendas, cobertura_social, viviendas_rurales, seguridad_ciudadana, sistema_vigilancia) son las únicas donde **al menos un** grupo declarado recibe efecto real (siempre positivo, por popularidad positiva).

---

## 3. Grupos de interés: afectados REALMENTE (matching) vs declarados

Conteo de acciones que declaran al grupo en supports/opposes vs acciones que realmente lo modifican vía `calculateGroupEffects` (matching texto). "Benefician" = efecto positivo (toda acción que matchea en la práctica tiene pop>0).

| Grupo | Intereses (keywords) | # Acciones que lo DECLARAN | # Acciones que lo afectan REAL (matching) | ¿Coinciden? |
|---|---|---|---|---|
| empresarios | Reducción de impuestos, desregulación, incentivos a la inversión | 27 | **0** | ❌ declarado 27×, efecto 0× |
| clase-media | Educación, seguridad, estabilidad económica | 26 | **2** (seguridad_ciudadana +14, sistema_vigilancia +10.5) | ⚠️ parcial |
| sectores-populares | Programas sociales, vivienda, trabajo | 23 | **3** (plan_viviendas +12, cobertura_social +12, viviendas_rurales +9) | ⚠️ parcial |
| ongs | Transparencia, derechos humanos | 24 | **0** | ❌ |
| sindicatos | Derechos laborales, aumentos salariales | 13 | **0** | ❌ (ni aumento_salarial ni acuerdo_sindical los afectan) |
| clase-alta | Seguridad jurídica, baja presión fiscal | 11 | **0** | ❌ |
| estudiantiles | Educación pública, becas | 16 | **0** | ❌ |
| academicos | Investigación, educación superior | 16 | **0** | ❌ |
| sector-financiero | Estabilidad monetaria, regulación favorable | 8 | **0** | ❌ |
| artistas | Apoyo cultural, espacios artísticos | 8 | **0** | ❌ (toda la rama cultura es cosmética) |
| ambientalistas | Protección ambiental, energías renovables | 7 | **0** | ❌ |
| opositores | Control del gobierno, alternancia | 7 | **0** | ❌ |
| aliados | Participación en gobierno, cargos | 6 | **0** | ❌ |
| sector-agricola | Subsidios agrícolas, infraestructura rural | 6 | **0** | ❌ |
| cooperativas | Economía social, apoyo estatal | 6 | **0** | ❌ |
| feministas | Igualdad de género, políticas inclusivas | 1 | **0** | ❌ |
| minorias-etnicas | Derechos territoriales, preservación cultural | 2 | **0** | ❌ |
| **deportistas** | Infraestructura deportiva, **apoyo** | **0** | **3** (subsidios_industriales +6, tercera_edad +9, fomento_emprendimiento +7.2) | ❌ **invisible en UI: el único grupo con efectos "gratuitos" no está declarado en ninguna acción** |

**Totales:** 221 menciones declaradas grupo×acción vs 8 efectos reales (5 legítimos, 3 espurios a deportistas). **14 de 18 grupos jamás reciben un efecto de acción en todo el juego.**

---

## 4. Los 10 peores casos (❌)

1. **subsidios_industriales** — Declara un eje empresarios/sindicatos vs financiero/ONGs completo (4 grupos). Efecto real: **+6 a deportistas** por la palabra "apoyo" en "Apoyo económico". Es la peor combinación posible: tooltip estratégico totalmente falso + falso positivo que además alimenta `applyCrossGroupEffects`.
2. **tercera_edad** — "Apoyo a adultos mayores": declara sectores-populares/clase-media/ONGs, no toca a ninguno, y **regala +9 a deportistas** por "apoyo". Una acción social de $250 que solo contenta al gremio deportivo.
3. **fomento_emprendimiento** — Igual patrón: 3 grupos declarados en frío, **+7.2 a deportistas** por "apoyo". El supuesto eje emprendedores/cooperativas/clase-media no existe.
4. **reforma_impositiva** — Triple falla: (a) sus 4 grupos declarados no matchean; (b) prereq `minLegislativeSupport: 45` potencialmente inalcanzable (`null`→0 hasta el año 2 y valor fijo después — el propio código lo admite en comentario); (c) `satisfiesDemand: simplificación tributaria` es metadata muerta, la demanda de empresarios nunca se puede satisfacer por vía declarativa.
5. **emitir_dinero** — La acción más peligrosa del juego (leg−5, est−3, vot−2, `moneyPrintingCount`) declara 5 grupos afectados y **ninguno reacciona**: ni los sectores populares que la apoyan ni los empresarios que se oponen. Cero consecuencia política grupal de la emisión.
6. **aumento_salarial** — La medida sindical por excelencia (pop +20, $400): declara sindicatos y sectores populares, pero "Incrementar salarios del sector público" no contiene "aumentos salariales" ni "Derechos laborales". **Sindicatos indiferentes; su demanda "Paritarias" insatisfacible por diseño.**
7. **acuerdo_sindical** — Paradoja de diseño: "Negociar con sindicatos" no contiene ningún interest sindical → los sindicatos no se enteran de la negociación. Declara además oposición de empresarios/clase-alta que tampoco ocurre.
8. **energia_renovable** — Prereq gated (estudio_factibilidad), $500, y su grupo natural (ambientalistas, interest "energías renovables") no matchea "energías limpias". La política ambiental insignia no mueve al lobby ambiental.
9. **igualdad_genero** — Única acción que declara a feministas (interest "Igualdad de género"); la descripción dice "equidad de género" → substring falla por sinónimo. El colectivo feminista es inalcanzable por acciones en todo el juego.
10. **prestamo_internacional / prestamo_local** — Ambos declaran efectos sobre financieros/opositores/empresarios que nunca se aplican, y encima su disponibilidad depende de la dificultad (`loansAvailable`), condición que el tooltip de grupos no refleja. El FMI del juego no altera ni una relación grupal.

---

## 5. Recomendaciones de balance (síntesis)

1. **Decidir la fuente de verdad grupal:** o bien `calculateGroupEffects` consume `affectedGroups` (supports/opposes con signo propio), o bien se reescriben las 61 descripciones para contener keywords de los interests. Mezclar ambos sistemas es lo peor: el jugador ve el tooltip y el motor hace otra cosa.
2. **Eliminar o implementar `satisfiesDemand`:** hoy 35 acciones prometen satisfacer demandas que nadie chequea. Implementarlo en el motor de demandas de subgrupos o borrarlo.
3. **Normalizar el matching** (minúsculas sin acentos, stemming básico) o migrar a keywords por acción (`action.keywords: string[]`) en lugar de substring sobre la descripción visible.
4. **Sanear el keyword "apoyo"** de los interests de deportistas (y revisar otros genéricos): hoy cualquier descripción con "apoyo"/"Apoyo" beneficia a deportistas.
5. **Revisar `reforma_impositiva`**: el prereq legislativo puede ser imposible; la nota del código dice "no cambiar", pero hay que validar contra `electionSystem.ts` si el valor 45 es alcanzable.
6. **Sincronizar `minBudget` entre registry y actionCategories** (promover_educacion 100/200, fomentar_turismo 50/150, desarrollar_tecnologia 200/300) o eliminar el duplicado: el engine filtra con registry y `getAllActionIds` usa categories.
