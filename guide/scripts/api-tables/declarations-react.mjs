// React members of a page: the properties of the first parameter type of the
// exported component, read through the TypeScript checker. A property every
// declaration of which lies under node_modules/@types/react (className, ref,
// onClick and the other native element props) is excluded; a property that a
// Hawiyah declaration also declares (for example aria-label in RootName) is kept.
// A property is required when it is not optional in the type; for a union of
// prop types (TabsProps) a property is optional when any member makes it optional.
import { isInPackage, resolveExport } from './program.mjs';
import { printMemberType } from './types.mjs';

/** Names, requiredness and written types of the props of a function or exotic component. */
export function reactMembers(context, exportName) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'react', exportName);
  if (!symbol) return { members: [], problems: [`@hawiyah/react exports no ${exportName}`] };
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return { members: [], problems: [`${exportName} of @hawiyah/react has no props parameter`] };
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration ?? declaration);
  const members = [];
  for (const property of checker.getPropertiesOfType(propsType)) {
    const declarations = property.declarations ?? [];
    const own = declarations.filter((item) => !isInPackage(item.getSourceFile().fileName, '@types/react'));
    if (own.length === 0) continue;
    const optional = (property.flags & ts.SymbolFlags.Optional) !== 0;
    const type = printMemberType(context, own.map((item) => item.type), {
      optional, fallbackType: checker.getTypeOfSymbolAtLocation(property, declaration),
    });
    members.push({ name: property.name, kind: 'prop', required: !optional, type });
  }
  return { members, problems: [] };
}
