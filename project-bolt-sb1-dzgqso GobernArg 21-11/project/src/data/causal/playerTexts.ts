/**
 * Textos para el jugador (glosario, Fase 2): reemplazan en la interfaz las
 * notas de diseño de las acciones y el "Poder" de los actores, que usaban
 * siglas del motor. Mismo contenido, en lenguaje de jugador y con voseo.
 */
export const ACTION_PLAYER_NOTES: Record<string, string> = {
  // Economía y moneda
  emitir_dinero:
    'Plata rápida y sin costo político inmediato. Las primeras veces sale casi gratis, pero si la repetís seguido, la inflación se dispara y se come el salario y la inversión.',
  politica_monetaria_contractiva:
    'Baja la inflación en unos turnos, a costa del crédito y la actividad. Le gusta al sector financiero y le pega a las PyMEs.',
  devaluacion:
    'Consigue dólares rápido; lo pagan el salario y la inflación. Con inflación alta el golpe es mayor, y si la repetís pierde efecto.',
  control_cambios:
    'Frena la fuga de dólares de inmediato, pero cada turno que siga vigente castiga la inversión. Planificá cómo vas a salir.',
  liberar_cambios:
    'El premio por haber reconstruido las reservas: libera la inversión. Si lo hacés con pocos dólares, la inflación pega un salto.',
  control_precios:
    'Mejora el dato de inflación por un tiempo y después rebota. Sirve para ganar tiempo antes de una elección, no para resolver el problema.',

  // Cuentas públicas y deuda
  reduccion_gasto:
    'Ordena las cuentas públicas para siempre porque baja el gasto fijo. Cuesta protección social y actividad en el corto plazo, y si lo acumulás genera conflicto.',
  privatizacion:
    'Mucha plata de una sola vez y menos déficit, a cambio de conflicto y tarifas más altas. La segunda privatización rinde menos.',
  prestamo_internacional:
    'Salvavidas de plata y reservas. A los 4 turnos revisan la meta fiscal: si tenés déficit, se corta el desembolso y se resienten las cuentas públicas.',
  prestamo_local:
    'Plata sin inflación, pero se lleva el crédito disponible: lo sienten las PyMEs y la industria.',
  mejorar_recaudacion:
    'Recaudás más sin subir impuestos, aunque cada vez rinde menos. Es el paso previo a la reforma tributaria.',
  reforma_tributaria:
    'Recaudación estable a largo plazo, a cambio de inversión y del malhumor de quienes pagan. En recesión duele más.',
  reduccion_impuestos:
    'Impulsa la inversión y la actividad, pero perdés recaudación. Si las cuentas públicas están flojas, genera desconfianza.',
  subir_retenciones:
    'Plata inmediata y permanente, pero entran menos dólares (se siembra y se liquida menos) y se enoja el campo. Si la repetís, hay conflicto.',
  bajar_retenciones:
    'Con el tiempo entran más dólares; a cambio perdés recaudación para siempre.',

  // Producción e inversión
  promocion_industrial:
    'Sube la inversión y la actividad. Sin dólares rinde menos, y si la repetís genera dependencia.',
  credito_pyme:
    'Compensa la suba de tasas: da crédito por un tiempo, empuja la actividad con algo de demora y recuperás parte de la plata.',
  incentivos_exportacion:
    'Con el tiempo entran más dólares, pero tiene costo fiscal.',
  regimen_grandes_inversiones:
    'Inversión fuerte y duradera, pero perdés recaudación por las exenciones. Sin instituciones sólidas rinde la mitad.',
  desarrollo_energetico_minero:
    'La gran fuente de dólares a mediano plazo, con costo ambiental y conflicto con los ambientalistas, que pueden frenarlo en la Justicia.',
  tratado_comercio:
    'Más dólares e inversión a mediano plazo, pero primero golpea la actividad de los sectores que compiten con importaciones. En recesión, peor.',

  // Salarios y trabajo
  aumento_salarial:
    'Mejora el salario y el funcionamiento de los servicios, pero sube el gasto fijo para siempre. Con inflación alta empuja los precios.',
  suba_salario_minimo:
    'No le cuesta nada al Estado: mejora el salario, pero empuja la inflación y el costo laboral. Con inflación alta se licúa; en recesión aumenta la informalidad.',
  reforma_laboral:
    'Más inversión y actividad con el tiempo, pero cae el salario y rompés con los sindicatos, salvo que hayas acordado antes con ellos.',
  pacto_social:
    'La herramienta más barata contra la inflación, solo si construiste buenas relaciones. Te compromete: si emitís o devaluás durante el pacto, se rompe.',

  // Protección social y salud
  cobertura_social:
    'Protección social permanente y contención, pero sube el gasto fijo. Si la repetís, rinde cada vez menos.',
  asistencia_alimentaria:
    'Rápida y temporal: apaga incendios sociales sin sumar gasto permanente.',
  bono_jubilados:
    'Alivia por un tiempo el bolsillo y la protección social, sin gasto permanente. Con inflación alta se licúa.',
  plan_viviendas:
    'Mueve la actividad ya por la obra y mejora la protección social al entregar las casas. Se ejecuta en las provincias: depende de los gobernadores.',
  salud_preventiva:
    'Mejora la salud a bajo costo, con un gasto fijo moderado.',
  construccion_hospitales:
    'Gran mejora en salud, pero tarda en llegar y deja un gasto de funcionamiento permanente.',
  empleo_joven:
    'Un efecto chico en varios indicadores; a mediano plazo ayuda con los estudiantes y con la seguridad.',
  genero_y_cuidados:
    'Suma derechos, protección social y más gente trabajando a mediano plazo.',

  // Tarifas
  congelar_tarifas:
    'Alivia el salario y la inflación mientras dura, a costa de plata todos los turnos, infraestructura y dólares. Si lo repetís, deja un atraso.',
  actualizar_tarifas:
    'Mejora la caja y la infraestructura, pero pega de inmediato en el salario y la inflación.',

  // Educación, ciencia y cultura
  inversion_educativa:
    'Mejora la educación con demora y deja gasto fijo. Con los docentes conformes rinde más.',
  reforma_educativa:
    'Mejora la educación de forma lenta y duradera; si no dialogás con los docentes, hay conflicto.',
  financiamiento_ciencia:
    'Impulsa la ciencia con gasto fijo. A diferencia de casi todo, repetirlo rinde cada vez más.',
  economia_conocimiento:
    'Más inversión y dólares a mediano plazo; rinde más si ya invertiste en ciencia.',
  fomento_cultural:
    'Mueve poco los indicadores: su valor está en atender al sector cultural y a la economía creativa.',
  turismo_y_patrimonio:
    'Dólares baratos; rinde más después de una devaluación.',

  // Infraestructura
  estudio_factibilidad:
    'El primer paso de las obras: las habilita y las abarata durante 6 turnos.',
  infraestructura_vial:
    'Genera empleo ya, mejora la infraestructura en 2 o 3 turnos y ayuda a exportar a los 4. Deja mantenimiento para siempre.',
  infraestructura_energetica:
    'Mejora la infraestructura y reduce la energía importada, lo que ahorra dólares.',
  energia_renovable:
    'Mejora el ambiente y la infraestructura, y ahorra algunos dólares.',
  obras_hidricas:
    'Mejora la infraestructura y la salud (agua segura), y trae dólares gracias al riego.',
  plan_conectividad:
    'Pequeñas mejoras en infraestructura, educación y ciencia.',
  mantenimiento_infraestructura:
    'Frena el deterioro de las obras por 3 turnos. Te obliga a elegir entre inaugurar y conservar.',

  // Seguridad e instituciones
  seguridad_ciudadana:
    'Mejora la seguridad con gasto fijo. La vigilancia tiene un leve costo en instituciones y derechos.',
  prevencion_comunitaria:
    'Mejora la seguridad de forma lenta pero sostenida, sin costo en derechos.',
  lucha_narcotrafico:
    'Empeora antes de mejorar, porque hay reacción violenta. Sin instituciones sólidas rinde la mitad.',
  mano_dura:
    'Baja el conflicto y da sensación de orden ya, a costa de instituciones y derechos. Si lo repetís, radicaliza la protesta.',
  fortalecimiento_justicia:
    'Mejora instituciones y seguridad a mediano plazo, y habilita la lucha contra el narcotráfico.',
  transparencia_anticorrupcion:
    'Mejora las instituciones a bajo costo; el precio es político: tu propio partido pierde margen de maniobra.',
  proteccion_ambiental:
    'Mejora el ambiente de forma sostenida y reduce el daño de los proyectos mineros y energéticos, pero pone límites a la producción.',
  dnu:
    'Un atajo para gobernar sin el Congreso: se puede, pero cuesta instituciones y relación con la oposición, y si lo repetís, la Justicia puede frenarte.',

  // Política y relaciones
  agenda_internacional:
    'Casi no mueve indicadores, pero abre puertas: habilita acuerdos comerciales y mejora préstamos e inversiones.',
  reunion:
    'Te muestra cuán conforme está el actor, qué indicadores le preocupan, qué te pide y hacia dónde va. No te compra su apoyo.',
  negociacion:
    'Tus chances dependen de la relación que tengas y de lo difícil que sea el actor; suben si le ofrecés lo que te pidió en la reunión.',
  acuerdo:
    'Si cumplís, mejora mucho la relación. Si no cumplís, la relación se derrumba y perdés credibilidad en todas las negociaciones futuras.',
  encuesta:
    'La reunión de la clase media y los sectores populares: te muestra su satisfacción y los 2 indicadores que más la mueven.',
  ampliar_coalicion:
    'Te da más apoyo en el Congreso para siempre, a costa de la cohesión de tu propio espacio.',
  transferencias_provincias:
    'Comprás con plata la relación con los gobernadores (y votos en el Senado); si se vuelve costumbre, rinde menos.',
};

