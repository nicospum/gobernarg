# ETAPA 2 — PROPUESTA DE `explicitGroupEffects` PARA LAS 53 ACCIONES RESTANTES

**Rol:** Diseñador de balance · **Fecha:** 2026-09-23 · **Estado:** PROPUESTA (no implementada en código)

**Criterio (5 líneas):** Se respeta el `affectedGroups` declarado en `actionRegistry.ts` (auditoría previa en `tabla_impactos_acciones.md` + revisión) salvo corrección de intención obvia. Magnitud = `popularityChange × (influence/10)` sobre los influences reales de `interestGroups.ts`; los `opposes` van con signo negativo. **Convención de signos para acciones impopulares:** cuando `popularityChange < 0`, se invierte la lectura semántica — los `supports` reciben **+**|pop|×inf/10 y los `opposes` **−**|pop|×inf/10 (ej.: `reduccion_gasto`, pop −20: empresarios +16, sindicatos −16). La regla mecánica literal "opposes = −(pop×inf/10)" premiaría a los opositores en acciones impopulares (empresarios ganarían apoyo con una mejor recaudación que declaran oponerse); la convención semántica es la única coherente con el sentido del tooltip. **Esto necesita validación del dueño** porque difiere de la fórmula literal. Solo se proponen groupIds existentes en `interestGroups.ts` (18 subgrupos). `mejorar_recaudacion` se propone con lista vacía (neutra). Las 8 acciones ya migradas quedan excluidas.

**Influences usados:** empresarios 8 · sector-agricola 7 · sector-financiero 9 · sindicatos 8 · clase-media 7 · sectores-populares 6 · clase-alta 8 · minorias-etnicas 5 · ongs 6 · ambientalistas 6 · feministas 7 · estudiantiles 5 · cooperativas 5 · aliados 8 · opositores 7 · artistas 5 · deportistas 6 · academicos 7.

---

## Economía (10)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| emitir_dinero — Emitir Dinero | S: sectores-populares, sindicatos · O: empresarios, sector-financiero, clase-alta | sectores-populares +1.8 · sindicatos +2.4 · empresarios −2.4 · sector-financiero −2.7 · clase-alta −2.4 | ALTA | Pop +3 pequeño → efectos chicos, coherente con el bajo costo político inmediato. |
| mejorar_recaudacion — Mejorar Recaudación | S: ongs · O: empresarios, clase-alta, sector-financiero | **[] (vacía)** | — | Neutral: optimizar gestión no es visible para ningún grupo. **Decisión dueño:** quitar también el `affectedGroups` declarado y que el tooltip no muestre grupos. |
| reforma_impositiva — Reforma Impositiva | S: ongs, sectores-populares · O: empresarios, clase-alta | ongs +6.0 · sectores-populares +6.0 · empresarios −8.0 · clase-alta −8.0 | MEDIA | La dirección de la reforma no está especificada: el declarado asume reforma progresiva (gana populares/ONGs, pierden empresarios/alta). Si la reforma fuera regresiva habría que invertir. |
| incentivos_exportacion — Incentivos a la Exportación | S: empresarios, sector-agricola | empresarios +6.4 · sector-agricola +5.6 | ALTA | |
| control_precios — Control de Precios | S: sectores-populares, sindicatos, clase-media · O: empresarios, clase-alta | sectores-populares +9.0 · sindicatos +12.0 · clase-media +10.5 · empresarios −12.0 · clase-alta −12.0 | ALTA | |
| aumento_salarial — Aumento Salarial General | S: sindicatos, sectores-populares · O: empresarios, clase-alta | sindicatos +16 · sectores-populares +12 · empresarios −16 · clase-alta −16 | ALTA | Corrección de la intención obvia: es la medida sindical insignia y hoy no tocaba a sindicatos. Nota: el texto dice "sector público"; sindicatos es el único grupo gremial, se asume cobertura total. |
| reduccion_gasto — Reducción del Gasto Público | S: empresarios, sector-financiero, clase-alta · O: sindicatos, sectores-populares | empresarios +16 · sector-financiero +18 · clase-alta +16 · sindicatos −16 · sectores-populares −12 | ALTA | Acción impopular: signos semánticos (los que la apoyan ganan, los que se oponen pierden). Ver convención en intro. |
| prestamo_internacional — Préstamo Internacional | S: sector-financiero · O: opositores, ongs | sector-financiero +4.5 · opositores −3.5 · ongs −3.0 | MEDIA | ¿Los financieros festejan un préstamo externo? Plausible (liquidez) pero discutible; ONGs/opositores coherentes. El costo político real ya vive en leg −8. |
| prestamo_local — Préstamo Local | S: sector-financiero, empresarios · O: opositores | sector-financiero +2.7 · empresarios +2.4 · opositores −2.1 | MEDIA | Ídem préstamo internacional; efectos deliberadamente pequeños (pop −3). |
| atraccion_inversiones — Atracción de Inversiones | S: empresarios, sector-financiero · O: sindicatos | empresarios +8 · sector-financiero +9 · sindicatos −8 | ALTA | |

