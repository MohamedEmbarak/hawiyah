// Vue members of a page: props, emits and slots of the exported component,
// read through the TypeScript checker from its DefineComponent type.
//   props  the properties of the instance type's $props, without the members
//          declared by Vue itself (key, ref, class, style and the other public
//          props) and without the on<Event> handlers that the emits declare;
//          a prop is required when it is not optional there (a prop with a
//          default is optional);
//   events the keys of the emits options (type argument E of DefineComponent);
//   slots  the named properties of the instance type's $slots (a component
//          whose declaration types no slots has none).
// Types: a prop as the type its `type` option gives (types.mjs), an event as the
// signature of its handler. @hawiyah/vue 0.3.0 declares no slots (DefineComponent
// slots argument {}); step 30 adds the slots the published build reads at run time
// (slots-vue.mjs).
import { isInPackage, resolveExport } from './program.mjs';
import { printHandler, printMemberType } from './types.mjs';

const VUE_PACKAGES = ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity', '@vue/shared'];
const EMITS_ARGUMENT = 7;
const EM_DASH = '—';

/** The type node a Vue prop declares: the `type` member of `{ type: PropType<X>; default: ... }`, else the node itself. */
function vuePropType(ts) {
  return (node) => {
    if (node && ts.isTypeLiteralNode(node)) {
      const member = node.members.find((item) => ts.isPropertySignature(item) && item.name && ts.isIdentifier(item.name) && item.name.text === 'type');
      return member?.type ?? null;
    }
    return node;
  };
}

function declaredByVue(property) {
  const declarations = property.declarations ?? [];
  return declarations.length > 0 && declarations.every((item) => VUE_PACKAGES.some((name) => isInPackage(item.getSourceFile().fileName, name)));
}

function handlerName(event) {
  return `on${event[0].toUpperCase()}${event.slice(1)}`;
}

function nameOfReference(ts, node) {
  if (ts.isTypeReferenceNode(node)) return ts.isQualifiedName(node.typeName) ? node.typeName.right.text : node.typeName.text;
  if (ts.isImportTypeNode(node) && node.qualifier) return ts.isQualifiedName(node.qualifier) ? node.qualifier.right.text : node.qualifier.text;
  return null;
}

/**
 * The DefineComponent type node behind a Vue export's declaration, following
 * wrappers whose first type argument is `typeof <component>` (WithNativeAttributes
 * of 0.3.0) and aliases of the component: { node, propsLiteral } or null.
 */
export function vueDefinition(context, symbol, depth = 0) {
  const { ts } = context;
  if (!symbol || depth > 6) return null;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const node = declaration && ts.isVariableDeclaration(declaration) ? declaration.type : null;
  return node ? definitionOfNode(context, node, depth) : null;
}

function definitionOfNode(context, node, depth) {
  const { ts, checker } = context;
  if (!node || depth > 6) return null;
  if (ts.isTypeQueryNode(node)) {
    let target = checker.getSymbolAtLocation(node.exprName);
    if (target && target.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(target);
    return vueDefinition(context, target, depth + 1);
  }
  const name = nameOfReference(ts, node);
  if (name === 'DefineComponent') {
    const first = node.typeArguments?.[0];
    let propsLiteral = null;
    if (first && nameOfReference(ts, first) === 'ExtractPropTypes' && first.typeArguments?.[0] && ts.isTypeLiteralNode(first.typeArguments[0])) propsLiteral = first.typeArguments[0];
    else if (first && ts.isTypeLiteralNode(first)) propsLiteral = first;
    return { node, propsLiteral, emitsNode: node.typeArguments?.[EMITS_ARGUMENT] ?? null };
  }
  // A wrapper such as WithNativeAttributes<typeof Base, Attributes> or WithNativeAttributes<DefineComponent<...>, ...>.
  for (const argument of node.typeArguments ?? []) {
    if (ts.isTypeQueryNode(argument) || nameOfReference(ts, argument) === 'DefineComponent') return definitionOfNode(context, argument, depth + 1);
  }
  return null;
}

export function vueMembers(context, exportName) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'vue', exportName);
  if (!symbol) return { members: [], problems: [`@hawiyah/vue exports no ${exportName}`] };
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const construct = checker.getSignaturesOfType(type, ts.SignatureKind.Construct)[0];
  if (!construct) return { members: [], problems: [`${exportName} of @hawiyah/vue is not a component constructor`] };
  const definition = vueDefinition(context, symbol);
  if (!definition) return { members: [], problems: [`the declaration of ${exportName} of @hawiyah/vue is not a DefineComponent type the reader can follow`] };
  const instance = checker.getReturnTypeOfSignature(construct);
  const propOf = (name) => {
    const item = checker.getPropertyOfType(instance, name);
    return item ? checker.getTypeOfSymbolAtLocation(item, declaration) : null;
  };
  const optionNodes = new Map();
  for (const member of definition.propsLiteral?.members ?? []) {
    if (ts.isPropertySignature(member) && member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) optionNodes.set(member.name.text, member.type);
  }

  const events = [];
  const emitsNode = definition.emitsNode;
  if (emitsNode && ts.isTypeLiteralNode(emitsNode)) {
    for (const member of emitsNode.members) {
      if (!(ts.isPropertySignature(member) || ts.isMethodSignature(member)) || !member.name) continue;
      const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : member.name.getText();
      events.push({ name, node: ts.isPropertySignature(member) ? member.type ?? null : null });
    }
  } else if (emitsNode) {
    const emits = checker.getTypeFromTypeNode(emitsNode);
    if (checker.isArrayType(emits) || checker.isTupleType(emits)) {
      const element = checker.getIndexTypeOfType(emits, ts.IndexKind.Number);
      for (const part of element?.isUnion() ? element.types : element ? [element] : []) if (part.isStringLiteral()) events.push({ name: part.value, node: null });
    } else {
      for (const property of checker.getPropertiesOfType(emits)) events.push({ name: property.name, node: null });
    }
  }
  const handlers = new Set(events.map((event) => handlerName(event.name)));

  const members = [];
  const props = propOf('$props');
  for (const property of props ? checker.getPropertiesOfType(props) : []) {
    if (declaredByVue(property) || handlers.has(property.name)) continue;
    const optional = (property.flags & ts.SymbolFlags.Optional) !== 0;
    const typeNodes = optionNodes.has(property.name) ? [optionNodes.get(property.name)] : (property.declarations ?? []).map((item) => item.type);
    const printed = printMemberType(context, typeNodes, {
      optional, vueProp: true, unwrap: vuePropType(ts), fallbackType: checker.getTypeOfSymbolAtLocation(property, declaration),
    });
    members.push({ name: property.name, kind: 'prop', required: !optional, type: printed });
  }
  const order = [...optionNodes.keys()];
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  members.sort((a, b) => rank(a.name) - rank(b.name));
  for (const event of events) members.push({ name: event.name, kind: 'event', required: false, type: printHandler(context, event.node) });
  const slots = propOf('$slots');
  for (const property of slots ? checker.getPropertiesOfType(slots) : []) {
    if (declaredByVue(property)) continue;
    members.push({ name: property.name, kind: 'slot', required: false, type: EM_DASH });
  }
  return { members, problems: [] };
}
