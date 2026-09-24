/**
 * Intérprete del DSL de condiciones del Excel (pestaña 00B_MOTOR):
 *   indicadores (INFL, ACTV, …) · recursos (CAJA, DEUDA, LEG, GOB, RESULT3, TURN, APRO)
 *   funciones COUNT(accion, N) · DONE(accion[, N]) · FLAG(x) · SAT(actor) · REL(actor)
 *   operadores and, or, not, >=, <=, <, >, ==, != (también ≥ ≤)
 *
 * Parser recursivo propio: nunca se usa eval. Las expresiones se cachean
 * parseadas porque las mismas condiciones se evalúan cada turno.
 */

export interface DslContext {
  /** Valor de un identificador suelto (indicador o recurso). */
  value(id: string): number;
  /** Ejecuciones de `action` en los últimos `window` turnos, incluido el actual. */
  count(action: string, window: number): number;
  flag(name: string): number;
  sat(actor: string): number;
  rel(actor: string): number;
}

type Node =
  | { t: 'num'; v: number }
  | { t: 'id'; name: string }
  | { t: 'call'; fn: string; args: string[] }
  | { t: 'not'; e: Node }
  | { t: 'and' | 'or'; a: Node; b: Node }
  | { t: 'cmp'; op: string; a: Node; b: Node };

interface Token {
  k: 'num' | 'id' | 'op' | 'lp' | 'rp' | 'comma';
  v: string;
}

function tokenize(src: string): Token[] {
  const s = src.replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/−/g, '-');
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(') { out.push({ k: 'lp', v: c }); i++; continue; }
    if (c === ')') { out.push({ k: 'rp', v: c }); i++; continue; }
    if (c === ',') { out.push({ k: 'comma', v: c }); i++; continue; }
    const two = s.slice(i, i + 2);
    if (['>=', '<=', '==', '!='].includes(two)) { out.push({ k: 'op', v: two }); i += 2; continue; }
    if (c === '>' || c === '<') { out.push({ k: 'op', v: c }); i++; continue; }
    const num = /^-?\d+(\.\d+)?/.exec(s.slice(i));
    if (num && (c !== '-' || out.length === 0 || out[out.length - 1].k === 'op' || out[out.length - 1].k === 'lp' || out[out.length - 1].k === 'comma')) {
      out.push({ k: 'num', v: num[0] });
      i += num[0].length;
      continue;
    }
    const id = /^[A-Za-z_][A-Za-z0-9_:[\]]*/.exec(s.slice(i));
    if (id) {
      out.push({ k: 'id', v: id[0] });
      i += id[0].length;
      continue;
    }
    throw new Error(`DSL: carácter inesperado '${c}' en "${src}"`);
  }
  return out;
}

class Parser {
  private pos = 0;
  constructor(private toks: Token[], private src: string) {}

  parse(): Node {
    const n = this.or();
    if (this.pos < this.toks.length) throw new Error(`DSL: sobra "${this.toks[this.pos].v}" en "${this.src}"`);
    return n;
  }

  private peek(): Token | undefined { return this.toks[this.pos]; }
  private isWord(w: string): boolean {
    const t = this.peek();
    return !!t && t.k === 'id' && t.v.toLowerCase() === w;
  }

  private or(): Node {
    let a = this.and();
    while (this.isWord('or')) { this.pos++; a = { t: 'or', a, b: this.and() }; }
    return a;
  }

  private and(): Node {
    let a = this.not();
    while (this.isWord('and')) { this.pos++; a = { t: 'and', a, b: this.not() }; }
    return a;
  }

  private not(): Node {
    if (this.isWord('not')) { this.pos++; return { t: 'not', e: this.not() }; }
    return this.cmp();
  }

  private cmp(): Node {
    const a = this.primary();
    const t = this.peek();
    if (t && t.k === 'op') {
      this.pos++;
      return { t: 'cmp', op: t.v, a, b: this.primary() };
    }
    return a;
  }

  private primary(): Node {
    const t = this.toks[this.pos++];
    if (!t) throw new Error(`DSL: expresión incompleta "${this.src}"`);
    if (t.k === 'num') return { t: 'num', v: parseFloat(t.v) };
    if (t.k === 'lp') {
      const e = this.or();
      if (this.toks[this.pos++]?.k !== 'rp') throw new Error(`DSL: falta ')' en "${this.src}"`);
      return e;
    }
    if (t.k === 'id') {
      if (this.peek()?.k === 'lp') {
        this.pos++;
        const args: string[] = [];
        while (this.peek() && this.peek()!.k !== 'rp') {
          const a = this.toks[this.pos++];
          if (a.k === 'comma') continue;
          args.push(a.v);
        }
        this.pos++; // ')'
        return { t: 'call', fn: t.v.toUpperCase(), args };
      }
      return { t: 'id', name: t.v };
    }
    throw new Error(`DSL: token inesperado "${t.v}" en "${this.src}"`);
  }
}

const cache = new Map<string, Node>();

export function parseCondition(src: string): Node {
  let n = cache.get(src);
  if (!n) {
    n = new Parser(tokenize(src), src).parse();
    cache.set(src, n);
  }
  return n;
}

function num(n: Node, ctx: DslContext): number {
  switch (n.t) {
    case 'num': return n.v;
    case 'id': return ctx.value(n.name);
    case 'call': {
      const [a, b] = n.args;
      switch (n.fn) {
        case 'COUNT': return ctx.count(a, b ? parseFloat(b) : 99);
        case 'DONE': return ctx.count(a, b ? parseFloat(b) : 99) >= 1 ? 1 : 0;
        case 'FLAG': return ctx.flag(a);
        case 'SAT': return ctx.sat(a);
        case 'REL': return ctx.rel(a);
        default: throw new Error(`DSL: función desconocida ${n.fn}`);
      }
    }
    default: return truthy(n, ctx) ? 1 : 0;
  }
}

function truthy(n: Node, ctx: DslContext): boolean {
  switch (n.t) {
    case 'not': return !truthy(n.e, ctx);
    case 'and': return truthy(n.a, ctx) && truthy(n.b, ctx);
    case 'or': return truthy(n.a, ctx) || truthy(n.b, ctx);
    case 'cmp': {
      const a = num(n.a, ctx);
      const b = num(n.b, ctx);
      switch (n.op) {
        case '>=': return a >= b;
        case '<=': return a <= b;
        case '>': return a > b;
        case '<': return a < b;
        case '==': return a === b;
        case '!=': return a !== b;
      }
      return false;
    }
    default: return num(n, ctx) !== 0;
  }
}

/** Evalúa una condición. `null`/vacía = siempre verdadera. `[actor]` se reemplaza por `actor`. */
export function evalCondition(src: string | null | undefined, ctx: DslContext, actor?: string): boolean {
  if (!src) return true;
  const expr = actor ? src.replace(/\[actor\]/g, actor) : src;
  return truthy(parseCondition(expr), ctx);
}
