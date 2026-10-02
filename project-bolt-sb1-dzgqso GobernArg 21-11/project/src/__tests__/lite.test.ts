import { describe, expect, it } from 'vitest';
import { applyCommand } from '../causal/engine';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import { AVATARS, avatarSrc, isValidAvatar } from '../lib/avatars';
import { centerSquare, photoFileError } from '../lib/photo';
import type { GameCommand } from '../causal/types';

const PHOTO = `data:image/jpeg;base64,${'/9j/4AAQSkZJRgABAQ'.repeat(40)}`;

describe('Foto del presidente (Lite)', () => {
  it('acepta solo imágenes de hasta 10 MB', () => {
    expect(photoFileError({ type: 'image/png', size: 2_000_000 })).toBeNull();
    expect(photoFileError({ type: 'text/plain', size: 10 })).toMatch(/imagen/);
    expect(photoFileError({ type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 })).toMatch(/10 MB/);
  });

  it('recorta al centro en un cuadrado del lado menor', () => {
    expect(centerSquare(1200, 800)).toEqual({ sx: 200, sy: 0, side: 800 });
    expect(centerSquare(600, 900)).toEqual({ sx: 0, sy: 150, side: 600 });
  });

  it('las fotos de la grilla se guardan por id y la subida como dataURL', () => {
    expect(AVATARS).toHaveLength(15);
    expect(avatarSrc('avatar:3')).toBe(AVATARS[2].src);
    expect(avatarSrc(PHOTO)).toBe(PHOTO);
    expect(avatarSrc('')).toBeNull();
    expect(isValidAvatar('avatar:15')).toBe(true);
    expect(isValidAvatar('avatar:99')).toBe(false);
    expect(isValidAvatar('https://ejemplo.com/foto.jpg')).toBe(false);
    expect(isValidAvatar('data:image/jpeg;base64,<script>')).toBe(false);
    expect(isValidAvatar(`data:image/jpeg;base64,${'A'.repeat(500_000)}`)).toBe(false);
  });

  it('la foto subida sobrevive al guardado y la carga', () => {
    let session = newSession({ name: 'Con foto', profile: 'comunicador', avatar: PHOTO, difficulty: 'easy', scenarioId: 'pais_en_calma' });
    const cmd: GameCommand = { id: 'lite-photo-1', expectedTurn: 1, type: 'close_turn' };
    session = { ...session, state: applyCommand(session.state, cmd).state, commands: [cmd] };
    const loaded = deserializeSession(serializeSession(session));
    expect(loaded.player.avatar).toBe(PHOTO);
    expect(loaded.state.avatar).toBe(PHOTO);
    expect(loaded.state).toEqual(session.state);
  });

  it('rechaza un guardado con una foto inválida', () => {
    const text = serializeSession(newSession({ name: 'X', profile: 'politico', avatar: 'avatar:1' }));
    const broken = JSON.parse(text); broken.player.avatar = 'javascript:alert(1)';
    expect(() => deserializeSession(JSON.stringify(broken))).toThrow('La foto guardada no es válida.');
  });
});
