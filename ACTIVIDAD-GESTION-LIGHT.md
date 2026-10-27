# Actividad de gestión Light

El motor toma los PA reales disponibles y restantes justo antes del cierre. Cuenta políticas seleccionadas e interacciones pagas. Reuniones gratis, encuestas, acuerdos y emisiones forzadas no inventan PA gastados. Cancelar una selección devuelve los PA. Una suspensión cuenta como esfuerzo y no genera otro castigo, pero impide el premio por ejecución completa.

## Presión y recuperación

Sin usar ningún PA se suma 1 de presión, incluso si un paro dejó menos de 4 disponibles. Con 3 PA libres y al menos 1 usado se suma 0,25; con 2 libres se suma 0,1. Dejar 0 o 1 libre no suma desgaste y recupera 1 punto acumulado, hasta cero. Sin PA disponibles no se penaliza. No hay recompensa por turno por gastar todo.

La resta de gobernabilidad es `min(100; 0,25 × min(P;3) + 16 × max(0;P−3))`. Primero se limita la base del país a 0–100 y luego se descuenta la presión, para que un bonus sobre 100 no oculte el desgaste. En inacción total, presión 1/2/3 resta 0,25/0,50/0,75; presión 4 resta 16,75; presión 5 resta 32,75. La imagen pierde 0,5 veces el incremento de presión del cierre. La caída usa la regla de crisis existente, sin cambiar su umbral.

El tracker se actualiza una vez antes del cálculo político y los contadores de crisis. Los recálculos por eventos o elecciones conservan la presión. Al terminar por derrota se cierran las decisiones pendientes; no se pueden seleccionar acciones ni avanzar el motor. El registro explica el cambio mediante `record.managementActivity`; la interfaz muestra una sola explicación en el resumen.

## Premio y partidas anteriores

Sólo el último cierre de un mandato completo observado, con todos sus PA ejecutados y sin suspensiones, concede +2 de imagen una vez: como máximo +0,5 puntos de IV por su peso actual. No cambia umbrales electorales. Un cierre con 1 PA libre evita desgaste, pero no cumple la condición del premio.

Los guardados sin tracker comienzan con presión cero y sin inventar uso pasado de PA. Un historial incompleto no cobra el premio. El siguiente mandato reinicia la observación y conserva la presión acumulada. Los datos nuevos son opcionales y se validan al importar, incluidos límites coherentes con los turnos transcurridos. Se conservan las claves de almacenamiento y los calendarios de 12 y 16 turnos. La regla corre en Fácil, Normal y Argentina; los históricos mantienen sus reglas anteriores y no reciben el tracker.

## Calibración

Antes del cambio, con semillas 1–10 y los cuatro arquetipos, las 120 partidas Light de 12 turnos sin acciones llegaron al final del primer mandato. Las 40 de Fácil se reeligieron y 25 ganaron el final T24. Con la regla nueva, las 120 cayeron antes del fin: Fácil T7, Normal T7 y Argentina T6. Las 120 legacy de 16 turnos cayeron en T6–7. El motivo fue juicio político del motor existente.

La comparación pareada de 2.400 partidas usa los mismos perfiles, niveles, calendarios y semillas, gastando 0/1/2/3/4 PA mediante reuniones reales. Usar 1 o 2 PA no produjo caídas antes del primer fin de mandato; dejar 1 libre conserva presión cero. La inacción parcial sostenida puede acumular consecuencias en el segundo mandato. Son pruebas de la regla de recursos, no estrategias económicas recomendadas.

El bot adaptable se comparó sin modificar contra el motor `30173e3` en 360 partidas: 30 semillas × 3 niveles × 2 calendarios × 2 brazos. Las tasas finales fueron idénticas: Light de 12 turnos, Fácil 30/30, Normal 21/30 y Argentina 18/30; legacy de 16 turnos, 30/30 en cada nivel. No se recalibraron bots, benchmark, escenarios ni coeficientes fiscales. Evidencias completas fuera del checkout: `_cierre2026/checks/idle-baseline/Light/{baseline,final-candidate,adaptive-comparison}.json`; checks generales en `_cierre2026/checks/management/Light` del workspace de coordinación.
