import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CAUSAL_ACTIONS_BY_ID, getScenario } from '../src/data/causal';
import { monthlyInflationText } from '../src/engine/causal';
import { adaptiveBot, CRISIS_BOTS, type Bot } from '../src/playtest/bots';
import { playGame, type GameOutcome, type TurnLog } from '../src/playtest/runner';

/**
 * Escenarios históricos con reglas nuevas (Corralito 2001 e Hiper 1989):
 * emergencia de tres subrondas con una medida extraordinaria por subronda y,
 * después, gestión por trimestres con una extraordinaria por turno. Juegan los
 * cuatro bots de crisis (inacción, ortodoxo, heterodoxo, adaptable) más el
 * adaptable común como control, con las semillas 1..SEEDS.
 *
 * Son hipótesis de diseño medidas con bots, no una prueba de diversión: lo que
 * se mide es si las reglas producen los resultados buscados (la inacción
 * pierde, una estrategia coherente puede superar la emergencia y competir, las
 * apuestas no son imposibles ni gratis).
 *
 * Salida: $PLAYTEST_OUT/HISTORICOS.md e historicos.json (por defecto,
 * _analisis_gobernarg/playtest). Se regenera con `npm run playtest:historicos`.
 */
const SEEDS = Number(process.env.SEEDS ?? 20);
const OUT = process.env.PLAYTEST_OUT ?? path.resolve(__dirname, '..', '..', '..', '_analisis_gobernarg', 'playtest');
const SCENARIO_IDS = ['corralito', 'pais_en_llamas'];
const BOTS: Bot[] = [...CRISIS_BOTS, adaptiveBot];
/** Partida completa: 3 subrondas + 16 trimestres del mandato + 16 del segundo si hay reelección. */
const MAX_ENTRIES = 35;

const DEFEAT_LABEL: Record<string, string> = {
  election_loss: 'perdió la elección',
  hyperinflation: 'hiperinflación',
  resignation: 'renuncia',
  impeachment: 'juicio político',
  institutional_coup: 'crisis institucional',
  low_popularity: 'aprobación en el piso',
  negative_budget: 'quiebra fiscal',
};

const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const f0 = (x: number) => Math.round(x).toString();
const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
const actionName = (id: string) => CAUSAL_ACTIONS_BY_ID[id]?.name ?? id;
const defeatLabel = (reason: string | null) => (reason ? DEFEAT_LABEL[reason] ?? reason : 'sin motivo');

type Result = 'reelecto' | 'perdio_eleccion' | 'derrota' | 'en_curso';

/** Lo que se registra por partida (sin la bitácora turno por turno). */
interface GameRecord {
  bot: string;
  seed: number;
  result: Result;
  defeatReason: string | null;
  /** Dónde terminó: "semana 2", "mes 3" o "T12". */
  endedAt: string;
  victorious: boolean;
  /** Votos en la última elección jugada (reelección o sucesión). */
  lastElectionVotes: number | null;
  turnsPlayed: number;
  rounds: number;
  survivedEmergency: boolean;
  used: string[];
  bets: Record<string, 'bien' | 'mal'>;
  minGob: number;
  maxInfl: number;
  finalIv: number;
  finalCaja: number;
  finalDeuda: number;
}

interface Cell {
  n: number;
  survived: number;
  reelected: number;
  won: number;
  lostElection: number;
  defeats: Record<string, number>;
  avgTurns: number;
  betsBien: number;
  betsMal: number;
  betsByMeasure: Record<string, { bien: number; mal: number }>;
  /** Partidas en las que se usó cada medida. */
  measures: Record<string, number>;
  avgMinGob: number;
  avgMaxInfl: number;
  avgFinalIv: number;
  avgFinalCaja: number;
  avgFinalDeuda: number;
}

function roundUnit(scenarioId: string): string {
  return getScenario(scenarioId).crisis?.roundUnit === 'mes' ? 'mes' : 'semana';
}

function reelected(o: GameOutcome): boolean {
  return o.victorious || o.log.some(t => t.term >= 2);
}

