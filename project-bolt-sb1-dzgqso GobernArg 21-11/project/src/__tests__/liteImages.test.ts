/**
 * Tabla de imágenes de la Lite (src/lite/imageMap.ts): cada id existe en el
 * juego y cada archivo nombrado está en src/assets/images/a-lite/.
 */
import { describe, expect, it } from 'vitest';
import { ACTOR_IDS, CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { ACTION_IMAGE, ACTION_PHOTO } from '../lite/imageMap';
import { ACTION_TEXT_OVERRIDES } from '../lite/actionOverrides';
import { actionImage, actorPortrait, screenImage } from '../lib/liteImages';

describe('imágenes de la Lite', () => {
  it('los 17 actores tienen retrato', () => {
    expect(ACTOR_IDS.length).toBe(17);
    for (const id of ACTOR_IDS) expect(actorPortrait(id), id).toBeTruthy();
  });

  it('cada política con ilustración existe y tiene su archivo', () => {
    for (const id of Object.keys(ACTION_IMAGE)) {
      expect(CAUSAL_ACTIONS_BY_ID[id], id).toBeDefined();
      expect(actionImage(id), id).toBeTruthy();
    }
    expect(actionImage('dnu')).toBeUndefined();
  });

  it('las fotos reales tienen archivo y ganan sobre la ilustración', () => {
    for (const [id, name] of Object.entries(ACTION_PHOTO)) {
      expect(CAUSAL_ACTIONS_BY_ID[id], id).toBeDefined();
      expect(actionImage(id), id).toContain(name);
    }
  });

  it('los textos de la Lite cambian solo nombre y descripción', () => {
    for (const [id, text] of Object.entries(ACTION_TEXT_OVERRIDES)) {
      const action = CAUSAL_ACTIONS_BY_ID[id];
      expect(action, id).toBeDefined();
      if (text.name) expect(action.name).toBe(text.name);
      if (text.description) expect(action.description).toBe(text.description);
    }
    expect(CAUSAL_ACTIONS_BY_ID.reduccion_gasto.name).toBe('Reforma previsional');
  });

  it('portada y banda de cierre', () => {
    expect(screenImage('bienvenida')).toBeTruthy();
    expect(screenImage('cierreTurno')).toBeTruthy();
  });
});
