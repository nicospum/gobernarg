# Cierre de GobernArg Light — 2026-10-27

Base: `version-a-lite` en `55d0e617e80fde82119b60296e08d31ed76323ee`. Trabajo: `codex/gobernarg-light-cierre-2026-10-27`. Checkout independiente: `C:\Users\User\Desktop\spum\Gobernar ACTIVO\Light`. Aplicación: `project-bolt-sb1-dzgqso GobernArg 21-11/project`.

## Cambios y motivos

- Se recuperan Fácil y los escenarios existentes Corralito/País en llamas. Normal sigue seleccionado al iniciar; los históricos están plegados y requieren una/dos reelecciones. El progreso existente sigue contando. Se retira el control heredado “Desbloquear todos” que siempre rechazaba la acción del jugador. El atajo de pruebas de `localStorage` sigue siendo compatible.
- La vista permanece simple: siete indicadores cualitativos, hasta tres efectos por acción y actores sin cifras. No vuelven gabinete, habilidades activas, cuaderno, plataforma, paneles extensos ni modo detallado.
- La tarjeta dice “Agregar al turno”: seleccionarla no ejecuta políticas. El aviso real de repetición aparece también en vista simple. Se retira la graduación de riesgo que se infería de palabras del texto; “Ayuda” abre una explicación concreta con mouse, teclado o tacto, y Esc devuelve el foco sin seleccionar la política.
- Los efectos cualitativos conservan primero un beneficio y una contrapartida reales, incluso si corresponden a indicadores fuera de la franja simple. Ejemplo: protección ambiental muestra ambiente favorable y empleo desfavorable. Se distinguen deterioro inmediato y mejora demorada del mismo indicador; no se agregan reglas ni se prometen resultados netos.
- “Efectos en espera” recuerda hasta dos decisiones anteriores con efectos todavía no iniciados, agrupando la agenda real por política y turno de origen. No muestra efectos inventados de la selección, fórmulas ni demandas ocultas. Marca condiciones cuando corresponden. Desaparece al completarse la espera; no sustituye los resultados del turno.
- Las tarjetas separan “Costo inicial” de los compromisos fiscales conocidos: gasto fijo permanente, pagos de caja futuros/recurrentes, pérdida de recaudación base y deuda con intereses. Se conserva duración/comienzo y se identifican condiciones/repetición, sin mostrar una tabla de indicadores futuros. Salarios suma $150 M de gasto fijo por turno; congelar tarifas cuesta $80 M por turno durante cuatro trimestres desde el siguiente. El helper `actionCommitments.ts` es idéntico en Light y Full y recibe el descuento de préstamo del perfil.
- El plan declara “Caja estimada al cierre” y muestra su límite sin depender de hover. La advertencia de emisión es condicional. Se corrige un error concreto de la estimación: ahora usa `debtService` como el cierre fiscal, respetando la suspensión de intereses de Corralito y su vencimiento. También se alinea el principal de deuda de la estimación con el descuento que ya aplica la ejecución, y se evita anticipar recaudación/presión tributaria programadas para cierres posteriores. Las reglas del motor, costos, demoras, balance y cálculo electoral no se modifican.
- Las reuniones conservan su función: revelan demandas, permiten agregar una respuesta al turno y habilitan negociación. Se mejora el contraste del reclamo/acuerdo sobre papel claro y se agrega una orientación breve; no se revelan demandas antes del contacto.
- Identificación pública y formulario: GobernArg Light. Las claves se conservan: `gobernarg.lite.partida` y `gobernarg.lite.progress.v1`.

## Secuencias observadas

Antes: Normal → inversión educativa → cerrar. El resumen mostraba obras/gobernabilidad y el dinero, sin recordar la inversión pendiente; el botón “Ejecutar” solo había armado la agenda.

Después, escritorio (1440×1000): Normal por defecto → abrir históricos con Enter → Corralito bloqueado permanece sin seleccionar → comenzar → reunión con Docentes revela un pedido → agregar/cancelar ese pedido → abrir Ayuda de inversión educativa con Enter y cerrar con Esc → agregar/cancelar con Enter → elegir inversión educativa + estudio de factibilidad → cerrar. El resumen recuerda la inversión en espera y la factibilidad abre obras existentes en el turno siguiente. Recarga y “Continuar” preservan el turno 2 y la agenda pendiente.

