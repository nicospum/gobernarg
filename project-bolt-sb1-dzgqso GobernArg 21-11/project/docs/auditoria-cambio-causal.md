# Auditoría del cambio al motor causal

> Documento histórico de la primera migración, anterior a la recuperación solicitada. Las ausencias que se describen abajo fueron abordadas posteriormente. Consultar [Recuperación del juego](recuperacion-juego.md) para el estado actual y las diferencias de reglas.

Comparación del árbol de trabajo con la versión anterior de Git, realizada el 24/09/2026. Describe lo que efectivamente ejecuta la aplicación, no solamente lo que figura en la propuesta.

## Qué pasó con la interfaz

Se sustituyó la composición anterior de `src/App.tsx` por `CausalApp`, que monta un tablero nuevo (`components/causal/CausalDashboard.tsx`). Los componentes visuales anteriores siguen en el repositorio, pero dejaron de montarse. No se borraron los archivos de imágenes.

La paleta base oscura de `index.css` no cambió: la modificación de ese archivo solamente agregó tres clases de controles. La apariencia más plana resulta de usar paneles genéricos sobre ese fondo y no trasladar la presentación anterior: colores por categoría, iconografía propia, retratos, estados visuales y pantallas ilustradas. El cambio del motor no exigía esta pérdida visual. Fue una decisión de implementación que amplió indebidamente el alcance de la migración.

## 1. Funcionalidades retiradas del juego activo, sin equivalente completo

| Funcionalidad anterior | Situación actual |
| --- | --- |
| Gabinete de asesores | Sin contratación, despido, cupo de dos, retratos, niveles, inactividad, acciones extra ni bonificaciones por especialidad. Los siete asesores del catálogo anterior quedaron desconectados. |
| Habilidades activas por perfil | Sin Discurso Patriótico, Pacto de Gobernabilidad, Inversión Privada, Llamado a Inversores, Movilización Social, Paro Controlado, Campaña Mediática ni Gira de Medios. |
| Pasivas y ventajas de perfil | Sin retención electoral, reuniones gratuitas, ingreso adicional, préstamo extra, acción adicional, resiliencia frente a eventos ni multiplicadores de popularidad del sistema anterior. |
| Elecciones ejecutivas | No hay cálculo de votos, victoria/derrota electoral, candidatura a reelección ni pantalla de resultados. El componente social actual no reemplaza ese proceso. |
| Elecciones legislativas de medio término | No renuevan el Congreso. Las bancas del modelo nuevo son fijas; solamente cambia la disposición a apoyar cada ley. |
| Estrategias posteriores a las legislativas | No aparecen Acelerar, Negociar, Abrirse ni Jugada Audaz con sus modificadores. Negociar con actores en el motor nuevo es otra función. |
| Límite y final de carrera presidencial | No se aplica el cierre de carrera anterior tras el límite de mandatos. Se puede continuar la simulación. |
| Victoria por objetivos | No se calculan los objetivos anteriores, sus progresos ni sus recompensas. |
| Derrotas automáticas | No están las cinco vías anteriores: baja popularidad, presupuesto negativo prolongado, juicio político, golpe institucional e hiperinflación por siete emisiones. Las crisis actuales generan restricciones, pero no destituyen al jugador. |
| Pantalla de legado | Sin evaluación final, puntuación, fortalezas/debilidades, balance narrativo ni trayectoria electoral. El diálogo actual solamente permite revisar informes, continuar o terminar. |
| Eventos aleatorios y decisiones de evento | El catálogo, probabilidades, límites de frecuencia, efectos y opciones del sistema anterior no se ejecutan. Tampoco aparecen sus ilustraciones y ventanas de decisión. |
| Consecuencias post-legislativas | No se ejecutan los eventos específicos de bloqueo, marchas, juicio político, críticas por soberbia, aliados incómodos y editoriales. |
| Calendario político | Sin apertura de sesiones, hitos anuales, inicio de campañas y próximas elecciones en la barra lateral. La fecha del turno sí sigue visible. |
| Noticias y centro de notificaciones | Sin lista anterior de noticias, niveles de importancia, marcado como leído ni descarte. Quedan avisos breves y mensajes dentro de informes de cierre. |
| Cuaderno de gestión unificado | No existe la ventana que reunía demandas, efectos y registro reciente. Parte de la información se distribuyó entre actores, efectos e historial. |
| Informes de obra por hitos | Sin las tarjetas anteriores de etapas e hitos visuales. Queda una lista de efectos con fechas, que no equivale a ese seguimiento. |
| Recomendaciones y clasificación de riesgo de acciones | No se calculan ni muestran los indicadores REC/BON ni el riesgo anterior por tarjeta. Los requisitos pendientes sí se muestran en el nuevo detalle. |
| Vista electoral de apoyos | Sin el panel anterior de intención de voto, riesgo de derrota y sectores a favor/en contra. |
| Ejes ideológicos | Sin radical–conciliador, populista–técnico y cerrado–convocante, ni sus modificadores por extremos. |
| Dificultad parametrizada | El motor nuevo no consume los niveles easy/normal/hard/legend ni sus modificadores existentes. La interfaz anterior revisada iniciaba en normal; no se retiró un selector visible de dificultad. |
| Variables políticas anteriores | No se conservan popularidad, estabilidad y legitimidad como variables independientes con sus reglas anteriores. El conflicto agregado anterior tampoco se presenta; ahora existen conflictos por actor. |
| Desgaste fijo y castigos automáticos antiguos | Sin desgaste fijo de popularidad por trimestre, caída de popularidad por contador total de emisiones, penalidades de ejes extremos ni duplicación del costo por legitimidad agotada. |
| Antagonismos automáticos y apoyo directo | Se retiró la matriz universal «mejora A, empeora B», los premios directos de popularidad/voto y las compras directas de apoyo. Esta retirada sí responde al cambio causal solicitado. |
| Avatar durante la gestión | Se elige y guarda, pero no se muestra en la cabecera nueva. |
| Presentación visual por categoría | No se trasladaron los iconos de imagen, bordes y etiquetas de color diferenciados de las acciones. |