function toRecord(scenarioId: string, o: GameOutcome): GameRecord {
  const last = o.log[o.log.length - 1];
  const result: Result = reelected(o)
    ? 'reelecto'
    : o.defeatReason === 'election_loss'
      ? 'perdio_eleccion'
      : o.gameOver
        ? 'derrota'
        : 'en_curso';
  return {
    bot: o.bot,
    seed: o.seed,
    result,
    defeatReason: o.defeatReason,
    endedAt: !last ? 'inicio' : last.round ? `${roundUnit(scenarioId)} ${last.round}` : `T${last.turn}`,
    victorious: o.victorious,
    lastElectionVotes: o.reelectionVotes,
    turnsPlayed: o.turnsPlayed,
    rounds: o.rounds ?? 0,
    survivedEmergency: o.crisis?.survivedEmergency ?? false,
    used: o.crisis?.used ?? [],
    bets: o.crisis?.bets ?? {},
    minGob: o.minGob,
    maxInfl: o.maxInfl,
    finalIv: o.finalIv,
    finalCaja: o.finalCaja,
    finalDeuda: o.finalDeuda,
  };
}

function summarize(games: GameRecord[]): Cell {
  const defeats: Record<string, number> = {};
  const betsByMeasure: Record<string, { bien: number; mal: number }> = {};
  const measures: Record<string, number> = {};
  let betsBien = 0;
  let betsMal = 0;
  for (const g of games) {
    if (g.result === 'derrota') defeats[defeatLabel(g.defeatReason)] = (defeats[defeatLabel(g.defeatReason)] ?? 0) + 1;
    else if (g.result === 'reelecto' && g.defeatReason && g.defeatReason !== 'election_loss') {
      const k = `${defeatLabel(g.defeatReason)} (2.º mandato)`;
      defeats[k] = (defeats[k] ?? 0) + 1;
    }
    for (const [id, outcome] of Object.entries(g.bets)) {
      const b = (betsByMeasure[id] ??= { bien: 0, mal: 0 });
      b[outcome]++;
      if (outcome === 'bien') betsBien++;
      else betsMal++;
    }
    for (const id of new Set(g.used)) measures[id] = (measures[id] ?? 0) + 1;
  }
  return {
    n: games.length,
    survived: games.filter(g => g.survivedEmergency).length,
    reelected: games.filter(g => g.result === 'reelecto').length,
    won: games.filter(g => g.victorious).length,
    lostElection: games.filter(g => g.result === 'perdio_eleccion').length,
    defeats,
    avgTurns: avg(games.map(g => g.turnsPlayed)),
    betsBien,
    betsMal,
    betsByMeasure,
    measures,
    avgMinGob: avg(games.map(g => g.minGob)),
    avgMaxInfl: avg(games.map(g => g.maxInfl)),
    avgFinalIv: avg(games.map(g => g.finalIv)),
    avgFinalCaja: avg(games.map(g => g.finalCaja)),
    avgFinalDeuda: avg(games.map(g => g.finalDeuda)),
  };
}

// ─────────────────────────────── Trayectorias ───────────────────────────────

function level(v: number): string {
  if (v < 25) return 'por el piso';
  if (v < 40) return 'baja';
  if (v < 55) return 'media';
  if (v < 70) return 'buena';
  return 'alta';
}

function gobWord(g: number): string {
  if (g < 15) return 'crítica';
  if (g < 30) return 'frágil';
  if (g < 50) return 'justa';
  return 'sólida';
}

function pricesWord(infl: number): string {
  if (infl < 15) return 'deflación';
  const text = monthlyInflationText(infl);
  return text === 'precios estables' ? 'estables' : text;
}

function indicatorsText(t: TurnLog): string {
  const a = t.indicatorsAfter;
  return `precios ${pricesWord(a.INFL)} (${f0(a.INFL)}) · actividad ${level(a.ACTV)} (${f0(a.ACTV)}) · bolsillo ${level(a.PODA)} (${f0(a.PODA)}) · gobernabilidad ${gobWord(t.gob)} (${f0(t.gob)}) · calle ${f0(a.CONF)} · caja ${t.caja}`;
}

/** Notas del cierre que explican la crisis (apuestas, bancos, régimen, caja); si hay pocas, se completan con las primeras. */
const RELEVANT = /apuesta|colapso|convertibilidad|caja|emisi|dolarizada|fondo|acreedores|quita|rompiste|renuncia|hiper|estado de sitio|corral|dep[oó]sitos|moneda|transici|congelamiento|default|reservas/i;

