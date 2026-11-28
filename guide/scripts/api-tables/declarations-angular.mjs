// Angular members of a page: inputs (with the required flag), outputs and
// ng-content selectors read from the static ɵcmp / ɵdir declarations in the
// installed dist/types/hawiyah-angular.d.ts, following base classes (for
// example HwTabsComponent extends HwNamedRoot, whose ɵdir declares aria-label,
// aria-labelledby, aria-describedby and label).
//
// Names are the template names (the input alias, the output alias, the content
// selector). A table that documents several classes (Tabs: hw-tabs and hw-tab)
// lists the members of the first class by their names and the members of each
// further class as '<element> <name>', for example 'hw-tab value'.
import { resolveExport } from './program.mjs';
import { EM_DASH, printMemberType, printType } from './types.mjs';

const VALUE_WRAPPERS = new Set(['InputSignal', 'InputSignalWithTransform', 'ModelSignal']);
const OUTPUT_WRAPPERS = new Set(['EventEmitter', 'OutputEmitterRef', 'OutputRef', 'Subject', 'Observable']);

function referenceName(ts, node) {
  if (ts.isTypeReferenceNode(node)) return ts.isQualifiedName(node.typeName) ? node.typeName.right.text : node.typeName.text;
  if (ts.isImportTypeNode(node) && node.qualifier) return ts.isQualifiedName(node.qualifier) ? node.qualifier.right.text : node.qualifier.text;
  return null;
}

/** The type node of a class member as an input accepts it: a setter's parameter, else the declared type. */
function memberTypeNodes(ts, symbol) {
  const declarations = symbol?.declarations ?? [];
  const setter = declarations.find((item) => ts.isSetAccessorDeclaration(item));
  if (setter) return [setter.parameters[0]?.type ?? null];
  return declarations.map((item) => (ts.isPropertyDeclaration(item) || ts.isPropertySignature(item) || ts.isGetAccessorDeclaration(item) ? item.type : null));
}

/**
 * Written type of an input or output of a class: an input as the value it takes
 * (the value type of a signal input), an output as its payload type.
 */
export function angularMemberType(context, instanceType, property, kind) {
  const { ts, checker } = context;
  const symbol = checker.getPropertyOfType(instanceType, property);
  if (!symbol) return 'any';
  const wrappers = kind === 'output' ? OUTPUT_WRAPPERS : VALUE_WRAPPERS;
  const unwrap = (node) => {
    if (!node) return null;
    const name = referenceName(ts, node);
    if (name && wrappers.has(name)) return node.typeArguments?.[0] ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    return kind === 'output' ? null : node;
  };
  const fallbackUnwrap = (type) => {
    const name = type.aliasSymbol?.name ?? type.getSymbol()?.name;
    if (name && wrappers.has(name)) {
      const args = type.aliasTypeArguments ?? (type.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(type) : []);
      return args[0] ?? checker.getAnyType();
    }
    return type;
  };
  const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
  const printed = printMemberType(context, memberTypeNodes(ts, symbol), {
    optional, unwrap, fallbackType: checker.getTypeOfSymbol(symbol), fallbackUnwrap,
  });
  if (kind === 'output' && printed === 'any' && !memberTypeNodes(ts, symbol).some(Boolean)) return printType(fallbackUnwrap(checker.getTypeOfSymbol(symbol)), context).text;
  return printed;
}

const DECLARATIONS = ['ɵcmp', 'ɵdir'];
// Positions of the type arguments of ɵɵComponentDeclaration and ɵɵDirectiveDeclaration.
const SELECTOR = 1;
const INPUTS = 3;
const OUTPUTS = 4;
const CONTENT = 6;

function propertyName(ts, name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return name.getText();
}

function literalText(ts, node) {
  if (!node) return null;
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteral(literal) || ts.isNoSubstitutionTemplateLiteral(literal)) return literal.text;
    if (literal.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (literal.kind === ts.SyntaxKind.FalseKeyword) return false;
  }
  return null;
}

function staticDeclaration(ts, cls) {
  for (const member of cls.members) {
    if (!ts.isPropertyDeclaration(member) || !member.name) continue;
    const name = propertyName(ts, member.name);
    if (!DECLARATIONS.includes(name)) continue;
    if (!member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword)) continue;
    const type = member.type;
    if (type && ts.isTypeReferenceNode(type) && type.typeArguments) return { kind: name, args: type.typeArguments };
  }
  return null;
}

