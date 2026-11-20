// The one type printer of step 30 (milestone 5, 5a.3). It defines the written
// form of the Type column of the API tables, and the scaffold writes the same
// form (scripts/content/api-tables.mjs):
//
//   - string literals in single quotes;
//   - a literal-union alias (every member a string, number, boolean or enum
//     literal, null or undefined) is expanded as its declaration writes it; an
//     object, interface, function or other alias keeps its name, with its type
//     arguments; a name the declaration bundler suffixed ('Orientation$1') or
//     imported under another name is written with the name of its declaration;
//   - `| undefined` of an optional member is dropped (only at the top level);
//   - `Array<T>` is written `T[]`, `ReadonlyArray<T>` `readonly T[]`, a Vue
//     `PropType<T>` and the constructor types of a Vue prop as the type they give
//     (StringConstructor is string, ...);
//   - a function type as `(name: T) => R`, parameter names without a leading
//     underscore; an Angular output as its payload type (EventEmitter<T> is T), an
//     Angular signal input as its value type, a Vue event as the signature of its
//     handler `(...) => void`;
//   - slot and content rows have no type (an em dash).
//
// A type parameter that the declaration leaves open (a member of a generic base
// class) is printed from the checker's type of the member on the documented
// class instead, by the same rules.
//
// Comparison (canonicalType) parses both texts as TypeScript types and compares
// them after normalising white space, quotes, union order (and `true | false`
// with `boolean`), `Array<T>` and parentheses, ignoring parameter names.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let tsModule = null;
/** The TypeScript compiler of the guide (devDependency typescript). */
export function typescript() {
  tsModule ??= require('typescript');
  return tsModule;
}

export const EM_DASH = '—';

/** A string literal in the written form. */
export function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

/** The name of a declaration without the suffix of the declaration bundler (Option$1). */
export function cleanName(name) {
  return String(name).replace(/\$\d+$/, '');
}

const VUE_CONSTRUCTORS = {
  StringConstructor: 'string',
  NumberConstructor: 'number',
  BooleanConstructor: 'boolean',
  ArrayConstructor: 'unknown[]',
  ObjectConstructor: 'Record<string, any>',
  FunctionConstructor: 'Function',
  DateConstructor: 'Date',
  SymbolConstructor: 'symbol',
  BigIntConstructor: 'bigint',
};

// Kinds of printed results, for parentheses.
const UNION = 'union';
const INTERSECTION = 'intersection';
const FUNCTION = 'function';
const OPERATOR = 'operator';
const PRIMARY = 'primary';

function wrap(result, position) {
  const needs = {
    union: [FUNCTION],
    intersection: [UNION, FUNCTION],
    array: [UNION, INTERSECTION, FUNCTION, OPERATOR],
  }[position] ?? [];
  return needs.includes(result.kind) ? `(${result.text})` : result.text;
}

/** Joins union parts: deduplicated, `true | false` and `boolean` merged, `never` dropped. */
function joinUnion(parts, { dropUndefined = false, sort = false } = {}) {
  let list = [];
  const seen = new Set();
  for (const part of parts) {
    const key = part.text;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(part);
  }
  const texts = new Set(list.map((part) => part.text));
  if (texts.has('true') && texts.has('false') && !texts.has('boolean')) {
    const at = list.findIndex((part) => part.text === 'true' || part.text === 'false');
    list = list.filter((part) => part.text !== 'true' && part.text !== 'false');
    list.splice(at, 0, { text: 'boolean', kind: PRIMARY });
  }
  if (list.some((part) => part.text === 'boolean')) list = list.filter((part) => part.text !== 'true' && part.text !== 'false');
  if (list.length > 1) list = list.filter((part) => part.text !== 'never');
  if (dropUndefined && list.length > 1) list = list.filter((part) => part.text !== 'undefined');
  if (sort) list.sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
  if (list.length === 1) return list[0];
  return { text: list.map((part) => wrap(part, 'union')).join(' | '), kind: UNION, parts: list };
}

function literalKind(ts, type) {
  const f = ts.TypeFlags;
  return (type.flags & (f.StringLiteral | f.NumberLiteral | f.BigIntLiteral | f.BooleanLiteral | f.EnumLiteral | f.Null | f.Undefined)) !== 0;
}