export const ACTOR_POWER_TEXT: Record<string, string> = {
  industria: 'la inversión',
  agro: 'liquidar la cosecha y traer dólares',
  financiero: 'el crédito al Estado y el acceso a deuda',
  sindicatos: 'paros y conflicto laboral',
  pymes: 'el empleo local',
  clase_media: 'su peso en las elecciones',
  sectores_populares: 'su peso en las elecciones',
  estudiantes: 'movilizarse y poner la educación en agenda',
  docentes: 'el funcionamiento de las escuelas',
  cientificos: 'la innovación a largo plazo',
  org_sociales: 'piquetes y conflicto en la calle',
  derechos_cultura: 'frenar en la Justicia tus medidas restrictivas',
  ambiente: 'frenar proyectos en la Justicia',
  oficialismo: 'la disciplina de tu bloque en el Congreso',
  aliados: 'tu mayoría en el Congreso',
  oposicion: 'trabar tus leyes en el Congreso',
  gobernadores: 'ejecutar tus obras y programas en las provincias',
};

/** Riesgos de las acciones cuyo texto original usaba siglas del motor. */
export const ACTION_RISK_TEXT: Record<string, string> = {
  emitir_dinero: 'Hiperinflación: si la inflación queda desbocada dos turnos seguidos, se desata una crisis que puede costarte el gobierno.',
  reduccion_gasto: 'Conflicto social si la protección social ya está baja.',
};
