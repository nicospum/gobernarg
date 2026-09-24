// ARCHIVO GENERADO por scripts/excel_to_causal.py desde GobernArg_Motor_Causal_v1.xlsx.
// No editar a mano: modificar el Excel y regenerar.
/* eslint-disable */

import type { SensitivityRow } from '../types';

export const SENSITIVITY_ROWS: SensitivityRow[] = [
  {
    "actor": "industria",
    "target": "INVC",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Crédito y clima de inversión definen su expansión."
  },
  {
    "actor": "industria",
    "target": "ACTV",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Demanda interna y ventas."
  },
  {
    "actor": "industria",
    "target": "PRES",
    "s": -7,
    "priority": "Alta",
    "explanation": "Carga impositiva sobre rentabilidad."
  },
  {
    "actor": "industria",
    "target": "INFL",
    "s": -5,
    "priority": "Alta",
    "explanation": "Imprevisibilidad de costos y precios."
  },
  {
    "actor": "industria",
    "target": "CONF",
    "s": -5,
    "priority": "Alta",
    "explanation": "Paros y cortes interrumpen producción."
  },
  {
    "actor": "industria",
    "target": "EXTE",
    "s": 4,
    "priority": "Media",
    "explanation": "Necesita divisas para insumos importados."
  },
  {
    "actor": "industria",
    "target": "INFR",
    "s": 4,
    "priority": "Media",
    "explanation": "Logística y energía."
  },
  {
    "actor": "agro",
    "target": "PRES",
    "s": -10,
    "priority": "Crítica",
    "explanation": "Retenciones e impuestos: su reclamo histórico central."
  },
  {
    "actor": "agro",
    "target": "EXTE",
    "s": 7,
    "priority": "Alta",
    "explanation": "Tipo de cambio competitivo y mercados abiertos."
  },
  {
    "actor": "agro",
    "target": "INFR",
    "s": 6,
    "priority": "Alta",
    "explanation": "Caminos, puertos, obras hídricas."
  },
  {
    "actor": "agro",
    "target": "INFL",
    "s": -4,
    "priority": "Media",
    "explanation": "Costos de insumos."
  },
  {
    "actor": "agro",
    "target": "INST",
    "s": 3,
    "priority": "Media",
    "explanation": "Seguridad jurídica y reglas estables."
  },
  {
    "actor": "financiero",
    "target": "SOLV",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Capacidad de pago del Estado = su activo principal."
  },
  {
    "actor": "financiero",
    "target": "INFL",
    "s": -7,
    "priority": "Alta",
    "explanation": "Destruye ahorro en pesos y contratos."
  },
  {
    "actor": "financiero",
    "target": "EXTE",
    "s": 6,
    "priority": "Alta",
    "explanation": "Reservas = capacidad de pagar deuda en dólares."
  },
  {
    "actor": "financiero",
    "target": "INST",
    "s": 5,
    "priority": "Alta",
    "explanation": "Seguridad jurídica y contratos."
  },
  {
    "actor": "financiero",
    "target": "INVC",
    "s": 3,
    "priority": "Media",
    "explanation": "Más crédito = más negocio, pero secundario frente a solvencia."
  },
  {
    "actor": "financiero",
    "target": "CONF",
    "s": -3,
    "priority": "Media",
    "explanation": "Riesgo político."
  },
  {
    "actor": "sindicatos",
    "target": "PODA",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Salario real: su razón de ser."
  },
  {
    "actor": "sindicatos",
    "target": "ACTV",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Empleo formal."
  },
  {
    "actor": "sindicatos",
    "target": "PSOC",
    "s": 4,
    "priority": "Media",
    "explanation": "Obras sociales y salud."
  },
  {
    "actor": "sindicatos",
    "target": "INFL",
    "s": -4,
    "priority": "Media",
    "explanation": "Moderado: el daño principal ya entra por PODA (evitar doble conteo intra-actor)."
  },
  {
    "actor": "pymes",
    "target": "ACTV",
    "s": 9,
    "priority": "Crítica",
    "explanation": "Viven del mercado interno."
  },
  {
    "actor": "pymes",
    "target": "INVC",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Crédito accesible: su cuello de botella."
  },
  {
    "actor": "pymes",
    "target": "PRES",
    "s": -7,
    "priority": "Alta",
    "explanation": "Carga impositiva y formalización."
  },
  {
    "actor": "pymes",
    "target": "INFL",
    "s": -5,
    "priority": "Alta",
    "explanation": "Costos, precios de reposición."
  },
  {
    "actor": "pymes",
    "target": "PODA",
    "s": 4,
    "priority": "Media",
    "explanation": "Consumo de sus clientes."
  },
  {
    "actor": "pymes",
    "target": "CONF",
    "s": -3,
    "priority": "Media",
    "explanation": "Cortes y paros afectan ventas."
  },
  {
    "actor": "clase_media",
    "target": "PODA",
    "s": 9,
    "priority": "Crítica",
    "explanation": "Llegar a fin de mes, sostener consumo."
  },
  {
    "actor": "clase_media",
    "target": "INFL",
    "s": -8,
    "priority": "Crítica",
    "explanation": "Ahorro, previsibilidad, precios."
  },
  {
    "actor": "clase_media",
    "target": "SEGU",
    "s": 7,
    "priority": "Alta",
    "explanation": "Demanda central en grandes ciudades."
  },
  {
    "actor": "clase_media",
    "target": "EDUC",
    "s": 5,
    "priority": "Alta",
    "explanation": "Escuela y universidad pública."
  },
  {
    "actor": "clase_media",
    "target": "PRES",
    "s": -5,
    "priority": "Alta",
    "explanation": "Ganancias, impuestos al consumo."
  },
  {
    "actor": "clase_media",
    "target": "PSOC",
    "s": 4,
    "priority": "Media",
    "explanation": "Hospital público y jubilaciones."
  },
  {
    "actor": "clase_media",
    "target": "CONF",
    "s": -4,
    "priority": "Media",
    "explanation": "Cortes de calle y paros en la vida cotidiana."
  },
  {
    "actor": "clase_media",
    "target": "INST",
    "s": 3,
    "priority": "Media",
    "explanation": "Transparencia y república."
  },
  {
    "actor": "sectores_populares",
    "target": "PSOC",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Transferencias, salud, vivienda social."
  },
  {
    "actor": "sectores_populares",
    "target": "PODA",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Ingreso real de informales y jubilados mínimos."
  },
  {
    "actor": "sectores_populares",
    "target": "ACTV",
    "s": 7,
    "priority": "Alta",
    "explanation": "Changas y empleo."
  },
  {
    "actor": "sectores_populares",
    "target": "INFL",
    "s": -6,
    "priority": "Alta",
    "explanation": "Alimentos: la inflación les pega primero."
  },
  {
    "actor": "sectores_populares",
    "target": "SEGU",
    "s": 5,
    "priority": "Alta",
    "explanation": "Barrios más expuestos al delito."
  },
  {
    "actor": "sectores_populares",
    "target": "EDUC",
    "s": 3,
    "priority": "Media",
    "explanation": "Escuela como movilidad social."
  },
  {
    "actor": "estudiantes",
    "target": "EDUC",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Presupuesto y funcionamiento educativo."
  },
  {
    "actor": "estudiantes",
    "target": "CIEN",
    "s": 5,
    "priority": "Alta",
    "explanation": "Salida laboral y becas de investigación."
  },
  {
    "actor": "estudiantes",
    "target": "ACTV",
    "s": 5,
    "priority": "Alta",
    "explanation": "Primer empleo."
  },
  {
    "actor": "estudiantes",
    "target": "INST",
    "s": 5,
    "priority": "Alta",
    "explanation": "Libertades y derecho a la protesta."
  },
  {
    "actor": "estudiantes",
    "target": "AMBI",
    "s": 3,
    "priority": "Media",
    "explanation": "Agenda ambiental generacional."
  },
  {
    "actor": "estudiantes",
    "target": "PODA",
    "s": 3,
    "priority": "Media",
    "explanation": "Costo de estudiar."
  },
  {
    "actor": "docentes",
    "target": "EDUC",
    "s": 9,
    "priority": "Crítica",
    "explanation": "Condiciones de trabajo en escuelas."
  },
  {
    "actor": "docentes",
    "target": "PODA",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Salario docente (proxy: PODA; su paritaria entra como demanda)."
  },
  {
    "actor": "docentes",
    "target": "PSOC",
    "s": 3,
    "priority": "Media",
    "explanation": "Obra social y contexto de alumnos."
  },
  {
    "actor": "docentes",
    "target": "INFL",
    "s": -3,
    "priority": "Media",
    "explanation": "Moderado por mirar PODA."
  },
  {
    "actor": "cientificos",
    "target": "CIEN",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Financiamiento y continuidad del sistema."
  },
  {
    "actor": "cientificos",
    "target": "EDUC",
    "s": 6,
    "priority": "Alta",
    "explanation": "Universidad pública como base."
  },
  {
    "actor": "cientificos",
    "target": "INST",
    "s": 4,
    "priority": "Media",
    "explanation": "Autonomía y libertad académica."
  },
  {
    "actor": "cientificos",
    "target": "PODA",
    "s": 3,
    "priority": "Media",
    "explanation": "Salarios de investigadores."
  },
  {
    "actor": "org_sociales",
    "target": "PSOC",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Programas sociales que gestionan."
  },
  {
    "actor": "org_sociales",
    "target": "ACTV",
    "s": 6,
    "priority": "Alta",
    "explanation": "Economía popular y cooperativas."
  },
  {
    "actor": "org_sociales",
    "target": "PODA",
    "s": 6,
    "priority": "Alta",
    "explanation": "Ingreso de sus bases."
  },
  {
    "actor": "org_sociales",
    "target": "INFL",
    "s": -5,
    "priority": "Alta",
    "explanation": "Alimentos."
  },
  {
    "actor": "org_sociales",
    "target": "INST",
    "s": 3,
    "priority": "Media",
    "explanation": "Derecho a la protesta."
  },
  {
    "actor": "derechos_cultura",
    "target": "INST",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Libertades, DDHH, estado de derecho."
  },
  {
    "actor": "derechos_cultura",
    "target": "EDUC",
    "s": 5,
    "priority": "Alta",
    "explanation": "Cultura y educación pública."
  },
  {
    "actor": "derechos_cultura",
    "target": "PSOC",
    "s": 4,
    "priority": "Media",
    "explanation": "Derechos sociales."
  },
  {
    "actor": "derechos_cultura",
    "target": "AMBI",
    "s": 3,
    "priority": "Media",
    "explanation": "Agenda de derechos ampliada."
  },
  {
    "actor": "derechos_cultura",
    "target": "PODA",
    "s": 3,
    "priority": "Media",
    "explanation": "Consumo cultural (industria creativa)."
  },
  {
    "actor": "ambiente",
    "target": "AMBI",
    "s": 10,
    "priority": "Crítica",
    "explanation": "Su objeto."
  },
  {
    "actor": "ambiente",
    "target": "INST",
    "s": 5,
    "priority": "Alta",
    "explanation": "Cumplimiento de leyes ambientales, acceso a la justicia."
  },
  {
    "actor": "ambiente",
    "target": "CIEN",
    "s": 3,
    "priority": "Media",
    "explanation": "Transición y tecnología limpia."
  },
  {
    "actor": "oficialismo",
    "target": "APRO",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Variable política (rezago 1 turno): el partido acompaña a un gobierno con chances."
  },
  {
    "actor": "oficialismo",
    "target": "PLATAFORMA_1",
    "s": 5,
    "priority": "Alta",
    "explanation": "Indicador de plataforma elegido al inicio (ej.: ACTV)."
  },
  {
    "actor": "oficialismo",
    "target": "PLATAFORMA_2",
    "s": 5,
    "priority": "Alta",
    "explanation": "Indicador de plataforma (ej.: PODA)."
  },
  {
    "actor": "oficialismo",
    "target": "PLATAFORMA_3",
    "s": 4,
    "priority": "Media",
    "explanation": "Indicador de plataforma (ej.: INFL, con signo −)."
  },
  {
    "actor": "aliados",
    "target": "APRO",
    "s": 5,
    "priority": "Alta",
    "explanation": "Variable política: se quedan si el gobierno suma."
  },
  {
    "actor": "aliados",
    "target": "INST",
    "s": 5,
    "priority": "Alta",
    "explanation": "Perfil republicano típico de socios de coalición (configurable por escenario)."
  },
  {
    "actor": "aliados",
    "target": "SOLV",
    "s": 4,
    "priority": "Media",
    "explanation": "Orden fiscal (configurable)."
  },
  {
    "actor": "aliados",
    "target": "SEGU",
    "s": 3,
    "priority": "Media",
    "explanation": "Agenda propia (configurable)."
  },
  {
    "actor": "oposicion",
    "target": "INST",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Respeto a reglas: con arbitrariedad se endurece."
  },
  {
    "actor": "oposicion",
    "target": "APRO",
    "s": 4,
    "priority": "Media",
    "explanation": "Oponerse a un gobierno popular es costoso: los dialoguistas acompañan."
  },
  {
    "actor": "oposicion",
    "target": "CONF",
    "s": -3,
    "priority": "Media",
    "explanation": "Con calle caliente endurece."
  },
  {
    "actor": "gobernadores",
    "target": "INFR",
    "s": 8,
    "priority": "Crítica",
    "explanation": "Obras en su territorio."
  },
  {
    "actor": "gobernadores",
    "target": "ACTV",
    "s": 6,
    "priority": "Alta",
    "explanation": "Coparticipación depende de recaudación."
  },
  {
    "actor": "gobernadores",
    "target": "PSOC",
    "s": 3,
    "priority": "Media",
    "explanation": "Salud y vivienda provincial."
  },
  {
    "actor": "gobernadores",
    "target": "SEGU",
    "s": 3,
    "priority": "Media",
    "explanation": "Fuerzas provinciales sobrepasadas."
  },
  {
    "actor": "gobernadores",
    "target": "APRO",
    "s": 3,
    "priority": "Media",
    "explanation": "Se alinean con presidentes populares."
  }
];