/** Whether an alias symbol names a literal union (or a single literal) and has no type parameters. */
export function isLiteralUnionAlias(ctx, symbol) {
  const { ts, checker } = ctx;
  if (!symbol || !(symbol.flags & ts.SymbolFlags.TypeAlias)) return false;
  const declaration = symbol.declarations?.find((item) => ts.isTypeAliasDeclaration(item));
  if (!declaration || declaration.typeParameters?.length) return false;
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const members = type.isUnion() ? type.types : [type];
  if (!members.every((member) => literalKind(ts, member))) return false;
  // `type B = boolean` is the keyword, not a union a reader should see expanded.
  const f = ts.TypeFlags;
  return members.some((member) => member.flags & (f.StringLiteral | f.NumberLiteral | f.BigIntLiteral | f.EnumLiteral))
    || members.length < 2 || !members.every((member) => member.flags & f.BooleanLiteral);
}

function resolveSymbol(ctx, symbol) {
  const { ts, checker } = ctx;
  let current = symbol;
  for (let i = 0; current && current.flags & ts.SymbolFlags.Alias && i < 8; i += 1) current = checker.getAliasedSymbol(current);
  return current;
}

function stringText(ts, node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return quote(node.text);
  return null;
}

function propertyNameText(ts, name) {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name)) return /^[A-Za-z_$][\w$]*$/.test(name.text) ? name.text : quote(name.text);
  if (ts.isNumericLiteral(name)) return name.text;
  return name.getText().replace(/\s+/g, ' ');
}

function parameterName(ts, parameter, ctx) {
  if (ctx.canonical) return '';
  if (ts.isIdentifier(parameter.name)) return parameter.name.text.replace(/^_+(?=\w)/, '');
  return parameter.name.getText().replace(/\s+/g, ' ');
}

function printParameters(ts, parameters, ctx) {
  return parameters.map((parameter) => {
    if (ctx.canonical) {
      const type = parameter.type ? printNode(parameter.type, ctx).text : 'any';
      return `${parameter.dotDotDotToken ? '...' : ''}${parameter.questionToken ? '?' : ''}: ${type}`;
    }
    const name = parameterName(ts, parameter, ctx);
    const type = parameter.type ? printNode(parameter.type, ctx).text : 'any';
    return `${parameter.dotDotDotToken ? '...' : ''}${name}${parameter.questionToken ? '?' : ''}: ${type}`;
  }).join(', ');
}

function typeParameters(ts, list, ctx) {
  if (!list?.length) return '';
  return `<${list.map((item) => item.name.text + (item.constraint ? ` extends ${printNode(item.constraint, ctx).text}` : '')).join(', ')}>`;
}

function typeArguments(args, ctx) {
  if (!args?.length) return '';
  return `<${args.map((arg) => printNode(arg, ctx).text).join(', ')}>`;
}

function memberText(ts, member, ctx) {
  if (ts.isPropertySignature(member)) {
    const type = member.type ? printNode(member.type, ctx).text : 'any';
    const readonly = member.modifiers?.some((item) => item.kind === ts.SyntaxKind.ReadonlyKeyword) ? 'readonly ' : '';
    return `${readonly}${propertyNameText(ts, member.name)}${member.questionToken ? '?' : ''}: ${type}`;
  }
  if (ts.isMethodSignature(member)) {
    return `${propertyNameText(ts, member.name)}${member.questionToken ? '?' : ''}${typeParameters(ts, member.typeParameters, ctx)}(${printParameters(ts, member.parameters, ctx)}): ${member.type ? printNode(member.type, ctx).text : 'any'}`;
  }
  if (ts.isCallSignatureDeclaration(member)) {
    return `${typeParameters(ts, member.typeParameters, ctx)}(${printParameters(ts, member.parameters, ctx)}): ${member.type ? printNode(member.type, ctx).text : 'any'}`;
  }
  if (ts.isIndexSignatureDeclaration(member)) {
    return `[${printParameters(ts, member.parameters, { ...ctx, canonical: false })}]: ${printNode(member.type, ctx).text}`;
  }
  return member.getText().replace(/\s+/g, ' ');
}

