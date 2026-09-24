// Data transcribed from GobernArg_Motor_Causal_Propuesta_2026-09-24.xlsx (v0.1).
// No runtime dependence on the workbook, legacy registry, or text matching.
import type { IndicatorDefinition, ActorDefinition, PolicyDefinition } from './types';

export const INDICATORS = [
  {
    "id": "inflacion",
    "name": "Presión inflacionaria",
    "category": "Economía",
    "description": "Inestabilidad de precios y contratos. Índice de presión, no tasa porcentual.",
    "high": "Precios difíciles de anticipar",
    "low": "Precios estables",
    "initial": 40,
    "notes": "Se observa incertidumbre, no se vuelve a cobrar la pérdida de ingreso."
  },
  {
    "id": "actividad",
    "name": "Actividad y empleo",
    "category": "Economía",
    "description": "Oportunidades productivas y laborales. Proxy único de producción y absorción de trabajo.",
    "high": "Demanda y oportunidades laborales amplias",
    "low": "Recesión y escasez de trabajo",
    "initial": 50,
    "notes": "Fusión MVP: no representa crecimiento sin empleo. Separar sólo si el playtest lo exige."
  },
  {
    "id": "ingreso_real",
    "name": "Poder adquisitivo",
    "category": "Economía",
    "description": "Capacidad de compra del ingreso laboral y de hogares, antes del acceso a prestaciones en especie.",
    "high": "Mejor capacidad de compra",
    "low": "Ingresos insuficientes",
    "initial": 45,
    "notes": "No incluye cobertura social: transferencias se abstraen en protección para no duplicarlas."
  },
  {
    "id": "credito",
    "name": "Crédito productivo",
    "category": "Economía",
    "description": "Acceso efectivo de hogares y empresas a financiamiento sostenible. No rentabilidad bancaria ni tasa de interés.",
    "high": "Financiamiento accesible y solvente",
    "low": "Racionamiento de crédito",
    "initial": 45,
    "notes": "El sector financiero valora solvencia y volumen. No gana automáticamente con crédito caro."
  },
  {
    "id": "fiscal",
    "name": "Margen fiscal estructural",
    "category": "Economía",
    "description": "Índice derivado de ingresos, gasto recurrente, intereses y exposición de deuda. Nunca se modifica con un efecto directo.",
    "high": "Financiamiento sostenible de compromisos",
    "low": "Rigidez fiscal o carga de deuda excesiva",
    "initial": 58,
    "notes": "Separar caja y resultado del período. La deuda financia caja, no ingresos."
  },
  {
    "id": "externo",
    "name": "Capacidad exportadora",
    "category": "Economía",
    "description": "Capacidad de vender al exterior y sostener el abastecimiento externo. Proxy de competitividad y logística.",
    "high": "Menos restricciones externas",
    "low": "Cuellos exportadores y externos",
    "initial": 45,
    "notes": "No es tipo de cambio ni reservas. Se excluye una simulación cambiaria."
  },
  {
    "id": "infraestructura",
    "name": "Infraestructura operativa",
    "category": "Estado y servicios",
    "description": "Disponibilidad de redes de transporte, agua, energía y conectividad en condiciones de uso.",
    "high": "Redes confiables",
    "low": "Cuellos y deterioro",
    "initial": 45,
    "notes": "Conectividad integrada. Una obra no da recaudación automática por categoría."
  },
  {
    "id": "educacion",
    "name": "Educación",
    "category": "Estado y servicios",
    "description": "Acceso y calidad de formación general, técnica y alfabetización.",
    "high": "Aprendizaje y acceso amplios",
    "low": "Deterioro educativo",
    "initial": 50,
    "notes": "No se suma automáticamente a empleo: su retorno es lento y acotado."
  },
  {
    "id": "salud",
    "name": "Salud",
    "category": "Estado y servicios",
    "description": "Cobertura y calidad sanitaria efectiva, incluyendo prevención y hospitales operativos.",
    "high": "Atención accesible y efectiva",
    "low": "Necesidades sanitarias sin respuesta",
    "initial": 50,
    "notes": "Se conserva separado de educación porque compiten por presupuesto."
  },
  {
    "id": "proteccion",
    "name": "Protección social y vivienda",
    "category": "Estado y servicios",
    "description": "Acceso a vivienda, alimentación y apoyos a hogares vulnerables.",
    "high": "Menor desprotección",
    "low": "Privaciones graves",
    "initial": 45,
    "notes": "No replica ingreso real. Representa prestaciones y cobertura, no salario."
  },
  {
    "id": "seguridad",
    "name": "Seguridad cotidiana",
    "category": "Instituciones y sociedad",
    "description": "Reducción de exposición al delito y capacidad de respuesta preventiva.",
    "high": "Menor victimización",
    "low": "Delito y vulnerabilidad",
    "initial": 45,
    "notes": "No incluye represión del disenso. Protesta no equivale a delito."
  },
  {
    "id": "ciencia",
    "name": "Ciencia e innovación",
    "category": "Desarrollo",
    "description": "Capacidad de investigación, continuidad de equipos y transferencia tecnológica.",
    "high": "Equipos y capacidades sostenidos",
    "low": "Pérdida de capacidades",
    "initial": 40,
    "notes": "Se conserva por identidad jugable de investigadores y horizontes largos."
  },
  {
    "id": "derechos",
    "name": "Garantías e integridad pública",
    "category": "Instituciones y sociedad",
    "description": "Protección efectiva de derechos, debido proceso, transparencia y control de poder.",
    "high": "Garantías y controles efectivos",
    "low": "Abusos y arbitrariedad",
    "initial": 55,
    "notes": "Fusión acotada. No mide aprobación política, cultura ni popularidad."
  },
  {
    "id": "ambiente",
    "name": "Sostenibilidad ambiental",
    "category": "Instituciones y sociedad",
    "description": "Estado ambiental y capacidad de sostener proyectos sin daños acumulados.",
    "high": "Recursos y ecosistemas preservados",
    "low": "Deterioro y conflictos por daño",
    "initial": 50,
    "notes": "Evaluación ambiental se aplica por proyecto, no veto universal."
  }
] satisfies IndicatorDefinition[];

