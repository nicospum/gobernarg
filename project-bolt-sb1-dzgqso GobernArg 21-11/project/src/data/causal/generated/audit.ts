// ARCHIVO GENERADO por scripts/excel_to_causal.py desde GobernArg_Motor_Causal_v1.xlsx.
// No editar a mano: modificar el Excel y regenerar.
/* eslint-disable */

import type { AuditRow } from '../types';

export const AUDIT_ROWS: AuditRow[] = [
  {
    "oldId": "emitir_dinero",
    "oldName": "Emitir Dinero",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "emitir_dinero"
    ],
    "justification": "Se conserva. Pierde pop/leg/voto directos. Inflación por ventana de 6 turnos (≥3/≥4/≥5) en lugar de contador por mandato."
  },
  {
    "oldId": "mejorar_recaudacion",
    "oldName": "Mejorar Recaudación",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "mejorar_recaudacion"
    ],
    "justification": "Ingreso permanente con rezago (INGRESO_MULT) en vez de +250 y futureEffects planos."
  },
  {
    "oldId": "subsidios_industriales",
    "oldName": "Subsidios Industriales",
    "oldCategory": "economia",
    "decision": "MODIFICAR + RENOMBRAR",
    "newIds": [
      "promocion_industrial"
    ],
    "justification": "Se eliminan explicitGroupEffects (+8/+8/−9/−6): era el ejemplo canónico de causalidad artificial."
  },
  {
    "oldId": "reforma_impositiva",
    "oldName": "Reforma Impositiva",
    "oldCategory": "economia",
    "decision": "DIVIDIR",
    "newIds": [
      "reforma_tributaria",
      "reduccion_impuestos"
    ],
    "justification": "Sólo existía la dirección recaudatoria. Prereq LEG≥45 se sube a 50 con luna de miel y DNU como alternativas."
  },
  {
    "oldId": "incentivos_exportacion",
    "oldName": "Incentivos a la Exportación",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "incentivos_exportacion"
    ],
    "justification": "Mueve EXTE con rezago."
  },
  {
    "oldId": "control_precios",
    "oldName": "Control de Precios",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "control_precios"
    ],
    "justification": "CD 1 + pop 15 = spam óptimo. Ahora BONUS temporal + rebote + desabastecimiento por repetición."
  },
  {
    "oldId": "fomento_emprendimiento",
    "oldName": "Fomento al Emprendimiento",
    "oldCategory": "economia",
    "decision": "FUSIONAR",
    "newIds": [
      "credito_pyme"
    ],
    "justification": "Mismo rol (crédito a pequeños). Se convierte en la herramienta de crédito que faltaba."
  },
  {
    "oldId": "aumento_salarial",
    "oldName": "Aumento Salarial General",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "aumento_salarial"
    ],
    "justification": "Se agrega GASTO_CORR permanente: el costo real de subir salarios."
  },
  {
    "oldId": "reduccion_gasto",
    "oldName": "Reducción del Gasto Público",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "reduccion_gasto"
    ],
    "justification": "Baja GASTO_CORR permanente; el castigo sale de PSOC/ACTV, no de −20 pop."
  },
  {
    "oldId": "prestamo_internacional",
    "oldName": "Préstamo Internacional",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "prestamo_internacional"
    ],
    "justification": "Prereq mejorar_recaudacion sin lógica → condicionalidad fiscal a t+4."
  },
  {
    "oldId": "prestamo_local",
    "oldName": "Préstamo Local",
    "oldCategory": "economia",
    "decision": "MODIFICAR",
    "newIds": [
      "prestamo_local"
    ],
    "justification": "Crowding-out sobre INVC. CD 8→4. Requiere SOLV≥25."
  },
  {
    "oldId": "atraccion_inversiones",
    "oldName": "Atracción de Inversiones",
    "oldCategory": "economia",
    "decision": "REEMPLAZAR",
    "newIds": [
      "regimen_grandes_inversiones"
    ],
    "justification": "Genérica. Se reemplaza por un régimen legal con costo fiscal y efecto persistente."
  },
  {
    "oldId": "plan_viviendas",
    "oldName": "Plan de Viviendas",
    "oldCategory": "social",
    "decision": "MODIFICAR",
    "newIds": [
      "plan_viviendas"
    ],
    "justification": "Absorbe viviendas_rurales; ejecución federal."
  },
  {
    "oldId": "programa_educativo",
    "oldName": "Programa Educativo",
    "oldCategory": "social",
    "decision": "FUSIONAR",
    "newIds": [
      "inversion_educativa"
    ],
    "justification": "Redundante con alfabetización, bibliotecas y promover_educacion."
  },
  {
    "oldId": "salud_preventiva",
    "oldName": "Programa de Salud Preventiva",
    "oldCategory": "social",
    "decision": "MODIFICAR",
    "newIds": [
      "salud_preventiva"
    ],
    "justification": "Se conserva como opción barata y rápida frente a hospitales."
  },
  {
    "oldId": "empleo_joven",
    "oldName": "Programa de Empleo Joven",
    "oldCategory": "social",
    "decision": "MODIFICAR",
    "newIds": [
      "empleo_joven"
    ],
    "justification": "Efecto pequeño multi-indicador; única acción de empleo directo."
  },
  {
    "oldId": "cobertura_social",
    "oldName": "Ampliación de Cobertura Social",
    "oldCategory": "social",
    "decision": "MODIFICAR",
    "newIds": [
      "cobertura_social"
    ],
    "justification": "Gasto permanente + rendimientos decrecientes."
  },
  {
    "oldId": "alfabetizacion",
    "oldName": "Campaña de Alfabetización",
    "oldCategory": "social",
    "decision": "FUSIONAR",
    "newIds": [
      "inversion_educativa"
    ],
    "justification": "Mueve el mismo indicador que programa_educativo."
  },
  {
    "oldId": "inclusion_digital",
    "oldName": "Plan de Inclusión Digital",
    "oldCategory": "social",
    "decision": "FUSIONAR",
    "newIds": [
      "plan_conectividad"
    ],
    "justification": "Tres acciones de conectividad para un mismo efecto."
  },
  {
    "oldId": "programa_alimentario",
    "oldName": "Programa Alimentario",
    "oldCategory": "social",
    "decision": "MODIFICAR + RENOMBRAR",
    "newIds": [
      "asistencia_alimentaria"
    ],
    "justification": "Diferenciada por timing: bonus corto, sin gasto permanente."
  },
  {
    "oldId": "tercera_edad",
    "oldName": "Asistencia a la Tercera Edad",
    "oldCategory": "social",
    "decision": "MODIFICAR + RENOMBRAR",
    "newIds": [
      "bono_jubilados"
    ],
    "justification": "Explícitos grupales eliminados."
  },
  {
    "oldId": "igualdad_genero",
    "oldName": "Plan de Igualdad de Género",
    "oldCategory": "social",
    "decision": "MODIFICAR",
    "newIds": [
      "genero_y_cuidados"
    ],
    "justification": "Absorbe el hueco de 'cuidados'."
  },
  {
    "oldId": "transporte_publico",
    "oldName": "Transporte Público",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "infraestructura_vial"
    ],
    "justification": "En el MVP no se distingue de obra vial a nivel de indicador."
  },
  {
    "oldId": "energia_renovable",
    "oldName": "Energía Renovable",
    "oldCategory": "infraestructura",
    "decision": "MODIFICAR",
    "newIds": [
      "energia_renovable"
    ],
    "justification": "Se conserva por el trade-off con desarrollo extractivo."
  },
  {
    "oldId": "construccion_hospitales",
    "oldName": "Construcción de Hospitales",
    "oldCategory": "infraestructura",
    "decision": "MODIFICAR",
    "newIds": [
      "construccion_hospitales"
    ],
    "justification": "Pasa a categoría Social; efecto tardío + gasto de funcionamiento."
  },
  {
    "oldId": "viviendas_rurales",
    "oldName": "Desarrollo de Viviendas Rurales",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "plan_viviendas"
    ],
    "justification": "Mismo indicador (PSOC)."
  },
  {
    "oldId": "modernizacion_aeropuertos",
    "oldName": "Modernización de Aeropuertos",
    "oldCategory": "infraestructura",
    "decision": "ELIMINAR",
    "newIds": [],
    "justification": "Nicho; 2 prereqs para un efecto genérico. Sin función sistémica propia."
  },
  {
    "oldId": "red_comunicaciones",
    "oldName": "Red de Comunicaciones",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "plan_conectividad"
    ],
    "justification": "Redundante."
  },
  {
    "oldId": "reforestacion",
    "oldName": "Programa de Reforestación",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "proteccion_ambiental"
    ],
    "justification": "Mismo actor e indicador."
  },
  {
    "oldId": "infraestructura_vial",
    "oldName": "Mejorar Infraestructura Vial",
    "oldCategory": "infraestructura",
    "decision": "MODIFICAR",
    "newIds": [
      "infraestructura_vial"
    ],
    "justification": "Caso modelo de efectos inmediatos, diferidos y persistentes."
  },
  {
    "oldId": "tratamiento_agua",
    "oldName": "Plantas de Tratamiento de Agua",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "obras_hidricas"
    ],
    "justification": "Se une a plan_hidrico."
  },
  {
    "oldId": "red_gas",
    "oldName": "Red de Gas Natural",
    "oldCategory": "infraestructura",
    "decision": "MODIFICAR + RENOMBRAR",
    "newIds": [
      "infraestructura_energetica"
    ],
    "justification": "Se conecta con EXTE y con el desarrollo energético."
  },
  {
    "oldId": "estudio_factibilidad",
    "oldName": "Estudio de factibilidad",
    "oldCategory": "infraestructura",
    "decision": "CONSERVAR",
    "newIds": [
      "estudio_factibilidad"
    ],
    "justification": "Raíz del árbol. Se formaliza como FLAG que vence en 6 turnos."
  },
  {
    "oldId": "plan_hidrico",
    "oldName": "Plan Hídrico",
    "oldCategory": "infraestructura",
    "decision": "FUSIONAR",
    "newIds": [
      "obras_hidricas"
    ],
    "justification": "Riego + saneamiento en una acción."
  },
  {
    "oldId": "mantenimiento_urbano",
    "oldName": "Mantenimiento Urbano",
    "oldCategory": "infraestructura",
    "decision": "MODIFICAR + RENOMBRAR",
    "newIds": [
      "mantenimiento_infraestructura"
    ],
    "justification": "'Urbano/municipal' es de intendente. A escala nacional: frena depreciación."
  },
  {
    "oldId": "plan_conectividad",
    "oldName": "Plan de Conectividad",
    "oldCategory": "infraestructura",
    "decision": "CONSERVAR (absorbe)",
    "newIds": [
      "plan_conectividad"
    ],
    "justification": "Absorbe inclusion_digital y red_comunicaciones."
  },
  {
    "oldId": "acuerdo_sindical",
    "oldName": "Acuerdo Sindical",
    "oldCategory": "diplomacia",
    "decision": "REEMPLAZAR",
    "newIds": [
      "reunion",
      "negociacion",
      "acuerdo",
      "sindicatos",
      "pacto_social"
    ],
    "justification": "Un acuerdo no puede ser un botón pagable: pasa al sistema de relación."
  },
  {
    "oldId": "alianza_politica",
    "oldName": "Alianza Política",
    "oldCategory": "diplomacia",
    "decision": "MODIFICAR",
    "newIds": [
      "ampliar_coalicion"
    ],
    "justification": "CD 1 y +10 pop = spam. Ahora cuesta cohesión propia y da LEG."
  },
  {
    "oldId": "tratado_comercio",
    "oldName": "Tratado de Libre Comercio",
    "oldCategory": "diplomacia",
    "decision": "MODIFICAR",
    "newIds": [
      "tratado_comercio"
    ],
    "justification": "Prereq 'empresarios≥60' → agenda_internacional + LEY."
  },
  {
    "oldId": "cooperacion_internacional",
    "oldName": "Cooperación Internacional",
    "oldCategory": "diplomacia",
    "decision": "FUSIONAR",
    "newIds": [
      "agenda_internacional"
    ],
    "justification": "Sin sistema internacional en el MVP."
  },
  {
    "oldId": "acuerdo_ambiental",
    "oldName": "Acuerdo Ambiental",
    "oldCategory": "diplomacia",
    "decision": "FUSIONAR",
    "newIds": [
      "proteccion_ambiental"
    ],
    "justification": null
  },
  {
    "oldId": "participacion_cumbres",
    "oldName": "Participación en Cumbres",
    "oldCategory": "diplomacia",
    "decision": "FUSIONAR",
    "newIds": [
      "agenda_internacional"
    ],
    "justification": null
  },
  {
    "oldId": "mediacion_conflictos",
    "oldName": "Mediación en Conflictos",
    "oldCategory": "diplomacia",
    "decision": "ELIMINAR (fusionada)",
    "newIds": [
      "agenda_internacional"
    ],
    "justification": "No hay conflictos regionales modelados."
  },
  {
    "oldId": "seguridad_ciudadana",
    "oldName": "Seguridad Ciudadana",
    "oldCategory": "seguridad",
    "decision": "MODIFICAR",
    "newIds": [
      "seguridad_ciudadana"
    ],
    "justification": "Absorbe sistema_vigilancia."
  },
  {
    "oldId": "lucha_narcotrafico",
    "oldName": "Lucha contra el Narcotráfico",
    "oldCategory": "seguridad",
    "decision": "MODIFICAR",
    "newIds": [
      "lucha_narcotrafico"
    ],
    "justification": "Empeora antes de mejorar; prereq justicia conservado."
  },
  {
    "oldId": "programa_desarme",
    "oldName": "Programa de Desarme",
    "oldCategory": "seguridad",
    "decision": "FUSIONAR",
    "newIds": [
      "prevencion_comunitaria"
    ],
    "justification": null
  },
  {
    "oldId": "fortalecimiento_justicia",
    "oldName": "Fortalecimiento de la Justicia",
    "oldCategory": "seguridad",
    "decision": "MODIFICAR",
    "newIds": [
      "fortalecimiento_justicia"
    ],
    "justification": "Pasa a LEY."
  },
  {
    "oldId": "sistema_vigilancia",
    "oldName": "Sistema de Vigilancia",
    "oldCategory": "seguridad",
    "decision": "FUSIONAR",
    "newIds": [
      "seguridad_ciudadana"
    ],
    "justification": null
  },
  {
    "oldId": "policia_proximidad",
    "oldName": "Policía de Proximidad",
    "oldCategory": "seguridad",
    "decision": "FUSIONAR",
    "newIds": [
      "prevencion_comunitaria"
    ],
    "justification": null
  },
  {
    "oldId": "prevencion_delito",
    "oldName": "Prevención del Delito",
    "oldCategory": "seguridad",
    "decision": "FUSIONAR",
    "newIds": [
      "prevencion_comunitaria"
    ],
    "justification": null
  },
  {
    "oldId": "programa_cultural",
    "oldName": "Programa Cultural",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "fomento_cultural"
    ],
    "justification": "8 acciones culturales vs 1 de ciencia: sobrerrepresentación."
  },
  {
    "oldId": "festival_arte",
    "oldName": "Festival Nacional de Arte",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "fomento_cultural"
    ],
    "justification": null
  },
  {
    "oldId": "patrimonio_historico",
    "oldName": "Protección del Patrimonio",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "turismo_y_patrimonio"
    ],
    "justification": null
  },
  {
    "oldId": "red_bibliotecas",
    "oldName": "Red de Bibliotecas",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "inversion_educativa"
    ],
    "justification": null
  },
  {
    "oldId": "centros_culturales",
    "oldName": "Centros Culturales",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "fomento_cultural"
    ],
    "justification": null
  },
  {
    "oldId": "escuelas_arte",
    "oldName": "Escuelas de Arte",
    "oldCategory": "cultura",
    "decision": "ELIMINAR",
    "newIds": [],
    "justification": "Sin función sistémica distinta."
  },
  {
    "oldId": "museos_interactivos",
    "oldName": "Museos Interactivos",
    "oldCategory": "cultura",
    "decision": "ELIMINAR",
    "newIds": [],
    "justification": "Sin función sistémica distinta."
  },
  {
    "oldId": "festivales_regionales",
    "oldName": "Festivales Regionales",
    "oldCategory": "cultura",
    "decision": "FUSIONAR",
    "newIds": [
      "fomento_cultural"
    ],
    "justification": null
  },
  {
    "oldId": "promover_educacion",
    "oldName": "Promover Educación",
    "oldCategory": "educacion",
    "decision": "REEMPLAZAR",
    "newIds": [
      "reforma_educativa"
    ],
    "justification": "Se diferencia de inversión: LEY, lenta, con riesgo de conflicto docente."
  },
  {
    "oldId": "fomentar_turismo",
    "oldName": "Fomentar Turismo",
    "oldCategory": "turismo",
    "decision": "FUSIONAR",
    "newIds": [
      "turismo_y_patrimonio"
    ],
    "justification": null
  },
  {
    "oldId": "desarrollar_tecnologia",
    "oldName": "Desarrollar Tecnología",
    "oldCategory": "tecnologia",
    "decision": "DIVIDIR",
    "newIds": [
      "financiamiento_ciencia",
      "economia_conocimiento"
    ],
    "justification": "Una sola acción para todo el desarrollo: se separa oferta (ciencia) y demanda (economía del conocimiento)."
  }
];
