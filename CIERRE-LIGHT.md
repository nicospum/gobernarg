# Cierre de GobernArg Light — 2026-10-27

Base: `version-a-lite` en `55d0e617e80fde82119b60296e08d31ed76323ee`. Trabajo: `codex/gobernarg-light-cierre-2026-10-27`. Checkout independiente: `C:\Users\User\Desktop\spum\Gobernar ACTIVO\Light`. Aplicación: `project-bolt-sb1-dzgqso GobernArg 21-11/project`.

## Cambios y motivos

- Se recuperan Fácil y los escenarios existentes Corralito/País en llamas. Normal sigue seleccionado al iniciar; los históricos están plegados y requieren una/dos reelecciones. El progreso existente sigue contando. Se retira el control heredado “Desbloquear todos” que siempre rechazaba la acción del jugador. El atajo de pruebas de `localStorage` sigue siendo compatible.
- La vista permanece simple: siete indicadores cualitativos, hasta tres efectos por acción y actores sin cifras. No vuelven gabinete, habilidades activas, cuaderno, plataforma, paneles extensos ni modo detallado.
- La tarjeta dice “Agregar al turno”: seleccionarla no ejecuta políticas. El aviso real de repetición aparece también en vista simple. Se retira la graduación de riesgo que se infería de palabras del texto; “Ayuda” abre una explicación concreta con mouse, teclado o tacto, y Esc devuelve el foco sin seleccionar la política.
- Los efectos cualitativos conservan primero un beneficio y una contrapartida reales, incluso si corresponden a indicadores fuera de la franja simple. Ejemplo: protección ambiental muestra ambiente favorable y empleo desfavorable. Se distinguen deterioro inmediato y mejora demorada del mismo indicador; no se agregan reglas ni se prometen resultados netos.
- “Efectos en espera” recuerda hasta dos decisiones anteriores con efectos todavía no iniciados, agrupando la agenda real por política y turno de origen. No muestra efectos inventados de la selección, fórmulas ni demandas ocultas. Marca condiciones cuando corresponden. Desaparece al completarse la espera; no sustituye los resultados del turno.
- El plan declara “Caja estimada al cierre” y muestra su límite sin depender de hover. La advertencia de emisión es condicional. Se corrige un error concreto de la estimación: ahora usa `debtService` como el cierre fiscal, respetando la suspensión de intereses de Corralito y su vencimiento. Las reglas del motor, costos, demoras, balance y cálculo electoral no se modifican.
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
| Estimación fiscal sobreprometía y restaba intereses suspendidos | Plan/Corralito: límite visible, advertencia condicional y fuente fiscal común | P2 |
| Inversión diferida sin continuidad visible | Cierre de inversión educativa: pendiente recordado desde la agenda guardada | P2 |

Verificaciones desde la ruta final: lint sin errores (tres advertencias previas de Fast Refresh); TypeScript correcto; 180 pruebas en 25 archivos; build correcto; playtest completo correcto (dos pruebas de reporte/matriz que incluyen cinco escenarios). No se modificaron reglas o balance, por lo que no fue necesario repetir el estudio ideológico para este cambio. Se agregaron siete regresiones enfocadas y se actualizaron expectativas de opciones/rótulos recuperados, sin rebajar assertions del motor.

La revisión React mantuvo componentes declarados fuera de render, estado mínimo, derivación pura de pendientes, claves estables y botones de ayuda con foco/cierre/restauración. No se agregaron dependencias ni servicios al juego.

Los 15 outputs generados del playtest se preservaron con SHA-256 en el directorio local `_cierre2026/checks/final/Light/artifacts` del workspace de coordinación; los 13 archivos rastreados generados volvieron a HEAD y los dos nuevos se movieron allí. No se incluyeron miles de líneas de simulación en el commit del producto.

Publicación y mapeo definitivo de Netlify: los registra el coordinador. Este trabajo no hace push ni publica por su cuenta. B y B Light no se modificaron.

## Ejecución

Desde la carpeta de aplicación indicada: `npm ci`, `npm run dev`; comprobaciones: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run playtest`. Node 22 según Netlify; usar el lockfile existente. El directorio de salida es `dist`.