function turnLine(scenarioId: string, t: TurnLog): string {
  if (t.round) {
    const def = getScenario(scenarioId).crisis;
    const label = def?.rounds[t.round - 1] ?? `Subronda ${t.round}`;
    const unit = def?.roundUnit === 'mes' ? 'Mes' : 'Semana';
    const lines = t.events.filter(l => !l.startsWith('Medida de la ')).slice(0, 4);
    return `- **${unit} ${t.round} · ${label}** → medida: ${t.actions[0] ?? 'ninguna'}. ${lines.join(' ')} · ${indicatorsText(t)}`;
  }
  const relevant = t.notes.filter(n => RELEVANT.test(n)).slice(0, 3);
  const filler = relevant.length < 2 ? t.notes.filter(n => !relevant.includes(n)).slice(0, 2 - relevant.length) : [];
  const what = [...relevant, ...filler];
  const events = t.events.length ? ` Eventos: ${t.events.slice(0, 2).join(' | ')}.` : '';
  const causes = t.causes.length ? ` Por qué: ${t.causes.slice(0, 2).join('; ')}.` : '';
  const when = `T${t.turn} (año ${t.year}, trimestre ${t.quarter}${t.term > 1 ? ', 2.º mandato' : ''})`;
  return `- **${when}** → acciones: ${t.actions.join(', ') || 'ninguna'}.${what.length ? ` ${what.join(' ')}` : ''}${events}${causes} · ${indicatorsText(t)}`;
}

function resultText(g: GameRecord): string {
  switch (g.result) {
    case 'reelecto': {
      const tail = g.victorious
        ? ' y el espacio retuvo el gobierno en la sucesión'
        : g.defeatReason === 'election_loss'
          ? ', pero el espacio perdió la sucesión'
          : g.defeatReason
            ? `, pero cayó en el segundo mandato por ${defeatLabel(g.defeatReason)}`
            : '';
      return `reelecto${tail}`;
    }
    case 'perdio_eleccion': return `perdió la elección (${g.lastElectionVotes ?? '—'} % de los votos)`;
    case 'derrota': return `derrota por ${defeatLabel(g.defeatReason)} en ${g.endedAt}`;
    default: return 'sin terminar (se agotaron los turnos del runner)';
  }
}

function trajectory(scenarioId: string, bot: Bot, o: GameOutcome): string[] {
  const g = toRecord(scenarioId, o);
  const bets = Object.entries(g.bets).map(([id, r]) => `${actionName(id)}: ${r}`).join(' · ');
  return [
    `### ${getScenario(scenarioId).name} · ${bot.id} · ${bot.name}`,
    '',
    `Resultado: **${resultText(g)}**. Superó la emergencia: ${g.survivedEmergency ? 'sí' : 'no'}. Medidas extraordinarias: ${g.used.length ? g.used.map(actionName).join(' → ') : 'ninguna'}. Apuestas: ${bets || 'ninguna resuelta'}.`,
    '',
    ...o.log.map(t => turnLine(scenarioId, t)),
    '',
  ];
}

// ─────────────────────────────── Tablas ───────────────────────────────

function topMeasures(cell: Cell, k = 4): string {
  const entries = Object.entries(cell.measures).sort((a, b) => b[1] - a[1]).slice(0, k);
  return entries.length ? entries.map(([id, n]) => `${actionName(id)} (${n})`).join(', ') : '—';
}

function defeatsText(cell: Cell): string {
  const entries = Object.entries(cell.defeats).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries.map(([k, n]) => `${k} ${n}`).join(', ') : '—';
}

function betsText(cell: Cell): string {
  const total = cell.betsBien + cell.betsMal;
  return total ? `${cell.betsBien} / ${cell.betsMal} (${pct(cell.betsBien, total)} % bien)` : '—';
}

function resultsTable(cells: Record<string, Cell>): string[] {
  return [
    '| Bot | Supera la emergencia | Reelecto | Gana la carrera | Perdió la elección | Derrotas (motivo) | Turnos prom. | Apuestas bien / mal | Medidas más usadas |',
    '|---|---|---|---|---|---|---|---|---|',
    ...BOTS.map(b => {
      const c = cells[b.id];
      return `| ${b.id} · ${b.name} | ${pct(c.survived, c.n)} % | ${pct(c.reelected, c.n)} % | ${pct(c.won, c.n)} % | ${pct(c.lostElection, c.n)} % | ${defeatsText(c)} | ${f1(c.avgTurns)} | ${betsText(c)} | ${topMeasures(c)} |`;
    }),
  ];
}

function indicatorsTable(cells: Record<string, Cell>): string[] {
  return [
    '| Bot | Gobernabilidad mínima (prom.) | Precios máximos (prom.) | Intención de voto final (prom.) | Caja final (prom.) | Deuda final (prom.) |',
    '|---|---|---|---|---|---|',
    ...BOTS.map(b => {
      const c = cells[b.id];
      return `| ${b.id} · ${b.name} | ${f0(c.avgMinGob)} | ${f0(c.avgMaxInfl)} | ${f1(c.avgFinalIv)} % | ${f0(c.avgFinalCaja)} | ${f0(c.avgFinalDeuda)} |`;
    }),
  ];
}

