"""
Genera los datos del motor causal (src/data/causal/generated/*.ts) a partir del
Excel de diseño `GobernArg_Motor_Causal_v1.xlsx`.

El Excel es la fuente de verdad del motor (indicadores, actores, matriz de
sensibilidades, acciones, efectos, reuniones, parámetros). Este script sólo
transcribe: no inventa valores. Las partes del Excel que son texto libre o
fórmulas (reglas estructurales 01B, canales 07, prerequisitos de 04/06) se
implementan a mano en src/engine/causal/ y src/data/causal/, citando sus ids.

Uso (desde la carpeta project/):
    python scripts/excel_to_causal.py [ruta_al_excel]
Por defecto lee ../../_analisis_gobernarg/GobernArg_Motor_Causal_v1.xlsx
"""
import json
import os
import re
import sys

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
DEFAULT_XLSX = os.path.join(PROJECT, '..', '..', '_analisis_gobernarg', 'GobernArg_Motor_Causal_v1.xlsx')
OUT_DIR = os.path.join(PROJECT, 'src', 'data', 'causal', 'generated')

HEADER = (
    '// ARCHIVO GENERADO por scripts/excel_to_causal.py desde GobernArg_Motor_Causal_v1.xlsx.\n'
    '// No editar a mano: modificar el Excel y regenerar.\n'
    '/* eslint-disable */\n'
)


def clean(v):
    if v is None:
        return None
    if isinstance(v, str):
        s = v.strip()
        if s in ('', '—', '-', 'N/A'):
            return None
        return s
    return v


def num(v):
    v = clean(v)
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v) if isinstance(v, float) and not v.is_integer() else int(v)
    s = str(v).replace('−', '-').replace(',', '.').strip()
    m = re.match(r'^-?\d+(\.\d+)?', s)
    if not m:
        return None
    f = float(m.group(0))
    return int(f) if f.is_integer() else f


def rows(ws, header_row_contains):
    """Devuelve (header, filas) empezando en la fila cuyo primer valor coincide."""
    it = list(ws.iter_rows(values_only=True))
    for i, r in enumerate(it):
        if r and r[0] == header_row_contains:
            header = [c for c in r]
            data = []
            for rr in it[i + 1:]:
                if rr is None or all(c is None for c in rr):
                    break
                data.append(rr)
            return header, data
    raise ValueError(f'No se encontró el encabezado {header_row_contains!r} en {ws.title}')


def ts_const(name, typ, value):
    return f'export const {name}: {typ} = {json.dumps(value, ensure_ascii=False, indent=2)};\n'


def gen_indicators(wb):
    ws = wb['01_INDICADORES']
    _, data = rows(ws, 'indicatorId')
    out = []
    for r in data:
        out.append({
            'id': r[0],
            'name': clean(r[1]),
            'macro': clean(r[2]),
            'definition': clean(r[3]),
            'high': clean(r[4]),
            'low': clean(r[5]),
            'scale': clean(r[6]),
            'initial': num(r[7]),
            'visibility': clean(r[8]),
            'importance': clean(r[9]),
            'kind': clean(r[10]),
            'movedBy': clean(r[11]),
            'interactions': clean(r[12]),
            'notes': clean(r[13]),
        })
    return out


def gen_actors(wb):
    ws = wb['02_ACTORES']
    _, data = rows(ws, 'actorId')
    out = []
    for r in data:
        diff = num(r[8])
        rel = num(r[10])
        out.append({
            'id': r[0],
            'name': clean(r[1]),
            'family': clean(r[2]),
            'description': clean(r[3]),
            'influence': num(r[4]),
            'electoralWeight': num(r[5]),
            'electoralMode': clean(r[6]),
            'interactionDifficulty': diff,
            'satInitialExcel': num(r[9]),
            'relInitial': rel,
            'channelMain': clean(r[11]),
            'channelSecondary': clean(r[12]),
            'highConsequence': clean(r[13]),
            'lowConsequence': clean(r[14]),
            'balanceNotes': clean(r[15]),
        })
    return out


def gen_matrix(wb):
    ws = wb['03_MATRIZ']
    _, data = rows(ws, 'actorId')
    out = []
    for r in data:
        out.append({
            'actor': r[0],
            'target': r[1],
            's': num(r[2]),
            'priority': clean(r[3]),
            'explanation': clean(r[4]),
        })
    return out


def gen_actions(wb):
    ws = wb['04_ACCIONES']
    _, data = rows(ws, 'actionId')
    out = []
    for r in data:
        pa_raw = clean(r[6])
        out.append({
            'id': r[0],
            'name': clean(r[1]),
            'description': clean(r[2]),
            'uiCategory': clean(r[3]),
            'status': clean(r[4]),
            'origin': clean(r[5]),
            'paCost': num(pa_raw) if pa_raw is not None else 0,
            'paCostText': str(pa_raw) if pa_raw is not None else '0',
            'caja': num(r[7]) or 0,
            'cooldownText': str(clean(r[8])) if clean(r[8]) is not None else None,
            'cooldown': num(r[8]) if num(r[8]) is not None else 0,
            'leyText': clean(r[9]),
            'tags': [t.strip() for t in str(clean(r[10])).split(',')] if clean(r[10]) else [],
            'strategic': clean(r[11]),
            'prerequisitesText': clean(r[12]),
            'unlocksText': clean(r[13]),
            'risksText': clean(r[14]),
            'directRelationText': clean(r[15]),
            'notes': clean(r[16]),
        })
    return out


def parse_duration(v):
    v = clean(v)
    if v is None:
        return 1
    if isinstance(v, (int, float)):
        return int(v)
    s = str(v).strip().upper()
    if s == 'PERM':
        return 'PERM'
    if s == 'PLAZO':
        return 'plazo'
    n = num(s)
    return n if n is not None else 1