/** Union parts of a node, with literal-union aliases expanded in place. */
function unionParts(node, ctx) {
  const { ts } = ctx;
  if (ts.isParenthesizedTypeNode(node)) return unionParts(node.type, ctx);
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((item) => unionParts(item, ctx));
  const expanded = expandAlias(node, ctx);
  if (expanded) return unionParts(expanded.declaration.type, { ...ctx, subst: null });
  const result = printNode(node, ctx);
  return result.kind === UNION && result.parts ? result.parts : [result];
}

/** The alias declaration behind a reference when the alias is a literal union, else null. */
function expandAlias(node, ctx) {
  const { ts, checker } = ctx;
  if (!checker || ctx.canonical) return null;
  let symbol = null;
  if (ts.isTypeReferenceNode(node)) symbol = resolveSymbol(ctx, checker.getSymbolAtLocation(node.typeName));
  else if (ts.isImportTypeNode(node)) symbol = checker.getTypeFromTypeNode(node).aliasSymbol ?? null;
  else return null;
  if (!isLiteralUnionAlias(ctx, symbol)) return null;
  return { declaration: symbol.declarations.find((item) => ts.isTypeAliasDeclaration(item)) };
}

function referenceName(ts, typeName) {
  return ts.isQualifiedName(typeName) ? typeName.right.text : typeName.text;
}

function printReference(node, name, args, ctx) {
  const { ts, checker } = ctx;
  let symbol = null;
  if (checker && !ctx.canonical) {
    if (ts.isTypeReferenceNode(node)) symbol = resolveSymbol(ctx, checker.getSymbolAtLocation(node.typeName));
    else if (ts.isImportTypeNode(node)) {
      const type = checker.getTypeFromTypeNode(node);
      symbol = type.aliasSymbol ?? type.getSymbol() ?? null;
    }
    if (symbol && symbol.flags & ts.SymbolFlags.TypeParameter) {
      const key = symbol.name;
      if (ctx.subst?.has(key)) return ctx.subst.get(key);
      ctx.openTypeParameters?.add(key);
      return { text: key, kind: PRIMARY };
    }
    const expanded = expandAlias(node, ctx);
    if (expanded) return joinUnion(unionParts(expanded.declaration.type, { ...ctx, subst: null }));
  }
  const declared = cleanName(symbol && !(symbol.flags & ts.SymbolFlags.TypeParameter) ? symbol.name : name);
  if (ctx.vueProp && VUE_CONSTRUCTORS[declared] && !args?.length) return { text: VUE_CONSTRUCTORS[declared], kind: declared === 'ArrayConstructor' ? PRIMARY : PRIMARY };
  if ((declared === 'Array' || declared === 'ReadonlyArray') && args?.length === 1) {
    const element = printNode(args[0], { ...ctx, vueProp: false });
    return { text: `${declared === 'ReadonlyArray' ? 'readonly ' : ''}${wrap(element, 'array')}[]`, kind: declared === 'ReadonlyArray' ? OPERATOR : PRIMARY };
  }
  if (declared === 'PropType' && args?.length === 1 && !ctx.canonical) return printNode(args[0], { ...ctx, vueProp: false });
  return { text: `${declared}${typeArguments(args, { ...ctx, vueProp: false })}`, kind: PRIMARY };
}

/**
 * Prints a type node in the written form.
 * @param {*} node a TypeNode
 * @param {{ ts: any, checker?: any, canonical?: boolean, subst?: Map<string, any> | null,
 *           vueProp?: boolean, openTypeParameters?: Set<string> }} ctx
 * @returns {{ text: string, kind: string, parts?: any[] }}
 */
