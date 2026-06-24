import { useState } from "react"
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight,
  AlertTriangle, Info, Star, Lock, Users, DollarSign,
  Calendar, Shield, Zap, Globe, X, Building2,
  MessageSquare, Handshake, Gift, Clock, BarChart2,
  RefreshCw, Award, Check, ArrowRight, Flag, Target,
  Activity, Landmark, Vote, Heart
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────

type Risk = "bajo" | "medio" | "alto" | "critico"
type Power = "Bajo" | "Medio" | "Alto" | "Muy Alto"
type ActionStatus = "available" | "blocked" | "bonus" | "recommended"
type EffectType = "economic" | "social" | "political" | "electoral" | "institutional"
type GroupCategory = "Sectores Económicos" | "Grupos Sociales" | "Movimientos Sociales" | "Partidos Políticos" | "Colectivos"

interface Indicator {
  id: string; label: string; value: number; max: number; trend: number
  unit?: string; inverseRisk?: boolean; tooltip: string
}
interface Action {
  id: string; name: string
  category: "Economía" | "Social" | "Infraestructura" | "Diplomacia" | "Seguridad" | "Cultura"
  economicCost: number; politicCost: number
  immediateEffect: string; futureEffect?: string; duration?: number
  affectedGroups: string[]; risk: string; riskLevel: Risk
  status: ActionStatus; blockReason?: string; recReason?: string
}
interface ActiveEffect {
  id: string; title: string; origin: string; type: EffectType
  impact: string; turnsLeft: number; positive: boolean; urgent?: boolean
}
interface InterestGroup {
  id: string; name: string; category: GroupCategory
  relation: number; power: Power; electoralInfluence: number; tension: Risk
  demand?: string; demandTurnsLeft?: number; cooldownTurns?: number
  description: string; wants: string[]; rejects: string[]
}
interface CalendarEvent {
  id: string; title: string; turn: number; currentTurn: number
  severity: "info" | "warning" | "critical"; probableImpact: string; requiresAction: boolean
}
interface GameState {
  playerName: string; role: string; year: number; turn: number; maxTurns: number
  budget: number; budgetChange: number; voteIntent: number; voteIntentTrend: number
  defeatRisk: Risk; indicators: Indicator[]; actions: Action[]
  effects: ActiveEffect[]; groups: InterestGroup[]; calendar: CalendarEvent[]
}

// ─── Initial Data ────────────────────────────────────────────────────

