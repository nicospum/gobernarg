# Playtest automatizado — datos

Generado por `npm run playtest` (playtest/report.playtest.ts). 30 partidas por estrategia (semillas 1..30), mismas funciones que la UI.
Victoria = ganar la reelección en T16 y que el espacio retenga el gobierno en la sucesión de T32 (IV ≥ 45).

| Estrategia | Gana | Reelecto | Votos reelección | Turnos jugados | Derrotas | INFL máx | GOB mín | Deuda final | Reuniones | Acuerdos firm./incumpl. | Eventos de canal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A · Jugador pasivo | 0% | 0% | 29.6 | 16 | election_loss 30 | 56.8 | 29.9 | 3000 | 0 | 0 / 0 | 1 |
| B · Abusa de la emisión | 0% | 0% | — | 6 | hyperinflation 30 | 98.8 | 49.3 | 3000 | 0 | 0 / 0 | 1 |
| C · Se endeuda | 0% | 0% | — | 11 | hyperinflation 30 | 100 | 36.3 | 4935 | 0 | 0 / 0 | 3.2 |
| D · Obra pública | 0% | 0% | 27.8 | 16 | election_loss 30 | 58.3 | 29.4 | 3000 | 16 | 2 / 1.8 | 1.3 |
| E · Técnico que ignora a los grupos | 13% | 23% | 42.8 | 19.7 | election_loss 26 | 54.3 | 45.9 | 3000 | 0 | 0 / 0 | 0.4 |
| F · Hipernegociador | 0% | 0% | 31.6 | 16 | election_loss 30 | 56.8 | 28.3 | 3000 | 81.8 | 1.7 / 1.6 | 1 |
| G1 · Rígido heterodoxo | 0% | 0% | — | 10.1 | hyperinflation 30 | 100 | 30.9 | 3000 | 10.1 | 0 / 0 | 4.9 |
| G1b · Heterodoxo coherente | 0% | 0% | 20 | 16 | election_loss 25, impeachment 5 | 71.6 | 17.4 | 3000 | 16 | 0 / 0 | 7.7 |
| G2 · Rígido ortodoxo | 0% | 0% | 22.9 | 15.8 | impeachment 19, election_loss 11 | 57.5 | 11.5 | 3000 | 15.8 | 0 / 0 | 12.9 |
| G2b · Ortodoxo coherente | 40% | 50% | 44.3 | 24 | election_loss 18 | 57.5 | 39.1 | 3000 | 24 | 0 / 0 | 0.9 |
| H · Adaptable | 100% | 100% | 71.3 | 32 | — | 56.5 | 49.4 | 5347 | 32 | 1.8 / 1 | 0 |

Actores en las bitácoras: Clase media, Sectores populares, Sindicatos, Industria, PyMEs, Financiero, Agro, Gobernadores, Oficialismo, Oposición (17 en total en el motor).

# Bitácoras turno por turno (semilla 1)

## A · Jugador pasivo

