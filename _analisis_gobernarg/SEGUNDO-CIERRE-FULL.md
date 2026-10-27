# Full: asesores, lectura progresiva y persistencia

Entrega posterior al cierre 78c1519. Full conserva 16 trimestres por mandato, con posible segundo mandato. No se cambiaron parámetros ni fórmulas electorales, los escenarios ni el protocolo de benchmark.

## Contratación y sueldos

| Asesor | Contratación, una vez | Sueldo por trimestre | Aporte causal conservado |
| --- | ---: | ---: | --- |
| Carlos Méndez · Economía | $100 M | $20 M | Economía/impuestos +20% eficacia, descuento de PA, negociación y expectativas de inflación |
| María González · Comunicación | $50 M | $10 M | Encuestas gratis, información del electorado y amortiguación de eventos sobre imagen |
| Roberto Silva · Infraestructura | $100 M | $20 M | Obras +20% eficacia, −10% costo, descuento de PA y negociación federal |
| Ana Martínez · Social | $50 M | $10 M | Programas +20% eficacia, descuento de PA y negociación social/sindical |
| Jorge Ramírez · Exterior | $100 M | $20 M | Exterior/producción +15% eficacia, deuda inmediata −15%, PA y negociación |
| Patricia Sánchez · Seguridad | $50 M | $10 M | Seguridad +25% eficacia, descuento de PA y mitigación de daño institucional |
| Miguel Torres · Educación | $50 M | $10 M | Educación/ciencia/cultura +20% eficacia, descuento de PA y negociación |
| Charly Abad · Salud integral | $100 M | $20 M | Salud +20% eficacia, −15% costo, descuento de PA y negociación amplia |

Los dos niveles separan apoyo sectorial/informativo de especialistas con descuentos fiscales, crédito o aportes combinados. La nómina equivale al 20% de la contratación por trimestre. Se mantienen los cambios iniciales de imagen existentes (−2, +3, +1, +3, +2, +2, +2, +2); no se agregaron premios directos de votos ni de satisfacción de actores.

El menú muestra contratación exacta y sueldo trimestral juntos. Se retiraron estrellas/niveles decorativos y se corrigió la promesa de que un asesor garantiza hospitales o resultados. Los efectos se comprobaron en computePerks, eficacia real, costos/PA, encuesta, contratación y despido. Los asesores ya contratados no vuelven a ofrecerse.

Las partidas anteriores migran sueldos una sola vez mediante advisorSalaryVersion: se reemplaza la nómina antigua por la nueva en gastoCorr, sin alterar gastos ajenos ni devolver contratos históricos. Despedir luego no deja gasto fantasma.

## Tarjetas e inicio

La nota estratégica se muestra directamente en los turnos absolutos 1, 2 y 3. Después sigue disponible desde el icono de información por hover, foco, click y tacto. No reaparece en el segundo mandato. Costos, requisitos y compromisos fiscales permanecen visibles. Las columnas usan alturas intrínsecas, mantienen el orden del documento y se reducen a una columna en móvil.

Preparativos filtra cuatro acciones existentes (estudio, agenda internacional, recaudación y justicia), sin nuevas reglas. Hay un aviso discreto de margen fiscal y acceso al Cuaderno cuando vencen acuerdos conocidos. La elección explica que una reelección abre otros 16 trimestres con el mismo país y una sucesión al final.

Corralito y País en llamas quedan deshabilitados para iniciar, incluso con reelecciones o unlockAll previos. Sus datos, motor, simulaciones y progreso siguen intactos; una partida histórica ya guardada puede continuarse. El bloqueo es de acceso de producto y no altera los escenarios.

## Guardado y respaldo

La clave existente de Full se conserva. Los nuevos sobres son v2 con edition Full; los v1 de Full siguen admitidos. La importación rechaza explícitamente Light, valida árbol JSON acotado, cronología, estructuras anidadas y eventos/opciones/efectos antes de pedir confirmación. El parseo es puro; rehidratación, secuencia de notificaciones y migración de nómina se ejecutan sólo al cargar o confirmar.

Si guardar falla, aparece un aviso persistente con Reintentar guardado y Descargar respaldo; no hay avisos de éxito repetidos por turno. El guardado principal anterior se conserva si falla la escritura. Se guarda además una copia automática anterior cuando hay espacio y se comunica su recuperación. Restaurar un archivo desde la portada requiere confirmación antes de reemplazar la partida. No se eliminan progreso ni claves de Light.

Los controles y resultados finales se registran en _cierre2026/checks/segunda/Full. La QA integrada de root recorrió 32 turnos, legado y móvil, y comprobó asesores, notas, históricos y persistencia sin errores ni desbordes.

## Resultados de cierre

Lint PASS (0 errores y 7 advertencias preexistentes), typecheck PASS, 33 archivos / 357 tests PASS, build PASS, playtest PASS (2 suites) e ideología PASS (1 suite). Las pruebas incluyen costos y efectos reales de los ocho asesores, nómina antigua/despido, notas en turnos1/3/4/17, históricos bloqueados con99reelecciones, sobres Full/Light aislados, respaldo/recuperación/reintento y corrupciones anidadas que antes podían romper React. El parser acepta todo el registro real de eventos y cierres reales, sin adelantar secuencias al validar.

Se conservaron los reportes generados con hashes antes de restaurar únicamente esos outputs al HEAD. Las pruebas de benchmark mantuvieron sus bots, semillas, reglas y escenarios; contratar asesores más baratos puede cambiar las decisiones y resultados de los bots, como consecuencia del precio autorizado.
