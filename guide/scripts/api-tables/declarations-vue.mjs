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
import { isInPackage, resolveExport } from './program.mjs';

const VUE_PACKAGES = ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity', '@vue/shared'];
const EMITS_ARGUMENT = 7;

function declaredByVue(property) {
  const declarations = property.declarations ?? [];
  return declarations.length > 0 && declarations.every((item) => VUE_PACKAGES.some((name) => isInPackage(item.getSourceFile().fileName, name)));
}

function handlerName(event) {
  return `on${event[0].toUpperCase()}${event.slice(1)}`;
}

export function vueMembers(context, exportName) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'vue', exportName);
  if (!symbol) return { members: [], problems: [`@hawiyah/vue exports no ${exportName}`] };
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const construct = checker.getSignaturesOfType(type, ts.SignatureKind.Construct)[0];
  if (!construct) return { members: [], problems: [`${exportName} of @hawiyah/vue is not a component constructor`] };
  const instance = checker.getReturnTypeOfSignature(construct);
  const propOf = (name) => {
    const item = checker.getPropertyOfType(instance, name);
    return item ? checker.getTypeOfSymbolAtLocation(item, declaration) : null;
  };

  const events = [];
  const emits = type.aliasSymbol?.name === 'DefineComponent' ? type.aliasTypeArguments?.[EMITS_ARGUMENT] : undefined;
  if (emits) {
    if (checker.isArrayType(emits) || checker.isTupleType(emits)) {
      const element = checker.getIndexTypeOfType(emits, ts.IndexKind.Number);
      for (const part of element?.isUnion() ? element.types : element ? [element] : []) if (part.isStringLiteral()) events.push(part.value);
    } else {
      for (const property of checker.getPropertiesOfType(emits)) events.push(property.name);
    }
  }
  const handlers = new Set(events.map(handlerName));

  const members = [];
  const props = propOf('$props');
  for (const property of props ? checker.getPropertiesOfType(props) : []) {
    if (declaredByVue(property) || handlers.has(property.name)) continue;
    members.push({ name: property.name, kind: 'prop', required: (property.flags & ts.SymbolFlags.Optional) === 0 });
  }
  for (const event of events) members.push({ name: event, kind: 'event', required: false });
  const slots = propOf('$slots');
  for (const property of slots ? checker.getPropertiesOfType(slots) : []) {
    if (declaredByVue(property)) continue;
    members.push({ name: property.name, kind: 'slot', required: false });
  }
  return { members, problems: [] };
}
