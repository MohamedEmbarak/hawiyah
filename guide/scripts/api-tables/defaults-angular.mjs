// Defaults of Angular inputs, read from the published FESM of @hawiyah/angular
// (dist/fesm2022/hawiyah-angular.mjs): the field initialisers of the class and of
// its base classes, base first so that a class overrides what it inherits.
//   this.variant = "primary";           (constructor assignment, 0.3.0)
//   variant = 'primary';                (class field)
//   label = input('');  value = model(''); disabled = input(false, { transform })
//                                       (signal inputs: the first argument)
// A literal is the default in the written form; anything else (injectId(...),
// String, new HwTexts(...)) is generated or computed and gives an em dash, as
// does an input without an initialiser (a setter) and an input.required().
import { followIdentifier, resolvePackageExport, sourceOf } from './published-js.mjs';
import { EM_DASH, literalOf } from './types.mjs';

function classOf(ts, node) {
  if (!node) return null;
  if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) return node;
  if (ts.isVariableDeclaration(node) && node.initializer) return classOf(ts, node.initializer);
  return null;
}

const SIGNAL_FACTORIES = new Set(['input', 'model']);

function initialValue(ts, expression) {
  if (ts.isCallExpression(expression)) {
    const callee = expression.expression;
    if (ts.isIdentifier(callee) && SIGNAL_FACTORIES.has(callee.text)) {
      const [first] = expression.arguments;
      return { text: first ? literalOf(ts, first) ?? EM_DASH : EM_DASH, computed: Boolean(first) && literalOf(ts, first) === null };
    }
    if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && SIGNAL_FACTORIES.has(callee.expression.text) && callee.name.text === 'required') {
      return { text: EM_DASH, computed: false };
    }
  }
  const literal = literalOf(ts, expression);
  return { text: literal ?? EM_DASH, computed: literal === null };
}

function readClass(published, module, cls, seen) {
  const { ts } = published;
  if (seen.has(cls)) return new Map();
  seen.add(cls);
  const fields = new Map();
  const heritage = cls.heritageClauses?.find((item) => item.token === ts.SyntaxKind.ExtendsKeyword);
  const baseExpression = heritage?.types[0]?.expression;
  if (baseExpression) {
    const base = followIdentifier(published, module, baseExpression);
    const baseClass = base && classOf(ts, base.node);
    if (baseClass) for (const [key, value] of readClass(published, base.module, baseClass, seen)) fields.set(key, value);
  }
  for (const member of cls.members) {
    if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name) && member.initializer
      && !member.modifiers?.some((item) => item.kind === ts.SyntaxKind.StaticKeyword)) {
      fields.set(member.name.text, { ...initialValue(ts, member.initializer), source: sourceOf(published, module, member) });
    }
    if (ts.isConstructorDeclaration(member) && member.body) {
      for (const statement of member.body.statements) {
        if (!ts.isExpressionStatement(statement)) continue;
        const expression = statement.expression;
        if (!ts.isBinaryExpression(expression) || expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
        const left = expression.left;
        if (!ts.isPropertyAccessExpression(left) || left.expression.kind !== ts.SyntaxKind.ThisKeyword) continue;
        fields.set(left.name.text, { ...initialValue(ts, expression.right), source: sourceOf(published, module, statement) });
      }
    }
  }
  return fields;
}

/**
 * Field initialisers of an exported Angular class and its bases, by property name.
 * @returns {{ fields: Map<string, { text: string, computed: boolean, source: any }>, problems: string[] }}
 */
export function angularDefaults(published, className) {
  const { ts } = published;
  const found = resolvePackageExport(published, className);
  const cls = found && classOf(ts, found.node);
  if (!cls) return { fields: new Map(), problems: [`the default reader finds no class ${className} in the published JavaScript of @hawiyah/angular`] };
  return { fields: readClass(published, found.module, cls, new Set()), problems: [] };
}