function betsTable(cells: Record<string, Cell>): string[] {
  const merged: Record<string, { bien: number; mal: number; bots: Set<string> }> = {};
  for (const [botId, c] of Object.entries(cells)) {
    for (const [id, b] of Object.entries(c.betsByMeasure)) {
      const m = (merged[id] ??= { bien: 0, mal: 0, bots: new Set() });
      m.bien += b.bien;
      m.mal += b.mal;
      m.bots.add(botId);
    }
  }
  const rows = Object.entries(merged).sort((a, b) => b[1].bien + b[1].mal - (a[1].bien + a[1].mal));
  if (!rows.length) return ['Ninguna apuesta llegó a resolverse.'];
  return [
    '| Medida | Salió bien | Explotó | % bien | Bots que la jugaron |',
    '|---|---|---|---|---|',
    ...rows.map(([id, m]) => `| ${actionName(id)} | ${m.bien} | ${m.mal} | ${pct(m.bien, m.bien + m.mal)} % | ${[...m.bots].join(', ')} |`),
  ];
}

/** Metas de calibración del plan, contrastadas con los números de la corrida. */
function diagnosis(json: Record<string, Record<string, Cell>>): string[] {
  const inRange = (p: number) => p >= 30 && p <= 70;
  const row = (label: string, f: (cells: Record<string, Cell>) => string) => `| ${label} | ${SCENARIO_IDS.map(id => f(json[id])).join(' | ')} |`;
  const betsPct = (c: Cell) => (c.betsBien + c.betsMal ? pct(c.betsBien, c.betsBien + c.betsMal) : null);
  return [
    `| Meta | ${SCENARIO_IDS.map(id => getScenario(id).name).join(' | ')} |`,
    `|---|${SCENARIO_IDS.map(() => '---').join('|')}|`,
    row('La inacción pierde', cells => {
      const c = cells.XI;
      return `${c.reelected === 0 && c.won === 0 ? 'sí' : 'NO'} (${defeatsText(c)}${c.lostElection ? `, perdió la elección ${c.lostElection}` : ''})`;
    }),
    row('Un ortodoxo supera la emergencia (meta: la mayoría de las veces)', cells => `${pct(cells.XO.survived, cells.XO.n)} % → ${pct(cells.XO.survived, cells.XO.n) >= 50 ? 'sí' : 'NO'}`),
    row('Un heterodoxo supera la emergencia (meta: la mayoría de las veces)', cells => `${pct(cells.XH.survived, cells.XH.n)} % → ${pct(cells.XH.survived, cells.XH.n) >= 50 ? 'sí' : 'NO'}`),
    row('Reelección con buen juego (meta: 30 a 70 %)', cells => ['XO', 'XH', 'XA'].map(id => `${id} ${pct(cells[id].reelected, cells[id].n)} % (${inRange(pct(cells[id].reelected, cells[id].n)) ? 'sí' : 'NO'})`).join(', ')),
    row('Apuestas ni imposibles ni gratis (meta: 30 a 70 % bien)', cells => ['XO', 'XH', 'XA'].map(id => {
      const p = betsPct(cells[id]);
      return p === null ? `${id} sin apuestas resueltas (NO)` : `${id} ${p} % (${inRange(p) ? 'sí' : 'NO'})`;
    }).join(', ')),
  ];
}

// ─────────────────────────────── Calibración propuesta ───────────────────────────────
/**
 * Escrito a mano a partir de la corrida del 2 de noviembre de 2026 (20
 * semillas, motor en cb3eeaf). Los números de arriba se regeneran con cada
 * corrida; este bloque no: hay que revisarlo cuando cambien los datos de
 * src/data/causal/scenarios.ts o crisisActions.ts.
 */