Los eventos base desconectados incluyen Crisis Inflacionaria, Inversión Extranjera, Oportunidad de Coalición, Bloqueo Legislativo, Protestas Estudiantiles y Crisis en el Sistema de Salud. También quedaron fuera los eventos adicionales que el registro anterior habilitara. No se atribuye a esta migración la ausencia de eventos que ya estaban deshabilitados.

### Actores que dejaron de existir como entidades propias

Clase Alta, Minorías Étnicas, Feministas y Deportistas no tienen un actor individual en el catálogo nuevo. Sectores Populares y ONG también perdieron sus fichas propias: hay Organizaciones Sociales y Organizaciones de Derechos, pero no son una equivalencia exacta ni una migración explícita de sus comportamientos.

Académicos fue sustituido por una representación diferenciada de docentes y científicos. Empresarios, Agro, Estudiantiles, Artistas, Aliados y Opositores tienen equivalentes renombrados o reorganizados. El catálogo incorpora además PyMEs, Oficialismo y Gobernadores. Que antes y ahora haya 18 actores no significa que sean los mismos 18.

Modernización de Aeropuertos ya no existe como política específica: asignarle infraestructura vial como destino en la tabla de correspondencia no conserva la temática aeroportuaria. Mediación en Conflictos tampoco tiene actualmente un modo específico de mediación, aunque la correspondencia la vincula a negociación.

## 2. Funcionalidades modificadas o sustituidas con una función nueva

