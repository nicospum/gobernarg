import type { CampaignEvent, Difficulty, Profile, Strategy } from './campaignTypes';

export const DIFFICULTIES: Record<Difficulty, { name: string; revenue: number; eventChance: number; electionPenalty: number }> = {
  easy: { name: 'Aprendiz', revenue: 1.12, eventChance: .18, electionPenalty: -3 },
  normal: { name: 'Normal', revenue: 1, eventChance: .28, electionPenalty: 0 },
  hard: { name: 'Difícil', revenue: .92, eventChance: .38, electionPenalty: 3 },
  legend: { name: 'Leyenda', revenue: .85, eventChance: .48, electionPenalty: 5 },
};
/** Perfiles: solo ventajas fijas. `summary` es la ventaja en una línea (pantalla de nueva partida). */
export const PROFILES: Record<Profile, { name: string; summary: string; description: string }> = {
  politico: { name: 'Político de Raza', summary: 'Reuniones gratis con aliados y ventaja de incumbencia en la primera reelección.', description: 'Reuniones gratuitas con aliados. Retiene el 5% del margen electoral restante al buscar su primera reelección.' },
  empresario: { name: 'Empresario', summary: '10 % menos de costo en políticas económicas y 500 U más de tope de deuda.', description: '10% menos de desembolso en políticas económicas. Capacidad adicional de deuda: 500 U.' },
  sindicalista: { name: 'Sindicalista', summary: '+1 acción por turno y reuniones gratis con sindicatos y organizaciones sociales.', description: 'Un punto de acción adicional. Reuniones gratuitas con sindicatos y organizaciones sociales.' },
  comunicador: { name: 'Comunicador', summary: 'Los eventos golpean 30 % menos a los indicadores.', description: 'Reduce 30% los impactos negativos de indicadores en eventos.' },
};
/** Datos del perfil de una partida (el estado guarda el id como texto). */
export const profileInfo = (id: string) => (PROFILES as Record<string, (typeof PROFILES)[Profile] | undefined>)[id];