const INITIAL: GameState = {
  playerName: "Laura Méndez", role: "Presidenta", year: 2025,
  turn: 14, maxTurns: 32, budget: 2420, budgetChange: 180,
  voteIntent: 39, voteIntentTrend: -1, defeatRisk: "medio",
  indicators: [
    { id: "popularidad", label: "Popularidad", value: 54, max: 100, trend: -2, unit: "%",
      tooltip: "Aprobación general de la gestión. Cae por inflación y conflictos sindicales. Sube con obras y medidas sociales." },
    { id: "estabilidad", label: "Estabilidad", value: 61, max: 100, trend: 1,
      tooltip: "Nivel de orden institucional y social. Riesgo medio. Afectada por protestas y demandas sindicales latentes." },
    { id: "legitimidad", label: "Legitimidad", value: 47, max: 100, trend: -3,
      tooltip: "Percepción de autoridad y legalidad del gobierno. Cae por escándalos, falta de diálogo y baja transparencia." },
    { id: "conflicto", label: "Conflicto Social", value: 42, max: 100, trend: 5, inverseRisk: true,
      tooltip: "Nivel de tensión social activa. Mayor valor = mayor riesgo. Generado por sindicatos y demandas insatisfechas." },
  ],
  actions: [
    { id: "fomento_exp", name: "Fomento a la Exportación", category: "Economía", economicCost: 75, politicCost: 1,
      immediateEffect: "+2 Empresarios, −1 Sindicatos", futureEffect: "+$80M/turno por 4 turnos", duration: 4,
      affectedGroups: ["Empresarios", "CGT", "Campo"], risk: "Tensión con industria local", riskLevel: "bajo",
      status: "recommended", recReason: "Contexto favorable: acuerdo regional activo" },
    { id: "acuerdo_precios", name: "Acuerdo de Precios", category: "Economía", economicCost: 30, politicCost: 2,
      immediateEffect: "−Inflación, +Clase media", futureEffect: "Posible incumplimiento en 3 turnos", duration: 3,
      affectedGroups: ["Cámara de Comercio", "Clase media"], risk: "Boicot empresarial", riskLevel: "medio", status: "available" },
    { id: "emision", name: "Emisión Monetaria", category: "Economía", economicCost: -200, politicCost: 0,
      immediateEffect: "+$200M presupuesto inmediato", futureEffect: "+Inflación, −Legitimidad en 2 turnos", duration: 2,
      affectedGroups: ["Clase media", "Sector informal"], risk: "Devaluación, fuga de capitales", riskLevel: "critico", status: "available" },
    { id: "reduccion_gasto", name: "Reducción del Gasto Público", category: "Economía", economicCost: -300, politicCost: 4,
      immediateEffect: "+$300M", futureEffect: "−Servicios públicos, +Conflicto social", duration: 3,
      affectedGroups: ["Empleados públicos", "CGT", "Orgs. sociales"], risk: "Paro general inminente", riskLevel: "alto",
      status: "blocked", blockReason: "CGT amenaza con huelga general si se avanza en ajuste" },
    { id: "plan_vivienda", name: "Plan de Vivienda Popular", category: "Social", economicCost: 200, politicCost: 0,
      immediateEffect: "+Comunidades vulnerables, +Orgs. sociales", futureEffect: "+Estabilidad, +Popularidad en 2 turnos", duration: 2,
      affectedGroups: ["Comunidades vulnerables", "Orgs. sociales", "Construcción"], risk: "Sobredemanda, licitaciones cuestionadas", riskLevel: "bajo", status: "available" },
    { id: "bono_jubilados", name: "Bono para Jubilados", category: "Social", economicCost: 120, politicCost: 1,
      immediateEffect: "+Popularidad, +Adultos mayores", futureEffect: "Presión para repetirlo en 3 turnos", duration: 1,
      affectedGroups: ["Adultos mayores", "Clase media"], risk: "Precedente de gasto recurrente", riskLevel: "bajo",
      status: "recommended", recReason: "Elecciones legislativas en turno 18: alto impacto electoral" },
    { id: "reforma_salud", name: "Reforma del Sistema de Salud", category: "Social", economicCost: 350, politicCost: 3,
      immediateEffect: "+Legitimidad, +Clase media", futureEffect: "+Popularidad sostenida 6 turnos", duration: 6,
      affectedGroups: ["Sindicatos médicos", "Obras sociales", "Sector privado"], risk: "Resistencia gremial y corporativa", riskLevel: "medio",
      status: "blocked", blockReason: "Presupuesto insuficiente: requiere $350M sobre margen crítico actual" },
    { id: "autopista", name: "Autopista Córdoba–Rosario", category: "Infraestructura", economicCost: 280, politicCost: 1,
      immediateEffect: "+Empleados de obra, +Sindicatos construcción", futureEffect: "+Economía regional, +votos Córdoba/Stafe", duration: 5,
      affectedGroups: ["Construcción", "Interior"], risk: "Demoras, sobreprecios, opacidad licitatoria", riskLevel: "medio", status: "available" },
    { id: "conectividad", name: "Conectividad Rural", category: "Infraestructura", economicCost: 90, politicCost: 0,
      immediateEffect: "+Campo, +Comunidades rurales", futureEffect: "+Productividad agropecuaria en 3 turnos", duration: 3,
      affectedGroups: ["Sector agropecuario", "Comunidades rurales"], risk: "Bajo impacto político inmediato", riskLevel: "bajo", status: "available" },
    { id: "acuerdo_brasil", name: "Acuerdo Comercial con Brasil", category: "Diplomacia", economicCost: 40, politicCost: 0,
      immediateEffect: "+Legitimidad int., +Empresarios exportadores", futureEffect: "+$120M/turno por 5 turnos, +Estabilidad", duration: 5,
      affectedGroups: ["Empresarios", "Sector exportador"], risk: "Oposición sectores proteccionistas", riskLevel: "bajo", status: "available" },
    { id: "negociacion_fmi", name: "Negociación con el FMI", category: "Diplomacia", economicCost: 0, politicCost: 5,
      immediateEffect: "+$800M reservas, condiciones de ajuste", futureEffect: "−Gasto público forzado por 4 turnos", duration: 4,
      affectedGroups: ["Partidos opositores", "Movimientos sociales", "Piqueteros"], risk: "Movilización masiva", riskLevel: "alto", status: "available" },
    { id: "operativo_seg", name: "Operativo Seguridad Ciudadana", category: "Seguridad", economicCost: 60, politicCost: 2,
      immediateEffect: "−Conflicto urbano, +Clase media", futureEffect: "Posibles denuncias de abusos en 2 turnos", duration: 2,
      affectedGroups: ["Clase media", "Mov. DDHH", "Com. vulnerables"], risk: "Represión percibida", riskLevel: "medio", status: "available" },
    { id: "festival", name: "Festival Cultural Nacional", category: "Cultura", economicCost: 25, politicCost: 0,
      immediateEffect: "+Popularidad, +Juventud, +Legitimidad", affectedGroups: ["Juventud", "Artistas", "Medios"],
      risk: "Crítica por gasto cultural en crisis", riskLevel: "bajo", status: "available" },
    { id: "becas", name: "Programa de Becas Universitarias", category: "Cultura", economicCost: 80, politicCost: 0,
      immediateEffect: "+Universidades, +Juventud, +Intención de voto joven", futureEffect: "+Legitimidad por 4 turnos", duration: 4,
      affectedGroups: ["Estudiantes", "Universidades"], risk: "Bajo", riskLevel: "bajo", status: "available" },
  ],
  effects: [
    { id: "impulso_exp", title: "Impulso Exportador", origin: "Fomento a la Exportación",
      type: "economic", impact: "+$80M al presupuesto por turno", turnsLeft: 3, positive: true },
    { id: "acuerdo_reg", title: "Acuerdo Regional Activo", origin: "Acuerdo con Mercosur",
      type: "political", impact: "+Estabilidad +2, +Legitimidad +1 por turno", turnsLeft: 2, positive: true },
    { id: "tension_sind", title: "Tensión Sindical Latente", origin: "Demanda pendiente CGT",
      type: "social", impact: "Sin resolución: −Estabilidad −8, +Conflicto +12", turnsLeft: 2, positive: false, urgent: true },
    { id: "deuda_fmi", title: "Vencimiento Deuda FMI", origin: "Acuerdo de deuda 2023",
      type: "economic", impact: "−$800M al presupuesto en turno 15", turnsLeft: 1, positive: false, urgent: true },
  ],
  groups: [
    { id: "campo", name: "Confederación Rural Arg.", category: "Sectores Económicos", relation: 72, power: "Muy Alto",
      electoralInfluence: 18, tension: "bajo", cooldownTurns: 3,
      description: "Representa al sector agropecuario exportador. Gran peso económico en provincias del interior.",
      wants: ["Tipo de cambio favorable", "Reducción de retenciones", "Infraestructura rural"],
      rejects: ["Retenciones altas", "Control de exportaciones"] },
    { id: "uia", name: "Unión Industrial Argentina", category: "Sectores Económicos", relation: 65, power: "Muy Alto",
      electoralInfluence: 22, tension: "bajo",
      description: "Representa a la industria manufacturera nacional. Peso político y económico muy alto.",
      wants: ["Crédito barato", "Protección arancelaria", "Estabilidad cambiaria"],
      rejects: ["Apertura de importaciones", "Tarifazos"] },
    { id: "cgt", name: "CGT — Confederación Sindical", category: "Sectores Económicos", relation: 41, power: "Muy Alto",
      electoralInfluence: 30, tension: "alto", demand: "Aumento salarial del 15% y paritaria urgente", demandTurnsLeft: 2,
      description: "Principal central obrera. Capacidad real de paralizar la economía con un paro general.",
      wants: ["Paritarias libres", "Aumento salarial", "No a la reforma laboral"],
      rejects: ["Reducción del gasto", "Reforma laboral", "Privatizaciones"] },
    { id: "camara", name: "Cámara de Comercio", category: "Sectores Económicos", relation: 63, power: "Alto",
      electoralInfluence: 12, tension: "bajo",
      description: "Representa al comercio minorista y mayorista. Sensible a inflación y consumo interno.",
      wants: ["Estabilidad de precios", "Crédito para pymes"],
      rejects: ["Control de precios forzado", "Alta inflación"] },
    { id: "clase_media", name: "Clase Media Urbana", category: "Grupos Sociales", relation: 48, power: "Alto",
      electoralInfluence: 35, tension: "medio",
      description: "Sector social volátil electoralmente. Sensible a inflación, inseguridad y servicios públicos.",
      wants: ["Inflación baja", "Seguridad", "Dólar estable"],
      rejects: ["Corrupción", "Inseguridad creciente", "Pérdida de poder adquisitivo"] },
    { id: "orgs_soc", name: "Organizaciones Sociales", category: "Grupos Sociales", relation: 58, power: "Medio",
      electoralInfluence: 15, tension: "bajo", demand: "Ampliación del plan de vivienda popular", demandTurnsLeft: 4,
      description: "Agrupaciones barriales y comedores populares. Alta capacidad de movilización territorial.",
      wants: ["Plan habitacional", "Planes sociales", "Comedores comunitarios"],
      rejects: ["Ajuste en programas sociales"] },
    { id: "com_vuln", name: "Comunidades Vulnerables", category: "Grupos Sociales", relation: 37, power: "Bajo",
      electoralInfluence: 8, tension: "medio", demand: "Plan habitacional urgente", demandTurnsLeft: 3,
      description: "Poblaciones en exclusión social. Alta vulnerabilidad ante recortes de gasto social.",
      wants: ["Vivienda digna", "Acceso a agua y luz", "Planes de empleo"],
      rejects: ["Ajuste en subsidios", "Desalojos"] },
    { id: "feminismo", name: "Movimiento Feminista", category: "Movimientos Sociales", relation: 62, power: "Bajo",
      electoralInfluence: 20, tension: "bajo", cooldownTurns: 2,
      description: "Movilización transversal con alta visibilidad mediática.",
      wants: ["Perspectiva de género en políticas", "Presupuesto para género"],
      rejects: ["Ajuste en programas de género"] },
    { id: "piqueteros", name: "Movimiento Piquetero", category: "Movimientos Sociales", relation: 28, power: "Medio",
      electoralInfluence: 10, tension: "alto", demand: "Aumento de planes sociales y no al ajuste", demandTurnsLeft: 1,
      description: "Movimiento de desempleados y sector informal. Alto poder de disrupción callejera.",
      wants: ["Más planes sociales", "No al ajuste", "Trabajo genuino"],
      rejects: ["Represión", "Ajuste", "Privatizaciones"] },
    { id: "ambiental", name: "Movimiento Ambiental", category: "Movimientos Sociales", relation: 45, power: "Bajo",
      electoralInfluence: 8, tension: "bajo",
      description: "Organizaciones con creciente visibilidad. Influye en agenda de energía y minería.",
      wants: ["Transición energética", "Freno a megaminería"],
      rejects: ["Fracking", "Deforestación"] },
    { id: "coalicion", name: "Coalición Gobernante", category: "Partidos Políticos", relation: 78, power: "Muy Alto",
      electoralInfluence: 40, tension: "bajo", cooldownTurns: 1,
      description: "Bloque parlamentario propio. Fundamental para aprobar leyes y gobernar con mayoría.",
      wants: ["Cargos en gobierno", "Candidaturas en 2025"],
      rejects: ["Decisiones unilaterales sin consulta"] },
    { id: "oposicion_mod", name: "Oposición Moderada", category: "Partidos Políticos", relation: 42, power: "Alto",
      electoralInfluence: 30, tension: "medio",
      description: "Bloque opositor dispuesto al diálogo. Puede votar algunas leyes.",
      wants: ["Participación en comisiones", "Diálogo genuino"],
      rejects: ["Autoritarismo", "Decretos sin consenso"] },
    { id: "oposicion_dura", name: "Oposición Dura", category: "Partidos Políticos", relation: 15, power: "Medio",
      electoralInfluence: 20, tension: "critico",
      description: "Bloque que no dialoga. Busca desgastar al gobierno en todo momento.",
      wants: ["Elecciones anticipadas"],
      rejects: ["Toda política del gobierno"] },
  ],
  calendar: [
    { id: "ev1", title: "Vencimiento Deuda FMI", turn: 15, currentTurn: 14, severity: "critical",
      probableImpact: "−$800M al presupuesto. Sin reservas: default técnico y crisis de confianza.", requiresAction: true },
    { id: "ev2", title: "Paro General Amenazado (CGT)", turn: 16, currentTurn: 14, severity: "warning",
      probableImpact: "−Estabilidad −10, +Conflicto +15 si no se negocia antes del turno 15.", requiresAction: true },
    { id: "ev3", title: "Elecciones Legislativas", turn: 18, currentTurn: 14, severity: "critical",
      probableImpact: "Renovación del 50% del Congreso. Proyección actual: pérdida de mayoría propia.", requiresAction: false },
    { id: "ev4", title: "Cumbre del Mercosur", turn: 20, currentTurn: 14, severity: "info",
      probableImpact: "+Legitimidad internacional. Oportunidad de acuerdos comerciales.", requiresAction: false },
    { id: "ev5", title: "Posible Crisis Cambiaria", turn: 22, currentTurn: 14, severity: "warning",
      probableImpact: "Si reservas < $500M: corrida cambiaria. Requiere medidas preventivas.", requiresAction: true },
  ],
}