## Social (7)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| programa_educativo — Programa Educativo | S: estudiantiles, clase-media, academicos | estudiantiles +7.5 · clase-media +10.5 · academicos +10.5 | ALTA | |
| salud_preventiva — Programa de Salud Preventiva | S: sectores-populares, clase-media, ongs | sectores-populares +10.8 · clase-media +12.6 · ongs +10.8 | ALTA | |
| empleo_joven — Programa de Empleo Joven | S: estudiantiles, sindicatos, sectores-populares | estudiantiles +7.5 · sindicatos +12 · sectores-populares +9 | ALTA | Sindicatos declarados a favor: aceptable (más empleo = más afiliación potencial). |
| alfabetizacion — Campaña de Alfabetización | S: sectores-populares, estudiantiles, academicos, ongs | sectores-populares +7.2 · estudiantiles +6.0 · academicos +8.4 · ongs +7.2 | ALTA | |
| inclusion_digital — Plan de Inclusión Digital | S: clase-media, estudiantiles, empresarios | clase-media +10.5 · estudiantiles +7.5 · empresarios +12 | ALTA | Vínculo empresarios aceptable (economía digital). |
| programa_alimentario — Programa Alimentario | S: sectores-populares, ongs, cooperativas | sectores-populares +12 · ongs +12 · cooperativas +10 | ALTA | |
| igualdad_genero — Plan de Igualdad de Género | S: feministas, ongs, estudiantiles | feministas +10.5 · ongs +9.0 · estudiantiles +7.5 | ALTA | Corrige el caso insignia: feministas era el único grupo que nunca recibía efecto. |

## Infraestructura (13)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| transporte_publico — Transporte Público | S: sectores-populares, clase-media, sindicatos · O: empresarios | sectores-populares +9.0 · clase-media +10.5 · sindicatos +12.0 · empresarios −12.0 | ALTA | |
| energia_renovable — Energía Renovable | S: ambientalistas, ongs, academicos · O: empresarios | ambientalistas +7.2 · ongs +7.2 · academicos +8.4 · empresarios −9.6 | ALTA | Corrige el mismatch "limpias" ≠ "renovables". |
| construccion_hospitales — Construcción de Hospitales | S: sectores-populares, clase-media, sindicatos | sectores-populares +12 · clase-media +14 · sindicatos +16 | ALTA | |
| modernizacion_aeropuertos — Modernización de Aeropuertos | S: empresarios, clase-alta · O: ambientalistas | empresarios +8.0 · clase-alta +8.0 · ambientalistas −6.0 | MEDIA | Oposición ambientalista débil: un aeropuerto modernizado no es necesariamente anti-ambiental. Mantener el declarado o dropar la oposición. |
| red_comunicaciones — Red de Comunicaciones | S: empresarios, clase-media, academicos | empresarios +9.6 · clase-media +8.4 · academicos +8.4 | MEDIA | Vínculo con académicos débil (telecom no es su tema: investigación/educación superior). |
| reforestacion — Programa de Reforestación | S: ambientalistas, ongs, cooperativas · O: sector-agricola | ambientalistas +9.0 · ongs +9.0 · cooperativas +7.5 · sector-agricola −10.5 | ALTA | Oposición agro = conflicto de uso de suelo, plausible. |
| infraestructura_vial — Mejorar Infraestructura Vial | S: empresarios, sector-agricola, clase-media | empresarios +12.0 · sector-agricola +10.5 · clase-media +10.5 | ALTA | |
| tratamiento_agua — Plantas de Tratamiento de Agua | S: ambientalistas, sectores-populares, ongs | ambientalistas +7.2 · sectores-populares +7.2 · ongs +7.2 | ALTA | |
| red_gas — Red de Gas Natural | S: empresarios, clase-media, sindicatos · O: ambientalistas | empresarios +12.0 · clase-media +10.5 · sindicatos +12.0 · ambientalistas −9.0 | ALTA | |
| estudio_factibilidad — Estudio de factibilidad | S: empresarios, academicos | empresarios +1.6 · academicos +1.4 | ALTA | Efectos diminutos acordes a pop +2. Alternativa: vaciarla como `mejorar_recaudacion` (su valor real es el costReduction del 20%). |
| plan_hidrico — Plan Hídrico | S: sector-agricola, ambientalistas, cooperativas | sector-agricola +9.8 · ambientalistas +8.4 · cooperativas +7.0 | ALTA | |
| mantenimiento_urbano — Mantenimiento Urbano | S: clase-media, sectores-populares | clase-media +7.0 · sectores-populares +6.0 | ALTA | |
| plan_conectividad — Plan de Conectividad | S: empresarios, clase-media, academicos, estudiantiles | empresarios +10.4 · clase-media +9.1 · academicos +9.1 · estudiantiles +6.5 | MEDIA | Ídem `red_comunicaciones`: vínculo académicos/estudiantiles con fibra óptica débil. |