def parse_cap(v):
    v = clean(v)
    if v is None:
        return None
    s = str(v).replace('−', '-')
    m = re.search(r'piso\s*(-?\d+(\.\d+)?)', s)
    if m:
        return {'floor': float(m.group(1))}
    m = re.search(r'acumulado\s*m[aá]x\s*(-?\d+(\.\d+)?)', s)
    if m:
        return {'cumulative': abs(float(m.group(1)))}
    return {'text': s}


def gen_effects(wb):
    ws = wb['05_EFECTOS']
    _, data = rows(ws, 'effectId')
    out = []
    for r in data:
        out.append({
            'id': r[0],
            'actionId': r[1],
            'target': r[2],
            'targetType': clean(r[3]),
            'mode': clean(r[4]),
            'magnitude': num(r[5]),
            'timing': clean(r[6]),
            'offset': num(r[7]) or 0,
            'duration': parse_duration(r[8]),
            'kind': clean(r[9]),
            'condition': clean(r[10]),
            'evalAt': clean(r[11]),
            'repetition': clean(r[12]),
            'window': num(r[13]),
            'cap': parse_cap(r[14]),
            'explanation': clean(r[15]),
        })
    return out


ACTION_ID_RE = re.compile(r'[a-z][a-z_]+[a-z]')


def gen_meetings(wb, action_ids):
    ws = wb['08_REUNIONES']
    _, data = rows(ws, 'actorId')
    out = []
    for r in data:
        demands_text = clean(r[3])
        demand_ids = []
        vetoes = []
        if demands_text:
            for part in demands_text.split('·'):
                part = part.strip()
                is_veto = 'veto' in part
                for m in ACTION_ID_RE.findall(part):
                    if m in action_ids:
                        (vetoes if is_veto else demand_ids).append(m)
        out.append({
            'actor': r[0],
            'reveals': clean(r[1]),
            'discusses': [t.strip() for t in str(clean(r[2])).replace('·', ',').split(',')] if clean(r[2]) else [],
            'demandsText': demands_text,
            'demandActionIds': demand_ids,
            'vetoActionIds': vetoes,
            'unlocks': clean(r[4]),
            'shouldNot': clean(r[5]),
            'exampleText': clean(r[6]).strip('“”"') if clean(r[6]) else None,
        })
    return out


def gen_params(wb):
    ws = wb['00B_MOTOR']
    _, data = rows(ws, 'Parámetro')
    out = {}
    notes = {}
    for r in data:
        key = clean(r[0])
        if key is None or key == 'Control':
            continue
        out[key] = num(r[1])
        notes[key] = {'what': clean(r[2]), 'status': clean(r[3])}
    return out, notes


def gen_audit(wb):
    ws = wb['09_AUDITORIA']
    _, data = rows(ws, 'idActual')
    out = []
    for r in data:
        if r[0] is None or not isinstance(r[0], str) or r[0].isupper():
            continue
        new_ids = []
        if clean(r[4]):
            new_ids = [m for m in ACTION_ID_RE.findall(str(r[4]))]
        out.append({
            'oldId': r[0],
            'oldName': clean(r[1]),
            'oldCategory': clean(r[2]),
            'decision': clean(r[3]),
            'newIds': new_ids,
            'justification': clean(r[5]),
        })
    return out


def write(name, content):
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(HEADER + '\n' + content)
    print('escrito', os.path.relpath(path, PROJECT))


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    indicators = gen_indicators(wb)
    actors = gen_actors(wb)
    matrix = gen_matrix(wb)
    actions = gen_actions(wb)
    effects = gen_effects(wb)
    action_ids = {a['id'] for a in actions}
    meetings = gen_meetings(wb, action_ids)
    params, param_notes = gen_params(wb)
    audit = gen_audit(wb)

    unknown = sorted({e['actionId'] for e in effects} - action_ids)
    if unknown:
        raise SystemExit(f'Efectos con actionId desconocido: {unknown}')

    write('indicators.ts', "import type { IndicatorRow } from '../types';\n\n" + ts_const('INDICATOR_ROWS', 'IndicatorRow[]', indicators))
    write('actors.ts', "import type { ActorRow } from '../types';\n\n" + ts_const('ACTOR_ROWS', 'ActorRow[]', actors))
    write('matrix.ts', "import type { SensitivityRow } from '../types';\n\n" + ts_const('SENSITIVITY_ROWS', 'SensitivityRow[]', matrix))
    write('actions.ts', "import type { ActionRow } from '../types';\n\n" + ts_const('ACTION_ROWS', 'ActionRow[]', actions))
    write('effects.ts', "import type { EffectRow } from '../types';\n\n" + ts_const('EFFECT_ROWS', 'EffectRow[]', effects))
    write('meetings.ts', "import type { MeetingRow } from '../types';\n\n" + ts_const('MEETING_ROWS', 'MeetingRow[]', meetings))
    write('params.ts', ts_const('EXCEL_PARAMS', 'Record<string, number>', params)
          + '\n' + ts_const('EXCEL_PARAM_NOTES', 'Record<string, { what: string | null; status: string | null }>', param_notes))
    write('audit.ts', "import type { AuditRow } from '../types';\n\n" + ts_const('AUDIT_ROWS', 'AuditRow[]', audit))
    print(f'{len(indicators)} indicadores, {len(actors)} actores, {len(matrix)} sensibilidades, '
          f'{len(actions)} acciones, {len(effects)} efectos, {len(meetings)} reuniones, {len(audit)} filas de auditoría')


if __name__ == '__main__':
    main()