| Área | Antes → ahora |
| --- | --- |
| Causalidad | Cambios directos de grupos y popularidad → políticas, indicadores, satisfacción y consecuencias por actor. |
| Indicadores | Panel de popularidad, estabilidad, legitimidad, conflicto, voto y presupuesto → 14 indicadores del país, caja/deuda y componente social separado. |
| Actores | Un valor de relación/apoyo → satisfacción material y relación/confianza diferenciadas. Se modificó también la composición del catálogo. |
| Poder de actores | Influencia y relaciones cruzadas → canales diferenciados, cooperación/conflicto y consecuencias rezagadas. |
| Reuniones | Mejora directa de apoyo → información de prioridades y acceso temporal a negociación. |
| Negociación y concesiones | Interacciones genéricas y botón de satisfacer demanda → ofertas, firma, objetivos, plazos y comprobación de cumplimiento. No hay botón independiente de Conceder. |
| Demandas | Agendas generadas por el motor anterior → necesidades reveladas al reunirse y compromisos elegidos al negociar. Se perdió la generación autónoma anterior de agendas. |
| Agenda | Acciones según perfil/asesores/modificadores → cuatro puntos compartidos entre políticas e interacciones. |
| Ejecución | Seleccionar y deseleccionar una lista para cerrar el turno → confirmar y ejecutar cada acción individualmente; una ejecución confirmada ya no se deselecciona. |
| Presupuesto | Presupuesto en millones y modificadores generales → caja en unidades de juego, ingresos, egresos, compromisos, resultado fiscal y atrasos. |
| Préstamos | Conteo de préstamos y descuento genérico de ingresos → contratos con principal, interés, vencimiento, pagos parciales y reperfilamiento. |
| Emisión | Contador acumulado y castigos por umbral → ventana móvil de cinco turnos, condiciones de inflación y presión acumulativa. |
| Efectos diferidos | Cola anterior → efectos de nivel, temporales y por turno con origen y fechas explícitos. |
| Estudios de factibilidad | Requisito anterior → permiso para una obra concreta, disponible desde el turno siguiente, consumible y con vencimiento. |
| Requisitos y repetición | Reglas antiguas → validación por acción, indicador, reunión, acuerdo, estudio, apoyo legislativo, deuda y contexto, con intervalos y límites de uso. |
| Congreso | Apoyo agregado relacionado con las legislativas → apoyo específico por ley, con bloques de 40/15/45 bancas fijas. Esto sustituye la votación de políticas, no las elecciones legislativas. |
| Continuidad | Reinicios parciales de estado al reelegirse → conservación de deuda, efectos, acuerdos e historial al continuar. Esa continuidad ya no depende de ganar una elección. |
| Perfil de personaje | Perfil con ventajas mecánicas → perfil narrativo. Nombre, selección de avatar, bienvenida y creación de personaje se mantienen. |
| Resumen e historial | Resumen y registro anteriores → informes por turno con descomposición causal y fiscal. No conservan toda la información narrativa y electoral anterior. |
| Crisis | Eventos/castigos/derrota anteriores → restricciones fiscales y contexto hídrico deterministas. No equivalen al sistema completo anterior de eventos. |
| Categorías UI | Nueve categorías anteriores → Economía, Servicios, Instituciones, Infraestructura, Desarrollo, Seguridad y Cultura. |
| Guardado | Se incorporó un guardado causal versionado con reproducción de comandos. No hay conversión automática desde el modelo anterior. |

## 3. Lo que falta

### Integración y recuperación de funcionalidades

1. Recuperar la presentación anterior y conectar sus componentes al estado causal: categorías, imágenes, avatar, jerarquía visual, tarjetas e informes.
2. Adaptar asesores y habilidades a efectos compatibles con el modelo causal; no basta con volver a montar sus botones.
3. Incorporar eventos con elecciones, noticias, calendario e informes narrativos, traduciendo sus efectos al modelo nuevo.
4. Recuperar el cuaderno de gestión, hitos de obras y notificaciones persistentes usando datos nuevos.
5. Completar el circuito electoral: legislativas, renovación de bancas, presidenciales, reelección, resultados y límite de mandatos. La fórmula electoral final estaba abierta en el diseño; el circuito anterior sí existía y ahora quedó desconectado.
6. Definir objetivos, victoria, derrota y legado compatibles con los indicadores nuevos. Actualmente se puede seguir simulando pese a resultados extremos.
7. Resolver la representación de los actores retirados y el alcance real de las políticas fusionadas. No asumir que cambiar el nombre del contenedor conserva todo su contenido.
8. Revisar si se conservan dificultad, perfiles con diferencias mecánicas y estrategias post-legislativas, y adaptar los que correspondan.

### Incompletitudes de la implementación actual

9. La tabla de correspondencia menciona un modo de mediación para conflictos activos, pero no está implementado como modo propio.
10. Las variantes rural, regional, museos y otras citadas al fusionar acciones no tienen selectores ni efectos diferenciados en el programa resultante.
11. La viabilidad de una promesa material se verifica de forma parcial: existencia de una política pertinente y proyección de compromisos actuales. No resuelve toda la ruta de requisitos, costos y tiempos necesaria para alcanzar la meta.
12. Los acuerdos parlamentarios/federales usan una consulta posterior como cumplimiento procedural. Falta evaluar si ese mecanismo representa suficientemente la negociación política buscada.
13. No existe migración de partidas anteriores; habría que definir una conversión explícita o un comienzo nuevo informado.
14. Falta balance mediante partidas completas y pruebas de conservación de funcionalidades y experiencia visual. Las 264 pruebas aprobadas eran 232 del código anterior y 32 nuevas; ese resultado no demuestra que se haya preservado el juego completo.

Los ejes ideológicos, los multiplicadores de popularidad y la matriz de antagonismos no deben restaurarse automáticamente: su conveniencia debe evaluarse contra el diseño causal. Recuperar la presentación visual no requiere recuperar esas reglas.

## 4. Qué no fue eliminado

Los recursos gráficos y archivos de componentes anteriores permanecen. También se mantienen bienvenida, creación de personaje, nombre, selector de avatar, rol Presidente, trimestre, caja, agenda, políticas, reuniones, historial y efectos futuros, con los cambios indicados.