## Diplomacia (7)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| acuerdo_sindical — Acuerdo Sindical | S: sindicatos, sectores-populares · O: empresarios, clase-alta | sindicatos +12 · sectores-populares +9 · empresarios −12 · clase-alta −12 | ALTA | Corrige la paradoja: "Negociar con sindicatos" no afectaba a sindicatos. |
| alianza_politica — Alianza Política | S: aliados · O: opositores | aliados +8.0 · opositores −7.0 | ALTA | |
| tratado_comercio — Tratado de Libre Comercio | S: empresarios, sector-agricola, sector-financiero · O: sindicatos | empresarios +6.4 · sector-agricola +5.6 · sector-financiero +7.2 · sindicatos −6.4 | ALTA | |
| cooperacion_internacional — Cooperación Internacional | S: ongs, academicos, aliados · O: opositores | ongs +7.2 · academicos +8.4 · aliados +9.6 · opositores −8.4 | MEDIA | "Lazos internacionales" genérico: vínculo con ONGs/académicos débil; el único declarante sólido es aliados. |
| acuerdo_ambiental — Acuerdo Ambiental | S: ambientalistas, ongs, academicos · O: empresarios | ambientalistas +9.0 · ongs +9.0 · academicos +10.5 · empresarios −12.0 | ALTA | |
| participacion_cumbres — Participación en Cumbres | S: aliados, ongs · O: opositores | aliados +6.4 · ongs +4.8 · opositores −5.6 | MEDIA | Asistir a reuniones no toca temáticamente a ONGs; la lógica real es interna (aliados/opositores). |
| mediacion_conflictos — Mediación en Conflictos | S: ongs, aliados · O: opositores | ongs +6.0 · aliados +8.0 · opositores −7.0 | MEDIA | Ídem: mediación regional sin vínculo temático claro con ONGs. |

## Seguridad (5)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| lucha_narcotrafico — Lucha contra el Narcotráfico | S: clase-media, ongs, aliados · O: sectores-populares | clase-media +10.5 · ongs +9.0 · aliados +12.0 · sectores-populares −9.0 | MEDIA | `aliados` apoyando la guerra narco es débil; la oposición de populares (daño colateral) es defendible. |
| programa_desarme — Programa de Desarme | S: ongs, clase-media, estudiantiles | ongs +7.2 · clase-media +8.4 · estudiantiles +6.0 | ALTA | |
| fortalecimiento_justicia — Fortalecimiento de la Justicia | S: ongs, clase-media, aliados · O: opositores | ongs +6.0 · clase-media +7.0 · aliados +8.0 · opositores −7.0 | ALTA | ONGs ↔ transparencia, vínculo fuerte; opositores vs. justicia fuerte, plausible. |
| policia_proximidad — Policía de Proximidad | S: sectores-populares, clase-media, ongs | sectores-populares +10.8 · clase-media +12.6 · ongs +10.8 | ALTA | |
| prevencion_delito — Prevención del Delito | S: estudiantiles, clase-media, ongs, sectores-populares | estudiantiles +7.5 · clase-media +10.5 · ongs +9.0 · sectores-populares +9.0 | ALTA | |

