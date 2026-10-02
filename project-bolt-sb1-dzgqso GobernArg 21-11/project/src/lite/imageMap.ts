/**
 * Imágenes de la Lite: qué archivo usa cada actor, política y pantalla.
 *
 * Las imágenes se generaron para la B Lite (otra lista de actores y de
 * políticas), así que acá se elige, por lo que muestra cada una, cuál le toca a
 * cada id de la A. Los archivos viven en src/assets/images/a-lite/<carpeta>/
 * con el nombre de la B, ya aclarados para el tema claro con
 * scripts/aclarar-imagenes-lite.sh.
 *
 * Para sumar una tanda: correr el script sobre la carpeta de la B y anotar
 * acá los ids nuevos. Lo que no está en esta tabla sigue con su ícono o sin
 * imagen (nunca se rompe).
 */
import type { ActorId } from '@/data/causal';

/** Actor de la A → retrato (actores/<nombre>.webp). Los 17 tienen uno. */
export const ACTOR_IMAGE: Record<ActorId, string> = {
  industria: 'industria',
  agro: 'agro',
  financiero: 'financiero',
  sindicatos: 'sindicatos',
  pymes: 'pymes',
  clase_media: 'clase_media',
  // Trabajadora de la economía popular con su carga de reciclado: lo más
  // cercano a "informales, beneficiarios de programas".
  sectores_populares: 'cooperativas',
  estudiantes: 'estudiantes',
  docentes: 'docentes',
  cientificos: 'cientificos',
  // Pechera "Organización · comunidad" en un comedor: movimientos sociales.
  org_sociales: 'organizaciones',
  // Marcha "Más derechos, más democracia" frente al Congreso.
  derechos_cultura: 'ddhh',
  ambiente: 'ambientalistas',
  oficialismo: 'oficialismo',
  aliados: 'aliados',
  oposicion: 'oposicion',
  gobernadores: 'gobernadores',
};

/**
 * Política de la A → ilustración (politicas/<nombre>.webp). Solo donde el
 * contenido coincide de verdad; el resto de las políticas no lleva imagen.
 */
export const ACTION_IMAGE: Record<string, string> = {
  emitir_dinero: 'emitir_dinero',
  prestamo_internacional: 'prestamo_internacional',
  prestamo_local: 'prestamo_local',
  control_precios: 'control_precios',
  reduccion_gasto: 'reduccion_gasto',
  mejorar_recaudacion: 'mejorar_recaudacion',
  credito_pyme: 'credito_pyme',
  aumento_salarial: 'aumento_salarial',
  incentivos_exportacion: 'incentivos_exportacion',
  tratado_comercio: 'tratado_comercio',
  promocion_industrial: 'subsidios_industriales',
  reforma_tributaria: 'reforma_impositiva',
  reduccion_impuestos: 'alivio_tributario',
  regimen_grandes_inversiones: 'atraccion_inversiones',
  politica_monetaria_contractiva: 'estabilizacion_monetaria',
  // Segunda tanda (Social, Educación, Instituciones).
  plan_viviendas: 'plan_viviendas',
  asistencia_alimentaria: 'programa_alimentario',
  salud_preventiva: 'salud_preventiva',
  empleo_joven: 'empleo_joven',
  genero_y_cuidados: 'igualdad_genero',
  // Adultos aprendiendo a leer: la alfabetización de la inversión educativa.
  inversion_educativa: 'alfabetizacion',
  // Docentes planificando con materiales nuevos: cambios curriculares y de gestión.
  reforma_educativa: 'programa_educativo',
  fortalecimiento_justicia: 'fortalecimiento_justicia',
  transparencia_anticorrupcion: 'transparencia_publica',
  // Tercera tanda (Obras, hospitales y ambiente).
  energia_renovable: 'energia_renovable',
  construccion_hospitales: 'construccion_hospitales',
  plan_conectividad: 'plan_conectividad',
  infraestructura_vial: 'infraestructura_vial',
  obras_hidricas: 'plan_hidrico',
  // Gasoducto en construcción: "gasoductos, redes eléctricas y de gas".
  infraestructura_energetica: 'red_gas',
  estudio_factibilidad: 'estudio_factibilidad',
  mantenimiento_infraestructura: 'mantenimiento_urbano',
  // Plantación de monte nativo: la parte de bosques de la ley ambiental.
  proteccion_ambiental: 'reforestacion',
};

/** Pantallas (pantallas/<nombre>.webp). */
export const SCREEN_IMAGE = {
  bienvenida: 'bienvenida-hero',
  cierreTurno: 'cierre-turno',
} as const;