Después, móvil (390×844, tacto): Fácil → inversión educativa, ayuda, selección/cancelación y cierre → resumen compacto con espera → recarga y continuación en turno 2. Sin errores de página/consola ni desbordamiento horizontal. Capturas y JSON están en el registro local de verificación del cierre.

Son secuencias cortas observadas, no una prueba de diversión universal. Los bots recorren partidas completas y cierres de los cinco escenarios; la revisión integral en navegador y el aislamiento de ediciones se consolidan en el informe del coordinador.

## Bugs y validación

| Problema | Reproducción / corrección | Prioridad |
|---|---|---|
| Repetición omitida en simple | Emitir dos veces y volver a elegir: ahora muestra el costo adicional real | P2 |
| Botón prometía ejecutar | Seleccionar una tarjeta solo arma agenda: verbo corregido y cancelación preservada | P2 |
| Beneficio ambiental omitido | Ley ambiental mostraba únicamente empleo negativo: conserva beneficio y tensión | P1 |
| Costos futuros conocidos ocultos | Tarjetas solo mostraban caja inicial: compromisos visibles con duración y condiciones | P2 |
| Estimación anticipaba ingresos o usaba deuda nominal | Se limita al cierre actual y se compara con principal descontado realmente ejecutado | P2 |
| Estimación fiscal sobreprometía y restaba intereses suspendidos | Plan/Corralito: límite visible, advertencia condicional y fuente fiscal común | P2 |
| Inversión diferida sin continuidad visible | Cierre de inversión educativa: pendiente recordado desde la agenda guardada | P2 |

Verificaciones desde la ruta final: lint sin errores (tres advertencias previas de Fast Refresh); TypeScript correcto; 188 pruebas en 26 archivos; build correcto; playtest completo correcto (dos pruebas de reporte/matriz que incluyen cinco escenarios). Como la estimación fiscal guía a los bots, se ejecutó además `npm run playtest:ideologia`: 30 semillas × cinco bots × cinco escenarios, 750 partidas, ejecución correcta (una prueba, 80,6 s). No se cambiaron reglas, balance, semillas ni assertions. Se agregaron quince regresiones enfocadas y se actualizaron expectativas de opciones/rótulos recuperados, sin rebajar assertions del motor.

Limitación de balance abierta: el estudio final da brechas G2c−G1c de 0 pp en Fácil y Normal, +23 pp en Herencia pesada, −57 pp en Corralito y −73 pp en País en llamas. Supera la meta histórica de menos de 15 pp en tres escenarios; el runner mide esa meta pero no la impone con una assertion. Por eso el PASS técnico no certifica balance ideológico. El reporte versionado de partida ya mostraba +33/−30 pp en Herencia pesada/Corralito y no equivale a una nueva corrida de control; no permite atribuir causalidad aislada a estos cambios. Se conserva la evidencia y no se amplía el cierre con un rebalanceo.

La revisión React mantuvo componentes declarados fuera de render, estado mínimo, derivación pura de pendientes, claves estables y botones de ayuda con foco/cierre/restauración. No se agregaron dependencias ni servicios al juego.

Los 15 outputs generados de cada ejecución del playtest se preservaron con SHA-256 en el directorio local `_cierre2026/checks/final/Light/artifacts` y, tras el ajuste de estimación, en su subdirectorio `fiscal-checks/artifacts` del workspace de coordinación; los 13 archivos rastreados generados volvieron a HEAD y los dos nuevos se movieron allí. No se incluyeron miles de líneas de simulación en el commit del producto. El playtest completo se repitió tras corregir la información fiscal usada por los bots; ambos archivos/pruebas pasaron. Las tarjetas de salarios y tarifas se verificaron nuevamente a 1440 y 390 px, con costos visibles sin abrir Ayuda, sin errores ni desbordamiento. Evidencia local: `_cierre2026/checks/light-costs`; logs de esta revisión: `_cierre2026/checks/final/Light/fiscal-checks`. `IDEOLOGIA.md` y `ideologia.json` finales se preservaron aparte en `fiscal-checks/ideologia-artifacts` antes de restaurar sus versiones rastreadas.

Publicación y mapeo definitivo de Netlify: los registra el coordinador. Este trabajo no hace push ni publica por su cuenta. B y B Light no se modificaron.

## Ejecución

Desde la carpeta de aplicación indicada: `npm ci`, `npm run dev`; comprobaciones: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run playtest`. Node 22 según Netlify; usar el lockfile existente. El directorio de salida es `dist`.