_Hace muy pocas políticas (una barata cada dos turnos) y casi no interactúa con actores._ Arquetipo: politico.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 33.1% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 0
- Acciones: —
- Indicadores: INFL 58→56.8 · ACTV 45→44.1 · PODA 42→40.9 · INVC 40→39.9 · SOLV 45→49.8 · EXTE 38→38.2 · PSOC 45→45 · SEGU 42→41.9 · CONF 40→37.5
- Por qué: Solvencia fiscal +4.8 (las cuentas públicas) · Conflictividad social -2.5 (la calle se calma sola o la exclusión la enciende) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Poder adquisitivo -1.1 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 42 · Sindicatos 41/50 · Industria 42/50 · PyMEs 42/50 · Financiero 46/50 · Agro 40/45 · Gobernadores 41/50 · Oficialismo 37/75 · Oposición 49/40
- Política: aprobación 34.3 · intención de voto 40.8% · gobernabilidad 50.4 · bancas 46% · imagen 49.7
- Cuentas: caja 1614 · resultado 114 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T2** (mandato 1, año 1 T2) — PA usados: 2
- Acciones: Mantenimiento de infraestructura, Asistencia alimentaria de emergencia
- Indicadores: INFL 56.8→55.4 · ACTV 44.1→43.1 · PODA 40.9→39.8 · INVC 39.9→39.9 · SOLV 49.8→49.5 · EXTE 38.2→38.4 · PSOC 45→47.9 · SEGU 41.9→41.8 · CONF 37.5→32.6
- Por qué: Conflictividad social -4.9 (Asistencia alimentaria de emergencia; la calle se calma sola o la exclusión la enciende) · Protección social y salud +2.9 (Asistencia alimentaria de emergencia) · Inflación -1.4 (expectativas y fundamentos de la inflación) · Poder adquisitivo -1.0 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 43 · Sindicatos 40/50 · Industria 43/50 · PyMEs 42/50 · Financiero 49/50 · Agro 41/45 · Gobernadores 40/50 · Oficialismo 37/75 · Oposición 50/40
- Política: aprobación 35 · intención de voto 41.1% · gobernabilidad 51.3 · bancas 45% · imagen 49.4
- Cuentas: caja 1321 · resultado -293 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T3** (mandato 1, año 1 T3) — PA usados: 0
- Acciones: —
- Indicadores: INFL 55.4→54 · ACTV 43.1→42.1 · PODA 39.8→39 · INVC 39.9→39.8 · SOLV 49.5→49.2 · EXTE 38.4→38.6 · PSOC 47.9→47.7 · SEGU 41.8→41.7 · CONF 32.6→32
- Por qué: Inflación -1.3 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Poder adquisitivo -0.9 (la inflación se comió los salarios) · Conflictividad social -0.6 (la calle se calma sola o la exclusión la enciende)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 42 · Sindicatos 39/50 · Industria 44/50 · PyMEs 42/50 · Financiero 51/50 · Agro 41/45 · Gobernadores 40/50 · Oficialismo 36/75 · Oposición 51/40
- Política: aprobación 34.8 · intención de voto 40.9% · gobernabilidad 50.9 · bancas 44% · imagen 49.1
- Cuentas: caja 1421 · resultado 100 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T4** (mandato 1, año 1 T4) — PA usados: 2
- Acciones: Mantenimiento de infraestructura, Asistencia alimentaria de emergencia
- Eventos: Inversión Extranjera → Facilitar la inversión
- Indicadores: INFL 54→52.8 · ACTV 42.1→41.2 · PODA 39→38.2 · INVC 39.8→43.7 · SOLV 49.2→46.3 · EXTE 38.6→40.7 · PSOC 47.7→47.5 · SEGU 41.7→41.6 · CONF 32→31.6
- Por qué: Solvencia fiscal -2.9 (las cuentas públicas) · Inflación -1.3 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Poder adquisitivo -0.7 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 42 · Sindicatos 38/49 · Industria 44/50 · PyMEs 41/50 · Financiero 51/50 · Agro 42/44 · Gobernadores 39/50 · Oficialismo 36/75 · Oposición 52/39
- Política: aprobación 34 · intención de voto 40.3% · gobernabilidad 50.2 · bancas 43% · imagen 48.9
- Cuentas: caja 1115 · resultado -307 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T5** (mandato 1, año 2 T1) — PA usados: 0
- Acciones: —
- Indicadores: INFL 52.8→51.6 · ACTV 41.2→40.5 · PODA 38.2→37.6 · INVC 43.7→43.4 · SOLV 46.3→47.3 · EXTE 40.7→40.7 · PSOC 47.5→47.2 · SEGU 41.6→41.5 · CONF 31.6→31.3
- Por qué: Inflación -1.2 (expectativas y fundamentos de la inflación) · Solvencia fiscal +1.1 (las cuentas públicas) · Actividad y empleo -0.7 (la inversión se volvió actividad) · Poder adquisitivo -0.6 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 41 · Sindicatos 37/49 · Industria 46/49 · PyMEs 42/49 · Financiero 52/49 · Agro 43/44 · Gobernadores 39/49 · Oficialismo 35/75 · Oposición 52/38
- Política: aprobación 33.7 · intención de voto 39.9% · gobernabilidad 49.6 · bancas 42% · imagen 48.6
- Cuentas: caja 1201 · resultado 86 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T6** (mandato 1, año 2 T2) — PA usados: 2
- Acciones: Mantenimiento de infraestructura, Asistencia alimentaria de emergencia
- Indicadores: INFL 51.6→50.4 · ACTV 40.5→39.8 · PODA 37.6→37.1 · INVC 43.4→43.1 · SOLV 47.3→45.1 · EXTE 40.7→40.8 · PSOC 47.2→46.9 · SEGU 41.5→41.4 · CONF 31.3→31.2
- Por qué: Solvencia fiscal -2.3 (las cuentas públicas) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.7 (la inversión se volvió actividad) · Poder adquisitivo -0.5 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 41 · Sindicatos 36/48 · Industria 47/49 · PyMEs 43/49 · Financiero 52/49 · Agro 44/43 · Gobernadores 38/49 · Oficialismo 34/74 · Oposición 51/38
- Política: aprobación 33.1 · intención de voto 39.4% · gobernabilidad 48.9 · bancas 41% · imagen 48.4
- Cuentas: caja 883 · resultado -318 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T7** (mandato 1, año 2 T3) — PA usados: 0
- Acciones: —
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 50.4→49.4 · ACTV 39.8→39.1 · PODA 37.1→36.7 · INVC 43.1→42.8 · SOLV 45.1→46.5 · EXTE 40.8→40.8 · PSOC 46.9→46.6 · SEGU 41.4→41.2 · CONF 31.2→35.1
- Por qué: Solvencia fiscal +1.4 (las cuentas públicas) · Inflación -1.0 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.7 (la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 40 · Sindicatos 35/48 · Industria 47/48 · PyMEs 43/48 · Financiero 53/48 · Agro 45/42 · Gobernadores 37/48 · Oficialismo 33/74 · Oposición 51/37
- Política: aprobación 32.4 · intención de voto 38.9% · gobernabilidad 47.4 · bancas 41% · imagen 48.2
- Cuentas: caja 660 · resultado 77 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T8** (mandato 1, año 2 T4) — PA usados: 2
- Acciones: Mantenimiento de infraestructura, Asistencia alimentaria de emergencia
- Indicadores: INFL 49.4→48.2 · ACTV 39.1→38.4 · PODA 36.7→36.4 · INVC 42.8→42.6 · SOLV 46.5→42.5 · EXTE 40.8→40.8 · PSOC 46.6→46.2 · SEGU 41.2→41 · CONF 35.1→35.8
- Por qué: Solvencia fiscal -4.1 (las cuentas públicas) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.7 (la inversión se volvió actividad) · Conflictividad social +0.7 (Sindicatos: medidas de fuerza)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 40 · Sindicatos 34/47 · Industria 46/48 · PyMEs 42/48 · Financiero 51/48 · Agro 45/41 · Gobernadores 36/48 · Oficialismo 32/74 · Oposición 49/36
- Política: aprobación 31.9 · intención de voto 38.4% · gobernabilidad 49 · bancas 44.5% · imagen 48
- Cuentas: caja 331 · resultado -628 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T9** (mandato 1, año 3 T1) — PA usados: 0
- Acciones: —
- Indicadores: INFL 48.2→47.4 · ACTV 38.4→37.7 · PODA 36.4→36.1 · INVC 42.6→42.3 · SOLV 42.5→43 · EXTE 40.8→40.8 · PSOC 46.2→45.9 · SEGU 41→40.8 · CONF 35.8→37.3
- Por qué: Inflación -0.8 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.7 (la inversión se volvió actividad) · Conflictividad social +0.6 (Sindicatos: medidas de fuerza) · Solvencia fiscal +0.5 (las cuentas públicas)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 39 · Sindicatos 34/46 · Industria 45/48 · PyMEs 41/47 · Financiero 50/48 · Agro 46/41 · Gobernadores 35/47 · Oficialismo 32/74 · Oposición 47/35
- Política: aprobación 31.2 · intención de voto 37.3% · gobernabilidad 48.5 · bancas 44.5% · imagen 45.8
- Cuentas: caja 398 · resultado 67 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T10** (mandato 1, año 3 T2) — PA usados: 1
- Acciones: Mantenimiento de infraestructura
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 47.4→46.5 · ACTV 37.7→36.9 · PODA 36.1→36 · INVC 42.3→42 · SOLV 43→41.8 · EXTE 40.8→40.8 · PSOC 45.9→43.6 · SEGU 40.8→40.6 · CONF 37.3→42
- Por qué: Protección social y salud -3.3 (el desempleo presiona la red social) · Conflictividad social +3.2 (Sindicatos: medidas de fuerza) · Solvencia fiscal -1.2 (las cuentas públicas) · Inflación -0.9 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 38 · Sindicatos 32/46 · Industria 44/47 · PyMEs 40/47 · Financiero 48/47 · Agro 46/40 · Gobernadores 34/51 · Oficialismo 31/74 · Oposición 45/36
- Política: aprobación 29.1 · intención de voto 35.6% · gobernabilidad 45.1 · bancas 41.5% · imagen 45.5
- Cuentas: caja -91 · resultado -139 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T11** (mandato 1, año 3 T3) — PA usados: 0
- Acciones: —
- Indicadores: INFL 46.5→45.6 · ACTV 36.9→36.1 · PODA 36→35.9 · INVC 42→41.8 · SOLV 41.8→43.5 · EXTE 40.8→40.8 · PSOC 43.6→43.2 · SEGU 40.6→40.3 · CONF 42→41
- Por qué: Solvencia fiscal +1.6 (las cuentas públicas) · Conflictividad social -0.9 (la calle se calma sola o la exclusión la enciende) · Actividad y empleo -0.9 (la inversión se volvió actividad) · Inflación -0.9 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 37 · Sindicatos 32/45 · Industria 42/47 · PyMEs 39/46 · Financiero 48/47 · Agro 45/39 · Gobernadores 31/50 · Oficialismo 30/73 · Oposición 43/38
- Política: aprobación 27.8 · intención de voto 34.6% · gobernabilidad 44.5 · bancas 40.5% · imagen 45.4
- Cuentas: caja -35 · resultado -294 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T12** (mandato 1, año 3 T4) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Indicadores: INFL 45.6→46.9 · ACTV 36.1→37.9 · PODA 35.9→35.8 · INVC 41.8→41.5 · SOLV 43.5→44.3 · EXTE 40.8→40.8 · PSOC 43.2→43 · SEGU 40.3→40.1 · CONF 41→40.3
- Por qué: Actividad y empleo +1.8 (Emitir dinero) · Inflación +1.2 (Emitir dinero) · Solvencia fiscal +0.8 (las cuentas públicas) · Conflictividad social -0.7 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 37 · Sindicatos 32/45 · Industria 42/46 · PyMEs 39/46 · Financiero 49/46 · Agro 44/39 · Gobernadores 30/50 · Oficialismo 29/73 · Oposición 41/39
- Política: aprobación 27.2 · intención de voto 34.2% · gobernabilidad 44 · bancas 39.5% · imagen 45.3
- Cuentas: caja 285 · resultado 69 · financiamiento 250 · gasto corriente 900 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T13** (mandato 1, año 4 T1) — PA usados: 0
- Acciones: —
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 46.9→46 · ACTV 37.9→37 · PODA 35.8→35.7 · INVC 41.5→41.3 · SOLV 44.3→46.1 · EXTE 40.8→40.8 · PSOC 43→42.7 · SEGU 40.1→39.9 · CONF 40.3→43.8
- Por qué: Solvencia fiscal +1.8 (las cuentas públicas) · Actividad y empleo -0.9 (la inversión se volvió actividad) · Inflación -0.9 (expectativas y fundamentos de la inflación) · Conflictividad social -0.5 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 36 · Sindicatos 32/44 · Industria 41/46 · PyMEs 39/45 · Financiero 50/46 · Agro 44/38 · Gobernadores 30/49 · Oficialismo 28/73 · Oposición 41/40
- Política: aprobación 26.8 · intención de voto 33.8% · gobernabilidad 42.3 · bancas 38.5% · imagen 45.3
- Cuentas: caja 47 · resultado 63 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T14** (mandato 1, año 4 T2) — PA usados: 0
- Acciones: —
- Indicadores: INFL 46→45 · ACTV 37→33.3 · PODA 35.7→35.5 · INVC 41.3→41 · SOLV 46.1→47.2 · EXTE 40.8→40.8 · PSOC 42.7→42.2 · SEGU 39.9→39.6 · CONF 43.8→44
- Por qué: Actividad y empleo -3.6 (la inversión se volvió actividad) · Conflictividad social -1.4 (la calle se calma sola o la exclusión la enciende) · Solvencia fiscal +1.1 (las cuentas públicas) · Inflación -1.0 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 35 · Sindicatos 31/43 · Industria 39/46 · PyMEs 37/45 · Financiero 51/46 · Agro 43/37 · Gobernadores 27/49 · Oficialismo 27/73 · Oposición 39/41
- Política: aprobación 25.8 · intención de voto 32.3% · gobernabilidad 41.5 · bancas 37.5% · imagen 42
- Cuentas: caja 84 · resultado -263 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T15** (mandato 1, año 4 T3) — PA usados: 0
- Acciones: —
- Indicadores: INFL 45→43.9 · ACTV 33.3→32.2 · PODA 35.5→35.4 · INVC 41→39.3 · SOLV 47.2→47.4 · EXTE 40.8→40.7 · PSOC 42.2→41.7 · SEGU 39.6→39.2 · CONF 44→42.6
- Por qué: Inversión y crédito -1.7 (Industria posterga inversiones) · Conflictividad social -1.4 (la calle se calma sola o la exclusión la enciende) · Actividad y empleo -1.1 (la inversión se volvió actividad) · Inflación -1.1 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 35 · Sindicatos 30/43 · Industria 38/45 · PyMEs 35/44 · Financiero 51/45 · Agro 43/37 · Gobernadores 26/48 · Oficialismo 26/73 · Oposición 38/42
- Política: aprobación 25 · intención de voto 31.6% · gobernabilidad 40.9 · bancas 36.5% · imagen 42.1
- Cuentas: caja 114 · resultado 30 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

**T16** (mandato 1, año 4 T4) — PA usados: 0
- Acciones: —
- Eventos: Ruptura del bloque oficialista → Reorganizar el bloque que queda | Renuncia de Ministro → Aceptar la renuncia | Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 43.9→42.8 · ACTV 32.2→31 · PODA 35.4→35.2 · INVC 39.3→37.7 · SOLV 47.4→47.3 · EXTE 40.7→40.7 · PSOC 41.7→41.2 · SEGU 39.2→38.9 · CONF 42.6→47.1
- Por qué: Inversión y crédito -1.6 (Industria posterga inversiones) · Actividad y empleo -1.3 (la inversión se volvió actividad) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Conflictividad social -1.0 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 34 · Sindicatos 29/42 · Industria 36/45 · PyMEs 34/44 · Financiero 51/45 · Agro 43/36 · Gobernadores 24/48 · Oficialismo 25/77 · Oposición 38/44
- Política: aprobación 24.2 · intención de voto 29.6% · gobernabilidad 31.1 · bancas 27.5% · imagen 36
- Cuentas: caja -164 · resultado 22 · financiamiento 0 · gasto corriente 900 · deuda 3000 · efectos pendientes 0

## B · Abusa de la emisión

_Emite dinero cada turno para financiar salarios, subsidios y programas sociales._ Arquetipo: politico.

Partida de muestra (semilla 1): **derrota (hyperinflation)** en 6 turnos · reelección — · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Emitir dinero, Aumento salarial a estatales, Ampliación de transferencias sociales, Congelar tarifas (subsidios a servicios)
- Indicadores: INFL 58→57.4 · ACTV 45→49.1 · PODA 42→46.8 · INVC 40→39.9 · SOLV 45→43.9 · EXTE 38→38.2 · PSOC 45→48.9 · SEGU 42→42.1 · CONF 40→35.3
- Por qué: Poder adquisitivo +4.8 (Aumento salarial a estatales; Congelar tarifas (subsidios a servicios)) · Conflictividad social -4.8 (Ampliación de transferencias sociales; la calle se calma sola o la exclusión la enciende) · Actividad y empleo +4.0 (Emitir dinero; Aumento salarial a estatales) · Protección social y salud +3.9 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 47 · Sectores populares 47 · Sindicatos 48/50 · Industria 44/50 · PyMEs 45/50 · Financiero 44/50 · Agro 40/45 · Gobernadores 44/50 · Oficialismo 41/75 · Oposición 49/40
- Política: aprobación 41.6 · intención de voto 45.6% · gobernabilidad 52.1 · bancas 47% · imagen 49.7
- Cuentas: caja 980 · resultado -770 · financiamiento 250 · gasto corriente 1170 · deuda 3000 · efectos pendientes 5
- Notas: Docentes: notan la medida que pedían. | Org. sociales: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 2
- Acciones: Emitir dinero, Bono a jubilados
- Indicadores: INFL 57.4→59 · ACTV 49.1→51.1 · PODA 46.8→47.5 · INVC 39.9→39.9 · SOLV 43.9→39.7 · EXTE 38.2→38.4 · PSOC 48.9→51.7 · SEGU 42.1→42.2 · CONF 35.3→33.9
- Por qué: Solvencia fiscal -4.2 (las cuentas públicas) · Protección social y salud +2.8 (Bono a jubilados; Aumento salarial a estatales (decisión anterior)) · Actividad y empleo +2.0 (Emitir dinero) · Inflación +1.6 (Emitir dinero)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 50 · Sindicatos 52/50 · Industria 46/50 · PyMEs 47/50 · Financiero 41/50 · Agro 39/45 · Gobernadores 47/50 · Oficialismo 47/75 · Oposición 53/40
- Política: aprobación 47.1 · intención de voto 49.4% · gobernabilidad 52.9 · bancas 47% · imagen 49.4
- Cuentas: caja 795 · resultado -435 · financiamiento 250 · gasto corriente 1170 · deuda 3000 · efectos pendientes 2

**T3** (mandato 1, año 1 T3) — PA usados: 1
- Acciones: Emitir dinero
- Indicadores: INFL 59→62.2 · ACTV 51.1→48 · PODA 47.5→46 · INVC 39.9→39.7 · SOLV 39.7→35.4 · EXTE 38.4→37.6 · PSOC 51.7→51.5 · SEGU 42.2→42.3 · CONF 33.9→33
- Por qué: Solvencia fiscal -4.3 (las cuentas públicas) · Inflación +3.2 (Emitir dinero; expectativas y fundamentos de la inflación) · Actividad y empleo -3.0 (la inversión se volvió actividad) · Infraestructura -1.8 (Congelar tarifas (subsidios a servicios) (decisión anterior); desgaste sin mantenimiento)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 50 · Sindicatos 51/50 · Industria 44/50 · PyMEs 46/50 · Financiero 37/50 · Agro 38/45 · Gobernadores 47/50 · Oficialismo 50/75 · Oposición 57/40
- Política: aprobación 45.8 · intención de voto 48.6% · gobernabilidad 53.2 · bancas 47% · imagen 49.1
- Cuentas: caja 834 · resultado -211 · financiamiento 250 · gasto corriente 1170 · deuda 3000 · efectos pendientes 1

**T4** (mandato 1, año 1 T4) — PA usados: 4
- Acciones: Emitir dinero, Aumento salarial a estatales, Ampliación de transferencias sociales, Congelar tarifas (subsidios a servicios)
- Eventos: Crisis Energética → Invertir en infraestructura
- Indicadores: INFL 62.2→70.1 · ACTV 48→46.6 · PODA 46→49.6 · INVC 39.7→36.1 · SOLV 35.4→30.7 · EXTE 37.6→34 · PSOC 51.5→55.2 · SEGU 42.3→42.5 · CONF 33→33
- Por qué: Inflación +8.0 (Emitir dinero; Emitir dinero (decisión anterior)) · Solvencia fiscal -4.7 (las cuentas públicas) · Protección social y salud +3.7 (Ampliación de transferencias sociales) · Sector externo y divisas -3.6 (Emitir dinero; Congelar tarifas (subsidios a servicios) (decisión anterior))
- Actores (satisfacción/relación): Clase media 47 · Sectores populares 50 · Sindicatos 52/49 · Industria 41/50 · PyMEs 43/50 · Financiero 30/50 · Agro 33/44 · Gobernadores 47/50 · Oficialismo 50/75 · Oposición 59/39
- Política: aprobación 44.1 · intención de voto 47.3% · gobernabilidad 52.8 · bancas 47% · imagen 48.9
- Cuentas: caja -473 · resultado -1157 · financiamiento 250 · gasto corriente 1440 · deuda 3000 · efectos pendientes 8

**T5** (mandato 1, año 2 T1) — PA usados: 1
- Acciones: Emitir dinero (forzada), Emitir dinero
- Eventos: Corrida cambiaria → Suba de tasas de emergencia
- Indicadores: INFL 70.1→93.2 · ACTV 46.6→46.1 · PODA 49.6→41.3 · INVC 36.1→25.1 · SOLV 30.7→19 · EXTE 34→27.4 · PSOC 55.2→53.9 · SEGU 42.5→42.7 · CONF 33→32.2
- Por qué: Inflación +23.0 (Emitir dinero (decisión anterior); Emitir dinero) · Solvencia fiscal -11.7 (las cuentas públicas; Sube el riesgo país) · Sector externo y divisas -10.6 (Emitir dinero; Agro retiene la cosecha) · Poder adquisitivo -8.3 (la inflación se comió los salarios)
- Canales de poder aplicados: Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 40 · Sectores populares 43 · Sindicatos 42/49 · Industria 32/49 · PyMEs 34/49 · Financiero 20/49 · Agro 26/44 · Gobernadores 46/49 · Oficialismo 41/75 · Oposición 59/38
- Política: aprobación 30.9 · intención de voto 38.4% · gobernabilidad 51.8 · bancas 47% · imagen 48.6
- Cuentas: caja -901 · resultado -1088 · financiamiento 260 · gasto corriente 1440 · deuda 3000 · efectos pendientes 7
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T6** (mandato 1, año 2 T2) — PA usados: 1
- Acciones: Emitir dinero (forzada), Emitir dinero
- Indicadores: INFL 93.2→98 · ACTV 46.1→45 · PODA 41.3→36.4 · INVC 25.1→16.9 · SOLV 19→12.7 · EXTE 27.4→13.3 · PSOC 53.9→53.6 · SEGU 42.7→42.8 · CONF 32.2→31.7
- Por qué: Sector externo y divisas -14.1 (Emitir dinero; Corrida cambiaria) · Inversión y crédito -8.2 (Emitir dinero; el clima de inversión) · Solvencia fiscal -6.3 (las cuentas públicas; Sube el riesgo país) · Poder adquisitivo -4.9 (la inflación se comió los salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Corrida cambiaria (EXTE -6.0) · Corrida cambiaria (INFL +4.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 34 · Sectores populares 37 · Sindicatos 33/48 · Industria 24/49 · PyMEs 26/49 · Financiero 14/49 · Agro 20/43 · Gobernadores 41/49 · Oficialismo 30/74 · Oposición 54/38
- Política: aprobación 21.3 · intención de voto 31.6% · gobernabilidad 49.4 · bancas 45% · imagen 48.4
- Cuentas: caja -1288 · resultado -646 · financiamiento 260 · gasto corriente 1440 · deuda 3000 · efectos pendientes 5
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

## C · Se endeuda

_Toma deuda interna y externa cada vez que puede y la usa para gasto y obras._ Arquetipo: empresario.

Partida de muestra (semilla 1): **derrota (hyperinflation)** en 11 turnos · reelección — · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Préstamo de organismos internacionales, Colocación de deuda en el mercado local, Aumento salarial a estatales, Ampliación de transferencias sociales
- Indicadores: INFL 58→54 · ACTV 45→46.1 · PODA 42→44.8 · INVC 40→37.1 · SOLV 45→47 · EXTE 38→43 · PSOC 45→48.9 · SEGU 42→42 · CONF 40→35.3
- Por qué: Sector externo y divisas +5.0 (Préstamo de organismos internacionales) · Conflictividad social -4.8 (Ampliación de transferencias sociales; la calle se calma sola o la exclusión la enciende) · Inflación -4.0 (expectativas y fundamentos de la inflación) · Protección social y salud +3.9 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 47 · Sectores populares 46 · Sindicatos 46/50 · Industria 44/55 · PyMEs 43/50 · Financiero 47/63 · Agro 43/45 · Gobernadores 42/50 · Oficialismo 36/75 · Oposición 49/30
- Política: aprobación 40.8 · intención de voto 44% · gobernabilidad 51.6 · bancas 46% · imagen 49.7
- Cuentas: caja 2283 · resultado -517 · financiamiento 1300 · gasto corriente 1170 · deuda 4215 · efectos pendientes 4
- Notas: Financiero: notan la medida que pedían. | Docentes: notan la medida que pedían. | Org. sociales: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 3
- Acciones: Plan federal de viviendas, Atención primaria de la salud, Inversión educativa
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 54→50.8 · ACTV 46.1→46.8 · PODA 44.8→44 · INVC 37.1→37.1 · SOLV 47→36.3 · EXTE 43→42.9 · PSOC 48.9→49.7 · SEGU 42→42.1 · CONF 35.3→33.9
- Por qué: Solvencia fiscal -10.7 (las cuentas públicas) · Inflación -3.2 (expectativas y fundamentos de la inflación) · Conflictividad social -1.3 (la calle se calma sola o la exclusión la enciende) · Protección social y salud +0.9 (Aumento salarial a estatales (decisión anterior))
- Actores (satisfacción/relación): Clase media 50 · Sectores populares 49 · Sindicatos 49/50 · Industria 46/55 · PyMEs 45/50 · Financiero 45/63 · Agro 44/45 · Gobernadores 44/50 · Oficialismo 39/75 · Oposición 53/38
- Política: aprobación 45.8 · intención de voto 46.6% · gobernabilidad 52 · bancas 45% · imagen 46.4
- Cuentas: caja 894 · resultado -1189 · financiamiento 0 · gasto corriente 1250 · deuda 4215 · efectos pendientes 8
- Notas: Estudiantes: notan la medida que pedían. | Docentes: notan la medida que pedían. | Org. sociales: notan la medida que pedían.

**T3** (mandato 1, año 1 T3) — PA usados: 0
- Acciones: —
- Indicadores: INFL 50.8→48.9 · ACTV 46.8→43.6 · PODA 44→43.5 · INVC 37.1→37.2 · SOLV 36.3→27.2 · EXTE 42.9→42.8 · PSOC 49.7→52.5 · SEGU 42.1→42.1 · CONF 33.9→33
- Por qué: Solvencia fiscal -9.2 (las cuentas públicas) · Actividad y empleo -3.2 (la inversión se volvió actividad) · Protección social y salud +2.8 (Atención primaria de la salud (decisión anterior)) · Inflación -1.9 (expectativas y fundamentos de la inflación)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 51 · Sindicatos 50/50 · Industria 46/55 · PyMEs 44/50 · Financiero 40/63 · Agro 45/45 · Gobernadores 44/50 · Oficialismo 42/75 · Oposición 56/38
- Política: aprobación 48.7 · intención de voto 48.4% · gobernabilidad 52.3 · bancas 45% · imagen 46.3
- Cuentas: caja 631 · resultado -463 · financiamiento 0 · gasto corriente 1250 · deuda 4215 · efectos pendientes 6

**T4** (mandato 1, año 1 T4) — PA usados: 2
- Acciones: Aumento salarial a estatales, Ampliación de transferencias sociales
- Indicadores: INFL 48.9→48.7 · ACTV 43.6→44.6 · PODA 43.5→47 · INVC 37.2→40.1 · SOLV 27.2→14.2 · EXTE 42.8→42.8 · PSOC 52.5→58.1 · SEGU 42.1→42.3 · CONF 33→30
- Por qué: Solvencia fiscal -13.0 (las cuentas públicas) · Protección social y salud +5.6 (Ampliación de transferencias sociales; Plan federal de viviendas (decisión anterior)) · Poder adquisitivo +3.5 (Aumento salarial a estatales; Ampliación de transferencias sociales) · Conflictividad social -3.0 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 55 · Sectores populares 55 · Sindicatos 53/49 · Industria 47/55 · PyMEs 47/50 · Financiero 35/63 · Agro 45/44 · Gobernadores 46/50 · Oficialismo 47/75 · Oposición 60/37
- Política: aprobación 55 · intención de voto 52.6% · gobernabilidad 53.4 · bancas 45% · imagen 46.2
- Cuentas: caja -246 · resultado -877 · financiamiento 0 · gasto corriente 1520 · deuda 4215 · efectos pendientes 7

**T5** (mandato 1, año 2 T1) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Eventos: Default Selectivo de Deuda → Renegociar deuda
- Indicadores: INFL 48.7→51.4 · ACTV 44.6→44.6 · PODA 47→46.4 · INVC 40.1→40 · SOLV 14.2→4.1 · EXTE 42.8→38.7 · PSOC 58.1→58.7 · SEGU 42.3→42.4 · CONF 30→30
- Por qué: Solvencia fiscal -7.1 (Préstamo de organismos internacionales (decisión anterior)) · Inflación +2.7 (Emitir dinero; expectativas y fundamentos de la inflación) · Educación +2.7 (Inversión educativa (decisión anterior); Aumento salarial a estatales (decisión anterior)) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Actores (satisfacción/relación): Clase media 56 · Sectores populares 57 · Sindicatos 55/49 · Industria 48/54 · PyMEs 47/49 · Financiero 30/67 · Agro 44/44 · Gobernadores 47/49 · Oficialismo 52/75 · Oposición 64/36
- Política: aprobación 57.5 · intención de voto 53.3% · gobernabilidad 54.2 · bancas 46% · imagen 42.1
- Cuentas: caja -1024 · resultado -527 · financiamiento 50 · gasto corriente 1520 · deuda 4215 · efectos pendientes 2
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T6** (mandato 1, año 2 T2) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Indicadores: INFL 51.4→54.6 · ACTV 44.6→44.5 · PODA 46.4→45.5 · INVC 40→39.9 · SOLV 4.1→0 · EXTE 38.7→38.9 · PSOC 58.7→60.2 · SEGU 42.4→42.6 · CONF 30→30
- Por qué: Solvencia fiscal -4.1 (Sube el riesgo país; las cuentas públicas) · Inflación +3.2 (Emitir dinero; expectativas y fundamentos de la inflación) · Protección social y salud +1.5 (Plan federal de viviendas (decisión anterior)) · Poder adquisitivo -0.9 (la inflación se comió los salarios)
- Canales de poder aplicados: Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 56 · Sectores populares 58 · Sindicatos 54/48 · Industria 46/54 · PyMEs 47/49 · Financiero 25/67 · Agro 41/43 · Gobernadores 48/49 · Oficialismo 55/74 · Oposición 66/36
- Política: aprobación 56.6 · intención de voto 52.8% · gobernabilidad 54.6 · bancas 47% · imagen 42.2
- Cuentas: caja -1311 · resultado -838 · financiamiento 250 · gasto corriente 1530 · deuda 4215 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T7** (mandato 1, año 2 T3) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Eventos: Corrida cambiaria → Suba de tasas de emergencia
- Indicadores: INFL 54.6→58.7 · ACTV 44.5→42.4 · PODA 45.5→44.3 · INVC 39.9→36.8 · SOLV 0→0 · EXTE 38.9→43 · PSOC 60.2→59.7 · SEGU 42.6→42.8 · CONF 30→28.5
- Por qué: Inflación +4.2 (expectativas y fundamentos de la inflación; Emitir dinero) · Conflictividad social -1.5 (Contención territorial) · Poder adquisitivo -1.2 (la inflación se comió los salarios) · Actividad y empleo -1.1 (la inversión se volvió actividad)
- Canales de poder aplicados: Sube el riesgo país (SOLV -5.0) · Contención territorial (CONF -2.0)
- Actores (satisfacción/relación): Clase media 54 · Sectores populares 55 · Sindicatos 51/48 · Industria 44/53 · PyMEs 45/48 · Financiero 22/66 · Agro 38/42 · Gobernadores 48/48 · Oficialismo 56/74 · Oposición 67/35
- Política: aprobación 52.2 · intención de voto 49.9% · gobernabilidad 53.9 · bancas 46% · imagen 42.3
- Cuentas: caja -1607 · resultado -546 · financiamiento 250 · gasto corriente 1530 · deuda 4215 · efectos pendientes 1
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T8** (mandato 1, año 2 T4) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Eventos: Crisis Energética → Invertir en infraestructura
- Indicadores: INFL 58.7→69.6 · ACTV 42.4→38.7 · PODA 44.3→41.9 · INVC 36.8→33.4 · SOLV 0→1.4 · EXTE 43→34.4 · PSOC 59.7→59.1 · SEGU 42.8→42.9 · CONF 28.5→31.9
- Por qué: Inflación +10.8 (Corrida cambiaria; Emitir dinero (decisión anterior)) · Sector externo y divisas -8.6 (Corrida cambiaria; Emitir dinero) · Inversión y crédito -3.4 (Emitir dinero; el clima de inversión) · Poder adquisitivo -2.4 (la inflación se comió los salarios)
- Canales de poder aplicados: Corrida cambiaria (EXTE -6.0) · Corrida cambiaria (INFL +4.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 49 · Sindicatos 43/47 · Industria 37/53 · PyMEs 37/48 · Financiero 17/66 · Agro 33/41 · Gobernadores 45/48 · Oficialismo 50/74 · Oposición 66/34
- Política: aprobación 40.2 · intención de voto 42.2% · gobernabilidad 53.2 · bancas 48.2% · imagen 43.3
- Cuentas: caja -2352 · resultado -595 · financiamiento 250 · gasto corriente 1530 · deuda 4215 · efectos pendientes 2
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T9** (mandato 1, año 3 T1) — PA usados: 1
- Acciones: Emitir dinero (forzada), Préstamo de organismos internacionales
- Indicadores: INFL 69.6→82.5 · ACTV 38.7→36.7 · PODA 41.9→37.9 · INVC 33.4→27.5 · SOLV 1.4→10.8 · EXTE 34.4→32.4 · PSOC 59.1→58.4 · SEGU 42.9→42.9 · CONF 31.9→31.4
- Por qué: Inflación +12.9 (Emitir dinero (decisión anterior); Emitir dinero) · Solvencia fiscal +9.4 (Préstamo de organismos internacionales) · Inversión y crédito -5.9 (Emitir dinero; Industria posterga inversiones) · Poder adquisitivo -4.0 (la inflación se comió los salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 41 · Sectores populares 41 · Sindicatos 33/46 · Industria 30/53 · PyMEs 29/47 · Financiero 13/69 · Agro 29/41 · Gobernadores 40/47 · Oficialismo 38/74 · Oposición 59/33
- Política: aprobación 27 · intención de voto 33.2% · gobernabilidad 51.1 · bancas 46.2% · imagen 43.4
- Cuentas: caja -2148 · resultado -1126 · financiamiento 930 · gasto corriente 1530 · deuda 4935 · efectos pendientes 4
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada). | Financiero: notan la medida que pedían.

**T10** (mandato 1, año 3 T2) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Indicadores: INFL 82.5→98.6 · ACTV 36.7→33.5 · PODA 37.9→32.3 · INVC 27.5→21.4 · SOLV 10.8→6.8 · EXTE 32.4→24.5 · PSOC 58.4→57.6 · SEGU 42.9→42.9 · CONF 31.4→34.4
- Por qué: Inflación +16.1 (Emitir dinero (decisión anterior); la falta de dólares) · Sector externo y divisas -7.9 (Emitir dinero; Agro retiene la cosecha) · Inversión y crédito -6.1 (Emitir dinero; el clima de inversión) · Poder adquisitivo -5.6 (la inflación se comió los salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0)
- Actores (satisfacción/relación): Clase media 33 · Sectores populares 32 · Sindicatos 24/46 · Industria 22/52 · PyMEs 21/47 · Financiero 10/68 · Agro 23/40 · Gobernadores 34/47 · Oficialismo 26/74 · Oposición 50/34
- Política: aprobación 17.6 · intención de voto 25.6% · gobernabilidad 45.8 · bancas 41.2% · imagen 40.2
- Cuentas: caja -2830 · resultado -812 · financiamiento 130 · gasto corriente 1530 · deuda 4935 · efectos pendientes 4
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T11** (mandato 1, año 3 T3) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Eventos: Corrida cambiaria → Suba de tasas de emergencia | Ruptura del bloque oficialista → Reorganizar el bloque que queda
- Indicadores: INFL 98.6→100 · ACTV 33.5→26.9 · PODA 32.3→26.8 · INVC 21.4→13.2 · SOLV 6.8→3.9 · EXTE 24.5→19.8 · PSOC 57.6→56.5 · SEGU 42.9→42.7 · CONF 34.4→37.9
- Por qué: Sector externo y divisas -8.6 (Emitir dinero; Agro retiene la cosecha) · Actividad y empleo -5.6 (la inversión se volvió actividad; PyMEs: cierres y despidos) · Poder adquisitivo -5.6 (la inflación se comió los salarios) · Inversión y crédito -5.2 (Emitir dinero; el clima de inversión)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Clase media dolariza sus ahorros (EXTE -2.0) · Piquetes (CONF +2.9)
- Actores (satisfacción/relación): Clase media 27 · Sectores populares 25 · Sindicatos 17/45 · Industria 16/52 · PyMEs 15/46 · Financiero 7/68 · Agro 19/39 · Gobernadores 27/46 · Oficialismo 17/76 · Oposición 40/36
- Política: aprobación 12.3 · intención de voto 21.9% · gobernabilidad 37.6 · bancas 31.2% · imagen 40.4
- Cuentas: caja -3544 · resultado -844 · financiamiento 130 · gasto corriente 1530 · deuda 4935 · efectos pendientes 4
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

## D · Obra pública

_Invierte agresivamente en infraestructura: estudios, rutas, energía, agua, hospitales; cuida a los gobernadores._ Arquetipo: politico.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 31.5% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Estudio de factibilidad, Mantenimiento de infraestructura, Transferencias discrecionales a provincias, Plan federal de viviendas
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 58→56.8 · ACTV 45→46.1 · PODA 42→41 · INVC 40→39.9 · SOLV 45→40.5 · EXTE 38→38.2 · PSOC 45→45 · SEGU 42→41.9 · CONF 40→37.5
- Por qué: Solvencia fiscal -4.5 (las cuentas públicas) · Conflictividad social -2.5 (la calle se calma sola o la exclusión la enciende) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Actividad y empleo +1.1 (Plan federal de viviendas)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 43 · Sindicatos 42/50 · Industria 43/50 · PyMEs 42/50 · Financiero 42/50 · Agro 40/45 · Gobernadores 42/58 · Oficialismo 38/75 · Oposición 48/40
- Política: aprobación 35 · intención de voto 41.7% · gobernabilidad 51.6 · bancas 46% · imagen 50.7
- Cuentas: caja 226 · resultado -1274 · financiamiento 0 · gasto corriente 950 · deuda 3000 · efectos pendientes 4

**T2** (mandato 1, año 1 T2) — PA usados: 1
- Acciones: —
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 56.8→55.9 · ACTV 46.1→45.1 · PODA 41→40 · INVC 39.9→39.8 · SOLV 40.5→38 · EXTE 38.2→38.4 · PSOC 45→45 · SEGU 41.9→41.8 · CONF 37.5→35.6
- Por qué: Solvencia fiscal -2.5 (las cuentas públicas) · Conflictividad social -1.9 (la calle se calma sola o la exclusión la enciende) · Actividad y empleo -0.9 (la inversión se volvió actividad) · Poder adquisitivo -0.9 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 42 · Sindicatos 41/50 · Industria 44/50 · PyMEs 43/50 · Financiero 40/50 · Agro 41/45 · Gobernadores 42/55 · Oficialismo 38/75 · Oposición 48/40
- Política: aprobación 34.4 · intención de voto 41.1% · gobernabilidad 51.5 · bancas 45% · imagen 50.3
- Cuentas: caja 298 · resultado 72 · financiamiento 0 · gasto corriente 950 · deuda 3000 · efectos pendientes 4

**T3** (mandato 1, año 1 T3) — PA usados: 1
- Acciones: Estudio de factibilidad
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 55.9→55.2 · ACTV 45.1→44.2 · PODA 40→39.2 · INVC 39.8→39.7 · SOLV 38→35.9 · EXTE 38.4→38.6 · PSOC 45→46.9 · SEGU 41.8→41.8 · CONF 35.6→34.2
- Por qué: Solvencia fiscal -2.1 (las cuentas públicas) · Protección social y salud +1.9 (Plan federal de viviendas (decisión anterior)) · Conflictividad social -1.4 (la calle se calma sola o la exclusión la enciende) · Infraestructura +1.0 (Transferencias discrecionales a provincias (decisión anterior))
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 43 · Sindicatos 40/50 · Industria 45/50 · PyMEs 42/50 · Financiero 39/50 · Agro 42/45 · Gobernadores 43/55 · Oficialismo 37/75 · Oposición 49/40
- Política: aprobación 34.2 · intención de voto 40.9% · gobernabilidad 50 · bancas 44% · imagen 50
- Cuentas: caja 291 · resultado -7 · financiamiento 0 · gasto corriente 950 · deuda 3000 · efectos pendientes 2

**T4** (mandato 1, año 1 T4) — PA usados: 2
- Acciones: Mantenimiento de infraestructura
- Interacciones: negociar Gobernadores: Gobernadores acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo. | reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Oportunidad de Coalición → Aceptar la coalición
- Indicadores: INFL 55.2→54.5 · ACTV 44.2→41.3 · PODA 39.2→38.3 · INVC 39.7→39.5 · SOLV 35.9→42.5 · EXTE 38.6→38.7 · PSOC 46.9→46.7 · SEGU 41.8→41.7 · CONF 34.2→33.2
- Por qué: Solvencia fiscal +6.6 (las cuentas públicas) · Actividad y empleo -2.9 (la inversión se volvió actividad) · Conflictividad social -1.0 (la calle se calma sola o la exclusión la enciende) · Poder adquisitivo -0.9 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 41 · Sindicatos 38/49 · Industria 44/50 · PyMEs 41/50 · Financiero 42/50 · Agro 42/44 · Gobernadores 42/55 · Oficialismo 35/73 · Oposición 49/39
- Política: aprobación 32.7 · intención de voto 39.8% · gobernabilidad 52 · bancas 47% · imagen 49.7
- Cuentas: caja 155 · resultado -136 · financiamiento 0 · gasto corriente 950 · deuda 3000 · efectos pendientes 2

**T5** (mandato 1, año 2 T1) — PA usados: 0
- Acciones: —
- Interacciones: acuerdo Gobernadores: Acuerdo con Gobernadores: te comprometés a "Infraestructura vial y de transporte" en 4 turnos. A cambio: votos en el senado y ejecución federal. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 54.5→53.3 · ACTV 41.3→40.4 · PODA 38.3→37.5 · INVC 39.5→39.4 · SOLV 42.5→45.5 · EXTE 38.7→38.8 · PSOC 46.7→48.4 · SEGU 41.7→41.6 · CONF 33.2→32.6
- Por qué: Solvencia fiscal +3.0 (las cuentas públicas) · Protección social y salud +1.7 (Plan federal de viviendas (decisión anterior)) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.9 (la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 41 · Sindicatos 37/49 · Industria 44/49 · PyMEs 40/49 · Financiero 46/49 · Agro 43/44 · Gobernadores 41/61 · Oficialismo 33/73 · Oposición 49/38
- Política: aprobación 32 · intención de voto 39.4% · gobernabilidad 53.4 · bancas 46% · imagen 49.4
- Cuentas: caja 183 · resultado 27 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T6** (mandato 1, año 2 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 53.3→52 · ACTV 40.4→39.4 · PODA 37.5→36.8 · INVC 39.4→39.3 · SOLV 45.5→47.2 · EXTE 38.8→39 · PSOC 48.4→48.1 · SEGU 41.6→41.4 · CONF 32.6→32.1
- Por qué: Solvencia fiscal +1.7 (las cuentas públicas) · Inflación -1.3 (expectativas y fundamentos de la inflación) · Actividad y empleo -0.9 (la inversión se volvió actividad) · Poder adquisitivo -0.7 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 41 · Sindicatos 35/48 · Industria 44/49 · PyMEs 39/49 · Financiero 49/49 · Agro 44/43 · Gobernadores 40/61 · Oficialismo 32/72 · Oposición 48/38
- Política: aprobación 31.2 · intención de voto 38.7% · gobernabilidad 52.8 · bancas 45% · imagen 49.1
- Cuentas: caja 203 · resultado 21 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T7** (mandato 1, año 2 T3) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 52→50.6 · ACTV 39.4→38.5 · PODA 36.8→36.3 · INVC 39.3→39.2 · SOLV 47.2→49 · EXTE 39→39.1 · PSOC 48.1→47.7 · SEGU 41.4→41.3 · CONF 32.1→35.8
- Por qué: Solvencia fiscal +1.8 (las cuentas públicas) · Inflación -1.4 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Poder adquisitivo -0.6 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 40 · Sindicatos 34/48 · Industria 44/48 · PyMEs 39/48 · Financiero 51/48 · Agro 44/42 · Gobernadores 38/61 · Oficialismo 30/72 · Oposición 48/37
- Política: aprobación 30.5 · intención de voto 38.1% · gobernabilidad 51.4 · bancas 45% · imagen 48.9
- Cuentas: caja -83 · resultado 14 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T8** (mandato 1, año 2 T4) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 50.6→49.2 · ACTV 38.5→37.5 · PODA 36.3→35.8 · INVC 39.2→39.1 · SOLV 49→47.8 · EXTE 39.1→39.2 · PSOC 47.7→47.3 · SEGU 41.3→41.1 · CONF 35.8→36.4
- Por qué: Inflación -1.4 (expectativas y fundamentos de la inflación) · Solvencia fiscal -1.2 (las cuentas públicas) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 40 · Sindicatos 33/47 · Industria 42/48 · PyMEs 38/48 · Financiero 52/48 · Agro 44/41 · Gobernadores 37/41 · Oficialismo 29/72 · Oposición 46/36
- Política: aprobación 30 · intención de voto 37.1% · gobernabilidad 51 · bancas 45.6% · imagen 48.6
- Cuentas: caja -76 · resultado -293 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Incumpliste el acuerdo con Gobernadores (Infraestructura vial y de transporte): la relación se rompe y tu palabra vale menos.

**T9** (mandato 1, año 3 T1) — PA usados: 1
- Acciones: Emitir dinero (forzada)
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 49.2→50.1 · ACTV 37.5→39.5 · PODA 35.8→35.4 · INVC 39.1→38.9 · SOLV 47.8→47.2 · EXTE 39.2→39.3 · PSOC 47.3→47 · SEGU 41.1→41 · CONF 36.4→36.8
- Por qué: Actividad y empleo +2.0 (Emitir dinero) · Inflación +0.9 (Emitir dinero) · Infraestructura -0.8 (desgaste sin mantenimiento) · Solvencia fiscal -0.6 (las cuentas públicas)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 40 · Sindicatos 33/46 · Industria 42/48 · PyMEs 38/47 · Financiero 52/48 · Agro 44/41 · Gobernadores 36/38 · Oficialismo 29/72 · Oposición 45/35
- Política: aprobación 29.7 · intención de voto 36.8% · gobernabilidad 49.1 · bancas 45.6% · imagen 48.4
- Cuentas: caja 196 · resultado 22 · financiamiento 250 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T10** (mandato 1, año 3 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 50.1→49.1 · ACTV 39.5→38.5 · PODA 35.4→35.1 · INVC 38.9→38.8 · SOLV 47.2→46.9 · EXTE 39.3→39.4 · PSOC 47→46.7 · SEGU 41→40.9 · CONF 36.8→39.2
- Por qué: Conflictividad social +1.5 (Sindicatos: medidas de fuerza) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Inflación -1.0 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 39 · Sindicatos 33/46 · Industria 41/47 · PyMEs 37/47 · Financiero 51/47 · Agro 44/40 · Gobernadores 35/38 · Oficialismo 29/72 · Oposición 43/34
- Política: aprobación 29 · intención de voto 35.2% · gobernabilidad 46.4 · bancas 42.6% · imagen 45.7
- Cuentas: caja 211 · resultado 15 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T11** (mandato 1, año 3 T3) — PA usados: 1
- Acciones: —
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 49.1→48.1 · ACTV 38.5→34.4 · PODA 35.1→34.7 · INVC 38.8→38.7 · SOLV 46.9→48.6 · EXTE 39.4→39.4 · PSOC 46.7→46.2 · SEGU 40.9→40.6 · CONF 39.2→40.2
- Por qué: Actividad y empleo -4.1 (la inversión se volvió actividad) · Solvencia fiscal +1.7 (las cuentas públicas) · Inflación -1.0 (expectativas y fundamentos de la inflación) · Conflictividad social +0.9 (Sindicatos: medidas de fuerza)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 38 · Sindicatos 31/45 · Industria 39/47 · PyMEs 36/46 · Financiero 52/47 · Agro 43/39 · Gobernadores 32/35 · Oficialismo 27/71 · Oposición 42/42
- Política: aprobación 27 · intención de voto 32.9% · gobernabilidad 45.9 · bancas 42.6% · imagen 42.1
- Cuentas: caja -3 · resultado -14 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T12** (mandato 1, año 3 T4) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 48.1→47 · ACTV 34.4→33.2 · PODA 34.7→34.4 · INVC 38.7→37.1 · SOLV 48.6→47.8 · EXTE 39.4→39.5 · PSOC 46.2→45.6 · SEGU 40.6→40.4 · CONF 40.2→40.9
- Por qué: Inversión y crédito -1.6 (Industria posterga inversiones) · Actividad y empleo -1.2 (la inversión se volvió actividad) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 36 · Sindicatos 29/45 · Industria 37/46 · PyMEs 34/46 · Financiero 51/46 · Agro 43/39 · Gobernadores 30/35 · Oficialismo 26/71 · Oposición 40/41
- Política: aprobación 25.4 · intención de voto 31.6% · gobernabilidad 45.4 · bancas 42.6% · imagen 41.7
- Cuentas: caja -25 · resultado -222 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T13** (mandato 1, año 4 T1) — PA usados: 1
- Acciones: Emitir dinero (forzada)
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Ruptura del bloque oficialista → Reorganizar el bloque que queda
- Indicadores: INFL 47→48.2 · ACTV 33.2→35.6 · PODA 34.4→34.1 · INVC 37.1→35.6 · SOLV 47.8→47.3 · EXTE 39.5→39.5 · PSOC 45.6→45.2 · SEGU 40.4→40.2 · CONF 40.9→43.9
- Por qué: Actividad y empleo +2.4 (Emitir dinero) · Inversión y crédito -1.5 (Industria posterga inversiones) · Inflación +1.2 (Emitir dinero) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 36 · Sindicatos 29/44 · Industria 36/46 · PyMEs 33/45 · Financiero 50/46 · Agro 42/38 · Gobernadores 28/32 · Oficialismo 24/74 · Oposición 39/40
- Política: aprobación 24.4 · intención de voto 29.7% · gobernabilidad 39.4 · bancas 34.6% · imagen 37.3
- Cuentas: caja 221 · resultado -4 · financiamiento 250 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T14** (mandato 1, año 4 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 48.2→47.3 · ACTV 35.6→34.1 · PODA 34.1→33.9 · INVC 35.6→34.2 · SOLV 47.3→47.1 · EXTE 39.5→39.6 · PSOC 45.2→44.7 · SEGU 40.2→39.9 · CONF 43.9→47.8
- Por qué: Actividad y empleo -1.5 (la inversión se volvió actividad) · Inversión y crédito -1.4 (Industria posterga inversiones) · Inflación -0.8 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 41 · Sectores populares 35 · Sindicatos 29/43 · Industria 35/46 · PyMEs 32/45 · Financiero 49/46 · Agro 42/37 · Gobernadores 27/32 · Oficialismo 23/74 · Oposición 37/39
- Política: aprobación 23.1 · intención de voto 28.8% · gobernabilidad 37.4 · bancas 33.6% · imagen 37.2
- Cuentas: caja -93 · resultado -14 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T15** (mandato 1, año 4 T3) — PA usados: 1
- Acciones: —
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 47.3→46.5 · ACTV 34.1→28.7 · PODA 33.9→33.5 · INVC 34.2→32.8 · SOLV 47.1→46.1 · EXTE 39.6→39.6 · PSOC 44.7→44 · SEGU 39.9→39.6 · CONF 47.8→46.7
- Por qué: Actividad y empleo -5.4 (la inversión se volvió actividad) · Inversión y crédito -1.4 (Industria posterga inversiones) · Conflictividad social -1.1 (la calle se calma sola o la exclusión la enciende) · Solvencia fiscal -1.0 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 40 · Sectores populares 33 · Sindicatos 27/43 · Industria 31/45 · PyMEs 28/44 · Financiero 47/45 · Agro 41/37 · Gobernadores 24/29 · Oficialismo 21/74 · Oposición 35/38
- Política: aprobación 21.4 · intención de voto 27.4% · gobernabilidad 36.5 · bancas 32.6% · imagen 37
- Cuentas: caja -144 · resultado -352 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T16** (mandato 1, año 4 T4) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Renuncia de Ministro → Convencerlo de quedarse
- Indicadores: INFL 46.5→47.8 · ACTV 28.7→28.9 · PODA 33.5→33 · INVC 32.8→31.4 · SOLV 46.1→45.3 · EXTE 39.6→39.6 · PSOC 44→43.3 · SEGU 39.6→39.2 · CONF 46.7→48.3
- Por qué: Conflictividad social +1.6 (Piquetes; Sindicatos: medidas de fuerza) · Inflación +1.4 (Emitir dinero) · Inversión y crédito -1.3 (Industria posterga inversiones) · Solvencia fiscal -0.8 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Piquetes (CONF +3.1) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 39 · Sectores populares 32 · Sindicatos 25/42 · Industria 29/45 · PyMEs 26/44 · Financiero 45/45 · Agro 41/36 · Gobernadores 22/29 · Oficialismo 20/77 · Oposición 33/38
- Política: aprobación 19.8 · intención de voto 25.8% · gobernabilidad 32.1 · bancas 31.6% · imagen 34.8
- Cuentas: caja 55 · resultado -50 · financiamiento 250 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

## E · Técnico que ignora a los grupos

_Buenas decisiones técnicas (tasas con inflación alta, recaudación, crédito, educación, ciencia, prevención), sin reuniones ni negociaciones._ Arquetipo: empresario.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 43.4% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Suba de tasas / contracción monetaria, Incentivos a la exportación, Bajar retenciones, Crédito PyME y emprendedor
- Indicadores: INFL 58→54.3 · ACTV 45→44 · PODA 42→40.9 · INVC 40→39.2 · SOLV 45→43.7 · EXTE 38→40.5 · PSOC 45→45 · SEGU 42→41.9 · CONF 40→37.5
- Por qué: Presión tributaria -4.0 (Bajar retenciones) · Inflación -3.7 (expectativas y fundamentos de la inflación) · Conflictividad social -2.5 (la calle se calma sola o la exclusión la enciende) · Sector externo y divisas +2.5 (Suba de tasas / contracción monetaria)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 43 · Sindicatos 41/50 · Industria 44/55 · PyMEs 43/50 · Financiero 45/60 · Agro 44/48 · Gobernadores 41/50 · Oficialismo 37/75 · Oposición 49/30
- Política: aprobación 36.4 · intención de voto 40.6% · gobernabilidad 50.6 · bancas 46% · imagen 47.8
- Cuentas: caja 696 · resultado -804 · financiamiento 0 · gasto corriente 940 · deuda 3000 · efectos pendientes 12
- Notas: Agro: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 3
- Acciones: Inversión educativa, Estudio de factibilidad, Transparencia y anticorrupción
- Indicadores: INFL 54.3→48 · ACTV 44→40.9 · PODA 40.9→40.3 · INVC 39.2→39.5 · SOLV 43.7→38.6 · EXTE 40.5→48 · PSOC 45→44.8 · SEGU 41.9→41.7 · CONF 37.5→35.6
- Por qué: Sector externo y divisas +7.5 (Bajar retenciones (decisión anterior); Incentivos a la exportación (decisión anterior)) · Inflación -6.3 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Solvencia fiscal -5.1 (las cuentas públicas) · Actividad y empleo -3.0 (Suba de tasas / contracción monetaria (decisión anterior); la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 43 · Sindicatos 41/50 · Industria 47/55 · PyMEs 44/50 · Financiero 48/60 · Agro 50/48 · Gobernadores 39/50 · Oficialismo 37/70 · Oposición 52/30
- Política: aprobación 39.2 · intención de voto 42.3% · gobernabilidad 50.8 · bancas 45% · imagen 47.6
- Cuentas: caja 152 · resultado -544 · financiamiento 0 · gasto corriente 980 · deuda 3000 · efectos pendientes 11
- Notas: Estudiantes: notan la medida que pedían. | Aliados: notan la medida que pedían.

**T3** (mandato 1, año 1 T3) — PA usados: 1
- Acciones: Ajuste del gasto público
- Eventos: Conflicto Diplomático → Escalar el conflicto
- Indicadores: INFL 48→44 · ACTV 40.9→40.1 · PODA 40.3→40.3 · INVC 39.5→39.7 · SOLV 38.6→37 · EXTE 48→47.8 · PSOC 44.8→41.7 · SEGU 41.7→41.5 · CONF 35.6→34.2
- Por qué: Inflación -4.0 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Sector externo y divisas +3.9 (Bajar retenciones (decisión anterior); Incentivos a la exportación (decisión anterior)) · Protección social y salud -3.1 (Ajuste del gasto público) · Educación +1.7 (Inversión educativa (decisión anterior))
- Actores (satisfacción/relación): Clase media 50 · Sectores populares 42 · Sindicatos 40/50 · Industria 49/55 · PyMEs 45/50 · Financiero 51/60 · Agro 54/48 · Gobernadores 37/50 · Oficialismo 39/70 · Oposición 56/30
- Política: aprobación 41.5 · intención de voto 43.9% · gobernabilidad 50.8 · bancas 44% · imagen 48.4
- Cuentas: caja 403 · resultado 250 · financiamiento 0 · gasto corriente 860 · deuda 3000 · efectos pendientes 5

**T4** (mandato 1, año 1 T4) — PA usados: 2
- Acciones: Administración tributaria (lucha contra la evasión), Crédito PyME y emprendedor
- Indicadores: INFL 44→43.3 · ACTV 40.1→42.4 · PODA 40.3→40.5 · INVC 39.7→48.5 · SOLV 37→39.8 · EXTE 47.8→45.2 · PSOC 41.7→41.8 · SEGU 41.5→41.3 · CONF 34.2→33.2
- Por qué: Inversión y crédito +8.8 (Crédito PyME y emprendedor; Transparencia y anticorrupción (decisión anterior)) · Solvencia fiscal +2.8 (las cuentas públicas) · Sector externo y divisas -2.6 · Actividad y empleo +2.4 (Crédito PyME y emprendedor (decisión anterior))
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 43 · Sindicatos 41/49 · Industria 53/55 · PyMEs 50/50 · Financiero 53/60 · Agro 54/47 · Gobernadores 37/50 · Oficialismo 45/70 · Oposición 58/29
- Política: aprobación 44.4 · intención de voto 45.9% · gobernabilidad 51.4 · bancas 44% · imagen 48.2
- Cuentas: caja 136 · resultado -266 · financiamiento 0 · gasto corriente 860 · deuda 3000 · efectos pendientes 9

**T5** (mandato 1, año 2 T1) — PA usados: 2
- Acciones: Ajuste del gasto público, Estudio de factibilidad
- Indicadores: INFL 43.3→42.5 · ACTV 42.4→40.7 · PODA 40.5→40.5 · INVC 48.5→44.4 · SOLV 39.8→47.2 · EXTE 45.2→45.1 · PSOC 41.8→38.8 · SEGU 41.3→41 · CONF 33.2→32.5
- Por qué: Solvencia fiscal +7.5 (las cuentas públicas) · Inversión y crédito -4.1 · Protección social y salud -3.0 (Ajuste del gasto público) · Presión tributaria +2.0 (Administración tributaria (lucha contra la evasión) (decisión anterior))
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 41 · Sindicatos 40/49 · Industria 52/54 · PyMEs 50/49 · Financiero 58/59 · Agro 52/47 · Gobernadores 35/49 · Oficialismo 46/70 · Oposición 61/28
- Política: aprobación 43.5 · intención de voto 45% · gobernabilidad 49.8 · bancas 41% · imagen 48
- Cuentas: caja 507 · resultado 370 · financiamiento 0 · gasto corriente 740 · deuda 3000 · efectos pendientes 5

**T6** (mandato 1, año 2 T2) — PA usados: 2
- Acciones: Inversión educativa, Mantenimiento de infraestructura
- Eventos: Crisis en el Sistema de Salud → Asignar fondos de emergencia
- Indicadores: INFL 42.5→41.5 · ACTV 40.7→41 · PODA 40.5→40.6 · INVC 44.4→44.3 · SOLV 47.2→47.7 · EXTE 45.1→44.9 · PSOC 38.8→40.8 · SEGU 41→40.7 · CONF 32.5→35
- Por qué: Inflación -1.0 (expectativas y fundamentos de la inflación) · Conflictividad social -0.5 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 41 · Sindicatos 40/48 · Industria 52/54 · PyMEs 50/49 · Financiero 61/59 · Agro 51/46 · Gobernadores 34/49 · Oficialismo 47/69 · Oposición 61/28
- Política: aprobación 43.2 · intención de voto 44.7% · gobernabilidad 46 · bancas 41% · imagen 47.8
- Cuentas: caja -137 · resultado -243 · financiamiento 0 · gasto corriente 780 · deuda 3000 · efectos pendientes 5

**T7** (mandato 1, año 2 T3) — PA usados: 0
- Acciones: —
- Indicadores: INFL 41.5→40.6 · ACTV 41→44.2 · PODA 40.6→40.8 · INVC 44.3→44.1 · SOLV 47.7→48.9 · EXTE 44.9→44.7 · PSOC 40.8→40.9 · SEGU 40.7→40.6 · CONF 35→33.7
- Por qué: Actividad y empleo +3.2 (Crédito PyME y emprendedor (decisión anterior)) · Educación +1.7 (Inversión educativa (decisión anterior)) · Conflictividad social -1.2 (la calle se calma sola o la exclusión la enciende) · Solvencia fiscal +1.2 (las cuentas públicas)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 43 · Sindicatos 43/48 · Industria 52/53 · PyMEs 51/48 · Financiero 62/58 · Agro 50/45 · Gobernadores 35/48 · Oficialismo 48/69 · Oposición 61/27
- Política: aprobación 45.9 · intención de voto 46.5% · gobernabilidad 46.2 · bancas 41% · imagen 47.6
- Cuentas: caja 144 · resultado -120 · financiamiento 0 · gasto corriente 780 · deuda 3000 · efectos pendientes 2

**T8** (mandato 1, año 2 T4) — PA usados: 1
- Acciones: Administración tributaria (lucha contra la evasión)
- Indicadores: INFL 40.6→39.9 · ACTV 44.2→43.1 · PODA 40.8→41 · INVC 44.1→40.2 · SOLV 48.9→48.3 · EXTE 44.7→44.5 · PSOC 40.9→41 · SEGU 40.6→40.4 · CONF 33.7→32.8
- Por qué: Inversión y crédito -3.9 · Actividad y empleo -1.1 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Conflictividad social -0.9 (la calle se calma sola o la exclusión la enciende) · Inflación -0.7 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 53 · Sectores populares 44 · Sindicatos 44/47 · Industria 51/53 · PyMEs 50/48 · Financiero 62/58 · Agro 49/44 · Gobernadores 35/48 · Oficialismo 48/69 · Oposición 61/26
- Política: aprobación 46.5 · intención de voto 47.9% · gobernabilidad 52.1 · bancas 50.3% · imagen 50.4
- Cuentas: caja 338 · resultado 195 · financiamiento 0 · gasto corriente 780 · deuda 3000 · efectos pendientes 4

**T9** (mandato 1, año 3 T1) — PA usados: 3
- Acciones: Ajuste del gasto público, Crédito PyME y emprendedor, Estudio de factibilidad
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 39.9→39.3 · ACTV 43.1→38 · PODA 41→40.9 · INVC 40.2→44 · SOLV 48.3→51.4 · EXTE 44.5→44.4 · PSOC 41→37.9 · SEGU 40.4→40.1 · CONF 32.8→32.3
- Por qué: Actividad y empleo -5.1 (Ajuste del gasto público; Administración tributaria (lucha contra la evasión) (decisión anterior)) · Inversión y crédito +3.8 (Crédito PyME y emprendedor) · Solvencia fiscal +3.1 (las cuentas públicas) · Protección social y salud -3.1 (Ajuste del gasto público)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 42 · Sindicatos 41/46 · Industria 49/53 · PyMEs 48/47 · Financiero 63/58 · Agro 47/44 · Gobernadores 33/47 · Oficialismo 47/69 · Oposición 62/33
- Política: aprobación 43.4 · intención de voto 44.7% · gobernabilidad 50.5 · bancas 47.3% · imagen 47.1
- Cuentas: caja 405 · resultado 266 · financiamiento 0 · gasto corriente 660 · deuda 3000 · efectos pendientes 5

**T10** (mandato 1, año 3 T2) — PA usados: 2
- Acciones: Inversión educativa, Transparencia y anticorrupción
- Indicadores: INFL 39.3→38.7 · ACTV 38→37.2 · PODA 40.9→40.7 · INVC 44→43.8 · SOLV 51.4→52.4 · EXTE 44.4→44.2 · PSOC 37.9→37.8 · SEGU 40.1→39.8 · CONF 32.3→31.9
- Por qué: Instituciones y derechos +2.5 (Transparencia y anticorrupción) · Solvencia fiscal +1.0 (las cuentas públicas) · Actividad y empleo -0.8 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 41 · Sindicatos 39/46 · Industria 48/52 · PyMEs 46/47 · Financiero 65/57 · Agro 46/43 · Gobernadores 31/47 · Oficialismo 44/64 · Oposición 62/34
- Política: aprobación 41.7 · intención de voto 43.4% · gobernabilidad 50.4 · bancas 47.3% · imagen 47
- Cuentas: caja 397 · resultado -207 · financiamiento 0 · gasto corriente 700 · deuda 3000 · efectos pendientes 7
- Notas: Aliados: notan la medida que pedían.

**T11** (mandato 1, año 3 T3) — PA usados: 3
- Acciones: Ajuste del gasto público, Financiamiento científico, Estudio de factibilidad
- Indicadores: INFL 38.7→38.2 · ACTV 37.2→37.3 · PODA 40.7→40.6 · INVC 43.8→43.7 · SOLV 52.4→53.9 · EXTE 44.2→44.1 · PSOC 37.8→34.7 · SEGU 39.8→39.4 · CONF 31.9→32
- Por qué: Protección social y salud -3.0 (Ajuste del gasto público) · Infraestructura -1.8 (Ajuste del gasto público (decisión anterior); desgaste sin mantenimiento) · Educación +1.5 (Inversión educativa (decisión anterior)) · Solvencia fiscal +1.5 (las cuentas públicas)
- Actores (satisfacción/relación): Clase media 51 · Sectores populares 39 · Sindicatos 37/45 · Industria 46/52 · PyMEs 45/46 · Financiero 66/57 · Agro 45/42 · Gobernadores 28/46 · Oficialismo 41/63 · Oposición 62/36
- Política: aprobación 39.9 · intención de voto 42% · gobernabilidad 53.2 · bancas 47.3% · imagen 46.8
- Cuentas: caja 742 · resultado 344 · financiamiento 0 · gasto corriente 630 · deuda 3000 · efectos pendientes 6
- Notas: Estudiantes: notan la medida que pedían. | Científicos: notan la medida que pedían.

**T12** (mandato 1, año 3 T4) — PA usados: 3
- Acciones: Crédito PyME y emprendedor, Prevención comunitaria del delito, Mantenimiento de infraestructura
- Eventos: Crisis Energética → Tarifazos
- Indicadores: INFL 38.2→39.4 · ACTV 37.3→35.5 · PODA 40.6→38.5 · INVC 43.7→48 · SOLV 53.9→55 · EXTE 44.1→44 · PSOC 34.7→34.7 · SEGU 39.4→39 · CONF 32→35
- Por qué: Inversión y crédito +4.3 (Crédito PyME y emprendedor; Transparencia y anticorrupción (decisión anterior)) · Ciencia e innovación +2.6 (Financiamiento científico (decisión anterior)) · Solvencia fiscal +1.1 (Mercados abiertos: baja el riesgo país) · Inflación -0.8 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 51 · Sectores populares 38 · Sindicatos 37/45 · Industria 47/51 · PyMEs 46/46 · Financiero 67/56 · Agro 44/42 · Gobernadores 27/46 · Oficialismo 40/63 · Oposición 61/37
- Política: aprobación 40 · intención de voto 42% · gobernabilidad 52.2 · bancas 47.3% · imagen 46.7
- Cuentas: caja 667 · resultado -275 · financiamiento 0 · gasto corriente 630 · deuda 3000 · efectos pendientes 9

**T13** (mandato 1, año 4 T1) — PA usados: 3
- Acciones: Inversión educativa, Atención primaria de la salud, Estudio de factibilidad
- Indicadores: INFL 39.4→38.6 · ACTV 35.5→37.6 · PODA 38.5→38.5 · INVC 48→43.9 · SOLV 55→54.7 · EXTE 44→43.9 · PSOC 34.7→34.7 · SEGU 39→39.5 · CONF 35→33.7
- Por qué: Inversión y crédito -4.0 · Actividad y empleo +2.1 · Educación +1.5 (Inversión educativa (decisión anterior)) · Conflictividad social -1.3 (Prevención comunitaria del delito (decisión anterior); la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 50 · Sectores populares 37 · Sindicatos 35/44 · Industria 46/51 · PyMEs 45/45 · Financiero 66/56 · Agro 44/41 · Gobernadores 27/45 · Oficialismo 39/63 · Oposición 59/38
- Política: aprobación 38.4 · intención de voto 40.8% · gobernabilidad 51.7 · bancas 46.3% · imagen 46.5
- Cuentas: caja 424 · resultado -43 · financiamiento 0 · gasto corriente 710 · deuda 3000 · efectos pendientes 8

**T14** (mandato 1, año 4 T2) — PA usados: 3
- Acciones: Administración tributaria (lucha contra la evasión), Financiamiento científico, Transparencia y anticorrupción
- Indicadores: INFL 38.6→38 · ACTV 37.6→39.7 · PODA 38.5→38.6 · INVC 43.9→44 · SOLV 54.7→52 · EXTE 43.9→43.9 · PSOC 34.7→37.4 · SEGU 39.5→40.1 · CONF 33.7→34.7
- Por qué: Protección social y salud +2.7 (Atención primaria de la salud (decisión anterior)) · Solvencia fiscal -2.6 (las cuentas públicas) · Instituciones y derechos +2.4 (Transparencia y anticorrupción) · Actividad y empleo +2.0 (Crédito PyME y emprendedor (decisión anterior))
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 50 · Sectores populares 39 · Sindicatos 36/43 · Industria 46/51 · PyMEs 45/45 · Financiero 65/56 · Agro 44/40 · Gobernadores 28/45 · Oficialismo 37/58 · Oposición 60/39
- Política: aprobación 40.7 · intención de voto 41.4% · gobernabilidad 50.8 · bancas 45.3% · imagen 43.2
- Cuentas: caja 396 · resultado -28 · financiamiento 0 · gasto corriente 760 · deuda 3000 · efectos pendientes 8

**T15** (mandato 1, año 4 T3) — PA usados: 3
- Acciones: Ajuste del gasto público, Crédito PyME y emprendedor, Estudio de factibilidad
- Eventos: Crisis en el Sistema de Salud → Asignar fondos de emergencia
- Indicadores: INFL 38→37.9 · ACTV 39.7→35.7 · PODA 38.6→38.5 · INVC 44→47.4 · SOLV 52→50.9 · EXTE 43.9→43.9 · PSOC 37.4→36.3 · SEGU 40.1→40.6 · CONF 34.7→37.2
- Por qué: Actividad y empleo -4.0 (Ajuste del gasto público; Administración tributaria (lucha contra la evasión) (decisión anterior)) · Inversión y crédito +3.4 (Crédito PyME y emprendedor) · Protección social y salud -3.1 (Ajuste del gasto público) · Ciencia e innovación +2.7 (Financiamiento científico (decisión anterior))
- Actores (satisfacción/relación): Clase media 49 · Sectores populares 37 · Sindicatos 34/43 · Industria 45/50 · PyMEs 44/44 · Financiero 63/55 · Agro 43/40 · Gobernadores 27/44 · Oficialismo 37/58 · Oposición 60/40
- Política: aprobación 39.2 · intención de voto 40.4% · gobernabilidad 49.1 · bancas 44.3% · imagen 43.2
- Cuentas: caja 347 · resultado 351 · financiamiento 0 · gasto corriente 640 · deuda 3000 · efectos pendientes 8

**T16** (mandato 1, año 4 T4) — PA usados: 1
- Acciones: Inversión educativa
- Indicadores: INFL 37.9→37.6 · ACTV 35.7→34.9 · PODA 38.5→38.3 · INVC 47.4→44.7 · SOLV 50.9→51.1 · EXTE 43.9→43.9 · PSOC 36.3→36.1 · SEGU 40.6→41 · CONF 37.2→37.6
- Por qué: Inversión y crédito -2.7 · Educación +1.5 (Inversión educativa (decisión anterior)) · Actividad y empleo -0.8 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 49 · Sectores populares 37 · Sindicatos 33/42 · Industria 43/50 · PyMEs 42/44 · Financiero 62/55 · Agro 42/39 · Gobernadores 26/44 · Oficialismo 35/57 · Oposición 58/42
- Política: aprobación 38.4 · intención de voto 39.8% · gobernabilidad 48.7 · bancas 44.3% · imagen 43.3
- Cuentas: caja 527 · resultado -221 · financiamiento 0 · gasto corriente 680 · deuda 3000 · efectos pendientes 6

## F · Hipernegociador

_Se reúne con todos, negocia y firma acuerdos con todos; ejecuta lo que le piden._ Arquetipo: politico.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 29.1% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: —
- Interacciones: reunion Oposición: Reunión con Oposición. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Sindicatos: Reunión con Sindicatos. | reunion Aliados: Reunión con Aliados. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 58→56.8 · ACTV 45→44.1 · PODA 42→40.9 · INVC 40→39.9 · SOLV 45→46.4 · EXTE 38→38.2 · PSOC 45→45 · SEGU 42→41.9 · CONF 40→37.5
- Por qué: Conflictividad social -2.5 (la calle se calma sola o la exclusión la enciende) · Solvencia fiscal +1.4 (las cuentas públicas) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Poder adquisitivo -1.1 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 42 · Sindicatos 41/50 · Industria 42/50 · PyMEs 42/50 · Financiero 45/50 · Agro 40/45 · Gobernadores 41/50 · Oficialismo 37/75 · Oposición 49/40
- Política: aprobación 34.3 · intención de voto 42.2% · gobernabilidad 50.3 · bancas 46% · imagen 55.4
- Cuentas: caja 1104 · resultado -396 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T2** (mandato 1, año 1 T2) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 56.8→55.6 · ACTV 44.1→43.1 · PODA 40.9→39.8 · INVC 39.9→39.9 · SOLV 46.4→46.6 · EXTE 38.2→38.4 · PSOC 45→45 · SEGU 41.9→41.8 · CONF 37.5→35.6
- Por qué: Conflictividad social -1.9 (la calle se calma sola o la exclusión la enciende) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Poder adquisitivo -1.0 (la inflación se comió los salarios) · Actividad y empleo -1.0 (la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 41 · Sindicatos 40/50 · Industria 43/47 · PyMEs 41/50 · Financiero 47/50 · Agro 40/45 · Gobernadores 39/50 · Oficialismo 37/75 · Oposición 49/40
- Política: aprobación 33.4 · intención de voto 41.4% · gobernabilidad 50.2 · bancas 45% · imagen 54.8
- Cuentas: caja 1151 · resultado 47 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T3** (mandato 1, año 1 T3) — PA usados: 4
- Acciones: —
- Interacciones: negociar Agro: Agro acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 55.6→54.4 · ACTV 43.1→42.1 · PODA 39.8→38.9 · INVC 39.9→39.8 · SOLV 46.6→46.3 · EXTE 38.4→38.6 · PSOC 45→44.9 · SEGU 41.8→41.6 · CONF 35.6→34.2
- Por qué: Conflictividad social -1.4 (la calle se calma sola o la exclusión la enciende) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.0 (la inversión se volvió actividad) · Poder adquisitivo -0.9 (la inflación se comió los salarios)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 41 · Sindicatos 38/50 · Industria 43/47 · PyMEs 41/50 · Financiero 48/47 · Agro 40/45 · Gobernadores 37/50 · Oficialismo 35/75 · Oposición 49/37
- Política: aprobación 32.3 · intención de voto 40.4% · gobernabilidad 49.7 · bancas 44% · imagen 54.3
- Cuentas: caja 1191 · resultado 40 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T4** (mandato 1, año 1 T4) — PA usados: 4
- Acciones: —
- Interacciones: acuerdo Agro: Acuerdo con Agro: te comprometés a "Bajar retenciones" en 4 turnos. A cambio: liquidación adelantada de la cosecha. | negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 54.4→53 · ACTV 42.1→41 · PODA 38.9→38.2 · INVC 39.8→39.7 · SOLV 46.3→48.9 · EXTE 38.6→42.5 · PSOC 44.9→45.7 · SEGU 41.6→41.5 · CONF 34.2→33.3
- Por qué: Sector externo y divisas +4.0 (Acuerdo / compromiso) · Solvencia fiscal +2.7 (las cuentas públicas) · Inflación -1.4 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.0 (la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 40 · Sindicatos 37/50 · Industria 43/44 · PyMEs 41/50 · Financiero 51/44 · Agro 42/51 · Gobernadores 35/54 · Oficialismo 34/75 · Oposición 49/34
- Política: aprobación 31.6 · intención de voto 40.6% · gobernabilidad 49.3 · bancas 43% · imagen 56.8
- Cuentas: caja 874 · resultado 33 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T5** (mandato 1, año 2 T1) — PA usados: 4
- Acciones: —
- Interacciones: negociar Financiero: La negociación con Financiero fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Estudiantes: Reunión con Estudiantes. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 53→51.5 · ACTV 41→39.9 · PODA 38.2→37.5 · INVC 39.7→39.6 · SOLV 48.9→47.8 · EXTE 42.5→42.5 · PSOC 45.7→45.5 · SEGU 41.5→41.3 · CONF 33.3→32.6
- Por qué: Inflación -1.5 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.2 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Solvencia fiscal -1.1 (las cuentas públicas) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 39 · Sindicatos 35/49 · Industria 43/44 · PyMEs 40/49 · Financiero 53/41 · Agro 42/51 · Gobernadores 32/53 · Oficialismo 32/75 · Oposición 49/31
- Política: aprobación 30.9 · intención de voto 39.5% · gobernabilidad 46.8 · bancas 39% · imagen 56.1
- Cuentas: caja 899 · resultado -325 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T6** (mandato 1, año 2 T2) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Financiero: Reunión con Financiero. | reunion Industria: Reunión con Industria. | reunion Docentes: Reunión con Docentes. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 51.5→50.2 · ACTV 39.9→38.7 · PODA 37.5→37 · INVC 39.6→39.5 · SOLV 47.8→47.1 · EXTE 42.5→42.4 · PSOC 45.5→45.2 · SEGU 41.3→41.1 · CONF 32.6→32.1
- Por qué: Inflación -1.3 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.2 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Infraestructura -0.8 (desgaste sin mantenimiento) · Solvencia fiscal -0.7 (las cuentas públicas)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 39 · Sindicatos 34/49 · Industria 42/41 · PyMEs 40/49 · Financiero 54/41 · Agro 41/51 · Gobernadores 29/53 · Oficialismo 31/74 · Oposición 49/28
- Política: aprobación 30 · intención de voto 38.6% · gobernabilidad 46 · bancas 38% · imagen 55.5
- Cuentas: caja 916 · resultado 17 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T7** (mandato 1, año 2 T3) — PA usados: 4
- Acciones: —
- Interacciones: negociar Financiero: La negociación con Financiero fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | reunion Ambientalistas: Reunión con Ambientalistas. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 50.2→49 · ACTV 38.7→37.4 · PODA 37→36.5 · INVC 39.5→39.4 · SOLV 47.1→46.5 · EXTE 42.4→42.3 · PSOC 45.2→44.9 · SEGU 41.1→40.9 · CONF 32.1→33.5
- Por qué: Conflictividad social +1.4 (Sindicatos: medidas de fuerza) · Actividad y empleo -1.2 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inflación -1.2 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 38 · Sindicatos 33/48 · Industria 42/41 · PyMEs 39/48 · Financiero 54/38 · Agro 41/31 · Gobernadores 27/52 · Oficialismo 30/74 · Oposición 48/33
- Política: aprobación 28.9 · intención de voto 37% · gobernabilidad 41.9 · bancas 38% · imagen 52.6
- Cuentas: caja 725 · resultado 8 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Incumpliste el acuerdo con Agro (Bajar retenciones): la relación se rompe y tu palabra vale menos.

**T8** (mandato 1, año 2 T4) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Agro: Reunión con Agro. El gesto de apertura mejora un poco la relación. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Financiero: Reunión con Financiero. | reunion Industria: Reunión con Industria. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 49→47.8 · ACTV 37.4→36.2 · PODA 36.5→36.2 · INVC 39.4→39.3 · SOLV 46.5→47.1 · EXTE 42.3→42.3 · PSOC 44.9→44.5 · SEGU 40.9→40.7 · CONF 33.5→36.1
- Por qué: Actividad y empleo -1.3 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Conflictividad social +1.1 (Sindicatos: medidas de fuerza) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 37 · Sindicatos 32/48 · Industria 40/38 · PyMEs 38/48 · Financiero 54/38 · Agro 41/33 · Gobernadores 25/52 · Oficialismo 28/74 · Oposición 46/30
- Política: aprobación 27.7 · intención de voto 34.8% · gobernabilidad 43.1 · bancas 41.9% · imagen 47.6
- Cuentas: caja 724 · resultado -200 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T9** (mandato 1, año 3 T1) — PA usados: 4
- Acciones: —
- Interacciones: negociar Agro: La negociación con Agro fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 47.8→46.7 · ACTV 36.2→34.9 · PODA 36.2→35.9 · INVC 39.3→39.2 · SOLV 47.1→47.2 · EXTE 42.3→42.2 · PSOC 44.5→44.1 · SEGU 40.7→40.4 · CONF 36.1→36.6
- Por qué: Actividad y empleo -1.3 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.3)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 36 · Sindicatos 31/47 · Industria 39/38 · PyMEs 37/47 · Financiero 54/38 · Agro 41/30 · Gobernadores 23/51 · Oficialismo 27/74 · Oposición 44/27
- Política: aprobación 26.5 · intención de voto 33.9% · gobernabilidad 45.9 · bancas 41.9% · imagen 47.4
- Cuentas: caja 715 · resultado -9 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T10** (mandato 1, año 3 T2) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 46.7→45.6 · ACTV 34.9→33.5 · PODA 35.9→35.7 · INVC 39.2→37.6 · SOLV 47.2→47.1 · EXTE 42.2→42.1 · PSOC 44.1→43.6 · SEGU 40.4→40.1 · CONF 36.6→41.9
- Por qué: Inversión y crédito -1.6 (Industria posterga inversiones) · Actividad y empleo -1.4 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.6) · Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 36 · Sindicatos 30/46 · Industria 38/35 · PyMEs 35/47 · Financiero 54/38 · Agro 40/30 · Gobernadores 22/51 · Oficialismo 26/74 · Oposición 43/26
- Política: aprobación 25.3 · intención de voto 32.5% · gobernabilidad 41 · bancas 41.9% · imagen 45.6
- Cuentas: caja 396 · resultado -19 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T11** (mandato 1, año 3 T3) — PA usados: 4
- Acciones: —
- Interacciones: negociar Agro: La negociación con Agro fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Ruptura del bloque oficialista → Reorganizar el bloque que queda | Renuncia de Ministro → Convencerlo de quedarse
- Indicadores: INFL 45.6→44.5 · ACTV 33.5→31.8 · PODA 35.7→35.5 · INVC 37.6→36 · SOLV 47.1→46.2 · EXTE 42.1→42.1 · PSOC 43.6→43.1 · SEGU 40.1→39.8 · CONF 41.9→41
- Por qué: Actividad y empleo -1.6 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inversión y crédito -1.6 (Industria posterga inversiones) · Inflación -1.1 (expectativas y fundamentos de la inflación) · Solvencia fiscal -0.9 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.6) · Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 35 · Sindicatos 29/46 · Industria 35/35 · PyMEs 33/46 · Financiero 52/38 · Agro 40/27 · Gobernadores 20/50 · Oficialismo 24/80 · Oposición 40/25
- Política: aprobación 24.4 · intención de voto 31.6% · gobernabilidad 30.9 · bancas 23.9% · imagen 44.1
- Cuentas: caja 367 · resultado -329 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T12** (mandato 1, año 3 T4) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 44.5→43.5 · ACTV 31.8→30.1 · PODA 35.5→35.3 · INVC 36→34.4 · SOLV 46.2→45.5 · EXTE 42.1→42 · PSOC 43.1→42.5 · SEGU 39.8→39.5 · CONF 41→42.7
- Por qué: Actividad y empleo -1.8 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inversión y crédito -1.5 (Industria posterga inversiones) · Inflación -1.0 (expectativas y fundamentos de la inflación) · Infraestructura -0.8 (desgaste sin mantenimiento)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.6) · Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 34 · Sindicatos 28/45 · Industria 33/32 · PyMEs 31/46 · Financiero 51/38 · Agro 40/27 · Gobernadores 19/50 · Oficialismo 23/80 · Oposición 39/24
- Política: aprobación 23.4 · intención de voto 30.1% · gobernabilidad 30 · bancas 22.9% · imagen 40.9
- Cuentas: caja 326 · resultado -41 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T13** (mandato 1, año 4 T1) — PA usados: 4
- Acciones: —
- Interacciones: negociar Agro: La negociación con Agro fracasó. La relación se resiente. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 43.5→42.6 · ACTV 30.1→28.2 · PODA 35.3→35.1 · INVC 34.4→32.9 · SOLV 45.5→44.9 · EXTE 42→41.9 · PSOC 42.5→41.8 · SEGU 39.5→39.1 · CONF 42.7→42.6
- Por qué: Actividad y empleo -1.9 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Inversión y crédito -1.5 (Industria posterga inversiones) · Conflictividad social -1.1 (la calle se calma sola o la exclusión la enciende) · Inflación -1.0 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.7) · Sindicatos: medidas de fuerza (CONF +2.3) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 33 · Sindicatos 27/45 · Industria 31/32 · PyMEs 29/45 · Financiero 50/35 · Agro 40/24 · Gobernadores 17/49 · Oficialismo 22/80 · Oposición 38/31
- Política: aprobación 22.3 · intención de voto 28.3% · gobernabilidad 29.8 · bancas 21.9% · imagen 37.1
- Cuentas: caja 73 · resultado -53 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T14** (mandato 1, año 4 T2) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Agro: Reunión con Agro. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 42.6→41.9 · ACTV 28.2→24.5 · PODA 35.1→34.6 · INVC 32.9→31.5 · SOLV 44.9→45 · EXTE 41.9→41.8 · PSOC 41.8→41 · SEGU 39.1→38.6 · CONF 42.6→45.4
- Por qué: Actividad y empleo -3.7 (PyMEs: cierres y despidos; la inversión se volvió actividad) · Inversión y crédito -1.4 (Industria posterga inversiones) · Conflictividad social +1.3 (Piquetes; Sindicatos: medidas de fuerza) · Protección social y salud -0.8 (el desempleo presiona la red social)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.7) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Piquetes (CONF +3.1) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 31 · Sindicatos 25/44 · Industria 29/29 · PyMEs 27/45 · Financiero 49/32 · Agro 39/24 · Gobernadores 15/49 · Oficialismo 20/80 · Oposición 36/30
- Política: aprobación 20.5 · intención de voto 26.4% · gobernabilidad 28.5 · bancas 20.9% · imagen 34.9
- Cuentas: caja -8 · resultado -281 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

**T15** (mandato 1, año 4 T3) — PA usados: 4
- Acciones: Emitir dinero (forzada)
- Interacciones: negociar Agro: La negociación con Agro fracasó. La relación se resiente. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Indicadores: INFL 41.9→43.5 · ACTV 24.5→23.9 · PODA 34.6→34.2 · INVC 31.5→30.1 · SOLV 45→44.7 · EXTE 41.8→41.7 · PSOC 41→40.1 · SEGU 38.6→38.2 · CONF 45.4→47.5
- Por qué: Conflictividad social +2.2 (Piquetes; Sindicatos: medidas de fuerza) · Inflación +1.6 (Emitir dinero) · Inversión y crédito -1.4 (Industria posterga inversiones) · Protección social y salud -0.9 (el desempleo presiona la red social)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.7) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Piquetes (CONF +3.1)
- Actores (satisfacción/relación): Clase media 41 · Sectores populares 29 · Sindicatos 23/43 · Industria 26/29 · PyMEs 24/44 · Financiero 47/29 · Agro 39/21 · Gobernadores 14/48 · Oficialismo 19/80 · Oposición 34/29
- Política: aprobación 18.6 · intención de voto 25.2% · gobernabilidad 30.1 · bancas 19.9% · imagen 35.3
- Cuentas: caja 157 · resultado -86 · financiamiento 250 · gasto corriente 960 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T16** (mandato 1, año 4 T4) — PA usados: 4
- Acciones: —
- Interacciones: negociar Industria: Industria acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo. | reunion Agro: Reunión con Agro. | reunion Industria: Reunión con Industria. | reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar. | reunion Oposición: Reunión con Oposición. Otra reunión sin avances: empiezan a desconfiar. | reunion Aliados: Reunión con Aliados. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media. | encuesta Sectores populares: Encuesta sobre Sectores populares.
- Eventos: Ola de Calor Extrema → Declarar emergencia
- Indicadores: INFL 43.5→43 · ACTV 23.9→20.9 · PODA 34.2→33.6 · INVC 30.1→28.8 · SOLV 44.7→44.2 · EXTE 41.7→41.6 · PSOC 40.1→40.1 · SEGU 38.2→37.6 · CONF 47.5→49.2
- Por qué: Actividad y empleo -2.9 (PyMEs: cierres y despidos; la inversión se volvió actividad) · Conflictividad social +1.7 (Piquetes; Sindicatos: medidas de fuerza) · Inversión y crédito -1.3 (Industria posterga inversiones) · Protección social y salud -1.0 (el desempleo presiona la red social)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.7) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Piquetes (CONF +3.1) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 39 · Sectores populares 27 · Sindicatos 21/43 · Industria 24/29 · PyMEs 22/44 · Financiero 45/26 · Agro 38/21 · Gobernadores 13/48 · Oficialismo 17/79 · Oposición 31/28
- Política: aprobación 16.8 · intención de voto 24.1% · gobernabilidad 26.2 · bancas 18.9% · imagen 36.2
- Cuentas: caja -102 · resultado -108 · financiamiento 0 · gasto corriente 960 · deuda 3000 · efectos pendientes 0

## G1 · Rígido heterodoxo

_Todo el mandato las mismas recetas: salarios, subsidios, controles y transferencias, pase lo que pase._ Arquetipo: sindicalista.

Partida de muestra (semilla 1): **derrota (hyperinflation)** en 10 turnos · reelección — · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Suba del salario mínimo, Ampliación de transferencias sociales, Congelar tarifas (subsidios a servicios), Control de precios
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Indicadores: INFL 58→51.2 · ACTV 45→46.8 · PODA 42→50.3 · INVC 40→37.1 · SOLV 45→45.8 · EXTE 38→38.2 · PSOC 45→48.9 · SEGU 42→42 · CONF 40→35.3
- Por qué: Poder adquisitivo +8.3 (Suba del salario mínimo; Congelar tarifas (subsidios a servicios)) · Inflación -6.8 (Control de precios; Congelar tarifas (subsidios a servicios)) · Conflictividad social -4.8 (Ampliación de transferencias sociales; la calle se calma sola o la exclusión la enciende) · Protección social y salud +3.9 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 49 · Sectores populares 49 · Sindicatos 50/73 · Industria 44/50 · PyMEs 45/50 · Financiero 46/50 · Agro 41/45 · Gobernadores 43/50 · Oficialismo 44/75 · Oposición 49/30
- Política: aprobación 45 · intención de voto 46.9% · gobernabilidad 52.7 · bancas 47% · imagen 49.7
- Cuentas: caja 1016 · resultado -484 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 5
- Notas: Sindicatos: valoran que atendiste su reclamo. | Org. sociales: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 2
- Acciones: Aumento salarial a estatales, Subir retenciones a exportaciones
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 51.2→52.7 · ACTV 46.8→46.6 · PODA 50.3→52.2 · INVC 37.1→36.9 · SOLV 45.8→44.4 · EXTE 38.2→38.4 · PSOC 48.9→48.8 · SEGU 42→42.1 · CONF 35.3→33.9
- Por qué: Presión tributaria +4.0 (Subir retenciones a exportaciones) · Poder adquisitivo +1.9 (Aumento salarial a estatales) · Inflación +1.5 (Suba del salario mínimo (decisión anterior)) · Solvencia fiscal -1.4 (las cuentas públicas)
- Actores (satisfacción/relación): Clase media 51 · Sectores populares 52 · Sindicatos 55/81 · Industria 43/50 · PyMEs 45/50 · Financiero 47/50 · Agro 39/45 · Gobernadores 45/50 · Oficialismo 51/75 · Oposición 54/38
- Política: aprobación 49.7 · intención de voto 49.4% · gobernabilidad 53.9 · bancas 47% · imagen 46.4
- Cuentas: caja 667 · resultado -149 · financiamiento 0 · gasto corriente 1170 · deuda 3000 · efectos pendientes 6
- Notas: Sindicatos: valoran que atendiste su reclamo. | Docentes: notan la medida que pedían.

**T3** (mandato 1, año 1 T3) — PA usados: 1
- Acciones: Control de precios
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 52.7→52.5 · ACTV 46.6→42.1 · PODA 52.2→51 · INVC 36.9→34.9 · SOLV 44.4→40.4 · EXTE 38.4→34.8 · PSOC 48.8→49.6 · SEGU 42.1→42 · CONF 33.9→33
- Por qué: Actividad y empleo -4.5 (la inversión se volvió actividad) · Solvencia fiscal -4.0 (las cuentas públicas) · Sector externo y divisas -3.6 (Subir retenciones a exportaciones (decisión anterior); Congelar tarifas (subsidios a servicios) (decisión anterior)) · Inversión y crédito -2.0 (Control de precios)
- Actores (satisfacción/relación): Clase media 53 · Sectores populares 52 · Sindicatos 54/78 · Industria 40/50 · PyMEs 42/50 · Financiero 44/50 · Agro 36/45 · Gobernadores 43/50 · Oficialismo 58/75 · Oposición 58/38
- Política: aprobación 49.1 · intención de voto 49% · gobernabilidad 54.1 · bancas 47% · imagen 46.3
- Cuentas: caja 484 · resultado -382 · financiamiento 0 · gasto corriente 1170 · deuda 3000 · efectos pendientes 2

**T4** (mandato 1, año 1 T4) — PA usados: 3
- Acciones: Suba del salario mínimo, Ampliación de transferencias sociales, Congelar tarifas (subsidios a servicios)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 52.5→52.5 · ACTV 42.1→42.5 · PODA 51→56.5 · INVC 34.9→33.9 · SOLV 40.4→37 · EXTE 34.8→34.1 · PSOC 49.6→53.3 · SEGU 42→42.1 · CONF 33→30
- Por qué: Poder adquisitivo +5.6 (Suba del salario mínimo; Congelar tarifas (subsidios a servicios)) · Protección social y salud +3.7 (Ampliación de transferencias sociales) · Solvencia fiscal -3.4 (las cuentas públicas) · Conflictividad social -3.0 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 55 · Sectores populares 55 · Sindicatos 58/83 · Industria 38/50 · PyMEs 42/50 · Financiero 40/50 · Agro 34/44 · Gobernadores 42/50 · Oficialismo 63/75 · Oposición 61/37
- Política: aprobación 52.7 · intención de voto 51.5% · gobernabilidad 55.1 · bancas 47% · imagen 46.2
- Cuentas: caja -214 · resultado -698 · financiamiento 0 · gasto corriente 1290 · deuda 3000 · efectos pendientes 6
- Notas: Sindicatos: valoran que atendiste su reclamo.

**T5** (mandato 1, año 2 T1) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 52.5→62.4 · ACTV 42.5→43.5 · PODA 56.5→50.3 · INVC 33.9→32.2 · SOLV 37→34.1 · EXTE 34.1→30.7 · PSOC 53.3→54 · SEGU 42.1→42.1 · CONF 30→30
- Por qué: Inflación +10.0 (Suba del salario mínimo (decisión anterior); Emitir dinero) · Poder adquisitivo -6.2 (la inflación se comió los salarios; el empleo recompuso salarios) · Sector externo y divisas -3.4 (Agro retiene la cosecha; Congelar tarifas (subsidios a servicios) (decisión anterior)) · Solvencia fiscal -2.9 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 52 · Sindicatos 54/80 · Industria 35/49 · PyMEs 38/49 · Financiero 33/49 · Agro 29/44 · Gobernadores 42/53 · Oficialismo 65/75 · Oposición 63/36
- Política: aprobación 46.7 · intención de voto 48.5% · gobernabilidad 55.9 · bancas 49% · imagen 49.1
- Cuentas: caja -648 · resultado -334 · financiamiento 250 · gasto corriente 1290 · deuda 3000 · efectos pendientes 4
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T6** (mandato 1, año 2 T2) — PA usados: 1
- Acciones: Emitir dinero (forzada), Subir retenciones a exportaciones
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 62.4→68 · ACTV 43.5→40.9 · PODA 50.3→47.6 · INVC 32.2→30 · SOLV 34.1→27.6 · EXTE 30.7→26.6 · PSOC 54→53.7 · SEGU 42.1→42.2 · CONF 30→33
- Por qué: Solvencia fiscal -6.4 (Sube el riesgo país; las cuentas públicas) · Inflación +5.5 (Emitir dinero; Control de precios (decisión anterior)) · Sector externo y divisas -4.1 (Agro retiene la cosecha; Congelar tarifas (subsidios a servicios) (decisión anterior)) · Presión tributaria +4.0 (Subir retenciones a exportaciones)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 48 · Sindicatos 47/77 · Industria 28/49 · PyMEs 32/49 · Financiero 25/49 · Agro 23/43 · Gobernadores 36/53 · Oficialismo 62/74 · Oposición 62/36
- Política: aprobación 37.1 · intención de voto 41.8% · gobernabilidad 52.7 · bancas 47% · imagen 48.8
- Cuentas: caja -426 · resultado -379 · financiamiento 250 · gasto corriente 1290 · deuda 3000 · efectos pendientes 3
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T7** (mandato 1, año 2 T3) — PA usados: 1
- Acciones: Emitir dinero (forzada), Suba del salario mínimo
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Corrida cambiaria → Suba de tasas de emergencia
- Indicadores: INFL 68→73.8 · ACTV 40.9→38.5 · PODA 47.6→48.5 · INVC 30→23.8 · SOLV 27.6→30.2 · EXTE 26.6→22.6 · PSOC 53.7→53.3 · SEGU 42.2→42.2 · CONF 33→32.2
- Por qué: Sector externo y divisas -8.0 (Subir retenciones a exportaciones (decisión anterior); Agro retiene la cosecha) · Inflación +5.8 (Emitir dinero; la falta de dólares) · Inversión y crédito -3.2 (Industria posterga inversiones; Suba del salario mínimo) · Solvencia fiscal +2.6 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 43 · Sindicatos 42/74 · Industria 22/48 · PyMEs 27/48 · Financiero 20/48 · Agro 17/42 · Gobernadores 31/52 · Oficialismo 55/74 · Oposición 57/35
- Política: aprobación 29.6 · intención de voto 36.2% · gobernabilidad 49.8 · bancas 44% · imagen 48.6
- Cuentas: caja -379 · resultado -202 · financiamiento 250 · gasto corriente 1290 · deuda 3000 · efectos pendientes 5
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T8** (mandato 1, año 2 T4) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 73.8→89.3 · ACTV 38.5→30.3 · PODA 48.5→41.5 · INVC 23.8→18.5 · SOLV 30.2→31.4 · EXTE 22.6→12.4 · PSOC 53.3→52.5 · SEGU 42.2→42 · CONF 32.2→32.6
- Por qué: Inflación +15.5 (Emitir dinero; Corrida cambiaria) · Sector externo y divisas -10.3 (Corrida cambiaria; Emitir dinero) · Actividad y empleo -8.2 (la inversión se volvió actividad; Suba del salario mínimo (decisión anterior)) · Poder adquisitivo -7.0 (la inflación se comió los salarios; el empleo recompuso salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Corrida cambiaria (EXTE -6.0) · Corrida cambiaria (INFL +4.0) · Sube el riesgo país (SOLV -5.0) · PyMEs: cierres y despidos (ACTV -2.0)
- Actores (satisfacción/relación): Clase media 35 · Sectores populares 34 · Sindicatos 31/71 · Industria 16/48 · PyMEs 19/48 · Financiero 15/48 · Agro 13/41 · Gobernadores 24/52 · Oficialismo 44/74 · Oposición 51/42
- Política: aprobación 18.8 · intención de voto 26.5% · gobernabilidad 46.4 · bancas 40.6% · imagen 39.3
- Cuentas: caja -682 · resultado -353 · financiamiento 250 · gasto corriente 1290 · deuda 3000 · efectos pendientes 4
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T9** (mandato 1, año 3 T1) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 89.3→100 · ACTV 30.3→22.7 · PODA 41.5→33.4 · INVC 18.5→13.5 · SOLV 31.4→30.6 · EXTE 12.4→6.3 · PSOC 52.5→51.4 · SEGU 42→41.7 · CONF 32.6→34.9
- Por qué: Inflación +10.7 (Emitir dinero (decisión anterior); Congelar tarifas (subsidios a servicios) (decisión anterior)) · Poder adquisitivo -8.1 (la inflación se comió los salarios; Suba del salario mínimo (decisión anterior)) · Actividad y empleo -7.5 (la inversión se volvió actividad; PyMEs: cierres y despidos) · Sector externo y divisas -6.1 (Emitir dinero; Agro retiene la cosecha)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +1.9) · PyMEs: cierres y despidos (ACTV -2.0) · Clase media dolariza sus ahorros (EXTE -2.0)
- Actores (satisfacción/relación): Clase media 28 · Sectores populares 26 · Sindicatos 21/68 · Industria 11/48 · PyMEs 13/47 · Financiero 11/48 · Agro 10/41 · Gobernadores 17/51 · Oficialismo 32/74 · Oposición 42/41
- Política: aprobación 12 · intención de voto 20.9% · gobernabilidad 43.3 · bancas 38.6% · imagen 36.4
- Cuentas: caja -938 · resultado -586 · financiamiento 130 · gasto corriente 1290 · deuda 3000 · efectos pendientes 2
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T10** (mandato 1, año 3 T2) — PA usados: 2
- Acciones: Emitir dinero (forzada), Suba del salario mínimo, Subir retenciones a exportaciones
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Cacerolazo → Cadena nacional para dar explicaciones | Paro docente por tiempo indeterminado → Reabrir la paritaria docente | Plan de lucha de las organizaciones sociales → Convocar una mesa con las organizaciones | Ruptura del bloque oficialista → Reorganizar el bloque que queda | Renuncia de Ministro → Aceptar la renuncia
- Indicadores: INFL 100→100 · ACTV 22.7→21.5 · PODA 33.4→30.9 · INVC 13.5→8.3 · SOLV 30.6→30.5 · EXTE 6.3→2.4 · PSOC 51.4→50.2 · SEGU 41.7→41.3 · CONF 34.9→42.4
- Por qué: Conflictividad social +7.0 (Subir retenciones a exportaciones; Piquetes) · Inversión y crédito -5.2 (Emitir dinero; el clima de inversión) · Presión tributaria +4.0 (Subir retenciones a exportaciones) · Sector externo y divisas -3.8 (Emitir dinero; Agro retiene la cosecha)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.0) · PyMEs: cierres y despidos (ACTV -2.0) · Clase media dolariza sus ahorros (EXTE -2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Piquetes (CONF +2.7)
- Actores (satisfacción/relación): Clase media 22 · Sectores populares 20 · Sindicatos 14/65 · Industria 8/47 · PyMEs 9/47 · Financiero 9/47 · Agro 8/40 · Gobernadores 13/51 · Oficialismo 23/79 · Oposición 34/42
- Política: aprobación 8.8 · intención de voto 17.7% · gobernabilidad 34.3 · bancas 28.6% · imagen 32.6
- Cuentas: caja -1064 · resultado -156 · financiamiento 130 · gasto corriente 1290 · deuda 3000 · efectos pendientes 7
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

## G1b · Heterodoxo coherente

_Mismo programa heterodoxo todo el mandato, pero sin abusar de cada herramienta ni dejar la caja en rojo._ Arquetipo: sindicalista.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 17.8% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Suba del salario mínimo, Ampliación de transferencias sociales, Crédito PyME y emprendedor, Congelar tarifas (subsidios a servicios)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Indicadores: INFL 58→55.2 · ACTV 45→47 · PODA 42→47.9 · INVC 40→42.8 · SOLV 45→44.5 · EXTE 38→38.2 · PSOC 45→48.9 · SEGU 42→42 · CONF 40→35.3
- Por qué: Poder adquisitivo +5.9 (Suba del salario mínimo; Congelar tarifas (subsidios a servicios)) · Conflictividad social -4.8 (Ampliación de transferencias sociales; la calle se calma sola o la exclusión la enciende) · Protección social y salud +3.9 (Ampliación de transferencias sociales) · Inflación -2.8 (Congelar tarifas (subsidios a servicios); expectativas y fundamentos de la inflación)
- Actores (satisfacción/relación): Clase media 47 · Sectores populares 47 · Sindicatos 48/73 · Industria 45/50 · PyMEs 46/50 · Financiero 45/50 · Agro 40/45 · Gobernadores 43/50 · Oficialismo 43/75 · Oposición 49/30
- Política: aprobación 42.8 · intención de voto 45.4% · gobernabilidad 52.6 · bancas 47% · imagen 49.7
- Cuentas: caja 816 · resultado -684 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 7
- Notas: Sindicatos: valoran que atendiste su reclamo. | Org. sociales: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 3
- Acciones: Control de precios, Promoción industrial, Asistencia alimentaria de emergencia
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Indicadores: INFL 55.2→52 · ACTV 47→48.1 · PODA 47.9→49.1 · INVC 42.8→40.7 · SOLV 44.5→39.4 · EXTE 38.2→38.4 · PSOC 48.9→51.7 · SEGU 42→42.1 · CONF 35.3→30.9
- Por qué: Solvencia fiscal -5.1 (las cuentas públicas) · Conflictividad social -4.3 (Asistencia alimentaria de emergencia; la calle se calma sola o la exclusión la enciende) · Inflación -3.2 (Control de precios) · Protección social y salud +2.8 (Asistencia alimentaria de emergencia)
- Actores (satisfacción/relación): Clase media 51 · Sectores populares 52 · Sindicatos 53/73 · Industria 47/50 · PyMEs 49/50 · Financiero 45/50 · Agro 41/45 · Gobernadores 45/50 · Oficialismo 50/75 · Oposición 54/30
- Política: aprobación 50.6 · intención de voto 50.6% · gobernabilidad 54.4 · bancas 47% · imagen 49.4
- Cuentas: caja 208 · resultado -607 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 8

**T3** (mandato 1, año 1 T3) — PA usados: 2
- Acciones: Subir retenciones a exportaciones, Administración tributaria (lucha contra la evasión)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Ola de Calor Extrema → Declarar emergencia
- Indicadores: INFL 52→52 · ACTV 48.1→45.3 · PODA 49.1→48.2 · INVC 40.7→43.2 · SOLV 39.4→36.8 · EXTE 38.4→37.6 · PSOC 51.7→52.5 · SEGU 42.1→42.2 · CONF 30.9→30.7
- Por qué: Presión tributaria +4.0 (Subir retenciones a exportaciones) · Actividad y empleo -2.7 (la inversión se volvió actividad) · Solvencia fiscal -2.6 (las cuentas públicas) · Inversión y crédito +2.5 (Promoción industrial (decisión anterior))
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 53 · Sindicatos 55/70 · Industria 47/50 · PyMEs 49/50 · Financiero 43/50 · Agro 38/45 · Gobernadores 46/50 · Oficialismo 57/75 · Oposición 59/30
- Política: aprobación 51.6 · intención de voto 51.4% · gobernabilidad 54.7 · bancas 47% · imagen 49.1
- Cuentas: caja 165 · resultado 107 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 8

**T4** (mandato 1, año 1 T4) — PA usados: 3
- Acciones: Control de cambios (cepo), Suba del salario mínimo, Control de precios
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 52→51.9 · ACTV 45.3→47.3 · PODA 48.2→51.3 · INVC 43.2→39.7 · SOLV 36.8→39.4 · EXTE 37.6→37.8 · PSOC 52.5→49.3 · SEGU 42.2→42.2 · CONF 30.7→33.5
- Por qué: Inversión y crédito -3.5 (Control de precios; Suba del salario mínimo) · Protección social y salud -3.1 · Poder adquisitivo +3.1 (Suba del salario mínimo; Control de precios) · Conflictividad social +2.8
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 54 · Sindicatos 57/67 · Industria 45/50 · PyMEs 47/50 · Financiero 43/50 · Agro 35/44 · Gobernadores 46/50 · Oficialismo 61/75 · Oposición 60/29
- Política: aprobación 51.5 · intención de voto 51.3% · gobernabilidad 53.7 · bancas 47% · imagen 48.9
- Cuentas: caja 211 · resultado -104 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 7

**T5** (mandato 1, año 2 T1) — PA usados: 1
- Acciones: Incentivos a la exportación
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 51.9→56.4 · ACTV 47.3→43.7 · PODA 51.3→47.8 · INVC 39.7→34.5 · SOLV 39.4→44.5 · EXTE 37.8→36.6 · PSOC 49.3→49.2 · SEGU 42.2→42.2 · CONF 33.5→32.6
- Por qué: Inversión y crédito -5.2 (Control de cambios (cepo) (decisión anterior)) · Solvencia fiscal +5.1 (las cuentas públicas) · Inflación +4.5 (Control de precios (decisión anterior); Suba del salario mínimo (decisión anterior)) · Actividad y empleo -3.6 (la inversión se volvió actividad; la infraestructura ayudó a producir)
- Actores (satisfacción/relación): Clase media 50 · Sectores populares 51 · Sindicatos 53/64 · Industria 39/49 · PyMEs 42/49 · Financiero 42/49 · Agro 32/44 · Gobernadores 43/49 · Oficialismo 61/75 · Oposición 60/28
- Política: aprobación 44.9 · intención de voto 46.9% · gobernabilidad 53.4 · bancas 47% · imagen 48.6
- Cuentas: caja 174 · resultado -38 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 4

**T6** (mandato 1, año 2 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 56.4→58.8 · ACTV 43.7→39.9 · PODA 47.8→44 · INVC 34.5→31.8 · SOLV 44.5→47.6 · EXTE 36.6→35.4 · PSOC 49.2→48.9 · SEGU 42.2→42.1 · CONF 32.6→32
- Por qué: Poder adquisitivo -3.8 (la inflación se comió los salarios) · Actividad y empleo -3.8 (la inversión se volvió actividad; la infraestructura ayudó a producir) · Solvencia fiscal +3.2 (las cuentas públicas) · Inversión y crédito -2.7 (Industria posterga inversiones; Control de cambios (cepo) (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 46 · Sindicatos 46/61 · Industria 34/49 · PyMEs 36/49 · Financiero 42/49 · Agro 29/43 · Gobernadores 37/49 · Oficialismo 57/74 · Oposición 58/36
- Política: aprobación 35.4 · intención de voto 39.7% · gobernabilidad 49.9 · bancas 47% · imagen 45.4
- Cuentas: caja 178 · resultado 205 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 3

**T7** (mandato 1, año 2 T3) — PA usados: 2
- Acciones: Administración tributaria (lucha contra la evasión), Suba del salario mínimo
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 58.8→58 · ACTV 39.9→40.6 · PODA 44→46.2 · INVC 31.8→28.3 · SOLV 47.6→49.5 · EXTE 35.4→34.2 · PSOC 48.9→48.7 · SEGU 42.1→42 · CONF 32→31.5
- Por qué: Inversión y crédito -3.5 (Industria posterga inversiones; Control de cambios (cepo) (decisión anterior)) · Poder adquisitivo +2.2 (Suba del salario mínimo) · Solvencia fiscal +1.9 (las cuentas públicas) · Sector externo y divisas -1.1 (Agro retiene la cosecha; Control de cambios (cepo) (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 45 · Sindicatos 44/58 · Industria 30/48 · PyMEs 32/48 · Financiero 42/48 · Agro 27/42 · Gobernadores 33/48 · Oficialismo 49/74 · Oposición 53/35
- Política: aprobación 32.1 · intención de voto 36.9% · gobernabilidad 47.4 · bancas 44% · imagen 45.3
- Cuentas: caja 317 · resultado -62 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 5

**T8** (mandato 1, año 2 T4) — PA usados: 2
- Acciones: Incentivos a la exportación, Control de precios
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 58→53.6 · ACTV 40.6→34.9 · PODA 46.2→46.6 · INVC 28.3→24.2 · SOLV 49.5→50.2 · EXTE 34.2→31.3 · PSOC 48.7→48.2 · SEGU 42→41.8 · CONF 31.5→32.6
- Por qué: Actividad y empleo -5.8 (la inversión se volvió actividad; Suba del salario mínimo (decisión anterior)) · Inflación -4.4 (Control de precios; expectativas y fundamentos de la inflación) · Inversión y crédito -4.1 (Control de precios; Industria posterga inversiones) · Sector externo y divisas -3.0 (Agro retiene la cosecha; Control de cambios (cepo) (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 43 · Sindicatos 41/55 · Industria 26/48 · PyMEs 27/48 · Financiero 43/48 · Agro 25/41 · Gobernadores 28/48 · Oficialismo 43/74 · Oposición 48/34
- Política: aprobación 29.4 · intención de voto 33.6% · gobernabilidad 49.5 · bancas 44.2% · imagen 40.1
- Cuentas: caja 244 · resultado -73 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 5

**T9** (mandato 1, año 3 T1) — PA usados: 1
- Acciones: Asistencia alimentaria de emergencia
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 53.6→52.3 · ACTV 34.9→27.9 · PODA 46.6→45 · INVC 24.2→22.4 · SOLV 50.2→49 · EXTE 31.3→31.3 · PSOC 48.2→49.6 · SEGU 41.8→41.6 · CONF 32.6→29.7
- Por qué: Actividad y empleo -7.0 (la inversión se volvió actividad; PyMEs: cierres y despidos) · Conflictividad social -2.9 (Asistencia alimentaria de emergencia) · Inversión y crédito -1.9 (Industria posterga inversiones; Control de cambios (cepo) (decisión anterior)) · Poder adquisitivo -1.7 (la inflación se comió los salarios; el empleo recompuso salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Agro retiene la cosecha (EXTE -3.0) · PyMEs: cierres y despidos (ACTV -2.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 40 · Sindicatos 36/52 · Industria 22/48 · PyMEs 23/47 · Financiero 43/48 · Agro 24/41 · Gobernadores 23/47 · Oficialismo 38/74 · Oposición 45/41
- Política: aprobación 26 · intención de voto 30.4% · gobernabilidad 49.4 · bancas 43.2% · imagen 37.3
- Cuentas: caja 10 · resultado -34 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 3

**T10** (mandato 1, año 3 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 52.3→55.5 · ACTV 27.9→25.7 · PODA 45→41 · INVC 22.4→20.6 · SOLV 49→48.4 · EXTE 31.3→28.4 · PSOC 49.6→48.7 · SEGU 41.6→41.2 · CONF 29.7→33.3
- Por qué: Poder adquisitivo -3.9 (la inflación se comió los salarios; el empleo recompuso salarios) · Inflación +3.3 (la falta de dólares) · Sector externo y divisas -2.8 (Agro retiene la cosecha; Giro de utilidades y dolarización de carteras) · Actividad y empleo -2.2 (la inversión se volvió actividad; PyMEs: cierres y despidos)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · PyMEs: cierres y despidos (ACTV -2.0)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 36 · Sindicatos 29/49 · Industria 19/47 · PyMEs 19/47 · Financiero 40/47 · Agro 23/40 · Gobernadores 19/47 · Oficialismo 32/74 · Oposición 42/40
- Política: aprobación 20.9 · intención de voto 25.8% · gobernabilidad 46.9 · bancas 42.2% · imagen 33.1
- Cuentas: caja 159 · resultado -51 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 1

**T11** (mandato 1, año 3 T3) — PA usados: 4
- Acciones: Subir retenciones a exportaciones, Administración tributaria (lucha contra la evasión), Suba del salario mínimo, Control de precios
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 55.5→51.3 · ACTV 25.7→23.4 · PODA 41→46.8 · INVC 20.6→16.2 · SOLV 48.4→50.4 · EXTE 28.4→24.3 · PSOC 48.7→45.4 · SEGU 41.2→40.8 · CONF 33.3→39.1
- Por qué: Poder adquisitivo +5.8 (Suba del salario mínimo; Control de precios) · Conflictividad social +5.7 (Sindicatos: medidas de fuerza; Estudiantes: tomas y marchas) · Inversión y crédito -4.5 (Control de precios; Industria posterga inversiones) · Inflación -4.3 (Control de precios; expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 34 · Sindicatos 28/46 · Industria 16/47 · PyMEs 16/46 · Financiero 38/47 · Agro 20/39 · Gobernadores 16/46 · Oficialismo 27/73 · Oposición 36/40
- Política: aprobación 19.5 · intención de voto 24.8% · gobernabilidad 43.4 · bancas 40.2% · imagen 33.2
- Cuentas: caja 419 · resultado 260 · financiamiento 0 · gasto corriente 1020 · deuda 3000 · efectos pendientes 7

**T12** (mandato 1, año 3 T4) — PA usados: 2
- Acciones: Incentivos a la exportación, Ampliación de transferencias sociales
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro agrario → Abrir una mesa de diálogo con las entidades | Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 51.3→53.5 · ACTV 23.4→17.6 · PODA 46.8→45.9 · INVC 16.2→14.8 · SOLV 50.4→49.9 · EXTE 24.3→18.6 · PSOC 45.4→49 · SEGU 40.8→40.3 · CONF 39.1→40.4
- Por qué: Actividad y empleo -5.8 (la inversión se volvió actividad; Suba del salario mínimo (decisión anterior)) · Sector externo y divisas -5.7 (Subir retenciones a exportaciones (decisión anterior); Agro retiene la cosecha) · Protección social y salud +3.6 (Ampliación de transferencias sociales) · Inflación +2.2 (Suba del salario mínimo (decisión anterior); la falta de dólares)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sindicatos: medidas de fuerza (CONF +2.3) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Piquetes (CONF +2.7)
- Actores (satisfacción/relación): Clase media 41 · Sectores populares 32 · Sindicatos 26/43 · Industria 12/46 · PyMEs 13/46 · Financiero 35/46 · Agro 17/44 · Gobernadores 13/46 · Oficialismo 25/73 · Oposición 33/47
- Política: aprobación 18 · intención de voto 22.9% · gobernabilidad 41.5 · bancas 38.2% · imagen 30.2
- Cuentas: caja -34 · resultado -253 · financiamiento 0 · gasto corriente 1140 · deuda 3000 · efectos pendientes 5

**T13** (mandato 1, año 4 T1) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Ruptura del bloque oficialista → Reorganizar el bloque que queda | Renuncia de Ministro → Aceptar la renuncia
- Indicadores: INFL 53.5→58.7 · ACTV 17.6→9.8 · PODA 45.9→40.3 · INVC 14.8→14.3 · SOLV 49.9→44.1 · EXTE 18.6→19.5 · PSOC 49→47.3 · SEGU 40.3→39.7 · CONF 40.4→51.1
- Por qué: Conflictividad social +9.8 (Paro agrario; Piquetes) · Actividad y empleo -7.8 (la inversión se volvió actividad; Paro agrario) · Solvencia fiscal -5.8 (Sube el riesgo país; las cuentas públicas) · Poder adquisitivo -5.5 (el empleo recompuso salarios; la inflación se comió los salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Paro agrario (CONF +8.0) · Paro agrario (ACTV -2.0) · Paro agrario (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Piquetes (CONF +2.7)
- Actores (satisfacción/relación): Clase media 36 · Sectores populares 28 · Sindicatos 20/40 · Industria 10/46 · PyMEs 10/45 · Financiero 29/46 · Agro 15/43 · Gobernadores 11/45 · Oficialismo 22/78 · Oposición 28/46
- Política: aprobación 13.6 · intención de voto 18.8% · gobernabilidad 31.5 · bancas 28.2% · imagen 25.4
- Cuentas: caja 24 · resultado -142 · financiamiento 0 · gasto corriente 1140 · deuda 3000 · efectos pendientes 3

**T14** (mandato 1, año 4 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Corrida cambiaria → Suba de tasas de emergencia | Paro General → Negociar | Plan de lucha de las organizaciones sociales → Convocar una mesa con las organizaciones
- Indicadores: INFL 58.7→59.5 · ACTV 9.8→7.8 · PODA 40.3→38.3 · INVC 14.3→10.7 · SOLV 44.1→42.2 · EXTE 19.5→23.1 · PSOC 47.3→45.5 · SEGU 39.7→39 · CONF 51.1→53.8
- Por qué: Poder adquisitivo -3.0 (la inflación se comió los salarios; el empleo recompuso salarios) · Solvencia fiscal -1.9 (Sube el riesgo país; las cuentas públicas) · Protección social y salud -1.8 (el desempleo presiona la red social) · Conflictividad social +1.2 (Piquetes; Sindicatos: medidas de fuerza)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Piquetes (CONF +2.7) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 31 · Sectores populares 24 · Sindicatos 16/43 · Industria 8/46 · PyMEs 8/45 · Financiero 24/46 · Agro 14/42 · Gobernadores 10/45 · Oficialismo 18/78 · Oposición 24/45
- Política: aprobación 10.7 · intención de voto 16% · gobernabilidad 26 · bancas 26.2% · imagen 22.6
- Cuentas: caja -83 · resultado 43 · financiamiento 0 · gasto corriente 1140 · deuda 3000 · efectos pendientes 0

**T15** (mandato 1, año 4 T3) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Marcha federal educativa → Recibir a rectores y centros de estudiantes | Inundación → Ayuda inmediata
- Indicadores: INFL 59.5→62.3 · ACTV 7.8→4 · PODA 38.3→34.8 · INVC 10.7→10 · SOLV 42.2→41.8 · EXTE 23.1→16.5 · PSOC 45.5→44.5 · SEGU 39→38.2 · CONF 53.8→65.6
- Por qué: Conflictividad social +10.3 (Paro general; Plan de lucha) · Sector externo y divisas -6.7 (Corrida cambiaria; Agro retiene la cosecha) · Actividad y empleo -3.8 (la inversión se volvió actividad; Paro general) · Poder adquisitivo -3.5 (la inflación se comió los salarios; el empleo recompuso salarios)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Corrida cambiaria (EXTE -6.0) · Corrida cambiaria (INFL +4.0) · Sube el riesgo país (SOLV -5.0) · Paro general (ACTV -3.0) · Paro general (CONF +10.0) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Plan de lucha (CONF +8.0) · Plan de lucha (ACTV -1.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 26 · Sectores populares 20 · Sindicatos 13/40 · Industria 6/45 · PyMEs 7/44 · Financiero 20/45 · Agro 13/42 · Gobernadores 8/48 · Oficialismo 15/78 · Oposición 20/44
- Política: aprobación 8.5 · intención de voto 14.7% · gobernabilidad 21.1 · bancas 25.2% · imagen 23
- Cuentas: caja -456 · resultado -173 · financiamiento 0 · gasto corriente 1140 · deuda 3000 · efectos pendientes 0

**T16** (mandato 1, año 4 T4) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Sindicatos: Reunión con Sindicatos. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Cacerolazo → Cadena nacional para dar explicaciones
- Indicadores: INFL 62.3→65.7 · ACTV 4→8.9 · PODA 34.8→31.4 · INVC 10→9.2 · SOLV 41.8→40.2 · EXTE 16.5→13.9 · PSOC 44.5→42.8 · SEGU 38.2→37.5 · CONF 65.6→63.9
- Por qué: Actividad y empleo +4.8 (Emitir dinero) · Poder adquisitivo -3.4 (la inflación se comió los salarios; el empleo recompuso salarios) · Inflación +3.3 (Emitir dinero; la falta de dólares) · Sector externo y divisas -2.6 (Agro retiene la cosecha; Giro de utilidades y dolarización de carteras)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Agro retiene la cosecha (EXTE -3.0) · Sube el riesgo país (SOLV -5.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Clase media dolariza sus ahorros (EXTE -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Piquetes (CONF +2.6) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 23 · Sectores populares 17 · Sindicatos 10/37 · Industria 5/45 · PyMEs 5/44 · Financiero 17/45 · Agro 11/41 · Gobernadores 7/48 · Oficialismo 12/77 · Oposición 18/44
- Política: aprobación 7 · intención de voto 14.3% · gobernabilidad 20.9 · bancas 24.2% · imagen 25.5
- Cuentas: caja -197 · resultado -341 · financiamiento 250 · gasto corriente 1140 · deuda 3000 · efectos pendientes 0
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

## G2 · Rígido ortodoxo

_Todo el mandato las mismas recetas: ajuste, tarifas, tasas, baja de impuestos, reformas pro-mercado._ Arquetipo: empresario.

Partida de muestra (semilla 1): **derrota (impeachment)** en 16 turnos · reelección — · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero.
- Indicadores: INFL 58→57.5 · ACTV 45→41 · PODA 42→37.5 · INVC 40→35.2 · SOLV 45→52.9 · EXTE 38→40.1 · PSOC 45→41.9 · SEGU 42→41.8 · CONF 40→39.8
- Por qué: Solvencia fiscal +7.9 (las cuentas públicas) · Inversión y crédito -4.8 (Suba de tasas / contracción monetaria) · Poder adquisitivo -4.5 (Actualizar tarifas (quita de subsidios); la inflación se comió los salarios) · Actividad y empleo -4.0 (Ajuste del gasto público; la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 39 · Sindicatos 36/50 · Industria 41/55 · PyMEs 39/50 · Financiero 47/60 · Agro 43/48 · Gobernadores 39/50 · Oficialismo 35/75 · Oposición 48/30
- Política: aprobación 30.2 · intención de voto 37% · gobernabilidad 49.6 · bancas 46% · imagen 49.7
- Cuentas: caja 2078 · resultado 578 · financiamiento 0 · gasto corriente 680 · deuda 3000 · efectos pendientes 9
- Notas: Agro: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 4
- Acciones: Reducción de impuestos, Reforma laboral
- Interacciones: reunion Financiero: Reunión con Financiero.
- Indicadores: INFL 57.5→50.8 · ACTV 41→37.6 · PODA 37.5→36.6 · INVC 35.2→35.6 · SOLV 52.9→57.5 · EXTE 40.1→44 · PSOC 41.9→41.7 · SEGU 41.8→41.5 · CONF 39.8→43.6
- Por qué: Inflación -6.7 (expectativas y fundamentos de la inflación; Suba de tasas / contracción monetaria (decisión anterior)) · Solvencia fiscal +4.6 (las cuentas públicas) · Sector externo y divisas +3.9 (Bajar retenciones (decisión anterior)) · Conflictividad social +3.7 (Reforma laboral)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 36 · Sindicatos 33/30 · Industria 40/58 · PyMEs 37/53 · Financiero 53/60 · Agro 47/48 · Gobernadores 35/50 · Oficialismo 31/75 · Oposición 45/30
- Política: aprobación 28.5 · intención de voto 35.4% · gobernabilidad 45.6 · bancas 42% · imagen 49.4
- Cuentas: caja 2294 · resultado 216 · financiamiento 0 · gasto corriente 680 · deuda 3000 · efectos pendientes 12
- Notas: Industria: notan la medida que pedían. | PyMEs: notan la medida que pedían.

**T3** (mandato 1, año 1 T3) — PA usados: 4
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria, Privatización de empresas públicas
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 50.8→45.6 · ACTV 37.6→36.5 · PODA 36.6→34.3 · INVC 35.6→35.5 · SOLV 57.5→61.9 · EXTE 44→48.6 · PSOC 41.7→39.5 · SEGU 41.5→41.1 · CONF 43.6→45.7
- Por qué: Presión tributaria -6.0 (Reducción de impuestos (decisión anterior)) · Inflación -5.1 (expectativas y fundamentos de la inflación; Suba de tasas / contracción monetaria (decisión anterior)) · Sector externo y divisas +4.6 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria) · Solvencia fiscal +4.4 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.4) · Sindicatos: medidas de fuerza (CONF +2.5)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 34 · Sindicatos 30/30 · Industria 42/58 · PyMEs 37/53 · Financiero 60/57 · Agro 54/48 · Gobernadores 31/54 · Oficialismo 28/75 · Oposición 42/30
- Política: aprobación 28.4 · intención de voto 35.9% · gobernabilidad 44.4 · bancas 41% · imagen 52.1
- Cuentas: caja 2970 · resultado 426 · financiamiento 600 · gasto corriente 500 · deuda 3000 · efectos pendientes 9

**T4** (mandato 1, año 1 T4) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 45.6→40.6 · ACTV 36.5→38.7 · PODA 34.3→34.6 · INVC 35.5→42.4 · SOLV 61.9→59.8 · EXTE 48.6→46.4 · PSOC 39.5→39.4 · SEGU 41.1→40.8 · CONF 45.7→46.4
- Por qué: Inversión y crédito +6.9 (Privatización de empresas públicas (decisión anterior)) · Inflación -5.0 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Instituciones y derechos -3.0 (Decreto de necesidad y urgencia) · Sector externo y divisas -2.2
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.5) · Piquetes (CONF +3.0)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 35 · Sindicatos 30/29 · Industria 45/58 · PyMEs 42/53 · Financiero 64/54 · Agro 56/47 · Gobernadores 28/54 · Oficialismo 30/75 · Oposición 38/21
- Política: aprobación 30.2 · intención de voto 36.9% · gobernabilidad 43.3 · bancas 40% · imagen 51.7
- Cuentas: caja 3257 · resultado -63 · financiamiento 0 · gasto corriente 500 · deuda 3000 · efectos pendientes 4

**T5** (mandato 1, año 2 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 40.6→40.6 · ACTV 38.7→36.4 · PODA 34.6→31 · INVC 42.4→37.4 · SOLV 59.8→62.3 · EXTE 46.4→48 · PSOC 39.4→33.4 · SEGU 40.8→40.4 · CONF 46.4→53.9
- Por qué: Conflictividad social +7.5 (Ajuste del gasto público; Actualizar tarifas (quita de subsidios)) · Protección social y salud -6.0 (Ajuste del gasto público) · Inversión y crédito -5.0 (Suba de tasas / contracción monetaria) · Presión tributaria -4.0 (Bajar retenciones)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.5) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 31 · Sindicatos 27/29 · Industria 45/57 · PyMEs 41/52 · Financiero 65/51 · Agro 59/47 · Gobernadores 25/53 · Oficialismo 31/75 · Oposición 34/20
- Política: aprobación 27.1 · intención de voto 34.8% · gobernabilidad 37.1 · bancas 39% · imagen 51.4
- Cuentas: caja 4003 · resultado 746 · financiamiento 0 · gasto corriente 280 · deuda 3000 · efectos pendientes 11

**T6** (mandato 1, año 2 T2) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Protestas Estudiantiles → Aumentar el presupuesto educativo
- Indicadores: INFL 40.6→36.1 · ACTV 36.4→36 · PODA 31→31.3 · INVC 37.4→41 · SOLV 62.3→66.8 · EXTE 48→49.6 · PSOC 33.4→33.4 · SEGU 40.4→39.9 · CONF 53.9→59
- Por qué: Solvencia fiscal +4.5 (Mercados abiertos: baja el riesgo país; las cuentas públicas) · Inflación -4.5 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Inversión y crédito +3.6 · Instituciones y derechos -2.9 (Decreto de necesidad y urgencia)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 41 · Sectores populares 30 · Sindicatos 26/28 · Industria 46/57 · PyMEs 42/52 · Financiero 68/48 · Agro 61/46 · Gobernadores 24/53 · Oficialismo 31/74 · Oposición 29/12
- Política: aprobación 26.3 · intención de voto 34.1% · gobernabilidad 34.6 · bancas 38% · imagen 51
- Cuentas: caja 4018 · resultado 315 · financiamiento 0 · gasto corriente 280 · deuda 3000 · efectos pendientes 6

**T7** (mandato 1, año 2 T3) — PA usados: 2
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro General → Negociar | Renuncia de Ministro → Aceptar la renuncia
- Indicadores: INFL 36.1→33 · ACTV 36→33.7 · PODA 31.3→32.5 · INVC 41→35.3 · SOLV 66.8→69.3 · EXTE 49.6→53.9 · PSOC 33.4→27.5 · SEGU 39.9→39.3 · CONF 59→65.9
- Por qué: Conflictividad social +6.9 (Ajuste del gasto público; Piquetes) · Protección social y salud -5.9 (Ajuste del gasto público) · Inversión y crédito -5.7 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Sector externo y divisas +4.3 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 40 · Sectores populares 28 · Sindicatos 24/34 · Industria 43/56 · PyMEs 39/51 · Financiero 70/45 · Agro 64/45 · Gobernadores 21/52 · Oficialismo 28/76 · Oposición 24/11
- Política: aprobación 23.9 · intención de voto 31.6% · gobernabilidad 32 · bancas 38% · imagen 47.6
- Cuentas: caja 4446 · resultado 278 · financiamiento 0 · gasto corriente 160 · deuda 3000 · efectos pendientes 5

**T8** (mandato 1, año 2 T4) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Plan de lucha de las organizaciones sociales → Convocar una mesa con las organizaciones | Ruptura del bloque oficialista → Reorganizar el bloque que queda
- Indicadores: INFL 33→29.7 · ACTV 33.7→28 · PODA 32.5→32.4 · INVC 35.3→37.9 · SOLV 69.3→66.7 · EXTE 53.9→51.4 · PSOC 27.5→27.3 · SEGU 39.3→38.7 · CONF 65.9→70.2
- Por qué: Actividad y empleo -5.7 (Paro general; Suba de tasas / contracción monetaria (decisión anterior)) · Instituciones y derechos -5.7 (Decreto de necesidad y urgencia) · Conflictividad social +4.3 (Paro general; Piquetes) · Inflación -3.3 (Suba de tasas / contracción monetaria (decisión anterior))
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Paro general (ACTV -3.0) · Paro general (CONF +10.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 38 · Sectores populares 26 · Sindicatos 22/33 · Industria 40/56 · PyMEs 37/51 · Financiero 68/42 · Agro 64/44 · Gobernadores 19/52 · Oficialismo 25/79 · Oposición 18/2
- Política: aprobación 21.2 · intención de voto 28.7% · gobernabilidad 27.2 · bancas 33.3% · imagen 43.5
- Cuentas: caja 4765 · resultado 169 · financiamiento 0 · gasto corriente 160 · deuda 3000 · efectos pendientes 2

**T9** (mandato 1, año 3 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Motín Carcelario → Negociar
- Indicadores: INFL 29.7→31.2 · ACTV 28→24.6 · PODA 32.4→29.4 · INVC 37.9→31.5 · SOLV 66.7→68.7 · EXTE 51.4→52.7 · PSOC 27.3→21.2 · SEGU 38.7→36.8 · CONF 70.2→79.8
- Por qué: Conflictividad social +7.2 (Ajuste del gasto público; Plan de lucha) · Inversión y crédito -6.4 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Protección social y salud -6.1 (Ajuste del gasto público) · Presión tributaria -4.0 (Bajar retenciones)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.5) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Plan de lucha (CONF +8.0) · Plan de lucha (ACTV -1.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 35 · Sectores populares 22 · Sindicatos 19/32 · Industria 36/56 · PyMEs 32/50 · Financiero 66/39 · Agro 65/44 · Gobernadores 16/51 · Oficialismo 21/79 · Oposición 15/1
- Política: aprobación 17.9 · intención de voto 24.6% · gobernabilidad 23.2 · bancas 32.3% · imagen 36.5
- Cuentas: caja 5471 · resultado 805 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 10

**T10** (mandato 1, año 3 T2) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro General → Negociar | Marcha federal educativa → Recibir a rectores y centros de estudiantes
- Indicadores: INFL 31.2→28.1 · ACTV 24.6→21.2 · PODA 29.4→30.1 · INVC 31.5→32.6 · SOLV 68.7→69.6 · EXTE 52.7→54 · PSOC 21.2→21 · SEGU 36.8→36 · CONF 79.8→76.7
- Por qué: Instituciones y derechos -5.6 (Decreto de necesidad y urgencia) · Conflictividad social -5.5 (la calle se calma sola o la exclusión la enciende) · Actividad y empleo -3.4 (Suba de tasas / contracción monetaria (decisión anterior); el conflicto frenó la economía) · Inflación -3.0 (Suba de tasas / contracción monetaria (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.4) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.5) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 33 · Sectores populares 19 · Sindicatos 16/38 · Industria 33/55 · PyMEs 29/50 · Financiero 65/36 · Agro 65/43 · Gobernadores 13/51 · Oficialismo 17/79 · Oposición 11/1
- Política: aprobación 15.7 · intención de voto 22.1% · gobernabilidad 23 · bancas 31.3% · imagen 32.9
- Cuentas: caja 5680 · resultado 259 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 6

**T11** (mandato 1, año 3 T3) — PA usados: 2
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Plan de lucha de las organizaciones sociales → Convocar una mesa con las organizaciones
- Indicadores: INFL 28.1→26.2 · ACTV 21.2→12.2 · PODA 30.1→29.4 · INVC 32.6→24.7 · SOLV 69.6→71.5 · EXTE 54→57.8 · PSOC 21→14.7 · SEGU 36→34.9 · CONF 76.7→80.2
- Por qué: Actividad y empleo -9.0 (Ajuste del gasto público; Paro general) · Inversión y crédito -7.9 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Protección social y salud -6.3 (Ajuste del gasto público; el desempleo presiona la red social) · Sector externo y divisas +3.8 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.4) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Paro general (ACTV -3.0) · Paro general (CONF +10.0) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Piquetes (CONF +3.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 30 · Sectores populares 16 · Sindicatos 13/37 · Industria 28/55 · PyMEs 24/49 · Financiero 65/33 · Agro 66/42 · Gobernadores 10/50 · Oficialismo 13/78 · Oposición 9/2
- Política: aprobación 14 · intención de voto 21% · gobernabilidad 20.9 · bancas 30.3% · imagen 33.4
- Cuentas: caja 6226 · resultado 396 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 5

**T12** (mandato 1, año 3 T4) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro docente por tiempo indeterminado → Reabrir la paritaria docente | Conflicto Diplomático → Escalar el conflicto
- Indicadores: INFL 26.2→24.3 · ACTV 12.2→10.7 · PODA 29.4→28.6 · INVC 24.7→25.7 · SOLV 71.5→65.2 · EXTE 57.8→52.8 · PSOC 14.7→14.4 · SEGU 34.9→33.8 · CONF 80.2→77.2
- Por qué: Solvencia fiscal -6.4 (las cuentas públicas) · Instituciones y derechos -5.4 (Decreto de necesidad y urgencia) · Conflictividad social -3.0 (la calle se calma sola o la exclusión la enciende) · Inflación -1.9 (Suba de tasas / contracción monetaria (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.4) · Liquidación fluida de la cosecha (EXTE +2.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Plan de lucha (CONF +8.0) · Plan de lucha (ACTV -1.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 28 · Sectores populares 14 · Sindicatos 12/37 · Industria 26/54 · PyMEs 21/49 · Financiero 61/30 · Agro 65/42 · Gobernadores 9/50 · Oficialismo 11/78 · Oposición 7/1
- Política: aprobación 12.6 · intención de voto 20.3% · gobernabilidad 20.6 · bancas 29.3% · imagen 34.9
- Cuentas: caja 6431 · resultado 305 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 2

**T13** (mandato 1, año 4 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro General → Negociar
- Indicadores: INFL 24.3→27 · ACTV 10.7→5.8 · PODA 28.6→25.8 · INVC 25.7→18 · SOLV 65.2→65.8 · EXTE 52.8→53.7 · PSOC 14.4→8.1 · SEGU 33.8→32.4 · CONF 77.2→81.4
- Por qué: Inversión y crédito -7.6 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Protección social y salud -6.2 (Ajuste del gasto público; el desempleo presiona la red social) · Actividad y empleo -5.0 (Ajuste del gasto público; el conflicto frenó la economía) · Conflictividad social +4.2 (Ajuste del gasto público; Paro docente por tiempo indeterminado)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente por tiempo indeterminado (EDUC -3.0) · Paro docente por tiempo indeterminado (CONF +4.0) · Fuga de cerebros (CIEN -1.0) · Piquetes (CONF +2.9) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 25 · Sectores populares 11 · Sindicatos 9/42 · Industria 22/54 · PyMEs 18/48 · Financiero 55/27 · Agro 64/41 · Gobernadores 7/49 · Oficialismo 9/78 · Oposición 6/2
- Política: aprobación 11.2 · intención de voto 19.4% · gobernabilidad 18.2 · bancas 28.3% · imagen 35.4
- Cuentas: caja 6918 · resultado 536 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 10

**T14** (mandato 1, año 4 T2) — PA usados: 1
- Acciones: Decreto de necesidad y urgencia
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Cacerolazo → Cadena nacional para dar explicaciones | Marcha federal educativa → Recibir a rectores y centros de estudiantes | Plan de lucha de las organizaciones sociales → Convocar una mesa con las organizaciones
- Indicadores: INFL 27→25.3 · ACTV 5.8→0.4 · PODA 25.8→24.8 · INVC 18→19.5 · SOLV 65.8→63.7 · EXTE 53.7→52.6 · PSOC 8.1→7.9 · SEGU 32.4→31 · CONF 81.4→78.5
- Por qué: Actividad y empleo -5.3 (Paro general; la inversión se volvió actividad) · Instituciones y derechos -5.3 (Decreto de necesidad y urgencia) · Solvencia fiscal -2.1 (las cuentas públicas) · Conflictividad social -1.9 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Paro general (ACTV -3.0) · Paro general (CONF +10.0) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Piquetes (CONF +2.9) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 23 · Sectores populares 10 · Sindicatos 8/41 · Industria 20/54 · PyMEs 16/48 · Financiero 50/24 · Agro 62/40 · Gobernadores 6/49 · Oficialismo 7/78 · Oposición 5/1
- Política: aprobación 10 · intención de voto 19.2% · gobernabilidad 18.1 · bancas 27.3% · imagen 37.8
- Cuentas: caja 7100 · resultado 33 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 6

**T15** (mandato 1, año 4 T3) — PA usados: 3
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Paro docente por tiempo indeterminado → Reabrir la paritaria docente | Motín Carcelario → Negociar
- Indicadores: INFL 25.3→24.6 · ACTV 0.4→0.4 · PODA 24.8→23.9 · INVC 19.5→12.4 · SOLV 63.7→63.4 · EXTE 52.6→54.2 · PSOC 7.9→1.8 · SEGU 31→28.5 · CONF 78.5→84.6
- Por qué: Inversión y crédito -7.1 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Protección social y salud -6.1 (Ajuste del gasto público; el desempleo presiona la red social) · Conflictividad social +4.6 (Ajuste del gasto público; Plan de lucha) · Sector externo y divisas +1.5 (Suba de tasas / contracción monetaria; Bajar retenciones (decisión anterior))
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Cacerolazo (CONF +6.0) · Cacerolazo (GOB -5.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Plan de lucha (CONF +8.0) · Plan de lucha (ACTV -1.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 21 · Sectores populares 8 · Sindicatos 7/41 · Industria 17/53 · PyMEs 13/47 · Financiero 47/21 · Agro 61/40 · Gobernadores 5/48 · Oficialismo 6/78 · Oposición 4/2
- Política: aprobación 9.2 · intención de voto 17.1% · gobernabilidad 10.8 · bancas 27.3% · imagen 31.9
- Cuentas: caja 7311 · resultado 411 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 5

**T16** (mandato 1, año 4 T4) — PA usados: 2
- Acciones: Decreto de necesidad y urgencia (suspendida)
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 24.6→23.7 · ACTV 0.4→0 · PODA 23.9→22.9 · INVC 12.4→14.5 · SOLV 63.4→59.5 · EXTE 54.2→49.6 · PSOC 1.8→1.7 · SEGU 28.5→27.1 · CONF 84.6→82.2
- Por qué: Conflictividad social -4.8 (la calle se calma sola o la exclusión la enciende) · Sector externo y divisas -4.6 (Giro de utilidades y dolarización de carteras; exportaciones de conocimiento) · Solvencia fiscal -3.9 (las cuentas públicas) · Educación -3.3 (Paro docente por tiempo indeterminado; deterioro sin inversión educativa)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.5) · Giro de utilidades y dolarización de carteras (EXTE -2.0) · Sindicatos: medidas de fuerza (CONF +2.4) · PyMEs: cierres y despidos (ACTV -2.0) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente por tiempo indeterminado (EDUC -3.0) · Paro docente por tiempo indeterminado (CONF +4.0) · Fuga de cerebros (CIEN -1.0) · Piquetes (CONF +2.8) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 20 · Sectores populares 7 · Sindicatos 6/40 · Industria 16/53 · PyMEs 13/47 · Financiero 44/18 · Agro 59/39 · Gobernadores 5/48 · Oficialismo 6/77 · Oposición 5/4
- Política: aprobación 8.6 · intención de voto 15.8% · gobernabilidad 11.2 · bancas 27.3% · imagen 28.5
- Cuentas: caja 7485 · resultado -26 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 2

## G2b · Ortodoxo coherente

_Mismo programa ortodoxo todo el mandato, pero sin abusar de cada herramienta._ Arquetipo: empresario.

Partida de muestra (semilla 1): **derrota (election_loss)** en 16 turnos · reelección 40.5% · sucesión —.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero.
- Indicadores: INFL 58→57.5 · ACTV 45→41 · PODA 42→37.5 · INVC 40→35.2 · SOLV 45→52.9 · EXTE 38→40.1 · PSOC 45→41.9 · SEGU 42→41.8 · CONF 40→39.8
- Por qué: Solvencia fiscal +7.9 (las cuentas públicas) · Inversión y crédito -4.8 (Suba de tasas / contracción monetaria) · Poder adquisitivo -4.5 (Actualizar tarifas (quita de subsidios); la inflación se comió los salarios) · Actividad y empleo -4.0 (Ajuste del gasto público; la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 39 · Sindicatos 36/50 · Industria 41/55 · PyMEs 39/50 · Financiero 47/60 · Agro 43/48 · Gobernadores 39/50 · Oficialismo 35/75 · Oposición 48/30
- Política: aprobación 30.2 · intención de voto 37% · gobernabilidad 49.6 · bancas 46% · imagen 49.7
- Cuentas: caja 2078 · resultado 578 · financiamiento 0 · gasto corriente 680 · deuda 3000 · efectos pendientes 9
- Notas: Agro: notan la medida que pedían.

**T2** (mandato 1, año 1 T2) — PA usados: 4
- Acciones: Reducción de impuestos, Reforma laboral
- Interacciones: reunion Financiero: Reunión con Financiero.
- Indicadores: INFL 57.5→50.8 · ACTV 41→37.6 · PODA 37.5→36.6 · INVC 35.2→35.6 · SOLV 52.9→57.5 · EXTE 40.1→44 · PSOC 41.9→41.7 · SEGU 41.8→41.5 · CONF 39.8→43.6
- Por qué: Inflación -6.7 (expectativas y fundamentos de la inflación; Suba de tasas / contracción monetaria (decisión anterior)) · Solvencia fiscal +4.6 (las cuentas públicas) · Sector externo y divisas +3.9 (Bajar retenciones (decisión anterior)) · Conflictividad social +3.7 (Reforma laboral)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 36 · Sindicatos 33/30 · Industria 40/58 · PyMEs 37/53 · Financiero 53/60 · Agro 47/48 · Gobernadores 35/50 · Oficialismo 31/75 · Oposición 45/30
- Política: aprobación 28.5 · intención de voto 35.4% · gobernabilidad 45.6 · bancas 42% · imagen 49.4
- Cuentas: caja 2294 · resultado 216 · financiamiento 0 · gasto corriente 680 · deuda 3000 · efectos pendientes 12
- Notas: Industria: notan la medida que pedían. | PyMEs: notan la medida que pedían.

**T3** (mandato 1, año 1 T3) — PA usados: 4
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria, Privatización de empresas públicas
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 50.8→45.6 · ACTV 37.6→36.5 · PODA 36.6→34.3 · INVC 35.6→35.5 · SOLV 57.5→61.9 · EXTE 44→48.6 · PSOC 41.7→39.5 · SEGU 41.5→41.1 · CONF 43.6→45.7
- Por qué: Presión tributaria -6.0 (Reducción de impuestos (decisión anterior)) · Inflación -5.1 (expectativas y fundamentos de la inflación; Suba de tasas / contracción monetaria (decisión anterior)) · Sector externo y divisas +4.6 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria) · Solvencia fiscal +4.4 (las cuentas públicas)
- Canales de poder aplicados: Industria posterga inversiones (INVC -1.4) · Sindicatos: medidas de fuerza (CONF +2.5)
- Actores (satisfacción/relación): Clase media 43 · Sectores populares 34 · Sindicatos 30/30 · Industria 42/58 · PyMEs 37/53 · Financiero 60/57 · Agro 54/48 · Gobernadores 31/54 · Oficialismo 28/75 · Oposición 42/30
- Política: aprobación 28.4 · intención de voto 35.9% · gobernabilidad 44.4 · bancas 41% · imagen 52.1
- Cuentas: caja 2970 · resultado 426 · financiamiento 600 · gasto corriente 500 · deuda 3000 · efectos pendientes 9

**T4** (mandato 1, año 1 T4) — PA usados: 1
- Acciones: Transparencia y anticorrupción
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 45.6→40.6 · ACTV 36.5→38.7 · PODA 34.3→34.6 · INVC 35.5→42.7 · SOLV 61.9→59.1 · EXTE 48.6→46.4 · PSOC 39.5→39.4 · SEGU 41.1→40.8 · CONF 45.7→46.4
- Por qué: Inversión y crédito +7.1 (Privatización de empresas públicas (decisión anterior)) · Inflación -5.0 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Instituciones y derechos +2.9 (Transparencia y anticorrupción) · Solvencia fiscal -2.7 (las cuentas públicas)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.5) · Piquetes (CONF +3.0)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 35 · Sindicatos 30/29 · Industria 45/58 · PyMEs 42/53 · Financiero 65/54 · Agro 57/47 · Gobernadores 28/54 · Oficialismo 30/70 · Oposición 42/29
- Política: aprobación 31.7 · intención de voto 37.9% · gobernabilidad 43.6 · bancas 40% · imagen 51.7
- Cuentas: caja 3157 · resultado -163 · financiamiento 0 · gasto corriente 500 · deuda 3000 · efectos pendientes 5
- Notas: Aliados: notan la medida que pedían.

**T5** (mandato 1, año 2 T1) — PA usados: 2
- Acciones: Actualizar tarifas (quita de subsidios), Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 40.6→40.7 · ACTV 38.7→41.8 · PODA 34.6→31.2 · INVC 42.7→42.8 · SOLV 59.1→59.7 · EXTE 46.4→46.1 · PSOC 39.4→39.5 · SEGU 40.8→40.6 · CONF 46.4→47.3
- Por qué: Presión tributaria -4.0 (Bajar retenciones) · Poder adquisitivo -3.4 (Actualizar tarifas (quita de subsidios); Privatización de empresas públicas (decisión anterior)) · Actividad y empleo +3.1 (Reforma laboral (decisión anterior)) · Conflictividad social +0.9 (Actualizar tarifas (quita de subsidios); Sindicatos: medidas de fuerza)
- Canales de poder aplicados: Sindicatos: medidas de fuerza (CONF +2.5)
- Actores (satisfacción/relación): Clase media 45 · Sectores populares 35 · Sindicatos 30/29 · Industria 49/57 · PyMEs 46/52 · Financiero 67/51 · Agro 60/47 · Gobernadores 28/53 · Oficialismo 36/70 · Oposición 43/28
- Política: aprobación 33.6 · intención de voto 39.1% · gobernabilidad 42.9 · bancas 39% · imagen 51.4
- Cuentas: caja 3660 · resultado 503 · financiamiento 0 · gasto corriente 400 · deuda 3000 · efectos pendientes 7

**T6** (mandato 1, año 2 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Bloqueo Legislativo → Negociar con la oposición
- Indicadores: INFL 40.7→38.9 · ACTV 41.8→44.3 · PODA 31.2→31.9 · INVC 42.8→47.7 · SOLV 59.7→63.2 · EXTE 46.1→47.8 · PSOC 39.5→39.6 · SEGU 40.6→40.4 · CONF 47.3→45.6
- Por qué: Inversión y crédito +4.9 (Transparencia y anticorrupción (decisión anterior)) · Solvencia fiscal +3.5 (Mercados abiertos: baja el riesgo país) · Actividad y empleo +2.6 (Reforma laboral (decisión anterior)) · Inflación -1.9 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 37 · Sindicatos 33/28 · Industria 54/57 · PyMEs 52/52 · Financiero 70/48 · Agro 62/46 · Gobernadores 31/53 · Oficialismo 42/69 · Oposición 45/36
- Política: aprobación 37.3 · intención de voto 40.9% · gobernabilidad 41 · bancas 39% · imagen 48
- Cuentas: caja 3775 · resultado 314 · financiamiento 0 · gasto corriente 400 · deuda 3000 · efectos pendientes 4

**T7** (mandato 1, año 2 T3) — PA usados: 2
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 38.9→37.2 · ACTV 44.3→42.8 · PODA 31.9→32.5 · INVC 47.7→42.8 · SOLV 63.2→66.6 · EXTE 47.8→52.2 · PSOC 39.6→36.8 · SEGU 40.4→40.1 · CONF 45.6→44.6
- Por qué: Inversión y crédito -4.9 (Suba de tasas / contracción monetaria) · Sector externo y divisas +4.4 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria) · Solvencia fiscal +3.4 (Mercados abiertos: baja el riesgo país; las cuentas públicas) · Protección social y salud -2.8 (Ajuste del gasto público)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 47 · Sectores populares 37 · Sindicatos 33/28 · Industria 56/56 · PyMEs 53/51 · Financiero 74/45 · Agro 64/45 · Gobernadores 32/52 · Oficialismo 46/69 · Oposición 49/35
- Política: aprobación 38.4 · intención de voto 41.6% · gobernabilidad 41.2 · bancas 39% · imagen 47.8
- Cuentas: caja 4351 · resultado 377 · financiamiento 0 · gasto corriente 280 · deuda 3000 · efectos pendientes 4

**T8** (mandato 1, año 2 T4) — PA usados: 1
- Acciones: Transparencia y anticorrupción
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 37.2→33.2 · ACTV 42.8→40 · PODA 32.5→32.9 · INVC 42.8→43 · SOLV 66.6→67 · EXTE 52.2→51.7 · PSOC 36.8→36.8 · SEGU 40.1→39.8 · CONF 44.6→44.7
- Por qué: Inflación -4.0 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Actividad y empleo -2.8 (Suba de tasas / contracción monetaria (decisión anterior); la inversión se volvió actividad) · Instituciones y derechos +2.8 (Transparencia y anticorrupción) · Conflictividad social -0.8 (la calle se calma sola o la exclusión la enciende)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 37 · Sindicatos 34/27 · Industria 57/56 · PyMEs 53/51 · Financiero 76/42 · Agro 66/44 · Gobernadores 32/52 · Oficialismo 47/64 · Oposición 53/34
- Política: aprobación 39.8 · intención de voto 42.2% · gobernabilidad 48.1 · bancas 45.5% · imagen 46.6
- Cuentas: caja 4664 · resultado 313 · financiamiento 0 · gasto corriente 280 · deuda 3000 · efectos pendientes 3

**T9** (mandato 1, año 3 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Motín Carcelario → Negociar
- Indicadores: INFL 33.2→33.8 · ACTV 40→39 · PODA 32.9→30.4 · INVC 43→38.4 · SOLV 67→71 · EXTE 51.7→54.9 · PSOC 36.8→33.9 · SEGU 39.8→38.5 · CONF 44.7→46.7
- Por qué: Inversión y crédito -4.6 (Suba de tasas / contracción monetaria) · Presión tributaria -4.0 (Bajar retenciones) · Solvencia fiscal +4.0 (Mercados abiertos: baja el riesgo país; las cuentas públicas) · Sector externo y divisas +3.3 (Suba de tasas / contracción monetaria; Liquidación fluida de la cosecha)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 34 · Sindicatos 31/26 · Industria 56/56 · PyMEs 51/50 · Financiero 78/39 · Agro 69/44 · Gobernadores 31/51 · Oficialismo 47/64 · Oposición 55/33
- Política: aprobación 37.6 · intención de voto 40% · gobernabilidad 48.7 · bancas 47.5% · imagen 43.5
- Cuentas: caja 5447 · resultado 882 · financiamiento 0 · gasto corriente 60 · deuda 3000 · efectos pendientes 10

**T10** (mandato 1, año 3 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 33.8→29.8 · ACTV 39→38.2 · PODA 30.4→30.8 · INVC 38.4→43.6 · SOLV 71→73.3 · EXTE 54.9→58 · PSOC 33.9→34 · SEGU 38.5→38.1 · CONF 46.7→48.4
- Por qué: Inversión y crédito +5.2 (Transparencia y anticorrupción (decisión anterior)) · Inflación -4.0 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Sector externo y divisas +3.1 (Bajar retenciones (decisión anterior); Liquidación fluida de la cosecha) · Solvencia fiscal +2.3 (Mercados abiertos: baja el riesgo país; las cuentas públicas)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 34 · Sindicatos 31/26 · Industria 57/55 · PyMEs 52/50 · Financiero 80/36 · Agro 71/43 · Gobernadores 29/51 · Oficialismo 47/64 · Oposición 55/32
- Política: aprobación 37.5 · intención de voto 39.8% · gobernabilidad 48.1 · bancas 47.5% · imagen 43
- Cuentas: caja 5974 · resultado 428 · financiamiento 0 · gasto corriente 60 · deuda 3000 · efectos pendientes 6

**T11** (mandato 1, año 3 T3) — PA usados: 0
- Acciones: —
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 29.8→27.1 · ACTV 38.2→41.4 · PODA 30.8→31.4 · INVC 43.6→43.8 · SOLV 73.3→76 · EXTE 58→61.9 · PSOC 34→34.2 · SEGU 38.1→37.9 · CONF 48.4→49.7
- Por qué: Sector externo y divisas +3.9 (Bajar retenciones (decisión anterior); Liquidación fluida de la cosecha) · Actividad y empleo +3.2 (Bajar retenciones (decisión anterior)) · Inflación -2.7 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Solvencia fiscal +2.7 (Mercados abiertos: baja el riesgo país; las cuentas públicas)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 35 · Sindicatos 33/25 · Industria 59/55 · PyMEs 54/49 · Financiero 82/33 · Agro 73/42 · Gobernadores 29/50 · Oficialismo 48/63 · Oposición 54/32
- Política: aprobación 39 · intención de voto 40.6% · gobernabilidad 47.8 · bancas 47.5% · imagen 42.5
- Cuentas: caja 6517 · resultado 543 · financiamiento 0 · gasto corriente 60 · deuda 3000 · efectos pendientes 0

**T12** (mandato 1, año 3 T4) — PA usados: 1
- Acciones: Transparencia y anticorrupción
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Crisis en el Sistema de Salud → Asignar fondos de emergencia
- Indicadores: INFL 27.1→26.4 · ACTV 41.4→42.8 · PODA 31.4→32 · INVC 43.8→47.8 · SOLV 76→74.5 · EXTE 61.9→60.8 · PSOC 34.2→36.4 · SEGU 37.9→37.6 · CONF 49.7→53.7
- Por qué: Inversión y crédito +4.0 · Instituciones y derechos +3.4 (Transparencia y anticorrupción) · Solvencia fiscal -1.5 (las cuentas públicas) · Actividad y empleo +1.4
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 36 · Sindicatos 36/25 · Industria 61/54 · PyMEs 57/49 · Financiero 83/30 · Agro 73/42 · Gobernadores 31/50 · Oficialismo 52/58 · Oposición 56/31
- Política: aprobación 41.5 · intención de voto 42.1% · gobernabilidad 47.3 · bancas 48.5% · imagen 42.1
- Cuentas: caja 6565 · resultado 448 · financiamiento 0 · gasto corriente 60 · deuda 3000 · efectos pendientes 1

**T13** (mandato 1, año 4 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Actualizar tarifas (quita de subsidios), Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 26.4→28.9 · ACTV 42.8→38.9 · PODA 32→29.5 · INVC 47.8→42.9 · SOLV 74.5→73.8 · EXTE 60.8→64.1 · PSOC 36.4→33.5 · SEGU 37.6→37.3 · CONF 53.7→54.2
- Por qué: Inversión y crédito -4.9 (Suba de tasas / contracción monetaria) · Presión tributaria -4.0 (Bajar retenciones) · Actividad y empleo -3.9 (Ajuste del gasto público; la infraestructura ayudó a producir) · Sector externo y divisas +3.2 (Suba de tasas / contracción monetaria; Liquidación fluida de la cosecha)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 34 · Sindicatos 34/24 · Industria 59/54 · PyMEs 54/48 · Financiero 82/27 · Agro 75/41 · Gobernadores 30/49 · Oficialismo 52/58 · Oposición 57/30
- Política: aprobación 38.5 · intención de voto 40.1% · gobernabilidad 47.4 · bancas 49.5% · imagen 41.7
- Cuentas: caja 7414 · resultado 449 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 10

**T14** (mandato 1, año 4 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 28.9→24.5 · ACTV 38.9→35.8 · PODA 29.5→29.9 · INVC 42.9→44.1 · SOLV 73.8→73.1 · EXTE 64.1→69.5 · PSOC 33.5→33.4 · SEGU 37.3→36.9 · CONF 54.2→54.2
- Por qué: Sector externo y divisas +5.4 (Bajar retenciones (decisión anterior); Liquidación fluida de la cosecha) · Inflación -4.5 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Actividad y empleo -3.1 (Suba de tasas / contracción monetaria (decisión anterior); la inversión se volvió actividad) · Educación -1.3 (Paro docente; deterioro sin inversión educativa)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 33 · Sindicatos 32/23 · Industria 58/54 · PyMEs 53/48 · Financiero 83/24 · Agro 77/40 · Gobernadores 28/49 · Oficialismo 50/58 · Oposición 55/29
- Política: aprobación 37 · intención de voto 38.9% · gobernabilidad 47.1 · bancas 49.5% · imagen 41.3
- Cuentas: caja 7902 · resultado 487 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 6

**T15** (mandato 1, año 4 T3) — PA usados: 3
- Acciones: Ajuste del gasto público, Suba de tasas / contracción monetaria
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Crisis en el Sistema de Salud → Asignar fondos de emergencia
- Indicadores: INFL 24.5→21.5 · ACTV 35.8→35.6 · PODA 29.9→30.3 · INVC 44.1→39.2 · SOLV 73.1→74.1 · EXTE 69.5→75.8 · PSOC 33.4→32.5 · SEGU 36.9→36.5 · CONF 54.2→60.5
- Por qué: Sector externo y divisas +6.3 (Bajar retenciones (decisión anterior); Suba de tasas / contracción monetaria) · Inversión y crédito -4.9 (Suba de tasas / contracción monetaria; el conflicto frenó la economía) · Conflictividad social +3.3 (Ajuste del gasto público; Sindicatos: medidas de fuerza) · Protección social y salud -3.0 (Ajuste del gasto público)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 32 · Sindicatos 31/23 · Industria 56/53 · PyMEs 50/47 · Financiero 83/21 · Agro 78/40 · Gobernadores 26/48 · Oficialismo 45/58 · Oposición 52/28
- Política: aprobación 34.8 · intención de voto 37.2% · gobernabilidad 44.5 · bancas 49.5% · imagen 41
- Cuentas: caja 8140 · resultado 638 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 4

**T16** (mandato 1, año 4 T4) — PA usados: 2
- Acciones: Transparencia y anticorrupción
- Interacciones: reunion Financiero: Reunión con Financiero. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 21.5→18.2 · ACTV 35.6→33.9 · PODA 30.3→30.5 · INVC 39.2→43 · SOLV 74.1→71.4 · EXTE 75.8→73.5 · PSOC 32.5→32.4 · SEGU 36.5→36.1 · CONF 60.5→60.5
- Por qué: Inversión y crédito +3.8 (el clima de inversión) · Instituciones y derechos +3.3 (Transparencia y anticorrupción) · Inflación -3.3 (Suba de tasas / contracción monetaria (decisión anterior)) · Solvencia fiscal -2.7 (las cuentas públicas)
- Canales de poder aplicados: Liquidación fluida de la cosecha (EXTE +2.0) · Mercados abiertos: baja el riesgo país (SOLV +4.0) · Sindicatos: medidas de fuerza (CONF +2.6) · Estudiantes: tomas y marchas (CONF +2.0) · Paro docente (EDUC -1.0) · Paro docente (CONF +2.0) · Fuga de cerebros (CIEN -1.0) · Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 46 · Sectores populares 32 · Sindicatos 31/22 · Industria 56/53 · PyMEs 49/47 · Financiero 83/18 · Agro 79/39 · Gobernadores 25/48 · Oficialismo 42/52 · Oposición 51/28
- Política: aprobación 34.9 · intención de voto 37% · gobernabilidad 40 · bancas 47.5% · imagen 40.6
- Cuentas: caja 8521 · resultado -18 · financiamiento 0 · gasto corriente 0 · deuda 3000 · efectos pendientes 3

## H · Adaptable

_Lee el contexto: se reúne con los actores más tensos, atiende sus pedidos si convienen, ataca los indicadores peor ubicados y cuida la caja._ Arquetipo: politico.

Partida de muestra (semilla 1): **VICTORIA** en 32 turnos · reelección 66.2% · sucesión 68.1%.

**T1** (mandato 1, año 1 T1) — PA usados: 4
- Acciones: Régimen de incentivo a grandes inversiones, Préstamo de organismos internacionales, Incentivos a la exportación
- Interacciones: reunion Financiero: Reunión con Financiero. | encuesta Clase media: Encuesta sobre Clase media.
- Indicadores: INFL 58→55.4 · ACTV 45→44.1 · PODA 42→40.9 · INVC 40→39.9 · SOLV 45→47.3 · EXTE 38→43.9 · PSOC 45→45 · SEGU 42→41.9 · CONF 40→37.5
- Por qué: Sector externo y divisas +5.9 (Préstamo de organismos internacionales) · Inflación -2.6 (expectativas y fundamentos de la inflación) · Conflictividad social -2.5 (la calle se calma sola o la exclusión la enciende) · Solvencia fiscal +2.3 (Préstamo de organismos internacionales)
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 42 · Sindicatos 41/50 · Industria 44/50 · PyMEs 42/50 · Financiero 48/58 · Agro 43/45 · Gobernadores 41/50 · Oficialismo 38/75 · Oposición 49/40
- Política: aprobación 35.4 · intención de voto 41.7% · gobernabilidad 50.6 · bancas 46% · imagen 50.7
- Cuentas: caja 1419 · resultado -881 · financiamiento 800 · gasto corriente 970 · deuda 3800 · efectos pendientes 7
- Notas: Financiero: valoran que atendiste su reclamo.

**T2** (mandato 1, año 1 T2) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Subir retenciones a exportaciones, Actualizar tarifas (quita de subsidios)
- Interacciones: reunion Agro: Reunión con Agro.
- Indicadores: INFL 55.4→56.5 · ACTV 44.1→43.2 · PODA 40.9→36.7 · INVC 39.9→41.6 · SOLV 47.3→47.1 · EXTE 43.9→46.6 · PSOC 45→45 · SEGU 41.9→41.8 · CONF 37.5→38
- Por qué: Poder adquisitivo -4.1 (Actualizar tarifas (quita de subsidios); la inflación se comió los salarios) · Presión tributaria +4.0 (Subir retenciones a exportaciones) · Sector externo y divisas +2.7 (Incentivos a la exportación (decisión anterior)) · Inversión y crédito +1.6 (Régimen de incentivo a grandes inversiones (decisión anterior))
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 40 · Sindicatos 38/50 · Industria 43/50 · PyMEs 40/50 · Financiero 50/58 · Agro 42/45 · Gobernadores 40/50 · Oficialismo 36/75 · Oposición 49/40
- Política: aprobación 31.5 · intención de voto 39.1% · gobernabilidad 49.6 · bancas 45% · imagen 50.3
- Cuentas: caja 1863 · resultado 444 · financiamiento 0 · gasto corriente 870 · deuda 3800 · efectos pendientes 11

**T3** (mandato 1, año 1 T3) — PA usados: 4
- Acciones: Bajar retenciones, Prevención comunitaria del delito
- Interacciones: negociar Agro: La negociación con Agro fracasó. La relación se resiente. | reunion Agro: Reunión con Agro.
- Indicadores: INFL 56.5→54 · ACTV 43.2→42.5 · PODA 36.7→35.9 · INVC 41.6→43.2 · SOLV 47.1→45.2 · EXTE 46.6→45.5 · PSOC 45→44.9 · SEGU 41.8→41.6 · CONF 38→36.3
- Por qué: Inflación -2.5 (expectativas y fundamentos de la inflación) · Presión tributaria -2.0 (Bajar retenciones) · Solvencia fiscal -1.9 (las cuentas públicas) · Conflictividad social -1.7 (la calle se calma sola o la exclusión la enciende)
- Actores (satisfacción/relación): Clase media 42 · Sectores populares 39 · Sindicatos 35/50 · Industria 45/50 · PyMEs 40/50 · Financiero 51/58 · Agro 43/50 · Gobernadores 37/50 · Oficialismo 33/75 · Oposición 49/40
- Política: aprobación 30.4 · intención de voto 38.1% · gobernabilidad 49.5 · bancas 44% · imagen 50
- Cuentas: caja 1707 · resultado -156 · financiamiento 0 · gasto corriente 870 · deuda 3800 · efectos pendientes 12
- Notas: Agro: valoran que atendiste su reclamo.

**T4** (mandato 1, año 1 T4) — PA usados: 4
- Acciones: Ampliación de transferencias sociales, Incentivos a la exportación, Promoción industrial, Plan federal de viviendas
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Eventos: Sequía → Subsidios de emergencia
- Indicadores: INFL 54→51.9 · ACTV 42.5→46.5 · PODA 35.9→36.7 · INVC 43.2→44.8 · SOLV 45.2→36.3 · EXTE 45.5→50.9 · PSOC 44.9→49.5 · SEGU 41.6→42.7 · CONF 36.3→31.5
- Por qué: Solvencia fiscal -8.9 (las cuentas públicas) · Sector externo y divisas +7.4 (Bajar retenciones (decisión anterior); Régimen de incentivo a grandes inversiones (decisión anterior)) · Actividad y empleo +5.0 (Plan federal de viviendas; Promoción industrial) · Conflictividad social -4.8 (Ampliación de transferencias sociales; Prevención comunitaria del delito (decisión anterior))
- Actores (satisfacción/relación): Clase media 44 · Sectores populares 43 · Sindicatos 39/50 · Industria 49/50 · PyMEs 44/50 · Financiero 51/58 · Agro 46/56 · Gobernadores 39/50 · Oficialismo 33/75 · Oposición 49/39
- Política: aprobación 35.9 · intención de voto 41.6% · gobernabilidad 50.7 · bancas 43% · imagen 49.7
- Cuentas: caja 416 · resultado -992 · financiamiento 0 · gasto corriente 990 · deuda 3800 · efectos pendientes 13
- Notas: Org. sociales: notan la medida que pedían.

**T5** (mandato 1, año 2 T1) — PA usados: 4
- Acciones: Ajuste del gasto público, Aumento salarial a estatales, Suba del salario mínimo
- Interacciones: negociar Sindicatos: Sindicatos acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo. | reunion Sindicatos: Reunión con Sindicatos. | encuesta Clase media: Encuesta sobre Clase media.
- Indicadores: INFL 51.9→50 · ACTV 46.5→47.5 · PODA 36.7→43.3 · INVC 44.8→48.2 · SOLV 36.3→22.3 · EXTE 50.9→57.4 · PSOC 49.5→46.5 · SEGU 42.7→43.6 · CONF 31.5→31.1
- Por qué: Solvencia fiscal -14.0 (Préstamo de organismos internacionales (decisión anterior); las cuentas públicas) · Sector externo y divisas +6.6 (Incentivos a la exportación (decisión anterior); Bajar retenciones (decisión anterior)) · Poder adquisitivo +6.5 (Suba del salario mínimo; Aumento salarial a estatales) · Inversión y crédito +3.4 (Promoción industrial (decisión anterior); Régimen de incentivo a grandes inversiones (decisión anterior))
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 47 · Sindicatos 45/58 · Industria 54/49 · PyMEs 49/49 · Financiero 46/58 · Agro 50/56 · Gobernadores 42/49 · Oficialismo 40/75 · Oposición 52/38
- Política: aprobación 43.8 · intención de voto 46.8% · gobernabilidad 50.2 · bancas 41% · imagen 49.4
- Cuentas: caja 191 · resultado -325 · financiamiento -200 · gasto corriente 1020 · deuda 3800 · efectos pendientes 10
- Notas: Sindicatos: valoran que atendiste su reclamo. | Docentes: notan la medida que pedían.

**T6** (mandato 1, año 2 T2) — PA usados: 3
- Acciones: Administración tributaria (lucha contra la evasión), Actualizar tarifas (quita de subsidios), Transparencia y anticorrupción
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 50→53.1 · ACTV 47.5→48 · PODA 43.3→39.6 · INVC 48.2→47.7 · SOLV 22.3→21.4 · EXTE 57.4→60.4 · PSOC 46.5→49.7 · SEGU 43.6→44.6 · CONF 31.1→33.1
- Por qué: Poder adquisitivo -3.7 (Actualizar tarifas (quita de subsidios); la inflación se comió los salarios) · Protección social y salud +3.3 (Plan federal de viviendas (decisión anterior); Aumento salarial a estatales (decisión anterior)) · Inflación +3.2 (Actualizar tarifas (quita de subsidios); Suba del salario mínimo (decisión anterior)) · Sector externo y divisas +3.0 (Régimen de incentivo a grandes inversiones (decisión anterior); Incentivos a la exportación (decisión anterior))
- Actores (satisfacción/relación): Clase media 48 · Sectores populares 48 · Sindicatos 46/58 · Industria 56/49 · PyMEs 50/49 · Financiero 43/57 · Agro 52/56 · Gobernadores 46/49 · Oficialismo 45/69 · Oposición 58/38
- Política: aprobación 46.9 · intención de voto 48.9% · gobernabilidad 49.2 · bancas 40% · imagen 49.1
- Cuentas: caja 341 · resultado 149 · financiamiento 0 · gasto corriente 920 · deuda 3800 · efectos pendientes 9
- Notas: Aliados: notan la medida que pedían.

**T7** (mandato 1, año 2 T3) — PA usados: 4
- Acciones: Ajuste del gasto público, Ampliación de transferencias sociales, Suba de tasas / contracción monetaria, Bajar retenciones
- Interacciones: reunion Financiero: Reunión con Financiero.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 53.1→50.3 · ACTV 48→40.3 · PODA 39.6→39.9 · INVC 47.7→42.6 · SOLV 21.4→27.5 · EXTE 60.4→63.6 · PSOC 49.7→52.1 · SEGU 44.6→45.4 · CONF 33.1→29.6
- Por qué: Actividad y empleo -7.7 (Ajuste del gasto público; Administración tributaria (lucha contra la evasión) (decisión anterior)) · Solvencia fiscal +6.1 (las cuentas públicas) · Inversión y crédito -5.1 (Suba de tasas / contracción monetaria) · Conflictividad social -3.5 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 51 · Sectores populares 48 · Sindicatos 44/58 · Industria 54/48 · PyMEs 47/48 · Financiero 45/65 · Agro 56/55 · Gobernadores 44/53 · Oficialismo 48/69 · Oposición 62/37
- Política: aprobación 47.1 · intención de voto 49.9% · gobernabilidad 50.3 · bancas 40% · imagen 51.9
- Cuentas: caja -9 · resultado 1 · financiamiento 0 · gasto corriente 920 · deuda 3800 · efectos pendientes 13
- Notas: Financiero: valoran que atendiste su reclamo.

**T8** (mandato 1, año 2 T4) — PA usados: 1
- Acciones: —
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 50.3→44.6 · ACTV 40.3→37.5 · PODA 39.9→39.7 · INVC 42.6→43.5 · SOLV 27.5→30.6 · EXTE 63.6→68.2 · PSOC 52.1→53.9 · SEGU 45.4→45.2 · CONF 29.6→29.7
- Por qué: Inflación -5.8 (Suba de tasas / contracción monetaria (decisión anterior); expectativas y fundamentos de la inflación) · Sector externo y divisas +4.6 (Bajar retenciones (decisión anterior); Actualizar tarifas (quita de subsidios) (decisión anterior)) · Solvencia fiscal +3.0 (las cuentas públicas) · Actividad y empleo -2.8 (Suba de tasas / contracción monetaria (decisión anterior); la inversión se volvió actividad)
- Actores (satisfacción/relación): Clase media 53 · Sectores populares 49 · Sindicatos 42/58 · Industria 54/48 · PyMEs 46/48 · Financiero 50/65 · Agro 58/55 · Gobernadores 41/50 · Oficialismo 49/69 · Oposición 65/36
- Política: aprobación 48.8 · intención de voto 51.5% · gobernabilidad 56.9 · bancas 50.9% · imagen 54.5
- Cuentas: caja 10 · resultado -332 · financiamiento 0 · gasto corriente 930 · deuda 3800 · efectos pendientes 4

**T9** (mandato 1, año 3 T1) — PA usados: 4
- Acciones: Préstamo de organismos internacionales, Ley de economía del conocimiento, Privatización de empresas públicas
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 44.6→39.4 · ACTV 37.5→38.7 · PODA 39.7→39.7 · INVC 43.5→43.3 · SOLV 30.6→43.5 · EXTE 68.2→74.8 · PSOC 53.9→53.4 · SEGU 45.2→45.1 · CONF 29.7→32.8
- Por qué: Solvencia fiscal +13.0 (Préstamo de organismos internacionales) · Sector externo y divisas +6.6 (Préstamo de organismos internacionales; Bajar retenciones (decisión anterior)) · Inflación -5.2 (expectativas y fundamentos de la inflación; Suba de tasas / contracción monetaria (decisión anterior)) · Conflictividad social +3.1 (Privatización de empresas públicas)
- Actores (satisfacción/relación): Clase media 55 · Sectores populares 51 · Sindicatos 43/57 · Industria 54/48 · PyMEs 46/47 · Financiero 60/68 · Agro 61/54 · Gobernadores 40/50 · Oficialismo 52/69 · Oposición 65/35
- Política: aprobación 51.6 · intención de voto 53.3% · gobernabilidad 57.7 · bancas 52.9% · imagen 54
- Cuentas: caja 1445 · resultado 36 · financiamiento 1400 · gasto corriente 870 · deuda 4600 · efectos pendientes 8
- Notas: Financiero: notan la medida que pedían.

**T10** (mandato 1, año 3 T2) — PA usados: 4
- Acciones: Promoción industrial, Fortalecimiento de la justicia
- Interacciones: negociar Gobernadores: La negociación con Gobernadores fracasó. La relación se resiente. | reunion Gobernadores: Reunión con Gobernadores.
- Eventos: Crisis Energética → Tarifazos
- Indicadores: INFL 39.4→39.5 · ACTV 38.7→40.8 · PODA 39.7→37.8 · INVC 43.3→52.3 · SOLV 43.5→38.8 · EXTE 74.8→70.9 · PSOC 53.4→53 · SEGU 45.1→45 · CONF 32.8→35.1
- Por qué: Inversión y crédito +9.0 (Privatización de empresas públicas (decisión anterior); Ley de economía del conocimiento (decisión anterior)) · Solvencia fiscal -4.7 (las cuentas públicas) · Actividad y empleo +4.1 (Promoción industrial) · Sector externo y divisas -3.9 (dolarización)
- Actores (satisfacción/relación): Clase media 56 · Sectores populares 53 · Sindicatos 46/57 · Industria 58/47 · PyMEs 51/47 · Financiero 65/68 · Agro 63/53 · Gobernadores 42/47 · Oficialismo 57/67 · Oposición 66/37
- Política: aprobación 56.6 · intención de voto 56.5% · gobernabilidad 61 · bancas 58.9% · imagen 53.5
- Cuentas: caja 1105 · resultado -540 · financiamiento 0 · gasto corriente 870 · deuda 4600 · efectos pendientes 10
- Notas: Oposición: notan la medida que pedían.

**T11** (mandato 1, año 3 T3) — PA usados: 4
- Acciones: Infraestructura energética (gasoductos, redes), Lucha contra el narcotráfico
- Interacciones: reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 39.5→37.8 · ACTV 40.8→43.1 · PODA 37.8→37.1 · INVC 52.3→55 · SOLV 38.8→38.2 · EXTE 70.9→70.4 · PSOC 53→52.7 · SEGU 45→43 · CONF 35.1→34.1
- Por qué: Instituciones y derechos +3.1 (Fortalecimiento de la justicia (decisión anterior)) · Inversión y crédito +2.7 (Promoción industrial (decisión anterior)) · Actividad y empleo +2.4 (Infraestructura energética (gasoductos, redes); la inversión se volvió actividad) · Seguridad -2.0 (Lucha contra el narcotráfico)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 55 · Sectores populares 52 · Sindicatos 46/56 · Industria 61/47 · PyMEs 54/46 · Financiero 68/68 · Agro 63/52 · Gobernadores 43/47 · Oficialismo 60/64 · Oposición 69/37
- Política: aprobación 57 · intención de voto 56.8% · gobernabilidad 62.1 · bancas 59.9% · imagen 53
- Cuentas: caja 246 · resultado -659 · financiamiento 0 · gasto corriente 870 · deuda 4600 · efectos pendientes 11

**T12** (mandato 1, año 3 T4) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Subir retenciones a exportaciones, Actualizar tarifas (quita de subsidios)
- Interacciones: negociar Gobernadores: Gobernadores acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo. | reunion Gobernadores: Reunión con Gobernadores.
- Indicadores: INFL 37.8→40.3 · ACTV 43.1→46.4 · PODA 37.1→34.8 · INVC 55→54.2 · SOLV 38.2→32.3 · EXTE 70.4→69.9 · PSOC 52.7→52.4 · SEGU 43→43 · CONF 34.1→35.8
- Por qué: Solvencia fiscal -5.9 · Presión tributaria +4.0 (Subir retenciones a exportaciones) · Actividad y empleo +3.3 (Promoción industrial (decisión anterior); la inversión se volvió actividad) · Inflación +2.5 (Actualizar tarifas (quita de subsidios))
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 52 · Sectores populares 51 · Sindicatos 46/56 · Industria 61/46 · PyMEs 54/46 · Financiero 65/67 · Agro 61/52 · Gobernadores 46/47 · Oficialismo 62/62 · Oposición 71/36
- Política: aprobación 54.4 · intención de voto 55% · gobernabilidad 62.1 · bancas 60.9% · imagen 52.5
- Cuentas: caja 817 · resultado 571 · financiamiento 0 · gasto corriente 770 · deuda 4600 · efectos pendientes 14

**T13** (mandato 1, año 4 T1) — PA usados: 4
- Acciones: Régimen de incentivo a grandes inversiones, Ampliación de transferencias sociales, Aumento salarial a estatales
- Interacciones: acuerdo Gobernadores: Acuerdo con Gobernadores: te comprometés a "Infraestructura vial y de transporte" en 4 turnos. A cambio: votos en el senado y ejecución federal. | reunion Gobernadores: Reunión con Gobernadores. | encuesta Clase media: Encuesta sobre Clase media.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 40.3→40.1 · ACTV 46.4→45.8 · PODA 34.8→39.7 · INVC 54.2→53.5 · SOLV 32.3→25.4 · EXTE 69.9→66.6 · PSOC 52.4→58.3 · SEGU 43→49.4 · CONF 35.8→32.3
- Por qué: Solvencia fiscal -6.9 (Préstamo de organismos internacionales (decisión anterior)) · Seguridad +6.3 (Lucha contra el narcotráfico (decisión anterior); Fortalecimiento de la justicia (decisión anterior)) · Poder adquisitivo +4.9 (Aumento salarial a estatales; Ampliación de transferencias sociales) · Protección social y salud +4.9 (Ampliación de transferencias sociales)
- Canales de poder aplicados: Mercados abiertos: baja el riesgo país (SOLV +4.0)
- Actores (satisfacción/relación): Clase media 54 · Sectores populares 55 · Sindicatos 49/55 · Industria 60/46 · PyMEs 54/45 · Financiero 60/67 · Agro 58/51 · Gobernadores 51/57 · Oficialismo 63/60 · Oposición 72/35
- Política: aprobación 58.3 · intención de voto 58.2% · gobernabilidad 65.8 · bancas 61.9% · imagen 53.5
- Cuentas: caja -204 · resultado -472 · financiamiento -200 · gasto corriente 1040 · deuda 4600 · efectos pendientes 10
- Notas: Docentes: notan la medida que pedían. | Org. sociales: notan la medida que pedían.

**T14** (mandato 1, año 4 T2) — PA usados: 0
- Acciones: —
- Interacciones: reunion Sindicatos: Reunión con Sindicatos.
- Indicadores: INFL 40.1→39.7 · ACTV 45.8→43.8 · PODA 39.7→39.9 · INVC 53.5→54.8 · SOLV 25.4→24.5 · EXTE 66.6→69.7 · PSOC 58.3→58.9 · SEGU 49.4→52.5 · CONF 32.3→31.8
- Por qué: Seguridad +3.1 (Lucha contra el narcotráfico (decisión anterior)) · Sector externo y divisas +3.0 (Infraestructura energética (gasoductos, redes) (decisión anterior); Actualizar tarifas (quita de subsidios) (decisión anterior)) · Actividad y empleo -2.0 · Inversión y crédito +1.4 (Régimen de incentivo a grandes inversiones (decisión anterior))
- Actores (satisfacción/relación): Clase media 56 · Sectores populares 58 · Sindicatos 51/55 · Industria 59/46 · PyMEs 53/45 · Financiero 57/67 · Agro 56/50 · Gobernadores 53/57 · Oficialismo 64/58 · Oposición 73/34
- Política: aprobación 60.7 · intención de voto 59.7% · gobernabilidad 65.9 · bancas 61.9% · imagen 53
- Cuentas: caja -142 · resultado -287 · financiamiento 0 · gasto corriente 1040 · deuda 4600 · efectos pendientes 3

**T15** (mandato 1, año 4 T3) — PA usados: 2
- Acciones: Emitir dinero (forzada), Ajuste del gasto público, Suba del salario mínimo
- Interacciones: reunion Industria: Reunión con Industria.
- Indicadores: INFL 39.7→40.8 · ACTV 43.8→44.9 · PODA 39.9→44.3 · INVC 54.8→55.1 · SOLV 24.5→24.5 · EXTE 69.7→70.3 · PSOC 58.9→55.6 · SEGU 52.5→55.5 · CONF 31.8→29.8
- Por qué: Poder adquisitivo +4.4 (Suba del salario mínimo) · Protección social y salud -3.4 (Ajuste del gasto público; el desempleo presiona la red social) · Seguridad +3.0 (Lucha contra el narcotráfico (decisión anterior)) · Infraestructura +2.7 (Infraestructura energética (gasoductos, redes) (decisión anterior); Actualizar tarifas (quita de subsidios) (decisión anterior))
- Canales de poder aplicados: Contención territorial (CONF -2.0)
- Actores (satisfacción/relación): Clase media 58 · Sectores populares 60 · Sindicatos 53/58 · Industria 59/46 · PyMEs 54/44 · Financiero 55/66 · Agro 56/50 · Gobernadores 56/57 · Oficialismo 66/56 · Oposición 75/33
- Política: aprobación 63.8 · intención de voto 61.8% · gobernabilidad 67.6 · bancas 63.9% · imagen 52.6
- Cuentas: caja 459 · resultado 351 · financiamiento 250 · gasto corriente 960 · deuda 4600 · efectos pendientes 3
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada). | Sindicatos: notan la medida que pedían.

**T16** (mandato 1, año 4 T4) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Actualizar tarifas (quita de subsidios), Reducción de impuestos
- Interacciones: negociar Industria: La negociación con Industria fracasó. La relación se resiente. | reunion Industria: Reunión con Industria.
- Eventos: Oportunidad de Coalición → Aceptar la coalición
- Indicadores: INFL 40.8→44.8 · ACTV 44.9→45.3 · PODA 44.3→42.5 · INVC 55.1→56.4 · SOLV 24.5→25.2 · EXTE 70.3→73 · PSOC 55.6→55.3 · SEGU 55.5→55.2 · CONF 29.8→30.6
- Por qué: Inflación +4.0 (Actualizar tarifas (quita de subsidios); Suba del salario mínimo (decisión anterior)) · Sector externo y divisas +2.7 (Infraestructura energética (gasoductos, redes) (decisión anterior); Régimen de incentivo a grandes inversiones (decisión anterior)) · Poder adquisitivo -1.7 (Actualizar tarifas (quita de subsidios)) · Inversión y crédito +1.2 (Régimen de incentivo a grandes inversiones (decisión anterior))
- Canales de poder aplicados: Contención territorial (CONF -2.0)
- Actores (satisfacción/relación): Clase media 58 · Sectores populares 59 · Sindicatos 53/58 · Industria 59/51 · PyMEs 54/47 · Financiero 54/66 · Agro 56/49 · Gobernadores 58/37 · Oficialismo 67/51 · Oposición 75/33
- Política: aprobación 62.7 · intención de voto 60.5% · gobernabilidad 69.5 · bancas 67.9% · imagen 52.2
- Cuentas: caja 832 · resultado 373 · financiamiento 0 · gasto corriente 860 · deuda 4600 · efectos pendientes 9
- Notas: Incumpliste el acuerdo con Gobernadores (Infraestructura vial y de transporte): la relación se rompe y tu palabra vale menos. | Industria: valoran que atendiste su reclamo. | PyMEs: notan la medida que pedían.

**T17** (mandato 2, año 1 T1) — PA usados: 4
- Acciones: Ampliación de transferencias sociales, Préstamo de organismos internacionales, Lucha contra el narcotráfico
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. El gesto de apertura mejora un poco la relación. | encuesta Clase media: Encuesta sobre Clase media.
- Indicadores: INFL 44.8→41.4 · ACTV 45.3→43.1 · PODA 42.5→43.7 · INVC 56.4→61.5 · SOLV 25.2→37.4 · EXTE 73→81.3 · PSOC 55.3→59.5 · SEGU 55.2→53 · CONF 30.6→27.8
- Por qué: Solvencia fiscal +12.2 (Préstamo de organismos internacionales) · Sector externo y divisas +8.3 (Préstamo de organismos internacionales; Infraestructura energética (gasoductos, redes) (decisión anterior)) · Inversión y crédito +5.1 (Reducción de impuestos (decisión anterior); Régimen de incentivo a grandes inversiones (decisión anterior)) · Protección social y salud +4.2 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 59 · Sectores populares 59 · Sindicatos 54/58 · Industria 63/51 · PyMEs 56/46 · Financiero 62/68 · Agro 60/48 · Gobernadores 57/39 · Oficialismo 67/51 · Oposición 76/32
- Política: aprobación 65.7 · intención de voto 62.4% · gobernabilidad 70.4 · bancas 69.9% · imagen 51.8
- Cuentas: caja 924 · resultado -708 · financiamiento 800 · gasto corriente 980 · deuda 5400 · efectos pendientes 7
- Notas: Financiero: notan la medida que pedían.

**T18** (mandato 2, año 1 T2) — PA usados: 4
- Acciones: Ajuste del gasto público, Aumento salarial a estatales, Ley de protección ambiental, Plan de conectividad
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 41.4→38.8 · ACTV 43.1→44.5 · PODA 43.7→46.5 · INVC 61.5→60.5 · SOLV 37.4→30.4 · EXTE 81.3→82.6 · PSOC 59.5→57.1 · SEGU 53→52.7 · CONF 27.8→28.3
- Por qué: Solvencia fiscal -7.0 (las cuentas públicas) · Protección social y salud -3.4 (Ajuste del gasto público; el desempleo presiona la red social) · Ambiente y recursos naturales +3.0 (Ley de protección ambiental) · Poder adquisitivo +2.9 (Aumento salarial a estatales)
- Actores (satisfacción/relación): Clase media 61 · Sectores populares 60 · Sindicatos 56/60 · Industria 65/51 · PyMEs 59/46 · Financiero 65/68 · Agro 63/48 · Gobernadores 57/40 · Oficialismo 69/51 · Oposición 76/31
- Política: aprobación 68.8 · intención de voto 65.2% · gobernabilidad 70.5 · bancas 69.9% · imagen 54.4
- Cuentas: caja 95 · resultado -479 · financiamiento 0 · gasto corriente 1010 · deuda 5400 · efectos pendientes 13
- Notas: Sindicatos: notan la medida que pedían. | Ambientalistas: notan la medida que pedían.

**T19** (mandato 2, año 1 T3) — PA usados: 0
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 38.8→36.8 · ACTV 44.5→42.9 · PODA 46.5→46.3 · INVC 60.5→59.6 · SOLV 30.4→27.1 · EXTE 82.6→82.6 · PSOC 57.1→57.5 · SEGU 52.7→57.4 · CONF 28.3→28.7
- Por qué: Seguridad +4.6 (Lucha contra el narcotráfico (decisión anterior)) · Solvencia fiscal -3.3 (las cuentas públicas) · Inflación -2.0 (expectativas y fundamentos de la inflación) · Actividad y empleo -1.6 (Ley de protección ambiental (decisión anterior))
- Actores (satisfacción/relación): Clase media 63 · Sectores populares 61 · Sindicatos 57/60 · Industria 65/51 · PyMEs 59/45 · Financiero 64/68 · Agro 64/47 · Gobernadores 56/37 · Oficialismo 71/51 · Oposición 77/30
- Política: aprobación 70.6 · intención de voto 66.2% · gobernabilidad 70.4 · bancas 69.9% · imagen 53.8
- Cuentas: caja 104 · resultado -341 · financiamiento 0 · gasto corriente 1010 · deuda 5400 · efectos pendientes 8

**T20** (mandato 2, año 1 T4) — PA usados: 4
- Acciones: Subir retenciones a exportaciones, Actualizar tarifas (quita de subsidios), Reforma educativa
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 36.8→39.6 · ACTV 42.9→45.4 · PODA 46.3→44.5 · INVC 59.6→58.5 · SOLV 27.1→23.8 · EXTE 82.6→79.6 · PSOC 57.5→57.2 · SEGU 57.4→60 · CONF 28.7→36.6
- Por qué: Conflictividad social +7.8 (Reforma educativa; Actualizar tarifas (quita de subsidios)) · Presión tributaria +4.0 (Subir retenciones a exportaciones) · Solvencia fiscal -3.3 · Sector externo y divisas -3.1 (dolarización; Ley de protección ambiental (decisión anterior))
- Actores (satisfacción/relación): Clase media 61 · Sectores populares 62 · Sindicatos 57/59 · Industria 62/50 · PyMEs 56/45 · Financiero 59/67 · Agro 61/46 · Gobernadores 58/34 · Oficialismo 72/51 · Oposición 75/29
- Política: aprobación 69.2 · intención de voto 64.8% · gobernabilidad 65.9 · bancas 66.9% · imagen 53.4
- Cuentas: caja 607 · resultado 503 · financiamiento 0 · gasto corriente 910 · deuda 5400 · efectos pendientes 8

**T21** (mandato 2, año 2 T1) — PA usados: 4
- Acciones: Ampliación de transferencias sociales, Aumento salarial a estatales, Ley de economía del conocimiento
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media.
- Eventos: Sequía → Subsidios de emergencia
- Indicadores: INFL 39.6→39.5 · ACTV 45.4→47.1 · PODA 44.5→48.7 · INVC 58.5→57.5 · SOLV 23.8→18.2 · EXTE 79.6→72.8 · PSOC 57.2→61.4 · SEGU 60→62.6 · CONF 36.6→32.2
- Por qué: Solvencia fiscal -5.7 (Préstamo de organismos internacionales (decisión anterior)) · Sector externo y divisas -4.8 (Subir retenciones a exportaciones (decisión anterior); dolarización) · Conflictividad social -4.3 (Ampliación de transferencias sociales; la calle se calma sola o la exclusión la enciende) · Protección social y salud +4.3 (Ampliación de transferencias sociales)
- Actores (satisfacción/relación): Clase media 63 · Sectores populares 65 · Sindicatos 60/59 · Industria 60/50 · PyMEs 57/44 · Financiero 53/67 · Agro 57/51 · Gobernadores 60/31 · Oficialismo 73/50 · Oposición 74/29
- Política: aprobación 71.6 · intención de voto 66.3% · gobernabilidad 67.1 · bancas 66.9% · imagen 52.9
- Cuentas: caja -318 · resultado -426 · financiamiento -200 · gasto corriente 1200 · deuda 5400 · efectos pendientes 8

**T22** (mandato 2, año 2 T2) — PA usados: 0
- Acciones: Emitir dinero (forzada)
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 39.5→41.5 · ACTV 47.1→51.2 · PODA 48.7→48.8 · INVC 57.5→58.4 · SOLV 18.2→19.6 · EXTE 72.8→72.4 · PSOC 61.4→61.9 · SEGU 62.6→62.3 · CONF 32.2→31.7
- Por qué: Actividad y empleo +4.1 (Emitir dinero; la inversión se volvió actividad) · Inflación +2.0 (Emitir dinero) · Ciencia e innovación +1.8 (Ley de economía del conocimiento (decisión anterior)) · Educación +1.7 (Reforma educativa (decisión anterior); Aumento salarial a estatales (decisión anterior))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 63 · Sectores populares 67 · Sindicatos 63/58 · Industria 60/49 · PyMEs 57/44 · Financiero 49/66 · Agro 53/51 · Gobernadores 62/28 · Oficialismo 75/50 · Oposición 74/28
- Política: aprobación 73.3 · intención de voto 67.3% · gobernabilidad 64.2 · bancas 66.9% · imagen 52.4
- Cuentas: caja -67 · resultado -299 · financiamiento 250 · gasto corriente 1200 · deuda 5400 · efectos pendientes 1
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T23** (mandato 2, año 2 T3) — PA usados: 1
- Acciones: Emitir dinero (forzada), Ajuste del gasto público
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 41.5→43 · ACTV 51.2→50.1 · PODA 48.8→48.8 · INVC 58.4→57.4 · SOLV 19.6→19.1 · EXTE 72.4→71.8 · PSOC 61.9→58.5 · SEGU 62.3→62 · CONF 31.7→31.2
- Por qué: Protección social y salud -3.4 (Ajuste del gasto público; el desempleo presiona la red social) · Inflación +1.5 (Emitir dinero) · Actividad y empleo -1.1 (Ajuste del gasto público) · Inversión y crédito -1.0 (el clima de inversión)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 62 · Sectores populares 66 · Sindicatos 63/57 · Industria 58/49 · PyMEs 57/43 · Financiero 46/66 · Agro 51/50 · Gobernadores 63/25 · Oficialismo 75/50 · Oposición 74/27
- Política: aprobación 72.1 · intención de voto 66.3% · gobernabilidad 63.9 · bancas 66.9% · imagen 52
- Cuentas: caja 495 · resultado 312 · financiamiento 250 · gasto corriente 1080 · deuda 5400 · efectos pendientes 1
- Notas: Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).

**T24** (mandato 2, año 2 T4) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Actualizar tarifas (quita de subsidios), Reducción de impuestos, Bajar retenciones
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Default Selectivo de Deuda → Default técnico
- Indicadores: INFL 43→46 · ACTV 50.1→46.9 · PODA 48.8→46.8 · INVC 57.4→56.6 · SOLV 19.1→0 · EXTE 71.8→67.3 · PSOC 58.5→58.1 · SEGU 62→61.6 · CONF 31.2→33.2
- Por qué: Presión tributaria -4.0 (Bajar retenciones) · Actividad y empleo -3.2 · Inflación +3.0 (Actualizar tarifas (quita de subsidios)) · Poder adquisitivo -2.0 (Actualizar tarifas (quita de subsidios))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 61 · Sectores populares 63 · Sindicatos 59/57 · Industria 56/52 · PyMEs 55/46 · Financiero 42/51 · Agro 51/52 · Gobernadores 62/22 · Oficialismo 72/50 · Oposición 72/26
- Política: aprobación 68.7 · intención de voto 63.5% · gobernabilidad 63.7 · bancas 68.7% · imagen 50.6
- Cuentas: caja 876 · resultado 181 · financiamiento 0 · gasto corriente 980 · deuda 4600 · efectos pendientes 12
- Notas: Industria: notan la medida que pedían. | Agro: notan la medida que pedían. | PyMEs: notan la medida que pedían.

**T25** (mandato 2, año 3 T1) — PA usados: 4
- Acciones: Préstamo de organismos internacionales, Régimen de incentivo a grandes inversiones, Plan de conectividad
- Interacciones: reunion Financiero: Reunión con Financiero. | encuesta Clase media: Encuesta sobre Clase media.
- Indicadores: INFL 46→44.1 · ACTV 46.9→45.8 · PODA 46.8→46.6 · INVC 56.6→59.3 · SOLV 0→21.4 · EXTE 67.3→77.2 · PSOC 58.1→57.7 · SEGU 61.6→61.2 · CONF 33.2→32.4
- Por qué: Solvencia fiscal +21.4 (Préstamo de organismos internacionales; las cuentas públicas) · Sector externo y divisas +9.9 (Préstamo de organismos internacionales; Bajar retenciones (decisión anterior)) · Presión tributaria -4.0 (Reducción de impuestos (decisión anterior)) · Inversión y crédito +2.7 (Reducción de impuestos (decisión anterior))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 60 · Sectores populares 61 · Sindicatos 56/56 · Industria 58/51 · PyMEs 56/45 · Financiero 44/59 · Agro 55/52 · Gobernadores 58/22 · Oficialismo 69/50 · Oposición 68/25
- Política: aprobación 67.4 · intención de voto 62.3% · gobernabilidad 64 · bancas 68.7% · imagen 50.3
- Cuentas: caja 1109 · resultado -367 · financiamiento 800 · gasto corriente 980 · deuda 5400 · efectos pendientes 14
- Notas: Financiero: valoran que atendiste su reclamo.

**T26** (mandato 2, año 3 T2) — PA usados: 4
- Acciones: Ajuste del gasto público, Fortalecimiento de la justicia
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 44.1→42.1 · ACTV 45.8→47.1 · PODA 46.6→46.6 · INVC 59.3→60.4 · SOLV 21.4→22.6 · EXTE 77.2→79.8 · PSOC 57.7→54.4 · SEGU 61.2→60.7 · CONF 32.4→31.8
- Por qué: Protección social y salud -3.3 (Ajuste del gasto público) · Sector externo y divisas +2.6 (Bajar retenciones (decisión anterior); Actualizar tarifas (quita de subsidios) (decisión anterior)) · Inflación -2.0 (expectativas y fundamentos de la inflación) · Actividad y empleo +1.3 (Reducción de impuestos (decisión anterior); Bajar retenciones (decisión anterior))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 60 · Sectores populares 59 · Sindicatos 55/56 · Industria 60/51 · PyMEs 57/45 · Financiero 47/59 · Agro 58/51 · Gobernadores 56/19 · Oficialismo 66/47 · Oposición 65/28
- Política: aprobación 66.7 · intención de voto 61.5% · gobernabilidad 66.4 · bancas 72.7% · imagen 50
- Cuentas: caja 1116 · resultado 7 · financiamiento 0 · gasto corriente 860 · deuda 5400 · efectos pendientes 11
- Notas: Oposición: notan la medida que pedían.

**T27** (mandato 2, año 3 T3) — PA usados: 4
- Acciones: Ampliación de transferencias sociales, Lucha contra el narcotráfico
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Ola de Calor Extrema → Declarar emergencia
- Indicadores: INFL 42.1→39.8 · ACTV 47.1→49.2 · PODA 46.6→48 · INVC 60.4→61.6 · SOLV 22.6→30.7 · EXTE 79.8→77.9 · PSOC 54.4→60.3 · SEGU 60.7→58.4 · CONF 31.8→28.4
- Por qué: Solvencia fiscal +8.1 · Protección social y salud +4.8 (Ampliación de transferencias sociales) · Conflictividad social -3.4 (Ampliación de transferencias sociales) · Instituciones y derechos +3.0 (Fortalecimiento de la justicia (decisión anterior))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 62 · Sectores populares 61 · Sindicatos 57/55 · Industria 63/50 · PyMEs 60/44 · Financiero 54/59 · Agro 60/50 · Gobernadores 57/16 · Oficialismo 66/45 · Oposición 66/27
- Política: aprobación 71.1 · intención de voto 64.2% · gobernabilidad 67.7 · bancas 72.7% · imagen 49.7
- Cuentas: caja 319 · resultado -648 · financiamiento 0 · gasto corriente 980 · deuda 5400 · efectos pendientes 9

**T28** (mandato 2, año 3 T4) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Subir retenciones a exportaciones, Actualizar tarifas (quita de subsidios)
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 39.8→41.8 · ACTV 49.2→53.1 · PODA 48→46.6 · INVC 61.6→62.5 · SOLV 30.7→25.9 · EXTE 77.9→78 · PSOC 60.3→59.8 · SEGU 58.4→58.3 · CONF 28.4→31
- Por qué: Solvencia fiscal -4.8 · Presión tributaria +4.0 (Subir retenciones a exportaciones) · Actividad y empleo +3.9 (la inversión se volvió actividad) · Conflictividad social +2.7 (Actualizar tarifas (quita de subsidios))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 60 · Sectores populares 62 · Sindicatos 59/54 · Industria 63/50 · PyMEs 61/44 · Financiero 55/59 · Agro 59/50 · Gobernadores 59/13 · Oficialismo 68/43 · Oposición 68/26
- Política: aprobación 72.2 · intención de voto 64.7% · gobernabilidad 67 · bancas 72.7% · imagen 48.6
- Cuentas: caja 826 · resultado 357 · financiamiento 0 · gasto corriente 900 · deuda 5400 · efectos pendientes 10

**T29** (mandato 2, año 4 T1) — PA usados: 4
- Acciones: Aumento salarial a estatales, Ley de protección ambiental, Plan de conectividad
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar. | encuesta Clase media: Encuesta sobre Clase media.
- Indicadores: INFL 41.8→41.2 · ACTV 53.1→52.8 · PODA 46.6→50 · INVC 62.5→63.4 · SOLV 25.9→14.9 · EXTE 78→75.3 · PSOC 59.8→59.4 · SEGU 58.3→64.3 · CONF 31→30.8
- Por qué: Solvencia fiscal -11.0 (Préstamo de organismos internacionales (decisión anterior); las cuentas públicas) · Seguridad +6.0 (Lucha contra el narcotráfico (decisión anterior); Fortalecimiento de la justicia (decisión anterior)) · Poder adquisitivo +3.4 (Aumento salarial a estatales) · Ambiente y recursos naturales +3.1 (Ley de protección ambiental)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 62 · Sectores populares 64 · Sindicatos 61/54 · Industria 63/50 · PyMEs 61/43 · Financiero 50/58 · Agro 56/49 · Gobernadores 61/10 · Oficialismo 70/41 · Oposición 70/25
- Política: aprobación 74.1 · intención de voto 65.8% · gobernabilidad 67.1 · bancas 72.7% · imagen 48.4
- Cuentas: caja 6 · resultado -620 · financiamiento -200 · gasto corriente 1050 · deuda 5400 · efectos pendientes 12
- Notas: Docentes: notan la medida que pedían. | Ambientalistas: notan la medida que pedían.

**T30** (mandato 2, año 4 T2) — PA usados: 3
- Acciones: Ajuste del gasto público, Bajar retenciones
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Eventos: Inundación → Ayuda inmediata
- Indicadores: INFL 41.2→40.3 · ACTV 52.8→49.7 · PODA 50→49.9 · INVC 63.4→62.5 · SOLV 14.9→20 · EXTE 75.3→76.7 · PSOC 59.4→58.1 · SEGU 64.3→67.1 · CONF 30.8→30.6
- Por qué: Solvencia fiscal +5.1 (las cuentas públicas) · Presión tributaria -4.0 (Bajar retenciones) · Actividad y empleo -3.1 (Ajuste del gasto público; Ley de protección ambiental (decisión anterior)) · Seguridad +2.7 (Lucha contra el narcotráfico (decisión anterior))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 63 · Sectores populares 64 · Sindicatos 60/53 · Industria 62/49 · PyMEs 61/43 · Financiero 50/58 · Agro 57/48 · Gobernadores 61/11 · Oficialismo 70/39 · Oposición 72/24
- Política: aprobación 75.2 · intención de voto 67.3% · gobernabilidad 67.2 · bancas 72.7% · imagen 51.1
- Cuentas: caja 2 · resultado 347 · financiamiento 0 · gasto corriente 930 · deuda 5400 · efectos pendientes 9

**T31** (mandato 2, año 4 T3) — PA usados: 1
- Acciones: —
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 40.3→39.1 · ACTV 49.7→49.4 · PODA 49.9→49.9 · INVC 62.5→61.7 · SOLV 20→18.8 · EXTE 76.7→81 · PSOC 58.1→57.7 · SEGU 67.1→69.7 · CONF 30.6→30.4
- Por qué: Sector externo y divisas +4.2 (Bajar retenciones (decisión anterior); Régimen de incentivo a grandes inversiones (decisión anterior)) · Infraestructura +2.7 (Plan de conectividad (decisión anterior); Actualizar tarifas (quita de subsidios) (decisión anterior)) · Seguridad +2.7 (Lucha contra el narcotráfico (decisión anterior)) · Inflación -1.2 (expectativas y fundamentos de la inflación)
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 65 · Sectores populares 64 · Sindicatos 60/53 · Industria 63/49 · PyMEs 61/42 · Financiero 51/57 · Agro 59/47 · Gobernadores 61/8 · Oficialismo 71/36 · Oposición 73/24
- Política: aprobación 76.3 · intención de voto 67.8% · gobernabilidad 68.1 · bancas 74.7% · imagen 50.8
- Cuentas: caja 147 · resultado -205 · financiamiento 0 · gasto corriente 930 · deuda 5400 · efectos pendientes 5

**T32** (mandato 2, año 4 T4) — PA usados: 4
- Acciones: Administración tributaria (lucha contra la evasión), Actualizar tarifas (quita de subsidios), Ajuste del gasto público
- Interacciones: reunion Gobernadores: Reunión con Gobernadores. Otra reunión sin avances: empiezan a desconfiar.
- Indicadores: INFL 39.1→41.3 · ACTV 49.4→51.4 · PODA 49.9→48.3 · INVC 61.7→61 · SOLV 18.8→26.9 · EXTE 81→81.6 · PSOC 57.7→54.4 · SEGU 69.7→69.1 · CONF 30.4→32.6
- Por qué: Solvencia fiscal +8.1 (las cuentas públicas) · Protección social y salud -3.3 (Ajuste del gasto público) · Inflación +2.2 (Actualizar tarifas (quita de subsidios)) · Conflictividad social +2.1 (Actualizar tarifas (quita de subsidios))
- Canales de poder aplicados: Interpelaciones en el Congreso (GOB -3.0)
- Actores (satisfacción/relación): Clase media 64 · Sectores populares 63 · Sindicatos 58/52 · Industria 62/48 · PyMEs 60/42 · Financiero 55/57 · Agro 59/47 · Gobernadores 61/5 · Oficialismo 71/34 · Oposición 73/23
- Política: aprobación 74.7 · intención de voto 66.6% · gobernabilidad 67.4 · bancas 74.7% · imagen 50.4
- Cuentas: caja 829 · resultado 682 · financiamiento 0 · gasto corriente 730 · deuda 5400 · efectos pendientes 6
