// ARCHIVO GENERADO por scripts/excel_to_causal.py desde GobernArg_Motor_Causal_v1.xlsx.
// No editar a mano: modificar el Excel y regenerar.
/* eslint-disable */

export const EXCEL_PARAMS: Record<string, number> = {
  "ACCIONES_POR_TURNO": 4,
  "TURNOS_MANDATO": 16,
  "REUNIONES_GRATIS": 1,
  "INGRESO_BASE": 1000,
  "GASTO_CORR_INICIAL": 900,
  "DEUDA_INICIAL": 3000,
  "TASA_DEUDA": 0.05,
  "CAJA_INICIAL": 1500,
  "ALFA_SAT": 0.4,
  "BETA_EXPECT": 0.1,
  "K_REL": 20,
  "UMBRAL_LEY": 50,
  "LUNA_MIEL": 3,
  "PESO_APRO_EN_IV": 0.65,
  "PESO_ESTRUCTURA_EN_IV": 0.1,
  "PESO_OTROS_EN_IV": 0.25
};

export const EXCEL_PARAM_NOTES: Record<string, { what: string | null; status: string | null }> = {
  "ACCIONES_POR_TURNO": {
    "what": "Puntos de acción (PA) por turno. Acciones grandes cuestan 2.",
    "status": "Del ejemplo del usuario; calibrar."
  },
  "TURNOS_MANDATO": {
    "what": "1 turno = 1 trimestre. Legislativas en T8, presidenciales en T16.",
    "status": "Del código actual (16)."
  },
  "REUNIONES_GRATIS": {
    "what": "Reuniones sin costo de PA por turno (agenda presidencial). Extras: 1 PA.",
    "status": "Propuesta."
  },
  "INGRESO_BASE": {
    "what": "Recaudación de referencia por turno.",
    "status": "Calibrar contra código."
  },
  "GASTO_CORR_INICIAL": {
    "what": "Gasto corriente inicial por turno.",
    "status": "Calibrar."
  },
  "DEUDA_INICIAL": {
    "what": "Stock de deuda inicial.",
    "status": "Calibrar."
  },
  "TASA_DEUDA": {
    "what": "Servicio de deuda por turno = TASA × DEUDA.",
    "status": "Calibrar."
  },
  "CAJA_INICIAL": {
    "what": "Caja al turno 1.",
    "status": "Calibrar."
  },
  "ALFA_SAT": {
    "what": "Velocidad a la que la satisfacción converge a su objetivo.",
    "status": "Inercia: evita saltos."
  },
  "BETA_EXPECT": {
    "what": "Adaptación de expectativas por turno.",
    "status": "Evita 'satisfacción eterna'."
  },
  "K_REL": {
    "what": "Desvío vs expectativa que satura el componente relativo.",
    "status": null
  },
  "UMBRAL_LEY": {
    "what": "LEG mínimo para acciones LEY (modificable por oposición 45/55 y luna de miel).",
    "status": "Del código (45) subido a 50."
  },
  "LUNA_MIEL": {
    "what": "Turnos iniciales con LEG +8 para acciones LEY.",
    "status": "Propuesta."
  },
  "PESO_APRO_EN_IV": {
    "what": "Parte de la intención de voto que viene de actores.",
    "status": "ABIERTO: 0.55–0.75."
  },
  "PESO_ESTRUCTURA_EN_IV": {
    "what": "Aparato territorial (oficialismo, aliados, gobernadores).",
    "status": "ABIERTO."
  },
  "PESO_OTROS_EN_IV": {
    "what": "Campaña, candidato, fatiga, fuerza opositora, eventos.",
    "status": "ABIERTO: a diseñar."
  }
};