export function printNode(node, ctx) {
  const { ts } = ctx;
  const k = ts.SyntaxKind;
  switch (node.kind) {
    case k.ParenthesizedType: return printNode(node.type, ctx);
    case k.UnionType: return joinUnion(unionParts(node, ctx), { sort: ctx.canonical });
    case k.IntersectionType: {
      let parts = node.types.map((item) => printNode(item, ctx));
      if (ctx.canonical) parts = parts.sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
      return { text: parts.map((part) => wrap(part, 'intersection')).join(' & '), kind: INTERSECTION };
    }
    case k.ArrayType: {
      if (ctx.vueProp) {
        // A Vue prop of several constructors: [String, Number] declared as (StringConstructor | NumberConstructor)[].
        return joinUnion(unionParts(node.elementType, ctx), { sort: ctx.canonical });
      }
      return { text: `${wrap(printNode(node.elementType, ctx), 'array')}[]`, kind: PRIMARY };
    }
    case k.TupleType: {
      if (ctx.vueProp) return joinUnion(node.elements.flatMap((item) => unionParts(item, ctx)), { sort: ctx.canonical });
      return { text: `[${node.elements.map((item) => printNode(item, ctx).text).join(', ')}]`, kind: PRIMARY };
    }
    case k.NamedTupleMember:
      return { text: `${node.dotDotDotToken ? '...' : ''}${ctx.canonical ? '' : node.name.text}${node.questionToken ? '?' : ''}${ctx.canonical ? '' : ': '}${printNode(node.type, ctx).text}`, kind: PRIMARY };
    case k.OptionalType: return { text: `${wrap(printNode(node.type, ctx), 'array')}?`, kind: PRIMARY };
    case k.RestType: return { text: `...${printNode(node.type, ctx).text}`, kind: PRIMARY };
    case k.TypeOperator: {
      const operator = ts.tokenToString(node.operator);
      return { text: `${operator} ${wrap(printNode(node.type, ctx), 'array')}`, kind: OPERATOR };
    }
    case k.FunctionType:
      return { text: `${typeParameters(ts, node.typeParameters, ctx)}(${printParameters(ts, node.parameters, ctx)}) => ${printNode(node.type, ctx).text}`, kind: FUNCTION };
    case k.ConstructorType:
      return { text: `new ${typeParameters(ts, node.typeParameters, ctx)}(${printParameters(ts, node.parameters, ctx)}) => ${printNode(node.type, ctx).text}`, kind: FUNCTION };
    case k.TypeLiteral: {
      let members = node.members.map((member) => memberText(ts, member, ctx));
      if (ctx.canonical) members = members.sort();
      return { text: members.length ? `{ ${members.join('; ')} }` : '{}', kind: PRIMARY };
    }
    case k.TypeReference:
      return printReference(node, referenceName(ts, node.typeName), node.typeArguments, ctx);
    case k.ExpressionWithTypeArguments:
      return { text: `${node.expression.getText()}${typeArguments(node.typeArguments, ctx)}`, kind: PRIMARY };
    case k.ImportType: {
      const name = node.qualifier ? referenceName(ts, node.qualifier) : 'import';
      return printReference(node, name, node.typeArguments, ctx);
    }
    case k.TypeQuery: return { text: `typeof ${node.exprName.getText()}${typeArguments(node.typeArguments, ctx)}`, kind: PRIMARY };
    case k.IndexedAccessType: {
      if (ctx.checker && !ctx.canonical) {
        const type = ctx.checker.getTypeFromTypeNode(node);
        const members = type.isUnion() ? type.types : [type];
        if (members.every((member) => literalKind(ts, member))) return joinUnion(members.map((member) => printType(member, ctx)));
      }
      return { text: `${wrap(printNode(node.objectType, ctx), 'array')}[${printNode(node.indexType, ctx).text}]`, kind: PRIMARY };
    }
    case k.LiteralType: {
      const literal = node.literal;
      const text = stringText(ts, literal);
      if (text) return { text, kind: PRIMARY };
      if (literal.kind === k.PrefixUnaryExpression) return { text: literal.getText().replace(/\s+/g, ''), kind: PRIMARY };
      return { text: literal.getText(), kind: PRIMARY };
    }
    case k.TemplateLiteralType:
    case k.ConditionalType:
    case k.MappedType:
    case k.InferType:
    case k.TypePredicate:
    case k.ThisType:
      return { text: node.getText().replace(/\s+/g, ' ').replace(/"([^"\\]*)"/g, "'$1'"), kind: node.kind === k.ConditionalType ? FUNCTION : PRIMARY };
    default: {
      const keyword = ts.tokenToString(node.kind);
      if (keyword && /^[a-z]+$/.test(keyword)) return { text: keyword, kind: PRIMARY };
      return { text: node.getText().replace(/\s+/g, ' ').replace(/"([^"\\]*)"/g, "'$1'"), kind: PRIMARY };
    }
  }
}