export const ACTORS = [
  {
    "id": "industria",
    "name": "Industria y grandes empresas",
    "family": "Producción",
    "influence": 8,
    "electoralWeight": 5,
    "interactionDifficulty": 7,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "credito",
        "weight": 8
      },
      {
        "indicatorId": "actividad",
        "weight": 8
      },
      {
        "indicatorId": "infraestructura",
        "weight": 7
      },
      {
        "indicatorId": "externo",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Inversión ejecutada",
      "target": "actividad",
      "magnitude": 2
    },
    "notes": "Inversión diferida y acotada. No rentabilidad financiera."
  },
  {
    "id": "agro",
    "name": "Sector agropecuario",
    "family": "Producción",
    "influence": 7,
    "electoralWeight": 6,
    "interactionDifficulty": 6,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "externo",
        "weight": 10
      },
      {
        "indicatorId": "infraestructura",
        "weight": 8
      },
      {
        "indicatorId": "ambiente",
        "weight": 5
      },
      {
        "indicatorId": "credito",
        "weight": 5
      }
    ],
    "channel": {
      "name": "Oferta exportable",
      "target": "externo",
      "magnitude": 2
    },
    "notes": "Ambiente representa sostenibilidad productiva, no adhesión a toda regulación."
  },
  {
    "id": "financiero",
    "name": "Sector financiero",
    "family": "Producción",
    "influence": 8,
    "electoralWeight": 3,
    "interactionDifficulty": 8,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "fiscal",
        "weight": 10
      },
      {
        "indicatorId": "inflacion",
        "weight": -8
      },
      {
        "indicatorId": "credito",
        "weight": 7
      },
      {
        "indicatorId": "derechos",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Oferta de crédito",
      "target": "credito",
      "magnitude": 2
    },
    "notes": "Baja influence 9 a 8: limitar dominio sistémico y exposición."
  },
  {
    "id": "sindicatos",
    "name": "Sindicatos",
    "family": "Trabajo",
    "influence": 8,
    "electoralWeight": 7,
    "interactionDifficulty": 7,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "ingreso_real",
        "weight": 10
      },
      {
        "indicatorId": "actividad",
        "weight": 9
      },
      {
        "indicatorId": "proteccion",
        "weight": 6
      },
      {
        "indicatorId": "derechos",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Conflicto laboral",
      "target": "actividad",
      "magnitude": 2
    },
    "notes": "Empleo y salario pesan distinto, sin castigo por felicidad empresarial."
  },
  {
    "id": "pymes",
    "name": "PyMEs y comercio",
    "family": "Producción",
    "influence": 6,
    "electoralWeight": 7,
    "interactionDifficulty": 5,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "credito",
        "weight": 10
      },
      {
        "indicatorId": "actividad",
        "weight": 9
      },
      {
        "indicatorId": "infraestructura",
        "weight": 5
      },
      {
        "indicatorId": "inflacion",
        "weight": -5
      }
    ],
    "channel": {
      "name": "Contratación y actividad local",
      "target": "actividad",
      "magnitude": 2
    },
    "notes": "Peso 6 a 7. Representa exposición electoral, no cantidad literal de empresas."
  },
  {
    "id": "clase_media",
    "name": "Hogares de ingresos medios",
    "family": "Hogares",
    "influence": 5,
    "electoralWeight": 10,
    "interactionDifficulty": 4,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "ingreso_real",
        "weight": 10
      },
      {
        "indicatorId": "seguridad",
        "weight": 7
      },
      {
        "indicatorId": "educacion",
        "weight": 6
      },
      {
        "indicatorId": "inflacion",
        "weight": -4
      }
    ],
    "channel": {
      "name": "Componente electoral",
      "target": "electoral",
      "magnitude": 0
    },
    "notes": "Influence 7 a 5: segmento difuso, no organización capaz de huelga unificada."
  },
  {
    "id": "cooperativas",
    "name": "Cooperativas y economía social",
    "family": "Trabajo",
    "influence": 4,
    "electoralWeight": 4,
    "interactionDifficulty": 4,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "credito",
        "weight": 7
      },
      {
        "indicatorId": "actividad",
        "weight": 7
      },
      {
        "indicatorId": "proteccion",
        "weight": 9
      },
      {
        "indicatorId": "derechos",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Redes de contención",
      "target": "proteccion",
      "magnitude": 1.5
    },
    "notes": "Baja 5/5 a 4/4 por solapamiento con organizaciones sociales."
  },
  {
    "id": "estudiantes",
    "name": "Estudiantes",
    "family": "Conocimiento",
    "influence": 5,
    "electoralWeight": 5,
    "interactionDifficulty": 3,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "educacion",
        "weight": 10
      },
      {
        "indicatorId": "ingreso_real",
        "weight": 5
      },
      {
        "indicatorId": "derechos",
        "weight": 7
      },
      {
        "indicatorId": "ciencia",
        "weight": 3
      }
    ],
    "channel": {
      "name": "Movilización estudiantil",
      "target": "implementation.educacion",
      "magnitude": 0.1
    },
    "notes": "Peso 6 a 5; movilización retrasa ejecución, no castiga votos dos veces."
  },
  {
    "id": "docentes",
    "name": "Docentes",
    "family": "Conocimiento",
    "influence": 6,
    "electoralWeight": 6,
    "interactionDifficulty": 5,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "educacion",
        "weight": 10
      },
      {
        "indicatorId": "ingreso_real",
        "weight": 9
      },
      {
        "indicatorId": "derechos",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Continuidad educativa",
      "target": "educacion",
      "magnitude": 1.5
    },
    "notes": "Canal separado de conflicto laboral general; cap por indicador."
  },
  {
    "id": "cientificos",
    "name": "Científicos e investigadores",
    "family": "Conocimiento",
    "influence": 4,
    "electoralWeight": 2,
    "interactionDifficulty": 5,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "ciencia",
        "weight": 10
      },
      {
        "indicatorId": "educacion",
        "weight": 7
      },
      {
        "indicatorId": "derechos",
        "weight": 5
      }
    ],
    "channel": {
      "name": "Continuidad de equipos",
      "target": "ciencia",
      "magnitude": 1.5
    },
    "notes": "6/3 a 4/2. Retorno demorado; no misma presión coyuntural que sindicatos."
  },
  {
    "id": "organizaciones",
    "name": "Organizaciones sociales",
    "family": "Sociedad civil",
    "influence": 6,
    "electoralWeight": 6,
    "interactionDifficulty": 5,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "proteccion",
        "weight": 10
      },
      {
        "indicatorId": "salud",
        "weight": 7
      },
      {
        "indicatorId": "actividad",
        "weight": 6
      },
      {
        "indicatorId": "derechos",
        "weight": 5
      }
    ],
    "channel": {
      "name": "Contención y movilización",
      "target": "proteccion",
      "magnitude": 1.5
    },
    "notes": "Representación imperfecta de hogares vulnerables: riesgo a validar."
  },
  {
    "id": "ddhh",
    "name": "Organizaciones de derechos",
    "family": "Sociedad civil",
    "influence": 5,
    "electoralWeight": 3,
    "interactionDifficulty": 6,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "derechos",
        "weight": 10
      },
      {
        "indicatorId": "seguridad",
        "weight": 3
      },
      {
        "indicatorId": "proteccion",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Control institucional",
      "target": "implementation.seguridad",
      "magnitude": 0.15
    },
    "notes": "6/5 a 5/3; observan garantías, no son propietarios del indicador."
  },
  {
    "id": "ambientalistas",
    "name": "Organizaciones ambientales",
    "family": "Sociedad civil",
    "influence": 4,
    "electoralWeight": 3,
    "interactionDifficulty": 5,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "ambiente",
        "weight": 10
      },
      {
        "indicatorId": "derechos",
        "weight": 5
      },
      {
        "indicatorId": "salud",
        "weight": 3
      }
    ],
    "channel": {
      "name": "Condiciones de viabilidad",
      "target": "implementation.obras",
      "magnitude": 0.15
    },
    "notes": "6/5 a 4/3; inciden en obra de riesgo, no bloquean todo el Estado."
  },
  {
    "id": "cultura",
    "name": "Sector cultural",
    "family": "Sociedad civil",
    "influence": 4,
    "electoralWeight": 3,
    "interactionDifficulty": 4,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "derechos",
        "weight": 8
      },
      {
        "indicatorId": "educacion",
        "weight": 6
      },
      {
        "indicatorId": "ingreso_real",
        "weight": 5
      }
    ],
    "channel": {
      "name": "Agenda y deliberación",
      "target": "meetingCost.civil",
      "magnitude": 1
    },
    "notes": "5/4 a 4/3. Canal de información; sin popularidad extra."
  },
  {
    "id": "oficialismo",
    "name": "Oficialismo / partido propio",
    "family": "Política",
    "influence": 8,
    "electoralWeight": 0,
    "interactionDifficulty": 4,
    "initialRelationship": 60,
    "sensitivities": [
      {
        "indicatorId": "derechos",
        "weight": 6
      },
      {
        "indicatorId": "actividad",
        "weight": 8
      },
      {
        "indicatorId": "fiscal",
        "weight": 6
      },
      {
        "indicatorId": "proteccion",
        "weight": 5
      }
    ],
    "channel": {
      "name": "Disciplina de bancada",
      "target": "legislativo",
      "magnitude": 40
    },
    "notes": "Peso 7 a 0: estructura política se canaliza por bancas, no vuelve a sumar al voto social."
  },
  {
    "id": "aliados",
    "name": "Aliados / coalición",
    "family": "Política",
    "influence": 7,
    "electoralWeight": 0,
    "interactionDifficulty": 7,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "derechos",
        "weight": 8
      },
      {
        "indicatorId": "fiscal",
        "weight": 7
      },
      {
        "indicatorId": "infraestructura",
        "weight": 6
      }
    ],
    "channel": {
      "name": "Cooperación parlamentaria",
      "target": "legislativo",
      "magnitude": 15
    },
    "notes": "Peso 4 a 0. Bancas 15; el acuerdo activa su disposición, no satisfacción comprada."
  },
  {
    "id": "oposicion",
    "name": "Oposición democrática",
    "family": "Política",
    "influence": 7,
    "electoralWeight": 0,
    "interactionDifficulty": 8,
    "initialRelationship": 30,
    "sensitivities": [
      {
        "indicatorId": "derechos",
        "weight": 10
      },
      {
        "indicatorId": "fiscal",
        "weight": 6
      },
      {
        "indicatorId": "seguridad",
        "weight": 4
      }
    ],
    "channel": {
      "name": "Negociación institucional",
      "target": "legislativo",
      "magnitude": 45
    },
    "notes": "Peso 7 a 0. Satisfecha con garantías no significa apoyo al Ejecutivo. Bancas 45."
  },
  {
    "id": "gobernadores",
    "name": "Gobernadores y provincias",
    "family": "Política",
    "influence": 8,
    "electoralWeight": 0,
    "interactionDifficulty": 7,
    "initialRelationship": 45,
    "sensitivities": [
      {
        "indicatorId": "infraestructura",
        "weight": 9
      },
      {
        "indicatorId": "salud",
        "weight": 7
      },
      {
        "indicatorId": "educacion",
        "weight": 7
      },
      {
        "indicatorId": "fiscal",
        "weight": 6
      }
    ],
    "channel": {
      "name": "Ejecución federal",
      "target": "implementation.federal",
      "magnitude": 0.2
    },
    "notes": "Peso 8 a 0: la implementación afecta resultados, sin sumar de nuevo votos territoriales."
  }
] satisfies ActorDefinition[];

