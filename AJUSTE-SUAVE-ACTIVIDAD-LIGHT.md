# Ajuste suave del uso de acciones — Light

Se reduce el desgaste por uso parcial a los pesos probados: con capacidad de cuatro acciones, usar una agrega 0,05 de presión y usar dos agrega 0,025. Dejar sólo una libre no agrega desgaste. Usar tres o cuatro conserva la recuperación de un punto de presión por cierre. La pérdida directa de imagen sigue siendo la mitad del peso: 0,025 o 0,0125 por turno parcial.

No usar ninguna acción conserva el peso 1, el castigo leve de los tres primeros cierres y la escalada desde el cuarto. Los históricos siguen excluidos. Un mandato observado completo usando todas las acciones conserva el premio único de dos puntos de imagen, hasta 0,5 puntos directos de intención de voto al cierre; no hay premio periódico ni garantía de victoria.

En doce cierres usando una acción por turno, la presión pasa de 3 a 0,6. En dos mandatos de Light llega a 1,2 y descuenta 0,3 de gobernabilidad; en los 32 cierres del calendario heredado llega a 1,6 y descuenta 0,4. Esos importes aíslan la regla y no incluyen las consecuencias reales de las políticas ni los eventos.

Los nuevos trackers llevan versión 2. Al reanudar o importar un guardado anterior se recalcula sólo la presión demostrable por su sufijo de registros contiguos y coherentes. Se conservan la presión del prefijo desconocido, los registros originales, imagen, voto, bonus y resultados pasados. Sólo si baja la presión se actualizan gobernabilidad y su espejo de estabilidad; se limpia una racha de crisis en curso si la gobernabilidad vuelve al umbral saludable. No se reviven partidas terminadas. La operación es idempotente y no modifica el objeto recibido.

Validación técnica y playtests: `_cierre2026/checks/actividad-suave/Light` de la carpeta anfitriona de la tarea. La evidencia pública, matrices y entrega final se registran por separado al publicar ambas ediciones. Calendarios, escenarios y restantes fórmulas se conservan.