/**
 * Prints a checker type by the same rules (used when a declaration leaves a type
 * parameter open, and for indexed access types).
 */
export function printType(type, ctx, { dropUndefined = false } = {}) {
  const { ts, checker } = ctx;
  const f = ts.TypeFlags;
  if (type.aliasSymbol && !isLiteralUnionAlias(ctx, type.aliasSymbol)) {
    const args = type.aliasTypeArguments?.length ? `<${type.aliasTypeArguments.map((item) => printType(item, ctx).text).join(', ')}>` : '';
    return { text: `${cleanName(type.aliasSymbol.name)}${args}`, kind: PRIMARY };
  }
  if (type.isUnion()) return joinUnion(type.types.map((item) => printType(item, ctx)), { dropUndefined });
  if (type.isIntersection()) return { text: type.types.map((item) => wrap(printType(item, ctx), 'intersection')).join(' & '), kind: INTERSECTION };
  if (type.flags & f.StringLiteral) return { text: quote(type.value), kind: PRIMARY };
  if (type.flags & f.NumberLiteral) return { text: String(type.value), kind: PRIMARY };
  if (type.flags & f.BooleanLiteral) return { text: type.intrinsicName ?? checker.typeToString(type), kind: PRIMARY };
  if (type.flags & f.TypeParameter) return { text: cleanName(type.symbol?.name ?? 'T'), kind: PRIMARY };
  if (type.flags & f.Object) {
    if (checker.isArrayType(type)) {
      const [element] = checker.getTypeArguments(type);
      const readonly = type.symbol?.name === 'ReadonlyArray' || type.target?.symbol?.name === 'ReadonlyArray';
      return { text: `${readonly ? 'readonly ' : ''}${wrap(printType(element, ctx), 'array')}[]`, kind: readonly ? OPERATOR : PRIMARY };
    }
    if (checker.isTupleType(type)) {
      return { text: `[${checker.getTypeArguments(type).map((item) => printType(item, ctx).text).join(', ')}]`, kind: PRIMARY };
    }
    const symbol = type.getSymbol();
    const anonymous = !symbol || symbol.name === '__type' || symbol.name === '__object' || symbol.name === '__function'
      || (symbol.flags & (ts.SymbolFlags.Method | ts.SymbolFlags.Function | ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.ObjectLiteral)) !== 0;
    if (!anonymous) {
      const args = type.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(type) : [];
      return { text: `${cleanName(symbol.name)}${args.length ? `<${args.map((item) => printType(item, ctx).text).join(', ')}>` : ''}`, kind: PRIMARY };
    }
    const calls = type.getCallSignatures();
    const properties = type.getProperties();
    if (calls.length === 1 && properties.length === 0) {
      const signature = calls[0];
      const parameters = signature.getParameters().map((parameter) => {
        const declaration = parameter.valueDeclaration;
        const rest = declaration && ts.isParameter(declaration) && declaration.dotDotDotToken ? '...' : '';
        const optional = declaration && ts.isParameter(declaration) && declaration.questionToken ? '?' : '';
        return `${rest}${parameter.name.replace(/^_+(?=\w)/, '')}${optional}: ${printType(checker.getTypeOfSymbol(parameter), ctx).text}`;
      });
      return { text: `(${parameters.join(', ')}) => ${printType(signature.getReturnType(), ctx).text}`, kind: FUNCTION };
    }
    const members = properties.map((property) => {
      const optional = property.flags & ts.SymbolFlags.Optional ? '?' : '';
      return `${property.name}${optional}: ${printType(checker.getTypeOfSymbol(property), ctx, { dropUndefined: Boolean(optional) }).text}`;
    });
    return { text: members.length ? `{ ${members.join('; ')} }` : '{}', kind: PRIMARY };
  }
  return { text: checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType), kind: PRIMARY };
}