export const POLICIES: PolicyDefinition[] = [
  {
    "id": "emitir_dinero",
    "name": "Financiamiento monetario",
    "description": "Aporta liquidez al Tesoro. La reiteración presiona precios.",
    "category": "Economía",
    "strategy": "Resuelve caja hoy a cambio de riesgo acumulado.",
    "actionCost": 1,
    "cooldown": 1,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e001",
        "actionId": "emitir_dinero",
        "kind": "ledger",
        "target": "financing_issue",
        "magnitude": 300,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Crea caja. No es recaudación."
      },
      {
        "id": "e002",
        "actionId": "emitir_dinero",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 2,
        "start": 0,
        "duration": 2,
        "operation": "offset",
        "explanation": "Impulso temporal; al expirar se retira, no se acumula cada turno.",
        "conditions": [],
        "stack": "renew"
      },
      {
        "id": "e003",
        "actionId": "emitir_dinero",
        "kind": "indicator",
        "target": "inflacion",
        "magnitude": 1,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "Base diferida.",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e004",
        "actionId": "emitir_dinero",
        "kind": "indicator",
        "target": "inflacion",
        "magnitude": 1,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "Sobrecarga según usos en ventana; se sustituye por la expresión R_EMISION.",
        "conditions": [],
        "stack": "sum",
        "repetition": "emission"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "emitir_dinero"
    ]
  },
  {
    "id": "mejorar_recaudacion",
    "name": "Modernizar la recaudación",
    "description": "Reduce evasión y fricción administrativa.",
    "category": "Economía",
    "strategy": "Invierte antes de recaudar; no es subir alícuotas.",
    "actionCost": 1,
    "cooldown": 16,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e005",
        "actionId": "mejorar_recaudacion",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e006",
        "actionId": "mejorar_recaudacion",
        "kind": "ledger",
        "target": "revenue_recurring",
        "magnitude": 70,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e007",
        "actionId": "mejorar_recaudacion",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "mejorar_recaudacion"
    ]
  },
  {
    "id": "subsidios_industriales",
    "name": "Programa industrial temporal",
    "description": "Cofinancia reconversión por cuatro turnos.",
    "category": "Economía",
    "strategy": "Sostiene actividad con costo recurrente y presión ambiental.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e008",
        "actionId": "subsidios_industriales",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 120,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e009",
        "actionId": "subsidios_industriales",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 60,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e010",
        "actionId": "subsidios_industriales",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 4,
        "start": 1,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e011",
        "actionId": "subsidios_industriales",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": -1,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "subsidios_industriales"
    ]
  },
  {
    "id": "reforma_impositiva",
    "name": "Reforma tributaria recaudatoria",
    "description": "Amplía base y progresividad con mayor recaudación estructural.",
    "category": "Economía",
    "strategy": "Mejora margen fiscal a costa de ingreso disponible.",
    "actionCost": 1,
    "cooldown": 16,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e012",
        "actionId": "reforma_impositiva",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e013",
        "actionId": "reforma_impositiva",
        "kind": "ledger",
        "target": "revenue_recurring",
        "magnitude": 100,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e014",
        "actionId": "reforma_impositiva",
        "kind": "indicator",
        "target": "ingreso_real",
        "magnitude": -3,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e015",
        "actionId": "reforma_impositiva",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": -2,
        "start": 1,
        "duration": 2,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "action",
        "actionId": "mejorar_recaudacion"
      },
      {
        "kind": "legislative",
        "minimum": 51
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "reforma_impositiva"
    ]
  },
  {
    "id": "incentivos_exportacion",
    "name": "Facilitación exportadora",
    "description": "Simplifica logística y certificación para vender afuera.",
    "category": "Economía",
    "strategy": "Mejora capacidad externa con resultado demorado.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e016",
        "actionId": "incentivos_exportacion",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 160,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e017",
        "actionId": "incentivos_exportacion",
        "kind": "indicator",
        "target": "externo",
        "magnitude": 5,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e018",
        "actionId": "incentivos_exportacion",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 2,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "incentivos_exportacion"
    ]
  },
  {
    "id": "control_precios",
    "name": "Acuerdo temporal de precios",
    "description": "Congela temporalmente una canasta bajo acuerdo verificable.",
    "category": "Economía",
    "strategy": "Alivia presión observada, pero puede tensionar oferta.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e019",
        "actionId": "control_precios",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 60,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e020",
        "actionId": "control_precios",
        "kind": "indicator",
        "target": "inflacion",
        "magnitude": -4,
        "start": 0,
        "duration": 2,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e021",
        "actionId": "control_precios",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": -2,
        "start": 1,
        "duration": 2,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "agreement",
        "templateId": "acuerdo_precios"
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "control_precios"
    ]
  },
  {
    "id": "aumento_salarial",
    "name": "Salarios públicos y piso salarial",
    "description": "Actualiza salarios públicos y referencia mínima tras negociación.",
    "category": "Economía",
    "strategy": "Mejora compra con gasto recurrente y presión según contexto.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e022",
        "actionId": "aumento_salarial",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 80,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e023",
        "actionId": "aumento_salarial",
        "kind": "indicator",
        "target": "ingreso_real",
        "magnitude": 5,
        "start": 0,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e024",
        "actionId": "aumento_salarial",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 60,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e025",
        "actionId": "aumento_salarial",
        "kind": "indicator",
        "target": "inflacion",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "Mayor traslado cuando actividad es alta.",
        "conditions": [
          {
            "indicatorId": "actividad",
            "operator": ">=",
            "value": 55.0
          }
        ],
        "stack": "sum"
      }
    ],
    "requirements": [
      {
        "kind": "meeting",
        "actorId": "sindicatos",
        "age": 4
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "aumento_salarial"
    ]
  },
  {
    "id": "reduccion_gasto",
    "name": "Ajuste de programas y planteles",
    "description": "Reduce gasto recurrente y cobertura efectiva.",
    "category": "Economía",
    "strategy": "Recupera margen fiscal con costo social.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e026",
        "actionId": "reduccion_gasto",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 40,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e027",
        "actionId": "reduccion_gasto",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": -70,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e028",
        "actionId": "reduccion_gasto",
        "kind": "indicator",
        "target": "proteccion",
        "magnitude": -4,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e029",
        "actionId": "reduccion_gasto",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": -3,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e030",
        "actionId": "reduccion_gasto",
        "kind": "indicator",
        "target": "salud",
        "magnitude": -2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "reduccion_gasto"
    ]
  },
  {
    "id": "prestamo_internacional",
    "name": "Préstamo externo a ocho turnos",
    "description": "Obtiene 800 U con interés de 24 U por turno y amortización final.",
    "category": "Economía",
    "strategy": "Más caja y vencimiento explícito. No crea margen fiscal.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e031",
        "actionId": "prestamo_internacional",
        "kind": "loan",
        "target": "external",
        "magnitude": 800,
        "start": 0,
        "duration": 8,
        "operation": "originate",
        "explanation": "Contrato: principal 800, interés 24 en t+1..t+8, principal vence t+8."
      }
    ],
    "requirements": [
      {
        "kind": "action",
        "actionId": "mejorar_recaudacion"
      },
      {
        "kind": "indicator",
        "indicatorId": "fiscal",
        "operator": ">=",
        "value": 35
      },
      {
        "kind": "indicator",
        "indicatorId": "externo",
        "operator": ">=",
        "value": 35
      },
      {
        "kind": "debt",
        "maximum": 1600
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "prestamo_internacional"
    ]
  },
  {
    "id": "prestamo_local",
    "name": "Préstamo local a seis turnos",
    "description": "Obtiene 500 U. Interés 20 U por turno; principal al sexto.",
    "category": "Economía",
    "strategy": "Menor plazo y desplazamiento temporal de crédito privado.",
    "actionCost": 1,
    "cooldown": 3,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e032",
        "actionId": "prestamo_local",
        "kind": "loan",
        "target": "domestic",
        "magnitude": 500,
        "start": 0,
        "duration": 6,
        "operation": "originate",
        "explanation": "Contrato: principal 500, interés 20 en t+1..t+6, principal vence t+6."
      },
      {
        "id": "e033",
        "actionId": "prestamo_local",
        "kind": "indicator",
        "target": "credito",
        "magnitude": -3,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "fiscal",
        "operator": ">=",
        "value": 25
      },
      {
        "kind": "debt",
        "maximum": 1600
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "prestamo_local"
    ]
  },
  {
    "id": "atraccion_inversiones",
    "name": "Garantías para inversión productiva",
    "description": "Financia preparación de proyectos y reglas de ejecución.",
    "category": "Economía",
    "strategy": "Beneficio sólo si hay crédito y garantías públicas suficientes.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e034",
        "actionId": "atraccion_inversiones",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 130,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e035",
        "actionId": "atraccion_inversiones",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 5,
        "start": 2,
        "duration": 4,
        "operation": "offset",
        "explanation": "Inversión es efecto, no otro índice.",
        "conditions": [
          {
            "indicatorId": "credito",
            "operator": ">=",
            "value": 40.0
          },
          {
            "indicatorId": "derechos",
            "operator": ">=",
            "value": 45.0
          }
        ],
        "stack": "reject"
      },
      {
        "id": "e036",
        "actionId": "atraccion_inversiones",
        "kind": "indicator",
        "target": "externo",
        "magnitude": 2,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [
          {
            "indicatorId": "credito",
            "operator": ">=",
            "value": 40.0
          },
          {
            "indicatorId": "derechos",
            "operator": ">=",
            "value": 45.0
          }
        ],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "atraccion_inversiones"
    ]
  },
  {
    "id": "plan_viviendas",
    "name": "Plan federal de vivienda",
    "description": "Construye vivienda priorizando déficit urbano o rural.",
    "category": "Servicios",
    "strategy": "Beneficio de cobertura demorado; paga operación luego.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e037",
        "actionId": "plan_viviendas",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 320,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e038",
        "actionId": "plan_viviendas",
        "kind": "indicator",
        "target": "proteccion",
        "magnitude": 7,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e039",
        "actionId": "plan_viviendas",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 3,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e040",
        "actionId": "plan_viviendas",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 30,
        "start": 3,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "plan_viviendas"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      }
    ],
    "sourceIds": [
      "plan_viviendas",
      "viviendas_rurales"
    ]
  },
  {
    "id": "programa_educativo",
    "name": "Plan educativo y formación docente",
    "description": "Mejora materiales, formación y continuidad educativa.",
    "category": "Servicios",
    "strategy": "Mejora educativa sostenida con operación permanente.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e041",
        "actionId": "programa_educativo",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 200,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e042",
        "actionId": "programa_educativo",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e043",
        "actionId": "programa_educativo",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "programa_educativo",
      "promover_educacion"
    ]
  },
  {
    "id": "salud_preventiva",
    "name": "Atención primaria y prevención",
    "description": "Refuerza prevención y primer nivel.",
    "category": "Servicios",
    "strategy": "Retorno más rápido y pequeño que hospitales.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e044",
        "actionId": "salud_preventiva",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 180,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e045",
        "actionId": "salud_preventiva",
        "kind": "indicator",
        "target": "salud",
        "magnitude": 4,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e046",
        "actionId": "salud_preventiva",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "salud_preventiva"
    ]
  },
  {
    "id": "empleo_joven",
    "name": "Formación e inserción laboral",
    "description": "Conecta formación con primeras contrataciones.",
    "category": "Servicios",
    "strategy": "Retorno laboral limitado por demanda.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e047",
        "actionId": "empleo_joven",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 120,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e048",
        "actionId": "empleo_joven",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 3,
        "start": 1,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e049",
        "actionId": "empleo_joven",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e050",
        "actionId": "empleo_joven",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "empleo_joven"
    ]
  },
  {
    "id": "cobertura_social",
    "name": "Cobertura social y cuidados",
    "description": "Amplía prestaciones a hogares, mayores y personas dependientes.",
    "category": "Servicios",
    "strategy": "Contiene vulnerabilidad con obligación recurrente.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e051",
        "actionId": "cobertura_social",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e052",
        "actionId": "cobertura_social",
        "kind": "indicator",
        "target": "proteccion",
        "magnitude": 6,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e053",
        "actionId": "cobertura_social",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 65,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "cobertura_social",
      "tercera_edad"
    ]
  },
  {
    "id": "alfabetizacion",
    "name": "Alfabetización y educación comunitaria",
    "description": "Recupera aprendizajes básicos donde existe rezago.",
    "category": "Servicios",
    "strategy": "Más eficaz con educación baja.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e054",
        "actionId": "alfabetizacion",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 110,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e055",
        "actionId": "alfabetizacion",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 3,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e056",
        "actionId": "alfabetizacion",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "Refuerzo por brecha de acceso.",
        "conditions": [
          {
            "indicatorId": "educacion",
            "operator": "<",
            "value": 40.0
          }
        ],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "alfabetizacion"
    ]
  },
  {
    "id": "programa_alimentario",
    "name": "Asistencia alimentaria de emergencia",
    "description": "Sostiene cobertura mientras dura una crisis de hogares.",
    "category": "Servicios",
    "strategy": "Rápido pero temporal. No reemplaza vivienda o empleo.",
    "actionCost": 1,
    "cooldown": 3,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e057",
        "actionId": "programa_alimentario",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 80,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e058",
        "actionId": "programa_alimentario",
        "kind": "indicator",
        "target": "proteccion",
        "magnitude": 5,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e059",
        "actionId": "programa_alimentario",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 40,
        "start": 1,
        "duration": 2,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "proteccion",
        "operator": "<",
        "value": 45
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "programa_alimentario"
    ]
  },
  {
    "id": "igualdad_genero",
    "name": "Igualdad, cuidados y acceso a derechos",
    "description": "Remueve barreras de acceso y refuerza atención a violencia.",
    "category": "Instituciones",
    "strategy": "Dos resultados verificables, sin bono ideológico.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e060",
        "actionId": "igualdad_genero",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 120,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e061",
        "actionId": "igualdad_genero",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 4,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e062",
        "actionId": "igualdad_genero",
        "kind": "indicator",
        "target": "proteccion",
        "magnitude": 2,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e063",
        "actionId": "igualdad_genero",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "igualdad_genero"
    ]
  },
  {
    "id": "transporte_publico",
    "name": "Transporte público metropolitano",
    "description": "Cofinancia servicio y conexiones con provincias.",
    "category": "Infraestructura",
    "strategy": "Reduce barreras de acceso, exige operación.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e064",
        "actionId": "transporte_publico",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 260,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e065",
        "actionId": "transporte_publico",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 4,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e066",
        "actionId": "transporte_publico",
        "kind": "indicator",
        "target": "ingreso_real",
        "magnitude": 2,
        "start": 2,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e067",
        "actionId": "transporte_publico",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "transporte_publico"
    ]
  },
  {
    "id": "energia_renovable",
    "name": "Transición energética",
    "description": "Instala capacidad energética con menor impacto.",
    "category": "Infraestructura",
    "strategy": "Lenta y costosa; mejora ambiente y redes.",
    "actionCost": 1,
    "cooldown": 7,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e068",
        "actionId": "energia_renovable",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 400,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e069",
        "actionId": "energia_renovable",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 5,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e070",
        "actionId": "energia_renovable",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": 5,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e071",
        "actionId": "energia_renovable",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 3,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "energia_renovable"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      },
      {
        "kind": "environment",
        "description": "Costo inicial ×0,9 por prioridad ambiental"
      }
    ],
    "sourceIds": [
      "energia_renovable"
    ]
  },
  {
    "id": "construccion_hospitales",
    "name": "Red hospitalaria federal",
    "description": "Construye y dota hospitales.",
    "category": "Infraestructura",
    "strategy": "Gran beneficio sanitario diferido y gasto recurrente alto.",
    "actionCost": 1,
    "cooldown": 8,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e072",
        "actionId": "construccion_hospitales",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 450,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e073",
        "actionId": "construccion_hospitales",
        "kind": "indicator",
        "target": "salud",
        "magnitude": 9,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e074",
        "actionId": "construccion_hospitales",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 55,
        "start": 3,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "construccion_hospitales"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      }
    ],
    "sourceIds": [
      "construccion_hospitales"
    ]
  },
  {
    "id": "plan_conectividad",
    "name": "Conectividad y acceso digital",
    "description": "Integra redes, acceso y alfabetización digital.",
    "category": "Infraestructura",
    "strategy": "Unifica tres acciones redundantes.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e075",
        "actionId": "plan_conectividad",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 260,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e076",
        "actionId": "plan_conectividad",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 4,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e077",
        "actionId": "plan_conectividad",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 2,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e078",
        "actionId": "plan_conectividad",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "plan_conectividad"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      }
    ],
    "sourceIds": [
      "inclusion_digital",
      "red_comunicaciones",
      "plan_conectividad"
    ]
  },
  {
    "id": "reforestacion",
    "name": "Restauración de ecosistemas",
    "description": "Restaura suelos y cobertura vegetal.",
    "category": "Infraestructura",
    "strategy": "Retorno ambiental lento, sin ingreso automático.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e079",
        "actionId": "reforestacion",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 160,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e080",
        "actionId": "reforestacion",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": 6,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e081",
        "actionId": "reforestacion",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 15,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "reforestacion"
    ]
  },
  {
    "id": "infraestructura_vial",
    "name": "Corredores viales productivos",
    "description": "Mejora transporte nacional y acceso a puertos.",
    "category": "Infraestructura",
    "strategy": "Obra demorada que luego exige mantenimiento.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e082",
        "actionId": "infraestructura_vial",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 400,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e083",
        "actionId": "infraestructura_vial",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 2,
        "start": 0,
        "duration": 2,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e084",
        "actionId": "infraestructura_vial",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e085",
        "actionId": "infraestructura_vial",
        "kind": "indicator",
        "target": "externo",
        "magnitude": 3,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e086",
        "actionId": "infraestructura_vial",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": -2,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e087",
        "actionId": "infraestructura_vial",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 30,
        "start": 3,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "infraestructura_vial"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      }
    ],
    "sourceIds": [
      "modernizacion_aeropuertos",
      "infraestructura_vial"
    ]
  },
  {
    "id": "plan_hidrico",
    "name": "Agua segura y resiliencia hídrica",
    "description": "Integra tratamiento de agua y resiliencia ante sequías.",
    "category": "Infraestructura",
    "strategy": "Mejora sanitaria y ambiental; costo de operación.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e088",
        "actionId": "plan_hidrico",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 320,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e089",
        "actionId": "plan_hidrico",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 3,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e090",
        "actionId": "plan_hidrico",
        "kind": "indicator",
        "target": "salud",
        "magnitude": 3,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e091",
        "actionId": "plan_hidrico",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": 3,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e092",
        "actionId": "plan_hidrico",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "plan_hidrico"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      },
      {
        "kind": "water",
        "description": "Costo inicial ×0,9 por fondos de emergencia"
      }
    ],
    "sourceIds": [
      "tratamiento_agua",
      "plan_hidrico"
    ]
  },
  {
    "id": "red_gas",
    "name": "Transición de redes de gas",
    "description": "Amplía abastecimiento energético con impacto ambiental.",
    "category": "Infraestructura",
    "strategy": "Más rápida que renovables, con costo ambiental explícito.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 2,
    "role": "policy",
    "effects": [
      {
        "id": "e093",
        "actionId": "red_gas",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 340,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e094",
        "actionId": "red_gas",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e095",
        "actionId": "red_gas",
        "kind": "indicator",
        "target": "ambiente",
        "magnitude": -3,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e096",
        "actionId": "red_gas",
        "kind": "indicator",
        "target": "externo",
        "magnitude": 2,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e097",
        "actionId": "red_gas",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "study",
        "projectId": "red_gas"
      }
    ],
    "bonuses": [
      {
        "kind": "federal",
        "description": "Beneficio obra ×1,15; sólo indicadores positivos, una vez"
      }
    ],
    "sourceIds": [
      "red_gas"
    ]
  },
  {
    "id": "estudio_factibilidad",
    "name": "Estudiar un proyecto nacional",
    "description": "Elige una obra y prepara su ejecución técnica y ambiental.",
    "category": "Infraestructura",
    "strategy": "Permiso de proyecto específico, consumible y con vencimiento.",
    "actionCost": 1,
    "cooldown": 1,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e098",
        "actionId": "estudio_factibilidad",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 60,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e099",
        "actionId": "estudio_factibilidad",
        "kind": "token",
        "target": "study.projectId",
        "magnitude": 1,
        "start": 1,
        "duration": 6,
        "operation": "grant",
        "explanation": "Elegir projectId al ejecutar. Válido t+1..t+6; se consume al iniciar esa obra."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "estudio_factibilidad"
    ]
  },
  {
    "id": "mantenimiento_urbano",
    "name": "Mantenimiento de redes federales",
    "description": "Repara infraestructura existente de alcance nacional.",
    "category": "Infraestructura",
    "strategy": "Retorno rápido sin ampliar capacidad exportadora.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e100",
        "actionId": "mantenimiento_urbano",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 140,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e101",
        "actionId": "mantenimiento_urbano",
        "kind": "indicator",
        "target": "infraestructura",
        "magnitude": 4,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "mantenimiento_urbano"
    ]
  },
  {
    "id": "tratado_comercio",
    "name": "Acuerdo de apertura comercial",
    "description": "Amplía acceso a mercados y competencia importada.",
    "category": "Economía",
    "strategy": "Ganancia externa demorada con transición productiva.",
    "actionCost": 1,
    "cooldown": 16,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e102",
        "actionId": "tratado_comercio",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e103",
        "actionId": "tratado_comercio",
        "kind": "indicator",
        "target": "externo",
        "magnitude": 7,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e104",
        "actionId": "tratado_comercio",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": -4,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e105",
        "actionId": "tratado_comercio",
        "kind": "indicator",
        "target": "ingreso_real",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [
      {
        "kind": "legislative",
        "minimum": 51
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "tratado_comercio"
    ]
  },
  {
    "id": "cooperacion_internacional",
    "name": "Cooperación científica internacional",
    "description": "Financia equipos y proyectos con socios externos.",
    "category": "Desarrollo",
    "strategy": "Capacidad científica con demora y requisitos institucionales.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e106",
        "actionId": "cooperacion_internacional",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 130,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e107",
        "actionId": "cooperacion_internacional",
        "kind": "indicator",
        "target": "ciencia",
        "magnitude": 5,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e108",
        "actionId": "cooperacion_internacional",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 1,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "derechos",
        "operator": ">=",
        "value": 40
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "cooperacion_internacional",
      "participacion_cumbres"
    ]
  },
  {
    "id": "seguridad_ciudadana",
    "name": "Operativo federal focalizado",
    "description": "Intervención temporal en zonas de riesgo alto.",
    "category": "Seguridad",
    "strategy": "Resultado rápido; daño a derechos si faltan controles.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e109",
        "actionId": "seguridad_ciudadana",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 180,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e110",
        "actionId": "seguridad_ciudadana",
        "kind": "indicator",
        "target": "seguridad",
        "magnitude": 5,
        "start": 0,
        "duration": 2,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e111",
        "actionId": "seguridad_ciudadana",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": -3,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [
          {
            "indicatorId": "derechos",
            "operator": "<",
            "value": 45.0
          }
        ],
        "stack": "sum"
      },
      {
        "id": "e112",
        "actionId": "seguridad_ciudadana",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 30,
        "start": 1,
        "duration": 1,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "seguridad",
        "operator": "<",
        "value": 50
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "seguridad_ciudadana"
    ]
  },
  {
    "id": "lucha_narcotrafico",
    "name": "Investigación de redes criminales",
    "description": "Combina investigación patrimonial y coordinación judicial.",
    "category": "Seguridad",
    "strategy": "Más lenta pero persistente que un operativo.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e113",
        "actionId": "lucha_narcotrafico",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 240,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e114",
        "actionId": "lucha_narcotrafico",
        "kind": "indicator",
        "target": "seguridad",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e115",
        "actionId": "lucha_narcotrafico",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "action",
        "actionId": "fortalecimiento_justicia"
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "lucha_narcotrafico"
    ]
  },
  {
    "id": "fortalecimiento_justicia",
    "name": "Justicia y control de legalidad",
    "description": "Refuerza investigación, debido proceso y control judicial.",
    "category": "Instituciones",
    "strategy": "Abre herramientas de seguridad con salvaguardas.",
    "actionCost": 1,
    "cooldown": 8,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e116",
        "actionId": "fortalecimiento_justicia",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 230,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e117",
        "actionId": "fortalecimiento_justicia",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e118",
        "actionId": "fortalecimiento_justicia",
        "kind": "indicator",
        "target": "seguridad",
        "magnitude": 2,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e119",
        "actionId": "fortalecimiento_justicia",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 25,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "legislative",
        "minimum": 51
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "fortalecimiento_justicia"
    ]
  },
  {
    "id": "sistema_vigilancia",
    "name": "Vigilancia con trazabilidad",
    "description": "Despliega vigilancia bajo reglas de acceso y auditoría.",
    "category": "Seguridad",
    "strategy": "Seguridad diferida; controles reducen, no borran, costo de privacidad.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e120",
        "actionId": "sistema_vigilancia",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 200,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e121",
        "actionId": "sistema_vigilancia",
        "kind": "indicator",
        "target": "seguridad",
        "magnitude": 5,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e122",
        "actionId": "sistema_vigilancia",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": -1,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e123",
        "actionId": "sistema_vigilancia",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [
      {
        "kind": "action",
        "actionId": "fortalecimiento_justicia"
      },
      {
        "kind": "indicator",
        "indicatorId": "derechos",
        "operator": ">=",
        "value": 45
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "sistema_vigilancia"
    ]
  },
  {
    "id": "policia_proximidad",
    "name": "Prevención y proximidad federal",
    "description": "Convenios de formación y prevención local respetando jurisdicciones.",
    "category": "Seguridad",
    "strategy": "Más lento que un operativo, compatible con garantías.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e124",
        "actionId": "policia_proximidad",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 170,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e125",
        "actionId": "policia_proximidad",
        "kind": "indicator",
        "target": "seguridad",
        "magnitude": 4,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e126",
        "actionId": "policia_proximidad",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 2,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e127",
        "actionId": "policia_proximidad",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 20,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "programa_desarme",
      "policia_proximidad",
      "prevencion_delito"
    ]
  },
  {
    "id": "programa_cultural",
    "name": "Acceso cultural y creación",
    "description": "Financia acceso comunitario, bibliotecas y creación plural.",
    "category": "Cultura",
    "strategy": "Mejora formación y ejercicio de derechos culturales.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e128",
        "actionId": "programa_cultural",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 120,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e129",
        "actionId": "programa_cultural",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e130",
        "actionId": "programa_cultural",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 2,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e131",
        "actionId": "programa_cultural",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 15,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "programa_cultural",
      "festival_arte",
      "red_bibliotecas",
      "centros_culturales",
      "escuelas_arte",
      "festivales_regionales"
    ]
  },
  {
    "id": "patrimonio_historico",
    "name": "Patrimonio y turismo sostenible",
    "description": "Preserva patrimonio y habilita actividad turística.",
    "category": "Cultura",
    "strategy": "Retorno productivo pequeño y tardío.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e132",
        "actionId": "patrimonio_historico",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 150,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e133",
        "actionId": "patrimonio_historico",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 2,
        "start": 2,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e134",
        "actionId": "patrimonio_historico",
        "kind": "indicator",
        "target": "educacion",
        "magnitude": 1,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e135",
        "actionId": "patrimonio_historico",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 10,
        "start": 2,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": [
      "patrimonio_historico",
      "museos_interactivos",
      "fomentar_turismo"
    ]
  },
  {
    "id": "desarrollar_tecnologia",
    "name": "Transferencia tecnológica productiva",
    "description": "Conecta equipos científicos con procesos productivos.",
    "category": "Desarrollo",
    "strategy": "Transforma capacidad científica previa en actividad futura.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e136",
        "actionId": "desarrollar_tecnologia",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 220,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e137",
        "actionId": "desarrollar_tecnologia",
        "kind": "indicator",
        "target": "ciencia",
        "magnitude": 3,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e138",
        "actionId": "desarrollar_tecnologia",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 4,
        "start": 3,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "ciencia",
        "operator": ">=",
        "value": 40
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "desarrollar_tecnologia"
    ]
  },
  {
    "id": "credito_pyme",
    "name": "Garantías de crédito PyME",
    "description": "Fondo acotado de garantías para inversión y capital de trabajo.",
    "category": "Economía",
    "strategy": "Cubre el canal de crédito sin beneficiar por etiqueta.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e139",
        "actionId": "credito_pyme",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 160,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e140",
        "actionId": "credito_pyme",
        "kind": "indicator",
        "target": "credito",
        "magnitude": 6,
        "start": 1,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e141",
        "actionId": "credito_pyme",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 15,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e142",
        "actionId": "credito_pyme",
        "kind": "indicator",
        "target": "credito",
        "magnitude": -2,
        "start": 3,
        "duration": 1,
        "operation": "pulse",
        "explanation": "Mora en recesión profunda.",
        "conditions": [
          {
            "indicatorId": "actividad",
            "operator": "<",
            "value": 35.0
          }
        ],
        "stack": "sum"
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "fiscal",
        "operator": ">=",
        "value": 25
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "fomento_emprendimiento"
    ]
  },
  {
    "id": "carrera_cientifica",
    "name": "Sostener equipos científicos",
    "description": "Da continuidad presupuestaria a equipos y formación.",
    "category": "Desarrollo",
    "strategy": "Protege capacidades con compromiso recurrente.",
    "actionCost": 1,
    "cooldown": 6,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e143",
        "actionId": "carrera_cientifica",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e144",
        "actionId": "carrera_cientifica",
        "kind": "indicator",
        "target": "ciencia",
        "magnitude": 6,
        "start": 2,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e145",
        "actionId": "carrera_cientifica",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": 30,
        "start": 1,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "transparencia_publica",
    "name": "Transparencia y compras abiertas",
    "description": "Publica contratos y refuerza auditoría operativa.",
    "category": "Instituciones",
    "strategy": "Garantías tempranas, ahorro fiscal demorado.",
    "actionCost": 1,
    "cooldown": 16,
    "maxUses": 1,
    "role": "policy",
    "effects": [
      {
        "id": "e146",
        "actionId": "transparencia_publica",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 100,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e147",
        "actionId": "transparencia_publica",
        "kind": "indicator",
        "target": "derechos",
        "magnitude": 5,
        "start": 1,
        "duration": 1,
        "operation": "pulse",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e148",
        "actionId": "transparencia_publica",
        "kind": "ledger",
        "target": "expense_recurring",
        "magnitude": -20,
        "start": 3,
        "duration": 0,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "estabilizacion_monetaria",
    "name": "Programa de estabilización monetaria",
    "description": "Retira estímulo y prioriza anclaje nominal durante tres turnos.",
    "category": "Economía",
    "strategy": "Baja presión con costo transitorio de crédito y actividad.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e149",
        "actionId": "estabilizacion_monetaria",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 50,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e150",
        "actionId": "estabilizacion_monetaria",
        "kind": "indicator",
        "target": "inflacion",
        "magnitude": -3,
        "start": 1,
        "duration": 3,
        "operation": "per_turn",
        "explanation": "",
        "conditions": [],
        "stack": "sum"
      },
      {
        "id": "e151",
        "actionId": "estabilizacion_monetaria",
        "kind": "indicator",
        "target": "credito",
        "magnitude": -3,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e152",
        "actionId": "estabilizacion_monetaria",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": -2,
        "start": 0,
        "duration": 3,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "indicator",
        "indicatorId": "inflacion",
        "operator": ">=",
        "value": 35
      }
    ],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "alivio_tributario",
    "name": "Alivio tributario temporal",
    "description": "Reduce cargas por cuatro turnos.",
    "category": "Economía",
    "strategy": "Ingreso disponible y actividad a costa de margen fiscal.",
    "actionCost": 1,
    "cooldown": 5,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e153",
        "actionId": "alivio_tributario",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 30,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e154",
        "actionId": "alivio_tributario",
        "kind": "ledger",
        "target": "revenue_recurring",
        "magnitude": -60,
        "start": 1,
        "duration": 4,
        "operation": "flow",
        "explanation": "Flujo explícito; afecta caja y cálculo fiscal durante su vigencia."
      },
      {
        "id": "e155",
        "actionId": "alivio_tributario",
        "kind": "indicator",
        "target": "ingreso_real",
        "magnitude": 3,
        "start": 1,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      },
      {
        "id": "e156",
        "actionId": "alivio_tributario",
        "kind": "indicator",
        "target": "actividad",
        "magnitude": 2,
        "start": 1,
        "duration": 4,
        "operation": "offset",
        "explanation": "",
        "conditions": [],
        "stack": "reject"
      }
    ],
    "requirements": [
      {
        "kind": "legislative",
        "minimum": 51
      }
    ],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "reestructurar_deuda",
    "name": "Reperfilar un vencimiento",
    "description": "Con acreedor informado, difiere un vencimiento por cuatro turnos y aumenta interés.",
    "category": "Economía",
    "strategy": "Evita un salto de caja pero encarece el contrato.",
    "actionCost": 1,
    "cooldown": 4,
    "maxUses": 0,
    "role": "policy",
    "effects": [
      {
        "id": "e157",
        "actionId": "reestructurar_deuda",
        "kind": "ledger",
        "target": "expense_once",
        "magnitude": 80,
        "start": 0,
        "duration": 1,
        "operation": "flow",
        "explanation": "Coste administrativo o programa. No se duplica con la columna fiscal de 04."
      },
      {
        "id": "e158",
        "actionId": "reestructurar_deuda",
        "kind": "loan",
        "target": "selectedLoanId",
        "magnitude": 4,
        "start": 0,
        "duration": 1,
        "operation": "reschedule",
        "explanation": "Sólo una vez por contrato: dueTurn +4, interés por turno ×1,25 desde t+1. Principal sin cambios."
      }
    ],
    "requirements": [
      {
        "kind": "agreement",
        "templateId": "reperfilamiento"
      },
      {
        "kind": "loan",
        "maximumDueIn": 2
      }
    ],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "reunirse",
    "name": "Reunirse con un actor",
    "description": "Revela prioridades y abre acceso a negociación durante cuatro turnos.",
    "category": "Actores",
    "strategy": "Costo de agenda. No sube S ni R.",
    "actionCost": 1,
    "cooldown": 2,
    "maxUses": 0,
    "role": "interaction",
    "effects": [
      {
        "id": "e159",
        "actionId": "reunirse",
        "kind": "interaction",
        "target": "actorId",
        "magnitude": 1,
        "start": 0,
        "duration": 4,
        "operation": "meet",
        "explanation": "Costo caja 10+5×difficulty. Cooldown por actor; crea informe fechado."
      }
    ],
    "requirements": [],
    "bonuses": [],
    "sourceIds": []
  },
  {
    "id": "negociar",
    "name": "Negociar una demanda",
    "description": "Selecciona resultado, plazo y contraprestación verificables.",
    "category": "Actores",
    "strategy": "Requiere reunión reciente y oferta factible.",
    "actionCost": 1,
    "cooldown": 2,
    "maxUses": 0,
    "role": "interaction",
    "effects": [
      {
        "id": "e160",
        "actionId": "negociar",
        "kind": "interaction",
        "target": "actorId",
        "magnitude": 1,
        "start": 0,
        "duration": 3,
        "operation": "negotiate",
        "explanation": "Costo 15+5×difficulty. Oferta válida 3 turnos; no firma automática."
      }
    ],
    "requirements": [
      {
        "kind": "meeting",
        "actorId": "actorId",
        "age": 4
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "mediacion_conflictos"
    ]
  },
  {
    "id": "firmar_acuerdo",
    "name": "Firmar compromiso verificable",
    "description": "Registra obligación de resultado o procedimiento y contraprestación.",
    "category": "Actores",
    "strategy": "Mejora confianza sólo al cumplir; apoyo acotado al objeto.",
    "actionCost": 1,
    "cooldown": 1,
    "maxUses": 0,
    "role": "interaction",
    "effects": [
      {
        "id": "e161",
        "actionId": "firmar_acuerdo",
        "kind": "agreement",
        "target": "offerId",
        "magnitude": 1,
        "start": 0,
        "duration": 4,
        "operation": "sign",
        "explanation": "Firma no cambia S ni R. Cumplir: R+8 una vez; incumplir: R−12 una vez. Coste oferta no duplicado."
      }
    ],
    "requirements": [
      {
        "kind": "meeting",
        "actorId": "actorId",
        "age": 4
      }
    ],
    "bonuses": [],
    "sourceIds": [
      "acuerdo_sindical",
      "alianza_politica",
      "acuerdo_ambiental"
    ]
  }
];

export const BALANCE = {
  "cash_initial": 1200,
  "revenue_base": 500,
  "spending_base": 420,
  "activity_tax": 2,
  "smoothing": 0.35,
  "inflation_revert": 0.1,
  "activity_revert": 0.2,
  "credit_to_activity": 0.08,
  "infra_to_activity": 0.06,
  "external_to_activity": 0.05,
  "activity_to_income": 0.15,
  "inflation_to_income": -0.35,
  "credit_revert": 0.15,
  "inflation_to_credit": -0.2,
  "fiscal_to_credit": 0.02,
  "delta_cap": 12,
  "channel_cap": 3,
  "emission_multiplier": 2,
  "emission_threshold": 2,
  "inflation_condition": 60,
  "emission_high": 2,
  "external_interest": 24,
  "domestic_interest": 20,
  "fiscal_neutral": 50,
  "debt_divisor": 100,
  "debt_cap": 20,
  "fiscal_initial": 58,
  "lowS": 35,
  "lowR": 45,
  "criticalS": 20,
  "exitS": 40,
  "exitR": 50,
  "criticalExit": 25,
  "meeting_base": 10,
  "meeting_difficulty": 5
};

export const ACTIONS_PER_TURN = 4;
export const TURNS_PER_TERM = 16;