const CALIBRATION_NOTES: string[] = [
  '## Calibración propuesta',
  '',
  'Escrito a mano a partir de la corrida del 2 de noviembre de 2026 (20 semillas, motor en `cb3eeaf`, antes de la recalibración de las medidas que está en curso). Las tablas de arriba se regeneran con cada corrida; este bloque no: hay que revisarlo cuando cambien `src/data/causal/scenarios.ts` o `crisisActions.ts`. Nada de esto está aplicado: son propuestas con la evidencia de los bots para que el dueño del motor decida.',
  '',
  '### Lectura general',
  '',
  '- La emergencia se supera: 100 % con cualquier estrategia activa en los dos escenarios (la inacción solo cae en la Hiper, en el mes 2). Lo que no se puede superar es la gestión: en 200 partidas ninguna llegó a la elección de T16. En el Corralito todas terminan entre T4 y T11 (juicio político por gobernabilidad bajo 15 dos cierres seguidos, o hiperinflación); en la Hiper entre T2 y T4.',
  '- Los finales son casi deterministas: inacción Corralito en T5 (20 de 20), ortodoxo Corralito en T4 (20 de 20), ortodoxo Hiper en T2 (20 de 20), heterodoxo y adaptables de la Hiper en T4 (20 de 20). Los eventos aleatorios no cambian el desenlace: lo deciden las reglas estructurales.',
  '- Tres mecanismos explican todas las derrotas: (1) un déficit estructural que vuelve emisión forzada desde T2 o T3; (2) la actividad, que cae a 0-10 con cualquier paquete de medidas y arrastra la recaudación; (3) la calle (conflictividad), que satura cerca de 100 y hunde la gobernabilidad. Las apuestas con condiciones sobre divisas, crédito y resultado fiscal quedan fuera de alcance por esos mismos tres mecanismos.',
  '',
  '### 1. Cuentas: el déficit estructural fuerza la emisión desde T2 o T3',
  '',
  'Evidencia: resultado estructural inicial de −279 por trimestre en el Corralito (300 son solo los intereses: 5 % de 6.000 de deuda) y de −244 en la Hiper (caja 250 contra gasto 850 con recaudación por 0,85). Inacción en el Corralito: caja −2 en T1 y −353 en T2; emisión forzada desde T3 todos los turnos, con precios +8 a +14 por trimestre. Heterodoxo en el Corralito: aun en default (sin intereses) el resultado es −193 en T1 y −313 en T2 porque la actividad cae de 33 a 9 y con ella la recaudación. Ortodoxo en la Hiper: shock fiscal y privatizaciones dejan caja 1.900 y resultado +540 en T1, pero cae por la calle (punto 3).',
  '',
  'Propuesta (`scenarios.ts`): Corralito `ingresoMult` 0,9 → 1,0 y `gastoCorr` 820 → 740 (resultado estructural ≈ −120, que un ajuste del gasto o las cuasimonedas pueden cerrar); Hiper `ingresoMult` 0,85 → 0,95 y `gastoCorr` 850 → 760 (≈ −110). Alternativa en `crisisActions.ts`: que `suspender_pagos` traiga CAJA +150 inmediato (el alivio de no pagar intereses hoy recién se nota al cierre siguiente, cuando la caja ya está en rojo).',
  '',
  '### 2. Actividad: todo paquete de medidas la lleva a 0-10 y el rebote no llega',
  '',
  'Evidencia (semilla 1): actividad inicial 33 (Corralito) y 36 (Hiper). Ortodoxo Corralito: 29 → 19 (apertura) → 7 (corralito y tasas) → 0 en T2. Heterodoxo Corralito: 27 → 20 → 15 → 9 en T2. Ortodoxo Hiper: 28 → 23 → 15 → 7 → 0 en T2. Los efectos inmediatos de las medidas sobre la actividad son todos negativos (corralito −4 y −2,5 por semana con retiros limitados, devaluar −4, apertura −6, dolarizar −4, shock −6, privatizar −3) y se suman a las reglas estructurales R04 (crédito en 0-15: −3 a −4 por trimestre), R06 (calle sobre 55: hasta −2,7) y R07 (divisas bajo 35: hasta −2). El rebote del escenario (+1,2 por trimestre desde el cierre 3 si no hay convertibilidad y precios bajo 55; Hiper +1,5 si precios bajo 60) no se activó a tiempo en ninguna partida.',
  '',
  'Propuesta: (a) efectos inmediatos sobre ACTV a la mitad: `limitar_retiros` −4 → −2 y la dinámica semanal con retiros limitados −2,5 → −1,5; `apertura_total` −6 → −3; `dolarizar` BONUS −4 → −2; `shock_fiscal` BONUS −6 → −3; `privatizar_todo` −3 → −2. (b) Rebote más fuerte y más temprano: Corralito `perTurn` 1,2 → 2,5, `from` 3 → 2 y condición `INFL<55` → `INFL<65`; Hiper `perTurn` 1,5 → 2,5 y condición `INFL<60` → `INFL<75`.',
  '',
  '### 3. Calle: la conflictividad satura en 100 y la gobernabilidad cae bajo 15',
  '',
  'Evidencia: conflictividad inicial 60 (Corralito) y 70 (Hiper). La dinámica de cada subronda suma +3 (+2 más si protección social bajo 35) en el Corralito y +4 (−2 si protección social de 35 o más) en la Hiper, más los efectos de las medidas (corralito +8 y +6 por semana con retiros limitados, corralón +10, devaluar +6, pesificar +8, apertura +6, privatizar +12, shock +10, dolarizar +4). Heterodoxo Corralito: 60 → 79 → 96 → 100 al cerrar la emergencia; ortodoxo Hiper: 70 → 80 → 96 → 100. Con la calle en 80-100 la gobernabilidad baja de 15 en dos cierres: juicio político en 20 de 20 para el ortodoxo en los dos escenarios y en 20 de 20 para la inacción del Corralito. Gobernabilidad mínima promedio: ortodoxo 0 en los dos escenarios, inacción 12, heterodoxo 12.',
  '',
  'Propuesta: (a) dinámica de la emergencia: Corralito +3 → +2 (y +1 extra en vez de +2 si protección social bajo 35); Hiper +4 → +3. (b) Conflictividad inmediata de las medidas de régimen a ~60 %: `limitar_retiros` 8 → 5 y semanal con retiros limitados 6 → 4; `reprogramar_depositos` 10 → 6; `salir_convertibilidad` 6 → 4; `pesificar` 8 → 5; `apertura_total` 6 → 4; `privatizar_todo` 12 → 8; `shock_fiscal` 10 → 7; `dolarizar` 4 → 2. (c) Que `ley_emergencia` sea alcanzable (punto 5): es la válvula de gobernabilidad pensada para esto (+12 por seis turnos) y ningún bot pudo usarla en 200 partidas.',
  '',
  '### 4. Apuestas: condiciones fuera de alcance',
  '',
  '| Medida | Apuesta (plazo) | Qué se observó al resolverse | 20 semillas | Propuesta |',
  '|---|---|---|---|---|',
  '| Salir de la convertibilidad | `INFL<55` (+3) | precios 45-55 (semilla 1: 53) | 20 bien / 0 mal: gratis | `INFL<45` (con control de precios el heterodoxo llega a 53: pasa a ser una apuesta real) |',
  '| Liberar los depósitos | `EXTE>=30` (+2) | divisas 30-34 después de devaluar | 20 / 0: gratis | `EXTE>=35` |',
  '| Limitar los retiros | sin corralito ni corralón (+3) | el heterodoxo libera (bien), el ortodoxo nunca (mal) | 20 / 20 | dejar |',
  '| Estado de sitio (Corralito) | `PSOC>=35` o asistencia (+1) | con emergencia alimentaria sale bien, sin ella explota | 20 / 21 | dejar |',
  '| Pesificar | `INVC>=30 and INFL<60` (+4) | crédito 0-15 | 0 / 20 | `INVC>=15 and INFL<65` |',
  '| Cuasimonedas | `INFL<45 and SOLV>=25` (+4) | precios 57-89, solvencia 0-10 | 0 / 20 | `INFL<60 and SOLV>=10` |',
  '| Default (suspender pagos) | deuda renegociada (+6) | renegociar exige `TURN>=4` y `SOLV>=18` o agenda internacional; con solvencia 0-10 tras el default solo la agenda lo destraba (los bots la hacen cada 6 turnos: 7 intentos, 3 éxitos) | 3 / 17 | ventana +8 y requisito `SOLV>=12` |',
  '| Rescate del FMI | lo aprueban 5 de 20 pedidos (p ≈ 0,27: el +0,25 por cuentas en orden es inalcanzable con resultado −279); apuesta `RESULT3>=0` (+4) | las 5 aprobaciones explotaron | 0 / 5 | base 0,25 → 0,35 y `RESULT3>=-120` |',
  '| Dolarizar | `RESULT3>=0 and SOLV>=30` (+4) | nunca se resolvió: el ortodoxo cae en T4; solvencia 13-18 y resultado −200 a −500 | sin dato | `RESULT3>=-150 and SOLV>=20` |',
  '| Emergencia alimentaria | `INFL<85` (+3) | Corralito: casi gratis (49 bien / 11 mal); Hiper: precios en 100 en T3 | 49 / 71 | dejar la condición y arreglar la dinámica de la Hiper (puntos 2 y 3); si se quiere una apuesta real en el Corralito, `INFL<70` |',
  '| Apertura total | `EXTE>=35 and INVC>=35` (+4) | nunca se resolvió; divisas 0-11 y crédito 0 tras abrir | sin dato | `EXTE>=25 and INVC>=20` |',
  '| Congelamiento total (Hiper) | `RESULT3>=-100 and EXTE>=25` (+2) | divisas 2-12, resultado −300 a −700 | 0 / 60 | `EXTE>=12 and RESULT3>=-300`; al explotar, precios +20 → +12 |',
  '| Vender las reservas (Hiper) | `DESANCLAJE<15 and RESULT3>=-100` (+2) | con 16 de divisas la medida deja 4 y dispara R07 | 0 / 20 | `DESANCLAJE<25 and RESULT3>=-300`; costo EXTE −12 → −8 |',
  '| Nueva moneda (Hiper) | requiere `EXTE>=20`; apuesta `RESULT3>=0 and EXTE>=30` (+3) | nunca estuvo disponible: las divisas arrancan en 16 y bajan 2 por mes (0 usos en 200 partidas) | sin dato | requisito `EXTE>=12`; apuesta `RESULT3>=-150 and EXTE>=20` |',
  '| Shock fiscal, acuerdo de transición, privatizar todo (Hiper) | `INFL<70` (+3), `INFL<80` (+4), `INVC>=35 and INST>=40` (+4) | nunca llegaron a resolverse (todas las partidas terminan en T2-T4); con precios 88-100 y crédito 0-12 explotarían | sin dato | shock `INFL<80`; privatizar `INVC>=20 and INST>=35` |',
  '| Estado de sitio (Hiper, ortodoxo) | ídem Corralito | sin asistencia alimentaria explota siempre | 0 / 20 | es el diseño |',
  '',
  'Divisas en la Hiper: arrancan en 16 y la emergencia drena 2 por mes; con divisas bajo 10 la regla R07 suma +2,5 a +3,5 de precios por trimestre y la emisión forzada otros +8 a +14 (heterodoxo semilla 1: precios 69 → 100 en T3, "+31 por la falta de dólares"). Propuesta: `EXTE` 16 → 22 y drenaje mensual −2 → −1.',
  '',
  '### 5. Mecánicas que ningún bot pudo usar',
  '',
  '- `ley_emergencia` y `reforma_constitucion` son leyes sin DNU y el oficialismo arranca sin mayoría (bancas 36-41 contra el umbral de 50): 0 usos en 200 partidas, aunque el ortodoxo la tiene tercera en su prioridad. Propuesta: que `ley_emergencia` se habilite durante la emergencia con `REL(oposicion)>=45` o con `FLAG(transicion)`, o que admita DNU con un costo institucional extra.',
  '- `nueva_moneda` (punto 4): 0 usos. `reprogramar_depositos`: 0 usos (los bots no la priorizan después de limitar los retiros; sin dato sobre su apuesta).',
  '- `negociar_deuda`: 7 intentos en el Corralito (3 éxitos) y 20 en la Hiper (deuda final promedio 3.513: unos 17 éxitos, porque el adaptable llega con solvencia 20-30 después de retenciones y tarifas).',
  '',
  '### 6. Observaciones del motor (no son datos; para el dueño del motor)',
  '',
  '- Índice de precios en el techo: `bump` recorta INFL a 100 y la aceleración se calcula después del recorte, así que con los precios clavados en 100 la aceleración es 0 y la derrota propia de la emergencia ("95 o más y acelerando dos meses") no se dispara. Ortodoxo Hiper, semilla 1: el shock fiscal deja los precios en 100, 100 y 97 en los tres meses, "los precios se mantienen", sin derrota. Sugerencia: medir la aceleración antes del recorte o tratar INFL ≥ 99 como acelerando.',
  '- Economía dolarizada: las reglas estructurales no la contemplan. R01 empuja los precios hacia un ancla `35 + 0,3·(50 − SOLV) + 0,3·(50 − EXTE) + desanclaje` (≈ 58 con solvencia 16 y divisas 5) a 20 % por trimestre, y R07 suma por falta de dólares: el ortodoxo dolarizado pasó de precios 0 a 18 en T1 y a 43 en T4, cuando la tarjeta promete precios anclados. Además `politica_monetaria_contractiva` sigue disponible sin moneda propia. Sugerencia: con `dolarizada`, ancla de R01 sin el término de divisas ni desanclaje (o un valor fijo cerca de 20) y R07 solo sobre la actividad.',
  '- La derrota propia del Corralito en la emergencia (gobernabilidad bajo 15 dos semanas seguidas) no ocurrió en 100 partidas: la gobernabilidad mínima en las tres semanas fue 24-37; baja de 15 recién entre T4 y T8. La inacción pierde, pero por juicio político en la gestión, no por renuncia en diciembre.',
  '- Las interacciones con actores no están bloqueadas por el motor durante la emergencia (`paForTurn` da 4 PA y `meet` acepta): la interfaz no las ofrece y los bots no las usan. Conviene que el motor también las rechace, para que un guardado editado no las habilite.',
  '- Runner de playtest: el `fiscalGuard` frenaba cualquier política con caja proyectada bajo 150, incluso las extraordinarias de costo 0; se cambió para que no frene medidas extraordinarias (afecta también al adaptable común en los históricos).',
  '',
];

