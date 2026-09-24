import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_BOTS } from '../src/playtest/bots';
import { playGame, type GameOutcome } from '../src/playtest/runner';
import { NO_PLATFORM_ID, SCENARIOS } from '../src/data/causal';

/**
 * Matriz de escenarios: cada escenario jugado por varias estrategias, con la
 * plataforma desactivada (el default del juego). Sirve para calibrar la
 * dificultad relativa. Salida: _analisis_gobernarg/playtest/ESCENARIOS.md
 */
const SEEDS = Number(process.env.SEEDS ?? 20);
const OUT = path.resolve(__dirname, '..', '..', '..', '_analisis_gobernarg', 'playtest');
const BOT_IDS = ['A', 'B', 'E', 'G2b', 'H'];

const pct = (n: number, d: number) => `${Math.round((100 * n) / d)}%`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const f1 = (x: number) => (Math.round(x * 10) / 10).toString();

function cell(outs: GameOutcome[]): string {
  const n = outs.length;
  const wins = outs.filter(o => o.victorious).length;
  const reelected = outs.filter(o => (o.reelectionVotes ?? 0) >= 45).length;
  const votes = outs.filter(o => o.reelectionVotes !== null).map(o => o.reelectionVotes!);
  const early = outs.filter(o => o.defeatReason && o.defeatReason !== 'election_loss').length;
  return `${pct(wins, n)} / ${pct(reelected, n)} · ${votes.length ? f1(avg(votes)) : '—'}${early ? ` · ${early} caídas` : ''}`;
}

it(`genera la matriz de escenarios (${SEEDS} semillas)`, () => {
  mkdirSync(OUT, { recursive: true });
  const bots = ALL_BOTS.filter(b => BOT_IDS.includes(b.id));
  const header = `| Escenario | ${bots.map(b => `${b.id} · ${b.name}`).join(' | ')} |\n|---|${bots.map(() => '---').join('|')}|`;
  const rows: string[] = [];
  for (const sc of SCENARIOS) {
    const cells = bots.map(bot => cell(Array.from({ length: SEEDS }, (_, i) => playGame(bot, i + 1, { scenarioId: sc.id, platformId: NO_PLATFORM_ID }))));
    rows.push(`| ${sc.name} (${sc.difficulty}) | ${cells.join(' | ')} |`);
  }
  const md = [
    '# Matriz de escenarios — datos',
    '',
    `Generado por \`npm run playtest\` (playtest/scenarios.playtest.ts). ${SEEDS} partidas por celda, plataforma desactivada (default del juego).`,
    '',
    'Cada celda: **gana la carrera / reelecto · votos promedio en la reelección · caídas antes de tiempo** (hiperinflación o juicio político).',
    '',
    header,
    ...rows,
    '',
  ].join('\n');
  writeFileSync(path.join(OUT, 'ESCENARIOS.md'), md, 'utf-8');
  console.log(md);
}, 1_200_000);
