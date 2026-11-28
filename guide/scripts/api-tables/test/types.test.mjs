// The type printer and the canonical comparison (types.mjs), on declarations
// written for the test: the rules of the written form one by one, including the
// Angular signal inputs and outputs that 0.3.0 does not use, and what the
// comparison ignores.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { angularMemberType } from '../declarations-angular.mjs';
import { canonicalDefault, canonicalType, printMemberType, quote, typescript } from '../types.mjs';

const DECLARATIONS = `
export type Size = 'sm' | 'md' | 'lg';
export type Tone = Size | 'xl' | null;
export type Flag = boolean;
export interface Item { value: string; label: string }
export type Pair = { a: string; b: number };
export type Handler = (value: string) => void;
export type Wide = string | Item;
type Size$1 = 'x' | 'y';
export interface Props {
  size?: Size;
  tone: Tone;
  flag?: Flag;
  items: readonly Item[];
  list: Array<Item | null>;
  pair?: Pair | undefined;
  handler?: Handler;
  wide?: Wide;
  inline: (_value: string, ...rest: number[]) => boolean;
  shape: { close: () => void; label?: string };
  renamed: Size$1;
  either: 'a' | (() => void);
}
declare class InputSignal<T> { value: T }
declare class InputSignalWithTransform<T, U> { value: T; raw: U }
declare class ModelSignal<T> { value: T }
declare class OutputEmitterRef<T> { emit(value: T): void }
declare class EventEmitter<T> { emit(value: T): void }
export declare class Base<T> { value: T; readonly valueChange: EventEmitter<T> }
export declare class Signals extends Base<number> {
  readonly label: InputSignal<string>;
  readonly disabled: InputSignalWithTransform<boolean, unknown>;
  readonly checked: ModelSignal<Size>;
  readonly opened: OutputEmitterRef<boolean>;
  readonly closed: EventEmitter<void>;
}
`;

let ctx;
let props;
let signals;
beforeAll(() => {
  const ts = typescript();
  const dir = mkdtempSync(join(tmpdir(), 'api-types-'));
  const file = join(dir, 'fixture.d.ts');
  writeFileSync(file, DECLARATIONS);
  const program = ts.createProgram({ rootNames: [file], options: { strict: true, noEmit: true, types: [] } });
  const checker = program.getTypeChecker();
  ctx = { ts, checker };
  const module = checker.getSymbolAtLocation(program.getSourceFile(file));
  const exports = new Map(checker.getExportsOfModule(module).map((item) => [item.name, item]));
  props = checker.getDeclaredTypeOfSymbol(exports.get('Props'));
  signals = checker.getDeclaredTypeOfSymbol(exports.get('Signals'));
});

const print = (name) => {
  const { ts, checker } = ctx;
  const property = checker.getPropertyOfType(props, name);
  return printMemberType(ctx, property.declarations.map((item) => item.type), {
    optional: (property.flags & ts.SymbolFlags.Optional) !== 0, fallbackType: checker.getTypeOfSymbol(property),
  });
};

describe('written form', () => {
  it('expands a literal-union alias, nested ones too, and keeps null', () => {
    expect(print('size')).toBe("'sm' | 'md' | 'lg'");
    expect(print('tone')).toBe("'sm' | 'md' | 'lg' | 'xl' | null");
  });
  it('keeps the name of an object, interface, function and non-literal alias', () => {
    expect(print('pair')).toBe('Pair');
    expect(print('handler')).toBe('Handler');
    expect(print('wide')).toBe('Wide');
    expect(print('flag')).toBe('Flag');
  });
  it('writes arrays as T[], readonly T[] and (A | B)[]', () => {
    expect(print('items')).toBe('readonly Item[]');
    expect(print('list')).toBe('(Item | null)[]');
  });
  it('drops `| undefined` of an optional member only', () => {
    expect(print('pair')).toBe('Pair');
  });
  it('writes function types with parameter names without a leading underscore', () => {
    expect(print('inline')).toBe('(value: string, ...rest: number[]) => boolean');
    expect(print('either')).toBe("'a' | (() => void)");
  });
  it('writes an object type literal with its members', () => {
    expect(print('shape')).toBe('{ close: () => void; label?: string }');
  });
  it('expands an alias the bundler suffixed', () => {
    expect(print('renamed')).toBe("'x' | 'y'");
  });
  it('an Angular signal input is its value type; an output its payload; a generic base member its argument', () => {
    const type = (property, kind) => angularMemberType(ctx, signals, property, kind);
    expect(type('label', 'input')).toBe('string');
    expect(type('disabled', 'input')).toBe('boolean');
    expect(type('checked', 'input')).toBe("'sm' | 'md' | 'lg'");
    expect(type('opened', 'output')).toBe('boolean');
    expect(type('closed', 'output')).toBe('void');
    expect(type('value', 'input')).toBe('number');
    expect(type('valueChange', 'output')).toBe('number');
  });
});

describe('comparison', () => {
  it('ignores union order, white space, quotes, parentheses, Array<T> and parameter names', () => {
    expect(canonicalType("'a' | 'b'")).toBe(canonicalType('"b"|"a"'));
    expect(canonicalType('Array<string>')).toBe(canonicalType('string[]'));
    expect(canonicalType('(value: string) => void')).toBe(canonicalType('(next: string) => void'));
    expect(canonicalType('true | false | null')).toBe(canonicalType('null | boolean'));
    expect(canonicalType('(A)')).toBe(canonicalType('A'));
  });
  it('keeps what changes the type', () => {
    expect(canonicalType("'a' | 'b'")).not.toBe(canonicalType("'a' | 'b' | 'c'"));
    expect(canonicalType('string[]')).not.toBe(canonicalType('readonly string[]'));
    expect(canonicalType('(value?: string) => void')).not.toBe(canonicalType('(value: string) => void'));
    expect(canonicalType('string')).not.toBe(canonicalType('string | null'));
  });
  it('refuses text that is not a type', () => {
    expect(canonicalType('panel content')).toBeNull();
    expect(canonicalType('')).toBeNull();
  });
  it('compares defaults as literals', () => {
    expect(canonicalDefault("'primary'")).toBe(canonicalDefault('"primary"'));
    expect(canonicalDefault('—')).toBeNull();
    expect(canonicalDefault('[ ]')).toBe('[]');
    expect(quote("it's")).toBe("'it\\'s'");
  });
});
