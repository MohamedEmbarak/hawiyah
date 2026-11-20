// Vanilla members of a page: the options of the create<Name> controller, read
// through the TypeScript checker from the parameter named options (else the
// second parameter). A component without a controller is checked against the
// stylesheet contract instead (stylesheet-contract.mjs and exclusions.json).
import { resolveExport } from './program.mjs';
import { printMemberType } from './types.mjs';

/** Whether @hawiyah/vanilla exports create<Name>. */
export function hasController(context, name) {
  return resolveExport(context, 'vanilla', name) !== null;
}

/**
 * Names, requiredness and written types of the options of create<Name>. A
 * further controller of a page (targets.mjs) may take no options
 * (createSkipLink(link)); with `optionsRequired: false` it then has no members.
 */
export function vanillaMembers(context, name, { optionsRequired = true } = {}) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'vanilla', name);
  if (!symbol) return { members: [], problems: [`@hawiyah/vanilla exports no ${name}`] };
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  const parameters = signature?.getParameters() ?? [];
  const options = parameters.find((item) => item.name === 'options') ?? parameters[1];
  if (!options && !optionsRequired && parameters.length === 1) return { members: [], problems: [] };
  if (!options) return { members: [], problems: [`${name} of @hawiyah/vanilla has no options parameter`] };
  let optionsType = checker.getTypeOfSymbolAtLocation(options, options.valueDeclaration ?? declaration);
  optionsType = checker.getNonNullableType(optionsType);
  const members = checker.getPropertiesOfType(optionsType).map((property) => {
    const optional = (property.flags & ts.SymbolFlags.Optional) !== 0;
    const type = printMemberType(context, (property.declarations ?? []).map((item) => item.type), {
      optional, fallbackType: checker.getTypeOfSymbolAtLocation(property, declaration),
    });
    return { name: property.name, kind: 'option', required: !optional, type };
  });
  return { members, problems: [] };
}
