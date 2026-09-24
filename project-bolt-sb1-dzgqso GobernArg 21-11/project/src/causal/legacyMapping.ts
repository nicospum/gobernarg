// Audit of all 61 legacy actions; mapping is documentation, not a compatibility execution path.
export const LEGACY_ACTION_AUDIT = [
  {
    "sourceId": "emitir_dinero",
    "sourceName": "Emitir Dinero",
    "decision": "modificar",
    "targetId": "emitir_dinero",
    "reason": "Resuelve caja hoy a cambio de riesgo acumulado."
  },
  {
    "sourceId": "mejorar_recaudacion",
    "sourceName": "Mejorar Recaudación",
    "decision": "modificar",
    "targetId": "mejorar_recaudacion",
    "reason": "Invierte antes de recaudar; no es subir alícuotas."
  },
  {
    "sourceId": "subsidios_industriales",
    "sourceName": "Subsidios Industriales",
    "decision": "modificar",
    "targetId": "subsidios_industriales",
    "reason": "Sostiene actividad con costo recurrente y presión ambiental."
  },
  {
    "sourceId": "reforma_impositiva",
    "sourceName": "Reforma Impositiva",
    "decision": "modificar",
    "targetId": "reforma_impositiva",
    "reason": "Mejora margen fiscal a costa de ingreso disponible."
  },
  {
    "sourceId": "incentivos_exportacion",
    "sourceName": "Incentivos a la Exportación",
    "decision": "modificar",
    "targetId": "incentivos_exportacion",
    "reason": "Mejora capacidad externa con resultado demorado."
  },
  {
    "sourceId": "control_precios",
    "sourceName": "Control de Precios",
    "decision": "modificar",
    "targetId": "control_precios",
    "reason": "Alivia presión observada, pero puede tensionar oferta."
  },
  {
    "sourceId": "fomento_emprendimiento",
    "sourceName": "Fomento al Emprendimiento",
    "decision": "fusionar",
    "targetId": "credito_pyme",
    "reason": "Su financiamiento productivo queda en garantías PyME; formación queda en empleo joven."
  },
  {
    "sourceId": "aumento_salarial",
    "sourceName": "Aumento Salarial General",
    "decision": "modificar",
    "targetId": "aumento_salarial",
    "reason": "Mejora compra con gasto recurrente y presión según contexto."
  },
  {
    "sourceId": "reduccion_gasto",
    "sourceName": "Reducción del Gasto Público",
    "decision": "modificar",
    "targetId": "reduccion_gasto",
    "reason": "Recupera margen fiscal con costo social."
  },
  {
    "sourceId": "prestamo_internacional",
    "sourceName": "Préstamo Internacional",
    "decision": "modificar",
    "targetId": "prestamo_internacional",
    "reason": "Más caja y vencimiento explícito. No crea margen fiscal."
  },
  {
    "sourceId": "prestamo_local",
    "sourceName": "Préstamo Local",
    "decision": "modificar",
    "targetId": "prestamo_local",
    "reason": "Menor plazo y desplazamiento temporal de crédito privado."
  },
  {
    "sourceId": "atraccion_inversiones",
    "sourceName": "Atracción de Inversiones",
    "decision": "modificar",
    "targetId": "atraccion_inversiones",
    "reason": "Beneficio sólo si hay crédito y garantías públicas suficientes."
  },
  {
    "sourceId": "plan_viviendas",
    "sourceName": "Plan de Viviendas",
    "decision": "modificar",
    "targetId": "plan_viviendas",
    "reason": "Beneficio de cobertura demorado; paga operación luego."
  },
  {
    "sourceId": "programa_educativo",
    "sourceName": "Programa Educativo",
    "decision": "modificar",
    "targetId": "programa_educativo",
    "reason": "Mejora educativa sostenida con operación permanente."
  },
  {
    "sourceId": "salud_preventiva",
    "sourceName": "Programa de Salud Preventiva",
    "decision": "modificar",
    "targetId": "salud_preventiva",
    "reason": "Retorno más rápido y pequeño que hospitales."
  },
  {
    "sourceId": "empleo_joven",
    "sourceName": "Programa de Empleo Joven",
    "decision": "modificar",
    "targetId": "empleo_joven",
    "reason": "Retorno laboral limitado por demanda."
  },
  {
    "sourceId": "cobertura_social",
    "sourceName": "Ampliación de Cobertura Social",
    "decision": "modificar",
    "targetId": "cobertura_social",
    "reason": "Contiene vulnerabilidad con obligación recurrente."
  },
  {
    "sourceId": "alfabetizacion",
    "sourceName": "Campaña de Alfabetización",
    "decision": "modificar",
    "targetId": "alfabetizacion",
    "reason": "Más eficaz con educación baja."
  },
  {
    "sourceId": "inclusion_digital",
    "sourceName": "Plan de Inclusión Digital",
    "decision": "fusionar",
    "targetId": "plan_conectividad",
    "reason": "Acceso, redes y alfabetización digital en un único programa."
  },
  {
    "sourceId": "programa_alimentario",
    "sourceName": "Programa Alimentario",
    "decision": "modificar",
    "targetId": "programa_alimentario",
    "reason": "Rápido pero temporal. No reemplaza vivienda o empleo."
  },
  {
    "sourceId": "tercera_edad",
    "sourceName": "Asistencia a la Tercera Edad",
    "decision": "fusionar",
    "targetId": "cobertura_social",
    "reason": "Focalización por hogares dependientes sin duplicar el indicador de cobertura."
  },
  {
    "sourceId": "igualdad_genero",
    "sourceName": "Plan de Igualdad de Género",
    "decision": "modificar",
    "targetId": "igualdad_genero",
    "reason": "Dos resultados verificables, sin bono ideológico."
  },
  {
    "sourceId": "transporte_publico",
    "sourceName": "Transporte Público",
    "decision": "modificar",
    "targetId": "transporte_publico",
    "reason": "Reduce barreras de acceso, exige operación."
  },
  {
    "sourceId": "energia_renovable",
    "sourceName": "Energía Renovable",
    "decision": "modificar",
    "targetId": "energia_renovable",
    "reason": "Lenta y costosa; mejora ambiente y redes."
  },
  {
    "sourceId": "construccion_hospitales",
    "sourceName": "Construcción de Hospitales",
    "decision": "modificar",
    "targetId": "construccion_hospitales",
    "reason": "Gran beneficio sanitario diferido y gasto recurrente alto."
  },
  {
    "sourceId": "viviendas_rurales",
    "sourceName": "Desarrollo de Viviendas Rurales",
    "decision": "fusionar",
    "targetId": "plan_viviendas",
    "reason": "Focalización rural como variante de ejecución; no otro paquete idéntico."
  },
  {
    "sourceId": "modernizacion_aeropuertos",
    "sourceName": "Modernización de Aeropuertos",
    "decision": "reemplazar",
    "targetId": "infraestructura_vial",
    "reason": "No justifica otro escalón nacional en MVP; corredores concentran conectividad exportadora."
  },
  {
    "sourceId": "red_comunicaciones",
    "sourceName": "Red de Comunicaciones",
    "decision": "fusionar",
    "targetId": "plan_conectividad",
    "reason": "Duplicaba la red y su retorno fiscal automático."
  },
  {
    "sourceId": "reforestacion",
    "sourceName": "Programa de Reforestación",
    "decision": "modificar",
    "targetId": "reforestacion",
    "reason": "Retorno ambiental lento, sin ingreso automático."
  },
  {
    "sourceId": "infraestructura_vial",
    "sourceName": "Mejorar Infraestructura Vial",
    "decision": "modificar",
    "targetId": "infraestructura_vial",
    "reason": "Obra demorada que luego exige mantenimiento."
  },
  {
    "sourceId": "tratamiento_agua",
    "sourceName": "Plantas de Tratamiento de Agua",
    "decision": "fusionar",
    "targetId": "plan_hidrico",
    "reason": "Unifica agua segura y mantenimiento hídrico."
  },
  {
    "sourceId": "red_gas",
    "sourceName": "Red de Gas Natural",
    "decision": "modificar",
    "targetId": "red_gas",
    "reason": "Más rápida que renovables, con costo ambiental explícito."
  },
  {
    "sourceId": "estudio_factibilidad",
    "sourceName": "Estudio de factibilidad",
    "decision": "modificar",
    "targetId": "estudio_factibilidad",
    "reason": "Permiso de proyecto específico, consumible y con vencimiento."
  },
  {
    "sourceId": "plan_hidrico",
    "sourceName": "Plan Hídrico",
    "decision": "modificar",
    "targetId": "plan_hidrico",
    "reason": "Mejora sanitaria y ambiental; costo de operación."
  },
  {
    "sourceId": "mantenimiento_urbano",
    "sourceName": "Mantenimiento Urbano",
    "decision": "modificar",
    "targetId": "mantenimiento_urbano",
    "reason": "Retorno rápido sin ampliar capacidad exportadora."
  },
  {
    "sourceId": "plan_conectividad",
    "sourceName": "Plan de Conectividad",
    "decision": "modificar",
    "targetId": "plan_conectividad",
    "reason": "Unifica tres acciones redundantes."
  },
  {
    "sourceId": "acuerdo_sindical",
    "sourceName": "Acuerdo Sindical",
    "decision": "reemplazar",
    "targetId": "firmar_acuerdo",
    "reason": "Plantilla pacto_laboral del flujo reunión-negociación-firma. No compra apoyo directo."
  },
  {
    "sourceId": "alianza_politica",
    "sourceName": "Alianza Política",
    "decision": "reemplazar",
    "targetId": "firmar_acuerdo",
    "reason": "Plantilla coalicion con aliados: contraprestación legislativa delimitada."
  },
  {
    "sourceId": "tratado_comercio",
    "sourceName": "Tratado de Libre Comercio",
    "decision": "modificar",
    "targetId": "tratado_comercio",
    "reason": "Ganancia externa demorada con transición productiva."
  },
  {
    "sourceId": "cooperacion_internacional",
    "sourceName": "Cooperación Internacional",
    "decision": "modificar",
    "targetId": "cooperacion_internacional",
    "reason": "Capacidad científica con demora y requisitos institucionales."
  },
  {
    "sourceId": "acuerdo_ambiental",
    "sourceName": "Acuerdo Ambiental",
    "decision": "reemplazar",
    "targetId": "firmar_acuerdo",
    "reason": "Plantilla pacto_ambiental exige resultado medible; firma sola no mejora ambiente."
  },
  {
    "sourceId": "participacion_cumbres",
    "sourceName": "Participación en Cumbres",
    "decision": "fusionar",
    "targetId": "cooperacion_internacional",
    "reason": "Se elimina el viaje vacío: debe perseguir cooperación científica concreta."
  },
  {
    "sourceId": "mediacion_conflictos",
    "sourceName": "Mediación en Conflictos",
    "decision": "reemplazar",
    "targetId": "negociar",
    "reason": "Modo mediacion sólo para conflicto activo y luego de reunión."
  },
  {
    "sourceId": "seguridad_ciudadana",
    "sourceName": "Seguridad Ciudadana",
    "decision": "modificar",
    "targetId": "seguridad_ciudadana",
    "reason": "Resultado rápido; daño a derechos si faltan controles."
  },
  {
    "sourceId": "lucha_narcotrafico",
    "sourceName": "Lucha contra el Narcotráfico",
    "decision": "modificar",
    "targetId": "lucha_narcotrafico",
    "reason": "Más lenta pero persistente que un operativo."
  },
  {
    "sourceId": "programa_desarme",
    "sourceName": "Programa de Desarme",
    "decision": "fusionar",
    "targetId": "policia_proximidad",
    "reason": "Subprograma de prevención sin otro botón de seguridad parecido."
  },
  {
    "sourceId": "fortalecimiento_justicia",
    "sourceName": "Fortalecimiento de la Justicia",
    "decision": "modificar",
    "targetId": "fortalecimiento_justicia",
    "reason": "Abre herramientas de seguridad con salvaguardas."
  },
  {
    "sourceId": "sistema_vigilancia",
    "sourceName": "Sistema de Vigilancia",
    "decision": "modificar",
    "targetId": "sistema_vigilancia",
    "reason": "Seguridad diferida; controles reducen, no borran, costo de privacidad."
  },
  {
    "sourceId": "policia_proximidad",
    "sourceName": "Policía de Proximidad",
    "decision": "modificar",
    "targetId": "policia_proximidad",
    "reason": "Más lento que un operativo, compatible con garantías."
  },
  {
    "sourceId": "prevencion_delito",
    "sourceName": "Prevención del Delito",
    "decision": "fusionar",
    "targetId": "policia_proximidad",
    "reason": "Mismo resultado y horizonte que prevención de proximidad."
  },
  {
    "sourceId": "programa_cultural",
    "sourceName": "Programa Cultural",
    "decision": "modificar",
    "targetId": "programa_cultural",
    "reason": "Mejora formación y ejercicio de derechos culturales."
  },
  {
    "sourceId": "festival_arte",
    "sourceName": "Festival Nacional de Arte",
    "decision": "fusionar",
    "targetId": "programa_cultural",
    "reason": "Variación temática sin mecánica propia."
  },
  {
    "sourceId": "patrimonio_historico",
    "sourceName": "Protección del Patrimonio",
    "decision": "modificar",
    "targetId": "patrimonio_historico",
    "reason": "Retorno productivo pequeño y tardío."
  },
  {
    "sourceId": "red_bibliotecas",
    "sourceName": "Red de Bibliotecas",
    "decision": "fusionar",
    "targetId": "programa_cultural",
    "reason": "Acceso y formación cultural. El gasto se cuenta una vez."
  },
  {
    "sourceId": "centros_culturales",
    "sourceName": "Centros Culturales",
    "decision": "fusionar",
    "targetId": "programa_cultural",
    "reason": "Acceso cultural incluido; evita proliferar infraestructura con idéntico premio."
  },
  {
    "sourceId": "escuelas_arte",
    "sourceName": "Escuelas de Arte",
    "decision": "fusionar",
    "targetId": "programa_cultural",
    "reason": "Formación cultural integrada."
  },
  {
    "sourceId": "museos_interactivos",
    "sourceName": "Museos Interactivos",
    "decision": "fusionar",
    "targetId": "patrimonio_historico",
    "reason": "Equipamiento patrimonial y turístico como variante."
  },
  {
    "sourceId": "festivales_regionales",
    "sourceName": "Festivales Regionales",
    "decision": "fusionar",
    "targetId": "programa_cultural",
    "reason": "Escala regional como foco del mismo programa."
  },
  {
    "sourceId": "promover_educacion",
    "sourceName": "Promover Educación",
    "decision": "fusionar",
    "targetId": "programa_educativo",
    "reason": "Acción genérica redundante con el programa educativo."
  },
  {
    "sourceId": "fomentar_turismo",
    "sourceName": "Fomentar Turismo",
    "decision": "fusionar",
    "targetId": "patrimonio_historico",
    "reason": "Evita beneficio inmediato barato sin capacidad turística."
  },
  {
    "sourceId": "desarrollar_tecnologia",
    "sourceName": "Desarrollar Tecnología",
    "decision": "modificar",
    "targetId": "desarrollar_tecnologia",
    "reason": "Transforma capacidad científica previa en actividad futura."
  }
];
