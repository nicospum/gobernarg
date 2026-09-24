// ARCHIVO GENERADO por scripts/excel_to_causal.py desde GobernArg_Motor_Causal_v1.xlsx.
// No editar a mano: modificar el Excel y regenerar.
/* eslint-disable */

import type { MeetingRow } from '../types';

export const MEETING_ROWS: MeetingRow[] = [
  {
    "actor": "industria",
    "reveals": "SAT exacta; top-2 indicadores negativos; si piensa invertir (tendencia INVC)",
    "discusses": [
      "INVC",
      "PRES",
      "CONF",
      "EXTE"
    ],
    "demandsText": "promocion_industrial · reduccion_impuestos · credito_pyme · liberar_cambios",
    "demandActionIds": [
      "promocion_industrial",
      "reduccion_impuestos",
      "credito_pyme",
      "liberar_cambios"
    ],
    "vetoActionIds": [],
    "unlocks": "negociacion → acuerdo: compromiso de inversión",
    "shouldNot": "Subir INVC o SAT. Máx. +2 REL (sólo si REL<40).",
    "exampleText": "Con estas tasas y esta presión fiscal ninguna empresa amplía planta."
  },
  {
    "actor": "agro",
    "reveals": "SAT; peso de PRES vs EXTE; intención de liquidar",
    "discusses": [
      "PRES",
      "EXTE",
      "INFR"
    ],
    "demandsText": "bajar_retenciones · infraestructura_vial · obras_hidricas",
    "demandActionIds": [
      "bajar_retenciones",
      "infraestructura_vial",
      "obras_hidricas"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: liquidación adelantada (EXTE +4)",
    "shouldNot": "Evitar un paro por sí sola.",
    "exampleText": "Las retenciones y los caminos rurales nos están sacando del mercado."
  },
  {
    "actor": "financiero",
    "reveals": "SAT; nivel de DESANCLAJE (oculto) de forma cualitativa; riesgo de corrida",
    "discusses": [
      "SOLV",
      "INFL",
      "EXTE"
    ],
    "demandsText": "reduccion_gasto · politica_monetaria_contractiva · prestamo_internacional",
    "demandActionIds": [
      "reduccion_gasto",
      "politica_monetaria_contractiva",
      "prestamo_internacional"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: refinanciación (servicio de deuda −10% 4 turnos)",
    "shouldNot": "Mejorar SOLV.",
    "exampleText": "El mercado no ve un ancla fiscal; las expectativas se están despegando."
  },
  {
    "actor": "sindicatos",
    "reveals": "SAT; si PODA o ACTV es el problema; probabilidad de paro",
    "discusses": [
      "PODA",
      "ACTV",
      "PSOC"
    ],
    "demandsText": "aumento_salarial · suba_salario_minimo · (veto a reforma_laboral)",
    "demandActionIds": [
      "aumento_salarial",
      "suba_salario_minimo"
    ],
    "vetoActionIds": [
      "reforma_laboral"
    ],
    "unlocks": "acuerdo: tregua · habilita pacto_social",
    "shouldNot": "Evitar paro si SAT<25. Reemplazar política salarial.",
    "exampleText": "El salario real viene perdiendo hace tres trimestres."
  },
  {
    "actor": "pymes",
    "reveals": "SAT; crédito vs demanda",
    "discusses": [
      "ACTV",
      "INVC",
      "PRES"
    ],
    "demandsText": "credito_pyme · reduccion_impuestos",
    "demandActionIds": [
      "credito_pyme",
      "reduccion_impuestos"
    ],
    "vetoActionIds": [],
    "unlocks": "pacto_social (una de las 3 partes)",
    "shouldNot": null,
    "exampleText": "No es falta de ventas: es que no hay crédito a tasa razonable."
  },
  {
    "actor": "clase_media",
    "reveals": "— (no se reúne: usar encuesta)",
    "discusses": [],
    "demandsText": null,
    "demandActionIds": [],
    "vetoActionIds": [],
    "unlocks": null,
    "shouldNot": null,
    "exampleText": "Encuesta: “La inseguridad y la inflación explican el 70% del malestar."
  },
  {
    "actor": "sectores_populares",
    "reveals": "— (no se reúne: usar encuesta)",
    "discusses": [],
    "demandsText": null,
    "demandActionIds": [],
    "vetoActionIds": [],
    "unlocks": null,
    "shouldNot": null,
    "exampleText": "Encuesta: “El deterioro de la asistencia y el precio de los alimentos."
  },
  {
    "actor": "estudiantes",
    "reveals": "SAT; riesgo de marcha federal",
    "discusses": [
      "EDUC",
      "CIEN",
      "INST"
    ],
    "demandsText": "inversion_educativa · financiamiento_ciencia · empleo_joven",
    "demandActionIds": [
      "inversion_educativa",
      "financiamiento_ciencia",
      "empleo_joven"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: ley de financiamiento universitario (compromiso)",
    "shouldNot": null,
    "exampleText": "Si no se actualiza el presupuesto universitario, marchamos."
  },
  {
    "actor": "docentes",
    "reveals": "SAT; si el reclamo es salarial (PODA) o de condiciones (EDUC)",
    "discusses": [
      "EDUC",
      "PODA"
    ],
    "demandsText": "aumento_salarial (paritaria docente) · inversion_educativa",
    "demandActionIds": [
      "aumento_salarial",
      "inversion_educativa"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: paritaria (sin paro) · bonifica reforma_educativa",
    "shouldNot": null,
    "exampleText": "El conflicto no es el edificio escolar: es el salario."
  },
  {
    "actor": "cientificos",
    "reveals": "SAT; riesgo de fuga",
    "discusses": [
      "CIEN",
      "EDUC"
    ],
    "demandsText": "financiamiento_ciencia · economia_conocimiento",
    "demandActionIds": [
      "financiamiento_ciencia",
      "economia_conocimiento"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: plan plurianual (bonus eficacia)",
    "shouldNot": null,
    "exampleText": "Sin continuidad presupuestaria perdemos a los becarios."
  },
  {
    "actor": "org_sociales",
    "reveals": "SAT; si hay plan de lucha en preparación",
    "discusses": [
      "PSOC",
      "ACTV",
      "PODA"
    ],
    "demandsText": "cobertura_social · asistencia_alimentaria · plan_viviendas (cooperativas)",
    "demandActionIds": [
      "cobertura_social",
      "asistencia_alimentaria",
      "plan_viviendas"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: gestión de programas (contención)",
    "shouldNot": "Comprar contención con plata sola.",
    "exampleText": "La asistencia no llega a los comedores; el invierno va a ser duro."
  },
  {
    "actor": "derechos_cultura",
    "reveals": "SAT; qué medidas piensan judicializar",
    "discusses": [
      "INST",
      "EDUC"
    ],
    "demandsText": "fomento_cultural · genero_y_cuidados · transparencia_anticorrupcion",
    "demandActionIds": [
      "fomento_cultural",
      "genero_y_cuidados",
      "transparencia_anticorrupcion"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: protocolo con garantías (mitiga INST de mano_dura)",
    "shouldNot": null,
    "exampleText": "El protocolo antipiquetes va a terminar en los tribunales."
  },
  {
    "actor": "ambiente",
    "reveals": "SAT; qué proyectos van a judicializar",
    "discusses": [
      "AMBI",
      "INST"
    ],
    "demandsText": "proteccion_ambiental · energia_renovable",
    "demandActionIds": [
      "proteccion_ambiental",
      "energia_renovable"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: evaluación ambiental participativa (sin demora en 1 proyecto)",
    "shouldNot": null,
    "exampleText": "Sin estudio de impacto, el proyecto minero no pasa la justicia."
  },
  {
    "actor": "oficialismo",
    "reveals": "SAT; nivel de cohesión; riesgo de ruptura",
    "discusses": [
      "APRO",
      "plataforma"
    ],
    "demandsText": "acciones de la plataforma elegida",
    "demandActionIds": [],
    "vetoActionIds": [],
    "unlocks": "acuerdo: agenda legislativa común",
    "shouldNot": null,
    "exampleText": "La tropa propia no entiende este giro."
  },
  {
    "actor": "aliados",
    "reveals": "SAT; qué piden (cargos/agenda)",
    "discusses": [
      "APRO",
      "INST",
      "SOLV"
    ],
    "demandsText": "ampliar_coalicion · transparencia_anticorrupcion",
    "demandActionIds": [
      "ampliar_coalicion",
      "transparencia_anticorrupcion"
    ],
    "vetoActionIds": [],
    "unlocks": "ampliar_coalicion",
    "shouldNot": null,
    "exampleText": "Acompañamos, pero queremos el ministerio de Justicia."
  },
  {
    "actor": "oposicion",
    "reveals": "SAT (disposición a cooperar); qué ley podrían acompañar",
    "discusses": [
      "INST"
    ],
    "demandsText": "retirar DNU · fortalecimiento_justicia",
    "demandActionIds": [
      "fortalecimiento_justicia"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: ley de consenso (umbral 45 para 1 ley)",
    "shouldNot": "Cambiar el umbral por sí sola.",
    "exampleText": "Si gobiernan por decreto, no cuenten con nosotros."
  },
  {
    "actor": "gobernadores",
    "reveals": "SAT; qué provincias están más tensas",
    "discusses": [
      "INFR",
      "ACTV"
    ],
    "demandsText": "transferencias_provincias · infraestructura_vial · plan_viviendas",
    "demandActionIds": [
      "transferencias_provincias",
      "infraestructura_vial",
      "plan_viviendas"
    ],
    "vetoActionIds": [],
    "unlocks": "acuerdo: votos en el Senado + ejecución federal",
    "shouldNot": null,
    "exampleText": "Sin obras en las provincias no hay votos en el Senado."
  }
];
