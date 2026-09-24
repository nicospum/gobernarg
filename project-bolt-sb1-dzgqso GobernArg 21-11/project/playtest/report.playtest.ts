import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_BOTS } from '../src/playtest/bots';
import { playGame, type GameOutcome, type TurnLog } from '../src/playtest/runner';
import { ACTORS, ACTOR_IDS } from '../src/data/causal';

/**
 * Genera el informe de playtest (datos): resumen por estrategia sobre N
 * semillas y la bitácora turno por turno de una partida por estrategia.
 * Salida: _analisis_gobernarg/playtest/
 */
const SEEDS = Number(process.env.SEEDS ?? 30);
const OUT = path.resolve(__dirname, '..', '..', '..', '_analisis_gobernarg', 'playtest');

const pct = (n: number, d: number) => `${Math.round((100 * n) / d)}%`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const f1 = (x: number) => (Math.round(x * 10) / 10).toString();

function summaryRow(name: string, outs: GameOutcome[]): string {
  const n = outs.length;
  const wins = outs.filter(o => o.victorious).length;
  const reelected = outs.filter(o => (o.reelectionVotes ?? 0) >= 45).length;
  const reasons: Record<string, number> = {};
  for (const o of outs) if (!o.victorious) reasons[o.defeatReason ?? 'sin fin'] = (reasons[o.defeatReason ?? 'sin fin'] ?? 0) + 1;
  const reasonTxt = Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join(', ') || '—';
  const reelVotes = outs.filter(o => o.reelectionVotes !== null).map(o => o.reelectionVotes!);
  return `| ${name} | ${pct(wins, n)} | ${pct(reelected, n)} | ${reelVotes.length ? f1(avg(reelVotes)) : '—'} | ${f1(avg(outs.map(o => o.turnsPlayed)))} | ${reasonTxt} | ${f1(avg(outs.map(o => o.maxInfl)))} | ${f1(avg(outs.map(o => o.minGob)))} | ${Math.round(avg(outs.map(o => o.finalDeuda)))} | ${f1(avg(outs.map(o => o.meetings)))} | ${f1(avg(outs.map(o => o.agreementsSigned)))} / ${f1(avg(outs.map(o => o.agreementsBroken)))} | ${f1(avg(outs.map(o => o.channelEvents)))} |`;
}

const KEY = ['INFL', 'ACTV', 'PODA', 'INVC', 'SOLV', 'EXTE', 'PSOC', 'SEGU', 'CONF'];
const ACTOR_COLS = ['clase_media', 'sectores_populares', 'sindicatos', 'industria', 'pymes', 'financiero', 'agro', 'gobernadores', 'oficialismo', 'oposicion'] as const;

function turnBlock(t: TurnLog): string {
  const ind = KEY.map(k => `${k} ${t.indicatorsBefore[k]}→${t.indicatorsAfter[k]}`).join(' · ');
  const act = ACTOR_COLS.map(a => `${ACTORS[a].shortName} ${t.actors[a].sat}${t.actors[a].rel !== null ? `/${t.actors[a].rel}` : ''}`).join(' · ');
  const lines = [
    `**T${t.turn}** (mandato ${t.term}, año ${t.year} T${t.quarter}) — PA usados: ${t.pa}`,
    `- Acciones: ${t.actions.length ? t.actions.join(', ') : '—'}`,
  ];
  if (t.interactions.length) lines.push(`- Interacciones: ${t.interactions.join(' | ')}`);
  if (t.events.length) lines.push(`- Eventos: ${t.events.join(' | ')}`);
  lines.push(`- Indicadores: ${ind}`);
  if (t.causes.length) lines.push(`- Por qué: ${t.causes.join(' · ')}`);
  if (t.channels.length) lines.push(`- Canales de poder aplicados: ${t.channels.join(' · ')}`);
  lines.push(`- Actores (satisfacción/relación): ${act}`);
  lines.push(`- Política: aprobación ${t.apro} · intención de voto ${t.iv}% · gobernabilidad ${t.gob} · bancas ${t.leg}% · imagen ${t.imagen}`);
  lines.push(`- Cuentas: caja ${t.caja} · resultado ${t.resultado} · financiamiento ${t.financiamiento} · gasto corriente ${t.gastoCorr} · deuda ${t.deuda} · efectos pendientes ${t.pendingEffects}`);
  if (t.notes.length) lines.push(`- Notas: ${t.notes.join(' | ')}`);
  return lines.join('\n');
}

it(`genera el informe de playtest (${SEEDS} semillas)`, () => {
  mkdirSync(OUT, { recursive: true });
  const header = '| Estrategia | Gana | Reelecto | Votos reelección | Turnos jugados | Derrotas | INFL máx | GOB mín | Deuda final | Reuniones | Acuerdos firm./incumpl. | Eventos de canal |\n|---|---|---|---|---|---|---|---|---|---|---|---|';
  const rows: string[] = [];
  const details: string[] = [];
  for (const bot of ALL_BOTS) {
    const outs = Array.from({ length: SEEDS }, (_, i) => playGame(bot, i + 1));
    rows.push(summaryRow(`${bot.id} · ${bot.name}`, outs));
    const sample = outs[0];
    details.push([
      `## ${bot.id} · ${bot.name}`,
      '',
      `_${bot.description}_ Arquetipo: ${bot.archetype}.`,
      '',
      `Partida de muestra (semilla 1): **${sample.victorious ? 'VICTORIA' : `derrota (${sample.defeatReason})`}** en ${sample.turnsPlayed} turnos · reelección ${sample.reelectionVotes === null ? '—' : f1(sample.reelectionVotes) + '%'} · sucesión ${sample.successionVotes === null ? '—' : f1(sample.successionVotes) + '%'}.`,
      '',
      sample.log.map(turnBlock).join('\n\n'),
      '',
    ].join('\n'));
    writeFileSync(path.join(OUT, `partida_${bot.id}.json`), JSON.stringify(sample, null, 1));
  }
  const doc = [
    '# Playtest automatizado — datos',
    '',
    `Generado por \`npm run playtest\` (playtest/report.playtest.ts). ${SEEDS} partidas por estrategia (semillas 1..${SEEDS}), mismas funciones que la UI.`,
    'Victoria = ganar la reelección en T16 y que el espacio retenga el gobierno en la sucesión de T32 (IV ≥ 45).',
    '',
    header,
    ...rows,
    '',
    `Actores en las bitácoras: ${ACTOR_COLS.map(a => ACTORS[a].shortName).join(', ')} (${ACTOR_IDS.length} en total en el motor).`,
    '',
    '# Bitácoras turno por turno (semilla 1)',
    '',
    ...details,
  ].join('\n');
  writeFileSync(path.join(OUT, 'PLAYTEST_DATOS.md'), doc);
  console.log(`${header}\n${rows.join('\n')}`);
});