// ─────────────────────────────── Corrida ───────────────────────────────

it(`juega los escenarios históricos con los bots de crisis (${SEEDS} semillas)`, () => {
  mkdirSync(OUT, { recursive: true });
  const json: Record<string, Record<string, Cell>> = {};
  const games: Record<string, Record<string, GameRecord[]>> = {};
  const samples: string[] = [];
  const sections: string[] = [];

  for (const scenarioId of SCENARIO_IDS) {
    const scenario = getScenario(scenarioId);
    json[scenarioId] = {};
    games[scenarioId] = {};
    for (const bot of BOTS) {
      const outs = Array.from({ length: SEEDS }, (_, i) => playGame(bot, i + 1, { scenarioId }));
      const records = outs.map(o => toRecord(scenarioId, o));
      games[scenarioId][bot.id] = records;
      json[scenarioId][bot.id] = summarize(records);
      samples.push(...trajectory(scenarioId, bot, outs[0]));
    }
    sections.push(
      `## ${scenario.name} (${scenario.era})`,
      '',
      `${scenario.description}`,
      '',
      `Emergencia de tres ${roundUnit(scenarioId) === 'mes' ? 'meses' : 'semanas'}: ${scenario.crisis?.rounds.join(', ')}. Después, 16 trimestres de gestión (legislativas en T8, presidenciales en T16).`,
      '',
      '### Resultados',
      '',
      ...resultsTable(json[scenarioId]),
      '',
      '### Indicadores',
      '',
      ...indicatorsTable(json[scenarioId]),
      '',
      '### Apuestas por medida (todos los bots)',
      '',
      ...betsTable(json[scenarioId]),
      '',
    );
  }

  const md = [
    '# Escenarios históricos — playtest con bots',
    '',
    `Generado por \`npm run playtest:historicos\` (playtest/historicos.playtest.ts). ${SEEDS} partidas por celda (semillas 1 a ${SEEDS}), calendario de 16 trimestres por mandato.`,
    '',
    '**Qué mide y qué no.** Son hipótesis de diseño medidas con bots que juegan con las mismas funciones que la interfaz: sirven para ver si las reglas producen lo que buscan (la inacción pierde, una estrategia coherente puede superar la emergencia y competir, las apuestas no son imposibles ni gratis). No es una prueba de diversión ni de legibilidad: eso solo lo dice una persona jugando.',
    '',
    '**Cómo leer las tablas.** _Supera la emergencia_: terminó las tres subrondas sin renunciar ni caer en hiperinflación. _Reelecto_: ganó la presidencial de T16 (el juego sigue al segundo mandato). _Gana la carrera_: además el espacio retuvo el gobierno en la sucesión de T32. _Apuestas_: cada medida extraordinaria con apuesta se resuelve 2 a 4 trimestres después como "salió bien" o "explotó". Los promedios de gobernabilidad mínima, precios máximos, intención de voto y cuentas son sobre las partidas de la celda.',
    '',
    '## Bots',
    '',
    ...BOTS.map(b => `- **${b.id} · ${b.name}**: ${b.description}`),
    '',
    'Durante la emergencia ningún bot interactúa con actores (el bloque de emergencia no lo ofrece). Las decisiones de eventos se toman con la opción de mejor balance de efectos (salvo la inacción, que elige la primera).',
    '',
    ...sections,
    '## Diagnóstico contra las metas de calibración',
    '',
    ...diagnosis(json),
    '',
    ...CALIBRATION_NOTES,
    '## Trayectorias de muestra (semilla 1)',
    '',
    'Una partida por escenario y bot, subronda por subronda y turno por turno: la medida o las acciones, qué pasó según el motor y los indicadores al cierre (precios como inflación mensual aproximada, actividad y bolsillo en bandas, gobernabilidad en palabras).',
    '',
    ...samples,
  ].join('\n');

  writeFileSync(path.join(OUT, 'HISTORICOS.md'), md, 'utf-8');
  writeFileSync(path.join(OUT, 'historicos.json'), JSON.stringify({ generatedAt: new Date().toISOString(), seeds: SEEDS, maxEntries: MAX_ENTRIES, summary: json, games }, null, 2), 'utf-8');
  console.log(md.split('\n## Trayectorias')[0]);
}, 1_800_000);