function readInputs(ts, node) {
  const inputs = [];
  if (!node || !ts.isTypeLiteralNode(node)) return inputs;
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const property = propertyName(ts, member.name);
    let alias = property;
    let required = false;
    if (member.type && ts.isTypeLiteralNode(member.type)) {
      for (const field of member.type.members) {
        if (!ts.isPropertySignature(field) || !field.name) continue;
        const key = propertyName(ts, field.name);
        const value = literalText(ts, field.type);
        if (key === 'alias' && typeof value === 'string') alias = value;
        if (key === 'required' && typeof value === 'boolean') required = value;
      }
    } else {
      const value = literalText(ts, member.type);
      if (typeof value === 'string') alias = value;
    }
    inputs.push({ property, name: alias, required });
  }
  return inputs;
}

function readOutputs(ts, node) {
  const outputs = [];
  if (!node || !ts.isTypeLiteralNode(node)) return outputs;
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const property = propertyName(ts, member.name);
    const value = literalText(ts, member.type);
    outputs.push({ property, name: typeof value === 'string' ? value : property });
  }
  return outputs;
}

function readContent(ts, node) {
  if (!node || !ts.isTupleTypeNode(node)) return [];
  return node.elements.map((element) => literalText(ts, element)).filter((value) => typeof value === 'string');
}

export function classDeclaration(context, symbol) {
  const { ts } = context;
  return symbol?.declarations?.find((declaration) => ts.isClassDeclaration(declaration)) ?? null;
}

function baseClass(context, cls) {
  const { ts, checker } = context;
  const clause = cls.heritageClauses?.find((item) => item.token === ts.SyntaxKind.ExtendsKeyword);
  const expression = clause?.types[0]?.expression;
  if (!expression) return null;
  let symbol = checker.getSymbolAtLocation(expression);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return classDeclaration(context, symbol);
}

/**
 * Inputs, outputs and content selectors of one class, base classes first so
 * that the class itself overrides an inherited input of the same property.
 */
export function angularClassMembers(context, cls, seen = new Set()) {
  const { ts } = context;
  if (seen.has(cls)) return { selector: null, inputs: new Map(), outputs: new Map(), content: [] };
  seen.add(cls);
  const base = baseClass(context, cls);
  const inherited = base ? angularClassMembers(context, base, seen) : { inputs: new Map(), outputs: new Map(), content: [] };
  const declaration = staticDeclaration(ts, cls);
  const inputs = new Map(inherited.inputs);
  const outputs = new Map(inherited.outputs);
  let content = inherited.content;
  let selector = null;
  if (declaration) {
    const selectorText = literalText(ts, declaration.args[SELECTOR]);
    selector = typeof selectorText === 'string' ? selectorText : null;
    for (const input of readInputs(ts, declaration.args[INPUTS])) inputs.set(input.property, input);
    for (const output of readOutputs(ts, declaration.args[OUTPUTS])) outputs.set(output.property, output);
    if (declaration.kind === 'ɵcmp') content = readContent(ts, declaration.args[CONTENT]);
  }
  return { selector, inputs, outputs, content, declared: declaration !== null };
}

/** The element name used to qualify the members of a further class ('hw-tab'). */
export function qualifier(selector, className) {
  const first = (selector ?? '').split(',')[0].trim();
  return first || className;
}

/**
 * Members of the Angular table of a page.
 * @param {*} context createDeclarationProgram() result
 * @param {string[]} classNames exported class names, the documented class first
 * @returns {{ members: { name: string, kind: string, required: boolean, type: string, property?: string, className: string }[], problems: string[] }}
 */
export function angularMembers(context, classNames) {
  const members = [];
  const problems = [];
  classNames.forEach((className, index) => {
    const symbol = resolveExport(context, 'angular', className);
    const cls = classDeclaration(context, symbol);
    if (!cls) {
      problems.push(`@hawiyah/angular exports no class ${className}`);
      return;
    }
    const read = angularClassMembers(context, cls);
    if (!read.declared) {
      problems.push(`${className} has no ɵcmp or ɵdir declaration`);
      return;
    }
    const prefix = index === 0 ? '' : `${qualifier(read.selector, className)} `;
    const instanceType = context.checker.getDeclaredTypeOfSymbol(symbol);
    const element = qualifier(read.selector, className);
    for (const input of read.inputs.values()) {
      members.push({ name: prefix + input.name, kind: 'input', required: input.required, type: angularMemberType(context, instanceType, input.property, 'input'), property: input.property, className, element });
    }
    for (const output of read.outputs.values()) {
      members.push({ name: prefix + output.name, kind: 'output', required: false, type: angularMemberType(context, instanceType, output.property, 'output'), property: output.property, className, element });
    }
    for (const selector of read.content) members.push({ name: prefix + selector, kind: 'content', required: false, type: EM_DASH, className, element });
  });
  return { members, problems };
}
