# Actividad de gestión en Full

Regla autorizada para los tres escenarios habilitados: País en calma, Herencia pesada y País en llamas. Full conserva 16 trimestres por mandato. Los históricos guardados continúan con sus reglas anteriores; no se cambian sus datos ni su acceso. No se modifican parámetros de escenarios, elecciones, bots ni protocolo de benchmark.

## Consumo y desgaste

El cierre toma `baseActions - actions` antes de reiniciar recursos. Cuenta PA efectivamente consumidos o reservados por políticas, habilidades, reuniones y negociaciones pagas. Cancelar una política devuelve sus PA. Una suspensión judicial conserva el esfuerzo reservado, pero impide el premio. La emisión forzada no consume PA del jugador. Encuestas, acuerdos, reuniones gratuitas y contratación de asesores mantienen su costo actual de cero PA; no fabrican PA gastados.

| PA sin usar | Condición | Presión que suma | Imagen del cierre |
| --- | --- | ---: | ---: |
| 0 o 1 | Hubo actividad | recupera 1, hasta cero | 0 |
| 2 | Hubo actividad | 0,10 | −0,05 |
| 3 | Hubo actividad | 0,25 | −0,125 |
| Todos | Ningún PA usado, incluso con capacidad reducida por paro | 1 | −0,5 |

Con cero PA disponibles no hay desgaste. La presión se acumula y se puede recuperar: `P' = max(0, P - 1)` cuando sobran como máximo un PA; en los otros casos suma el peso de la tabla. Se redondea a nueve decimales para evitar ruido numérico.

El descuento persistente de gobernabilidad es `min(100; 0,25 × min(P';3) + 16 × max(0;P'−3))`, aplicado sobre la GOB base ya acotada entre 0 y 100. Después de cuatro cierres completamente ociosos descuenta 16,75 puntos; dos o tres PA sobrantes acumulan mucho menos. El descuento se conserva cuando un evento, habilidad o reunión recalcula la política. No se agrega una derrota artificial: la crisis sigue usando el umbral y la racha de juicio político existentes.

La presión se actualiza una vez en T.10, antes de recalcular GOB, IV y la racha de crisis. Un cierre bloqueado por estrategia pendiente no la incrementa. Si la caída coincide con legislativas o elección, se limpian sus pendientes para que el fin de partida tenga prioridad.

## Premio de fin de mandato

Sólo el último cierre concede +2 de imagen, equivalente a **hasta +0,5 puntos porcentuales de IV** por su peso existente de 25%. Requiere todos los PA disponibles usados en cada uno de los 16 cierres observados, sin políticas suspendidas, sin huecos y sin premio anterior. No hay premio por turno ni cambio de fórmula electoral. El aumento se acota al rango normal de imagen; cerca de 100 puede ser menor.

El seguimiento registra mandato, cantidad de cierres observados, uso perfecto y premio ya concedido. Al cambiar de mandato reinicia elegibilidad e historial y conserva la presión que se hereda. La marca de concesión impide duplicar el premio al guardar y cargar.

## Compatibilidad y evidencia

Los campos `causal.managementActivity` y `record.managementActivity` son opcionales. Un guardado anterior arranca sin desgaste retroactivo. Si se abre a mitad del mandato, no se inventa un historial perfecto. El validador rechaza presión negativa o fuera de la duración máxima, conteos fraccionarios/inconsistentes y tipos corruptos antes de importar.

`closeTurn` sólo actualiza el seguimiento al recibir explícitamente `activityBudget`; `processEndTurn` lo entrega en los tres escenarios habilitados con el presupuesto real y `mandateTurns:16`. Los consumidores de bajo nivel sin presupuesto conservan su comportamiento, incluidos los ensayos existentes.

Regresiones nuevas: umbrales y recuperación; cero uso con capacidad3; premio final, único y de mandato completo; guardado antiguo; suspensión y emisión forzada; habilidades/reuniones pagas; cancelación, encuestas y asesores; persistencia del descuento al recalcular; históricos sin regla; caída antes del fin de Fácil; prioridad de crisis en legislativas; importación de datos corruptos. El fixture de calendario de `fase2` realiza ahora reuniones pagas para aislar su objetivo y no caer por inactividad.

Verificación técnica: 35 archivos y 394 pruebas PASS; typecheck y build PASS; lint sin errores y con siete advertencias de Fast Refresh ya existentes. Playtest y control de ideología se ejecutan una vez sin modificar bots, escenarios ni benchmark. Logs y artefactos: `_cierre2026/checks/actividad/Full` en el workspace administrativo.

QA de integración del responsable: navegador Full Fácil sin acciones cae en T7; presión1/2/3 leve y4 fuerte; recarga mantiene presión3; sin errores de JavaScript ni desbordamiento.
