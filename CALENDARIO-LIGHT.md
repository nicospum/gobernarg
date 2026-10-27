# Calendario Light

Las partidas estándar nuevas tienen cuatro años de tres cuatrimestres: 12 decisiones por mandato. Las legislativas se celebran al cerrar T6; la reelección al cerrar T12; la sucesión y el legado al cerrar T24. El segundo mandato conserva el turno absoluto continuo (empieza en T13).

## Tiempo del motor

`src/lib/calendar.ts` centraliza las unidades y las elecciones. Los lapsos del catálogo trimestral se convierten sólo al crear efectos, cooldowns y ventanas: `round(n × 3 / 4)`, mínimo un período; cero sigue siendo cero. Ejemplos: 3→2, 4→3, 6→5, 8→6 y 16→12. Se incluyen demoras ambientales, duración de acuerdos, frescura de reuniones/encuestas, vigencia de demandas, canales, eventos y estrategias. El redondeo deja dos períodos cuando un único período eliminaría la oportunidad de responder.

Los conteos mínimos de repetición, umbrales electorales, magnitudes por cierre, gasto fijo, deuda, tasas, fórmulas fiscales y reglas de crisis conservan sus valores. No hay ajuste fiscal de Herencia pesada. `PERM`, 99 y los centinelas de duración indefinida conservan su significado. Una duración anual de cuatro pagos pasa a tres pagos; no se multiplica cada pago por 4/3. No se recalibraron programas ni políticas de bots.

## Partidas anteriores

La marca persistida es `causal.calendar`: `light-12` o `legacy-16`. Su ausencia significa legacy. Un guardado v1 se valida y recibe sólo esa marca: sigue con cuatro trimestres/año, legislativas T8, reelección T16 y sucesión T32. No se truncan ni remapean turnos, agenda, condiciones, ejecuciones o deudas. Los escenarios históricos conservan siempre sus datos y reglas de calendario16; la interfaz bloquea iniciar otros, pero permite continuar partidas antiguas.

Los exports nuevos son v2 con `edition: "Light"`. El parser es puro: valida calendario, fechas, números finitos y estructuras anidadas antes de entregar datos. Rechaza otra edición, JSON incompleto o corrupto y un histórico marcado12. No modifica localStorage, progreso ni secuencias de notificaciones; la rehidratación ocurre sólo al aplicar un estado validado. La clave sigue siendo `gobernarg.lite.partida`. Los exports v1 sin edición se aceptan sólo si cumplen el esquema Light anterior; señales de gabinete/plataforma Full se rechazan.

## Verificación

Las regresiones cubren ambos calendarios, fechas electorales, ventanas y duraciones, pagos diferidos una vez por cierre, gasto fijo sin cambio, partida adaptativa completa de24 y legacy32. Guardados: ida y vuelta tras cada cierre real, elecciones y fin de partida; lectura de v1 en el cuarto trimestre con agenda intacta y continuación fiscal idéntica; eventos pendientes completos; rechazo de JSON inválido y de la edición Full sin sobrescribir almacenamiento. Las pruebas generales, build y playtests se registran fuera del checkout en `_cierre2026/checks/calendar/Light` del workspace de coordinación.