El modo intendente/gobernador ya estaba reservado para después del MVP y era inalcanzable desde el inicio anterior. No corresponde presentarlo como una función activa que se haya retirado ahora. El modo ironman y el modificador de acciones base por dificultad también tenían partes sin consumir antes del cambio.

## 5. Auditoría individual de las 61 acciones

La tabla de correspondencia registra 39 modificaciones, 17 fusiones y 5 reemplazos. Las fusiones pierden el botón individual; no se contabilizan como una eliminación total del tema. Las excepciones de aeropuertos y mediación están señaladas arriba.

| Acción anterior | Tratamiento registrado | Destino actual | Motivo registrado |
| --- | --- | --- | --- |
| Emitir Dinero | modificar | Financiamiento monetario | Resuelve caja hoy a cambio de riesgo acumulado. |
| Mejorar Recaudación | modificar | Modernizar la recaudación | Invierte antes de recaudar; no es subir alícuotas. |
| Subsidios Industriales | modificar | Programa industrial temporal | Sostiene actividad con costo recurrente y presión ambiental. |
| Reforma Impositiva | modificar | Reforma tributaria recaudatoria | Mejora margen fiscal a costa de ingreso disponible. |
| Incentivos a la Exportación | modificar | Facilitación exportadora | Mejora capacidad externa con resultado demorado. |
| Control de Precios | modificar | Acuerdo temporal de precios | Alivia presión observada, pero puede tensionar oferta. |
| Fomento al Emprendimiento | fusionar | Garantías de crédito PyME | Su financiamiento productivo queda en garantías PyME; formación queda en empleo joven. |
| Aumento Salarial General | modificar | Salarios públicos y piso salarial | Mejora compra con gasto recurrente y presión según contexto. |
| Reducción del Gasto Público | modificar | Ajuste de programas y planteles | Recupera margen fiscal con costo social. |
| Préstamo Internacional | modificar | Préstamo externo a ocho turnos | Más caja y vencimiento explícito. No crea margen fiscal. |
| Préstamo Local | modificar | Préstamo local a seis turnos | Menor plazo y desplazamiento temporal de crédito privado. |
| Atracción de Inversiones | modificar | Garantías para inversión productiva | Beneficio sólo si hay crédito y garantías públicas suficientes. |
| Plan de Viviendas | modificar | Plan federal de vivienda | Beneficio de cobertura demorado; paga operación luego. |
| Programa Educativo | modificar | Plan educativo y formación docente | Mejora educativa sostenida con operación permanente. |
| Programa de Salud Preventiva | modificar | Atención primaria y prevención | Retorno más rápido y pequeño que hospitales. |
| Programa de Empleo Joven | modificar | Formación e inserción laboral | Retorno laboral limitado por demanda. |
| Ampliación de Cobertura Social | modificar | Cobertura social y cuidados | Contiene vulnerabilidad con obligación recurrente. |
| Campaña de Alfabetización | modificar | Alfabetización y educación comunitaria | Más eficaz con educación baja. |
| Plan de Inclusión Digital | fusionar | Conectividad y acceso digital | Acceso, redes y alfabetización digital en un único programa. |
| Programa Alimentario | modificar | Asistencia alimentaria de emergencia | Rápido pero temporal. No reemplaza vivienda o empleo. |
| Asistencia a la Tercera Edad | fusionar | Cobertura social y cuidados | Focalización por hogares dependientes sin duplicar el indicador de cobertura. |
| Plan de Igualdad de Género | modificar | Igualdad, cuidados y acceso a derechos | Dos resultados verificables, sin bono ideológico. |
| Transporte Público | modificar | Transporte público metropolitano | Reduce barreras de acceso, exige operación. |
| Energía Renovable | modificar | Transición energética | Lenta y costosa; mejora ambiente y redes. |
| Construcción de Hospitales | modificar | Red hospitalaria federal | Gran beneficio sanitario diferido y gasto recurrente alto. |
| Desarrollo de Viviendas Rurales | fusionar | Plan federal de vivienda | Focalización rural como variante de ejecución; no otro paquete idéntico. |
| Modernización de Aeropuertos | reemplazar | Corredores viales productivos | No justifica otro escalón nacional en MVP; corredores concentran conectividad exportadora. |
| Red de Comunicaciones | fusionar | Conectividad y acceso digital | Duplicaba la red y su retorno fiscal automático. |
| Programa de Reforestación | modificar | Restauración de ecosistemas | Retorno ambiental lento, sin ingreso automático. |
| Mejorar Infraestructura Vial | modificar | Corredores viales productivos | Obra demorada que luego exige mantenimiento. |
| Plantas de Tratamiento de Agua | fusionar | Agua segura y resiliencia hídrica | Unifica agua segura y mantenimiento hídrico. |
| Red de Gas Natural | modificar | Transición de redes de gas | Más rápida que renovables, con costo ambiental explícito. |
| Estudio de factibilidad | modificar | Estudiar un proyecto nacional | Permiso de proyecto específico, consumible y con vencimiento. |
| Plan Hídrico | modificar | Agua segura y resiliencia hídrica | Mejora sanitaria y ambiental; costo de operación. |
| Mantenimiento Urbano | modificar | Mantenimiento de redes federales | Retorno rápido sin ampliar capacidad exportadora. |
| Plan de Conectividad | modificar | Conectividad y acceso digital | Unifica tres acciones redundantes. |
| Acuerdo Sindical | reemplazar | Firmar compromiso verificable | Plantilla pacto_laboral del flujo reunión-negociación-firma. No compra apoyo directo. |
| Alianza Política | reemplazar | Firmar compromiso verificable | Plantilla coalicion con aliados: contraprestación legislativa delimitada. |
| Tratado de Libre Comercio | modificar | Acuerdo de apertura comercial | Ganancia externa demorada con transición productiva. |
| Cooperación Internacional | modificar | Cooperación científica internacional | Capacidad científica con demora y requisitos institucionales. |
| Acuerdo Ambiental | reemplazar | Firmar compromiso verificable | Plantilla pacto_ambiental exige resultado medible; firma sola no mejora ambiente. |
| Participación en Cumbres | fusionar | Cooperación científica internacional | Se elimina el viaje vacío: debe perseguir cooperación científica concreta. |
| Mediación en Conflictos | reemplazar | Negociar una demanda | Modo mediacion sólo para conflicto activo y luego de reunión. |
| Seguridad Ciudadana | modificar | Operativo federal focalizado | Resultado rápido; daño a derechos si faltan controles. |
| Lucha contra el Narcotráfico | modificar | Investigación de redes criminales | Más lenta pero persistente que un operativo. |
| Programa de Desarme | fusionar | Prevención y proximidad federal | Subprograma de prevención sin otro botón de seguridad parecido. |
| Fortalecimiento de la Justicia | modificar | Justicia y control de legalidad | Abre herramientas de seguridad con salvaguardas. |
| Sistema de Vigilancia | modificar | Vigilancia con trazabilidad | Seguridad diferida; controles reducen, no borran, costo de privacidad. |
| Policía de Proximidad | modificar | Prevención y proximidad federal | Más lento que un operativo, compatible con garantías. |
| Prevención del Delito | fusionar | Prevención y proximidad federal | Mismo resultado y horizonte que prevención de proximidad. |
| Programa Cultural | modificar | Acceso cultural y creación | Mejora formación y ejercicio de derechos culturales. |
| Festival Nacional de Arte | fusionar | Acceso cultural y creación | Variación temática sin mecánica propia. |
| Protección del Patrimonio | modificar | Patrimonio y turismo sostenible | Retorno productivo pequeño y tardío. |
| Red de Bibliotecas | fusionar | Acceso cultural y creación | Acceso y formación cultural. El gasto se cuenta una vez. |
| Centros Culturales | fusionar | Acceso cultural y creación | Acceso cultural incluido; evita proliferar infraestructura con idéntico premio. |
| Escuelas de Arte | fusionar | Acceso cultural y creación | Formación cultural integrada. |
| Museos Interactivos | fusionar | Patrimonio y turismo sostenible | Equipamiento patrimonial y turístico como variante. |
| Festivales Regionales | fusionar | Acceso cultural y creación | Escala regional como foco del mismo programa. |
| Promover Educación | fusionar | Plan educativo y formación docente | Acción genérica redundante con el programa educativo. |
| Fomentar Turismo | fusionar | Patrimonio y turismo sostenible | Evita beneficio inmediato barato sin capacidad turística. |
| Desarrollar Tecnología | modificar | Transferencia tecnológica productiva | Transforma capacidad científica previa en actividad futura. |

## 6. Definiciones nuevas sin antecedente directo en la tabla

- Sostener equipos científicos (`carrera_cientifica`).
- Transparencia y compras abiertas (`transparencia_publica`).
- Programa de estabilización monetaria (`estabilizacion_monetaria`).
- Alivio tributario temporal (`alivio_tributario`).
- Reperfilar un vencimiento (`reestructurar_deuda`).
- Reunirse con un actor (`reunirse`).