## Cultura (8)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| programa_cultural — Programa Cultural | S: artistas, academicos, estudiantiles | artistas +6.0 · academicos +8.4 · estudiantiles +6.0 | ALTA | |
| festival_arte — Festival Nacional de Arte | S: artistas, estudiantiles, clase-media | artistas +7.5 · estudiantiles +7.5 · clase-media +10.5 | ALTA | |
| patrimonio_historico — Protección del Patrimonio | S: artistas, academicos, ongs, minorias-etnicas · O: empresarios | artistas +5.0 · academicos +7.0 · ongs +6.0 · minorias-etnicas +5.0 · empresarios −8.0 | ALTA | Oposición empresarios = desarrollo inmobiliario vs. patrimonio, defendible. |
| red_bibliotecas — Red de Bibliotecas | S: estudiantiles, academicos, clase-media | estudiantiles +6.0 · academicos +8.4 · clase-media +8.4 | ALTA | |
| centros_culturales — Centros Culturales | S: artistas, estudiantiles, cooperativas, sectores-populares | artistas +7.5 · estudiantiles +7.5 · cooperativas +7.5 · sectores-populares +9.0 | ALTA | |
| escuelas_arte — Escuelas de Arte | S: artistas, estudiantiles, academicos | artistas +6.0 · estudiantiles +6.0 · academicos +8.4 | ALTA | |
| museos_interactivos — Museos Interactivos | S: artistas, academicos, estudiantiles, clase-media | artistas +7.5 · academicos +10.5 · estudiantiles +7.5 · clase-media +10.5 | ALTA | |
| festivales_regionales — Festivales Regionales | S: artistas, sectores-populares, minorias-etnicas | artistas +9.0 · sectores-populares +10.8 · minorias-etnicas +9.0 | ALTA | |

## Educación / Turismo / Tecnología (3)

| ID / Nombre | Declarados (S/O) | Propuesta `explicitGroupEffects` | Conf. | Nota |
|---|---|---|---|---|
| promover_educacion — Promover Educación | S: estudiantiles, academicos, clase-media | estudiantiles +5.0 · academicos +7.0 · clase-media +7.0 | ALTA | |
| fomentar_turismo — Fomentar Turismo | S: empresarios, artistas, clase-media | empresarios +6.4 · artistas +4.0 · clase-media +5.6 | ALTA | |
| desarrollar_tecnologia — Desarrollar Tecnología | S: empresarios, academicos, estudiantiles | empresarios +9.6 · academicos +8.4 · estudiantiles +6.0 | ALTA | |

---

## Resumen

- **Total propuesto:** 53 acciones (42 ALTA · 10 MEDIA · 1 vacía).
- **ALTA (42):** todo lo no listado abajo; el `affectedGroups` declarado es temáticamente coherente y se propone tal cual, con magnitudes calculadas.
- **MEDIA (10):** `reforma_impositiva` (dirección de la reforma no especificada), `prestamo_internacional`, `prestamo_local` (¿financieros/empresarios a favor de endeudarse?), `modernizacion_aeropuertos` (oposición ambientalista débil), `red_comunicaciones`, `plan_conectividad` (vínculo académicos/estudiantiles con telecom débil), `cooperacion_internacional`, `participacion_cumbres`, `mediacion_conflictos` (vínculo ONGs débil en diplomacia genérica), `lucha_narcotrafico` (`aliados` declarante débil).
- **Vacía (1):** `mejorar_recaudacion` — se propone `explicitGroupEffects: []` (o directamente no declarar el campo) y **eliminar su `affectedGroups`** para que el tooltip no muestre grupos fantasma.

### Decisiones que necesitan al dueño

1. **Convención de signos en acciones impopulares (bloquea 5 filas):** validar que para `popularityChange < 0` los supports ganan apoyo y los opposes lo pierden (`reduccion_gasto`, `reforma_impositiva`, `prestamo_internacional`, `prestamo_local`, `mejorar_recaudacion`-si-no-se-vacia). La fórmula literal del enunciado produciría signos invertidos en estos casos.
2. **`reforma_impositiva`:** confirmar que la reforma es progresiva (declarado actual) o si debe invertirse el eje.
3. **`mejorar_recaudacion`:** confirmar el vaciado + limpieza del tooltip.
4. **Casos MEDIA con declarantes débiles:** decidir si se mantienen los grupos débiles (propuesta actual) o se recortan (mínimo: `red_comunicaciones`/`plan_conectividad` → sacar `academicos`; `participacion_cumbres`/`mediacion_conflictos`/`cooperacion_internacional` → sacar `ongs`; `lucha_narcotrafico` → sacar `aliados`; `modernizacion_aeropuertos` → sacar oposición `ambientalistas` o mantenerla como flavor).
5. **`estudio_factibilidad`:** efectos diminutos (+1.6/+1.4) o vaciarla como neutral.