// ─── Utilities ───────────────────────────────────────────────────────

function getValueRisk(value: number, max: number, inverse?: boolean): Risk {
  const p = value / max
  if (inverse) {
    if (p < 0.3) return "bajo"; if (p < 0.55) return "medio"; if (p < 0.75) return "alto"; return "critico"
  }
  if (p > 0.7) return "bajo"; if (p > 0.5) return "medio"; if (p > 0.3) return "alto"; return "critico"
}

function riskColor(risk: Risk, variant: "text" | "bg" | "fill" = "text"): string {
  const m = { bajo: ["text-emerald-400", "bg-emerald-400", "fill-emerald-400"], medio: ["text-amber-400", "bg-amber-400", "fill-amber-400"], alto: ["text-orange-400", "bg-orange-400", "fill-orange-400"], critico: ["text-red-400", "bg-red-400", "fill-red-400"] }
  return m[risk][variant === "text" ? 0 : variant === "bg" ? 1 : 2]
}

function riskLabel(risk: Risk) { return { bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico" }[risk] }

function relationBarColor(rel: number) {
  if (rel >= 70) return "bg-emerald-400"; if (rel >= 55) return "bg-yellow-400"; if (rel >= 40) return "bg-orange-400"; return "bg-red-400"
}

function fmtBudget(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${n}M` }

const EFFECT_TYPE: Record<EffectType, { label: string; cls: string }> = {
  economic: { label: "Económico", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  social: { label: "Social", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  political: { label: "Político", cls: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  electoral: { label: "Electoral", cls: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
  institutional: { label: "Institucional", cls: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
}

const ACTION_CATEGORIES = ["Todas", "Economía", "Social", "Infraestructura", "Diplomacia", "Seguridad", "Cultura"] as const
const CAT_ICONS: Record<string, React.ReactNode> = {
  "Economía": <DollarSign size={13} />, "Social": <Heart size={13} />, "Infraestructura": <Building2 size={13} />,
  "Diplomacia": <Globe size={13} />, "Seguridad": <Shield size={13} />, "Cultura": <Star size={13} />,
}

const GROUP_CATEGORIES: GroupCategory[] = ["Sectores Económicos", "Grupos Sociales", "Movimientos Sociales", "Partidos Políticos"]

// ─── Small Components ─────────────────────────────────────────────────

function Bar({ value, max, colorClass, thin }: { value: number; max: number; colorClass: string; thin?: boolean }) {
  return (
    <div className={`w-full bg-white/8 rounded-full overflow-hidden ${thin ? "h-1" : "h-1.5"}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  )
}

function TrendChip({ value }: { value: number }) {
  if (value === 0) return <span className="flex items-center gap-0.5 text-[10px] text-white/40"><Minus size={10} />0</span>
  const pos = value > 0
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono ${pos ? "text-emerald-400" : "text-red-400"}`}>
      {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{pos ? "+" : ""}{value}
    </span>
  )
}

function RiskBadge({ risk }: { risk: Risk }) {
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${riskColor(risk, "text")} bg-white/6`}>{riskLabel(risk)}</span>
}

