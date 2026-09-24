import { it } from 'vitest';
import { ALL_BOTS } from '../src/playtest/bots';
import { playGame } from '../src/playtest/runner';

it('traza', () => {
  for (const id of (process.env.BOTS ?? 'E,H').split(',')) {
    const bot = ALL_BOTS.find(b => b.id === id)!;
    const o = playGame(bot, 1);
    console.log(`\n==== ${bot.id} ${bot.name} → ${o.victorious ? 'VICTORIA' : o.defeatReason} reelec ${o.reelectionVotes}`);
    for (const t of o.log) {
      const a = t.actors;
      console.log(`T${t.turn} PA${t.pa} [${t.actions.join(', ')}] caja ${t.caja} res ${t.resultado} fin ${t.financiamiento} gasto ${t.gastoCorr} | INFL ${t.indicatorsAfter.INFL} ACTV ${t.indicatorsAfter.ACTV} PODA ${t.indicatorsAfter.PODA} INVC ${t.indicatorsAfter.INVC} SOLV ${t.indicatorsAfter.SOLV} EXTE ${t.indicatorsAfter.EXTE} PSOC ${t.indicatorsAfter.PSOC} SEGU ${t.indicatorsAfter.SEGU} CONF ${t.indicatorsAfter.CONF} | APRO ${t.apro} IV ${t.iv} GOB ${t.gob} LEG ${t.leg} img ${t.imagen} | cm ${a.clase_media.sat} sp ${a.sectores_populares.sat} sind ${a.sindicatos.sat} pym ${a.pymes.sat}`);
      if (t.events.length) console.log('   eventos:', t.events.join(' | '));
    }
  }
});