export const STRATEGIES: Record<Strategy, { name: string; description: string; efficacy: number; cost: number }> = {
  acelerar: { name: 'Acelerar', description: '+10% de eficacia y +10% de costo inicial. Desplaza el estilo hacia la radicalidad.', efficacy: .10, cost: 1.10 },
  negociar: { name: 'Negociar', description: 'Negociaciones 25% más baratas; políticas con 5% menos de eficacia.', efficacy: -.05, cost: 1 },
  abrirse: { name: 'Abrirse', description: 'Reuniones 25% más baratas y +5% de eficacia. La coordinación cuesta 20 U por cierre.', efficacy: .05, cost: 1 },
  jugada_audaz: { name: 'Jugada Audaz', description: 'Durante dos turnos: +20% de eficacia y +20% de costo. Luego se pasa a Negociar.', efficacy: .20, cost: 1.20 },
};
export const CAMPAIGN_EVENTS: CampaignEvent[] = [
  { id: 'police_violence_scandal', title: 'Escándalo de violencia policial', description: 'Se denuncian abusos durante un operativo. La respuesta define las garantías de control.', image: 'policeViolenceScandal', choices: [
    { id: 'investigate', label: 'Investigar y reparar', cost: 60, description: 'Garantías +3; seguridad −1 durante la reorganización.', effect: { indicator: { derechos: 3, seguridad: -1 } } },
    { id: 'defend', label: 'Respaldar el operativo', cost: 0, description: 'Garantías −4; seguridad +1.', effect: { indicator: { derechos: -4, seguridad: 1 } } },
  ] },
  { id: 'debt_default', title: 'Default selectivo de deuda', description: 'Los atrasos complican la relación con los acreedores. El principal no desaparece por elegir una respuesta.', image: 'debtDefault', choices: [
    { id: 'dialogue', label: 'Abrir una mesa con acreedores', cost: 25, description: 'Relación financiera +3. El reperfilamiento debe negociarse y ejecutarse sobre un contrato.', effect: { relationship: { financiero: 3 } } },
    { id: 'default', label: 'Postergar la respuesta', cost: 0, description: 'Crédito −4; relación financiera −4. Se mantienen deuda y atrasos.', effect: { indicator: { credito: -4 }, relationship: { financiero: -4 } } },
  ] },
  { id: 'energy_crisis', title: 'Crisis energética', description: 'La red no logra sostener la demanda. Se necesitan reparaciones o racionamiento.', image: 'energyCrisis', choices: [
    { id: 'repair', label: 'Reparar la red', cost: 100, description: 'Infraestructura +2; actividad −1 por las interrupciones.', effect: { indicator: { infraestructura: 2, actividad: -1 } } },
    { id: 'ration', label: 'Racionar el suministro', cost: 0, description: 'Actividad −3; ingreso real −1.', effect: { indicator: { actividad: -3, ingreso_real: -1 } } },
  ] },
  { id: 'general_strike', title: 'Paro general', description: 'Los sindicatos convocan una huelga por condiciones laborales y salarios.', image: 'generalStrike', choices: [
    { id: 'dialogue', label: 'Abrir una mediación', cost: 35, description: 'Relación sindical +3; actividad −1. Los compromisos salariales se negocian aparte.', effect: { relationship: { sindicatos: 3 }, indicator: { actividad: -1 } } },
    { id: 'deduct', label: 'Descontar jornadas', cost: 0, description: 'Ingreso real −2; relación sindical −4; actividad −2.', effect: { relationship: { sindicatos: -4 }, indicator: { ingreso_real: -2, actividad: -2 } } },
  ] },
  { id: 'heat_wave', title: 'Ola de calor extrema', description: 'La temperatura pone a prueba los servicios de salud y protección.', image: 'heatWave', choices: [
    { id: 'emergency', label: 'Activar centros de asistencia', cost: 70, description: 'Salud −1; protección +1.', effect: { indicator: { salud: -1, proteccion: 1 } } },
    { id: 'wait', label: 'Usar la capacidad existente', cost: 0, description: 'Salud −3; protección −1.', effect: { indicator: { salud: -3, proteccion: -1 } } },
  ] },
  { id: 'diplomatic_conflict', title: 'Conflicto diplomático', description: 'Una disputa comercial amenaza acuerdos de cooperación.', image: 'diplomaticConflict', choices: [
    { id: 'mediate', label: 'Enviar una misión diplomática', cost: 50, description: 'Capacidad exportadora −1; garantías +1.', effect: { indicator: { externo: -1, derechos: 1 } } },
    { id: 'escalate', label: 'Escalar la disputa', cost: 0, description: 'Capacidad exportadora −3; ciencia −1.', effect: { indicator: { externo: -3, ciencia: -1 } } },
  ] },
  { id: 'external_sanctions', title: 'Sanciones externas', description: 'Restricciones internacionales afectan el acceso a mercados y tecnología.', image: 'externalSanctions', choices: [
    { id: 'negotiate', label: 'Revisar compromisos internacionales', cost: 80, description: 'Capacidad exportadora −1; garantías +2.', effect: { indicator: { externo: -1, derechos: 2 } } },
    { id: 'accept', label: 'Absorber las restricciones', cost: 0, description: 'Capacidad exportadora −4; ciencia −2.', effect: { indicator: { externo: -4, ciencia: -2 } } },
  ] },
  { id: 'drought', title: 'Sequía', description: 'La falta de agua reduce producción y recursos disponibles.', image: 'drought', choices: [
    { id: 'assist', label: 'Asistir a productores', cost: 90, description: 'Capacidad exportadora −1; ambiente −1.', effect: { indicator: { externo: -1, ambiente: -1 } } },
    { id: 'wait', label: 'Priorizar el ahorro fiscal', cost: 0, description: 'Capacidad exportadora −3; actividad −2; ambiente −2.', effect: { indicator: { externo: -3, actividad: -2, ambiente: -2 } } },
  ] },
  { id: 'prison_riot', title: 'Motín carcelario', description: 'Una crisis penitenciaria exige proteger a internos y trabajadores.', image: 'prisonRiot', choices: [
    { id: 'negotiate', label: 'Mediar y mejorar condiciones', cost: 50, description: 'Garantías +2; seguridad −1.', effect: { indicator: { derechos: 2, seguridad: -1 } } },
    { id: 'force', label: 'Intervenir por la fuerza', cost: 0, description: 'Seguridad +1; garantías −3.', effect: { indicator: { seguridad: 1, derechos: -3 } } },
  ] },
  { id: 'drug_wave', title: 'Ola de narcotráfico', description: 'Las redes delictivas disputan el control de varios barrios.', image: 'drugWave', choices: [
    { id: 'investigate', label: 'Investigar redes financieras', cost: 85, description: 'Seguridad +2; crédito −1 durante las inspecciones.', effect: { indicator: { seguridad: 2, credito: -1 } } },
    { id: 'patrol', label: 'Redistribuir patrullas', cost: 0, description: 'Seguridad −1; garantías −1 por sobrecarga.', effect: { indicator: { seguridad: -1, derechos: -1 } } },
  ] },
  { id: 'oposicion_bloqueo', title: 'Bloqueo legislativo post-electoral', description: 'La nueva composición del Congreso dificulta la agenda del Ejecutivo.', image: 'electionDay', choices: [
    { id: 'talk', label: 'Abrir una consulta legislativa', cost: 30, description: 'Relación con oposición +2; garantías +1.', effect: { relationship: { oposicion: 2 }, indicator: { derechos: 1 } } },
    { id: 'force', label: 'Sostener la agenda sin cambios', cost: 0, description: 'Relación con oposición −3.', effect: { relationship: { oposicion: -3 } } },
  ] },
  { id: 'oposicion_marcha', title: 'Marcha opositora al Congreso', description: 'Sectores opositores movilizan reclamos contra el rumbo del gobierno.', image: 'socialProtest', choices: [
    { id: 'receive', label: 'Recibir a los manifestantes', cost: 20, description: 'Garantías +1; relación con organizaciones +2.', effect: { indicator: { derechos: 1 }, relationship: { organizaciones: 2 } } },
    { id: 'ignore', label: 'No abrir una instancia de diálogo', cost: 0, description: 'Relación con organizaciones −3; actividad −1.', effect: { relationship: { organizaciones: -3 }, indicator: { actividad: -1 } } },
  ] },
  { id: 'oposicion_juicio', title: 'Intento de juicio político', description: 'Una comisión reclama rendición de cuentas. La destitución depende de la crisis institucional, no de este evento aislado.', image: 'corruption', choices: [
    { id: 'audit', label: 'Facilitar una auditoría', cost: 60, description: 'Garantías +3; relación con oposición +1.', effect: { indicator: { derechos: 3 }, relationship: { oposicion: 1 } } },
    { id: 'refuse', label: 'Negar información', cost: 0, description: 'Garantías −4; relación con oposición −3.', effect: { indicator: { derechos: -4 }, relationship: { oposicion: -3 } } },
  ] },
  { id: 'desgaste_soberbia', title: 'Críticas por soberbia de gobierno', description: 'La victoria electoral alimenta dudas sobre la disposición a escuchar.', image: 'corruption', choices: [
    { id: 'listen', label: 'Convocar una ronda de escucha', cost: 25, description: 'Relación con aliados +2.', effect: { relationship: { aliados: 2 } } },
    { id: 'dismiss', label: 'Desestimar las críticas', cost: 0, description: 'Relación con aliados −3.', effect: { relationship: { aliados: -3 } } },
  ] },
  { id: 'desgaste_alianza', title: 'Aliados incómodos', description: 'La coalición y las provincias reclaman participación en las decisiones.', image: 'electionDay', choices: [
    { id: 'coordinate', label: 'Armar una mesa federal', cost: 30, description: 'Relación con gobernadores +2 y aliados +2.', effect: { relationship: { gobernadores: 2, aliados: 2 } } },
    { id: 'centralize', label: 'Centralizar la conducción', cost: 0, description: 'Relación con gobernadores −3 y aliados −3.', effect: { relationship: { gobernadores: -3, aliados: -3 } } },
  ] },
  { id: 'desgaste_medios', title: 'Editoriales de advertencia', description: 'Los medios reclaman que la victoria se traduzca en resultados y rendición de cuentas.', image: 'corruption', choices: [
    { id: 'report', label: 'Presentar un informe público', cost: 20, description: 'Garantías +1.', effect: { indicator: { derechos: 1 } } },
    { id: 'ignore', label: 'No responder', cost: 0, description: 'Garantías −1.', effect: { indicator: { derechos: -1 } } },
  ] },
  { id: 'inflation', title: 'Crisis inflacionaria', description: 'Los precios tensionan contratos y abastecimiento. Definí una respuesta.', image: 'economicCrisis', choices: [
    { id: 'anchor', label: 'Anclar contratos', cost: 80, description: 'Inflación −3; actividad −1.', effect: { indicator: { inflacion: -3, actividad: -1 } } },
    { id: 'protect', label: 'Proteger ingresos', cost: 100, description: 'Poder adquisitivo +2; inflación +1.', effect: { indicator: { ingreso_real: 2, inflacion: 1 } } },
    { id: 'wait', label: 'Mantener el rumbo', cost: 0, description: 'Inflación +2; ingreso real −1.', effect: { indicator: { inflacion: 2, ingreso_real: -1 } } },
  ] },
  { id: 'investment', title: 'Inversión extranjera', description: 'Un consorcio propone ampliar capacidad productiva. Las condiciones ambientales están en discusión.', image: 'infrastructure', choices: [
    { id: 'standards', label: 'Exigir salvaguardas', cost: 60, description: 'Actividad +2; capacidad exportadora +2.', effect: { indicator: { actividad: 2, externo: 2 } } },
    { id: 'fast', label: 'Acelerar permisos', cost: 0, description: 'Actividad +3; ambiente −3; garantías −1.', effect: { indicator: { actividad: 3, ambiente: -3, derechos: -1 } } },
    { id: 'decline', label: 'No avanzar', cost: 0, description: 'Sin cambios materiales.', effect: {} },
  ] },
  { id: 'coalition', title: 'Oportunidad de coalición', description: 'Los aliados ofrecen abrir una mesa de coordinación. Una reunión sigue siendo necesaria para negociar cada ley.', image: 'electionDay', choices: [
    { id: 'dialogue', label: 'Abrir la mesa', cost: 35, description: 'Relación con aliados +3 por la coordinación explícita.', effect: { relationship: { aliados: 3 } } },
    { id: 'decline', label: 'Mantener distancia', cost: 0, description: 'Relación con aliados −2.', effect: { relationship: { aliados: -2 } } },
  ] },
  { id: 'blockade', title: 'Bloqueo legislativo', description: 'La oposición reclama información antes de discutir la agenda.', image: 'electionDay', choices: [
    { id: 'account', label: 'Presentar información', cost: 40, description: 'Garantías +2; relación con oposición +2.', effect: { indicator: { derechos: 2 }, relationship: { oposicion: 2 } } },
    { id: 'force', label: 'Forzar la agenda', cost: 0, description: 'Garantías −2; relación con oposición −4.', effect: { indicator: { derechos: -2 }, relationship: { oposicion: -4 } } },
  ] },
  { id: 'students', title: 'Protestas estudiantiles', description: 'La comunidad educativa reclama condiciones para cursar.', image: 'socialProtest', choices: [
    { id: 'fund', label: 'Financiar una respuesta', cost: 75, description: 'Educación +2; protección +1.', effect: { indicator: { educacion: 2, proteccion: 1 } } },
    { id: 'consult', label: 'Abrir una consulta', cost: 15, description: 'Relación con estudiantes +2; educación −1 por la demora.', effect: { indicator: { educacion: -1 }, relationship: { estudiantes: 2 } } },
    { id: 'ignore', label: 'Postergar', cost: 0, description: 'Educación −2; relación con estudiantes −3.', effect: { indicator: { educacion: -2 }, relationship: { estudiantes: -3 } } },
  ] },
  { id: 'health', title: 'Crisis en el sistema de salud', description: 'Los hospitales informan saturación y faltantes.', image: 'socialProtest', choices: [
    { id: 'emergency', label: 'Comprar insumos', cost: 100, description: 'Salud +3.', effect: { indicator: { salud: 3 } } },
    { id: 'reorganize', label: 'Reorganizar atención', cost: 25, description: 'Salud +1; protección −1.', effect: { indicator: { salud: 1, proteccion: -1 } } },
    { id: 'wait', label: 'Postergar', cost: 0, description: 'Salud −3.', effect: { indicator: { salud: -3 } } },
  ] },
  { id: 'flood', title: 'Emergencia hídrica', description: 'Las inundaciones dañan redes y viviendas.', image: 'flood', choices: [
    { id: 'rescue', label: 'Desplegar asistencia', cost: 90, description: 'Infraestructura −1; protección +2.', effect: { indicator: { infraestructura: -1, proteccion: 2 } } },
    { id: 'local', label: 'Coordinar con provincias', cost: 30, description: 'Infraestructura −2; relación con gobernadores +2.', effect: { indicator: { infraestructura: -2 }, relationship: { gobernadores: 2 } } },
    { id: 'wait', label: 'Limitar la intervención', cost: 0, description: 'Infraestructura −3; protección −2.', effect: { indicator: { infraestructura: -3, proteccion: -2 } } },
  ] },
];