function StatusBadge({ status, blockReason, recReason }: { status: ActionStatus; blockReason?: string; recReason?: string }) {
  if (status === "recommended") return (
    <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-400/12 border border-amber-400/20 px-1.5 py-0.5 rounded" title={recReason}>
      <Star size={9} className="fill-amber-300 text-amber-300" />REC
    </span>
  )
  if (status === "blocked") return (
    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded" title={blockReason}>
      <Lock size={9} />BLQ
    </span>
  )
  if (status === "bonus") return (
    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">
      <Award size={9} />BON
    </span>
  )
  return null
}

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0a1525] border border-white/12 text-[11px] text-white/80 rounded-md px-3 py-2 shadow-2xl z-50 leading-relaxed pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}

// ─── Group Interaction Modal ──────────────────────────────────────────

function GroupInteractionModal({ group, onClose, onAction }: {
  group: InterestGroup; onClose: () => void; onAction: (type: "reunirse" | "negociar" | "conceder") => void
}) {
  const [selected, setSelected] = useState<"reunirse" | "negociar" | "conceder" | null>(null)

  const options = [
    {
      key: "reunirse" as const, icon: <MessageSquare size={18} />, label: "Reunirse",
      cost: "Gratis", relation: "+5 relación",
      desc: "Abre canales de diálogo. Durante los próximos turnos, las acciones que favorezcan a este grupo tienen mayor impacto.",
      color: "border-blue-500/40 hover:border-blue-400/60 hover:bg-blue-500/5",
      confirm: "text-blue-400",
    },
    {
      key: "negociar" as const, icon: <Handshake size={18} />, label: "Negociar",
      cost: "Costo político: −2", relation: "+12 relación",
      desc: "Genera una demanda formal en 1–2 turnos. Si se cumple: relación +20. Si se ignora: −Estabilidad, +Conflicto.",
      color: "border-amber-500/40 hover:border-amber-400/60 hover:bg-amber-500/5",
      confirm: "text-amber-400",
    },
    {
      key: "conceder" as const, icon: <Gift size={18} />, label: "Conceder",
      cost: `Costo alto: ${fmtBudget(80)} + costo político`, relation: "+25 relación",
      desc: "Mejora fuerte e inmediata de la relación. Evita nuevas demandas por 4 turnos. Costo económico y político elevado.",
      color: "border-emerald-500/40 hover:border-emerald-400/60 hover:bg-emerald-500/5",
      confirm: "text-emerald-400",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1e38] border border-white/12 rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-white/8">
          <div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest mb-1">Interacción con grupo</div>
            <h2 className="font-['Barlow_Condensed'] font-bold text-xl text-white">{group.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] text-white/50">Relación actual:</span>
              <span className={`font-mono text-sm font-semibold ${group.relation >= 60 ? "text-emerald-400" : group.relation >= 40 ? "text-amber-400" : "text-red-400"}`}>{group.relation}/100</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-semibold ${riskColor(group.tension, "text")} bg-white/6`}>Tensión {riskLabel(group.tension)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={18} /></button>
        </div>

        {group.demand && (
          <div className="mx-5 mt-4 px-3 py-2.5 bg-orange-400/8 border border-orange-400/20 rounded-lg">
            <div className="text-[10px] text-orange-400/70 uppercase tracking-wide mb-0.5 font-semibold">Demanda activa</div>
            <div className="text-[12px] text-orange-200">{group.demand}</div>
            {group.demandTurnsLeft && <div className="text-[10px] text-orange-400/60 mt-0.5">Vence en {group.demandTurnsLeft} turno{group.demandTurnsLeft !== 1 ? "s" : ""}</div>}
          </div>
        )}

        <div className="p-5 flex flex-col gap-3">
          {options.map(opt => (
            <button key={opt.key} onClick={() => setSelected(opt.key === selected ? null : opt.key)}
              className={`text-left p-4 rounded-lg border transition-all duration-150 ${selected === opt.key ? opt.color.replace("hover:", "") + " " + opt.color : "border-white/8 " + opt.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`${opt.confirm} opacity-80`}>{opt.icon}</span>
                  <span className="font-['Barlow_Condensed'] font-semibold text-base text-white">{opt.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40">{opt.cost}</span>
                  <span className={`text-[11px] font-semibold ${opt.confirm}`}>{opt.relation}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/55 leading-relaxed">{opt.desc}</p>
              {selected === opt.key && (
                <button onClick={() => { onAction(opt.key); onClose() }}
                  className={`mt-3 w-full py-2 rounded text-[12px] font-semibold ${opt.confirm} bg-white/6 border border-white/12 hover:bg-white/10 transition-colors`}>
                  Confirmar — {opt.label}
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Group Detail Modal ───────────────────────────────────────────────

function GroupDetailModal({ group, onClose, onInteract }: {
  group: InterestGroup; onClose: () => void; onInteract: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1e38] border border-white/12 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-white/8">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{group.category}</div>
            <h2 className="font-['Barlow_Condensed'] font-bold text-xl text-white">{group.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[12px] text-white/60 leading-relaxed">{group.description}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/4 rounded-lg p-3 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Relación</div>
              <div className={`font-mono text-lg font-bold ${group.relation >= 60 ? "text-emerald-400" : group.relation >= 40 ? "text-amber-400" : "text-red-400"}`}>{group.relation}</div>
              <Bar value={group.relation} max={100} colorClass={relationBarColor(group.relation)} thin />
            </div>
            <div className="bg-white/4 rounded-lg p-3 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Poder</div>
              <div className="text-sm font-semibold text-white">{group.power}</div>
            </div>
            <div className="bg-white/4 rounded-lg p-3 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Inf. Electoral</div>
              <div className="font-mono text-lg font-bold text-purple-400">{group.electoralInfluence}%</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Quiere</div>
            <ul className="space-y-1">{group.wants.map((w, i) => <li key={i} className="flex items-center gap-2 text-[11px] text-emerald-300/80"><Check size={9} className="text-emerald-400 flex-shrink-0" />{w}</li>)}</ul>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Rechaza</div>
            <ul className="space-y-1">{group.rejects.map((r, i) => <li key={i} className="flex items-center gap-2 text-[11px] text-red-300/70"><X size={9} className="text-red-400 flex-shrink-0" />{r}</li>)}</ul>
          </div>
          {group.demand && (
            <div className="bg-orange-400/8 border border-orange-400/20 rounded-lg p-3">
              <div className="text-[10px] text-orange-400/70 uppercase tracking-wide mb-1 font-semibold">Demanda activa</div>
              <div className="text-[12px] text-orange-200">{group.demand}</div>
            </div>
          )}
          <button onClick={() => { onClose(); onInteract() }}
            className="w-full py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg font-semibold text-[13px] transition-colors flex items-center justify-center gap-2">
            <MessageSquare size={14} />Interactuar con este grupo
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────

function TopBar({ state, onEndTurn, onReset }: { state: GameState; onEndTurn: () => void; onReset: () => void }) {
  const pop = state.indicators.find(i => i.id === "popularidad")
  const est = state.indicators.find(i => i.id === "estabilidad")

  return (
    <header className="h-13 flex-none flex items-center px-4 gap-5 bg-[#091422] border-b border-white/8 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-none">
        <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
          <Landmark size={14} className="text-white" />
        </div>
        <div className="font-['Barlow_Condensed'] font-bold text-base text-white tracking-wider">GOBERN<span className="text-accent">ARG</span></div>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Role & Player */}
      <div className="flex-none">
        <div className="text-[10px] text-white/35 uppercase tracking-widest leading-none">{state.role}</div>
        <div className="text-[13px] font-semibold text-white leading-tight">{state.playerName}</div>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Turn */}
      <div className="flex items-center gap-1.5 flex-none">
        <Clock size={13} className="text-white/35" />
        <div>
          <div className="text-[10px] text-white/35 leading-none">TURNO</div>
          <div className="font-mono text-[13px] font-bold text-white">{state.turn}<span className="text-white/30">/{state.maxTurns}</span></div>
        </div>
        <div className="w-16 ml-1">
          <Bar value={state.turn} max={state.maxTurns} colorClass="bg-primary" thin />
        </div>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Budget */}
      <div className="flex items-center gap-1.5 flex-none">
        <DollarSign size={13} className="text-white/35" />
        <div>
          <div className="text-[10px] text-white/35 leading-none">PRESUPUESTO</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[13px] font-bold text-white">{fmtBudget(state.budget)}</span>
            <span className={`text-[10px] font-mono ${state.budgetChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {state.budgetChange >= 0 ? "+" : ""}{fmtBudget(state.budgetChange)}/t
            </span>
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Popularity compact */}
      {pop && (
        <div className="flex items-center gap-2 flex-none">
          <Activity size={13} className="text-white/35" />
          <div>
            <div className="text-[10px] text-white/35 leading-none">POPULAR.</div>
            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-[13px] font-bold ${riskColor(getValueRisk(pop.value, pop.max, false), "text")}`}>{pop.value}%</span>
              <TrendChip value={pop.trend} />
            </div>
          </div>
        </div>
      )}

      {/* Stability compact */}
      {est && (
        <div className="flex items-center gap-2 flex-none">
          <Shield size={13} className="text-white/35" />
          <div>
            <div className="text-[10px] text-white/35 leading-none">ESTABIL.</div>
            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-[13px] font-bold ${riskColor(getValueRisk(est.value, est.max, false), "text")}`}>{est.value}</span>
              <TrendChip value={est.trend} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <button onClick={onReset}
        className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded border border-transparent hover:border-white/10">
        <RefreshCw size={11} />Reiniciar
      </button>

      <button onClick={onEndTurn}
        className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-[12px] font-bold uppercase tracking-wide transition-colors font-['Barlow_Condensed']">
        <ArrowRight size={14} />Finalizar Turno
      </button>
    </header>
  )
}

// ─── Indicators Panel ─────────────────────────────────────────────────

function IndicatorsPanel({ indicators, voteIntent, voteIntentTrend }: {
  indicators: Indicator[]; voteIntent: number; voteIntentTrend: number
}) {
  const allIndicators = [
    ...indicators,
    { id: "voto", label: "Intención de Voto", value: voteIntent, max: 100, trend: voteIntentTrend, unit: "%",
      tooltip: "Proyección electoral actual. Elecciones legislativas en turno 18. Proyección actual: pérdida de mayoría." }
  ]

  return (
    <div className="flex gap-2.5 flex-none">
      {allIndicators.map(ind => {
        const risk = getValueRisk(ind.value, ind.max, ind.inverseRisk)
        const barColor = riskColor(risk, "bg")
        return (
          <div key={ind.id} className="flex-1 bg-card rounded-lg border border-border px-3.5 py-2.5 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <Tooltip text={ind.tooltip}>
                <span className="text-[10px] text-white/40 uppercase tracking-widest cursor-help font-semibold flex items-center gap-1">
                  {ind.label}<Info size={9} className="opacity-50" />
                </span>
              </Tooltip>
              <TrendChip value={ind.trend} />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className={`font-mono text-2xl font-bold leading-none ${riskColor(risk, "text")}`}>{ind.value}</span>
              {ind.unit && <span className="text-[11px] text-white/30">{ind.unit}</span>}
              {!ind.unit && <span className="text-[11px] text-white/30">/100</span>}
            </div>
            <Bar value={ind.value} max={ind.max} colorClass={barColor} />
            <div className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide ${riskColor(risk, "text")}`}>
              {ind.inverseRisk ? (risk === "bajo" ? "Bajo" : risk === "medio" ? "Moderado" : risk === "alto" ? "Alto" : "Crítico") : riskLabel(risk)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Action Card ──────────────────────────────────────────────────────

function ActionCard({ action, budget, onExecute }: { action: Action; budget: number; onExecute: (id: string) => void }) {
  const canAfford = action.economicCost <= 0 || budget >= action.economicCost
  const isBlocked = action.status === "blocked" || !canAfford
  const costLabel = action.economicCost < 0 ? `+${fmtBudget(Math.abs(action.economicCost))}` : action.economicCost === 0 ? "Gratis" : fmtBudget(action.economicCost)
  const costColor = action.economicCost < 0 ? "text-emerald-400" : action.economicCost === 0 ? "text-white/40" : canAfford ? "text-white/70" : "text-red-400"

  return (
    <div className={`relative bg-card border rounded-lg p-3.5 flex flex-col gap-2.5 transition-all duration-150 ${isBlocked ? "border-border opacity-60" : "border-border hover:border-white/20 hover:bg-white/3"}`}>
      {/* Status badge */}
      <div className="absolute top-2.5 right-2.5">
        <StatusBadge status={action.status} blockReason={action.blockReason} recReason={action.recReason} />
      </div>

      {/* Header */}
      <div className="pr-12">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-white/30">{CAT_ICONS[action.category]}</span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">{action.category}</span>
        </div>
        <div className="font-['Barlow_Condensed'] font-semibold text-[14px] text-white leading-tight">{action.name}</div>
      </div>

      {/* Costs */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="flex items-center gap-1"><DollarSign size={10} className="text-white/30" /><span className={`font-mono font-semibold ${costColor}`}>{costLabel}</span></span>
        {action.politicCost > 0 && <span className="flex items-center gap-1"><Flag size={9} className="text-white/30" /><span className="font-mono text-white/50">−{action.politicCost} pol.</span></span>}
        {action.duration && <span className="flex items-center gap-1"><Clock size={9} className="text-white/30" /><span className="text-white/40">{action.duration}t</span></span>}
      </div>

      {/* Effects */}
      <div className="space-y-1">
        <div className="flex gap-1.5 items-start">
          <Zap size={9} className="text-white/25 mt-0.5 flex-shrink-0" />
          <span className="text-[11px] text-white/60 leading-snug">{action.immediateEffect}</span>
        </div>
        {action.futureEffect && (
          <div className="flex gap-1.5 items-start">
            <Clock size={9} className="text-white/20 mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-white/40 leading-snug">{action.futureEffect}</span>
          </div>
        )}
      </div>

      {/* Risk + Execute */}
      <div className="flex items-center justify-between pt-1 border-t border-white/6 mt-auto">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={9} className={riskColor(action.riskLevel, "text")} />
          <span className={`text-[10px] ${riskColor(action.riskLevel, "text")}`}>{action.risk}</span>
        </div>
        {!isBlocked ? (
          <button onClick={() => onExecute(action.id)}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-white bg-primary/15 hover:bg-primary px-2.5 py-1 rounded transition-all duration-150 font-['Barlow_Condensed'] uppercase tracking-wide">
            Ejecutar<ArrowRight size={10} />
          </button>
        ) : action.blockReason ? (
          <span className="text-[10px] text-red-400/60 max-w-[120px] text-right leading-tight">{action.blockReason.substring(0, 40)}…</span>
        ) : (
          <span className="text-[10px] text-red-400/60">Sin fondos</span>
        )}
      </div>
    </div>
  )
}

// ─── Actions Panel ────────────────────────────────────────────────────

function ActionsPanel({ actions, budget, onExecute }: { actions: Action[]; budget: number; onExecute: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState("Todas")
  const filtered = activeTab === "Todas" ? actions : actions.filter(a => a.category === activeTab)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 flex-none mb-2.5 bg-card border border-border rounded-lg p-1">
        {ACTION_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all duration-150 ${activeTab === cat ? "bg-primary text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            {cat !== "Todas" && <span className="opacity-70">{CAT_ICONS[cat]}</span>}
            {cat}
          </button>
        ))}
        <div className="ml-auto text-[10px] text-white/25 pr-1 font-mono">{filtered.length} acciones</div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map(a => <ActionCard key={a.id} action={a} budget={budget} onExecute={onExecute} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Effects Panel ────────────────────────────────────────────────────

function EffectsPanel({ effects }: { effects: ActiveEffect[] }) {
  const urgent = effects.filter(e => e.urgent || e.turnsLeft <= 1)
  const rest = effects.filter(e => !e.urgent && e.turnsLeft > 1)

  return (
    <div className="w-60 flex-none flex flex-col min-h-0 overflow-hidden">
      <div className="font-['Barlow_Condensed'] font-bold text-[12px] uppercase tracking-widest text-white/40 mb-2 flex-none">
        Efectos Activos <span className="font-mono text-white/20 normal-case">{effects.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {urgent.length > 0 && (
          <>
            <div className="text-[9px] uppercase tracking-widest text-red-400/60 font-semibold px-0.5">Urgentes</div>
            {urgent.map(e => <EffectCardComp key={e.id} effect={e} />)}
          </>
        )}
        {rest.length > 0 && (
          <>
            {urgent.length > 0 && <div className="text-[9px] uppercase tracking-widest text-white/25 font-semibold px-0.5 mt-2">Activos</div>}
            {rest.map(e => <EffectCardComp key={e.id} effect={e} />)}
          </>
        )}
      </div>
    </div>
  )
}

function EffectCardComp({ effect }: { effect: ActiveEffect }) {
  const et = EFFECT_TYPE[effect.type]
  return (
    <div className={`rounded-lg border p-3 ${effect.urgent ? "bg-red-400/5 border-red-400/25" : effect.positive ? "bg-emerald-400/4 border-emerald-400/15" : "bg-card border-border"}`}>
      <div className="flex items-start justify-between mb-1.5 gap-1">
        <div className="font-['Barlow_Condensed'] font-semibold text-[13px] text-white leading-tight">{effect.title}</div>
        {effect.urgent && <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />}
      </div>
      <div className="text-[10px] text-white/35 mb-1.5">↳ {effect.origin}</div>
      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${et.cls} font-semibold uppercase tracking-wide`}>{et.label}</span>
      <p className="text-[11px] text-white/60 leading-snug mt-1.5">{effect.impact}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={9} className={effect.turnsLeft <= 1 ? "text-red-400" : "text-white/25"} />
        <span className={`text-[10px] font-mono ${effect.turnsLeft <= 1 ? "text-red-400" : "text-white/40"}`}>
          {effect.turnsLeft} turno{effect.turnsLeft !== 1 ? "s" : ""} restante{effect.turnsLeft !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}

// ─── Right Sidebar ────────────────────────────────────────────────────

function RightSidebar({ state, onGroupInteract, onGroupDetail }: {
  state: GameState; onGroupInteract: (g: InterestGroup) => void; onGroupDetail: (g: InterestGroup) => void
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["Sectores Económicos"]))

  function toggleCat(cat: string) {
    setExpandedCats(prev => {
      const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n
    })
  }

  const topSupport = [...state.groups].filter(g => g.relation >= 60).sort((a, b) => b.relation - a.relation).slice(0, 3)
  const topOppose = [...state.groups].filter(g => g.relation < 45).sort((a, b) => a.relation - b.relation).slice(0, 3)

  return (
    <aside className="w-72 flex-none flex flex-col overflow-hidden border-l border-border bg-[#0d1d35]">
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* ── Political Summary ── */}
        <div className="p-4 border-b border-border">
          <div className="font-['Barlow_Condensed'] font-bold text-[11px] uppercase tracking-widest text-white/35 mb-3">Situación Electoral</div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] text-white/40 mb-0.5">Intención de voto</div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-mono text-2xl font-bold ${state.voteIntent >= 45 ? "text-emerald-400" : state.voteIntent >= 35 ? "text-amber-400" : "text-red-400"}`}>{state.voteIntent}%</span>
                <TrendChip value={state.voteIntentTrend} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/40 mb-0.5">Riesgo derrota</div>
              <RiskBadge risk={state.defeatRisk} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] text-emerald-400/60 uppercase tracking-wide mb-1.5 font-semibold">A favor</div>
              {topSupport.map(g => (
                <div key={g.id} className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/60 truncate mr-1">{g.name.split(" ")[0]}</span>
                  <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">{g.relation}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[9px] text-red-400/60 uppercase tracking-wide mb-1.5 font-semibold">En contra</div>
              {topOppose.map(g => (
                <div key={g.id} className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/60 truncate mr-1">{g.name.split(" ")[0]}</span>
                  <span className="font-mono text-[10px] text-red-400 flex-shrink-0">{g.relation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Calendar ── */}
        <div className="p-4 border-b border-border">
          <div className="font-['Barlow_Condensed'] font-bold text-[11px] uppercase tracking-widest text-white/35 mb-3">Calendario Político</div>
          <div className="space-y-2">
            {state.calendar.map(ev => {
              const diff = ev.turn - ev.currentTurn
              const sev = ev.severity
              const borderCls = sev === "critical" ? "border-red-400/30 bg-red-400/5" : sev === "warning" ? "border-amber-400/25 bg-amber-400/5" : "border-white/8"
              const turnCls = sev === "critical" ? "text-red-400" : sev === "warning" ? "text-amber-400" : "text-blue-400"
              return (
                <div key={ev.id} className={`rounded-lg border p-2.5 ${borderCls}`}>
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <div className="font-['Barlow_Condensed'] font-semibold text-[12px] text-white leading-tight">{ev.title}</div>
                    <div className="flex-none text-right">
                      <div className={`font-mono text-[11px] font-bold ${turnCls}`}>T{ev.turn}</div>
                      <div className="text-[9px] text-white/25">en {diff}t</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/45 leading-snug">{ev.probableImpact}</p>
                  {ev.requiresAction && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <AlertTriangle size={9} className={turnCls} />
                      <span className={`text-[9px] font-semibold uppercase tracking-wide ${turnCls}`}>Requiere acción</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Interest Groups ── */}
        <div className="p-4">
          <div className="font-['Barlow_Condensed'] font-bold text-[11px] uppercase tracking-widest text-white/35 mb-3">Grupos de Interés</div>
          <div className="space-y-1.5">
            {GROUP_CATEGORIES.map(cat => {
              const catGroups = state.groups.filter(g => g.category === cat)
              const expanded = expandedCats.has(cat)
              const pending = catGroups.filter(g => g.demand).length
              const avgRisk = catGroups.some(g => g.tension === "critico") ? "critico" : catGroups.some(g => g.tension === "alto") ? "alto" : catGroups.some(g => g.tension === "medio") ? "medio" : "bajo"
              const stable = catGroups.filter(g => !g.demand && g.tension === "bajo").length

              return (
                <div key={cat} className="rounded-lg border border-border overflow-hidden">
                  {/* Category header */}
                  <button onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-card hover:bg-white/4 transition-colors">
                    <div className="text-left">
                      <div className="font-['Barlow_Condensed'] font-semibold text-[12px] text-white">{cat}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {stable > 0 && <span className="text-[9px] text-emerald-400/70">{stable} estable{stable !== 1 ? "s" : ""}</span>}
                        {pending > 0 && <span className="text-[9px] text-orange-400/80 font-semibold">{pending} demanda{pending !== 1 ? "s" : ""}</span>}
                        <span className={`text-[9px] font-semibold ${riskColor(avgRisk, "text")}`}>riesgo {riskLabel(avgRisk).toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 font-mono">{catGroups.length}</span>
                      {expanded ? <ChevronDown size={13} className="text-white/30" /> : <ChevronRight size={13} className="text-white/30" />}
                    </div>
                  </button>

                  {/* Group cards */}
                  {expanded && (
                    <div className="border-t border-border divide-y divide-white/5">
                      {catGroups.map(group => (
                        <div key={group.id} className="px-3 py-2.5 hover:bg-white/2 transition-colors">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex-1 min-w-0">
                              <button onClick={() => onGroupDetail(group)}
                                className="font-['Barlow_Condensed'] font-semibold text-[12px] text-white hover:text-blue-300 transition-colors text-left">
                                {group.name}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-white/35">{group.power}</span>
                                <span className={`text-[9px] font-semibold ${riskColor(group.tension, "text")}`}>tensión {riskLabel(group.tension).toLowerCase()}</span>
                              </div>
                            </div>
                            <div className="flex-none text-right ml-2">
                              <div className={`font-mono text-sm font-bold ${group.relation >= 60 ? "text-emerald-400" : group.relation >= 40 ? "text-amber-400" : "text-red-400"}`}>{group.relation}</div>
                            </div>
                          </div>

                          {/* Relation bar */}
                          <Bar value={group.relation} max={100} colorClass={relationBarColor(group.relation)} thin />

                          {/* Demand or cooldown */}
                          {group.demand && (
                            <div className="mt-1.5 flex items-start gap-1">
                              <AlertTriangle size={9} className="text-orange-400 flex-shrink-0 mt-0.5" />
                              <span className="text-[10px] text-orange-300/80 leading-tight">{group.demand.substring(0, 50)}{group.demand.length > 50 ? "…" : ""}</span>
                            </div>
                          )}
                          {group.cooldownTurns && !group.demand && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <Check size={9} className="text-emerald-400" />
                              <span className="text-[9px] text-white/30">Sin demandas por {group.cooldownTurns}t</span>
                            </div>
                          )}

                          {/* Quick actions */}
                          <div className="flex gap-1.5 mt-2">
                            {[
                              { key: "r", label: "Reunirse", icon: <MessageSquare size={8} /> },
                              { key: "n", label: "Negociar", icon: <Handshake size={8} /> },
                              { key: "c", label: "Conceder", icon: <Gift size={8} /> },
                            ].map(btn => (
                              <button key={btn.key} onClick={() => onGroupInteract(group)}
                                className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/80 border border-white/8 hover:border-white/20 px-2 py-1 rounded transition-all duration-150">
                                {btn.icon}{btn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL)
  const [interactGroup, setInteractGroup] = useState<InterestGroup | null>(null)
  const [detailGroup, setDetailGroup] = useState<InterestGroup | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  function showNotif(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  function handleEndTurn() {
    setState(prev => {
      const newEffects = prev.effects
        .map(e => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
        .filter(e => e.turnsLeft > 0)
      return { ...prev, turn: prev.turn + 1, budgetChange: prev.budgetChange, effects: newEffects }
    })
    showNotif("Turno finalizado. Efectos procesados.")
  }

  function handleExecuteAction(id: string) {
    const action = state.actions.find(a => a.id === id)
    if (!action) return
    setState(prev => ({ ...prev, budget: prev.budget - Math.max(0, action.economicCost) }))
    showNotif(`"${action.name}" ejecutada.`)
  }

  function handleGroupAction(type: "reunirse" | "negociar" | "conceder") {
    if (!interactGroup) return
    const delta = type === "reunirse" ? 5 : type === "negociar" ? 12 : 25
    setState(prev => ({
      ...prev, groups: prev.groups.map(g =>
        g.id === interactGroup.id ? { ...g, relation: Math.min(100, g.relation + delta) } : g
      )
    }))
    showNotif(`${type === "reunirse" ? "Reunión" : type === "negociar" ? "Negociación" : "Concesión"} con ${interactGroup.name} confirmada. +${delta} relación.`)
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background text-foreground font-['Inter']">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
      `}</style>

      <TopBar state={state} onEndTurn={handleEndTurn} onReset={() => setState(INITIAL)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 gap-3 min-w-0">
          <IndicatorsPanel indicators={state.indicators} voteIntent={state.voteIntent} voteIntentTrend={state.voteIntentTrend} />
          <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
            <ActionsPanel actions={state.actions} budget={state.budget} onExecute={handleExecuteAction} />
            <EffectsPanel effects={state.effects} />
          </div>
        </main>

        {/* Sidebar */}
        <RightSidebar
          state={state}
          onGroupInteract={g => setInteractGroup(g)}
          onGroupDetail={g => setDetailGroup(g)}
        />
      </div>

      {/* Modals */}
      {interactGroup && (
        <GroupInteractionModal group={interactGroup} onClose={() => setInteractGroup(null)} onAction={handleGroupAction} />
      )}
      {detailGroup && (
        <GroupDetailModal group={detailGroup} onClose={() => setDetailGroup(null)} onInteract={() => { setInteractGroup(detailGroup); setDetailGroup(null) }} />
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#0f1e38] border border-white/15 text-white text-[12px] px-4 py-2.5 rounded-lg shadow-2xl z-[100] flex items-center gap-2 font-semibold">
          <Check size={13} className="text-emerald-400" />{notification}
        </div>
      )}
    </div>
  )
}
