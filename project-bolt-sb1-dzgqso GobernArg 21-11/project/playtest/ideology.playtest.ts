import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_BOTS } from '../src/playtest/bots';
import { playGame, type GameOutcome } from '../src/playtest/runner';
import { SCENARIOS } from '../src/data/causal';

/**
 * Asimetría ideológica (Fase 3): los programas heterodoxo y ortodoxo, jugados
 * "coherentes" (G1b/G2b) y "bien jugados" (G1c/G2c), en los escenarios del juego.
 * Meta del documento de asimetría: menos de 15 puntos de diferencia en
 * reelecciones ganadas entre los dos programas bien jugados.
 * Salida: $PLAYTEST_OUT/IDEOLOGIA.md (por defecto, _analisis_gobernarg/playtest).
 */
const SEEDS = Number(process.env.SEEDS ?? 30);
const OUT = process.env.PLAYTEST_OUT ?? path.resolve(__dirname, '..', '..', '..', '_analisis_gobernarg', 'playtest');
const BOT_IDS = ['G1b', 'G1c', 'G2b', 'G2c', 'H'];

const pct = (n: number, d: number) => Math.round((100 * n) / d);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

interface Cell { reelected: number; votes: number; early: number; pacto: number; reasons: Record<string, number> }

function summarize(outs: GameOutcome[]): Cell {
  const n = outs.length;
  const votes = outs.filter(o => o.reelectionVotes !== null).map(o => o.reelectionVotes!);
  const reasons: Record<string, number> = {};
  for (const o of outs) if (o.defeatReason) reasons[o.defeatReason] = (reasons[o.defeatReason] ?? 0) + 1;
  return {
    reelected: pct(outs.filter(o => (o.reelectionVotes ?? 0) >= 45).length, n),
    votes: Math.round(avg(votes) * 10) / 10,
    early: outs.filter(o => o.defeatReason && o.defeatReason !== 'election_loss').length,
    pacto: pct(outs.filter(o => o.log.some(t => t.actions.some(a => a.startsWith('Pacto social')))).length, n),
    reasons,
  };
}

it(`mide la asimetría ideológica (${SEEDS} semillas)`, () => {
  mkdirSync(OUT, { recursive: true });
  const bots = ALL_BOTS.filter(b => BOT_IDS.includes(b.id));
  const lines: string[] = [];
  const json: Record<string, Record<string, Cell>> = {};
  lines.push(`| Escenario | ${bots.map(b => `${b.id} · ${b.name}`).join(' | ')} | Brecha G2c − G1c |`);
  lines.push(`|---|${bots.map(() => '---').join('|')}|---|`);
  for (const sc of SCENARIOS) {
    json[sc.id] = {};
    for (const bot of bots) {
      json[sc.id][bot.id] = summarize(Array.from({ length: SEEDS }, (_, i) => playGame(bot, i + 1, { scenarioId: sc.id })));
    }
    const cells = bots.map(b => {
      const c = json[sc.id][b.id];
      return `${c.reelected}% · ${c.votes || '—'}${c.early ? ` · ${c.early} caídas` : ''}${b.id.startsWith('G1') ? ` · pacto ${c.pacto}%` : ''}`;
    });
    const gap = json[sc.id].G2c.reelected - json[sc.id].G1c.reelected;
    lines.push(`| ${sc.name} (${sc.difficulty}) | ${cells.join(' | ')} | ${gap > 0 ? '+' : ''}${gap} |`);
  }
  const md = [
    '# Asimetría ideológica — datos',
    '',
    `${SEEDS} partidas por celda. Celda: **reelecto · votos promedio en la reelección · caídas antes de tiempo · (heterodoxos) partidas que firmaron el pacto social**.`,
    '',
    ...lines,
    '',
    '## Motivos de derrota',
    '',
    ...SCENARIOS.map(sc => `- **${sc.name}:** ${bots.map(b => `${b.id} ${JSON.stringify(json[sc.id][b.id].reasons)}`).join(' · ')}`),
    '',
  ].join('\n');
  writeFileSync(path.join(OUT, 'IDEOLOGIA.md'), md, 'utf-8');
  writeFileSync(path.join(OUT, 'ideologia.json'), JSON.stringify(json, null, 2), 'utf-8');
  console.log(md);
}, 1_800_000);
