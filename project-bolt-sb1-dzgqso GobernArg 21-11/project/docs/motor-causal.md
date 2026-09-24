# Motor causal de GobernArg

Implementación del modelo propuesto el 24 de septiembre de 2026. Los números son parámetros de balance del juego, no estimaciones económicas reales.

## Ejecutar y verificar

Desde `project-bolt-sb1-dzgqso GobernArg 21-11/project`:

```powershell
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

`src/App.tsx` carga `src/CausalApp.tsx`. El tablero activo está en `src/components/causal`; la simulación está en `src/causal`. Los módulos y pruebas del motor anterior se conservan como referencia. Gabinete, habilidades, perfiles, eventos, elecciones y legado están integrados en el motor causal mediante `campaign.ts`, `campaignCatalog.ts` y `campaignTypes.ts`. El detalle de lo recuperado y sus reglas está en [Recuperación del juego](recuperacion-juego.md).

## Datos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `catalog.ts` | 14 indicadores, 18 actores, 65 sensibilidades, 45 políticas y 3 interacciones parametrizadas; 161 efectos |
| `legacyMapping.ts` | Correspondencia y motivo de transformación de las 61 acciones originales |
| `types.ts` | Contratos serializables de estado, efectos, acuerdos, deuda y comandos |
| `engine.ts` | Validación, ejecución atómica, captura de condiciones, cierre de turno y trazabilidad |
| `selectors.ts` | Consultas, ventanas de repetición, satisfacción objetivo, canales, eficacia y apoyo legislativo |
| `interactions.ts` | Reunión, oferta, firma, cumplimiento, vencimiento y canales de los actores |
| `finance.ts` | Caja, devengamiento, vencimientos, pagos parciales, atrasos y proyección |
| `persistence.ts` | Guardado versionado y reconstrucción validada mediante comandos |

El catálogo es TypeScript estático. No se necesita Excel para ejecutar el juego. La propuesta de referencia está en `outputs/01a0d1bd-60d1-79b1-8954-0a332096c136/GobernArg_Motor_Causal_Propuesta_2026-09-24.xlsx`, desde la raíz del repositorio.

## Resolución temporal

El jugador dispone de 4 puntos de acción base por trimestre, más las ventajas del perfil y los asesores activos. Al confirmar se validan requisitos, caja, agenda, intervalos y límites de uso; se debitan los costos y se acreditan préstamos o emisión. Se registra un identificador de ejecución único. Los indicadores conservan el resultado del último cierre mientras se toman decisiones.

Las magnitudes condicionales, la eficacia y la repetición se capturan al ejecutar. La emisión consulta una ventana de 5 turnos que incluye el uso actual. Un beneficio temporal modifica el nivel visible durante su intervalo, sin acumularse como una mejora permanente cada cierre.

El cierre resuelve, en este orden:

1. Ingresos, gasto recurrente, intereses, amortizaciones y obligaciones impagas.
2. Efectos programados y relaciones rezagadas entre indicadores, usando los canales de actores del cierre anterior.
3. Límites de cambio, indicadores base y modificadores temporales, con un desglose que reconcilia cada variación.
4. Satisfacción de actores según sus sensibilidades, con inercia de 0,35 hacia su valoración objetivo.
5. Cumplimiento de acuerdos y relación política; canales de conflicto o cooperación para el turno siguiente.
6. Componente social, crisis contextuales, objetivos, condiciones de derrota, calendario electoral y eventos.
7. Informe del turno y renovación de agenda según el gabinete activo.

Los turnos son globales. Al completar 16 se muestra el balance y se puede competir por la reelección o retirarse. Ganar conserva préstamos, atrasos, acuerdos, estudios, efectos, gabinete, historial y ventanas de repetición. La carrera termina al completar el segundo mandato. Las elecciones legislativas renuevan la mitad del Congreso al cierre de los turnos 8 y 24.

## Interacciones y gobernabilidad

Reunirse consume recursos y revela prioridades durante 4 turnos; no entrega satisfacción ni relación. Negociar genera una oferta con vencimiento. Firmar registra un objetivo y un plazo, sin puntos gratuitos.

Los compromisos materiales requieren alcanzar el objetivo y ejecutar una política pertinente después de firmar. Una política anterior a la firma no basta, aunque sea del mismo turno. Cumplir mejora la relación una sola vez; incumplir aplica una pérdida una sola vez. La satisfacción siempre sigue los indicadores.

Los acuerdos parlamentarios y federales son específicos de una ley u obra y requieren una nueva consulta posterior a la firma. Los acuerdos de precios y reperfilamiento habilitan provisionalmente la política necesaria para cumplirlos. Precios exige las firmas de industria y PyMEs. Reperfilar exige elegir el contrato concreto.

La oposición puede negociar desde su relación inicial. Sus acuerdos contribuyen a esa ley sin convertirse en apoyo electoral al gobierno. Los actores políticos no se suman al componente electoral social. Los canales usan umbrales de entrada y salida distintos y necesitan dos cierres adversos para iniciar conflicto.

## Caja y deuda

Emisión y principal recibido son financiación: no aumentan el resultado fiscal. Cada préstamo registra principal, interés, fecha de vencimiento y saldo pendiente. Los intereses comienzan el turno posterior al desembolso y se cobran también al vencer. El principal impago permanece pendiente y continúa devengando intereses sobre su saldo.

La prioridad de pagos es gasto básico, intereses, programas y principal. La caja no se vuelve negativa: los saldos impagos pasan a atrasos y restringen gasto discrecional. La proyección conserva la actividad actual y utiliza las mismas reglas de pagos; una cifra negativa expresa la necesidad de financiación después de considerar atrasos.

Se resolvieron dos bloqueos al trasladar el diseño a código: los atrasos permiten negociar un reperfilamiento aunque el margen fiscal esté limitado por la crisis; y un vencimiento ya pasado se difiere desde el mayor entre su fecha original y el turno actual. Reperfilar conserva el principal y aumenta el interés un 25% desde el siguiente turno.

## Guardado y compatibilidad

Se guarda automáticamente en `localStorage`, clave `gobernarg.causal.v1`. El guardado contiene la creación de partida y los comandos aceptados, junto con versiones de esquema y modelo. Al cargar se validan y reproducen: no se confía en indicadores arbitrarios de un snapshot externo. Comandos duplicados o de otro turno son rechazados sin consumir recursos.

No se convierten automáticamente partidas del motor anterior. Sus campos no representan el mismo modelo. El guardado causal usa una clave independiente. Si falla el almacenamiento, la interfaz avisa. Reiniciar reemplaza la partida causal después de la confirmación del jugador.

Las partidas del primer motor **causal** sí se actualizan: se reconstruyen sus decisiones con las reglas originales y se activa la campaña desde un límite de historial guardado en `campaignStart`. Así se conservan su caja, deuda y compromisos. Los guardados nuevos incluyen `campaignVersion: 1`; la reconstrucción de eventos usa una secuencia aleatoria determinista.

## Elecciones y contenido recuperado

El componente social es una media ponderada de satisfacción de actores sociales. La proyección electoral combina 75% de resultados sociales, 15% de organización política y 10% de cumplimiento de compromisos, más comunicación temporal, desgaste, dificultad y la ventaja de incumbencia del perfil político. Se gana con 45%. La fórmula es una decisión de balance del juego, visible en el panel electoral y ajustable; no representa una encuesta real.

Los cuatro perfiles tienen ventajas y ocho habilidades. Siete asesores aportan capacidad de acción y especialización. Los 24 eventos tienen decisiones ilustradas, costos y consecuencias causales; cada uno ofrece una salida sin desembolso. Los efectos materiales pasan por indicadores y los contactos políticos explícitos pueden cambiar relaciones. La comunicación afecta la proyección electoral durante un plazo, sin comprar satisfacción material. Se recuperaron también objetivos, derrotas, legado, noticias, calendario, cuaderno, obras, recomendaciones, ejes y dificultad.

## Validación

`src/__tests__/causalEngine.test.ts` cubre catálogo y correspondencia, atomicidad, repetición, duraciones, condiciones, estudios, trazabilidad, acuerdos, apoyo legislativo, canales, deuda, atrasos, proyección, continuidad y guardado.

`src/__tests__/causalCampaign.test.ts` cubre gabinete, salarios, activación y capacitación, ventajas, habilidades, eventos y sus condiciones, elecciones, estrategias, objetivos, las cinco derrotas, límite de mandatos, carreras completas y migración determinista de guardados.

Los cinco escenarios numéricos de referencia se comprueban a 10 turnos: emisión reiterada, obra vial, salarios, préstamo externo y seguridad con deterioro de derechos. También se verificó en navegador la creación de partida, la vista previa y ejecución, reunión → negociación → firma, cierre de trimestre y recuperación al recargar.
