// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NewGameScreen } from '../components/NewGameScreen';

const conversion = vi.hoisted(() => ({ convert: vi.fn() }));
vi.mock('../lib/avatarPhoto', async importOriginal => ({
  ...await importOriginal<typeof import('../lib/avatarPhoto')>(),
  photoToDataUrl: conversion.convert,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Foto propia al iniciar Light', () => {
  it('espera la conversión, evita cambios simultáneos y empieza con la foto elegida', async () => {
    let finish!: (value: string) => void;
    conversion.convert.mockImplementation(() => new Promise<string>(resolve => { finish = resolve; }));
    const onStart = vi.fn();
    render(<NewGameScreen onStart={onStart} />);
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Ana' } });
    const start = screen.getByRole('button', { name: /^Empezar$/ }) as HTMLButtonElement;
    const file = screen.getByLabelText('Subir mi foto') as HTMLInputElement;
    expect(start.disabled).toBe(false);
    fireEvent.change(file, { target: { files: [new File(['foto'], 'foto.png', { type: 'image/png' })] } });
    expect(start.disabled).toBe(true);
    expect(file.disabled).toBe(true);
    expect((screen.getByRole('radio', { name: 'Avatar 3' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(start);
    expect(onStart).not.toHaveBeenCalled();
    const avatar = 'data:image/jpeg;base64,foto-propia';
    await act(async () => { finish(avatar); });
    expect(start.disabled).toBe(false);
    expect(file.disabled).toBe(false);
    expect(screen.getByRole('radio', { name: 'Tu foto' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(start);
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ avatar, scenarioId: 'viento_de_cola', archetype: 'politico' }));
  });
});
