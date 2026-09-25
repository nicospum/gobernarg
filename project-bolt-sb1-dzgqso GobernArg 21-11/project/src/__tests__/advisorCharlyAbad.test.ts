import { describe, it, expect } from 'vitest';
import { ACTOR_IDS, CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { availableAdvisors, ADVISOR_ROLES } from '../data/advisors';
import { computePerks } from '../engine/causalBridge';
import { cajaCost, createCausalState, paCost } from '../engine/causal';
import { getAdvisorPortrait, IMAGES } from '../utils/imageAssets';

describe('Asesor Charly Abad (broker de salud)', () => {
  it('está disponible y tiene rol en el motor', () => {
    expect(availableAdvisors.some(a => a.id === 'advisor8' && a.name === 'Charly Abad')).toBe(true);
    expect(ADVISOR_ROLES.advisor8.categories).toEqual(['Social y salud']);
  });

  it('abarata los hospitales: 1 PA y −15% de caja', () => {
    const hospital = CAUSAL_ACTIONS_BY_ID.construccion_hospitales;
    const sin = createCausalState({ perks: computePerks('politico', []) });
    const con = createCausalState({ perks: computePerks('politico', ['advisor8']) });
    expect(paCost(sin, hospital)).toBe(2);
    expect(paCost(con, hospital)).toBe(1);
    expect(Math.abs(cajaCost(con, hospital))).toBeLessThan(Math.abs(cajaCost(sin, hospital)));
  });

  it('mejora la negociación con todos, y más con empresarios y organizaciones sociales', () => {
    const perks = computePerks('politico', ['advisor8']);
    for (const a of ACTOR_IDS) expect(perks.negotiationBonus[a] ?? 0).toBeGreaterThanOrEqual(0.05);
    expect(perks.negotiationBonus.industria).toBe(0.15);
    expect(perks.negotiationBonus.pymes).toBe(0.15);
    expect(perks.negotiationBonus.org_sociales).toBe(0.15);
  });

  it('usa su retrato propio', () => {
    expect(getAdvisorPortrait('Broker de Salud', 'advisor8')).toBe(IMAGES.advisors.charlyAbad);
  });
});