/**
 * The written type of a member from its declarations (several for a property of
 * a union of prop types), falling back to the checker type when a declaration
 * leaves a type parameter open.
 * @param {*} ctx { ts, checker }
 * @param {*[]} typeNodes the type nodes of the member's declarations
 * @param {{ optional?: boolean, fallbackType?: any, vueProp?: boolean, unwrap?: (node) => any }} options
 */
export function printMemberType(ctx, typeNodes, options = {}) {
  const open = new Set();
  const parts = [];
  for (const node of typeNodes) {
    if (!node) continue;
    const target = options.unwrap ? options.unwrap(node) : node;
    if (!target) continue;
    parts.push(...unionParts(target, { ...ctx, vueProp: Boolean(options.vueProp), openTypeParameters: open, subst: null }));
  }
  if (parts.length && open.size === 0) return joinUnion(parts, { dropUndefined: Boolean(options.optional) }).text;
  if (options.fallbackType) {
    const type = options.fallbackUnwrap ? options.fallbackUnwrap(options.fallbackType) : options.fallbackType;
    return printType(type, ctx, { dropUndefined: Boolean(options.optional) }).text;
  }
  return parts.length ? joinUnion(parts, { dropUndefined: Boolean(options.optional) }).text : 'any';
}

/** A handler signature `(...) => void` from a function type node (a Vue emit validator). */
export function printHandler(ctx, node) {
  const { ts } = ctx;
  if (!node || !ts.isFunctionTypeNode(node)) return '(...args: any[]) => void';
  return `(${printParameters(ts, node.parameters, { ...ctx, openTypeParameters: new Set() })}) => void`;
}

/**
 * Canonical key of a written type, for comparison; null when the text is not a type.
 * Union and intersection order, white space, quotes, parentheses, `Array<T>` and
 * parameter names do not count.
 */
export function canonicalType(text) {
  const ts = typescript();
  const source = ts.createSourceFile('cell.ts', `type __Cell = ${text};`, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  if (source.parseDiagnostics?.length) return null;
  const statement = source.statements[0];
  if (source.statements.length !== 1 || !statement || !ts.isTypeAliasDeclaration(statement)) return null;
  return printNode(statement.type, { ts, canonical: true }).text;
}

/** The written form of a default from a literal expression node, or null when it is not a literal. */
export function literalOf(ts, node) {
  if (!node) return null;
  const k = ts.SyntaxKind;
  if (ts.isParenthesizedExpression(node)) return literalOf(ts, node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return quote(node.text);
  if (ts.isNumericLiteral(node)) return String(Number(node.text));
  if (node.kind === k.TrueKeyword) return 'true';
  if (node.kind === k.FalseKeyword) return 'false';
  if (node.kind === k.NullKeyword) return 'null';
  if (ts.isPrefixUnaryExpression(node) && node.operator === k.MinusToken && ts.isNumericLiteral(node.operand)) return `-${Number(node.operand.text)}`;
  if (ts.isArrayLiteralExpression(node)) {
    const items = node.elements.map((item) => literalOf(ts, item));
    return items.every((item) => item !== null) ? `[${items.join(', ')}]` : null;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const items = node.properties.map((property) => {
      if (!ts.isPropertyAssignment(property)) return null;
      const value = literalOf(ts, property.initializer);
      return value === null ? null : `${propertyNameText(ts, property.name)}: ${value}`;
    });
    if (!items.every((item) => item !== null)) return null;
    return items.length ? `{ ${items.join(', ')} }` : '{}';
  }
  return null;
}

/** Canonical key of a written default ('primary' and "primary" are equal); null for an em dash. */
export function canonicalDefault(text) {
  const value = String(text ?? '').trim();
  if (value === '' || value === EM_DASH) return null;
  const ts = typescript();
  const source = ts.createSourceFile('cell.ts', `const __cell = (${value});`, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const statement = source.statements[0];
  const initializer = !source.parseDiagnostics?.length && statement && ts.isVariableStatement(statement)
    ? statement.declarationList.declarations[0]?.initializer : null;
  return literalOf(ts, initializer) ?? value.replace(/\s+/g, ' ');
}
