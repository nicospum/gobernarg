# Recuperación del juego sobre el motor causal

Actualizado el 24/09/2026. La recuperación mantiene los indicadores, actores, deuda, acuerdos y efectos temporales del nuevo motor. Las funciones vuelven a estar disponibles durante la partida; sus reglas se adaptaron para no restaurar las contradicciones del sistema anterior.

## Funciones recuperadas

| Función | Implementación actual |
| --- | --- |
| Asesores | Siete personajes con retratos, especialidades, niveles, contratación, despido, capacitación, inactividad, salarios, acciones adicionales y eficacia. Dos cargos y una operación de gabinete por turno. |
| Habilidades | Las ocho: Discurso Patriótico, Pacto de Gobernabilidad, Inversión Privada, Llamado a Inversores, Movilización Social, Paro Controlado, Campaña Mediática y Gira de Medios. Costos, intervalos y requisitos visibles. |
| Perfiles | Reuniones gratuitas, descuento económico, mayor capacidad de deuda, acción adicional, resistencia a eventos y ventaja de reelección, según el perfil. |
| Presidenciales | Candidatura, cálculo de voto, victoria o derrota y resultado ilustrado. Reelección una vez; conserva las obligaciones y el equipo. |
| Medio término | Elecciones en T8 de cada mandato. Renuevan la mitad de las 100 bancas y modifican el apoyo a las leyes. |
| Estrategias | Acelerar, Negociar, Abrirse y Jugada Audaz con costos y efectos distintos. La elección de estrategia es obligatoria tras las legislativas. |
| Límite de mandatos | Dos mandatos de 16 trimestres; no se habilita una tercera gestión. |
| Objetivos | Tres metas con progreso, cumplimiento y aporte extraordinario registrado en el cierre siguiente. |
| Derrotas | Pérdida de apoyo, insolvencia sostenida, juicio político, ruptura institucional y colapso inflacionario; con avisos antes de la finalización. |
| Legado | Pantalla ilustrada con evaluación, fortalezas, desafíos, objetivos, caja, deuda, trayectoria electoral e informes. |
| Eventos | 18 eventos generales y seis posteriores a las legislativas, con imágenes, opciones y consecuencias. Las crisis específicas requieren contexto; todos ofrecen una respuesta sin costo. |
| Calendario | Sesiones, informes, campañas, legislativas, estrategia y presidenciales; muestra mandato y dificultad. |
| Noticias | Importancia, lectura y descarte; informes, decisiones, hitos y alertas de continuidad. |
| Cuaderno | Objetivos, compromisos, obras, efectos programados y decisiones recientes en una ventana. |
| Obras | Estudios vigentes, inicio, entrega, progreso y estado de operación derivados de las fechas reales del motor. |
| Recomendaciones | Prioridades por indicadores bajos, bonificaciones de eficacia y advertencias de efectos adversos. |
| Panel electoral | Proyección, umbral, riesgo, desglose de cálculo y sectores satisfechos/descontentos. |
| Ejes | Conciliador–Radical, Populista–Técnico y Cerrado–Convocante, con efectos en eficacia, estudios e interacciones. |
| Dificultad | Aprendiz, Normal, Difícil y Leyenda; modifican ingresos, frecuencia de eventos y exigencia electoral. |
| Avatar | Vuelve a mostrarse en la cabecera durante la gestión. |
| Identidad visual | Paleta azul, acentos dorados y celestes, imágenes presidenciales, retratos, ilustraciones y colores e iconos propios por categoría. Diseño adaptable a móvil. |

## Reglas adaptadas

La satisfacción depende de condiciones materiales. Las habilidades comunicacionales aportan a la proyección electoral durante tres turnos; no mejoran automáticamente los indicadores ni la satisfacción. Los eventos económicos y sociales generan efectos que se aplican al cierre, con trazabilidad. Las decisiones de diálogo explícito pueden afectar la relación política. Ninguna opción de evento elimina principal o atrasos.

Cada asesor cobra 10 U por nivel y trimestre, incluso durante capacitación. Se activa el turno posterior a la contratación. La capacitación cuesta 50 U por el nuevo nivel, consume una acción y suspende las bonificaciones hasta dos turnos después. Los niveles llegan a cinco; la bonificación conjunta de especialización se limita al 15%. Despedir o suspender a un asesor retira su capacidad adicional pendiente en ese mismo turno.

El empresario obtiene 10% de descuento inicial en políticas económicas y 500 U adicionales de capacidad de deuda; no recibe dinero por el mero paso del tiempo. El sindicalista gana una acción y reuniones gratuitas con sindicatos y organizaciones sociales. El político tiene reuniones gratuitas con aliados y retiene 5% del margen electoral restante en su primera reelección. El comunicador reduce 30% los efectos materiales adversos de los eventos.

La fórmula electoral utiliza 75% de satisfacción social, 15% de organización política y 10% de cumplimiento. Agrega comunicación, desgaste y dificultad; el político tiene su ventaja de incumbencia en presidenciales. Las legislativas excluyen esa ventaja. El umbral de victoria es 45%. Se muestra la fórmula en el juego. Es un balance jugable provisional, independiente del dinero en caja y de la satisfacción de la oposición; puede calibrarse después con partidas reales.

Las derrotas usan resultados sostenidos en lugar de contadores arbitrarios de acciones:

- Aprobación material menor a 25 durante dos cierres.
- Atrasos superiores a 600 U durante tres cierres.
- Legitimidad menor a 20 y garantías menores a 25 durante dos cierres.
- Estabilidad menor a 15 y relación con el oficialismo menor a 25 durante tres cierres.
- Inflación de al menos 95 e ingreso real menor a 20 durante dos cierres.

Los objetivos son servicios (educación, salud y protección en 60), cumplimiento de tres acuerdos, y ejecución de tres obras distintas con infraestructura en 55. Sus aportes son 120, 100 y 150 U, una sola vez por objetivo. La victoria final exige completar ambos mandatos, los tres objetivos y mantener al menos 45% de respaldo; de otro modo se presenta el legado de la carrera completada.

## Guardado y alcance

Las partidas causales anteriores se reconstruyen antes de activar estas funciones, manteniendo decisiones, caja, deuda, estudios y acuerdos. El límite de activación queda registrado para reproducirlas de forma determinista. Se recuperó también un formato intermedio generado por la recarga de desarrollo. Los guardados del motor original, previo al causal, siguen separados porque representan reglas distintas.

No quedan módulos de esta lista pendientes de conectar al juego. La restauración funcional está completa; el balance fino de costos, probabilidades y fórmula electoral puede ajustarse con pruebas de jugadores. No es una restauración literal de valores antiguos: los cambios deliberados están detallados arriba.

## Verificación

Pruebas automáticas del motor original, causal y campaña: 299 pruebas. Incluyen partidas completas, las cinco derrotas, elecciones, deuda entre mandatos, migración, repetición de comandos, costos y plazos. También se verifican TypeScript, ESLint de los archivos integrados y compilación de producción.

La verificación en navegador cubre guardado anterior, contratación, habilidad, activación del asesor, cuaderno, cierre, recarga, eventos, elecciones y diseño adaptable. Las imágenes se reutilizan desde los recursos locales del juego.
